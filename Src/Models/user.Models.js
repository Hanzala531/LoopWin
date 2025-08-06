import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { type } from "os";


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
      _username: this.username, // Corrected line
      _email: this.email,
      _fullname: this.fullname, // Make sure fullname is defined in schema
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: `${process.env.ACCESS_TOKEN_EXPIRY}`,
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

