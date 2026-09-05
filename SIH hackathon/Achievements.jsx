import React, { useEffect, useState } from 'react';
import { useApp } from './AppContext';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function Achievements() {
  const { token } = useApp();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/achievements/mine`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAchievements(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load achievements', err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="page">Loading achievements...</div>;

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Achievements</h1>
          <p className="desc">{earnedCount} of {achievements.length} badges earned. Keep learning to unlock the rest.</p>
        </div>
      </div>

      <div className="grid grid-4">
        {achievements.map((a) => (
          <div key={a.id} className={`achv-badge ${a.earned ? '' : 'locked'}`}>
            <div className="ic" style={{ background: a.earned ? 'var(--teal-soft)' : 'var(--line-soft)' }}>{a.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.title}</div>
            <div className="small muted" style={{ marginTop: 4 }}>{a.desc}</div>
            {!a.earned && <div className="small" style={{ marginTop: 8, color: 'var(--muted)' }}>🔒 Locked</div>}
          </div>
        ))}
      </div>
    </div>
  );
}