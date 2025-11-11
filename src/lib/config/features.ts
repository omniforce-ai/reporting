import type { FeatureId } from '@/lib/utils/features';
import { InboxIcon, AnalyticsIcon, SupportIcon, DocumentTextIcon, FontIcon } from '@/components/icons';

export interface FeatureDefinition {
  id: FeatureId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  requiresApiKey?: boolean;
}

// Central registry of all available features/tabs
export const AVAILABLE_FEATURES: Record<FeatureId, FeatureDefinition> = {
  overview: {
    id: 'overview',
    name: 'Overview',
    icon: AnalyticsIcon,
    description: 'Executive overview with key metrics from all features',
    requiresApiKey: false,
  },
  smartlead: {
    id: 'smartlead',
    name: 'Smartlead',
    icon: InboxIcon,
    description: 'Smartlead email automation and outreach analytics',
    requiresApiKey: true,
  },
  lemlist: {
    id: 'lemlist',
    name: 'Lemlist',
    icon: InboxIcon,
    description: 'Lemlist email automation and outreach analytics',
    requiresApiKey: true,
  },
  sales: {
    id: 'sales',
    name: 'Sales Ops',
    icon: AnalyticsIcon,
    description: 'Sales operations and CRM automation',
    requiresApiKey: false,
  },
  support: {
    id: 'support',
    name: 'Customer Support',
    icon: SupportIcon,
    description: 'Support ticket automation',
    requiresApiKey: false,
  },
  documents: {
    id: 'documents',
    name: 'Document Processing',
    icon: DocumentTextIcon,
    description: 'Document extraction and processing',
    requiresApiKey: false,
  },
  fonts: {
    id: 'fonts',
    name: 'Font Preview',
    icon: FontIcon,
    description: 'Preview and evaluate fonts for the application',
    requiresApiKey: false,
  },
};

export function getFeatureDefinition(featureId: FeatureId): FeatureDefinition | null {
  return AVAILABLE_FEATURES[featureId] || null;
}

export function getAllFeatures(): FeatureDefinition[] {
  return Object.values(AVAILABLE_FEATURES);
}

