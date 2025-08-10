import { Main } from "../Models/main.Models.js";
import { Giveaway } from "../Models/giveaway.Models.js";
import { Winner } from "../Models/winner.Models.js";
import { Purchase } from "../Models/purchase.Models.js";
import { asyncHandler } from "../Utilities/asyncHandler.js";
import { ApiError } from "../Utilities/ApiError.js";
import { ApiResponse } from "../Utilities/ApiResponse.js";
import { uploadOnCloudinary } from "../Utilities/cloudinary.js";
import mongoose from "mongoose";

// ==================== BANNER MANAGEMENT ====================

// Add new banner
const addBanner = asyncHandler(async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.json(
                new ApiResponse(400, null, "Banner title is required")
            );
        }

        if (!req.file) {
            return res.json(
                new ApiResponse(400, null, "Banner image is required")
            );
        }

        // Upload image to cloudinary
        const imageUpload = await uploadOnCloudinary(req.file.path);
        if (!imageUpload) {
            return res.json(
                new ApiResponse(400, null, "Failed to upload banner image")
            );
        }

        // Find or create main document
        let main = await Main.findOne();
        if (!main) {
            main = new Main();
        }

        // Add new banner
        main.banners.push({
            title,
            image: imageUpload.secure_url,
            isActive: true,
            createdBy: req.user._id
        });

        await main.save();

        return res.json(
            new ApiResponse(201, main.banners[main.banners.length - 1], "Banner added successfully")
        );

    } catch (error) {
        console.error("Add banner error:", error);
        throw new ApiError(500, "Something went wrong while adding banner");
    }
});

// Get all banners
const getAllBanners = asyncHandler(async (req, res) => {
    try {
        const main = await Main.findOne().populate('banners.createdBy', 'name');
        
        const banners = main ? main.banners : [];

        return res.json(
            new ApiResponse(200, banners, "Banners retrieved successfully")
        );

    } catch (error) {
        console.error("Get banners error:", error);
        throw new ApiError(500, "Something went wrong while retrieving banners");
    }
});

// Get active banners only (for public)
const getActiveBanners = asyncHandler(async (req, res) => {
    try {
        const main = await Main.findOne();
        
        const activeBanners = main ? main.banners.filter(banner => banner.isActive) : [];

        return res.json(
            new ApiResponse(200, activeBanners, "Active banners retrieved successfully")
        );

    } catch (error) {
        console.error("Get active banners error:", error);
        throw new ApiError(500, "Something went wrong while retrieving active banners");
    }
});

// Update banner status
const updateBannerStatus = asyncHandler(async (req, res) => {
    try {
        const { bannerId } = req.params;
        const { isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(bannerId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid banner ID")
            );
        }

        const main = await Main.findOne();
        if (!main) {
            return res.json(
                new ApiResponse(404, null, "No banners found")
            );
        }

        const banner = main.banners.id(bannerId);
        if (!banner) {
            return res.json(
                new ApiResponse(404, null, "Banner not found")
            );
        }

        banner.isActive = isActive;
        await main.save();

        return res.json(
            new ApiResponse(200, banner, "Banner status updated successfully")
        );

    } catch (error) {
        console.error("Update banner status error:", error);
        throw new ApiError(500, "Something went wrong while updating banner status");
    }
});

// Delete banner
const deleteBanner = asyncHandler(async (req, res) => {
    try {
        const { bannerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bannerId)) {
            return res.json(
                new ApiResponse(400, null, "Invalid banner ID")
            );
        }

        const main = await Main.findOne();
        if (!main) {
            return res.json(
                new ApiResponse(404, null, "No banners found")
            );
        }

        const banner = main.banners.id(bannerId);
        if (!banner) {
            return res.json(
                new ApiResponse(404, null, "Banner not found")
            );
        }

        main.banners.pull(bannerId);
        await main.save();

        return res.json(
            new ApiResponse(200, null, "Banner deleted successfully")
        );

    } catch (error) {
        console.error("Delete banner error:", error);
        throw new ApiError(500, "Something went wrong while deleting banner");
    }
});

