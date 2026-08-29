import React from 'react';
import { trainerAnalytics } from './mockData';
import { StatBox, ProgressBar } from './common';

export default function TrainerAnalytics() {
  const a = trainerAnalytics;
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Trainer Analytics</h1>
          <p className="desc">Performance across all of your published courses.</p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatBox num={a.totalLearners.toLocaleString()} label="Total learners" />
        <StatBox num={a.completions.toLocaleString()} label="Course completions" />
        <StatBox num={`${a.completionPct}%`} label="Completion percentage" />
        <StatBox num={a.avgQuizScore} label="Average quiz score" />
      </div>
      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <StatBox num={`${a.avgRating}★`} label="Average course rating" />
        <StatBox num={a.contributionCredits.toLocaleString()} label="Contribution Credits" />
        <StatBox num={a.perCourse.length} label="Published courses" />
      </div>

      <div className="card card-pad">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Per-Course Performance</h3>
        <table className="table">
          <thead><tr><th>Course</th><th>Learners</th><th>Completion</th><th>Rating</th></tr></thead>
          <tbody>
            {a.perCourse.map((c) => (
              <tr key={c.title}>
                <td>{c.title}</td>
                <td className="mono">{c.learners.toLocaleString()}</td>
                <td style={{ width: 220 }}>
                  <div className="flex items-center gap-10">
                    <ProgressBar pct={c.completionPct} />
                    <span className="mono small">{c.completionPct}%</span>
                  </div>
                </td>
                <td className="mono">{c.rating}★</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
