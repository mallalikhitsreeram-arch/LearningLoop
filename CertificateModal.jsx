import React from 'react';
import { Award, CheckCircle2, Download, Printer, X, ShieldCheck } from 'lucide-react';

export const CertificateModal = ({ certificate, onClose }) => {
  if (!certificate) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', width: '95%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--accent-primary)" />
            <h4 className="modal-title">Verified Certificate of Completion</h4>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '32px' }}>
          {/* Printable / Visual Certificate Box */}
          <div
            id="printable-certificate"
            style={{
              border: '8px double #1E2022',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 32px',
              textAlign: 'center',
              backgroundColor: '#FAF8F5',
              position: 'relative'
            }}
          >
            {/* Top Emblem */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1E2022', color: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={28} />
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '0.04em', color: '#1E2022', textTransform: 'uppercase' }}>
              LEARNING LOOPS
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '20px' }}>
              Smart Education &amp; Continuous Learning Foundation
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '8px' }}>
              This certifies that
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: '800', color: '#1E2022', borderBottom: '2px solid #EAE7E0', paddingBottom: '8px', display: 'inline-block', minWidth: '320px', marginBottom: '16px' }}>
              {certificate.studentName}
            </div>

            <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 16px', lineHeight: '1.5' }}>
              has successfully completed all modules, practical assessments, and verified laboratory coursework for:
            </div>

            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent-navy)', marginBottom: '8px' }}>
              {certificate.courseTitle}
            </div>

            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '28px' }}>
              Grade: <strong>{certificate.score}</strong> • Issued on {certificate.completionDate}
            </div>

            {/* Bottom Signatures & Verification */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #EAE7E0', paddingTop: '18px', fontSize: '0.8rem' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', color: '#1E2022' }}>{certificate.signature}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Academic Director</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={20} color="var(--accent-sage)" />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {certificate.id}</span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', color: '#1E2022' }}>Aarav Sharma</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Student Signature</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => window.print()}>
            <Printer size={16} /> Print / Save as PDF
          </button>
          <button className="btn-primary" onClick={() => { alert(`Certificate ${certificate.id} downloaded successfully!`); onClose(); }}>
            <Download size={16} /> Download Official Certificate
          </button>
        </div>
      </div>
    </div>
  );
};
