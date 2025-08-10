#!/bin/bash
# HTTP API Test Script for Main Controllers

echo "🚀 Testing Main Controllers HTTP Endpoints..."
echo "📍 Server should be running at http://localhost:4000"
echo ""

# Test 1: Main page data
echo "📊 Testing GET /api/v1/main (Main page data)..."
curl -X GET http://localhost:4000/api/v1/main \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (install jq for pretty formatting)"
echo ""

# Test 2: Active banners
echo "🎨 Testing GET /api/v1/main/banners/active (Active banners)..."
curl -X GET http://localhost:4000/api/v1/main/banners/active \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "Response received"
echo ""

# Test 3: Live participant counts
echo "📈 Testing GET /api/v1/main/live-counts (Live counts)..."
curl -X GET http://localhost:4000/api/v1/main/live-counts \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "Response received"
echo ""

# Test 4: Health check
echo "❤️ Testing server health..."
curl -X GET http://localhost:4000/health \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "Response received"
echo ""

echo "🎉 HTTP API tests completed!"
echo "📝 Note: For admin endpoints (POST/PATCH/DELETE), you need authentication tokens"
