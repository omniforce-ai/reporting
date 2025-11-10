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
          {hasSmartlead && !showSmartlead && (
            <p className="text-xs text-muted-foreground">
              Leave empty to remove. Enter new key to update.
            </p>
          )}
        </div>

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
          {hasLemlist && !showLemlist && (
            <p className="text-xs text-muted-foreground">
              Leave empty to remove. Enter new key to update.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lemlistEmail">Lemlist Email (optional)</Label>
          <Input
            id="lemlistEmail"
            type="email"
            value={lemlistEmail}
            onChange={(e) => setLemlistEmail(e.target.value)}
            placeholder="Enter email associated with Lemlist account"
          />
        </div>
      </div>

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
        {loading ? 'Saving...' : 'Save API Keys'}
      </Button>
    </form>
  );
}

