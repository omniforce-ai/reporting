'use client';

import AreaChartCard from '@/components/AreaChartCard';
import EngagementMetricsChart from '@/components/EngagementMetricsChart';
import GaugeChartCard from '@/components/GaugeChartCard';
import LineChartCard from '@/components/LineChartCard';
import MetricCard from '@/components/MetricCard';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { AnalyticsIcon, CalendarIcon, CheckCircleIcon, ClockIcon, DownloadIcon, MailIcon, TasksIcon, ThumbsUpIcon, XCircleIcon } from '@/components/icons';
import type { FeatureDefinition } from '@/lib/config/features';
import { getAllFeatures } from '@/lib/config/features';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

// Temporary mock data - will be replaced with real API data
const getMockDataForFeature = (featureId: string) => {
  if (featureId === 'smartlead' || featureId === 'lemlist') {
    return {
      metrics: [
        { title: 'Emails Processed', value: '1,281', comparisonText: '+12% from prior period', icon: CheckCircleIcon },
        { title: 'Emails Escalated', value: '73', comparisonText: '-5% from prior period', icon: XCircleIcon },
        { title: 'Avg. Response Time', value: '32m', comparisonText: '-8m from prior period', icon: ClockIcon },
        { title: 'Categorization Accuracy', value: '98.7%', comparisonText: '+0.5% from prior period', icon: TasksIcon },
      ],
      completionRate: { title: 'Completion rate', percentage: 94.3, icon: CheckCircleIcon },
      feedbackScore: { title: 'Feedback score', percentage: 89.1, positiveCount: 102, negativeCount: 13, icon: TasksIcon },
      evaluationHistory: {
        title: '% Evaluation scores history',
        description: 'Showing average evaluation scores over the selected period of time',
        data: [
          { name: '17/2', avgScore: 2.1 }, { name: '18/2', avgScore: 1.9 }, { name: '19/2', avgScore: 2.5 }, { name: '20/2', avgScore: 2.3 }, { name: '21/2', avgScore: 2.8 },
        ]
      },
      tasksHistory: {
        title: 'Email Volume',
        description: 'Showing processed and escalated email counts over the selected period of time',
        data: [
          { name: '17/2', completed: 210, failed: 15 }, { name: '18/2', completed: 250, failed: 12 }, { name: '19/2', completed: 230, failed: 18 }, { name: '20/2', completed: 280, failed: 10 }, { name: '21/2', completed: 310, failed: 12 },
        ]
      }
    };
  }
  return null;
};

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
    // Use the clientname from URL params - middleware sets x-tenant-client header
    fetch(`/api/tenant/config?client=${clientname}`)
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch tenant config');
        }
        return res.json();
      })
      .then(data => {
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
        console.error('Failed to fetch tenant config:', err);
        setLoading(false);
      });
  }, [clientname]);

  // Fetch enabled features for current client
  useEffect(() => {
    if (!clientInfo) return;
    
    fetch(`/api/features?client=${clientInfo.subdomain}`)
      .then(res => res.json())
      .then(data => {
        const features = Array.isArray(data.enabledFeatures) ? data.enabledFeatures : [];
        setEnabledFeatures(features);
        if (features.length > 0 && !activeTabId) {
          setActiveTabId(features[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
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
  }, [clientInfo, activeTabId]);

  // Fetch data when smartlead or lemlist tab is active
  useEffect(() => {
    if ((activeTabId === 'smartlead' || activeTabId === 'lemlist') && clientInfo?.subdomain) {
      setIsLoadingEmailData(true);
      const endpoint = activeTabId === 'smartlead' ? '/api/dashboard/email' : '/api/dashboard/lemlist';
      
      fetch(`${endpoint}?client=${clientInfo.subdomain}&startDate=${dateRange.start}&endDate=${dateRange.end}`)
        .then(res => res.json())
        .then(response => {
          // API returns { data: {...} }, extract the data object
          const dashboardData = response.data || response;
          setEmailData(dashboardData);
          setIsLoadingEmailData(false);
        })
        .catch(err => {
          console.error('Failed to fetch dashboard data:', err);
          setIsLoadingEmailData(false);
        });
    } else {
      // Clear data when switching to other tabs
      setEmailData(null);
    }
  }, [activeTabId, clientInfo, dateRange]);

  const handleExport = (format: 'csv' | 'pdf') => {
    // Export functionality to be implemented
    console.log('Export requested:', format, 'for client:', clientInfo?.name);
  };

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

  const mockData = getMockDataForFeature(activeTabId || '');
  
  // Transform API data to match expected format
  let displayData = emailData || mockData;
  
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
      
      // Use replyRateGauge as feedbackScore equivalent
      if (emailData.replyRateGauge) {
        transformed.feedbackScore = {
          title: emailData.replyRateGauge.title || 'Reply Rate',
          percentage: emailData.replyRateGauge.percentage || 0,
          positiveCount: 0,
          negativeCount: 0,
          icon: TasksIcon,
        };
      }
      
      // Use activityTimeline as evaluationHistory equivalent
      if (emailData.activityTimeline?.data) {
        transformed.evaluationHistory = {
          title: emailData.activityTimeline.title || 'Activity Timeline',
          description: emailData.activityTimeline.description || 'Daily email activity over time',
          data: emailData.activityTimeline.data.map((item: any) => ({
            name: item.name,
            avgScore: item.openRate || 0,
          })),
        };
      }
      
      // Use campaignPerformance as tasksHistory equivalent
      if (emailData.campaignPerformance?.data) {
        transformed.tasksHistory = {
          title: emailData.campaignPerformance.title || 'Campaign Performance',
          description: emailData.campaignPerformance.description || 'Campaign performance comparison',
          data: emailData.campaignPerformance.data.map((item: any) => ({
            name: item.name,
            completed: item.value || 0,
            failed: 0,
          })),
        };
      }
    }
    
    // Handle smartlead format
    if (emailData.engagementMetrics) {
      transformed.evaluationHistory = {
        title: emailData.engagementMetrics.title || 'Email Engagement Metrics',
        description: emailData.engagementMetrics.description || 'Email engagement over time',
        data: emailData.engagementMetrics.data?.map((item: any) => ({
          name: item.name,
          avgScore: item['Email Opened'] || 0,
        })) || [],
      };
    }
    
    if (emailData.engagementFunnel) {
      transformed.tasksHistory = {
        title: emailData.engagementFunnel.title || 'Email Engagement Funnel',
        description: emailData.engagementFunnel.description || 'Journey from delivery to conversion',
        data: emailData.engagementFunnel.data?.map((item: any) => ({
          name: item.name,
          completed: item.value || 0,
          failed: 0,
        })) || [],
      };
    }
    
    displayData = transformed;
  }

  if (!displayData) {
    return (
      <ErrorState
        title="No Data Available"
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Date Range and Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white hover:border-purple-500 transition-colors"
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-sm">
                {dateRange.start} - {dateRange.end}
              </span>
            </button>
            
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-2 p-4 rounded-lg bg-slate-800 border border-purple-500/20 z-50 min-w-[300px]">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {['last7', 'last14', 'last30', 'last90', 'thisMonth', 'lastMonth', 'last3Months', 'last6Months'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        handlePresetSelect(preset);
                        setIsDatePickerOpen(false);
                      }}
                      className={`px-3 py-2 text-sm rounded ${
                        selectedPreset === preset
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {preset.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="flex-1 px-3 py-2 rounded bg-slate-700 border border-purple-500/20 text-white text-sm"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="flex-1 px-3 py-2 rounded bg-slate-700 border border-purple-500/20 text-white text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {(activeTabId === 'smartlead' || activeTabId === 'lemlist') && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white hover:border-purple-500 transition-colors"
            >
              <DownloadIcon className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white hover:border-purple-500 transition-colors"
            >
              <DownloadIcon className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        )}
      </div>

      {/* Feature Tabs */}
      <div className="flex gap-2 border-b border-purple-500/20">
        {enabledFeatures.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setActiveTabId(feature.id)}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTabId === feature.id
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feature.icon && <feature.icon className="w-5 h-5" />}
              {feature.name}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoadingEmailData ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayData.metrics?.map((metric: any, index: number) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                comparisonText={metric.comparisonText}
                icon={metric.icon || CheckCircleIcon}
              />
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayData.completionRate && (
              <GaugeChartCard
                title={displayData.completionRate.title}
                percentage={displayData.completionRate.percentage}
                icon={displayData.completionRate.icon}
              />
            )}
            
            {displayData.feedbackScore && (
              <GaugeChartCard
                title={displayData.feedbackScore.title}
                percentage={displayData.feedbackScore.percentage}
                positiveCount={displayData.feedbackScore.positiveCount}
                negativeCount={displayData.feedbackScore.negativeCount}
                icon={displayData.feedbackScore.icon}
              />
            )}
          </div>

          {/* History Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayData.evaluationHistory && (
              <LineChartCard
                title={displayData.evaluationHistory.title}
                description={displayData.evaluationHistory.description}
                data={displayData.evaluationHistory.data}
              />
            )}
            
            {displayData.tasksHistory && (
              <LineChartCard
                title={displayData.tasksHistory.title}
                description={displayData.tasksHistory.description}
                data={displayData.tasksHistory.data}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

