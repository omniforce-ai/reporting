
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ThumbsDownIcon, ThumbsUpIcon } from './icons';
import type { GaugeData } from '../types';

const GaugeChartCard: React.FC<GaugeData> = ({ title, percentage, icon: Icon, positiveCount, negativeCount }) => {
    const data = [
        { name: 'Completed', value: percentage },
        { name: 'Remaining', value: 100 - percentage },
    ];
    
    const COLORS = ['#3b82f6', '#1e293b']; // Blue for value, dark slate for background track

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
            <div className="flex items-center text-slate-400 text-sm">
                <Icon className="w-5 h-5 mr-2" />
                <span>{title}</span>
            </div>
            <div className="relative h-60 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius="70%"
                            outerRadius="90%"
                            fill="#8884d8"
                            paddingAngle={0}
                            dataKey="value"
                            cornerRadius={20}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold text-white">{percentage.toFixed(2)}%</span>
                    {negativeCount !== undefined && (
                        <p className="text-sm text-slate-400 mt-2">Positive feedback</p>
                    )}
                </div>
            </div>
            {positiveCount !== undefined && negativeCount !== undefined && (
                <div className="flex justify-center items-center gap-8 mt-4">
                    <div className="flex items-center gap-2 text-sm text-blue-500">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Positive</span>
                        <ThumbsUpIcon className="w-4 h-4 text-slate-400 ml-2" />
                        <span className="text-slate-200">{positiveCount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                         <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                        <span>Negative</span>
                         <ThumbsDownIcon className="w-4 h-4 text-slate-400 ml-2" />
                        <span className="text-slate-200">{negativeCount}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GaugeChartCard;
