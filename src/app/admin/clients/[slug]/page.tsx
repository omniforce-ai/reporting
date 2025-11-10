import { getAllTenantsFromSupabase } from '@/lib/utils/tenant';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, UserCircleIcon, MailIcon } from '@/components/icons';
import ApiKeysForm from '@/components/admin/ApiKeysForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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

  const apiKeys = (client.apiKeys as { smartlead?: string; lemlist?: string } | null) || {};
  const features = (client.features as { enabledFeatures?: string[] } | null) || {};

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
                <p className="text-sm text-muted-foreground">Slug: {client.subdomain}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MailIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Smartlead</span>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MailIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Lemlist</span>
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
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-4">Manage API Keys</h3>
                  <ApiKeysForm 
                    clientSlug={slug}
                    initialApiKeys={apiKeys}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Slug:</span>
                    <span className="ml-2 font-medium">{client.subdomain}</span>
                  </div>
                  {client.customDomain && (
                    <div>
                      <span className="text-muted-foreground">Custom Domain:</span>
                      <span className="ml-2 font-medium">{client.customDomain}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2 font-medium">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="ml-2 font-medium">
                      {new Date(client.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Enabled Features</CardTitle>
              </CardHeader>
              <CardContent>
                {features.enabledFeatures && Array.isArray(features.enabledFeatures) && features.enabledFeatures.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {features.enabledFeatures.map((feature: string) => (
                      <Badge key={feature} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No features enabled</p>
                )}
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

