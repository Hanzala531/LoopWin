import { Giveaway } from "../Models/giveaway.Models.js";
import { Winner } from "../Models/winner.Models.js";
import { User } from "../Models/user.Models.js";
import { Purchase } from "../Models/purchase.Models.js";
import { Products } from "../Models/products.Models.js";
import { asyncHandler } from "../Utilities/asyncHandler.js";
import { ApiError } from "../Utilities/ApiError.js";
import { ApiResponse } from "../Utilities/ApiResponse.js";
import { uploadOnCloudinary } from "../Utilities/cloudinary.js";
import mongoose from "mongoose";

// ==================== GIVEAWAY MANAGEMENT (ADMIN ONLY) ====================

// Create a new giveaway
const createGiveaway = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    image,
    prizes,
    eligibilityCriteria,
    startDate,
    endDate,
    drawDate
  } = req.body;

  // 1️⃣ Required fields check
  if (!title || !description || !prizes || prizes.length === 0 || !startDate || !endDate || !drawDate) {
    throw new ApiError(400, "Please provide all required fields");
  }

  // 2️⃣ Dates validation
  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  const dDate = new Date(drawDate);

  if (sDate >= eDate) {
    throw new ApiError(400, "End date must be after start date");
  }
  if (dDate < eDate) {
    throw new ApiError(400, "Draw date must be on or after end date");
  }

  // 3️⃣ Prize validation
  for (let prize of prizes) {
    if (!prize.name || !prize.description || prize.value === undefined || prize.quantity === undefined) {
      throw new ApiError(400, "Each prize must have name, description, value, and quantity");
    }
  }

  // 4️⃣ Eligibility defaults
  const eligibility = {
    minPurchases: eligibilityCriteria?.minPurchases || 1,
    minAmountSpent: eligibilityCriteria?.minAmountSpent || 0,
    purchaseStartDate: eligibilityCriteria?.purchaseStartDate || null,
    purchaseEndDate: eligibilityCriteria?.purchaseEndDate || null,
  };

  // 5️⃣ Giveaway create
  const giveaway = await Giveaway.create({
    title,
    description,
    image: image || null,
    createdBy: req.user._id,
    prizes,
    eligibilityCriteria: eligibility,
    status: "draft", // always draft, cron job will activate
    startDate: sDate,
    endDate: eDate,
    drawDate: dDate
  });

  return res
    .status(201)
    .json(new ApiResponse(201, giveaway, "Giveaway created successfully"));
});




// Get all giveaways with filters and pagination
const getAllGiveaways = asyncHandler(async (req, res) => {
    try {
        const {
            status,
            active,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (status) {
            filter.status = status;
        }

        if (active === 'true') {
            const now = new Date();
            filter.status = 'active';
            filter.startDate = { $lte: now };
            filter.endDate = { $gte: now };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get giveaways with pagination
        const giveaways = await Giveaway.find(filter)
            .populate('createdBy', 'name phone')
            .populate('eligibilityCriteria.eligibleProducts', 'name price')
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        const totalGiveaways = await Giveaway.countDocuments(filter);
        const totalPages = Math.ceil(totalGiveaways / parseInt(limit));

        return res.json(
            new ApiResponse(200, {
                giveaways,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalGiveaways,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                }
            }, "Giveaways retrieved successfully")
        );

    } catch (error) {
        console.error("Get giveaways error:", error);
         throw new ApiError(500, "Something went wrong while retrieving the giveaway");
    }
});

// Get single giveaway by ID
const getGiveawayById = asyncHandler(async (req, res) => {
    try {
        const { giveawayId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid giveaway ID")
            );
        }

        const giveaway = await Giveaway.findById(giveawayId)
            .populate('createdBy', 'name phone')
            .populate('eligibilityCriteria.eligibleProducts', 'name price picture');

        if (!giveaway) {
            return res.json(
                new ApiResponse(404, null, "Giveaway not found")
            );
        }

        return res.json(
            new ApiResponse(200, giveaway, "Giveaway retrieved successfully")
        );

    } catch (error) {
        console.error("Get giveaway error:", error);
         throw new ApiError(500, "Something went wrong while retrieving the giveaway");
    }
});

