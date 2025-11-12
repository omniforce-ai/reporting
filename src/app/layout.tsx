import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import AdminNavButton from '@/components/admin/AdminNavButton';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './styles/globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

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
      <html lang="en" suppressHydrationWarning className={dmSans.variable}>
        <body className="min-h-screen font-sans">
          <ErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
              <AdminNavButton />
            </ThemeProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}

