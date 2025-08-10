import { Router } from "express";
import {
    addBanner,
    getAllBanners,
    getActiveBanners,
    updateBannerStatus,
    deleteBanner,
    getLiveParticipantCounts,
    getMainPageData
} from "../Controllers/main.Controllers.js";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { verifyAdmin } from "../Middlewares/Role.middlewares.js";
import { upload } from "../Middlewares/Multer.middleware.js";

const router = Router();

// ==================== PUBLIC ROUTES ====================
// Get main page data (banners + live counts + recent winners)
router.route("/").get(getMainPageData);

// Get active banners only
router.route("/banners/active").get(getActiveBanners);

// Get live participant counts
router.route("/live-counts").get(getLiveParticipantCounts);

// ==================== ADMIN ONLY ROUTES ====================
// All routes below require authentication and admin role
router.use(verifyJWT, verifyAdmin);

// Banner Management
router.route("/banners").post(upload.single("image"), addBanner);
router.route("/banners").get(getAllBanners);
router.route("/banners/:bannerId/status").patch(updateBannerStatus);
router.route("/banners/:bannerId").delete(deleteBanner);

export default router;
