#!/bin/bash

# Test Lemlist API endpoints against official documentation
# Based on: https://developer.lemlist.com/

BASE_URL="http://localhost:3000"
LEMLIST_API_URL="https://api.lemlist.com/api"

echo "=========================================="
echo "Lemlist API Endpoint Testing"
echo "=========================================="
echo ""
echo "Testing our internal endpoints:"
echo ""

# Test 1: Health check
echo "1. Testing /api/health"
curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE_URL/api/health" | head -20
echo ""

# Test 2: Tenant config
echo "2. Testing /api/tenant/config?client=collectiv"
curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE_URL/api/tenant/config?client=collectiv" | head -20
echo ""

# Test 3: Lemlist campaigns endpoint
echo "3. Testing /api/lemlist/campaigns (requires auth)"
curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE_URL/api/lemlist/campaigns" | head -20
echo ""

# Test 4: Lemlist activities endpoint
echo "4. Testing /api/lemlist/activities (requires auth)"
curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE_URL/api/lemlist/activities" | head -20
echo ""

# Test 5: Dashboard lemlist endpoint
echo "5. Testing /api/dashboard/lemlist (requires auth)"
curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE_URL/api/dashboard/lemlist?client=collectiv&startDate=2025-10-29&endDate=2025-11-12" | head -30
echo ""

echo "=========================================="
echo "Note: 404 errors are expected without Clerk authentication"
echo "Use browser DevTools Network tab for authenticated testing"
echo "=========================================="