// ==================== LIVE PARTICIPANT TRACKING ====================

// Get live participant counts for all active giveaways
const getLiveParticipantCounts = asyncHandler(async (req, res) => {
    try {
        // Get all active giveaways
        const activeGiveaways = await Giveaway.find({ 
            status: 'active',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        }).select('_id title startDate endDate');

        const participantData = [];

        for (const giveaway of activeGiveaways) {
            // Count participants who bought products between giveaway start and end dates
            const participantCount = await Purchase.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: giveaway.startDate,
                            $lte: giveaway.endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: "$userId"
                    }
                },
                {
                    $count: "totalParticipants"
                }
            ]);

            const count = participantCount[0]?.totalParticipants || 0;

            participantData.push({
                giveawayId: giveaway._id,
                giveawayTitle: giveaway.title,
                currentParticipants: count,
                startDate: giveaway.startDate,
                endDate: giveaway.endDate
            });
        }

        // Update the counts in main document
        let main = await Main.findOne();
        if (!main) {
            main = new Main();
        }

        // Update participant counts
        for (const data of participantData) {
            await main.updateParticipantCount(data.giveawayId, data.currentParticipants);
        }

        return res.json(
            new ApiResponse(200, participantData, "Live participant counts retrieved successfully")
        );

    } catch (error) {
        console.error("Get live participant counts error:", error);
        throw new ApiError(500, "Something went wrong while retrieving participant counts");
    }
});

// ==================== MAIN PAGE DATA ====================

// Get all main page data (banners + live counts + recent winners)
const getMainPageData = asyncHandler(async (req, res) => {
    try {
        // Get main document
        let main = await Main.findOne().populate('recentWinners.winnerId');
        if (!main) {
            main = new Main();
        }

        // Get active banners
        const activeBanners = main.banners.filter(banner => banner.isActive);

        // Get live participant counts
        const activeGiveaways = await Giveaway.find({ 
            status: 'active',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        }).select('_id title startDate endDate');

        const liveParticipantCounts = [];
        for (const giveaway of activeGiveaways) {
            const participantCount = await Purchase.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: giveaway.startDate,
                            $lte: giveaway.endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: "$userId"
                    }
                },
                {
                    $count: "totalParticipants"
                }
            ]);

            const count = participantCount[0]?.totalParticipants || 0;
            liveParticipantCounts.push({
                giveawayId: giveaway._id,
                giveawayTitle: giveaway.title,
                currentParticipants: count,
                startDate: giveaway.startDate,
                endDate: giveaway.endDate
            });
        }

        // Get recent winners
        const recentWinners = await Winner.find()
            .populate('userId', 'name')
            .populate('giveawayId', 'title')
            .sort({ wonAt: -1 })
            .limit(10)
            .select('userId giveawayId prizeWon wonAt');

        const formattedWinners = recentWinners.map(winner => ({
            displayName: winner.userId?.name || "Anonymous",
            giveawayTitle: winner.giveawayId?.title || "Unknown Giveaway",
            prizeWon: winner.prizeWon?.name || "Prize",
            wonAt: winner.wonAt
        }));

        return res.json(
            new ApiResponse(200, {
                banners: activeBanners,
                liveParticipantCounts,
                recentWinners: formattedWinners
            }, "Main page data retrieved successfully")
        );

    } catch (error) {
        console.error("Get main page data error:", error);
        throw new ApiError(500, "Something went wrong while retrieving main page data");
    }
});

export {
    // Banner Management
    addBanner,
    getAllBanners,
    getActiveBanners,
    updateBannerStatus,
    deleteBanner,
    
    // Live Tracking
    getLiveParticipantCounts,
    
    // Main Page
    getMainPageData
};
