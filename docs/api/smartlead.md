# Smartlead API Documentation

**Last Updated:** January 2025

**Base URL:** `https://server.smartlead.ai/api/v1`

**Official Documentation:**
- [Full API Documentation (Help Center)](https://helpcenter.smartlead.ai/en/articles/125-full-api-documentation)
- [Developer Documentation](https://api.smartlead.ai/)
- [API Authentication Guide](https://api.smartlead.ai/reference/authentication)

**Note:** This documentation should be regularly updated. Check the official Smartlead documentation for the latest changes and new endpoints.

## Authentication

### Getting Your API Key

1. Navigate to Settings section in Smartlead
2. Click on "Activate API" button
3. Copy your API key (keep this secure - it acts as your username & password combined)

### Using the API Key

All API requests require the API key to be attached as a query parameter:

```
?api_key=yourApiKey
```

### Rate Limits

- **Limit:** 10 requests every 2 seconds per API key

---

## Core Concepts

### Campaign
A campaign refers to an outreach sequence you want to run to a list of leads with certain conditions.

### Lead
A lead is the recipient of your email / the person you're trying to contact. This is the person you provide value to with your products/services.

### Lead Status

- `STARTED`: The lead is scheduled to start and is yet to receive the 1st email in the sequence.
- `COMPLETED`: The lead has received all the emails in the campaign.
- `BLOCKED`: A lead is blocked when the email sent is bounced or if added in the global block list
- `INPROGRESS`: The lead has last received atleast one email in the sequence.

### Campaign Status
- `DRAFTED`
- `ACTIVE`
- `COMPLETED`
- `STOPPED`
- `PAUSED`

### Webhook Event Types
- `EMAIL_SENT`
- `EMAIL_OPEN`
- `EMAIL_LINK_CLICK`
- `EMAIL_REPLY`
- `LEAD_UNSUBSCRIBED`
- `LEAD_CATEGORY_UPDATED`

---

## Endpoints

### Campaigns

#### List All Campaigns
**GET** `/campaigns`

**Query Parameters:**
- `api_key` (required) - Your Smartlead API key

**Example:**
```bash
curl "https://server.smartlead.ai/api/v1/campaigns?api_key=YOUR_API_KEY"
```

**Response:** Returns a JSON array of campaign objects:
```json
[
  {
    "id": 372,
    "user_id": 124,
    "created_at": "2022-05-26T03:47:31.448094+00:00",
    "updated_at": "2022-05-26T03:47:31.448094+00:00",
    "status": "ACTIVE",
    "name": "My Epic Campaign",
    "track_settings": "DONT_REPLY_TO_AN_EMAIL",
    "min_time_btwn_emails": 10,
    "max_leads_per_day": 10,
    "stop_lead_settings": "REPLY_TO_AN_EMAIL",
    "unsubscribe_text": "Don't Contact Me",
    "client_id": 23,
    "enable_ai_esp_matching": true,
    "send_as_plain_text": true,
    "follow_up_percentage": 40
  }
]
```

#### Get Campaign Analytics
**GET** `/campaigns/{campaign_id}/analytics`

**Query Parameters:**
- `api_key` (required) - Your Smartlead API key

**Example:**
```bash
curl "https://server.smartlead.ai/api/v1/campaigns/{campaign_id}/analytics?api_key=YOUR_API_KEY"
```

**Response:** Returns campaign analytics including open rates, bounce rates, click-through rates, and email metrics.

#### Get Campaign By ID
**GET** `/campaigns/{campaign_id}`

**Query Parameters:**
- `api_key` (required) - Your Smartlead API key

**Response:**
```json
{
  "id": 372,
  "user_id": 124,
  "created_at": "2022-05-26T03:47:31.448094+00:00",
  "updated_at": "2022-05-26T03:47:31.448094+00:00",
  "status": "ACTIVE",
  "name": "My Epic Campaign",
  "track_settings": "DONT_REPLY_TO_AN_EMAIL",
  "scheduler_cron_value": "{ tz: 'Australia/Sydney', days: [ 1, 2, 3, 4, 5 ], endHour: '23:00', startHour: '10:00' }",
  "min_time_btwn_emails": 10,
  "max_leads_per_day": 10,
  "stop_lead_settings": "REPLY_TO_AN_EMAIL",
  "unsubscribe_text": "Don't Contact Me",
  "client_id": 23,
  "enable_ai_esp_matching": true,
  "send_as_plain_text": true,
  "follow_up_percentage": 40
}
```

#### Create Campaign
**POST** `/campaigns/create`

**Request Body:**
```json
{
  "name": "Test email campaign",
  "client_id": 22
}
```

**Response:**
```json
{
  "ok": true,
  "id": 3023,
  "name": "Test email campaign",
  "created_at": "2022-11-07T16:23:24.025929+00:00"
}
```

#### Update Campaign Schedule
**POST** `/campaigns/{campaign_id}/schedule`

**Request Body:**
```json
{
  "timezone": "America/Los_Angeles",
  "days_of_the_week": [1],
  "start_hour": "01:11",
  "end_hour": "02:22",
  "min_time_btw_emails": 10,
  "max_new_leads_per_day": 20,
  "schedule_start_time": "2023-04-25T07:29:25.978Z"
}
```

**Response:**
```json
{
  "ok": true
}
```

**Errors (400):**
- `{"error":"Invalid timezone - {timezone}"}`
- `{"error":"Invalid start_hour - {startHour}"}`
- `{"error":"Invalid end_hour - {endHour}"}`
- `{"error":"startHour cannot be greater that endHour"}`

**Note:** Use timezones from [IANA Timezone Database](https://www.iana.org/time-zones)

#### Update Campaign General Settings
**POST** `/campaigns/{campaign_id}/settings`

**Request Body:**
```json
{
  "track_settings": ["DONT_TRACK_EMAIL_OPEN"],
  "stop_lead_settings": "REPLY_TO_AN_EMAIL",
  "unsubscribe_text": "",
  "send_as_plain_text": false,
  "follow_up_percentage": 100,
  "client_id": 33,
  "enable_ai_esp_matching": true
}
```

**Allowed Values:**
- `track_settings`: `DONT_TRACK_EMAIL_OPEN` | `DONT_TRACK_LINK_CLICK` | `DONT_TRACK_REPLY_TO_AN_EMAIL`
- `stop_lead_settings`: `CLICK_ON_A_LINK` | `OPEN_AN_EMAIL` | `REPLY_TO_AN_EMAIL`
- `follow_up_percentage`: 0-100

**Response:**
```json
{
  "ok": true
}
```

**Errors (400):**
- `{"error":"Invalid track_settings value - {trackSettings}"}`
- `{"error":"Invalid stop_lead_settings value - {stopLeadSettings}"}`

#### Fetch Campaign Sequence
**GET** `/campaigns/{campaign_id}/sequences`

**Response:** Returns campaign sequence data (JSON object)

#### Add Leads to Campaign
**POST** `/campaigns/{campaign_id}/leads/add`

**Request Body:**
```json
{
  "first_name": "Cristiano",
  "last_name": "Ronaldo",
  "email": "cristiano@mufc.com",
  "phone_number": "0239392029",
  "company_name": "Manchester United",
  "website": "mufc.com",
  "location": "London",
  "custom_fields": {
    "Title": "Regional Manager",
    "First_Line": "Loved your recent post about remote work on Linkedin"
  },
  "linkedin_profile": "http://www.linkedin.com/in/cristianoronaldo",
  "company_url": "mufc.com"
}
```

**Note:** `custom_fields` supports max 20 fields

**Response:**
```json
{
  "ok": true
}
```

#### Update Lead
**POST** `/campaigns/{campaign_id}/leads/{lead_id}/update`

**Request Body:** Same structure as Add Leads

**Response:**
```json
{
  "ok": true
}
```

#### Update Lead Category
**POST** `/campaigns/{campaign_id}/leads/{lead_id}/category`

**Request Body:**
```json
{
  "category_id": 143,
  "pause_lead": true
}
```

**Note:** `pause_lead` defaults to `false` if not provided

**Response:**
```json
{
  "ok": true
}
```

#### Patch Campaign Status
**POST** `/campaigns/{campaign_id}/status`

**Request Body:**
```json
{
  "status": "PAUSED"
}
```

**Allowed Values:** `PAUSED` | `STOPPED` | `START`

**Response:**
```json
{
  "ok": true
}
```

#### Fetch Webhooks By Campaign ID
**GET** `/campaigns/{campaign_id}/webhooks`

**Response:**
```json
{
  "id": 44,
  "name": "Dinesh Testing lead category webhook",
  "created_at": "2022-09-14T05:08:55.018Z",
  "updated_at": "2022-10-31T11:44:35.812Z",
  "webhook_url": "https://webhook.site/8222f684-0cf6-43ac-9360-28227fc36d32",
  "email_campaign_id": 2180,
  "event_types": [
    "LEAD_CATEGORY_UPDATED"
  ],
  "categories": [
    "Interested"
  ]
}
```

**Error (404):**
```json
{"error":"Campaign not found - Invalid campaign_id."}
```

#### Add / Update Campaign Webhook
**POST** `/campaigns/{campaign_id}/webhooks`

**Request Body:**
```json
{
  "id": 217,
  "name": "Ramesh testing 1",
  "webhook_url": "https://webhook.site/8222f684-0cf6-43ac-9360-28227fc36d32",
  "event_types": [
    "LEAD_CATEGORY_UPDATED"
  ],
  "categories": [
    "Interested"
  ]
}
```

**Note:** Set `id` to `null` or omit it to create a new webhook

**Response:**
```json
{
  "ok": true,
  "name": "Dinesh Testing lead category webhook",
  "webhook_url": "https://webhook.site/8222f684-0cf6-43ac-9360-28227fc36d32",
  "email_campaign_id": 2180,
  "event_types": [
    "LEAD_CATEGORY_UPDATED"
  ],
  "categories": [
    "Interested"
  ]
}
```

**Errors (400):**
- `{"error":"Invalid webhook_url - {webhookUrl}"}`
- `{"error":"Invalid event_types - {eachEventType}"}`
- `{"error":"Invalid category - {eachCategory}"}`

#### Delete Campaign Webhook
**DELETE** `/campaigns/{campaign_id}/webhooks`

**Request Body:**
```json
{
  "id": 217
}
```

**Response:**
```json
{
  "ok": true
}
```

### Clients

#### Add Client To System
**POST** `/client/save`

**Request Body:**
```json
{
  "name": "Ramesh Kumar",
  "email": "ramesh@example.com",
  "permission": ["reply_master_inbox"],
  "logo": "SmartGen Outreach",
  "logo_url": null,
  "password": "Test1234!"
}
```

**Note:** For full access, set:
```json
{
  "permission": ["full_access"]
}
```

**Response:**
```json
{
  "ok": true,
  "clientId": 299,
  "name": "Ramesh Kumar",
  "email": "ramesh@example.com",
  "password": "Test1234!"
}
```

#### Fetch All Clients
**GET** `/client/`

**Response:**
```json
[
  {
    "id": 6,
    "name": "Ramesh Cleint",
    "email": "client@example.com",
    "uuid": "1e19fcb7-6651-444a-8495-e1a4bda16611",
    "created_at": "2022-08-25T04:24:04.656Z",
    "user_id": 288,
    "logo": null,
    "logo_url": null,
    "client_permision": {
      "permission": ["reply_master_inbox"],
      "retricted_category": []
    }
  }
]
```

### Email Accounts

#### Reconnect Failed Email Accounts
**POST** `/email-accounts/reconnect-failed-email-accounts`

**Request Body:**
```json
{}
```

**Rate Limit:** 3 times per 24 hour period

**Response:**
```json
{
  "ok": true,
  "message": "Email account(s) added to the queue to reconnect. We will send you an email once completed."
}
```

**Error (406 - NOT_ACCEPTABLE):**
```json
{
  "ok": true,
  "message": "Bulk reconnect API cannot be consumed more than 3 times a day"
}
```

**Error (404 - NOT_FOUND):**
```json
{
  "ok": true,
  "message": "No failed email account found!"
}
```

---

## Example Request

```bash
curl "https://server.smartlead.ai/api/v1/campaigns?api_key=API_KEY"
```

---

## Error Handling

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `406` - Not Acceptable (rate limit exceeded)

---

## Additional Notes

- All timestamps are in ISO 8601 format with timezone
- Custom fields have a maximum of 20 fields per lead
- Timezone values must be valid IANA timezone identifiers
- The `follow_up_percentage` field allocates percentage for follow-ups (remainder is for new leads)
- `enable_ai_esp_matching` matches leads with similar ESP mailboxes if they exist
- For the latest API changes, check the [Smartlead API Changelog](https://api.smartlead.ai/changelog) if available

## Additional Resources

- **Automate Reporting Using API:** [Automate Reporting Using Smartlead API](https://helpcenter.smartlead.ai/en/articles/184-automate-reporting-using-smartlead-api)
- **Replicate UI Campaign Analytics:** [How to Replicate the UI Campaign Analytics Using the API](https://helpcenter.smartlead.ai/en/articles/122-how-to-replicate-the-ui-campaign-analytics-using-the-api)
- **Getting Started Guide:** [api.smartlead.ai/docs/getting-started](https://api.smartlead.ai/docs/getting-started)
- **Changelog:** [api.smartlead.ai/changelog](https://api.smartlead.ai/changelog)

## Resources

- **Help Center:** [helpcenter.smartlead.ai](https://helpcenter.smartlead.ai)
- **Developer Portal:** [api.smartlead.ai](https://api.smartlead.ai)
- **IANA Timezone Database:** [iana.org/time-zones](https://www.iana.org/time-zones)

