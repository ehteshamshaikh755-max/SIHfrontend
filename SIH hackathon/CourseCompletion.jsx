import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from './AppContext';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function CourseCompletion() {
  const { courseId } = useParams();
  const nav = useNavigate();
  const { token } = useApp();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/courses/${courseId}`)
      .then((res) => res.json())
      .then((data) => setCourse(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  async function submitReview() {
    setReviewLoading(true);
    setReviewError('');
    try {
      const res = await fetch(`${API_URL}/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      setReviewSubmitted(true);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  }

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <div className="card card-pad" style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ fontSize: 52 }}>🎉</div>
        <span className="pill" style={{ marginTop: 14 }}>Course Completed</span>
        <h2 style={{ marginTop: 12, fontSize: 24 }}>Congratulations!</h2>
        <p className="muted small" style={{ marginTop: 8 }}>
          You've completed <strong>{course?.title}</strong>. Your certificate is ready and your Capacity Credits have been added.
        </p>

        <div className="flex gap-12" style={{ justifyContent: 'center', marginTop: 26 }}>
          <button className="btn btn-outline" onClick={() => nav('/courses')}>Browse More Courses</button>
          <button className="btn btn-accent" onClick={() => nav('/certificates')}>View Certificate</button>
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 20 }}>
        {reviewSubmitted ? (
          <p className="small" style={{ textAlign: 'center', color: 'var(--muted)' }}>
            ✅ Thanks for your feedback!
          </p>
        ) : (
          <>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Rate this course</h3>
            <div className="flex gap-6" style={{ marginBottom: 14, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  onClick={() => setRating(n)}
                  style={{ fontSize: 26, cursor: 'pointer', color: n <= rating ? 'var(--saffron)' : 'var(--line)' }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="What did you think of this course? (optional)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ width: '100%', minHeight: 70, marginBottom: 12 }}
            />
            {reviewError && <p className="small" style={{ color: 'var(--coral)', marginBottom: 10 }}>{reviewError}</p>}
            <button className="btn btn-accent" onClick={submitReview} disabled={reviewLoading} style={{ width: '100%' }}>
              {reviewLoading ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}