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
  
  // Category 2: Total Contacted (first metric)
  'Total Contacted': 2,
  
  // Category 3: Actions Sent
  'Total Emails Sent': 3,
  'Emails Sent': 3,
  'Email Sent': 3,
  
  // Category 4: Opens/Open Rate
  'Opened or Connected': 4,
  'Emails Opened': 4,
  'Open Rate': 4,
  'Email Opens': 4,
  
  // Category 5: LinkedIn Accepted
  'LinkedIn Accepted': 5,
  'LinkedIn Connections': 5,
  
  // Category 6: User Actions (Conversations, Engagements)
  'Total Conversations': 6,
  'Conversations Started': 6,
  'Conversations': 6,
  'Total Engagements': 6,
  
  // Category 7: Reply Rate
  'Reply Rate': 7,
  
  // Category 8: Replies / Conversions
  'Replies': 8,
  'Positive Replies': 8,
  'Click Rate': 8,
  'Conversions': 8,
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
  if (lowerTitle.includes('total contacted')) return 2;
  if (lowerTitle.includes('sent') || lowerTitle.includes('emails sent')) return 3;
  if (lowerTitle.includes('opened or connected') || lowerTitle.includes('emails opened') || (lowerTitle.includes('open') && !lowerTitle.includes('conversation') && !lowerTitle.includes('rate'))) return 4;
  if (lowerTitle.includes('linkedin accepted')) return 5;
  if (lowerTitle.includes('conversation') || lowerTitle.includes('engagement')) return 6;
  if (lowerTitle.includes('reply rate')) return 7;
  if (lowerTitle === 'replies' || (lowerTitle.includes('replies') && !lowerTitle.includes('positive') && !lowerTitle.includes('rate'))) return 8;
  if (lowerTitle.includes('positive reply') || lowerTitle.includes('reply') || 
      lowerTitle.includes('conversion') || lowerTitle.includes('click rate')) return 8;
  
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
    
    // Within replies/conversions category (8), order: Replies, Positive Replies, Click Rate
    if (orderA === 8 && orderB === 8) {
      const replyOrder: Record<string, number> = {
        'Replies': 1,
        'Positive Replies': 2,
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

