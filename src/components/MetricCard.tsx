import React from 'react';
import type { Metric } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUpIcon, TrendingDownIcon, ArrowRightIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Extract actual data values from comparison text
const parseComparisonData = (comparisonText?: string) => {
  if (!comparisonText) return null;
  
  // Extract percentage change: "↑ +3 (21%)" or "↓ -1.2%" or "→ Same"
  const percentageMatch = comparisonText.match(/[+-]?\d+\.?\d*%/);
  const percentage = percentageMatch ? percentageMatch[0] : null;
  
  // Extract absolute change: "↑ +3 (21%)" -> +3
  const absoluteMatch = comparisonText.match(/[↑↓]\s*([+-]?\d+\.?\d*)\s*\(/);
  const absoluteChange = absoluteMatch ? absoluteMatch[1] : null;
  
  const isPositive = comparisonText.includes('↑');
  const isNegative = comparisonText.includes('↓');
  const isNeutral = comparisonText.includes('→') || comparisonText.includes('Same');
  
  return { percentage, absoluteChange, isPositive, isNegative, isNeutral };
};

// Detailed tooltip content showing actual data
const getTooltipContent = (title: string, value: string, comparisonText?: string): React.ReactNode => {
  const comparisonData = parseComparisonData(comparisonText);
  
  const isPercentage = value.includes('%');
  
  return (
    <div className="space-y-3 text-xs">
      <div>
        <p className="font-semibold mb-2 text-foreground text-sm">{title}</p>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-foreground/70">Current Period:</span>
            <span className="font-semibold text-foreground">{value}</span>
          </div>
          {comparisonData && comparisonData.absoluteChange && (
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-foreground/70">Change:</span>
              <span className="font-semibold text-primary">
                {comparisonData.absoluteChange}
                {!isPercentage && ' replies'}
                {comparisonData.percentage && ` (${comparisonData.percentage})`}
              </span>
            </div>
          )}
          {comparisonData && comparisonData.percentage && !comparisonData.absoluteChange && (
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-foreground/70">Change:</span>
              <span className="font-semibold text-primary">
                {comparisonData.percentage}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {comparisonText && (
        <div className="pt-2 border-t border-border">
          <p className="text-foreground/60 text-[10px] uppercase tracking-wide mb-1">vs. Previous Period</p>
          <p className="text-foreground/80 font-medium">{comparisonText}</p>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<Metric> = ({ title, value, comparisonText, icon: Icon }) => {
  // Parse comparison text to determine trend direction
  // Format examples: "↑ +3 (21%)", "↓ -1.2%", "→ Same"
  const isPositive = comparisonText?.includes('↑') || (comparisonText?.includes('+') && !comparisonText?.includes('→'));
  const isNegative = comparisonText?.includes('↓') || (comparisonText?.includes('-') && !comparisonText?.includes('→') && !comparisonText?.includes('Same'));
  const isNeutral = comparisonText?.includes('→') || comparisonText?.includes('Same');
  
  const TrendIcon = isPositive ? TrendingUpIcon : isNegative ? TrendingDownIcon : ArrowRightIcon;
  
  // Use violet color scheme for all states
  const trendColorClass = 'text-primary';

  // Extract just the percentage for the badge
  const percentageMatch = comparisonText?.match(/[+-]?\d+\.?\d*%/);
  const badgePercentage = percentageMatch ? percentageMatch[0] : null;
  
  // For badge display: show percentage if available, otherwise show dash for neutral comparisons
  // Always show badge when comparisonText exists
  const badgeText = badgePercentage || (isNeutral ? '—' : comparisonText ? '—' : null);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="@container/card group hover:shadow-md transition-shadow duration-200 cursor-help flex flex-col h-full">
            <CardHeader className="relative">
              <div className="flex items-center gap-1.5">
                <CardDescription className="font-medium text-sm text-muted-foreground m-0 truncate">
                  {title}
                </CardDescription>
                <Info className="h-3.5 w-3.5 text-primary/60 group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
              <CardTitle className="text-3xl @[250px]/card:text-4xl font-bold tabular-nums">
                {value}
              </CardTitle>
              {comparisonText && badgeText && (
                <div className="absolute right-4 top-4">
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1 h-5 px-2 text-xs font-medium rounded-md py-0.5 transition-colors bg-primary/10 text-primary border-primary/20"
                  >
                    <TrendIcon className="h-3 w-3 text-primary" />
                    {badgeText}
                  </Badge>
                </div>
              )}
            </CardHeader>
          </Card>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-sm p-4 bg-popover border border-border text-popover-foreground shadow-lg"
        >
          {getTooltipContent(title, value, comparisonText)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetricCard;
