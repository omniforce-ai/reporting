import { headers } from 'next/headers';
import { supabase } from '@/lib/db/supabase';

async function getTenantFromSupabase(slug: string) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('subdomain', slug) // Database field is still 'subdomain', but we use slug in code
      .single();

    if (error) {
      console.error(`Supabase error fetching tenant ${slug}:`, error);
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
          console.warn(`Failed to parse apiKeys JSON for ${slug}:`, e);
          apiKeysValue = {};
        }
      }
      // Ensure it's an object
      if (typeof apiKeysValue === 'object' && apiKeysValue !== null) {
        data.apiKeys = apiKeysValue;
      } else {
        console.warn(`Invalid apiKeys format for ${slug}:`, typeof apiKeysValue);
        data.apiKeys = {};
      }
    } else {
      console.warn(`No apiKeys found for tenant ${slug}`);
      data.apiKeys = {};
    }

    // Parse features if needed
    if (data.features !== null && data.features !== undefined) {
      if (typeof data.features === 'string') {
        try {
          data.features = JSON.parse(data.features);
        } catch (e) {
          console.warn(`Failed to parse features JSON for ${slug}:`, e);
          data.features = {};
        }
      }
    }

    return data;
  } catch (error) {
    console.error(`Error fetching tenant ${slug} from Supabase:`, error);
    return null;
  }
}

export async function getAllTenantsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('clients')
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
 * Get tenant by client slug (stored in 'subdomain' field in database).
 * The identifier can be the slug value or a slugified version of the client name.
 */
async function getTenantByIdentifier(identifier: string) {
  // Try by slug field (stored as 'subdomain' in database)
  let tenant = await getTenantFromSupabase(identifier);
  
  if (!tenant) {
    // Try by slugified name as fallback
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
    const headersList = await headers();
    
    // Priority 1: Explicit clientId parameter (from query string or path)
    if (clientId) {
      identifier = clientId;
    } else {
      // Priority 2: Check headers for path-based client
      identifier = headersList.get('x-tenant-client');
    }
    
    // Clean up identifier - remove port if present
    if (identifier && identifier.includes(':')) {
      identifier = identifier.split(':')[0];
    }
    
    if (!identifier) {
      throw new Error('Client identifier not found. Must be provided via path or query parameter.');
    }
    
    // Try to get tenant by identifier
    const tenant = await getTenantByIdentifier(identifier);
    
    if (!tenant) {
      throw new Error(`Tenant not found for identifier: ${identifier}`);
    }
    
    return tenant;
  } catch (error) {
    console.error('getCurrentTenant error:', error);
    throw new Error(`Failed to get tenant: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

