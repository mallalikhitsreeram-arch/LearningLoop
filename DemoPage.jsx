import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// ─── Learning Loops SVG Logo (same as LoginPage) ────────────────────────────
const LLLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5H4" />
    <path d="M4 14l-3-3 3-3" />
    <path d="M17 12a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5h8" />
    <path d="M20 10l3 3-3 3" />
  </svg>
);

// ─── Demo accounts — same set used in the former Quick Demo tab ──────────────
const DEMO_ACCOUNTS = [
  {
    id: 'demo-student-btn',
    demoId: 'usr-student-1',
    role: 'student',
    emoji: '🎓',
    name: 'Student 1: Likhit Sreeram Malla (STU1001)',
    desc: 'AI & Machine Learning • 12-Day Streak • 248 Solved • 82% Avg'
  },
  {
    id: 'demo-student-2-btn',
    demoId: 'usr-student-2',
    role: 'student',
    emoji: '🎓',
    name: 'Student 2: Rahul Sharma (STU1002)',
    desc: 'Full-Stack Web Dev • 8-Day Streak • 156 Solved • 76% Avg'
  },
  {
    id: 'demo-student-3-btn',
    demoId: 'usr-student-3',
    role: 'student',
    emoji: '🎓',
    name: 'Student 3: Priya Reddy (STU1003)',
    desc: 'Data Scientist • 21-Day Streak • 327 Solved • 89% Avg'
  },
  {
    id: 'demo-teacher-btn',
    demoId: 'usr-teacher-1',
    role: 'teacher',
    emoji: '👨‍🏫',
    name: 'Teacher Demo: Prof. K. Ramanujan',
    desc: 'CSE Department • Test Builder • Class Progress Analytics'
  },
  {
    id: 'demo-parent-btn',
    demoId: 'usr-parent-1',
    role: 'parent',
    emoji: '👨‍👧',
    name: 'Parent Demo: Rajesh Sharma',
    desc: 'Verified Parent of Aarav • Attendance & Study Hours Tracker'
  },
  {
    id: 'demo-admin-btn',
    demoId: 'usr-admin-1',
    role: 'admin',
    emoji: '🛡️',
    name: 'Admin Demo: Dr. Arvind Mehta',
    desc: 'Chief Academic Officer • User & Role Management • System Governance'
  },
  {
    id: 'demo-unverified-btn',
    demoId: 'usr-student-unverified',
    role: 'student',
    emoji: '⚠️',
    name: 'Test Unverified Email Flow (Kiran Dev)',
    desc: 'email_verified: false • Redirects to OTP verification page',
    isWarning: true
  }
];

export const DemoPage = () => {
  const navigate = useNavigate();
  const { loginDemo, isAuthenticated, currentUser, isLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated, redirect to correct dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && currentUser) {
      if (currentUser.email_verified === false) {
        navigate(`/verify-email?email=${encodeURIComponent(currentUser.email || '')}`, { replace: true });
      } else if (currentUser.role === 'teacher') {
        navigate('/teacher', { replace: true });
      } else if (currentUser.role === 'parent') {
        navigate('/parent', { replace: true });
      } else if (currentUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (currentUser.role === 'student' && currentUser.profileCompleted === false) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, isLoading, navigate]);

  const handleDemoLogin = async (account) => {
    setErrorMessage('');
    setActiveId(account.id);
    setIsSubmitting(true);

    try {
      const res = await loginDemo(account.demoId, true, account.role);
      setIsSubmitting(false);
      setActiveId(null);

      if (res.unverified) {
        navigate(`/verify-email?email=${encodeURIComponent(res.email)}`);
        return;
      }

      if (res.success) {
        const role = res.user?.role;
        if (role === 'teacher') navigate('/teacher', { replace: true });
        else if (role === 'parent') navigate('/parent', { replace: true });
        else if (role === 'admin') navigate('/admin', { replace: true });
        else if (res.user?.profileCompleted === false) navigate('/onboarding', { replace: true });
        else navigate('/dashboard', { replace: true });
      } else {
        setErrorMessage(res.error || 'Demo login failed. Please try another account.');
      }
    } catch {
      setIsSubmitting(false);
      setActiveId(null);
      setErrorMessage('Failed to connect. Please check your network and try again.');
    }
  };

  if (isLoading) return null;
  if (isAuthenticated && currentUser) return null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '32px 16px'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%'
      }}>
        {/* Header Card */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          {/* Brand banner */}
          <div style={{
            padding: '24px 32px 20px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, var(--bg-surface-subtle) 0%, var(--bg-surface) 100%)',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#1E2022', color: '#FFFFFF', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <LLLogo />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: '1.2', marginBottom: '6px' }}>
              Demo Mode
            </h1>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-primary-light)' }}>
              <Sparkles size={11} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Sample Data Only
              </span>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '380px', margin: '0 auto' }}>
              Select a demo account below to instantly experience each Learning Loops portal. No registration required.
            </p>
          </div>

          {/* Demo accounts */}
          <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {errorMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: '#FEE2E2', color: '#991B1B', fontSize: '0.82rem', marginBottom: '4px' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {DEMO_ACCOUNTS.map((account) => {
              const isActive = activeId === account.id;
              return (
                <button
                  key={account.id}
                  type="button"
                  id={account.id}
                  className="btn-secondary"
                  disabled={isSubmitting}
                  onClick={() => handleDemoLogin(account)}
                  style={{
                    padding: '12px 14px',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    border: account.isWarning
                      ? '1px solid var(--accent-amber)'
                      : '1px solid var(--border-subtle)',
                    background: account.isWarning ? 'var(--accent-amber-light)' : 'var(--bg-surface)',
                    opacity: isSubmitting && !isActive ? 0.65 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.87rem', color: account.isWarning ? '#C2410C' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span>{account.emoji}</span>
                      <span>{account.name}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: account.isWarning ? 'var(--text-muted)' : 'var(--text-secondary)', marginTop: '3px' }}>
                      {account.desc}
                    </div>
                  </div>
                  {isActive
                    ? <Loader2 size={16} color="var(--accent-primary)" style={{ flexShrink: 0, animation: 'spin 0.8s linear infinite' }} />
                    : <ArrowRight size={15} color={account.isWarning ? '#C2410C' : 'var(--accent-primary)'} style={{ flexShrink: 0 }} />
                  }
                </button>
              );
            })}
          </div>
        </div>

        {/* Back link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
          <Link
            to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600', textDecoration: 'none' }}
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'none' }}
          >
            Real Login <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
