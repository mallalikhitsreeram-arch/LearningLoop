import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  Sun, Moon, ArrowRight, WifiOff, Globe, GraduationCap,
  BookOpen, Lightbulb, BarChart2, Menu, X, CheckSquare,
  TrendingUp, RotateCw, Users, ShieldCheck, Settings, Sparkles
} from 'lucide-react';

/* Cyan-blue infinity loop logo matching reference */
const InfinityLogo = ({ size = 26 }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 38 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="infGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#00d2ff" />
        <stop offset="100%" stopColor="#3a82f6" />
      </linearGradient>
    </defs>
    <path
      d="M10.5 4C6.358 4 3 7.358 3 11.5S6.358 19 10.5 19c3.2 0 5.967-2.008 7.05-4.887L19 11.5l1.45-2.613C21.533 6.008 24.3 4 27.5 4 31.642 4 35 7.358 35 11.5S31.642 19 27.5 19c-3.2 0-5.967-2.008-7.05-4.887L19 11.5"
      stroke="url(#infGrad)"
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && currentUser) {
      if (currentUser.email_verified === false) {
        navigate(`/verify-email?email=${encodeURIComponent(currentUser.email || '')}`, { replace: true });
      } else if (currentUser.role === 'teacher') navigate('/teacher', { replace: true });
      else if (currentUser.role === 'parent') navigate('/parent', { replace: true });
      else if (currentUser.role === 'admin') navigate('/admin', { replace: true });
      else if (currentUser.role === 'student' && currentUser.profileCompleted === false) navigate('/onboarding', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, currentUser, isLoading, navigate]);

  const scrollTo = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1628' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', border: '3px solid rgba(56,189,248,0.2)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Loading Learning Loops...</div>
        </div>
      </div>
    );
  }
  if (isAuthenticated && currentUser) return null;

  const isDark = theme === 'dark';

  /* Exact 6 loop steps from reference image */
  const LOOP_STEPS = [
    { label: 'Learn', icon: BookOpen, bg: '#2563eb', border: '#60a5fa' },
    { label: 'Practice', icon: CheckSquare, bg: '#059669', border: '#34d399' },
    { label: 'Track', icon: BarChart2, bg: '#ea580c', border: '#fb923c' },
    { label: 'Improve', icon: TrendingUp, bg: '#0891b2', border: '#22d3ee' },
    { label: 'Achieve', icon: Lightbulb, bg: '#d97706', border: '#fcd34d' },
    { label: 'Repeat', icon: RotateCw, bg: '#e11d48', border: '#fb7185' },
  ];

  /* 4 Bottom features matching reference strip */
  const BOTTOM_FEATURES = [
    {
      icon: Sparkles,
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.1)',
      title: 'AI-Powered Learning',
      desc: 'Personalized study plans & AI tutor'
    },
    {
      icon: WifiOff,
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.1)',
      title: 'Offline & Low Data',
      desc: 'Download content, learn anytime'
    },
    {
      icon: Globe,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
      title: 'Multiple Languages',
      desc: 'Learn in your preferred language'
    },
    {
      icon: GraduationCap,
      color: '#0891b2',
      bg: 'rgba(8, 145, 178, 0.1)',
      title: 'All Education Levels',
      desc: 'From school to college & beyond'
    },
  ];

  const navLinks = [
    { label: 'Home', action: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); } },
    { label: 'Features', action: () => scrollTo(featuresRef) },
    { label: 'Courses', action: () => { navigate('/portal-select'); setMobileMenuOpen(false); } },
    { label: 'About', action: () => scrollTo(aboutRef) },
    { label: 'Contact', action: () => scrollTo(contactRef) },
  ];

  return (
    <div style={{ minHeight: '100vh', fontFamily: '"Outfit", "Inter", -apple-system, sans-serif', overflowX: 'hidden', backgroundColor: isDark ? '#060d1a' : '#ffffff' }}>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(7, 18, 43, 0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', height: '68px',
        display: 'flex', alignItems: 'center', padding: '0 clamp(16px, 4vw, 40px)',
      }}>
        <div style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          {/* Brand with Cyan Infinity Icon */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <InfinityLogo size={32} />
            <span style={{ fontWeight: '800', fontSize: '1.22rem', color: '#ffffff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Learning Loops
            </span>
          </div>

          {/* Center Navigation Links */}
          <div className="ll-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {navLinks.map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '0.94rem', fontWeight: '500', cursor: 'pointer', padding: '6px 0',
                  transition: 'color 0.2s ease', position: 'relative'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              {isDark ? <Sun size={17} color="#fcd34d" /> : <Moon size={17} color="#e0e7ff" />}
            </button>

            {/* Login button - Pill */}
            <button
              id="landing-login-btn"
              onClick={() => navigate('/portal-select')}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.24)',
                borderRadius: '999px',
                padding: '7px 22px',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.24)';
              }}
            >
              Login
            </button>

            {/* Get Started button - Vibrant Blue Pill */}
            <button
              id="landing-get-started-btn"
              onClick={() => navigate('/portal-select')}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                border: 'none',
                borderRadius: '999px',
                padding: '8px 24px',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.45)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 22px rgba(79, 70, 229, 0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(79, 70, 229, 0.45)';
              }}
            >
              Get Started
            </button>

            {/* Mobile menu button */}
            <button
              className="ll-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              style={{
                display: 'none', background: 'none', border: 'none', color: '#fff',
                cursor: 'pointer', padding: '4px'
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: '68px', left: 0, right: 0, zIndex: 99,
          background: 'rgba(7, 18, 43, 0.98)', borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          {navLinks.map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)',
                fontSize: '1rem', fontWeight: '600', padding: '10px 14px', textAlign: 'left',
                cursor: 'pointer', borderRadius: '8px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* HERO SECTION — EXACT VISUAL MATCH TO REFERENCE */}
      <section style={{
        position: 'relative',
        minHeight: '88vh',
        background: 'linear-gradient(135deg, #071538 0%, #0a2158 45%, #0f3480 85%, #0d2864 100%)',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '80px',
        overflow: 'hidden'
      }}>
        
        {/* Soft background ambient glow orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '25%', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0, 210, 255, 0.22) 0%, transparent 68%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{
          maxWidth: '1240px', width: '100%', margin: '0 auto',
          padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px) clamp(90px, 11vw, 130px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 'clamp(24px, 4vw, 48px)', position: 'relative', zIndex: 2
        }}>
          
          {/* HERO LEFT CONTENT */}
          <div style={{ flex: '1 1 520px', maxWidth: '560px' }}>
            
            {/* Title: Learning (white) Loops (cyan) */}
            <h1 style={{
              fontSize: 'clamp(2.6rem, 5.2vw, 4.3rem)',
              fontWeight: '900',
              lineHeight: '1.08',
              letterSpacing: '-0.03em',
              margin: '0 0 12px',
              fontFamily: '"Outfit", sans-serif'
            }}>
              <span style={{ color: '#ffffff' }}>Learning </span>
              <span style={{ color: '#38bdf8' }}>Loops</span>
            </h1>

            {/* Sub-headline: WHERE YOUR EVERY CONTRIBUTION COUNTS */}
            <div style={{
              fontSize: 'clamp(1rem, 2vw, 1.35rem)',
              fontWeight: '800',
              color: '#38bdf8',
              letterSpacing: '0.04em',
              lineHeight: '1.25',
              marginBottom: '22px',
              textTransform: 'uppercase'
            }}>
              WHERE YOUR EVERY CONTRIBUTION COUNTS
            </div>

            {/* Motto Quote */}
            <p style={{
              fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)',
              color: '#cbd5e1',
              lineHeight: '1.65',
              marginBottom: '32px',
              fontStyle: 'normal'
            }}>
              “Education should not stop<br />because the internet does.”
            </p>

            {/* Loop Steps Chain (Learn -> Practice -> Track -> Improve -> Achieve -> Repeat) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '36px'
            }}>
              {LOOP_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <React.Fragment key={step.label}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: step.bg,
                        border: `1.5px solid ${step.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${step.bg}66`,
                        flexShrink: 0
                      }}>
                        <StepIcon size={18} color="#ffffff" strokeWidth={2.4} />
                      </div>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: '600',
                        color: '#f1f5f9',
                        letterSpacing: '0.01em',
                        whiteSpace: 'nowrap'
                      }}>
                        {step.label}
                      </span>
                    </div>

                    {idx < LOOP_STEPS.length - 1 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#38bdf8',
                        padding: '0 2px',
                        marginBottom: '20px',
                        opacity: 0.85
                      }}>
                        <ArrowRight size={13} strokeWidth={2.6} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* CTA Button: Start Your Journey -> */}
            <button
              id="landing-start-journey-btn"
              onClick={() => navigate('/portal-select')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 34px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                color: '#ffffff',
                fontSize: '1.02rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 26px rgba(59, 130, 246, 0.45)',
                transition: 'all 0.22s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 34px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 26px rgba(59, 130, 246, 0.45)';
              }}
            >
              Start Your Journey <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* HERO RIGHT — HIGH DEFINITION 3D STUDENT ILLUSTRATION MATCHING REFERENCE */}
          <div className="ll-hero-right" style={{
            flex: '1 1 480px',
            maxWidth: '540px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* Glowing Backdrop Aura */}
            <div style={{
              position: 'absolute',
              width: '420px',
              height: '420px',
              background: 'radial-gradient(circle, rgba(0, 210, 255, 0.28) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 72%)',
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }} />

            {/* Illustration Frame */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45), 0 0 40px rgba(56, 189, 248, 0.25)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img
                src="/hero-student.jpg"
                alt="Student learning with Learning Loops AI and offline tools"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

        </div>

        {/* BOTTOM CURVED TRANSITION WITH GOLDEN GLOW ON LEFT (Matching Reference Image) */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          lineHeight: 0,
          zIndex: 3,
          pointerEvents: 'none'
        }}>
          <svg
            viewBox="0 0 1440 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: '90px' }}
          >
            {/* Warm Golden Glow Curve on Left (as in reference image) */}
            <path
              d="M0 65 Q 160 50 360 76 Q 500 90 620 90 L 0 90 Z"
              fill="url(#goldCurveGrad)"
            />
            {/* Main Crisp Smooth Wave */}
            <path
              d="M0 78 C 320 62, 540 90, 820 74 C 1100 58, 1300 82, 1440 76 L 1440 90 L 0 90 Z"
              fill={isDark ? '#060d1a' : '#ffffff'}
            />
            <defs>
              <linearGradient id="goldCurveGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#fcd34d" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#fcd34d" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* 4-FEATURE STRIP (WHITE BACKGROUND, CLEAN SQUIRCLE ICONS, EXACT TEXT MATCH) */}
      <section id="features" ref={featuresRef} style={{
        backgroundColor: isDark ? '#060d1a' : '#ffffff',
        padding: 'clamp(28px, 4vw, 44px) clamp(20px, 4vw, 40px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #eef2f6'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px'
        }}>
          {BOTTOM_FEATURES.map(feat => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'transparent';
                }}
              >
                {/* Squircle Icon Container */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: feat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={24} color={feat.color} strokeWidth={2.2} />
                </div>
                {/* Titles */}
                <div>
                  <div style={{
                    fontWeight: '800',
                    fontSize: '0.94rem',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    marginBottom: '3px',
                    letterSpacing: '-0.01em',
                    fontFamily: '"Outfit", sans-serif'
                  }}>
                    {feat.title}
                  </div>
                  <div style={{
                    fontSize: '0.78rem',
                    color: isDark ? '#94a3b8' : '#64748b',
                    lineHeight: '1.45'
                  }}>
                    {feat.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" ref={aboutRef} style={{
        backgroundColor: isDark ? '#0a1628' : '#f8fafc',
        padding: 'clamp(56px, 8vw, 88px) clamp(20px, 4vw, 40px)'
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '999px',
            backgroundColor: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0284c7', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              About Learning Loops
            </span>
          </div>
          <h2 style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 'clamp(1.6rem, 3.8vw, 2.3rem)',
            fontWeight: '800',
            color: isDark ? '#f1f5f9' : '#0f172a',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            lineHeight: '1.25'
          }}>
            Built for every learner,<br />everywhere
          </h2>
          <p style={{ fontSize: '1rem', color: isDark ? '#94a3b8' : '#475569', lineHeight: '1.75', marginBottom: '36px' }}>
            Learning Loops is an AI-powered EdTech platform that adapts to every student's needs. Whether you're in a city or a village with limited internet, our platform ensures education never stops.
          </p>
          <div style={{ display: 'flex', gap: 'clamp(24px, 5vw, 56px)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              ['10,000+', 'Practice Problems'],
              ['50+', 'Courses'],
              ['4', 'User Portals'],
              ['100%', 'Offline Ready']
            ].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)', fontWeight: '900', color: '#0284c7', fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.02em' }}>
                  {val}
                </div>
                <div style={{ fontSize: '0.76rem', color: isDark ? '#64748b' : '#64748b', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTALS SECTION — REPLACED ALL ?? WITH LUCIDE ICONS */}
      <section style={{
        backgroundColor: isDark ? '#060d1a' : '#ffffff',
        padding: 'clamp(56px, 8vw, 88px) clamp(20px, 4vw, 40px)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #eef2f6'
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 'clamp(1.5rem, 3.2vw, 2rem)',
            fontWeight: '800',
            color: isDark ? '#f1f5f9' : '#0f172a',
            letterSpacing: '-0.02em',
            marginBottom: '12px'
          }}>
            One platform, multiple portals
          </h2>
          <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.96rem', lineHeight: '1.6', marginBottom: '40px' }}>
            Every role gets a dedicated, purpose-built experience.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { icon: GraduationCap, color: '#2563eb', bg: 'rgba(37,99,235,0.1)', lbl: 'Student Portal', desc: 'Learn, practice & track your progress' },
              { icon: Users, color: '#059669', bg: 'rgba(5,150,105,0.1)', lbl: 'Teacher Portal', desc: 'Manage classes & build intelligent tests' },
              { icon: ShieldCheck, color: '#d97706', bg: 'rgba(217,119,6,0.1)', lbl: 'Parent Portal', desc: 'Monitor & support your child' },
              { icon: Settings, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', lbl: 'Admin Portal', desc: 'Govern users & system settings' },
            ].map(portal => {
              const PortalIcon = portal.icon;
              return (
                <div
                  key={portal.lbl}
                  onClick={() => navigate('/portal-select')}
                  style={{
                    padding: '28px 20px',
                    borderRadius: '18px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = portal.color;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 28px ${portal.color}22`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: portal.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <PortalIcon size={28} color={portal.color} strokeWidth={2.2} />
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: '8px', fontFamily: '"Outfit", sans-serif' }}>
                    {portal.lbl}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.5' }}>
                    {portal.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section id="contact" ref={contactRef} style={{
        background: 'linear-gradient(135deg, #071538 0%, #0a2158 50%, #0d2864 100%)',
        padding: 'clamp(56px, 8vw, 88px) clamp(20px, 4vw, 40px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-80px', width: '360px', height: '360px', background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '18px',
            backgroundColor: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)',
            marginBottom: '24px'
          }}>
            <InfinityLogo size={34} />
          </div>
          <h2 style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 'clamp(1.6rem, 4.2vw, 2.3rem)',
            fontWeight: '900',
            color: '#ffffff',
            marginBottom: '14px',
            letterSpacing: '-0.02em'
          }}>
            Ready to start learning?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '36px', lineHeight: '1.7' }}>
            Join learners building their future with Learning Loops — where every contribution counts.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/portal-select')}
              style={{
                padding: '14px 34px', borderRadius: '999px', border: 'none',
                background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                color: '#fff', fontSize: '0.98rem', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 6px 20px rgba(79,70,229,0.4)', transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(79,70,229,0.55)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)';
              }}
            >
              Get Started <ArrowRight size={17} />
            </button>
            <button
              onClick={() => navigate('/demo')}
              style={{
                padding: '14px 28px', borderRadius: '999px',
                border: '1.5px solid rgba(255,255,255,0.25)',
                background: 'transparent', color: '#ffffff',
                fontSize: '0.98rem', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#ffffff';
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Try Demo Mode
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: isDark ? '#050a14' : '#f8fafc',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
        padding: '22px clamp(20px, 4vw, 40px)'
      }}>
        <div style={{
          maxWidth: '1240px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '14px'
        }}>
          <div style={{ color: isDark ? '#64748b' : '#64748b', fontSize: '0.82rem', fontWeight: '500' }}>
            © 2026 Learning Loops — Where Your Every Contribution Counts
          </div>
          <div style={{ display: 'flex', gap: '22px' }}>
            {[
              ['Sign In', '/portal-select'],
              ['Register', '/register'],
              ['Demo', '/demo']
            ].map(([lbl, path]) => (
              <button
                key={lbl}
                onClick={() => navigate(path)}
                style={{
                  background: 'none', border: 'none',
                  color: isDark ? '#94a3b8' : '#475569',
                  fontSize: '0.82rem', cursor: 'pointer',
                  fontWeight: '500', transition: 'color 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#0284c7'}
                onMouseLeave={e => e.currentTarget.style.color = isDark ? '#94a3b8' : '#475569'}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* Responsive CSS styles for mobile navigation and layout */}
      <style>{`
        @media (max-width: 900px) {
          .ll-nav-links {
            display: none !important;
          }
          .ll-mobile-menu-btn {
            display: flex !important;
          }
          .ll-hero-right {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
};

export default LandingPage;
