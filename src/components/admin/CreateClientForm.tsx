'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircleIcon } from '@/components/icons';

export default function CreateClientForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    customDomain: '',
    logoUrl: '',
    primaryColor: '#3B82F6',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          subdomain: formData.subdomain,
          customDomain: formData.customDomain || undefined,
          logoUrl: formData.logoUrl || undefined,
          primaryColor: formData.primaryColor,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsOpen(false);
        setFormData({
          name: '',
          subdomain: '',
          customDomain: '',
          logoUrl: '',
          primaryColor: '#3B82F6',
        });
        router.refresh();
      } else {
        alert(data.error || 'Failed to create client');
      }
    } catch (error) {
      console.error('Failed to create client:', error);
      alert('Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors flex items-center gap-2"
      >
        <UserCircleIcon className="w-5 h-5" />
        Create Client
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl border-purple-500/20 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Client</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Client Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                  placeholder="acme-corp"
                />
                <p className="text-xs text-slate-500 mt-1">
                  URL-friendly identifier (e.g., /clients/acme-corp/dashboard)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Custom Domain (Optional)
                </label>
                <input
                  type="text"
                  value={formData.customDomain}
                  onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                  placeholder="dashboard.acme.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-16 h-10 rounded-lg border border-purple-500/20 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Client'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

