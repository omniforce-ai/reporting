import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import type { GaugeData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
  remaining: {
    label: "Remaining",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig;

const GaugeChartCard: React.FC<GaugeData> = ({ title, percentage, icon: Icon, positiveCount, negativeCount }) => {
    const normalizedPercentage = Math.max(0, Math.min(100, Number(percentage) || 0));
    
    const data = [
        { name: 'value', value: normalizedPercentage },
        { name: 'remaining', value: 100 - normalizedPercentage },
    ];

    return (
        <Card className="@container/card">
            <CardHeader className="relative">
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <div className="relative h-[120px]">
                    <ChartContainer config={chartConfig} className="h-full w-full">
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
                                        fill={index === 0 ? 'var(--color-value)' : 'var(--color-remaining)'}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-12">
                        <div className="text-center">
                            <span className="text-3xl font-bold tabular-nums">
                                {normalizedPercentage.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
                {positiveCount !== undefined && negativeCount !== undefined && (
                    <div className="flex justify-center items-center gap-6 pt-6">
                        <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                            <span>Positive</span>
                            <span className="font-bold text-foreground">{positiveCount}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                            <div className="w-2.5 h-2.5 rounded-full bg-muted"></div>
                            <span>Negative</span>
                            <span className="font-bold text-foreground">{negativeCount}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default GaugeChartCard;
