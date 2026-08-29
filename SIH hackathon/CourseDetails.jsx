import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from './AppContext';
import { Stars, ProgressBar, StatBox } from './common';

export default function CourseDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { courses, enrollments, enroll } = useApp();
  const course = courses.find((c) => c.id === id);
  const enrolled = enrollments[id];

  if (!course) return <div className="page"><p>Course not found.</p></div>;

  const totalLessons = course.modules.reduce((n, m) => n + m.lessons.filter((l) => l.type === 'video').length, 0);

  const handleEnroll = () => {
    enroll(id);
    const firstLesson = course.modules.find((m) => m.lessons.length)?.lessons[0];
    if (firstLesson) nav(`/learn/${id}/${firstLesson.id}`);
  };
  const handleContinue = () => {
    const firstLesson = course.modules.find((m) => m.lessons.length)?.lessons[0];
    if (firstLesson) nav(`/learn/${id}/${firstLesson.id}`);
  };

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        <div>
          <span className="pill">{course.category}</span>
          <h1 style={{ marginTop: 10, fontSize: 26 }}>{course.title}</h1>
          <p className="muted" style={{ marginTop: 8 }}>{course.description}</p>
          <div className="flex gap-16 wrap" style={{ marginTop: 12 }}>
            <Stars rating={course.rating} />
            <span className="small muted">👥 {course.learners.toLocaleString()} learners</span>
            <span className="small muted">⏱ {course.duration}</span>
            <span className="small muted">📶 {course.difficulty}</span>
          </div>

          {enrolled && (
            <div style={{ marginTop: 16 }}>
              <div className="flex justify-between small" style={{ marginBottom: 6 }}>
                <span>Course Progress</span><span className="mono">{enrolled.progress}%</span>
              </div>
              <ProgressBar pct={enrolled.progress} />
            </div>
          )}

          <div className="divider" />
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Learning Objectives</h3>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {course.objectives.map((o, i) => <li key={i} className="small">{o}</li>)}
          </ul>

          <div className="divider" />
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Modules ({totalLessons} lessons)</h3>
          {course.modules.map((m, i) => (
            <div key={m.id} className="card card-pad" style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Module {i + 1}: {m.title}</div>
              {m.lessons.map((l) => (
                <div key={l.id} className="flex justify-between small" style={{ padding: '7px 0' }}>
                  <span>{l.type === 'quiz' ? '📝' : '🎬'} {l.title}</span>
                  <span className="muted mono">{l.duration}</span>
                </div>
              ))}
            </div>
          ))}

          <div className="divider" />
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Skills Gained</h3>
          <div className="flex gap-8 wrap">
            {course.skillsGained.map((s) => <span key={s} className="pill">{s}</span>)}
          </div>

          <div className="divider" />
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Reviews</h3>
          {course.reviews.length === 0 && <p className="small muted">No reviews yet.</p>}
          {course.reviews.map((r, i) => (
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
            <div className="avatar" style={{ background: 'var(--navy)' }}>{course.trainer.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{course.trainer}</div>
              <div className="small muted">Certified Domain Trainer</div>
            </div>
          </div>
          <div className="divider" />
          {enrolled ? (
            <button className="btn btn-accent btn-block" onClick={handleContinue}>{enrolled.progress === 100 ? '✓ Review Course' : 'Continue Learning'}</button>
          ) : (
            <button className="btn btn-accent btn-block" onClick={handleEnroll}>Enroll Now</button>
          )}
          <p className="small muted" style={{ marginTop: 10, textAlign: 'center' }}>Earn up to <strong>180 CC</strong> for completing this course</p>
        </div>
      </div>
    </div>
  );
}