// Update giveaway status
const updateGiveawayStatus = asyncHandler(async (req, res) => {
    try {
        const { giveawayId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid giveaway ID")
            );
        }

        if (!status || !['draft', 'active', 'completed', 'cancelled'].includes(status)) {
            return res.json(
                new ApiResponse(400, null, "Invalid status. Must be: draft, active, completed, or cancelled")
            );
        }

        const giveaway = await Giveaway.findById(giveawayId);
        if (!giveaway) {
            return res.json(
                new ApiResponse(404, null, "Giveaway not found")
            );
        }

        // Validate status transitions
        if (giveaway.drawCompleted && status !== 'completed') {
            return res.json(
                new ApiResponse(400, null, "Cannot change status of a giveaway where draw has been completed")
            );
        }

        giveaway.status = status;
        await giveaway.save();

        return res.json(
            new ApiResponse(200, giveaway, "Giveaway status updated successfully")
        );

    } catch (error) {
        console.error("Update giveaway status error:", error);
         throw new ApiError(500, "Something went wrong while updating giveaway status");
    }
});

// Delete giveaway
const deleteGiveaway = asyncHandler(async (req, res) => {
    try {
        const { giveawayId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid giveaway ID")
            );
        }

        const giveaway = await Giveaway.findById(giveawayId);
        if (!giveaway) {
            return res.json(
                new ApiResponse(404, null, "Giveaway not found")
            );
        }

        // Check if draw has been completed
        if (giveaway.drawCompleted) {
            return res.json(
                new ApiResponse(400, null, "Cannot delete a giveaway where draw has been completed")
            );
        }

        // Delete associated winners if any
        await Winner.deleteMany({ giveawayId });

        // Delete the giveaway
        await Giveaway.findByIdAndDelete(giveawayId);

        return res.json(
            new ApiResponse(200, null, "Giveaway deleted successfully")
        );

    } catch (error) {
        console.error("Delete giveaway error:", error);
                 throw new ApiError(500, "Something went wrong while deleting giveaway");
    }
});

// ==================== DRAW & WINNER MANAGEMENT (ADMIN ONLY) ====================

// Run the random draw for a giveaway
const runGiveawayDraw = asyncHandler(async (req, res) => {
    try {
        const { giveawayId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid giveaway ID")
            );
        }

        const giveaway = await Giveaway.findById(giveawayId)
            .populate('eligibilityCriteria.eligibleProducts');

        if (!giveaway) {
            return res.json(
                new ApiResponse(404, null, "Giveaway not found")
            );
        }

        // Check if draw has already been completed
        if (giveaway.drawCompleted) {
            return res.json(
                new ApiResponse(400, null, "Draw has already been completed for this giveaway")
            );
        }

        // Check if it's time for the draw
        const now = new Date();
        if (now < giveaway.drawDate) {
            return res.json(
                new ApiResponse(400, null, "Draw date has not yet arrived")
            );
        }

        // Get eligible participants based on criteria
        const eligibleUsers = await getEligibleParticipants(giveaway);

        if (eligibleUsers.length === 0) {
            return res.json(
                new ApiResponse(400, null, "No eligible participants found for this giveaway")
            );
        }

        // Conduct the draw for each prize
        const winners = [];
        const usedUserIds = new Set();

        for (const prize of giveaway.prizes) {
            for (let i = 0; i < prize.quantity; i++) {
                // Filter out already selected winners
                const availableUsers = eligibleUsers.filter(user => !usedUserIds.has(user._id.toString()));
                
                if (availableUsers.length === 0) {
                    console.log(`Not enough eligible participants for all prizes. Stopping at prize: ${prize.name}`);
                    break;
                }

                // Randomly select a winner
                const randomIndex = Math.floor(Math.random() * availableUsers.length);
                const selectedUser = availableUsers[randomIndex];

                // Create winner record
                const winner = await Winner.create({
                    giveawayId: giveaway._id,
                    userId: selectedUser._id,
                    prizeWon: {
                        name: prize.name,
                        description: prize.description,
                        value: prize.value,
                        image: prize.image
                    },
                    contactInfo: {
                        phone: selectedUser.phone || null
                    }
                });

                const populatedWinner = await Winner.findById(winner._id)
                    .populate('userId', 'name phone');

                winners.push(populatedWinner);
                usedUserIds.add(selectedUser._id.toString());
            }
        }

        // Mark draw as completed
        giveaway.drawCompleted = true;
        giveaway.status = 'completed';
        await giveaway.save();

        return res.json(
            new ApiResponse(200, {
                giveaway,
                winners,
                totalWinners: winners.length,
                totalEligibleParticipants: eligibleUsers.length
            }, "Draw completed successfully")
        );

    } catch (error) {
        console.error("Run draw error:", error);
        throw new ApiError(500, "Something went wrong while starting draw");

    }
});

