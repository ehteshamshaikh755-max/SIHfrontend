import React from 'react';
import { achievements } from './mockData';

export default function Achievements() {
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
