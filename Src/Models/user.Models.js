import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

const userSchema = new mongoose.Schema({
  name : {
    type: String,
    required: true,
    trim: true
  },
    phone : {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    status : {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    password : {
      type : String,
      required: true,
    },
    refreshToken:{
        type : String
    },
    
    // Referral fields
    referralCode: {
      type: String,
      unique: true,
      sparse: true
    },
    referredBy: {
      type: String,
      default: null
    },
    referralCount: {
      type: Number,
      default: 0
    },
    rewards: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  });
  
  
  // Method for hashing password
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
  // Generate referral code before save
  userSchema.pre("save", function (next) {
    if (!this.referralCode) {
      this.referralCode = nanoid(8); // 8-char unique code
    }
    next();
  });
  
  // Method for comparing password
  userSchema.methods.isPasswordCorrect = async function (
    enteredPassword,
    dbPassword
  ) {
    const isValid = await bcrypt.compare(enteredPassword, dbPassword);
    return isValid;
  };
  
  // Method for generating access token
  userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      phone: this.phone,
      status: this.status,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Method for generating refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: `${process.env.REFRESH_TOKEN_EXPIRY}`,
    }
  );
};

export const User = mongoose.model("User", userSchema);

