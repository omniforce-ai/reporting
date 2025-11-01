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
    <div className="bg-[#0f0f1a] border border-[#2a2a3a] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[#2a2a3a]">
        <ChartBarIcon className="w-4 h-4 text-white" />
        <div className="text-sm font-normal text-white">{title}</div>
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
                <span className="text-sm font-normal text-white">{stage.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-white">{stage.value.toLocaleString()}</span>
                  <span className="text-xs font-normal text-white">({displayPercentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-[#1a1a2e] rounded overflow-hidden" style={{ height: '36px' }}>
                <div
                  className="h-full bg-gradient-to-r from-[#007BFF] to-[#0066CC] transition-all duration-300 flex items-center justify-end pr-3"
                  style={{ width: `${widthPercentage}%` }}
                >
                  {widthPercentage > 12 && (
                    <span className="text-xs text-white font-medium">
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

