'use client';

import { useState, useEffect } from 'react';
import { UsersIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CopyIcon, CheckIcon } from 'lucide-react';

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

  const handleClose = () => {
    setIsOpen(false);
    setEmail('');
    setRole('client');
    setClientSlug('');
    setInviteUrl(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UsersIcon className="w-4 h-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to a new user. They will receive an email with a link to sign up.
          </DialogDescription>
        </DialogHeader>

        {inviteUrl ? (
          <div className="space-y-4">
            <Alert className="bg-chart-4/10 border-chart-4/20">
              <CheckIcon className="h-4 w-4 text-chart-4" />
              <AlertDescription>
                <div className="font-semibold mb-2 text-chart-4">Invitation Sent!</div>
                <p className="text-sm text-chart-4">
                  An invitation email has been sent to <strong>{email}</strong> with role: <strong>{role}</strong>
                  {role === 'client' && clientSlug && (
                    <> for client: <strong>{clients.find(c => c.subdomain === clientSlug)?.name || clientSlug}</strong></>
                  )}
                </p>
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="inviteUrl">Invite Link (share this if needed):</Label>
              <div className="flex gap-2">
                <Input
                  id="inviteUrl"
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyInviteLink}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value as 'admin' | 'client');
                  if (value === 'admin') {
                    setClientSlug('');
                  }
                }}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {role === 'admin' 
                  ? 'Admins can access the admin dashboard and manage clients/users'
                  : 'Clients can only view their own analytics dashboard'}
              </p>
            </div>

            {role === 'client' && (
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={clientSlug}
                  onValueChange={setClientSlug}
                  required={role === 'client'}
                >
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.subdomain}>
                        {client.name} ({client.subdomain})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select which client this user will have access to
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

