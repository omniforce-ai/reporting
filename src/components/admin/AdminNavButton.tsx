'use client';

import { useUser } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HomeIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';

export default function AdminNavButton() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) {
      setIsAdmin(false);
      return;
    }

    // Check if user is admin from public metadata
    const role = (user.publicMetadata?.role as string) || null;
    setIsAdmin(role === 'admin');
  }, [user, isLoaded]);

  // Only show on non-admin pages and if user is authenticated and loaded
  if (!isLoaded || !user || !isAdmin || pathname?.startsWith('/admin') || pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')) {
    return null;
  }

  return (
    <Button
      onClick={() => router.push('/admin/clients')}
      className="fixed bottom-6 right-6 z-50 shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105"
      title="Go to Admin"
    >
      <HomeIcon className="w-4 h-4" />
      Admin
    </Button>
  );
}

