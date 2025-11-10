import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface BarChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface BarChartCardProps {
  title: string;
  description: string;
  data: BarChartDataPoint[];
  dataKey?: string;
  valueLabel?: string;
  endpoint?: string;
}

const BarChartCard: React.FC<BarChartCardProps> = ({ 
  title, 
  description, 
  data, 
  dataKey = 'value',
  valueLabel,
  endpoint
}) => {
  const maxValue = Math.max(...data.map(d => typeof d[dataKey] === 'number' ? d[dataKey] : 0), 0);
  const yAxisDomain = [0, Math.ceil(maxValue * 1.1)];

  const chartConfig = {
    value: {
      label: valueLabel || title,
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="name" 
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={70}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis 
              domain={yAxisDomain}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar 
              dataKey={dataKey} 
              name={valueLabel || title}
              fill="var(--color-value)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BarChartCard;
