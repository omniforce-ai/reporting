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
      <body className="min-h-screen text-slate-100 font-sans" style={{ background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f1a 50%, #000000 100%)' }}>
        {children}
      </body>
    </html>
  );
}

