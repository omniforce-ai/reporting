import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';
import { getEnabledFeatures } from '@/lib/utils/features';
import { requireClientAccess } from '@/lib/auth/roles';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientParam = searchParams.get('client');
    
    // Priority: query param > header (set by middleware)
    // If client is specified in query, verify access
    if (clientParam) {
      await requireClientAccess(clientParam);
    }
    
    // getCurrentTenant will check query param first, then header
    const tenant = await getCurrentTenant(clientParam || undefined);
    
    // Verify access if we got tenant from header (not query param)
    if (!clientParam) {
      await requireClientAccess(tenant.subdomain);
    }
    
    const enabledFeatures = getEnabledFeatures(tenant);

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        apiKeys: tenant.apiKeys,
      },
      enabledFeatures,
    });
  } catch (error: any) {
    console.error('Error fetching tenant config:', error);
    
    if (error.message?.includes('Unauthorized') || error.message?.includes('access')) {
      return NextResponse.json(
        { error: error.message || 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    if (error.message?.includes('not found') || error.message?.includes('Tenant not found')) {
      return NextResponse.json(
        { error: error.message || 'Tenant not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tenant configuration' },
      { status: 500 }
    );
  }
}

