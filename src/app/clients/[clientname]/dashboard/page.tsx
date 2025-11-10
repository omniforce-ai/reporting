'use client';

import AreaChartCard from '@/components/AreaChartCard';
import EngagementMetricsChart from '@/components/EngagementMetricsChart';
import GaugeChartCard from '@/components/GaugeChartCard';
import LineChartCard from '@/components/LineChartCard';
import MetricCard from '@/components/MetricCard';
import { DashboardSkeleton, DashboardContentSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { AnalyticsIcon, CalendarIcon, CheckCircleIcon, ClockIcon, MailIcon, TasksIcon, ThumbsUpIcon, XCircleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { FeatureDefinition } from '@/lib/config/features';
import { getAllFeatures } from '@/lib/config/features';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ClientDashboardPage() {
  const params = useParams();
  const clientname = params.clientname as string;
  
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [enabledFeatures, setEnabledFeatures] = useState<FeatureDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailData, setEmailData] = useState<any>(null);
  const [isLoadingEmailData, setIsLoadingEmailData] = useState(false);
  const [clientInfo, setClientInfo] = useState<{ subdomain: string; name: string; apiSource: 'smartlead' | 'lemlist' | null } | null>(null);
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  
  const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 14);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };
  
  const getPresetRange = (preset: string) => {
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
  };
  
  const [selectedPreset, setSelectedPreset] = useState<string>('last14');
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handlePresetSelect = (preset: string) => {
    const range = getPresetRange(preset);
    setDateRange(range);
    setSelectedPreset(preset);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  // Get current client info using path-based client name
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    
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
          
          setClientInfo({
            subdomain: data.tenant.subdomain,
            name: data.tenant.name || data.tenant.subdomain,
            apiSource,
          });
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
  }, [clientname]);

  // Fetch enabled features for current client
  useEffect(() => {
    if (!clientInfo) return;
    
    let isMounted = true;
    const abortController = new AbortController();
    
    fetch(`/api/features?client=${clientInfo.subdomain}`, {
      signal: abortController.signal,
    })
      .then(async res => {
        if (!res.ok) {
          throw new Error('Failed to fetch features');
        }
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        
        const features = Array.isArray(data.enabledFeatures) ? data.enabledFeatures : [];
        setEnabledFeatures(features);
        if (features.length > 0 && !activeTabId) {
          setActiveTabId(features[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted || err.name === 'AbortError') return;
        
        console.error('Failed to fetch features:', err);
        // Fallback: show tabs based on API keys
        const allFeatures = getAllFeatures();
        const enabledTabs: FeatureDefinition[] = [];
        
        if (clientInfo.apiSource === 'smartlead') {
          const smartleadFeature = allFeatures.find(f => f.id === 'smartlead');
          if (smartleadFeature) {
            enabledTabs.push(smartleadFeature);
            setActiveTabId('smartlead');
          }
        } else if (clientInfo.apiSource === 'lemlist') {
          const lemlistFeature = allFeatures.find(f => f.id === 'lemlist');
          if (lemlistFeature) {
            enabledTabs.push(lemlistFeature);
            setActiveTabId('lemlist');
          }
        }
        
        if (enabledTabs.length > 0) {
          setEnabledFeatures(enabledTabs);
        }
        setLoading(false);
      });
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [clientInfo]);

  // Fetch data when smartlead or lemlist tab is active
  useEffect(() => {
    if ((activeTabId === 'smartlead' || activeTabId === 'lemlist') && clientInfo?.subdomain) {
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
            throw new Error(errorData.error || 'Failed to fetch dashboard data');
          }
          return res.json();
        })
        .then(response => {
          if (!isMounted) return;
          
          // API returns { data: {...} }, extract the data object
          const dashboardData = response.data || response;
          setEmailData(dashboardData);
          setIsLoadingEmailData(false);
        })
        .catch(err => {
          if (!isMounted || err.name === 'AbortError') return;
          
          console.error('Failed to fetch dashboard data:', err);
          setIsLoadingEmailData(false);
        });
      
      return () => {
        isMounted = false;
        abortController.abort();
      };
    } else {
      // Clear data when switching to other tabs
      setEmailData(null);
      setIsLoadingEmailData(false);
    }
  }, [activeTabId, clientInfo?.subdomain, dateRange.start, dateRange.end]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (enabledFeatures.length === 0) {
    return (
      <EmptyState
        icon={AnalyticsIcon}
        title="No Features Enabled"
        description="No features are currently enabled for this client. Contact your administrator to enable features."
      />
    );
  }

  // Transform API data to match expected format
  let displayData = null;
  
  if (emailData) {
    // Transform lemlist/smartlead API format to match dashboard expectations
    const transformed: any = {
      metrics: (emailData.metrics || []).map((metric: any) => ({
        ...metric,
        icon: metric.icon || CheckCircleIcon,
      })),
    };
    
    // Handle lemlist format (gauge charts)
    if (emailData.openRateGauge || emailData.clickRateGauge || emailData.replyRateGauge) {
      // Use openRateGauge as completionRate equivalent
      if (emailData.openRateGauge) {
        transformed.completionRate = {
          title: emailData.openRateGauge.title || 'Open Rate',
          percentage: emailData.openRateGauge.percentage || 0,
          icon: CheckCircleIcon,
        };
      }
      
      // Use clickRateGauge as second gauge if available
      if (emailData.clickRateGauge) {
        transformed.clickRateGauge = {
          title: emailData.clickRateGauge.title || 'Click Rate',
          percentage: emailData.clickRateGauge.percentage || 0,
          icon: CheckCircleIcon,
        };
      }
      
      // Use activityTimeline for activity over time (repurposed from evaluationHistory)
      if (emailData.activityTimeline?.data) {
        transformed.activityTimeline = {
          title: emailData.activityTimeline.title || 'Activity Timeline',
          description: emailData.activityTimeline.description || 'Daily email activity over time',
          data: emailData.activityTimeline.data.map((item: any) => ({
            name: item.name,
            avgScore: item.openRate || 0,
          })),
        };
      }
      
      // Use campaignPerformance for campaign comparison (repurposed from tasksHistory)
      if (emailData.campaignPerformance?.data) {
        transformed.campaignPerformance = {
          title: emailData.campaignPerformance.title || 'Campaign Performance',
          description: emailData.campaignPerformance.description || 'Campaign performance comparison',
          data: emailData.campaignPerformance.data.map((item: any) => ({
            name: item.name,
            value: item.value || 0,
          })),
        };
      }
    }
    
    // Handle smartlead format
    if (emailData.engagementMetrics) {
      transformed.engagementMetrics = {
        title: emailData.engagementMetrics.title || 'Email Engagement Metrics',
        description: emailData.engagementMetrics.description || 'Email engagement over time',
        data: emailData.engagementMetrics.data || [],
      };
    }
    
    if (emailData.engagementFunnel) {
      transformed.engagementFunnel = {
        title: emailData.engagementFunnel.title || 'Email Engagement Funnel',
        description: emailData.engagementFunnel.description || 'Journey from delivery to conversion',
        data: emailData.engagementFunnel.data || [],
      };
    }
    
    displayData = transformed;
  }

  if (isLoadingEmailData) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <DashboardContentSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <EmptyState
        icon={AnalyticsIcon}
        title="No Data Available"
        description="No data found for the selected date range. Try selecting a different time period."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header with Date Range */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative" ref={datePickerRef}>
                  <Button
                    variant="outline"
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="flex items-center gap-2"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-sm">
                      {dateRange.start} - {dateRange.end}
                    </span>
                  </Button>
                
                  {isDatePickerOpen && (
                    <div className="absolute top-full left-0 mt-2 p-4 rounded-lg border bg-card shadow-lg z-50 min-w-[300px]">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {['last7', 'last14', 'last30', 'last90', 'thisMonth', 'lastMonth', 'last3Months', 'last6Months'].map((preset) => (
                          <Button
                            key={preset}
                            variant={selectedPreset === preset ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              handlePresetSelect(preset);
                              setIsDatePickerOpen(false);
                            }}
                          >
                            {preset.replace(/([A-Z])/g, ' $1').trim()}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                          className="flex-1"
                        />
                        <Input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                          className="flex-1"
                        />
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
              <Tabs value={activeTabId || undefined} onValueChange={setActiveTabId} className="w-full">
                <TabsList className="w-full justify-start">
                  {enabledFeatures.map((feature) => (
                    <TabsTrigger key={feature.id} value={feature.id} className="flex items-center gap-2">
                      {feature.icon && <feature.icon className="w-4 h-4" />}
                      {feature.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Content */}
                {enabledFeatures.map((feature) => (
                  <TabsContent key={feature.id} value={feature.id} className="mt-4">
                    {isLoadingEmailData ? (
                      <DashboardContentSkeleton />
                    ) : (
                      <div className="space-y-6">
                        {/* Metrics Grid */}
                        {displayData.metrics && displayData.metrics.length > 0 && (
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
                        )}

                        {/* Charts Grid - Only show gauge charts that are supported by APIs */}
                        {(displayData.completionRate || displayData.clickRateGauge) && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {displayData.completionRate && (
                              <GaugeChartCard
                                title={displayData.completionRate.title}
                                percentage={displayData.completionRate.percentage}
                                icon={displayData.completionRate.icon}
                              />
                            )}
                            
                            {displayData.clickRateGauge && (
                              <GaugeChartCard
                                title={displayData.clickRateGauge.title}
                                percentage={displayData.clickRateGauge.percentage}
                                icon={displayData.clickRateGauge.icon}
                              />
                            )}
                          </div>
                        )}

                        {/* Activity Charts - Only show charts supported by APIs */}
                        {(displayData.activityTimeline || displayData.campaignPerformance || displayData.engagementMetrics) && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {displayData.activityTimeline && (
                              <LineChartCard
                                title={displayData.activityTimeline.title}
                                description={displayData.activityTimeline.description}
                                data={displayData.activityTimeline.data}
                              />
                            )}
                            
                            {displayData.campaignPerformance && (
                              <LineChartCard
                                title={displayData.campaignPerformance.title}
                                description={displayData.campaignPerformance.description}
                                data={displayData.campaignPerformance.data.map((item: any) => ({
                                  name: item.name,
                                  avgScore: item.value || 0,
                                }))}
                              />
                            )}
                            
                            {displayData.engagementMetrics && (
                              <EngagementMetricsChart
                                title={displayData.engagementMetrics.title}
                                description={displayData.engagementMetrics.description}
                                data={displayData.engagementMetrics.data}
                              />
                            )}
                          </div>
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

