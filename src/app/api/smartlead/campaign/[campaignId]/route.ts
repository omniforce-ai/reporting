import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';

const SMARTLEAD_BASE_URL = process.env.SMARTLEAD_BASE_URL || 'https://server.smartlead.ai/api/v1';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const tenant = await getCurrentTenant();
    
    const apiKeys = tenant.apiKeys as { smartlead?: string } | null;
    const smartleadApiKey = apiKeys?.smartlead;

    if (!smartleadApiKey) {
      return NextResponse.json(
        { error: 'Smartlead API key not configured' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `${SMARTLEAD_BASE_URL}/campaigns/${campaignId}?api_key=${encodeURIComponent(smartleadApiKey)}`,
      {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Smartlead API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const campaign = await response.json();

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

