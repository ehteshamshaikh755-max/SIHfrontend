import React, { useState } from 'react';
import { certificates } from './mockData';
import { Modal, EmptyState } from './common';

export default function Certificates() {
  const [viewing, setViewing] = useState(null);
  const [verifying, setVerifying] = useState(null);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>My Certificates</h1>
          <p className="desc">Certificates issued for courses you've successfully completed.</p>
        </div>
      </div>

      {certificates.length === 0 && <EmptyState icon="📜" title="No certificates yet" desc="Complete a course to earn your first certificate." />}

      <div className="grid grid-3">
        {certificates.map((c) => (
          <div key={c.id} className="cert-card">
            <div style={{ fontSize: 22 }}>📜</div>
            <h3 style={{ fontSize: 15, marginTop: 8 }}>{c.course}</h3>
            <div className="small muted" style={{ marginTop: 6 }}>Completed {c.date}</div>
            <div className="small mono muted">ID: {c.certId}</div>
            <div className="small" style={{ marginTop: 6 }}>Score: <strong>{c.score}%</strong></div>
            <div className="flex gap-8" style={{ marginTop: 14 }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setViewing(c)}>View</button>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => alert(`Downloading ${c.certId}.pdf (simulated)`)}>Download</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setVerifying(c)}>Verify</button>
            </div>
          </div>
        ))}
      </div>

      {viewing && (
        <Modal title="Certificate Preview" onClose={() => setViewing(null)} wide>
          <div style={{ border: '3px double var(--saffron)', borderRadius: 8, padding: 32, textAlign: 'center', background: 'var(--paper)' }}>
            <div className="small mono muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Capacity Connect · Certificate of Completion</div>
            <h2 style={{ marginTop: 16, fontSize: 22 }}>{viewing.course}</h2>
            <p className="small muted" style={{ marginTop: 10 }}>Awarded to <strong>You</strong> for successfully completing this course with a score of {viewing.score}%.</p>
            <p className="small mono muted" style={{ marginTop: 18 }}>Certificate ID: {viewing.certId} &nbsp;·&nbsp; Issued: {viewing.date}</p>
          </div>
        </Modal>
      )}

      {verifying && (
        <Modal title="Verify Certificate" onClose={() => setVerifying(null)}
          footer={<button className="btn btn-outline" onClick={() => setVerifying(null)}>Close</button>}>
          <div className="flex gap-10 items-center" style={{ background: 'var(--teal-soft)', padding: 14, borderRadius: 8 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Certificate Verified</div>
              <div className="small muted">ID {verifying.certId} matches Capacity Connect's issuance registry.</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