// Helper function to get eligible participants
const getEligibleParticipants = async (giveaway) => {
  try {
    const criteria = giveaway.eligibilityCriteria;

    const eligibleUsers = await User.find({ status: 'user' });

    return eligibleUsers;
  } catch (error) {
    console.error("Get eligible participants error:", error);
    throw new ApiError(500, "Something went wrong");
  }
};

// Get winners for a specific giveaway
const getGiveawayWinners = asyncHandler(async (req, res) => {
    try {
        const { giveawayId } = req.params;
        const {
            status,
            page = 1,
            limit = 10,
            sortBy = 'wonAt',
            sortOrder = 'desc'
        } = req.query;

        if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid giveaway ID")
            );
        }

        // Build filter
        const filter = { giveawayId };
        if (status) {
            filter.deliveryStatus = status;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const winners = await Winner.find(filter)
            .populate('userId', 'name phone')
            .populate('giveawayId', 'title')
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        const totalWinners = await Winner.countDocuments(filter);
        const totalPages = Math.ceil(totalWinners / parseInt(limit));

        return res.json(
            new ApiResponse(200, {
                winners,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalWinners,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                }
            }, "Winners retrieved successfully")
        );

    } catch (error) {
        console.error("Get winners error:", error);
        throw new ApiError(500, "Failed to retrive winners of draw");

    }
});

// Update winner status, contact info, or notes
const updateWinner = asyncHandler(async (req, res) => {
    try {
        const { winnerId } = req.params;
        const { deliveryStatus, contactInfo, notes } = req.body;

        if (!mongoose.Types.ObjectId.isValid(winnerId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid winner ID")
            );
        }

        const winner = await Winner.findById(winnerId);
        if (!winner) {
            return res.json(
                new ApiResponse(404, null, "Winner not found")
            );
        }

        // Update fields if provided
        if (deliveryStatus) {
            if (!['pending', 'contacted', 'shipped', 'delivered'].includes(deliveryStatus)) {
                return res.json(
                    new ApiResponse(400, null, "Invalid delivery status")
                );
            }
            winner.deliveryStatus = deliveryStatus;
        }

        if (contactInfo) {
            winner.contactInfo = { ...winner.contactInfo.toObject(), ...contactInfo };
        }

        if (notes !== undefined) {
            winner.notes = notes;
        }

        await winner.save();

        const updatedWinner = await Winner.findById(winnerId)
            .populate('userId', 'name phone')
            .populate('giveawayId', 'title');

        return res.json(
            new ApiResponse(200, updatedWinner, "Winner updated successfully")
        );

    } catch (error) {
        console.error("Update winner error:", error);
        throw new ApiError(500, "Something went wrong in updating the winner");

    }
});

