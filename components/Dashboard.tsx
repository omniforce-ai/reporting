import React, { useState } from 'react';
import MetricCard from './MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AnalyticsIcon, CalendarIcon, CheckCircleIcon, ClockIcon, DocumentTextIcon, DownloadIcon, InboxIcon, SupportIcon, TasksIcon, UserCircleIcon, XCircleIcon } from './icons';
import type { Agent } from '../types';

const agents: Agent[] = [
    {
        id: 'email',
        name: 'Email Triage',
        icon: InboxIcon,
        data: {
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
        }
    },
    {
        id: 'sales',
        name: 'Sales Ops',
        icon: AnalyticsIcon,
        data: {
            metrics: [
                { title: 'Leads Processed', value: '435', comparisonText: '+25% from prior period', icon: CheckCircleIcon },
                { title: 'Data Entry Errors', value: '4', comparisonText: '-2 from prior period', icon: XCircleIcon },
                { title: 'Avg. Time to Update CRM', value: '4m 15s', comparisonText: '-30s from prior period', icon: ClockIcon },
                { title: 'Deals Updated', value: '102', comparisonText: '+15 from prior period', icon: TasksIcon },
            ],
            completionRate: { title: 'Task success rate', percentage: 99.1, icon: CheckCircleIcon },
            feedbackScore: { title: 'Sales Rep Feedback', percentage: 95.2, positiveCount: 40, negativeCount: 2, icon: TasksIcon },
            evaluationHistory: {
                title: '% Evaluation scores history',
                description: 'Showing average evaluation scores over the selected period of time',
                data: [
                    { name: '17/2', avgScore: 3.1 }, { name: '18/2', avgScore: 3.5 }, { name: '19/2', avgScore: 3.2 }, { name: '20/2', avgScore: 3.8 }, { name: '21/2', avgScore: 3.7 },
                ]
            },
            tasksHistory: {
                title: 'Lead Processing',
                description: 'Showing processed leads and data errors over the selected period of time',
                data: [
                    { name: '17/2', completed: 70, failed: 1 }, { name: '18/2', completed: 85, failed: 0 }, { name: '19/2', completed: 90, failed: 2 }, { name: '20/2', completed: 82, failed: 1 }, { name: '21/2', completed: 108, failed: 0 },
                ]
            }
        }
    },
    {
        id: 'support',
        name: 'Customer Support',
        icon: SupportIcon,
        data: {
            metrics: [
                { title: 'Tickets Resolved', value: '810', comparisonText: '+5% from prior period', icon: CheckCircleIcon },
                { title: 'Tickets Escalated', value: '41', comparisonText: '+2% from prior period', icon: XCircleIcon },
                { title: 'Avg. Resolution Time', value: '4h 12m', comparisonText: '-1h from prior period', icon: ClockIcon },
                { title: 'CSAT Score', value: '4.8/5', comparisonText: '+0.1 from prior period', icon: TasksIcon },
            ],
            completionRate: { title: 'First-contact resolution', percentage: 76.8, icon: CheckCircleIcon },
            feedbackScore: { title: 'Customer Feedback Score', percentage: 92.4, positiveCount: 245, negativeCount: 21, icon: TasksIcon },
            evaluationHistory: {
                title: '% Evaluation scores history',
                description: 'Showing average evaluation scores over the selected period of time',
                data: [
                    { name: '17/2', avgScore: 2.5 }, { name: '18/2', avgScore: 2.2 }, { name: '19/2', avgScore: 2.8 }, { name: '20/2', avgScore: 2.6 }, { name: '21/2', avgScore: 3.1 },
                ]
            },
            tasksHistory: {
                title: 'Ticket Volume',
                description: 'Showing resolved and escalated tickets over the selected period of time',
                data: [
                    { name: '17/2', completed: 150, failed: 10 }, { name: '18/2', completed: 162, failed: 8 }, { name: '19/2', completed: 140, failed: 12 }, { name: '20/2', completed: 175, failed: 5 }, { name: '21/2', completed: 183, failed: 6 },
                ]
            }
        }
    },
    {
        id: 'docs',
        name: 'Document Processing',
        icon: DocumentTextIcon,
        data: {
            metrics: [
                { title: 'Documents Processed', value: '2,450', comparisonText: '+30% from prior period', icon: CheckCircleIcon },
                { title: 'Extraction Errors', value: '15', comparisonText: '-10% from prior period', icon: XCircleIcon },
                { title: 'Avg. Processing Time', value: '58s', comparisonText: '-12s from prior period', icon: ClockIcon },
                { title: 'Avg. Confidence Score', value: '96.2%', comparisonText: '+1.1% from prior period', icon: TasksIcon },
            ],
            completionRate: { title: 'Straight-through processing', percentage: 88.0, icon: CheckCircleIcon },
            feedbackScore: { title: 'User Verification Score', percentage: 97.5, positiveCount: 312, negativeCount: 8, icon: TasksIcon },
            evaluationHistory: {
                title: '% Evaluation scores history',
                description: 'Showing average evaluation scores over the selected period of time',
                data: [
                    { name: '17/2', avgScore: 4.1 }, { name: '18/2', avgScore: 4.0 }, { name: '19/2', avgScore: 4.2 }, { name: '20/2', avgScore: 4.4 }, { name: '21/2', avgScore: 4.3 },
                ]
            },
            tasksHistory: {
                title: 'Document Volume',
                description: 'Showing processed documents and extraction errors over time',
                data: [
                    { name: '17/2', completed: 450, failed: 4 }, { name: '18/2', completed: 480, failed: 3 }, { name: '19/2', completed: 510, failed: 5 }, { name: '20/2', completed: 490, failed: 2 }, { name: '21/2', completed: 520, failed: 1 },
                ]
            }
        }
    },
];


