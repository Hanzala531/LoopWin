import { Products } from "../Models/products.Models.js";
import { asyncHandler } from "../Utilities/asyncHandler.js";
import { ApiError } from "../Utilities/ApiError.js";
import { ApiResponse } from "../Utilities/ApiResponse.js";
import { uploadOnCloudinary } from "../Utilities/cloudinary.js";

// Get all Products controller
const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        const products = await Products.find()
            .populate('createdBy', 'name phone status')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const totalProducts = await Products.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        if (!products || products.length === 0) {
            return res.status(404).json(
                new ApiResponse(404, null, "No products found in database")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalProducts,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }, "All products fetched successfully")
        );

    } catch (error) {
        console.log("Error in fetching products:", error);
        throw new ApiError(500, "Something went wrong while fetching the products");
    }
});

// Get product by ID controller
const getProductById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ApiError(400, "Product ID is required");
        }

        const product = await Products.findById(id).populate('createdBy', 'name phone status');

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        return res.status(200).json(
            new ApiResponse(200, product, "Product fetched successfully")
        );

    } catch (error) {
        console.log("Error in fetching product by ID:", error);
        throw new ApiError(500, "Something went wrong while fetching the product");
    }
});

// Create new product controller
const createProduct = asyncHandler(async (req, res) => {
    try {
        const { name, headline, description, price } = req.body;

        // Validation
        if (!name || !headline || !description || !price) {
            throw new ApiError(400, "Name, headline, description, and price are required");
        }

        if (price <= 0) {
            throw new ApiError(400, "Price must be greater than 0");
        }

        // Handle image upload
        let pictureUrl = null;
        if (req.file) {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            if (cloudinaryResponse) {
                pictureUrl = cloudinaryResponse.secure_url;
            } else {
                throw new ApiError(500, "Failed to upload image");
            }
        } else {
            throw new ApiError(400, "Product picture is required");
        }

        // Create product with createdBy field
        const product = await Products.create({
            name,
            headline,
            description,
            picture: pictureUrl,
            price,
            createdBy: req.user._id
        });

        // Populate the createdBy field before sending response
        const createdProduct = await Products.findById(product._id).populate('createdBy', 'name phone status');

        return res.status(201).json(
            new ApiResponse(201, createdProduct, "Product created successfully")
        );

    } catch (error) {
        console.log("Error in creating product:", error);
        throw new ApiError(500, "Something went wrong while creating the product");
    }
});

// Update product controller
const updateProduct = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, headline, description, price } = req.body;

        if (!id) {
            throw new ApiError(400, "Product ID is required");
        }

        const product = await Products.findById(id);
        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        // Check if user is authorized to update (admin or product creator)
        if (req.user.status !== 'admin' && product.createdBy.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You are not authorized to update this product");
        }

        // Validate price if provided
        if (price && price <= 0) {
            throw new ApiError(400, "Price must be greater than 0");
        }

        // Handle image upload if new image is provided
        let pictureUrl = product.picture;
        if (req.file) {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            if (cloudinaryResponse) {
                pictureUrl = cloudinaryResponse.secure_url;
            }
        }

        // Update product
        const updatedProduct = await Products.findByIdAndUpdate(
            id,
            {
                ...(name && { name }),
                ...(headline && { headline }),
                ...(description && { description }),
                ...(price && { price }),
                ...(pictureUrl && { picture: pictureUrl })
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name phone status');

        return res.status(200).json(
            new ApiResponse(200, updatedProduct, "Product updated successfully")
        );

    } catch (error) {
        console.log("Error in updating product:", error);
        throw new ApiError(500, "Something went wrong while updating the product");
    }
});

// Delete product controller
const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ApiError(400, "Product ID is required");
        }

        const product = await Products.findById(id);
        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        // Check if user is authorized to delete (admin or product creator)
        if (req.user.status !== 'admin' && product.createdBy.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You are not authorized to delete this product");
        }

        await Products.findByIdAndDelete(id);

        return res.status(200).json(
            new ApiResponse(200, null, "Product deleted successfully")
        );

    } catch (error) {
        console.log("Error in deleting product:", error);
        throw new ApiError(500, "Something went wrong while deleting the product");
    }
});



// Search products controller
const searchProducts = asyncHandler(async (req, res) => {
    try {
        const { q, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

        if (!q) {
            throw new ApiError(400, "Search query is required");
        }

        // Build search filter
        const filter = {
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { headline: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        };

        // Add price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        const products = await Products.find(filter)
            .populate('createdBy', 'name phone status')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const totalProducts = await Products.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        return res.status(200).json(
            new ApiResponse(200, {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalProducts,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                searchQuery: q
            }, "Products search completed successfully")
        );

    } catch (error) {
        console.log("Error in searching products:", error);
        throw new ApiError(500, "Something went wrong while searching products");
    }
});



export {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
};