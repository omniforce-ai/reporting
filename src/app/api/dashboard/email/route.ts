import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';

const SMARTLEAD_BASE_URL = 'https://server.smartlead.ai/api/v1';
const REQUEST_TIMEOUT = 20000;
const CACHE_REVALIDATE = 300;
const MAX_CONCURRENT_REQUESTS = 5;

interface CampaignLeadStats {
  total?: number;
  blocked?: number;
  stopped?: number;
  completed?: number;
  inprogress?: number;
  notStarted?: number;
  interested?: number;
}

interface CampaignAnalytics {
  total_emails_sent?: number;
  total_emails_opened?: number;
  total_emails_clicked?: number;
  total_replies?: number;
  total_bounced?: number;
  total_leads?: number;
  total_completed?: number;
  total_blocked?: number;
  emails_sent?: number;
  emails_opened?: number;
  emails_clicked?: number;
  replies?: number;
  bounced?: number;
  leads?: number;
  completed?: number;
  blocked?: number;
  sent?: number;
  opened?: number;
  clicked?: number;
  campaign_lead_stats?: CampaignLeadStats;
  sent_count?: string | number;
  open_count?: string | number;
  unique_open_count?: string | number;
  click_count?: string | number;
  unique_click_count?: string | number;
  reply_count?: string | number;
  bounce_count?: string | number;
  unsubscribe_count?: string | number;
  block_count?: string | number;
  total_count?: string | number;
  drafted_count?: string | number;
}

interface Campaign {
  id: number;
  name: string;
  status: string;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10;
}

