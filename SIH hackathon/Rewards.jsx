import React, { useState } from 'react';
import { useApp } from './AppContext';
import { rewards, redemptionHistory as initialHistory } from './mockData';
import { Modal } from './common';

export default function Rewards() {
  const { traineeBalance, setTraineeBalance } = useApp();
  const [confirming, setConfirming] = useState(null);
  const [history, setHistory] = useState(initialHistory);
  const [toast, setToast] = useState(null);

  const redeem = () => {
    setTraineeBalance((b) => b - confirming.cost);
    setHistory((h) => [{ id: `rh-${Date.now()}`, title: confirming.title, cost: confirming.cost, date: new Date().toISOString().slice(0, 10), status: 'Processing' }, ...h]);
    setToast(confirming.title);
    setConfirming(null);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Rewards Marketplace</h1>
          <p className="desc">Redeem your Capacity Credits for learning perks and recognition.</p>
        </div>
        <div className="credit-pill" style={{ background: 'var(--navy-deep)' }}><span className="dot" /> Balance: {traineeBalance.toLocaleString()} CC</div>
      </div>

      {toast && (
        <div className="card card-pad" style={{ background: 'var(--teal-soft)', borderColor: 'var(--teal)', marginBottom: 16 }}>
          <strong className="small">Redeemed:</strong> <span className="small">{toast} — request sent for processing.</span>
        </div>
      )}

      <div className="grid grid-3">
        {rewards.map((r) => {
          const affordable = traineeBalance >= r.cost;
          return (
            <div key={r.id} className="card card-pad flex-col gap-10">
              <div style={{ fontSize: 28 }}>{r.icon}</div>
              <h3 style={{ fontSize: 15 }}>{r.title}</h3>
              <p className="small muted">{r.desc}</p>
              <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: 8 }}>
                <span className="mono" style={{ fontWeight: 700 }}>{r.cost.toLocaleString()} CC</span>
                <button className="btn btn-accent btn-sm" disabled={!affordable} onClick={() => setConfirming(r)}>Redeem</button>
              </div>
              {!affordable && <span className="small muted">Need {(r.cost - traineeBalance).toLocaleString()} more CC</span>}
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
            {history.map((h) => (
              <tr key={h.id}>
                <td>{h.title}</td>
                <td className="mono">{h.cost.toLocaleString()} CC</td>
                <td className="mono small">{h.date}</td>
                <td><span className="pill">{h.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirming && (
        <Modal title="Confirm Redemption?" onClose={() => setConfirming(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setConfirming(null)}>Cancel</button>
            <button className="btn btn-accent" onClick={redeem}>Confirm Redemption</button>
          </>}>
          <p className="small">You're about to redeem <strong>{confirming.title}</strong> for <strong>{confirming.cost.toLocaleString()} CC</strong>.</p>
          <div className="divider" />
          <div className="flex justify-between small"><span>Balance</span><span className="mono">{traineeBalance.toLocaleString()} CC</span></div>
          <div className="flex justify-between small"><span>After redemption</span><span className="mono">{(traineeBalance - confirming.cost).toLocaleString()} CC</span></div>
        </Modal>
      )}
    </div>
  );
}
