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
      <div className="bg-[#1f1f1f] border border-[#2a2a2a] p-2.5 rounded text-xs">
        <p className="text-white mb-1 font-normal">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-white font-normal">
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
    <div className="bg-[#0f0f1a] border border-[#2a2a3a] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[#2a2a3a]">
        <ChartBarIcon className="w-4 h-4 text-white" />
        <div className="text-sm font-normal text-white">{title}</div>
      </div>
      <div className="h-72 p-6 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#737373', fontSize: 11 }} 
              axisLine={false} 
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              domain={yAxisDomain}
              tick={{ fill: '#737373', fontSize: 11 }} 
              axisLine={false} 
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip valueLabel={valueLabel} />} cursor={{ fill: 'rgba(0, 123, 255, 0.08)' }} />
            <Bar 
              dataKey={dataKey} 
              name={valueLabel || title}
              fill="#007BFF" 
              radius={[6, 6, 0, 0]}
              strokeWidth={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartCard;

