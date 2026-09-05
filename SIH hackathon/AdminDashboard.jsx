import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from './AppContext';
import { StatusBadge, Modal, EmptyState } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function AdminDashboard() {
  const { token } = useApp();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviewing, setReviewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [filter, setFilter] = useState('Pending Approval');
  const [actionLoading, setActionLoading] = useState(false);

  // ---- Announcement composer ----
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annLoading, setAnnLoading] = useState(false);
  const [annMessage, setAnnMessage] = useState('');

  async function postAnnouncement() {
    if (!annTitle.trim() || !annBody.trim()) {
      setAnnMessage('Please fill in both title and message.');
      return;
    }
    setAnnLoading(true);
    setAnnMessage('');
    try {
      const res = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: annTitle, body: annBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post announcement');
      setAnnTitle('');
      setAnnBody('');
      setAnnMessage('✅ Announcement posted — it will now show on the trainee homepage.');
    } catch (err) {
      setAnnMessage(`❌ ${err.message}`);
    } finally {
      setAnnLoading(false);
    }
  }

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/courses/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load courses');
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const filtered = filter === 'All' || filter === 'Pending Approval'
    ? courses
    : courses.filter((c) => c.status === filter);
  const pendingCount = courses.filter((c) => c.status === 'Pending Approval').length;

  async function doApprove(c) {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/courses/${c._id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to approve');
      }
      setReviewing(null);
      await fetchCourses();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function doReject() {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/courses/${rejecting._id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason: reason || 'Does not meet content quality guidelines.' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reject');
      }
      setRejecting(null);
      setReviewing(null);
      setReason('');
      await fetchCourses();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Course Approval Dashboard</h1>
          <p className="desc">{pendingCount} course{pendingCount === 1 ? '' : 's'} waiting for review.</p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Post an Announcement</h3>
        <input
          type="text"
          placeholder="Title (e.g. New Cybersecurity course now live)"
          value={annTitle}
          onChange={(e) => setAnnTitle(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <textarea
          placeholder="Message shown to all trainees on the homepage…"
          value={annBody}
          onChange={(e) => setAnnBody(e.target.value)}
          style={{ width: '100%', minHeight: 70 }}
        />
        <div className="flex justify-between items-center" style={{ marginTop: 10 }}>
          <span className="small muted">{annMessage}</span>
          <button className="btn btn-accent" onClick={postAnnouncement} disabled={annLoading}>
            {annLoading ? 'Posting…' : 'Post Announcement'}
          </button>
        </div>
      </div>

      <div className="tabs">
        {['Pending Approval', 'Approved', 'Rejected', 'Draft', 'All'].map((s) => (
          <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>

      {loading && <p className="small muted">Loading courses…</p>}
      {error && <p className="small" style={{ color: 'var(--coral)' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState icon="🛡️" title="Nothing to review" desc="Courses matching this filter will appear here." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="card">
          <table className="table">
            <thead><tr><th>Course</th><th>Trainer</th><th>Category</th><th>Submitted</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600, maxWidth: 280 }}>{c.title}</td>
                  <td>{c.trainer?.name || '—'}</td>
                  <td>{c.category}</td>
                  <td className="mono small">{c.submittedOn ? new Date(c.submittedOn).toLocaleDateString() : '—'}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => setReviewing(c)}>Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewing && (
        <Modal title="Course Review" onClose={() => setReviewing(null)} wide
          footer={reviewing.status === 'Pending Approval' ? <>
            <button className="btn btn-danger" disabled={actionLoading} onClick={() => setRejecting(reviewing)}>Reject</button>
            <button className="btn btn-accent" disabled={actionLoading} onClick={() => doApprove(reviewing)}>
              {actionLoading ? 'Approving…' : 'Approve Course'}
            </button>
          </> : <button className="btn btn-outline" onClick={() => setReviewing(null)}>Close</button>}>
          <div className="flex justify-between items-start">
            <div>
              <h2 style={{ fontSize: 19 }}>{reviewing.title}</h2>
              <p className="small muted" style={{ marginTop: 4 }}>
                By {reviewing.trainer?.name || '—'} · Submitted {reviewing.submittedOn ? new Date(reviewing.submittedOn).toLocaleDateString() : '—'}
              </p>
            </div>
            <StatusBadge status={reviewing.status} />
          </div>
          <p className="small" style={{ marginTop: 12 }}>{reviewing.description}</p>

          <div className="flex gap-16 wrap" style={{ marginTop: 12 }}>
            <span className="pill">{reviewing.category}</span>
            <span className="pill">{reviewing.difficulty}</span>
            <span className="pill">⏱ {reviewing.duration}</span>
          </div>

          <div className="divider" />
          <h3 style={{ fontSize: 14 }}>Video Preview</h3>
          <div className="video-player" style={{ margin: '10px 0' }}>
            <div className="play-btn">▶</div>
            <div className="video-scrub"><div className="fill" /></div>
          </div>

          <h3 style={{ fontSize: 14, marginTop: 14 }}>Modules</h3>
          {(reviewing.modules || []).map((m) => (
            <div key={m._id} style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{m.title}</div>
              {m.lessons.map((l) => (
                <div key={l._id} className="small muted" style={{ paddingLeft: 14 }}>
                  {l.type === 'quiz' ? '📝' : '🎬'} {l.title} · {l.duration}
                </div>
              ))}
            </div>
          ))}

          {reviewing.rejectionReason && (
            <div className="small" style={{ background: 'var(--coral-soft)', color: 'var(--coral)', padding: '10px 12px', borderRadius: 6, marginTop: 14 }}>
              <strong>Previous rejection reason:</strong> {reviewing.rejectionReason}
            </div>
          )}
        </Modal>
      )}

      {rejecting && (
        <Modal title="Reject Course" onClose={() => setRejecting(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setRejecting(null)} disabled={actionLoading}>Cancel</button>
            <button className="btn btn-danger" onClick={doReject} disabled={actionLoading}>
              {actionLoading ? 'Rejecting…' : 'Confirm Rejection'}
            </button>
          </>}>
          <p className="small muted" style={{ marginBottom: 10 }}>Explain what the trainer needs to fix before resubmitting "{rejecting.title}".</p>
          <textarea placeholder="e.g. Audio quality in Module 2 needs improvement…" value={reason} onChange={(e) => setReason(e.target.value)} />
        </Modal>
      )}
    </div>
  );
}