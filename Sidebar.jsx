import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Award,
  DownloadCloud,
  FileText,
  BarChart3,
  Trophy,
  Scroll,
  Bot,
  Bell,
  Settings,
  HelpCircle,
  User,
  LogOut,
  Users,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Compass,
  Video,
  Briefcase,
  FolderKanban,
  Heart,
  Info,
  Sparkles,
  UserCircle,
  BookMarked,
  FlaskConical,
  Target,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const Sidebar = ({ activeTab, onSelectTab, isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose, onOpenFocus }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  const isStudent = currentUser?.role === 'student';
  const isTeacher = currentUser?.role === 'teacher';
  const isParent = currentUser?.role === 'parent';
  const isAdmin = currentUser?.role === 'admin';

  const NavItem = ({ tab, icon, label, color }) => (
    <li>
      <button
        className={`nav-item-btn ${activeTab === tab ? 'active' : ''}`}
        onClick={() => { onSelectTab(tab); if (onMobileClose) onMobileClose(); }}
        title={isCollapsed ? label : undefined}
        style={activeTab === tab && color ? { '--sidebar-accent': color } : undefined}
      >
        {React.cloneElement(icon, {
          size: 18,
          color: activeTab === tab ? (color || 'var(--sidebar-accent)') : undefined
        })}
        {!isCollapsed && <span>{label}</span>}
      </button>
    </li>
  );

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5H4" />
            <path d="M4 14l-3-3 3-3" />
            <path d="M17 12a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5h8" />
            <path d="M20 10l3 3-3 3" />
          </svg>
        </div>
        {!isCollapsed && (
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-name">LEARNING LOOPS</div>
            <div className="sidebar-logo-tagline">Every Contribution Counts</div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            marginLeft: 'auto',
            padding: '5px',
            borderRadius: '6px',
            color: 'var(--sidebar-text)',
            transition: 'color 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--sidebar-text)'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <ul className="sidebar-nav-list">

        {/* ── STUDENT NAV ── */}
        {isStudent && (
          <>
            {/* FOCUS MODE — student-only prominent button */}
            <li style={{ padding: isCollapsed ? '4px 8px' : '4px 10px', marginBottom: '4px' }}>
              <button
                onClick={() => { if (onOpenFocus) onOpenFocus(); if (onMobileClose) onMobileClose(); }}
                title="Focus Mode"
                style={{
                  width: '100%', padding: isCollapsed ? '10px' : '11px 14px',
                  borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #4A90E2, #2E75CC)',
                  color: '#fff', fontWeight: '700', fontSize: '0.84rem',
                  display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '8px', boxShadow: '0 4px 14px rgba(74,144,226,0.4)',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(74,144,226,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(74,144,226,0.4)'; }}
              >
                <Target size={17} style={{ flexShrink: 0 }} />
                {!isCollapsed && <span>🎯 FOCUS MODE</span>}
              </button>
            </li>

            {!isCollapsed && <div className="sidebar-nav-section">Main</div>}
            <NavItem tab="dashboard" icon={<LayoutDashboard />} label="Home" color="#4A90E2" />
            <NavItem tab="my_learning" icon={<BookOpen />} label="My Courses" color="#9B59B6" />
            <NavItem tab="courses" icon={<Compass />} label="Courses" color="#1ABC9C" />
            <NavItem tab="practice" icon={<CheckSquare />} label="Practice &amp; Tests" color="#E67E22" />
            <NavItem tab="tests" icon={<Award />} label="Test Series" color="#F39C12" />

            {!isCollapsed && <div className="sidebar-nav-section" style={{ marginTop: '4px' }}>Features</div>}
            <NavItem tab="interview_lab" icon={<Video />} label="Interview Lab" color="#E74C3C" />
            <NavItem tab="downloads" icon={<DownloadCloud />} label="Offline Downloads" color="#2ECC71" />
            <NavItem tab="resources" icon={<BookMarked />} label="Library" color="#3498DB" />
            <NavItem tab="student_connection" icon={<Users />} label="Student Connection" color="#E91E63" />
            <NavItem tab="internships" icon={<Briefcase />} label="Internships" color="#FF5722" />
            <NavItem tab="projects" icon={<FolderKanban />} label="Project Collab" color="#00BCD4" />
            <NavItem tab="wellbeing" icon={<Heart />} label="Wellbeing" color="#E91E63" />

            {!isCollapsed && <div className="sidebar-nav-section" style={{ marginTop: '4px' }}>Progress</div>}
            <NavItem tab="progress" icon={<BarChart3 />} label="Progress &amp; Reports" color="#9B59B6" />
            <NavItem tab="achievements" icon={<Trophy />} label="Achievements" color="#F1C40F" />
            <NavItem tab="certificates" icon={<Scroll />} label="Certificates" color="#27AE60" />
          </>
        )}

        {/* ── TEACHER NAV ── */}
        {isTeacher && (
          <>
            {!isCollapsed && <div className="sidebar-nav-section">Teacher Portal</div>}
            <NavItem tab="teacher_overview" icon={<GraduationCap />} label="Class Dashboard" color="#4A90E2" />
            <NavItem tab="teacher_test_builder" icon={<FlaskConical />} label="Test Builder" color="#E67E22" />
            <NavItem tab="teacher_analytics" icon={<BarChart3 />} label="Class Analytics" color="#9B59B6" />
            <NavItem tab="teacher_resources" icon={<FileText />} label="Resource Uploads" color="#1ABC9C" />
          </>
        )}

        {/* ── PARENT NAV ── */}
        {isParent && (
          <>
            {!isCollapsed && <div className="sidebar-nav-section">Parent Portal</div>}
            <NavItem tab="parent_dashboard" icon={<Users />} label="Child Progress" color="#4A90E2" />
            <NavItem tab="parent_calendar" icon={<BarChart3 />} label="Calendar &amp; Attendance" color="#27AE60" />
          </>
        )}

        {/* ── ADMIN NAV ── */}
        {isAdmin && (
          <>
            {!isCollapsed && <div className="sidebar-nav-section">Admin Panel</div>}
            <NavItem tab="admin_overview" icon={<LayoutDashboard />} label="Control Center" color="#4A90E2" />
            <NavItem tab="admin_users" icon={<Users />} label="User Accounts" color="#27AE60" />
          </>
        )}

        {/* ── UNIVERSAL ── */}
        {!isCollapsed && <div className="sidebar-nav-section" style={{ marginTop: '4px' }}>Account</div>}
        {isStudent && <NavItem tab="profile" icon={<UserCircle />} label="Profile" color="#607D8B" />}
        <NavItem tab="settings" icon={<Settings />} label="Settings" color="#78909C" />
        <NavItem tab="help" icon={<HelpCircle />} label="Help &amp; Support" color="#546E7A" />
      </ul>

      {/* AI Assistant floating button at bottom */}
      <button
        className="sidebar-ai-btn"
        onClick={() => { onSelectTab('ai'); if (onMobileClose) onMobileClose(); }}
        title="AI Learning Assistant"
      >
        <Sparkles size={16} style={{ flexShrink: 0 }} />
        {!isCollapsed && <span>AI Assistant</span>}
      </button>

      {/* Footer — user card + logout */}
      <div className="sidebar-footer">
        <button
          className="nav-item-btn"
          onClick={async () => {
            await logout(true);
            navigate('/login', { replace: true });
          }}
          style={{ color: '#FF6B6B' }}
          title="Logout"
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>{t('nav_logout')}</span>}
        </button>

        {!isCollapsed && currentUser && (
          <div
            className="user-profile-card"
            onClick={() => { if (isStudent) onSelectTab('profile'); }}
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.name}
              className="user-avatar"
            />
            <div className="user-details">
              <div className="user-name">{currentUser.name}</div>
              <div className="user-role-badge">
                {currentUser.role?.charAt(0).toUpperCase() + currentUser.role?.slice(1)}
                {currentUser.educationLevel ? ` · ${currentUser.educationLevel}` : ''}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
