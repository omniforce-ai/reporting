'use client';

import { useEffect, useState } from 'react';
import { UserCircleIcon } from '@/components/icons';
import InviteUserForm from '@/components/admin/InviteUserForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'client'>('client');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'client') => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchUsers();
        setEditingUserId(null);
      } else {
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setNewRole((user.role === 'admin' || user.role === 'client') ? user.role : 'client');
  };

  const handleSave = (userId: string) => {
    updateUserRole(userId, newRole);
  };

  const handleCancel = () => {
    setEditingUserId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="text-center text-muted-foreground">Loading users...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-3xl font-semibold">User Management</h1>
              <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
            </div>
            <InviteUserForm />
          </div>

          {/* Table */}
          <div className="px-4 lg:px-6">
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UserCircleIcon className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No users found</p>
                          <p className="text-xs text-muted-foreground">Users will appear here once they sign up.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <UserCircleIcon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <Select
                              value={newRole}
                              onValueChange={(value) => setNewRole(value as 'admin' | 'client')}
                            >
                              <SelectTrigger className="h-8 w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="client">Client</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant="outline"
                              className={
                                user.role === 'admin'
                                  ? 'bg-primary/10 text-primary'
                                  : user.role === 'client'
                                  ? 'bg-secondary/50 text-secondary-foreground'
                                  : ''
                              }
                            >
                              {user.role === 'admin' ? 'Admin' : user.role === 'client' ? 'Client' : 'Not Set'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSave(user.id)}
                                size="sm"
                                variant="default"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={handleCancel}
                                size="sm"
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleEdit(user)}
                              size="sm"
                              variant="outline"
                            >
                              Edit Role
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

