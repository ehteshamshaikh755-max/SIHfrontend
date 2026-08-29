import React from 'react';
import { Link } from 'react-router-dom';
import { skills, recommendedSkill } from './mockData';

export default function Skills() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>My Skills</h1>
          <p className="desc">Your competency levels, built from completed courses and quiz performance.</p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        {skills.map((s) => (
          <div key={s.name} className="skill-row">
            <div className="skill-name">{s.name}</div>
            <div style={{ flex: 1 }}><div className="progress-track"><div className="progress-fill" style={{ width: `${s.pct}%` }} /></div></div>
            <div className="skill-pct">{s.pct}%</div>
          </div>
        ))}
      </div>

      <div className="card card-pad" style={{ background: 'linear-gradient(135deg, var(--navy-deep), var(--navy))', color: '#fff' }}>
        <span className="pill" style={{ background: 'var(--saffron)', color: 'var(--navy-deep)' }}>Recommended Next Skill</span>
        <h2 style={{ marginTop: 12, color: '#fff', fontSize: 21 }}>{recommendedSkill.name}</h2>
        <p className="small" style={{ marginTop: 8, color: '#c4cce3' }}>{recommendedSkill.reason}</p>
        <Link to="/courses" className="btn btn-accent" style={{ marginTop: 16 }}>Browse {recommendedSkill.name} Courses</Link>
      </div>
    </div>
  );
}
