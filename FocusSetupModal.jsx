import React, { useState } from 'react';
import { X, Target, Clock, AlertCircle, BookOpen, CheckSquare, FileText, Zap } from 'lucide-react';

const SESSION_TYPES = [
  { key: 'study',     label: 'Study Session',    emoji: '📚', desc: 'Read, watch, and learn', color: '#4A90E2' },
  { key: 'practice',  label: 'Practice Session',  emoji: '✏️', desc: 'Solve problems and practice', color: '#27AE60' },
  { key: 'mock_test', label: 'Mock Test',          emoji: '📝', desc: 'Simulate exam conditions', color: '#E67E22' },
  { key: 'exam',      label: 'Exam Mode',          emoji: '🔒', desc: 'Strict fullscreen monitoring', color: '#E74C3C' },
];

const DURATIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: 'Custom', value: 'custom' },
];

const VIOLATION_LIMITS = [
  { label: '3 violations', value: 3 },
  { label: '5 violations', value: 5 },
  { label: '10 violations', value: 10 },
];

export const FocusSetupModal = ({ onStart, onClose }) => {
  const [sessionType, setSessionType] = useState('study');
  const [duration, setDuration]       = useState(30);
  const [customMin, setCustomMin]      = useState(25);
  const [limit, setLimit]             = useState(3);
  const [activity, setActivity]       = useState('');

  const selectedType = SESSION_TYPES.find(t => t.key === sessionType);
  const finalDuration = duration === 'custom' ? Math.max(5, Math.min(180, customMin)) : duration;

  const handleStart = () => {
    onStart({
      sessionType,
      durationMinutes: finalDuration,
      violationLimit: limit,
      activity: activity || selectedType.label,
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,41,0.75)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9000, padding: '16px',
    }}>
      <div style={{
        background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '20px', width: '100%', maxWidth: '540px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.3rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={22} color="#4A90E2" /> Set Your Focus Session
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Configure your distraction-free study session
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', color: 'var(--text-muted)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* Session Type */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
              📌 Session Type
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {SESSION_TYPES.map(t => (
                <button key={t.key} onClick={() => setSessionType(t.key)} style={{
                  padding: '12px 14px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                  border: `2px solid ${sessionType === t.key ? t.color : 'var(--border-subtle)'}`,
                  background: sessionType === t.key ? `${t.color}12` : 'var(--bg-surface)',
                  transition: 'all 0.15s ease',
                }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{t.emoji}</div>
                  <div style={{ fontWeight: '700', fontSize: '0.86rem', color: sessionType === t.key ? t.color : 'var(--text-primary)' }}>{t.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                </button>
              ))}
            </div>
            {sessionType === 'exam' && (
              <div style={{ marginTop: '8px', padding: '10px 12px', background: '#FDEDEC', borderRadius: '8px', border: '1px solid #F5B5B0', fontSize: '0.78rem', color: '#C0392B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> Exam Mode requests fullscreen. Exiting fullscreen counts as a violation.
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
              ⏱️ Session Duration
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DURATIONS.map(d => (
                <button key={d.value} onClick={() => setDuration(d.value)} style={{
                  padding: '8px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: `1.5px solid ${duration === d.value ? '#4A90E2' : 'var(--border-subtle)'}`,
                  background: duration === d.value ? '#EBF3FD' : 'var(--bg-surface)',
                  color: duration === d.value ? '#4A90E2' : 'var(--text-secondary)',
                }}>
                  {d.label}
                </button>
              ))}
            </div>
            {duration === 'custom' && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="number" min="5" max="180" value={customMin}
                  onChange={e => setCustomMin(Number(e.target.value))}
                  style={{ width: '80px', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid var(--border-subtle)', fontSize: '0.88rem', textAlign: 'center' }}
                />
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>minutes (5–180)</span>
              </div>
            )}
          </div>

          {/* Violation Limit */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              ⚠️ Maximum Violations Allowed
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Switching tabs, minimising, or exiting fullscreen counts as a violation.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {VIOLATION_LIMITS.map(v => (
                <button key={v.value} onClick={() => setLimit(v.value)} style={{
                  padding: '8px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: `1.5px solid ${limit === v.value ? '#E74C3C' : 'var(--border-subtle)'}`,
                  background: limit === v.value ? '#FDEDEC' : 'var(--bg-surface)',
                  color: limit === v.value ? '#E74C3C' : 'var(--text-secondary)',
                }}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity label */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              📋 Current Activity (optional)
            </div>
            <input
              type="text"
              className="form-input"
              placeholder={`e.g. Python Loops Practice, Chapter 5 Revision...`}
              value={activity}
              onChange={e => setActivity(e.target.value)}
              maxLength={80}
            />
          </div>

          {/* Summary */}
          <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#F0F7FF', border: '1.5px solid #BFDFFF' }}>
            <div style={{ fontWeight: '700', fontSize: '0.84rem', color: '#1E3A5F', marginBottom: '8px' }}>Session Summary</div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.8rem' }}>
              <span><strong>Type:</strong> {selectedType?.emoji} {selectedType?.label}</span>
              <span><strong>Duration:</strong> {duration === 'custom' ? `${customMin} min` : `${duration} min`}</span>
              <span><strong>Violations:</strong> Max {limit}</span>
            </div>
          </div>

          {/* Start button */}
          <button onClick={handleStart} style={{
            padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem',
            color: '#fff', background: `linear-gradient(135deg, ${selectedType?.color || '#4A90E2'}, ${selectedType?.color || '#2E75CC'}cc)`,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', boxShadow: `0 4px 20px ${selectedType?.color || '#4A90E2'}40`,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${selectedType?.color || '#4A90E2'}50`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 20px ${selectedType?.color || '#4A90E2'}40`; }}
          >
            <Target size={18} /> START FOCUS MODE
          </button>
        </div>
      </div>
    </div>
  );
};
