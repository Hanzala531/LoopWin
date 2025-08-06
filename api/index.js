import connectDB from '../Src/Database/index.js';
import dotenv from 'dotenv';
import { app } from '../Src/app.js';

// Load environment variables
dotenv.config({
    path: '../.env'
});

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

// Initialize database connection
connectToDatabase();

// For Vercel, we export the app as a serverless function
export default async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};
