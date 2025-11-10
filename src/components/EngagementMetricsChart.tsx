import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

interface EngagementMetricsChartProps {
  title: string;
  description: string;
  data: Array<{
    name: string;
    'Email Sent'?: number;
    'Email Opened'?: number;
    'Replied'?: number;
    'Positive Replied'?: number;
    'Bounced'?: number;
    'Unsubscribed'?: number;
  }>;
}

const chartConfig = {
  emailSent: {
    label: "Email Sent",
    color: "hsl(var(--chart-1))",
  },
  emailOpened: {
    label: "Email Opened",
    color: "hsl(var(--chart-2))",
  },
  replied: {
    label: "Replied",
    color: "hsl(var(--chart-3))",
  },
  positiveReplied: {
    label: "Positive Replied",
    color: "hsl(var(--chart-4))",
  },
  bounced: {
    label: "Bounced",
    color: "hsl(var(--chart-5))",
  },
  unsubscribed: {
    label: "Unsubscribed",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

const EngagementMetricsChart: React.FC<EngagementMetricsChartProps> = ({ title, description, data }) => {
  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="name" 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                if (typeof value === 'string' && value.includes('-')) {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }
                return value;
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    if (typeof value === 'string' && value.includes('-')) {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }
                    return value;
                  }}
                  indicator="dot"
                />
              }
            />
            <ChartLegend
              verticalAlign="bottom"
              height={36}
              content={<ChartLegendContent />}
            />
            <Line 
              type="monotone" 
              dataKey="Email Sent" 
              name="emailSent"
              stroke="var(--color-emailSent)"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Email Opened" 
              name="emailOpened"
              stroke="var(--color-emailOpened)"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Replied" 
              name="replied"
              stroke="var(--color-replied)"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Positive Replied" 
              name="positiveReplied"
              stroke="var(--color-positiveReplied)"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Bounced" 
              name="bounced"
              stroke="var(--color-bounced)"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Unsubscribed" 
              name="unsubscribed"
              stroke="var(--color-unsubscribed)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EngagementMetricsChart;






