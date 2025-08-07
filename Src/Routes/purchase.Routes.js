import express from 'express';
import { verifyJWT } from '../Middlewares/Auth.middleware.js';
import { requestLogger } from '../Middlewares/reqLog.middleware.js';
import { verifyAdmin } from '../Middlewares/Role.middlewares.js';
import { upload } from '../Middlewares/Multer.middleware.js';
import {
    createPurchase,
    getMyPurchases,
    getPurchaseById,
    uploadPaymentScreenshot,
    getAllPurchases,
    updatePaymentApproval,
    getPurchaseStats
} from '../Controllers/purchase.Controllers.js';

const purchaseRouter = express.Router();

// All purchase routes require authentication
purchaseRouter.use(requestLogger, verifyJWT);

// User routes
purchaseRouter.post("/", createPurchase); // Buy Now functionality
purchaseRouter.get("/my", getMyPurchases); // Get user's purchases
purchaseRouter.get("/:id", getPurchaseById); // Get specific purchase
purchaseRouter.patch("/:id/upload-screenshot", upload.single("paymentScreenshot"), uploadPaymentScreenshot); // Upload payment screenshot

// Admin routes
purchaseRouter.get("/", verifyAdmin, getAllPurchases); // Get all purchases
purchaseRouter.patch("/:id/approve", verifyAdmin, updatePaymentApproval); // Update payment approval
purchaseRouter.get("/admin/stats", verifyAdmin, getPurchaseStats); // Get statistics

export default purchaseRouter;
