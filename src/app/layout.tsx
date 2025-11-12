import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import AdminNavButton from '@/components/admin/AdminNavButton';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen font-sans">
          <ErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
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

