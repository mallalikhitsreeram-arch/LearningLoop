import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { sendOTPEmail } from '../../utils/emailService.js';

const RESEND_COOLDOWN_SECONDS = 60;

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerification } = useAuth();

  const email = searchParams.get('email') || 'your account email';

  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');
    setIsSubmitting(true);

    const res = await verifyEmail(email, code);
    setIsSubmitting(false);

    if (res.success) {
      setMessage('Email verified successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        if (res.role === 'teacher') navigate('/teacher', { replace: true });
        else if (res.role === 'parent') navigate('/parent', { replace: true });
        else navigate('/dashboard', { replace: true });
      }, 1000);
    } else {
      setErrorMessage(res.error || 'Invalid verification code.');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage('');
    setMessage('');

    // Backend generates a fresh OTP and returns it
    const res = await resendVerification(email);
    setIsResending(false);

    if (res.success) {
      // Deliver the new OTP via EmailJS
      if (res.otp) {
        const emailResult = await sendOTPEmail(email, res.otp);
        if (emailResult.success) {
          setMessage('A new verification code has been sent to your email. Please check your inbox.');
        } else {
          setMessage('Code regenerated, but email delivery failed. Please try again shortly.');
        }
      } else {
        setMessage(res.message || 'Verification code resent! Check your inbox.');
      }
      // Start cooldown regardless
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setCode('');
    } else {
      setErrorMessage(res.error || 'Failed to resend verification code.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '24px 16px'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        padding: '36px 32px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-primary-light)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Mail size={28} />
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Please verify your email before continuing.
        </h2>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
          We sent a 6-digit verification code to <strong>{email}</strong>. Please check your inbox and enter the code below.
        </p>

        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: '#FEE2E2',
            color: '#991B1B',
            fontSize: '0.82rem',
            margin: '16px 0',
            textAlign: 'left'
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{errorMessage}</span>
          </div>
        )}

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-sage-light)',
            color: 'var(--accent-sage)',
            fontSize: '0.82rem',
            margin: '16px 0',
            textAlign: 'left'
          }}>
            <CheckCircle2 size={16} flexShrink={0} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleVerify} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '6px', textAlign: 'left' }}>
              6-Digit Verification Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter code from your email"
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '1.2rem',
                textAlign: 'center',
                letterSpacing: '0.25em',
                fontWeight: '700'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || code.length !== 6}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
          >
            <span>{isSubmitting ? 'Verifying...' : 'Verify & Continue to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <RefreshCw size={13} className={isResending ? 'spin-animation' : ''} />
            <span>
              {isResending
                ? 'Sending...'
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend verification email'}
            </span>
            {cooldown > 0 && <Clock size={13} />}
          </button>

          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            <ArrowLeft size={14} /> Return to login
          </Link>
        </div>
      </div>
    </div>
  );
};
