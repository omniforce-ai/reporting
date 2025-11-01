# Lemlist API Documentation

**Last Updated:** January 2025

**Base URL:** `https://api.lemlist.com/api`

**Official Documentation:**
- [API Reference Overview](https://developer.lemlist.com/api-reference/getting-started/overview)
- [Authentication](https://developer.lemlist.com/api-reference/getting-started/authentication)
- [Rate Limits](https://developer.lemlist.com/api-reference/getting-started/rate-limits)
- [API Errors](https://developer.lemlist.com/api-reference/getting-started/api-errors)

**Note:** This documentation should be regularly updated. Check the official Lemlist developer documentation for the latest changes and new endpoints.

---

## API Structure

The Lemlist API reference is divided into 3 main sections:

1. **Getting Started**: Authentication, rate limits, error handling, versions
2. **Endpoints**: All available API endpoints organized by resource
3. **Objects & Definitions**: Object definitions and their meanings

All API routes live at `https://api.lemlist.com/api`. For every endpoint documented, the full URL is `https://api.lemlist.com/api/{endpoint}`.

---

## Authentication

Authentication details are available in the [official Authentication guide](https://developer.lemlist.com/api-reference/getting-started/authentication).

**Note:** The authentication process is described as "tricky" in the official docs, so special attention is required when implementing it.

---

## Rate Limits

Rate limit information is available in the [official Rate Limits guide](https://developer.lemlist.com/api-reference/getting-started/rate-limits).

---

## API Errors

Error handling and common API errors are documented in the [official API Errors guide](https://developer.lemlist.com/api-reference/getting-started/api-errors).

---

## Endpoints

The Lemlist API includes endpoints for the following resources:

### Team
Team-related operations and management.

### Users
User-specific actions and user management.

### Campaigns
Create, manage, and track email campaigns.

### Sequences
Define and control email sequences.

### Schedules
Set up and modify sending schedules.

### Leads
Manage lead information and lead data.

### Companies
Handle company-related data and company information.

### Contacts
Manage contact details and contact information.

### Inbox
Access and manage inbox messages and conversations.

### Tasks
Create and track tasks.

### Activities
Log and monitor activities.

### CRMs
Integrate with CRM systems and manage CRM connections.

### Unsubscribes
Handle unsubscribe requests and manage unsubscribe lists.

### Webhooks
Set up and manage webhooks for event notifications.

### People Database
Access the people database and search for contacts.

### Enrich
Enhance data with enrichment features.

### Lemwarm
Manage lemwarm settings and warmup configurations.

---

## Objects & Definitions

Key objects in the Lemlist API and their attributes:

### Team
Details about team configurations and team settings.

### Credits
Credit information and credit balances.

### User
User profiles and user-specific data.

### Campaign
Campaign attributes and campaign configuration.

### Lead
Lead details and lead information.

### Activity
Activity logging and activity tracking.

### Unsubscribe
Unsubscribe attributes and unsubscribe management.

### Enrichment
Data enrichment results and enrichment details.

### Task
Task information and task tracking.

### Inbox Conversation
Attributes of inbox conversations and conversation threads.

### Inbox Message
Details about inbox messages and message content.

### Contact
Contact information and contact attributes.

### CRM Filter
CRM filter configurations and filter settings.

### Company
Company attributes and company data.

### Lemwarm Settings
Lemwarm configurations and warmup settings.

### Campaign Status
Details about campaign statuses and status transitions.

### Channel
Communication channels and channel settings.

### Sequence
Sequence attributes and sequence configuration.

### Step
Details about steps in sequences and step configuration.

### Schedule
Schedule information and scheduling details.

### Label
Label attributes and label management.

### Report
Report details and reporting information.

### Webhook
Webhook configurations and webhook management.

### Mailbox
Mailbox attributes and mailbox settings.

### Company Note
Details about company notes and note management.

---

## How to Use This Documentation

1. **Start with Getting Started**: Review authentication, rate limits, and error handling
2. **Find Relevant Endpoints**: Navigate to the endpoints section for your use case
3. **Check Object Definitions**: Refer to objects & definitions to understand response structures

---

## Example Request

```bash
curl -X GET "https://api.lemlist.com/api/{endpoint}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Additional Resources

- **Get Started Guide:** [Get Started with Lemlist API](https://www.lemlist.com/academy/api/api-overview/get-started-with-lemlist-api/)
- **API Use Cases:** [API Use Cases](https://www.lemlist.com/academy/api/api-use-cases/)
- **API Overview:** [lemlist.com/academy/api/api-overview](https://www.lemlist.com/academy/api/api-overview/)

## Resources

- **Developer Documentation:** [developer.lemlist.com](https://developer.lemlist.com)
- **API Reference:** [developer.lemlist.com/api-reference](https://developer.lemlist.com/api-reference)
- **User Guides:** [developer.lemlist.com/guides](https://developer.lemlist.com/guides)
- **Academy:** [lemlist.com/academy](https://www.lemlist.com/academy)
- **Support:** Check the official documentation for support channels

---

## Version Information

The Lemlist API is versioned. Current version: **v2**

Check the [Versions documentation](https://developer.lemlist.com/api-reference/getting-started/versions) for version-specific details and migration guides.

---

**Important:** For detailed endpoint specifications, request/response examples, and specific implementation details, please refer to the [official Lemlist API Reference documentation](https://developer.lemlist.com/api-reference).

