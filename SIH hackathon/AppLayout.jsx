import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from './AppContext';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

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
      { to: '/home', label: 'Home', ic: '🏠' },
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

function initialsFor(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AppLayout({ children }) {
  const { role, user, token, logout } = useApp();
  const loc = useLocation();
  const navigate = useNavigate();
  const sections = NAV[role] || [];

  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!token || role === 'admin') return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/wallet/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setBalance(data.balance);
      } catch {
        // silently ignore — header balance is a nice-to-have, not critical
      }
    })();
  }, [token, role, loc.pathname]);

  const pageTitle = titleFor(loc.pathname);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

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
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} style={{ marginBottom: 10 }}>
            <span className="ic">⚙️</span>Profile & Settings
          </NavLink>
          <div style={{ marginBottom: 8, fontSize: 13, color: '#c4cce3' }}>
            Signed in as <strong>{user?.name}</strong>
          </div>
          <button
            className="btn btn-sm"
            style={{ width: '100%', background: 'rgba(255,255,255,0.08)', color: '#f1f5f9' }}
            onClick={handleLogout}
          >
            Log Out
          </button>
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
            <div className="avatar" title={user?.name}>{initialsFor(user?.name)}</div>
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
  if (path.includes('/profile')) return 'Profile & Settings';
  if (path.includes('/home')) return 'Home';
  return 'Capacity Connect';
}