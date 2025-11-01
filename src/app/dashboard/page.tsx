'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import LineChartCard from '@/components/LineChartCard';
import BarChartCard from '@/components/BarChartCard';
import FunnelChartCard from '@/components/FunnelChartCard';
import GaugeChartCard from '@/components/GaugeChartCard';
import { CalendarIcon, CheckCircleIcon, ClockIcon, DownloadIcon, TasksIcon, UserCircleIcon, XCircleIcon } from '@/components/icons';
import type { FeatureDefinition } from '@/lib/config/features';

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

export default function DashboardPage() {
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [enabledFeatures, setEnabledFeatures] = useState<FeatureDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailData, setEmailData] = useState<any>(null);
  const [isLoadingEmailData, setIsLoadingEmailData] = useState(false);

  useEffect(() => {
    // Fetch enabled features for this tenant (defaults to creation-exhibitions)
    fetch('/api/features')
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
  }, []);

  useEffect(() => {
    if (activeTabId === 'email') {
      setIsLoadingEmailData(true);
      fetch('/api/dashboard/email')
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.data) {
            const transformedData = {
              ...data.data,
              metrics: data.data.metrics.map((m: any) => ({
                ...m,
                icon: getMockDataForFeature('email')?.metrics.find((am: any) => am.title === m.title)?.icon || CheckCircleIcon,
              })),
            };
            setEmailData(transformedData);
          } else {
            throw new Error('No data returned from API');
          }
        })
        .catch(err => {
          console.error('Failed to fetch email data:', err);
          setEmailData(null);
        })
        .finally(() => setIsLoadingEmailData(false));
    } else {
      setEmailData(null);
    }
  }, [activeTabId]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (enabledFeatures.length === 0) {
    return <div className="p-8">No features enabled for this tenant.</div>;
  }

  const activeFeature = enabledFeatures.find(f => f.id === activeTabId);
  
  if (activeTabId === 'email') {
    if (!emailData) {
      if (isLoadingEmailData) {
        return <div className="p-8">Loading campaign data...</div>;
      }
      return <div className="p-8">Error: Failed to load email campaign data</div>;
    }
  }
  
  const activeData = activeTabId === 'email' && emailData 
    ? emailData 
    : activeTabId 
      ? getMockDataForFeature(activeTabId) 
      : null;

  if (!activeFeature || !activeData) {
    return <div className="p-8">Error: Feature data not found</div>;
  }

  const Icon = activeFeature.icon;
    
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 mb-8">
        <h1 className="text-2xl font-bold text-white">Omniforce Analytics</h1>
        <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <CalendarIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              defaultValue="Feb 10 - Feb 25, 2025"
              className="bg-transparent border-0 pl-10 pr-4 py-2 text-sm w-full text-slate-400 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <button className="p-2 text-slate-500 hover:text-slate-400">
            <DownloadIcon className="w-4 h-4"/>
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-400">
            <UserCircleIcon className="w-4 h-4"/>
          </button>
        </div>
      </header>

      {/* Feature Tabs - Dynamically rendered based on tenant config */}
      {enabledFeatures.length > 1 && (
        <div className="mb-8">
          <nav className="flex gap-1" aria-label="Tabs">
            {enabledFeatures.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveTabId(feature.id)}
                  className={`${
                    activeTabId === feature.id
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-400'
                  } flex items-center gap-2 whitespace-nowrap py-2 px-4 text-sm font-medium transition-colors focus:outline-none`}
                >
                  <FeatureIcon className="w-4 h-4" />
                  {feature.name}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      <main className="mt-10">
        {isLoadingEmailData && activeTabId === 'email' ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading campaign data from Smartlead...</div>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {activeData.metrics.map(metric => (
                <MetricCard 
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  comparisonText={metric.comparisonText}
                  icon={metric.icon}
                />
              ))}
            </div>
          </>
        )}
        
        {!isLoadingEmailData && activeTabId === 'email' && emailData && (
          <>
            {/* Rate Metrics - Gauge Charts */}
            {emailData.openRateGauge || emailData.clickRateGauge || emailData.replyRateGauge ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {emailData.openRateGauge && (
                  <GaugeChartCard 
                    title={emailData.openRateGauge.title}
                    percentage={emailData.openRateGauge.percentage}
                    icon={CheckCircleIcon}
                  />
                )}
                {emailData.clickRateGauge && (
                  <GaugeChartCard 
                    title={emailData.clickRateGauge.title}
                    percentage={emailData.clickRateGauge.percentage}
                    icon={CheckCircleIcon}
                  />
                )}
                {emailData.replyRateGauge && (
                  <GaugeChartCard 
                    title={emailData.replyRateGauge.title}
                    percentage={emailData.replyRateGauge.percentage}
                    icon={CheckCircleIcon}
                  />
                )}
              </div>
            ) : (
              <div className="bg-[#0f0f1a] border border-[#2a2a3a] rounded-xl p-6 mb-6 text-center text-white">
                Debug: Gauge data not found. Available keys: {Object.keys(emailData).join(', ')}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <FunnelChartCard 
                title={emailData.engagementFunnel.title}
                description={emailData.engagementFunnel.description}
                data={emailData.engagementFunnel.data}
                endpoint={emailData.engagementFunnel.endpoint}
              />
            </div>

            <div className="mb-6">
              <BarChartCard 
                title={emailData.campaignPerformance.title}
                description={emailData.campaignPerformance.description}
                data={emailData.campaignPerformance.data}
                valueLabel={emailData.campaignPerformance.valueLabel}
                endpoint={emailData.campaignPerformance.endpoint}
              />
            </div>

            {/* Additional Metrics - Nice to Have */}
            {emailData.additionalMetrics && (
              <div className="bg-[#0f0f1a] border border-[#2a2a3a] rounded-xl overflow-hidden mb-6">
                <div className="flex items-center gap-2 px-6 py-3 border-b border-[#2a2a3a]">
                  <div className="text-sm font-normal text-white">{emailData.additionalMetrics.title}</div>
                </div>
                <div className="p-6 pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {emailData.additionalMetrics.data.map((metric: any, index: number) => (
                      <div key={index} className="flex flex-col">
                        <div className="text-2xl font-normal text-white mb-1 tracking-tight">{metric.value}</div>
                        <div className="text-xs font-normal text-white">{metric.label}</div>
                        {metric.percentage !== undefined && (
                          <div className="text-xs font-normal text-white mt-1">{metric.percentage.toFixed(1)}%</div>
                        )}
                      </div>
                    ))}
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
