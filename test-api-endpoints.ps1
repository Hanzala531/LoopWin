# HTTP API Test Script for Main Controllers (PowerShell)

Write-Host "🚀 Testing Main Controllers HTTP Endpoints..." -ForegroundColor Green
Write-Host "📍 Server should be running at http://localhost:4000" -ForegroundColor Yellow
Write-Host ""

# Test 1: Main page data
Write-Host "📊 Testing GET /api/v1/main (Main page data)..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/main" -Method GET -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Banners: $($response.data.banners.Count)" -ForegroundColor White
    Write-Host "Live Counts: $($response.data.liveParticipantCounts.Count)" -ForegroundColor White
    Write-Host "Recent Winners: $($response.data.recentWinners.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Active banners
Write-Host "🎨 Testing GET /api/v1/main/banners/active (Active banners)..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/main/banners/active" -Method GET -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Active banners found: $($response.data.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Live participant counts
Write-Host "📈 Testing GET /api/v1/main/live-counts (Live counts)..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/main/live-counts" -Method GET -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Active giveaways with live counts: $($response.data.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Health check
Write-Host "❤️ Testing server health..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/health" -Method GET -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Server status: $($response.data.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "🎉 HTTP API tests completed!" -ForegroundColor Green
Write-Host "📝 Note: For admin endpoints (POST/PATCH/DELETE), you need authentication tokens" -ForegroundColor Yellow