function extractAnalyticsValue(analytics: CampaignAnalytics | any, ...keys: string[]): number {
  if (!analytics) return 0;
  
  for (const key of keys) {
    const value = analytics[key];
    if (value === null || value === undefined) continue;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Handle empty strings, "null", "undefined", etc.
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') continue;
      const parsed = parseInt(trimmed, 10);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

function getEmailMetrics(analytics: any) {
  return {
    emailsSent: extractAnalyticsValue(
      analytics,
      'sent_count', 'unique_sent_count', 'total_emails_sent', 'emails_sent', 'sent'
    ),
    // Prefer unique_open_count for accurate open rates (one person = one open)
    emailsOpened: extractAnalyticsValue(
      analytics,
      'unique_open_count', 'open_count', 'total_emails_opened', 'emails_opened', 'opened'
    ),
    // Prefer unique_click_count for accurate CTR (one person = one click)
    emailsClicked: extractAnalyticsValue(
      analytics,
      'unique_click_count', 'click_count', 'total_emails_clicked', 'emails_clicked', 'clicked'
    ),
    replies: extractAnalyticsValue(
      analytics,
      'reply_count', 'total_replies', 'replies'
    ),
    // Positive replies: use campaign_lead_stats.interested from API response
    // Check if interested exists first (could be 0, which is falsy but valid)
    positiveReplies: (analytics.campaign_lead_stats && 'interested' in analytics.campaign_lead_stats)
      ? parseInt(String(analytics.campaign_lead_stats.interested), 10)
      : extractAnalyticsValue(
          analytics,
          'positive_reply_count', 'interested_reply_count', 'positive_replies', 'interested_replies',
          'positive_categorized_count', 'interested_count'
        ),
    bounced: extractAnalyticsValue(
      analytics,
      'bounce_count', 'total_bounced', 'bounced'
    ),
    unsubscribed: extractAnalyticsValue(
      analytics,
      'unsubscribe_count', 'unsubscribed_count', 'total_unsubscribed', 'unsubscribed'
    ),
    leads: (analytics.campaign_lead_stats?.total ? parseInt(String(analytics.campaign_lead_stats.total), 10) : 0) || extractAnalyticsValue(analytics, 'total_count', 'total_leads', 'leads'),
    completed: extractAnalyticsValue(
      analytics,
      'campaign_lead_stats', 'total_completed', 'completed'
    ) || (analytics.campaign_lead_stats?.completed ? parseInt(analytics.campaign_lead_stats.completed, 10) : 0),
    blocked: extractAnalyticsValue(
      analytics,
      'block_count', 'campaign_lead_stats', 'total_blocked', 'blocked'
    ) || (analytics.campaign_lead_stats?.blocked ? parseInt(analytics.campaign_lead_stats.blocked, 10) : 0),
  };
}

async function fetchCampaignAnalyticsByDateRange(
  campaignId: number,
  apiKey: string,
  signal: AbortSignal,
  startDate: string,
  endDate: string
): Promise<CampaignAnalytics | null> {
  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      start_date: startDate,
      end_date: endDate,
    });
    
    const endpoint = `${SMARTLEAD_BASE_URL}/campaigns/${campaignId}/analytics-by-date`;
    const url = `${endpoint}?${params.toString()}`;
    
    const response = await fetch(
      url,
      {
        signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Omniforce-Reporting/1.0',
        },
        next: { revalidate: CACHE_REVALIDATE },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Smartlead API error for campaign ${campaignId} (${startDate} to ${endDate}):`, response.status, errorText);
      return null;
    }

    const data = await response.json();
    let analyticsData = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
    
    // /analytics-by-date doesn't return campaign_lead_stats, but we need interested count
    // ALWAYS fetch from /analytics endpoint and merge the interested count when using /analytics-by-date
    // Note: This gives all-time interested count, not date-filtered (API limitation)
    // Check if campaign_lead_stats is missing or empty (which /analytics-by-date returns)
    const needsMerge = !analyticsData?.campaign_lead_stats || 
                      Object.keys(analyticsData.campaign_lead_stats || {}).length === 0 ||
                      analyticsData.campaign_lead_stats.interested === undefined;
    
    if (needsMerge) {
      try {
        const allTimeParams = new URLSearchParams({ api_key: apiKey });
        const allTimeEndpoint = `${SMARTLEAD_BASE_URL}/campaigns/${campaignId}/analytics`;
        const allTimeUrl = `${allTimeEndpoint}?${allTimeParams.toString()}`;
        
        const allTimeResponse = await fetch(allTimeUrl, {
          signal,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Omniforce-Reporting/1.0',
          },
          next: { revalidate: CACHE_REVALIDATE },
        });
        
        if (allTimeResponse.ok) {
          const allTimeData = await allTimeResponse.json();
          const allTimeAnalytics = Array.isArray(allTimeData) ? (allTimeData.length > 0 ? allTimeData[0] : null) : allTimeData;
          
          // Merge campaign_lead_stats.interested from all-time analytics
          if (allTimeAnalytics?.campaign_lead_stats) {
            if (!analyticsData.campaign_lead_stats) {
              analyticsData.campaign_lead_stats = {};
            }
            // Include interested count (0 is valid - means no positive replies yet)
            const interestedValue = allTimeAnalytics.campaign_lead_stats.interested;
            analyticsData.campaign_lead_stats.interested = (interestedValue !== undefined && interestedValue !== null) ? parseInt(String(interestedValue), 10) : 0;
            
            // Also include total for leads calculation
            if (analyticsData.campaign_lead_stats.total === undefined || analyticsData.campaign_lead_stats.total === null) {
              analyticsData.campaign_lead_stats.total = allTimeAnalytics.campaign_lead_stats.total || 0;
            }
            
            console.log(`[DEBUG] Merged interested count for campaign ${campaignId}:`, {
              fromAllTime: allTimeAnalytics.campaign_lead_stats.interested,
              mergedValue: analyticsData.campaign_lead_stats.interested,
            });
          }
        }
      } catch (mergeError) {
        // If merge fails, continue with date-filtered data only
        console.warn(`[WARN] Could not merge campaign_lead_stats for campaign ${campaignId}:`, mergeError);
      }
    } else {
      console.log(`[DEBUG] Campaign ${campaignId} already has campaign_lead_stats.interested:`, analyticsData.campaign_lead_stats.interested);
    }
    
    return analyticsData;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error(`Error fetching analytics for campaign ${campaignId} (${startDate} to ${endDate}):`, error);
    }
    return null;
  }
}

async function fetchCampaignAnalytics(
  campaignId: number,
  apiKey: string,
  signal: AbortSignal,
  startDate?: string,
  endDate?: string
): Promise<CampaignAnalytics | null> {
  try {
    // If no date range, use all-time analytics
    if (!startDate || !endDate) {
      const params = new URLSearchParams({
        api_key: apiKey,
      });
      const endpoint = `${SMARTLEAD_BASE_URL}/campaigns/${campaignId}/analytics`;
      const url = `${endpoint}?${params.toString()}`;
      
      const response = await fetch(
        url,
        {
          signal,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Omniforce-Reporting/1.0',
          },
          next: { revalidate: CACHE_REVALIDATE },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Smartlead API error for campaign ${campaignId}:`, response.status, errorText);
        return null;
      }

      const data = await response.json();
      const analyticsData = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
      return analyticsData;
    }

    // For date ranges, always use /analytics-by-date
    // If range > 30 days, split into multiple 30-day chunks and aggregate
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 30) {
      // Single call for ranges <= 30 days
      return await fetchCampaignAnalyticsByDateRange(campaignId, apiKey, signal, startDate, endDate);
    } else {
      // Split into 30-day chunks and aggregate
      console.log(`[INFO] Date range ${daysDiff} days exceeds 30-day limit. Splitting into chunks for campaign ${campaignId}`);
      
      const chunks: Array<{ start: string; end: string }> = [];
      let currentStart = new Date(start);
      
      while (currentStart < end) {
        const chunkEnd = new Date(currentStart);
        chunkEnd.setDate(chunkEnd.getDate() + 29); // 30-day chunk (0-29 = 30 days)
        
        if (chunkEnd > end) {
          chunkEnd.setTime(end.getTime());
        }
        
        chunks.push({
          start: currentStart.toISOString().split('T')[0],
          end: chunkEnd.toISOString().split('T')[0],
        });
        
        currentStart = new Date(chunkEnd);
        currentStart.setDate(currentStart.getDate() + 1);
      }
      
      // Fetch all chunks in parallel
      const chunkResults = await Promise.allSettled(
        chunks.map(chunk => 
          fetchCampaignAnalyticsByDateRange(campaignId, apiKey, signal, chunk.start, chunk.end)
        )
      );
      
      // Aggregate results from all chunks
      const validResults = chunkResults
        .filter((r): r is PromiseFulfilledResult<CampaignAnalytics | null> => 
          r.status === 'fulfilled' && r.value !== null
        )
        .map(r => r.value!);
      
      if (validResults.length === 0) {
        console.warn(`[WARN] No valid data from any chunk for campaign ${campaignId}`);
        return null;
      }
      
      // Aggregate metrics from all chunks
      const aggregated: any = {
        sent_count: 0,
        open_count: 0,
        unique_open_count: 0,
        click_count: 0,
        unique_click_count: 0,
        reply_count: 0,
        bounce_count: 0,
        unsubscribe_count: 0,
        block_count: 0,
        total_count: 0,
        drafted_count: 0,
        campaign_lead_stats: {
          total: 0,
          blocked: 0,
          stopped: 0,
          completed: 0,
          inprogress: 0,
          notStarted: 0,
          interested: 0,
        },
      };
      
      for (const result of validResults) {
        aggregated.sent_count += extractAnalyticsValue(result, 'sent_count') || 0;
        aggregated.open_count += extractAnalyticsValue(result, 'open_count') || 0;
        aggregated.unique_open_count += extractAnalyticsValue(result, 'unique_open_count') || 0;
        aggregated.click_count += extractAnalyticsValue(result, 'click_count') || 0;
        aggregated.unique_click_count += extractAnalyticsValue(result, 'unique_click_count') || 0;
        aggregated.reply_count += extractAnalyticsValue(result, 'reply_count') || 0;
        aggregated.bounce_count += extractAnalyticsValue(result, 'bounce_count') || 0;
        aggregated.unsubscribe_count += extractAnalyticsValue(result, 'unsubscribe_count', 'unsubscribed_count') || 0;
        aggregated.block_count += extractAnalyticsValue(result, 'block_count') || 0;
        
        // For lead stats, take max values (not sum) as they represent total leads, not per-period
        if (result.campaign_lead_stats) {
          aggregated.campaign_lead_stats.total = Math.max(
            aggregated.campaign_lead_stats.total,
            extractAnalyticsValue(result.campaign_lead_stats, 'total') || 0
          );
          aggregated.campaign_lead_stats.completed = Math.max(
            aggregated.campaign_lead_stats.completed,
            extractAnalyticsValue(result.campaign_lead_stats, 'completed') || 0
          );
          aggregated.campaign_lead_stats.blocked = Math.max(
            aggregated.campaign_lead_stats.blocked,
            extractAnalyticsValue(result.campaign_lead_stats, 'blocked') || 0
          );
          // Interested count should be summed across chunks (each chunk may have different interested leads)
          // However, since /analytics-by-date doesn't provide this, we use the merged all-time value
          // which is already included from the merge operation in fetchCampaignAnalyticsByDateRange
          const chunkInterested = extractAnalyticsValue(result.campaign_lead_stats, 'interested') || 0;
          // Use max because interested is a cumulative count of total leads marked as interested
          // Not a per-period metric, so we want the maximum value across all chunks
          aggregated.campaign_lead_stats.interested = Math.max(
            aggregated.campaign_lead_stats.interested,
            chunkInterested
          );
        }
      }
      
      // Convert aggregated numbers to strings to match API format
      aggregated.sent_count = String(aggregated.sent_count);
      aggregated.open_count = String(aggregated.open_count);
      aggregated.reply_count = String(aggregated.reply_count);
      aggregated.bounce_count = String(aggregated.bounce_count);
      
      return aggregated;
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error(`Error fetching analytics for campaign ${campaignId}:`, error);
      if (startDate && endDate) {
        console.error(`Date range: ${startDate} to ${endDate}`);
      }
    }
    return null;
  }
}

