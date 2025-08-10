import { asyncHandler } from "../Utilities/asyncHandler.js";
import { ApiError } from "../Utilities/ApiError.js";
import { ApiResponse } from "../Utilities/ApiResponse.js";
import { Main } from "../Models/main.Models.js";
import { Giveaway } from "../Models/giveaway.Models.js";
import { Purchase } from "../Models/purchase.Models.js";
import { uploadOnCloudinary } from "../Utilities/cloudinary.js";

// Upload banner image
const uploadBanner = asyncHandler(async (req, res) => {
    const imageFile = req.file;

    if (!imageFile) {
        throw new ApiError(400, "Banner image is required");
    }

    // Upload to cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(imageFile.path);
    if (!cloudinaryResponse?.url) {
        throw new ApiError(500, "Failed to upload banner image");
    }

    // Get or create main document
    let main = await Main.findOne();
    if (!main) {
        main = new Main();
    }

    // Replace the banner image
    main.bannerImage = cloudinaryResponse.url;
    await main.save();

    return res.status(200).json(
        new ApiResponse(200, { bannerImage: main.bannerImage }, "Banner uploaded successfully")
    );
});

// Get current banner
const getBanner = asyncHandler(async (req, res) => {
    const main = await Main.findOne();
    
    return res.status(200).json(
        new ApiResponse(200, { bannerImage: main?.bannerImage || null }, "Banner retrieved successfully")
    );
});

// Remove banner
const removeBanner = asyncHandler(async (req, res) => {
    const main = await Main.findOne();
    
    if (!main || !main.bannerImage) {
        throw new ApiError(404, "No banner found to remove");
    }

    main.bannerImage = null;
    await main.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Banner removed successfully")
    );
});

// Add winner
const addWinner = asyncHandler(async (req, res) => {
    const { name, prizeName } = req.body;
    const imageFile = req.file;

    if (!name?.trim() || !prizeName?.trim()) {
        throw new ApiError(400, "Winner name and prize name are required");
    }

    if (!imageFile) {
        throw new ApiError(400, "Winner image is required");
    }

    // Upload winner image to cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(imageFile.path);
    if (!cloudinaryResponse?.url) {
        throw new ApiError(500, "Failed to upload winner image");
    }

    // Get or create main document
    let main = await Main.findOne();
    if (!main) {
        main = new Main();
    }

    // Add new winner
    const newWinner = {
        name: name.trim(),
        prizeName: prizeName.trim(),
        winnerImage: cloudinaryResponse.url
    };

    main.winners.push(newWinner);
    await main.save();

    return res.status(201).json(
        new ApiResponse(201, newWinner, "Winner added successfully")
    );
});

// Get all winners
const getWinners = asyncHandler(async (req, res) => {
    const main = await Main.findOne();
    
    return res.status(200).json(
        new ApiResponse(200, main?.winners || [], "Winners retrieved successfully")
    );
});

// Update winner
const updateWinner = asyncHandler(async (req, res) => {
    const { winnerId } = req.params;
    const { name, prizeName } = req.body;
    const imageFile = req.file;

    const main = await Main.findOne();
    if (!main) {
        throw new ApiError(404, "No main document found");
    }

    const winner = main.winners.id(winnerId);
    if (!winner) {
        throw new ApiError(404, "Winner not found");
    }

    // Update winner details
    if (name?.trim()) {
        winner.name = name.trim();
    }
    if (prizeName?.trim()) {
        winner.prizeName = prizeName.trim();
    }

    // Update winner image if provided
    if (imageFile) {
        const cloudinaryResponse = await uploadOnCloudinary(imageFile.path);
        if (!cloudinaryResponse?.url) {
            throw new ApiError(500, "Failed to upload winner image");
        }
        winner.winnerImage = cloudinaryResponse.url;
    }

    await main.save();

    return res.status(200).json(
        new ApiResponse(200, winner, "Winner updated successfully")
    );
});

// Delete winner
const deleteWinner = asyncHandler(async (req, res) => {
    const { winnerId } = req.params;

    const main = await Main.findOne();
    if (!main) {
        throw new ApiError(404, "No main document found");
    }

    const winnerIndex = main.winners.findIndex(winner => winner._id.toString() === winnerId);
    if (winnerIndex === -1) {
        throw new ApiError(404, "Winner not found");
    }

    main.winners.splice(winnerIndex, 1);
    await main.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Winner deleted successfully")
    );
});

// Live Participant Counts
const getLiveParticipantCounts = asyncHandler(async (req, res) => {
    // Find the current active giveaway
    const activeGiveaway = await Giveaway.findOne({
        status: 'active',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
    });

    if (!activeGiveaway) {
        return res.status(200).json(
            new ApiResponse(200, null, "No active giveaway found")
        );
    }

    // Count participants for the active giveaway
    const participantCount = await Purchase.countDocuments({
        giveawayId: activeGiveaway._id,
        purchaseDate: {
            $gte: activeGiveaway.startDate,
            $lte: activeGiveaway.endDate
        }
    });

    const responseData = {
        giveawayId: activeGiveaway._id,
        giveawayTitle: activeGiveaway.title,
        currentParticipants: participantCount,
        giveawayStartDate: activeGiveaway.startDate,
        giveawayEndDate: activeGiveaway.endDate,
        lastUpdated: new Date()
    };

    return res.status(200).json(
        new ApiResponse(200, responseData, "Live participant count retrieved successfully")
    );
});

// Get Main Page Data (banner + live count + winners)
const getMainPageData = asyncHandler(async (req, res) => {
    // Get main document
    const main = await Main.findOne();
    
    // Get active giveaway and participant count
    const activeGiveaway = await Giveaway.findOne({
        status: 'active',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
    });

    let liveCount = null;
    if (activeGiveaway) {
        const participantCount = await Purchase.countDocuments({
            giveawayId: activeGiveaway._id,
            purchaseDate: {
                $gte: activeGiveaway.startDate,
                $lte: activeGiveaway.endDate
            }
        });

        liveCount = {
            giveawayId: activeGiveaway._id,
            giveawayTitle: activeGiveaway.title,
            currentParticipants: participantCount,
            giveawayStartDate: activeGiveaway.startDate,
            giveawayEndDate: activeGiveaway.endDate,
            lastUpdated: new Date()
        };
    }

    const responseData = {
        bannerImage: main?.bannerImage || null,
        liveParticipantCount: liveCount,
        winners: main?.winners || []
    };

    return res.status(200).json(
        new ApiResponse(200, responseData, "Main page data retrieved successfully")
    );
});

export {
    uploadBanner,
    getBanner,
    removeBanner,
    addWinner,
    getWinners,
    updateWinner,
    deleteWinner,
    getLiveParticipantCounts,
    getMainPageData
};
