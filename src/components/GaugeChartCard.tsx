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
    
    const COLORS = ['#a855f7', '#1a1a2e'];

    return (
        <div 
            className="backdrop-blur-xl rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-500/60 transition-all duration-500 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20"
            style={{ 
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(168, 85, 247, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
            }}
        >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-500/10">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
                    <Icon className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-xs font-semibold text-slate-100">{title}</div>
            </div>
            <div className="relative px-4" style={{ height: '120px', paddingTop: '10px', paddingBottom: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                            stroke="none"
                            paddingAngle={0}
                            cornerRadius={12}
                            animationDuration={1500}
                            animationBegin={0}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={index === 0 ? 'url(#purpleGradient)' : COLORS[index]}
                                    stroke={index === 0 ? '#a855f7' : COLORS[index]}
                                    strokeWidth={index === 0 ? 0 : 0}
                                    filter={index === 0 ? 'url(#gaugeGlow)' : undefined}
                                />
                            ))}
                        </Pie>
                        <defs>
                            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                                <stop offset="50%" stopColor="#9333ea" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.85} />
                            </linearGradient>
                            <filter id="gaugeGlow">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: '50px' }}>
                    <div className="text-center">
                        <span className="text-3xl font-bold text-slate-100 drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>
                            {normalizedPercentage.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
            {positiveCount !== undefined && negativeCount !== undefined && (
                <div className="flex justify-center items-center gap-6 pb-4 px-4">
                    <div className="flex items-center gap-2.5 text-sm font-medium text-slate-400">
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 shadow-sm shadow-purple-400/50"></div>
                        <span>Positive</span>
                        <span className="text-slate-100 font-bold">{positiveCount}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm font-medium text-slate-400">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <span>Negative</span>
                        <span className="text-slate-100 font-bold">{negativeCount}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GaugeChartCard;
