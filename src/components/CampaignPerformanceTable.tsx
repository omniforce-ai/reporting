"use client"

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CampaignPerformanceData {
  name: string;
  value: number;
  totalContacted?: number;
  openRate?: number;
  replyRate?: number;
  [key: string]: any;
}

interface CampaignPerformanceTableProps {
  title: string;
  description?: string;
  data: CampaignPerformanceData[];
  valueLabel?: string;
}

export default function CampaignPerformanceTable({ 
  title,
  description,
  data,
  valueLabel = 'Value'
}: CampaignPerformanceTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No campaign performance data available.</p>
        </CardContent>
      </Card>
    );
  }

  const formatValue = (value: number) => {
    if (valueLabel.includes('%') || valueLabel.includes('Rate')) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString('en-US');
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...sortedData.map(item => item.value));
  const minValue = Math.min(...sortedData.map(item => item.value));
  const valueRange = maxValue - minValue;

  const getPerformanceColor = (value: number) => {
    if (valueRange === 0) return '';
    const normalizedValue = (value - minValue) / valueRange;
    if (normalizedValue >= 0.7) return 'border-l-4 border-l-primary';
    if (normalizedValue >= 0.4) return 'border-l-4 border-l-primary/60';
    return 'border-l-4 border-l-primary/30';
  };

  const TooltipContentComponent = ({ item }: { item: CampaignPerformanceData }) => (
    <div className="text-sm space-y-1.5">
      <div className="font-semibold">{item.name}</div>
      {item.totalContacted !== undefined && (
        <div>
          Total Contacted: <span className="font-semibold">{item.totalContacted.toLocaleString('en-US')}</span>
        </div>
      )}
      <div>
        {valueLabel}: <span className="font-semibold">{formatValue(item.value)}</span>
      </div>
      {item.openRate !== undefined && (
        <div>
          Open Rate: <span className="font-semibold">{formatPercentage(item.openRate)}</span>
        </div>
      )}
      {item.replyRate !== undefined && (
        <div>
          Reply Rate: <span className="font-semibold">{formatPercentage(item.replyRate)}</span>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="text-foreground font-semibold">Campaign Name</TableHead>
                {data.some(item => item.totalContacted !== undefined) && (
                  <TableHead className="text-right text-foreground font-semibold">Total Contacted</TableHead>
                )}
                <TableHead className="text-right text-foreground font-semibold">{valueLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <TableRow 
                      className={cn(
                        "cursor-help transition-colors hover:bg-primary/5",
                        getPerformanceColor(item.value)
                      )}
                    >
                      <TableCell className="font-medium text-foreground">
                        {item.name}
                      </TableCell>
                      {data.some(d => d.totalContacted !== undefined) && (
                        <TableCell className="text-right font-semibold text-foreground">
                          {item.totalContacted !== undefined ? item.totalContacted.toLocaleString('en-US') : '0'}
                        </TableCell>
                      )}
                      <TableCell className="text-right font-semibold text-primary">
                        {formatValue(item.value)}
                      </TableCell>
                    </TableRow>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="left"
                    className="max-w-xs p-3 bg-popover border border-border text-popover-foreground shadow-lg"
                  >
                    <TooltipContentComponent item={item} />
                  </TooltipContent>
                </Tooltip>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

