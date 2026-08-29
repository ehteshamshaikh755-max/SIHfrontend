import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from './AppContext';
import { ProgressBar } from './common';

export default function LearningPage() {
  const { courseId, lessonId } = useParams();
  const nav = useNavigate();
  const { courses, enrollments, markLessonComplete } = useApp();
  const course = courses.find((c) => c.id === courseId);
  if (!course) return <div className="page"><p>Course not found.</p></div>;

  const enrolled = enrollments[courseId] || { progress: 0, completedLessons: [] };
  const flatLessons = course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
  const totalVideoLessons = flatLessons.filter((l) => l.type === 'video').length;
  const currentIdx = flatLessons.findIndex((l) => l.id === lessonId);
  const current = flatLessons[currentIdx] || flatLessons[0];
  const nextLesson = flatLessons[currentIdx + 1];
  const prevLesson = flatLessons[currentIdx - 1];

  const isUnlocked = (idx) => {
    if (idx === 0) return true;
    const prev = flatLessons[idx - 1];
    return enrolled.completedLessons.includes(prev.id) || idx <= currentIdx;
  };

  const handleComplete = () => {
    markLessonComplete(courseId, current.id, totalVideoLessons);
    if (nextLesson) {
      if (nextLesson.type === 'quiz') nav(`/quiz/${courseId}`);
      else nav(`/learn/${courseId}/${nextLesson.id}`);
    } else {
      nav(`/quiz/${courseId}`);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1160 }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
        <div>
          <Link to={`/courses/${courseId}`} className="small muted">← {course.title}</Link>
        </div>
        <div className="flex items-center gap-10" style={{ minWidth: 220 }}>
          <span className="small muted">Course Progress: <strong className="mono">{enrolled.progress}%</strong></span>
        </div>
      </div>
      <ProgressBar pct={enrolled.progress} />

      <div className="grid" style={{ gridTemplateColumns: '2.2fr 1fr', alignItems: 'start', marginTop: 18 }}>
        <div>
          <div className="video-player">
            <div className="play-btn">▶</div>
            <div className="video-scrub"><div className="fill" /></div>
          </div>
          <h2 style={{ marginTop: 16, fontSize: 19 }}>{current?.title}</h2>
          <p className="small muted" style={{ marginTop: 4 }}>{current?.moduleTitle} · {current?.duration}</p>

          <div className="flex justify-between" style={{ marginTop: 20 }}>
            <button className="btn btn-outline" disabled={!prevLesson} onClick={() => prevLesson && nav(`/learn/${courseId}/${prevLesson.id}`)}>← Previous</button>
            <button className="btn btn-accent" onClick={handleComplete}>
              {enrolled.completedLessons.includes(current?.id) ? 'Next →' : 'Mark Complete & Continue →'}
            </button>
          </div>
        </div>

        <div className="card card-pad">
          <h3 style={{ fontSize: 14.5, marginBottom: 10 }}>Course Modules</h3>
          {course.modules.map((m) => (
            <div key={m.id} style={{ marginBottom: 12 }}>
              <div className="small" style={{ fontWeight: 700, marginBottom: 4, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 11 }}>{m.title}</div>
              {m.lessons.map((l) => {
                const idx = flatLessons.findIndex((fl) => fl.id === l.id);
                const complete = enrolled.completedLessons.includes(l.id);
                const isCurrent = l.id === current?.id;
                const locked = !isUnlocked(idx) && !complete;
                const cls = complete ? 'complete' : isCurrent ? 'current' : locked ? 'locked' : '';
                return (
                  <div key={l.id} className={`lesson-item ${cls}`} style={{ cursor: locked ? 'not-allowed' : 'pointer' }}
                    onClick={() => { if (!locked && l.type === 'video') nav(`/learn/${courseId}/${l.id}`); if (!locked && l.type === 'quiz') nav(`/quiz/${courseId}`); }}>
                    <span className="lstatus">{complete ? '✓' : locked ? '🔒' : l.type === 'quiz' ? '📝' : '▶'}</span>
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
