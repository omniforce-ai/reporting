import { getAllTenantsFromSupabase } from '@/lib/utils/tenant';
import Link from 'next/link';
import { UserCircleIcon, MailIcon } from '@/components/icons';
import CreateClientForm from '@/components/admin/CreateClientForm';

export default async function AdminClientsPage() {
  const tenants = await getAllTenantsFromSupabase();

  return (
    <div className="p-8 sm:p-12 lg:p-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">All Clients</h1>
          <p className="text-slate-400">Manage and view all client accounts</p>
        </div>
        <CreateClientForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((client) => {
          const apiKeys = (client.apiKeys as { smartlead?: string; lemlist?: string } | null) || {};
          const hasSmartlead = !!apiKeys.smartlead;
          const hasLemlist = !!apiKeys.lemlist;

          return (
            <Link
              key={client.id}
              href={`/clients/${client.subdomain}/dashboard`}
              className="glass rounded-xl border-purple-500/20 p-6 hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {client.name || client.subdomain}
                    </h3>
                    <p className="text-sm text-slate-400">{client.subdomain}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <MailIcon className="w-4 h-4" />
                  <span>APIs:</span>
                  <div className="flex gap-2">
                    {hasSmartlead && (
                      <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">
                        Smartlead
                      </span>
                    )}
                    {hasLemlist && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">
                        Lemlist
                      </span>
                    )}
                    {!hasSmartlead && !hasLemlist && (
                      <span className="text-slate-500 text-xs">None configured</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Created: {new Date(client.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {tenants.length === 0 && (
        <div className="glass rounded-xl border-purple-500/20 p-12 text-center">
          <UserCircleIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No clients yet</h3>
          <p className="text-slate-400">Clients will appear here once they're added to the system.</p>
        </div>
      )}
    </div>
  );
}

