# Dependencies for Swagger Documentation

## Required NPM Packages

To add Swagger UI to your LoopWin project, install these packages:

```bash
npm install swagger-ui-express yamljs
```

## Package Details:

### swagger-ui-express
- **Purpose:** Serves Swagger UI in Express applications
- **Version:** Latest stable
- **Usage:** Creates interactive API documentation interface

### yamljs
- **Purpose:** Parses YAML files for JavaScript
- **Version:** Latest stable  
- **Usage:** Loads the swagger.yaml file into your Express app

## Installation Command:

```bash
npm install swagger-ui-express yamljs
```

## Optional Development Dependencies:

For enhanced development experience:

```bash
npm install --save-dev swagger-parser swagger-codegen
```

### swagger-parser
- Validates and parses OpenAPI/Swagger documents
- Useful for testing your API specification

### swagger-codegen  
- Generates client SDKs from OpenAPI specifications
- Helps create client libraries for different languages

## Verification:

After installation, your package.json should include:

```json
{
  "dependencies": {
    "swagger-ui-express": "^4.6.3",
    "yamljs": "^0.3.0"
  },
  "devDependencies": {
    "swagger-parser": "^10.0.3",
    "swagger-codegen": "^3.0.34"
  }
}
```

## Setup Steps:

1. Install the packages
2. Copy the code from `swagger-setup.js`
3. Add it to your main `app.js` file
4. Start your server
5. Visit `http://localhost:5000/api-docs`

Your Swagger documentation will be live and interactive!
