import { NextResponse } from 'next/server';
import { Clerk } from '@clerk/clerk-sdk-node';
import { requireAdmin } from '@/lib/auth/roles';

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkSecretKey) {
  throw new Error('CLERK_SECRET_KEY is required');
}

const clerk = new Clerk({ secretKey: clerkSecretKey });

export async function GET() {
  try {
    await requireAdmin();
    
    const users = await clerk.users.getUserList({ limit: 100 });
    
    const usersWithRoles = users.map((user: any) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || 'N/A',
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || 'N/A',
      role: (user.publicMetadata as any)?.role || 'not set',
      createdAt: user.createdAt,
    }));
    
    return NextResponse.json({ users: usersWithRoles });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { userId, role } = body;
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }
    
    if (role !== 'admin' && role !== 'client') {
      return NextResponse.json(
        { error: 'Role must be either "admin" or "client"' },
        { status: 400 }
      );
    }
    
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
      },
    });
    
    const user = await clerk.users.getUser(userId);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || 'N/A',
        role: (user.publicMetadata as any)?.role || 'not set',
      },
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

