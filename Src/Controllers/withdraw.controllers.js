import { Withdraw } from "../Models/withDraw.models.js";
import { ApiResponse } from "../Utilities/ApiResponse.js";
import { ApiError } from "../Utilities/ApiError.js";
import { asyncHandler } from "../Utilities/asyncHandler.js";

// Create a new withdrawal request
const createWithdraw = asyncHandler(async (req, res) => {
	const {  amount, accountTitle, accountNumber, accountType } = req.body;
	if ( !amount || !accountTitle || !accountNumber || !accountType) {
		throw new ApiError(400, "All fields are required");
	}
	const withdraw = await Withdraw.create({
		userId : req.user._id,
		amount,
		status: "inProcess",
		accountTitle,
		accountNumber,
		accountType
	});
	return res.status(201).json(new ApiResponse(201, withdraw, "Withdraw request created successfully"));
});

// Get all withdrawal requests
const getAllWithdraws = asyncHandler(async (req, res) => {
	const withdraws = await Withdraw.find().sort({ createdAt: -1 });
	return res.status(200).json(new ApiResponse(200, withdraws, "All withdraw requests fetched successfully"));
});

// Get a single withdrawal request by ID
const getWithdrawById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const withdraw = await Withdraw.findById(id);
	if (!withdraw) {
		throw new ApiError(404, "Withdraw request not found");
	}
	return res.status(200).json(new ApiResponse(200, withdraw, "Withdraw request fetched successfully"));
});

// Update withdrawal status
const updateWithdrawStatus = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { status } = req.body;
	if (!status || !["pending", "inProcess", "delivered"].includes(status)) {
		throw new ApiError(400, "Invalid status");
	}
	const withdraw = await Withdraw.findByIdAndUpdate(id, { status }, { new: true });
	if (!withdraw) {
		throw new ApiError(404, "Withdraw request not found");
	}

	// If status is Delivered, deduct one third of the amount from user's rewards
	if (status === "delivered") {
		// Import User model here to avoid circular dependency at the top
		const { User } = await import("../Models/user.Models.js");
		const user = await User.findById(withdraw.userId);
		if (user) {
			// Ensure amount is a number
			const withdrawAmount = parseFloat(withdraw.amount);
			if (!isNaN(withdrawAmount)) {
				const deduction = withdrawAmount / 5;
				user.rewards = (user.rewards || 0) - deduction;
				if (user.rewards < 0) user.rewards = 0;
				await user.save();
			}
		}
	}

	return res.status(200).json(new ApiResponse(200, withdraw, "Withdraw status updated successfully"));
});

// Delete a withdrawal request
const deleteWithdraw = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const withdraw = await Withdraw.findByIdAndDelete(id);
	if (!withdraw) {
		throw new ApiError(404, "Withdraw request not found");
	}
	return res.status(200).json(new ApiResponse(200, null, "Withdraw request deleted successfully"));
});

export {
	createWithdraw,
	getAllWithdraws,
	getWithdrawById,
	updateWithdrawStatus,
	deleteWithdraw
};


