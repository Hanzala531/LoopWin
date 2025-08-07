import { Products } from "../Models/products.Models.js";
import { Purchase } from "../Models/purchase.Models.js";
import { asyncHandler } from "../Utilities/asyncHandler.js";
import { ApiError } from "../Utilities/ApiError.js";
import { ApiResponse } from "../Utilities/ApiResponse.js";
import { uploadOnCloudinary } from "../Utilities/cloudinary.js";

// Create a new purchase (Buy Now functionality with duplicate prevention)
const createPurchase = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.body;

        // Validate required fields
        if (!productId) {
            return res.json(
                new ApiResponse(400, null, "Product ID is required")
            );
        }

        // Check if product exists
        const product = await Products.findById(productId).populate('createdBy', 'name phone');
        if (!product) {
            return res.json(
                new ApiResponse(404, null, "Product not found")
            );
        }

        // ✅ Check if user has already purchased this product
        const existingPurchase = await Purchase.findOne({
            userId: req.user._id,
            productId: productId
        });

        if (existingPurchase) {
            return res.json(
                new ApiResponse(400, null, "You have already purchased this product")
            );
        }

        // Create purchase with new model structure
        const purchase = await Purchase.create({
            userId: req.user._id,
            productId: productId
        });

        // Populate the created purchase for response
        const populatedPurchase = await Purchase.findById(purchase._id)
            .populate('productId', 'name headline description picture price ');

        return res.status(201).json(
            new ApiResponse(201, populatedPurchase, "Purchase created successfully")
        );

    } catch (error) {
        console.log("Error in creating purchase:", error);
        throw new ApiError(500, "Something went wrong while creating purchase");
    }
});

// Get all purchases for current user (Only completed purchases by default)
const getMyPurchases = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, showAll = false } = req.query;

        // Build filter - by default only show completed purchases
        const filter = { userId: req.user._id };
        
        if (!showAll || showAll === 'false') {
            // Only show fully completed purchases
            filter.userPayment = "payed";
            filter.paymentApproval = "completed";
        }

        // Build sort (latest first)
        const sort = { createdAt: -1 };

        // Calculate pagination
        const skip = (page - 1) * limit;

        const purchases = await Purchase.find(filter)
            .populate('userId', 'name phone')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const totalPurchases = await Purchase.countDocuments(filter);
        const totalPages = Math.ceil(totalPurchases / limit);

        return res.status(200).json(
            new ApiResponse(200, {
                purchases,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalPurchases,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                filter: showAll ? "All purchases" : "Completed purchases only"
            }, showAll ? "All purchases fetched successfully" : "Completed purchases fetched successfully")
        );

    } catch (error) {
        console.log("Error in fetching purchases:", error);
        throw new ApiError(500, "Something went wrong while fetching purchases");
    }
});

// Get purchase by ID
const getPurchaseById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.json(
                new ApiResponse(400, null, "Purchase ID is required")
            );
        }

        const purchase = await Purchase.findById(id)
            .populate('userId', 'name phone')

        if (!purchase) {
            return res.json(
                new ApiResponse(404, null, "Purchase not found")
            );
        }

        // Check if user owns this purchase or is admin
        if (purchase.userId._id.toString() !== req.user._id.toString() && req.user.status !== 'admin') {
            return res.json(
                new ApiResponse(403, null, "You are not authorized to view this purchase")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, purchase, "Purchase fetched successfully")
        );

    } catch (error) {
        console.log("Error in fetching purchase:", error);
        throw new ApiError(500, "Something went wrong while fetching purchase");
    }
});

