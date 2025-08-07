# 🎉 Giveaway System API Testing Guide

## Overview
The giveaway system allows admins to create campaigns, automatically select eligible participants from users who have made completed purchases, run random draws, and manage winners. The system tracks prize distribution and winner status throughout the fulfillment process.

## 🏗️ System Features

### Core Features
1. **Giveaway Creation** - Create campaigns with multiple prizes and custom rules
2. **Participant Eligibility** - Automatically filter users based on purchase history
3. **Random Selection** - Fair random drawing from eligible participants
4. **Winner Management** - Track winner status from notification to delivery
5. **Analytics** - Comprehensive statistics and reporting

### Business Rules
- Only users with completed purchases (userPayment: "payed" AND paymentApproval: "completed") are eligible
- Minimum purchase requirements can be set per giveaway
- Date range filtering for purchase eligibility
- Multiple prizes with different quantities
- Winner status tracking (pending → contacted → claimed → delivered)

---

## 📊 Database Schema

### Giveaway Model
```javascript
{
  title: String (required),
  description: String (required),
  prizes: [{
    name: String (required),
    description: String (required),
    value: Number (default: 0),
    quantity: Number (default: 1),
    image: String (Cloudinary URL)
  }],
  rules: {
    minPurchases: Number (default: 1),
    eligibleUsers: [ObjectId], // Specific users if needed
    maxWinnersPerUser: Number (default: 1),
    purchaseDateFrom: Date,
    purchaseDateTo: Date
  },
  status: ["draft", "active", "completed", "cancelled"],
  startDate: Date (required),
  endDate: Date (required),
  drawDate: Date,
  totalParticipants: Number,
  totalWinners: Number,
  createdBy: ObjectId (ref: User)
}
```

### GiveawayWinner Model
```javascript
{
  giveaway: ObjectId (ref: Giveaway),
  user: ObjectId (ref: User),
  prize: {
    name: String,
    description: String,
    value: Number,
    image: String
  },
  winningDate: Date,
  status: ["pending", "contacted", "claimed", "delivered"],
  contactInfo: {
    phone: String,
    email: String,
    address: String
  },
  notes: String,
  deliveryDate: Date
}
```

---

## 🚀 API Endpoints Testing

### 1. Create Giveaway
**POST** `/api/v1/giveaways/create`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "New Year Mega Giveaway 2025",
  "description": "Celebrate the new year with amazing prizes for our loyal customers!",
  "prizes": [
    {
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with 256GB storage",
      "value": 1199,
      "quantity": 1,
      "image": "https://cloudinary.com/iphone15.jpg"
    },
    {
      "name": "AirPods Pro",
      "description": "Wireless earbuds with noise cancellation",
      "value": 249,
      "quantity": 3
    },
    {
      "name": "$50 Store Credit",
      "description": "Store credit for future purchases",
      "value": 50,
      "quantity": 10
    }
  ],
  "rules": {
    "minPurchases": 2,
    "purchaseDateFrom": "2024-01-01T00:00:00.000Z",
    "purchaseDateTo": "2024-12-31T23:59:59.999Z"
  },
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z",
  "drawDate": "2025-02-01T12:00:00.000Z"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "giveaway_id",
    "title": "New Year Mega Giveaway 2025",
    "description": "Celebrate the new year with amazing prizes...",
    "prizes": [...],
    "rules": {...},
    "status": "draft",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z",
    "createdBy": {
      "_id": "admin_id",
      "name": "Admin Name",
      "status": "admin"
    },
    "createdAt": "2025-01-07T10:00:00.000Z"
  },
  "message": "Giveaway created successfully",
  "success": true
}
```

### 2. Get All Giveaways
**GET** `/api/v1/giveaways`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `page=1` (default: 1)
- `limit=10` (default: 10)
- `status=active|draft|completed|cancelled`
- `active=true` (shows only currently active giveaways)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "giveaways": [
      {
        "_id": "giveaway_id",
        "title": "New Year Mega Giveaway 2025",
        "status": "active",
        "startDate": "2025-01-01T00:00:00.000Z",
        "endDate": "2025-01-31T23:59:59.999Z",
        "totalParticipants": 0,
        "totalWinners": 0,
        "prizes": [...],
        "createdBy": {...}
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalGiveaways": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  },
  "message": "Giveaways fetched successfully",
  "success": true
}
```

