import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configuration of Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  const timerLabel = `uploadTime-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  console.time(timerLabel);
  
  try {
    if (!localFilePath) {
      console.log("No file path provided");
      return null;
    }

    // Debug: Log environment variables (remove in production)
    console.log("Cloudinary Config Check:");
    console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✓" : "✗");
    console.log("API_KEY:", process.env.CLOUDINARY_API_KEY ? "✓" : "✗");
    console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✓" : "✗");

    // Check if Cloudinary credentials are available
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary credentials are missing. Check your .env file");
    }

    // Check if the file exists before uploading
    if (!fs.existsSync(localFilePath)) {
      console.log("File does not exist:", localFilePath);
      return null;
    }

    console.log("Uploading file to Cloudinary:", localFilePath);

    const response = await cloudinary.uploader.upload(localFilePath, { 
      resource_type: "auto",
      folder: "loopwin-products" // Optional: organize uploads in a folder
    });
    
    console.log("File uploaded to Cloudinary successfully:", response.secure_url);

    // Delete the file from the server
    deleteLocalFile(localFilePath);

    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error.message);

    // Delete the file even if upload fails
    deleteLocalFile(localFilePath);

    return null;
  } finally {
    console.timeEnd(timerLabel);
  }
};

const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Local file deleted successfully:", filePath);
    } else {
      console.log("Local file does not exist:", filePath);
    }
  } catch (err) {
    console.error("Error deleting local file:", err);
  }
};

export { uploadOnCloudinary };