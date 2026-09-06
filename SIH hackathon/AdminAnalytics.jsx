import React, { useEffect, useState } from 'react';
import { useApp } from './AppContext';
import { StatBox } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function AdminAnalytics() {
  const { token } = useApp();
  const [a, setA] = useState(null);
  const [loading, setLoading] = useState(true);

  const [subjectQuery, setSubjectQuery] = useState('');
  const [matchedTrainers, setMatchedTrainers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setA(data))
      .catch((err) => console.error('Failed to load admin analytics', err))
      .finally(() => setLoading(false));
  }, [token]);

  async function findTrainers() {
    setSearching(true);
    setSearched(true);
    try {
      const res = await fetch(`${API_URL}/auth/trainers/by-subject?subject=${encodeURIComponent(subjectQuery)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMatchedTrainers(Array.isArray(data) ? data : []);
    } catch {
      setMatchedTrainers([]);
    } finally {
      setSearching(false);
    }
  }

  if (loading) return <div className="page">Loading analytics...</div>;
  if (!a) return <div className="page">Failed to load analytics.</div>;

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
          {a.mostPopular.length === 0 ? (
            <div className="small muted">No courses yet.</div>
          ) : (
            a.mostPopular.map((c, i) => (
              <div key={c.title} className="flex justify-between small" style={{ padding: '9px 0', borderBottom: '1px dashed var(--line)' }}>
                <span><span className="mono muted">{String(i + 1).padStart(2, '0')}</span> &nbsp;{c.title}</span>
                <span className="mono muted">{c.learners.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Top Trainers</h3>
          {a.topTrainers.length === 0 ? (
            <div className="small muted">No trainers yet.</div>
          ) : (
            a.topTrainers.map((t) => (
              <div key={t.rank} className="flex justify-between small items-center" style={{ padding: '9px 0', borderBottom: '1px dashed var(--line)' }}>
                <span className={`rank-${t.rank}`}>{t.badge || `#${t.rank}`} &nbsp;{t.name}</span>
                <span className="mono muted">{t.credits.toLocaleString()} CC</span>
              </div>
            ))
          )}
        </div>
        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Top Learners</h3>
          {a.topLearners.length === 0 ? (
            <div className="small muted">No learners yet.</div>
          ) : (
            a.topLearners.map((t) => (
              <div key={t.rank} className="flex justify-between small items-center" style={{ padding: '9px 0', borderBottom: '1px dashed var(--line)' }}>
                <span className={`rank-${t.rank}`}>{t.badge || `#${t.rank}`} &nbsp;{t.name}</span>
                <span className="mono muted">{t.credits.toLocaleString()} CC</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 6 }}>Find Trainers by Subject</h3>
        <p className="small muted" style={{ marginBottom: 12 }}>
          Search trainer competencies to identify who's suited to teach a given subject.
        </p>
        <div className="flex gap-8" style={{ marginBottom: 14 }}>
          <input
            type="text"
            placeholder="e.g. Cybersecurity"
            value={subjectQuery}
            onChange={(e) => setSubjectQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-accent btn-sm" onClick={findTrainers} disabled={searching}>
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>

        {searched && !searching && matchedTrainers.length === 0 && (
          <p className="small muted">No trainers found with that competency.</p>
        )}

        {matchedTrainers.map((t) => (
          <div key={t._id} className="flex justify-between items-center" style={{ padding: '9px 0', borderBottom: '1px dashed var(--line)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.name}</div>
              <div className="small muted">{t.email}{t.dept ? ` · ${t.dept}` : ''}</div>
              <div className="flex gap-6 wrap" style={{ marginTop: 4 }}>
                {(t.trainerCompetencies || []).map((c, i) => (
                  <span key={i} className="pill" style={{ fontSize: 11 }}>{c.subject} — {c.level}</span>
                ))}
              </div>
            </div>
            <span className="mono muted small">{t.contributionCredits} CC</span>
          </div>
        ))}
      </div>
    </div>
  );
}