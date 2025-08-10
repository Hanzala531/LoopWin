import { asyncHandler } from "../Utilities/asyncHandler.js";
import { ApiError } from "../Utilities/ApiError.js";
import { ApiResponse } from "../Utilities/ApiResponse.js";
import { Main } from "../Models/main.Models.js";
import { Giveaway } from "../Models/giveaway.Models.js";
import { Purchase } from "../Models/purchase.Models.js";
import { Winner } from "../Models/winner.Models.js";
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

// Live Participant Counts
const getLiveParticipantCounts = asyncHandler(async (req, res) => {
    const main = await Main.findOne()
        .populate('participantCounts.giveawayId', 'title startDate endDate');
    
    if (!main) {
        return res.status(200).json(
            new ApiResponse(200, [], "No participant counts available")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, main.participantCounts, "Live participant counts retrieved successfully")
    );
});

// Get Main Page Data
const getMainPageData = asyncHandler(async (req, res) => {
    // Get or create main document
    let main = await Main.findOne()
        .populate('participantCounts.giveawayId', 'title startDate endDate')
        .populate('recentWinners.winnerId', 'name email');

    if (!main) {
        main = new Main();
        await main.save();
    }

    // Update participant counts for active giveaways
    const activeGiveaways = await Giveaway.find({
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
    });

    for (const giveaway of activeGiveaways) {
        const participantCount = await Purchase.countDocuments({
            giveawayId: giveaway._id,
            purchaseDate: {
                $gte: giveaway.startDate,
                $lte: giveaway.endDate
            }
        });

        await main.updateParticipantCount(giveaway._id, participantCount);
    }

    // Get recent winners (last 10)
    const recentWinners = await Winner.find()
        .populate('userId', 'name')
        .populate('giveawayId', 'title prize')
        .sort({ createdAt: -1 })
        .limit(10);

    // Update recent winners in main document
    main.recentWinners = recentWinners.map(winner => ({
        winnerId: winner._id,
        displayName: winner.userId?.name || 'Anonymous',
        giveawayTitle: winner.giveawayId?.title || 'Unknown Giveaway',
        prizeWon: winner.giveawayId?.prize || 'Prize',
        wonAt: winner.createdAt
    }));

    await main.save();

    const responseData = {
        bannerImage: main.bannerImage,
        liveParticipantCounts: main.participantCounts,
        recentWinners: main.recentWinners
    };

    return res.status(200).json(
        new ApiResponse(200, responseData, "Main page data retrieved successfully")
    );
});

export {
    uploadBanner,
    getBanner,
    removeBanner,
    getLiveParticipantCounts,
    getMainPageData
};
