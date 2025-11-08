'use client';

import { useUser } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HomeIcon } from '@/components/icons';

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
    <button
      onClick={() => router.push('/admin')}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105"
      title="Go to Admin Dashboard"
    >
      <HomeIcon className="w-5 h-5" />
      <span>Admin</span>
    </button>
  );
}

