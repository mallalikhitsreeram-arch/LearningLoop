import React from 'react';
import { Target, CheckCircle, AlertTriangle, BarChart3, BookOpen, LayoutDashboard, RefreshCw } from 'lucide-react';

const TYPE_LABELS = {
  study:     { label: 'Study Session',    emoji: '📚' },
  practice:  { label: 'Practice Session', emoji: '✏️'  },
  mock_test: { label: 'Mock Test',        emoji: '📝' },
  exam:      { label: 'Exam Mode',        emoji: '🔒' },
};

const durationLabel = (session) => {
  if (!session?.startTime || !session?.endTime) return 'Unknown';
  const startMs = new Date(session.startTime).getTime();
  const endMs = new Date(session.endTime).getTime();
  const mins = Math.round((endMs - startMs) / 60000);
  return `${mins} minute${mins !== 1 ? 's' : ''}`;
};

export const FocusEndScreen = ({ session, endReason, onNavigate }) => {
  const isCompleted   = endReason === 'completed';
  const isTestViolated = endReason === 'violated_test';
  const isStudyViolated = endReason === 'violated_study';
  const isTestType    = ['mock_test', 'exam', 'practice'].includes(session?.sessionType);

  const typeInfo = TYPE_LABELS[session?.sessionType] || TYPE_LABELS.study;

  // ── COMPLETED NATURALLY ───────────────────────────────────────────────────
  if (isCompleted) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, #0A1F12, #071512)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: 'Outfit, sans-serif', padding: '24px', zIndex: 9999,
        animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(39,174,96,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 0 40px rgba(39,174,96,0.3)' }}>
          <CheckCircle size={44} color="#27AE60" />
        </div>

        <div style={{ fontSize: 'clamp(1.6rem,5vw,2.4rem)', fontWeight: '900', textAlign: 'center', marginBottom: '6px' }}>
          🎯 Focus Session Completed!
        </div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
          Great work. You stayed focused.
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <StatBox label="Duration" value={durationLabel(session)} color="#27AE60" />
          <StatBox label="Violations" value={`${session?.violations ?? 0}`} color={session?.violations === 0 ? '#4A90E2' : '#F39C12'} />
          <StatBox label="Activity" value={`${typeInfo.emoji} ${typeInfo.label}`} color="#9B59B6" />
        </div>

        {session?.activity && (
          <div style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.4)', marginBottom: '24px', fontStyle: 'italic' }}>
            "{session.activity}"
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <ActionBtn label="📊 View Progress" color="#9B59B6" onClick={() => onNavigate('progress')} />
          <ActionBtn label="📚 Continue Learning" color="#4A90E2" onClick={() => onNavigate('dashboard')} primary />
          <ActionBtn label="🏠 Dashboard" color="rgba(255,255,255,0.15)" onClick={() => onNavigate('dashboard')} ghost />
        </div>
      </div>
    );
  }

  // ── VIOLATED — TEST SUBMITTED ─────────────────────────────────────────────
  if (isTestViolated) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, #1A0505, #0F0000)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: 'Outfit, sans-serif', padding: '24px', zIndex: 9999,
        animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(231,76,60,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <AlertTriangle size={38} color="#E74C3C" />
        </div>

        <div style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: '900', textAlign: 'center', marginBottom: '8px' }}>
          Focus Violation Limit Reached
        </div>
        <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: '380px', marginBottom: '10px' }}>
          You have reached the maximum number of allowed interruptions.
        </div>
        <div style={{ fontSize: '1rem', fontWeight: '700', color: '#FF6B6B', marginBottom: '32px', padding: '10px 20px', background: 'rgba(231,76,60,0.15)', borderRadius: '10px', border: '1px solid rgba(231,76,60,0.3)' }}>
          📝 Your test session has been submitted automatically.
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <StatBox label="Violations" value={`${session?.violations} / ${session?.violationLimit}`} color="#E74C3C" />
          <StatBox label="Status" value="SUBMITTED" color="#E67E22" />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <ActionBtn label="📊 View Result" color="#E74C3C" onClick={() => onNavigate('tests')} primary />
          <ActionBtn label="🏠 Dashboard" color="rgba(255,255,255,0.12)" onClick={() => onNavigate('dashboard')} ghost />
        </div>
      </div>
    );
  }

  // ── VIOLATED — STUDY/PRACTICE SESSION ENDED ───────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, #1A1008, #0F0A00)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'Outfit, sans-serif', padding: '24px', zIndex: 9999,
      animation: 'fadeIn 0.4s ease',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏸️</div>
      <div style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: '900', textAlign: 'center', marginBottom: '6px' }}>
        Focus Session Ended
      </div>
      <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: '360px', marginBottom: '32px' }}>
        Your interruption limit was reached. Don't worry — every attempt makes you stronger.
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <StatBox label="Violations" value={`${session?.violations} / ${session?.violationLimit}`} color="#F39C12" />
        <StatBox label="Activity" value={`${typeInfo.emoji} ${typeInfo.label}`} color="#4A90E2" />
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <ActionBtn label="📚 Continue Learning" color="#4A90E2" onClick={() => onNavigate('dashboard')} primary />
        <ActionBtn label="🔄 Try Again" color="#27AE60" onClick={() => onNavigate('focusmode')} />
        <ActionBtn label="🏠 Dashboard" color="rgba(255,255,255,0.12)" onClick={() => onNavigate('dashboard')} ghost />
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const StatBox = ({ label, value, color }) => (
  <div style={{
    textAlign: 'center', padding: '14px 20px', borderRadius: '12px',
    background: `${color}15`, border: `1.5px solid ${color}40`,
    minWidth: '100px',
  }}>
    <div style={{ fontSize: '1.3rem', fontWeight: '900', color }}>{value}</div>
    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '3px', letterSpacing: '0.06em' }}>{label}</div>
  </div>
);

const ActionBtn = ({ label, color, onClick, primary, ghost }) => (
  <button onClick={onClick} style={{
    padding: '12px 22px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem',
    cursor: 'pointer', border: ghost ? '1.5px solid rgba(255,255,255,0.2)' : 'none',
    background: ghost ? 'transparent' : color,
    color: ghost ? 'rgba(255,255,255,0.6)' : '#fff',
    boxShadow: primary ? `0 4px 20px ${color}40` : 'none',
    transition: 'all 0.15s',
  }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
  >
    {label}
  </button>
);
