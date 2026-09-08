import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from './AppContext';
import { StatusBadge, Stars, Modal, EmptyState } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function MyCourses() {
  const { token } = useApp();
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filter, setFilter] = useState('All');
  const [doubtCounts, setDoubtCounts] = useState({});
  const nav = useNavigate();

  const fetchMine = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/courses/mine/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load your courses');
      setMine(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMine(); }, [fetchMine]);
const fetchDoubtCounts = useCallback(async () => {
  try {
    const res = await fetch(`${API_URL}/comments/trainer/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      const map = {};
      data.forEach((d) => { map[d._id] = d.count; });
      setDoubtCounts(map);
    }
  } catch (err) {
    console.error(err);
  }
}, [token]);

useEffect(() => { fetchDoubtCounts(); }, [fetchDoubtCounts]);

  const filtered = filter === 'All' ? mine : mine.filter((c) => c.status === filter);
  const counts = ['All', 'Draft', 'Pending Approval', 'Approved', 'Rejected'].map((s) => ({
    label: s, n: s === 'All' ? mine.length : mine.filter((c) => c.status === s).length,
  }));

  async function handleSubmitForApproval(id) {
    try {
      const res = await fetch(`${API_URL}/courses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ submitForApproval: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit');
      }
      await fetchMine();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete');
      }
      setConfirmDelete(null);
      await fetchMine();
    } catch (err) {
      alert(err.message);
    }
  }

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

      {loading && <p className="small muted">Loading your courses…</p>}
      {error && <p className="small" style={{ color: 'var(--coral)' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState icon="📚" title="No courses here yet" desc="Start building a new course to fill this space." action={<Link to="/trainer/create" className="btn btn-accent">Create a Course</Link>} />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-3">
          {filtered.map((c) => (
            <div key={c._id} className="card course-card">
              <div className="course-thumb" style={{ background: 'linear-gradient(135deg, var(--navy), var(--teal))' }}>
                <span className="cat-tag">{c.category}</span>
              </div>
              <div className="body">
                <div className="flex justify-between items-center">
                  <StatusBadge status={c.status} />
                  {c.submittedOn && <span className="small muted mono">Sub. {new Date(c.submittedOn).toLocaleDateString()}</span>}
                </div>
                {doubtCounts[c._id] > 0 && (
                  <div className="small" style={{ background: '#FFF4E0', color: '#B8720B', padding: '4px 8px', borderRadius: 6, marginTop: 6, display: 'inline-block', fontWeight: 700 }}>
                    💬 {doubtCounts[c._id]} doubt{doubtCounts[c._id] > 1 ? 's' : ''} to answer
                  </div>
                )}
                <h3>{c.title}</h3>
                <div className="course-meta"><span>⏱ {c.duration}</span><span>📶 {c.difficulty}</span></div>
                {c.status === 'Rejected' && c.rejectionReason && (
                  <div className="small" style={{ background: 'var(--coral-soft)', color: 'var(--coral)', padding: '8px 10px', borderRadius: 6 }}>
                    <strong>Rejected:</strong> {c.rejectionReason}
                  </div>
                )}
                <div className="course-stats">
                  <Stars rating={c.rating} />
                  <span>{(c.learners || 0).toLocaleString()} learners</span>
                </div>
                <div className="flex gap-8" style={{ marginTop: 4 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => nav(`/trainer/create?edit=${c._id}`)}>Edit</button>
                  {c.status === 'Draft' && (
                    <button className="btn btn-accent btn-sm" style={{ flex: 1 }} onClick={() => handleSubmitForApproval(c._id)}>Submit</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(c)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <Modal title="Delete course?" onClose={() => setConfirmDelete(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete._id)}>Delete Permanently</button>
          </>}>
          <p>This will permanently remove <strong>{confirmDelete.title}</strong> and all its modules, videos and quiz data. This cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
}
