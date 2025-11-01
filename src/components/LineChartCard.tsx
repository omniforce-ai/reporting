import React from 'react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '@/types';
import { ChartBarIcon, ChevronDownIcon } from '@/components/icons';

interface LineChartCardProps {
    title: string;
    description: string;
    data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1f1f1f] border border-[#2a2a2a] p-2.5 rounded text-xs">
        <p className="text-white mb-1 font-normal">{`${label}`}</p>
        <p className="text-white font-normal">{`${payload[0].name || 'Value'}: ${payload[0].value}${typeof payload[0].value === 'number' && payload[0].value <= 100 ? '%' : ''}`}</p>
      </div>
    );
  }
  return null;
};

interface LineChartCardProps {
    title: string;
    description: string;
    data: ChartDataPoint[];
    endpoint?: string;
}

const LineChartCard: React.FC<LineChartCardProps> = ({ title, description, data, endpoint }) => {
  return (
    <div className="bg-[#0f0f1a] border border-[#2a2a3a] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[#2a2a3a]">
        <ChartBarIcon className="w-4 h-4 text-white" />
        <div className="text-sm font-normal text-white">{title}</div>
      </div>
      <div className="h-72 p-6 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#007BFF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#007BFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#737373', fontSize: 11 }} 
              axisLine={false} 
              tickLine={false}
            />
            <YAxis 
                domain={[0, 'dataMax']} 
                tick={{ fill: '#737373', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#007BFF', strokeWidth: 1, strokeOpacity: 0.3 }} />
            <Area 
              type="monotone" 
              dataKey="avgScore" 
              fill="url(#lineGradient)" 
              stroke="none"
            />
            <Line 
              type="monotone" 
              dataKey="avgScore" 
              name="Rate" 
              stroke="#007BFF" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: '#007BFF', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartCard;