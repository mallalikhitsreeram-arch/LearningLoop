import React, { useState, useEffect } from 'react';
import { Award, Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { ExamView } from './ExamView.jsx';
import { ExamResultView } from './ExamResultView.jsx';

export const TestList = ({ onPracticeWeak, initialFilter = 'all' }) => {
  const [tests, setTests] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [testFilter, setTestFilter] = useState(initialFilter);

  useEffect(() => {
    if (initialFilter) setTestFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    fetch('/api/tests')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTests(data);
      })
      .catch(() => {});
  }, []);

  const handleStartExam = async (test) => {
    try {
      const res = await fetch(`/api/tests/${test.id}`);
      const hydrated = await res.json();
      setActiveExam(hydrated);
    } catch (err) {
      setActiveExam(test);
    }
  };

  if (examResult) {
    return (
      <ExamResultView
        attempt={examResult}
        onPracticeWeak={(topic) => {
          setExamResult(null);
          if (onPracticeWeak) onPracticeWeak(topic);
        }}
        onReturnToTests={() => setExamResult(null)}
      />
    );
  }

  if (activeExam) {
    return (
      <ExamView
        test={activeExam}
        onFinishExam={(result) => {
          setActiveExam(null);
          setExamResult(result);
        }}
        onCancel={() => setActiveExam(null)}
      />
    );
  }

  const filteredTests = tests.filter(t => {
    if (testFilter === 'biweekly') return t.isBiWeekly;
    return true;
  });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '700' }}>
            Assessments & Bi-Weekly Mock Examinations
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Timed proctored exams with instant topic-level diagnostics and streak rewards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface-subtle)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: testFilter === 'all' ? '700' : '500',
              background: testFilter === 'all' ? '#fff' : 'transparent',
              color: testFilter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
            onClick={() => setTestFilter('all')}
          >
            All Exams ({tests.length})
          </button>
          <button
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: testFilter === 'biweekly' ? '700' : '500',
              background: testFilter === 'biweekly' ? '#fff' : 'transparent',
              color: testFilter === 'biweekly' ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
            onClick={() => setTestFilter('biweekly')}
          >
            ⭐ Bi-Weekly Tests
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredTests.map((test) => (
          <div key={test.id} className="content-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge-pill" style={{ background: test.isBiWeekly ? 'var(--accent-primary-light)' : 'var(--bg-surface-subtle)', color: test.isBiWeekly ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                  {test.isBiWeekly ? 'Bi-Weekly Assessment' : 'Standard Mock Test'}
                </span>
                <span className="badge-pill">{test.subject}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {test.title}
              </h3>

              <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {test.durationMinutes} Minutes
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={14} /> {test.totalQuestions || test.questionIds?.length || 8} Questions
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> Due: {test.dueDate || 'Open'}
                </span>
                <span>Passing: {test.passingScore}%</span>
              </div>
            </div>

            <button className="btn-primary" onClick={() => handleStartExam(test)}>
              <span>Begin Exam</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