// Upload payment screenshot (Auto-mark as payed)
const uploadPaymentScreenshot = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.json(
                new ApiResponse(400, null, "Purchase ID is required")
            );
        }

        const purchase = await Purchase.findById(id);
        if (!purchase) {
            return res.json(
                new ApiResponse(404, null, "Purchase not found")
            );
        }

        // Check ownership
        if (purchase.userId.toString() !== req.user._id.toString()) {
            return res.json(
                new ApiResponse(403, null, "You are not authorized to update this purchase")
            );
        }

        // Only allow if payment is pending or in-progress
        if (purchase.userPayment === "payed") {
            return res.json(
                new ApiResponse(400, null, "Payment screenshot already uploaded")
            );
        }

        // Handle screenshot upload
        if (!req.file) {
            return res.json(
                new ApiResponse(400, null, "Payment screenshot is required")
            );
        }

        const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
        if (!cloudinaryResponse) {
            return res.json(
                new ApiResponse(500, null, "Failed to upload payment screenshot")
            );
        }

        // Update purchase with screenshot and automatically mark as payed
        purchase.paymentScreenshot = cloudinaryResponse.secure_url;
        purchase.userPayment = "payed"; // ✅ Auto-mark as payed when screenshot uploaded
        purchase.paymentApproval = "in-progress"; // ✅ Move to admin review
        await purchase.save();

        const updatedPurchase = await Purchase.findById(purchase._id)
            .populate('userId', 'name phone')

        return res.status(200).json(
            new ApiResponse(200, updatedPurchase, "Payment screenshot uploaded and marked as paid. Waiting for admin approval.")
        );

    } catch (error) {
        console.log("Error in uploading payment screenshot:", error);
        throw new ApiError(500, "Something went wrong while uploading payment screenshot");
    }
});

// Get all purchases (Admin only)
const getAllPurchases = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, userPayment, paymentApproval } = req.query;

        // Build filter
        const filter = {};
        if (userPayment) filter.userPayment = userPayment;
        if (paymentApproval) filter.paymentApproval = paymentApproval;

        // Build sort (latest first)
        const sort = { createdAt: -1 };

        // Calculate pagination
        const skip = (page - 1) * limit;

        const purchases = await Purchase.find(filter)
            .populate('userId', 'name phone')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const totalPurchases = await Purchase.countDocuments(filter);
        const totalPages = Math.ceil(totalPurchases / limit);

        // Calculate statistics with proper aggregation
        const stats = await Purchase.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$product.price" },
                    totalPurchases: { $sum: 1 },
                    pendingPayments: {
                        $sum: { $cond: [{ $eq: ["$userPayment", "pending"] }, 1, 0] }
                    },
                    inProgressPayments: {
                        $sum: { $cond: [{ $eq: ["$userPayment", "in-progress"] }, 1, 0] }
                    },
                    payedPurchases: {
                        $sum: { $cond: [{ $eq: ["$userPayment", "payed"] }, 1, 0] }
                    },
                    pendingApprovals: {
                        $sum: { $cond: [{ $eq: ["$paymentApproval", "pending"] }, 1, 0] }
                    },
                    inProgressApprovals: {
                        $sum: { $cond: [{ $eq: ["$paymentApproval", "in-progress"] }, 1, 0] }
                    },
                    completedApprovals: {
                        $sum: { $cond: [{ $eq: ["$paymentApproval", "completed"] }, 1, 0] }
                    }
                }
            }
        ]);

        return res.status(200).json(
            new ApiResponse(200, {
                purchases,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalPurchases,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                stats: stats[0] || {
                    totalRevenue: 0,
                    totalPurchases: 0,
                    pendingPayments: 0,
                    inProgressPayments: 0,
                    payedPurchases: 0,
                    pendingApprovals: 0,
                    inProgressApprovals: 0,
                    completedApprovals: 0
                }
            }, "All purchases fetched successfully")
        );

    } catch (error) {
        console.log("Error in fetching all purchases:", error);
        throw new ApiError(500, "Something went wrong while fetching purchases");
    }
});

