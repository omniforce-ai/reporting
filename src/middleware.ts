import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Clerk } from '@clerk/clerk-sdk-node';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

// Reserved paths that should not be treated as client names
const RESERVED_PATHS = ['admin', 'api', 'sign-in', 'sign-up', 'login', 'clients', '_next', 'favicon.ico'];

function extractClientFromPath(pathname: string): string | null {
  // Extract client from /clients/[clientname]/* pattern
  const match = pathname.match(/^\/clients\/([^/]+)/);
  if (match && match[1]) {
    const clientName = match[1];
    // Don't treat reserved paths as client names
    if (!RESERVED_PATHS.includes(clientName.toLowerCase())) {
      return clientName;
    }
  }
  return null;
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const response = NextResponse.next();
  
  // Redirect old query parameter format to path-based routing
  if (pathname === '/dashboard' && searchParams.get('client')) {
    const clientSlug = searchParams.get('client');
    return NextResponse.redirect(new URL(`/clients/${clientSlug}/dashboard`, request.url));
  }
  
  // Redirect any /dashboard route to root (which will redirect based on role)
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Extract client from path if using /clients/[clientname] pattern
  const clientFromPath = extractClientFromPath(pathname);
  if (clientFromPath) {
    response.headers.set('x-tenant-client', clientFromPath);
  }
  
  // Protect routes (except public routes)
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
  
  // Get role from user's publicMetadata (fetch directly from Clerk)
  const { userId } = await auth();
  let role: string | null = null;
  let clientSlug: string | null = null;
  
  if (userId) {
    try {
      // Try to get role from sessionClaims first (faster)
      const { sessionClaims } = await auth();
      role = (sessionClaims?.metadata?.role || sessionClaims?.publicMetadata?.role) as string;
      // Backward compat: check both clientSlug and clientSubdomain
      clientSlug = (sessionClaims?.metadata?.clientSlug || sessionClaims?.publicMetadata?.clientSlug ||
                    sessionClaims?.metadata?.clientSubdomain || sessionClaims?.publicMetadata?.clientSubdomain) as string;
      
      // If accessing a client route or metadata missing, always fetch from Clerk to ensure we have latest data
      // This is important for newly created users from invitations where metadata might not be in session yet
      if (clientFromPath || !role || !clientSlug) {
        const clerkSecretKey = process.env.CLERK_SECRET_KEY;
        if (clerkSecretKey) {
          const clerk = new Clerk({ secretKey: clerkSecretKey });
          const user = await clerk.users.getUser(userId);
          const metadata = user.publicMetadata as any;
          role = role || metadata?.role || null;
          clientSlug = clientSlug || metadata?.clientSlug || metadata?.clientSubdomain || null;
          
          // If metadata is still missing, check if user has a pending/accepted invitation and apply it
          // This handles cases where Clerk didn't automatically copy invitation metadata
          // Apply if role is missing, or if role is 'client' but clientSlug is missing
          if (!role || (role === 'client' && !clientSlug)) {
            try {
              const email = user.emailAddresses?.[0]?.emailAddress;
              if (email) {
                // Check for recent invitations (accepted or pending) for this email
                const invitations = await clerk.invitations.listInvitations({
                  emailAddress: [email],
                });
                
                if (invitations.data && invitations.data.length > 0) {
                  // Get the most recent invitation
                  const invitation = invitations.data[0];
                  const invitationMetadata = invitation.publicMetadata as any;
                  
                  if (invitationMetadata?.role) {
                    console.log('[Middleware] Applying invitation metadata to user:', {
                      userId,
                      email,
                      metadata: invitationMetadata,
                    });
                    
                    // Apply invitation metadata to user
                    await clerk.users.updateUserMetadata(userId, {
                      publicMetadata: invitationMetadata,
                    });
                    
                    // Update local variables
                    role = invitationMetadata.role || null;
                    clientSlug = invitationMetadata.clientSlug || invitationMetadata.clientSubdomain || null;
                    
                    console.log('[Middleware] Successfully applied invitation metadata');
                  }
                }
              }
            } catch (error) {
              console.error('[Middleware] Error applying invitation metadata:', error);
            }
          }
          
          // Log for debugging invitation flow
          if (clientFromPath && !clientSlug) {
            console.log('[Middleware] User accessing client route but no clientSlug found:', {
              userId,
              pathname,
              clientFromPath,
              role,
              metadata: JSON.stringify(metadata),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user metadata:', error);
    }
  }
  
  // Verify client access for /clients/[clientname] routes
  if (clientFromPath && userId) {
    // Admins can access any client
    if (role !== 'admin') {
      // Clients can only access their assigned client
      if (clientSlug !== clientFromPath) {
        // Redirect to their own client dashboard if they have one
        if (clientSlug) {
          return NextResponse.redirect(new URL(`/clients/${clientSlug}/dashboard`, request.url));
        }
        // If no clientSlug found, this might be a newly invited user
        // Log for debugging and redirect to unauthorized
        console.log('[Middleware] User accessing client route without matching clientSlug:', {
          userId,
          pathname,
          clientFromPath,
          role,
          clientSlug,
        });
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }
  
  // Redirect root path and auth pages based on role
  if (pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up') {
    if (!userId) {
      // Not signed in - allow access to sign-in/sign-up, redirect root to sign-in
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
      return response;
    }
    
    // User is signed in - redirect based on role
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/clients', request.url));
    } else if (clientSlug) {
      // Redirect clients to their client dashboard
      return NextResponse.redirect(new URL(`/clients/${clientSlug}/dashboard`, request.url));
    } else {
      // No clientSlug - redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  // Protect admin routes - only allow admins
  if (pathname.startsWith('/admin')) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    if (role !== 'admin') {
      // Redirect non-admins to their client dashboard
      if (clientSlug) {
        return NextResponse.redirect(new URL(`/clients/${clientSlug}/dashboard`, request.url));
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  
  // Protect all /clients/[clientname] routes - require authentication
  if (clientFromPath && !userId) {
    // Redirect to sign-in with the client path as redirect URL
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  return response;
});

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

