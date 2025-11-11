import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';
import { MailIcon } from '@/components/icons';
import { sortMetrics } from '@/lib/utils/metric-order';

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
  campaignId?: string;
  email?: string;
  createdAt: string;
}

interface Campaign {
  _id: string;
  name: string;
  status?: string;
  isDeleted?: boolean;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10;
}

function calculatePreviousPeriod(startDate: string, endDate: string): { start: string; end: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - daysDiff);
  
  return {
    start: prevStart.toISOString().split('T')[0],
    end: prevEnd.toISOString().split('T')[0]
  };
}

function formatComparison(current: number, previous: number, isPercentage: boolean = false): string {
  if (previous === 0) {
    if (current === 0) return '→ Same';
    return `↑ +${current}${isPercentage ? '%' : ''} (new)`;
  }
  
  const change = current - previous;
  const changePercent = ((change / previous) * 100);
  
  if (Math.abs(change) < 0.01 && !isPercentage) return '→ Same';
  if (Math.abs(changePercent) < 0.1 && isPercentage) return '→ Same';
  
  const sign = change >= 0 ? '↑' : '↓';
  const absChange = Math.abs(change);
  const absChangePercent = Math.abs(changePercent);
  
  if (isPercentage) {
    return `${sign} ${absChangePercent.toFixed(1)}%`;
  } else {
    const percentStr = changePercent >= 0 
      ? `+${changePercent.toFixed(0)}%` 
      : `${changePercent.toFixed(0)}%`;
    return `${sign} ${absChange} (${percentStr})`;
  }
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
    return [];
  }

  const data = await response.json();
  const campaigns = data.campaigns || (Array.isArray(data) ? data : []);
  return Array.isArray(campaigns) ? campaigns.filter((c: Campaign) => !c.isDeleted) : [];
}

async function fetchAllActivities(
  email: string,
  apiKey: string,
  signal: AbortSignal,
  startDate?: string,
  endDate?: string
): Promise<Activity[]> {
  const allActivities: Activity[] = [];
  let offset = 0;
  const limit = 100;
  const maxActivities = 10000;
  let hasMore = true;
  
  let start: Date | null = null;
  let end: Date | null = null;
  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  }

  const authHeader = createBasicAuth(email, apiKey);

  while (hasMore && allActivities.length < maxActivities) {
    const params = new URLSearchParams({
      version: 'v2',
      limit: limit.toString(),
      offset: offset.toString(),
    });

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
      break;
    }

    const activities: Activity[] = await response.json();
    if (!Array.isArray(activities) || activities.length === 0) {
      hasMore = false;
      break;
    }

    let filteredActivities = activities;
    if (start && end) {
      filteredActivities = activities.filter(activity => {
        if (!activity.createdAt) return false;
        const activityDate = new Date(activity.createdAt);
        return activityDate >= start! && activityDate <= end!;
      });
      
      const oldestActivity = activities[activities.length - 1];
      if (oldestActivity?.createdAt) {
        const oldestDate = new Date(oldestActivity.createdAt);
        if (oldestDate < start) {
          hasMore = false;
        }
      }
    }

    allActivities.push(...filteredActivities);
    
    if (activities.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  return allActivities;
}

interface Metrics {
  totalContacted: number;
  totalEngagements: number;
  email: {
    sent: number;
    opens: number;
    openRate: number;
    clicks: number;
    clickRate: number;
    replies: number;
    positive: number;
    replyRate: number;
  };
  linkedin: {
    visited: number;
    invitesSent: number;
    connectionsAccepted: number;
    connectionRate: number;
    messagesSent: number;
    replies: number;
    positive: number;
    replyRate: number;
  };
  totalReplies: number;
  totalPositive: number;
  overallReplyRate: number;
}

