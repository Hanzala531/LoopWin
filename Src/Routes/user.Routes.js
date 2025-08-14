import express from 'express'
import {verifyJWT} from '../Middlewares/Auth.middleware.js'
import {requestLogger} from '../Middlewares/reqLog.middleware.js'
import {verifyAdmin} from '../Middlewares/Role.middlewares.js'
import {
    getAllUsers,
    getUserById,
    getMe,
    registerUser,
    loginUser,
    logoutUser,
    recomputeReferralStats,
        getReferals

} from '../Controllers/user.Controllers.js'

const userRouter = express.Router()


// Route to register a new user
userRouter.post("/register", requestLogger, registerUser);

// Route to login a user
userRouter.post("/login", requestLogger, loginUser);

// Route to logout a user
userRouter.post("/logout", requestLogger, verifyJWT, logoutUser);

// Route to get current user profile
userRouter.get("/me", requestLogger, verifyJWT, getMe);

// Route to get all users (Admin only)
userRouter.get("/", requestLogger, verifyJWT, verifyAdmin, getAllUsers);

// Admin: Recompute referral stats and backfill missing codes
userRouter.get("/admin/recompute-referrals", requestLogger, verifyJWT, verifyAdmin,     getReferals
);

// Route to get user by ID
userRouter.get("/:id", requestLogger, verifyJWT, getUserById);

export default userRouter;