// Replace a winner (crucial for admin control)
const replaceWinner = asyncHandler(async (req, res) => {
    try {
        const { winnerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(winnerId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid winner ID")
            );
        }

        const oldWinner = await Winner.findById(winnerId)
            .populate('userId', 'name phone')
            .populate('giveawayId');

        if (!oldWinner) {
            return res.json(
                new ApiResponse(404, null, "Winner not found")
            );
        }

        const giveaway = oldWinner.giveawayId;

        // Check if the associated giveaway still exists
        if (!giveaway) {
            return res.json(
                new ApiResponse(400, null, "Cannot replace winner: Associated giveaway no longer exists")
            );
        }

        // Get eligible participants who haven't won yet
        const allEligibleUsers = await getEligibleParticipants(giveaway);
        const existingWinnerIds = await Winner.find({ giveawayId: giveaway._id })
            .distinct('userId');

        const availableUsers = allEligibleUsers.filter(user => 
            !existingWinnerIds.some(winnerId => winnerId.toString() === user._id.toString())
        );

        if (availableUsers.length === 0) {
            return res.json(
                new ApiResponse(400, null, "No eligible participants available for replacement")
            );
        }

        // Select a random replacement
        const randomIndex = Math.floor(Math.random() * availableUsers.length);
        const newUser = availableUsers[randomIndex];

        // Create new winner
        const newWinner = await Winner.create({
            giveawayId: giveaway._id,
            userId: newUser._id,
            prizeWon: oldWinner.prizeWon,
            contactInfo: {
                phone: newUser.phone || null
            }
        });

        // Remove old winner
        await Winner.findByIdAndDelete(winnerId);

        const populatedNewWinner = await Winner.findById(newWinner._id)
            .populate('userId', 'name phone')
            .populate('giveawayId', 'title');

        return res.json(
            new ApiResponse(200, {
                oldWinner: {
                    name: oldWinner.userId.name,
                    phone: oldWinner.userId.phone,
                    prizeWon: oldWinner.prizeWon
                },
                newWinner: populatedNewWinner
            }, "Winner replaced successfully")
        );

    } catch (error) {
        console.error("Replace winner error:", error);
        throw new ApiError(500, "Something went wrong while changing winner");

    }
});

// Change the prize won by a winner
const updateWinnerPrize = asyncHandler(async (req, res) => {
    try {
        const { winnerId } = req.params;
        const { prizeWon } = req.body;

        if (!mongoose.Types.ObjectId.isValid(winnerId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid winner ID")
            );
        }

        if (!prizeWon || !prizeWon.name || !prizeWon.description || prizeWon.value === undefined) {
            return res.json(
                new ApiResponse(400, null, "Complete prize information is required")
            );
        }

        const winner = await Winner.findById(winnerId);
        if (!winner) {
            return res.json(
                new ApiResponse(404, null, "Winner not found")
            );
        }

        winner.prizeWon = prizeWon;
        await winner.save();

        const updatedWinner = await Winner.findById(winnerId)
            .populate('userId', 'name phone')
            .populate('giveawayId', 'title');

        return res.json(
            new ApiResponse(200, updatedWinner, "Winner prize updated successfully")
        );

    } catch (error) {
        console.error("Update winner prize error:", error);
        throw new ApiError(500, "Something went wrong while updating prize");

    }
});

