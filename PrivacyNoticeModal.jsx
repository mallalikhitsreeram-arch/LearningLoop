import React from 'react';
import { ShieldCheck, Lock, EyeOff, Video, Mic, CheckCircle2, X } from 'lucide-react';

export const PrivacyNoticeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(30, 32, 34, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '560px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-sage-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-sage)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Interview Privacy &amp; Data Ethics Notice
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                How camera and microphone data are handled during AI Mock Interviews
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Guarantee 1 */}
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }}>
                <EyeOff size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Zero Raw Video Storage
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                  Your live video feed is processed <strong>locally in real-time within your browser</strong> solely to evaluate visual presence and camera engagement indicators. <strong>No raw camera footage is recorded, saved, or uploaded to our servers.</strong>
                </p>
              </div>
            </div>

            {/* Guarantee 2 */}
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ color: 'var(--accent-sage)', flexShrink: 0, marginTop: '2px' }}>
                <Lock size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Isolated Student Feedback
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                  Camera engagement data is strictly for your personal learning progress and is <strong>never exposed to parents, teachers, or external recruiters</strong>. Only high-level score statistics are reflected on your student dashboard.
                </p>
              </div>
            </div>

            {/* Guarantee 3 */}
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ color: 'var(--accent-navy)', flexShrink: 0, marginTop: '2px' }}>
                <Video size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Complete Hardware Release on Completion
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                  Camera and microphone hardware devices are <strong>only active during the active interview session</strong>. As soon as you click &quot;End Interview&quot; or the interview finishes, all hardware media tracks are completely stopped and released by your browser.
                </p>
              </div>
            </div>

            {/* Guarantee 4 */}
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: '2px' }}>
                <Mic size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Responsible Objective Evaluation
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                  Our evaluation focuses strictly on constructive interview communication: clarity, vocabulary, answer structure, and visual presence. We <strong>do not make unsupported claims</strong> regarding emotional states or sensitive personal characteristics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: 'var(--bg-surface-subtle)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
