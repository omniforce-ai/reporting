import { getAllTenantsFromSupabase } from '@/lib/utils/tenant';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, UserCircleIcon, MailIcon } from '@/components/icons';
import ApiKeysForm from '@/components/admin/ApiKeysForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenants = await getAllTenantsFromSupabase();
  const client = tenants.find((t) => t.subdomain === slug);

  if (!client) {
    notFound();
  }

  const apiKeys = (client.apiKeys as { smartlead?: string; lemlist?: string; lemlistEmail?: string } | null) || {};

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <Link
              href="/admin/clients"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Clients</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold mb-1">
                  {client.name || client.subdomain}
                </h1>
                <p className="text-sm text-muted-foreground">Path: {client.subdomain}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-5 h-5 text-muted-foreground" />
                    <CardTitle>Smartlead</CardTitle>
                  </div>
                  {apiKeys.smartlead ? (
                    <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Not configured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 min-h-0">
                <ApiKeysForm 
                  clientSlug={slug}
                  initialApiKeys={apiKeys}
                  platform="smartlead"
                />
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-5 h-5 text-muted-foreground" />
                    <CardTitle>Lemlist</CardTitle>
                  </div>
                  {apiKeys.lemlist ? (
                    <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Not configured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 min-h-0">
                <ApiKeysForm 
                  clientSlug={slug}
                  initialApiKeys={apiKeys}
                  platform="lemlist"
                />
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="px-4 lg:px-6">
            <Button asChild>
              <Link href={`/clients/${client.subdomain}/dashboard`}>
                View Client Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