### 3. Get Eligible Participants
**GET** `/api/v1/giveaways/{giveawayId}/eligible`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `preview=true` (returns limited data for quick preview)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "eligibleUsers": [
      {
        "user": {
          "_id": "user_id",
          "name": "John Doe",
          "phone": "1234567890"
        },
        "purchaseCount": 3
      },
      {
        "user": {
          "_id": "user_id_2",
          "name": "Jane Smith",
          "phone": "0987654321"
        },
        "purchaseCount": 2
      }
    ],
    "totalEligible": 25,
    "giveawayRules": {
      "minPurchases": 2,
      "purchaseDateFrom": "2024-01-01T00:00:00.000Z",
      "purchaseDateTo": "2024-12-31T23:59:59.999Z"
    }
  },
  "message": "Eligible participants fetched successfully",
  "success": true
}
```

### 4. Run Giveaway Draw
**POST** `/api/v1/giveaways/{giveawayId}/draw`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Body (Optional):**
```json
{
  "customWinnerCount": 15
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "giveaway": {
      "_id": "giveaway_id",
      "title": "New Year Mega Giveaway 2025",
      "totalParticipants": 25,
      "totalWinners": 14,
      "drawDate": "2025-01-07T12:30:00.000Z"
    },
    "winners": [
      {
        "_id": "winner_id",
        "user": {
          "_id": "user_id",
          "name": "John Doe",
          "phone": "1234567890"
        },
        "prize": {
          "name": "iPhone 15 Pro",
          "description": "Latest iPhone with 256GB storage",
          "value": 1199,
          "image": "https://cloudinary.com/iphone15.jpg"
        },
        "winningDate": "2025-01-07T12:30:00.000Z",
        "status": "pending"
      }
    ],
    "summary": {
      "totalEligible": 25,
      "totalSelected": 14,
      "prizeDistribution": [
        {
          "prizeName": "iPhone 15 Pro",
          "quantity": 1,
          "winnersCount": 1
        },
        {
          "prizeName": "AirPods Pro",
          "quantity": 3,
          "winnersCount": 3
        },
        {
          "prizeName": "$50 Store Credit",
          "quantity": 10,
          "winnersCount": 10
        }
      ]
    }
  },
  "message": "Giveaway draw completed successfully! 14 winners selected.",
  "success": true
}
```

### 5. Get Giveaway Winners
**GET** `/api/v1/giveaways/{giveawayId}/winners`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `page=1`
- `limit=10`
- `status=pending|contacted|claimed|delivered`

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "winners": [
      {
        "_id": "winner_id",
        "user": {
          "_id": "user_id",
          "name": "John Doe",
          "phone": "1234567890"
        },
        "giveaway": {
          "_id": "giveaway_id",
          "title": "New Year Mega Giveaway 2025"
        },
        "prize": {
          "name": "iPhone 15 Pro",
          "description": "Latest iPhone with 256GB storage",
          "value": 1199
        },
        "winningDate": "2025-01-07T12:30:00.000Z",
        "status": "pending",
        "contactInfo": {},
        "notes": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalWinners": 14,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Giveaway winners fetched successfully",
  "success": true
}
```

### 6. Update Winner Status
**PATCH** `/api/v1/giveaways/winner/{winnerId}`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "contacted",
  "contactInfo": {
    "phone": "1234567890",
    "email": "john@example.com",
    "address": "123 Main St, City, Country"
  },
  "notes": "Winner contacted via phone on 2025-01-07. Confirmed shipping address.",
  "deliveryDate": "2025-01-15T00:00:00.000Z"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "winner_id",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "phone": "1234567890"
    },
    "giveaway": {
      "_id": "giveaway_id",
      "title": "New Year Mega Giveaway 2025"
    },
    "prize": {...},
    "status": "contacted",
    "contactInfo": {
      "phone": "1234567890",
      "email": "john@example.com",
      "address": "123 Main St, City, Country"
    },
    "notes": "Winner contacted via phone on 2025-01-07. Confirmed shipping address.",
    "deliveryDate": "2025-01-15T00:00:00.000Z"
  },
  "message": "Winner status updated successfully",
  "success": true
}
```

### 7. Update Giveaway Status
**PATCH** `/api/v1/giveaways/{giveawayId}/status`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "active"
}
```

**Valid status values:**
- `draft` - Giveaway is being prepared
- `active` - Giveaway is live and accepting participants
- `completed` - Draw has been run and winners selected
- `cancelled` - Giveaway was cancelled