async function batchFetchAnalytics(
  campaigns: Campaign[],
  apiKey: string,
  signal: AbortSignal,
  startDate?: string,
  endDate?: string
): Promise<(CampaignAnalytics | null)[]> {
  const results: (CampaignAnalytics | null)[] = [];
  
  for (let i = 0; i < campaigns.length; i += MAX_CONCURRENT_REQUESTS) {
    const batch = campaigns.slice(i, i + MAX_CONCURRENT_REQUESTS);
    const batchPromises = batch.map(campaign => 
      fetchCampaignAnalytics(campaign.id, apiKey, signal, startDate, endDate)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(
      ...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : null
      )
    );
    
    if (i + MAX_CONCURRENT_REQUESTS < campaigns.length) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  
  // Return results maintaining index alignment with campaigns array
  // Do NOT filter nulls here - keep them so indices match
  return results;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const tenant = await getCurrentTenant(clientId || undefined);
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    const apiKeys = tenant.apiKeys as { smartlead?: string } | null;
    const smartleadApiKey = apiKeys?.smartlead;

    if (!smartleadApiKey) {
      console.error(`Missing Smartlead API key for tenant ${tenant.subdomain}. apiKeys:`, JSON.stringify(apiKeys));
      return NextResponse.json(
        { error: 'Smartlead API key not configured for this tenant' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const campaignsResponse = await fetch(
        `${SMARTLEAD_BASE_URL}/campaigns?api_key=${encodeURIComponent(smartleadApiKey)}`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Omniforce-Reporting/1.0',
          },
          next: { revalidate: CACHE_REVALIDATE },
        }
      );

      if (!campaignsResponse.ok) {
        clearTimeout(timeoutId);
        const errorText = await campaignsResponse.text();
        
        return NextResponse.json(
          { 
            error: 'Failed to fetch campaigns',
            status: campaignsResponse.status,
            details: errorText.substring(0, 200),
          },
          { status: campaignsResponse.status >= 500 ? 502 : campaignsResponse.status }
        );
      }

      const campaigns: Campaign[] = await campaignsResponse.json();
      
      if (campaigns.length === 0) {
        clearTimeout(timeoutId);
        return NextResponse.json({
          data: {
            metrics: [
              { title: 'Emails Sent', value: '0', comparisonText: '0 Leads (Active + Inactive)' },
              { title: 'Opened', value: '0', comparisonText: '0.00% Open Rate' },
              { title: 'Replied', value: '0', comparisonText: '0.00% Reply Rate' },
              { title: 'Positive Reply', value: '0', comparisonText: '0.00% Positive Reply Rate' },
              { title: 'Bounced', value: '0', comparisonText: '0.00% Bounce Rate' },
            ],
            engagementMetrics: {
              title: 'Email Engagement Metrics',
              description: 'The data is displayed in Etc/GMT(UTC)',
              data: [],
            },
          },
        });
      }

      if (startDate && endDate) {
        console.log(`Fetching campaign statistics for date range: ${startDate} to ${endDate}`);
      } else {
        console.log('Fetching all-time campaign analytics (no date range specified)');
      }
      
      const analyticsResults = await batchFetchAnalytics(
        campaigns,
        smartleadApiKey,
        controller.signal,
        startDate,
        endDate
      );

      clearTimeout(timeoutId);
      
      // Debug: Check how many results we got
      console.log(`[DEBUG] Total campaigns: ${campaigns.length}, Analytics results: ${analyticsResults.length}`);
      if (startDate && endDate && analyticsResults.length === 0) {
        console.error(`[ERROR] No analytics results returned for date range ${startDate} to ${endDate}`);
        console.error(`[ERROR] First few campaigns:`, campaigns.slice(0, 3).map(c => ({ id: c.id, name: c.name })));
      }

      // Calculate totals and per-campaign metrics
      const campaignMetrics = campaigns.map((campaign, index) => {
        const analytics = analyticsResults[index];
        if (!analytics) {
          return {
            name: campaign.name,
            emailsSent: 0,
            openRate: 0,
            replyRate: 0,
          };
        }
        const metrics = getEmailMetrics(analytics);
        const openRate = calculatePercentage(metrics.emailsOpened, metrics.emailsSent);
        const replyRate = calculatePercentage(metrics.replies, metrics.emailsSent);
        return {
          name: campaign.name.length > 30 ? campaign.name.substring(0, 30) + '...' : campaign.name,
          emailsSent: metrics.emailsSent,
          openRate,
          replyRate,
        };
      }).filter(c => c.emailsSent > 0);

      const totals = analyticsResults.reduce(
        (acc: {
          emailsSent: number;
          emailsOpened: number;
          emailsClicked: number;
          replies: number;
          positiveReplies: number;
          bounced: number;
          unsubscribed: number;
          leads: number;
          completed: number;
          blocked: number;
        }, analytics) => {
          if (!analytics) return acc;
          const metrics = getEmailMetrics(analytics);
          acc.emailsSent += metrics.emailsSent;
          acc.emailsOpened += metrics.emailsOpened;
          acc.emailsClicked += metrics.emailsClicked;
          acc.replies += metrics.replies;
          acc.positiveReplies += metrics.positiveReplies;
          acc.bounced += metrics.bounced;
          acc.unsubscribed += metrics.unsubscribed;
          acc.leads += metrics.leads;
          acc.completed += metrics.completed;
          acc.blocked += metrics.blocked;
          return acc;
        },
        {
          emailsSent: 0,
          emailsOpened: 0,
          emailsClicked: 0,
          replies: 0,
          positiveReplies: 0,
          bounced: 0,
          unsubscribed: 0,
          leads: 0,
          completed: 0,
          blocked: 0,
        }
      );

      // Calculate rates - ensure we're using delivered emails, not just sent
      // Open rate should be calculated from delivered (sent - bounced)
      const emailsDelivered = totals.emailsSent - totals.bounced;
      const openRate = emailsDelivered > 0 
        ? calculatePercentage(totals.emailsOpened, emailsDelivered)
        : calculatePercentage(totals.emailsOpened, totals.emailsSent);
      const replyRate = emailsDelivered > 0
        ? calculatePercentage(totals.replies, emailsDelivered)
        : calculatePercentage(totals.replies, totals.emailsSent);
      // Positive reply count - use actual value from API (0 is valid if no positive replies)
      const positiveReplyCount = totals.positiveReplies;
      const positiveReplyRate = totals.replies > 0
        ? calculatePercentage(positiveReplyCount, totals.replies)
        : 0;
      const bounceRate = totals.emailsSent > 0
        ? calculatePercentage(totals.bounced, totals.emailsSent)
        : 0;
      
      console.log('Data Verification:', {
        emailsSent: totals.emailsSent,
        emailsDelivered,
        emailsOpened: totals.emailsOpened,
        replies: totals.replies,
        positiveRepliesTotal: totals.positiveReplies,
        positiveReplyCount: positiveReplyCount,
        bounced: totals.bounced,
        unsubscribed: totals.unsubscribed,
        calculatedOpenRate: openRate,
        calculatedReplyRate: replyRate,
        calculatedPositiveReplyRate: positiveReplyRate,
        calculatedBounceRate: bounceRate,
        analyticsResultsCount: analyticsResults.length,
        analyticsResultsWithStats: analyticsResults.filter(a => a?.campaign_lead_stats).length,
        sampleInterestedValues: analyticsResults
          .filter(a => a?.campaign_lead_stats?.interested !== undefined)
          .slice(0, 5)
          .map(a => ({ id: a?.id, interested: a?.campaign_lead_stats?.interested })),
      });
      const completionRate = calculatePercentage(totals.completed, totals.leads);
      const blockedRate = calculatePercentage(totals.blocked, totals.leads);
      
      // Calculate total leads (Active + Inactive)
      const totalLeads = totals.leads || (totals.emailsSent > 0 ? totals.emailsSent : 0);
      
      // Generate time-series data for the engagement metrics graph
      // This should match the date range selected by the user
      const start = startDate ? new Date(startDate) : new Date();
      start.setDate(start.getDate() - 14); // Default to last 14 days if no range specified
      const end = endDate ? new Date(endDate) : new Date();
      
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const timeSeriesData = Array.from({ length: Math.max(1, daysDiff) }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        
        // Note: This distributes totals evenly across days as a simplified visualization
        // For accurate daily breakdown, Smartlead API would need to be called per day
        // or use a daily analytics endpoint if available
        const dayFactor = 1 / Math.max(1, daysDiff);
        return {
          name: dateStr,
          'Email Sent': Math.round(totals.emailsSent * dayFactor),
          'Email Opened': Math.round(totals.emailsOpened * dayFactor),
          'Replied': Math.round(totals.replies * dayFactor),
          'Positive Replied': Math.round(positiveReplyCount * dayFactor),
          'Bounced': Math.round(totals.bounced * dayFactor),
          'Unsubscribed': Math.round(totals.unsubscribed * dayFactor),
        };
      });

      const dashboardData = {
        metrics: [
          {
            title: 'Emails Sent',
            value: formatNumber(totals.emailsSent),
            comparisonText: `${formatNumber(totalLeads)} Leads (Active + Inactive)`,
          },
          {
            title: 'Opened',
            value: formatNumber(totals.emailsOpened),
            comparisonText: `${openRate.toFixed(2)}% Open Rate`,
          },
          {
            title: 'Replied',
            value: formatNumber(totals.replies),
            comparisonText: `${replyRate.toFixed(2)}% Reply Rate`,
          },
          {
            title: 'Positive Reply',
            value: formatNumber(positiveReplyCount),
            comparisonText: `${positiveReplyRate.toFixed(2)}% Positive Reply Rate`,
          },
          {
            title: 'Bounced',
            value: formatNumber(totals.bounced),
            comparisonText: `${bounceRate.toFixed(2)}% Bounce Rate`,
          },
          {
            title: 'Number of Campaigns',
            value: formatNumber(campaigns.length),
            comparisonText: `${campaigns.filter(c => c.status === 'ACTIVE' || c.status === 'active' || c.status === 'running').length} Active`,
          },
          {
            title: 'Total Leads',
            value: formatNumber(totals.leads),
            comparisonText: `${formatNumber(totals.completed)} Completed (${completionRate.toFixed(1)}%)`,
          },
          {
            title: 'Completed Leads',
            value: formatNumber(totals.completed),
            comparisonText: `${completionRate.toFixed(1)}% Completion Rate`,
          },
          {
            title: 'Blocked/Escalated',
            value: formatNumber(totals.blocked),
            comparisonText: `${blockedRate.toFixed(1)}% Blocked Rate`,
          },
        ],
        // Time-series data for the engagement metrics graph
        engagementMetrics: {
          title: 'Email Engagement Metrics',
          description: 'The data is displayed in Etc/GMT(UTC)',
          data: timeSeriesData,
        },
        engagementFunnel: {
          title: 'Email Engagement Funnel',
          description: 'Journey from delivery to conversion - Sent → Opened → Replied',
          data: [
            { name: 'Sent', value: totals.emailsSent, percentage: 100 },
            { name: 'Delivered', value: emailsDelivered, percentage: emailsDelivered > 0 ? calculatePercentage(emailsDelivered, totals.emailsSent) : 0 },
            { name: 'Opened', value: totals.emailsOpened, percentage: openRate },
            { name: 'Replied', value: totals.replies, percentage: replyRate },
          ],
          endpoint: 'GET /api/dashboard/email',
        },
        campaignPerformance: {
          title: 'Campaign Performance Comparison',
          description: 'Compare open rates across all campaigns to identify top performers',
          data: campaignMetrics.slice(0, 10).map(c => ({ name: c.name, value: c.openRate })),
          valueLabel: 'Open Rate (%)',
          endpoint: 'GET /api/dashboard/email (aggregated from /api/smartlead/campaigns/{id}/analytics)',
        },
      };

      return NextResponse.json(
        { data: dashboardData },
        {
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_REVALIDATE}, stale-while-revalidate=60`,
          },
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error fetching email dashboard data:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch email dashboard data',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
