import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';

const SMARTLEAD_BASE_URL = process.env.SMARTLEAD_BASE_URL || 'https://server.smartlead.ai/api/v1';

export async function GET(request: Request) {
  try {
    const tenant = await getCurrentTenant();
    
    const apiKeys = tenant.apiKeys as { smartlead?: string } | null;
    const smartleadApiKey = apiKeys?.smartlead;

    if (!smartleadApiKey) {
      return NextResponse.json(
        { error: 'Smartlead API key not configured for this tenant' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const campaignsResponse = await fetch(
      `${SMARTLEAD_BASE_URL}/campaigns?api_key=${encodeURIComponent(smartleadApiKey)}`,
      {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 },
      }
    );

    if (!campaignsResponse.ok) {
      clearTimeout(timeoutId);
      const errorText = await campaignsResponse.text();
      console.error('Smartlead API error:', campaignsResponse.status, errorText);
      
      return NextResponse.json(
        { error: `Smartlead API error: ${campaignsResponse.statusText}` },
        { status: campaignsResponse.status }
      );
    }

    const campaigns: any[] = await campaignsResponse.json();

    const analyticsPromises = campaigns.map(async (campaign) => {
      try {
        const analyticsResponse = await fetch(
          `${SMARTLEAD_BASE_URL}/campaigns/${campaign.id}/analytics?api_key=${encodeURIComponent(smartleadApiKey)}`,
          {
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (!analyticsResponse.ok) {
          console.error(`Failed to fetch analytics for campaign ${campaign.id}`);
          return { campaign, analytics: null };
        }

        const analytics = await analyticsResponse.json();
        return { campaign, analytics };
      } catch (error) {
        console.error(`Error fetching analytics for campaign ${campaign.id}:`, error);
        return { campaign, analytics: null };
      }
    });

    const campaignAnalytics = await Promise.all(analyticsPromises);
    clearTimeout(timeoutId);

    return NextResponse.json({ campaigns: campaignAnalytics });
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch campaign analytics' },
      { status: 500 }
    );
  }
}
















