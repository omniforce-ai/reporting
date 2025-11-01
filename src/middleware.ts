import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  const response = NextResponse.next();
  
  // Set subdomain header for all requests
  // Default to creation-exhibitions for localhost development
  if (subdomain && subdomain !== 'www') {
    if (subdomain === 'localhost' || subdomain === '127.0.0.1') {
      response.headers.set('x-tenant-subdomain', 'creation-exhibitions');
    } else {
      response.headers.set('x-tenant-subdomain', subdomain);
    }
  } else {
    response.headers.set('x-tenant-subdomain', 'creation-exhibitions');
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

