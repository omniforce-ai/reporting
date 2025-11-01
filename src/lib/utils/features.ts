import { Tenant } from '@prisma/client';

export type FeatureId = 'email' | 'sales' | 'support' | 'documents';

// Simplified structure: just an array of enabled feature IDs
// API keys stored separately in tenant.apiKeys JSONB field
export interface TenantFeatures {
  enabledFeatures: FeatureId[];
}

const DEFAULT_FEATURES: TenantFeatures = {
  enabledFeatures: [],
};

export function getTenantFeatures(tenant: Tenant): TenantFeatures {
  if (!tenant.features) {
    return DEFAULT_FEATURES;
  }

  const features = tenant.features as TenantFeatures;
  
  // Validate and filter out invalid feature IDs
  const validFeatureIds: FeatureId[] = ['email', 'sales', 'support', 'documents'];
  const enabledFeatures = (features.enabledFeatures || []).filter(
    (id): id is FeatureId => validFeatureIds.includes(id)
  );

  return { enabledFeatures };
}

export function isFeatureEnabled(tenant: Tenant, featureId: FeatureId): boolean {
  const features = getTenantFeatures(tenant);
  return features.enabledFeatures.includes(featureId);
}

export function getEnabledFeatures(tenant: Tenant): FeatureId[] {
  return getTenantFeatures(tenant).enabledFeatures;
}

// Get API key for a feature from tenant's apiKeys JSONB field
export function getFeatureApiKey(tenant: Tenant, featureId: FeatureId): string | null {
  if (!tenant.apiKeys) return null;
  const apiKeys = tenant.apiKeys as Record<string, unknown>;
  return (apiKeys[featureId] as string) || null;
}