function calculateMetrics(activities: Activity[]): Metrics {
  const activitiesByType: Record<string, Activity[]> = {};
  
  activities.forEach(activity => {
    if (!activitiesByType[activity.type]) {
      activitiesByType[activity.type] = [];
    }
    activitiesByType[activity.type].push(activity);
  });

  const uniqueEmails = new Set<string>();
  const uniqueLinkedIn = new Set<string>();

  [...(activitiesByType.emailsSent || []), ...(activitiesByType.emailSent || [])].forEach(a => {
    if (a.email) uniqueEmails.add(a.email);
  });

  [...(activitiesByType.linkedinVisitDone || []), ...(activitiesByType.linkedinInviteDone || [])].forEach(a => {
    if (a.email) uniqueLinkedIn.add(a.email);
  });

  const emailOpens = new Set(
    [...(activitiesByType.emailsOpened || []), ...(activitiesByType.emailOpened || [])]
      .map(a => a.email)
      .filter(Boolean)
  ).size;
  
  const emailClicks = new Set(
    [...(activitiesByType.emailsClicked || []), ...(activitiesByType.emailClicked || []), ...(activitiesByType.linkClicked || [])]
      .map(a => a.email)
      .filter(Boolean)
  ).size;
  
  const emailReplies = (activitiesByType.emailsReplied || []).length + (activitiesByType.emailReplied || []).length;
  const emailPositive = (activitiesByType.apiInterested || []).length;

  const linkedInConnects = (activitiesByType.linkedinInviteAccepted || []).length;
  const linkedInMessages = (activitiesByType.linkedinSent || []).length;
  const linkedInReplies = (activitiesByType.linkedinReplied || []).length;
  const linkedInPositive = (activitiesByType.linkedinInterested || []).length;

  const emailSent = uniqueEmails.size;
  const linkedInVisited = uniqueLinkedIn.size;
  const linkedInInvitesSent = (activitiesByType.linkedinInviteDone || []).length;

  const totalContacted = uniqueEmails.size + uniqueLinkedIn.size;
  const totalReplies = emailReplies + linkedInReplies;
  const totalPositive = emailPositive + linkedInPositive;
  const totalEngagements = emailOpens + emailClicks + linkedInConnects;

  return {
    totalContacted,
    totalEngagements,
    email: {
      sent: emailSent,
      opens: emailOpens,
      openRate: emailSent > 0 ? calculatePercentage(emailOpens, emailSent) : 0,
      clicks: emailClicks,
      clickRate: emailOpens > 0 ? calculatePercentage(emailClicks, emailOpens) : 0,
      replies: emailReplies,
      positive: emailPositive,
      replyRate: emailSent > 0 ? calculatePercentage(emailReplies, emailSent) : 0,
    },
    linkedin: {
      visited: linkedInVisited,
      invitesSent: linkedInInvitesSent,
      connectionsAccepted: linkedInConnects,
      connectionRate: linkedInInvitesSent > 0 ? calculatePercentage(linkedInConnects, linkedInInvitesSent) : 0,
      messagesSent: linkedInMessages,
      replies: linkedInReplies,
      positive: linkedInPositive,
      replyRate: linkedInMessages > 0 ? calculatePercentage(linkedInReplies, linkedInMessages) : 0,
    },
    totalReplies,
    totalPositive,
    overallReplyRate: totalContacted > 0 ? calculatePercentage(totalReplies, totalContacted) : 0,
  };
}

function getWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const tenant = await getCurrentTenant(clientId || undefined);
    
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    
    const apiKeys = tenant.apiKeys as { lemlist?: string; lemlistEmail?: string } | null;
    const lemlistApiKey = apiKeys?.lemlist;
    const lemlistEmail = apiKeys?.lemlistEmail || 'alistair@omniforce.ai';

    if (!lemlistApiKey) {
      return NextResponse.json(
        { error: 'Lemlist API key not configured for this tenant' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const campaigns = await fetchCampaigns(lemlistEmail, lemlistApiKey, controller.signal);
      const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'running' || !c.status);
      
      if (campaigns.length === 0) {
        clearTimeout(timeoutId);
        return NextResponse.json({ data: { metrics: [] } });
      }

      const defaultStartDate = startDate || new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const defaultEndDate = endDate || new Date().toISOString().split('T')[0];
      const previousPeriod = calculatePreviousPeriod(defaultStartDate, defaultEndDate);

      const [currentActivities, previousActivities] = await Promise.all([
        fetchAllActivities(lemlistEmail, lemlistApiKey, controller.signal, defaultStartDate, defaultEndDate),
        fetchAllActivities(lemlistEmail, lemlistApiKey, controller.signal, previousPeriod.start, previousPeriod.end),
      ]);

      const currentMetrics = calculateMetrics(currentActivities);
      const previousMetrics = calculateMetrics(previousActivities);

      const campaignReplies: Record<string, { email: number; linkedin: number; positive: number }> = {};
      const activitiesByWeek: Record<string, {
        emailOpens: number;
        emailClicks: number;
        linkedInVisits: number;
        linkedInConnects: number;
        replies: number;
      }> = {};

      currentActivities.forEach(activity => {
        if (activity.campaignId) {
          if (!campaignReplies[activity.campaignId]) {
            campaignReplies[activity.campaignId] = { email: 0, linkedin: 0, positive: 0 };
          }
          
          if (activity.type === 'emailsReplied' || activity.type === 'emailReplied') {
            campaignReplies[activity.campaignId].email++;
          } else if (activity.type === 'linkedinReplied') {
            campaignReplies[activity.campaignId].linkedin++;
          } else if (activity.type === 'apiInterested' || activity.type === 'linkedinInterested') {
            campaignReplies[activity.campaignId].positive++;
          }
        }

        if (activity.createdAt) {
          const date = new Date(activity.createdAt);
          const weekKey = getWeekKey(date);
          
          if (!activitiesByWeek[weekKey]) {
            activitiesByWeek[weekKey] = {
              emailOpens: 0,
              emailClicks: 0,
              linkedInVisits: 0,
              linkedInConnects: 0,
              replies: 0,
            };
          }

          if (activity.type === 'emailsOpened' || activity.type === 'emailOpened') {
            activitiesByWeek[weekKey].emailOpens++;
          } else if (activity.type === 'emailsClicked' || activity.type === 'emailClicked' || activity.type === 'linkClicked') {
            activitiesByWeek[weekKey].emailClicks++;
          } else if (activity.type === 'linkedinVisitDone') {
            activitiesByWeek[weekKey].linkedInVisits++;
          } else if (activity.type === 'linkedinInviteAccepted') {
            activitiesByWeek[weekKey].linkedInConnects++;
          } else if (activity.type === 'emailsReplied' || activity.type === 'emailReplied' || activity.type === 'linkedinReplied') {
            activitiesByWeek[weekKey].replies++;
          }
        }
      });

      const campaignPerformance = activeCampaigns
        .map(campaign => ({
          name: campaign.name,
          emailReplies: campaignReplies[campaign._id]?.email || 0,
          linkedInReplies: campaignReplies[campaign._id]?.linkedin || 0,
          totalReplies: (campaignReplies[campaign._id]?.email || 0) + (campaignReplies[campaign._id]?.linkedin || 0),
          positiveReplies: campaignReplies[campaign._id]?.positive || 0,
        }))
        .filter(c => c.totalReplies > 0)
        .sort((a, b) => b.totalReplies - a.totalReplies)
        .slice(0, 5);

      const weeklyTrend = Object.keys(activitiesByWeek)
        .sort()
        .slice(-8)
        .map(week => ({
          name: week.replace('W', ' Week '),
          emailOpens: activitiesByWeek[week].emailOpens,
          emailClicks: activitiesByWeek[week].emailClicks,
          linkedInVisits: activitiesByWeek[week].linkedInVisits,
          linkedInConnects: activitiesByWeek[week].linkedInConnects,
          replies: activitiesByWeek[week].replies,
        }));

      const metrics = sortMetrics([
        {
          title: 'Active Campaigns',
          value: formatNumber(activeCampaigns.length),
          comparisonText: '→ Same',
          icon: MailIcon,
        },
        {
          title: 'Total Engagements',
          value: formatNumber(currentMetrics.totalEngagements),
          comparisonText: formatComparison(currentMetrics.totalEngagements, previousMetrics.totalEngagements),
          icon: MailIcon,
        },
        {
          title: 'Email Opens',
          value: `${formatNumber(currentMetrics.email.opens)} (${currentMetrics.email.openRate.toFixed(1)}%)`,
          comparisonText: formatComparison(currentMetrics.email.opens, previousMetrics.email.opens),
          icon: MailIcon,
        },
        {
          title: 'LinkedIn Connections',
          value: `${formatNumber(currentMetrics.linkedin.connectionsAccepted)} accepted`,
          comparisonText: formatComparison(currentMetrics.linkedin.connectionsAccepted, previousMetrics.linkedin.connectionsAccepted),
          icon: MailIcon,
        },
        {
          title: 'Positive Replies',
          value: formatNumber(currentMetrics.totalPositive),
          comparisonText: formatComparison(currentMetrics.totalPositive, previousMetrics.totalPositive),
          icon: MailIcon,
        },
        {
          title: 'Reply Rate',
          value: `${currentMetrics.overallReplyRate.toFixed(1)}%`,
          comparisonText: formatComparison(currentMetrics.overallReplyRate, previousMetrics.overallReplyRate, true),
          icon: MailIcon,
        },
        {
          title: 'Click Rate',
          value: `${currentMetrics.email.clickRate.toFixed(1)}%`,
          comparisonText: formatComparison(currentMetrics.email.clickRate, previousMetrics.email.clickRate, true),
          icon: MailIcon,
        },
      ]);

      const funnelData = [
        {
          name: 'Leads Contacted',
          value: currentMetrics.totalContacted,
          percentage: 100,
        },
        {
          name: 'Email Sent',
          value: currentMetrics.email.sent,
          percentage: currentMetrics.totalContacted > 0 ? calculatePercentage(currentMetrics.email.sent, currentMetrics.totalContacted) : 0,
        },
        {
          name: 'LinkedIn Visited',
          value: currentMetrics.linkedin.visited,
          percentage: currentMetrics.totalContacted > 0 ? calculatePercentage(currentMetrics.linkedin.visited, currentMetrics.totalContacted) : 0,
        },
        {
          name: 'Email Opened',
          value: currentMetrics.email.opens,
          percentage: currentMetrics.email.sent > 0 ? calculatePercentage(currentMetrics.email.opens, currentMetrics.email.sent) : 0,
        },
        {
          name: 'Email Clicked',
          value: currentMetrics.email.clicks,
          percentage: currentMetrics.email.opens > 0 ? calculatePercentage(currentMetrics.email.clicks, currentMetrics.email.opens) : 0,
        },
        {
          name: 'Connection Sent',
          value: currentMetrics.linkedin.invitesSent,
          percentage: currentMetrics.linkedin.visited > 0 ? calculatePercentage(currentMetrics.linkedin.invitesSent, currentMetrics.linkedin.visited) : 0,
        },
        {
          name: 'Total Replies',
          value: currentMetrics.totalReplies,
          percentage: currentMetrics.totalContacted > 0 ? calculatePercentage(currentMetrics.totalReplies, currentMetrics.totalContacted) : 0,
        },
        {
          name: 'Positive',
          value: currentMetrics.totalPositive,
          percentage: currentMetrics.totalReplies > 0 ? calculatePercentage(currentMetrics.totalPositive, currentMetrics.totalReplies) : 0,
        },
      ];

      const channelComparison = [
        {
          name: 'Engagement Rate',
          email: currentMetrics.email.openRate,
          linkedin: currentMetrics.linkedin.connectionRate,
        },
        {
          name: 'Reply Rate',
          email: currentMetrics.email.replyRate,
          linkedin: currentMetrics.linkedin.replyRate,
        },
        {
          name: 'Positive Rate',
          email: currentMetrics.email.replies > 0 ? calculatePercentage(currentMetrics.email.positive, currentMetrics.email.replies) : 0,
          linkedin: currentMetrics.linkedin.replies > 0 ? calculatePercentage(currentMetrics.linkedin.positive, currentMetrics.linkedin.replies) : 0,
        },
      ];

      const topCampaigns = campaignPerformance.map(c => ({
        name: c.name.length > 40 ? c.name.substring(0, 40) + '...' : c.name,
        value: c.totalReplies,
      }));

      const contacted = currentMetrics.totalContacted;
      const opened = currentMetrics.email.opens;
      const clickedOrAccepted = currentMetrics.email.clicks + currentMetrics.linkedin.connectionsAccepted;
      const replied = currentMetrics.totalReplies;
      const interested = currentMetrics.totalPositive;

      const leadFunnel = [
        {
          name: 'Contacted',
          value: contacted,
          percentage: contacted > 0 ? 100 : 0,
        },
        {
          name: 'Opened',
          value: opened,
          percentage: contacted > 0 ? calculatePercentage(opened, contacted) : 0,
        },
        {
          name: 'Clicked or Accepted invitation',
          value: clickedOrAccepted,
          percentage: contacted > 0 ? calculatePercentage(clickedOrAccepted, contacted) : 0,
        },
        {
          name: 'Replied',
          value: replied,
          percentage: contacted > 0 ? calculatePercentage(replied, contacted) : 0,
        },
        {
          name: 'Interested',
          value: interested,
          percentage: contacted > 0 ? calculatePercentage(interested, contacted) : 0,
        },
      ];

      clearTimeout(timeoutId);

      return NextResponse.json(
        {
          data: {
            metrics,
            leadFunnel: {
              title: 'Lead Funnel Overview',
              description: 'Complete journey from contact to interested lead',
              data: leadFunnel,
            },
            multichannelFunnel: {
              title: 'Multichannel Engagement Funnel',
              description: 'Shows the full multichannel journey from contact to positive reply',
              data: funnelData,
            },
            channelComparison: {
              title: 'Channel Performance Comparison',
              description: 'Side-by-side comparison of email vs LinkedIn performance',
              data: channelComparison,
            },
            campaignLeaderboard: {
              title: 'Campaign Performance Leaderboard',
              description: 'Top campaigns by total replies (Email + LinkedIn)',
              data: topCampaigns,
              valueLabel: 'Replies',
            },
            weeklyTrend: {
              title: 'Weekly Activity Trend',
              description: 'Email and LinkedIn activities over time',
              data: weeklyTrend,
            },
          },
        },
        {
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_REVALIDATE}, stale-while-revalidate=60`,
          },
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('[Lemlist Route] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Lemlist dashboard data' },
      { status: 500 }
    );
  }
}
