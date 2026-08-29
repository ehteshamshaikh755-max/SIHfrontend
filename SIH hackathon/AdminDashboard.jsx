import React, { useState } from 'react';
import { useApp } from './AppContext';
import { StatusBadge, Modal, EmptyState } from './common';

export default function AdminDashboard() {
  const { courses, approveCourse, rejectCourse } = useApp();
  const [reviewing, setReviewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [filter, setFilter] = useState('Pending Approval');

  const filtered = filter === 'All' ? courses : courses.filter((c) => c.status === filter);
  const pendingCount = courses.filter((c) => c.status === 'Pending Approval').length;

  const doApprove = (c) => { approveCourse(c.id); setReviewing(null); };
  const doReject = () => { rejectCourse(rejecting.id, reason || 'Does not meet content quality guidelines.'); setRejecting(null); setReviewing(null); setReason(''); };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Course Approval Dashboard</h1>
          <p className="desc">{pendingCount} course{pendingCount === 1 ? '' : 's'} waiting for review.</p>
        </div>
      </div>

      <div className="tabs">
        {['Pending Approval', 'Approved', 'Rejected', 'Draft', 'All'].map((s) => (
          <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s} <span className="mono muted small">({s === 'All' ? courses.length : courses.filter((c) => c.status === s).length})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && <EmptyState icon="🛡️" title="Nothing to review" desc="Courses matching this filter will appear here." />}

      <div className="card">
        <table className="table">
          <thead><tr><th>Course</th><th>Trainer</th><th>Category</th><th>Submitted</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, maxWidth: 280 }}>{c.title}</td>
                <td>{c.trainer}</td>
                <td>{c.category}</td>
                <td className="mono small">{c.submittedOn || '—'}</td>
                <td><StatusBadge status={c.status} /></td>
                <td><button className="btn btn-outline btn-sm" onClick={() => setReviewing(c)}>Review</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reviewing && (
        <Modal title="Course Review" onClose={() => setReviewing(null)} wide
          footer={reviewing.status === 'Pending Approval' ? <>
            <button className="btn btn-danger" onClick={() => setRejecting(reviewing)}>Reject</button>
            <button className="btn btn-accent" onClick={() => doApprove(reviewing)}>Approve Course</button>
          </> : <button className="btn btn-outline" onClick={() => setReviewing(null)}>Close</button>}>
          <div className="flex justify-between items-start">
            <div>
              <h2 style={{ fontSize: 19 }}>{reviewing.title}</h2>
              <p className="small muted" style={{ marginTop: 4 }}>By {reviewing.trainer} · Submitted {reviewing.submittedOn || '—'}</p>
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
          {reviewing.modules.map((m) => (
            <div key={m.id} style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{m.title}</div>
              {m.lessons.map((l) => <div key={l.id} className="small muted" style={{ paddingLeft: 14 }}>{l.type === 'quiz' ? '📝' : '🎬'} {l.title} · {l.duration}</div>)}
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
            <button className="btn btn-ghost" onClick={() => setRejecting(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={doReject}>Confirm Rejection</button>
          </>}>
          <p className="small muted" style={{ marginBottom: 10 }}>Explain what the trainer needs to fix before resubmitting "{rejecting.title}".</p>
          <textarea placeholder="e.g. Audio quality in Module 2 needs improvement…" value={reason} onChange={(e) => setReason(e.target.value)} />
        </Modal>
      )}
    </div>
  );
}
