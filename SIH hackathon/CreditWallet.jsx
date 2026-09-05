import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from './AppContext';
import { LedgerRow, StatBox } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function CreditWallet() {
  const { token } = useApp();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/wallet/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load wallet');
      setBalance(data.balance);
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const earned = transactions.filter((t) => t.type === 'earn').reduce((n, t) => n + t.amount, 0);
  const redeemed = transactions.filter((t) => t.type === 'redeem').reduce((n, t) => n + Math.abs(t.amount), 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Capacity Credits</h1>
          <p className="desc">Earn CC by completing courses, passing quizzes, and staying consistent. Redeem them in the Rewards Marketplace.</p>
        </div>
      </div>

      {loading && <p className="small muted">Loading wallet…</p>}
      {error && <p className="small" style={{ color: 'var(--coral)' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-3" style={{ marginBottom: 20 }}>
            <StatBox num={`${balance.toLocaleString()} CC`} label="Current balance" />
            <StatBox num={`${earned.toLocaleString()} CC`} label="Total earned" trend="↑ lifetime" />
            <StatBox num={`${redeemed.toLocaleString()} CC`} label="Total redeemed" />
          </div>

          <div className="ledger">
            <div className="ledger-head">
              <div className="label">Capacity Credits Passbook</div>
              <div className="balance">{balance.toLocaleString()} CC</div>
            </div>
            {transactions.length === 0 && <p className="small muted" style={{ padding: '14px 0' }}>No transactions yet — complete a course or pass a quiz to start earning.</p>}
            {transactions.map((t) => (
              <LedgerRow key={t._id} icon={t.icon} title={t.label} date={new Date(t.date).toLocaleDateString()} amount={t.amount} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
