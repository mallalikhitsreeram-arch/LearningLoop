import React, { useState } from 'react';
import { Heart, ArrowRight, X } from 'lucide-react';

/**
 * TestResultSupportPrompt
 * Shown after a low test score (< 60%).
 * Props:
 *   score         — number (0-100)
 *   testName      — string
 *   onNavigate    — (tab: string) => void
 *   onDismiss     — () => void
 */
export const TestResultSupportPrompt = ({ score, testName, onNavigate, onDismiss }) => {
  const [mood, setMood] = useState(null);
  const [responded, setResponded] = useState(false);

  const MOODS = [
    { label: "I'm okay",        emoji: '😊', value: 4, color: '#27AE60' },
    { label: 'A little stressed', emoji: '😐', value: 3, color: '#F39C12' },
    { label: "I'm stressed",    emoji: '😟', value: 2, color: '#E67E22' },
    { label: 'I feel overwhelmed', emoji: '😣', value: 1, color: '#E74C3C' },
  ];

  const handleMood = (m) => {
    setMood(m);
    setResponded(true);
  };

  if (!responded) {
    return (
      <div style={{
        borderRadius: '14px', padding: '20px 24px', marginTop: '20px',
        background: 'linear-gradient(135deg, #FFF8F0, #fff)',
        border: '1.5px solid #FDD49B', position: 'relative',
      }}>
        <button onClick={onDismiss} style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--text-muted)' }}>
          <X size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
          <Heart size={20} color="#E67E22" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.94rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {score <= 40
                ? "Let's work through this together."
                : "You're closer than you think — let's keep going."}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              You didn't get the result you wanted this time. That's okay — every attempt is a step forward.
            </div>
          </div>
        </div>
        <div style={{ fontWeight: '600', fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Are you feeling okay about this result?
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {MOODS.map(m => (
            <button key={m.value} onClick={() => handleMood(m)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
              border: `1.5px solid ${m.color}40`, background: `${m.color}10`,
              color: m.color, cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${m.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${m.color}10`; }}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Okay → normal encouragement
  if (mood?.value >= 4) {
    return (
      <div style={{ borderRadius: '14px', padding: '18px 22px', marginTop: '20px', background: '#E8FBF2', border: '1.5px solid #A9E6C5' }}>
        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#27AE60', marginBottom: '6px' }}>
          Great attitude! 💪
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Let's understand what made this test difficult and work through it together.
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ fontSize: '0.82rem' }} onClick={() => onNavigate?.('practice')}>✏️ Start Practice</button>
          <button className="btn-secondary" style={{ fontSize: '0.82rem' }} onClick={() => onNavigate?.('progress')}>📊 View Weak Topics</button>
          <button className="btn-secondary" style={{ fontSize: '0.82rem' }} onClick={onDismiss}>Continue</button>
        </div>
      </div>
    );
  }

  // Stressed/Overwhelmed → wellbeing support
  return (
    <div style={{ borderRadius: '14px', padding: '18px 22px', marginTop: '20px', background: 'linear-gradient(135deg, #FFF8F0, #FFF0F7)', border: '1.5px solid #F5B5B0', position: 'relative' }}>
      <button onClick={onDismiss} style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--text-muted)' }}><X size={16} /></button>
      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
        {mood.emoji} We hear you.
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
        Feeling {mood.label.toLowerCase()} after a test result is completely normal. Let's take a moment in the Reset Room — it's a calm space designed to help you understand the challenge and find a way forward.
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className="btn-primary" style={{ fontSize: '0.82rem', background: 'linear-gradient(135deg, #E67E22, #D35400)' }}
          onClick={() => onNavigate?.('wellbeing')}>
          🧘 Open Reset Room <ArrowRight size={13} />
        </button>
        <button className="btn-secondary" style={{ fontSize: '0.82rem' }} onClick={() => onNavigate?.('practice')}>✏️ View Weak Topics</button>
        <button className="btn-secondary" style={{ fontSize: '0.82rem' }} onClick={onDismiss}>Skip for now</button>
      </div>
    </div>
  );
};
