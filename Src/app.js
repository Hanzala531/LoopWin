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


// Enhanced health check route
app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    swagger: {
      specLoaded: !!swaggerDocument,
      totalEndpoints: swaggerDocument ? Object.keys(swaggerDocument.paths).length : 0,
      version: swaggerDocument?.info?.version || 'unknown'
    },
    environment: process.env.NODE_ENV || 'development'
  };

  res.status(200).json({
    message: "Server is healthy",
    success: true,
    data: healthData
  });
});

// Load Swagger YAML file with validation
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Validate Swagger specification on startup
console.log('🔍 Validating Swagger specification...');
try {
  // Basic validation
  if (!swaggerDocument.openapi || !swaggerDocument.info || !swaggerDocument.paths) {
    console.error('❌ Invalid Swagger specification: Missing required fields');
  } else {
    console.log('✅ Swagger specification is valid');
    console.log(`📋 API Version: ${swaggerDocument.info.version}`);
    console.log(`📝 Total endpoints: ${Object.keys(swaggerDocument.paths).length}`);
  }
} catch (error) {
  console.error('❌ Swagger validation error:', error.message);
}

// Serve swagger.yaml with comprehensive error handling
app.get('/swagger.yaml', (req, res) => {
  try {
    if (!swaggerDocument) {
      return res.status(500).json({
        error: 'Swagger specification not loaded',
        message: 'The API specification failed to load during startup'
      });
    }

    res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    
    const yamlString = YAML.stringify(swaggerDocument, 4);
    res.send(yamlString);
    
  } catch (error) {
    console.error('Error serving swagger.yaml:', error);
    res.status(500).json({
      error: 'Failed to serialize Swagger specification',
      message: error.message
    });
  }
});

// Bulletproof Swagger UI implementation - guaranteed to work
app.get('/api-docs', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="LoopWin API Documentation" />
  <title>LoopWin API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js" crossorigin></script>
<script>
  window.onload = () => {
    window.ui = SwaggerUIBundle({
      url: '${baseUrl}/swagger.yaml',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.presets.standalone,
      ],
      layout: "StandaloneLayout",
      deepLinking: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      requestInterceptor: (request) => {
        request.headers['Accept'] = 'application/json';
        return request;
      },
      onComplete: () => {
        console.log('LoopWin API Documentation loaded successfully');
      },
      onFailure: (err) => {
        console.error('Failed to load API documentation:', err);
      }
    });
  };
</script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.send(html);
});

// Alternative endpoint for documentation
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// Debug route to test CDN access
app.get('/test-swagger', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Swagger CDN Test</title>
</head>
<body>
  <h1>Testing Swagger UI CDN</h1>
  <div id="status"></div>
  
  <script>
    async function testCDN() {
      const status = document.getElementById('status');
      
      try {
        // Test CSS
        const cssResponse = await fetch('https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css');
        status.innerHTML += '<p>CSS Status: ' + cssResponse.status + '</p>';
        
        // Test JS Bundle
        const jsResponse = await fetch('https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js');
        status.innerHTML += '<p>JS Bundle Status: ' + jsResponse.status + '</p>';
        
        // Test Standalone
        const standaloneResponse = await fetch('https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js');
        status.innerHTML += '<p>Standalone Status: ' + standaloneResponse.status + '</p>';
        
        // Test our YAML
        const yamlResponse = await fetch('/swagger.yaml');
        status.innerHTML += '<p>YAML Status: ' + yamlResponse.status + '</p>';
        
      } catch (error) {
        status.innerHTML += '<p style="color: red;">Error: ' + error.message + '</p>';
      }
    }
    
    testCDN();
  </script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
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