// Manually select a specific user as winner (Admin Choice)
const selectManualWinner = asyncHandler(async (req, res) => {
    try {
        const { giveawayId } = req.params;
        const { userId, prizeIndex, skipEligibilityCheck = false } = req.body;

        // Validation
        if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid giveaway ID")
            );
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid user ID")
            );
        }

        if (prizeIndex === undefined || prizeIndex < 0) {
            return res.json(
                new ApiResponse(400, null, "Valid prize index is required")
            );
        }

        // Get giveaway details
        const giveaway = await Giveaway.findById(giveawayId);
        if (!giveaway) {
            return res.json(
                new ApiResponse(404, null, "Giveaway not found")
            );
        }

        // Check if prize index is valid
        if (prizeIndex >= giveaway.prizes.length) {
            return res.json(
                new ApiResponse(400, null, "Invalid prize index")
            );
        }

        const selectedPrize = giveaway.prizes[prizeIndex];

        // Get user details
        const user = await User.findById(userId).select('name phone status');
        if (!user) {
            return res.json(
                new ApiResponse(404, null, "User not found")
            );
        }

        // Check if user is already a winner for this giveaway
        const existingWinner = await Winner.findOne({ 
            giveawayId: giveaway._id, 
            userId: user._id 
        });

        if (existingWinner) {
            return res.json(
                new ApiResponse(400, null, "User is already a winner in this giveaway")
            );
        }

        // Optional: Check eligibility (can be skipped for admin override)
        if (!skipEligibilityCheck) {
            const eligibleUsers = await getEligibleParticipants(giveaway);
            const isEligible = eligibleUsers.some(eligibleUser => 
                eligibleUser._id.toString() === user._id.toString()
            );

            if (!isEligible) {
                return res.json(
                    new ApiResponse(400, null, "User does not meet eligibility criteria for this giveaway. Set skipEligibilityCheck=true to override.")
                );
            }
        }

        // Check if there are remaining slots for this prize
        const existingWinnersForPrize = await Winner.countDocuments({
            giveawayId: giveaway._id,
            'prizeWon.name': selectedPrize.name
        });

        if (existingWinnersForPrize >= selectedPrize.quantity) {
            return res.json(
                new ApiResponse(400, null, `All slots for prize "${selectedPrize.name}" are already filled`)
            );
        }

        // Create the manual winner
        const winner = await Winner.create({
            giveawayId: giveaway._id,
            userId: user._id,
            prizeWon: {
                name: selectedPrize.name,
                description: selectedPrize.description,
                value: selectedPrize.value,
                image: selectedPrize.image
            },
            contactInfo: {
                phone: user.phone || null
            },
            notes: `Manually selected by admin: ${req.user.name} at ${new Date().toISOString()}`
        });

        const populatedWinner = await Winner.findById(winner._id)
            .populate('userId', 'name phone')
            .populate('giveawayId', 'title');

        return res.json(
            new ApiResponse(200, {
                winner: populatedWinner,
                giveaway: {
                    id: giveaway._id,
                    title: giveaway.title
                },
                prize: selectedPrize,
                adminAction: true,
                selectedBy: req.user.name
            }, "Winner manually selected successfully")
        );

    } catch (error) {
        console.error("Select manual winner error:", error);
        throw new ApiError(500, "Something went wrong while selecting manual winner");
    }
});

// Get all users eligible for a giveaway (Helper for admin to see who can be selected)
const getEligibleUsersForGiveaway = asyncHandler(async (req, res) => {
    try {
        const { giveawayId } = req.params;
        const { page = 1, limit = 20, search } = req.query;

        if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid giveaway ID")
            );
        }

        const giveaway = await Giveaway.findById(giveawayId);
        if (!giveaway) {
            return res.json(
                new ApiResponse(404, null, "Giveaway not found")
            );
        }

        // Get eligible participants
        let eligibleUsers = await getEligibleParticipants(giveaway);

        // Get existing winners to mark them
        const existingWinnerIds = await Winner.find({ giveawayId: giveaway._id })
            .distinct('userId');

        // Filter search if provided
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            eligibleUsers = eligibleUsers.filter(user => 
                searchRegex.test(user.name) || searchRegex.test(user.phone)
            );
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedUsers = eligibleUsers.slice(skip, skip + parseInt(limit));

        // Mark users who are already winners
        const usersWithWinnerStatus = paginatedUsers.map(user => ({
            ...user.toObject(),
            isAlreadyWinner: existingWinnerIds.some(winnerId => 
                winnerId.toString() === user._id.toString()
            )
        }));

        const totalUsers = eligibleUsers.length;
        const totalPages = Math.ceil(totalUsers / parseInt(limit));

        return res.json(
            new ApiResponse(200, {
                eligibleUsers: usersWithWinnerStatus,
                availablePrizes: giveaway.prizes.map((prize, index) => ({
                    index,
                    name: prize.name,
                    description: prize.description,
                    value: prize.value,
                    quantity: prize.quantity,
                    remainingSlots: prize.quantity - existingWinnerIds.length // Simplified calculation
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalUsers,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                }
            }, "Eligible users retrieved successfully")
        );

    } catch (error) {
        console.error("Get eligible users error:", error);
        throw new ApiError(500, "Something went wrong while retrieving eligible users");
    }
});
 