// Update payment approval status (Admin only)
const updatePaymentApproval = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentApproval } = req.body;

        if (!id) {
            return res.json(
                new ApiResponse(400, null, "Purchase ID is required")
            );
        }

        if (!paymentApproval) {
            return res.json(
                new ApiResponse(400, null, "Payment approval status is required")
            );
        }

        const validApprovalStatuses = ['pending', 'in-progress', 'completed'];
        if (!validApprovalStatuses.includes(paymentApproval)) {
            return res.json(
                new ApiResponse(400, null, "Invalid payment approval status")
            );
        }

        const purchase = await Purchase.findById(id);
        if (!purchase) {
            return res.json(
                new ApiResponse(404, null, "Purchase not found")
            );
        }

        purchase.paymentApproval = paymentApproval;
        await purchase.save();

        const updatedPurchase = await Purchase.findById(purchase._id)
            .populate('userId', 'name phone')

        return res.status(200).json(
            new ApiResponse(200, updatedPurchase, "Payment approval status updated successfully")
        );

    } catch (error) {
        console.log("Error in updating payment approval:", error);
        throw new ApiError(500, "Something went wrong while updating payment approval");
    }
});

// Get purchase statistics (Admin only)
const getPurchaseStats = asyncHandler(async (req, res) => {
    try {
        // Enhanced stats with product information
        const stats = await Purchase.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $group: {
                    _id: null,
                    totalPurchases: { $sum: 1 },
                    totalRevenue: { $sum: "$product.price" },
                    averageOrderValue: { $avg: "$product.price" },
                    pendingPayments: {
                        $sum: { $cond: [{ $eq: ["$userPayment", "pending"] }, 1, 0] }
                    },
                    inProgressPayments: {
                        $sum: { $cond: [{ $eq: ["$userPayment", "in-progress"] }, 1, 0] }
                    },
                    payedPurchases: {
                        $sum: { $cond: [{ $eq: ["$userPayment", "payed"] }, 1, 0] }
                    },
                    pendingApprovals: {
                        $sum: { $cond: [{ $eq: ["$paymentApproval", "pending"] }, 1, 0] }
                    },
                    inProgressApprovals: {
                        $sum: { $cond: [{ $eq: ["$paymentApproval", "in-progress"] }, 1, 0] }
                    },
                    completedApprovals: {
                        $sum: { $cond: [{ $eq: ["$paymentApproval", "completed"] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get top selling products with proper aggregation
        const topProducts = await Purchase.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $group: {
                    _id: "$productId",
                    productName: { $first: "$product.name" },
                    productPrice: { $first: "$product.price" },
                    totalSold: { $sum: 1 },
                    totalRevenue: { $sum: "$product.price" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        return res.status(200).json(
            new ApiResponse(200, {
                stats: stats[0] || {
                    totalPurchases: 0,
                    totalRevenue: 0,
                    averageOrderValue: 0,
                    pendingPayments: 0,
                    inProgressPayments: 0,
                    payedPurchases: 0,
                    pendingApprovals: 0,
                    inProgressApprovals: 0,
                    completedApprovals: 0
                },
                topProducts
            }, "Purchase statistics fetched successfully")
        );

    } catch (error) {
        console.log("Error in fetching purchase statistics:", error);
        throw new ApiError(500, "Something went wrong while fetching purchase statistics");
    }
});

// ✅ New: Check if user can purchase a product (utility function)
const canUserPurchase = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            throw new ApiError(400, "Product ID is required");
        }

        // Check if product exists
        const product = await Products.findById(productId);
        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        // Check if user has already purchased this product
        const existingPurchase = await Purchase.findOne({
            userId: req.user._id,
            productId: productId
        });

        return res.status(200).json(
            new ApiResponse(200, {
                canPurchase: !existingPurchase,
                alreadyPurchased: !!existingPurchase,
                productId: productId,
                existingPurchase: existingPurchase ? {
                    purchaseId: existingPurchase.purchaseId,
                    userPayment: existingPurchase.userPayment,
                    paymentApproval: existingPurchase.paymentApproval
                } : null
            }, existingPurchase ? "Product already purchased" : "Product can be purchased")
        );

    } catch (error) {
        console.log("Error in checking purchase eligibility:", error);
        throw new ApiError(500, "Something went wrong while checking purchase eligibility");
    }
});

export {
    createPurchase,
    getMyPurchases,
    getPurchaseById,
    uploadPaymentScreenshot,
    getAllPurchases,
    updatePaymentApproval,
    getPurchaseStats,
    canUserPurchase
};