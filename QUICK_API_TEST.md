# Quick API Test Script

## Test the Giveaway System

Use these curl commands to test your giveaway system:

### 1. First, get an admin token by logging in:
```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "your_admin_phone",
    "password": "your_admin_password"
  }'
```

### 2. Create a test giveaway:
```bash
curl -X POST http://localhost:5000/api/v1/giveaways/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Giveaway",
    "description": "A test giveaway for system validation",
    "prizes": [
      {
        "name": "Test Prize",
        "description": "A test prize",
        "value": 1000,
        "quantity": 1
      }
    ],
    "startDate": "2025-08-07T00:00:00.000Z",
    "endDate": "2025-08-14T23:59:59.000Z",
    "drawDate": "2025-08-15T10:00:00.000Z",
    "status": "draft"
  }'
```

### 3. Activate the giveaway:
```bash
curl -X PATCH http://localhost:5000/api/v1/giveaways/GIVEAWAY_ID/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

### 4. Check public active giveaways (no auth needed):
```bash
curl -X GET http://localhost:5000/api/v1/giveaways/active
```

### 5. Run the draw (after draw date):
```bash
curl -X POST http://localhost:5000/api/v1/giveaways/GIVEAWAY_ID/draw \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 6. Get winners:
```bash
curl -X GET http://localhost:5000/api/v1/giveaways/GIVEAWAY_ID/winners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Replace `YOUR_ADMIN_TOKEN` and `GIVEAWAY_ID` with actual values from your responses.
