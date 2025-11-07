# Lemlist Reporting API Documentation

**Last Updated:** January 2025

**Base URL:** `https://api.lemlist.com/api`

**Official Documentation:**
- [API Reference Overview](https://developer.lemlist.com/api-reference/getting-started/overview)
- [Authentication](https://developer.lemlist.com/api-reference/getting-started/authentication)
- [Campaigns Endpoints](https://developer.lemlist.com/api-reference/endpoints/campaigns)
- [Activities Endpoints](https://developer.lemlist.com/api-reference/endpoints/activities)
- [Webhooks](https://developer.lemlist.com/api-reference/endpoints/webhooks)

**Note:** This documentation focuses on reporting and analytics endpoints. Check the official Lemlist developer documentation for the latest changes and new endpoints.

---

## Authentication

### Getting Your API Key

1. Log in to your lemlist account
2. Navigate to "Settings" by clicking your profile icon (bottom left)
3. Select "Integrations" from the settings menu
4. Click "Generate" to create a new API key
5. Name the key and save it
6. Copy and securely store your API key (it's only shown once)

### Using the API Key

All API requests require authentication via HTTP Basic Auth. The Authorization header format is:

```bash
Authorization: Basic <encoded-value>
```

Where `<encoded-value>` is the base64-encoded string `email:api_key`. Your email is used as the username and your API key as the password.

**Example:**
```bash
# Base64 encode: email:api_key
# Then use in header:
Authorization: Basic dXNlckBleGFtcGxlLmNvbTphcGlfa2V5X2hlcmU=
```

---

## Rate Limits

Rate limit information is available in the [official Rate Limits guide](https://developer.lemlist.com/api-reference/getting-started/rate-limits). Always check current rate limits before implementing.

---

## Core Concepts for Reporting

### Campaign
A campaign is an outreach sequence sent to a list of leads. Campaigns contain statistics about emails sent, opens, replies, clicks, and other engagement metrics.

### Activity
An activity represents a single event that occurred in your outreach, such as:
- Email sent
- Email opened
- Link clicked
- Email replied
- Bounce
- Unsubscribe
- Task completed

### Activity Types
Common activity types used in reporting:
- `emailSent` - An email was sent
- `emailOpened` - An email was opened
- `emailClicked` - A link in an email was clicked
- `emailReplied` - A reply was received
- `emailBounced` - An email bounced
- `unsubscribed` - Lead unsubscribed
- `taskCreated` - A task was created
- `taskCompleted` - A task was completed

### Metrics
Key metrics available for reporting:
- **Sent Count** - Total emails sent
- **Open Rate** - Percentage of emails opened
- **Click Rate** - Percentage of emails with clicks
- **Reply Rate** - Percentage of emails that received replies
- **Bounce Rate** - Percentage of emails that bounced
- **Unsubscribe Rate** - Percentage of leads who unsubscribed

---

## Reporting Endpoints

### Campaigns

#### List All Campaigns
**GET** `/campaigns`

Retrieve a list of all campaigns with basic information.

**Query Parameters:**
- `limit` (optional) - Number of results to return
- `offset` (optional) - Number of results to skip

**Example:**
```bash
curl -X GET "https://api.lemlist.com/api/campaigns" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Q1 Outreach Campaign",
    "status": "active",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-20T14:22:00.000Z",
    "userId": "user123",
    "teamId": "team456"
  }
]
```

**Note:** Lemlist API v2 does not provide a dedicated statistics endpoint. To build campaign statistics, you need to:

1. **Fetch activities** for the campaign using the `/activities` endpoint with `campaignId` filter
2. **Aggregate by activity type** to calculate metrics:
   - Count `emailSent` activities = emails sent
   - Count `emailOpened` activities = emails opened
   - Count `emailClicked` activities = emails clicked
   - Count `emailReplied` activities = emails replied
3. **Calculate rates**:
   - Open Rate = (emailOpened count / emailSent count) × 100
   - Click Rate = (emailClicked count / emailSent count) × 100
   - Reply Rate = (emailReplied count / emailSent count) × 100

**Example:**
```bash
# Step 1: Get all activities for a campaign
curl "https://api.lemlist.com/api/activities?version=v2&campaignId=camp_123&limit=100" \
  -H "Authorization: Basic <encoded-value>"

# Step 2: Filter and count activities by type client-side
# Then calculate metrics from the aggregated counts
```

**Note:** For detailed reporting, combine data from multiple endpoints:
1. Use `/activities` to get activity history
2. Use `/campaigns` endpoint to get campaign details (check official docs for available campaign endpoints)
3. Use `/leads` endpoint to get lead information if needed
4. Aggregate and calculate metrics client-side

---

### Activities

#### Get Many Activities
**GET** `/activities`

Retrieve the history of all campaign activities and steps performed. This is the primary endpoint for building reporting dashboards.

**Query Parameters:**
- `version` (required) - API version. Must be `v2`
- `type` (optional) - Filter by activity type (e.g., `emailOpened`, `emailClicked`, `emailReplied`, `paused`, etc.)
- `campaignId` (optional) - Filter by campaign ID
- `leadId` (optional) - Filter by lead ID
- `isFirst` (optional) - Filter for first activity (boolean)
- `offset` (optional) - Offset for pagination (integer)
- `limit` (optional) - Number of activities to retrieve. Default: 100, Maximum: 100

**Example:**
```bash
curl -X GET "https://api.lemlist.com/api/activities?version=v2&type=emailOpened&campaignId=camp_123&limit=100" \
  -H "Authorization: Basic <encoded-value>"
```

**Response (200):**
```json
[
  {
    "_id": "act_6AgzAuEtMzTF7X8Yf",
    "type": "emailOpened",
    "leadId": "lead_abc123",
    "campaignId": "camp_123",
    "sequenceId": "seq_456",
    "stepId": "step_789",
    "createdAt": "2025-01-15T14:30:00.000Z"
  }
]
```

**Response Fields:**
- `_id` (string) - Unique activity identifier
- `type` (string) - Activity type (emailOpened, emailClicked, emailReplied, etc.)
- `leadId` (string) - Associated lead ID
- `campaignId` (string) - Campaign ID
- `sequenceId` (string) - Sequence ID
- `stepId` (string) - Step ID
- `createdAt` (string, date-time) - When the activity occurred

**Common Activity Types:**
- `emailsSent` / `emailSent` - Email was sent (plural form is commonly used in v2 API)
- `emailsOpened` / `emailOpened` - Email was opened
- `emailsClicked` / `emailClicked` - Link in email was clicked (may require link tracking to be enabled in campaigns)
- `emailsReplied` / `emailReplied` - Reply was received
- `emailsBounced` / `emailBounced` - Email bounced
- `paused` - Campaign/lead was paused
- `manualDone` - Manually marked as done
- `apiDone` - Marked as done via API
- `apiInterested` - Marked as interested via API
- `apiNotInterested` - Marked as not interested via API
- `apiFailed` - Marked as failed via API
- `apiUnsubscribed` / `unsubscribed` - Unsubscribed via API
- `linkedinVisitDone` - LinkedIn profile visit completed
- `linkedinInviteDone` - LinkedIn connection invite sent
- `linkedinInviteAccepted` - LinkedIn connection invite accepted
- `conditionChosen` - Condition selected in campaign flow
- `taskCreated` - Task was created
- `taskCompleted` - Task was completed

**Note on Click and Reply Tracking:**
- **Click Rate**: Requires link tracking to be enabled in your Lemlist campaigns. If no `emailsClicked` activities are found, clicks may not be tracked or no links were clicked yet. The API supports both `emailsClicked` (plural) and `emailClicked` (singular) forms.
- **Reply Rate**: Requires email replies to be received. If no `emailsReplied` activities exist, it means no replies have been received yet (valid metric showing 0%).

**Note:** The `/activities` endpoint returns raw activity data. For reporting statistics, you will need to:
1. Fetch activities using filters (by `campaignId`, `type`, `leadId`, etc.)
2. Aggregate the data client-side by activity type
3. Calculate metrics like open rates, click rates, reply rates based on activity counts

**Example Reporting Pattern:**
```bash
# Get all opened activities for a campaign
curl "https://api.lemlist.com/api/activities?version=v2&campaignId=camp_123&type=emailOpened&limit=100" \
  -H "Authorization: Basic <encoded-value>"

# Get all sent activities for a campaign (to calculate open rate)
curl "https://api.lemlist.com/api/activities?version=v2&campaignId=camp_123&type=emailSent&limit=100" \
  -H "Authorization: Basic <encoded-value>"
```

---

### Leads

**Note:** To get activities for a specific lead, use the `/activities` endpoint with the `leadId` query parameter:

**Example:**
```bash
curl "https://api.lemlist.com/api/activities?version=v2&leadId=lead_abc123&limit=100" \
  -H "Authorization: Basic <encoded-value>"
```

---

**Note:** Team and user statistics endpoints are not available in the API v2. To build team/user reports:
1. Fetch activities and filter client-side
2. Use `/activities` endpoint with appropriate filters
3. Aggregate by team or user based on activity data (if user information is available in activities)

---

### Webhooks for Real-Time Reporting

Webhooks allow you to receive real-time activity updates, enabling you to build dynamic reports and dashboards.

#### List Webhooks
**GET** `/webhooks`

Retrieve all configured webhooks.

**Example:**
```bash
curl -X GET "https://api.lemlist.com/api/webhooks" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "url": "https://your-app.com/webhooks/lemlist",
    "events": [
      "emailSent",
      "emailOpened",
      "emailClicked",
      "emailReplied",
      "emailBounced",
      "unsubscribed"
    ],
    "active": true,
    "createdAt": "2025-01-10T12:00:00.000Z"
  }
]
```

#### Create Webhook
**POST** `/webhooks`

Create a new webhook for receiving real-time activity updates.

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/lemlist",
  "events": [
    "emailSent",
    "emailOpened",
    "emailClicked",
    "emailReplied",
    "emailBounced",
    "unsubscribed"
  ]
}
```

**Example:**
```bash
curl -X POST "https://api.lemlist.com/api/webhooks" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/lemlist",
    "events": ["emailSent", "emailOpened", "emailClicked", "emailReplied"]
  }'
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "url": "https://your-app.com/webhooks/lemlist",
  "events": [
    "emailSent",
    "emailOpened",
    "emailClicked",
    "emailReplied"
  ],
  "active": true,
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

#### Webhook Payload Structure

When an event occurs, lemlist sends a POST request to your webhook URL with the following structure:

```json
{
  "event": "emailOpened",
  "timestamp": "2025-01-15T14:30:00.000Z",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "campaignId": "507f1f77bcf86cd799439011",
    "campaignName": "Q1 Outreach Campaign",
    "leadId": "507f1f77bcf86cd799439012",
    "leadEmail": "lead@example.com",
    "leadFirstName": "John",
    "leadLastName": "Doe",
    "metadata": {
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "device": "desktop"
    }
  }
}
```

#### Delete Webhook
**DELETE** `/webhooks/{webhookId}`

Delete a webhook.

**Example:**
```bash
curl -X DELETE "https://api.lemlist.com/api/webhooks/507f1f77bcf86cd799439020" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Common Reporting Patterns

### Pattern 1: Campaign Performance Report

```bash
# Step 1: Get all activities for a campaign
curl "https://api.lemlist.com/api/activities?version=v2&campaignId=camp_123&limit=100" \
  -H "Authorization: Basic <encoded-value>"

# Step 2: Client-side aggregation by activity type and date
# Calculate: sent, opened, clicked, replied counts
# Calculate: open rate, click rate, reply rate
```

### Pattern 2: Daily Activity Timeline

```bash
# Get activities with pagination and filter by date range client-side
curl "https://api.lemlist.com/api/activities?version=v2&campaignId=camp_123&limit=100&offset=0" \
  -H "Authorization: Basic <encoded-value>"

# Then group by createdAt date client-side
```

### Pattern 3: Lead Activity History

```bash
# Get all activities for a specific lead
curl "https://api.lemlist.com/api/activities?version=v2&leadId=lead_abc123&limit=100" \
  -H "Authorization: Basic <encoded-value>"
```

### Pattern 4: Real-Time Updates via Webhooks

Set up webhooks to receive real-time activity updates, then aggregate the data in your reporting system for instant updates.

---

## Error Handling

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters, e.g., missing required `version` parameter)
- `401` - Unauthorized (invalid or missing authentication)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

Check the [official API Errors documentation](https://developer.lemlist.com/api-reference/getting-started/api-errors) for detailed error response formats.

---

## Rate Limits

Always check the current rate limits in the [official Rate Limits documentation](https://developer.lemlist.com/api-reference/getting-started/rate-limits). Implement proper rate limiting and retry logic with exponential backoff.

---

## Best Practices for Reporting

1. **Pagination**: The `/activities` endpoint returns max 100 results per request. Use `offset` and `limit` parameters to paginate through all activities. Always check if you need to fetch more pages.

2. **Client-Side Aggregation**: Since there's no statistics endpoint, you'll need to:
   - Fetch activities using filters (`campaignId`, `type`, `leadId`, etc.)
   - Aggregate counts by activity type
   - Calculate rates (open rate, click rate, reply rate)
   - Group by date, campaign, user, etc. as needed

3. **Leverage Webhooks**: For real-time reporting, use webhooks instead of polling the API constantly. Set up webhooks to receive activity updates as they happen.

4. **Cache Aggregated Data**: Cache campaign statistics and aggregated metrics to reduce API calls and improve performance.

5. **Monitor Rate Limits**: Track your API usage and implement rate limit handling. Always include the required `version=v2` parameter to avoid errors.

6. **Efficient Filtering**: Use query parameters (`type`, `campaignId`, `leadId`, `isFirst`) to filter activities on the server side rather than fetching everything and filtering client-side.

7. **Error Handling**: Implement robust error handling and retry logic for API calls. Handle 429 (rate limit) responses with exponential backoff.

8. **Data Validation**: Validate all data received from the API. The API uses `_id` fields (not `id`) and dates in ISO 8601 format.

---

## Additional Resources

- **API Use Cases - Reporting:** [Use lemlist API for Reporting](https://www.lemlist.com/academy/api/api-use-cases/use-lemlist-api-for-reporting/)
- **Getting Started Guide:** [Get Started with Lemlist API](https://www.lemlist.com/academy/api/api-overview/get-started-with-lemlist-api/)
- **API Overview:** [lemlist.com/academy/api/api-overview](https://www.lemlist.com/academy/api/api-overview/)
- **Developer Documentation:** [developer.lemlist.com](https://developer.lemlist.com)
- **API Reference:** [developer.lemlist.com/api-reference](https://developer.lemlist.com/api-reference)
- **Finding Your API Key:** [Where to find lemlist API](https://help.lemlist.com/en/articles/4452694-where-to-find-lemlist-api)

---

## Version Information

The Lemlist API is versioned. Current version: **v2**

Check the [Versions documentation](https://developer.lemlist.com/api-reference/getting-started/versions) for version-specific details and migration guides.

---

**Important:** For detailed endpoint specifications, request/response schemas, and specific implementation details, please refer to the [official Lemlist API Reference documentation](https://developer.lemlist.com/api-reference). This documentation should be used as a reference guide for reporting-specific endpoints and may not include all available API functionality.

