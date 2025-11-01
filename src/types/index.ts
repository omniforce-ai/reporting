import React from 'react';

export interface Metric {
    title: string;
    value: string;
    comparisonText: string;
    icon: React.ElementType;
}

export interface ChartDataPoint {
    name: string;
    value?: number;
    avgScore?: number;
    completed?: number;
    failed?: number;
}

export interface GaugeData {
    title: string;
    percentage: number;
    icon: React.ElementType;
    positiveCount?: number;
    negativeCount?: number;
}

export interface AgentData {
    metrics: Metric[];
    completionRate: GaugeData;
    feedbackScore: GaugeData;
    evaluationHistory: {
        title: string;
        description: string;
        data: ChartDataPoint[];
    };
    tasksHistory: {
        title: string;
        description: string;
        data: ChartDataPoint[];
    };
}

export interface Agent {
    id: string;
    name: string;
    icon: React.ElementType;
    data: AgentData;
}

// FIX: Add missing NavItemType interface, which was causing an error in components/Sidebar.tsx
export interface NavItemType {
    name: string;
    icon: React.ElementType;
    href: string;
    current: boolean;
    children?: NavItemType[];
}
