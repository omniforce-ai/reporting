import { NextResponse } from 'next/server';
import { getAllTenantsFromSupabase } from '@/lib/utils/tenant';

export async function GET() {
  try {
    const tenants = await getAllTenantsFromSupabase();
    
    const clients = tenants.map(t => ({
      id: t.subdomain,
      name: t.name || t.subdomain,
      subdomain: t.subdomain,
    }));
    
    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { clients: [], error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

