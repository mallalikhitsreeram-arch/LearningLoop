/**
 * PortalSelectionPage — Learning Loops Master Portal & Feature Hub
 *
 * Provides a unified launchpad linking ALL Learning Loops portals:
 *   1. Student Portal
 *   2. Teacher Portal
 *   3. Parent Portal
 *   4. Administrator Portal
 *
 * Features:
 *   - 1-Click Instant Demo Launch for all 4 roles (no credentials required)
 *   - Standard Sign In & Registration routes
 *   - Direct Quick-Jump Feature Hub to every core section (Courses, Interview Lab, Practice, Downloads, etc.)
 *   - 100% theme-aware (Light & Dark mode compatible)
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Users, ShieldCheck,
  CheckCircle2, ArrowRight, ArrowLeft, ChevronRight, Play,
  Sun, Moon, Sparkles, Video, Brain, DownloadCloud,
  Layers, ExternalLink, Activity, BookMarked, UserCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// ─── Portal definitions ───────────────────────────────────────────────────────
const ALL_PORTALS = [
  {
    role:         'student',
    icon:         GraduationCap,
    badge:        'Student Portal',
    title:        'Student Portal',
    description:  'Personalized courses, AI doubt solving, adaptive practice tests, and gamified progress tracking.',
    accent:       'var(--accent-primary)',
    accentLight:  'var(--accent-primary-light)',
    accentHover:  'var(--accent-primary-hover)',
    accentBorder: 'var(--accent-primary)',
    enterLabel:   'Enter Student Portal',
    demoId:       'usr-student-1',
    showRegister: true,
    capabilities: [
      'Personalized AI study assistant',
      'Step-by-step interactive lessons',
      'Adaptive tests with instant scoring',
      'Gamified XP, streaks & badges',
      'Subject progress & analytics'
    ]
  },
  {
    role:         'teacher',
    icon:         BookOpen,
    badge:        'Teacher Portal',
    title:        'Teacher Portal',
    description:  'AI lesson planning, question generation, class diagnostics, and student management.',
    accent:       'var(--accent-green)',
    accentLight:  'var(--accent-green-light)',
    accentHover:  'var(--accent-green)',
    accentBorder: 'var(--accent-green)',
    enterLabel:   'Enter Teacher Portal',
    demoId:       'usr-teacher-1',
    showRegister: true,
    capabilities: [
      'AI-assisted lesson planning',
      'Question & quiz builder',
      'Classroom performance analysis',
      'Curriculum resource sharing',
      'Student progress monitoring'
    ]
  },
  {
    role:         'parent',
    icon:         Users,
    badge:        'Parent Portal',
    title:        'Parent Portal',
    description:  'Real-time visibility into student academic progress, attendance and learning activity.',
    accent:       'var(--accent-amber)',
    accentLight:  'var(--accent-amber-light)',
    accentHover:  'var(--accent-amber)',
    accentBorder: 'var(--accent-amber)',
    enterLabel:   'Enter Parent Portal',
    demoId:       'usr-parent-1',
    showRegister: true,
    capabilities: [
      'Student progress overview',
      'Subject-level performance metrics',
      'Study time & attendance visibility',
      'Homework & assessment alerts',
      'Teacher communication logs'
    ]
  },
  {
    role:         'admin',
    icon:         ShieldCheck,
    badge:        'Admin Portal',
    title:        'Administrator Portal',
    description:  'System governance, multi-role user management, platform permissions, and institution analytics.',
    accent:       'var(--accent-purple)',
    accentLight:  'var(--accent-purple-light)',
    accentHover:  'var(--accent-purple)',
    accentBorder: 'var(--accent-purple)',
    enterLabel:   'Enter Admin Portal',
    demoId:       'usr-admin-1',
    showRegister: false,
    capabilities: [
      'Role & access control governance',
      'Institutional health & audit logs',
      'Multi-portal user management',
      'Platform policy & feature settings',
      'System-wide analytics overview'
    ]
  }
];

// ─── Quick Feature Links ───────────────────────────────────────────────────────
const QUICK_FEATURE_LINKS = [
  {
    title: 'Student Dashboard',
    desc: 'XP, Daily Quests & Recommendations',
    path: '/dashboard',
    role: 'student',
    icon: Activity,
    color: 'var(--accent-primary)',
    bg: 'var(--accent-primary-light)'
  },
  {
    title: 'Courses & Syllabus',
    desc: 'Structured video & text modules',
    path: '/courses',
    role: 'student',
    icon: BookMarked,
    color: 'var(--accent-primary)',
    bg: 'var(--accent-primary-light)'
  },
  {
    title: 'AI Interview Lab',
    desc: 'Voice & camera simulation',
    path: '/interview',
    role: 'student',
    icon: Video,
    color: 'var(--accent-cyan)',
    bg: 'var(--accent-cyan-light)'
  },
  {
    title: 'Adaptive Practice & Tests',
    desc: 'Topic-wise tests & diagnostic exams',
    path: '/practice',
    role: 'student',
    icon: Brain,
    color: 'var(--accent-purple)',
    bg: 'var(--accent-purple-light)'
  },
  {
    title: 'Offline Downloads',
    desc: 'Low-bandwidth cached lessons',
    path: '/downloads',
    role: 'student',
    icon: DownloadCloud,
    color: 'var(--accent-cyan)',
    bg: 'var(--accent-cyan-light)'
  },
  {
    title: 'Teacher Test Builder',
    desc: 'Class diagnostics & question banks',
    path: '/teacher',
    role: 'teacher',
    icon: BookOpen,
    color: 'var(--accent-green)',
    bg: 'var(--accent-green-light)'
  },
  {
    title: 'Parent Academic Monitor',
    desc: 'Study hours & grade reports',
    path: '/parent',
    role: 'parent',
    icon: UserCheck,
    color: 'var(--accent-amber)',
    bg: 'var(--accent-amber-light)'
  },
  {
    title: 'Admin Governance',
    desc: 'Users, roles & system health',
    path: '/admin',
    role: 'admin',
    icon: ShieldCheck,
    color: 'var(--accent-purple)',
    bg: 'var(--accent-purple-light)'
  }
];

// ─── SVG Logo ─────────────────────────────────────────────────────────────────
const LLLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5H4" />
    <path d="M4 14l-3-3 3-3" />
    <path d="M17 12a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5h8" />
    <path d="M20 10l3 3-3 3" />
  </svg>
);

// ─── Individual portal card ───────────────────────────────────────────────────
const PortalCard = ({ portal, onQuickLaunch, onSignIn, onRegister, isLaunching }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = portal.icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="portal-card-wrapper"
      style={{
        backgroundColor:  'var(--bg-card)',
        borderRadius:     'var(--radius-lg)',
        border:           hovered
          ? `1px solid ${portal.accentBorder}`
          : '1px solid var(--border-subtle)',
        borderTop:        `4px solid ${portal.accent}`,
        boxShadow:        hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform:        hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition:       'all var(--transition-normal)',
        display:          'flex',
        flexDirection:    'column',
        overflow:         'hidden'
      }}
    >
      {/* Card top section */}
      <div style={{ padding: '22px 20px 0' }}>
        {/* Icon & Badge Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{
            width:           '44px',
            height:          '44px',
            borderRadius:    'var(--radius-md)',
            backgroundColor: portal.accentLight,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            border:          `1px solid ${portal.accentBorder}`
          }}>
            <Icon size={22} color={portal.accent} />
          </div>

          <div style={{
            display:         'inline-flex',
            alignItems:      'center',
            gap:             '5px',
            padding:         '3px 10px',
            borderRadius:    'var(--radius-full)',
            backgroundColor: portal.accentLight,
            border:          `1px solid ${portal.accentBorder}`
          }}>
            <span style={{
              fontSize:      '0.64rem',
              fontWeight:    '700',
              color:         portal.accent,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              {portal.badge}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily:    'var(--font-display)',
          fontSize:      '1.1rem',
          fontWeight:    '800',
          color:         'var(--text-primary)',
          marginBottom:  '8px',
          letterSpacing: '-0.01em'
        }}>
          {portal.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize:     '0.82rem',
          color:        'var(--text-secondary)',
          lineHeight:   '1.55',
          marginBottom: '16px',
          minHeight:    '52px'
        }}>
          {portal.description}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0 20px' }} />

      {/* Capabilities */}
      <div style={{ padding: '14px 20px', flex: 1 }}>
        <div style={{
          fontSize:      '0.64rem',
          fontWeight:    '700',
          color:         'var(--text-muted)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          marginBottom:  '8px'
        }}>
          Key Capabilities
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {portal.capabilities.map((cap, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2
                size={13}
                color={portal.accent}
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <span style={{
                fontSize:  '0.78rem',
                color:     'var(--text-secondary)',
                lineHeight:'1.4'
              }}>
                {cap}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0 20px' }} />

      {/* Actions */}
      <div style={{ padding: '16px 20px 20px' }}>
        {/* 1-Click Launch Button */}
        <button
          type="button"
          id={`launch-${portal.role}-btn`}
          onClick={onQuickLaunch}
          disabled={isLaunching}
          style={{
            width:           '100%',
            padding:         '10px 14px',
            borderRadius:    'var(--radius-md)',
            border:          'none',
            backgroundColor: portal.accent,
            color:           '#FFFFFF',
            fontSize:        '0.85rem',
            fontWeight:      '700',
            cursor:          isLaunching ? 'not-allowed' : 'pointer',
            opacity:         isLaunching ? 0.7 : 1,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            gap:             '7px',
            marginBottom:    '8px',
            transition:      'background var(--transition-fast)',
            boxShadow:       `0 2px 8px ${portal.accent}33`
          }}
          onMouseEnter={e => !isLaunching && (e.currentTarget.style.backgroundColor = portal.accentHover)}
          onMouseLeave={e => !isLaunching && (e.currentTarget.style.backgroundColor = portal.accent)}
        >
          <Sparkles size={14} />
          {isLaunching ? 'Launching...' : `Launch ${portal.badge}`}
          <ArrowRight size={14} />
        </button>

        {/* Secondary — Sign In / Register */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            id={`signin-${portal.role}-btn`}
            onClick={onSignIn}
            style={{
              flex:            1,
              padding:         '8px 8px',
              borderRadius:    'var(--radius-md)',
              border:          `1px solid ${portal.accentBorder}`,
              backgroundColor: portal.accentLight,
              color:           portal.accent,
              fontSize:        '0.78rem',
              fontWeight:      '600',
              cursor:          'pointer',
              transition:      'all var(--transition-fast)'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'; e.currentTarget.style.borderColor = portal.accent; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = portal.accentLight; e.currentTarget.style.borderColor = portal.accentBorder; }}
          >
            {portal.role === 'admin' ? 'Admin Login' : 'Sign In'}
          </button>

          {portal.showRegister && (
            <button
              type="button"
              id={`register-${portal.role}-btn`}
              onClick={onRegister}
              style={{
                flex:            1,
                padding:         '8px 8px',
                borderRadius:    'var(--radius-md)',
                border:          '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-subtle)',
                color:           'var(--text-secondary)',
                fontSize:        '0.78rem',
                fontWeight:      '600',
                cursor:          'pointer',
                transition:      'all var(--transition-fast)'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Portal Selection Page Component ─────────────────────────────────────
export const PortalSelectionPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { loginDemo } = useAuth();
  const [launchingRole, setLaunchingRole] = useState(null);

  // 1-Click Launch handler using pre-configured demo account
  const handleQuickLaunch = async (portal) => {
    setLaunchingRole(portal.role);
    try {
      const res = await loginDemo(portal.demoId || portal.role, true, portal.role);
      if (res && res.success) {
        if (portal.role === 'teacher') {
          navigate('/teacher');
        } else if (portal.role === 'parent') {
          navigate('/parent');
        } else if (portal.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Fallback to login with pre-selected role
        navigate(portal.role === 'admin' ? '/admin-login' : `/login?role=${portal.role}`);
      }
    } catch {
      navigate(portal.role === 'admin' ? '/admin-login' : `/login?role=${portal.role}`);
    } finally {
      setLaunchingRole(null);
    }
  };

  const handleSignIn = (role) => {
    if (role === 'admin') {
      navigate('/admin-login');
    } else {
      navigate(`/login?role=${role}`);
    }
  };

  const handleRegister = (role) => navigate(`/register?role=${role}`);

  const handleDirectFeatureClick = async (feature) => {
    setLaunchingRole(feature.role);
    try {
      await loginDemo(feature.role, true, feature.role);
      navigate(feature.path);
    } catch {
      navigate(feature.path);
    } finally {
      setLaunchingRole(null);
    }
  };

  return (
    <div style={{
      minHeight:       '100vh',
      backgroundColor: 'var(--bg-app)',
      fontFamily:      'var(--font-sans)',
      overflowX:       'hidden'
    }}>

      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <nav className="portal-select-nav" style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom:    '1px solid var(--border-subtle)',
        boxShadow:       'var(--shadow-xs)',
        padding:         '0 24px',
        position:        'sticky',
        top:             0,
        zIndex:          50
      }}>
        <div style={{
          maxWidth:       '1320px',
          margin:         '0 auto',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          height:         '64px'
        }}>
          {/* Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width:           '38px',
              height:          '38px',
              borderRadius:    'var(--radius-md)',
              backgroundColor: '#1A2332',
              color:           '#FFFFFF',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              flexShrink:      0,
              boxShadow:       'var(--shadow-sm)'
            }}>
              <LLLogo />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '0.92rem', letterSpacing: '-0.01em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                LEARNING LOOPS
              </div>
              <div style={{ fontSize: '0.58rem', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                MASTER PORTAL LAUNCHER
              </div>
            </div>
          </Link>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme toggle */}
            <button
              id="portal-theme-toggle-btn"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark'
                ? <Sun size={16} style={{ color: '#FAAD30' }} />
                : <Moon size={16} />
              }
            </button>

            <button
              id="portal-select-demo-btn"
              onClick={() => navigate('/demo')}
              style={{
                padding:         '7px 15px',
                borderRadius:    'var(--radius-md)',
                border:          '1px solid var(--border-subtle)',
                backgroundColor: 'transparent',
                color:           'var(--text-secondary)',
                fontSize:        '0.82rem',
                fontWeight:      '600',
                cursor:          'pointer',
                transition:      'all var(--transition-fast)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              Demo Hub
            </button>

            <Link
              to="/"
              id="portal-select-back-btn"
              style={{
                padding:         '7px 14px',
                borderRadius:    'var(--radius-md)',
                border:          'none',
                backgroundColor: 'var(--bg-surface-subtle)',
                color:           'var(--text-secondary)',
                fontSize:        '0.82rem',
                fontWeight:      '600',
                cursor:          'pointer',
                textDecoration:  'none',
                display:         'inline-flex',
                alignItems:      'center',
                gap:             '5px',
                transition:      'all var(--transition-fast)'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent-primary-light)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <ArrowLeft size={13} /> Landing Page
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Page Content ────────────────────────────────────────── */}
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) 24px' }}>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 48px)' }}>
          <div style={{
            display:         'inline-flex',
            alignItems:      'center',
            gap:             '6px',
            padding:         '4px 14px',
            borderRadius:    'var(--radius-full)',
            backgroundColor: 'var(--accent-primary-light)',
            border:          '1px solid var(--border-subtle)',
            marginBottom:    '14px'
          }}>
            <Sparkles size={13} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              All-In-One EdTech Ecosystem
            </span>
          </div>

          <h1 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight:    '800',
            color:         'var(--text-primary)',
            letterSpacing: '-0.025em',
            marginBottom:  '12px',
            lineHeight:    '1.15'
          }}>
            Choose Your Learning Loops Portal
          </h1>

          <p style={{
            fontSize:   'clamp(0.88rem, 1.8vw, 1rem)',
            color:      'var(--text-secondary)',
            lineHeight: '1.65',
            maxWidth:   '620px',
            margin:     '0 auto'
          }}>
            Access custom workflows, role-specific AI tools, and dedicated dashboards.
            Click <strong>Launch</strong> for instant 1-click access, or sign in with your account.
          </p>
        </div>

        {/* ── All 4 Portal Cards Grid ─────────────────────────────────── */}
        <div style={{
          display:               'grid',
          gridTemplateColumns:   'repeat(auto-fit, minmax(280px, 1fr))',
          gap:                   '20px',
          marginBottom:          '48px'
        }}>
          {ALL_PORTALS.map(portal => (
            <PortalCard
              key={portal.role}
              portal={portal}
              isLaunching={launchingRole === portal.role}
              onQuickLaunch={() => handleQuickLaunch(portal)}
              onSignIn={() => handleSignIn(portal.role)}
              onRegister={() => handleRegister(portal.role)}
            />
          ))}
        </div>

        {/* ── Direct Quick Jump Feature Matrix ──────────────────────────── */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius:    'var(--radius-xl)',
          border:          '1px solid var(--border-subtle)',
          boxShadow:       'var(--shadow-sm)',
          padding:         'clamp(24px, 4vw, 36px)',
          marginBottom:    '40px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                <Layers size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Direct Feature Navigator
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Jump Straight Into Any Feature or Laboratory
              </h2>
            </div>

            <button
              onClick={() => navigate('/demo')}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Users size={14} /> Open Multi-Account Demo Switcher
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}>
            {QUICK_FEATURE_LINKS.map((feat, idx) => {
              const FeatIcon = feat.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleDirectFeatureClick(feat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = feat.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: feat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FeatIcon size={18} color={feat.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {feat.title}
                      <ArrowRight size={12} color="var(--text-muted)" style={{ opacity: 0.6 }} />
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {feat.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Demo Mode Banner ────────────────────────────────────────── */}
        <div
          className="portal-demo-banner"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius:    'var(--radius-xl)',
            border:          '1px solid var(--border-subtle)',
            boxShadow:       'var(--shadow-sm)',
            padding:         'clamp(20px, 3.5vw, 32px) clamp(20px, 3.5vw, 40px)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'space-between',
            flexWrap:        'wrap',
            gap:             '20px',
            backgroundImage: 'linear-gradient(135deg, var(--bg-card) 70%, var(--accent-primary-light) 100%)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{
                width:           '26px',
                height:          '26px',
                borderRadius:    'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary-light)',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center'
              }}>
                <Play size={12} color="var(--accent-primary)" />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Instant Demo Mode
              </span>
            </div>

            <h3 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(1.05rem, 2.2vw, 1.3rem)',
              fontWeight:    '800',
              color:         'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom:  '6px'
            }}>
              Need to test different accounts or student personas?
            </h3>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '520px', margin: 0 }}>
              Use the Demo Hub to switch between 3 Student personas (AI/ML, Web Dev, Data Science),
              Faculty Professor, Parent, and Admin roles instantly.
            </p>
          </div>

          <button
            id="portal-select-explore-demo-btn"
            onClick={() => navigate('/demo')}
            style={{
              padding:         '11px 24px',
              borderRadius:    'var(--radius-md)',
              border:          '1px solid var(--accent-primary)',
              backgroundColor: 'var(--accent-primary)',
              color:           '#FFFFFF',
              fontSize:        '0.88rem',
              fontWeight:      '700',
              cursor:          'pointer',
              display:         'flex',
              alignItems:      'center',
              gap:             '8px',
              transition:      'all var(--transition-fast)',
              whiteSpace:      'nowrap',
              boxShadow:       'var(--shadow-blue)'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'; e.currentTarget.style.borderColor = 'var(--accent-primary-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--accent-primary)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
          >
            Explore Demo Hub <ChevronRight size={16} />
          </button>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            © 2025 Learning Loops — Where Your Every Contribution Counts
          </p>
          <div style={{ display: 'inline-flex', gap: '16px', fontSize: '0.74rem' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Landing Page</Link>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <Link to="/portal-select" style={{ color: 'var(--accent-primary)', fontWeight: '600', textDecoration: 'none' }}>All Portals</Link>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <Link to="/admin-login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Admin Login</Link>
          </div>
        </div>

      </div>
    </div>
  );
};
export default PortalSelectionPage;
