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
    try {
        const {
            title,
            description,
            prizes,
            eligibilityCriteria,
            startDate,
            endDate,
            drawDate,
            status
        } = req.body;

        // Validate required fields
        if (!title || !description || !prizes || !startDate || !endDate || !drawDate) {
            return res.json(
                new ApiResponse(400, null, "All required fields must be provided")
            );
        }

        // Validate prizes array
        if (!Array.isArray(prizes) || prizes.length === 0) {
            return res.json(
                new ApiResponse(400, null, "At least one prize must be provided")
            );
        }

        // Validate each prize
        for (let i = 0; i < prizes.length; i++) {
            const prize = prizes[i];
            if (!prize.name || !prize.description || prize.value === undefined || !prize.quantity || prize.quantity < 1) {
                return res.json(
                    new ApiResponse(400, null, `Prize ${i + 1} is invalid. Name, description, value, and quantity (>0) are required`)
                );
            }
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const draw = new Date(drawDate);

        if (start >= end) {
            return res.json(
                new ApiResponse(400, null, "End date must be after start date")
            );
        }

        if (draw < end) {
            return res.json(
                new ApiResponse(400, null, "Draw date must be on or after end date")
            );
        }

        // Handle image upload if provided
        let imageUrl = null;
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                imageUrl = uploadResult.url;
            } else {
                try {
            fs.unlinkSync(req.file.path);
            console.log("Local image deleted successfully.");
        } catch (error) {
            // Agar file delete nahi hoti to sirf error log karein
            console.error("Error deleting local image:", error);
        }
        new ApiResponse(400, null, "Failed to upload giveaway image")
            }
        }

        // Create giveaway
        const giveaway = await Giveaway.create({
            title,
            description,
            image: imageUrl,
            createdBy: req.user._id,
            prizes,
            eligibilityCriteria: eligibilityCriteria || {},
            startDate: start,
            endDate: end,
            drawDate: draw,
            status: status || "draft"
        });

        const populatedGiveaway = await Giveaway.findById(giveaway._id)
            .populate('createdBy', 'name phone')
            .populate('eligibilityCriteria.eligibleProducts', 'name price');

        return res.status(201).json(
            new ApiResponse(201, populatedGiveaway, "Giveaway created successfully")
        );

    } catch (error) {
        console.error("Create giveaway error:", error);
         throw new ApiError(500, "Something went wrong while creating the giveaway");
    }
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
        
        // Base query for users
        let userQuery = { status: 'user' };
        
        // Get user IDs based on purchase criteria
        let purchaseFilter = {};
        
        // Filter by purchase approval status
        purchaseFilter.paymentApproval = 'completed';
        purchaseFilter.userPayment = 'payed';
        
        // Filter by purchase date range if specified
        if (criteria.purchaseStartDate || criteria.purchaseEndDate) {
            purchaseFilter.createdAt = {};
            if (criteria.purchaseStartDate) {
                purchaseFilter.createdAt.$gte = criteria.purchaseStartDate;
            }
            if (criteria.purchaseEndDate) {
                purchaseFilter.createdAt.$lte = criteria.purchaseEndDate;
            }
        }
        
        // Filter by eligible products if specified
        if (criteria.eligibleProducts && criteria.eligibleProducts.length > 0) {
            purchaseFilter.productId = { $in: criteria.eligibleProducts };
        }
        
        // Aggregate to get users who meet purchase criteria
        const aggregationPipeline = [
            { $match: purchaseFilter },
            {
                $group: {
                    _id: '$userId',
                    purchaseCount: { $sum: 1 },
                    totalSpent: { $sum: '$productId.price' }
                }
            },
            {
                $match: {
                    purchaseCount: { $gte: criteria.minPurchases || 1 }
                }
            }
        ];
        
        // If we need to check total amount spent, we need to populate product prices
        if (criteria.minAmountSpent > 0) {
            // We'll need to calculate this differently since we need product prices
            const purchases = await Purchase.find(purchaseFilter)
                .populate('productId', 'price')
                .populate('userId', 'name phone status');
            
            const userPurchaseStats = {};
            
            purchases.forEach(purchase => {
                const userId = purchase.userId._id.toString();
                if (!userPurchaseStats[userId]) {
                    userPurchaseStats[userId] = {
                        user: purchase.userId,
                        purchaseCount: 0,
                        totalSpent: 0
                    };
                }
                userPurchaseStats[userId].purchaseCount++;
                userPurchaseStats[userId].totalSpent += purchase.productId.price || 0;
            });
            
            // Filter users based on criteria
            const eligibleUsers = Object.values(userPurchaseStats)
                .filter(stats => {
                    return stats.user.status === 'user' &&
                           stats.purchaseCount >= (criteria.minPurchases || 1) &&
                           stats.totalSpent >= (criteria.minAmountSpent || 0);
                })
                .map(stats => stats.user);
            
            return eligibleUsers;
        } else {
            // Simpler case without amount spent requirement
            const purchaseResults = await Purchase.aggregate(aggregationPipeline);
            const eligibleUserIds = purchaseResults.map(result => result._id);
            
            const eligibleUsers = await User.find({
                _id: { $in: eligibleUserIds },
                status: 'user'
            });
            
            return eligibleUsers;
        }
    } catch (error) {
        console.error("Get eligible participants error:", error);
        throw new ApiError(500, "Something went wrong");
;
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
    
    // Public
    getActiveGiveaways
};
