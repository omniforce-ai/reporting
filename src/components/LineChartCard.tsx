import React from 'react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '@/types';
import { ChartBarIcon, ChevronDownIcon } from '@/components/icons';

interface LineChartCardProps {
    title: string;
    description: string;
    data: ChartDataPoint[];
    endpoint?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
          className="border border-purple-500/50 p-3 rounded-xl text-xs shadow-2xl shadow-purple-500/30 backdrop-blur-xl"
          style={{ 
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.25) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
          }}
      >
        <p className="text-slate-100 mb-2 font-semibold">{`${label}`}</p>
        <p className="text-purple-200 font-bold text-sm">{`${payload[0].name || 'Value'}: ${payload[0].value}${typeof payload[0].value === 'number' && payload[0].value <= 100 ? '%' : ''}`}</p>
      </div>
    );
  }
  return null;
};

const LineChartCard: React.FC<LineChartCardProps> = ({ title, description, data, endpoint }) => {
  return (
    <div 
        className="rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-500/60 transition-all duration-500 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20"
        style={{ 
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(168, 85, 247, 0.08) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
        }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-500/10">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
          <ChartBarIcon className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-xs font-semibold text-slate-100">{title}</div>
      </div>
      <div className="h-72 p-6 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#9333ea" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#a78bfa', fontSize: 11, fontWeight: 500 }} 
              axisLine={false} 
              tickLine={false}
            />
            <YAxis 
                domain={[0, 'dataMax']} 
                tick={{ fill: '#a78bfa', fontSize: 11, fontWeight: 500 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#a855f7', strokeWidth: 2, strokeOpacity: 0.4, strokeDasharray: '5 5' }} />
            <Area 
              type="monotone" 
              dataKey="avgScore" 
              fill="url(#lineGradient)" 
              stroke="none"
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="avgScore" 
              name="Rate" 
              stroke="#a855f7" 
              strokeWidth={3}
              dot={{ fill: '#a855f7', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#fff', stroke: '#a855f7', strokeWidth: 3, filter: 'url(#glow)' }}
              animationDuration={1500}
              animationBegin={0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartCard;
