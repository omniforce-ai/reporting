'use client';

import { useState, useEffect } from 'react';
import { UsersIcon } from '@/components/icons';

type Client = {
  id: string;
  name: string;
  subdomain: string;
};

export default function InviteUserForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'client'>('client');
  const [clientSlug, setClientSlug] = useState<string>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients list
  useEffect(() => {
    if (isOpen) {
      fetch('/api/clients')
        .then(res => res.json())
        .then(data => {
          setClients(data.clients || []);
        })
        .catch(err => {
          console.error('Failed to fetch clients:', err);
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInviteUrl(null);

    try {
      // Build request body - only include clientSlug if role is client
      const requestBody: any = { 
        email, 
        role,
      };
      
      if (role === 'client') {
        requestBody.clientSlug = clientSlug;
      }
      
      console.log('Sending invite request:', requestBody);
      
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        const text = await res.text();
        console.error('Response text:', text);
        setError(`Failed to parse server response (${res.status}). Check console for details.`);
        return;
      }
      
      console.log('Invite API response:', { status: res.status, ok: res.ok, data });

      if (!res.ok) {
        // Handle error response - check multiple possible error fields
        const errorMessage = data?.error || data?.message || data?.details || `Failed to send invitation (${res.status})`;
        setError(errorMessage);
        console.error('Invite API error:', { status: res.status, data, fullResponse: JSON.stringify(data, null, 2) });
        return;
      }

      // Check for success - invitation might be in data.invitation or data
      if (data.success && data.invitation?.url) {
        setInviteUrl(data.invitation.url);
        setEmail('');
        setClientSlug('');
        console.log('Invitation URL set:', data.invitation.url);
      } else if (data.invitation?.url) {
        // Fallback: if invitation exists but success flag is missing
        setInviteUrl(data.invitation.url);
        setEmail('');
        setClientSlug('');
        console.log('Invitation URL set (fallback):', data.invitation.url);
      } else {
        console.error('Unexpected response format:', data);
        setError(data.error || 'Failed to send invitation - invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      setError(error.message || 'Failed to send invitation. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      alert('Invite link copied to clipboard!');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors flex items-center gap-2"
      >
        <UsersIcon className="w-5 h-5" />
        Invite User
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl border-purple-500/20 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Invite User</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setEmail('');
                  setRole('client');
                  setClientSlug('');
                  setInviteUrl(null);
                  setError(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {inviteUrl ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="text-green-400 font-semibold mb-2">Invitation Sent!</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    An invitation email has been sent to <strong>{email}</strong> with role: <strong>{role}</strong>
                    {role === 'client' && clientSlug && (
                      <> for client: <strong>{clients.find(c => c.subdomain === clientSlug)?.name || clientSlug}</strong></>
                    )}
                  </p>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Invite Link (share this if needed):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inviteUrl}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white text-sm focus:outline-none"
                      />
                      <button
                        onClick={copyInviteLink}
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setInviteUrl(null);
                    setEmail('');
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value as 'admin' | 'client');
                      if (e.target.value === 'admin') {
                        setClientSlug('');
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    {role === 'admin' 
                      ? 'Admins can access the admin dashboard and manage clients/users'
                      : 'Clients can only view their own analytics dashboard'}
                  </p>
                </div>

                {role === 'client' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Client *
                    </label>
                    <select
                      value={clientSlug}
                      onChange={(e) => setClientSlug(e.target.value)}
                      required={role === 'client'}
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select a client...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.subdomain}>
                          {client.name} ({client.subdomain})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Select which client this user will have access to
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setEmail('');
                      setError(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

