import { getAllTenantsFromSupabase } from '@/lib/utils/tenant';
import Link from 'next/link';
import { UserCircleIcon, MailIcon, UsersIcon, ChartBarIcon, ArrowRightIcon, PlusIcon } from '@/components/icons';
import { Clerk } from '@clerk/clerk-sdk-node';

const clerkSecretKey = process.env.CLERK_SECRET_KEY || '';
const clerk = clerkSecretKey ? new Clerk({ secretKey: clerkSecretKey }) : null;

export default async function AdminDashboardPage() {
  const tenants = await getAllTenantsFromSupabase();
  
  // Get user count and admin count from Clerk
  let userCount = 0;
  let adminCount = 0;
  try {
    if (clerk) {
      const users = await clerk.users.getUserList({ limit: 100 });
      userCount = users.length;
      adminCount = users.filter(u => (u.publicMetadata as any)?.role === 'admin').length;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }

  // Calculate stats
  const totalClients = tenants.length;
  const clientsWithSmartlead = tenants.filter(t => {
    const apiKeys = (t.apiKeys as { smartlead?: string } | null) || {};
    return !!apiKeys.smartlead;
  }).length;
  const clientsWithLemlist = tenants.filter(t => {
    const apiKeys = (t.apiKeys as { lemlist?: string } | null) || {};
    return !!apiKeys.lemlist;
  }).length;
  const clientsWithoutAPIs = totalClients - clientsWithSmartlead - clientsWithLemlist;
  
  const recentClients = tenants
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 sm:p-12 lg:p-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Overview and quick access to platform management</p>
      </div>

      {/* Key Metrics - Primary Focus */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link
          href="/admin/clients"
          className="glass rounded-xl border-purple-500/20 p-6 hover:border-purple-500/40 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/20 to-purple-500/10 flex items-center justify-center group-hover:from-purple-600/30 group-hover:to-purple-500/20 transition-colors">
              <UserCircleIcon className="w-6 h-6 text-purple-400" />
            </div>
            <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{totalClients}</div>
          <div className="text-sm text-slate-400">Total Clients</div>
          <div className="mt-2 text-xs text-slate-500">Click to manage</div>
        </Link>

        <Link
          href="/admin/users"
          className="glass rounded-xl border-purple-500/20 p-6 hover:border-purple-500/40 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-500/10 flex items-center justify-center group-hover:from-blue-600/30 group-hover:to-blue-500/20 transition-colors">
              <UsersIcon className="w-6 h-6 text-blue-400" />
            </div>
            <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{userCount}</div>
          <div className="text-sm text-slate-400">Total Users</div>
          <div className="mt-2 text-xs text-slate-500">{adminCount} admins</div>
        </Link>

        <div className="glass rounded-xl border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600/20 to-green-500/10 flex items-center justify-center">
              <MailIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{clientsWithSmartlead}</div>
          <div className="text-sm text-slate-400">Smartlead Active</div>
          <div className="mt-2 text-xs text-slate-500">
            {totalClients > 0 ? Math.round((clientsWithSmartlead / totalClients) * 100) : 0}% of clients
          </div>
        </div>

        <div className="glass rounded-xl border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-600/20 to-cyan-500/10 flex items-center justify-center">
              <MailIcon className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{clientsWithLemlist}</div>
          <div className="text-sm text-slate-400">Lemlist Active</div>
          <div className="mt-2 text-xs text-slate-500">
            {totalClients > 0 ? Math.round((clientsWithLemlist / totalClients) * 100) : 0}% of clients
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Quick Actions - Left Column */}
        <div className="lg:col-span-1">
          <div className="glass rounded-xl border-purple-500/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/admin/clients"
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-white transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <UserCircleIcon className="w-5 h-5" />
                  <span>View All Clients</span>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-white transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <UsersIcon className="w-5 h-5" />
                  <span>Manage Users</span>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Clients - Right Column (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="glass rounded-xl border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Clients</h2>
              <Link
                href="/admin/clients"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            {recentClients.length > 0 ? (
              <div className="space-y-2">
                {recentClients.map((client) => {
                  const apiKeys = (client.apiKeys as { smartlead?: string; lemlist?: string } | null) || {};
                  const hasSmartlead = !!apiKeys.smartlead;
                  const hasLemlist = !!apiKeys.lemlist;
                  
                  return (
                    <Link
                      key={client.id}
                      href={`/clients/${client.subdomain}/dashboard`}
                      className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-purple-500/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                          <UserCircleIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{client.name || client.subdomain}</div>
                          <div className="text-xs text-slate-400 truncate">{client.subdomain}</div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {hasSmartlead && (
                            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">SL</span>
                          )}
                          {hasLemlist && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">LL</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-slate-500">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </span>
                        <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCircleIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-4">No clients yet</p>
                <Link
                  href="/admin/clients"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create First Client
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Configuration Status */}
      {clientsWithoutAPIs > 0 && (
        <div className="glass rounded-xl border-yellow-500/20 p-6 bg-yellow-500/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <MailIcon className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">API Configuration Needed</h3>
              <p className="text-slate-400 text-sm mb-3">
                {clientsWithoutAPIs} {clientsWithoutAPIs === 1 ? 'client' : 'clients'} {clientsWithoutAPIs === 1 ? 'has' : 'have'} no API keys configured yet.
              </p>
              <Link
                href="/admin/clients"
                className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Configure APIs
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
