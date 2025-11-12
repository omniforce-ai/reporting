'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';

export function ClerkDiagnostics() {
  const { loaded, user } = useClerk();
  const [envCheck, setEnvCheck] = useState<{
    publishableKey: boolean;
    secretKey: boolean;
  } | null>(null);

  useEffect(() => {
    // Check environment variables (client-side check)
    setEnvCheck({
      publishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secretKey: false, // Can't check server-side env vars from client
    });
  }, []);

  const [currentUrl, setCurrentUrl] = useState<string>('N/A');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin);
    }
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-muted border border-border rounded-lg p-4 text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Clerk Diagnostics</h3>
      <div className="space-y-1">
        <div>
          Clerk Loaded: <span className={loaded ? 'text-green-500' : 'text-red-500'}>{loaded ? 'Yes' : 'No'}</span>
        </div>
        <div>
          User: <span className={user ? 'text-green-500' : 'text-yellow-500'}>{user ? 'Authenticated' : 'Not authenticated'}</span>
        </div>
        <div>
          Publishable Key: <span className={envCheck?.publishableKey ? 'text-green-500' : 'text-red-500'}>{envCheck?.publishableKey ? 'Set' : 'Missing'}</span>
        </div>
        <div>
          Current URL: <span className="text-blue-500">{currentUrl}</span>
        </div>
      </div>
    </div>
  );
}

