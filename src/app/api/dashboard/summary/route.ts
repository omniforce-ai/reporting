import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';
import { getEnabledFeatures } from '@/lib/utils/features';
import { sortMetrics } from '@/lib/utils/metric-order';

const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10;
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
    
    const enabledFeatures = getEnabledFeatures(tenant);
    const emailFeatures = enabledFeatures.filter(f => f === 'smartlead' || f === 'lemlist');
    
    if (emailFeatures.length === 0) {
        return NextResponse.json({
          data: {
            metrics: [],
          },
        });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const url = new URL(request.url);
      let baseUrl: string;
      
      if (process.env.NODE_ENV === 'development') {
        const host = request.headers.get('host') || url.host;
        const protocol = url.protocol || 'http:';
        baseUrl = `${protocol}//${host}`;
      } else {
        const host = request.headers.get('host') || url.host;
        const protocol = url.protocol || 'https:';
        baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}//${host}`;
      }
      
      const dateRange = startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : '';
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Summary API] Fetching data for features: ${emailFeatures.join(', ')}`);
        console.log(`[Summary API] Base URL: ${baseUrl}`);
      }
      
      const previousPeriod = startDate && endDate ? calculatePreviousPeriod(startDate, endDate) : null;
      const prevDateRange = previousPeriod ? `&startDate=${previousPeriod.start}&endDate=${previousPeriod.end}` : '';

      const allFetchPromises: Promise<{ feature: string; data: any; period: 'current' | 'previous' } | null>[] = [];

      emailFeatures.forEach(feature => {
        const endpoint = feature === 'smartlead' ? '/api/dashboard/email' : '/api/dashboard/lemlist';
        const currentUrl = `${baseUrl}${endpoint}?client=${tenant.subdomain}${dateRange}`;
        
        allFetchPromises.push(
          fetch(currentUrl, {
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'Cookie': request.headers.get('cookie') || '',
              'User-Agent': 'Omniforce-Reporting/1.0',
            },
          }).then(async res => {
            if (!res.ok) {
              const errorText = await res.text().catch(() => '');
              console.error(`[Summary API] Failed to fetch ${feature} current data:`, res.status, errorText.substring(0, 200));
              return null;
            }
            const data = await res.json();
            if (process.env.NODE_ENV === 'development') {
              console.log(`[Summary API] Successfully fetched ${feature} current data:`, {
                hasMetrics: !!(data.data?.metrics || data.metrics),
                metricsCount: (data.data?.metrics || data.metrics || []).length,
              });
            }
            return { feature, data: data.data || data, period: 'current' as const };
          }).catch(err => {
            if (err.name !== 'AbortError') {
              console.error(`[Summary API] Error fetching ${feature} current data:`, err.message);
            }
            return null;
          })
        );

        if (previousPeriod) {
          const prevUrl = `${baseUrl}${endpoint}?client=${tenant.subdomain}${prevDateRange}`;
          allFetchPromises.push(
            fetch(prevUrl, {
              signal: controller.signal,
              headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || '',
                'User-Agent': 'Omniforce-Reporting/1.0',
              },
            }).then(async res => {
              if (!res.ok) return null;
              const data = await res.json();
              return { feature, data: data.data || data, period: 'previous' as const };
            }).catch(() => null)
          );
        }
      });

      const allResults = await Promise.all(allFetchPromises);
      const validResults = allResults.filter((r): r is { feature: string; data: any; period: 'current' | 'previous' } => r !== null);

      if (validResults.length === 0) {
        clearTimeout(timeoutId);
        return NextResponse.json({
          data: {
            metrics: [],
          },
        });
      }

      const currentResults = validResults.filter(r => r.period === 'current');
      const prevValidResults = previousPeriod ? validResults.filter(r => r.period === 'previous') : [];

      let previousPeriodTotals: {
        emailsSent: number;
        emailsOpened: number;
        replies: number;
        positiveReplies: number;
        campaigns: number;
      } | null = null;

      if (prevValidResults.length > 0) {

        previousPeriodTotals = prevValidResults.reduce((acc, result) => {
          if (!result) return acc;
          const data = result.data;
          
          if (result.feature === 'smartlead') {
            const metrics = data.metrics || [];
            const conversationsMetric = metrics.find((m: any) => m.title === 'Conversations Started');
            const replyRateMetric = metrics.find((m: any) => m.title === 'Reply Rate');
            const positiveRepliesMetric = metrics.find((m: any) => m.title === 'Positive Replies');
            const openRateMetric = metrics.find((m: any) => m.title === 'Open Rate');
            const campaignsMetric = metrics.find((m: any) => m.title === 'Active Campaigns');
            
            acc.replies += parseInt(conversationsMetric?.value?.replace(/,/g, '') || '0', 10);
            acc.positiveReplies += parseInt(positiveRepliesMetric?.value?.replace(/,/g, '') || '0', 10);
            acc.campaigns += parseInt(campaignsMetric?.value?.replace(/,/g, '') || '0', 10);
          } else if (result.feature === 'lemlist') {
            const metrics = data.metrics || [];
            const totalContactedMetric = metrics.find((m: any) => m.title === 'Total Contacted');
            const emailsOpenedMetric = metrics.find((m: any) => m.title === 'Opened or Connected');
            const positiveRepliesMetric = metrics.find((m: any) => m.title === 'Positive Replies');
            
            acc.emailsSent += parseInt(totalContactedMetric?.value?.replace(/,/g, '') || '0', 10);
            acc.emailsOpened += parseInt(emailsOpenedMetric?.value?.replace(/,/g, '') || '0', 10);
            acc.positiveReplies += parseInt(positiveRepliesMetric?.value?.replace(/,/g, '') || '0', 10);
          }
          
          return acc;
        }, {
          emailsSent: 0,
          emailsOpened: 0,
          replies: 0,
          positiveReplies: 0,
          campaigns: 0,
        });
      }

      clearTimeout(timeoutId);

      const aggregated = currentResults.reduce((acc, result) => {
        if (!result) return acc;
        const data = result.data;
        
        if (result.feature === 'smartlead') {
          const metrics = data.metrics || [];
          const conversationsMetric = metrics.find((m: any) => m.title === 'Conversations Started');
          const positiveRepliesMetric = metrics.find((m: any) => m.title === 'Positive Replies');
          const campaignsMetric = metrics.find((m: any) => m.title === 'Active Campaigns');
          
          acc.replies += parseInt(conversationsMetric?.value?.replace(/,/g, '') || '0', 10);
          acc.positiveReplies += parseInt(positiveRepliesMetric?.value?.replace(/,/g, '') || '0', 10);
          acc.campaigns += parseInt(campaignsMetric?.value?.replace(/,/g, '') || '0', 10);
          
          if (data.conversationFunnel?.data) {
            const funnelData = data.conversationFunnel.data;
            const emailsSentFromFunnel = funnelData.find((f: any) => f.name === 'Leads Contacted')?.value || 0;
            acc.emailsSent += emailsSentFromFunnel;
            acc.funnelData = data.conversationFunnel;
          }
          
          if (data.campaignLeaderboard) {
            acc.campaignLeaderboards.push(data.campaignLeaderboard);
          }
          
        } else if (result.feature === 'lemlist') {
          const metrics = data.metrics || [];
          const totalContactedMetric = metrics.find((m: any) => m.title === 'Total Contacted');
          const emailsOpenedMetric = metrics.find((m: any) => m.title === 'Opened or Connected');
          const replyRateMetric = metrics.find((m: any) => m.title === 'Reply Rate');
          const positiveRepliesMetric = metrics.find((m: any) => m.title === 'Positive Replies');
          
          const totalContacted = parseInt(totalContactedMetric?.value?.replace(/,/g, '') || '0', 10);
          acc.emailsSent += totalContacted;
          acc.emailsOpened += parseInt(emailsOpenedMetric?.value?.replace(/,/g, '') || '0', 10);
          acc.positiveReplies += parseInt(positiveRepliesMetric?.value?.replace(/,/g, '') || '0', 10);
          
        }
        
        return acc;
      }, {
        emailsSent: 0,
        emailsOpened: 0,
        replies: 0,
        positiveReplies: 0,
        campaigns: 0,
        funnelData: null as any,
        campaignLeaderboards: [] as any[],
      });

      const previousReplies = previousPeriodTotals?.replies || 0;
      const previousPositiveReplies = previousPeriodTotals?.positiveReplies || 0;
      const previousCampaigns = previousPeriodTotals?.campaigns || 0;
      const previousEmailsSent = previousPeriodTotals?.emailsSent || 0;

      const totalContacted = aggregated.emailsSent;
      const emailsOpened = aggregated.emailsOpened;
      const totalReplies = aggregated.replies;
      const replyRate = totalContacted > 0 ? calculatePercentage(totalReplies, totalContacted) : 0;
      
      const previousTotalContacted = previousPeriodTotals?.emailsSent || 0;
      const previousEmailsOpened = previousPeriodTotals?.emailsOpened || 0;
      const previousReplyRate = previousTotalContacted > 0 ? calculatePercentage(previousReplies, previousTotalContacted) : 0;

      const metrics = sortMetrics([
        {
          title: 'Total Contacted',
          value: formatNumber(totalContacted),
          comparisonText: previousPeriodTotals
            ? formatComparison(totalContacted, previousTotalContacted)
            : '→ Same',
        },
        {
          title: 'Opened or Connected',
          value: formatNumber(emailsOpened),
          comparisonText: previousPeriodTotals
            ? formatComparison(emailsOpened, previousEmailsOpened)
            : '→ Same',
        },
        {
          title: 'Replies',
          value: formatNumber(totalReplies),
          comparisonText: previousPeriodTotals
            ? formatComparison(totalReplies, previousReplies)
            : '→ Same',
        },
        {
          title: 'Reply Rate',
          value: `${replyRate.toFixed(1)}%`,
          comparisonText: previousPeriodTotals
            ? formatComparison(replyRate, previousReplyRate, true)
            : '→ Same',
        },
        {
          title: 'Positive Replies',
          value: formatNumber(aggregated.positiveReplies),
          comparisonText: previousPeriodTotals
            ? formatComparison(aggregated.positiveReplies, previousPositiveReplies)
            : '→ Same',
        },
      ]);

      const combinedCampaignLeaderboard = aggregated.campaignLeaderboards
        .flatMap(lb => lb.data || [])
        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
        .slice(0, 10);

      const dashboardData = {
        metrics: metrics,
        conversationFunnel: aggregated.funnelData || null,
        campaignLeaderboard: combinedCampaignLeaderboard.length > 0 ? {
          title: 'Top Campaigns by Performance',
          description: 'Best performing campaigns across all platforms',
          data: combinedCampaignLeaderboard,
          valueLabel: 'Replies',
        } : null,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Summary API] Returning aggregated data:`, {
        metricsCount: metrics.length,
        hasFunnel: !!dashboardData.conversationFunnel,
        hasLeaderboard: !!dashboardData.campaignLeaderboard,
        aggregatedValues: {
          replies: aggregated.replies,
          positiveReplies: aggregated.positiveReplies,
          emailsSent: aggregated.emailsSent,
          campaigns: aggregated.campaigns,
        },
        });
      }

      return NextResponse.json(
        { data: dashboardData },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
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
    console.error('Error fetching summary dashboard data:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch summary dashboard data',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

