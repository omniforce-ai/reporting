import { NextResponse } from 'next/server';
import { Clerk } from '@clerk/clerk-sdk-node';
import { requireAdmin } from '@/lib/auth/roles';

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkSecretKey) {
  throw new Error('CLERK_SECRET_KEY is required');
}

const clerk = new Clerk({ secretKey: clerkSecretKey });

export async function POST(request: Request) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    console.log('Received invite request body:', body);
    const { email, role, clientSlug, clientSubdomain } = body; // Support both for backward compat
    
    // Use clientSlug if provided, otherwise fall back to clientSubdomain
    const clientIdentifier = clientSlug || clientSubdomain;
    
    if (!email || typeof email !== 'string' || !email.trim()) {
      console.error('Invalid email:', email);
      return NextResponse.json(
        { error: 'Email is required and must be a valid string' },
        { status: 400 }
      );
    }
    
    if (!role || (role !== 'admin' && role !== 'client')) {
      console.error('Invalid role:', role);
      return NextResponse.json(
        { error: 'Role must be either "admin" or "client"' },
        { status: 400 }
      );
    }
    
    // If role is client, clientSlug is required
    if (role === 'client' && (!clientIdentifier || typeof clientIdentifier !== 'string' || !clientIdentifier.trim())) {
      console.error('Missing clientSlug for client role');
      return NextResponse.json(
        { error: 'Client slug is required when inviting a client' },
        { status: 400 }
      );
    }
    
    // Build public metadata
    const publicMetadata: any = {
      role: role,
    };
    
    // Add client slug if role is client (store as both for backward compat during migration)
    if (role === 'client' && clientIdentifier) {
      publicMetadata.clientSlug = clientIdentifier;
      // Keep clientSubdomain for backward compatibility during migration
      if (clientSubdomain) {
        publicMetadata.clientSubdomain = clientSubdomain;
      }
    }
    
    // Build redirect URL - if client, redirect to their client dashboard
    let redirectUrl = '/';
    if (role === 'client' && clientIdentifier) {
      redirectUrl = `/clients/${clientIdentifier}/dashboard`;
    } else if (role === 'admin') {
      redirectUrl = '/admin/clients';
    }
    
    // Create invitation
    console.log('Creating invitation for:', email, 'with role:', role, 'clientSlug:', clientIdentifier);
    console.log('Public metadata:', JSON.stringify(publicMetadata, null, 2));
    
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      publicMetadata,
      ignoreExisting: false, // Set to true if you want to resend to existing users
      redirectUrl,
    });
    
    console.log('Invitation created successfully:', {
      id: invitation.id,
      email: invitation.emailAddress,
      status: invitation.status,
      url: invitation.url,
    });
    
    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.emailAddress,
        status: invitation.status,
        url: invitation.url,
      },
    });
  } catch (error: any) {
    console.error('Error creating invitation:', error);
    console.error('Error details:', {
      message: error.message,
      errors: error.errors,
      stack: error.stack,
      name: error.name,
      shortMessage: error.shortMessage,
      longMessage: error.longMessage,
      code: error.code,
      status: error.status,
      statusCode: error.statusCode,
      clerkError: error.clerkError,
    });
    
    // Handle Clerk-specific error format
    const clerkError = error.errors?.[0] || error;
    const errorMessage = clerkError.longMessage || clerkError.shortMessage || clerkError.message || error.message;
    const errorCode = clerkError.code || error.code;
    
    // Check if user already exists or already invited
    if (errorCode === 'form_identifier_exists' || 
        errorMessage?.toLowerCase().includes('already exists') || 
        errorMessage?.toLowerCase().includes('already been invited') ||
        errorMessage?.toLowerCase().includes('identifier_exists')) {
      return NextResponse.json(
        { error: 'User with this email already exists or has already been invited. They can sign in directly.' },
        { status: 409 }
      );
    }
    
    // Check for bad request errors
    if (errorCode === 'bad_request' || error.statusCode === 400) {
      return NextResponse.json(
        { error: errorMessage || 'Invalid request. Please check the email address and try again.' },
        { status: 400 }
      );
    }
    
    // Check for authorization errors
    if (error.message?.includes('Unauthorized') || error.message?.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: errorMessage || 'Failed to create invitation',
        code: errorCode,
        details: clerkError.message || error.errors?.[0]?.message || undefined,
      },
      { status: error.statusCode || (error.message?.includes('Unauthorized') ? 403 : 500) }
    );
  }
}

