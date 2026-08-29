import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from './AppContext';
import { quizBank } from './mockData';

const PASS_MARK = 70;

export default function Quiz() {
  const { courseId } = useParams();
  const nav = useNavigate();
  const { courses } = useApp();
  const course = courses.find((c) => c.id === courseId);
  const questions = quizBank[courseId] || quizBank.c1;

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const select = (qIdx, optIdx) => setAnswers((a) => ({ ...a, [qIdx]: optIdx }));

  const score = () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.answer) correct += 1; });
    return Math.round((correct / questions.length) * 100);
  };

  const pct = submitted ? score() : 0;
  const passed = pct >= PASS_MARK;
  const allAnswered = Object.keys(answers).length === questions.length;

  const retry = () => { setAnswers({}); setSubmitted(false); };

  if (submitted) {
    return (
      <div className="page" style={{ maxWidth: 560 }}>
        <div className="card card-pad" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>{passed ? '🎉' : '📄'}</div>
          <h2 style={{ marginTop: 10 }}>{passed ? 'Quiz Passed!' : 'Not Quite There'}</h2>
          <div className="mono" style={{ fontSize: 34, fontWeight: 700, margin: '10px 0', color: passed ? 'var(--teal)' : 'var(--coral)' }}>{pct}%</div>
          <p className="small muted">{passed ? `Great work — that's above the ${PASS_MARK}% pass mark.` : `You need ${PASS_MARK}% to pass. Review the material and try again.`}</p>
          <div className="flex gap-12" style={{ justifyContent: 'center', marginTop: 20 }}>
            {!passed && <button className="btn btn-outline" onClick={retry}>Retry Quiz</button>}
            {passed && <button className="btn btn-accent" onClick={() => nav(`/complete/${courseId}`)}>Continue →</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div className="page-head">
        <div>
          <h1>{course?.title} — Quiz</h1>
          <p className="desc">Answer all questions, then submit. You need {PASS_MARK}% to pass.</p>
        </div>
      </div>

      {questions.map((q, i) => (
        <div key={i} className="card card-pad" style={{ marginBottom: 14 }}>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>{i + 1}. {q.q}</p>
          <div className="flex-col gap-8">
            {q.options.map((opt, oi) => (
              <label key={oi} className="flex gap-10 items-center" style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', background: answers[i] === oi ? 'var(--teal-soft)' : 'transparent' }}>
                <input type="radio" name={`q${i}`} checked={answers[i] === oi} onChange={() => select(i, oi)} />
                <span className="small">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button className="btn btn-accent btn-block" disabled={!allAnswered} onClick={() => setSubmitted(true)}>Submit Quiz</button>
      {!allAnswered && <p className="small muted" style={{ marginTop: 8, textAlign: 'center' }}>Answer all {questions.length} questions to submit.</p>}
    </div>
  );
}
