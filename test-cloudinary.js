// Simple script to test Cloudinary configuration
import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing Cloudinary Configuration...');
console.log('Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'MISSING');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || 'MISSING');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the configuration
try {
  const result = await cloudinary.api.ping();
  console.log('✅ Cloudinary connection successful:', result);
} catch (error) {
  console.error('❌ Cloudinary connection failed:', error.message);
}
