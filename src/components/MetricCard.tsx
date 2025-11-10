import React from 'react';
import type { Metric } from '@/types';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

const MetricCard: React.FC<Metric> = ({ title, value, comparisonText, icon: Icon }) => {
  const isPositive = comparisonText?.includes('+') || !comparisonText?.includes('-');
  const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;
  const percentageMatch = comparisonText?.match(/[+-]?\d+\.?\d*%/);
  const percentage = percentageMatch ? percentageMatch[0] : null;

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="@[250px]/card:text-4xl text-3xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        {percentage && (
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendIcon className="size-3" />
              {percentage}
            </Badge>
          </div>
        )}
      </CardHeader>
      {comparisonText && (
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground">
            {comparisonText}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default MetricCard;
