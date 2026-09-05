import React, { useEffect, useState } from 'react';
import { useApp } from './AppContext';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function Leaderboard() {
  const { token } = useApp();
  const [tab, setTab] = useState('learners');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/leaderboard?type=${tab}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load leaderboard', err))
      .finally(() => setLoading(false));
  }, [tab, token]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Leaderboard</h1>
          <p className="desc">Monthly rankings by Capacity Credits earned.</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'learners' ? 'active' : ''}`} onClick={() => setTab('learners')}>Top Learners</button>
        <button className={`tab ${tab === 'trainers' ? 'active' : ''}`} onClick={() => setTab('trainers')}>Top Trainers</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 20 }}>Loading...</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 20 }} className="small muted">No rankings yet.</div>
        ) : (
          <table className="table">
            <thead><tr><th style={{ width: 60 }}>Rank</th><th>Name</th><th>Department</th><th>Credits</th><th>Achievements</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.rank} style={r.isYou ? { background: 'var(--teal-soft)' } : undefined}>
                  <td className={`rank-${r.rank}`} style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{r.badge || `#${r.rank}`}</td>
                  <td style={{ fontWeight: r.isYou ? 700 : 500 }}>{r.name}</td>
                  <td className="small muted">{r.dept}</td>
                  <td className="mono">{r.credits.toLocaleString()} CC</td>
                  <td>
                    <div className="flex gap-6">
                      {r.achievementIcons.map((icon, i) => <span key={i}>{icon}</span>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}