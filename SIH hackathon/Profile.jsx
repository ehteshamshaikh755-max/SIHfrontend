import React, { useState } from 'react';
import { useApp } from './AppContext';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function Profile() {
  const { user, token, updateUser } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [dept, setDept] = useState(user?.dept || '');
  const [qualifications, setQualifications] = useState(user?.qualifications || '');
  const [workExperience, setWorkExperience] = useState(user?.workExperience || '');
  const [interests, setInterests] = useState(user?.interests || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const body = { name, dept, qualifications, workExperience, interests };
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
          <p className="desc">Manage your professional profile, account details, and password.</p>
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

      <div className="card card-pad" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Professional Profile</h3>
        <p className="small muted" style={{ marginBottom: 14 }}>
          This information helps build your professional profile within Capacity Connect.
        </p>

        <label className="small muted" style={{ display: 'block', marginBottom: 4 }}>Qualifications</label>
        <textarea
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
          placeholder="e.g. B.Tech in Computer Science, M.Sc in Data Analytics"
          style={{ width: '100%', minHeight: 60, marginBottom: 14 }}
        />

        <label className="small muted" style={{ display: 'block', marginBottom: 4 }}>Work Experience</label>
        <textarea
          value={workExperience}
          onChange={(e) => setWorkExperience(e.target.value)}
          placeholder="e.g. 5 years as a Data Analyst at Dept. of Revenue"
          style={{ width: '100%', minHeight: 60, marginBottom: 14 }}
        />

        <label className="small muted" style={{ display: 'block', marginBottom: 4 }}>Interests</label>
        <textarea
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="e.g. Cybersecurity, Public Policy, Data Visualization"
          style={{ width: '100%', minHeight: 60 }}
        />
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