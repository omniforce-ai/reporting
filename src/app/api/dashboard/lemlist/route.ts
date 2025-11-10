import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';

const LEMLIST_BASE_URL = 'https://api.lemlist.com/api';
const REQUEST_TIMEOUT = 20000;
const CACHE_REVALIDATE = 300;

function createBasicAuth(email: string, apiKey: string): string {
  const credentials = Buffer.from(`${email}:${apiKey}`).toString('base64');
  return `Basic ${credentials}`;
}

interface Activity {
  _id: string;
  type: string;
  leadId?: string;
  campaignId?: string;
  sequenceId?: string;
  stepId?: string;
  createdAt: string;
}

interface Campaign {
  _id: string;
  name: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10;
}

async function fetchCampaigns(email: string, apiKey: string, signal: AbortSignal): Promise<Campaign[]> {
  const authHeader = createBasicAuth(email, apiKey);
  
  const response = await fetch(
    `${LEMLIST_BASE_URL}/campaigns?version=v2`,
    {
      signal,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'Omniforce-Reporting/1.0',
      },
      next: { revalidate: CACHE_REVALIDATE },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Lemlist campaigns API error:`, response.status, errorText);
    return [];
  }

  const data = await response.json();
  // Lemlist API returns { campaigns: [...], pagination: {...} }
  const campaigns = data.campaigns || (Array.isArray(data) ? data : []);
  return Array.isArray(campaigns) ? campaigns : [];
}

async function fetchActivitiesPage(
  email: string,
  apiKey: string,
  signal: AbortSignal,
  campaignId?: string,
  offset: number = 0,
  limit: number = 100
): Promise<Activity[]> {
  const authHeader = createBasicAuth(email, apiKey);
  const params = new URLSearchParams({
    version: 'v2',
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (campaignId) {
    params.append('campaignId', campaignId);
  }

  const response = await fetch(
    `${LEMLIST_BASE_URL}/activities?${params.toString()}`,
    {
      signal,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'Omniforce-Reporting/1.0',
      },
      next: { revalidate: CACHE_REVALIDATE },
    }
  );

  if (!response.ok) {
    return [];
  }

  const activities: Activity[] = await response.json();
  return Array.isArray(activities) ? activities : [];
}

async function fetchAllActivities(
  email: string,
  apiKey: string,
  signal: AbortSignal,
  campaignId?: string,
  startDate?: string,
  endDate?: string
): Promise<Activity[]> {
  const allActivities: Activity[] = [];
  let offset = 0;
  const limit = 100;
  const maxActivities = 10000; // Safety limit to prevent excessive fetching
  let hasMore = true;
  
  // Parse date range once if provided
  let start: Date | null = null;
  let end: Date | null = null;
  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  }

  while (hasMore && allActivities.length < maxActivities) {
    const activities = await fetchActivitiesPage(
      email,
      apiKey,
      signal,
      campaignId,
      offset,
      limit
    );

    if (activities.length === 0) {
      hasMore = false;
      break;
    }

    // Filter by date range if provided
    let filteredActivities = activities;
    if (start && end) {
      filteredActivities = activities.filter(activity => {
        const activityDate = new Date(activity.createdAt);
        return activityDate >= start! && activityDate <= end!;
      });
      
      // Check if we've gone past the start date (activities are typically newest first)
      // If all activities in this batch are before the start date, we can stop
      const oldestActivity = activities[activities.length - 1];
      if (oldestActivity?.createdAt) {
        const oldestDate = new Date(oldestActivity.createdAt);
        if (oldestDate < start) {
          // All remaining activities will be before the start date
          hasMore = false;
        }
      }
    }

    allActivities.push(...filteredActivities);
    
    // Stop if we got fewer results than requested (last page)
    if (activities.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
      // Rate limiting: wait between requests
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  return allActivities;
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
    
    const apiKeys = tenant.apiKeys as { lemlist?: string; lemlistEmail?: string } | null;
    const lemlistApiKey = apiKeys?.lemlist;
    // Default to alistair@omniforce.ai for Creation Exhibition client
    const lemlistEmail = apiKeys?.lemlistEmail || 'alistair@omniforce.ai';

    if (!lemlistApiKey) {
      console.error(`Missing Lemlist API key for tenant ${tenant.subdomain}. apiKeys:`, JSON.stringify(apiKeys));
      return NextResponse.json(
        { error: 'Lemlist API key not configured for this tenant' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      // Fetch campaigns
      const campaigns = await fetchCampaigns(lemlistEmail, lemlistApiKey, controller.signal);
      
      if (campaigns.length === 0) {
        clearTimeout(timeoutId);
        return NextResponse.json({
          data: {
            metrics: [
              { title: 'Emails Sent', value: '0', comparisonText: 'No campaigns' },
              { title: 'Open Rate', value: '0%', comparisonText: 'No data' },
              { title: 'Click Rate', value: '0%', comparisonText: 'No data' },
              { title: 'Reply Rate', value: '0%', comparisonText: 'No data' },
            ],
            openRateGauge: { title: 'Open Rate', percentage: 0 },
            clickRateGauge: { title: 'Click Rate', percentage: 0 },
            replyRateGauge: { title: 'Reply Rate', percentage: 0 },
            campaignPerformance: {
              title: 'Campaign Performance Comparison',
              description: 'Compare open rates across all campaigns',
              data: [],
              valueLabel: 'Open Rate (%)',
              endpoint: 'GET /api/dashboard/lemlist',
            },
            additionalMetrics: {
              title: 'Additional Metrics',
              data: [
                { label: 'Total Campaigns', value: '0' },
                { label: 'Active Campaigns', value: '0' },
              ],
            },
          },
        });
      }

      // Fetch all activities for all campaigns
      // Note: If no date range provided, fetch all activities
      const allActivities = await fetchAllActivities(
        lemlistEmail,
        lemlistApiKey,
        controller.signal,
        undefined,
        startDate,
        endDate
      );
      
      console.log(`[Lemlist Dashboard] Fetched ${allActivities.length} activities${startDate && endDate ? ` for date range ${startDate} to ${endDate}` : ' (no date filter)'}`);
      
      // Log activity type distribution for debugging
      const activityTypes: Record<string, number> = {};
      allActivities.forEach(activity => {
        activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
      });
      console.log('[Lemlist Dashboard] Activity types:', activityTypes);

      clearTimeout(timeoutId);

      // Aggregate activities by type and date
      const activitiesByType: Record<string, Activity[]> = {};
      const campaignActivities: Record<string, Activity[]> = {};
      const activitiesByDate: Record<string, {
        sent: number;
        opened: number;
        clicked: number;
        replied: number;
        bounced: number;
        unsubscribed: number;
      }> = {};
      
      allActivities.forEach(activity => {
        // Group by type
        if (!activitiesByType[activity.type]) {
          activitiesByType[activity.type] = [];
        }
        activitiesByType[activity.type].push(activity);

        // Group by campaign
        if (activity.campaignId) {
          if (!campaignActivities[activity.campaignId]) {
            campaignActivities[activity.campaignId] = [];
          }
          campaignActivities[activity.campaignId].push(activity);
        }

        // Group by date for timeline
        if (activity.createdAt) {
          const dateKey = new Date(activity.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
          if (!activitiesByDate[dateKey]) {
            activitiesByDate[dateKey] = {
              sent: 0,
              opened: 0,
              clicked: 0,
              replied: 0,
              bounced: 0,
              unsubscribed: 0,
            };
          }
          
          // Count activity types by date - handle both plural (emailsSent) and singular (emailSent) forms
          switch (activity.type) {
            case 'emailsSent':
            case 'emailSent':
              activitiesByDate[dateKey].sent++;
              break;
            case 'emailsOpened':
            case 'emailOpened':
              activitiesByDate[dateKey].opened++;
              break;
            case 'emailsClicked':
            case 'emailClicked':
              activitiesByDate[dateKey].clicked++;
              break;
            case 'emailsReplied':
            case 'emailReplied':
              activitiesByDate[dateKey].replied++;
              break;
            case 'emailsBounced':
            case 'emailBounced':
              activitiesByDate[dateKey].bounced++;
              break;
            case 'apiUnsubscribed':
            case 'unsubscribed':
              activitiesByDate[dateKey].unsubscribed++;
              break;
          }
        }
      });

      // Calculate totals - Lemlist uses plural forms (emailsSent, emailsOpened, etc.)
      // Note: clicks and replies may not be present if campaigns don't have link tracking enabled
      // or if no replies have been received yet
      const emailsSent = activitiesByType['emailsSent']?.length || activitiesByType['emailSent']?.length || 0;
      const emailsOpened = activitiesByType['emailsOpened']?.length || activitiesByType['emailOpened']?.length || 0;
      
      // Click tracking - may use emailsClicked, emailClicked, or linkClicked depending on API version
      const emailsClicked = activitiesByType['emailsClicked']?.length || 
                           activitiesByType['emailClicked']?.length || 
                           activitiesByType['linkClicked']?.length || 0;
      
      // Reply tracking - may use emailsReplied, emailReplied, or replyReceived
      const emailsReplied = activitiesByType['emailsReplied']?.length || 
                           activitiesByType['emailReplied']?.length || 
                           activitiesByType['replyReceived']?.length || 0;
      
      const emailsBounced = activitiesByType['emailsBounced']?.length || activitiesByType['emailBounced']?.length || 0;
      const unsubscribed = activitiesByType['apiUnsubscribed']?.length || 
                          activitiesByType['unsubscribed']?.length || 0;
      const tasksCreated = activitiesByType['taskCreated']?.length || 0;
      const tasksCompleted = activitiesByType['taskCompleted']?.length || 0;
      
      // LinkedIn activities (Lemlist also tracks LinkedIn outreach)
      const linkedinVisits = activitiesByType['linkedinVisitDone']?.length || 0;
      const linkedinInvites = activitiesByType['linkedinInviteDone']?.length || 0;
      const linkedinAccepted = activitiesByType['linkedinInviteAccepted']?.length || 0;
      
      // Interested leads tracking
      const interestedLeads = activitiesByType['apiInterested']?.length || 0;
      const notInterestedLeads = activitiesByType['apiNotInterested']?.length || 0;

      // Calculate rates
      const emailsDelivered = emailsSent - emailsBounced;
      const deliveryRate = emailsSent > 0 
        ? calculatePercentage(emailsDelivered, emailsSent)
        : 0;
      const openRate = emailsDelivered > 0 
        ? calculatePercentage(emailsOpened, emailsDelivered)
        : (emailsSent > 0 ? calculatePercentage(emailsOpened, emailsSent) : 0);
      
      // Click and Reply rates - only calculate if we have data, otherwise show as N/A
      // Note: Click tracking may require link tracking to be enabled in campaigns
      const clickRate = emailsClicked > 0 && emailsDelivered > 0
        ? calculatePercentage(emailsClicked, emailsDelivered)
        : (emailsClicked > 0 && emailsSent > 0 
            ? calculatePercentage(emailsClicked, emailsSent)
            : null); // null indicates no clicks detected
      
      // Reply rate - may be 0 if no replies received yet
      const replyRate = emailsReplied > 0 && emailsDelivered > 0
        ? calculatePercentage(emailsReplied, emailsDelivered)
        : (emailsReplied > 0 && emailsSent > 0
            ? calculatePercentage(emailsReplied, emailsSent)
            : 0); // 0 means no replies, which is valid data
      const bounceRate = emailsSent > 0 
        ? calculatePercentage(emailsBounced, emailsSent)
        : 0;
      const unsubscribeRate = emailsSent > 0
        ? calculatePercentage(unsubscribed, emailsSent)
        : 0;
      const taskCompletionRate = tasksCreated > 0
        ? calculatePercentage(tasksCompleted, tasksCreated)
        : 0;

      // Calculate campaign-level metrics - handle both plural and singular forms
      const campaignPerformanceData = campaigns.map(campaign => {
        const campaignActivityList = campaignActivities[campaign._id] || [];
        const campaignSent = campaignActivityList.filter(a => a.type === 'emailsSent' || a.type === 'emailSent').length;
        const campaignOpened = campaignActivityList.filter(a => a.type === 'emailsOpened' || a.type === 'emailOpened').length;
        const campaignClicked = campaignActivityList.filter(a => a.type === 'emailsClicked' || a.type === 'emailClicked').length;
        const campaignReplied = campaignActivityList.filter(a => a.type === 'emailsReplied' || a.type === 'emailReplied').length;
        
        const campaignDelivered = campaignSent - campaignActivityList.filter(a => a.type === 'emailsBounced' || a.type === 'emailBounced').length;
        const campaignOpenRate = campaignDelivered > 0 
          ? calculatePercentage(campaignOpened, campaignDelivered)
          : calculatePercentage(campaignOpened, campaignSent);
        
        return {
          name: campaign.name.length > 30 ? campaign.name.substring(0, 30) + '...' : campaign.name,
          emailsSent: campaignSent,
          openRate: campaignOpenRate,
          clickRate: campaignDelivered > 0 
            ? calculatePercentage(campaignClicked, campaignDelivered)
            : calculatePercentage(campaignClicked, campaignSent),
          replyRate: campaignDelivered > 0
            ? calculatePercentage(campaignReplied, campaignDelivered)
            : calculatePercentage(campaignReplied, campaignSent),
        };
      }).filter(c => c.emailsSent > 0);

      const activeCampaigns = campaigns.filter(c => 
        c.status === 'active' || c.status === 'running'
      ).length;

      // Build activity timeline data (last 30 days or available data)
      const timelineData = Object.keys(activitiesByDate)
        .sort()
        .slice(-30) // Last 30 days
        .map(date => ({
          name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          emailsSent: activitiesByDate[date].sent,
          emailsOpened: activitiesByDate[date].opened,
          emailsClicked: activitiesByDate[date].clicked,
          emailsReplied: activitiesByDate[date].replied,
          openRate: activitiesByDate[date].sent > 0 
            ? calculatePercentage(activitiesByDate[date].opened, activitiesByDate[date].sent)
            : 0,
        }));

      // Organize metrics into sections: Email, LinkedIn, Campaigns
      const emailMetrics = [
        {
          title: 'Emails Sent',
          value: formatNumber(emailsSent),
          comparisonText: `${campaigns.length} ${campaigns.length === 1 ? 'campaign' : 'campaigns'}`,
        },
        {
          title: 'Open Rate',
          value: emailsSent > 0 ? `${openRate.toFixed(1)}%` : '0%',
          comparisonText: `${formatNumber(emailsOpened)} opens`,
        },
        {
          title: 'Click Rate',
          value: clickRate !== null 
            ? `${clickRate.toFixed(1)}%` 
            : (emailsSent > 0 ? 'No clicks' : 'N/A'),
          comparisonText: emailsClicked > 0 
            ? `${formatNumber(emailsClicked)} clicks`
            : 'No data',
        },
        {
          title: 'Reply Rate',
          value: emailsReplied > 0 ? `${replyRate.toFixed(1)}%` : '0%',
          comparisonText: emailsReplied > 0 
            ? `${formatNumber(emailsReplied)} replies`
            : 'No replies yet',
        },
      ];

      const linkedinMetrics = [];
      if (linkedinVisits > 0) {
        linkedinMetrics.push({
          title: 'LinkedIn Visits',
          value: formatNumber(linkedinVisits),
          comparisonText: 'Profile visits',
        });
      }
      if (linkedinInvites > 0) {
        linkedinMetrics.push({
          title: 'LinkedIn Invites',
          value: formatNumber(linkedinInvites),
          comparisonText: `${linkedinAccepted > 0 ? `${linkedinAccepted} accepted` : 'Connection requests'}`,
        });
      }
      if (linkedinAccepted > 0) {
        linkedinMetrics.push({
          title: 'LinkedIn Accepted',
          value: formatNumber(linkedinAccepted),
          comparisonText: 'Connections accepted',
        });
      }

      // Campaign health metrics (renamed from campaignMetrics to avoid cache conflicts)
      const campaignHealthMetrics = [
        {
          title: 'Total Campaigns',
          value: formatNumber(campaigns.length),
          comparisonText: `${activeCampaigns} active`,
        },
        {
          title: 'Delivery Rate',
          value: `${deliveryRate.toFixed(1)}%`,
          comparisonText: `${formatNumber(emailsDelivered)} delivered`,
        },
        {
          title: 'Bounce Rate',
          value: `${bounceRate.toFixed(1)}%`,
          comparisonText: `${formatNumber(emailsBounced)} bounced`,
        },
        {
          title: 'Unsubscribe Rate',
          value: `${unsubscribeRate.toFixed(1)}%`,
          comparisonText: `${formatNumber(unsubscribed)} unsubscribed`,
        },
      ];

      // Add interested leads to campaign metrics if available
      if (interestedLeads > 0) {
        campaignHealthMetrics.push({
          title: 'Interested Leads',
          value: formatNumber(interestedLeads),
          comparisonText: notInterestedLeads > 0 
            ? `${notInterestedLeads} not interested`
            : 'Marked as interested',
        });
      }

      // Legacy metrics array for backward compatibility (flattened)
      const metrics = [...emailMetrics, ...linkedinMetrics, ...campaignHealthMetrics];

      const dashboardData = {
        metrics, // Keep for backward compatibility
        metricSections: {
          email: {
            title: 'Email Metrics',
            metrics: emailMetrics,
          },
          linkedin: {
            title: 'LinkedIn Metrics',
            metrics: linkedinMetrics,
          },
          campaigns: {
            title: 'Campaign Metrics',
            metrics: campaignHealthMetrics,
          },
        },
        openRateGauge: {
          title: 'Open Rate',
          percentage: openRate,
        },
        clickRateGauge: {
          title: 'Click Rate',
          percentage: clickRate !== null ? clickRate : 0, // Show 0 if no clicks detected
        },
        replyRateGauge: {
          title: 'Reply Rate',
          percentage: replyRate,
        },
        campaignPerformance: {
          title: 'Campaign Performance Comparison',
          description: 'Compare engagement rates across all campaigns to identify top performers',
          data: campaignPerformanceData.slice(0, 10).map(c => ({ 
            name: c.name, 
            value: c.openRate,
            clickRate: c.clickRate,
            replyRate: c.replyRate,
            emailsSent: c.emailsSent,
          })),
          valueLabel: 'Open Rate (%)',
          endpoint: 'GET /api/dashboard/lemlist (aggregated from /api/lemlist/activities)',
        },
        activityTimeline: {
          title: 'Activity Timeline',
          description: 'Daily email activity and engagement rates over time',
          data: timelineData,
          valueLabel: 'Count',
        },
        additionalMetrics: {
          title: 'Additional Health Metrics',
          data: [
            { label: 'Active Campaigns', value: formatNumber(activeCampaigns) },
            ...(tasksCreated > 0 ? [{ label: 'Task Completion', value: `${taskCompletionRate.toFixed(1)}%`, percentage: taskCompletionRate }] : []),
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
    console.error('[Lemlist Route] Error fetching dashboard data:', error);
    console.error('[Lemlist Route] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[Lemlist Route] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Lemlist dashboard data',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}

