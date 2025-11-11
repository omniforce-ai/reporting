# Metric Ordering Standard

This document defines the standard ordering for dashboard metrics across all clients and features.

## Standard Order

All metric cards must follow this order:

1. **Campaigns** - Active Campaigns, Campaigns
2. **Actions Sent** - Total Emails Sent, Emails Sent, Email Sent
3. **Opens/Open Rate** - Open Rate, Email Opens (before conversations)
4. **User Actions** - Total Conversations, Conversations Started, Total Engagements, LinkedIn Connections
5. **Replies / Conversions** - Positive Replies, Reply Rate, Click Rate, Conversions, Replies

## Implementation

The standard ordering is enforced through the `sortMetrics()` utility function in `src/lib/utils/metric-order.ts`. All API routes that return metrics should:

1. Import `sortMetrics` from `@/lib/utils/metric-order`
2. Wrap the metrics array with `sortMetrics()` before returning

### Example

```typescript
import { sortMetrics } from '@/lib/utils/metric-order';

const metrics = sortMetrics([
  {
    title: 'Active Campaigns',
    value: formatNumber(activeCampaigns),
    comparisonText: '→ Same',
  },
  {
    title: 'Total Emails Sent',
    value: formatNumber(emailsSent),
    comparisonText: '→ Same',
  },
  {
    title: 'Open Rate',
    value: `${openRate.toFixed(2)}%`,
    comparisonText: '→ Same',
  },
  {
    title: 'Total Conversations',
    value: formatNumber(conversations),
    comparisonText: '→ Same',
  },
  {
    title: 'Positive Replies',
    value: formatNumber(positiveReplies),
    comparisonText: '→ Same',
  },
]);
```

**Note:** The `sortMetrics()` function automatically reorders metrics regardless of the order they're defined in the array. The example above shows the correct logical order, but metrics will be sorted correctly even if defined in a different order.

## API Routes

The following API routes use the standard metric ordering:

- `/api/dashboard/summary` - Aggregated metrics across all platforms
- `/api/dashboard/email` - Smartlead email metrics
- `/api/dashboard/lemlist` - Lemlist metrics

## Adding New Metrics

When adding new metrics:

1. Add the metric title to the `METRIC_ORDER` object in `src/lib/utils/metric-order.ts`
2. Assign it to the appropriate category (1-5)
3. The `sortMetrics()` function will automatically handle partial matches for flexibility

## Category Definitions

### Category 1: Campaigns
Metrics related to campaign counts and status.

### Category 2: Actions Sent
Metrics related to outbound actions (emails sent, messages sent, etc.).

### Category 3: Opens/Open Rate
Metrics related to email opens and open rates. These come before conversations to show the initial engagement funnel.

### Category 4: User Actions
Metrics related to user engagement and interactions (conversations started, engagements, connections).

### Category 5: Replies / Conversions
Metrics related to responses and conversions (replies, positive replies, reply rates, click rates, conversions).

---

**Last Updated:** November 11, 2025

