import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';
import { MailIcon } from '@/components/icons';
import { sortMetrics } from '@/lib/utils/metric-order';

const LEMLIST_BASE_URL = process.env.LEMLIST_BASE_URL || 'https://api.lemlist.com/api';
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '20000', 10);

function createBasicAuth(email: string, apiKey: string): string {
  const credentials = Buffer.from(`${email}:${apiKey}`).toString('base64');
  return `Basic ${credentials}`;
}

interface Activity {
  _id: string;
  type: string;
  campaignId?: string;
  leadId?: string;
  email?: string;
  createdAt: string;
  isFirst?: boolean;
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
      cache: 'no-store',
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
        cache: 'no-store',
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
    opened: number;
    openRate: number;
  };
  totalReplies: number;
  totalPositive: number;
  overallReplyRate: number;
  bounced: number;
  clicked: number;
}

function calculateMetrics(activities: Activity[]): Metrics {
  // Count ALL unique leads contacted during date range (not just first contacts)
  const contacted = new Set<string>();
  const contactActivities = activities.filter(a => 
    ['emailsSent', 'emailSent', 'linkedinSent', 'linkedinInviteDone', 'linkedInInvites'].includes(a.type)
  );
  
  // Count all unique leads contacted, regardless of whether it's their first contact
  contactActivities.forEach(a => {
    if (a.leadId) contacted.add(a.leadId);
    if (a.email) contacted.add(a.email);
  });

  const totalContacted = contacted.size;

  // Count unique leads for email metrics
  const emailSent = new Set<string>();
  activities
    .filter(a => ['emailsSent', 'emailSent'].includes(a.type))
    .forEach(a => {
      if (a.leadId) emailSent.add(a.leadId);
      if (a.email) emailSent.add(a.email);
    });

  const emailOpened = new Set<string>();
  activities
    .filter(a => ['emailsOpened', 'emailOpened'].includes(a.type))
    .forEach(a => {
      if (a.leadId) emailOpened.add(a.leadId);
      if (a.email) emailOpened.add(a.email);
    });

  const emailClicked = new Set<string>();
  activities
    .filter(a => ['emailsClicked', 'emailClicked', 'linkClicked'].includes(a.type))
    .forEach(a => {
      if (a.leadId) emailClicked.add(a.leadId);
      if (a.email) emailClicked.add(a.email);
    });

  const emailReplied = new Set<string>();
  activities
    .filter(a => ['emailsReplied', 'emailReplied'].includes(a.type))
    .forEach(a => {
      if (a.leadId) emailReplied.add(a.leadId);
      if (a.email) emailReplied.add(a.email);
    });

  const emailPositive = new Set<string>();
  activities
    .filter(a => ['emailsInterested', 'apiInterested', 'aircallInterested', 'manualInterested'].includes(a.type))
    .forEach(a => {
      if (a.leadId) emailPositive.add(a.leadId);
      if (a.email) emailPositive.add(a.email);
    });

  // Count unique leads for LinkedIn metrics
  const linkedinSent = new Set<string>();
  activities
    .filter(a => ['linkedinSent', 'linkedinInviteDone', 'linkedInInvites'].includes(a.type))
    .forEach(a => {
      if (a.leadId) linkedinSent.add(a.leadId);
      if (a.email) linkedinSent.add(a.email);
    });

  const linkedinOpened = new Set<string>();
  activities
    .filter(a => a.type === 'linkedinOpened')
    .forEach(a => {
      if (a.leadId) linkedinOpened.add(a.leadId);
      if (a.email) linkedinOpened.add(a.email);
    });

  const linkedinAccepted = new Set<string>();
  activities
    .filter(a => a.type === 'linkedinInviteAccepted')
    .forEach(a => {
      if (a.leadId) linkedinAccepted.add(a.leadId);
      if (a.email) linkedinAccepted.add(a.email);
    });

  const linkedinReplied = new Set<string>();
  activities
    .filter(a => a.type === 'linkedinReplied')
    .forEach(a => {
      if (a.leadId) linkedinReplied.add(a.leadId);
      if (a.email) linkedinReplied.add(a.email);
    });

  const linkedinPositive = new Set<string>();
  activities
    .filter(a => ['linkedinInterested', 'aircallInterested', 'apiInterested', 'manualInterested'].includes(a.type))
    .forEach(a => {
      // Only count if it's a LinkedIn lead (check if they have LinkedIn activities)
      const hasLinkedInActivity = activities.some(
        other => (other.leadId === a.leadId || other.email === a.email) &&
        ['linkedinSent', 'linkedinInviteDone', 'linkedInInvites', 'linkedinReplied'].includes(other.type)
      );
      if (hasLinkedInActivity) {
        if (a.leadId) linkedinPositive.add(a.leadId);
        if (a.email) linkedinPositive.add(a.email);
      }
    });

  // Count LinkedIn messages sent (for reply rate calculation)
  const linkedinMessages = new Set<string>();
  activities
    .filter(a => ['linkedInMessages', 'linkedinSent'].includes(a.type))
    .forEach(a => {
      if (a.leadId) linkedinMessages.add(a.leadId);
      if (a.email) linkedinMessages.add(a.email);
    });

  // Count LinkedIn visits (for backward compatibility)
  const linkedInVisited = new Set<string>();
  activities
    .filter(a => ['linkedinVisitDone'].includes(a.type))
    .forEach(a => {
      if (a.leadId) linkedInVisited.add(a.leadId);
      if (a.email) linkedInVisited.add(a.email);
    });

  // Count bounced/failed emails
  const bounced = new Set<string>();
  activities
    .filter(a => ['emailsBounced', 'emailsFailed'].includes(a.type))
    .forEach(a => {
      if (a.leadId) bounced.add(a.leadId);
      if (a.email) bounced.add(a.email);
    });

  // Count total clicked (email + LinkedIn accepted)
  const clicked = new Set<string>();
  emailClicked.forEach(id => clicked.add(id));
  linkedinAccepted.forEach(id => clicked.add(id));

  // Calculate totals - totalReplies should be union of all unique leads who replied (not sum, to avoid double-counting)
  const allReplied = new Set<string>();
  emailReplied.forEach(id => allReplied.add(id));
  linkedinReplied.forEach(id => allReplied.add(id));
  const totalReplies = allReplied.size;
  const allInterested = new Set<string>();
  emailPositive.forEach(id => allInterested.add(id));
  linkedinPositive.forEach(id => allInterested.add(id));
  // Also include any other interested activities that weren't categorized
  activities
    .filter(a => ['aircallInterested', 'apiInterested', 'manualInterested'].includes(a.type))
    .forEach(a => {
      if (a.leadId) allInterested.add(a.leadId);
      if (a.email) allInterested.add(a.email);
    });
  const totalPositive = allInterested.size;

  // Ensure reply rate is 0 when there are no replies
  const calculatedReplyRate = totalContacted > 0 && totalReplies > 0 
    ? calculatePercentage(totalReplies, totalContacted) 
    : 0;

  return {
    totalContacted,
    totalEngagements: emailOpened.size + emailClicked.size + linkedinAccepted.size,
    email: {
      sent: emailSent.size,
      opens: emailOpened.size,
      openRate: emailSent.size > 0 ? calculatePercentage(emailOpened.size, emailSent.size) : 0,
      clicks: emailClicked.size,
      clickRate: emailSent.size > 0 ? calculatePercentage(emailClicked.size, emailSent.size) : 0,
      replies: emailReplied.size,
      positive: emailPositive.size,
      replyRate: emailSent.size > 0 ? calculatePercentage(emailReplied.size, emailSent.size) : 0,
    },
    linkedin: {
      visited: linkedInVisited.size,
      invitesSent: linkedinSent.size,
      connectionsAccepted: linkedinAccepted.size,
      connectionRate: linkedinSent.size > 0 ? calculatePercentage(linkedinAccepted.size, linkedinSent.size) : 0,
      messagesSent: linkedinMessages.size,
      replies: linkedinReplied.size,
      positive: linkedinPositive.size,
      replyRate: linkedinMessages.size > 0 ? calculatePercentage(linkedinReplied.size, linkedinMessages.size) : 0,
      opened: linkedinOpened.size,
      openRate: linkedinSent.size > 0 ? calculatePercentage(linkedinOpened.size, linkedinSent.size) : 0,
    },
    totalReplies,
    totalPositive,
    overallReplyRate: calculatedReplyRate,
    bounced: bounced.size,
    clicked: clicked.size,
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
    const lemlistEmail = apiKeys?.lemlistEmail;

    if (!lemlistApiKey) {
      return NextResponse.json(
        { error: 'Lemlist API key not configured for this tenant' },
        { status: 400 }
      );
    }

    if (!lemlistEmail) {
      return NextResponse.json(
        { error: 'Lemlist email not configured for this tenant' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const campaigns = await fetchCampaigns(lemlistEmail, lemlistApiKey, controller.signal);
      const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'running' || !c.status);
      
      if (!startDate || !endDate) {
        clearTimeout(timeoutId);
        return NextResponse.json(
          { error: 'startDate and endDate query parameters are required' },
          { status: 400 }
        );
      }

      if (campaigns.length === 0) {
        clearTimeout(timeoutId);
        return NextResponse.json({ data: { metrics: [] } });
      }

      const previousPeriod = calculatePreviousPeriod(startDate, endDate);

      const [currentActivities, previousActivities] = await Promise.all([
        fetchAllActivities(lemlistEmail, lemlistApiKey, controller.signal, startDate, endDate),
        fetchAllActivities(lemlistEmail, lemlistApiKey, controller.signal, previousPeriod.start, previousPeriod.end),
      ]);

      if (process.env.NODE_ENV === 'development') {
        console.log('[Lemlist Route] Activities fetched:', {
          currentCount: currentActivities.length,
          previousCount: previousActivities.length,
        });
      }

      let currentMetrics: Metrics;
      let previousMetrics: Metrics;
      
      try {
        currentMetrics = calculateMetrics(currentActivities);
        previousMetrics = calculateMetrics(previousActivities);
        if (process.env.NODE_ENV === 'development') {
          console.log('[Lemlist Route] Metrics calculated:', {
            currentContacted: currentMetrics.totalContacted,
            currentReplies: currentMetrics.totalReplies,
            currentPositive: currentMetrics.totalPositive,
          });
        }
      } catch (metricsError) {
        console.error('[Lemlist Route] Error calculating metrics:', metricsError);
        throw new Error(`Failed to calculate metrics: ${metricsError instanceof Error ? metricsError.message : 'Unknown error'}`);
      }

      const campaignReplies: Record<string, { email: number; linkedin: number; positive: number }> = {};
      const campaignContacted: Record<string, Set<string>> = {};
      const activitiesByWeek: Record<string, {
        emailOpens: number;
        emailClicks: number;
        linkedInVisits: number;
        linkedInConnects: number;
        linkedInConnectionRequests: number;
        replies: Set<string>; // Changed to Set to count unique leads
      }> = {};

      currentActivities.forEach(activity => {
        if (activity.campaignId) {
          if (!campaignReplies[activity.campaignId]) {
            campaignReplies[activity.campaignId] = { email: 0, linkedin: 0, positive: 0 };
          }
          if (!campaignContacted[activity.campaignId]) {
            campaignContacted[activity.campaignId] = new Set<string>();
          }
          
          if (activity.type === 'emailsReplied' || activity.type === 'emailReplied') {
            campaignReplies[activity.campaignId].email++;
          } else if (activity.type === 'linkedinReplied') {
            campaignReplies[activity.campaignId].linkedin++;
          } else if (activity.type === 'emailsInterested' || activity.type === 'apiInterested' || activity.type === 'linkedinInterested') {
            campaignReplies[activity.campaignId].positive++;
          }
          
          if (['emailsSent', 'emailSent', 'linkedinSent', 'linkedinInviteDone', 'linkedInInvites'].includes(activity.type)) {
            if (activity.leadId) campaignContacted[activity.campaignId].add(activity.leadId);
            if (activity.email) campaignContacted[activity.campaignId].add(activity.email);
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
              linkedInConnectionRequests: 0,
              replies: new Set<string>(), // Changed to Set to count unique leads
            };
          }

          if (activity.type === 'emailsOpened' || activity.type === 'emailOpened') {
            activitiesByWeek[weekKey].emailOpens++;
          } else if (activity.type === 'emailsClicked' || activity.type === 'emailClicked' || activity.type === 'linkClicked') {
            activitiesByWeek[weekKey].emailClicks++;
          } else if (activity.type === 'linkedinVisitDone') {
            activitiesByWeek[weekKey].linkedInVisits++;
          } else if (activity.type === 'linkedInInvites' || activity.type === 'linkedinInviteDone') {
            activitiesByWeek[weekKey].linkedInConnectionRequests++;
          } else if (activity.type === 'linkedinInviteAccepted') {
            activitiesByWeek[weekKey].linkedInConnects++;
          } else if (activity.type === 'emailsReplied' || activity.type === 'emailReplied' || activity.type === 'linkedinReplied') {
            // Count unique leads who replied, not all reply events
            if (activity.leadId) activitiesByWeek[weekKey].replies.add(activity.leadId);
            if (activity.email) activitiesByWeek[weekKey].replies.add(activity.email);
          }
        }
      });

      const campaignPerformance = activeCampaigns
        .map(campaign => ({
          name: campaign.name,
          emailReplies: campaignReplies[campaign._id]?.email || 0,
          linkedInReplies: campaignReplies[campaign._id]?.linkedin || 0,
          totalReplies: (campaignReplies[campaign._id]?.email || 0) + (campaignReplies[campaign._id]?.linkedin || 0),
          totalContacted: campaignContacted[campaign._id]?.size || 0,
          positiveReplies: campaignReplies[campaign._id]?.positive || 0,
        }))
        .sort((a, b) => b.totalReplies - a.totalReplies);

      const weeklyTrend = Object.keys(activitiesByWeek)
        .sort()
        .slice(-8)
        .map(week => ({
          name: week.replace('W', ' Week '),
          emailOpens: activitiesByWeek[week].emailOpens,
          emailClicks: activitiesByWeek[week].emailClicks,
          linkedInVisits: activitiesByWeek[week].linkedInVisits,
          linkedInConnects: activitiesByWeek[week].linkedInConnects,
          linkedInConnectionRequests: activitiesByWeek[week].linkedInConnectionRequests,
          linkedInAccepted: activitiesByWeek[week].linkedInConnects,
          replies: activitiesByWeek[week].replies.size, // Count unique leads, not all events
        }));

      const metrics = sortMetrics([
        {
          title: 'Total Contacted',
          value: formatNumber(currentMetrics.totalContacted),
          comparisonText: formatComparison(currentMetrics.totalContacted, previousMetrics.totalContacted),
          icon: MailIcon,
        },
        {
          title: 'Opened or Connected',
          value: formatNumber(currentMetrics.email.opens),
          comparisonText: formatComparison(currentMetrics.email.opens, previousMetrics.email.opens),
          icon: MailIcon,
        },
        {
          title: 'LinkedIn Accepted',
          value: formatNumber(currentMetrics.linkedin.connectionsAccepted),
          comparisonText: formatComparison(currentMetrics.linkedin.connectionsAccepted, previousMetrics.linkedin.connectionsAccepted),
          icon: MailIcon,
        },
        {
          title: 'Reply Rate',
          value: `${currentMetrics.overallReplyRate.toFixed(1)}%`,
          comparisonText: formatComparison(currentMetrics.overallReplyRate, previousMetrics.overallReplyRate, true),
          icon: MailIcon,
        },
        {
          title: 'Positive Replies',
          value: formatNumber(currentMetrics.totalPositive),
          comparisonText: formatComparison(currentMetrics.totalPositive, previousMetrics.totalPositive),
          icon: MailIcon,
        },
      ]);

      const linkedInSent = currentMetrics.linkedin.invitesSent;

      const channelComparison = [
        {
          name: 'Contacted',
          email: currentMetrics.email.sent,
          linkedin: linkedInSent,
          emailPercentage: currentMetrics.email.sent > 0 ? 100 : 0,
          linkedinPercentage: linkedInSent > 0 ? 100 : 0,
        },
        {
          name: 'Opened or Accepted invitation',
          email: currentMetrics.email.opens,
          linkedin: currentMetrics.linkedin.connectionsAccepted,
          emailPercentage: currentMetrics.email.sent > 0 ? calculatePercentage(currentMetrics.email.opens, currentMetrics.email.sent) : 0,
          linkedinPercentage: linkedInSent > 0 ? calculatePercentage(currentMetrics.linkedin.connectionsAccepted, linkedInSent) : 0,
        },
        {
          name: 'Replied',
          email: currentMetrics.email.replies,
          linkedin: currentMetrics.linkedin.replies,
          emailPercentage: currentMetrics.email.sent > 0 ? calculatePercentage(currentMetrics.email.replies, currentMetrics.email.sent) : 0,
          linkedinPercentage: linkedInSent > 0 ? calculatePercentage(currentMetrics.linkedin.replies, linkedInSent) : 0,
        },
        {
          name: 'Interested',
          email: currentMetrics.email.positive,
          linkedin: currentMetrics.linkedin.positive,
          emailPercentage: currentMetrics.email.sent > 0 ? calculatePercentage(currentMetrics.email.positive, currentMetrics.email.sent) : 0,
          linkedinPercentage: linkedInSent > 0 ? calculatePercentage(currentMetrics.linkedin.positive, linkedInSent) : 0,
        },
      ];

      const topCampaigns = campaignPerformance.map(c => ({
        name: c.name.length > 40 ? c.name.substring(0, 40) + '...' : c.name,
        value: c.totalReplies,
        totalContacted: c.totalContacted,
      }));

      const contacted = currentMetrics.totalContacted;
      const delivered = contacted - currentMetrics.bounced;
      const opened = currentMetrics.email.opens;
      const clicked = currentMetrics.clicked;
      const replied = currentMetrics.totalReplies;
      const interested = currentMetrics.totalPositive;
      const linkedinAccepted = currentMetrics.linkedin.connectionsAccepted;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Lemlist API] Final metrics:`, {
          replied,
          contacted,
          emailReplies: currentMetrics.email.replies,
          linkedinReplies: currentMetrics.linkedin.replies,
          totalReplies: currentMetrics.totalReplies,
        });
      }

      const replyRate = contacted > 0 ? calculatePercentage(replied, contacted) : 0;
      const interestedRate = contacted > 0 ? calculatePercentage(interested, contacted) : 0;

      const executiveSummary = {
        totalContacted: contacted,
        emailsOpened: opened,
        linkedinAccepted: linkedinAccepted,
        replyRate: replyRate,
        totalReplies: replied,
        positiveReplies: interested,
      };

      const performanceFunnel = [
        {
          name: 'Contacted',
          value: contacted,
          percentage: contacted > 0 ? 100 : 0,
        },
        {
          name: 'Delivered',
          value: delivered,
          percentage: contacted > 0 ? calculatePercentage(delivered, contacted) : 0,
        },
        {
          name: 'Opened',
          value: opened,
          percentage: delivered > 0 ? calculatePercentage(opened, delivered) : 0,
        },
        {
          name: 'Clicked',
          value: clicked,
          percentage: opened > 0 ? calculatePercentage(clicked, opened) : 0,
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

      const channelBreakdown = {
        email: {
          sent: currentMetrics.email.sent,
          openRate: currentMetrics.email.openRate,
          clickRate: currentMetrics.email.clickRate,
          replyRate: currentMetrics.email.replyRate,
        },
        linkedin: {
          sent: linkedInSent,
          openRate: currentMetrics.linkedin.openRate,
          acceptRate: currentMetrics.linkedin.connectionRate,
          replyRate: currentMetrics.linkedin.replyRate,
        },
      };

      const engagementQuality = {
        positiveResponses: interested,
        totalReplies: replied,
      };

      const leadFunnel = [
        {
          name: 'Contacted',
          value: contacted,
          percentage: contacted > 0 ? 100 : 0,
        },
        {
          name: 'Opened or Accepted invitation',
          value: opened + linkedinAccepted,
          percentage: contacted > 0 ? calculatePercentage(opened + linkedinAccepted, contacted) : 0,
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
            executiveSummary,
            performanceFunnel,
            channelBreakdown,
            engagementQuality,
            leadFunnel: {
              title: 'Lead Funnel Overview',
              description: 'Complete journey from contact to interested lead',
              data: leadFunnel,
            },
            channelComparison: {
              title: 'Channel Breakdown',
              description: 'Side-by-side comparison of email vs LinkedIn performance',
              data: channelComparison,
            },
            campaignLeaderboard: {
              title: 'Campaign Performance',
              description: 'All campaigns by total replies (Email + LinkedIn) and total contacted',
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
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[Lemlist Route] Error details:', { errorMessage, errorStack });
    return NextResponse.json(
      { 
        error: 'Failed to fetch Lemlist dashboard data',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}
