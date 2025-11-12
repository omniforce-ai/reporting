import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const MetricCardSkeleton = () => {
  return (
    <Card className="@container/card overflow-hidden border-muted/50">
      <CardHeader className="relative">
        <CardDescription>
          <Skeleton className="h-4 w-24 bg-muted animate-pulse" />
        </CardDescription>
        <CardTitle>
          <Skeleton className="@[250px]/card:h-10 h-8 w-20 bg-muted animate-pulse" />
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Skeleton className="h-5 w-16 rounded-lg bg-muted animate-pulse" />
        </div>
      </CardHeader>
    </Card>
  );
};

export const ChartSkeleton = () => {
  return (
    <Card className="overflow-hidden border-muted/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-lg bg-muted animate-pulse" />
          <Skeleton className="h-5 w-48 bg-muted animate-pulse" />
        </div>
        <CardDescription>
          <Skeleton className="h-4 w-64 bg-muted animate-pulse" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-72 w-full bg-muted animate-pulse rounded-lg" />
      </CardContent>
    </Card>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Metrics Grid Skeleton */}
          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <MetricCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Charts Grid Skeleton */}
          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>

          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardContentSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading dashboard data...</span>
      </div>
      
      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
};

