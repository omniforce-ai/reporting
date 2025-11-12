'use client';

import MetricCard from '@/components/MetricCard';
import OverviewCard from '@/components/OverviewCard';
import CampaignsTable from '@/components/CampaignsTable';
import CampaignPerformanceTable from '@/components/CampaignPerformanceTable';
import FontPreview from '@/components/FontPreview';
import { DashboardSkeleton, MetricCardSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { AnalyticsIcon, CheckCircleIcon, ClockIcon, MailIcon, TasksIcon, ThumbsUpIcon, XCircleIcon } from '@/components/icons';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { FeatureDefinition } from '@/lib/config/features';
import { getAllFeatures, getFeatureDefinition } from '@/lib/config/features';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

export default function ClientDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientname = params?.clientname as string | undefined;
  
  // Get tab from URL or use null (will be set from enabled features)
  const tabFromUrl = searchParams.get('tab');
  const [activeTabId, setActiveTabId] = useState<string | null>(tabFromUrl || null);
  const [enabledFeatures, setEnabledFeatures] = useState<FeatureDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailData, setEmailData] = useState<any>(null);
  const [isLoadingEmailData, setIsLoadingEmailData] = useState(false);
  const [emailDataError, setEmailDataError] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<{ subdomain: string; name: string; apiSource: 'smartlead' | 'lemlist' | null } | null>(null);
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  
  // Memoize date range calculations to avoid recreating on every render
  const getDefaultDateRange = useCallback(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 14);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, []);
  
  const getPresetRange = useCallback((preset: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let start: Date;
    let end: Date = new Date(today);
    
    switch (preset) {
      case 'last7':
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        break;
      case 'last14':
        start = new Date(today);
        start.setDate(today.getDate() - 13);
        break;
      case 'last30':
        start = new Date(today);
        start.setDate(today.getDate() - 29);
        break;
      case 'last90':
        start = new Date(today);
        start.setDate(today.getDate() - 89);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'last3Months':
        start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        break;
      case 'last6Months':
        start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        break;
      default:
        return getDefaultDateRange();
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, []);
  
  const [selectedPreset, setSelectedPreset] = useState<string>('last14');
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const presetLabels: Record<string, string> = {
    last7: 'Last 7 days',
    last14: 'Last 14 days',
    last30: 'Last 30 days',
    last90: 'Last 90 days',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    last3Months: 'Last 3 months',
    last6Months: 'Last 6 months',
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isToday = endDate.toDateString() === today.toDateString();
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (isToday && daysDiff === 6) return 'Last 7 days';
    if (isToday && daysDiff === 13) return 'Last 14 days';
    if (isToday && daysDiff === 29) return 'Last 30 days';
    if (isToday && daysDiff === 89) return 'Last 90 days';
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const yearOptions: Intl.DateTimeFormatOptions = { ...options, year: 'numeric' };
    
    const startFormatted = startDate.getFullYear() === endDate.getFullYear() 
      ? startDate.toLocaleDateString('en-US', options)
      : startDate.toLocaleDateString('en-US', yearOptions);
    const endFormatted = endDate.toLocaleDateString('en-US', yearOptions);
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const handlePresetSelect = (preset: string) => {
    const range = getPresetRange(preset);
    setDateRange(range);
    setSelectedPreset(preset);
  };

  const handleCustomDateChange = () => {
    setSelectedPreset('');
  };

  // Detect if current date range matches a preset
  // Memoize preset detection to avoid recalculating
  useEffect(() => {
    const presets = ['last7', 'last14', 'last30', 'last90', 'thisMonth', 'lastMonth', 'last3Months', 'last6Months'];
    for (const preset of presets) {
      const presetRange = getPresetRange(preset);
      if (presetRange.start === dateRange.start && presetRange.end === dateRange.end) {
        setSelectedPreset(preset);
        return;
      }
    }
    setSelectedPreset('');
  }, [dateRange.start, dateRange.end, getPresetRange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!datePickerRef.current || !event.target) {
        return;
      }

      try {
        const target = event.target as Node;
        if (!datePickerRef.current.contains(target)) {
          setIsDatePickerOpen(false);
        }
      } catch (error) {
        // Element may have been removed from DOM, safely ignore
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  // Get current client info and features - fetch in parallel with dashboard data
  useEffect(() => {
    if (!clientname) return;
    
    let isMounted = true;
    const abortController = new AbortController();
    
    // Use clientname as subdomain immediately to enable parallel fetching
    const subdomain = clientname;
    setClientInfo({
      subdomain,
      name: subdomain.charAt(0).toUpperCase() + subdomain.slice(1).replace(/-/g, ' '),
      apiSource: null,
    });
    
    // Fetch tenant config to get actual name and features
    fetch(`/api/tenant/config?client=${clientname}`, {
      signal: abortController.signal,
    })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch tenant config');
        }
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        
        if (data.tenant) {
          const apiKeys = (data.tenant.apiKeys as { smartlead?: string; lemlist?: string } | null) || {};
          const apiSource = apiKeys.smartlead ? 'smartlead' : apiKeys.lemlist ? 'lemlist' : null;
          const subdomain = data.tenant.subdomain;
          
          setClientInfo({
            subdomain,
            name: data.tenant.name || subdomain,
            apiSource,
          });
          
          // Use enabledFeatures from the config response (already included)
          // API returns array of feature ID strings (e.g., ["smartlead", "lemlist"])
          const featureIds = Array.isArray(data.enabledFeatures) ? data.enabledFeatures : [];
          
          // Convert feature ID strings to feature definition objects
          const features: FeatureDefinition[] = featureIds
            .map((id: string) => getFeatureDefinition(id as any))
            .filter((f: FeatureDefinition | null): f is FeatureDefinition => f !== null);
          
          // Add overview tab if there are enabled features
          const overviewFeature = getFeatureDefinition('overview');
          const featuresWithOverview = features.length > 0 && overviewFeature
            ? [overviewFeature, ...features]
            : features;
          
          setEnabledFeatures(featuresWithOverview);
          
          // Determine active tab - use URL param if valid, otherwise default to overview or first feature
          let determinedTabId: string | null = null;
          
          // Check if tab from URL is valid (exists in enabled features)
          if (tabFromUrl && featuresWithOverview.some(f => f.id === tabFromUrl)) {
            determinedTabId = tabFromUrl;
          } else if (featuresWithOverview.length > 0) {
            // Prefer overview tab, otherwise use first feature
            determinedTabId = featuresWithOverview[0].id === 'overview' 
              ? 'overview' 
              : featuresWithOverview[0].id;
          } else if (apiSource) {
            // Fallback: use API source if no features configured
            const fallbackFeature = getFeatureDefinition(apiSource);
            if (fallbackFeature) {
              determinedTabId = fallbackFeature.id;
              setEnabledFeatures([fallbackFeature]);
            }
          }
          
          // Set active tab - this will trigger the second useEffect to fetch dashboard data
          if (determinedTabId) {
            setActiveTabId(determinedTabId);
            // Update URL if it doesn't match (but don't push to history on initial load)
            if (tabFromUrl !== determinedTabId) {
              const params = new URLSearchParams(searchParams.toString());
              params.set('tab', determinedTabId);
              router.replace(`?${params.toString()}`, { scroll: false });
            }
          }
          
          setLoading(false);
        } else {
          throw new Error('Tenant not found');
        }
      })
      .catch(err => {
        if (!isMounted || err.name === 'AbortError') return;
        console.error('Failed to fetch tenant config:', err);
        setLoading(false);
      });
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [clientname, searchParams]);

  // Sync tab state with URL when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && enabledFeatures.some(f => f.id === tabFromUrl)) {
      setActiveTabId(tabFromUrl);
    }
  }, [searchParams, enabledFeatures]);

  // Fetch data when tab is active and we have client info
  useEffect(() => {
    if (clientInfo?.subdomain) {
      if (activeTabId === 'overview') {
        setIsLoadingEmailData(true);
        const abortController = new AbortController();
        let isMounted = true;
        
        fetch(`/api/dashboard/summary?client=${clientInfo.subdomain}&startDate=${dateRange.start}&endDate=${dateRange.end}`, {
          signal: abortController.signal,
        })
          .then(async res => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.error || 'Failed to fetch overview data');
            }
            return res.json();
          })
          .then(response => {
            if (!isMounted) return;
            
            const dashboardData = response.data || response;
            if (process.env.NODE_ENV === 'development') {
              const replyRateMetric = dashboardData?.metrics?.find((m: any) => m.title === 'Reply Rate');
              const repliesMetric = dashboardData?.metrics?.find((m: any) => m.title === 'Replies');
              const totalContactedMetric = dashboardData?.metrics?.find((m: any) => m.title === 'Total Contacted');
              console.log('[Dashboard] Overview data received:', {
                replyRate: replyRateMetric?.value,
                replies: repliesMetric?.value,
                totalContacted: totalContactedMetric?.value,
                metricsCount: dashboardData?.metrics?.length || 0,
              });
            }
            setEmailData(dashboardData);
            setIsLoadingEmailData(false);
          })
          .catch(err => {
            if (!isMounted || err.name === 'AbortError') return;
            
            console.error('Failed to fetch overview data:', err);
            setIsLoadingEmailData(false);
          });
        
        return () => {
          isMounted = false;
          abortController.abort();
        };
      } else if (activeTabId === 'smartlead' || activeTabId === 'lemlist') {
        setIsLoadingEmailData(true);
        const endpoint = activeTabId === 'smartlead' ? '/api/dashboard/email' : '/api/dashboard/lemlist';
        
        const abortController = new AbortController();
        let isMounted = true;
        
        fetch(`${endpoint}?client=${clientInfo.subdomain}&startDate=${dateRange.start}&endDate=${dateRange.end}`, {
          signal: abortController.signal,
        })
          .then(async res => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              const errorMessage = errorData.message || errorData.error || 'Failed to fetch dashboard data';
              const error = new Error(errorMessage);
              (error as any).status = res.status;
              throw error;
            }
            return res.json();
          })
          .then(response => {
            if (!isMounted) return;
            
            // API returns { data: {...} }, extract the data object
            const dashboardData = response.data || response;
            if (process.env.NODE_ENV === 'development') {
              console.log(`[Dashboard] ${activeTabId} data received:`, {
                replyRate: dashboardData?.executiveSummary?.replyRate,
                totalReplies: dashboardData?.executiveSummary?.totalReplies,
                totalContacted: dashboardData?.executiveSummary?.totalContacted,
                overallReplyRate: dashboardData?.overallReplyRate,
                hasMetrics: !!(dashboardData?.metrics?.length),
              });
            }
            setEmailData(dashboardData);
            setEmailDataError(null);
            setIsLoadingEmailData(false);
          })
          .catch(err => {
            if (!isMounted || err.name === 'AbortError') return;
            
            const status = (err as any).status;
            const isConfigurationError = status === 400;
            
            if (!isConfigurationError) {
              console.error('Failed to fetch dashboard data:', err);
            }
            
            setEmailDataError(err.message || 'Failed to fetch dashboard data');
            setEmailData(null);
            setIsLoadingEmailData(false);
          });
        
        return () => {
          isMounted = false;
          abortController.abort();
        };
      } else {
        // Clear data when switching to a tab that doesn't need data (e.g., fonts)
        setEmailData(null);
        setIsLoadingEmailData(false);
      }
    }
  }, [activeTabId, clientInfo?.subdomain, dateRange.start, dateRange.end]);

  // Memoize data transformation to avoid recalculating on every render
  // MUST be called before any conditional returns (Rules of Hooks)
  const displayData = useMemo(() => {
    if (!emailData) return null;
    
    // Map metrics with default icons
    const metrics = (emailData.metrics || []).map((metric: any) => ({
      ...metric,
      icon: metric.icon || CheckCircleIcon,
    }));
    
    // Copy all other properties directly (no need for individual if checks)
    const transformed: any = {
      metrics,
      ...(emailData.executiveSummary && { executiveSummary: emailData.executiveSummary }),
      ...(emailData.performanceFunnel && { performanceFunnel: emailData.performanceFunnel }),
      ...(emailData.channelBreakdown && { channelBreakdown: emailData.channelBreakdown }),
      ...(emailData.engagementQuality && { engagementQuality: emailData.engagementQuality }),
      ...(emailData.channelComparison && { channelComparison: emailData.channelComparison }),
      ...(emailData.campaignLeaderboard && { campaignLeaderboard: emailData.campaignLeaderboard }),
      ...(emailData.weeklyTrend && { weeklyTrend: emailData.weeklyTrend }),
      ...(emailData.leadFunnel && { leadFunnel: emailData.leadFunnel }),
      ...(emailData.conversationFunnel && { conversationFunnel: emailData.conversationFunnel }),
      ...(emailData.completionRate && { completionRate: emailData.completionRate }),
      ...(emailData.clickRateGauge && { clickRateGauge: emailData.clickRateGauge }),
      ...(emailData.activityTimeline && { activityTimeline: emailData.activityTimeline }),
      ...(emailData.campaignPerformance && { campaignPerformance: emailData.campaignPerformance }),
      ...(emailData.engagementMetrics && { engagementMetrics: emailData.engagementMetrics }),
      ...(emailData.engagementFunnel && { engagementFunnel: emailData.engagementFunnel }),
      ...(emailData.multichannelFunnel && { multichannelFunnel: emailData.multichannelFunnel }),
      ...(emailData.campaigns && { campaigns: emailData.campaigns }),
    };
    
    // Only set displayData if it has actual content
    const hasMetrics = metrics.length > 0;
    const hasCharts = !!(transformed.completionRate || transformed.clickRateGauge || 
                        transformed.activityTimeline || transformed.campaignPerformance || 
                        transformed.engagementMetrics || transformed.engagementFunnel ||
                        transformed.conversationFunnel || transformed.campaignLeaderboard ||
                        transformed.multichannelFunnel || transformed.channelComparison ||
                        transformed.weeklyTrend || transformed.leadFunnel ||
                        transformed.executiveSummary || transformed.performanceFunnel ||
                        transformed.channelBreakdown || transformed.engagementQuality);
    
    // For lemlist tab, always set displayData if we have the report structure (even with zeros)
    const isLemlistTab = activeTabId === 'lemlist';
    const hasLemlistReport = !!(transformed.executiveSummary || transformed.performanceFunnel || 
                                transformed.channelBreakdown || transformed.engagementQuality);
    
    if (hasMetrics || hasCharts || (isLemlistTab && hasLemlistReport)) {
      return transformed;
    }
    
    return null;
  }, [emailData, activeTabId]);

  // Always show date picker and tabs, even while loading
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header with Date Range - Always visible */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative" ref={datePickerRef}>
                  <Button
                    variant="outline"
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {formatDateRange(dateRange.start, dateRange.end)}
                    </span>
                  </Button>
                
                  {isDatePickerOpen && (
                    <div className="absolute top-full left-0 mt-2 p-4 rounded-lg border bg-card shadow-lg z-50 w-[360px]">
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-3">Quick select</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {['last7', 'last14', 'last30', 'last90', 'thisMonth', 'lastMonth', 'last3Months', 'last6Months'].map((preset) => (
                            <Button
                              key={preset}
                              variant={selectedPreset === preset ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                handlePresetSelect(preset);
                                setIsDatePickerOpen(false);
                              }}
                              className="justify-start"
                            >
                              {presetLabels[preset]}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-medium mb-3">Custom range</h3>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block">Start date</label>
                            <Input
                              type="date"
                              value={dateRange.start}
                              onChange={(e) => {
                                setDateRange({ ...dateRange, start: e.target.value });
                                handleCustomDateChange();
                              }}
                              max={dateRange.end}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block">End date</label>
                            <Input
                              type="date"
                              value={dateRange.end}
                              onChange={(e) => {
                                setDateRange({ ...dateRange, end: e.target.value });
                                handleCustomDateChange();
                              }}
                              min={dateRange.start}
                              max={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Tabs */}
          {enabledFeatures.length > 0 && (
            <div className="px-4 lg:px-6">
              <Tabs 
                value={activeTabId || undefined} 
                onValueChange={(value) => {
                  setActiveTabId(value);
                  // Update URL when tab changes, preserving other search params
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('tab', value);
                  router.replace(`?${params.toString()}`, { scroll: false });
                }} 
                className="w-full"
              >
                <TabsList className="justify-start">
                  {enabledFeatures.map((feature) => (
                    <TabsTrigger key={feature.id} value={feature.id}>
                      {feature.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Content */}
                {enabledFeatures.map((feature) => (
                  <TabsContent key={feature.id} value={feature.id} className="mt-4">
                    {feature.id === 'fonts' ? (
                      <FontPreview />
                    ) : emailDataError ? (
                      <ErrorState
                        title="Configuration Error"
                        message={emailDataError}
                      />
                    ) : (
                      <div className="space-y-6">
                        {/* Show loading indicator and skeletons for metrics while loading */}
                        {isLoadingEmailData && !displayData?.metrics?.length ? (
                          <>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
                              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              <span>Loading metrics...</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <MetricCardSkeleton key={i} />
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Overview Tab - Show OverviewCard with first 6 metrics, then smaller cards below */}
                            {feature.id === 'overview' && displayData?.metrics && displayData.metrics.length > 0 && (
                              <>
                                {/* Overview Card with first 6 metrics */}
                                <OverviewCard
                                  metrics={displayData.metrics.slice(0, 6).map((metric: any) => ({
                                    title: metric.title,
                                    value: metric.value,
                                    comparisonText: metric.comparisonText,
                                  }))}
                                />
                                
                                {/* Remaining metrics as smaller cards below */}
                                {displayData.metrics.length > 6 && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {displayData.metrics.slice(6).map((metric: any, index: number) => (
                                      <MetricCard
                                        key={index + 6}
                                        title={metric.title}
                                        value={metric.value}
                                        comparisonText={metric.comparisonText}
                                        icon={metric.icon || CheckCircleIcon}
                                      />
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                            
                            {/* Other tabs - Show all metrics as cards with progressive loading */}
                            {feature.id !== 'overview' && (
                              <>
                                {displayData?.metrics && displayData.metrics.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {displayData.metrics.map((metric: any, index: number) => (
                                      <MetricCard
                                        key={index}
                                        title={metric.title}
                                        value={metric.value}
                                        comparisonText={metric.comparisonText}
                                        icon={metric.icon || CheckCircleIcon}
                                      />
                                    ))}
                                  </div>
                                ) : !isLoadingEmailData && (
                                  <EmptyState
                                    icon={AnalyticsIcon}
                                    title="No Data Available"
                                    description="No data found for the selected date range. Try selecting a different time period."
                                  />
                                )}
                              </>
                            )}
                          </>
                        )}

                        {/* Charts Grid - Only show gauge charts that are supported by APIs */}
                        {!isLoadingEmailData && displayData && (displayData.completionRate || displayData.clickRateGauge) && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {displayData.completionRate && (() => {
                              const normalizedPercentage = Math.max(0, Math.min(100, Number(displayData.completionRate.percentage) || 0));
                              const gaugeData = [
                                { name: 'value', value: normalizedPercentage },
                                { name: 'remaining', value: 100 - normalizedPercentage },
                              ];
                              const gaugeConfig = {
                                value: { label: "Value", color: "hsl(var(--chart-1))" },
                                remaining: { label: "Remaining", color: "hsl(var(--muted))" },
                              } satisfies ChartConfig;
                              return (
                                <Card className="@container/card flex flex-col h-full">
                                  <CardHeader className="relative">
                                    <CardTitle>{displayData.completionRate.title}</CardTitle>
                                  </CardHeader>
                                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 flex flex-col justify-center">
                                    <div className="relative h-[120px] flex-shrink-0">
                                      <ChartContainer config={gaugeConfig} className="h-full w-full">
                                        <PieChart>
                                          <Pie
                                            data={gaugeData}
                                            cx="50%"
                                            cy="100%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={60}
                                            outerRadius={80}
                                            dataKey="value"
                                            stroke="none"
                                            paddingAngle={0}
                                            cornerRadius={12}
                                          >
                                            {gaugeData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-value)' : 'var(--color-remaining)'} />
                                            ))}
                                          </Pie>
                                        </PieChart>
                                      </ChartContainer>
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-12">
                                        <div className="text-center">
                                          <span className="text-3xl font-bold tabular-nums">{normalizedPercentage.toFixed(1)}%</span>
                                        </div>
                                      </div>
                                    </div>
                                    {displayData.completionRate.positiveCount !== undefined && displayData.completionRate.negativeCount !== undefined && (
                                      <div className="flex justify-center items-center gap-6 pt-6">
                                        <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                                          <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                                          <span>Positive</span>
                                          <span className="font-bold text-foreground">{displayData.completionRate.positiveCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                                          <div className="w-2.5 h-2.5 rounded-full bg-muted"></div>
                                          <span>Negative</span>
                                          <span className="font-bold text-foreground">{displayData.completionRate.negativeCount}</span>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })()}
                            {displayData.clickRateGauge && (() => {
                              const normalizedPercentage = Math.max(0, Math.min(100, Number(displayData.clickRateGauge.percentage) || 0));
                              const gaugeData = [
                                { name: 'value', value: normalizedPercentage },
                                { name: 'remaining', value: 100 - normalizedPercentage },
                              ];
                              const gaugeConfig = {
                                value: { label: "Value", color: "hsl(var(--chart-1))" },
                                remaining: { label: "Remaining", color: "hsl(var(--muted))" },
                              } satisfies ChartConfig;
                              return (
                                <Card className="@container/card flex flex-col h-full">
                                  <CardHeader className="relative">
                                    <CardTitle>{displayData.clickRateGauge.title}</CardTitle>
                                  </CardHeader>
                                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 flex flex-col justify-center">
                                    <div className="relative h-[120px] flex-shrink-0">
                                      <ChartContainer config={gaugeConfig} className="h-full w-full">
                                        <PieChart>
                                          <Pie
                                            data={gaugeData}
                                            cx="50%"
                                            cy="100%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={60}
                                            outerRadius={80}
                                            dataKey="value"
                                            stroke="none"
                                            paddingAngle={0}
                                            cornerRadius={12}
                                          >
                                            {gaugeData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-value)' : 'var(--color-remaining)'} />
                                            ))}
                                          </Pie>
                                        </PieChart>
                                      </ChartContainer>
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-12">
                                        <div className="text-center">
                                          <span className="text-3xl font-bold tabular-nums">{normalizedPercentage.toFixed(1)}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })()}
                          </div>
                        )}

                        {/* Charts - Always 2 columns per row */}
                        {!isLoadingEmailData && displayData && (displayData.leadFunnel || displayData.conversationFunnel || displayData.campaignLeaderboard || displayData.channelComparison || displayData.weeklyTrend) && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {displayData.leadFunnel && displayData.leadFunnel.data && displayData.leadFunnel.data.length > 0 && (() => {
                              const chartConfig = {
                                value: { label: 'Value', color: "hsl(var(--chart-1))" },
                              } satisfies ChartConfig;
                              return (
                                <Card className="@container/card flex flex-col h-full">
                                  <CardHeader className="relative">
                                    <CardTitle>{displayData.leadFunnel.title}</CardTitle>
                                    {displayData.leadFunnel.description && <CardDescription>{displayData.leadFunnel.description}</CardDescription>}
                                  </CardHeader>
                                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 flex flex-col">
                                    <ChartContainer config={chartConfig} className="flex-1 min-h-[288px] w-full">
                                      <BarChart data={displayData.leadFunnel.data} layout="vertical" margin={{ left: 0, right: 16 }}>
                                        <XAxis type="number" dataKey="value" hide />
                                        <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={150} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        <Bar dataKey="value" fill="var(--color-value)" radius={5} />
                                      </BarChart>
                                    </ChartContainer>
                                  </CardContent>
                                </Card>
                              );
                            })()}
                            
                            {displayData.conversationFunnel && displayData.conversationFunnel.data && displayData.conversationFunnel.data.length > 0 && (() => {
                              const chartConfig = {
                                value: { label: 'Value', color: "hsl(var(--chart-1))" },
                              } satisfies ChartConfig;
                              return (
                                <Card className="@container/card flex flex-col h-full">
                                  <CardHeader className="relative">
                                    <CardTitle>{displayData.conversationFunnel.title}</CardTitle>
                                    {displayData.conversationFunnel.description && <CardDescription>{displayData.conversationFunnel.description}</CardDescription>}
                                  </CardHeader>
                                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 flex flex-col">
                                    <ChartContainer config={chartConfig} className="flex-1 min-h-[288px] w-full">
                                      <BarChart data={displayData.conversationFunnel.data} layout="vertical" margin={{ left: 0, right: 16 }}>
                                        <XAxis type="number" dataKey="value" hide />
                                        <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={150} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        <Bar dataKey="value" fill="var(--color-value)" radius={5} />
                                      </BarChart>
                                    </ChartContainer>
                                  </CardContent>
                                </Card>
                              );
                            })()}
                            
                            {displayData.channelComparison && displayData.channelComparison.data && displayData.channelComparison.data.length > 0 && (() => {
                              const chartConfig = {
                                email: { label: "Email", color: "hsl(var(--chart-1))" },
                                linkedin: { label: "LinkedIn", color: "hsl(var(--chart-2))" },
                              } satisfies ChartConfig;
                              return (
                                <Card className="@container/card">
                                  <CardHeader className="relative">
                                    <CardTitle>{displayData.channelComparison.title}</CardTitle>
                                    {displayData.channelComparison.description && <CardDescription>{displayData.channelComparison.description}</CardDescription>}
                                  </CardHeader>
                                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                                      <BarChart data={displayData.channelComparison.data}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
                                        <YAxis tickLine={false} axisLine={false} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <ChartLegend verticalAlign="bottom" height={36} content={<ChartLegendContent />} />
                                        <Bar dataKey="email" name="email" fill="var(--color-email)" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="linkedin" name="linkedin" fill="var(--color-linkedin)" radius={[8, 8, 0, 0]} />
                                      </BarChart>
                                    </ChartContainer>
                                  </CardContent>
                                </Card>
                              );
                            })()}
                            
                            {displayData.campaignLeaderboard && (
                              <CampaignPerformanceTable
                                title={displayData.campaignLeaderboard.title}
                                description={displayData.campaignLeaderboard.description}
                                data={displayData.campaignLeaderboard.data}
                                valueLabel={displayData.campaignLeaderboard.valueLabel}
                              />
                            )}
                            
                            {displayData.weeklyTrend && displayData.weeklyTrend.data && displayData.weeklyTrend.data.length > 0 && (() => {
                              const chartConfig = {
                                emailOpens: { label: "Email Opens", color: "hsl(var(--chart-1))" },
                                emailClicks: { label: "Email Clicks", color: "hsl(var(--chart-1))" },
                                linkedInVisits: { label: "LinkedIn Visits", color: "hsl(var(--chart-1))" },
                                linkedInConnects: { label: "LinkedIn Connects", color: "hsl(var(--chart-1))" },
                                linkedInConnectionRequests: { label: "LinkedIn Connection Requests", color: "hsl(var(--chart-1))" },
                                linkedInAccepted: { label: "LinkedIn Accepted", color: "hsl(var(--chart-1))" },
                                replies: { label: "Replies", color: "hsl(var(--chart-1))" },
                              } satisfies ChartConfig;
                              return (
                                <Card className="@container/card">
                                  <CardHeader className="relative">
                                    <CardTitle>{displayData.weeklyTrend.title}</CardTitle>
                                    {displayData.weeklyTrend.description && <CardDescription>{displayData.weeklyTrend.description}</CardDescription>}
                                  </CardHeader>
                                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                                      <AreaChart data={displayData.weeklyTrend.data}>
                                        <defs>
                                          <linearGradient id="fillEmailOpens" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-emailOpens)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-emailOpens)" stopOpacity={0.1} />
                                          </linearGradient>
                                          <linearGradient id="fillEmailClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-emailClicks)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-emailClicks)" stopOpacity={0.1} />
                                          </linearGradient>
                                          <linearGradient id="fillLinkedInVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-linkedInVisits)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-linkedInVisits)" stopOpacity={0.1} />
                                          </linearGradient>
                                          <linearGradient id="fillLinkedInConnects" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-linkedInConnects)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-linkedInConnects)" stopOpacity={0.1} />
                                          </linearGradient>
                                          <linearGradient id="fillReplies" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-replies)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-replies)" stopOpacity={0.1} />
                                          </linearGradient>
                                          <linearGradient id="fillLinkedInConnectionRequests" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-linkedInConnectionRequests)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-linkedInConnectionRequests)" stopOpacity={0.1} />
                                          </linearGradient>
                                          <linearGradient id="fillLinkedInAccepted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-linkedInAccepted)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-linkedInAccepted)" stopOpacity={0.1} />
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <ChartLegend verticalAlign="bottom" height={36} content={<ChartLegendContent />} />
                                        <Area type="natural" dataKey="emailOpens" name="emailOpens" stackId="1" stroke="var(--color-emailOpens)" fill="url(#fillEmailOpens)" />
                                        <Area type="natural" dataKey="emailClicks" name="emailClicks" stackId="1" stroke="var(--color-emailClicks)" fill="url(#fillEmailClicks)" />
                                        <Area type="natural" dataKey="linkedInVisits" name="linkedInVisits" stackId="1" stroke="var(--color-linkedInVisits)" fill="url(#fillLinkedInVisits)" />
                                        <Area type="natural" dataKey="linkedInConnects" name="linkedInConnects" stackId="1" stroke="var(--color-linkedInConnects)" fill="url(#fillLinkedInConnects)" />
                                        <Area type="natural" dataKey="linkedInConnectionRequests" name="linkedInConnectionRequests" stackId="1" stroke="var(--color-linkedInConnectionRequests)" fill="url(#fillLinkedInConnectionRequests)" />
                                        <Area type="natural" dataKey="linkedInAccepted" name="linkedInAccepted" stackId="1" stroke="var(--color-linkedInAccepted)" fill="url(#fillLinkedInAccepted)" />
                                        <Area type="natural" dataKey="replies" name="replies" stackId="1" stroke="var(--color-replies)" fill="url(#fillReplies)" />
                                      </AreaChart>
                                    </ChartContainer>
                                  </CardContent>
                                </Card>
                              );
                            })()}
                          </div>
                        )}

                        {/* Legacy Activity Charts - Only show charts supported by APIs */}
                        {!isLoadingEmailData && displayData && (displayData.campaignPerformance || displayData.engagementMetrics) && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {displayData.campaignPerformance && (
                              <CampaignPerformanceTable
                                title={displayData.campaignPerformance.title}
                                description={displayData.campaignPerformance.description}
                                data={displayData.campaignPerformance.data}
                                valueLabel={displayData.campaignPerformance.valueLabel}
                              />
                            )}
                            
                            {displayData.engagementMetrics && displayData.engagementMetrics.data && displayData.engagementMetrics.data.length > 0 && (() => {
                              const chartConfig = {
                                emailSent: { label: "Email Sent", color: "hsl(var(--chart-1))" },
                                emailOpened: { label: "Email Opened", color: "hsl(var(--chart-2))" },
                                replied: { label: "Replied", color: "hsl(var(--chart-3))" },
                                positiveReplied: { label: "Positive Replied", color: "hsl(var(--chart-4))" },
                                bounced: { label: "Bounced", color: "hsl(var(--chart-5))" },
                                unsubscribed: { label: "Unsubscribed", color: "hsl(var(--destructive))" },
                              } satisfies ChartConfig;
                              return (
                                <Card className="@container/card flex flex-col h-full">
                                  <CardHeader className="relative">
                                    <CardTitle>{displayData.engagementMetrics.title}</CardTitle>
                                    {displayData.engagementMetrics.description && <CardDescription>{displayData.engagementMetrics.description}</CardDescription>}
                                  </CardHeader>
                                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 flex flex-col">
                                    <ChartContainer config={chartConfig} className="flex-1 min-h-[288px] w-full">
                                      <LineChart data={displayData.engagementMetrics.data}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={(value) => {
                                          if (typeof value === 'string' && value.includes('-')) {
                                            const date = new Date(value);
                                            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                          }
                                          return value;
                                        }} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" labelFormatter={(value) => {
                                          if (typeof value === 'string' && value.includes('-')) {
                                            return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                          }
                                          return value;
                                        }} />} />
                                        <ChartLegend verticalAlign="bottom" height={36} content={<ChartLegendContent />} />
                                        <Line type="monotone" dataKey="Email Sent" name="emailSent" stroke="var(--color-emailSent)" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="Email Opened" name="emailOpened" stroke="var(--color-emailOpened)" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="Replied" name="replied" stroke="var(--color-replied)" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="Positive Replied" name="positiveReplied" stroke="var(--color-positiveReplied)" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="Bounced" name="bounced" stroke="var(--color-bounced)" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="Unsubscribed" name="unsubscribed" stroke="var(--color-unsubscribed)" strokeWidth={2} dot={false} />
                                      </LineChart>
                                    </ChartContainer>
                                  </CardContent>
                                </Card>
                              );
                            })()}
                          </div>
                        )}

                        {/* Campaigns Table */}
                        {!isLoadingEmailData && displayData && displayData.campaigns && displayData.campaigns.length > 0 && (
                          <CampaignsTable 
                            campaigns={displayData.campaigns}
                            title="Campaigns"
                            description="Performance metrics for all campaigns"
                          />
                        )}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

