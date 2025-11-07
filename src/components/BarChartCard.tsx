import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartBarIcon, ChevronDownIcon } from '@/components/icons';

interface BarChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface BarChartCardProps {
  title: string;
  description: string;
  data: BarChartDataPoint[];
  dataKey?: string;
  valueLabel?: string;
  endpoint?: string;
}

const CustomTooltip = ({ active, payload, label, valueLabel }: any) => {
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
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-purple-200 font-bold text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-purple-300 shadow-sm shadow-purple-400/50"></span>
            {`${valueLabel || entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}${entry.unit || ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BarChartCard: React.FC<BarChartCardProps> = ({ 
  title, 
  description, 
  data, 
  dataKey = 'value',
  valueLabel,
  endpoint
}) => {
  const maxValue = Math.max(...data.map(d => typeof d[dataKey] === 'number' ? d[dataKey] : 0), 0);
  const yAxisDomain = [0, Math.ceil(maxValue * 1.1)];

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
      <div className="h-64 p-4 pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#a78bfa', fontSize: 11, fontWeight: 500 }} 
              axisLine={false} 
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              domain={yAxisDomain}
              tick={{ fill: '#a78bfa', fontSize: 11, fontWeight: 500 }} 
              axisLine={false} 
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip valueLabel={valueLabel} />} cursor={{ fill: 'rgba(168, 85, 247, 0.15)' }} />
            <defs>
              <linearGradient id="purpleBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                <stop offset="50%" stopColor="#9333ea" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <Bar 
              dataKey={dataKey} 
              name={valueLabel || title}
              fill="url(#purpleBarGradient)" 
              radius={[10, 10, 0, 0]}
              strokeWidth={0}
              animationDuration={1500}
              animationBegin={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartCard;
