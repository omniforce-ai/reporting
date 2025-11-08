'use client';

import { useEffect, useState } from 'react';
import { UserCircleIcon } from '@/components/icons';
import InviteUserForm from '@/components/admin/InviteUserForm';

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
      <div className="p-8 sm:p-12 lg:p-16">
        <div className="text-center text-slate-400">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-12 lg:p-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400">Manage user roles and permissions</p>
        </div>
        <InviteUserForm />
      </div>

      <div className="glass rounded-xl border-purple-500/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-purple-500/10 border-b border-purple-500/20">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/10">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-purple-500/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserCircleIcon className="w-5 h-5 text-purple-400" />
                    <span className="text-white">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300">{user.email}</td>
                <td className="px-6 py-4">
                  {editingUserId === user.id ? (
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'admin' | 'client')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="client">Client</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-600/20 text-purple-300'
                          : user.role === 'client'
                          ? 'bg-blue-600/20 text-blue-300'
                          : 'bg-slate-600/20 text-slate-400'
                      }`}
                    >
                      {user.role === 'admin' ? '👑 Admin' : user.role === 'client' ? '👤 Client' : '❓ Not Set'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingUserId === user.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(user.id)}
                        className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors"
                    >
                      Edit Role
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="glass rounded-xl border-purple-500/20 p-12 text-center">
          <UserCircleIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
          <p className="text-slate-400">Users will appear here once they sign up.</p>
        </div>
      )}
    </div>
  );
}

