import { headers } from 'next/headers';
import { supabase } from '@/lib/db/supabase';

async function getTenantFromSupabase(subdomain: string) {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', subdomain)
      .single();

    if (error) {
      console.error(`Supabase error fetching tenant ${subdomain}:`, error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Supabase may return field as camelCase (apiKeys) or snake_case (api_keys)
    // Handle both cases and normalize to apiKeys
    let apiKeysValue = data.apiKeys || data.api_keys;
    
    if (apiKeysValue !== null && apiKeysValue !== undefined) {
      if (typeof apiKeysValue === 'string') {
        try {
          apiKeysValue = JSON.parse(apiKeysValue);
        } catch (e) {
          console.warn(`Failed to parse apiKeys JSON for ${subdomain}:`, e);
          apiKeysValue = {};
        }
      }
      // Ensure it's an object
      if (typeof apiKeysValue === 'object' && apiKeysValue !== null) {
        data.apiKeys = apiKeysValue;
      } else {
        console.warn(`Invalid apiKeys format for ${subdomain}:`, typeof apiKeysValue);
        data.apiKeys = {};
      }
    } else {
      console.warn(`No apiKeys found for tenant ${subdomain}`);
      data.apiKeys = {};
    }

    // Parse features if needed
    if (data.features !== null && data.features !== undefined) {
      if (typeof data.features === 'string') {
        try {
          data.features = JSON.parse(data.features);
        } catch (e) {
          console.warn(`Failed to parse features JSON for ${subdomain}:`, e);
          data.features = {};
        }
      }
    }

    return data;
  } catch (error) {
    console.error(`Error fetching tenant ${subdomain} from Supabase:`, error);
    return null;
  }
}

export async function getAllTenantsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .limit(100);

    if (error) {
      console.error('Supabase query error:', error);
      return [];
    }

    // Parse JSON fields for all tenants
    const tenants = (data || []).map(tenant => {
      // Handle both camelCase and snake_case field names
      let apiKeysValue = tenant.apiKeys || tenant.api_keys;
      
      if (apiKeysValue !== null && apiKeysValue !== undefined) {
        if (typeof apiKeysValue === 'string') {
          try {
            apiKeysValue = JSON.parse(apiKeysValue);
          } catch (e) {
            console.warn('Failed to parse apiKeys JSON:', e);
            apiKeysValue = {};
          }
        }
        tenant.apiKeys = apiKeysValue;
      } else {
        tenant.apiKeys = {};
      }
      
      let featuresValue = tenant.features;
      if (featuresValue !== null && featuresValue !== undefined) {
        if (typeof featuresValue === 'string') {
          try {
            featuresValue = JSON.parse(featuresValue);
          } catch (e) {
            console.warn('Failed to parse features JSON:', e);
            featuresValue = {};
          }
        }
        tenant.features = featuresValue;
      }
      
      return tenant;
    });

    return tenants;
  } catch (error) {
    console.error('Error fetching tenants from Supabase:', error);
    return [];
  }
}

/**
 * Get tenant by subdomain or clientId (slug).
 * For agency dashboards, prefer clientId query param over subdomain.
 */
async function getTenantByIdentifier(identifier: string) {
  // Try by subdomain first
  let tenant = await getTenantFromSupabase(identifier);
  
  if (!tenant) {
    // Try by clientId (could be stored as a slug or name)
    const allTenants = await getAllTenantsFromSupabase();
    tenant = allTenants.find(
      t => t.subdomain === identifier || 
           t.name?.toLowerCase().replace(/\s+/g, '-') === identifier.toLowerCase()
    ) || null;
  }
  
  return tenant;
}

export async function getCurrentTenant(clientId?: string) {
  try {
    let identifier: string | null = null;
    
    // Priority 1: Explicit clientId parameter (from query string or path)
    if (clientId) {
      identifier = clientId;
    } else {
      // Priority 2: Check headers for subdomain (backward compatibility)
      const headersList = await headers();
      identifier = headersList.get('x-tenant-subdomain');
    }
    
    // Clean up identifier - remove port if present
    if (identifier && identifier.includes(':')) {
      identifier = identifier.split(':')[0];
    }
    
    // Priority 3: Default to creation-exhibitions for local dev
    if (!identifier || identifier === 'localhost' || identifier === '127.0.0.1') {
      identifier = 'creation-exhibitions';
    }
    
    // Try to get tenant by identifier
    let tenant = await getTenantByIdentifier(identifier);
    
    if (tenant) {
      return tenant;
    }
    
    // If identifier was explicitly set but not found, throw error
    if (identifier && identifier !== 'creation-exhibitions') {
      throw new Error(`Tenant not found for identifier: ${identifier}`);
    }
    
    // Final fallback: try to get creation-exhibitions specifically
    tenant = await getTenantByIdentifier('creation-exhibitions');
    if (tenant) {
      return tenant;
    }
    
    // Last resort: get first tenant that has a Smartlead API key configured
    const supabaseTenants = await getAllTenantsFromSupabase();
    const tenantWithApiKey = supabaseTenants.find(t => {
      const keys = t.apiKeys as any;
      return keys && keys.smartlead;
    });
    
    if (tenantWithApiKey) {
      return tenantWithApiKey;
    }
    
    throw new Error(`Tenant not found. Tried identifier: ${identifier}`);
  } catch (error) {
    console.error('getCurrentTenant error:', error);
    throw new Error(`Failed to get tenant: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function extractSubdomainFromHost(hostname: string): string | null {
  const parts = hostname.split('.');
  
  if (parts.length < 3) {
    return null;
  }
  
  const subdomain = parts[0];
  
  if (subdomain === 'www' || subdomain === 'localhost' || subdomain === '127.0.0.1') {
    return null;
  }
  
  return subdomain;
}
