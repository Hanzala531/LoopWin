import { asyncHandler } from "../Utilities/asyncHandler.js";
import { User } from "../Models/user.Models.js";
import { ApiError } from "../Utilities/ApiError.js";
import { ApiResponse } from "../Utilities/ApiResponse.js";
// Get current authenticated user (profile)
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by verifyJWT middleware and already excludes sensitive fields
  return res.status(200).json(new ApiResponse(200, req.user, "User profile fetched successfully"));
});

// Access and Refresh Tokens
const generateAccessAndRefreshTokens = async (userid) => {
  try {
    const user = await User.findById(userid);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Call the methods on the user instance
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error); // Log the error
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// Get all users for admin
const getAllUsers = asyncHandler (async (req , res ) =>{
    try {
    const users = await User.find({}).select("-password -refreshToken");
    if (!users) {
      return res.json(new ApiResponse(404, "No users found", false));
    }

    return res.json(new ApiResponse(200, users, "Users fetched successfully"));        
    } catch (error) {
    console.log("Error in registering the user:", error);
    throw new ApiError(500, "Something went wrong while registering the user");
    }
});

// Get user by id
const getUserById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -refreshToken");
    if (!user) {
      return res.json(new ApiResponse(404, "User not found", false));
    }

    return res.json(new ApiResponse(200, user, "User fetched successfully"));
  } catch (error) {
    console.log("Error fetching user:", error); // Log the error
    throw new ApiError(500, "Something went wrong while fetching user");
  }
});

// Register User Controller (with referral name stored in referredBy)
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // Required fields check
    if (!name || !phone || !password) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Please provide all required fields", false));
    }

    // Phone validation
    const phoneRegex = /^\+?[0-9]{11,15}$/;
    if (!phoneRegex.test(phone)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Please provide a valid phone number", false));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res
        .status(400)
        .json(new ApiResponse(400, "User with this phone number already exists", false));
    }

    // Prepare new user payload
    const newUserPayload = { name, phone, password };

    // --- Referral Code Handling (case-insensitive) ---
    const providedReferralCode =
      req.body?.referralCode ??
      req.body?.referalCode ??
      req.body?.referealCode ?? // typo support
      req.body?.refCode ??
      req.body?.referral;

    let referrerId = null;
    if (providedReferralCode) {
      const normalizedCode = String(providedReferralCode).trim();
      const referrer = await User.findOne({
        referralCode: { $regex: new RegExp(`^${normalizedCode}$`, "i") }
      });

      if (!referrer) {
        return res
          .status(400)
          .json(new ApiResponse(400, "Invalid referral code", false));
      }

      // Store referrer's name instead of code
      newUserPayload.referredBy = referrer.name;
      referrerId = referrer._id;
    }

    // --- Create New User ---
    const user = await User.create(newUserPayload);

    // --- Increment Referrer Count ---
    if (referrerId) {
      await User.updateOne(
        { _id: referrerId },
        { $inc: { referralCount: 1, rewards: 1 } }
      );
    }

    // Return created user without sensitive data
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    console.error("Error in registering the user:", error);
    throw new ApiError(500, "Something went wrong while registering the user");
  }
});



// Admin: Recompute referral stats and backfill referral codes for all users
const recomputeReferralStats = asyncHandler(async (req, res) => {
  try {
    // 1) Backfill referralCode where missing
    const usersWithoutCode = await User.find({ $or: [{ referralCode: { $exists: false } }, { referralCode: null }, { referralCode: "" }] }).select("_id");
    let backfilled = 0;
    for (const u of usersWithoutCode) {
      // trigger pre-save to set referralCode
      const userDoc = await User.findById(u._id);
      if (userDoc && !userDoc.referralCode) {
        await userDoc.save();
        backfilled += 1;
      }
    }

    // 2) Recompute referralCount and rewards for everyone
    const allUsers = await User.find({}).select("_id referralCode");
    let updated = 0;
    for (const u of allUsers) {
      if (!u.referralCode) continue;
      const count = await User.countDocuments({ referredBy: u.referralCode });
      await User.updateOne({ _id: u._id }, { $set: { referralCount: count, rewards: count } });
      updated += 1;
    }

    return res.json(new ApiResponse(200, { backfilled, updated }, "Referral stats recomputed successfully"));
  } catch (error) {
    console.log("Error recomputing referral stats:", error);
    throw new ApiError(500, "Failed to recompute referral stats");
  }
});

// Login User Controller
const loginUser = asyncHandler (async( req , res ) => {
  try {
    // Destructuring the request body
    const {  phone , password } = req.body;

    // checking if the required fields are provided
    if (!phone || !password) {
      return res.json(new ApiResponse(400, "Please provide all required fields", false));
    }

    const phoneRegex = /^\+?[0-9]{11,15}$/;

    if (!phoneRegex.test(phone)) {
      return res.json(
        new ApiResponse(
          400,
          "Please provide a valid phone number",
          false
        )
      );
    }

    // checking if the user exists
    const user = await User.findOne({ phone: phone } );
    if (!user) {
      return res.json(new ApiResponse(400, "User does not exist", false));
    }

    // checking if the entered password is correct
    const isPasswordValid = await user.isPasswordCorrect(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res.json(new ApiResponse(400, "Invalid password", false));
    }

    // Generating the access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // selecting the fileds not to be sent in the response
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // setting options for the cookie
    const options = {
      httpOnly: true,
      secure : true,
    };

    return res.status(200)
    .cookie ("refreshToken", refreshToken, options)
    .cookie ("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
      }, "User logged in successfully")
    );

  } catch (error) {
    console.log("Error in login user:", error);
    throw new ApiError(500, "Something went wrong while logging in the user");
  }
});


// Logout User Controller
const logoutUser =  asyncHandler ( async (req , res ) => {
  try {
   await User.findByIdAndUpdate(
          req.user._id,
          {
              $unset: {
                  refreshToken: 1 // this removes the field from document
              }
          },
          {
              new: true
          }
      )
    // Clearing the cookies
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).json(
      new ApiResponse(200, "User logged out successfully")
    );

  } catch (error) {
    console.log("Error in logout user:", error);
    throw new ApiError(500, "Something went wrong while logging out the user");
    
  }

  });


  export {
    getAllUsers,
    getUserById,
  getMe,
    registerUser,
    loginUser,
  logoutUser,
  recomputeReferralStats
  }