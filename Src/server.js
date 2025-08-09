import connectDB from './Database/index.js';
import dotenv from 'dotenv';
import { app } from './app.js';

// Load environment variables
dotenv.config();

// Debug environment variables in development
if (process.env.NODE_ENV === 'development') {
    console.log('Environment variables loaded:');
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING');
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');
    console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'SET' : 'MISSING');
    console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? 'SET' : 'MISSING');
}

// Connect to MongoDB
connectDB()
.then(() => {
    app.on('error', (error) => {
        console.log("Error in listening the app:", error);
    });
    
    // Only start the server if not in Vercel environment
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📱 Local development: http://localhost:${PORT}`);
        });
    }
})
.catch((error) => {
    console.log('❌ Error connecting to MongoDB:', error);
});

// Export app for Vercel
export default app;

