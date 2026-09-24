import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, BookOpen, ChevronDown } from 'lucide-react';
import { getTutorResponse } from '../../utils/aiTutor.js';

// ─── Available subjects ────────────────────────────────────────────────────────
const SUBJECTS = [
  { label: 'Physics',          key: 'physics',          emoji: '⚛️',  available: true  },
  { label: 'Mathematics',      key: 'mathematics',      emoji: '📐',  available: true  },
  { label: 'Chemistry',        key: 'chemistry',        emoji: '🧪',  available: false },
  { label: 'Biology',          key: 'biology',          emoji: '🌿',  available: false },
  { label: 'Computer Science', key: 'computer science', emoji: '💻',  available: false },
  { label: 'Programming',      key: 'programming',      emoji: '🖥️', available: false },
];

// ─── Welcome message ───────────────────────────────────────────────────────────
const WELCOME = {
  role: 'tutor',
  text: "👋 Hi! I'm your Learning Loops AI Tutor.\n\nSelect a subject above, then type your question. I'll explain the concept, walk through an example, share key points, and give you a practice question — all from your local knowledge base.\n\nCurrently available: Physics and Mathematics.",
};

// ─── Component ─────────────────────────────────────────────────────────────────
export const AiTutorModal = ({ onClose }) => {
  const [subject, setSubject]   = useState('');
  const [input, setInput]       = useState('');
  const [messages, setMessages] = useState([WELCOME]);
  const inputRef  = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const q = input.trim();
    if (!q) return;

    const userMsg   = { role: 'user', text: q };
    const tutorText = getTutorResponse(subject, q);
    const tutorMsg  = { role: 'tutor', text: tutorText };

    setMessages(prev => [...prev, userMsg, tutorMsg]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSubjectSelect = (key) => {
    setSubject(key);
    const sub = SUBJECTS.find(s => s.key === key);
    if (!sub) return;
    const systemMsg = sub.available
      ? { role: 'system', text: `📚 Subject set to **${sub.label}**. Go ahead and ask your question!` }
      : { role: 'system', text: `⏳ **${sub.label}** content is coming soon! Currently only Physics and Mathematics are available. Please select one of those.` };
    setMessages(prev => [...prev, systemMsg]);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-end', padding: '0' }}>
      {/* Modal card — stop click from bubbling to overlay */}
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '92vh',
          height: '680px',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          margin: '0 auto',
        }}
      >
        {/* ── Header ── */}
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #4A90E2, #2E75CC)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              flexShrink: 0,
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: '1rem' }}>AI Tutor</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                Powered by local knowledge base · No internet required
              </div>
            </div>
          </div>
          <button
            id="ai-tutor-close-btn"
            aria-label="Close AI Tutor"
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)',
              cursor: 'pointer', color: 'var(--text-muted)',
              transition: 'background 0.15s',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Subject picker ── */}
        <div style={{
          padding: '10px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-subtle)',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Subject
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SUBJECTS.map(s => (
              <button
                key={s.key}
                id={`ai-tutor-subject-${s.key.replace(/\s+/g, '-')}`}
                onClick={() => handleSubjectSelect(s.key)}
                title={s.available ? s.label : `${s.label} — coming soon`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  border: subject === s.key
                    ? '1.5px solid #4A90E2'
                    : '1.5px solid var(--border-subtle)',
                  background: subject === s.key
                    ? '#EBF3FD'
                    : s.available ? '#fff' : 'var(--bg-surface-subtle)',
                  color: subject === s.key
                    ? '#2E75CC'
                    : s.available ? 'var(--text-primary)' : 'var(--text-muted)',
                  opacity: s.available ? 1 : 0.6,
                }}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
                {!s.available && (
                  <span style={{ fontSize: '0.65rem', fontWeight: '500', opacity: 0.7 }}>Soon</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat messages ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {messages.map((msg, idx) => {
            if (msg.role === 'system') {
              return (
                <div key={idx} style={{
                  alignSelf: 'center',
                  background: '#EBF3FD',
                  border: '1px solid #BFDFFF',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  color: '#2E75CC',
                  textAlign: 'center',
                  maxWidth: '90%',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
              );
            }

            const isUser = msg.role === 'user';
            return (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: '8px',
                alignItems: 'flex-start',
              }}>
                {!isUser && (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                    background: 'linear-gradient(135deg, #4A90E2, #2E75CC)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    <Sparkles size={14} />
                  </div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '10px 14px',
                  borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                  background: isUser
                    ? 'linear-gradient(135deg, #4A90E2, #2E75CC)'
                    : 'var(--bg-surface-subtle)',
                  color: isUser ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: isUser
                    ? '0 2px 8px rgba(74,144,226,0.25)'
                    : 'var(--shadow-xs)',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {msg.text}
                </div>
                {isUser && (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                    background: 'var(--border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem',
                  }}>
                    👤
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ── */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            id="ai-tutor-question-input"
            type="text"
            className="search-input"
            style={{ flex: 1, borderRadius: '10px', padding: '9px 16px' }}
            placeholder={subject
              ? `Ask about ${SUBJECTS.find(s => s.key === subject)?.label || subject}…`
              : 'Select a subject first, then type your question…'
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            id="ai-tutor-send-btn"
            className="btn-primary"
            style={{ padding: '9px 16px', borderRadius: '10px', flexShrink: 0 }}
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send question"
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
