import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '../types';
import { ChartBarIcon, ChevronDownIcon } from './icons';

interface LineChartCardProps {
    title: string;
    description: string;
    data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700 p-2 border border-slate-600 rounded-md text-sm">
        <p className="label text-slate-300">{`${label}`}</p>
        <p className="text-blue-400">{`Avg evaluation score: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const LineChartCard: React.FC<LineChartCardProps> = ({ title, description, data }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center text-slate-400 text-sm mb-2">
             <ChartBarIcon className="w-5 h-5 mr-2"/>
            <span>{title}</span>
          </div>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <button className="flex items-center gap-2 text-sm bg-slate-700/50 px-3 py-1 rounded-md hover:bg-slate-700 transition-colors">
            Days
            <ChevronDownIcon className="w-4 h-4"/>
        </button>
      </div>
      <div className="h-72 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis 
                domain={[0, 5]} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeDasharray: '3 3' }} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-slate-400 ml-2">{value}</span>}
            />
            <Line type="monotone" dataKey="avgScore" name="Avg evaluation score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartCard;