import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUpIcon, TrendingDownIcon, ArrowRightIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverviewMetric {
  title: string;
  value: string;
  comparisonText?: string;
}

interface OverviewCardProps {
  metrics: OverviewMetric[];
}

const parseComparisonData = (comparisonText?: string) => {
  if (!comparisonText) return null;
  
  const percentageMatch = comparisonText.match(/[+-]?\d+\.?\d*%/);
  const percentage = percentageMatch ? percentageMatch[0] : null;
  
  const absoluteMatch = comparisonText.match(/[↑↓]\s*([+-]?\d+\.?\d*)\s*\(/);
  const absoluteChange = absoluteMatch ? absoluteMatch[1] : null;
  
  const isPositive = comparisonText.includes('↑');
  const isNegative = comparisonText.includes('↓');
  const isNeutral = comparisonText.includes('→') || comparisonText.includes('Same');
  
  return { percentage, absoluteChange, isPositive, isNegative, isNeutral };
};

const OverviewCard: React.FC<OverviewCardProps> = ({ 
  metrics
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric, index) => {
            const comparisonData = parseComparisonData(metric.comparisonText);
            const isPositive = comparisonData?.isPositive;
            const isNegative = comparisonData?.isNegative;
            const isNeutral = comparisonData?.isNeutral;
            
            const TrendIcon = isPositive ? TrendingUpIcon : isNegative ? TrendingDownIcon : ArrowRightIcon;
            
            const percentageMatch = metric.comparisonText?.match(/[+-]?\d+\.?\d*%/);
            const badgePercentage = percentageMatch ? percentageMatch[0] : null;
            const badgeText = badgePercentage || (isNeutral ? '—' : metric.comparisonText ? '—' : null);
            
            return (
              <TooltipProvider key={index} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-2 cursor-help">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-muted-foreground font-medium">
                          {metric.title}
                        </span>
                        <Info className="h-3.5 w-3.5 text-primary/60" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tabular-nums">
                          {metric.value}
                        </span>
                        {metric.comparisonText && badgeText && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "flex items-center gap-1 h-5 px-2 text-xs font-medium rounded-md py-0.5",
                              isPositive && "bg-primary/10 text-primary border-primary/20",
                              isNegative && "bg-muted text-foreground/70 border-0",
                              isNeutral && "bg-muted text-muted-foreground border-0"
                            )}
                          >
                            <TrendIcon className={cn(
                              "h-3 w-3",
                              isPositive && "text-primary",
                              isNegative && "text-foreground/70",
                              isNeutral && "text-muted-foreground"
                            )} />
                            {badgeText}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    className="max-w-sm p-4 bg-popover border border-border text-popover-foreground shadow-lg"
                  >
                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="font-semibold mb-2 text-foreground text-sm">{metric.title}</p>
                        <div className="space-y-1.5">
                          <div className="flex items-baseline justify-between gap-4">
                            <span className="text-foreground/70">Current Period:</span>
                            <span className="font-semibold text-foreground">{metric.value}</span>
                          </div>
                          {comparisonData && comparisonData.absoluteChange && (
                            <div className="flex items-baseline justify-between gap-4">
                              <span className="text-foreground/70">Change:</span>
                              <span className={cn(
                                "font-semibold",
                                comparisonData.isPositive && "text-primary",
                                comparisonData.isNegative && "text-foreground/70",
                                comparisonData.isNeutral && "text-muted-foreground"
                              )}>
                                {comparisonData.absoluteChange}
                                {comparisonData.percentage && ` (${comparisonData.percentage})`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {metric.comparisonText && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-foreground/60 text-[10px] uppercase tracking-wide mb-1">vs. Previous Period</p>
                          <p className="text-foreground/80 font-medium">{metric.comparisonText}</p>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        
      </CardContent>
    </Card>
  );
};

export default OverviewCard;



