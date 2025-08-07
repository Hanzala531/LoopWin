import express, { urlencoded } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
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

<<<<<<< HEAD
// Swagger UI setup
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "LoopWin API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
  }
}));
=======
// Serve swagger.yaml with proper headers
app.get('/swagger.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(YAML.stringify(swaggerDocument, 4));
});

// Swagger UI setup - generate HTML directly in route
app.get('/api-docs', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LoopWin API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .swagger-ui .topbar { display: none !important; }
    #swagger-ui { max-width: 1200px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '${req.protocol}://${req.get('host')}/swagger.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        tryItOutEnabled: true,
        validatorUrl: null,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        onComplete: function() { console.log('Swagger UI loaded successfully'); },
        onFailure: function(error) { console.error('Swagger UI failed:', error); }
      });
    };
  </script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});
>>>>>>> parent of f34f153 (Implement comprehensive Swagger documentation enhancements: add validation, improve error handling, and optimize routing for Vercel deployment)

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
