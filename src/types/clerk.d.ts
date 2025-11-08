// Type definitions for Clerk session claims
declare module '@clerk/nextjs/server' {
  interface SessionClaims {
    metadata?: {
      role?: string;
      clientSlug?: string;
      clientSubdomain?: string;
      [key: string]: any;
    };
    publicMetadata?: {
      role?: string;
      clientSlug?: string;
      clientSubdomain?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export function auth(): Promise<{
    userId: string | null;
    sessionClaims?: SessionClaims;
  }>;

  export function clerkMiddleware(
    handler: (auth: any, request: any) => Promise<any>
  ): any;

  export function createRouteMatcher(routes: string[]): (request: any) => boolean;
}

declare module '@clerk/clerk-sdk-node' {
  export class Clerk {
    constructor(options: { secretKey: string });
    users: {
      getUser(userId: string): Promise<any>;
      getUserList(options?: { limit?: number; emailAddress?: string[] }): Promise<any[]>;
      updateUserMetadata(userId: string, metadata: { publicMetadata?: any }): Promise<any>;
    };
    invitations: {
      createInvitation(options: {
        emailAddress: string;
        publicMetadata?: any;
        ignoreExisting?: boolean;
        redirectUrl?: string;
      }): Promise<any>;
    };
  }
}

