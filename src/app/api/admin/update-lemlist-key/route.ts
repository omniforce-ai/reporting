import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

/**
 * Temporary endpoint to update tenant's Lemlist API key
 * This should be removed after configuration is complete
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, email = 'alistair@omniforce.ai', subdomain } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!subdomain) {
      return NextResponse.json(
        { error: 'subdomain is required' },
        { status: 400 }
      );
    }

    // First, get the current tenant to preserve existing apiKeys
    const { data: tenant, error: fetchError } = await supabase
      .from('clients')
      .select('apiKeys')
      .eq('subdomain', subdomain)
      .single();

    if (fetchError || !tenant) {
      return NextResponse.json(
        { error: `Tenant not found: ${fetchError?.message || 'Unknown error'}` },
        { status: 404 }
      );
    }

    // Parse existing apiKeys
    let existingApiKeys: any = {};
    const apiKeysValue = tenant.apiKeys;
    
    if (apiKeysValue) {
      if (typeof apiKeysValue === 'string') {
        try {
          existingApiKeys = JSON.parse(apiKeysValue);
        } catch (e) {
          console.warn('Failed to parse existing apiKeys');
        }
      } else if (typeof apiKeysValue === 'object') {
        existingApiKeys = apiKeysValue;
      }
    }

    // Merge new Lemlist keys with existing ones
    const updatedApiKeys = {
      ...existingApiKeys,
      lemlist: apiKey,
      lemlistEmail: email,
    };

    // Update the tenant
    const { data: updated, error: updateError } = await supabase
      .from('clients')
      .update({ 
        apiKeys: updatedApiKeys,
      })
      .eq('subdomain', subdomain)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: `Failed to update tenant: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lemlist API key updated successfully',
      tenant: {
        subdomain: updated.subdomain,
        apiKeys: updated.apiKeys,
      },
    });
  } catch (error) {
    console.error('Error updating Lemlist API key:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

