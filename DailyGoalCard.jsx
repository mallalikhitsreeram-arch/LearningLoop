import React from 'react';
import { PlayCircle, Target, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';

export const DailyGoalCard = ({ dailyGoal = {}, onContinueLearning, onPracticeNow }) => {
  const { t } = useLanguage();
  const { isEffectiveOnline } = useNetwork();

  const completed = dailyGoal?.completedMinutes ?? 0;
  const target = dailyGoal?.targetMinutes || 60;
  const percentage = Math.min(100, Math.round((completed / target) * 100));

  return (
    <div className="daily-goal-card">
      <div className="goal-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Target size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
            {t('daily_goal_title')}
          </span>
          {!isEffectiveOnline && (
            <span className="data-saver-tag">Offline Tracking Active</span>
          )}
        </div>
        <p>
          {completed >= target
            ? "🎉 Outstanding work! You achieved your daily learning target for today!"
            : `You need ${target - completed} more minutes today to safeguard your streak.`}
        </p>
      </div>

      <div className="goal-progress-wrap">
        <div className="goal-progress-meta">
          <span>{completed} / {target} mins</span>
          <span>{percentage}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      <div className="goal-actions">
        <button className="btn-primary" onClick={onContinueLearning}>
          <PlayCircle size={16} />
          <span>{t('btn_continue')}</span>
        </button>
        <button className="btn-secondary" onClick={onPracticeNow}>
          <Zap size={16} />
          <span>{t('btn_practice_now')}</span>
        </button>
      </div>
    </div>
  );
};
