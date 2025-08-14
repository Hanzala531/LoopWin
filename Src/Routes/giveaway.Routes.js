import { Router } from "express";
import {
    createGiveaway,
    getAllGiveaways,
    getGiveawayById,
    updateGiveawayStatus,
    deleteGiveaway,
    runGiveawayDraw,
    getGiveawayWinners,
    updateWinner,
    replaceWinner,
    updateWinnerPrize,
    removeWinner,
    getActiveGiveaways,
    selectManualWinner,
    getEligibleUsersForGiveaway,
    getGiveawayPrizeDetails,
    updateGiveawayWinner
} from "../Controllers/giveaway.Controllers.js";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { verifyAdmin } from "../Middlewares/Role.middlewares.js";
import { upload } from "../Middlewares/Multer.middleware.js";

const router = Router();

// ==================== PUBLIC ROUTES ====================
// Get active giveaways (no authentication required)
router.route("/active").get(getActiveGiveaways);


router.route("/").get(getAllGiveaways);

// ==================== ADMIN ONLY ROUTES ====================
// All routes below require authentication and admin role
router.use(verifyJWT, verifyAdmin);

// Giveaway Management
router.route("/create").post(upload.single("image"), createGiveaway);
router.route("/:giveawayId").get(getGiveawayById);
router.route("/:giveawayId/status").patch(updateGiveawayStatus);
router.route("/:giveawayId").delete(deleteGiveaway);

// Draw & Winner Management
router.route("/:giveawayId/draw").post(runGiveawayDraw);
router.route("/:giveawayId/winners").get(getGiveawayWinners);
router.route("/winners/:winnerId").patch(updateWinner);
router.route("/winners/:winnerId/replace").post(replaceWinner);
router.route("/winners/:winnerId/prize").patch(updateWinnerPrize);
router.route("/winners/:winnerId/remove").delete(removeWinner);
router.route("/winners/:winnerId/update").patch(
    upload.fields([
        { name: 'prizeImage', maxCount: 1 },
        { name: 'winnerImage', maxCount: 1 }
    ]),
    updateGiveawayWinner
);

// Manual Winner Selection (Admin)
router.route("/:giveawayId/select-winner").post(selectManualWinner);
router.route("/:giveawayId/eligible-users").get(getEligibleUsersForGiveaway);

// Developer/Admin Utilities
router.route("/:giveawayId/prize-details").get(getGiveawayPrizeDetails);

export default router;
