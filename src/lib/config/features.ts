import type { FeatureId } from '@/lib/utils/features';
import { InboxIcon, AnalyticsIcon, SupportIcon, DocumentTextIcon } from '@/components/icons';

export interface FeatureDefinition {
  id: FeatureId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  requiresApiKey?: boolean;
}

// Central registry of all available features/tabs
export const AVAILABLE_FEATURES: Record<FeatureId, FeatureDefinition> = {
  email: {
    id: 'email',
    name: 'Email Triage',
    icon: InboxIcon,
    description: 'Email automation and outreach analytics',
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
};

export function getFeatureDefinition(featureId: FeatureId): FeatureDefinition | null {
  return AVAILABLE_FEATURES[featureId] || null;
}

export function getAllFeatures(): FeatureDefinition[] {
  return Object.values(AVAILABLE_FEATURES);
}

