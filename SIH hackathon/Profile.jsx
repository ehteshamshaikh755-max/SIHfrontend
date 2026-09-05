import React, { useState } from 'react';
import { useApp } from './AppContext';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function Profile() {
  const { user, token, updateUser } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [dept, setDept] = useState(user?.dept || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const body = { name, dept };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      updateUser(data.user);
      setCurrentPassword('');
      setNewPassword('');
      setMessage('✅ Profile updated successfully.');
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Profile & Settings</h1>
          <p className="desc">Manage your account details and password.</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Account Details</h3>

          <label className="small muted" style={{ display: 'block', marginBottom: 4 }}>Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginBottom: 14 }} />

          <label className="small muted" style={{ display: 'block', marginBottom: 4 }}>Email</label>
          <input type="text" value={user?.email || ''} disabled style={{ width: '100%', marginBottom: 14, opacity: 0.6 }} />

          <label className="small muted" style={{ display: 'block', marginBottom: 4 }}>Department</label>
          <input type="text" value={dept} onChange={(e) => setDept(e.target.value)} placeholder="e.g. Dept. of IT & e-Gov" style={{ width: '100%', marginBottom: 14 }} />

          <label className="small muted" style={{ display: 'block', marginBottom: 4 }}>Role</label>
          <input type="text" value={user?.role || ''} disabled style={{ width: '100%', textTransform: 'capitalize', opacity: 0.6 }} />
        </div>

        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Change Password</h3>

          <label className="small muted" style={{ display: 'block', marginBottom: 4 }}>Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required only if setting a new password" style={{ width: '100%', marginBottom: 14 }} />

          <label className="small muted" style={{ display: 'block', marginBottom: 4 }}>New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current password" style={{ width: '100%' }} />
        </div>
      </div>

      <div className="flex justify-between items-center" style={{ marginTop: 20 }}>
        <span className="small muted">{message}</span>
        <button className="btn btn-accent" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}