# Swagger/OpenAPI Documentation Guide

## 📖 **Comprehensive API Documentation Generated!**

Your LoopWin Giveaway System now has complete Swagger/OpenAPI 3.0 documentation that covers all API endpoints, schemas, and authentication methods.

---

## 📁 **Generated File:**
- ✅ `swagger.yaml` - Complete OpenAPI 3.0 specification

---

## 🚀 **What's Included:**

### **API Information:**
- **Title:** LoopWin Giveaway System API
- **Version:** 1.0.0
- **Description:** Comprehensive API documentation with examples
- **Security:** JWT Bearer token authentication

### **Organized by Tags:**
1. **Authentication** - Login, register, logout endpoints
2. **User Management** - User CRUD operations and admin functions
3. **Product Management** - Product catalog and management
4. **Purchase Management** - Purchase processing and tracking
5. **Giveaway Management** - Giveaway lifecycle management
6. **Draw & Winner Management** - Draw execution and winner operations
7. **Public Endpoints** - Publicly accessible endpoints

### **Complete Coverage:**
- ✅ **All 25+ endpoints** documented with examples
- ✅ **Request/Response schemas** with detailed properties
- ✅ **Authentication requirements** clearly specified
- ✅ **Error responses** with standard HTTP codes
- ✅ **Pagination support** for list endpoints
- ✅ **File upload endpoints** (multipart/form-data)
- ✅ **Query parameters** with validation rules

---

## 🛠 **How to Use Swagger Documentation:**

### **Method 1: Swagger UI (Recommended)**

1. **Install swagger-ui-express:**
   ```bash
   npm install swagger-ui-express yamljs
   ```

2. **Add to your main app.js:**
   ```javascript
   import swaggerUi from 'swagger-ui-express';
   import YAML from 'yamljs';
   
   // Load swagger document
   const swaggerDocument = YAML.load('./swagger.yaml');
   
   // Serve swagger documentation
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
   ```

3. **Access documentation:**
   ```
   http://localhost:5000/api-docs
   ```

### **Method 2: Swagger Editor Online**

1. Copy the content of `swagger.yaml`
2. Go to [Swagger Editor](https://editor.swagger.io/)
3. Paste the YAML content
4. View interactive documentation

### **Method 3: VS Code Extension**

1. Install "Swagger Viewer" extension in VS Code
2. Open `swagger.yaml` file
3. Press `Shift + Alt + P` and select "Preview Swagger"

---

## 📋 **Key Features of the Documentation:**

### **Authentication:**
```yaml
securitySchemes:
  BearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
```

### **Detailed Schemas:**
- **ApiResponse** - Standard response format
- **User, Product, Purchase, Giveaway, Winner** - Complete data models
- **Request/Response schemas** for all operations
- **Error response formats** with examples

### **Example Requests:**
```yaml
example:
  title: "Summer Mega Giveaway 2025"
  description: "Win amazing prizes!"
  prizes: [
    {
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone",
      "value": 120000,
      "quantity": 2
    }
  ]
```

### **Response Examples:**
```yaml
example:
  statusCode: 201
  data: { ... }
  message: "Giveaway created successfully"
  success: true
```

---

## 🎯 **API Endpoints Overview:**

### **Public Endpoints (No Auth Required):**
- `GET /giveaways/active` - Get active giveaways
- `GET /products` - Get all products
- `GET /products/search` - Search products
- `POST /users/register` - Register new user
- `POST /users/login` - User login

### **User Endpoints (Auth Required):**
- `POST /purchases` - Create purchase
- `GET /purchases/my` - Get user's purchases
- `PATCH /purchases/{id}/upload-screenshot` - Upload payment proof

### **Admin Endpoints (Admin Auth Required):**
- **Giveaway Management:** Create, update, delete giveaways
- **Draw Management:** Run draws, manage winners
- **User Management:** View all users, admin operations
- **Purchase Management:** Approve payments, view all purchases

---

## 🔧 **Customization Options:**

### **Server URLs:**
```yaml
servers:
  - url: http://localhost:5000/api/v1
    description: Development server
  - url: https://loopwin-api.vercel.app/api/v1
    description: Production server
```

### **Add New Endpoints:**
1. Define the path in `paths` section
2. Add request/response schemas
3. Include examples and descriptions
4. Tag appropriately for organization

### **Extend Schemas:**
1. Add new properties to existing schemas
2. Create new schemas in `components/schemas`
3. Reference schemas using `$ref`

---

## 📚 **Documentation Standards:**

### **Each Endpoint Includes:**
- **Summary** - Brief description
- **Description** - Detailed explanation
- **Tags** - For organization
- **Parameters** - Path, query, header parameters
- **Request Body** - With schema and examples
- **Responses** - All possible HTTP status codes
- **Security** - Authentication requirements

### **Schema Definitions:**
- **Type validation** (string, number, array, object)
- **Format specifications** (date-time, objectid, binary)
- **Validation rules** (required, minimum, maximum, enum)
- **Examples** for better understanding

---

## 🧪 **Testing with Swagger UI:**

Once you set up Swagger UI, you can:

1. **Explore all endpoints** interactively
2. **Test API calls** directly from the browser
3. **Authenticate** using JWT tokens
4. **View request/response examples**
5. **Validate data formats** before implementation

---

## 🎊 **Benefits of This Documentation:**

1. **Developer Friendly** - Easy to understand and implement
2. **Interactive Testing** - Test APIs without external tools
3. **Auto-Generation** - Can generate client SDKs
4. **Standardized** - Follows OpenAPI 3.0 specifications
5. **Comprehensive** - Covers all aspects of your API
6. **Maintainable** - Easy to update as API evolves

---

## 🚦 **Next Steps:**

1. **Set up Swagger UI** in your Express app
2. **Share documentation** with frontend developers
3. **Use for API testing** and validation
4. **Keep updated** as you add new features
5. **Generate client libraries** if needed

---

**Your API documentation is now professional-grade and ready for production use! 🎉**

This comprehensive documentation will make it easy for developers to understand and integrate with your LoopWin Giveaway System API.
