import React from 'react';
import { Link } from 'react-router-dom';

export function StatusBadge({ status }) {
  const map = {
    Draft: 'badge-draft',
    'Pending Approval': 'badge-pending',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected',
  };
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status}</span>;
}

export function ProgressBar({ pct, color }) {
  return (
    <div className="progress-track">
      <div className={`progress-fill ${color || ''}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stars({ rating }) {
  if (!rating) return <span className="small muted">No ratings yet</span>;
  const full = Math.round(rating);
  return <span className="stars">{'★'.repeat(full)}{'☆'.repeat(5 - full)} <span className="mono small muted">{rating.toFixed(1)}</span></span>;
}

const THUMB_GRADIENTS = {
  'navy-teal': 'linear-gradient(135deg, var(--navy), var(--teal))',
  'coral-navy': 'linear-gradient(135deg, var(--coral), var(--navy))',
  'saffron-navy': 'linear-gradient(135deg, var(--saffron-deep), var(--navy))',
  'teal-navy': 'linear-gradient(135deg, var(--teal), var(--navy-deep))',
  'navy-saffron': 'linear-gradient(135deg, var(--navy), var(--saffron))',
};

export function CourseCard({ course, footer, linkTo, icon }) {
  const inner = (
    <div className="card course-card">
      <div className="course-thumb" style={{ background: THUMB_GRADIENTS[course.thumbnail] || THUMB_GRADIENTS['navy-teal'] }}>
        <span className="cat-tag">{course.category}</span>
      </div>
      <div className="body">
        <h3>{course.title}</h3>
        <div className="course-meta">
          <span>👤 {course.trainer}</span>
          <span>⏱ {course.duration}</span>
          <span>📶 {course.difficulty}</span>
        </div>
        {icon}
        <div className="course-stats">
          <Stars rating={course.rating} />
          <span>{course.learners.toLocaleString()} learners</span>
        </div>
        {footer}
      </div>
    </div>
  );
  return linkTo ? <Link to={linkTo} style={{ display: 'block' }}>{inner}</Link> : inner;
}

export function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal" style={wide ? { maxWidth: 720 } : undefined}>
        <div className="modal-head">
          <h3 style={{ fontSize: 17 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function StatBox({ num, label, trend }) {
  return (
    <div className="stat-box">
      <div className="num">{num}</div>
      <div className="lbl">{label}</div>
      {trend && <div className="trend">{trend}</div>}
    </div>
  );
}

export function LedgerRow({ icon, title, date, amount }) {
  const pos = amount >= 0;
  return (
    <div className="ledger-row">
      <div className="l-left">
        <div className="l-icon">{icon}</div>
        <div>
          <div className="l-title">{title}</div>
          <div className="l-date">{date}</div>
        </div>
      </div>
      <div className={`ledger-amt ${pos ? 'pos' : 'neg'}`}>{pos ? '+' : ''}{amount} CC</div>
    </div>
  );
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="big-ic">{icon}</div>
      <h3 style={{ fontSize: 16, marginBottom: 6 }}>{title}</h3>
      <p className="small">{desc}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
