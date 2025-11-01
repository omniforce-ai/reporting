import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';
import { getMetricsByTenant } from '@/lib/db/queries';
import { z } from 'zod';

const QuerySchema = z.object({
  automationId: z.string().cuid().optional(),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 100)),
});

export async function GET(request: Request) {
  try {
    const tenant = await getCurrentTenant();
    const { searchParams } = new URL(request.url);
    
    const query = QuerySchema.parse({
      automationId: searchParams.get('automationId'),
      limit: searchParams.get('limit'),
    });

    const metrics = await getMetricsByTenant(tenant.id, query.limit);

    // Filter by automationId if provided
    const filteredMetrics = query.automationId
      ? metrics.filter((m) => m.automationId === query.automationId)
      : metrics;

    return NextResponse.json({ metrics: filteredMetrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

