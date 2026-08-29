import React from 'react';
import { useApp } from './AppContext';
import { trainerCreditTxns, trainerAnalytics } from './mockData';
import { LedgerRow, StatBox } from './common';

export default function ContributionCredits() {
  const { trainerBalance } = useApp();
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Contribution Credits</h1>
          <p className="desc">Credits earned from approved courses, learner completions, and engagement.</p>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <StatBox num={trainerAnalytics.perCourse.reduce((n, c) => n + c.learners, 0).toLocaleString()} label="Learners reached" />
        <StatBox num={`${Math.round(trainerAnalytics.perCourse.reduce((n, c) => n + c.completionPct, 0) / trainerAnalytics.perCourse.length)}%`} label="Avg. completion rate" />
        <StatBox num={trainerAnalytics.avgRating} label="Avg. course rating" trend="⭐ across all courses" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1.4fr', alignItems: 'start' }}>
        <div className="ledger">
          <div className="ledger-head">
            <div className="label">Contribution Credits Passbook</div>
            <div className="balance">{trainerBalance.toLocaleString()} CC</div>
          </div>
          {trainerCreditTxns.map((t) => (
            <LedgerRow key={t.id} icon={t.icon} title={t.label} date={t.date} amount={t.amount} />
          ))}
        </div>

        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>How you earn Contribution Credits</h3>
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li className="small"><strong>+150 CC</strong> when a submitted course is approved by Admin.</li>
            <li className="small"><strong>+5 CC</strong> per learner who completes your course.</li>
            <li className="small"><strong>+80 CC</strong> bonus for maintaining a 4.5★+ average rating.</li>
            <li className="small"><strong>+20 CC</strong> for every 100 views your course content receives.</li>
          </ul>
          <div className="divider" />
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Course Engagement</h3>
          {trainerAnalytics.perCourse.map((c) => (
            <div key={c.title} className="flex justify-between small" style={{ padding: '8px 0', borderBottom: '1px dashed var(--line)' }}>
              <span>{c.title}</span>
              <span className="mono muted">{c.learners.toLocaleString()} learners · {c.completionPct}% complete</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
