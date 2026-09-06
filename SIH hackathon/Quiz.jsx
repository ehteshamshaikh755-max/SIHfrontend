import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from './AppContext';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function Quiz() {
  const { courseId } = useParams();
  const nav = useNavigate();
  const { token } = useApp();

  const [courseTitle, setCourseTitle] = useState('');
  const [passingScorePct, setPassingScorePct] = useState(60);
  const [quizDeadline, setQuizDeadline] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null); // { score, passed, correct, total }

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/quizzes/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load quiz');
      setCourseTitle(data.courseTitle);
      setPassingScorePct(data.passingScorePct);
      setQuizDeadline(data.quizDeadline);
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => { fetchQuiz(); }, [fetchQuiz]);

  const select = (qIdx, optIdx) => setAnswers((a) => ({ ...a, [qIdx]: optIdx }));
  const allAnswered = Object.keys(answers).length === questions.length && questions.length > 0;
  const deadlinePassed = quizDeadline && new Date() > new Date(quizDeadline);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const orderedAnswers = questions.map((_, i) => answers[i]);
      const res = await fetch(`${API_URL}/quizzes/${courseId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: orderedAnswers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit quiz');
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
  }

  if (loading) return <div className="page"><p className="small muted">Loading quiz…</p></div>;
  if (error) return <div className="page"><p>{error}</p></div>;

  if (result) {
    return (
      <div className="page" style={{ maxWidth: 560 }}>
        <div className="card card-pad" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>{result.passed ? '🎉' : '📄'}</div>
          <h2 style={{ marginTop: 10 }}>{result.passed ? 'Quiz Passed!' : 'Not Quite There'}</h2>
          <div className="mono" style={{ fontSize: 34, fontWeight: 700, margin: '10px 0', color: result.passed ? 'var(--teal)' : 'var(--coral)' }}>{result.score}%</div>
          <p className="small muted">
            {result.passed
              ? `Great work — that's above the ${passingScorePct}% pass mark. You earned 30 CC!`
              : `You need ${passingScorePct}% to pass. Review the material and try again.`}
          </p>
          <div className="flex gap-12" style={{ justifyContent: 'center', marginTop: 20 }}>
            {!result.passed && <button className="btn btn-outline" onClick={retry}>Retry Quiz</button>}
            {result.passed && <button className="btn btn-accent" onClick={() => nav(`/complete/${courseId}`)}>Continue →</button>}
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="page" style={{ maxWidth: 700 }}>
        <div className="card card-pad">
          <p>This course doesn't have a quiz yet.</p>
          <button className="btn btn-accent" style={{ marginTop: 12 }} onClick={() => nav(`/complete/${courseId}`)}>Continue →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div className="page-head">
        <div>
          <h1>{courseTitle} — Quiz</h1>
          <p className="desc">Answer all questions, then submit. You need {passingScorePct}% to pass.</p>
        </div>
      </div>

      {quizDeadline && (
        <div className="card card-pad" style={{ marginBottom: 14, background: deadlinePassed ? 'var(--coral-soft)' : 'var(--teal-soft)' }}>
          <p className="small" style={{ color: deadlinePassed ? 'var(--coral)' : 'var(--teal)', fontWeight: 600 }}>
            {deadlinePassed
              ? `⏰ Deadline passed on ${new Date(quizDeadline).toLocaleString()}. Submission is closed.`
              : `⏰ Deadline: ${new Date(quizDeadline).toLocaleString()}`}
          </p>
        </div>
      )}

      {questions.map((q, i) => (
        <div key={i} className="card card-pad" style={{ marginBottom: 14 }}>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>{i + 1}. {q.q}</p>
          <div className="flex-col gap-8">
            {q.options.map((opt, oi) => (
              <label key={oi} className="flex gap-10 items-center" style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 8, cursor: deadlinePassed ? 'not-allowed' : 'pointer', background: answers[i] === oi ? 'var(--teal-soft)' : 'transparent', opacity: deadlinePassed ? 0.6 : 1 }}>
                <input type="radio" name={`q${i}`} checked={answers[i] === oi} onChange={() => select(i, oi)} disabled={deadlinePassed} />
                <span className="small">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button className="btn btn-accent btn-block" disabled={!allAnswered || submitting || deadlinePassed} onClick={handleSubmit}>
        {submitting ? 'Submitting…' : deadlinePassed ? 'Deadline Passed' : 'Submit Quiz'}
      </button>
      {!allAnswered && !deadlinePassed && <p className="small muted" style={{ marginTop: 8, textAlign: 'center' }}>Answer all {questions.length} questions to submit.</p>}
    </div>
  );
}