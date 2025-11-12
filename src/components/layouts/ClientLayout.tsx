'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { UserCircleIcon } from '@/components/icons';
import { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const params = useParams();
  const pathname = usePathname();
  const [clientName, setClientName] = useState<string>('Analytics Dashboard');

  useEffect(() => {
    // Get client name from URL params or path
    const clientSlug = params?.clientname as string || 
      (pathname?.includes('/clients/') ? pathname.split('/clients/')[1]?.split('/')[0] : null);
    
    if (!clientSlug) return;
    
    // Use subdomain as fallback name - dashboard page will fetch full config
    // This avoids duplicate API calls. The dashboard page can update the name via context if needed.
    const formattedName = clientSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    setClientName(formattedName);
  }, [params, pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal Header - No Navigation */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-card-foreground">{clientName}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserCircleIcon className="w-5 h-5" />
              <span className="text-sm">
                {user?.fullName || user?.emailAddresses[0]?.emailAddress}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

