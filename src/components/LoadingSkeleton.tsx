import React from 'react';

export const MetricCardSkeleton = () => {
  return (
    <div className="group relative rounded-xl px-4 py-3 border border-border bg-card animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-muted"></div>
        <div className="h-4 w-24 bg-muted rounded"></div>
      </div>
      <div className="h-8 w-20 bg-muted rounded mb-1.5"></div>
      <div className="h-3 w-32 bg-muted rounded"></div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border animate-pulse">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-6 h-6 rounded-lg bg-muted"></div>
        <div className="h-5 w-48 bg-muted rounded"></div>
      </div>
      <div className="h-72 p-6 pt-4">
        <div className="h-full w-full bg-muted/50 rounded"></div>
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="pt-8 sm:pt-10 lg:pt-12 xl:pt-16 px-12 sm:px-16 lg:px-24 xl:px-32 pb-12 sm:pb-16 lg:pb-24 xl:pb-32">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4">
        <div className="mb-4 sm:mb-0">
          <div className="h-8 w-48 bg-muted rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-10 w-48 bg-muted rounded-xl animate-pulse"></div>
          <div className="h-10 w-10 bg-muted rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6">
        <div className="h-12 w-64 bg-muted rounded-xl animate-pulse"></div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

