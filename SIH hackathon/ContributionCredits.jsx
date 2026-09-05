import React, { useEffect, useState } from 'react';
import { useApp } from './AppContext';
import { LedgerRow, StatBox } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function ContributionCredits() {
  const { token } = useApp();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ perCourse: [], totalLearners: 0, avgCompletion: 0, avgRating: '0.0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/wallet/mine`, { headers: { 'Authorization': `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/trainer-stats/courses`, { headers: { 'Authorization': `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([wallet, courseStats]) => {
        setBalance(wallet.balance || 0);
        setTransactions(wallet.transactions || []);
        setStats(courseStats);
      })
      .catch((err) => console.error('Failed to load contribution credits', err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Contribution Credits</h1>
          <p className="desc">Credits earned from approved courses, learner completions, and engagement.</p>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <StatBox num={stats.totalLearners.toLocaleString()} label="Learners reached" />
        <StatBox num={`${stats.avgCompletion}%`} label="Avg. completion rate" />
        <StatBox num={stats.avgRating} label="Avg. course rating" trend="⭐ across all courses" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1.4fr', alignItems: 'start' }}>
        <div className="ledger">
          <div className="ledger-head">
            <div className="label">Contribution Credits Passbook</div>
            <div className="balance">{balance.toLocaleString()} CC</div>
          </div>
          {transactions.length === 0 ? (
            <div className="small muted" style={{ padding: '12px 0' }}>No transactions yet.</div>
          ) : (
            transactions.map((t) => (
              <LedgerRow key={t._id} icon={t.icon} title={t.label} date={new Date(t.date || t.createdAt).toLocaleDateString()} amount={t.amount} />
            ))
          )}
        </div>

        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>How you earn Contribution Credits</h3>
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li className="small"><strong>+150 CC</strong> when a submitted course is approved by Admin.</li>
            <li className="small"><strong>+20 CC</strong> per learner who completes your course.</li>
            <li className="small"><strong>+80 CC</strong> bonus for maintaining a 4.5★+ average rating.</li>
          </ul>
          <div className="divider" />
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Course Engagement</h3>
          {stats.perCourse.length === 0 ? (
            <div className="small muted">No courses yet.</div>
          ) : (
            stats.perCourse.map((c) => (
              <div key={c.title} className="flex justify-between small" style={{ padding: '8px 0', borderBottom: '1px dashed var(--line)' }}>
                <span>{c.title}</span>
                <span className="mono muted">{c.learners.toLocaleString()} learners · {c.completionPct}% complete</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}