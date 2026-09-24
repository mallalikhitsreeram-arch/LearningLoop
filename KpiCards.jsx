import React from 'react';
import { Flame, CheckCircle, BookOpen, Award, Clock, Target } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const KpiCards = ({ kpis = {}, student = null }) => {
  const { t } = useLanguage();

  const formatTime = (totalMins = 0) => {
    const safeMins = Number(totalMins ?? 0);
    const hours = Math.floor(safeMins / 60);
    const mins = safeMins % 60;
    return `${hours}h ${mins}m`;
  };

  const currentStreak = student?.learningStreak ?? kpis?.currentStreak ?? 0;
  const problemsSolved = student?.problemsSolved ?? kpis?.totalProblemsSolved ?? 0;
  const coursesCount = student?.coursesCompleted ?? kpis?.coursesCompleted ?? 0;
  const avgScore = student?.averageTestScore ?? kpis?.averageTestScore ?? 0;
  const learningTime = student?.learningTime || formatTime(kpis?.totalLearningTimeMinutes);
  const targetGoal = student?.careerGoal || kpis?.currentGoal || 'Set your target goal';

  const cards = [
    {
      title: t('kpi_streak'),
      value: `${currentStreak} Days`,
      sub: currentStreak > 0 ? 'Consistency 🔥' : 'Start your streak today!',
      icon: <Flame size={18} color="var(--accent-amber)" />,
      iconBg: 'var(--accent-amber-light)'
    },
    {
      title: t('kpi_problems'),
      value: problemsSolved,
      sub: problemsSolved > 0 ? '+14 this week' : 'Practice problems to solve',
      icon: <CheckCircle size={18} color="var(--accent-green)" />,
      iconBg: 'var(--accent-green-light)'
    },
    {
      title: t('kpi_courses'),
      value: coursesCount,
      sub: `${coursesCount} Certificates Earned`,
      icon: <BookOpen size={18} color="var(--accent-primary)" />,
      iconBg: 'var(--accent-primary-light)'
    },
    {
      title: t('kpi_score'),
      value: `${avgScore}%`,
      sub: avgScore > 0 ? 'Overall Average' : 'Take a test to score',
      icon: <Award size={18} color="var(--accent-purple)" />,
      iconBg: 'var(--accent-purple-light)'
    },
    {
      title: t('kpi_time'),
      value: learningTime,
      sub: 'Lifetime Study Time',
      icon: <Clock size={18} color="var(--accent-cyan)" />,
      iconBg: 'var(--accent-cyan-light)'
    },
    {
      title: t('kpi_goal'),
      value: targetGoal,
      sub: 'Target Track',
      icon: <Target size={18} color="var(--accent-amber)" />,
      iconBg: 'var(--accent-amber-light)'
    }
  ];

  return (
    <div className="kpi-row">
      {cards.map((card, idx) => (
        <div className="kpi-card" key={idx}>
          <div className="kpi-header">
            <span className="kpi-title">{card.title}</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: card.iconBg }}>
              {card.icon}
            </div>
          </div>
          <div className="kpi-value">{card.value}</div>
          <div className="kpi-footer-sub">{card.sub}</div>
        </div>
      ))}
    </div>
  );
};
