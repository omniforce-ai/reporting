'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  OmniforceLogoViolet,
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UsersIcon
} from '@/components/icons';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: HomeIcon },
    { href: '/admin/clients', label: 'Clients', icon: UserCircleIcon },
    { href: '/admin/users', label: 'Users', icon: UsersIcon },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-purple-500/20 flex flex-col">
        <div className="p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <OmniforceLogoViolet className="w-8 h-8 flex-shrink-0" aria-label="Omniforce Logo" />
            <div>
              <h1 className="text-xl font-bold text-white">Omniforce Admin</h1>
              <p className="text-sm text-slate-400">Management Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:bg-purple-500/10 hover:text-purple-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-purple-500/20">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <UserCircleIcon className="w-5 h-5 text-purple-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.fullName || user?.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-xs text-slate-400 truncate">
                Admin
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-purple-500/10 hover:text-purple-300 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

