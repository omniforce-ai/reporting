# API Endpoints Testing Documentation

## Summary
All mock data has been removed from the codebase. The following endpoints are available and should be tested with real data.

**Last Verified:** January 2025  
**Official Documentation:**
- Smartlead: [api.smartlead.ai](https://api.smartlead.ai/) | [Help Center](https://helpcenter.smartlead.ai/en/articles/125-full-api-documentation)
- Lemlist: [developer.lemlist.com](https://developer.lemlist.com/api-reference)

## Mock Data Removed
- ✅ `src/app/dashboard/data.json` - Deleted
- ✅ `src/app/dashboard/page.tsx` - Updated to redirect (no longer uses mock data)
- ✅ `src/components/Dashboard.tsx` - Contains mock data but is not used by Next.js app (only used by old App.tsx)

## API Endpoints

### 1. Health Check
**Endpoint:** `GET /api/health`  
**Auth:** None  
**Description:** Returns server health status  
**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "nodeEnv": "development"
}
```

### 2. Clients
**Endpoint:** `GET /api/clients`  
**Auth:** None  
**Description:** Returns list of all clients  
**Expected Response:**
```json
{
  "clients": [
    {
      "id": "subdomain",
      "name": "Client Name",
      "subdomain": "subdomain",
      "hasSmartlead": true/false,
      "hasLemlist": true/false
    }
  ]
}
```

### 3. Features
**Endpoint:** `GET /api/features?client={subdomain}`  
**Auth:** None (but requires client param)  
**Description:** Returns enabled features for a client  
**Query Params:**
- `client` (optional): Client subdomain

### 4. Tenant Config
**Endpoint:** `GET /api/tenant/config?client={subdomain}`  
**Auth:** Requires client access  
**Description:** Returns tenant configuration including API keys and enabled features  
**Query Params:**
- `client` (optional): Client subdomain

### 5. Metrics
**Endpoint:** `GET /api/metrics?client={subdomain}&automationId={id}&limit={n}`  
**Auth:** Requires tenant  
**Description:** Returns metrics for the tenant  
**Query Params:**
- `client` (optional): Client subdomain
- `automationId` (optional): Filter by automation ID
- `limit` (optional): Limit results (default: 100)

### 6. Automations
**Endpoint:** `GET /api/automations?client={subdomain}`  
**Auth:** Requires tenant  
**Description:** Returns automations for the tenant  
**Query Params:**
- `client` (optional): Client subdomain

### 7. Smartlead Campaigns
**Endpoint:** `GET /api/smartlead/campaigns?client={subdomain}`  
**Auth:** Requires tenant with Smartlead API key  
**Description:** Returns all Smartlead campaigns  
**External API:** `GET https://server.smartlead.ai/api/v1/campaigns?api_key={key}`  
**Query Params:**
- `client` (optional): Client subdomain
**Verified:** ✅ Matches official Smartlead API documentation

### 8. Smartlead Campaign Analytics
**Endpoint:** `GET /api/smartlead/campaigns/analytics?client={subdomain}`  
**Auth:** Requires tenant with Smartlead API key  
**Description:** Returns analytics for all Smartlead campaigns (aggregates from individual campaign analytics)  
**External API:** `GET https://server.smartlead.ai/api/v1/campaigns/{campaign_id}/analytics?api_key={key}`  
**Query Params:**
- `client` (optional): Client subdomain
**Note:** This endpoint fetches analytics for each campaign individually and aggregates them. For date-filtered statistics, use `/campaigns/{campaign_id}/statistics?start_date={date}&end_date={date}`  
**Verified:** ✅ Matches official Smartlead API documentation

### 9. Smartlead Single Campaign
**Endpoint:** `GET /api/smartlead/campaign/{campaignId}?client={subdomain}`  
**Auth:** Requires tenant with Smartlead API key  
**Description:** Returns details for a specific Smartlead campaign  
**Path Params:**
- `campaignId`: Campaign ID
**Query Params:**
- `client` (optional): Client subdomain

### 10. Smartlead Campaign Analytics
**Endpoint:** `GET /api/smartlead/campaign/{campaignId}/analytics?client={subdomain}`  
**Auth:** Requires tenant with Smartlead API key  
**Description:** Returns analytics for a specific Smartlead campaign  
**Path Params:**
- `campaignId`: Campaign ID
**Query Params:**
- `client` (optional): Client subdomain

### 11. Lemlist Campaigns
**Endpoint:** `GET /api/lemlist/campaigns?client={subdomain}`  
**Auth:** Requires tenant with Lemlist API key  
**Description:** Returns all Lemlist campaigns  
**Query Params:**
- `client` (optional): Client subdomain

### 12. Lemlist Activities
**Endpoint:** `GET /api/lemlist/activities?client={subdomain}&campaignId={id}&startDate={date}&endDate={date}`  
**Auth:** Requires tenant with Lemlist API key  
**Description:** Returns Lemlist activities  
**Query Params:**
- `client` (optional): Client subdomain
- `campaignId` (optional): Filter by campaign ID
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

### 13. Dashboard Email (Smartlead)
**Endpoint:** `GET /api/dashboard/email?client={subdomain}&startDate={date}&endDate={date}`  
**Auth:** Requires tenant with Smartlead API key  
**Description:** Returns formatted dashboard data for Smartlead  
**Query Params:**
- `client` (required): Client subdomain
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)

### 14. Dashboard Lemlist
**Endpoint:** `GET /api/dashboard/lemlist?client={subdomain}&startDate={date}&endDate={date}`  
**Auth:** Requires tenant with Lemlist API key  
**Description:** Returns formatted dashboard data for Lemlist  
**Query Params:**
- `client` (required): Client subdomain
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)

## Testing Commands

### Basic Tests (No Auth Required)
```bash
# Health check
curl http://localhost:3000/api/health

# List clients
curl http://localhost:3000/api/clients
```

### Tests with Client Parameter
```bash
# Replace {CLIENT_SUBDOMAIN} with actual client subdomain from /api/clients

# Get features
curl "http://localhost:3000/api/features?client={CLIENT_SUBDOMAIN}"

# Get tenant config
curl "http://localhost:3000/api/tenant/config?client={CLIENT_SUBDOMAIN}"

# Get metrics
curl "http://localhost:3000/api/metrics?client={CLIENT_SUBDOMAIN}"

# Get automations
curl "http://localhost:3000/api/automations?client={CLIENT_SUBDOMAIN}"
```

### Tests with External API Keys (Requires configured API keys in database)
```bash
# Smartlead campaigns
curl "http://localhost:3000/api/smartlead/campaigns?client={CLIENT_SUBDOMAIN}"

# Lemlist campaigns
curl "http://localhost:3000/api/lemlist/campaigns?client={CLIENT_SUBDOMAIN}"

# Dashboard data
curl "http://localhost:3000/api/dashboard/email?client={CLIENT_SUBDOMAIN}&startDate=2025-01-01&endDate=2025-01-31"
curl "http://localhost:3000/api/dashboard/lemlist?client={CLIENT_SUBDOMAIN}&startDate=2025-01-01&endDate=2025-01-31"
```

## Notes
- All endpoints that require a tenant will need the `client` query parameter or the `x-tenant-client` header
- Endpoints that call external APIs (Smartlead/Lemlist) require API keys to be configured in the database for the client
- Date formats should be YYYY-MM-DD for dashboard endpoints
- The health endpoint should work without any authentication

