import React, { useCallback } from 'react';
import { Target, Flame, Clock, BarChart3 } from 'lucide-react';

export const FocusDashboardCard = ({ onOpenFocus }) => {
  // Read today's focus history from localStorage
  const history = (() => {
    try {
      return JSON.parse(localStorage.getItem('ll_focus_history') || '[]');
    } catch { return []; }
  })();

  const today = new Date().toLocaleDateString('en-IN');
  const todaySessions = history.filter(h => h.date === today);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalSessions = todaySessions.length;

  // Focus score: percentage of sessions completed without hitting the limit
  const completedSessions = history.slice(0, 10).filter(h => h.completed).length;
  const totalRecent = history.slice(0, 10).length;
  const focusScore = totalRecent > 0 ? Math.round((completedSessions / totalRecent) * 100) : 0;

  return (
    <div className="content-card" style={{
      borderLeft: '3px solid #4A90E2',
      background: 'linear-gradient(135deg, #fff, #F0F7FF)',
    }}>
      <div className="section-header" style={{ marginBottom: '14px' }}>
        <div className="section-title" style={{ fontSize: '0.96rem' }}>
          <Target size={18} color="#4A90E2" />
          Focus Mode
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Today's summary</span>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#EBF3FD', borderRadius: '10px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#4A90E2', fontFamily: 'Outfit, sans-serif' }}>
            {todayMinutes || '—'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#4A90E2', fontWeight: '600', marginTop: '2px' }}>
            {todayMinutes > 0 ? 'min focused' : 'No session yet'}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#E8FBF2', borderRadius: '10px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#27AE60', fontFamily: 'Outfit, sans-serif' }}>
            {totalSessions}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#27AE60', fontWeight: '600', marginTop: '2px' }}>Sessions</div>
        </div>
        {totalRecent > 0 && (
          <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#F4ECF8', borderRadius: '10px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#9B59B6', fontFamily: 'Outfit, sans-serif' }}>
              {focusScore}%
            </div>
            <div style={{ fontSize: '0.68rem', color: '#9B59B6', fontWeight: '600', marginTop: '2px' }}>Focus Score</div>
          </div>
        )}
      </div>

      <button
        onClick={onOpenFocus}
        style={{
          width: '100%', padding: '10px', borderRadius: '10px', fontWeight: '700',
          fontSize: '0.86rem', color: '#fff', cursor: 'pointer', border: 'none',
          background: 'linear-gradient(135deg, #4A90E2, #2E75CC)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          boxShadow: '0 4px 14px rgba(74,144,226,0.35)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(74,144,226,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(74,144,226,0.35)'; }}
      >
        <Target size={15} /> START FOCUS MODE
      </button>
    </div>
  );
};
