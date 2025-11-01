import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';
import { getAutomationsByTenant } from '@/lib/db/queries';

export async function GET(request: Request) {
  try {
    const tenant = await getCurrentTenant();
    const automations = await getAutomationsByTenant(tenant.id);

    return NextResponse.json({ automations });
  } catch (error) {
    console.error('Error fetching automations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
      { status: 500 }
    );
  }
}

