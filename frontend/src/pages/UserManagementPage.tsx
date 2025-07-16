import React, { useEffect, useState } from 'react';
import type { User } from '../types';

const UserManagementPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [unverifiedUsers, setUnverifiedUsers] = useState<any[]>([]);
  const [loadingUnverified, setLoadingUnverified] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'viewer', isVerified: false });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('fintechUser');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin' && currentUser.token) {
      setLoadingUnverified(true);
      fetch('/api/users/unverified', {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
        .then(res => res.json())
        .then(data => {
          setUnverifiedUsers(data);
          setLoadingUnverified(false);
        })
        .catch(() => setLoadingUnverified(false));
      setLoadingUsers(true);
      fetch('/api/users', {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
        .then(res => res.json())
        .then(data => {
          setAllUsers(data);
          setLoadingUsers(false);
        })
        .catch(() => setLoadingUsers(false));
    }
  }, [currentUser]);

  const handleVerifyUser = async (userId: string) => {
    if (!currentUser?.token) return;
    if (window.confirm('Are you sure you want to verify this user?')) {
      try {
        await fetch(`/api/users/${userId}/verify`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        setUnverifiedUsers(users => users.filter(u => u._id !== userId));
        setNotification({ type: 'success', message: 'User verified and notified by email.' });
      } catch {
        setNotification({ type: 'error', message: 'Failed to verify user.' });
      }
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name, role: user.role, isVerified: user.isVerified });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditFormCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.checked });
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !currentUser?.token) return;
    try {
      await fetch(`/api/users/${editingUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify(editForm),
      });
      setEditingUser(null);
      setLoadingUsers(true);
      fetch('/api/users', {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
        .then(res => res.json())
        .then(data => {
          setAllUsers(data);
          setLoadingUsers(false);
          setNotification({ type: 'success', message: 'User updated.' });
        })
        .catch(() => {
          setLoadingUsers(false);
          setNotification({ type: 'error', message: 'Failed to update user.' });
        });
    } catch {
      setNotification({ type: 'error', message: 'Failed to update user.' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentUser?.token) return;
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        setAllUsers(users => users.filter(u => u._id !== userId));
        setNotification({ type: 'success', message: 'User deleted.' });
      } catch {
        setNotification({ type: 'error', message: 'Failed to delete user.' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-1 px-4 sm:px-8 lg:px-16 py-10 space-y-10">
        <h1 className="text-2xl font-bold mb-4 text-black">User Management</h1>
        {/* Unverified Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 w-full">
          <h3 className="text-lg font-semibold mb-4 text-black">Unverified Users</h3>
          {loadingUnverified ? (
            <p>Loading...</p>
          ) : unverifiedUsers.length === 0 ? (
            <p>No unverified users.</p>
          ) : (
            <ul className="space-y-2">
              {unverifiedUsers.map(user => (
                <li key={user._id} className="flex items-center justify-between border-b pb-2">
                  <span className="text-black">
                    {user.email} ({user.role})
                  </span>
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => handleVerifyUser(user._id)}
                  >
                    Verify
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* All Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 w-full">
          <h3 className="text-lg font-semibold mb-4 text-black">All Users</h3>
          {loadingUsers ? (
            <p>Loading...</p>
          ) : allUsers.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <ul className="space-y-2">
              {notification && (
                <div className={`mb-4 p-3 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{notification.message}</div>
              )}
              <div className="mb-4">
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Search users by email or name..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
              {allUsers.filter(user =>
                user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase()))
              ).map(user => (
                <li key={user._id} className="flex items-center justify-between border-b pb-2">
                  <span className={user.isVerified ? 'text-black' : 'text-gray-500'}>
                    {user.email} ({user.role}) {user.isVerified ? <span className="text-green-600">✔️</span> : <span className="text-red-600">❌</span>}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {/* Edit Modal ... unchanged ... */}
        </div>
      </main>
    </div>
  );
};

export default UserManagementPage; 