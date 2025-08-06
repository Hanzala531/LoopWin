import express, { urlencoded } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";

const app = express();

// middlewares - Configure CORS for production
app.use(
  cors({
    origin: process.env.CORS_ORIGIN === '*' 
      ? true 
      : process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',')
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

// Health check route for debugging
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Loop Win API is successfully running!",
    success: true,
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      availableEndpoints: [
        '/api/v1/users',
        '/api/v1/products',
      ]
    }
  });
});


app.get('/health', (req, res) => {
  res.status(200).json({
    message: "Server is healthy",
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString()
    }
  });
});



// creating user api
import userRouter from "./Routes/user.Routes.js";
app.use("/api/v1/users", userRouter);

// creating products api
import productRouter from "./Routes/products,Routes.js";
app.use("/api/v1/products" , productRouter)

export { app };
