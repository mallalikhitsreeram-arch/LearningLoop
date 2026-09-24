import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, GraduationCap, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { sendOTPEmail } from '../../utils/emailService.js';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    college: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await register(formData);
    setIsSubmitting(false);

    if (res.success && res.unverified) {
      // Deliver OTP via EmailJS — backend already generated and stored it
      if (res.otp) {
        await sendOTPEmail(res.email, res.otp);
        // Note: we navigate regardless of EmailJS result so the user can request a resend on the next page
      }
      navigate(`/verify-email?email=${encodeURIComponent(res.email)}`);
    } else {
      setErrorMessage(res.error || 'Registration failed.');
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
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        padding: '32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
            <UserPlus size={24} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '800' }}>
            Create Your Account
          </h2>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Join LEARNING LOOPS — Where Your Every Contribution Counts.
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Reddy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="ramesh.reddy@example.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Password (min 6 characters)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Account Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher / Faculty</option>
                <option value="parent">Parent / Guardian</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                College / Institution
              </label>
              <input
                type="text"
                placeholder="Polytechnic / University"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.92rem', marginTop: '6px' }}
          >
            <span>{isSubmitting ? 'Creating account...' : 'Create Account & Verify'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
