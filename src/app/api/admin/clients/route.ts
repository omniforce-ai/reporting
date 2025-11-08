import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { requireAdmin } from '@/lib/auth/roles';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { name, subdomain, customDomain, logoUrl, primaryColor } = body;
    
    if (!name || !subdomain) {
      return NextResponse.json(
        { error: 'name and subdomain are required' },
        { status: 400 }
      );
    }
    
    // Check if subdomain already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('subdomain')
      .eq('subdomain', subdomain)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: 'A client with this subdomain already exists' },
        { status: 409 }
      );
    }
    
    // Create new client
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        name,
        subdomain,
        customDomain: customDomain || null,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || '#3B82F6',
        apiKeys: {},
        features: { enabledFeatures: [] },
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create client' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      client: newClient,
    });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create client' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