// Update giveaway winner details for admin
const updateGiveawayWinner = asyncHandler(async (req, res) => {
    try {
        const { winnerId } = req.params;
        const { 
            deliveryStatus, 
            contactInfo, 
            notes, 
            prizeWon,
            winnerImageUrl 
        } = req.body;

        // 1️⃣ Validate winner ID
        if (!mongoose.Types.ObjectId.isValid(winnerId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid winner ID")
            );
        }

        // 2️⃣ Find the winner
        const winner = await Winner.findById(winnerId)
            .populate('userId', 'name phone')
            .populate('giveawayId', 'title');

        if (!winner) {
            return res.json(
                new ApiResponse(404, null, "Winner not found")
            );
        }

        // Check if the associated giveaway still exists
        if (!winner.giveawayId) {
            return res.json(
                new ApiResponse(400, null, "Cannot update winner: Associated giveaway no longer exists")
            );
        }

        // Additional check to ensure giveaway is properly populated and has a title
        if (!winner.giveawayId.title) {
            return res.json(
                new ApiResponse(400, null, "Cannot update winner: Associated giveaway data is incomplete or corrupted")
            );
        }

        // 3️⃣ Handle file uploads
        let prizeImageUrl = null;
        let winnerProfileImageUrl = null;

        if (req.files) {
            if (req.files.prizeImage && req.files.prizeImage[0]) {
                const prizeImageUpload = await uploadOnCloudinary(req.files.prizeImage[0].path);
                if (prizeImageUpload) {
                    prizeImageUrl = prizeImageUpload.secure_url;
                } else {
                    return res.json(
                        new ApiResponse(400, null, "Failed to upload prize image")
                    );
                }
            }

            if (req.files.winnerImage && req.files.winnerImage[0]) {
                const winnerImageUpload = await uploadOnCloudinary(req.files.winnerImage[0].path);
                if (winnerImageUpload) {
                    winnerProfileImageUrl = winnerImageUpload.secure_url;
                } else {
                    return res.json(
                        new ApiResponse(400, null, "Failed to upload winner image")
                    );
                }
            }
        }

        // 4️⃣ Update delivery status
        if (deliveryStatus) {
            const validStatuses = ['pending', 'contacted', 'shipped', 'delivered'];
            if (!validStatuses.includes(deliveryStatus)) {
                return res.json(
                    new ApiResponse(400, null, `Invalid delivery status. Must be one of: ${validStatuses.join(', ')}`)
                );
            }
            winner.deliveryStatus = deliveryStatus;
        }

        // 5️⃣ Update contact info
        if (contactInfo) {
            winner.contactInfo = { 
                ...winner.contactInfo?.toObject?.() || {}, 
                ...contactInfo 
            };
        }

        // 6️⃣ Update notes
        if (notes !== undefined) {
            winner.notes = notes;
        }

        // 7️⃣ Update prize details
        if (prizeWon) {
            const updatedPrize = { ...winner.prizeWon?.toObject?.() || {} };
            
            if (prizeWon.name) updatedPrize.name = prizeWon.name;
            if (prizeWon.description) updatedPrize.description = prizeWon.description;
            if (prizeWon.value !== undefined) updatedPrize.value = prizeWon.value;
            
            if (prizeImageUrl) {
                updatedPrize.image = prizeImageUrl;
            } else if (prizeWon.image) {
                updatedPrize.image = prizeWon.image;
            }

            winner.prizeWon = updatedPrize;
        } else if (prizeImageUrl) {
            winner.prizeWon.image = prizeImageUrl;
        }

        // 8️⃣ Update winner image
        if (winnerProfileImageUrl) {
            winner.contactInfo = winner.contactInfo || {};
            winner.contactInfo.profileImage = winnerProfileImageUrl;
        } else if (winnerImageUrl) {
            winner.contactInfo = winner.contactInfo || {};
            winner.contactInfo.profileImage = winnerImageUrl;
        }

        // 9️⃣ Update metadata
        winner.lastUpdatedBy = req.user._id;
        winner.lastUpdatedAt = new Date();

        // 🔟 Save changes
        await winner.save();

        // 1️⃣1️⃣ Re-fetch updated winner
        const updatedWinner = await Winner.findById(winnerId)
            .populate('userId', 'name phone')
            .populate('giveawayId', 'title')
            .populate('lastUpdatedBy', 'name');

        // Check if winner still exists after update
        if (!updatedWinner) {
            console.error("Winner not found after update, winnerId:", winnerId);
            return res.json(
                new ApiResponse(404, null, "Winner not found after update")
            );
        }

        // Defensive check for giveaway title with detailed logging
        let giveawayTitle = "N/A";
        try {
            if (updatedWinner.giveawayId && updatedWinner.giveawayId.title) {
                giveawayTitle = updatedWinner.giveawayId.title;
            } else {
                console.warn("Giveaway title missing for winner:", winnerId, "giveawayId:", updatedWinner.giveawayId);
                giveawayTitle = "Giveaway Title Unavailable";
            }
        } catch (titleError) {
            console.error("Error accessing giveaway title:", titleError);
            giveawayTitle = "Error Retrieving Title";
        }

        // 1️⃣2️⃣ Prepare response
        const responseData = {
            winner: updatedWinner,
            updates: {
                deliveryStatus: deliveryStatus || "No change",
                contactInfo: contactInfo ? "Updated" : "No change",
                notes: notes !== undefined ? "Updated" : "No change",
                prizeDetails: prizeWon ? "Updated" : "No change",
                prizeImage: prizeImageUrl ? "New image uploaded" : "No change",
                winnerImage: winnerProfileImageUrl || winnerImageUrl ? "New image uploaded" : "No change"
            },
            metadata: {
                updatedBy: req.user.name,
                updatedAt: new Date().toISOString(),
                giveawayTitle
            }
        };

        return res.json(
            new ApiResponse(200, responseData, "Winner details updated successfully")
        );

    } catch (error) {
        console.error("Update giveaway winner error:", error);
        console.error("Error details:", {
            winnerId: req.params.winnerId,
            errorMessage: error.message,
            errorStack: error.stack
        });
        throw new ApiError(500, "Something went wrong while updating winner details");
    }
});



