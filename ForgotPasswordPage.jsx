import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { sendPasswordResetEmail } from '../../utils/emailService.js';

const RESEND_COOLDOWN_SECONDS = 60;

export const ForgotPasswordPage = () => {
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState(1); // 1: enter email, 2: enter code & new password, 3: success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Resend cooldown for step 2
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendInstructions = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    // Backend generates & stores a real reset OTP, returns it
    const res = await forgotPassword(email);
    setIsSubmitting(false);

    if (res.success) {
      // Deliver the reset code via EmailJS
      if (res.otp) {
        setIsSendingEmail(true);
        const emailResult = await sendPasswordResetEmail(email, res.otp);
        setIsSendingEmail(false);

        if (!emailResult.success) {
          // Still proceed to step 2 — user can request a resend
          setMessage('Reset code generated, but email delivery had an issue. You can try resending below.');
        } else {
          setMessage(`A password reset code has been sent to ${email}. Please check your inbox.`);
        }
      } else {
        setMessage(res.message || 'Reset instructions sent.');
      }

      setStep(2);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } else {
      setErrorMessage(res.error || 'Failed to send reset code.');
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0) return;
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await forgotPassword(email);
    setIsSubmitting(false);

    if (res.success && res.otp) {
      setIsSendingEmail(true);
      await sendPasswordResetEmail(email, res.otp);
      setIsSendingEmail(false);
      setMessage('A new reset code has been sent to your email.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setCode('');
    } else {
      setErrorMessage(res.error || 'Failed to resend reset code.');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    const res = await resetPassword(email, code, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setMessage(res.message);
      setStep(3); // Success
    } else {
      setErrorMessage(res.error || 'Failed to reset password.');
    }
  };

  const loadingLabel = isSendingEmail ? 'Sending email...' : isSubmitting ? 'Sending...' : null;

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
        padding: '36px 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#1E2022',
            color: '#fff',
            marginBottom: '12px'
          }}>
            <KeyRound size={24} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800' }}>
            Reset Password
          </h2>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Recover access to your Learning Loops account.
          </p>
        </div>

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
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{errorMessage}</span>
          </div>
        )}

        {message && step !== 3 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-sage-light)',
            color: 'var(--accent-sage)',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            <CheckCircle2 size={16} flexShrink={0} />
            <span>{message}</span>
          </div>
        )}

        {/* Step 1: Enter email */}
        {step === 1 && (
          <form onSubmit={handleSendInstructions} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Account Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="aarav.sharma@example.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || isSendingEmail}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
            >
              <span>{loadingLabel || 'Send Reset Code'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: Enter code & new password */}
        {step === 2 && (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Reset Code (from your email)
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                autoFocus
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '1rem', textAlign: 'center', letterSpacing: '0.15em', fontWeight: '700' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                New Password (min 6 characters)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || code.length !== 6}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
            >
              <span>{isSubmitting ? 'Updating...' : 'Set New Password'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Resend option for step 2 */}
            <div style={{ textAlign: 'center', paddingTop: '4px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResendCode}
                disabled={cooldown > 0 || isSubmitting || isSendingEmail}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                <RefreshCw size={13} className={isSendingEmail ? 'spin-animation' : ''} />
                <span>
                  {isSendingEmail
                    ? 'Sending...'
                    : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : 'Resend reset code'}
                </span>
                {cooldown > 0 && <Clock size={13} />}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-sage-light)', color: 'var(--accent-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Password Reset Complete!</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '20px' }}>
              Your password has been successfully updated. You can now log in.
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', padding: '10px 24px' }}>
              Proceed to Login
            </Link>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
