import React, { useState } from 'react';

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,165,0,0.5); }
          70% { box-shadow: 0 0 0 12px rgba(255,165,0,0); }
        }
      `}</style>

      <div
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--navy), var(--teal))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, cursor: 'pointer',
          animation: 'float 3s ease-in-out infinite, pulse 2.5s infinite',
          boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
        }}
        title="Ask AI (Coming Soon)"
      >
        🤖
      </div>

      {open && (
        <div style={{
          position: 'fixed', bottom: 100, right: 24, zIndex: 1000,
          width: 300, background: '#fff', borderRadius: 14,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--navy), var(--teal))',
            color: '#fff', padding: '14px 16px', fontWeight: 700,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>🤖 AI Doubt Solver</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setOpen(false)}>✕</span>
          </div>
          <div style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🚧</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>Coming Soon!</p>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
              Our AI assistant will soon answer your course doubts instantly,
              right here — 24/7.
            </p>
          </div>
        </div>
      )}
    </>
  );
}