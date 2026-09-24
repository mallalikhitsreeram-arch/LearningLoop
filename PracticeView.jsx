import React, { useState, useEffect } from 'react';
import { CheckSquare, Filter, ArrowRight, CheckCircle2, XCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { syncEngine } from '../../services/syncEngine.js';

export const PracticeView = ({ initialTopic = null }) => {
  const { isEffectiveOnline } = useNetwork();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [stats, setStats] = useState({ total: 0, correct: 0 });

  useEffect(() => {
    fetch('/api/practice/questions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setQuestions(data);
      })
      .catch(() => {});
  }, []);

  const filteredQuestions = questions.filter(q => {
    if (selectedTopic !== 'all' && q.topic.toLowerCase() !== selectedTopic.toLowerCase()) return false;
    if (selectedDifficulty !== 'all' && q.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
    return true;
  });

  const currentQ = filteredQuestions[currentIndex] || questions[0];

  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0)
    }));

    // Record practice activity via syncEngine
    await syncEngine.queueActivity('practice_solved', {
      questionId: currentQ.id,
      topic: currentQ.topic,
      isCorrect,
      count: 1
    });
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back
    }
  };

  const topics = ['Loops', 'Arrays', 'Functions', 'Pointers', 'Flexbox', 'Async JS'];

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Practice Header & Filters */}
      <div className="content-card" style={{ marginBottom: '20px' }}>
        <div className="section-header" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={20} color="var(--accent-primary)" />
            <h2 className="section-title">Interactive Practice Mode</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem' }}>
            <span>Solved: <strong>{stats.total}</strong></span>
            <span>Accuracy: <strong>{stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 100}%</strong></span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
            Topic:
          </span>
          <button
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              background: selectedTopic === 'all' ? 'var(--accent-primary)' : 'var(--bg-surface-subtle)',
              color: selectedTopic === 'all' ? '#fff' : 'var(--text-secondary)'
            }}
            onClick={() => { setSelectedTopic('all'); setCurrentIndex(0); }}
          >
            All Topics
          </button>
          {topics.map(t => (
            <button
              key={t}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                background: selectedTopic === t ? 'var(--accent-primary)' : 'var(--bg-surface-subtle)',
                color: selectedTopic === t ? '#fff' : 'var(--text-secondary)'
              }}
              onClick={() => { setSelectedTopic(t); setCurrentIndex(0); }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      {currentQ ? (
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-navy)', background: 'var(--accent-navy-light)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
              Topic: {currentQ.topic} • {currentQ.difficulty}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Question {currentIndex + 1} of {filteredQuestions.length || 1}
            </span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px', lineHeight: '1.5' }}>
            {currentQ.question}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {currentQ.options.map((opt, idx) => {
              let optionStyle = {
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: '#fff',
                cursor: isAnswerSubmitted ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              };

              if (selectedOption === idx) {
                optionStyle.borderColor = 'var(--accent-primary)';
                optionStyle.background = 'var(--accent-primary-light)';
              }

              if (isAnswerSubmitted) {
                if (idx === currentQ.correctIndex) {
                  optionStyle.borderColor = '#10B981';
                  optionStyle.background = '#ECFDF5';
                } else if (selectedOption === idx) {
                  optionStyle.borderColor = '#EF4444';
                  optionStyle.background = '#FEF2F2';
                }
              }

              return (
                <div key={idx} style={optionStyle} onClick={() => handleSelectOption(idx)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700' }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{opt}</span>
                  </div>

                  {isAnswerSubmitted && idx === currentQ.correctIndex && (
                    <CheckCircle2 size={18} color="#10B981" />
                  )}
                  {isAnswerSubmitted && selectedOption === idx && idx !== currentQ.correctIndex && (
                    <XCircle size={18} color="#EF4444" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswerSubmitted && (
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: selectedOption === currentQ.correctIndex ? '#ECFDF5' : '#FFFBEB', border: `1px solid ${selectedOption === currentQ.correctIndex ? '#A7F3D0' : '#FDE68A'}`, marginBottom: '24px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: selectedOption === currentQ.correctIndex ? '#065F46' : '#92400E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={16} />
                {selectedOption === currentQ.correctIndex ? 'Correct Answer!' : 'Explanation & Diagnostic Insight:'}
              </div>
              <p style={{ fontSize: '0.84rem', marginTop: '6px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {!isAnswerSubmitted ? (
              <button
                className="btn-primary"
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                style={{ opacity: selectedOption === null ? 0.6 : 1 }}
              >
                Submit Answer
              </button>
            ) : (
              <button className="btn-primary" onClick={handleNextQuestion}>
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No questions found for the selected filter.</p>
          <button className="btn-secondary" style={{ marginTop: '12px' }} onClick={() => setSelectedTopic('all')}>
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
