# LoopWin Backend - Vercel Deployment Guide

## 🚀 Deployment Steps

### 1. Prepare Environment Variables
Before deploying to Vercel, make sure you have these environment variables set in your Vercel dashboard:

```
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
PORT=8000
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Connect your GitHub repository to Vercel
2. Import your project
3. Set environment variables in the dashboard
4. Deploy

### 3. API Endpoints
Once deployed, your API will be available at:
- Base URL: `https://your-app-name.vercel.app`
- Health Check: `GET /`
- User Registration: `POST /api/v1/users/register`
- User Login: `POST /api/v1/users/login`
- User Logout: `POST /api/v1/users/logout`
- Get All Users: `GET /api/v1/users` (Admin only)
- Get User by ID: `GET /api/v1/users/:id`

### 4. Local Development
```bash
npm run dev
```

### 5. Important Notes
- The app automatically detects Vercel environment and adjusts accordingly
- MongoDB connection is optimized for serverless functions
- Static files are served from the `Public` directory
- CORS is configured for production environments

## 🔧 File Structure for Vercel
```
/
├── api/
│   └── index.js          # Vercel serverless entry point
├── Src/
│   ├── app.js           # Express app configuration
│   ├── server.js        # Local development server
│   └── ...              # Your existing source files
├── vercel.json          # Vercel configuration
├── .vercelignore        # Files to ignore during deployment
└── package.json         # Dependencies and scripts
```
