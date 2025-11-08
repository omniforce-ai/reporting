import { getAllTenantsFromSupabase } from '@/lib/utils/tenant';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, UserCircleIcon, MailIcon } from '@/components/icons';
import ApiKeysForm from '@/components/admin/ApiKeysForm';

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
    <div className="p-8 sm:p-12 lg:p-16">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Back to Clients</span>
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center">
            <UserCircleIcon className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {client.name || client.subdomain}
            </h1>
            <p className="text-slate-400">Slug: {client.subdomain}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-xl border-purple-500/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">API Configuration</h2>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MailIcon className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">Smartlead</span>
              </div>
              {apiKeys.smartlead ? (
                <span className="px-3 py-1 rounded bg-green-500/20 text-green-400 text-sm">
                  Configured
                </span>
              ) : (
                <span className="px-3 py-1 rounded bg-slate-500/20 text-slate-400 text-sm">
                  Not configured
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MailIcon className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">Lemlist</span>
              </div>
              {apiKeys.lemlist ? (
                <span className="px-3 py-1 rounded bg-green-500/20 text-green-400 text-sm">
                  Configured
                </span>
              ) : (
                <span className="px-3 py-1 rounded bg-slate-500/20 text-slate-400 text-sm">
                  Not configured
                </span>
              )}
            </div>
          </div>
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Manage API Keys</h3>
            <ApiKeysForm 
              clientSlug={slug}
              initialApiKeys={apiKeys}
            />
          </div>
        </div>

        <div className="glass rounded-xl border-purple-500/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Client Information</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-slate-400">Slug:</span>
              <span className="text-white ml-2">{client.subdomain}</span>
            </div>
            {client.customDomain && (
              <div>
                <span className="text-slate-400">Custom Domain:</span>
                <span className="text-white ml-2">{client.customDomain}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400">Created:</span>
              <span className="text-white ml-2">
                {new Date(client.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Last Updated:</span>
              <span className="text-white ml-2">
                {new Date(client.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border-purple-500/20 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Enabled Features</h2>
          {features.enabledFeatures && Array.isArray(features.enabledFeatures) && features.enabledFeatures.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {features.enabledFeatures.map((feature: string) => (
                <span
                  key={feature}
                  className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No features enabled</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/clients/${client.subdomain}/dashboard`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
        >
          View Client Dashboard
        </Link>
      </div>
    </div>
  );
}

