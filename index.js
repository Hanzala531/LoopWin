import connectDB from './Src/Database/index.js';
import dotenv from 'dotenv';
import { app } from './Src/app.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB for Vercel
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await connectDB();
    isConnected = true;
    console.log('✅ MongoDB connected for Vercel deployment');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  }
};

// For Vercel serverless function
export default async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};
