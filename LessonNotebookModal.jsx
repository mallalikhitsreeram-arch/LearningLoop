import React, { useState, useEffect } from 'react';
import { X, BookOpen, Sparkles, CheckCircle2, Save, HelpCircle, Code, List, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const LessonNotebookModal = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  lessonId,
  lessonTitle,
  youtubeVideoId,
  videoTitle
}) => {
  const { getAuthHeaders } = useAuth();

  const [activeTab, setActiveTab] = useState('points'); // 'points', 'definitions', 'examples', 'doubts', 'summary', 'quiz'
  const [importantPoints, setImportantPoints] = useState(['']);
  const [definitions, setDefinitions] = useState(['']);
  const [examples, setExamples] = useState('');
  const [doubts, setDoubts] = useState('');
  const [summary, setSummary] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Fetch existing notebook on open
  useEffect(() => {
    if (isOpen && lessonId) {
      setIsLoading(true);
      fetch(`/api/courses/${courseId}/lessons/${lessonId}/notebook`, {
        headers: getAuthHeaders()
      })
        .then(res => res.json())
        .then(data => {
          if (data.notebook) {
            setImportantPoints(data.notebook.importantPoints?.length ? data.notebook.importantPoints : ['']);
            setDefinitions(data.notebook.definitions?.length ? data.notebook.definitions : ['']);
            setExamples(data.notebook.examples || '');
            setDoubts(data.notebook.doubts || '');
            setSummary(data.notebook.summary || '');
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, courseId, lessonId]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/notebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          youtubeVideoId,
          importantPoints: importantPoints.filter(p => p.trim() !== ''),
          definitions: definitions.filter(d => d.trim() !== ''),
          examples,
          doubts,
          summary
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving notebook:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiGenerateSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/notebook/ai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          type: 'summary',
          topic: lessonTitle,
          videoTitle
        })
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
        setActiveTab('summary');
      }
    } catch (err) {
      console.error('AI summary generation failed:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAiGenerateQuiz = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/notebook/ai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          type: 'quiz',
          topic: lessonTitle,
          videoTitle
        })
      });
      const data = await res.json();
      if (data.quiz) {
        setQuizQuestions(data.quiz);
        setQuizAnswers({});
        setActiveTab('quiz');
      }
    } catch (err) {
      console.error('AI quiz generation failed:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: '94%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, var(--bg-surface-subtle) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--accent-primary-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                📓 AI Lesson Notebook
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {courseTitle} • {lessonTitle}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Notebook"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {[
              { id: 'points', label: 'Important Points', icon: List },
              { id: 'definitions', label: 'Definitions', icon: FileText },
              { id: 'examples', label: 'Code & Examples', icon: Code },
              { id: 'doubts', label: 'Doubts', icon: HelpCircle },
              { id: 'summary', label: 'Summary', icon: BookOpen },
              { id: 'quiz', label: 'Self Quiz', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: activeTab === tab.id ? '700' : '500',
                    background: activeTab === tab.id ? 'var(--accent-primary-light)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* AI Helper Actions */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleAiGenerateSummary}
              disabled={isGeneratingAi}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                fontSize: '0.76rem',
                fontWeight: '600',
                background: 'var(--bg-surface-subtle)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
              title="Generate synthesis using AI"
            >
              <Sparkles size={12} />
              <span>{isGeneratingAi ? 'Synthesizing...' : 'AI Summary'}</span>
            </button>

            <button
              onClick={handleAiGenerateQuiz}
              disabled={isGeneratingAi}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                fontSize: '0.76rem',
                fontWeight: '600',
                background: 'var(--bg-surface-subtle)',
                color: 'var(--accent-sage)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
              title="Generate 3 self-check questions"
            >
              <Sparkles size={12} />
              <span>AI Quiz</span>
            </button>
          </div>
        </div>

        {/* Notebook Content Area */}
        <div style={{ flex: 1, padding: '18px 20px', overflowY: 'auto', background: 'var(--bg-app)' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Loading your saved notebook...</div>
            </div>
          ) : (
            <>
              {/* Important Points Tab */}
              {activeTab === 'points' && (
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Key Takeaways &amp; Important Points
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {importantPoints.map((pt, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '700', width: '20px' }}>
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          className="search-input"
                          value={pt}
                          placeholder={`Important point ${idx + 1}...`}
                          onChange={(e) => {
                            const updated = [...importantPoints];
                            updated[idx] = e.target.value;
                            setImportantPoints(updated);
                          }}
                          style={{ flex: 1, background: '#fff', borderRadius: '6px', fontSize: '0.84rem' }}
                        />
                        {importantPoints.length > 1 && (
                          <button
                            onClick={() => setImportantPoints(importantPoints.filter((_, i) => i !== idx))}
                            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setImportantPoints([...importantPoints, ''])}
                      style={{
                        alignSelf: 'flex-start',
                        marginTop: '6px',
                        background: 'none',
                        border: '1px dashed var(--border-subtle)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        color: 'var(--accent-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      + Add Another Point
                    </button>
                  </div>
                </div>
              )}

              {/* Definitions Tab */}
              {activeTab === 'definitions' && (
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Technical Definitions &amp; Rules
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {definitions.map((df, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-sage)', fontWeight: '700', width: '20px' }}>
                          D{idx + 1}
                        </span>
                        <input
                          type="text"
                          className="search-input"
                          value={df}
                          placeholder={`Definition (e.g. Variable: Named storage location in memory)...`}
                          onChange={(e) => {
                            const updated = [...definitions];
                            updated[idx] = e.target.value;
                            setDefinitions(updated);
                          }}
                          style={{ flex: 1, background: '#fff', borderRadius: '6px', fontSize: '0.84rem' }}
                        />
                        {definitions.length > 1 && (
                          <button
                            onClick={() => setDefinitions(definitions.filter((_, i) => i !== idx))}
                            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setDefinitions([...definitions, ''])}
                      style={{
                        alignSelf: 'flex-start',
                        marginTop: '6px',
                        background: 'none',
                        border: '1px dashed var(--border-subtle)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        color: 'var(--accent-sage)',
                        cursor: 'pointer'
                      }}
                    >
                      + Add Another Definition
                    </button>
                  </div>
                </div>
              )}

              {/* Code & Examples Tab */}
              {activeTab === 'examples' && (
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Code Snippets &amp; Working Examples
                  </div>
                  <textarea
                    rows={8}
                    value={examples}
                    onChange={(e) => setExamples(e.target.value)}
                    placeholder="// Paste or write lesson code snippets and working test cases here..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: '#1E2022',
                      color: '#E2E8F0',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                      lineHeight: '1.6',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* Doubts Tab */}
              {activeTab === 'doubts' && (
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Doubts, Edge Cases &amp; Questions
                  </div>
                  <textarea
                    rows={7}
                    value={doubts}
                    onChange={(e) => setDoubts(e.target.value)}
                    placeholder="Write questions or doubts to clarify with your instructor or AI Assistant..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: '#fff',
                      fontSize: '0.84rem',
                      lineHeight: '1.5',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Lesson &amp; Video Synthesis</span>
                    <button
                      onClick={handleAiGenerateSummary}
                      disabled={isGeneratingAi}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Sparkles size={11} /> Auto-Generate
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Comprehensive summary of the lesson walkthrough and video explanation..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: '#fff',
                      fontSize: '0.84rem',
                      lineHeight: '1.6',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* Quiz Tab */}
              {activeTab === 'quiz' && (
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Self-Assessment Quick Quiz</span>
                    <button
                      onClick={handleAiGenerateQuiz}
                      disabled={isGeneratingAi}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-sage)', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Sparkles size={11} /> Refresh Quiz
                    </button>
                  </div>

                  {quizQuestions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <Sparkles size={24} color="var(--accent-primary)" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>No Quiz Generated Yet</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Click below to generate a 3-question self-check test based on this lesson.
                      </div>
                      <button
                        className="btn-primary"
                        onClick={handleAiGenerateQuiz}
                        disabled={isGeneratingAi}
                        style={{ marginTop: '12px', fontSize: '0.8rem', padding: '6px 14px' }}
                      >
                        <Sparkles size={13} />
                        <span>Generate Lesson Quiz</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {quizQuestions.map((q, qIdx) => {
                        const selected = quizAnswers[qIdx];
                        return (
                          <div
                            key={qIdx}
                            style={{
                              padding: '14px',
                              background: '#fff',
                              borderRadius: '8px',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            <div style={{ fontWeight: '600', fontSize: '0.84rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                              {qIdx + 1}. {q.question}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {q.options.map((opt, optIdx) => {
                                const isPicked = selected === optIdx;
                                const isCorrect = optIdx === q.correctIndex;
                                let optBg = 'var(--bg-surface-subtle)';
                                let optColor = 'var(--text-primary)';
                                if (selected !== undefined) {
                                  if (isCorrect) {
                                    optBg = '#DCFCE7';
                                    optColor = '#166534';
                                  } else if (isPicked) {
                                    optBg = '#FEE2E2';
                                    optColor = '#991B1B';
                                  }
                                }
                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => {
                                      if (selected === undefined) {
                                        setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx });
                                      }
                                    }}
                                    style={{
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      background: optBg,
                                      color: optColor,
                                      fontSize: '0.8rem',
                                      cursor: selected === undefined ? 'pointer' : 'default',
                                      border: '1px solid var(--border-subtle)',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {String.fromCharCode(65 + optIdx)}. {opt}
                                  </div>
                                );
                              })}
                            </div>
                            {selected !== undefined && (
                              <div style={{ marginTop: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)', padding: '6px 10px', background: 'var(--bg-app)', borderRadius: '4px' }}>
                                <strong>Explanation:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saveSuccess && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-sage)', fontWeight: '600', fontSize: '0.8rem' }}>
                <CheckCircle2 size={15} /> Notes saved successfully!
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={onClose} style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
              Close
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={isSaving}
              style={{ padding: '7px 16px', fontSize: '0.82rem' }}
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Notes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
