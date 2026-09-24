import React, { useState, useMemo } from 'react';
import {
  Award,
  PlusCircle,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  HelpCircle,
  FileCheck,
  Check,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const AdvancedTestBuilder = ({ onTestCreated }) => {
  const { currentUser, getAuthHeaders } = useAuth();

  // Basic Information
  const [basicInfo, setBasicInfo] = useState({
    title: 'C Programming Assessment — Loops & Pointers',
    description: 'Comprehensive mid-term evaluation of loop execution flows, function call semantics, and pointer memory arithmetic.',
    subject: 'C Programming',
    courseId: 'crs-c-lang',
    targetClass: 'CSE 2nd Year (CSE-401)',
    topics: 'Loops, Functions, Pointers',
    difficulty: 'Medium',
    passingPercentage: 60,
    durationMinutes: 60,
    startDate: '',
    endDate: ''
  });

  // Questions Array
  const [questions, setQuestions] = useState([
    {
      id: 'q-init-1',
      question: 'Which of the following loop constructs in C evaluates its condition at the end of the iteration, guaranteeing that the body executes at least once?',
      type: 'mcq',
      topic: 'Loops',
      difficulty: 'Easy',
      marks: 1,
      options: ['for loop', 'while loop', 'do-while loop', 'goto loop'],
      correctIndex: 2,
      correctAnswer: 'do-while loop',
      explanation: 'do-while evaluates the loop guard condition after executing the body, ensuring at least one pass.'
    },
    {
      id: 'q-init-2',
      question: 'What is the value printed by this code: int a = 5; int *p = &a; printf("%d", *p + 2);?',
      type: 'mcq',
      topic: 'Pointers',
      difficulty: 'Medium',
      marks: 2,
      options: ['5', '7', 'Address of a + 2', 'Garbage value'],
      correctIndex: 1,
      correctAnswer: '7',
      explanation: '*p dereferences a (5), and 5 + 2 evaluates to 7.'
    },
    {
      id: 'q-init-3',
      question: 'What happens when a function attempts to return the address of a local automatic variable allocated on the stack frame?',
      type: 'mcq',
      topic: 'Functions',
      difficulty: 'Hard',
      marks: 2,
      options: [
        'Safe memory access',
        'Dangling pointer leading to undefined behavior',
        'Automatic promotion to static heap memory',
        'Syntax error at compile time'
      ],
      correctIndex: 1,
      correctAnswer: 'Dangling pointer leading to undefined behavior',
      explanation: 'Stack frames are deallocated upon return; references to local automatic variables become dangling pointers.'
    }
  ]);

  // AI Modal States
  const [isAiBuilderOpen, setIsAiBuilderOpen] = useState(false);
  const [isAiReviewOpen, setIsAiReviewOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReviewReport, setAiReviewReport] = useState(null);
  const [aiDraftPrompt, setAiDraftPrompt] = useState({
    subject: 'C Programming',
    course: 'crs-c-lang',
    topics: 'Loops, Functions, Pointers',
    numQuestions: 10,
    difficulty: 'Medium',
    duration: 30,
    totalMarks: 20
  });

  // UI status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [timeWarningDismissed, setTimeWarningDismissed] = useState(false);

  // Live Calculated Metrics
  const totalQuestions = questions.length;
  const totalMarks = useMemo(() => {
    return questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
  }, [questions]);

  const passMark = useMemo(() => {
    return Math.round(((basicInfo.passingPercentage || 60) / 100) * totalMarks * 10) / 10;
  }, [basicInfo.passingPercentage, totalMarks]);

  const avgTimePerQuestion = useMemo(() => {
    if (totalQuestions === 0) return 0;
    return Math.round(((Number(basicInfo.durationMinutes) || 30) / totalQuestions) * 10) / 10;
  }, [basicInfo.durationMinutes, totalQuestions]);

  // Unique topics in test
  const uniqueTopics = useMemo(() => {
    const set = new Set();
    questions.forEach(q => {
      if (q.topic && q.topic.trim()) set.add(q.topic.trim());
    });
    if (set.size === 0 && basicInfo.topics) {
      basicInfo.topics.split(',').forEach(t => {
        if (t.trim()) set.add(t.trim());
      });
    }
    return Array.from(set);
  }, [questions, basicInfo.topics]);

  // Intelligent Time Estimation & Recommendation
  const timeAnalysis = useMemo(() => {
    let minMinutes = 0;
    let maxMinutes = 0;
    let descriptiveCount = 0;

    questions.forEach(q => {
      if (q.type === 'descriptive' || q.type === 'short_answer') {
        descriptiveCount += 1;
        minMinutes += (q.difficulty === 'Hard' ? 5 : 4);
        maxMinutes += (q.difficulty === 'Hard' ? 8 : 6);
      } else {
        // MCQ / T&F / Multi-select
        if (q.difficulty === 'Hard') {
          minMinutes += 2;
          maxMinutes += 2.5;
        } else if (q.difficulty === 'Medium') {
          minMinutes += 1.5;
          maxMinutes += 2;
        } else {
          minMinutes += 1;
          maxMinutes += 1.5;
        }
      }
    });

    const recommendedMin = Math.max(10, Math.ceil(minMinutes));
    const recommendedMax = Math.max(15, Math.ceil(maxMinutes));
    const currentDuration = Number(basicInfo.durationMinutes) || 30;

    const isTooShort = totalQuestions > 0 && currentDuration < recommendedMin;
    const hasDescriptiveWarning = descriptiveCount > 0 && currentDuration < (totalQuestions * 1.5 + descriptiveCount * 3);

    return {
      recommendedMin,
      recommendedMax,
      currentDuration,
      isTooShort,
      descriptiveCount,
      hasDescriptiveWarning
    };
  }, [questions, basicInfo.durationMinutes, totalQuestions]);

  // Handlers for Question Actions
  const handleAddQuestion = () => {
    const newIdx = questions.length + 1;
    const newQ = {
      id: `q-custom-${Date.now()}`,
      question: '',
      type: 'mcq',
      topic: uniqueTopics[0] || 'Loops',
      difficulty: basicInfo.difficulty || 'Medium',
      marks: 1,
      options: ['', '', '', ''],
      correctIndex: 0,
      correctAnswer: '',
      explanation: ''
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIdx(questions.length);
  };

  const handleDuplicateQuestion = (idx) => {
    const source = questions[idx];
    const duplicated = {
      ...source,
      id: `q-dup-${Date.now()}`,
      question: `${source.question} (Copy)`,
      options: [...source.options]
    };
    const updated = [...questions];
    updated.splice(idx + 1, 0, duplicated);
    setQuestions(updated);
    setActiveQuestionIdx(idx + 1);
  };

  const handleDeleteQuestion = (idx) => {
    if (questions.length <= 1) {
      alert('Assessment must contain at least 1 question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    setActiveQuestionIdx(Math.max(0, idx - 1));
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const updated = [...questions];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setQuestions(updated);
    setActiveQuestionIdx(idx - 1);
  };

  const handleMoveDown = (idx) => {
    if (idx === questions.length - 1) return;
    const updated = [...questions];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setQuestions(updated);
    setActiveQuestionIdx(idx + 1);
  };

  const updateCurrentQuestion = (field, value) => {
    const updated = [...questions];
    updated[activeQuestionIdx] = {
      ...updated[activeQuestionIdx],
      [field]: value
    };
    setQuestions(updated);
  };

  const updateOptionText = (optIdx, text) => {
    const updated = [...questions];
    const currentOptions = [...(updated[activeQuestionIdx].options || ['', '', '', ''])];
    currentOptions[optIdx] = text;
    updated[activeQuestionIdx].options = currentOptions;
    setQuestions(updated);
  };

  // AI Draft Generator Handler
  const handleGenerateAiTest = async (e) => {
    if (e) e.preventDefault();
    setAiLoading(true);
    try {
      const res = await fetch('/api/teacher/ai-generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(aiDraftPrompt)
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setBasicInfo({
          ...basicInfo,
          title: data.draft.title,
          subject: data.draft.subject,
          topics: data.draft.topics.join(', '),
          difficulty: data.draft.difficulty,
          durationMinutes: data.draft.durationMinutes,
          passingPercentage: data.draft.passingPercentage
        });
        setQuestions(data.draft.questions);
        setActiveQuestionIdx(0);
        setIsAiBuilderOpen(false);
      }
    } catch (err) {
      console.error('Error generating AI test:', err);
      alert('Failed to generate AI questions. Please check connection.');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Quality Review Handler
  const handleReviewTestWithAi = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/teacher/ai-review-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          title: basicInfo.title,
          questions,
          durationMinutes: basicInfo.durationMinutes,
          passingScore: basicInfo.passingPercentage
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiReviewReport(data);
        setIsAiReviewOpen(true);
      }
    } catch (err) {
      console.error('Error running AI test review:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Save / Publish Test Handler
  const handlePublishAssessment = async (e) => {
    if (e) e.preventDefault();
    if (!basicInfo.title.trim()) {
      alert('Please enter a test title.');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least one question.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...basicInfo,
        totalMarks,
        questions,
        teacherId: currentUser?.id || 'usr-teacher-1'
      };

      const res = await fetch('/api/teacher/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        if (onTestCreated) onTestCreated(saved.test);
      } else {
        alert('Failed to save assessment. Please review test fields.');
      }
    } catch (err) {
      console.error('Error publishing test:', err);
      alert('Error saving assessment to server.');
    } finally {
      setIsSaving(false);
    }
  };

  const curQ = questions[activeQuestionIdx] || questions[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner Alert */}
      {saveSuccess && (
        <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '14px 18px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
          <CheckCircle2 size={20} />
          <span>✓ Assessment Published Successfully! Students can now access this timed evaluation.</span>
        </div>
      )}

      {/* Main Grid: Builder Left + Summary Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Test Configuration & Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* SECTION 1: Test Basic Information */}
          <div className="content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 className="section-title">Assessment Information</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Define core curriculum parameters, target batch, and grading percentage threshold.
                </p>
              </div>

              {/* AI Quick Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  id="open-ai-test-builder-btn"
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', borderColor: '#D97706', color: '#B45309' }}
                  onClick={() => setIsAiBuilderOpen(true)}
                >
                  <Sparkles size={14} color="#D97706" />
                  <span>✨ AI Test Builder</span>
                </button>

                <button
                  type="button"
                  id="open-ai-test-review-btn"
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                  onClick={handleReviewTestWithAi}
                  disabled={aiLoading}
                >
                  <FileCheck size={14} />
                  <span>{aiLoading ? 'Reviewing...' : '✨ AI Review Test'}</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C Programming Assessment — Loops & Pointers"
                  value={basicInfo.title}
                  onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Subject</label>
                  <input
                    type="text"
                    required
                    value={basicInfo.subject}
                    onChange={(e) => setBasicInfo({ ...basicInfo, subject: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Target Class / Batch</label>
                  <input
                    type="text"
                    value={basicInfo.targetClass}
                    onChange={(e) => setBasicInfo({ ...basicInfo, targetClass: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Overall Difficulty</label>
                  <select
                    value={basicInfo.difficulty}
                    onChange={(e) => setBasicInfo({ ...basicInfo, difficulty: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  >
                    <option value="Easy">Easy (Foundational)</option>
                    <option value="Medium">Medium (Application)</option>
                    <option value="Hard">Hard (Diagnostics & Edge Cases)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Topics Covered (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Loops, Functions, Pointers"
                  value={basicInfo.topics}
                  onChange={(e) => setBasicInfo({ ...basicInfo, topics: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Total Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={basicInfo.durationMinutes}
                    onChange={(e) => {
                      setBasicInfo({ ...basicInfo, durationMinutes: Number(e.target.value) });
                      setTimeWarningDismissed(false);
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Passing Percentage (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={basicInfo.passingPercentage}
                    onChange={(e) => setBasicInfo({ ...basicInfo, passingPercentage: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Passing Mark Calculated</label>
                  <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem', fontWeight: '700', color: 'var(--accent-sage)' }}>
                    {passMark} / {totalMarks} Marks
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Intelligent Time Warning Card */}
          {timeAnalysis.isTooShort && !timeWarningDismissed && (
            <div
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start'
              }}
            >
              <AlertTriangle size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#92400E', margin: '0 0 4px' }}>
                  ⚠ Time Recommendation
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#92400E', lineHeight: '1.5', margin: '0 0 10px' }}>
                  This assessment contains <strong>{totalQuestions} questions</strong> and the current time limit is <strong>{basicInfo.durationMinutes} minutes</strong>.
                  Based on question count and difficulty, students may need additional time to complete the assessment comfortably.
                  <br />
                  <strong>Recommended time: {timeAnalysis.recommendedMin}–{timeAnalysis.recommendedMax} minutes</strong>.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                    onClick={() => {
                      setBasicInfo({ ...basicInfo, durationMinutes: timeAnalysis.recommendedMin });
                      setTimeWarningDismissed(true);
                    }}
                  >
                    Increase Time to {timeAnalysis.recommendedMin} min
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                    onClick={() => setTimeWarningDismissed(true)}
                  >
                    Keep {basicInfo.durationMinutes} Minutes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Time Warning for Complex/Descriptive Questions */}
          {timeAnalysis.hasDescriptiveWarning && !timeAnalysis.isTooShort && !timeWarningDismissed && (
            <div
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start'
              }}
            >
              <Clock size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E40AF', margin: '0 0 4px' }}>
                  ⚠ Recommended Time Adjustment
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#1E40AF', lineHeight: '1.5', margin: '0 0 10px' }}>
                  This assessment contains <strong>{timeAnalysis.descriptiveCount} descriptive questions</strong> that may require additional writing time.
                  Current duration: <strong>{basicInfo.durationMinutes} minutes</strong>. Recommended: <strong>{timeAnalysis.recommendedMin} minutes</strong>.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                    onClick={() => {
                      setBasicInfo({ ...basicInfo, durationMinutes: timeAnalysis.recommendedMin });
                      setTimeWarningDismissed(true);
                    }}
                  >
                    Apply Recommendation ({timeAnalysis.recommendedMin} min)
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                    onClick={() => setTimeWarningDismissed(true)}
                  >
                    Keep {basicInfo.durationMinutes} min
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Unlimited Question Editor */}
          <div className="content-card">
            {/* Header with question tabs navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="badge-pill" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', fontWeight: '700' }}>
                  Question {activeQuestionIdx + 1} of {totalQuestions}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '4px' }}>
                  Question Editor
                </h3>
              </div>

              {/* Question actions: Duplicate, Delete, Move Up, Move Down */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  title="Move Up"
                  className="btn-secondary"
                  disabled={activeQuestionIdx === 0}
                  onClick={() => handleMoveUp(activeQuestionIdx)}
                  style={{ padding: '6px 10px' }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  title="Move Down"
                  className="btn-secondary"
                  disabled={activeQuestionIdx === totalQuestions - 1}
                  onClick={() => handleMoveDown(activeQuestionIdx)}
                  style={{ padding: '6px 10px' }}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  title="Duplicate Question"
                  className="btn-secondary"
                  onClick={() => handleDuplicateQuestion(activeQuestionIdx)}
                  style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
                >
                  <Copy size={13} />
                  <span>Duplicate</span>
                </button>
                <button
                  type="button"
                  title="Delete Question"
                  className="btn-secondary"
                  onClick={() => handleDeleteQuestion(activeQuestionIdx)}
                  style={{ padding: '6px 10px', color: '#DC2626', borderColor: '#FCA5A5' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Question Selector Pills */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px' }}>
              {questions.map((q, idx) => (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => setActiveQuestionIdx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: activeQuestionIdx === idx ? '800' : '600',
                    background: activeQuestionIdx === idx ? 'var(--accent-primary)' : 'var(--bg-surface-subtle)',
                    color: activeQuestionIdx === idx ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  Q{idx + 1} ({q.marks || 1}m)
                </button>
              ))}
              <button
                type="button"
                id="add-question-inline-btn"
                onClick={handleAddQuestion}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  background: 'var(--accent-sage-light)',
                  color: 'var(--accent-sage)',
                  border: '1px dashed var(--accent-sage)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <PlusCircle size={14} /> Add Question
              </button>
            </div>

            {/* Current Question Form */}
            {curQ && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg-surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                {/* Type, Marks, Topic, Difficulty */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Question Type</label>
                    <select
                      value={curQ.type || 'mcq'}
                      onChange={(e) => updateCurrentQuestion('type', e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                    >
                      <option value="mcq">Multiple Choice (MCQ)</option>
                      <option value="true_false">True / False</option>
                      <option value="multi_select">Multiple Select</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="descriptive">Descriptive Answer</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Question Marks</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={curQ.marks || 1}
                      onChange={(e) => updateCurrentQuestion('marks', Number(e.target.value) || 1)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Topic Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Loops, Pointers"
                      value={curQ.topic || ''}
                      onChange={(e) => updateCurrentQuestion('topic', e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Difficulty</label>
                    <select
                      value={curQ.difficulty || 'Medium'}
                      onChange={(e) => updateCurrentQuestion('difficulty', e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Question Statement */}
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Question Statement</label>
                  <textarea
                    rows={3}
                    placeholder="Enter question statement, code snippet, or technical prompt..."
                    value={curQ.question}
                    onChange={(e) => updateCurrentQuestion('question', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  />
                </div>

                {/* Options for MCQ / True False */}
                {(curQ.type === 'mcq' || curQ.type === 'true_false' || curQ.type === 'multi_select') && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: '700' }}>
                        Answer Options (Select the correct answer below)
                      </label>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Selected option is marked as correct
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {(curQ.options || ['', '', '', '']).map((opt, oIdx) => {
                        const isCorrect = curQ.correctIndex === oIdx;
                        return (
                          <div
                            key={oIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: isCorrect ? '#DCFCE7' : '#fff',
                              border: `1px solid ${isCorrect ? '#86EFAC' : 'var(--border-subtle)'}`,
                              borderRadius: 'var(--radius-sm)',
                              padding: '4px 8px'
                            }}
                          >
                            <input
                              type="radio"
                              name={`correct-ans-${curQ.id}`}
                              checked={isCorrect}
                              onChange={() => {
                                updateCurrentQuestion('correctIndex', oIdx);
                                updateCurrentQuestion('correctAnswer', opt);
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', width: '18px' }}>
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              value={opt}
                              onChange={(e) => updateOptionText(oIdx, e.target.value)}
                              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.84rem', outline: 'none' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Descriptive / Short Answer Rubric */}
                {(curQ.type === 'descriptive' || curQ.type === 'short_answer') && (
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Model Answer / Evaluation Criteria</label>
                    <textarea
                      rows={2}
                      placeholder="Enter expected keywords, key algorithm steps, or grading rubric for automated evaluation..."
                      value={curQ.explanation || ''}
                      onChange={(e) => updateCurrentQuestion('explanation', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}
                    />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Explanation & Conceptual Rationale (Shown after submission)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dereferencing *p retrieves the underlying value stored at that address."
                    value={curQ.explanation || ''}
                    onChange={(e) => updateCurrentQuestion('explanation', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}
                  />
                </div>
              </div>
            )}

            {/* Bottom Add Question Button */}
            <button
              type="button"
              id="add-question-btn"
              className="btn-secondary"
              onClick={handleAddQuestion}
              style={{ alignSelf: 'flex-start', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={15} />
              <span>[ + Add Question ]</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Sticky Test Summary Panel */}
        <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="content-card" style={{ border: '1px solid var(--border-subtle)', background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: '800', textTransform: 'uppercase' }}>
                Live Analytics
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '2px 0 0' }}>TEST SUMMARY</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Questions:</span>
                <strong style={{ fontSize: '1rem' }}>{totalQuestions}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Marks:</span>
                <strong style={{ fontSize: '1rem', color: 'var(--accent-navy)' }}>{totalMarks}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Duration:</span>
                <strong>{basicInfo.durationMinutes} min</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Average Time/Question:</span>
                <strong>{avgTimePerQuestion} min/Q</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Passing Score:</span>
                <strong style={{ color: 'var(--accent-sage)' }}>{basicInfo.passingPercentage}%</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pass Mark:</span>
                <strong>{passMark} / {totalMarks}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Difficulty:</span>
                <span className="badge-pill">{basicInfo.difficulty}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '4px' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '700' }}>
                  Topics Covered:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {uniqueTopics.map((top, idx) => (
                    <span key={idx} className="badge-pill" style={{ fontSize: '0.72rem' }}>
                      • {top}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Completion:</span>
                <strong style={{ color: '#D97706' }}>
                  {timeAnalysis.recommendedMin}–{timeAnalysis.recommendedMax} min
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: totalQuestions > 0 ? '#166534' : '#DC2626' }}>
                  {totalQuestions > 0 ? '✓ Ready to Publish' : 'Add Questions'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                id="publish-assessment-btn"
                className="btn-primary"
                onClick={handlePublishAssessment}
                disabled={isSaving}
                style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.9rem' }}
              >
                <Award size={16} />
                <span>{isSaving ? 'Publishing Assessment...' : 'Publish Assessment'}</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  alert('Assessment draft saved locally.');
                }}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Test Builder Modal */}
      {isAiBuilderOpen && (
        <div className="modal-overlay" onClick={() => setIsAiBuilderOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#D97706" />
                <h4 className="modal-title">✨ AI Test Builder</h4>
              </div>
              <button onClick={() => setIsAiBuilderOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleGenerateAiTest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 6px' }}>
                Specify curriculum parameters. AI will generate a complete <strong>Draft</strong> for your review, editing, and approval before publishing.
              </p>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Subject</label>
                <input
                  type="text"
                  required
                  value={aiDraftPrompt.subject}
                  onChange={(e) => setAiDraftPrompt({ ...aiDraftPrompt, subject: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Topics to Include</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C Programming Loops, Pointer Arithmetic, Dynamic Memory"
                  value={aiDraftPrompt.topics}
                  onChange={(e) => setAiDraftPrompt({ ...aiDraftPrompt, topics: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Number of Questions</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={aiDraftPrompt.numQuestions}
                    onChange={(e) => setAiDraftPrompt({ ...aiDraftPrompt, numQuestions: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Difficulty</label>
                  <select
                    value={aiDraftPrompt.difficulty}
                    onChange={(e) => setAiDraftPrompt({ ...aiDraftPrompt, difficulty: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={aiDraftPrompt.duration}
                    onChange={(e) => setAiDraftPrompt({ ...aiDraftPrompt, duration: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Total Marks</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={aiDraftPrompt.totalMarks}
                    onChange={(e) => setAiDraftPrompt({ ...aiDraftPrompt, totalMarks: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ border: 'none', padding: '12px 0 0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAiBuilderOpen(false)}>
                  Cancel
                </button>
                <button type="submit" id="generate-ai-draft-btn" className="btn-primary" disabled={aiLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} />
                  <span>{aiLoading ? 'Generating Questions...' : 'Generate Draft Test'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Question Quality Review Modal */}
      {isAiReviewOpen && aiReviewReport && (
        <div className="modal-overlay" onClick={() => setIsAiReviewOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={18} color="var(--accent-primary)" />
                <h4 className="modal-title">✨ AI Assessment Quality Audit</h4>
              </div>
              <button onClick={() => setIsAiReviewOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Comprehensive heuristic audit analyzing duplicates, missing answers, wording clarity, and time duration appropriateness.
              </p>

              {/* Quality Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                {aiReviewReport.checks.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                    {c.type === 'pass' ? (
                      <CheckCircle2 size={16} color="#16A34A" />
                    ) : (
                      <AlertTriangle size={16} color="#D97706" />
                    )}
                    <span style={{ fontWeight: c.type === 'pass' ? '500' : '700' }}>{c.text}</span>
                  </div>
                ))}
              </div>

              {/* Specific Issues / Recommendations */}
              {aiReviewReport.issues.length > 0 && (
                <div>
                  <h5 style={{ fontSize: '0.84rem', fontWeight: '800', color: '#92400E', margin: '0 0 6px' }}>
                    Issues Flagged for Instructor Attention:
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {aiReviewReport.issues.map((iss, i) => (
                      <div key={i} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: '#FEF3C7', color: '#92400E', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⚠</span>
                        <span>{iss}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-footer" style={{ border: 'none', padding: '10px 0 0', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-primary" onClick={() => setIsAiReviewOpen(false)}>
                  Done &amp; Return to Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
