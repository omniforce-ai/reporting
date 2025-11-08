import ClientLayout from '@/components/layouts/ClientLayout';

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}

