# 🎁 Giveaway System API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Frontend Integration Examples](#frontend-integration-examples)
- [Common Use Cases](#common-use-cases)
- [Error Handling](#error-handling)

## Overview

The Giveaway System allows admins to create promotional giveaways where users can win prizes based on their purchase history. The system includes eligibility checking, manual/automatic winner selection, and comprehensive prize management.

### Key Features
- 🎯 **Eligibility-based giveaways** (purchase history, amount spent, specific products)
- 🎲 **Random draws** with automatic winner selection
- 👑 **Manual winner selection** by admins
- 📊 **Comprehensive analytics** and prize tracking
- 🔄 **Winner management** (replace, remove, update prizes)
- 📱 **Public giveaway viewing** for users

## Authentication

All admin endpoints require JWT authentication with admin role:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

## Data Models

### Giveaway Object
```javascript
{
  "_id": "giveaway_id",
  "title": "Summer Mega Giveaway",
  "description": "Win amazing prizes by purchasing our products!",
  "image": "https://cloudinary.com/image.jpg", // Optional
  "prizes": [
    {
      "name": "Smartphone",
      "description": "A brand new flagship smartphone",
      "value": 1200,
      "quantity": 1,
      "image": "prize_image_url" // Optional
    }
  ],
  "eligibilityCriteria": {
    "minPurchases": 1,
    "minAmountSpent": 50,
    "eligibleProducts": ["product_id_1", "product_id_2"],
    "purchaseStartDate": "2025-08-05T00:00:00.000Z",
    "purchaseEndDate": "2025-08-09T23:59:59.000Z"
  },
  "startDate": "2025-08-01T00:00:00.000Z",
  "endDate": "2025-08-09T00:00:00.000Z",
  "drawDate": "2025-08-09T08:00:00.000Z",
  "status": "draft|active|completed|cancelled",
  "drawCompleted": false,
  "createdBy": "admin_user_id",
  "createdAt": "2025-08-09T...",
  "updatedAt": "2025-08-09T..."
}
```

### Winner Object
```javascript
{
  "_id": "winner_id",
  "giveawayId": "giveaway_id",
  "userId": {
    "_id": "user_id",
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "prizeWon": {
    "name": "Smartphone",
    "description": "A brand new flagship smartphone",
    "value": 1200,
    "image": "prize_image_url"
  },
  "contactInfo": {
    "phone": "+1234567890"
  },
  "deliveryStatus": "pending|contacted|shipped|delivered",
  "notes": "Additional notes",
  "wonAt": "2025-08-09T...",
  "createdAt": "2025-08-09T..."
}
```

## API Endpoints

### 🎯 Giveaway Management (Admin Only)

#### Create Giveaway
```http
POST /api/v1/giveaways/create
Content-Type: multipart/form-data (if uploading image)
Authorization: Bearer TOKEN
```

**Body (JSON or FormData):**
```javascript
{
  "title": "Summer Mega Giveaway",
  "description": "Win amazing prizes!",
  "prizes": [
    {
      "name": "Smartphone",
      "description": "Brand new flagship smartphone",
      "value": 1200,
      "quantity": 1
    }
  ],
  "eligibilityCriteria": {
    "minPurchases": 1,
    "minAmountSpent": 50,
    "eligibleProducts": ["product_id_1", "product_id_2"],
    "purchaseStartDate": "2025-08-05T00:00:00.000Z",
    "purchaseEndDate": "2025-08-09T23:59:59.000Z"
  },
  "startDate": "2025-08-01T00:00:00.000Z",
  "endDate": "2025-08-09T00:00:00.000Z",
  "drawDate": "2025-08-09T08:00:00.000Z",
  "status": "draft"
}
// Optional: image file for giveaway banner
```

#### Get All Giveaways
```http
GET /api/v1/giveaways?page=1&limit=10&status=active&sortBy=createdAt&sortOrder=desc
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10, max: 100)
- `status` (optional): Filter by status (`draft`, `active`, `completed`, `cancelled`)
- `sortBy` (optional): Sort field (`createdAt`, `title`, `drawDate`, `status`)
- `sortOrder` (optional): Sort direction (`asc`, `desc`, default: `desc`)

**Response Example:**
```javascript
{
  "statusCode": 200,
  "data": {
    "giveaways": [
      {
        "_id": "giveaway_id",
        "title": "Summer Mega Giveaway",
        "description": "Win amazing prizes!",
        "image": "https://cloudinary.com/image.jpg",
        "status": "active",
        "drawCompleted": false,
        "totalPrizes": 3,
        "totalWinners": 2,
        "startDate": "2025-08-01T00:00:00.000Z",
        "endDate": "2025-08-31T23:59:59.000Z",
        "drawDate": "2025-09-01T12:00:00.000Z",
        "createdAt": "2025-07-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalGiveaways": 47,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Giveaways retrieved successfully"
}
```

#### Get Giveaway by ID
```http
GET /api/v1/giveaways/:giveawayId
Authorization: Bearer TOKEN
```

#### Update Giveaway Status
```http
PATCH /api/v1/giveaways/:giveawayId/status
Authorization: Bearer TOKEN

{
  "status": "active|draft|completed|cancelled"
}
```

#### Delete Giveaway
```http
DELETE /api/v1/giveaways/:giveawayId
Authorization: Bearer TOKEN
```

### 🎲 Draw & Winner Management (Admin Only)

#### Run Random Draw
```http
POST /api/v1/giveaways/:giveawayId/draw
Authorization: Bearer TOKEN
```

#### Get Giveaway Winners
```http
GET /api/v1/giveaways/:giveawayId/winners?page=1&limit=10&status=pending
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of winners per page (default: 10, max: 50)
- `status` (optional): Filter by delivery status (`pending`, `contacted`, `shipped`, `delivered`)

**Response Example:**
```javascript
{
  "statusCode": 200,
  "data": {
    "winners": [
      {
        "_id": "winner_id",
        "giveawayId": "giveaway_id",
        "userId": {
          "_id": "user_id",
          "name": "John Doe",
          "phone": "+1234567890",
          "email": "john@example.com"
        },
        "prizeWon": {
          "name": "iPhone 15",
          "description": "Latest flagship smartphone",
          "value": 999,
          "image": "prize_image_url"
        },
        "contactInfo": {
          "phone": "+1234567890",
          "email": "john@example.com"
        },
        "deliveryStatus": "pending",
        "notes": "Winner needs to be contacted",
        "wonAt": "2025-08-15T12:30:00.000Z",
        "createdAt": "2025-08-15T12:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalWinners": 15,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "statusSummary": {
      "pending": 8,
      "contacted": 4,
      "shipped": 2,
      "delivered": 1
    }
  },
  "message": "Winners retrieved successfully"
}
```

#### Manual Winner Selection
```http
POST /api/v1/giveaways/:giveawayId/select-winner
Authorization: Bearer TOKEN

{
  "userId": "user_id_to_select",
  "prizeIndex": 0, // Index from giveaway prizes array (0-based)
  "skipEligibilityCheck": false // Optional: true to override eligibility
}
```

**Response Example:**
```javascript
{
  "statusCode": 200,
  "data": {
    "winner": {
      "_id": "winner_id",
      "giveawayId": "giveaway_id",
      "userId": {
        "_id": "user_id",
        "name": "John Doe",
        "phone": "+1234567890",
        "email": "john@example.com"
      },
      "prizeWon": {
        "name": "iPhone 15",
        "description": "Latest flagship smartphone",
        "value": 999,
        "image": "prize_image_url"
      },
      "contactInfo": {
        "phone": "+1234567890",
        "email": "john@example.com"
      },
      "deliveryStatus": "pending",
      "wonAt": "2025-08-15T12:30:00.000Z"
    },
    "prizeAllocation": {
      "prizeName": "iPhone 15",
      "totalSlots": 2,
      "allocatedSlots": 1,
      "remainingSlots": 1
    }
  },
  "message": "Winner selected successfully"
}
```

#### Get Eligible Users for Giveaway
```http
GET /api/v1/giveaways/:giveawayId/eligible-users?page=1&limit=20&search=John
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of users per page (default: 20, max: 100)
- `search` (optional): Search users by name or phone number

**Response Example:**
```javascript
{
  "statusCode": 200,
  "data": {
    "eligibleUsers": [
      {
        "_id": "user_id",
        "name": "John Doe",
        "phone": "+1234567890",
        "email": "john@example.com",
        "purchaseStats": {
          "totalPurchases": 5,
          "totalAmountSpent": 250.75,
          "eligiblePurchases": 3,
          "firstEligiblePurchase": "2025-08-05T14:30:00.000Z",
          "lastEligiblePurchase": "2025-08-20T16:45:00.000Z"
        },
        "alreadyWon": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalEligibleUsers": 156,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "giveawayInfo": {
      "title": "Summer Mega Giveaway",
      "eligibilityCriteria": {
        "minPurchases": 1,
        "minAmountSpent": 50,
        "eligibleProducts": ["product_id_1", "product_id_2"],
        "purchaseStartDate": "2025-08-05T00:00:00.000Z",
        "purchaseEndDate": "2025-08-31T23:59:59.000Z"
      }
    }
  },
  "message": "Eligible users retrieved successfully"
}
```

### 👑 Winner Management (Admin Only)

#### Update Winner Status
```http
PATCH /api/v1/giveaways/winners/:winnerId
Authorization: Bearer TOKEN

{
  "deliveryStatus": "contacted|shipped|delivered",
  "contactInfo": {
    "phone": "+1234567890",
    "email": "winner@email.com"
  },
  "notes": "Contacted winner on phone"
}
```

#### Replace Winner
```http
POST /api/v1/giveaways/winners/:winnerId/replace
Authorization: Bearer TOKEN
```

#### Update Winner Prize
```http
PATCH /api/v1/giveaways/winners/:winnerId/prize
Authorization: Bearer TOKEN

// Option 1: Use existing giveaway prize
{
  "prizeIndex": 1
}

// Option 2: Use custom prize
{
  "prizeWon": {
    "name": "Custom Prize",
    "description": "Special custom prize",
    "value": 500,
    "image": "custom_image_url"
  }
}
```

#### Remove Winner
```http
DELETE /api/v1/giveaways/winners/:winnerId/remove
Authorization: Bearer TOKEN
```

### 📊 Analytics & Details (Admin/Developer)

#### Get Prize Details
```http
GET /api/v1/giveaways/:giveawayId/prize-details
Authorization: Bearer TOKEN
```

**Response Example:**
```javascript
{
  "statusCode": 200,
  "data": {
    "giveaway": {
      "id": "giveaway_id",
      "title": "Summer Mega Giveaway",
      "description": "Win amazing prizes!",
      "status": "active",
      "drawCompleted": false,
      "startDate": "2025-08-01T00:00:00.000Z",
      "endDate": "2025-08-31T23:59:59.000Z",
      "drawDate": "2025-09-01T12:00:00.000Z"
    },
    "prizeDetails": [
      {
        "index": 0,
        "prize": {
          "name": "iPhone 15",
          "description": "Latest flagship smartphone",
          "value": 999,
          "image": "prize_image_url",
          "totalQuantity": 2
        },
        "allocation": {
          "totalAllocated": 1,
          "remainingSlots": 1,
          "allocationPercentage": "50.00"
        },
        "winners": [
          {
            "winnerId": "winner_id",
            "user": {
              "id": "user_id",
              "name": "John Doe",
              "phone": "+1234567890"
            },
            "wonAt": "2025-08-15T12:30:00.000Z",
            "deliveryStatus": "contacted",
            "notes": "Winner contacted via phone"
          }
        ],
        "deliveryStatus": {
          "pending": 0,
          "contacted": 1,
          "shipped": 0,
          "delivered": 0
        }
      }
    ],
    "summary": {
      "totalPrizes": 3,
      "totalPossibleWinners": 5,
      "totalActualWinners": 2,
      "remainingSlots": 3,
      "completionPercentage": "40.00",
      "totalPrizeValue": 2500,
      "totalAllocatedValue": 1200,
      "remainingPrizeValue": 1300
    }
  },
  "message": "Prize details retrieved successfully"
}
```

**Response includes:**
- Complete prize breakdown per prize type with allocation statistics
- Individual winner details with delivery tracking
- Delivery status distribution (pending, contacted, shipped, delivered)
- Comprehensive financial overview and completion analytics
- Remaining slot availability for each prize type

### 🌐 Public Endpoints

#### Get Active Giveaways
```http
GET /api/v1/giveaways/active
```

## Frontend Integration Examples

### React Hook for Giveaway Management
```javascript
import { useState, useEffect } from 'react';

const useGiveaways = () => {
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createGiveaway = async (giveawayData, imageFile = null) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add giveaway data
      Object.keys(giveawayData).forEach(key => {
        if (key === 'prizes' || key === 'eligibilityCriteria') {
          formData.append(key, JSON.stringify(giveawayData[key]));
        } else {
          formData.append(key, giveawayData[key]);
        }
      });
      
      // Add image if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('/api/v1/giveaways/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.statusCode === 201) {
        setGiveaways(prev => [result.data, ...prev]);
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchGiveaways = async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/v1/giveaways?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.statusCode === 200) {
        setGiveaways(result.data.giveaways);
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectManualWinner = async (giveawayId, userId, prizeIndex, skipEligibility = false) => {
    try {
      const response = await fetch(`/api/v1/giveaways/${giveawayId}/select-winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          prizeIndex,
          skipEligibilityCheck: skipEligibility
        })
      });

      const result = await response.json();
      
      if (result.statusCode === 200) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const fetchEligibleUsers = async (giveawayId, filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/v1/giveaways/${giveawayId}/eligible-users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.statusCode === 200) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const fetchPrizeDetails = async (giveawayId) => {
    try {
      const response = await fetch(`/api/v1/giveaways/${giveawayId}/prize-details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.statusCode === 200) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateWinnerStatus = async (winnerId, updateData) => {
    try {
      const response = await fetch(`/api/v1/giveaways/winners/${winnerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (result.statusCode === 200) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    giveaways,
    loading,
    error,
    createGiveaway,
    fetchGiveaways,
    selectManualWinner,
    fetchEligibleUsers,
    fetchPrizeDetails,
    updateWinnerStatus
  };
};

export default useGiveaways;
```

### React Component Example
```javascript
import React, { useState, useEffect } from 'react';
import useGiveaways from './hooks/useGiveaways';

const GiveawayManager = () => {
  const { giveaways, loading, createGiveaway, fetchGiveaways } = useGiveaways();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prizes: [{ name: '', description: '', value: 0, quantity: 1 }],
    eligibilityCriteria: {
      minPurchases: 1,
      minAmountSpent: 0,
      eligibleProducts: [],
      purchaseStartDate: '',
      purchaseEndDate: ''
    },
    startDate: '',
    endDate: '',
    drawDate: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchGiveaways();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createGiveaway(formData);
    
    if (result.success) {
      alert('Giveaway created successfully!');
      // Reset form or redirect
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const addPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { name: '', description: '', value: 0, quantity: 1 }]
    }));
  };

  return (
    <div className="giveaway-manager">
      <h2>Create Giveaway</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Giveaway Title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
        
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />

        <div className="prizes-section">
          <h3>Prizes</h3>
          {formData.prizes.map((prize, index) => (
            <div key={index} className="prize-form">
              <input
                type="text"
                placeholder="Prize Name"
                value={prize.name}
                onChange={(e) => {
                  const newPrizes = [...formData.prizes];
                  newPrizes[index].name = e.target.value;
                  setFormData(prev => ({ ...prev, prizes: newPrizes }));
                }}
                required
              />
              <input
                type="number"
                placeholder="Value"
                value={prize.value}
                onChange={(e) => {
                  const newPrizes = [...formData.prizes];
                  newPrizes[index].value = Number(e.target.value);
                  setFormData(prev => ({ ...prev, prizes: newPrizes }));
                }}
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={prize.quantity}
                min="1"
                onChange={(e) => {
                  const newPrizes = [...formData.prizes];
                  newPrizes[index].quantity = Number(e.target.value);
                  setFormData(prev => ({ ...prev, prizes: newPrizes }));
                }}
                required
              />
            </div>
          ))}
          <button type="button" onClick={addPrize}>Add Prize</button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Giveaway'}
        </button>
      </form>

      <div className="giveaways-list">
        <h3>Existing Giveaways</h3>
        {giveaways.map(giveaway => (
          <div key={giveaway._id} className="giveaway-card">
            <h4>{giveaway.title}</h4>
            <p>Status: {giveaway.status}</p>
            <p>Prizes: {giveaway.prizes.length}</p>
            <p>Draw Date: {new Date(giveaway.drawDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GiveawayManager;
```

## Common Use Cases

### 1. Create a Multi-Prize Giveaway
```javascript
const giveawayData = {
  title: "Summer Sale Mega Giveaway",
  description: "Win amazing tech prizes by shopping with us!",
  prizes: [
    { 
      name: "iPhone 15 Pro", 
      description: "Latest flagship iPhone with Pro features", 
      value: 1199, 
      quantity: 1 
    },
    { 
      name: "AirPods Pro", 
      description: "Noise-cancelling wireless earbuds", 
      value: 249, 
      quantity: 3 
    },
    { 
      name: "Apple Watch Series 9", 
      description: "Advanced smartwatch with health tracking", 
      value: 399, 
      quantity: 2 
    }
  ],
  eligibilityCriteria: {
    minPurchases: 2,
    minAmountSpent: 150,
    eligibleProducts: ["product1_id", "product2_id", "product3_id"],
    purchaseStartDate: "2025-08-01T00:00:00.000Z",
    purchaseEndDate: "2025-08-31T23:59:59.000Z"
  },
  startDate: "2025-08-01T00:00:00.000Z",
  endDate: "2025-08-31T23:59:59.000Z",
  drawDate: "2025-09-01T12:00:00.000Z",
  status: "active"
};

const result = await createGiveaway(giveawayData, imageFile);
```

### 2. Manual Winner Selection Workflow
```javascript
// Step 1: Get eligible users for the giveaway
const { data: eligibleData } = await fetchEligibleUsers(giveawayId, {
  page: 1,
  limit: 50,
  search: "John"
});

// Step 2: Select a user as winner for specific prize
const { data: winnerData } = await selectManualWinner(
  giveawayId, 
  eligibleData.eligibleUsers[0]._id, // Selected user ID
  0, // Prize index (iPhone 15 Pro)
  false // Don't skip eligibility check
);

// Step 3: Update winner's delivery status
const { data: updatedWinner } = await updateWinnerStatus(winnerData.winner._id, {
  deliveryStatus: "contacted",
  contactInfo: {
    phone: "+1234567890",
    email: "winner@email.com"
  },
  notes: "Winner contacted successfully, confirmed shipping address"
});
```

### 3. Prize Analytics and Management
```javascript
// Get comprehensive prize details
const { data: prizeDetails } = await fetchPrizeDetails(giveawayId);

// Analyze completion status
const summary = prizeDetails.summary;
console.log(`Giveaway completion: ${summary.completionPercentage}%`);
console.log(`Remaining slots: ${summary.remainingSlots}`);
console.log(`Total value allocated: $${summary.totalAllocatedValue}`);

// Check individual prize allocation
prizeDetails.prizeDetails.forEach((prize, index) => {
  console.log(`${prize.prize.name}: ${prize.allocation.totalAllocated}/${prize.prize.totalQuantity} allocated`);
  console.log(`Delivery status breakdown:`, prize.deliveryStatus);
});
```

### 4. Update Winner Prize to Custom Prize
```javascript
// Change winner's prize to a custom one
const customPrizeUpdate = await updateWinnerPrize(winnerId, {
  prizeWon: {
    name: "Special Bonus Prize",
    description: "Exclusive bonus for loyal customer",
    value: 500,
    image: "custom_prize_image_url"
  }
});
```

### 5. Batch Winner Management
```javascript
// Get all pending winners and update their status
const { data: winnersData } = await fetchGiveawayWinners(giveawayId, {
  status: "pending",
  limit: 50
});

// Update multiple winners in batch
const updatePromises = winnersData.winners.map(winner => 
  updateWinnerStatus(winner._id, {
    deliveryStatus: "contacted",
    notes: "Batch contact update"
  })
);

const results = await Promise.all(updatePromises);
console.log(`Updated ${results.length} winners`);
```

### 6. Real-time Giveaway Monitoring
```javascript
// Monitor giveaway progress
const monitorGiveaway = async (giveawayId) => {
  const { data: details } = await fetchPrizeDetails(giveawayId);
  
  return {
    totalProgress: details.summary.completionPercentage,
    prizeBreakdown: details.prizeDetails.map(p => ({
      name: p.prize.name,
      allocated: p.allocation.totalAllocated,
      total: p.prize.totalQuantity,
      percentage: p.allocation.allocationPercentage
    })),
    deliveryStatus: {
      pending: details.prizeDetails.reduce((sum, p) => sum + p.deliveryStatus.pending, 0),
      contacted: details.prizeDetails.reduce((sum, p) => sum + p.deliveryStatus.contacted, 0),
      shipped: details.prizeDetails.reduce((sum, p) => sum + p.deliveryStatus.shipped, 0),
      delivered: details.prizeDetails.reduce((sum, p) => sum + p.deliveryStatus.delivered, 0)
    }
  };
};

// Use in dashboard
const progress = await monitorGiveaway("giveaway_id");
```

## Error Handling

All API responses follow this format:
```javascript
// Success
{
  "statusCode": 200,
  "data": { /* response data */ },
  "message": "Operation successful"
}

// Error
{
  "statusCode": 400,
  "data": null,
  "message": "Error description"
}
```

### Common Error Codes
- **400**: Bad Request (validation errors, invalid data)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (giveaway/winner/user not found)
- **500**: Internal Server Error

### Frontend Error Handling Example
```javascript
const handleApiCall = async (apiFunction) => {
  try {
    const result = await apiFunction();
    
    if (result.statusCode >= 400) {
      throw new Error(result.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Handle different error types
    if (error.message.includes('Unauthorized')) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.message.includes('not found')) {
      // Show not found message
      alert('Resource not found');
    } else {
      // Show generic error
      alert(`Error: ${error.message}`);
    }
    
    throw error;
  }
};
```

## Integration Tips for Copilot

### 🔧 Advanced Features
1. **Smart Eligibility Checking**: The system automatically validates user eligibility based on purchase history, spending thresholds, and specific product requirements
2. **Prize Slot Management**: Automatic tracking of prize quantities with real-time slot availability
3. **Flexible Winner Selection**: Both random draws and manual admin selection with eligibility override options
4. **Comprehensive Analytics**: Detailed prize allocation statistics, delivery tracking, and financial overviews
5. **Winner Lifecycle Management**: Complete flow from selection to delivery with status tracking

### 🛠️ Technical Implementation
1. **Use TypeScript**: Define interfaces for better type safety and development experience
2. **State Management**: Consider using Redux/Zustand for complex giveaway state management
3. **Form Validation**: Use libraries like Formik/react-hook-form with Yup for robust form validation
4. **Date Handling**: Use date-fns or moment.js for date operations and timezone handling
5. **Image Upload**: Handle file uploads with proper previews and validation
6. **Real-time Updates**: Consider WebSockets for live giveaway updates and winner notifications
7. **Caching**: Implement proper caching strategy with React Query or SWR for better performance
8. **Error Boundaries**: Implement error boundaries for graceful error handling in UI components

### 📊 Performance Optimization
1. **Pagination**: Always use pagination for large datasets (users, winners, giveaways)
2. **Lazy Loading**: Implement lazy loading for prize images and giveaway banners
3. **Debounced Search**: Use debouncing for search functionality to reduce API calls
4. **Memoization**: Use React.memo and useMemo for expensive computations
5. **Virtual Scrolling**: For large lists of eligible users or winners

### 🔐 Security Best Practices
1. **JWT Token Management**: Implement proper token refresh and expiration handling
2. **Role-based Access**: Ensure admin-only endpoints are properly protected in the frontend
3. **Input Validation**: Always validate user inputs before sending to API
4. **HTTPS Only**: Ensure all API calls are made over HTTPS in production
5. **Rate Limiting**: Implement client-side rate limiting for sensitive operations

### 🎨 UI/UX Recommendations
1. **Real-time Progress**: Show live giveaway progress with animated progress bars
2. **Interactive Prize Cards**: Create engaging prize displays with hover effects
3. **Winner Celebration**: Implement confetti or celebration animations for winners
4. **Status Indicators**: Use color-coded status badges for delivery tracking
5. **Mobile Responsive**: Ensure all components work seamlessly on mobile devices
6. **Accessibility**: Follow WCAG guidelines for accessibility compliance

### 📱 Example TypeScript Interfaces
```typescript
interface Giveaway {
  _id: string;
  title: string;
  description: string;
  image?: string;
  prizes: Prize[];
  eligibilityCriteria: EligibilityCriteria;
  startDate: string;
  endDate: string;
  drawDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  drawCompleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Prize {
  name: string;
  description: string;
  value: number;
  quantity: number;
  image?: string;
}

interface EligibilityCriteria {
  minPurchases: number;
  minAmountSpent: number;
  eligibleProducts: string[];
  purchaseStartDate: string;
  purchaseEndDate: string;
}

interface Winner {
  _id: string;
  giveawayId: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
  };
  prizeWon: Prize;
  contactInfo: {
    phone: string;
    email?: string;
  };
  deliveryStatus: 'pending' | 'contacted' | 'shipped' | 'delivered';
  notes?: string;
  wonAt: string;
  createdAt: string;
}
```

---

This documentation provides everything needed for frontend integration. Copy this to Copilot and ask it to help build the giveaway management interface! 🚀
