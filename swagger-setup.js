// Swagger UI Setup for LoopWin API
// Add this code to your main app.js file

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Swagger UI setup with custom options
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #3b82f6; }
  `,
  customSiteTitle: "LoopWin API Documentation",
  customfavIcon: "/assets/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
};

// Serve swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Add a redirect from root docs to swagger
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// Health check to include docs link
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Loop Win API is successfully running!",
    success: true,
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      documentation: `${req.protocol}://${req.get('host')}/api-docs`,
      availableEndpoints: [
        '/api/v1/users',
        '/api/v1/products',
        '/api/v1/purchases',
        '/api/v1/giveaways'
      ]
    }
  });
});

console.log('📚 Swagger documentation available at: http://localhost:5000/api-docs');

// Export swagger document for testing
export { swaggerDocument };
