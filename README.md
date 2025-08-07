# LoopWin API Documentation

## 🚀 Overview

LoopWin is a comprehensive e-commerce backend API with purchase management, giveaway system, and admin panel support. Built with Node.js, Express, MongoDB, and JWT authentication.

**Base URL:** `https://loop-win-backend.vercel.app` (Production)
**Local URL:** `http://localhost:4000` (Development)

## 📋 Table of Contents

- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Admin Panel Guide](#admin-panel-guide)
- [Error Handling](#error-handling)
- [File Upload](#file-upload)
- [Security](#security)

---

## 🔐 Authentication

### JWT Token System
- **Access Token:** 1 day expiry (for API requests)
- **Refresh Token:** 30 days expiry (for token renewal)
- **User Roles:** `admin`, `user`

### Headers Required
```javascript
{
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}
```

### Authentication Flow
1. **Login** → Get access & refresh tokens
2. **Include token** in Authorization header for protected routes
3. **Token expires** → Use refresh token to get new access token
4. **Logout** → Clear tokens from client storage

---

## 📚 API Endpoints

### 🔑 Authentication Endpoints

#### Register User
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "05030789030",
  "password": "password123"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": "User registered successfully",
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "phone": "05030789030",
    "status": "user",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Login User
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "phone": "05030789030",
  "password": "password123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": "User logged in successfully",
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "phone": "05030789030",
    "status": "admin"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

#### Logout User
```http
POST /api/v1/users/logout
Authorization: Bearer <access_token>
```

---

### 👥 User Management (Admin Only)

#### Get All Users
```http
GET /api/v1/users
Authorization: Bearer <access_token>
```

#### Get User by ID
```http
GET /api/v1/users/:id
Authorization: Bearer <access_token>
```

---

### 🛍️ Product Management

#### Get All Products (Public)
```http
GET /api/v1/products?page=1&limit=9&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 9)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: asc/desc (default: desc)

#### Get Product by ID (Public)
```http
GET /api/v1/products/:id
```

#### Search Products (Public)
```http
GET /api/v1/products/search?q=search_term&minPrice=100&maxPrice=500&page=1&limit=10
```

#### Create Product (Admin Only)
```http
POST /api/v1/products/add
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- name: "Product Name"
- headline: "Product Headline"
- description: "Product Description"
- price: 299.99
- productLink: "https://product-link.com"
- picture: <image_file>
```

#### Update Product (Admin Only)
```http
PUT /api/v1/products/:id
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- name: "Updated Product Name"
- headline: "Updated Headline"
- description: "Updated Description"
- price: 399.99
- productLink: "https://updated-link.com"
- picture: <image_file> (optional)
```

#### Delete Product (Admin Only)
```http
DELETE /api/v1/products/:id
Authorization: Bearer <access_token>
```

---

### 🛒 Purchase Management

#### Create Purchase (Authenticated Users)
```http
POST /api/v1/purchases
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "productId": "product_id"
}
```

#### Get My Purchases (Authenticated Users)
```http
GET /api/v1/purchases/my
Authorization: Bearer <access_token>
```

#### Get Purchase by ID (Authenticated Users)
```http
GET /api/v1/purchases/:id
Authorization: Bearer <access_token>
```

#### Upload Payment Screenshot (Authenticated Users)
```http
PATCH /api/v1/purchases/:id/upload-screenshot
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- paymentScreenshot: <image_file>
- transactionId: "TXN123456789"
```

#### Get All Purchases (Admin Only)
```http
GET /api/v1/purchases?page=1&limit=10&userPayment=payed&paymentApproval=pending
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `userPayment`: pending, in-progress, payed
- `paymentApproval`: pending, in-progress, completed

#### Update Payment Approval (Admin Only)
```http
PATCH /api/v1/purchases/:id/approve
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "paymentApproval": "completed"
}
```

#### Get Purchase Statistics (Admin Only)
```http
GET /api/v1/purchases/admin/stats
Authorization: Bearer <access_token>
```

---

### 🎁 Giveaway Management

#### Get Active Giveaways (Public)
```http
GET /api/v1/giveaways/active
```

#### Create Giveaway (Admin Only)
```http
POST /api/v1/giveaways/create
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- title: "New Year Giveaway"
- description: "Win amazing prizes!"
- image: <image_file>
- prizes: JSON array of prize objects
- eligibilityCriteria: JSON object with criteria
- startDate: "2025-01-01T00:00:00.000Z"
- endDate: "2025-01-31T23:59:59.000Z"
```

#### Get All Giveaways (Admin Only)
```http
GET /api/v1/giveaways
Authorization: Bearer <access_token>
```

#### Get Giveaway by ID (Admin Only)
```http
GET /api/v1/giveaways/:giveawayId
Authorization: Bearer <access_token>
```

#### Update Giveaway Status (Admin Only)
```http
PATCH /api/v1/giveaways/:giveawayId/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "active"
}
```

#### Run Giveaway Draw (Admin Only)
```http
POST /api/v1/giveaways/:giveawayId/draw
Authorization: Bearer <access_token>
```

#### Get Giveaway Winners (Admin Only)
```http
GET /api/v1/giveaways/:giveawayId/winners
Authorization: Bearer <access_token>
```

---

## 📊 Data Models

### User Model
```javascript
{
  "_id": "ObjectId",
  "name": "String (required)",
  "phone": "String (unique, required)",
  "status": "admin|user (default: user)",
  "password": "String (hashed)",
  "refreshToken": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Product Model
```javascript
{
  "_id": "ObjectId",
  "createdBy": "ObjectId (ref: User)",
  "name": "String (required)",
  "headline": "String (required)",
  "description": "String (required)",
  "picture": "String (Cloudinary URL)",
  "price": "Number (required)",
  "productLink": "String (required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Purchase Model
```javascript
{
  "_id": "ObjectId",
  "purchaseId": "Number (auto-increment)",
  "userId": "ObjectId (ref: User)",
  "productId": "ObjectId (ref: Products)",
  "paymentScreenshot": "String (Cloudinary URL)",
  "transactionId": "String",
  "userPayment": "pending|in-progress|payed (default: pending)",
  "paymentApproval": "pending|in-progress|completed (default: pending)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Giveaway Model
```javascript
{
  "_id": "ObjectId",
  "title": "String (required)",
  "description": "String (required)",
  "image": "String (Cloudinary URL)",
  "createdBy": "ObjectId (ref: User)",
  "prizes": [
    {
      "name": "String",
      "description": "String",
      "value": "Number",
      "quantity": "Number",
      "image": "String"
    }
  ],
  "eligibilityCriteria": {
    "minPurchases": "Number",
    "minAmountSpent": "Number",
    "purchaseStartDate": "Date",
    "purchaseEndDate": "Date",
    "eligibleProducts": ["ObjectId"]
  },
  "status": "draft|active|completed|cancelled",
  "startDate": "Date",
  "endDate": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 🎛️ Admin Panel Guide

### 🔑 Admin Authentication

#### Login Implementation
```javascript
// utils/auth.js
export const adminLogin = async (credentials) => {
  try {
    const response = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    
    if (result.success && result.user.status === 'admin') {
      localStorage.setItem('admin_token', result.accessToken);
      localStorage.setItem('admin_refresh_token', result.refreshToken);
      return result;
    } else {
      throw new Error('Invalid admin credentials');
    }
  } catch (error) {
    throw error;
  }
};
```

#### Protected Route Component (React)
```javascript
// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    // Verify token with backend
    fetch('/api/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.user.status === 'admin') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    })
    .catch(() => setIsAuthenticated(false));
  }, [token]);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" />;
  
  return children;
};
```

### 📊 Dashboard Implementation

#### Dashboard Stats Component
```javascript
// components/Dashboard.jsx
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/v1/purchases/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>${stats.totalRevenue}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Purchases</h3>
          <p>{stats.totalPurchases}</p>
        </div>
        
        <div className="stat-card">
          <h3>Pending Approvals</h3>
          <p>{stats.pendingApprovals}</p>
        </div>
        
        <div className="stat-card">
          <h3>Completed Orders</h3>
          <p>{stats.completedApprovals}</p>
        </div>
      </div>
    </div>
  );
};
```

### 🛍️ Product Management

#### Product List Component
```javascript
// components/ProductManagement.jsx
import { useState, useEffect } from 'react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/products?page=${currentPage}&limit=10`);
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data.products);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/v1/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        fetchProducts(); // Refresh list
        alert('Product deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  return (
    <div className="product-management">
      <div className="header">
        <h2>Product Management</h2>
        <button onClick={() => window.location.href = '/admin/products/create'}>
          Add New Product
        </button>
      </div>

      {loading ? (
        <div>Loading products...</div>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Created By</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <img src={product.picture} alt={product.name} width="50" />
                  </td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.createdBy?.name}</td>
                  <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => editProduct(product._id)}>Edit</button>
                    <button onClick={() => deleteProduct(product._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="pagination">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 🛒 Purchase Management

#### Purchase Orders Component
```javascript
// components/PurchaseManagement.jsx
import { useState, useEffect } from 'react';

const PurchaseManagement = () => {
  const [purchases, setPurchases] = useState([]);
  const [filters, setFilters] = useState({
    userPayment: '',
    paymentApproval: '',
    page: 1
  });

  useEffect(() => {
    fetchPurchases();
  }, [filters]);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(`/api/v1/purchases?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setPurchases(result.data.purchases);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const updatePaymentApproval = async (purchaseId, status) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/v1/purchases/${purchaseId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentApproval: status })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchPurchases(); // Refresh list
        alert('Payment status updated successfully');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  return (
    <div className="purchase-management">
      <h2>Purchase Management</h2>
      
      {/* Filters */}
      <div className="filters">
        <select 
          value={filters.userPayment}
          onChange={(e) => setFilters({...filters, userPayment: e.target.value})}
        >
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="payed">Payed</option>
        </select>
        
        <select 
          value={filters.paymentApproval}
          onChange={(e) => setFilters({...filters, paymentApproval: e.target.value})}
        >
          <option value="">All Approval Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Purchase List */}
      <div className="purchases-table">
        <table>
          <thead>
            <tr>
              <th>Purchase ID</th>
              <th>User</th>
              <th>Product</th>
              <th>Transaction ID</th>
              <th>Payment Status</th>
              <th>Approval Status</th>
              <th>Screenshot</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(purchase => (
              <tr key={purchase._id}>
                <td>#{purchase.purchaseId}</td>
                <td>{purchase.userId?.name}</td>
                <td>{purchase.productId?.name}</td>
                <td>{purchase.transactionId || 'N/A'}</td>
                <td>
                  <span className={`status ${purchase.userPayment}`}>
                    {purchase.userPayment}
                  </span>
                </td>
                <td>
                  <span className={`status ${purchase.paymentApproval}`}>
                    {purchase.paymentApproval}
                  </span>
                </td>
                <td>
                  {purchase.paymentScreenshot && (
                    <a href={purchase.paymentScreenshot} target="_blank" rel="noopener noreferrer">
                      View Screenshot
                    </a>
                  )}
                </td>
                <td>
                  {purchase.userPayment === 'payed' && purchase.paymentApproval !== 'completed' && (
                    <div className="approval-actions">
                      <button 
                        onClick={() => updatePaymentApproval(purchase._id, 'in-progress')}
                        className="btn-warning"
                      >
                        In Progress
                      </button>
                      <button 
                        onClick={() => updatePaymentApproval(purchase._id, 'completed')}
                        className="btn-success"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

### 👥 User Management

#### User List Component
```javascript
// components/UserManagement.jsx
import { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
      
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`status ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => viewUserDetails(user._id)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
```

---

## ⚠️ Error Handling

### Standard Error Response Format
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error description",
  "success": false
}
```

### Common HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

### Frontend Error Handling
```javascript
// utils/api.js
const handleApiError = (error, response) => {
  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  } else if (response.status === 403) {
    alert('You do not have permission to perform this action');
  } else {
    alert(error.message || 'An unexpected error occurred');
  }
};

const apiCall = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('admin_token');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const result = await response.json();
    
    if (!result.success) {
      handleApiError(result, response);
      throw new Error(result.message);
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

---

## 📁 File Upload

### Supported File Types
- **Images:** JPG, JPEG, PNG, GIF, WebP
- **Max File Size:** 10MB per file
- **Storage:** Cloudinary CDN

### Upload Implementation
```javascript
// File upload utility
const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('picture', file); // or 'paymentScreenshot' for purchases
  
  const token = localStorage.getItem('admin_token');
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData
    },
    body: formData
  });
  
  return response.json();
};

// Usage for product creation
const createProduct = async (productData, imageFile) => {
  const formData = new FormData();
  formData.append('name', productData.name);
  formData.append('headline', productData.headline);
  formData.append('description', productData.description);
  formData.append('price', productData.price);
  formData.append('productLink', productData.productLink);
  formData.append('picture', imageFile);
  
  const token = localStorage.getItem('admin_token');
  
  const response = await fetch('/api/v1/products/add', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

---

## 🔒 Security

### Best Practices

1. **Token Storage**
   - Store tokens in localStorage (for demo) or httpOnly cookies (production)
   - Clear tokens on logout
   - Implement token refresh mechanism

2. **Input Validation**
   - Validate all form inputs on frontend
   - Sanitize user inputs
   - Use proper form validation libraries

3. **File Upload Security**
   - Validate file types and sizes
   - Scan for malware (recommended)
   - Use secure file storage (Cloudinary)

4. **API Security**
   - Always include Authorization header for protected routes
   - Implement request timeout handling
   - Use HTTPS in production

### Environment Variables
```env
# Server Settings
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loopWin
CORS_ORIGIN=*

# JWT Settings
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=30d

# Cloudinary Settings
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Settings (if needed)
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password

# Environment
NODE_ENV=production
```

---

## 🚀 Getting Started

### For Frontend Developers

1. **Setup Authentication**
   - Implement login/logout functionality
   - Store JWT tokens securely
   - Create protected route components

2. **API Integration**
   - Use the provided endpoints
   - Handle errors appropriately
   - Implement loading states

3. **Admin Panel Features**
   - Dashboard with statistics
   - Product management (CRUD)
   - Purchase order management
   - User management
   - Giveaway management

4. **File Upload**
   - Product images
   - Payment screenshots
   - Giveaway images

### Sample Frontend Structure
```
src/
├── components/
│   ├── Dashboard.jsx
│   ├── ProductManagement.jsx
│   ├── PurchaseManagement.jsx
│   ├── UserManagement.jsx
│   ├── GiveawayManagement.jsx
│   └── ProtectedRoute.jsx
├── utils/
│   ├── auth.js
│   ├── api.js
│   └── constants.js
├── hooks/
│   ├── useAuth.js
│   └── useApi.js
└── styles/
    └── admin.css
```

---

## 📞 Support

For any questions or issues:
- Check the error responses for detailed messages
- Verify JWT token validity
- Ensure proper request headers
- Check network connectivity

**Happy Coding! 🚀**
