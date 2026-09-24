import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, BookOpen, Award, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const ActivityCalendar = ({ history = [] }) => {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState(null);

  // Group history into weeks (7 days each)
  const getCellClass = (item) => {
    if (!item) return 'level-0';
    if (item.level === 6 || item.testTaken) return 'level-test';
    if (item.level === 5) return 'level-freeze';
    if (item.level === 4) return 'level-4';
    if (item.level === 3) return 'level-3';
    if (item.level === 2) return 'level-2';
    if (item.level === 1) return 'level-1';
    return 'level-0';
  };

  const getCellTitle = (item) => {
    if (!item) return 'No activity';
    if (item.testTaken) return `${item.date}: Assessment Day (${item.testTaken.score}%)`;
    if (item.level === 5) return `${item.date}: Streak Freeze Applied`;
    return `${item.date}: ${item.learningTimeMinutes || 0}m study, ${item.problemsSolved || 0} problems`;
  };

  return (
    <div className="content-card calendar-container">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={18} color="var(--accent-primary)" />
          <h3 className="section-title">{t('sec_activity_calendar')}</h3>
        </div>
        <div className="calendar-legend">
          <span>Less</span>
          <div className="legend-box level-0" title="No activity" />
          <div className="legend-box level-1" title="Low (1-20m)" />
          <div className="legend-box level-2" title="Medium (20-40m)" />
          <div className="legend-box level-3" title="High (40-60m)" />
          <div className="legend-box level-4" title="Very High (60m+)" />
          <div className="legend-box level-test" title="Assessment Day" />
          <div className="legend-box level-freeze" title="Streak Freeze" />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="calendar-heatmap-grid">
        {history.map((day, idx) => (
          <div
            key={idx}
            className={`calendar-cell ${getCellClass(day)}`}
            title={getCellTitle(day)}
            onClick={() => setSelectedDay(day)}
          />
        ))}
      </div>

      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Showing 90 days of consistent learning (June – September 2026)</span>
        <span>Click any date square to inspect daily breakdown</span>
      </div>

      {/* Daily Activity Detail Modal */}
      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={18} color="var(--accent-primary)" />
                <h4 className="modal-title">Daily Activity Breakdown</h4>
              </div>
              <button onClick={() => setSelectedDay(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ padding: '10px 14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{selectedDay.date} ({selectedDay.dayOfWeek})</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {selectedDay.testTaken ? 'Bi-Weekly Assessment Day' : selectedDay.level === 5 ? 'Streak Safeguard Used' : 'Standard Learning Loop'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} /> Learning Time
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '4px' }}>
                    {selectedDay.learningTimeMinutes || 0} mins
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    <CheckCircle size={14} /> Problems Solved
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '4px' }}>
                    {selectedDay.problemsSolved || 0}
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    <BookOpen size={14} /> Lessons Finished
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '4px' }}>
                    {selectedDay.lessonsCompleted || 0}
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    <Award size={14} /> Test Score
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '4px' }}>
                    {selectedDay.testTaken ? `${selectedDay.testTaken.score}%` : 'N/A'}
                  </div>
                </div>
              </div>

              {selectedDay.testTaken && (
                <div style={{ background: 'var(--accent-primary-light)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #F6D8CD' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.86rem', color: 'var(--accent-primary)' }}>
                    📝 {selectedDay.testTaken.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Scored {selectedDay.testTaken.score}% • Verified & Recorded
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedDay(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
