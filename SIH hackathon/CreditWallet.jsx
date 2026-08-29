import React from 'react';
import { useApp } from './AppContext';
import { traineeCreditTxns } from './mockData';
import { LedgerRow, StatBox } from './common';

export default function CreditWallet() {
  const { traineeBalance } = useApp();
  const earned = traineeCreditTxns.filter((t) => t.type === 'earn').reduce((n, t) => n + t.amount, 0);
  const redeemed = traineeCreditTxns.filter((t) => t.type === 'redeem').reduce((n, t) => n + Math.abs(t.amount), 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Capacity Credits</h1>
          <p className="desc">Earn CC by completing courses, passing quizzes, and staying consistent. Redeem them in the Rewards Marketplace.</p>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <StatBox num={`${traineeBalance.toLocaleString()} CC`} label="Current balance" />
        <StatBox num={`${earned.toLocaleString()} CC`} label="Total earned" trend="↑ lifetime" />
        <StatBox num={`${redeemed.toLocaleString()} CC`} label="Total redeemed" />
      </div>

      <div className="ledger">
        <div className="ledger-head">
          <div className="label">Capacity Credits Passbook</div>
          <div className="balance">{traineeBalance.toLocaleString()} CC</div>
        </div>
        {traineeCreditTxns.map((t) => (
          <LedgerRow key={t.id} icon={t.icon} title={t.label} date={t.date} amount={t.amount} />
        ))}
      </div>
    </div>
  );
}
