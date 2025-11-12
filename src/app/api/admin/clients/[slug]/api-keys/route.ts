import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { requireAdmin } from '@/lib/auth/roles';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin();
    
    const { slug } = await params;
    const body = await request.json();
    const { smartlead, lemlist, lemlistEmail } = body;
    
    // Get current client to merge API keys
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('apiKeys')
      .eq('subdomain', slug)
      .single();
    
    if (fetchError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    // Merge with existing API keys
    const currentApiKeys = (client.apiKeys as any) || {};
    const updatedApiKeys = { ...currentApiKeys };
    
    // Only update fields that are explicitly provided in the request
    if (smartlead !== undefined) {
      updatedApiKeys.smartlead = smartlead || null;
    }
    if (lemlist !== undefined) {
      updatedApiKeys.lemlist = lemlist || null;
    }
    if (lemlistEmail !== undefined) {
      updatedApiKeys.lemlistEmail = lemlistEmail || null;
    }
    
    // Remove null or empty string values
    Object.keys(updatedApiKeys).forEach(key => {
      if (updatedApiKeys[key] === null || updatedApiKeys[key] === '') {
        delete updatedApiKeys[key];
      }
    });
    
    // Update client
    const { data: updated, error } = await supabase
      .from('clients')
      .update({ apiKeys: updatedApiKeys })
      .eq('subdomain', slug)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating API keys:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update API keys' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      client: updated,
    });
  } catch (error: any) {
    console.error('Error updating API keys:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update API keys' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

