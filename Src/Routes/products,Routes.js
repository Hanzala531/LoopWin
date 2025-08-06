import express from 'express'
import {verifyJWT} from '../Middlewares/Auth.middleware.js'
import {requestLogger} from '../Middlewares/reqLog.middleware.js'
import {verifyAdmin} from '../Middlewares/Role.middlewares.js'
import {upload} from '../Middlewares/multer.middleware.js'
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
} from '../Controllers/products.Controllers.js'

const productRouter = express.Router()

// Public routes (no authentication required)
// Get all products with pagination and sorting
productRouter.get("/", requestLogger, getAllProducts);

// Search products by name, headline, or description
productRouter.get("/search", requestLogger, searchProducts);

// Get product by ID
productRouter.get("/:id", requestLogger, getProductById);

// Protected routes (authentication required)
// Get current user's products
productRouter.get("/my/products", requestLogger, verifyJWT, getMyProducts);

// Create new product (authenticated users only)
productRouter.post("/", 
    requestLogger, 
    verifyJWT, 
    verifyAdmin,
    upload.single('picture'), 
    createProduct
);

// Update product (only creator or admin can update)
productRouter.put("/:id", 
    requestLogger, 
    verifyJWT, 
    verifyAdmin,
    upload.single('picture'), 
    updateProduct
);

// Delete product (only creator or admin can delete)
productRouter.delete("/:id", 
    requestLogger, 
    verifyJWT, 
    verifyAdmin,
    deleteProduct
);

export default productRouter;