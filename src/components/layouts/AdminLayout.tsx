'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  OmniforceLogoViolet,
  UserCircleIcon, 
  UsersIcon
} from '@/components/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';
import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useUser();
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/clients', label: 'Clients', icon: UserCircleIcon },
    { href: '/admin/users', label: 'Users', icon: UsersIcon },
  ];

  return (
    <div className="flex h-screen w-full">
      <SidebarProvider>
        <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <Link href="/admin/clients">
                  <OmniforceLogoViolet className="h-5 w-5" />
                  <span className="text-base font-semibold">Omniforce Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        asChild
                        tooltip={item.label}
                        isActive={isActive}
                      >
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ThemeToggle />
          {user && (
            <NavUser user={{
              name: user.fullName || 'Admin',
              email: user.emailAddresses[0]?.emailAddress || '',
              avatar: user.imageUrl || '/avatars/default.jpg',
            }} />
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col overflow-hidden">
        <SiteHeader />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

