# API Testing Guide

## Overview

This guide explains how to properly test API endpoints in this application, which uses Clerk authentication.

## Important Notes

⚠️ **Most API endpoints require Clerk authentication**  
Terminal/curl tests will return 404 because they don't include authentication cookies. Use browser DevTools for accurate testing.

## Browser-Based Testing (Recommended)

### Steps:

1. **Open Browser DevTools**
   - Press `F12` or right-click → Inspect
   - Go to the **Network** tab

2. **Navigate to Client Dashboard**
   - Go to: `http://localhost:3000/clients/{clientname}/dashboard?tab=lemlist`
   - Example: `http://localhost:3000/clients/collectiv/dashboard?tab=lemlist`

3. **Monitor API Requests**
   - Filter by "Fetch/XHR" to see API calls
   - Click on requests to see:
     - Request URL
     - Request Headers
     - Response Status
     - Response Body

### Verified Endpoints (from browser testing):

✅ **Working Endpoints:**
- `/api/tenant/config?client=collectiv` - Returns 200
- `/api/dashboard/summary?client=collectiv&startDate=...&endDate=...` - Returns 200

⚠️ **Configuration Required:**
- `/api/dashboard/lemlist?client=collectiv&startDate=...&endDate=...` - Returns 400
  - Error: "Lemlist email not configured for this tenant"
  - **Fix:** Configure `lemlistEmail` in client API keys

## Terminal Testing (Limited)

Terminal tests will show 404 for authenticated endpoints. Use for:
- Health checks
- Public endpoints
- Route existence verification

### Running Tests:

```bash
# Node.js test script
node test-api-endpoints.js

# Bash test script
bash test-api-endpoints.sh
```

## Common Issues

### 404 Errors
- **Cause:** Missing Clerk authentication cookies
- **Solution:** Test in browser with DevTools Network tab

### 400 Errors
- **Cause:** Missing configuration (API keys, email, etc.)
- **Solution:** Check client configuration in admin panel

### 403 Errors
- **Cause:** Insufficient permissions
- **Solution:** Verify user role and client access

## Endpoint Status

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/health` | ❓ | Requires verification |
| `/api/tenant/config` | ✅ | Working (200) |
| `/api/dashboard/summary` | ✅ | Working (200) |
| `/api/dashboard/lemlist` | ⚠️ | Returns 400 (needs lemlistEmail) |
| `/api/dashboard/email` | ❓ | Requires verification |

## Next Steps

1. Configure `lemlistEmail` for clients using Lemlist
2. Verify all endpoints return expected data
3. Check browser console for detailed error messages

