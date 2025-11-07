'use client';

import AreaChartCard from '@/components/AreaChartCard';
import BarChartCard from '@/components/BarChartCard';
import EngagementMetricsChart from '@/components/EngagementMetricsChart';
import MetricCard from '@/components/MetricCard';
import { AnalyticsIcon, CalendarIcon, CheckCircleIcon, ChevronDownIcon, ClockIcon, DownloadIcon, MailIcon, TasksIcon, ThumbsUpIcon, UserCircleIcon, XCircleIcon } from '@/components/icons';
import type { FeatureDefinition } from '@/lib/config/features';
import { useEffect, useRef, useState } from 'react';

// API/Data Source definitions
type ApiSource = {
  id: string;
  name: string;
  icon: React.ElementType;
};

const apiSources: ApiSource[] = [
  { id: 'smartlead', name: 'Smartlead', icon: MailIcon },
  { id: 'lemlist', name: 'Lemlist', icon: MailIcon },
];

// Temporary mock data - will be replaced with real Smartlead data
const getMockDataForFeature = (featureId: string) => {
  if (featureId === 'email') {
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

type Client = {
  id: string;
  name: string;
  subdomain: string;
  hasSmartlead?: boolean;
  hasLemlist?: boolean;
};

export default function DashboardPage() {
  const [activeApiId, setActiveApiId] = useState<string>('smartlead');
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [enabledFeatures, setEnabledFeatures] = useState<FeatureDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailData, setEmailData] = useState<any>(null);
  const [isLoadingEmailData, setIsLoadingEmailData] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement | null>(null);
  
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
      case 'yearToDate':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case 'lastYear':
        start = new Date(today.getFullYear() - 1, 0, 1);
        end = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        start = new Date(today);
        start.setDate(today.getDate() - 13);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };
  
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [selectedPreset, setSelectedPreset] = useState<string>('last14');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  
  const handlePresetSelect = (preset: string) => {
    const newRange = getPresetRange(preset);
    setDateRange(newRange);
    setSelectedPreset(preset);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };

    if (isDatePickerOpen || isClientDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen, isClientDropdownOpen]);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        const clientsList = data.clients || [];
        setClients(clientsList);
        if (clientsList.length > 0 && !selectedClient) {
          const firstClient = clientsList[0];
          setSelectedClient(firstClient.subdomain);
          // Auto-select available API source
          if (firstClient.hasLemlist && !firstClient.hasSmartlead) {
            setActiveApiId('lemlist');
          } else if (firstClient.hasSmartlead && !firstClient.hasLemlist) {
            setActiveApiId('smartlead');
          }
        }
      })
      .catch(err => {
        console.error('Failed to fetch clients:', err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    
    // Fetch enabled features for selected client
    fetch(`/api/features?client=${selectedClient}`)
      .then(res => res.json())
      .then(data => {
        const features = data.enabledFeatures || [];
        setEnabledFeatures(features);
        if (features.length > 0) {
          setActiveTabId(features[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch features:', err);
        setLoading(false);
      });
  }, [selectedClient]);

  useEffect(() => {
    if (activeTabId === 'email' && selectedClient) {
      setIsLoadingEmailData(true);
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        client: selectedClient,
      });
      
      // Choose endpoint based on active API
      const endpoint = activeApiId === 'lemlist' 
        ? `/api/dashboard/lemlist?${params.toString()}`
        : `/api/dashboard/email?${params.toString()}`;
      
      fetch(endpoint)
        .then(async res => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const errorMessage = errorData.error || `HTTP error! status: ${res.status}`;
            throw new Error(errorMessage);
          }
          return res.json();
        })
        .then(data => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Frontend] Received API response:', { hasData: !!data.data, metricsCount: data.data?.metrics?.length, firstMetric: data.data?.metrics?.[0] });
          }
          if (data.data) {
              const transformedData = {
              ...data.data,
              metrics: data.data.metrics.map((m: any) => {
                // For Lemlist, use appropriate icons based on metric title
                let icon = CheckCircleIcon;
                if (activeApiId === 'lemlist') {
                  if (m.title.includes('Sent')) icon = MailIcon;
                  else if (m.title.includes('Open')) icon = CheckCircleIcon;
                  else if (m.title.includes('Click')) icon = CheckCircleIcon;
                  else if (m.title.includes('Reply')) icon = CheckCircleIcon;
                } else {
                  // For Smartlead, assign icons based on metric title
                  if (m.title === 'Emails Sent') icon = MailIcon;
                  else if (m.title === 'Opened') icon = CheckCircleIcon;
                  else if (m.title === 'Replied') icon = CheckCircleIcon;
                  else if (m.title === 'Positive Reply') icon = ThumbsUpIcon;
                  else if (m.title === 'Bounced') icon = XCircleIcon;
                  else if (m.title === 'Number of Campaigns') icon = AnalyticsIcon;
                  else if (m.title === 'Total Leads') icon = UserCircleIcon;
                  else if (m.title === 'Completed Leads') icon = TasksIcon;
                  else if (m.title === 'Blocked/Escalated') icon = XCircleIcon;
                  else {
                    icon = getMockDataForFeature('email')?.metrics.find((am: any) => am.title === m.title)?.icon || CheckCircleIcon;
                  }
                }
                return {
                  ...m,
                  icon,
                };
              }),
            };
            setEmailData(transformedData);
          } else {
            throw new Error('No data returned from API');
          }
        })
        .catch(err => {
          console.error(`Failed to fetch ${activeApiId} data:`, err);
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          if (errorMessage.includes('API key not configured')) {
            setEmailData({
              error: `The selected client does not have a ${activeApiId === 'lemlist' ? 'Lemlist' : 'Smartlead'} API key configured. Please switch to a different client or API source.`,
            });
          } else {
            setEmailData(null);
          }
        })
        .finally(() => setIsLoadingEmailData(false));
    } else {
      setEmailData(null);
    }
  }, [activeTabId, activeApiId, dateRange.start, dateRange.end, selectedClient]);

  if (loading) {
    return <div className="p-12">Loading...</div>;
  }

  if (enabledFeatures.length === 0) {
    return <div className="p-12">No features enabled for this tenant.</div>;
  }

  const activeFeature = enabledFeatures.find(f => f.id === activeTabId);
  
  if (activeTabId === 'email') {
    if (emailData?.error) {
      return (
        <div className="p-12">
          <div className="glass rounded-xl border-red-500/20 p-8 max-w-2xl">
            <h2 className="text-xl font-semibold text-red-400 mb-2">API Key Not Configured</h2>
            <p className="text-slate-300">{emailData.error}</p>
          </div>
        </div>
      );
    }
    if (!emailData) {
      if (isLoadingEmailData) {
        return <div className="p-12">Loading campaign data...</div>;
      }
      return <div className="p-12">Error: Failed to load email campaign data</div>;
    }
  }
  
  const activeData = activeTabId === 'email' && emailData && !emailData.error
    ? emailData 
    : activeTabId 
      ? getMockDataForFeature(activeTabId) 
      : null;

  // Debug: Log data flow (development only)
  if (process.env.NODE_ENV === 'development' && activeTabId === 'email') {
    console.log('[Frontend Debug]', {
      hasEmailData: !!emailData,
      emailDataMetrics: emailData?.metrics?.length,
      firstMetric: emailData?.metrics?.[0],
      activeDataMetrics: activeData?.metrics?.length,
      dateRange
    });
  }

  if (!activeFeature || !activeData) {
    return <div className="p-12">Error: Feature data not found</div>;
  }

  const Icon = activeFeature.icon;
    
  return (
    <div className="pt-8 sm:pt-10 lg:pt-12 xl:pt-16 px-12 sm:px-16 lg:px-24 xl:px-32 pb-12 sm:pb-16 lg:pb-24 xl:pb-32">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
            Omniforce Analytics
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">AI Automation Performance Dashboard</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
          {/* Client Selector */}
          {clients.length > 0 && (
            <div className="relative flex-grow sm:flex-grow-0" ref={clientDropdownRef}>
              <div 
                className="glass rounded-xl border-purple-500/20 cursor-pointer relative min-w-[180px]"
                onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
              >
                <UserCircleIcon className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="bg-transparent pl-10 pr-8 py-2.5 text-sm w-full text-slate-300 flex items-center">
                  {clients.find(c => c.subdomain === selectedClient)?.name || 'Select client'}
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-purple-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {isClientDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 glass rounded-xl border-purple-500/20 p-2 z-50 min-w-[180px] max-h-[300px] overflow-y-auto">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client.subdomain);
                        setIsClientDropdownOpen(false);
                        setLoading(true);
                        setEmailData(null);
                        // Auto-switch to available API source
                        if (client.hasLemlist && !client.hasSmartlead) {
                          setActiveApiId('lemlist');
                        } else if (client.hasSmartlead && !client.hasLemlist) {
                          setActiveApiId('smartlead');
                        }
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedClient === client.subdomain
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-300 hover:bg-purple-500/10 hover:text-purple-300'
                      }`}
                    >
                      {client.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="relative flex-grow sm:flex-grow-0" ref={datePickerRef}>
            <div 
              className="glass rounded-xl border-purple-500/20 cursor-pointer relative"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              <CalendarIcon className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="bg-transparent pl-10 pr-4 py-2.5 text-sm w-full text-slate-300 flex items-center">
                {dateRange.start && dateRange.end 
                  ? `${new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : 'Select date range'
                }
              </div>
            </div>
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-2 glass rounded-xl border-purple-500/20 p-4 z-50 min-w-[320px] max-w-[400px]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">Quick Select</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handlePresetSelect('last7')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          selectedPreset === 'last7'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        Last 7 days
                      </button>
                      <button
                        onClick={() => handlePresetSelect('last14')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          selectedPreset === 'last14'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        Last 14 days
                      </button>
                      <button
                        onClick={() => handlePresetSelect('last30')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          selectedPreset === 'last30'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        Last 30 days
                      </button>
                      <button
                        onClick={() => handlePresetSelect('last90')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          selectedPreset === 'last90'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        Last 90 days
                      </button>
                      <button
                        onClick={() => handlePresetSelect('thisMonth')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          selectedPreset === 'thisMonth'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        This month
                      </button>
                      <button
                        onClick={() => handlePresetSelect('lastMonth')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          selectedPreset === 'lastMonth'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        Last month
                      </button>
                      <button
                        onClick={() => handlePresetSelect('last3Months')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          selectedPreset === 'last3Months'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        Last 3 months
                      </button>
                      <button
                        onClick={() => handlePresetSelect('last6Months')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          selectedPreset === 'last6Months'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        Last 6 months
                      </button>
                      <button
                        onClick={() => handlePresetSelect('yearToDate')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          selectedPreset === 'yearToDate'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        Year to date
                      </button>
                      <button
                        onClick={() => handlePresetSelect('lastYear')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          selectedPreset === 'lastYear'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        Last year
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-t border-purple-500/10 pt-3">
                    <label className="block text-xs font-medium text-slate-300 mb-2">Custom Range</label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            setDateRange(prev => {
                              const newRange = { ...prev, start: newStart };
                              if (newRange.end && newStart > newRange.end) {
                                newRange.end = newStart;
                              }
                              setSelectedPreset('custom');
                              return newRange;
                            });
                          }}
                          max={dateRange.end || new Date().toISOString().split('T')[0]}
                          className="w-full bg-slate-900/50 border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">End Date</label>
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => {
                            const newEnd = e.target.value;
                            setDateRange(prev => {
                              const newRange = { ...prev, end: newEnd };
                              if (newRange.start && newEnd < newRange.start) {
                                newRange.start = newEnd;
                              }
                              setSelectedPreset('custom');
                              return newRange;
                            });
                          }}
                          min={dateRange.start || undefined}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full bg-slate-900/50 border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500/40"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className="p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-purple-400 hover:text-purple-300 hover:border-purple-500/50 transition-all duration-300 shadow-lg shadow-black/20">
            <DownloadIcon className="w-4 h-4"/>
          </button>
          <button className="p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-purple-400 hover:text-purple-300 hover:border-purple-500/50 transition-all duration-300 shadow-lg shadow-black/20">
            <UserCircleIcon className="w-4 h-4"/>
          </button>
        </div>
      </header>

      {/* API/Data Source Tabs */}
      <div className="mb-4">
        <div className="inline-block bg-white/5 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-xl shadow-black/20">
          <nav className="flex space-x-2" aria-label="API Tabs">
            {apiSources.map((api) => {
              const ApiIconComponent = api.icon;
              const selectedClientData = clients.find(c => c.subdomain === selectedClient);
              const isAvailable = api.id === 'smartlead' 
                ? selectedClientData?.hasSmartlead 
                : selectedClientData?.hasLemlist;
              const isDisabled = !isAvailable;
              
              return (
                <button
                  key={api.id}
                  onClick={() => {
                    if (!isDisabled) {
                      setActiveApiId(api.id);
                    }
                  }}
                  disabled={isDisabled}
                  className={`${
                    activeApiId === api.id
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30 scale-105'
                      : isDisabled
                      ? 'text-slate-500 cursor-not-allowed opacity-50'
                      : 'text-slate-400 hover:text-purple-300 hover:bg-purple-500/10'
                  } flex items-center gap-2 whitespace-nowrap rounded-lg py-2.5 px-5 font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black`}
                  title={isDisabled ? `${api.name} API key not configured for this client` : undefined}
                >
                  <ApiIconComponent className={`w-4 h-4 ${activeApiId === api.id ? 'text-white' : ''}`} />
                  {api.name}
                  {isDisabled && <span className="text-xs ml-1">(N/A)</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Feature Tabs - Dynamically rendered based on tenant config */}
      {enabledFeatures.length > 1 && (
        <div className="mb-4">
          <nav className="flex gap-2" aria-label="Feature Tabs">
            {enabledFeatures.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveTabId(feature.id)}
                  className={`${
                    activeTabId === feature.id
                      ? 'text-white bg-purple-500/20 border border-purple-500/30'
                      : 'text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent'
                  } flex items-center gap-2 whitespace-nowrap py-2 px-4 text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <FeatureIcon className="w-4 h-4" />
                  {feature.name}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      <main className="mt-6">
        {isLoadingEmailData && activeTabId === 'email' ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading campaign data from {apiSources.find(a => a.id === activeApiId)?.name || 'API'}...</div>
          </div>
        ) : (
          <>
            {/* Metric Cards - Grouped by Section (Lemlist) */}
            {emailData?.metricSections ? (
              <>
                {/* Email Metrics Section */}
                {emailData.metricSections.email && emailData.metricSections.email.metrics.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white mb-3 px-1">{emailData.metricSections.email.title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {emailData.metricSections.email.metrics.map((metric: { title: string; value: string | number; comparisonText?: string; icon?: React.ElementType }) => (
                        <MetricCard 
                          key={metric.title}
                          title={metric.title}
                          value={typeof metric.value === 'number' ? metric.value.toString() : metric.value}
                          comparisonText={metric.comparisonText || ''}
                          icon={metric.icon || CheckCircleIcon}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* LinkedIn Metrics Section */}
                {emailData.metricSections.linkedin && emailData.metricSections.linkedin.metrics.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white mb-3 px-1">{emailData.metricSections.linkedin.title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {emailData.metricSections.linkedin.metrics.map((metric: { title: string; value: string | number; comparisonText?: string; icon?: React.ElementType }) => (
                        <MetricCard 
                          key={metric.title}
                          title={metric.title}
                          value={typeof metric.value === 'number' ? metric.value.toString() : metric.value}
                          comparisonText={metric.comparisonText || ''}
                          icon={metric.icon || CheckCircleIcon}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Campaign Metrics Section */}
                {emailData.metricSections.campaigns && emailData.metricSections.campaigns.metrics.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white mb-3 px-1">{emailData.metricSections.campaigns.title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {emailData.metricSections.campaigns.metrics.map((metric: { title: string; value: string | number; comparisonText?: string; icon?: React.ElementType }) => (
                        <MetricCard 
                          key={metric.title}
                          title={metric.title}
                          value={typeof metric.value === 'number' ? metric.value.toString() : metric.value}
                          comparisonText={metric.comparisonText || ''}
                          icon={metric.icon || CheckCircleIcon}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Fallback to flat metrics array for backward compatibility (Smartlead) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {activeData.metrics.map((metric: { title: string; value: string | number; comparisonText?: string; change?: number; trend?: 'up' | 'down'; icon?: React.ElementType }) => (
                  <MetricCard 
                    key={metric.title}
                    title={metric.title}
                    value={typeof metric.value === 'number' ? metric.value.toString() : metric.value}
                    comparisonText={metric.comparisonText || ''}
                    icon={metric.icon || CheckCircleIcon}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {!isLoadingEmailData && activeTabId === 'email' && emailData && (
          <>
            {/* Engagement Metrics Graph */}
            {emailData.engagementMetrics && emailData.engagementMetrics.data && emailData.engagementMetrics.data.length > 0 && (
              <div className="mb-6">
                <EngagementMetricsChart
                  title={emailData.engagementMetrics.title}
                  description={emailData.engagementMetrics.description}
                  data={emailData.engagementMetrics.data}
                />
              </div>
            )}

            <div className="mb-6">
              <BarChartCard 
                title={emailData.campaignPerformance.title}
                description={emailData.campaignPerformance.description}
                data={emailData.campaignPerformance.data}
                valueLabel={emailData.campaignPerformance.valueLabel}
                endpoint={emailData.campaignPerformance.endpoint}
              />
            </div>

            {/* Activity Timeline - Lemlist specific */}
            {emailData.activityTimeline && emailData.activityTimeline.data.length > 0 && (
              <div className="mb-6">
                <div className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-purple-500/10">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                    <div className="text-base font-semibold text-white">{emailData.activityTimeline.title}</div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-slate-400 mb-4">{emailData.activityTimeline.description}</div>
                    <AreaChartCard
                      title=""
                      description=""
                      data={emailData.activityTimeline.data.map((d: any) => ({
                        name: d.name,
                        completed: d.emailsSent,
                        failed: d.emailsOpened,
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}

          </>
        )}
        
        {!isLoadingEmailData && activeTabId !== 'email' && activeData && (
          <div className="text-slate-400 text-center py-12">
            Charts and visualizations will be available when this feature is fully implemented.
          </div>
        )}
      </main>
    </div>
  );
}
