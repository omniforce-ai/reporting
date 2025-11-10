import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import AdminNavButton from '@/components/admin/AdminNavButton';
import './styles/globals.css';

export const metadata: Metadata = {
  title: 'Omniforce Analytics',
  description: 'AI Automation Agency Client Reporting Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="min-h-screen font-sans">
          {children}
          <AdminNavButton />
        </body>
      </html>
    </ClerkProvider>
  );
}

