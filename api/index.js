import connectDB from '../Src/Database/index.js';
import { app } from '../Src/app.js';

// For Vercel, environment variables are handled automatically
// No need to load .env file

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
    throw error;
  }
};

// For Vercel, we export the app as a serverless function
export default async (req, res) => {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};
