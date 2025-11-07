import React from 'react';
import { ChartBarIcon, ChevronDownIcon } from '@/components/icons';

interface FunnelStage {
  name: string;
  value: number;
  percentage?: number;
}

interface FunnelChartCardProps {
  title: string;
  description: string;
  data: FunnelStage[];
  endpoint?: string;
}

const FunnelChartCard: React.FC<FunnelChartCardProps> = ({ title, description, data, endpoint }) => {
  const maxValue = Math.max(...data.map(d => d.value), 0);

  return (
    <div 
        className="rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 shadow-2xl shadow-purple-500/10"
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
      <div className="h-72 p-6 pt-4 flex flex-col justify-center gap-5">
        {data.map((stage, index) => {
          const widthPercentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          const displayPercentage = stage.percentage !== undefined 
            ? stage.percentage 
            : (index > 0 && data[index - 1].value > 0)
              ? ((stage.value / data[index - 1].value) * 100).toFixed(1)
              : '100.0';

          return (
            <div key={stage.name} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">{stage.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-100">{stage.value.toLocaleString()}</span>
                  <span className="text-xs font-medium text-slate-400">({displayPercentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-[#1a1a2e] rounded overflow-hidden" style={{ height: '36px' }}>
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300 flex items-center justify-end pr-3"
                  style={{ width: `${widthPercentage}%` }}
                >
                  {widthPercentage > 12 && (
                    <span className="text-xs text-slate-100 font-medium">
                      {displayPercentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FunnelChartCard;
