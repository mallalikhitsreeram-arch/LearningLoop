import React, { useState, useEffect, useRef } from 'react';
import { Clock, ShieldAlert, CheckSquare, Flag, ArrowLeft, ArrowRight, AlertTriangle, Award, BookOpen, AlertCircle } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { syncEngine } from '../../services/syncEngine.js';

export const ExamView = ({ test, onFinishExam, onCancel }) => {
  const { isEffectiveOnline } = useNetwork();
  const { currentUser, getAuthHeaders } = useAuth();

  const [questions, setQuestions] = useState(test.questions || []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex | text }
  const [markedForReview, setMarkedForReview] = useState(new Set());

  // Test Start & Instructions State
  const [isStarted, setIsStarted] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const durationSeconds = (test.durationMinutes || 30) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);

  // Focus & Proctoring States
  const [focusViolations, setFocusViolations] = useState(0);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Time warnings
  const [showFiveMinWarning, setShowFiveMinWarning] = useState(false);
  const [showOneMinWarning, setShowOneMinWarning] = useState(false);

  const sessionKey = `ll_exam_session_${test.id}_${currentUser?.id || 'usr-student-1'}`;

  // Check if exam was already started in this browser session (timer resilience against browser refresh)
  useEffect(() => {
    try {
      const savedSessionRaw = localStorage.getItem(sessionKey);
      if (savedSessionRaw) {
        const savedSession = JSON.parse(savedSessionRaw);
        const startTime = new Date(savedSession.startedAt).getTime();
        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, durationSeconds - elapsedSec);

        setSessionStartTime(startTime);
        setSecondsRemaining(remaining);
        setIsStarted(true);

        if (savedSession.answers) {
          setAnswers(savedSession.answers);
        }

        if (remaining <= 0) {
          handleSubmitExam();
        }
      }
    } catch (e) {
      console.warn('Error checking stored exam session:', e);
    }
  }, [test.id, currentUser?.id]);

  // Start Exam Handler
  const handleStartExam = async () => {
    const startTime = Date.now();
    setSessionStartTime(startTime);
    setIsStarted(true);

    try {
      localStorage.setItem(sessionKey, JSON.stringify({
        startedAt: new Date(startTime).toISOString(),
        durationMinutes: test.durationMinutes || 30,
        answers: {}
      }));

      if (isEffectiveOnline) {
        fetch(`/api/tests/${test.id}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Error saving exam session to localStorage:', e);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  };

  // Focus integrity monitoring (Exam Focus Mode)
  useEffect(() => {
    if (!isStarted) return;

    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        setFocusViolations(prev => {
          const next = prev + 1;
          setShowViolationAlert(true);
          return next;
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFocusViolations(prev => {
          const next = prev + 1;
          setShowViolationAlert(true);
          return next;
        });
      }
    };

    const handleBlur = () => {
      setFocusViolations(prev => {
        const next = prev + 1;
        setShowViolationAlert(true);
        return next;
      });
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isStarted]);

  // Countdown timer resilient to browser refresh
  useEffect(() => {
    if (!isStarted) return;

    if (secondsRemaining <= 0) {
      handleSubmitExam();
      return;
    }

    // Trigger warnings
    if (secondsRemaining <= 300 && secondsRemaining > 298) {
      setShowFiveMinWarning(true);
    }
    if (secondsRemaining <= 60 && secondsRemaining > 58) {
      setShowOneMinWarning(true);
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        const next = Math.max(0, prev - 1);
        if (next <= 0) {
          clearInterval(timer);
          handleSubmitExam();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, secondsRemaining]);

  const currentQ = questions[currentIdx] || {
    id: 'q-sample',
    question: "Which data structure operates on a Last In First Out (LIFO) model?",
    options: ["Queue", "Stack", "Binary Tree", "Linked List"],
    correctIndex: 1,
    topic: "Data Structures",
    marks: 1
  };

  const handleSelectOption = (idx) => {
    const updated = { ...answers, [currentQ.id]: idx };
    setAnswers(updated);
    try {
      const raw = localStorage.getItem(sessionKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        localStorage.setItem(sessionKey, JSON.stringify({ ...parsed, answers: updated }));
      }
    } catch (e) {}
  };

  const handleTextAnswer = (text) => {
    const updated = { ...answers, [currentQ.id]: text };
    setAnswers(updated);
    try {
      const raw = localStorage.getItem(sessionKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        localStorage.setItem(sessionKey, JSON.stringify({ ...parsed, answers: updated }));
      }
    } catch (e) {}
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const timeTaken = durationSeconds - secondsRemaining;

    // Clear local active exam session upon submission
    try {
      localStorage.removeItem(sessionKey);
    } catch (e) {}

    try {
      if (isEffectiveOnline) {
        const res = await fetch(`/api/tests/${test.id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            answers,
            timeTakenSeconds: timeTaken,
            studentId: currentUser?.id || 'usr-student-1'
          })
        });
        const data = await res.json();
        setIsSubmitting(false);
        if (onFinishExam) onFinishExam(data.attempt);
      } else {
        // Offline evaluation fallback
        let correct = 0;
        let incorrect = 0;
        let skipped = 0;
        const topicStats = {};

        questions.forEach(q => {
          if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
          topicStats[q.topic].total += 1;

          const chosen = answers[q.id];
          if (chosen === undefined || chosen === null || chosen === '') skipped++;
          else if (chosen === q.correctIndex) {
            correct++;
            topicStats[q.topic].correct += 1;
          } else {
            incorrect++;
          }
        });

        const scorePercent = Math.round((correct / Math.max(1, questions.length)) * 100);

        const topicBreakdown = Object.keys(topicStats).map(t => {
          const s = topicStats[t];
          const acc = Math.round((s.correct / s.total) * 100);
          return {
            topic: t,
            accuracy: acc,
            questions: s.total,
            status: acc >= 85 ? 'Strong' : (acc >= 70 ? 'Good' : (acc >= 50 ? 'Needs Practice' : 'Weak'))
          };
        });

        const offlineAttempt = {
          id: `att-offline-${Date.now()}`,
          studentId: currentUser?.id || 'usr-student-1',
          testId: test.id,
          testTitle: test.title,
          scorePercentage: scorePercent,
          rawScore: correct,
          totalMarks: questions.length,
          correctCount: correct,
          incorrectCount: incorrect,
          skippedCount: skipped,
          timeTakenSeconds: timeTaken,
          performanceRating: scorePercent >= 80 ? 'Excellent Performance' : 'Good Effort',
          topicBreakdown
        };

        await syncEngine.queueActivity('offline_quiz_attempt', offlineAttempt);
        setIsSubmitting(false);
        if (onFinishExam) onFinishExam(offlineAttempt);
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      setIsSubmitting(false);
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // PRE-TEST ASSESSMENT INSTRUCTIONS MODAL
  if (!isStarted) {
    return (
      <div style={{ maxWidth: '720px', margin: '40px auto' }}>
        <div className="content-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: '800', fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '8px' }}>
            <Award size={18} />
            <span>Timed Proctored Examination</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {test.title}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: 'var(--bg-surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Questions</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>{questions.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Total Marks</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-navy)' }}>{test.totalMarks || questions.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Time Limit</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>{test.durationMinutes || 30} min</div>
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Passing Score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-sage)' }}>{test.passingPercentage || test.passingScore || 60}%</div>
            </div>
          </div>

          {test.topics && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '6px' }}>
                Curriculum Topics Tested:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(Array.isArray(test.topics) ? test.topics : test.topics.split(',')).map((top, idx) => (
                  <span key={idx} className="badge-pill">
                    • {top.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Assessment Rules & Instructions */}
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '28px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#92400E', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} />
              <span>⚠ Assessment Instructions &amp; Rules</span>
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.84rem', color: '#92400E', lineHeight: '1.6' }}>
              <li>Complete all questions within the allotted time limit.</li>
              <li>Your answers are automatically submitted when the countdown timer reaches <strong>00:00</strong>.</li>
              <li>Do not leave or switch tabs repeatedly. Window blur and tab switches are logged by the proctoring monitor.</li>
              <li>Ensure a stable network connection. Your timer is synchronized with the evaluation server.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" className="btn-secondary" onClick={onCancel}>
              <ArrowLeft size={15} /> Return to Tests
            </button>

            <button
              type="button"
              id="start-assessment-btn"
              className="btn-primary"
              onClick={handleStartExam}
              style={{ padding: '10px 24px', fontSize: '0.95rem' }}
            >
              <span>[ Start Test ]</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE EXAM INTERFACE
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Exam Focus Mode Alert Bar */}
      <div className="exam-focus-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="#FBBF24" />
          <span><strong>Exam Focus Mode Active:</strong> Screen focus is monitored. Tab switches and window blurs are recorded.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleFullscreen}
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              background: isFullscreen ? 'var(--accent-sage)' : '#fff',
              color: isFullscreen ? '#fff' : 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: '700',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {isFullscreen ? '✓ Fullscreen Mode' : '⛶ Enter Fullscreen'}
          </button>
          <span>Violations Logged: <strong style={{ color: focusViolations >= 3 ? '#DC2626' : 'inherit' }}>{focusViolations}</strong></span>
        </div>
      </div>

      {/* 5-Minute Warning Banner */}
      {showFiveMinWarning && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', padding: '10px 16px', borderRadius: 'var(--radius-md)', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: '700' }}>
            <Clock size={16} />
            <span>⚠ Time Notice: 5 minutes remaining! Review your marked questions.</span>
          </div>
          <button onClick={() => setShowFiveMinWarning(false)} style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: '700' }}>Dismiss</button>
        </div>
      )}

      {/* 1-Minute Urgent Alert */}
      {showOneMinWarning && (
        <div style={{ background: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '10px 16px', borderRadius: 'var(--radius-md)', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: '800' }}>
            <AlertTriangle size={18} />
            <span>⚠ FINAL MINUTE: 1 minute remaining! Assessment will submit automatically at 00:00.</span>
          </div>
          <button onClick={() => setShowOneMinWarning(false)} style={{ fontSize: '0.78rem', color: '#991B1B', fontWeight: '700' }}>Dismiss</button>
        </div>
      )}

      {/* Tab Switch Violation Alert */}
      {showViolationAlert && (
        <div style={{ background: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '10px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
            <AlertTriangle size={16} />
            <span>
              <strong>⚠ Warning {focusViolations}/3:</strong> "Please remain on the assessment page. Screen focus is monitored."
            </span>
          </div>
          <button onClick={() => setShowViolationAlert(false)} style={{ fontSize: '0.78rem', fontWeight: '700', color: '#991B1B' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main Exam Grid: Question Panel + Navigator Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
        {/* Question Panel */}
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '18px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                Question {currentIdx + 1} of {questions.length} • Topic: {currentQ.topic || 'General'} • ({currentQ.marks || 1} mark{currentQ.marks > 1 ? 's' : ''})
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{test.title}</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface-subtle)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: '800', fontSize: '0.95rem', color: secondsRemaining < 300 ? '#DC2626' : 'var(--text-primary)' }}>
              <Clock size={16} />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          </div>

          <h4 style={{ fontSize: '1.1rem', fontWeight: '600', lineHeight: '1.6', marginBottom: '24px', color: 'var(--text-primary)' }}>
            {currentQ.question}
          </h4>

          {/* Options: Multiple Choice */}
          {(currentQ.type === 'mcq' || currentQ.type === 'true_false' || !currentQ.type) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {(currentQ.options || []).map((opt, idx) => {
                const isSelected = answers[currentQ.id] === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'var(--accent-primary-light)' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => handleSelectOption(idx)}
                  >
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface-subtle)', color: isSelected ? '#fff' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700' }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span style={{ fontSize: '0.92rem' }}>{opt}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Descriptive / Short Answer Textbox */}
          {(currentQ.type === 'descriptive' || currentQ.type === 'short_answer') && (
            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Your Answer:
              </label>
              <textarea
                rows={5}
                placeholder="Type your explanation or solution here..."
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleTextAnswer(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', lineHeight: '1.5' }}
              />
            </div>
          )}

          {/* Bottom Navigation & Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
            <button
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: markedForReview.has(currentQ.id) ? '#D97706' : 'var(--text-secondary)' }}
              onClick={toggleMarkForReview}
            >
              <Flag size={15} />
              <span>{markedForReview.has(currentQ.id) ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-secondary"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                style={{ opacity: currentIdx === 0 ? 0.5 : 1 }}
              >
                Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  className="btn-primary"
                  onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                >
                  <span>Next</span>
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  className="btn-sage"
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Exam'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator Drawer */}
        <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Question Navigator</h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
              const isMarked = markedForReview.has(q.id);
              const isCurrent = currentIdx === idx;

              let bg = 'var(--bg-surface-subtle)';
              let color = 'var(--text-secondary)';
              let border = '1px solid var(--border-subtle)';

              if (isAnswered) {
                bg = 'var(--accent-sage-light)';
                color = 'var(--accent-sage)';
                border = '1px solid #A7F3D0';
              }
              if (isMarked) {
                bg = 'var(--accent-amber-light)';
                color = '#B45309';
                border = '1px solid #FDE68A';
              }
              if (isCurrent) {
                border = '2px solid var(--accent-primary)';
              }

              return (
                <button
                  key={q.id || idx}
                  style={{
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: bg,
                    color,
                    border,
                    fontWeight: '700',
                    fontSize: '0.86rem'
                  }}
                  onClick={() => setCurrentIdx(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--accent-sage-light)', border: '1px solid #A7F3D0' }} />
              <span>Answered ({Object.keys(answers).length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--accent-amber-light)', border: '1px solid #FDE68A' }} />
              <span>Marked for Review ({markedForReview.size})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)' }} />
              <span>Not Visited ({questions.length - Object.keys(answers).length})</span>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
            onClick={handleSubmitExam}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Evaluating...' : 'Submit & Finish Test'}
          </button>
        </div>
      </div>
    </div>
  );
};
