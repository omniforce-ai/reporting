import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';
import { getEnabledFeatures } from '@/lib/utils/features';
import { getAllFeatures } from '@/lib/config/features';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client') || undefined;
    const tenant = await getCurrentTenant(clientId || undefined);
    const enabledFeatureIds = getEnabledFeatures(tenant);
    const allFeatures = getAllFeatures();
    
    const enabledFeatures = allFeatures.filter(f => 
      enabledFeatureIds.includes(f.id)
    );

    return NextResponse.json({ enabledFeatures });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch features';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[API /features] Error:', errorMessage, errorStack);
    
    return NextResponse.json(
      { 
        enabledFeatures: [],
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 200 }
    );
  }
}
