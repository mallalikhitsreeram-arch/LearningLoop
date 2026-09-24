import React, { useState } from 'react';
import { LogIn, Phone, Mail, ShieldCheck, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const LoginModal = ({ isOpen, onClose }) => {
  const { loginUser, availableUsers } = useAuth();
  const [roleTab, setRoleTab] = useState('student'); // 'student', 'teacher', 'parent'
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setOtp('424242'); // Auto-fill demo OTP for tester convenience!
      }
    } catch (err) {
      setErrorMsg('Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (data.success) {
        loginUser(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setErrorMsg('Verification failed.');
    }
  };

  const handleQuickLogin = (user) => {
    loginUser(user);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogIn size={20} color="var(--accent-primary)" />
            <h4 className="modal-title">Sign in to Learning Loops</h4>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Role Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: 'var(--bg-surface-subtle)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
            {['student', 'teacher', 'parent'].map(r => (
              <button
                key={r}
                style={{
                  padding: '6px 0',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: roleTab === r ? '700' : '500',
                  background: roleTab === r ? '#fff' : 'transparent',
                  color: roleTab === r ? 'var(--text-primary)' : 'var(--text-muted)',
                  textTransform: 'capitalize'
                }}
                onClick={() => { setRoleTab(r); setOtpSent(false); setErrorMsg(''); }}
              >
                {r}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: '#FEE2E2', color: '#991B1B', fontSize: '0.8rem' }}>
              {errorMsg}
            </div>
          )}

          {/* Student Phone + OTP Form */}
          {roleTab === 'student' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Mobile Phone Number</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                  <button className="btn-secondary" onClick={handleSendOtp} style={{ fontSize: '0.8rem' }}>
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--accent-sage)', fontWeight: '600', marginBottom: '4px' }}>
                    <span>Demo OTP sent: <strong>424242</strong></span>
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                  <button className="btn-primary" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }} onClick={handleVerifyOtp}>
                    Verify OTP &amp; Continue
                  </button>
                </div>
              )}

              {/* Fast 1-Click Demo Profiles */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '6px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Or Fast Demo Sign In:
                </div>
                <button
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.84rem' }}
                  onClick={() => handleQuickLogin(availableUsers.find(u => u.id === 'usr-student-1') || { id: 'usr-student-1', name: 'Aarav Sharma', role: 'student', profileCompleted: true })}
                >
                  🎒 Sign In as <strong>Aarav Sharma</strong> (Web Dev, 12-day streak)
                </button>
              </div>
            </div>
          )}

          {/* Teacher Login Tab */}
          {roleTab === 'teacher' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Access teacher classes, student evaluations, test builder, and class performance analytics.
              </div>
              <button
                className="btn-primary"
                style={{ justifyContent: 'center' }}
                onClick={() => handleQuickLogin(availableUsers.find(u => u.role === 'teacher') || { id: 'usr-teacher-1', name: 'Prof. K. Ramanujan', role: 'teacher' })}
              >
                👨‍🏫 Sign in as <strong>Prof. K. Ramanujan</strong> (CSE Faculty)
              </button>
            </div>
          )}

          {/* Parent Login Tab */}
          {roleTab === 'parent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Secure parent view for verified child learning hours, consistency streaks, and exam results.
              </div>
              <button
                className="btn-primary"
                style={{ justifyContent: 'center' }}
                onClick={() => handleQuickLogin(availableUsers.find(u => u.role === 'parent') || { id: 'usr-parent-1', name: 'Rajesh Sharma', role: 'parent' })}
              >
                👨‍👧 Sign in as <strong>Rajesh Sharma</strong> (Parent of Aarav)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
