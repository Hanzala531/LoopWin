import express from "express";
import {
	createWithdraw,
	getAllWithdraws,
	getWithdrawById,
	updateWithdrawStatus,
	deleteWithdraw
} from "../Controllers/withdraw.controllers.js";
import { verifyJWT } from "../Middlewares/Auth.middleware.js";
import { verifyAdmin } from "../Middlewares/Role.middlewares.js";
import { requestLogger } from "../Middlewares/reqLog.middleware.js";
const router = express.Router();

// Create a new withdrawal request
router.post("/", requestLogger , verifyJWT , createWithdraw);

// Get all withdrawal requests
router.get("/", requestLogger , verifyJWT , verifyAdmin , getAllWithdraws);

// Get a single withdrawal request by ID
router.get("/:id", requestLogger , verifyJWT , verifyAdmin , getWithdrawById);

// Update withdrawal status
router.patch("/:id/status",requestLogger , verifyJWT , verifyAdmin , updateWithdrawStatus);

// Delete a withdrawal request
router.delete("/:id",requestLogger , verifyAdmin , deleteWithdraw);

export default router;
