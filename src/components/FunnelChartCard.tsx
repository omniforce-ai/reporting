import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="h-72 flex flex-col justify-center gap-5">
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
                  <span className="text-sm font-medium">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{stage.value.toLocaleString()}</span>
                    <span className="text-sm font-medium text-muted-foreground">({displayPercentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-9 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 flex items-center justify-end pr-3"
                    style={{ width: `${widthPercentage}%` }}
                  >
                    {widthPercentage > 12 && (
                      <span className="text-xs text-primary-foreground font-medium">
                        {displayPercentage}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FunnelChartCard;
