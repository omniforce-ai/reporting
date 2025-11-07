import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';

const LEMLIST_BASE_URL = 'https://api.lemlist.com/api';
const REQUEST_TIMEOUT = 10000;
const CACHE_REVALIDATE = 300; // 5 minutes

function createBasicAuth(email: string, apiKey: string): string {
  const credentials = Buffer.from(`${email}:${apiKey}`).toString('base64');
  return `Basic ${credentials}`;
}

export async function GET(request: Request) {
  try {
    const tenant = await getCurrentTenant();
    const apiKeys = tenant.apiKeys as { lemlist?: string; lemlistEmail?: string } | null;
    const lemlistApiKey = apiKeys?.lemlist;
    // Default to alistair@omniforce.ai for Creation Exhibition client
    const lemlistEmail = apiKeys?.lemlistEmail || 'alistair@omniforce.ai';

    if (!lemlistApiKey) {
      return NextResponse.json(
        { error: 'Lemlist API key not configured for this tenant' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      // Lemlist API uses Basic Auth with email:api_key format
      const authHeader = createBasicAuth(lemlistEmail, lemlistApiKey);
      
      const response = await fetch(
        `${LEMLIST_BASE_URL}/campaigns?version=v2`,
        {
          signal: controller.signal,
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'User-Agent': 'Omniforce-Reporting/1.0',
          },
          next: { revalidate: CACHE_REVALIDATE },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 401) {
          return NextResponse.json(
            { error: 'Invalid Lemlist API credentials' },
            { status: 401 }
          );
        }

        if (response.status === 429) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { 
            error: 'Lemlist API error',
            status: response.status,
            details: errorText.substring(0, 200),
          },
          { status: response.status >= 500 ? 502 : response.status }
        );
      }

      const data = await response.json();
      
      // Lemlist API returns { campaigns: [...], pagination: {...} }
      const campaigns = data.campaigns || (Array.isArray(data) ? data : []);

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
    console.error('Error fetching Lemlist campaigns:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Lemlist campaigns',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

