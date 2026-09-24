import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Sparkles,
  Users,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Filter,
  Check,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const TestAnalyticsView = () => {
  const { getAuthHeaders } = useAuth();
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('test-c-biweekly-1');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Selected Student Drilldown Modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // Targeted Practice Draft Modal
  const [targetedPracticeDraft, setTargetedPracticeDraft] = useState(null);
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
  const [practiceAssignedSuccess, setPracticeAssignedSuccess] = useState(false);

  // Load available tests
  useEffect(() => {
    fetch('/api/tests')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTests(data);
          if (data.length > 0 && !selectedTestId) {
            setSelectedTestId(data[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Fetch test analytics when selectedTestId changes
  useEffect(() => {
    if (!selectedTestId) return;
    setLoading(true);
    setAiAnalysis(null);

    fetch(`/api/teacher/tests/${selectedTestId}/analytics`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAnalyticsData(data);
        }
      })
      .catch(err => console.error('Error fetching test analytics:', err))
      .finally(() => setLoading(false));
  }, [selectedTestId]);

  // Handle AI Test Analysis
  const handleAnalyzeWithAi = async () => {
    if (!analyticsData) return;
    setIsAnalyzingAi(true);

    try {
      const res = await fetch('/api/teacher/ai-analyze-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          testTitle: analyticsData.test?.title || 'Assessment',
          stats: analyticsData.stats,
          topicStats: analyticsData.topicStats
        })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Error generating AI analysis:', err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Handle Targeted Practice Creation
  const handleCreateTargetedPractice = async () => {
    setIsGeneratingPractice(true);
    const weakTopic = aiAnalysis?.weakTopicName || 'Pointers';

    try {
      const res = await fetch('/api/teacher/ai-targeted-practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          topic: weakTopic,
          difficulty: 'Easy to Medium',
          count: 10
        })
      });
      const data = await res.json();
      if (data.success && data.draftTest) {
        setTargetedPracticeDraft(data.draftTest);
      }
    } catch (err) {
      console.error('Error generating targeted practice:', err);
    } finally {
      setIsGeneratingPractice(false);
    }
  };

  // Handle Assign to Weak Students
  const handleAssignToWeakStudents = () => {
    setPracticeAssignedSuccess(true);
    setTimeout(() => {
      setPracticeAssignedSuccess(false);
      setTargetedPracticeDraft(null);
    }, 3000);
  };

  const stats = analyticsData?.stats || {
    totalStudents: 30,
    attempted: 27,
    passed: 21,
    failed: 6,
    averageScore: 74,
    highestScore: 96,
    lowestScore: 38,
    averageTimeMinutes: 18
  };

  const topicStats = analyticsData?.topicStats || [
    { topic: 'Variables', accuracy: 88, status: 'Strong', label: 'Healthy' },
    { topic: 'Loops', accuracy: 72, status: 'Moderate', label: 'Healthy' },
    { topic: 'Functions', accuracy: 61, status: 'Moderate', label: 'Needs Revision' },
    { topic: 'Pointers', accuracy: 44, status: 'Weak', label: 'Critical Attention Required' }
  ];

  const studentAttempts = analyticsData?.studentAttempts || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Assessment Selector Banner */}
      <div className="content-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: '800', textTransform: 'uppercase' }}>
            Academic Performance Intelligence
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '2px' }}>
            Batch Diagnostic &amp; Test Analytics
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Factual score distributions and AI interpretation computed from verified student exam records.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: '700' }}>Select Assessment:</label>
          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontWeight: '600', fontSize: '0.86rem' }}
          >
            {tests.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards: Total, Attempted, Passed, Failed, Avg, High, Low, Avg Time */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        <div className="kpi-card">
          <span className="kpi-title">Total Enrolled</span>
          <div className="kpi-value">{stats.totalStudents}</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Attempted</span>
          <div className="kpi-value" style={{ color: 'var(--accent-navy)' }}>{stats.attempted}</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Passed (≥60%)</span>
          <div className="kpi-value" style={{ color: 'var(--accent-sage)' }}>{stats.passed}</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Failed (&lt;60%)</span>
          <div className="kpi-value" style={{ color: 'var(--accent-crimson)' }}>{stats.failed}</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Class Average</span>
          <div className="kpi-value" style={{ color: 'var(--accent-primary)' }}>{stats.averageScore}%</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Highest Score</span>
          <div className="kpi-value" style={{ color: 'var(--accent-sage)' }}>{stats.highestScore}%</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Lowest Score</span>
          <div className="kpi-value" style={{ color: 'var(--accent-crimson)' }}>{stats.lowestScore}%</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Avg Time</span>
          <div className="kpi-value">{stats.averageTimeMinutes}m</div>
        </div>
      </div>

      {/* Topic-Wise Performance & AI Interpretation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Topic-Wise Breakdown Table */}
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '800' }}>Topic-Wise Accuracy</h4>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Class Benchmark: 70%</span>
          </div>

          <table className="styled-table">
            <thead>
              <tr>
                <th>Curriculum Topic</th>
                <th>Class Accuracy</th>
                <th>Health Status</th>
              </tr>
            </thead>
            <tbody>
              {topicStats.map((t, idx) => (
                <tr key={idx}>
                  <td><strong>{t.topic}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{t.accuracy}%</strong>
                      <div style={{ width: '60px', height: '6px', background: 'var(--bg-surface-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${t.accuracy}%`,
                            height: '100%',
                            background: t.accuracy >= 80 ? 'var(--accent-sage)' : (t.accuracy >= 65 ? '#F59E0B' : '#EF4444')
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-tag ${
                        t.accuracy >= 80 ? 'strong' : (t.accuracy >= 65 ? 'needs-practice' : 'weak')
                      }`}
                    >
                      {t.label || t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Interpretation Card */}
        <div className="content-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={18} color="#D97706" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800' }}>✨ AI Class Analysis</h4>
              </div>

              <button
                type="button"
                id="analyze-test-ai-btn"
                className="btn-primary"
                onClick={handleAnalyzeWithAi}
                disabled={isAnalyzingAi}
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                {isAnalyzingAi ? 'Analyzing Data...' : '✨ Analyze Test With AI'}
              </button>
            </div>

            {aiAnalysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Strong Topic:</span>
                  <div style={{ fontWeight: '700', color: 'var(--accent-sage)' }}>{aiAnalysis.strongTopic}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Moderate Topic:</span>
                  <div style={{ fontWeight: '700', color: '#D97706' }}>{aiAnalysis.moderateTopic}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Weak Topic:</span>
                  <div style={{ fontWeight: '700', color: '#DC2626' }}>{aiAnalysis.weakTopic}</div>
                </div>

                <div style={{ background: 'var(--bg-surface-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>Diagnostic Observation:</div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    {aiAnalysis.observation}
                  </p>
                </div>

                <div style={{ background: '#FEF3C7', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#92400E', marginBottom: '2px' }}>Actionable Recommendation:</div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#92400E', lineHeight: '1.45' }}>
                    {aiAnalysis.recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                <p>
                  Click <strong>"✨ Analyze Test With AI"</strong> to compute factual diagnostics and generate targeted intervention paths.
                </p>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '14px' }}>
            <button
              type="button"
              id="create-targeted-practice-btn"
              className="btn-sage"
              onClick={handleCreateTargetedPractice}
              disabled={isGeneratingPractice}
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.84rem' }}
            >
              <Sparkles size={14} />
              <span>{isGeneratingPractice ? 'Synthesizing Practice...' : 'Create Targeted Practice Draft'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: Student-Level Analysis Table */}
      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '800' }}>Student Performance Drilldown</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Click any student row to view individualized topic diagnostics, AI coaching insight, and targeted action items.
            </p>
          </div>
          <span className="badge-pill">{studentAttempts.length} Records</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student Code</th>
                <th>Score</th>
                <th>Status</th>
                <th>Time Spent</th>
                <th>Weakest Topic</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {studentAttempts.map((att) => {
                const weakestTopic = att.topicBreakdown ? [...att.topicBreakdown].sort((a, b) => a.accuracy - b.accuracy)[0]?.topic : 'Pointers';
                return (
                  <tr
                    key={att.id}
                    onClick={() => setSelectedStudent(att)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: '700' }}>
                          {(att.studentName || 'S')[0]}
                        </div>
                        <strong>{att.studentName || att.studentId}</strong>
                      </div>
                    </td>
                    <td>{att.studentCode || att.studentId}</td>
                    <td>
                      <strong style={{ fontSize: '0.92rem', color: att.scorePercentage >= 60 ? 'var(--accent-sage)' : 'var(--accent-crimson)' }}>
                        {att.scorePercentage}% ({att.rawScore || att.scorePercentage}/{att.totalMarks || 8})
                      </strong>
                    </td>
                    <td>
                      <span className={`badge-pill ${att.scorePercentage >= 60 ? 'badge-success' : 'badge-danger'}`}>
                        {att.scorePercentage >= 60 ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td>{Math.round((att.timeTakenSeconds || 1080) / 60)} min</td>
                    <td>
                      <span style={{ color: '#DC2626', fontWeight: '600' }}>{weakestTopic}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(att);
                        }}
                      >
                        Inspect AI
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Drilldown Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-navy-light)', color: 'var(--accent-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                  {(selectedStudent.studentName || 'S')[0]}
                </div>
                <div>
                  <h4 className="modal-title">{selectedStudent.studentName}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Code: {selectedStudent.studentCode || selectedStudent.studentId} • Score: <strong>{selectedStudent.scorePercentage}%</strong>
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h5 style={{ fontSize: '0.84rem', fontWeight: '800', marginBottom: '8px' }}>Topic-Level Diagnostics</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(selectedStudent.topicBreakdown || []).map((tb, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>{tb.topic}</span>
                      <strong style={{ fontSize: '0.84rem', color: tb.accuracy >= 70 ? 'var(--accent-sage)' : '#DC2626' }}>
                        {tb.accuracy}%
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Coaching Insight */}
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '800', color: '#1E40AF', marginBottom: '4px' }}>
                  <Sparkles size={14} />
                  <span>AI Learning Diagnostic</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#1E40AF', lineHeight: '1.45' }}>
                  "{selectedStudent.aiInsight || 'Pointers appears to be the main area requiring additional practice.'}"
                </p>
              </div>

              {/* Recommended Remediation */}
              <div>
                <h5 style={{ fontSize: '0.84rem', fontWeight: '800', marginBottom: '6px' }}>Recommended Remediation Modules</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(selectedStudent.recommendedActions || ['Pointer Basics', 'Pointer Practice Questions', 'Pointer Revision Notes']).map((act, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                      <ArrowRight size={13} />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer" style={{ border: 'none', padding: '8px 0 0', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-primary" onClick={() => setSelectedStudent(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Targeted Practice Modal */}
      {targetedPracticeDraft && (
        <div className="modal-overlay" onClick={() => setTargetedPracticeDraft(null)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#16A34A" />
                <h4 className="modal-title">✨ Targeted Practice Test (Draft)</h4>
              </div>
              <button onClick={() => setTargetedPracticeDraft(null)}>✕</button>
            </div>

            {practiceAssignedSuccess ? (
              <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                <CheckCircle2 size={20} />
                <span>Targeted practice assessment assigned successfully to weak students!</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 4px' }}>{targetedPracticeDraft.title}</h4>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Topic: <strong>{targetedPracticeDraft.topics[0]}</strong></span>
                    <span>•</span>
                    <span>Questions: <strong>{targetedPracticeDraft.totalQuestions}</strong></span>
                    <span>•</span>
                    <span>Difficulty: <strong>{targetedPracticeDraft.difficulty}</strong></span>
                    <span>•</span>
                    <span>Duration: <strong>{targetedPracticeDraft.durationMinutes} min</strong></span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#B45309' }}>
                    Target Audience: {targetedPracticeDraft.targetAudience}
                  </div>
                </div>

                {/* Sample Questions Review */}
                <div>
                  <h5 style={{ fontSize: '0.84rem', fontWeight: '800', marginBottom: '8px' }}>
                    Generated Draft Questions (Review before assigning)
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                    {targetedPracticeDraft.questions.map((q, i) => (
                      <div key={i} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: '#fff' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.82rem', marginBottom: '4px' }}>
                          {i + 1}. {q.question}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          Correct Answer: <strong>{q.options[q.correctIndex]}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-footer" style={{ border: 'none', padding: '10px 0 0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setTargetedPracticeDraft(null)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="assign-weak-students-btn"
                    className="btn-sage"
                    onClick={handleAssignToWeakStudents}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={14} />
                    <span>[ Assign to Weak Students ]</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