### 8. Get Giveaway Statistics
**GET** `/api/v1/giveaways/stats`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "stats": {
      "totalGiveaways": 5,
      "activeGiveaways": 2,
      "completedGiveaways": 3,
      "totalParticipants": 150,
      "totalWinners": 45
    },
    "winnerStats": {
      "totalWinners": 45,
      "pendingWinners": 10,
      "contactedWinners": 15,
      "claimedWinners": 12,
      "deliveredWinners": 8,
      "totalPrizeValue": 15000
    },
    "recentGiveaways": [
      {
        "_id": "giveaway_id",
        "title": "New Year Mega Giveaway 2025",
        "status": "active",
        "startDate": "2025-01-01T00:00:00.000Z",
        "endDate": "2025-01-31T23:59:59.999Z",
        "totalParticipants": 25,
        "totalWinners": 0
      }
    ]
  },
  "message": "Giveaway statistics fetched successfully",
  "success": true
}
```

---

## 🧪 Testing Workflow

### Complete Testing Scenario

#### Step 1: Create Test Purchases
First, ensure you have some completed purchases in your system:
```bash
# Create users and products, then create purchases
# Make sure purchases have:
# - userPayment: "payed"
# - paymentApproval: "completed"
```

#### Step 2: Create Giveaway
```bash
POST /api/v1/giveaways/create
# Use the JSON body example above
```

#### Step 3: Activate Giveaway
```bash
PATCH /api/v1/giveaways/{giveawayId}/status
{
  "status": "active"
}
```

#### Step 4: Check Eligible Participants
```bash
GET /api/v1/giveaways/{giveawayId}/eligible?preview=true
# Verify that users with completed purchases appear
```

#### Step 5: Run the Draw
```bash
POST /api/v1/giveaways/{giveawayId}/draw
# This will randomly select winners and mark giveaway as completed
```

#### Step 6: Manage Winners
```bash
# Get winners
GET /api/v1/giveaways/{giveawayId}/winners

# Update winner status
PATCH /api/v1/giveaways/winner/{winnerId}
{
  "status": "contacted",
  "notes": "Winner contacted successfully"
}
```

#### Step 7: View Statistics
```bash
GET /api/v1/giveaways/stats
# Check overall giveaway performance
```

---

## 🔒 Security & Validation

### Access Control
- All endpoints require admin authentication
- JWT token validation on every request
- Role-based access control (admin only)

### Data Validation
- Date validation (start < end < draw)
- Prize structure validation
- Status transition validation
- Participant eligibility validation

### Business Rules
- No duplicate winners for same giveaway
- Cannot run draw twice for same giveaway
- Cannot modify completed giveaways
- Automatic participant filtering based on purchase history

---

## 📊 Admin Panel Integration

### Dashboard Widgets
1. **Active Giveaways** - Current running campaigns
2. **Pending Winners** - Winners who need to be contacted
3. **Total Prize Value** - Sum of all distributed prizes
4. **Participation Rate** - Eligible vs total customers

### Management Interface
1. **Giveaway Creation Form** - Rich editor for prizes and rules
2. **Participant Preview** - Show eligible users before draw
3. **Winner Management** - Track status from selection to delivery
4. **Analytics Dashboard** - Performance metrics and trends

---

## 🚨 Error Handling

### Common Errors
```json
// No eligible participants
{
  "statusCode": 400,
  "message": "No eligible participants found for this giveaway",
  "success": false
}

// Draw already run
{
  "statusCode": 400,
  "message": "Draw has already been run for this giveaway",
  "success": false
}

// Invalid date range
{
  "statusCode": 400,
  "message": "End date must be after start date",
  "success": false
}

// Insufficient participants
{
  "statusCode": 400,
  "message": "Not enough eligible participants. Found 5, need 10",
  "success": false
}
```

---

## 🎯 Business Benefits

### Customer Engagement
- Reward loyal customers who make purchases
- Encourage repeat purchases with future giveaways
- Build brand loyalty through fair, transparent draws

### Marketing Insights
- Track customer purchase patterns
- Identify most engaged customer segments
- Measure campaign effectiveness

### Operational Efficiency
- Automated participant selection
- Streamlined winner management
- Comprehensive reporting and analytics

---

This giveaway system provides a complete solution for running promotional campaigns based on customer purchase history, with full administrative control and transparent winner selection! 🎉