// ==================== PUBLIC ENDPOINTS ====================

// Get active giveaways for public viewing
const getActiveGiveaways = asyncHandler(async (req, res) => {
    try {
        const now = new Date();
        
        const activeGiveaways = await Giveaway.find({
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now }
        })
        .populate('eligibilityCriteria.eligibleProducts', 'name price picture')
        .select('-createdBy')
        .sort({ endDate: 1 });

        return res.json(
            new ApiResponse(200, activeGiveaways, "Active giveaways retrieved successfully")
        );

    } catch (error) {
        console.error("Get active giveaways error:", error);
        return res.json(
            new ApiResponse(500, null, error.message || "Failed to retrieve active giveaways")
        );
    }
});

// Remove a winner from the giveaway (Admin)
const removeWinner = asyncHandler(async (req, res) => {
    try {
        const { winnerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(winnerId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid winner ID")
            );
        }

        const winner = await Winner.findById(winnerId)
            .populate('userId', 'name phone')
            .populate('giveawayId', 'title');

        if (!winner) {
            return res.json(
                new ApiResponse(404, null, "Winner not found")
            );
        }

        // Store winner info before deletion for response
        const removedWinnerInfo = {
            winnerId: winner._id,
            user: {
                id: winner.userId?._id || null,
                name: winner.userId?.name || "Unknown",
                phone: winner.userId?.phone || "Unknown"
            },
            giveaway: {
                id: winner.giveawayId?._id || null,
                title: winner.giveawayId?.title || "Deleted Giveaway"
            },
            prizeWon: winner.prizeWon,
            wonAt: winner.wonAt,
            deliveryStatus: winner.deliveryStatus
        };

        // Delete the winner
        await Winner.findByIdAndDelete(winnerId);

        return res.json(
            new ApiResponse(200, {
                removedWinner: removedWinnerInfo,
                adminAction: true,
                removedBy: req.user.name,
                removedAt: new Date().toISOString()
            }, `Winner ${removedWinnerInfo.user.name} removed successfully from giveaway`)
        );

    } catch (error) {
        console.error("Remove winner error:", error);
        throw new ApiError(500, "Something went wrong while removing winner");
    }
});

