import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from './AppContext';
import { Modal, EmptyState } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function Certificates() {
  const { token, user } = useApp();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewing, setViewing] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const fetchCerts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/certificates/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load certificates');
      setCertificates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchCerts(); }, [fetchCerts]);

  async function handleVerify(cert) {
    setVerifying(cert);
    setVerifyLoading(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`${API_URL}/certificates/verify/${cert.certId}`);
      const data = await res.json();
      setVerifyResult(data);
    } catch (err) {
      setVerifyResult({ valid: false, message: 'Could not reach verification service.' });
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>My Certificates</h1>
          <p className="desc">Certificates issued for courses you've successfully completed.</p>
        </div>
      </div>

      {loading && <p className="small muted">Loading certificates…</p>}
      {error && <p className="small" style={{ color: 'var(--coral)' }}>{error}</p>}

      {!loading && !error && certificates.length === 0 && (
        <EmptyState icon="📜" title="No certificates yet" desc="Complete a course and pass its quiz to earn your first certificate." />
      )}

      {!loading && !error && certificates.length > 0 && (
        <div className="grid grid-3">
          {certificates.map((c) => (
            <div key={c._id} className="cert-card">
              <div style={{ fontSize: 22 }}>📜</div>
              <h3 style={{ fontSize: 15, marginTop: 8 }}>{c.course?.title}</h3>
              <div className="small muted" style={{ marginTop: 6 }}>Completed {new Date(c.issuedAt).toLocaleDateString()}</div>
              <div className="small mono muted">ID: {c.certId}</div>
              <div className="small" style={{ marginTop: 6 }}>Score: <strong>{c.score}%</strong></div>
              <div className="flex gap-8" style={{ marginTop: 14 }}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setViewing(c)}>View</button>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => alert(`Downloading ${c.certId}.pdf (not yet implemented)`)}>Download</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleVerify(c)}>Verify</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <Modal title="Certificate Preview" onClose={() => setViewing(null)} wide>
          <div style={{ border: '3px double var(--saffron)', borderRadius: 8, padding: 32, textAlign: 'center', background: 'var(--paper)' }}>
            <div className="small mono muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Capacity Connect · Certificate of Completion</div>
            <h2 style={{ marginTop: 16, fontSize: 22 }}>{viewing.course?.title}</h2>
            <p className="small muted" style={{ marginTop: 10 }}>Awarded to <strong>{user?.name || 'You'}</strong> for successfully completing this course with a score of {viewing.score}%.</p>
            <p className="small mono muted" style={{ marginTop: 18 }}>Certificate ID: {viewing.certId} &nbsp;·&nbsp; Issued: {new Date(viewing.issuedAt).toLocaleDateString()}</p>
          </div>
        </Modal>
      )}

      {verifying && (
        <Modal title="Verify Certificate" onClose={() => { setVerifying(null); setVerifyResult(null); }}
          footer={<button className="btn btn-outline" onClick={() => { setVerifying(null); setVerifyResult(null); }}>Close</button>}>
          {verifyLoading && <p className="small muted">Checking registry…</p>}
          {!verifyLoading && verifyResult?.valid && (
            <div className="flex gap-10 items-center" style={{ background: 'var(--teal-soft)', padding: 14, borderRadius: 8 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Certificate Verified</div>
                <div className="small muted">ID {verifyResult.certId} matches Capacity Connect's issuance registry for {verifyResult.holderName}.</div>
              </div>
            </div>
          )}
          {!verifyLoading && verifyResult && !verifyResult.valid && (
            <div className="flex gap-10 items-center" style={{ background: 'var(--coral-soft)', padding: 14, borderRadius: 8 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Not Verified</div>
                <div className="small muted">{verifyResult.message || 'This certificate could not be verified.'}</div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
