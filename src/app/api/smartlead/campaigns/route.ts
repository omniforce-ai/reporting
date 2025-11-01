import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';

const SMARTLEAD_BASE_URL = 'https://server.smartlead.ai/api/v1';
const REQUEST_TIMEOUT = 10000;
const CACHE_REVALIDATE = 300; // 5 minutes

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
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(
        `${SMARTLEAD_BASE_URL}/campaigns?api_key=${encodeURIComponent(smartleadApiKey)}`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Omniforce-Reporting/1.0',
          },
          next: { revalidate: CACHE_REVALIDATE },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 406 || response.status === 429) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { 
            error: 'Smartlead API error',
            status: response.status,
            details: errorText.substring(0, 200),
          },
          { status: response.status >= 500 ? 502 : response.status }
        );
      }

      const campaigns = await response.json();

      return NextResponse.json(
        { campaigns },
        {
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_REVALIDATE}, stale-while-revalidate=60`,
          },
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error fetching Smartlead campaigns:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch campaigns from Smartlead',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
