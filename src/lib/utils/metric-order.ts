/**
 * Standard metric ordering for all dashboard cards
 * 
 * Order:
 * 1. Campaigns (Active Campaigns)
 * 2. Actions Sent (Total Emails Sent, Emails Sent, etc.)
 * 3. Opens/Open Rate (before conversations)
 * 4. User Actions (Total Conversations, Conversations Started, etc.)
 * 5. Replies / Conversions (Positive Replies, Reply Rate, etc.)
 */

export interface Metric {
  title: string;
  value: string;
  comparisonText?: string;
  icon?: any;
}

// Define metric categories and their order (using decimal for sub-ordering)
const METRIC_ORDER: Record<string, number> = {
  // Category 1: Campaigns
  'Active Campaigns': 1,
  'Campaigns': 1,
  
  // Category 2: Actions Sent
  'Total Emails Sent': 2,
  'Emails Sent': 2,
  'Email Sent': 2,
  
  // Category 3: Opens/Open Rate (before conversations)
  'Open Rate': 3,
  'Email Opens': 3,
  
  // Category 4: User Actions (Conversations, Engagements)
  'Total Conversations': 4,
  'Conversations Started': 4,
  'Conversations': 4,
  'Total Engagements': 4,
  'LinkedIn Connections': 4,
  
  // Category 5: Replies / Conversions
  'Positive Replies': 5,
  'Reply Rate': 5,
  'Click Rate': 5,
  'Conversions': 5,
  'Replies': 5,
};

/**
 * Get the sort order for a metric title
 * Returns a high number for unknown metrics so they appear last
 */
function getMetricOrder(title: string): number {
  // Check exact match first
  if (METRIC_ORDER[title] !== undefined) {
    return METRIC_ORDER[title];
  }
  
  // Check partial matches for flexibility
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('campaign')) return 1;
  if (lowerTitle.includes('sent') || lowerTitle.includes('emails sent')) return 2;
  // Opens/Open Rate come before conversations
  if (lowerTitle.includes('open rate') || (lowerTitle.includes('open') && !lowerTitle.includes('conversation'))) return 3;
  if (lowerTitle.includes('conversation') || lowerTitle.includes('engagement') || 
      lowerTitle.includes('connection')) return 4;
  if (lowerTitle.includes('reply') || lowerTitle.includes('rate') || 
      lowerTitle.includes('conversion') || lowerTitle.includes('click rate')) return 5;
  
  // Unknown metrics go to the end
  return 999;
}

/**
 * Sort metrics according to the standard order
 */
export function sortMetrics(metrics: Metric[]): Metric[] {
  return [...metrics].sort((a, b) => {
    const orderA = getMetricOrder(a.title);
    const orderB = getMetricOrder(b.title);
    
    // First sort by category
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Within replies/conversions category, order: Positive Replies, Reply Rate, Click Rate
    if (orderA === 5 && orderB === 5) {
      const replyOrder: Record<string, number> = {
        'Positive Replies': 1,
        'Reply Rate': 2,
        'Click Rate': 3,
      };
      const aOrder = replyOrder[a.title] || 99;
      const bOrder = replyOrder[b.title] || 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
    }
    
    // Otherwise maintain original order
    return 0;
  });
}

