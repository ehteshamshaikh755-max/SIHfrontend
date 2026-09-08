import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from './AppContext';
import { Stars, ProgressBar } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function CourseDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { token } = useApp();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [followStatus, setFollowStatus] = useState({ followerCount: 0, verified: false, isFollowing: false });
  const [followLoading, setFollowLoading] = useState(false);
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [courseRes, enrollRes] = await Promise.all([
        fetch(`${API_URL}/courses/${id}`),
        fetch(`${API_URL}/enrollments/mine`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const courseData = await courseRes.json();
      if (!courseRes.ok) throw new Error(courseData.message || 'Course not found');
      setCourse(courseData);

      if (courseData.trainer?._id) {
        const followRes = await fetch(`${API_URL}/auth/trainers/${courseData.trainer._id}/follow-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (followRes.ok) setFollowStatus(await followRes.json());
      }

      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        const mine = enrollData.find((e) => e.course?._id === id);
        setEnrollment(mine || null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="page"><p className="small muted">Loading course…</p></div>;
  if (error || !course) return <div className="page"><p>{error || 'Course not found.'}</p></div>;

  const totalLessons = course.modules.reduce((n, m) => n + m.lessons.filter((l) => l.type === 'video').length, 0);

  function firstLessonId() {
    const firstModule = course.modules.find((m) => m.lessons.length);
    return firstModule?.lessons[0]?._id;
  }

  async function handleEnroll() {
    setEnrolling(true);
    try {
      const res = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to enroll');
      const lessonId = firstLessonId();
      if (lessonId) nav(`/learn/${id}/${lessonId}`);
      else await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setEnrolling(false);
    }
  }

  async function toggleFollow() {
    if (!course.trainer?._id) return;
    setFollowLoading(true);
    try {
      const action = followStatus.isFollowing ? 'unfollow' : 'follow';
      const res = await fetch(`${API_URL}/auth/trainers/${course.trainer._id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update follow status');
      setFollowStatus({ ...data, isFollowing: !followStatus.isFollowing });
    } catch (err) {
      alert(err.message);
    } finally {
      setFollowLoading(false);
    }
  }

  function handleContinue() {
    const lessonId = firstLessonId();
    if (lessonId) nav(`/learn/${id}/${lessonId}`);
  }

  const trainerName = course.trainer?.name || 'Unknown Trainer';

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        <div>
          <span className="pill">{course.category}</span>
          <h1 style={{ marginTop: 10, fontSize: 26 }}>{course.title}</h1>
          <p className="muted" style={{ marginTop: 8 }}>{course.description}</p>
          <div className="flex gap-16 wrap" style={{ marginTop: 12 }}>
            <Stars rating={course.rating} />
            <span className="small muted">👥 {(course.learners || 0).toLocaleString()} learners</span>
            <span className="small muted">⏱ {course.duration}</span>
            <span className="small muted">📶 {course.difficulty}</span>
          </div>

          {enrollment && (
            <div style={{ marginTop: 16 }}>
              <div className="flex justify-between small" style={{ marginBottom: 6 }}>
                <span>Course Progress</span><span className="mono">{enrollment.progressPct}%</span>
              </div>
              <ProgressBar pct={enrollment.progressPct} />
            </div>
          )}

          <div className="divider" />
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Learning Objectives</h3>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(course.objectives || []).map((o, i) => <li key={i} className="small">{o}</li>)}
          </ul>

          <div className="divider" />
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Modules ({totalLessons} lessons)</h3>
          {course.modules.map((m, i) => (
            <div key={m._id} className="card card-pad" style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Module {i + 1}: {m.title}</div>
              {m.lessons.map((l) => (
                <div key={l._id} className="flex justify-between small" style={{ padding: '7px 0' }}>
                  <span>{l.type === 'quiz' ? '📝' : '🎬'} {l.title}</span>
                  <span className="muted mono">{l.duration}</span>
                </div>
              ))}
            </div>
          ))}

          <div className="divider" />
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Skills Gained</h3>
          <div className="flex gap-8 wrap">
            {(course.skillsGained || []).map((s) => <span key={s} className="pill">{s}</span>)}
          </div>

          <div className="divider" />
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Reviews</h3>
          {(!course.reviews || course.reviews.length === 0) && <p className="small muted">No reviews yet.</p>}
          {(course.reviews || []).map((r, i) => (
            <div key={i} className="card card-pad" style={{ marginBottom: 8 }}>
              <div className="flex justify-between"><strong className="small">{r.user}</strong><span className="stars">{'★'.repeat(r.rating)}</span></div>
              <p className="small muted" style={{ marginTop: 4 }}>{r.text}</p>
            </div>
          ))}
        </div>

        <div className="card card-pad" style={{ position: 'sticky', top: 84 }}>
          <div className="course-thumb" style={{ margin: '-20px -20px 14px', background: 'linear-gradient(135deg, var(--navy), var(--teal))' }} />
          <h3 style={{ fontSize: 15 }}>Trainer</h3>
          <div className="flex gap-10 items-center" style={{ marginTop: 8 }}>
            <div className="avatar" style={{ background: 'var(--navy)' }}>{trainerName.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                {trainerName}
                {followStatus.verified && <span title="Verified Trainer" style={{ marginLeft: 4, color: 'var(--teal)' }}>✓</span>}
              </div>
              <div className="small muted">{followStatus.followerCount} follower{followStatus.followerCount === 1 ? '' : 's'}</div>
            </div>
          </div>
          <button
            className={`btn btn-sm ${followStatus.isFollowing ? 'btn-outline' : 'btn-accent'}`}
            style={{ width: '100%', marginTop: 10 }}
            onClick={toggleFollow}
            disabled={followLoading}
          >
            {followLoading ? '…' : followStatus.isFollowing ? '✓ Following' : '+ Follow Trainer'}
          </button>
          <div className="divider" />
          {enrollment ? (
            <button className="btn btn-accent btn-block" onClick={handleContinue}>{enrollment.progressPct === 100 ? '✓ Review Course' : 'Continue Learning'}</button>
          ) : (
            <button className="btn btn-accent btn-block" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? 'Enrolling…' : 'Enroll Now'}
            </button>
          )}
          <p className="small muted" style={{ marginTop: 10, textAlign: 'center' }}>Earn up to <strong>180 CC</strong> for completing this course</p>
        </div>
      </div>
    </div>
  );
}
