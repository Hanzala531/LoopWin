import express, { urlencoded } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";

const app = express();

// middlewares - Configure CORS for production
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://your-frontend-domain.vercel.app']
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  })
);

app.options("*", cors());

app.use(
  express.json({
    limit: "30kb",
  })
);

app.use(
  urlencoded({
    extended: true,
    limit: "16kb",
  })
);

// For Vercel, serve static files from Public directory
app.use(express.static("Public"));

app.use(cookieparser());

// Health check endpoint for Vercel
app.get("/", (req, res) => {
  res.json({ 
    message: "LoopWin API is running on Vercel!", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// creating user api
import userRouter from "./Routes/user.Routes.js";
app.use("/api/v1/users", userRouter);

export { app };
