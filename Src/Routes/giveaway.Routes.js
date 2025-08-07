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
    getActiveGiveaways
} from "../Controllers/giveaway.Controllers.js";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { verifyAdmin } from "../Middlewares/Role.middlewares.js";
import { upload } from "../Middlewares/Multer.middleware.js";

const router = Router();

// ==================== PUBLIC ROUTES ====================
// Get active giveaways (no authentication required)
router.route("/active").get(getActiveGiveaways);

// ==================== ADMIN ONLY ROUTES ====================
// All routes below require authentication and admin role
router.use(verifyJWT, verifyAdmin);

// Giveaway Management
router.route("/create").post(upload.single("image"), createGiveaway);
router.route("/").get(getAllGiveaways);
router.route("/:giveawayId").get(getGiveawayById);
router.route("/:giveawayId/status").patch(updateGiveawayStatus);
router.route("/:giveawayId").delete(deleteGiveaway);

// Draw & Winner Management
router.route("/:giveawayId/draw").post(runGiveawayDraw);
router.route("/:giveawayId/winners").get(getGiveawayWinners);
router.route("/winners/:winnerId").patch(updateWinner);
router.route("/winners/:winnerId/replace").post(replaceWinner);
router.route("/winners/:winnerId/prize").patch(updateWinnerPrize);

export default router;
