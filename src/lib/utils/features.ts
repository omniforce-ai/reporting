import { Tenant } from '@prisma/client';

export type FeatureId = 'smartlead' | 'lemlist' | 'sales' | 'support' | 'documents';

// Simplified structure: just an array of enabled feature IDs
// API keys stored separately in tenant.apiKeys JSONB field
export interface TenantFeatures {
  enabledFeatures: FeatureId[];
}

const DEFAULT_FEATURES: TenantFeatures = {
  enabledFeatures: [],
};

export function getTenantFeatures(tenant: Tenant): TenantFeatures {
  const validFeatureIds: FeatureId[] = ['smartlead', 'lemlist', 'sales', 'support', 'documents'];
  let enabledFeatures: FeatureId[] = [];
  
  // If tenant has features configured, use them
  if (tenant.features) {
    const features = tenant.features as unknown as TenantFeatures;
    enabledFeatures = (features.enabledFeatures || []).filter(
      (id): id is FeatureId => validFeatureIds.includes(id)
    );
  }
  
  // Auto-enable features based on API keys configured
  const apiKeys = tenant.apiKeys as Record<string, unknown> | null;
  if (apiKeys) {
    // Enable Smartlead tab if Smartlead API key is configured
    if (apiKeys.smartlead && !enabledFeatures.includes('smartlead')) {
      enabledFeatures.push('smartlead');
    }
    // Enable Lemlist tab if Lemlist API key is configured
    if (apiKeys.lemlist && !enabledFeatures.includes('lemlist')) {
      enabledFeatures.push('lemlist');
    }
  }
  
  // If no features are enabled, check API keys for backward compatibility
  if (enabledFeatures.length === 0 && apiKeys) {
    if (apiKeys.smartlead) {
      enabledFeatures.push('smartlead');
    } else if (apiKeys.lemlist) {
      enabledFeatures.push('lemlist');
    }
  }

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

