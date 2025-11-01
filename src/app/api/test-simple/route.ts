import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'API route working', timestamp: new Date().toISOString() });
}

