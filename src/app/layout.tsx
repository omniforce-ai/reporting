import type { Metadata } from 'next';
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
    <html lang="en">
      <body className="min-h-screen text-slate-100 font-sans" style={{ 
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0f0a1a 100%)',
        backgroundAttachment: 'fixed'
      }}>
        {children}
      </body>
    </html>
  );
}

