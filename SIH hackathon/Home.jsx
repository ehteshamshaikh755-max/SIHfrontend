import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from './AppContext';
import { StatBox } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function Home() {
  const { token, user } = useApp();
  const [stats, setStats] = useState({ totalCourses: 0, totalLearners: 0, certificatesIssued: 0 });
  const [featured, setFeatured] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [continueLearning, setContinueLearning] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/home/stats`).then((r) => r.json()),
      fetch(`${API_URL}/home/featured`).then((r) => r.json()),
      fetch(`${API_URL}/announcements`).then((r) => r.json()),
      fetch(`${API_URL}/enrollments/mine`, { headers: { 'Authorization': `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([statsData, featuredData, announcementsData, enrollmentsData]) => {
        setStats(statsData);
        setFeatured(Array.isArray(featuredData) ? featuredData : []);
        setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
        const inProgress = Array.isArray(enrollmentsData)
          ? enrollmentsData.filter((e) => e.status === 'in-progress')
          : [];
        setContinueLearning(inProgress);
      })
      .catch((err) => console.error('Failed to load homepage', err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="card card-pad" style={{ background: 'linear-gradient(135deg, var(--navy-deep), var(--navy))', color: '#fff', marginBottom: 20 }}>
        <h1 style={{ color: '#fff', marginBottom: 8 }}>Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
        <p style={{ color: '#c4cce3', marginBottom: 16 }}>Keep building your skills and earning Capacity Credits.</p>
        <Link to="/courses" className="btn btn-accent">Browse Courses</Link>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <StatBox num={stats.totalCourses} label="Courses available" />
        <StatBox num={stats.totalLearners.toLocaleString()} label="Learners on platform" />
        <StatBox num={stats.certificatesIssued.toLocaleString()} label="Certificates issued" />
      </div>

      {continueLearning.length > 0 && (
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Continue Learning</h3>
          {continueLearning.map((e) => (
            <div key={e._id} className="flex justify-between small items-center" style={{ padding: '9px 0', borderBottom: '1px dashed var(--line)' }}>
              <span>{e.course?.title}</span>
              <span className="flex items-center gap-10">
                <span className="mono muted">{e.progressPct}%</span>
                <Link to={`/courses/${e.course?._id}`} className="btn btn-sm">Resume</Link>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start', gap: 20 }}>
        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>
            {featured.some((c) => c.featured) ? 'Featured & New Courses' : 'Popular Courses'}
          </h3>
          {featured.length === 0 ? (
            <div className="small muted">No courses yet.</div>
          ) : (
            featured.map((c) => (
              <div key={c._id} className="flex justify-between small" style={{ padding: '9px 0', borderBottom: '1px dashed var(--line)' }}>
                <span>
                  {c.featured && <span style={{ marginRight: 4 }}>⭐</span>}
                  {c.title} <span className="muted">— {c.category}</span>
                </span>
                <span className="mono muted">{c.learners.toLocaleString()} learners</span>
              </div>
            ))
          )}
        </div>

        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Announcements</h3>
          {announcements.length === 0 ? (
            <div className="small muted">No announcements yet.</div>
          ) : (
            announcements.map((a) => (
              <div key={a._id} style={{ padding: '9px 0', borderBottom: '1px dashed var(--line)' }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.title}</div>
                <div className="small muted" style={{ marginTop: 2 }}>{a.body}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}