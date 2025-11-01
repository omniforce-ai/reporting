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
      <div className="bg-[#1f1f1f] border border-[#2a2a2a] p-2.5 rounded text-xs">
        <p className="text-white mb-1 font-normal">{`${label}`}</p>
        <p className="text-white font-normal">{`Completed: ${payload[0].value}`}</p>
        <p className="text-white font-normal">{`Failed: ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

const AreaChartCard: React.FC<AreaChartCardProps> = ({ title, description, data }) => {
  return (
    <div className="bg-[#0f0f1a] border border-[#2a2a3a] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[#2a2a3a]">
        <ChartBarIcon className="w-4 h-4 text-white" />
        <div className="text-sm font-normal text-white">{title}</div>
      </div>
      <div className="h-72 p-6 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#007BFF" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#007BFF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#737373" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#737373" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#404040', strokeDasharray: '3 3', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="completed" name="Completed" stroke="#007BFF" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
            <Area type="monotone" dataKey="failed" name="Failed" stroke="#737373" strokeWidth={3} fillOpacity={1} fill="url(#colorFailed)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AreaChartCard;