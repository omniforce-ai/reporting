import React from 'react';
import type { Metric } from '@/types';

const MetricCard: React.FC<Metric> = ({ title, value, comparisonText, icon: Icon }) => {
  return (
    <div 
        className="group relative rounded-xl px-4 py-3 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 shadow-2xl shadow-purple-500/10"
        style={{ 
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(168, 85, 247, 0.08) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
        }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
            <Icon className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-sm font-medium text-slate-300">{title}</div>
        </div>
        <div className="text-3xl font-bold text-slate-100 tracking-tight mb-1.5">
          {value}
        </div>
        <div className="text-xs font-medium text-slate-400">{comparisonText}</div>
      </div>
    </div>
  );
};

export default MetricCard;
