import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, User, WifiOff, Target, ArrowRight } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const AiAssistantModal = ({ onClose, onNavigateToPractice }) => {
  const { isEffectiveOnline } = useNetwork();
  const { t } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello Aarav! I'm your Learning Loops AI Assistant. I've analyzed your progress toward **Web Development** and your latest assessment in **C Programming** (82%). How can I help you today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg = { role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    if (isEffectiveOnline) {
      try {
        const res = await fetch('/api/ai/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q, studentId: 'usr-student-1' })
        });
        const data = await res.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: data.reply,
          actionTopic: data.actionTopic
        }]);
      } catch (err) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: "I encountered a network hiccup, but here is your cached advice: Practice **Pointers** (45% accuracy) and continue your daily 25-minute study target to protect your 12-day streak."
        }]);
      }
    } else {
      // Offline fallback: Rule-based heuristic tutor!
      setTimeout(() => {
        let offlineReply = "Offline Assistant Diagnostic: Based on your locally stored records, your biggest score lever is **Pointers & Memory Dereferencing** (45%). You have 12 downloaded lessons in C and HTML & CSS ready to study offline.";
        if (q.toLowerCase().includes('study plan')) {
          offlineReply = "Cached Study Plan (Offline Mode):\n• Day 1: Pointers & Call Stack Drill\n• Day 2: Array bounds checking\n• Day 3: HTML5 Form Validation\n• Day 4: Flexbox Alignment Practice\n• Day 5: Offline Mock Quiz";
        }
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: offlineReply,
          actionTopic: 'Pointers'
        }]);
      }, 300);
    }

    setIsLoading(false);
  };

  const quickPrompts = [
    "What should I practice today?",
    "Why am I weak in Pointers?",
    "Create a 7-day study plan",
    "Which course should I learn next?"
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', height: '620px', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} />
            </div>
            <div>
              <h4 className="modal-title" style={{ fontSize: '1.05rem' }}>AI Learning Assistant</h4>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {isEffectiveOnline ? 'Context: Web Development Track • 12-Day Streak' : '⚡ Offline Mode (Cached Diagnostic Guidance)'}
              </div>
            </div>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Offline Banner inside assistant */}
        {!isEffectiveOnline && (
          <div style={{ background: '#FFF7ED', borderBottom: '1px solid #FED7AA', padding: '6px 16px', fontSize: '0.76rem', color: '#9A3412', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <WifiOff size={13} />
            <span>{t('ai_offline_notice')}</span>
          </div>
        )}

        {/* Chat History */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {m.role === 'assistant' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <Bot size={16} />
                </div>
              )}

              <div
                style={{
                  background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-surface-subtle)',
                  color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {m.text}

                {m.actionTopic && (
                  <div style={{ marginTop: '10px' }}>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem', background: 'var(--bg-surface)', color: 'var(--accent-primary)', border: '1px solid var(--border-subtle)' }}
                      onClick={() => {
                        onClose();
                        if (onNavigateToPractice) onNavigateToPractice(m.actionTopic);
                      }}
                    >
                      <Target size={13} />
                      <span>Practice {m.actionTopic} Now</span>
                    </button>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <User size={16} color="var(--text-secondary)" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Sparkles size={14} className="spin-animation" />
              <span>Analyzing your progress and weak topics...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              style={{
                whiteSpace: 'nowrap',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface-subtle)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
              onClick={() => handleSend(qp)}
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="search-input"
            style={{ borderRadius: 'var(--radius-md)' }}
            placeholder={t('ai_placeholder')}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          />
          <button className="btn-primary" onClick={() => handleSend()} disabled={!inputQuery.trim()}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
