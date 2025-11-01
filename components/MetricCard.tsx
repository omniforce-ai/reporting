
import React from 'react';
import type { Metric } from '../types';

const MetricCard: React.FC<Metric> = ({ title, value, comparisonText, icon: Icon }) => {
  return (
    <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/50 flex flex-col justify-between">
      <div className="flex items-center text-slate-400 text-sm mb-4">
        <Icon className="w-5 h-5 mr-2" />
        <span>{title}</span>
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{comparisonText}</p>
      </div>
    </div>
  );
};

export default MetricCard;
