import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';

const SMARTLEAD_BASE_URL = 'https://server.smartlead.ai/api/v1';
const REQUEST_TIMEOUT = 20000;
const CACHE_REVALIDATE = 300;
const MAX_CONCURRENT_REQUESTS = 5;

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

function extractAnalyticsValue(analytics: CampaignAnalytics | any, ...keys: (keyof CampaignAnalytics)[]): number {
  for (const key of keys) {
    const value = analytics[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

function getEmailMetrics(analytics: any) {
  return {
    emailsSent: extractAnalyticsValue(
      analytics,
      'sent_count', 'total_emails_sent', 'emails_sent', 'sent'
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
    bounced: extractAnalyticsValue(
      analytics,
      'bounce_count', 'total_bounced', 'bounced'
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

async function fetchCampaignAnalytics(
  campaignId: number,
  apiKey: string,
  signal: AbortSignal
): Promise<CampaignAnalytics | null> {
  try {
    const response = await fetch(
      `${SMARTLEAD_BASE_URL}/campaigns/${campaignId}/analytics?api_key=${encodeURIComponent(apiKey)}`,
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
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error(`Error fetching analytics for campaign ${campaignId}:`, error);
    }
    return null;
  }
}

async function batchFetchAnalytics(
  campaigns: Campaign[],
  apiKey: string,
  signal: AbortSignal
): Promise<CampaignAnalytics[]> {
  const results: (CampaignAnalytics | null)[] = [];
  
  for (let i = 0; i < campaigns.length; i += MAX_CONCURRENT_REQUESTS) {
    const batch = campaigns.slice(i, i + MAX_CONCURRENT_REQUESTS);
    const batchPromises = batch.map(campaign => 
      fetchCampaignAnalytics(campaign.id, apiKey, signal)
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
  
  return results.filter((r): r is CampaignAnalytics => r !== null);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client') || undefined;
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
              { title: 'Emails Processed', value: '0', comparisonText: 'No campaigns' },
              { title: 'Emails Escalated', value: '0', comparisonText: 'No campaigns' },
              { title: 'Avg. Response Time', value: 'N/A', comparisonText: 'No data' },
              { title: 'Categorization Accuracy', value: '0%', comparisonText: 'No data' },
            ],
            completionRate: { title: 'Completion rate', percentage: 0 },
            feedbackScore: { title: 'Open Rate', percentage: 0, positiveCount: 0, negativeCount: 0 },
            evaluationHistory: {
              title: 'Open Rate History',
              description: 'Showing email open rates over time',
              data: [],
            },
            tasksHistory: {
              title: 'Email Volume',
              description: 'Showing processed and bounced email counts',
              data: [],
            },
          },
        });
      }

      const analyticsResults = await batchFetchAnalytics(
        campaigns,
        smartleadApiKey,
        controller.signal
      );

      clearTimeout(timeoutId);

      // Calculate totals and per-campaign metrics
      const campaignMetrics = campaigns.map((campaign, index) => {
        const analytics = analyticsResults[index];
        if (!analytics) {
          return {
            name: campaign.name,
            emailsSent: 0,
            openRate: 0,
            clickRate: 0,
            replyRate: 0,
          };
        }
        const metrics = getEmailMetrics(analytics);
        const openRate = calculatePercentage(metrics.emailsOpened, metrics.emailsSent);
        const clickRate = calculatePercentage(metrics.emailsClicked, metrics.emailsSent);
        const replyRate = calculatePercentage(metrics.replies, metrics.emailsSent);
        return {
          name: campaign.name.length > 30 ? campaign.name.substring(0, 30) + '...' : campaign.name,
          emailsSent: metrics.emailsSent,
          openRate,
          clickRate,
          replyRate,
        };
      }).filter(c => c.emailsSent > 0);

      const totals = analyticsResults.reduce(
        (acc, analytics) => {
          if (!analytics) return acc;
          const metrics = getEmailMetrics(analytics);
          acc.emailsSent += metrics.emailsSent;
          acc.emailsOpened += metrics.emailsOpened;
          acc.emailsClicked += metrics.emailsClicked;
          acc.replies += metrics.replies;
          acc.bounced += metrics.bounced;
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
          bounced: 0,
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
      const clickRate = emailsDelivered > 0
        ? calculatePercentage(totals.emailsClicked, emailsDelivered)
        : calculatePercentage(totals.emailsClicked, totals.emailsSent);
      const replyRate = emailsDelivered > 0
        ? calculatePercentage(totals.replies, emailsDelivered)
        : calculatePercentage(totals.replies, totals.emailsSent);
      
      console.log('Data Verification:', {
        emailsSent: totals.emailsSent,
        emailsDelivered,
        emailsOpened: totals.emailsOpened,
        emailsClicked: totals.emailsClicked,
        replies: totals.replies,
        bounced: totals.bounced,
        calculatedOpenRate: openRate,
        calculatedClickRate: clickRate,
        calculatedReplyRate: replyRate,
      });
      const bounceRate = calculatePercentage(totals.bounced, totals.emailsSent);
      const completionRate = calculatePercentage(totals.completed, totals.leads);
      const blockedRate = calculatePercentage(totals.blocked, totals.leads);
      
      // Generate time-series data (simulated - using current rates as averages)
      const last7Days = Array.from({ length: 7 }, (_, i) => ({
        name: `Day ${i + 1}`,
        openRate: openRate + (Math.random() * 10 - 5), // Simulate variation
        clickRate: clickRate + (Math.random() * 5 - 2.5),
        replyRate: replyRate + (Math.random() * 2 - 1),
      }));

      const last30Days = Array.from({ length: 30 }, (_, i) => ({
        name: `${i + 1}`,
        openRate: openRate + (Math.random() * 10 - 5),
        clickRate: clickRate + (Math.random() * 5 - 2.5),
        replyRate: replyRate + (Math.random() * 2 - 1),
      }));

      const dashboardData = {
        metrics: [
          {
            title: 'Emails Processed',
            value: formatNumber(totals.emailsSent),
            comparisonText: `${campaigns.length} ${campaigns.length === 1 ? 'campaign' : 'campaigns'}`,
          },
          {
            title: 'Open Rate',
            value: `${openRate.toFixed(1)}%`,
            comparisonText: `${formatNumber(totals.emailsOpened)} opens`,
          },
          {
            title: 'Click Rate',
            value: `${clickRate.toFixed(1)}%`,
            comparisonText: `${formatNumber(totals.emailsClicked)} clicks`,
          },
          {
            title: 'Reply Rate',
            value: `${replyRate.toFixed(1)}%`,
            comparisonText: `${formatNumber(totals.replies)} replies`,
          },
        ],
        // Rate Metrics (Gauge Charts)
        openRateGauge: {
          title: 'Open Rate',
          percentage: openRate,
        },
        clickRateGauge: {
          title: 'Click Rate',
          percentage: clickRate,
        },
        replyRateGauge: {
          title: 'Reply Rate',
          percentage: replyRate,
        },
        engagementFunnel: {
          title: 'Email Engagement Funnel',
          description: 'Journey from delivery to conversion - Sent → Opened → Clicked → Replied',
          data: [
            { name: 'Sent', value: totals.emailsSent, percentage: 100 },
            { name: 'Delivered', value: emailsDelivered, percentage: emailsDelivered > 0 ? calculatePercentage(emailsDelivered, totals.emailsSent) : 0 },
            { name: 'Opened', value: totals.emailsOpened, percentage: openRate },
            { name: 'Clicked', value: totals.emailsClicked, percentage: clickRate },
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
        // Additional Data (Nice to Have)
        additionalMetrics: {
          title: 'Additional Metrics',
          data: [
            { label: 'Total Leads', value: formatNumber(totals.leads) },
            { label: 'Completed Leads', value: formatNumber(totals.completed), percentage: completionRate },
            { label: 'Blocked/Escalated', value: formatNumber(totals.blocked), percentage: blockedRate },
            { label: 'Bounced Emails', value: formatNumber(totals.bounced), percentage: bounceRate },
            { label: 'Total Campaigns', value: campaigns.length },
            { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'active' || c.status === 'running').length },
          ],
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
