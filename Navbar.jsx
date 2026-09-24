import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Flame,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Globe,
  ChevronDown,
  User,
  LogOut,
  Bell,
  BookOpen,
  CheckSquare,
  FileText,
  ArrowRight,
  X,
  Settings,
  Menu,
  Sparkles,
  Sun,
  Moon,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export const Navbar = ({ onOpenAi, onSelectSearchResult, onToggleSidebar }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { networkMode, setMode, isEffectiveOnline, pendingCount, syncStatus, lastSyncTime, triggerSync } = useNetwork();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Single active dropdown: null | 'notifications' | 'profile' | 'language' | 'network' | 'search'
  const [activeDropdown, setActiveDropdown] = useState(null);

  const isNetworkDropdownOpen = activeDropdown === 'network';
  const isLangDropdownOpen = activeDropdown === 'language';
  const isProfileDropdownOpen = activeDropdown === 'profile';
  const isNotificationsOpen = activeDropdown === 'notifications';
  const isSearchDropdownOpen = activeDropdown === 'search';

  const toggleDropdown = (name) => {
    setActiveDropdown(prev => (prev === name ? null : name));
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Refs for outside click detection
  const searchRef = useRef(null);
  const networkRef = useRef(null);
  const notificationsRef = useRef(null);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!activeDropdown) return;
    const dropdownRefs = {
      notifications: notificationsRef,
      profile: profileRef,
      language: langRef,
      network: networkRef,
      search: searchRef,
    };
    const handleClickOutside = (event) => {
      const currentRef = dropdownRefs[activeDropdown];
      if (currentRef?.current && !currentRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdown]);

  // Demo notifications
  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'Bi-Weekly Assessment Due', desc: 'C Core & Memory Diagnostics closes in 2 days.', time: '2h ago', type: 'test', unread: true },
    { id: 'notif-2', title: 'Daily Streak Safeguard', desc: 'Complete 25m study today to keep your streak alive!', time: '4h ago', type: 'streak', unread: true },
    { id: 'notif-3', title: 'Faculty Announcement', desc: 'Prof. Ramanujan uploaded "C Memory & Pointer Guide".', time: 'Yesterday', type: 'resource', unread: true },
    { id: 'notif-4', title: 'Certificate Ready', desc: 'Java Core & Enterprise certificate is now available.', time: '3d ago', type: 'certificate', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  // Search index
  const searchableIndex = [
    { title: 'C Programming', type: 'Course', category: 'courses', id: 'crs-c-lang' },
    { title: 'C++ Object-Oriented Programming', type: 'Course', category: 'courses', id: 'crs-cpp' },
    { title: 'Java Core & Enterprise', type: 'Course', category: 'courses', id: 'crs-java' },
    { title: 'Python Fundamentals & Scripting', type: 'Course', category: 'courses', id: 'crs-python' },
    { title: 'HTML & CSS Responsive Design', type: 'Course', category: 'courses', id: 'crs-html-css' },
    { title: 'JavaScript Modern ES6+ & Async', type: 'Course', category: 'courses', id: 'crs-javascript' },
    { title: 'SQL Database Design & Queries', type: 'Course', category: 'courses', id: 'crs-sql' },
    { title: 'Data Structures & Algorithms', type: 'Course', category: 'courses', id: 'crs-dsa' },
    { title: 'Full-Stack Web Development', type: 'Course', category: 'courses', id: 'crs-webdev' },
    { title: 'Introduction to Artificial Intelligence', type: 'Course', category: 'courses', id: 'crs-ai' },
    { title: 'Pointers & Dynamic Memory', type: 'Practice Topic', category: 'practice', topic: 'Pointers' },
    { title: 'Loops & Branching', type: 'Practice Topic', category: 'practice', topic: 'Loops' },
    { title: 'Arrays & Matrices', type: 'Practice Topic', category: 'practice', topic: 'Arrays' },
    { title: 'Functions & Call Stack', type: 'Practice Topic', category: 'practice', topic: 'Functions' },
    { title: 'CSS Flexbox & Responsive Layouts', type: 'Practice Topic', category: 'practice', topic: 'Flexbox' },
    { title: 'Async JS & Promises', type: 'Practice Topic', category: 'practice', topic: 'Async JS' },
    { title: 'C Pointers Quick Reference', type: 'Library Note', category: 'resources', id: 'res-c-pointers' },
    { title: 'HTML5 & CSS3 Cheatsheet', type: 'Library Note', category: 'resources', id: 'res-html-cheatsheet' },
  ];

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      if (activeDropdown === 'search') setActiveDropdown(null);
      return;
    }
    const q = val.toLowerCase();
    const matched = searchableIndex.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      (item.topic && item.topic.toLowerCase().includes(q))
    );
    setSearchResults(matched.slice(0, 6));
    setActiveDropdown('search');
  };

  const handleSelectSearch = (item) => {
    setActiveDropdown(null);
    setSearchQuery('');
    if (onSelectSearchResult) onSelectSearchResult(item);
  };

  const notifIcon = (type) => {
    if (type === 'test') return '📝';
    if (type === 'streak') return '🔥';
    if (type === 'resource') return '📚';
    if (type === 'certificate') return '🏆';
    return '🔔';
  };

  // Derive display name & meta
  const displayName = currentUser?.name?.split(' ')[0] || 'User';
  const displayMeta = currentUser?.role === 'student'
    ? (currentUser?.grade ? `Class ${currentUser.grade} · Student` : 'Student')
    : currentUser?.role
      ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
      : '';

  const dropdownStyle = {
    position: 'absolute',
    top: '110%',
    right: 0,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 55,
    animation: 'scaleIn 0.15s ease',
    transformOrigin: 'top right',
  };

  return (
    <header className="navbar">
      {/* Left — Hamburger (mobile) + Brand (mobile) */}
      <div className="navbar-left">
        <button
          className="navbar-hamburger"
          onClick={onToggleSidebar}
          title="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        {/* Brand shown on mobile only (hidden on desktop — shown in sidebar) */}
        <div className="brand-badge">
          <div className="brand-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5H4" />
              <path d="M4 14l-3-3 3-3" />
              <path d="M17 12a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5h8" />
              <path d="M20 10l3 3-3 3" />
            </svg>
          </div>
          <span>LEARNING LOOPS</span>
        </div>
      </div>

      {/* Center — Search */}
      <div className="navbar-center" ref={searchRef} style={{ position: 'relative' }}>
        <div className="search-input-wrapper">
          <Search size={15} />
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            placeholder="Search courses, topics, notes, opportunities..."
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setActiveDropdown('search'); }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setActiveDropdown(null); }}
              style={{ position: 'absolute', right: '12px', color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        {isSearchDropdownOpen && searchResults.length > 0 && (
          <div id="nav-search-dropdown" style={{ ...dropdownStyle, left: 0, right: 0, top: '110%', minWidth: 'unset' }}>
            <div style={{ padding: '8px 14px', background: 'var(--bg-surface-subtle)', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
              Quick Results
            </div>
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSearch(item)}
                style={{
                  padding: '11px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: idx < searchResults.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.category === 'courses' && <BookOpen size={15} color="var(--accent-primary)" />}
                  {item.category === 'practice' && <CheckSquare size={15} color="var(--accent-green)" />}
                  {item.category === 'resources' && <FileText size={15} color="var(--accent-purple)" />}
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.86rem', color: 'var(--text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.type}</div>
                  </div>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right — Actions */}
      <div className="navbar-right">
        {/* Network mode pill — subtle */}
        <div ref={networkRef} style={{ position: 'relative' }}>
          <button
            id="nav-network-btn"
            className="network-selector-pill"
            onClick={() => toggleDropdown('network')}
            title="Network mode"
          >
            <span className={`status-dot ${networkMode}`} />
            <span style={{ fontSize: '0.73rem' }}>
              {networkMode === 'online' && 'Online'}
              {networkMode === 'weak2g' && 'Weak 2G'}
              {networkMode === 'offline' && 'Offline'}
            </span>
            <ChevronDown size={12} />
          </button>
          {isNetworkDropdownOpen && (
            <div id="nav-network-dropdown" style={{ ...dropdownStyle, padding: '6px', minWidth: '180px' }}>
              {[
                { mode: 'online', label: '🟢 Online (Broadband)' },
                { mode: 'weak2g', label: '🟡 Weak 2G / Data Saver' },
                { mode: 'offline', label: '🔴 Disconnect / Offline' },
              ].map(({ mode, label }) => (
                <button
                  key={mode}
                  style={{ width: '100%', padding: '8px 10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', borderRadius: '6px', color: 'var(--text-primary)' }}
                  onClick={() => { setMode(mode); setActiveDropdown(null); }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span className={`status-dot ${mode}`} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sync status */}
        <div
          className={`sync-badge ${syncStatus}`}
          onClick={() => triggerSync(currentUser?.id)}
          title={`Last sync: ${lastSyncTime}. Click to sync now.`}
          style={{ cursor: 'pointer' }}
        >
          {syncStatus === 'syncing' ? (
            <><RefreshCw size={12} className="spin-animation" /><span>Syncing</span></>
          ) : pendingCount > 0 ? (
            <><AlertCircle size={12} /><span>{pendingCount} pending</span></>
          ) : (
            <><CheckCircle2 size={12} /><span>Synced</span></>
          )}
        </div>

        {/* Streak pill (student only) */}
        {currentUser?.role === 'student' && (
          <div className="streak-pill" title="Learning streak">
            <Flame size={14} />
            <span>12 Days</span>
          </div>
        )}

        {/* Language selector */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            id="nav-lang-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 9px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--border-subtle)', fontSize: '0.75rem', fontWeight: '600', background: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' }}
            onClick={() => toggleDropdown('language')}
          >
            <Globe size={13} />
            <span>{lang === 'en' ? 'EN' : lang === 'te' ? 'TE' : 'HI'}</span>
          </button>
          {isLangDropdownOpen && (
            <div id="nav-lang-dropdown" style={{ ...dropdownStyle, padding: '4px', minWidth: '130px' }}>
              {[
                { code: 'en', label: 'English' },
                { code: 'te', label: 'తెలుగు (Telugu)' },
                { code: 'hi', label: 'हिन्दी (Hindi)' },
              ].map(({ code, label }) => (
                <button
                  key={code}
                  style={{ width: '100%', padding: '7px 10px', textAlign: 'left', fontSize: '0.82rem', fontWeight: lang === code ? '700' : '400', color: lang === code ? 'var(--accent-primary)' : 'var(--text-primary)', borderRadius: '6px' }}
                  onClick={() => { setLang(code); setActiveDropdown(null); }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Theme Toggle ── */}
        <button
          id="nav-theme-toggle-btn"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark'
            ? <Sun size={17} style={{ transform: 'rotate(0deg)', color: '#FAAD30' }} />
            : <Moon size={17} />
          }
        </button>

        {/* ── All Portals Switcher ── */}
        <button
          id="nav-portals-hub-btn"
          onClick={() => navigate('/portal-select')}
          title="Switch Portal or View All Portals Hub"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: 'var(--bg-surface-subtle)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.color = 'var(--accent-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          <Layers size={13} color="var(--accent-primary)" />
          <span>Portals</span>
        </button>

        {/* Notifications bell */}
        <div ref={notificationsRef} style={{ position: 'relative' }}>
          <button
            id="nav-notifications-btn"
            className="navbar-icon-btn"
            onClick={() => toggleDropdown('notifications')}
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="badge">{unreadCount}</span>
            )}
          </button>

          {isNotificationsOpen && (
            <div id="nav-notifications-dropdown" style={{ ...dropdownStyle, width: '330px' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span style={{ marginLeft: '8px', background: 'var(--accent-primary)', color: '#fff', borderRadius: '10px', fontSize: '0.7rem', padding: '1px 6px', fontWeight: '700' }}>
                      {unreadCount}
                    </span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button
                    id="nav-mark-all-read-btn"
                    onClick={markAllRead}
                    style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: '600' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: n.unread ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'background 0.12s ease',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)'}
                  >
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{notifIcon(n.type)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.84rem', color: 'var(--text-primary)' }}>{n.title}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>{n.desc}</p>
                    </div>
                    {n.unread && (
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, marginTop: '5px' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            id="nav-profile-btn"
            className="navbar-user-block"
            onClick={() => toggleDropdown('profile')}
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser?.name || 'User'}
              className="navbar-user-avatar"
            />
            <div className="navbar-user-info">
              <div className="navbar-user-name">{displayName}</div>
              <div className="navbar-user-meta">{displayMeta}</div>
            </div>
            <ChevronDown size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </button>

          {isProfileDropdownOpen && currentUser && (
            <div id="nav-profile-dropdown" style={{ ...dropdownStyle, minWidth: '230px', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-surface-subtle)' }}>
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.name}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary-light)' }}
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{currentUser.role}</div>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: '6px' }}>
                {currentUser.role === 'student' && (
                  <button
                    id="nav-student-portal-btn"
                    style={{ width: '100%', padding: '9px 12px', textAlign: 'left', fontSize: '0.84rem', fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '7px' }}
                    onClick={() => { setActiveDropdown(null); navigate('/profile'); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={15} color="var(--accent-primary)" /> Profile
                  </button>
                )}
                {currentUser.role === 'teacher' && (
                  <button
                    id="nav-teacher-portal-btn"
                    style={{ width: '100%', padding: '9px 12px', textAlign: 'left', fontSize: '0.84rem', fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '7px' }}
                    onClick={() => { setActiveDropdown(null); navigate('/teacher'); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <GraduationCap size={15} color="var(--accent-primary)" /> Teacher Portal
                  </button>
                )}
                {currentUser.role === 'parent' && (
                  <button
                    id="nav-parent-portal-btn"
                    style={{ width: '100%', padding: '9px 12px', textAlign: 'left', fontSize: '0.84rem', fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '7px' }}
                    onClick={() => { setActiveDropdown(null); navigate('/parent'); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={15} color="var(--accent-primary)" /> Parent Portal
                  </button>
                )}
                {currentUser.role === 'admin' && (
                  <button
                    id="nav-admin-portal-btn"
                    style={{ width: '100%', padding: '9px 12px', textAlign: 'left', fontSize: '0.84rem', fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '7px' }}
                    onClick={() => { setActiveDropdown(null); navigate('/admin'); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={15} color="var(--accent-primary)" /> Admin Panel
                  </button>
                )}
                <button
                  style={{ width: '100%', padding: '9px 12px', textAlign: 'left', fontSize: '0.84rem', fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '7px' }}
                  onClick={() => { setActiveDropdown(null); navigate('/portal-select'); }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Layers size={15} color="var(--accent-primary)" /> Switch Portal Hub
                </button>
                <button
                  style={{ width: '100%', padding: '9px 12px', textAlign: 'left', fontSize: '0.84rem', fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '7px' }}
                  onClick={() => { setActiveDropdown(null); navigate('/settings'); }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={15} color="var(--text-muted)" /> Settings
                </button>
                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '6px 0' }} />
                <button
                  style={{ width: '100%', padding: '9px 12px', textAlign: 'left', fontSize: '0.84rem', fontWeight: '500', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '7px' }}
                  onClick={async () => {
                    setActiveDropdown(null);
                    await logout(true);
                    navigate('/login', { replace: true });
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-red-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={15} /> {t('nav_logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Fix missing import
const GraduationCap = ({ size, color, style }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
