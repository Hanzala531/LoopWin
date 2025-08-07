# Giveaway System API Testing Guide

## Overview
This document provides comprehensive testing guidelines for the LoopWin Giveaway System API. The system includes full CRUD operations for giveaways, automated draw functionality, and winner management.

## Base URL
```
http://localhost:5000/api/v1/giveaways
```

## Authentication
Most endpoints require admin authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. GIVEAWAY MANAGEMENT ENDPOINTS

### 1.1 Create Giveaway (Admin Only)
**POST** `/api/v1/giveaways/create`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
```json
{
    "title": "Summer Mega Giveaway 2025",
    "description": "Win amazing prizes by participating in our summer giveaway!",
    "image": [file upload - optional],
    "prizes": [
        {
            "name": "iPhone 15 Pro",
            "description": "Latest iPhone 15 Pro 256GB",
            "value": 120000,
            "quantity": 2,
            "image": "https://example.com/iphone.jpg"
        },
        {
            "name": "MacBook Air",
            "description": "Apple MacBook Air M2",
            "value": 200000,
            "quantity": 1,
            "image": "https://example.com/macbook.jpg"
        }
    ],
    "eligibilityCriteria": {
        "minPurchases": 2,
        "minAmountSpent": 5000,
        "purchaseStartDate": "2025-01-01T00:00:00.000Z",
        "purchaseEndDate": "2025-08-31T23:59:59.000Z",
        "eligibleProducts": ["product_id_1", "product_id_2"]
    },
    "startDate": "2025-08-10T00:00:00.000Z",
    "endDate": "2025-08-31T23:59:59.000Z",
    "drawDate": "2025-09-01T10:00:00.000Z",
    "status": "draft"
}
```

**Expected Response:**
```json
{
    "statusCode": 201,
    "data": {
        "_id": "giveaway_id",
        "title": "Summer Mega Giveaway 2025",
        "description": "Win amazing prizes...",
        "image": "cloudinary_url",
        "createdBy": {
            "_id": "admin_id",
            "name": "Admin Name",
            "phone": "admin_phone"
        },
        "prizes": [...],
        "eligibilityCriteria": {...},
        "status": "draft",
        "startDate": "2025-08-10T00:00:00.000Z",
        "endDate": "2025-08-31T23:59:59.000Z",
        "drawDate": "2025-09-01T10:00:00.000Z",
        "drawCompleted": false,
        "createdAt": "...",
        "updatedAt": "..."
    },
    "message": "Giveaway created successfully",
    "success": true
}
```

### 1.2 Get All Giveaways (Admin Only)
**GET** `/api/v1/giveaways?status=active&page=1&limit=10&sortBy=createdAt&sortOrder=desc`

**Query Parameters:**
- `status` (optional): draft, active, completed, cancelled
- `active` (optional): true/false - filters currently active giveaways
- `page` (optional): page number (default: 1)
- `limit` (optional): items per page (default: 10)
- `sortBy` (optional): field to sort by (default: createdAt)
- `sortOrder` (optional): asc/desc (default: desc)

### 1.3 Get Single Giveaway (Admin Only)
**GET** `/api/v1/giveaways/:giveawayId`

### 1.4 Update Giveaway Status (Admin Only)
**PATCH** `/api/v1/giveaways/:giveawayId/status`

**Body:**
```json
{
    "status": "active"
}
```

### 1.5 Delete Giveaway (Admin Only)
**DELETE** `/api/v1/giveaways/:giveawayId`

---

## 2. DRAW & WINNER MANAGEMENT ENDPOINTS

### 2.1 Run Giveaway Draw (Admin Only)
**POST** `/api/v1/giveaways/:giveawayId/draw`

**Prerequisites:**
- Giveaway must exist and not have completed draw
- Current date must be >= drawDate
- Must have eligible participants

**Expected Response:**
```json
{
    "statusCode": 200,
    "data": {
        "giveaway": {...},
        "winners": [
            {
                "_id": "winner_id",
                "giveawayId": "giveaway_id",
                "userId": {
                    "_id": "user_id",
                    "name": "Winner Name",
                    "phone": "winner_phone"
                },
                "prizeWon": {
                    "name": "iPhone 15 Pro",
                    "description": "Latest iPhone 15 Pro 256GB",
                    "value": 120000
                },
                "wonAt": "2025-09-01T10:30:00.000Z",
                "deliveryStatus": "pending",
                "contactInfo": {
                    "phone": "winner_phone"
                }
            }
        ],
        "totalWinners": 3,
        "totalEligibleParticipants": 50
    },
    "message": "Draw completed successfully",
    "success": true
}
```

### 2.2 Get Giveaway Winners (Admin Only)
**GET** `/api/v1/giveaways/:giveawayId/winners?status=pending&page=1&limit=10`

**Query Parameters:**
- `status` (optional): pending, contacted, shipped, delivered
- `page`, `limit`, `sortBy`, `sortOrder`: pagination options

