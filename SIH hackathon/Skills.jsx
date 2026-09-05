import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from './AppContext';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function Skills() {
  const { token } = useApp();
  const [skills, setSkills] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/skills/mine`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSkills(data.skills || []);
        setRecommended(data.recommendedNextSkill || null);
      })
      .catch((err) => console.error('Failed to load skills', err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="page">Loading skills...</div>;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>My Skills</h1>
          <p className="desc">Your competency levels, built from completed courses and quiz performance.</p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        {skills.length === 0 ? (
          <p className="small" style={{ color: 'var(--muted, #888)' }}>
            No skills yet — complete a course to start building your competency profile.
          </p>
        ) : (
          skills.map((s) => (
            <div key={s.name} className="skill-row">
              <div className="skill-name">{s.name}</div>
              <div style={{ flex: 1 }}>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
              <div className="skill-pct">{s.pct}%</div>
            </div>
          ))
        )}
      </div>

      {recommended && (
        <div className="card card-pad" style={{ background: 'linear-gradient(135deg, var(--navy-deep), var(--navy))', color: '#fff' }}>
          <span className="pill" style={{ background: 'var(--saffron)', color: 'var(--navy-deep)' }}>Recommended Next Skill</span>
          <h2 style={{ marginTop: 12, color: '#fff', fontSize: 21 }}>{recommended}</h2>
          <p className="small" style={{ marginTop: 8, color: '#c4cce3' }}>
            This skill is in demand across current courses and isn't part of your profile yet.
          </p>
          <Link to="/courses" className="btn btn-accent" style={{ marginTop: 16 }}>Browse {recommended} Courses</Link>
        </div>
      )}
    </div>
  );
}