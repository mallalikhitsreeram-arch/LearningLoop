import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const MESSAGES = {
  1: { title: 'Focus interrupted once.', sub: 'Stay on the task — you\'re doing great.', color: '#F39C12' },
  2: { title: 'One more violation may affect your session.', sub: 'Try to stay on this page to complete your session.', color: '#E67E22' },
  3: { title: 'Violation limit reached.', sub: '', color: '#E74C3C' },
};

export const FocusViolationModal = ({ session, onReturn }) => {
  const { violations, violationLimit } = session;
  const key = Math.min(violations, 3);
  const msg = MESSAGES[key] || MESSAGES[3];

  const isLastWarning = violations === violationLimit - 1;
  const isLimitReached = violations >= violationLimit;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 10000, padding: '16px',
    }}>
      <div style={{
        background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '32px',
        maxWidth: '400px', width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        animation: 'scaleIn 0.2s cubic-bezier(.34,1.56,.64,1)',
        transformOrigin: 'center',
      }}>

        {/* Icon */}
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `${msg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertTriangle size={26} color={msg.color} />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
          ⚠️ Focus Mode Interrupted
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          You left the learning session.
        </div>

        {/* Violation counter */}
        <div style={{
          padding: '14px 20px', borderRadius: '12px',
          background: `${msg.color}10`, border: `1.5px solid ${msg.color}40`,
          textAlign: 'center', marginBottom: '16px',
        }}>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: msg.color, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
            {violations} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ {violationLimit}</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: msg.color, fontWeight: '600', marginTop: '4px' }}>
            {msg.title}
          </div>
          {msg.sub && (
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {msg.sub}
            </div>
          )}
        </div>

        {/* Progress of violations */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ height: '6px', borderRadius: '4px', background: 'var(--bg-surface-subtle)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              width: `${Math.round((violations / violationLimit) * 100)}%`,
              background: msg.color,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Last-warning note */}
        {isLastWarning && !isLimitReached && (
          <div style={{ padding: '10px 12px', background: '#FDEDEC', borderRadius: '8px', border: '1px solid #F5B5B0', fontSize: '0.78rem', color: '#C0392B', marginBottom: '16px', textAlign: 'center' }}>
            ⚠️ One more violation will end your session
            {['mock_test','exam','practice'].includes(session.sessionType) ? ' and auto-submit your test.' : '.'}
          </div>
        )}

        <button
          onClick={onReturn}
          style={{
            width: '100%', padding: '13px', borderRadius: '12px',
            fontWeight: '700', fontSize: '0.95rem', color: '#fff',
            background: msg.color, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <ArrowLeft size={16} /> RETURN TO FOCUS
        </button>
      </div>
    </div>
  );
};
