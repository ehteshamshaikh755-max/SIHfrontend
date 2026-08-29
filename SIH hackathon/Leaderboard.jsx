import React, { useState } from 'react';
import { topLearners, topTrainers, achievements } from './mockData';

export default function Leaderboard() {
  const [tab, setTab] = useState('learners');
  const rows = tab === 'learners' ? topLearners : topTrainers;

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
                    {achievements.filter((a) => a.earned).slice(0, r.rank <= 3 ? 4 : 2).map((a) => <span key={a.id} title={a.title}>{a.icon}</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