const Dashboard: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState<string>(agents[0].id);
  const activeAgent = agents.find(agent => agent.id === activeTabId);

  if (!activeAgent) return <div className="p-8">Error: Agent not found</div>;
  const agentData = activeAgent.data;
    
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            O
          </div>
          <h1 className="text-2xl font-bold text-white">Omniforce Analytics</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <CalendarIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              defaultValue="Feb 10 - Feb 25, 2025"
              className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0">
            <DownloadIcon className="w-5 h-5 text-slate-400"/>
          </button>
           <button className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0">
            <UserCircleIcon className="w-5 h-5 text-slate-400"/>
          </button>
        </div>
      </header>

      {/* Agent Tabs */}
       <div className="mt-6">
        <div className="inline-block bg-slate-800/80 p-1 rounded-xl">
            <nav className="flex space-x-1" aria-label="Tabs">
                {agents.map((agent) => {
                    const Icon = agent.icon;
                    return (
                        <button
                            key={agent.id}
                            onClick={() => setActiveTabId(agent.id)}
                            className={`${
                            activeTabId === agent.id
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            } flex items-center gap-2 whitespace-nowrap rounded-lg py-2 px-4 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900`}
                        >
                            <Icon className="w-5 h-5" />
                            {agent.name}
                        </button>
                    )
                })}
            </nav>
        </div>
      </div>

      <main className="mt-8">
         {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {agentData.metrics.map(metric => (
            <MetricCard 
              key={metric.title}
              title={metric.title}
              value={metric.value}
              comparisonText={metric.comparisonText}
              icon={metric.icon}
            />
          ))}
        </div>
        
        {/* Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {(() => {
            const normalizedPercentage = Math.max(0, Math.min(100, Number(agentData.completionRate.percentage) || 0));
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
                  <CardTitle>{agentData.completionRate.title}</CardTitle>
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
          {(() => {
            const normalizedPercentage = Math.max(0, Math.min(100, Number(agentData.feedbackScore.percentage) || 0));
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
                  <CardTitle>{agentData.feedbackScore.title}</CardTitle>
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
                  {agentData.feedbackScore.positiveCount !== undefined && agentData.feedbackScore.negativeCount !== undefined && (
                    <div className="flex justify-center items-center gap-6 pt-6">
                      <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                        <span>Positive</span>
                        <span className="font-bold text-foreground">{agentData.feedbackScore.positiveCount}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                        <div className="w-2.5 h-2.5 rounded-full bg-muted"></div>
                        <span>Negative</span>
                        <span className="font-bold text-foreground">{agentData.feedbackScore.negativeCount}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(() => {
            const chartData = agentData.evaluationHistory.data.map((item: any) => ({
              date: item.name,
              avgScore: item.avgScore || 0,
            }));
            const chartConfig = {
              avgScore: { label: "Score", color: "hsl(var(--chart-1))" },
            } satisfies ChartConfig;
            return (
              <Card className="@container/card flex flex-col h-full">
                <CardHeader className="relative">
                  <CardTitle>{agentData.evaluationHistory.title}</CardTitle>
                  {agentData.evaluationHistory.description && <CardDescription>{agentData.evaluationHistory.description}</CardDescription>}
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 flex flex-col">
                  <ChartContainer config={chartConfig} className="flex-1 min-h-[288px] w-full">
                    <LineChart data={chartData}>
                      <defs>
                        <linearGradient id="fillEvalAvgScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-avgScore)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--color-avgScore)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                      <Area dataKey="avgScore" type="natural" fill="url(#fillEvalAvgScore)" stroke="none" />
                      <Line dataKey="avgScore" type="natural" stroke="var(--color-avgScore)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            );
          })()}
          {(() => {
            const chartData = agentData.tasksHistory.data.map((item: any) => ({
              date: item.name,
              completed: item.completed || 0,
              failed: item.failed || 0,
            }));
            const chartConfig = {
              completed: { label: "Completed", color: "hsl(var(--chart-1))" },
              failed: { label: "Failed", color: "hsl(var(--chart-2))" },
            } satisfies ChartConfig;
            return (
              <Card className="@container/card flex flex-col h-full">
                <CardHeader className="relative">
                  <CardTitle>{agentData.tasksHistory.title}</CardTitle>
                  {agentData.tasksHistory.description && <CardDescription>{agentData.tasksHistory.description}</CardDescription>}
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 flex flex-col">
                  <ChartContainer config={chartConfig} className="flex-1 min-h-[288px] w-full">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={1.0} />
                          <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-failed)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-failed)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                      <Area dataKey="failed" type="natural" fill="url(#fillFailed)" stroke="var(--color-failed)" stackId="a" />
                      <Area dataKey="completed" type="natural" fill="url(#fillCompleted)" stroke="var(--color-completed)" stackId="a" />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;