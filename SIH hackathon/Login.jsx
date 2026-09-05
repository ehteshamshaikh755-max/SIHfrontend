import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from './AppContext';

export default function Login() {
  const [lampOn, setLampOn] = useState(false);

  return (
    <div style={styles.page}>
      <div style={{ ...styles.roomGlow, opacity: lampOn ? 1 : 0 }} />
      <div style={styles.stage}>
        <DeskLamp on={lampOn} onToggle={() => setLampOn((v) => !v)} />
        <LoginForm dim={!lampOn} />
      </div>

      <style>{`
        @keyframes chainTug {
          0% { transform: translateY(0); }
          35% { transform: translateY(10px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function DeskLamp({ on, onToggle }) {
  const [tugging, setTugging] = useState(false);

  function handleClick() {
    setTugging(true);
    onToggle();
    setTimeout(() => setTugging(false), 400);
  }

  return (
    <div style={styles.lampWrap}>
      <svg width="320" height="400" viewBox="0 0 320 400" style={styles.lampSvg}>
        <defs>
          <linearGradient id="shadeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={on ? '#fff7d6' : '#e2e8f0'} />
            <stop offset="100%" stopColor={on ? '#fde68a' : '#cbd5e1'} />
          </linearGradient>
        </defs>

        {/* lampshade (narrower trapezoid) */}
        <path d="M 130 20 L 190 20 L 230 110 L 90 110 Z" fill="url(#shadeGrad)" stroke="#94a3b8" strokeWidth="2" />
        {/* neck joint under shade */}
        <circle cx="160" cy="118" r="9" fill="#475569" />
        {/* pole (longer) */}
        <rect x="153" y="118" width="14" height="230" fill="#64748b" />
        {/* base */}
        <rect x="80" y="348" width="160" height="16" rx="6" fill="#475569" />
        <rect x="55" y="364" width="210" height="14" rx="6" fill="#334155" />

        {/* pull chain, hangs from inside the shade */}
        <g
          onClick={handleClick}
          style={{ cursor: 'pointer', animation: tugging ? 'chainTug 0.4s ease' : 'none' }}
        >
          <line x1="160" y1="55" x2="160" y2="155" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="160" cy="161" r="10" fill={on ? '#fbbf24' : '#94a3b8'} stroke="#475569" strokeWidth="1.5" />
        </g>
      </svg>
      <p style={styles.lampHint}>{on ? 'Tap the chain to turn off' : 'Pull the chain to light up'}</p>
    </div>
  );
}

function LoginForm({ dim }) {
  const { login, signup, authError, authLoading, setAuthError } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupRole, setSignupRole] = useState('trainee');
  const [dept, setDept] = useState('');
  const [pendingMsg, setPendingMsg] = useState('');

  function switchMode(next) {
    setMode(next);
    setAuthError('');
    setPendingMsg('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setPendingMsg('');

    if (mode === 'login') {
      const ok = await login(email, password);
      if (ok) navigate('/', { replace: true });
      return;
    }

    const result = await signup(name, email, password, signupRole, dept);
    if (result.ok && result.pendingApproval) {
      setPendingMsg('Signup successful. Your trainer account is awaiting admin approval — you can log in once approved.');
      switchMode('login');
    } else if (result.ok) {
      navigate('/', { replace: true });
    }
  }

  return (
    <div
      style={{
        ...styles.card,
        opacity: dim ? 0.35 : 1,
        filter: dim ? 'blur(1px) brightness(0.6)' : 'none',
        pointerEvents: dim ? 'none' : 'auto',
        transition: 'opacity 0.5s ease, filter 0.5s ease',
      }}
    >
      <h1 style={styles.title}>Capacity Connect</h1>
      <p style={styles.subtitle}>
        {mode === 'login' ? 'Log in to continue your learning journey' : 'Create your account'}
      </p>

      <div style={styles.tabRow}>
        <button type="button" style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }} onClick={() => switchMode('login')}>Log In</button>
        <button type="button" style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }} onClick={() => switchMode('signup')}>Sign Up</button>
      </div>

      {pendingMsg && <div style={styles.info}>{pendingMsg}</div>}
      {authError && <div style={styles.error}>{authError}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {mode === 'signup' && (
          <>
            <label style={styles.label}>
              Full Name
              <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label style={styles.label}>
              I am a
              <select style={styles.input} value={signupRole} onChange={(e) => setSignupRole(e.target.value)}>
                <option value="trainee">Trainee</option>
                <option value="trainer">Trainer</option>
              </select>
            </label>
            <label style={styles.label}>
              Department (optional)
              <input style={styles.input} value={dept} onChange={(e) => setDept(e.target.value)} />
            </label>
          </>
        )}

        <label style={styles.label}>
          Email
          <input type="email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label style={styles.label}>
          Password
          <input type="password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>

        <button type="submit" style={styles.submitBtn} disabled={authLoading}>
          {authLoading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    padding: '24px',
    fontFamily: 'inherit',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    position: 'relative',
    overflowX: 'hidden',
  },
  roomGlow: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse 90% 90% at 22% 40%, rgba(253,230,138,0.65) 0%, rgba(253,230,138,0.25) 35%, rgba(15,23,42,0) 70%)',
    transition: 'opacity 0.7s ease',
    pointerEvents: 'none',
    zIndex: 0,
  },
  stage: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8vw',
    position: 'relative',
    zIndex: 1,
    flexWrap: 'nowrap',
    width: '100%',
    maxWidth: 1100,
  },
  lampWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  lampSvg: {
    userSelect: 'none',
  },
  lampHint: {
    color: '#64748b',
    fontSize: 13,
    margin: '4px 0 0',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: '#ffffff',
    borderRadius: 16,
    padding: '32px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    margin: '8px 0 24px',
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  tabRow: {
    display: 'flex',
    marginBottom: 20,
    borderRadius: 10,
    background: '#f1f5f9',
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: '10px',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    fontFamily: 'inherit',
  },
  tabActive: {
    background: '#2563eb',
    color: '#fff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
    gap: 6,
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#1e293b',
    fontSize: 14,
    fontFamily: 'inherit',
  },
  submitBtn: {
    marginTop: 8,
    padding: '12px',
    borderRadius: 8,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  error: {
    background: '#fef2f2',
    color: '#b91c1c',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: 600,
  },
  info: {
    background: '#f0fdf4',
    color: '#15803d',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: 600,
  },
};
