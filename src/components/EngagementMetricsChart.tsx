import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartBarIcon } from '@/components/icons';

interface EngagementMetricsChartProps {
  title: string;
  description: string;
  data: Array<{
    name: string;
    'Email Sent'?: number;
    'Email Opened'?: number;
    'Replied'?: number;
    'Positive Replied'?: number;
    'Bounced'?: number;
    'Unsubscribed'?: number;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="border border-purple-500/50 p-3 rounded-xl text-xs shadow-2xl shadow-purple-500/30 backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-slate-800/95"
        style={{ 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <p className="text-slate-100 mb-2 font-semibold">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm mb-1" style={{ color: entry.color }}>
            <span className="font-semibold">{entry.name}:</span> {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EngagementMetricsChart: React.FC<EngagementMetricsChartProps> = ({ title, description, data }) => {
  return (
    <div 
      className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-purple-500/10 mb-4"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
          <ChartBarIcon className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold text-white">{title}</div>
          {description && (
            <div className="text-xs text-slate-400 mt-0.5">{description}</div>
          )}
        </div>
      </div>
      <div className="h-72 p-6 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 11 }} 
              axisLine={false} 
              tickLine={false}
            />
            <YAxis 
              domain={[0, 'dataMax']}
              tick={{ fill: '#94a3b8', fontSize: 11 }} 
              axisLine={false} 
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
            />
            <Line 
              type="monotone" 
              dataKey="Email Sent" 
              name="Email Sent"
              stroke="#9333ea" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#9333ea' }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="Email Opened" 
              name="Email Opened"
              stroke="#c084fc" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#c084fc' }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="Replied" 
              name="Replied"
              stroke="#60a5fa" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#60a5fa' }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="Positive Replied" 
              name="Positive Replied"
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#22c55e' }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="Bounced" 
              name="Bounced"
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#ef4444' }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="Unsubscribed" 
              name="Unsubscribed"
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#f97316' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EngagementMetricsChart;





