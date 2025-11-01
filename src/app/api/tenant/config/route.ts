import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';
import { getEnabledFeatures } from '@/lib/utils/features';

export async function GET() {
  try {
    const tenant = await getCurrentTenant();
    const enabledFeatures = getEnabledFeatures(tenant);

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
      },
      enabledFeatures,
    });
  } catch (error) {
    console.error('Error fetching tenant config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant configuration' },
      { status: 500 }
    );
  }
}

