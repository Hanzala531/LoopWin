import { Router } from "express";
import {
    uploadBanner,
    getBanner,
    removeBanner,
    addWinner,
    getWinners,
    updateWinner,
    deleteWinner,
    getLiveParticipantCounts,
    getMainPageData
} from "../Controllers/main.Controllers.js";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { verifyAdmin } from "../Middlewares/Role.middlewares.js";
import { upload } from "../Middlewares/Multer.middleware.js";

const router = Router();

// ==================== PUBLIC ROUTES ====================

// Public Routes
router.route("/").get(getMainPageData);

// Get current banner
router.route("/banner").get(getBanner);

// Get winners
router.route("/winners").get(getWinners);

// Get live participant counts
router.route("/live-counts").get(getLiveParticipantCounts);

// ==================== ADMIN ONLY ROUTES ====================
// All routes below require authentication and admin role
router.use(verifyJWT, verifyAdmin);

// Banner Management
router.route("/banner").post(upload.single("image"), uploadBanner);
router.route("/banner").delete(removeBanner);

// Winner Management
router.route("/winners").post(upload.single("image"), addWinner);
router.route("/winners/:winnerId").patch(upload.single("image"), updateWinner);
router.route("/winners/:winnerId").delete(deleteWinner);

export default router;
