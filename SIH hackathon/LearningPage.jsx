import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from './AppContext';
import { ProgressBar } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function LearningPage() {
  const { courseId, lessonId } = useParams();
  const nav = useNavigate();
  const { token , role } = useApp();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);  

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const courseRes = await fetch(`${API_URL}/courses/${courseId}`);
      const courseData = await courseRes.json();
      if (!courseRes.ok) throw new Error(courseData.message || 'Course not found');
      setCourse(courseData);

      if (role === 'trainer') {
        setEnrollment({ progressPct: 0, completedLessonIds: [] });
      } else {
        const enrollRes = await fetch(`${API_URL}/enrollments/mine`, { headers: { Authorization: `Bearer ${token}` } });
        const enrollData = await enrollRes.json();
      if (!enrollRes.ok) throw new Error(enrollData.message || 'Failed to load enrollment');
      const mine = enrollData.find((e) => e.course?._id === courseId);
      if (!mine) throw new Error('You are not enrolled in this course.');
      setEnrollment(mine);
}
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const fetchComments = useCallback(async () => {
  if (!lessonId) return;
  try {
    const res = await fetch(`${API_URL}/comments/${courseId}/${lessonId}`);
    const data = await res.json();
    if (res.ok) setComments(data);
  } catch (err) {
    console.error(err);
  }
}, [courseId, lessonId]);

useEffect(() => { fetchComments(); }, [fetchComments]);

  if (loading) return <div className="page"><p className="small muted">Loading lesson…</p></div>;
  if (error || !course) return <div className="page"><p>{error || 'Course not found.'}</p></div>;

  const completedLessonIds = enrollment.completedLessonIds || [];
  const flatLessons = course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
  const totalVideoLessons = flatLessons.filter((l) => l.type === 'video').length;
  const currentIdx = flatLessons.findIndex((l) => l._id === lessonId);
  const current = flatLessons[currentIdx] || flatLessons[0];
  const nextLesson = flatLessons[currentIdx + 1];
  const prevLesson = flatLessons[currentIdx - 1];

  const isUnlocked = (idx) => {
    if (idx === 0) return true;
    const prev = flatLessons[idx - 1];
    return completedLessonIds.includes(prev._id) || idx <= currentIdx;
  };
  
  async function handleComplete() {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/enrollments/${enrollment._id}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId: current._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update progress');

      setEnrollment(data.enrollment);

      if (nextLesson) {
        if (nextLesson.type === 'quiz') nav(`/quiz/${courseId}`);
        else nav(`/learn/${courseId}/${nextLesson._id}`);
      } else {
        nav(`/quiz/${courseId}`);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }
  async function handlePostComment() {
  if (!newComment.trim()) return;
  setPostingComment(true);
  try {
    const res = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId, lessonId, text: newComment }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to post comment');
    setComments((prev) => [...prev, data]);
    setNewComment('');
  } catch (err) {
    alert(err.message);
  } finally {
    setPostingComment(false);
  }
}

  return (
    <div className="page" style={{ maxWidth: 1160 }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
        <div>
          <Link to={`/courses/${courseId}`} className="small muted">← {course.title}</Link>
        </div>
        <div className="flex items-center gap-10" style={{ minWidth: 220 }}>
          <span className="small muted">Course Progress: <strong className="mono">{enrollment.progressPct}%</strong></span>
        </div>
      </div>
      <ProgressBar pct={enrollment.progressPct} />

      <div className="grid" style={{ gridTemplateColumns: '2.2fr 1fr', alignItems: 'start', marginTop: 18 }}>
        <div>
          {current?.type === 'document' ? (
            <div className="card card-pad" style={{ textAlign: 'center', padding: 50 }}>
              <div style={{ fontSize: 48 }}>📄</div>
              <h3 style={{ marginTop: 14 }}>{current.title}</h3>
              {current.description && <p className="small muted" style={{ marginTop: 6 }}>{current.description}</p>}
              {current.docUrl ? (
                <a href={current.docUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent" style={{ marginTop: 18, display: 'inline-block' }}>
                  Open Document
                </a>
              ) : (
                <p className="small muted" style={{ marginTop: 18 }}>No document uploaded for this lesson yet.</p>
              )}
            </div>
          ) : current?.videoUrl ? (
            <div style={{ background: '#000', borderRadius: 12, overflow: 'hidden' }}>
              <video
                key={current._id}
                src={current.videoUrl}
                controls
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          ) : (
            <div className="video-player">
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                No video uploaded for this lesson yet.
              </div>
            </div>
          )}
          <h2 style={{ marginTop: 16, fontSize: 19 }}>{current?.title}</h2>
          <p className="small muted" style={{ marginTop: 4 }}>{current?.moduleTitle} · {current?.duration}</p>

          <div className="flex justify-between" style={{ marginTop: 20 }}>
            <button className="btn btn-outline" disabled={!prevLesson} onClick={() => prevLesson && nav(`/learn/${courseId}/${prevLesson._id}`)}>← Previous</button>
            {role !== 'trainer' && (
              <button className="btn btn-accent" onClick={handleComplete} disabled={saving}>
                {saving ? 'Saving…' : completedLessonIds.includes(current?._id) ? 'Next →' : 'Mark Complete & Continue →'}
              </button>
            )}
          </div>

          <div className="card card-pad" style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Doubts & Discussion</h3>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Ask a doubt about this lesson…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-accent btn-sm" onClick={handlePostComment} disabled={postingComment}>
                {postingComment ? '…' : 'Post'}
              </button>
            </div>

            {comments.length === 0 && (
              <p className="small muted">No questions yet. Be the first to ask!</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {comments.map((c) => (
                <div key={c._id} style={{ borderBottom: '1px solid var(--border, #eee)', paddingBottom: 10 }}>
                  <div className="flex justify-between items-center">
                    <span className="small" style={{ fontWeight: 700 }}>
                      {c.userName} {c.userRole === 'trainer' && <span className="pill" style={{ marginLeft: 6, fontSize: 10 }}>Trainer</span>}
                    </span>
                    <span className="small muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="small" style={{ marginTop: 4 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
          </div>

        <div className="card card-pad">
          <h3 style={{ fontSize: 14.5, marginBottom: 10 }}>Course Modules</h3>
          {course.modules.map((m) => (
            <div key={m._id} style={{ marginBottom: 12 }}>
              <div className="small" style={{ fontWeight: 700, marginBottom: 4, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 11 }}>{m.title}</div>
              {m.lessons.map((l) => {
                const idx = flatLessons.findIndex((fl) => fl._id === l._id);
                const complete = completedLessonIds.includes(l._id);
                const isCurrent = l._id === current?._id;
                const locked = !isUnlocked(idx) && !complete;
                const cls = complete ? 'complete' : isCurrent ? 'current' : locked ? 'locked' : '';
                return (
                  <div key={l._id} className={`lesson-item ${cls}`} style={{ cursor: locked ? 'not-allowed' : 'pointer' }}
                    onClick={() => { if (!locked && (l.type === 'video' || l.type === 'document')) nav(`/learn/${courseId}/${l._id}`); if (!locked && l.type === 'quiz') nav(`/quiz/${courseId}`); }}>
                    <span className="lstatus">{complete ? '✓' : locked ? '🔒' : l.type === 'quiz' ? '📝' : l.type === 'document' ? '📄' : '▶'}</span>
                    <span style={{ flex: 1 }}>{l.title}</span>
                    <span className="mono small muted">{l.duration}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}