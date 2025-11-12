'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ApiKeysFormProps = {
  clientSlug: string;
  initialApiKeys: {
    smartlead?: string;
    lemlist?: string;
    lemlistEmail?: string;
  };
  platform: 'smartlead' | 'lemlist';
};

function maskApiKey(key: string): string {
  if (!key || key.length <= 4) return '••••';
  return '••••' + key.slice(-4);
}

export default function ApiKeysForm({ clientSlug, initialApiKeys, platform }: ApiKeysFormProps) {
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
      const payload: any = {};
      
      if (platform === 'smartlead') {
        payload.smartlead = smartlead || null;
      } else if (platform === 'lemlist') {
        payload.lemlist = lemlist || null;
        payload.lemlistEmail = lemlistEmail || null;
      }

      const response = await fetch(`/api/admin/clients/${clientSlug}/api-keys`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
      <div className="flex-1 space-y-4 min-h-0">
      {platform === 'smartlead' && (
        <div className="space-y-2">
          <Label htmlFor="smartlead">Smartlead API Key</Label>
          <div className="relative">
            <Input
              id="smartlead"
              type={showSmartlead ? 'text' : 'password'}
              value={smartlead}
              onChange={(e) => setSmartlead(e.target.value)}
              placeholder={hasSmartlead ? maskApiKey(initialApiKeys.smartlead || '') : 'Enter Smartlead API key'}
              className="pr-10"
            />
            {hasSmartlead && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowSmartlead(!showSmartlead)}
              >
                {showSmartlead ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {platform === 'lemlist' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="lemlist">Lemlist API Key</Label>
            <div className="relative">
              <Input
                id="lemlist"
                type={showLemlist ? 'text' : 'password'}
                value={lemlist}
                onChange={(e) => setLemlist(e.target.value)}
                placeholder={hasLemlist ? maskApiKey(initialApiKeys.lemlist || '') : 'Enter Lemlist API key'}
                className="pr-10"
              />
              {hasLemlist && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowLemlist(!showLemlist)}
                >
                  {showLemlist ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lemlistEmail">Lemlist Email</Label>
            <Input
              id="lemlistEmail"
              type="email"
              value={lemlistEmail}
              onChange={(e) => setLemlistEmail(e.target.value)}
              placeholder="Enter email associated with Lemlist account"
            />
          </div>
        </>
      )}
      </div>

      <div className="mt-auto pt-4 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-chart-4/10 border-chart-4/20">
            <AlertDescription className="text-chart-4">
              API keys updated successfully
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

