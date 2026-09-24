/**
 * AdminLoginPage — Learning Loops Administrator Access
 *
 * VISUAL DESIGN: Identical to existing Learning Loops login page (white card,
 *                same CSS vars, same LL branding).
 *
 * SECURITY:
 *  - selectedRole is hardcoded to 'admin' — it is never exposed in the UI
 *    and cannot be changed from the frontend.
 *  - After successful authentication the server-returned role is checked.
 *  - If user.role !== 'admin' → show "not authorized" error + redirect.
 *  - All /admin/* routes are additionally protected by ProtectedRoute
 *    allowedRoles={['admin']} (server-side session + RBAC).
 *
 * This page is NOT linked from Landing, Portal Selection, or Login.
 * Admins access it directly via:  /admin-login
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock,
  ShieldCheck, AlertCircle, Loader2, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

// ─── LL Logo SVG ─────────────────────────────────────────────────────────────
const LLLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5H4" />
    <path d="M4 14l-3-3 3-3" />
    <path d="M17 12a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5h8" />
    <path d="M20 10l3 3-3 3" />
  </svg>
);

export const AdminLoginPage = () => {
  const navigate  = useNavigate();
  const { currentUser, isAuthenticated, isLoading, login } = useAuth();

  // Credentials state
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(true);

  // UI state
  const [errorMessage,  setErrorMessage]  = useState('');
  const [accessDenied,  setAccessDenied]  = useState(false); // non-admin tried to log in
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  // If the current session is already an admin, go straight to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin', { replace: true });
      }
      // Other roles: do NOT redirect — let them see the page or log in as admin.
      // (They'll just see an error if they try.)
    }
  }, [isAuthenticated, currentUser, isLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setAccessDenied(false);

    const trimmedEmail = email.trim();
    const emailRegex   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login({
        email:      trimmedEmail,
        password,
        rememberMe,
        role:       'admin'  // ← hardcoded; not user-changeable
      });

      setIsSubmitting(false);

      if (res.unverified) {
        // Admin email not verified — edge case
        navigate(`/verify-email?email=${encodeURIComponent(res.email || trimmedEmail)}`);
        return;
      }

      if (res.success) {
        // Double-check role from server response before navigating
        if (res.user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          // Authenticated but not admin — deny entry
          setAccessDenied(true);
          setErrorMessage('Access denied. This portal is restricted to authorized administrators only.');
        }
        return;
      }

      // Role mismatch returned by backend — user exists but is not admin
      if (res.roleMismatch) {
        setAccessDenied(true);
        setErrorMessage('Access denied. This account does not have administrator privileges.');
        return;
      }

      setErrorMessage(res.error || 'Invalid credentials. Please try again.');
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Unable to connect to the authentication service. Please check your network.');
    }
  };

  if (isLoading) return null;

  return (
    <div style={{
      minHeight:       '100vh',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      backgroundColor: 'var(--bg-app)',
      padding:         '32px 16px'
    }}>
      <div style={{
        maxWidth:        '440px',
        width:           '100%',
        backgroundColor: 'var(--bg-surface)',
        color:           'var(--text-primary)',
        borderRadius:    'var(--radius-lg)',
        border:          '1px solid var(--border-subtle)',
        boxShadow:       'var(--shadow-lg)',
        overflow:        'hidden'
      }}>

        {/* ── Brand header — same style as LoginPage ───────────────────────── */}
        <div style={{
          padding:      '28px 32px 22px',
          textAlign:    'center',
          background:   'linear-gradient(180deg, #FAF8F5 0%, #FFFFFF 100%)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* LL Logo */}
          <div style={{
            display:         'inline-flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           '54px',
            height:          '54px',
            borderRadius:    'var(--radius-md)',
            backgroundColor: '#1A2332',
            color:           '#FFFFFF',
            marginBottom:    '14px',
            boxShadow:       'var(--shadow-sm)'
          }}>
            <LLLogo />
          </div>

          <h1 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '1.6rem',
            fontWeight:    '800',
            letterSpacing: '-0.02em',
            color:         'var(--text-primary)',
            lineHeight:    '1.2'
          }}>
            LEARNING LOOPS
          </h1>

          <div style={{
            display:         'inline-block',
            marginTop:       '8px',
            fontSize:        '0.72rem',
            fontWeight:      '700',
            letterSpacing:   '0.06em',
            color:           'var(--accent-primary)',
            textTransform:   'uppercase',
            backgroundColor: 'var(--accent-primary-light)',
            padding:         '3px 12px',
            borderRadius:    'var(--radius-full)'
          }}>
            WHERE YOUR EVERY CONTRIBUTION COUNTS
          </div>

          {/* Admin indicator badge */}
          <div style={{
            display:         'inline-flex',
            alignItems:      'center',
            gap:             '6px',
            marginTop:       '16px',
            padding:         '6px 16px',
            borderRadius:    'var(--radius-full)',
            backgroundColor: '#FEF9ED',
            border:          '1px solid #FAD7A0'
          }}>
            <ShieldCheck size={14} color="#F39C12" />
            <span style={{
              fontSize:      '0.72rem',
              fontWeight:    '700',
              color:         '#E67E22',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Administrator Access
            </span>
          </div>

          <p style={{
            fontSize:   '0.8rem',
            color:      'var(--text-muted)',
            marginTop:  '10px',
            fontStyle:  'italic'
          }}>
            This portal is for authorized Learning Loops administrators only.
          </p>
        </div>

        {/* ── Form body ────────────────────────────────────────────────────── */}
        <div style={{ padding: '24px 32px 32px' }}>

          {/* Access denied banner */}
          {accessDenied && (
            <div style={{
              display:         'flex',
              alignItems:      'flex-start',
              gap:             '10px',
              padding:         '12px 14px',
              borderRadius:    'var(--radius-md)',
              backgroundColor: '#FEF0E7',
              border:          '1px solid #FAD7A0',
              marginBottom:    '18px'
            }}>
              <ShieldCheck size={16} color="#E67E22" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#D35400', marginBottom: '3px' }}>
                  Administrator access required
                </div>
                <div style={{ fontSize: '0.78rem', color: '#E67E22', lineHeight: '1.5' }}>
                  {errorMessage}
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/portal-select')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', padding: '4px 0 0', textDecoration: 'underline' }}
                >
                  Return to portal selection →
                </button>
              </div>
            </div>
          )}

          {/* General error banner */}
          {errorMessage && !accessDenied && (
            <div style={{
              display:         'flex',
              alignItems:      'center',
              gap:             '8px',
              padding:         '10px 14px',
              borderRadius:    'var(--radius-md)',
              backgroundColor: 'var(--accent-red-light)',
              border:          '1px solid #F5C6C2',
              marginBottom:    '16px'
            }}>
              <AlertCircle size={15} color="var(--accent-red)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--accent-red)', fontWeight: '600' }}>
                {errorMessage}
              </span>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Email */}
            <div>
              <label htmlFor="admin-email-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                Administrator Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  id="admin-email-input"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrorMessage(''); setAccessDenied(false); }}
                  placeholder="admin@institution.edu"
                  style={{
                    width:        '100%',
                    padding:      '10px 14px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border:       '1px solid var(--border-subtle)',
                    fontSize:     '0.88rem',
                    outline:      'none',
                    color:        'var(--text-primary)',
                    transition:   'border-color var(--transition-fast)',
                    boxSizing:    'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="admin-password-input" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: '600', textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrorMessage(''); setAccessDenied(false); }}
                  placeholder="Enter your password"
                  style={{
                    width:        '100%',
                    padding:      '10px 40px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border:       '1px solid var(--border-subtle)',
                    fontSize:     '0.88rem',
                    outline:      'none',
                    color:        'var(--text-primary)',
                    transition:   'border-color var(--transition-fast)',
                    boxSizing:    'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="admin-remember-me"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Keep me signed in
              </span>
            </label>

            {/* Submit */}
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              style={{
                width:           '100%',
                padding:         '12px 16px',
                borderRadius:    'var(--radius-md)',
                border:          'none',
                backgroundColor: isSubmitting ? 'var(--text-muted)' : '#F39C12',
                color:           '#FFFFFF',
                fontSize:        '0.92rem',
                fontWeight:      '700',
                cursor:          isSubmitting ? 'not-allowed' : 'pointer',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                gap:             '8px',
                transition:      'background var(--transition-fast)',
                letterSpacing:   '-0.01em',
                boxShadow:       '0 2px 10px rgba(243,156,18,0.3)'
              }}
              onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#D68910'; }}
              onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#F39C12'; }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                  <span>Verifying administrator credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Sign in to Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Security notice */}
          <div style={{
            marginTop:       '20px',
            padding:         '12px 14px',
            borderRadius:    'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border:          '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
              🔒 <strong style={{ color: 'var(--text-secondary)' }}>Secure access.</strong>{' '}
              All login attempts are logged. This page is for authorized administrators only.
              Unauthorized access is prohibited.
            </div>
          </div>

          {/* Back to public portal */}
          <div style={{ textAlign: 'center', marginTop: '18px' }}>
            <Link
              to="/portal-select"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textDecoration: 'none' }}
            >
              <ArrowLeft size={13} />
              Back to portal selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
