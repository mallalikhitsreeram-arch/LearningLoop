import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Target, Flame, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';

const pad = n => String(n).padStart(2, '0');

const formatTime = (ms) => {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
};

const TYPE_CONFIG = {
  study:     { label: 'Study Session',   emoji: '📚', color: '#4A90E2', bg: '#0A1929' },
  practice:  { label: 'Practice Session',emoji: '✏️',  color: '#27AE60', bg: '#071A12' },
  mock_test: { label: 'Mock Test',       emoji: '📝', color: '#E67E22', bg: '#1A0E02' },
  exam:      { label: 'Exam Mode',       emoji: '🔒', color: '#E74C3C', bg: '#1A0505' },
};

export const FocusActiveScreen = ({ session, onViolation, onComplete, onAbandon }) => {
  const { endTime, sessionType, violations, violationLimit, activity } = session;
  const cfg = TYPE_CONFIG[sessionType] || TYPE_CONFIG.study;

  const [remaining, setRemaining] = useState(() => Math.max(new Date(endTime) - Date.now(), 0));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const violationActiveRef = useRef(false);

  const endMs = new Date(endTime).getTime();
  const totalMs = endMs - new Date(session.startTime).getTime();
  const pct = Math.round(((totalMs - remaining) / totalMs) * 100);

  // ── Countdown ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const left = Math.max(new Date(endTime) - Date.now(), 0);
      setRemaining(left);
      if (left === 0) onComplete();
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [endTime, onComplete]);

  // ── Exam Mode: request fullscreen ─────────────────────────────────────────
  useEffect(() => {
    if (sessionType === 'exam' && containerRef.current) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    }
  }, [sessionType]);

  // ── Violation detection ───────────────────────────────────────────────────
  const triggerViolation = useCallback(() => {
    if (violationActiveRef.current) return;
    violationActiveRef.current = true;
    onViolation();
    setTimeout(() => { violationActiveRef.current = false; }, 2500);
  }, [onViolation]);

  useEffect(() => {
    // Page Visibility API
    const onVisibility = () => {
      if (document.hidden) triggerViolation();
    };
    // Window blur (tab switch, alt+tab)
    const onBlur = () => triggerViolation();
    // Fullscreen exit (exam mode)
    const onFsChange = () => {
      const full = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(full);
      if (sessionType === 'exam' && !full) triggerViolation();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, [sessionType, triggerViolation]);

  const violationPct = Math.round((violations / violationLimit) * 100);
  const violationColor = violations === 0 ? '#27AE60' : violations < violationLimit ? '#F39C12' : '#E74C3C';

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: `radial-gradient(ellipse at 30% 20%, ${cfg.color}18, ${cfg.bg} 60%)`,
      backgroundColor: cfg.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'Outfit, Inter, sans-serif', padding: '24px',
      animation: 'fadeIn 0.3s ease',
    }}>

      {/* Header badge */}
      <div style={{
        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
        background: `${cfg.color}22`, border: `1.5px solid ${cfg.color}60`,
        borderRadius: '40px', padding: '8px 20px', display: 'flex', alignItems: 'center',
        gap: '8px', backdropFilter: 'blur(8px)',
      }}>
        <Target size={16} color={cfg.color} />
        <span style={{ fontWeight: '800', fontSize: '0.88rem', color: cfg.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          FOCUS MODE ACTIVE
        </span>
        <span style={{ fontSize: '0.88rem' }}>🎯</span>
      </div>

      {/* Session type badge */}
      <div style={{ fontSize: '1rem', color: `${cfg.color}cc`, fontWeight: '600', marginBottom: '8px', letterSpacing: '0.04em' }}>
        {cfg.emoji} {cfg.label}
      </div>

      {/* Activity */}
      {activity && (
        <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', marginBottom: '32px', fontStyle: 'italic' }}>
          "{activity}"
        </div>
      )}

      {/* ── Big Timer ── */}
      <div style={{
        fontFamily: 'Outfit, monospace', fontSize: 'clamp(3.5rem, 12vw, 7rem)',
        fontWeight: '900', letterSpacing: '-2px',
        color: remaining < 60000 ? '#FF6B6B' : '#fff',
        textShadow: remaining < 60000 ? '0 0 40px rgba(255,107,107,0.4)' : '0 0 60px rgba(255,255,255,0.1)',
        transition: 'color 0.5s ease',
        lineHeight: 1,
        marginBottom: '6px',
      }}>
        {formatTime(remaining)}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '36px', letterSpacing: '0.1em' }}>
        REMAINING
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '36px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Violations */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '6px' }}>VIOLATIONS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: violationColor, lineHeight: 1 }}>
            {violations}<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)' }}> / {violationLimit}</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: violationColor, marginTop: '3px' }}>
            {violations === 0 ? 'Stay focused!' : violations < violationLimit ? 'Stay on track' : 'Limit reached'}
          </div>
          {/* mini progress */}
          <div style={{ marginTop: '6px', width: '80px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ height: '100%', borderRadius: '2px', width: `${violationPct}%`, background: violationColor, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Progress */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '6px' }}>PROGRESS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: cfg.color, lineHeight: 1 }}>
            {pct}<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)' }}>%</span>
          </div>
          {/* progress bar */}
          <div style={{ marginTop: '8px', width: '120px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ height: '100%', borderRadius: '2px', width: `${pct}%`, background: cfg.color, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      {/* ── Fullscreen toggle ── */}
      {sessionType === 'exam' && (
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              containerRef.current?.requestFullscreen?.();
            } else {
              document.exitFullscreen?.();
            }
          }}
          style={{
            marginBottom: '16px', padding: '8px 16px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
          <Maximize2 size={13} /> {isFullscreen ? 'Exit Fullscreen (= violation)' : 'Enter Fullscreen'}
        </button>
      )}

      {/* Abandon button */}
      <button
        onClick={() => { if (window.confirm('End Focus Mode early?')) onAbandon(); }}
        style={{
          padding: '10px 24px', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
          fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      >
        End Session Early
      </button>

      {/* Bottom note */}
      <div style={{ position: 'absolute', bottom: '16px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
        Tab switching and window blur are monitored · Browser-level focus detection active
      </div>
    </div>
  );
};
