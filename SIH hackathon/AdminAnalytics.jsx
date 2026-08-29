import React from 'react';
import { adminAnalytics, topTrainers, topLearners } from './mockData';
import { StatBox } from './common';

export default function AdminAnalytics() {
  const a = adminAnalytics;
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Platform Analytics</h1>
          <p className="desc">A live view of adoption, content pipeline health, and credit economy across Capacity Connect.</p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatBox num={a.totalTrainees.toLocaleString()} label="Total trainees" />
        <StatBox num={a.totalTrainers} label="Total trainers" />
        <StatBox num={a.totalCourses} label="Total courses" />
        <StatBox num={a.pendingCourses} label="Pending courses" trend="Awaiting review" />
      </div>
      <div className="grid grid-3" style={{ marginBottom: 22 }}>
        <StatBox num={`${a.completionRate}%`} label="Course completion rate" />
        <StatBox num={a.creditsDistributed.toLocaleString()} label="Credits distributed" />
        <StatBox num={a.creditsRedeemed.toLocaleString()} label="Credits redeemed" />
      </div>

      <div className="grid grid-3" style={{ alignItems: 'start' }}>
        <div className="card card-pad" style={{ gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Most Popular Courses</h3>
          {a.mostPopular.map((c, i) => (
            <div key={c.title} className="flex justify-between small" style={{ padding: '9px 0', borderBottom: '1px dashed var(--line)' }}>
              <span><span className="mono muted">{String(i + 1).padStart(2, '0')}</span> &nbsp;{c.title}</span>
              <span className="mono muted">{c.learners.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Top Trainers</h3>
          {topTrainers.map((t) => (
            <div key={t.rank} className="flex justify-between small items-center" style={{ padding: '9px 0', borderBottom: '1px dashed var(--line)' }}>
              <span className={`rank-${t.rank}`}>{t.badge || `#${t.rank}`} &nbsp;{t.name}</span>
              <span className="mono muted">{t.credits.toLocaleString()} CC</span>
            </div>
          ))}
        </div>
        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Top Learners</h3>
          {topLearners.map((t) => (
            <div key={t.rank} className="flex justify-between small items-center" style={{ padding: '9px 0', borderBottom: '1px dashed var(--line)' }}>
              <span className={`rank-${t.rank}`}>{t.badge || `#${t.rank}`} &nbsp;{t.name}</span>
              <span className="mono muted">{t.credits.toLocaleString()} CC</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
