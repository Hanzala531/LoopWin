import jwt from "jsonwebtoken";
import { ApiError } from "../Utilities/ApiError.js";
import { asyncHandler } from "../Utilities/asyncHandler.js";
import { User } from "../Models/user.Models.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    // 1. Extract token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // If no token, proceed without authentication
    if (!token) {
      req.user = null; // Set user to null for unauthenticated requests
      return next();
    }

    // 2. Verify token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      console.error("🔐 JWT Token Error:", err.message);
      // If token is invalid, proceed without authentication rather than throwing error
      req.user = null;
      return next();
    }

    // 3. Find user by ID (sanitize sensitive data)
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      console.error("🔐 User not found for token");
      req.user = null;
      return next();
    }

    // 4. Attach user to request
    req.user = user;

    // 5. Proceed to next middleware
    next();
  } catch (error) {
    console.error("🔐 JWT Middleware Error:", error.message);
    // For optional auth, proceed without user rather than throwing error
    req.user = null;
    next();
  }
});