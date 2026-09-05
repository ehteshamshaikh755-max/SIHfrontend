import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from './AppContext';
import { Modal } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function Rewards() {
  const { token } = useApp();
  const [balance, setBalance] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [confirming, setConfirming] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [walletRes, rewardsRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/wallet/mine`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/rewards`),
        fetch(`${API_URL}/redemptions/mine`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const walletData = await walletRes.json();
      const rewardsData = await rewardsRes.json();
      const historyData = await historyRes.json();
      if (!walletRes.ok) throw new Error(walletData.message || 'Failed to load wallet');
      if (!rewardsRes.ok) throw new Error(rewardsData.message || 'Failed to load rewards');

      setBalance(walletData.balance);
      setRewards(rewardsData);
      setHistory(historyRes.ok ? historyData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function redeem() {
    setRedeeming(true);
    try {
      const res = await fetch(`${API_URL}/rewards/${confirming._id}/redeem`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to redeem');

      setBalance(data.newBalance);
      setHistory((h) => [data.redemption, ...h]);
      setToast(confirming.title);
      setConfirming(null);
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      alert(err.message);
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Rewards Marketplace</h1>
          <p className="desc">Redeem your Capacity Credits for learning perks and recognition.</p>
        </div>
        <div className="credit-pill" style={{ background: 'var(--navy-deep)' }}><span className="dot" /> Balance: {balance.toLocaleString()} CC</div>
      </div>

      {loading && <p className="small muted">Loading rewards…</p>}
      {error && <p className="small" style={{ color: 'var(--coral)' }}>{error}</p>}

      {toast && (
        <div className="card card-pad" style={{ background: 'var(--teal-soft)', borderColor: 'var(--teal)', marginBottom: 16 }}>
          <strong className="small">Redeemed:</strong> <span className="small">{toast} — request sent for processing.</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-3">
            {rewards.map((r) => {
              const affordable = balance >= r.cost;
              return (
                <div key={r._id} className="card card-pad flex-col gap-10">
                  <div style={{ fontSize: 28 }}>{r.icon}</div>
                  <h3 style={{ fontSize: 15 }}>{r.title}</h3>
                  <p className="small muted">{r.desc}</p>
                  <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: 8 }}>
                    <span className="mono" style={{ fontWeight: 700 }}>{r.cost.toLocaleString()} CC</span>
                    <button className="btn btn-accent btn-sm" disabled={!affordable} onClick={() => setConfirming(r)}>Redeem</button>
                  </div>
                  {!affordable && <span className="small muted">Need {(r.cost - balance).toLocaleString()} more CC</span>}
                </div>
              );
            })}
          </div>

          <div className="divider" />
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Redemption History</h3>
          <div className="card">
            <table className="table">
              <thead><tr><th>Reward</th><th>Cost</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {history.length === 0 && (
                  <tr><td colSpan={4} className="small muted" style={{ padding: '14px 0' }}>No redemptions yet.</td></tr>
                )}
                {history.map((h) => (
                  <tr key={h._id}>
                    <td>{h.title}</td>
                    <td className="mono">{h.cost.toLocaleString()} CC</td>
                    <td className="mono small">{new Date(h.date).toLocaleDateString()}</td>
                    <td><span className="pill">{h.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {confirming && (
        <Modal title="Confirm Redemption?" onClose={() => setConfirming(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setConfirming(null)} disabled={redeeming}>Cancel</button>
            <button className="btn btn-accent" onClick={redeem} disabled={redeeming}>
              {redeeming ? 'Redeeming…' : 'Confirm Redemption'}
            </button>
          </>}>
          <p className="small">You're about to redeem <strong>{confirming.title}</strong> for <strong>{confirming.cost.toLocaleString()} CC</strong>.</p>
          <div className="divider" />
          <div className="flex justify-between small"><span>Balance</span><span className="mono">{balance.toLocaleString()} CC</span></div>
          <div className="flex justify-between small"><span>After redemption</span><span className="mono">{(balance - confirming.cost).toLocaleString()} CC</span></div>
        </Modal>
      )}
    </div>
  );
}
