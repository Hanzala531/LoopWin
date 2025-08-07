import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger validation utility
export const validateSwaggerSpec = () => {
  try {
    const swaggerPath = path.join(__dirname, '../../swagger.yaml');
    const swaggerDocument = YAML.load(swaggerPath);
    
    // Basic validation checks
    const validationErrors = [];
    
    // Check required OpenAPI fields
    if (!swaggerDocument.openapi) {
      validationErrors.push('Missing openapi version field');
    }
    
    if (!swaggerDocument.info) {
      validationErrors.push('Missing info section');
    }
    
    if (!swaggerDocument.paths) {
      validationErrors.push('Missing paths section');
    }
    
    // Check for duplicate paths
    const paths = Object.keys(swaggerDocument.paths || {});
    const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
    if (duplicates.length > 0) {
      validationErrors.push(`Duplicate paths found: ${duplicates.join(', ')}`);
    }
    
    // Validate each path
    for (const [pathKey, pathValue] of Object.entries(swaggerDocument.paths || {})) {
      if (typeof pathValue !== 'object') {
        validationErrors.push(`Invalid path definition for ${pathKey}`);
        continue;
      }
      
      // Check for duplicate HTTP methods
      const methods = Object.keys(pathValue);
      const duplicateMethods = methods.filter((method, index) => methods.indexOf(method) !== index);
      if (duplicateMethods.length > 0) {
        validationErrors.push(`Duplicate methods in ${pathKey}: ${duplicateMethods.join(', ')}`);
      }
    }
    
    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      document: swaggerDocument
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [`YAML parsing error: ${error.message}`],
      document: null
    };
  }
};

// Test Swagger UI assets availability
export const testSwaggerAssets = async () => {
  const assets = [
    'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css',
    'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js'
  ];
  
  const results = [];
  
  for (const asset of assets) {
    try {
      const response = await fetch(asset, { method: 'HEAD' });
      results.push({
        url: asset,
        status: response.status,
        available: response.ok
      });
    } catch (error) {
      results.push({
        url: asset,
        status: 'ERROR',
        available: false,
        error: error.message
      });
    }
  }
  
  return results;
};
