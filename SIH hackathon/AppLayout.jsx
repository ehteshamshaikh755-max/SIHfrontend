import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from './AppContext';

const NAV = {
  trainer: [
    { section: 'Teaching', links: [
      { to: '/trainer/courses', label: 'My Courses', ic: '📚' },
      { to: '/trainer/create', label: 'Create Course', ic: '➕' },
      { to: '/trainer/analytics', label: 'Analytics', ic: '📊' },
      { to: '/trainer/credits', label: 'Contribution Credits', ic: '🪙' },
    ]},
    { section: 'Community', links: [
      { to: '/leaderboard', label: 'Leaderboard', ic: '🏆' },
    ]},
  ],
  admin: [
    { section: 'Administration', links: [
      { to: '/admin/dashboard', label: 'Approval Dashboard', ic: '🛡️' },
      { to: '/admin/analytics', label: 'Platform Analytics', ic: '📈' },
    ]},
  ],
  trainee: [
    { section: 'Learning', links: [
      { to: '/courses', label: 'Browse Courses', ic: '🔎' },
      { to: '/my-skills', label: 'My Skills', ic: '🧭' },
      { to: '/certificates', label: 'My Certificates', ic: '📜' },
    ]},
    { section: 'Rewards', links: [
      { to: '/credits', label: 'Capacity Credits', ic: '🪙' },
      { to: '/rewards', label: 'Rewards Marketplace', ic: '🎁' },
      { to: '/achievements', label: 'Achievements', ic: '🥇' },
      { to: '/leaderboard', label: 'Leaderboard', ic: '🏆' },
    ]},
  ],
};

const ROLE_LABEL = { trainer: 'Trainer Workspace', admin: 'Admin Console', trainee: 'Learner Workspace' };
const ROLE_HOME = { trainer: '/trainer/courses', admin: '/admin/dashboard', trainee: '/courses' };

export default function AppLayout({ children }) {
  const { role, setRole, traineeBalance, trainerBalance } = useApp();
  const loc = useLocation();
  const sections = NAV[role];
  const balance = role === 'trainee' ? traineeBalance : role === 'trainer' ? trainerBalance : null;

  const pageTitle = titleFor(loc.pathname);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="mark">Capacity Connect</div>
          <div className="sub">SIH 2026 · LMS Portal</div>
        </div>
        <div className="sidebar-role">{ROLE_LABEL[role]}</div>
        <nav className="sidebar-nav">
          {sections.map((sec) => (
            <div key={sec.section}>
              <div className="sidebar-section-label">{sec.section}</div>
              {sec.links.map((l) => (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                  <span className="ic">{l.ic}</span>{l.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Switch role (demo)</div>
          <div className="flex gap-6">
            {['trainer', 'admin', 'trainee'].map((r) => (
              <button key={r} className="btn btn-sm" style={{ flex: 1, background: role === r ? 'var(--saffron)' : 'rgba(255,255,255,0.08)', color: role === r ? 'var(--navy-deep)' : '#c4cce3' }}
                onClick={() => { setRole(r); window.location.hash = ROLE_HOME[r]; }}>
                {r[0].toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </aside>
      <div className="main-col">
        <header className="topbar">
          <div className="topbar-title">
            <span className="eyebrow">{ROLE_LABEL[role]}</span>
            {pageTitle}
          </div>
          <div className="topbar-right">
            {balance !== null && (
              <div className="credit-pill"><span className="dot" /> {balance.toLocaleString()} CC</div>
            )}
            <div className="avatar">{role === 'admin' ? 'AD' : role === 'trainer' ? 'AR' : 'YOU'}</div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

function titleFor(path) {
  if (path.includes('/trainer/courses')) return 'My Courses';
  if (path.includes('/trainer/create')) return 'Create Course';
  if (path.includes('/trainer/analytics')) return 'Trainer Analytics';
  if (path.includes('/trainer/credits')) return 'Contribution Credits';
  if (path.includes('/admin/dashboard')) return 'Course Approval Dashboard';
  if (path.includes('/admin/analytics')) return 'Platform Analytics';
  if (path.includes('/courses/')) return 'Course Details';
  if (path.includes('/courses')) return 'Browse Courses';
  if (path.includes('/learn/')) return 'Learning Console';
  if (path.includes('/quiz/')) return 'Assessment';
  if (path.includes('/complete/')) return 'Course Complete';
  if (path.includes('/credits')) return 'Capacity Credits';
  if (path.includes('/rewards')) return 'Rewards Marketplace';
  if (path.includes('/achievements')) return 'Achievements';
  if (path.includes('/leaderboard')) return 'Leaderboard';
  if (path.includes('/certificates')) return 'My Certificates';
  if (path.includes('/my-skills')) return 'My Skills';
  return 'Capacity Connect';
}
