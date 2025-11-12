import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/utils/tenant';

const LEMLIST_BASE_URL = process.env.LEMLIST_BASE_URL || 'https://api.lemlist.com/api';
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '20000', 10);

function createBasicAuth(email: string, apiKey: string): string {
  const credentials = Buffer.from(`${email}:${apiKey}`).toString('base64');
  return `Basic ${credentials}`;
}

interface Activity {
  _id: string;
  type: string;
  leadId?: string;
  campaignId?: string;
  sequenceId?: string;
  stepId?: string;
  createdAt: string;
}

async function fetchActivitiesPage(
  email: string,
  apiKey: string,
  signal: AbortSignal,
  campaignId?: string,
  startDate?: string,
  endDate?: string,
  offset: number = 0,
  limit: number = 100
): Promise<Activity[]> {
  const authHeader = createBasicAuth(email, apiKey);
  const params = new URLSearchParams({
    version: 'v2',
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (campaignId) {
    params.append('campaignId', campaignId);
  }

  const response = await fetch(
    `${LEMLIST_BASE_URL}/activities?${params.toString()}`,
    {
      signal,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'Omniforce-Reporting/1.0',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Lemlist activities API error:`, response.status, errorText);
    return [];
  }

  const activities: Activity[] = await response.json();

  // Filter by date range if provided (client-side filtering since API doesn't support it)
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.createdAt);
      return activityDate >= start && activityDate <= end;
    });
  }

  return activities;
}

async function fetchAllActivities(
  email: string,
  apiKey: string,
  signal: AbortSignal,
  campaignId?: string,
  startDate?: string,
  endDate?: string
): Promise<Activity[]> {
  const allActivities: Activity[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const activities = await fetchActivitiesPage(
      email,
      apiKey,
      signal,
      campaignId,
      startDate,
      endDate,
      offset,
      limit
    );

    if (activities.length === 0) {
      hasMore = false;
    } else {
      allActivities.push(...activities);
      
      // If we got fewer than the limit, we're done
      if (activities.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }
  }

  return allActivities;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    
    const tenant = await getCurrentTenant();
    const apiKeys = tenant.apiKeys as { lemlist?: string; lemlistEmail?: string } | null;
    const lemlistApiKey = apiKeys?.lemlist;
    const lemlistEmail = apiKeys?.lemlistEmail;

    if (!lemlistApiKey) {
      return NextResponse.json(
        { error: 'Lemlist API key not configured for this tenant' },
        { status: 400 }
      );
    }

    if (!lemlistEmail) {
      return NextResponse.json(
        { error: 'Lemlist email not configured for this tenant' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const activities = await fetchAllActivities(
        lemlistEmail,
        lemlistApiKey,
        controller.signal,
        campaignId,
        startDate,
        endDate
      );

      clearTimeout(timeoutId);

      return NextResponse.json(
        { activities },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
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
    console.error('Error fetching Lemlist activities:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Lemlist activities',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

