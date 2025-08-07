import express, { urlencoded } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        '/api/v1/purchases',
        '/api/v1/giveaways',
        '/api-docs',
        '/docs'
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

// Load Swagger YAML file
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Swagger UI setup - serve static HTML page
app.get('/api-docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '../Public/swagger-ui.html'));
});

// Serve swagger.yaml file directly (backup route, also available as static file)
app.get('/swagger.yaml', (req, res) => {
  res.setHeader('Content-Type', 'application/x-yaml');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(path.join(__dirname, '../swagger.yaml'));
});

// Alternative endpoint for documentation
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});



// creating user api
import userRouter from "./Routes/user.Routes.js";
app.use("/api/v1/users", userRouter);

// creating products api
import productRouter from "./Routes/products,Routes.js";
app.use("/api/v1/products", productRouter);

// creating purchase api
import purchaseRouter from "./Routes/purchase.Routes.js";
app.use("/api/v1/purchases", purchaseRouter);

// creating giveaway api
import giveawayRouter from "./Routes/giveaway.Routes.js";
app.use("/api/v1/giveaways", giveawayRouter);


export { app };