// Get detailed prize information for a giveaway (Developer/Admin utility)
const getGiveawayPrizeDetails = asyncHandler(async (req, res) => {
    try {
        const { giveawayId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid giveaway ID")
            );
        }

        const giveaway = await Giveaway.findById(giveawayId);
        if (!giveaway) {
            return res.json(
                new ApiResponse(404, null, "Giveaway not found")
            );
        }

        // Get all winners for this giveaway
        const winners = await Winner.find({ giveawayId: giveaway._id })
            .populate('userId', 'name phone')
            .sort({ wonAt: -1 });

        // Calculate detailed prize statistics
        const prizeDetails = await Promise.all(
            giveaway.prizes.map(async (prize, index) => {
                // Get winners for this specific prize
                const prizeWinners = winners.filter(winner => 
                    winner.prizeWon.name === prize.name
                );

                // Group winners by delivery status
                const statusGroups = {
                    pending: prizeWinners.filter(w => w.deliveryStatus === 'pending'),
                    contacted: prizeWinners.filter(w => w.deliveryStatus === 'contacted'),
                    shipped: prizeWinners.filter(w => w.deliveryStatus === 'shipped'),
                    delivered: prizeWinners.filter(w => w.deliveryStatus === 'delivered')
                };

                return {
                    index,
                    prize: {
                        name: prize.name,
                        description: prize.description,
                        value: prize.value,
                        image: prize.image,
                        totalQuantity: prize.quantity
                    },
                    allocation: {
                        totalAllocated: prizeWinners.length,
                        remainingSlots: Math.max(0, prize.quantity - prizeWinners.length),
                        allocationPercentage: ((prizeWinners.length / prize.quantity) * 100).toFixed(2)
                    },
                    winners: prizeWinners.map(winner => ({
                        winnerId: winner._id,
                        user: {
                            id: winner.userId._id,
                            name: winner.userId.name,
                            phone: winner.userId.phone
                        },
                        wonAt: winner.wonAt,
                        deliveryStatus: winner.deliveryStatus,
                        notes: winner.notes
                    })),
                    deliveryStatus: {
                        pending: statusGroups.pending.length,
                        contacted: statusGroups.contacted.length,
                        shipped: statusGroups.shipped.length,
                        delivered: statusGroups.delivered.length
                    }
                };
            })
        );

        // Overall statistics
        const totalPrizeValue = giveaway.prizes.reduce((sum, prize) => sum + (prize.value * prize.quantity), 0);
        const totalAllocatedValue = winners.reduce((sum, winner) => sum + winner.prizeWon.value, 0);
        const totalWinners = winners.length;
        const totalPossibleWinners = giveaway.prizes.reduce((sum, prize) => sum + prize.quantity, 0);

        return res.json(
            new ApiResponse(200, {
                giveaway: {
                    id: giveaway._id,
                    title: giveaway.title,
                    description: giveaway.description,
                    status: giveaway.status,
                    drawCompleted: giveaway.drawCompleted,
                    startDate: giveaway.startDate,
                    endDate: giveaway.endDate,
                    drawDate: giveaway.drawDate
                },
                prizeDetails,
                summary: {
                    totalPrizes: giveaway.prizes.length,
                    totalPossibleWinners,
                    totalActualWinners: totalWinners,
                    remainingSlots: totalPossibleWinners - totalWinners,
                    completionPercentage: ((totalWinners / totalPossibleWinners) * 100).toFixed(2),
                    totalPrizeValue,
                    totalAllocatedValue,
                    remainingPrizeValue: totalPrizeValue - totalAllocatedValue
                }
            }, "Prize details retrieved successfully")
        );

    } catch (error) {
        console.error("Get prize details error:", error);
        throw new ApiError(500, "Something went wrong while retrieving prize details");
    }
});

export {
    // Giveaway Management
    createGiveaway,
    getAllGiveaways,
    getGiveawayById,
    updateGiveawayStatus,
    deleteGiveaway,
    
    // Draw & Winner Management
    runGiveawayDraw,
    getGiveawayWinners,
    updateWinner,
    replaceWinner,
    updateWinnerPrize,
    removeWinner,
    updateGiveawayWinner,
    
    // Manual Winner Selection (Admin)
    selectManualWinner,
    getEligibleUsersForGiveaway,
    
    // Developer/Admin Utilities
    getGiveawayPrizeDetails,
    
    // Public
    getActiveGiveaways
};