### 2.3 Update Winner (Admin Only)
**PATCH** `/api/v1/giveaways/winners/:winnerId`

**Body:**
```json
{
    "deliveryStatus": "contacted",
    "contactInfo": {
        "phone": "03001234567",
        "email": "winner@example.com",
        "address": "123 Main St, City, Country"
    },
    "notes": "Winner contacted via phone on 2025-08-07"
}
```

### 2.4 Replace Winner (Admin Only)
**POST** `/api/v1/giveaways/winners/:winnerId/replace`

**Description:** Removes current winner and selects a new random winner from eligible participants.

**Expected Response:**
```json
{
    "statusCode": 200,
    "data": {
        "oldWinner": {
            "name": "Old Winner Name",
            "phone": "old_winner_phone",
            "prizeWon": {...}
        },
        "newWinner": {
            "_id": "new_winner_id",
            "userId": {...},
            "prizeWon": {...},
            "wonAt": "...",
            "deliveryStatus": "pending"
        }
    },
    "message": "Winner replaced successfully",
    "success": true
}
```

### 2.5 Update Winner Prize (Admin Only)
**PATCH** `/api/v1/giveaways/winners/:winnerId/prize`

**Body:**
```json
{
    "prizeWon": {
        "name": "Samsung Galaxy S24",
        "description": "Samsung Galaxy S24 Ultra 512GB",
        "value": 180000,
        "image": "https://example.com/galaxy.jpg"
    }
}
```

---

## 3. PUBLIC ENDPOINTS

### 3.1 Get Active Giveaways (Public)
**GET** `/api/v1/giveaways/active`

**Description:** Returns currently active giveaways (no authentication required)

**Expected Response:**
```json
{
    "statusCode": 200,
    "data": [
        {
            "_id": "giveaway_id",
            "title": "Summer Mega Giveaway 2025",
            "description": "Win amazing prizes...",
            "image": "cloudinary_url",
            "prizes": [...],
            "eligibilityCriteria": {
                "minPurchases": 2,
                "minAmountSpent": 5000,
                "eligibleProducts": [...]
            },
            "status": "active",
            "startDate": "2025-08-10T00:00:00.000Z",
            "endDate": "2025-08-31T23:59:59.000Z",
            "drawDate": "2025-09-01T10:00:00.000Z"
        }
    ],
    "message": "Active giveaways retrieved successfully",
    "success": true
}
```

---

## 4. TESTING SCENARIOS

### 4.1 Complete Giveaway Flow Test

1. **Create Giveaway:**
   ```bash
   POST /api/v1/giveaways/create
   # Create with draft status
   ```

2. **Activate Giveaway:**
   ```bash
   PATCH /api/v1/giveaways/:id/status
   # Change status to "active"
   ```

3. **Check Public Visibility:**
   ```bash
   GET /api/v1/giveaways/active
   # Should show the giveaway
   ```

4. **Run Draw (after drawDate):**
   ```bash
   POST /api/v1/giveaways/:id/draw
   # Should select winners
   ```

5. **View Winners:**
   ```bash
   GET /api/v1/giveaways/:id/winners
   # Should show selected winners
   ```

6. **Update Winner Status:**
   ```bash
   PATCH /api/v1/giveaways/winners/:winnerId
   # Update delivery status and contact info
   ```

### 4.2 Edge Cases to Test

1. **Invalid Dates:**
   - Start date after end date
   - Draw date before end date
   - Past dates for active giveaways

2. **Prize Validation:**
   - Empty prizes array
   - Invalid prize quantities (< 1)
   - Missing required prize fields

3. **Draw Edge Cases:**
   - No eligible participants
   - Draw already completed
   - Draw before draw date

4. **Winner Management:**
   - Replace winner when no alternatives available
   - Update non-existent winner
   - Invalid delivery status

### 4.3 Error Response Format
All error responses follow this format:
```json
{
    "statusCode": 400,
    "data": null,
    "message": "Detailed error message",
    "success": false
}
```

---

## 5. POSTMAN COLLECTION SETUP

### Environment Variables:
```
base_url: http://localhost:5000
admin_token: <your_admin_jwt_token>
giveaway_id: <test_giveaway_id>
winner_id: <test_winner_id>
```

### Pre-request Scripts for Authentication:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('admin_token')
});
```

---

## 6. DATABASE VERIFICATION

After API calls, verify data in MongoDB:

```javascript
// Check giveaway creation
db.giveaways.find({title: "Summer Mega Giveaway 2025"})

// Check winners after draw
db.winners.find({giveawayId: ObjectId("giveaway_id")})

// Check eligible participants count
db.purchases.aggregate([
    {$match: {paymentApproval: "completed", userPayment: "payed"}},
    {$group: {_id: "$userId", count: {$sum: 1}}},
    {$match: {count: {$gte: 2}}}
])
```

This comprehensive testing guide covers all aspects of the giveaway system. Each endpoint has been designed to handle various scenarios and edge cases while maintaining data integrity and security.
