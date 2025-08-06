import connectDB from './Database/index.js';
import dotenv from 'dotenv';
import { app } from './app.js';

// Load environment variables
dotenv.config({
    path: './.env'
});

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

