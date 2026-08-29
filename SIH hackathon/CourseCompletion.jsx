import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from './AppContext';

export default function CourseCompletion() {
  const { courseId } = useParams();
  const nav = useNavigate();
  const { courses, setTraineeBalance } = useApp();
  const course = courses.find((c) => c.id === courseId);

  useEffect(() => { setTraineeBalance((b) => b + 180); /* eslint-disable-next-line */ }, []);

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <div className="card card-pad" style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ fontSize: 52 }}>🎉</div>
        <span className="pill" style={{ marginTop: 14 }}>Course Completed</span>
        <h2 style={{ marginTop: 12, fontSize: 24 }}>Congratulations!</h2>
        <p className="muted small" style={{ marginTop: 8 }}>
          You've completed <strong>{course?.title}</strong>. Your certificate is ready and your Capacity Credits have been added.
        </p>

        <div className="grid grid-3" style={{ marginTop: 24, textAlign: 'left' }}>
          <div className="stat-box"><div className="num">92%</div><div className="lbl">Final Score</div></div>
          <div className="stat-box"><div className="num">+180</div><div className="lbl">Credits Earned</div></div>
          <div className="stat-box"><div className="num">✓</div><div className="lbl">Certificate Ready</div></div>
        </div>

        <div className="flex gap-12" style={{ justifyContent: 'center', marginTop: 26 }}>
          <button className="btn btn-outline" onClick={() => nav('/courses')}>Browse More Courses</button>
          <button className="btn btn-accent" onClick={() => nav('/certificates')}>View Certificate</button>
        </div>
      </div>
    </div>
  );
}
