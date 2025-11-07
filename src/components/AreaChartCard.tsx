import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '@/types';
import { ChartBarIcon, ChevronDownIcon } from '@/components/icons';

interface AreaChartCardProps {
    title: string;
    description: string;
    data: ChartDataPoint[];
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
        <p className="text-purple-200 font-bold text-sm mb-1">{`Completed: ${payload[0].value}`}</p>
        <p className="text-slate-300 font-bold text-sm">{`Failed: ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

const AreaChartCard: React.FC<AreaChartCardProps> = ({ title, description, data }) => {
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
          <AreaChart data={data} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.5}/>
                <stop offset="50%" stopColor="#9333ea" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6b7280" stopOpacity={0.4}/>
                <stop offset="50%" stopColor="#4b5563" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="#374151" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} opacity={0.3} />
            <XAxis dataKey="name" tick={{ fill: '#a78bfa', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#a78bfa', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#a855f7', strokeDasharray: '5 5', strokeWidth: 2, strokeOpacity: 0.3 }} />
            <Area 
              type="monotone" 
              dataKey="failed" 
              name="Failed" 
              stroke="#6b7280" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorFailed)" 
              animationDuration={1500}
              animationBegin={0}
            />
            <Area 
              type="monotone" 
              dataKey="completed" 
              name="Completed" 
              stroke="#a855f7" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorCompleted)" 
              animationDuration={1500}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AreaChartCard;
