import React from 'react';
import { Award, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, RotateCcw, Target } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const ExamResultView = ({ attempt, onPracticeWeak, onReturnToTests }) => {
  const { t } = useLanguage();

  if (!attempt) return null;

  const {
    testTitle = "Bi-Weekly Assessment: C Core & Memory Diagnostics",
    scorePercentage = 82,
    rawScore = 6.5,
    totalMarks = 8,
    correctCount = 6,
    incorrectCount = 1,
    skippedCount = 1,
    timeTakenSeconds = 980,
    performanceRating = "Excellent Performance",
    topicBreakdown = [
      { topic: "Loops", accuracy: 92, questions: 25, status: "Strong" },
      { topic: "Arrays", accuracy: 78, questions: 20, status: "Good" },
      { topic: "Functions", accuracy: 61, questions: 18, status: "Needs Practice" },
      { topic: "Pointers", accuracy: 45, questions: 15, status: "Weak" }
    ],
    recommendations = []
  } = attempt;

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Result Hero Banner */}
      <div className="content-card" style={{ textAlign: 'center', padding: '36px 24px', background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-primary)' }}>
          <Award size={36} />
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          {testTitle}
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: '6px 0' }}>
          {scorePercentage}%
        </div>

        <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 'var(--radius-full)', background: scorePercentage >= 80 ? 'var(--accent-sage-light)' : 'var(--accent-amber-light)', color: scorePercentage >= 80 ? 'var(--accent-sage)' : '#B45309', fontWeight: '700', fontSize: '0.9rem' }}>
          {performanceRating}
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
          Instant evaluation complete. Progress saved and credited toward your 12-day streak.
        </p>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="kpi-title">Raw Score</span>
          <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{rawScore} / {totalMarks}</div>
        </div>

        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="kpi-title">Correct</span>
          <div className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--accent-sage)' }}>{correctCount}</div>
        </div>

        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="kpi-title">Incorrect</span>
          <div className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--accent-crimson)' }}>{incorrectCount}</div>
        </div>

        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="kpi-title">Skipped</span>
          <div className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--text-muted)' }}>{skippedCount}</div>
        </div>

        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="kpi-title">Time Taken</span>
          <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{formatSeconds(timeTakenSeconds)}</div>
        </div>
      </div>

      {/* Topic Analysis Breakdown Table */}
      <div className="content-card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Topic Diagnostic Breakdown</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Granular topic-level accuracy to identify exact strengths and weaknesses.
            </p>
          </div>
        </div>

        <table className="styled-table">
          <thead>
            <tr>
              <th>Topic</th>
              <th style={{ textAlign: 'center' }}>Questions</th>
              <th>Accuracy Bar</th>
              <th style={{ textAlign: 'right' }}>Score</th>
              <th style={{ textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {topicBreakdown.map((row, idx) => {
              const statusClass = row.status === 'Strong' ? 'strong' :
                row.status === 'Good' ? 'good' :
                row.status === 'Needs Practice' ? 'needs-practice' : 'weak';

              const barColor = row.status === 'Strong' ? 'var(--accent-sage)' :
                row.status === 'Good' ? 'var(--accent-navy)' :
                row.status === 'Needs Practice' ? 'var(--accent-amber)' : 'var(--accent-crimson)';

              return (
                <tr key={idx}>
                  <td style={{ fontWeight: '600' }}>{row.topic}</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{row.questions}</td>
                  <td style={{ width: '35%' }}>
                    <div className="progress-track" style={{ height: '6px' }}>
                      <div className="progress-fill" style={{ width: `${row.accuracy}%`, background: barColor }} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{row.accuracy}%</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`status-tag ${statusClass}`}>{row.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Smart Recommendations Action Box */}
      <div className="content-card" style={{ background: '#FFFDF9', border: '1px solid #F5E8D3' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309', fontWeight: '700', fontSize: '0.86rem' }}>
              <AlertTriangle size={18} />
              <span>Smart Recommendation: Targeted Practice Required</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '6px', lineHeight: '1.5' }}>
              You should practice <strong>Pointers & Memory Dereferencing</strong> (currently at 45% accuracy) before attempting the upcoming Advanced C Certification test.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() => onPracticeWeak && onPracticeWeak('Pointers')}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Target size={16} />
            <span>PRACTICE WEAK TOPICS</span>
          </button>
        </div>
      </div>

      {/* Return Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-secondary" onClick={onReturnToTests}>
          <RotateCcw size={16} /> Return to Tests & Assessments
        </button>
      </div>
    </div>
  );
};
