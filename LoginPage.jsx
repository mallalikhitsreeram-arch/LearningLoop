import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LogIn,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle2,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated, login, loginWithOtp } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Pre-select role from URL query param (?role=student|teacher|parent|admin)
  const searchParams = new URLSearchParams(location.search);
  const urlRole = searchParams.get('role');
  const VALID_ROLES = ['student', 'teacher', 'parent', 'admin'];
  const initialRole = VALID_ROLES.includes(urlRole) ? urlRole : 'student';

  const [selectedRole, setSelectedRole] = useState(initialRole);
  // Whether role was pre-set from portal selection (hides role selector for admin)
  const roleFromPortal = VALID_ROLES.includes(urlRole);
  const isAdminPreselected = urlRole === 'admin';

  // Method switch: 'credentials', 'phone', 'demo'
  const [authMethod, setAuthMethod] = useState('credentials');

  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone OTP
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // State feedback & loading
  const [errorMessage, setErrorMessage] = useState('');
  const [roleMismatch, setRoleMismatch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated and valid session exists, route to authorized dashboard or onboarding
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'teacher') {
        navigate('/teacher', { replace: true });
      } else if (currentUser.role === 'parent') {
        navigate('/parent', { replace: true });
      } else if (currentUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (currentUser.role === 'student') {
        if (currentUser.profileCompleted === false) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  const redirectAfterLogin = (user) => {
    const role = user?.role || selectedRole;
    const isProfileDone = user?.profileCompleted !== false;

    if (role === 'student') {
      if (!isProfileDone) {
        navigate('/onboarding', { replace: true });
        return;
      }
      navigate('/dashboard', { replace: true });
      return;
    }

    if (role === 'teacher') {
      navigate('/teacher', { replace: true });
      return;
    }

    if (role === 'parent') {
      navigate('/parent', { replace: true });
      return;
    }

    if (role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    setErrorMessage('');
    setRoleMismatch(false);
  };

  const handleMethodChange = (method) => {
    setAuthMethod(method);
    setErrorMessage('');
    setRoleMismatch(false);
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setRoleMismatch(false);

    // Validation
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Email or password is incorrect.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login({
        email: trimmedEmail,
        password,
        rememberMe,
        role: selectedRole
      });

      setIsSubmitting(false);

      if (res.unverified) {
        navigate(`/verify-email?email=${encodeURIComponent(res.email || trimmedEmail)}`);
        return;
      }

      if (res.success) {
        redirectAfterLogin(res.user);
      } else {
        setRoleMismatch(Boolean(res.roleMismatch));
        setErrorMessage(res.error || 'Email or password is incorrect.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Unable to connect to authentication service. Please check your network.');
    }
  };

  const handleSendOtp = async () => {
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        // Note: Mobile OTP requires a real SMS provider configured on the backend.
        // The OTP will be delivered via SMS when an SMS provider is integrated.
      } else {
        setErrorMessage(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setErrorMessage('Failed to send OTP. Please try again.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setRoleMismatch(false);

    if (!otp || otp.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginWithOtp({
        phone: phone.trim(),
        otp: otp.trim(),
        rememberMe,
        role: selectedRole
      });

      setIsSubmitting(false);

      if (res.unverified) {
        navigate(`/verify-email?email=${encodeURIComponent(res.email)}`);
        return;
      }

      if (res.success) {
        redirectAfterLogin(res.user);
      } else {
        setRoleMismatch(Boolean(res.roleMismatch));
        setErrorMessage(res.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Failed to verify OTP. Please try again.');
    }
  };



  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '32px 16px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out'
      }}>
        {/* Brand Banner Header */}
        <div style={{
          padding: '28px 32px 20px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, var(--bg-surface-subtle) 0%, var(--bg-surface) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'relative',
        }}>
          {/* Top row: Back btn + Theme toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            {roleFromPortal ? (
              <button
                type="button"
                onClick={() => navigate('/portal-select')}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.76rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '0' }}
              >
                ← Back to portal selection
              </button>
            ) : <div />}
            <button
              id="login-theme-toggle-btn"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{ width: '32px', height: '32px' }}
            >
              {theme === 'dark'
                ? <Sun size={15} style={{ color: '#FAAD30' }} />
                : <Moon size={15} />
              }
            </button>
          </div>

          {/* Logo / Brand Icon */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#1E2022',
            color: '#FFFFFF',
            marginBottom: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5H4" />
              <path d="M4 14l-3-3 3-3" />
              <path d="M17 12a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5h8" />
              <path d="M20 10l3 3-3 3" />
            </svg>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: '1.2'
          }}>
            LEARNING LOOPS
          </h1>

          <div style={{
            display: 'inline-block',
            marginTop: '8px',
            fontSize: '0.74rem',
            fontWeight: '700',
            letterSpacing: '0.06em',
            color: 'var(--accent-primary)',
            textTransform: 'uppercase',
            backgroundColor: 'var(--accent-primary-light)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)'
          }}>
            WHERE YOUR EVERY CONTRIBUTION COUNTS
          </div>

          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginTop: '8px',
            fontStyle: 'italic'
          }}>
            Learn. Practice. Track. Improve. Achieve.
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px 32px 32px' }}>
          {/* Section 1 & 2: Role indicator OR role selector
              - roleFromPortal=true  → user already chose their portal → show badge only
              - roleFromPortal=false → direct /login URL → show "Who are you?" selector  */}
          {isAdminPreselected ? (
            /* Admin — redirected here from /admin-login but shown just in case */
            <div style={{ marginBottom: '22px' }}>
              <div style={{ textAlign: 'center', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#D97706', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '3px' }}>🛡️ Administrator Portal</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Sign in with your administrator credentials below.</div>
              </div>
            </div>
          ) : roleFromPortal ? (
            /* Role already selected on Portal Selection page — do NOT ask again */
            <div style={{ marginBottom: '22px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary-light)',
                border: '1px solid #B8D8F8'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>
                    {selectedRole === 'student' ? '🎓' : selectedRole === 'teacher' ? '👨‍🏫' : '👨‍👧'}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {selectedRole === 'student' ? 'Student Portal' : selectedRole === 'teacher' ? 'Teacher Portal' : 'Parent Portal'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {selectedRole === 'student'
                        ? 'Sign in to your student account'
                        : selectedRole === 'teacher'
                        ? 'Sign in to your teacher account'
                        : 'Sign in to your parent account'}
                    </div>
                  </div>
                </div>
                {/* Allow switching portal if needed */}
                <button
                  type="button"
                  onClick={() => navigate('/portal-select')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.72rem', fontWeight: '600', cursor: 'pointer', padding: '0', whiteSpace: 'nowrap' }}
                >
                  Change →
                </button>
              </div>
            </div>
          ) : (
            /* Direct /login visit — show the role selector */
            <div style={{ marginBottom: '22px' }}>
              <div style={{
                textAlign: 'center', fontSize: '0.84rem', fontWeight: '700',
                color: 'var(--text-primary)', marginBottom: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                <span>Who are you?</span>
              </div>

              {/* Portal selector: Student | Teacher | Parent */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {/* Student */}
                <button type="button" id="portal-student-btn" onClick={() => handleRoleChange('student')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '10px 4px', borderRadius: 'var(--radius-md)', border: selectedRole === 'student' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)', background: selectedRole === 'student' ? 'var(--accent-primary-light)' : 'var(--bg-surface)', color: selectedRole === 'student' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: selectedRole === 'student' ? '700' : '600', fontSize: '0.8rem', boxShadow: selectedRole === 'student' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s ease' }}>
                  <span>🎓</span><span>Student</span>
                </button>
                {/* Teacher */}
                <button type="button" id="portal-teacher-btn" onClick={() => handleRoleChange('teacher')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '10px 4px', borderRadius: 'var(--radius-md)', border: selectedRole === 'teacher' ? '2px solid var(--accent-green)' : '1px solid var(--border-subtle)', background: selectedRole === 'teacher' ? 'var(--accent-green-light)' : 'var(--bg-surface)', color: selectedRole === 'teacher' ? 'var(--accent-green)' : 'var(--text-secondary)', fontWeight: selectedRole === 'teacher' ? '700' : '600', fontSize: '0.8rem', boxShadow: selectedRole === 'teacher' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s ease' }}>
                  <span>👨‍🏫</span><span>Teacher</span>
                </button>
                {/* Parent */}
                <button type="button" id="portal-parent-btn" onClick={() => handleRoleChange('parent')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '10px 4px', borderRadius: 'var(--radius-md)', border: selectedRole === 'parent' ? '2px solid var(--accent-amber)' : '1px solid var(--border-subtle)', background: selectedRole === 'parent' ? 'var(--accent-amber-light)' : 'var(--bg-surface)', color: selectedRole === 'parent' ? 'var(--accent-amber)' : 'var(--text-secondary)', fontWeight: selectedRole === 'parent' ? '700' : '600', fontSize: '0.8rem', boxShadow: selectedRole === 'parent' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s ease' }}>
                  <span>👨‍👧</span><span>Parent</span>
                </button>
              </div>
            </div>
          )}

          <div style={{
            height: '1px',
            backgroundColor: 'var(--border-subtle)',
            margin: '0 0 20px'
          }} />

          {/* Section 3: Login Method Tabs — Email+Password | Phone+OTP */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '4px',
            background: 'var(--bg-surface-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              id="tab-credentials-btn"
              style={{
                padding: '8px 0',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: authMethod === 'credentials' ? '700' : '500',
                background: authMethod === 'credentials' ? 'var(--bg-surface)' : 'transparent',
                color: authMethod === 'credentials' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: authMethod === 'credentials' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
              onClick={() => handleMethodChange('credentials')}
            >
              Email &amp; Password
            </button>

            <button
              type="button"
              id="tab-phone-btn"
              style={{
                padding: '8px 0',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: authMethod === 'phone' ? '700' : '500',
                background: authMethod === 'phone' ? 'var(--bg-surface)' : 'transparent',
                color: authMethod === 'phone' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: authMethod === 'phone' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
              onClick={() => handleMethodChange('phone')}
            >
              Phone + OTP
            </button>
          </div>

          {/* Validation & Error Message Alert Banner */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: roleMismatch ? '#FFF7ED' : '#FEE2E2',
              color: roleMismatch ? '#C2410C' : '#991B1B',
              border: `1px solid ${roleMismatch ? '#FED7AA' : '#FECACA'}`,
              fontSize: '0.82rem',
              lineHeight: '1.4',
              marginBottom: '18px'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '700', marginBottom: '2px' }}>
                  {roleMismatch ? 'Portal Role Mismatch' : 'Authentication Notice'}
                </div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* 1. EMAIL & PASSWORD LOGIN FORM */}
          {authMethod === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    required
                    id="login-email-input"
                    placeholder={
                      selectedRole === 'student'
                        ? 'STU1001 or likhit.malla@example.edu'
                        : selectedRole === 'teacher'
                        ? 'ramanujan@loops-college.edu'
                        : 'rajesh.sharma@example.com'
                    }
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Password
                  </label>
                  <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    id="login-password-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMessage(''); }}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 38px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      color: 'var(--text-muted)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    id="login-remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              {/* Sign in Button: "Sign in to Learning Loops →" */}
              <button
                type="submit"
                id="sign-in-btn"
                className="btn-primary"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px 16px',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  marginTop: '4px',
                  opacity: isSubmitting ? 0.75 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Learning Loops →</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>
                  Create Account / Register
                </Link>
              </div>
            </form>
          )}

          {/* 2. PHONE + OTP AUTH */}
          {authMethod === 'phone' && (
            <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Mobile Phone Number
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      id="login-phone-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    id="send-otp-btn"
                    className="btn-secondary"
                    onClick={handleSendOtp}
                    style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', padding: '0 14px' }}
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-sage)', fontWeight: '600', marginBottom: '6px' }}>
                    OTP request sent. Enter the code received on your mobile.
                  </div>
                  <input
                    type="text"
                    required
                    id="login-otp-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '1rem',
                      letterSpacing: '0.2em',
                      textAlign: 'center',
                      fontWeight: '700'
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    ℹ️ SMS delivery requires a real SMS provider configured on the backend.
                  </div>
                </div>
              )}

              <button
                type="submit"
                id="sign-in-otp-btn"
                className="btn-primary"
                disabled={!otpSent || isSubmitting}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px 16px',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  opacity: (!otpSent || isSubmitting) ? 0.75 : 1
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Learning Loops &rarr;</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>
                  Create Account / Register
                </Link>
              </div>
            </form>
          )}

          {/* Google Sign-In — requires Google OAuth / Firebase setup */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>
            <button
              type="button"
              id="google-signin-btn"
              disabled
              title="Google sign-in requires Google OAuth / Firebase Authentication setup"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-subtle)',
                color: 'var(--text-muted)',
                fontSize: '0.86rem',
                fontWeight: '600',
                cursor: 'not-allowed',
                opacity: 0.65
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>(setup required)</span>
            </button>
          </div>

          {/* Demo Mode link */}
          <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Just exploring? </span>
            <Link to="/demo" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
              Try Demo Mode →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
