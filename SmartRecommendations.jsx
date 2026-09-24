import React from 'react';
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const SmartRecommendations = ({ recommendations = [], onAction }) => {
  const { t } = useLanguage();

  return (
    <div className="content-card">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent-amber)" />
          <h3 className="section-title">{t('sec_recommendations')}</h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          AI Pedagogical Engine • Based on Recent Performance
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {recommendations.map((rec) => {
          const isWeakPractice = rec.type === 'Practice';
          return (
            <div
              key={rec.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                backgroundColor: isWeakPractice ? '#FFFDF8' : '#FAFBFD'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color: isWeakPractice ? '#B45309' : 'var(--accent-navy)',
                      background: isWeakPractice ? 'var(--accent-amber-light)' : 'var(--accent-navy-light)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {rec.type}
                  </span>
                  {isWeakPractice ? (
                    <AlertTriangle size={15} color="#D97706" />
                  ) : (
                    <CheckCircle2 size={15} color="var(--accent-sage)" />
                  )}
                </div>

                <div style={{ fontWeight: '700', fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {rec.title}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  {rec.reason}
                </p>
              </div>

              <button
                className={isWeakPractice ? "btn-primary" : "btn-secondary"}
                onClick={() => onAction && onAction(rec)}
                style={{ alignSelf: 'flex-start', padding: '7px 14px', fontSize: '0.82rem' }}
              >
                <span>{rec.actionLabel}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
