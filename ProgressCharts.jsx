import React, { useState } from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const ProgressCharts = ({ topicPerformance = [], onPracticeTopic }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('7d'); // '7d', '30d', '3m'

  // Trend data for each filter
  const chartData = {
    '7d': [
      { label: 'Thu', minutes: 45, problems: 5, accuracy: 80 },
      { label: 'Fri', minutes: 60, problems: 8, accuracy: 85 },
      { label: 'Sat', minutes: 30, problems: 3, accuracy: 75 },
      { label: 'Sun', minutes: 50, problems: 6, accuracy: 82 },
      { label: 'Mon', minutes: 75, problems: 10, accuracy: 90 },
      { label: 'Tue', minutes: 40, problems: 4, accuracy: 78 },
      { label: 'Today', minutes: 35, problems: 4, accuracy: 82 }
    ],
    '30d': [
      { label: 'Week 1', minutes: 320, problems: 42, accuracy: 79 },
      { label: 'Week 2', minutes: 390, problems: 56, accuracy: 83 },
      { label: 'Week 3', minutes: 410, problems: 64, accuracy: 86 },
      { label: 'Week 4', minutes: 380, problems: 50, accuracy: 82 }
    ],
    '3m': [
      { label: 'June', minutes: 1250, problems: 160, accuracy: 78 },
      { label: 'July', minutes: 1480, problems: 210, accuracy: 83 },
      { label: 'August', minutes: 1620, problems: 248, accuracy: 85 }
    ]
  };

  const activeData = chartData[filter];
  const maxMinutes = Math.max(...activeData.map(d => d.minutes), 80);

  return (
    <div className="content-card">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={18} color="var(--accent-sage)" />
          <h3 className="section-title">{t('sec_progress_analytics')}</h3>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-subtle)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          {['7d', '30d', '3m'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: filter === f ? '700' : '500',
                background: filter === f ? '#fff' : 'transparent',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: filter === f ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {f === '7d' ? '7 Days' : f === '30d' ? '30 Days' : '3 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '160px', padding: '16px 8px 8px' }}>
        {activeData.map((item, idx) => {
          const heightPercent = Math.round((item.minutes / maxMinutes) * 100);
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                {item.minutes}m
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '38px',
                  height: `${Math.max(12, heightPercent)}%`,
                  backgroundColor: item.label === 'Today' ? 'var(--accent-primary)' : 'var(--accent-sage)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease'
                }}
                title={`${item.label}: ${item.minutes} mins, ${item.problems} problems, ${item.accuracy}% accuracy`}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '16px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={14} color="var(--accent-sage)" />
          <span>Skill Growth Rate: <strong>+18% this month</strong></span>
        </div>
        <div>
          <span>Consistency Index: <strong>94%</strong></span>
        </div>
      </div>

      {/* Realistic Topic Performance & Diagnostics */}
      {topicPerformance && topicPerformance.length > 0 && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Topic Performance & Diagnostic Insights
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              AI Performance Analyzer
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {topicPerformance.map((item, idx) => {
              const isNeedsPractice = item.status === 'Needs Practice' || item.score < 75;
              const isMastered = item.score >= 85;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isNeedsPractice ? '#FFFDF8' : 'var(--bg-surface-subtle)',
                    border: isNeedsPractice ? '1px solid #FDE68A' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {item.topic}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: isNeedsPractice ? 'var(--accent-amber-light)' : (isMastered ? 'var(--accent-sage-light)' : 'var(--accent-navy-light)'),
                        color: isNeedsPractice ? '#B45309' : (isMastered ? 'var(--accent-sage)' : 'var(--accent-navy)')
                      }}
                    >
                      {item.score}% — {isNeedsPractice ? 'Needs Practice' : (isMastered ? 'Mastered' : 'Proficient')}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${item.score}%`,
                        background: isNeedsPractice ? 'var(--accent-amber)' : (isMastered ? 'var(--accent-sage)' : 'var(--accent-navy)'),
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  </div>

                  {isNeedsPractice && onPracticeTopic && (
                    <button
                      onClick={() => onPracticeTopic(item.topic)}
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: '600',
                        color: 'var(--accent-primary)',
                        textAlign: 'left',
                        padding: 0,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Practice this topic →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
