import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from './AppContext';
import { StatusBadge, Stars, Modal, EmptyState } from './common';

const TRAINER_NAME = 'Dr. Anika Rao';

export default function MyCourses() {
  const { courses, deleteCourse, submitForApproval } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filter, setFilter] = useState('All');
  const nav = useNavigate();

  const mine = courses.filter((c) => c.trainer === TRAINER_NAME);
  const filtered = filter === 'All' ? mine : mine.filter((c) => c.status === filter);
  const counts = ['All', 'Draft', 'Pending Approval', 'Approved', 'Rejected'].map((s) => ({
    label: s, n: s === 'All' ? mine.length : mine.filter((c) => c.status === s).length,
  }));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>My Courses</h1>
          <p className="desc">Create, edit and track the approval status of the courses you teach.</p>
        </div>
        <Link to="/trainer/create" className="btn btn-accent">➕ Create New Course</Link>
      </div>

      <div className="tabs">
        {counts.map((c) => (
          <button key={c.label} className={`tab ${filter === c.label ? 'active' : ''}`} onClick={() => setFilter(c.label)}>
            {c.label} <span className="mono muted small">({c.n})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState icon="📚" title="No courses here yet" desc="Start building a new course to fill this space." action={<Link to="/trainer/create" className="btn btn-accent">Create a Course</Link>} />
      )}

      <div className="grid grid-3">
        {filtered.map((c) => (
          <div key={c.id} className="card course-card">
            <div className="course-thumb" style={{ background: 'linear-gradient(135deg, var(--navy), var(--teal))' }}>
              <span className="cat-tag">{c.category}</span>
            </div>
            <div className="body">
              <div className="flex justify-between items-center">
                <StatusBadge status={c.status} />
                {c.submittedOn && <span className="small muted mono">Sub. {c.submittedOn}</span>}
              </div>
              <h3>{c.title}</h3>
              <div className="course-meta"><span>⏱ {c.duration}</span><span>📶 {c.difficulty}</span></div>
              {c.status === 'Rejected' && c.rejectionReason && (
                <div className="small" style={{ background: 'var(--coral-soft)', color: 'var(--coral)', padding: '8px 10px', borderRadius: 6 }}>
                  <strong>Rejected:</strong> {c.rejectionReason}
                </div>
              )}
              <div className="course-stats">
                <Stars rating={c.rating} />
                <span>{c.learners.toLocaleString()} learners</span>
              </div>
              <div className="flex gap-8" style={{ marginTop: 4 }}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => nav(`/trainer/create?edit=${c.id}`)}>Edit</button>
                {c.status === 'Draft' && (
                  <button className="btn btn-accent btn-sm" style={{ flex: 1 }} onClick={() => submitForApproval(c.id)}>Submit</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(c)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <Modal title="Delete course?" onClose={() => setConfirmDelete(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => { deleteCourse(confirmDelete.id); setConfirmDelete(null); }}>Delete Permanently</button>
          </>}>
          <p>This will permanently remove <strong>{confirmDelete.title}</strong> and all its modules, videos and quiz data. This cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
}
