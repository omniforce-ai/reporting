#!/bin/bash

# Lemlist API Verification Test Script
# Tests the Lemlist dashboard endpoint and verifies activity types

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "Lemlist API Verification Tests"
echo "=========================================="
echo ""

# Test 1: Check if server is running
echo -n "1. Checking if server is running... "
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" | grep -q "200\|404"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Server not responding${NC}"
    echo "   Please start the Next.js dev server: npm run dev"
    exit 1
fi

# Test 2: Get list of clients
echo ""
echo "2. Fetching clients list..."
CLIENTS_RESPONSE=$(curl -s "$BASE_URL/api/clients" -H "Accept: application/json")
echo "   Response preview: $(echo "$CLIENTS_RESPONSE" | head -c 200)"

# Test 3: Test Lemlist dashboard endpoint (will fail without configured client)
echo ""
echo "3. Testing Lemlist Dashboard endpoint..."
echo "   Endpoint: GET /api/dashboard/lemlist?client={subdomain}&startDate=2025-01-01&endDate=2025-01-31"
DASHBOARD_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/dashboard/lemlist?client=test&startDate=2025-01-01&endDate=2025-01-31")
HTTP_CODE=$(echo "$DASHBOARD_RESPONSE" | tail -n1)
BODY=$(echo "$DASHBOARD_RESPONSE" | sed '$d')

echo "   HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "   ${GREEN}✓ Endpoint working${NC}"
    echo "   Response structure:"
    echo "$BODY" | python -m json.tool 2>/dev/null | head -30 || echo "$BODY" | head -30
elif [ "$HTTP_CODE" = "400" ]; then
    echo -e "   ${YELLOW}⚠ API key not configured (expected)${NC}"
    echo "   Error: $(echo "$BODY" | grep -o '"error":"[^"]*"' | head -1)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "   ${YELLOW}⚠ Tenant not found (expected)${NC}"
else
    echo -e "   ${RED}✗ Unexpected response${NC}"
    echo "   Response: $BODY"
fi

echo ""
echo "=========================================="
echo "Activity Types Verification"
echo "=========================================="
echo ""
echo "Based on code review, the following activity types are handled:"
echo ""
echo "Email Activities:"
echo "  - emailsSent / emailSent"
echo "  - emailsOpened / emailOpened"
echo "  - emailsClicked / emailClicked / linkClicked"
echo "  - emailsReplied / emailReplied"
echo ""
echo "LinkedIn Activities:"
echo "  - linkedinVisitDone"
echo "  - linkedinInviteDone"
echo "  - linkedinInviteAccepted"
echo "  - linkedinSent"
echo "  - linkedinReplied"
echo "  - linkedinInterested"
echo ""
echo "API Activities:"
echo "  - apiInterested"
echo ""
echo "=========================================="
echo "Metrics Verification"
echo "=========================================="
echo ""
echo "Current metrics displayed:"
echo "  1. Active Campaigns"
echo "  2. Emails Sent"
echo "  3. Email Opens (percentage only)"
echo "  4. LinkedIn Connections"
echo "  5. Positive Replies"
echo "  6. Reply Rate"
echo ""
echo "Removed metrics:"
echo "  - Total Engagements (removed)"
echo "  - Click Rate (removed)"
echo ""

