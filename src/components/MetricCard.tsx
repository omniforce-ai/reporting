import React from 'react';
import type { Metric } from '@/types';

const MetricCard: React.FC<Metric> = ({ title, value, comparisonText, icon: Icon }) => {
  return (
    <div className="bg-[#0f0f1a] border border-[#2a2a3a] rounded-xl px-6 py-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-5 h-5 text-white" />
        <div className="text-sm font-normal text-white">{title}</div>
      </div>
      <div className="text-2xl font-normal text-white tracking-tight mb-1">{value}</div>
      <div className="text-sm font-normal text-white">{comparisonText}</div>
    </div>
  );
};

export default MetricCard;
