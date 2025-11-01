
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ThumbsDownIcon, ThumbsUpIcon } from '@/components/icons';
import type { GaugeData } from '@/types';

const GaugeChartCard: React.FC<GaugeData> = ({ title, percentage, icon: Icon, positiveCount, negativeCount }) => {
    const normalizedPercentage = Math.max(0, Math.min(100, Number(percentage) || 0));
    
    const data = [
        { name: 'Value', value: normalizedPercentage },
        { name: 'Remaining', value: 100 - normalizedPercentage },
    ];
    
    const COLORS = ['#007BFF', '#1a1a2e']; // App blue for active, dark for remaining

    return (
        <div className="bg-[#0f0f1a] border border-[#2a2a3a] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-3 border-b border-[#2a2a3a]">
                <Icon className="w-4 h-4 text-white" />
                <div className="text-sm font-normal text-white">{title}</div>
            </div>
            <div className="relative px-6" style={{ height: '120px', paddingTop: '8px', paddingBottom: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={55}
                            outerRadius={75}
                            dataKey="value"
                            stroke="none"
                            paddingAngle={0}
                            cornerRadius={10}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index]}
                                    stroke={COLORS[index]}
                                    strokeWidth={1}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: '50px' }}>
                    <span className="text-2xl font-normal text-white">{normalizedPercentage.toFixed(2)}%</span>
                </div>
            </div>
            {positiveCount !== undefined && negativeCount !== undefined && (
                <div className="flex justify-center items-center gap-8 pb-6 px-6">
                    <div className="flex items-center gap-2 text-sm font-normal text-white">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#007BFF]"></div>
                        <span>Positive</span>
                        <span>{positiveCount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-normal text-white">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                        <span>Negative</span>
                        <span>{negativeCount}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GaugeChartCard;
