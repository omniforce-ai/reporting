'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@/components/icons';

type ApiKeysFormProps = {
  clientSlug: string;
  initialApiKeys: {
    smartlead?: string;
    lemlist?: string;
    lemlistEmail?: string;
  };
};

function maskApiKey(key: string): string {
  if (!key || key.length <= 4) return '••••';
  return '••••' + key.slice(-4);
}

export default function ApiKeysForm({ clientSlug, initialApiKeys }: ApiKeysFormProps) {
  const router = useRouter();
  const [smartlead, setSmartlead] = useState(initialApiKeys.smartlead || '');
  const [lemlist, setLemlist] = useState(initialApiKeys.lemlist || '');
  const [lemlistEmail, setLemlistEmail] = useState(initialApiKeys.lemlistEmail || '');
  
  const [showSmartlead, setShowSmartlead] = useState(false);
  const [showLemlist, setShowLemlist] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/clients/${clientSlug}/api-keys`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smartlead: smartlead || null,
          lemlist: lemlist || null,
          lemlistEmail: lemlistEmail || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update API keys');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update API keys');
    } finally {
      setLoading(false);
    }
  };

  const hasSmartlead = !!initialApiKeys.smartlead;
  const hasLemlist = !!initialApiKeys.lemlist;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Smartlead API Key
          </label>
          <div className="relative">
            <input
              type={showSmartlead ? 'text' : 'password'}
              value={smartlead}
              onChange={(e) => setSmartlead(e.target.value)}
              placeholder={hasSmartlead ? maskApiKey(initialApiKeys.smartlead || '') : 'Enter Smartlead API key'}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
            />
            {hasSmartlead && (
              <button
                type="button"
                onClick={() => setShowSmartlead(!showSmartlead)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showSmartlead ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          {hasSmartlead && !showSmartlead && (
            <p className="mt-1 text-xs text-slate-500">
              Leave empty to remove. Enter new key to update.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Lemlist API Key
          </label>
          <div className="relative">
            <input
              type={showLemlist ? 'text' : 'password'}
              value={lemlist}
              onChange={(e) => setLemlist(e.target.value)}
              placeholder={hasLemlist ? maskApiKey(initialApiKeys.lemlist || '') : 'Enter Lemlist API key'}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
            />
            {hasLemlist && (
              <button
                type="button"
                onClick={() => setShowLemlist(!showLemlist)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showLemlist ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          {hasLemlist && !showLemlist && (
            <p className="mt-1 text-xs text-slate-500">
              Leave empty to remove. Enter new key to update.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Lemlist Email (optional)
          </label>
          <input
            type="email"
            value={lemlistEmail}
            onChange={(e) => setLemlistEmail(e.target.value)}
            placeholder="Enter email associated with Lemlist account"
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="px-4 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
          API keys updated successfully
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
      >
        {loading ? 'Saving...' : 'Save API Keys'}
      </button>
    </form>
  );
}

