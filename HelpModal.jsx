import React from 'react';
import { HelpCircle, X, DownloadCloud, WifiOff, RefreshCw, Flame, ShieldCheck, BookOpen, CheckCircle2 } from 'lucide-react';

export const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={20} color="var(--accent-primary)" />
            <h4 className="modal-title">Platform Guide &amp; Offline Learning FAQ</h4>
          </div>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
          {/* Philosophy Card */}
          <div style={{ padding: '16px', background: 'var(--accent-primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid #F6D8CD' }}>
            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--accent-primary)', marginBottom: '4px' }}>
              WHERE YOUR EVERY CONTRIBUTION COUNTS
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
              LEARN → PRACTICE → TRACK → IMPROVE → ACHIEVE → REPEAT
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Learning Loops is engineered specifically for students facing spotty connectivity, limited daily data quotas, or shared mobile devices. Education should never stop simply because the internet does.
            </p>
          </div>

          {/* Workflow steps */}
          <div>
            <h3 className="section-title" style={{ marginBottom: '12px' }}>How Offline Learning Works</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--accent-navy)', marginBottom: '6px' }}>
                  <DownloadCloud size={16} /> 1. Connect &amp; Download
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  When connected to Wi-Fi or 4G, click <strong>Download Course</strong>. Choose "Lessons Only" (~15MB) or full interactive packages into IndexedDB.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.88rem', color: '#D97706', marginBottom: '6px' }}>
                  <WifiOff size={16} /> 2. Disconnect &amp; Study
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  Disconnect your data. The platform automatically enters <strong>Offline Mode</strong>. All downloaded lessons, code walk-throughs, and quizzes run locally with zero latency.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--accent-sage)', marginBottom: '6px' }}>
                  <CheckCircle2 size={16} /> 3. Solve &amp; Queue Locally
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  Answer practice questions and submit mock tests offline. Your responses are evaluated locally and stored in a secure offline sync queue with unique activity IDs.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--accent-primary)', marginBottom: '6px' }}>
                  <RefreshCw size={16} /> 4. Reconnect &amp; Sync
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  Once back online, our idempotent synchronization engine uploads pending activities, credits your streak, updates your analytics, and reflects on the parent portal.
                </p>
              </div>
            </div>
          </div>

          {/* Data Saver Mode Info */}
          <div>
            <h3 className="section-title" style={{ marginBottom: '10px' }}>Data-Saving Features</h3>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <li><strong>Ultra-Low Bandwidth:</strong> Lessons default to high-density text, formatted diagrams, and 32kbps mono audio explainers.</li>
              <li><strong>Adaptive Video:</strong> When video is enabled, quality adjusts down to 144p (~3MB total per lesson).</li>
              <li><strong>Zero Duplicate Data:</strong> Cached course packages eliminate repeated round-trips over mobile networks.</li>
            </ul>
          </div>

          {/* Streaks & Shared Devices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#FFFDF9', border: '1px solid #FDE68A', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.86rem', color: '#B45309', marginBottom: '4px' }}>
                <Flame size={16} /> Streaks &amp; Freezes
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Complete at least 50% of your daily study target (or 1 practice set) to increment your streak. Automatic streak freeze protects your consistency during network outages.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.86rem', color: 'var(--accent-navy)', marginBottom: '4px' }}>
                <ShieldCheck size={16} /> Shared Device Isolation
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                When studying on a community center or college lab computer, use <strong>Secure Logout</strong> to wipe all locally stored tokens and session records.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose} style={{ marginLeft: 'auto' }}>
            Got It, Back to Learning
          </button>
        </div>
      </div>
    </div>
  );
};
