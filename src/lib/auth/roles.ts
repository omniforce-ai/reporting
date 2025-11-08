import { auth } from '@clerk/nextjs/server';
import { Clerk } from '@clerk/clerk-sdk-node';

export async function getCurrentUserRole(): Promise<string | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;
  
  // Try to get role from sessionClaims first
  let role = ((sessionClaims?.metadata as any)?.role || (sessionClaims?.publicMetadata as any)?.role) as string;
  
  // If not in sessionClaims, fetch user directly from Clerk
  if (!role) {
    try {
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (clerkSecretKey) {
        const clerk = new (Clerk as any)({ secretKey: clerkSecretKey });
        const user = await clerk.users.getUser(userId);
        role = (user.publicMetadata as any)?.role || null;
      }
    } catch (error) {
      console.error('Error fetching user role from Clerk:', error);
    }
  }
  
  return role;
}

export async function getCurrentUserClientSlug(): Promise<string | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;
  
  // Try to get clientSlug from sessionClaims first (backward compat: also check clientSubdomain)
  let clientSlug = ((sessionClaims?.metadata as any)?.clientSlug || (sessionClaims?.publicMetadata as any)?.clientSlug || 
                    (sessionClaims?.metadata as any)?.clientSubdomain || (sessionClaims?.publicMetadata as any)?.clientSubdomain) as string;
  
  // If not in sessionClaims, fetch user directly from Clerk
  if (!clientSlug) {
    try {
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (clerkSecretKey) {
        const clerk = new (Clerk as any)({ secretKey: clerkSecretKey });
        const user = await clerk.users.getUser(userId);
        const metadata = user.publicMetadata as any;
        clientSlug = metadata?.clientSlug || metadata?.clientSubdomain || null;
      }
    } catch (error) {
      console.error('Error fetching user clientSlug from Clerk:', error);
    }
  }
  
  return clientSlug;
}

export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'admin';
}

export async function isClient(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'client' || !role; // Default to client if no role set
}

export async function requireAdmin() {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    throw new Error('Unauthorized: Admin access required');
  }
}

export async function requireClientAccess(clientSlug: string) {
  const role = await getCurrentUserRole();
  
  // Admins can access any client
  if (role === 'admin') {
    return;
  }
  
  // Clients can only access their assigned client
  const userClientSlug = await getCurrentUserClientSlug();
  if (userClientSlug !== clientSlug) {
    throw new Error('Unauthorized: You do not have access to this client');
  }
}

