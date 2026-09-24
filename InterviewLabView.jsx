import React, { useState, useEffect } from 'react';
import {
  Video,
  Mic,
  Brain,
  Sparkles,
  Award,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  BarChart3,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { MockInterviewSession } from './MockInterviewSession.jsx';

export const InterviewLabView = () => {
  const { currentUser } = useAuth();
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fetch past interview history from API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('ll_auth_token') || sessionStorage.getItem('ll_auth_token');
        if (!token || !currentUser?.id) {
          setIsLoadingHistory(false);
          return;
        }

        const res = await fetch(`/api/interview/history/${currentUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setInterviewHistory(data);
        }
      } catch (e) {
        console.warn('Could not load interview history:', e);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [currentUser, isInterviewActive]);

  // If in an active mock interview session, render MockInterviewSession
  if (isInterviewActive) {
    return (
      <MockInterviewSession
        onBackToLab={() => setIsInterviewActive(false)}
        initialTopic={currentUser?.branch || 'General Technical & HR'}
      />
    );
  }

  // Otherwise render Communication & Interview Lab Landing Hub
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-primary-light)',
            color: 'var(--accent-primary)',
            fontSize: '0.75rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '8px'
          }}>
            <Brain size={13} /> CAREER READINESS &amp; LAB
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Communication &amp; Interview Lab
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Interactive AI speech &amp; camera simulation to master technical, behavioral, and placement interviews.
          </p>
        </div>
      </div>

      {/* Featured AI Mock Interview Hero Banner */}
      <div className="content-card" style={{
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%)',
        border: '1px solid var(--border-subtle)',
        display: 'grid',
        gridTemplateColumns: '1.4fr 0.8fr',
        gap: '32px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-sage-light)',
            color: 'var(--accent-sage)',
            fontSize: '0.74rem',
            fontWeight: '700',
            marginBottom: '12px'
          }}>
            <Sparkles size={13} /> REAL-TIME CAMERA + MICROPHONE EXPERIENCE
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px' }}>
            AI Mock Interview Simulation
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: '20px' }}>
            Experience real-world pressure before your real campus placements. The AI interviewer analyzes your
            spoken answers, communication structure, vocabulary, and visual camera engagement in real time — with zero raw video saved.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={15} color="var(--accent-sage)" />
              <span>Personalized for {currentUser?.branch || 'Engineering'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={15} color="var(--accent-sage)" />
              <span>Speech-to-Text Transcription</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={15} color="var(--accent-sage)" />
              <span>Live Visual Presence Guidance</span>
            </div>
          </div>

          <button
            id="start-mock-interview-btn"
            onClick={() => setIsInterviewActive(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 26px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: '800',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.15s ease',
              cursor: 'pointer'
            }}
          >
            <Video size={18} />
            <span>Start Mock Interview</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Right Info Highlights */}
        <div style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            Interview Lab Specifications
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Target Role</span>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {currentUser?.target_role || 'Software Engineer'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Interview Duration</span>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              5–8 Core Questions (~10m)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Input Modality</span>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--accent-sage)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Video size={14} /> Camera + <Mic size={14} /> Microphone
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Privacy Protocol</span>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--accent-navy)' }}>
              In-Browser Only (No Video Saved)
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 3 Core Practice Labs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {/* Lab 1: Common Interview Questions */}
        <div className="content-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              marginBottom: '14px'
            }}>
              <MessageSquare size={20} />
            </div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Common Placement Q&amp;A
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
              Master the top 50 technical, behavioral, and HR questions asked by tech leaders with model STAR answers.
            </p>
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
            50 Curated Questions Available
          </div>
        </div>

        {/* Lab 2: Speech & Speaking Pace Drills */}
        <div className="content-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-sage-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-sage)',
              marginBottom: '14px'
            }}>
              <Mic size={20} />
            </div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Speaking Pace &amp; Clarity
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
              Practice delivering technical concepts between 120–150 words per minute to maximize listener retention.
            </p>
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent-sage)' }}>
            Audio Metric Analysis Active
          </div>
        </div>

        {/* Lab 3: Remote Video Presence */}
        <div className="content-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-navy-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-navy)',
              marginBottom: '14px'
            }}>
              <Video size={20} />
            </div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Virtual Camera Presence
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
              Learn framing, lighting, eye contact, and head orientation techniques to project professional remote confidence.
            </p>
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent-navy)' }}>
            Responsible Indicators Guide
          </div>
        </div>
      </div>

      {/* Previous Mock Interview Reports */}
      <div className="content-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
          Recent Mock Interview Sessions &amp; Reports
        </h3>

        {interviewHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {interviewHistory.map((sess, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-surface-elevated)'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    AI Mock Interview ({sess.targetRole || 'Software Engineering'})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {sess.date || 'Recent Session'} • {sess.totalQuestions || 5} Questions Evaluated
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Overall Score</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-primary)' }}>
                      {sess.overallScore}/100
                    </div>
                  </div>
                  <button
                    onClick={() => setIsInterviewActive(true)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: 'var(--accent-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    Retest
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)'
          }}>
            <Award size={36} style={{ margin: '0 auto 10px', opacity: 0.5, color: 'var(--accent-primary)' }} />
            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              No mock interviews completed yet
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '400px', margin: '4px auto 16px' }}>
              Launch your first practice session above to evaluate your communication, clarity, and camera engagement.
            </p>
            <button
              onClick={() => setIsInterviewActive(true)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.84rem'
              }}
            >
              Start First Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
