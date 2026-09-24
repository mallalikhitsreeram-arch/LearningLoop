import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NetworkProvider, useNetwork } from './context/NetworkContext.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';
import { DataSaverProvider } from './context/DataSaverContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage.jsx';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.jsx';
import { StudentOnboardingPage } from './pages/auth/StudentOnboardingPage.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { DemoPage } from './pages/DemoPage.jsx';
import { PortalSelectionPage } from './pages/PortalSelectionPage.jsx';
import { AdminLoginPage } from './pages/auth/AdminLoginPage.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';

import { Navbar } from './components/layout/Navbar.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { OfflineBanner } from './components/layout/OfflineBanner.jsx';
import { HelpModal } from './components/layout/HelpModal.jsx';

import { StudentDashboard } from './components/dashboard/StudentDashboard.jsx';
import { KpiCards } from './components/dashboard/KpiCards.jsx';
import { DailyGoalCard } from './components/dashboard/DailyGoalCard.jsx';
import { ActivityCalendar } from './components/dashboard/ActivityCalendar.jsx';
import { ProgressCharts } from './components/dashboard/ProgressCharts.jsx';
import { SmartRecommendations } from './components/dashboard/SmartRecommendations.jsx';

import { CourseList } from './components/courses/CourseList.jsx';
import { CourseDetail } from './components/courses/CourseDetail.jsx';
import { PracticeView } from './components/practice/PracticeView.jsx';
import { TestList } from './components/tests/TestList.jsx';
import { LibraryView } from './components/library/LibraryView.jsx';
import { BadgesView } from './components/achievements/BadgesView.jsx';
import { SettingsView } from './components/settings/SettingsView.jsx';
import { ProfileView } from './components/profile/ProfileView.jsx';
import { InterviewLabView } from './components/interview/InterviewLabView.jsx';
import { OfflineDownloadsView } from './components/downloads/OfflineDownloadsView.jsx';

import { TeacherDashboard } from './components/teacher/TeacherDashboard.jsx';
import { ParentDashboard } from './components/parent/ParentDashboard.jsx';
import { AdminDashboard } from './components/admin/AdminDashboard.jsx';

import { OnboardingModal } from './components/auth/OnboardingModal.jsx';

// New student feature pages
import { StudentConnectionView } from './components/student/StudentConnectionView.jsx';
import { InternshipsView } from './components/student/InternshipsView.jsx';
import { ProjectCollabView } from './components/student/ProjectCollabView.jsx';
import { WellbeingView } from './components/student/WellbeingView.jsx';

// Focus Mode
import { useFocusSession } from './components/focusmode/useFocusSession.js';
import { FocusSetupModal } from './components/focusmode/FocusSetupModal.jsx';
import { FocusActiveScreen } from './components/focusmode/FocusActiveScreen.jsx';
import { FocusViolationModal } from './components/focusmode/FocusViolationModal.jsx';
import { FocusEndScreen } from './components/focusmode/FocusEndScreen.jsx';

// ─── Root Route ─────────────────────────────────────────────────────────────
// LandingPage handles both cases:
//   • Unauthenticated → shows the landing/welcome page
//   • Authenticated   → internally redirects to the correct portal

// ─── Protected App Layout ────────────────────────────────────────────────────
const ProtectedAppLayout = () => {
  const { currentUser, getAuthHeaders, isOnboardingModalOpen, setIsOnboardingModalOpen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLessonContext, setActiveLessonContext] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [practiceTopic, setPracticeTopic] = useState(null);
  const [teacherSubTab, setTeacherSubTab] = useState('teacher_overview');
  const [dashboardData, setDashboardData] = useState(null);

  // Focus Mode session
  const focusSession = useFocusSession();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Determine active tab from route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/my-learning') return 'my_learning';
    if (path.startsWith('/courses')) return 'courses';
    if (path.startsWith('/practice')) return 'practice';
    if (path.startsWith('/tests')) return 'tests';
    if (path.startsWith('/biweekly')) return 'biweekly';
    if (path.startsWith('/interview-lab')) return 'interview_lab';
    if (path.startsWith('/downloads')) return 'downloads';
    if (path.startsWith('/resources')) return 'resources';
    if (path.startsWith('/progress')) return 'progress';
    if (path.startsWith('/achievements')) return 'achievements';
    if (path.startsWith('/certificates')) return 'certificates';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/student-connection')) return 'student_connection';
    if (path.startsWith('/internships')) return 'internships';
    if (path.startsWith('/projects')) return 'projects';
    if (path.startsWith('/wellbeing')) return 'wellbeing';
    if (path.startsWith('/teacher')) return teacherSubTab || 'teacher_overview';
    if (path.startsWith('/parent')) return 'parent_dashboard';
    if (path.startsWith('/admin')) return 'admin_overview';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const fetchDashboard = () => {
    if (currentUser && currentUser.role === 'student') {
      fetch('/api/student/me/dashboard', { headers: getAuthHeaders() })
        .then(res => { if (!res.ok) return null; return res.json(); })
        .then(data => { if (data) setDashboardData(data); })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'student' && currentUser.profileCompleted === false) {
        navigate('/onboarding', { replace: true });
        return;
      }
      fetchDashboard();
    }
  }, [currentUser]);

  const handleTabSelect = (tab) => {
    if (tab === 'ai') { setIsAiModalOpen(true); return; }
    if (tab === 'help') { setIsHelpModalOpen(true); return; }

    setSelectedCourse(null);

    const routeMap = {
      'dashboard': '/dashboard',
      'my_learning': '/my-learning',
      'courses': '/courses',
      'practice': '/practice',
      'tests': '/tests',
      'biweekly': '/biweekly',
      'interview_lab': '/interview-lab',
      'downloads': '/downloads',
      'resources': '/resources',
      'progress': '/progress',
      'achievements': '/achievements',
      'certificates': '/certificates',
      'notifications': '/notifications',
      'settings': '/settings',
      'profile': '/profile',
      'student_connection': '/student-connection',
      'internships': '/internships',
      'projects': '/projects',
      'wellbeing': '/wellbeing',
      'teacher_overview': '/teacher',
      'teacher_classes': '/teacher',
      'teacher_tests': '/teacher',
      'teacher_test_builder': '/teacher',
      'teacher_analytics': '/teacher',
      'teacher_resources': '/teacher',
      'parent_dashboard': '/parent',
      'parent_calendar': '/parent',
      'admin_overview': '/admin',
      'admin_users': '/admin',
    };

    if (tab.startsWith('teacher_')) setTeacherSubTab(tab);

    const targetRoute = routeMap[tab] || `/${tab}`;
    navigate(targetRoute);
  };

  const handlePracticeWeakTopic = (topic) => {
    setPracticeTopic(topic);
    setSelectedCourse(null);
    navigate('/practice');
  };

  const handleSearchSelection = (item) => {
    if (item.category === 'courses') {
      fetch(`/api/courses/${item.id}`)
        .then(res => res.json())
        .then(course => { setSelectedCourse(course); navigate('/courses'); })
        .catch(() => { setSelectedCourse(null); navigate('/courses'); });
    } else if (item.category === 'practice') {
      handlePracticeWeakTopic(item.topic);
    } else if (item.category === 'resources') {
      setSelectedCourse(null);
      navigate('/resources');
    }
  };

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="sidebar-overlay visible"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        onOpenFocus={currentUser?.role === 'student' ? focusSession.openSetup : undefined}
      />

      <div className="main-content">
        {/* Top Navbar */}
        <Navbar
          onOpenAi={() => setIsAiModalOpen(true)}
          onSelectSearchResult={handleSearchSelection}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Offline Banner */}
        <OfflineBanner
          onGoToDownloads={() => { setSelectedCourse(null); navigate('/downloads'); }}
        />

        {/* Page Content */}
        <main className="page-wrapper">
          <Routes>
            {/* ── STUDENT ROUTES ── */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard
                  dashboardData={dashboardData}
                  currentUser={currentUser}
                  onNavigate={(tab) => handleTabSelect(tab)}
                  onPracticeWeakTopic={handlePracticeWeakTopic}
                  onOpenFocus={focusSession.openSetup}
                />
              </ProtectedRoute>
            } />

            <Route path="/my-learning" element={
              <ProtectedRoute allowedRoles={['student']}>
                {selectedCourse ? (
                  <CourseDetail course={selectedCourse} onBack={() => { setSelectedCourse(null); setActiveLessonContext(null); }} onActiveContextChange={setActiveLessonContext} />
                ) : (
                  <CourseList onSelectCourse={(c) => setSelectedCourse(c)} initialFilter="enrolled" />
                )}
              </ProtectedRoute>
            } />

            <Route path="/courses" element={
              <ProtectedRoute allowedRoles={['student']}>
                {selectedCourse ? (
                  <CourseDetail course={selectedCourse} onBack={() => { setSelectedCourse(null); setActiveLessonContext(null); }} onActiveContextChange={setActiveLessonContext} />
                ) : (
                  <CourseList onSelectCourse={(c) => setSelectedCourse(c)} initialFilter="all" />
                )}
              </ProtectedRoute>
            } />

            <Route path="/practice" element={
              <ProtectedRoute allowedRoles={['student']}>
                <PracticeView initialTopic={practiceTopic} />
              </ProtectedRoute>
            } />

            <Route path="/tests" element={
              <ProtectedRoute allowedRoles={['student']}>
                <TestList onPracticeWeak={handlePracticeWeakTopic} initialFilter="all" />
              </ProtectedRoute>
            } />

            <Route path="/biweekly" element={
              <ProtectedRoute allowedRoles={['student']}>
                <TestList onPracticeWeak={handlePracticeWeakTopic} initialFilter="biweekly" />
              </ProtectedRoute>
            } />

            <Route path="/interview-lab" element={
              <ProtectedRoute allowedRoles={['student']}>
                <InterviewLabView />
              </ProtectedRoute>
            } />

            <Route path="/downloads" element={
              <ProtectedRoute allowedRoles={['student']}>
                <OfflineDownloadsView
                  selectedCourse={selectedCourse}
                  onSelectCourse={(c) => setSelectedCourse(c)}
                  onBackCourse={() => { setSelectedCourse(null); setActiveLessonContext(null); }}
                  onActiveContextChange={setActiveLessonContext}
                />
              </ProtectedRoute>
            } />

            <Route path="/resources" element={
              <ProtectedRoute allowedRoles={['student']}>
                <LibraryView />
              </ProtectedRoute>
            } />

            <Route path="/progress" element={
              <ProtectedRoute allowedRoles={['student']}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <ProgressCharts />
                  <ActivityCalendar history={dashboardData?.activityHistory || []} />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/achievements" element={
              <ProtectedRoute allowedRoles={['student']}>
                <BadgesView />
              </ProtectedRoute>
            } />

            <Route path="/certificates" element={
              <ProtectedRoute allowedRoles={['student']}>
                <BadgesView />
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute allowedRoles={['student']}>
                <div className="content-card" style={{ maxWidth: '860px', margin: '0 auto' }}>
                  <h2 className="section-title" style={{ marginBottom: '16px' }}>All Notifications &amp; Academic Alerts</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(dashboardData?.notifications || [
                      { id: '1', title: 'Bi-Weekly Assessment Due', desc: 'Bi-Weekly Assessment: C Core & Memory Diagnostics closes in 2 days.', time: '2h ago' },
                      { id: '2', title: 'Daily Streak Safeguard', desc: 'Complete 25m study today to safeguard your 12-day streak.', time: '4h ago' },
                      { id: '3', title: 'Resource Uploaded', desc: 'Prof. Ramanujan uploaded "C Pointer & Memory Guide (PDF)".', time: 'Yesterday' },
                      { id: '4', title: 'Official Certificate Accredited', desc: 'Certificate for Java Core & Enterprise is ready to view & download.', time: '3d ago' }
                    ]).map((n, idx) => (
                      <div key={idx} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s ease' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{n.title}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.desc}</div>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '12px' }}>{n.time || 'Recent'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProfileView />
              </ProtectedRoute>
            } />

            {/* ── NEW STUDENT FEATURE ROUTES ── */}
            <Route path="/student-connection" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentConnectionView onNavigate={handleTabSelect} />
              </ProtectedRoute>
            } />

            <Route path="/internships" element={
              <ProtectedRoute allowedRoles={['student']}>
                <InternshipsView />
              </ProtectedRoute>
            } />

            <Route path="/projects" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProjectCollabView />
              </ProtectedRoute>
            } />

            <Route path="/wellbeing" element={
              <ProtectedRoute allowedRoles={['student']}>
                <WellbeingView onNavigate={handleTabSelect} />
              </ProtectedRoute>
            } />

            {/* ── SHARED ── */}
            <Route path="/settings" element={<SettingsView />} />

            {/* ── TEACHER ── */}
            <Route path="/teacher/*" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard activeTab={teacherSubTab} onSubTabChange={(sub) => setTeacherSubTab(sub)} />
              </ProtectedRoute>
            } />

            {/* ── PARENT ── */}
            <Route path="/parent/*" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard activeTab="parent_dashboard" />
              </ProtectedRoute>
            } />

            {/* ── ADMIN ── */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onFinish={() => { setIsOnboardingModalOpen(false); fetchDashboard(); }}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />

      {/* ── FOCUS MODE (student only, renders as full-page overlay) ── */}
      {currentUser?.role === 'student' && (() => {
        const { session, screen, endReason, startSession, recordViolation, dismissViolation, completeSession, endSession } = focusSession;
        const handleFocusNav = (tab) => {
          endSession('manual');
          handleTabSelect(tab);
        };
        if (screen === 'setup') return <FocusSetupModal onStart={startSession} onClose={focusSession.closeSetup} />;
        if (screen === 'active' && session) return <FocusActiveScreen session={session} onViolation={recordViolation} onComplete={completeSession} onAbandon={() => endSession('manual')} />;
        if (screen === 'violation' && session) return (
          <>
            <FocusActiveScreen session={session} onViolation={() => {}} onComplete={completeSession} onAbandon={() => endSession('manual')} />
            <FocusViolationModal session={session} onReturn={dismissViolation} />
          </>
        );
        if (screen === 'end') return <FocusEndScreen session={session} endReason={endReason} onNavigate={handleFocusNav} />;
        return null;
      })()}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NetworkProvider>
            <LanguageProvider>
              <DataSaverProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/demo" element={<DemoPage />} />
                  <Route path="/portal-select" element={<PortalSelectionPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  {/* Admin-only login — not linked publicly, accessed directly */}
                  <Route path="/admin-login" element={<AdminLoginPage />} />
                  {/* Protected routes */}
                  <Route path="/onboarding" element={
                    <ProtectedRoute><StudentOnboardingPage /></ProtectedRoute>
                  } />
                  <Route path="/*" element={
                    <ProtectedRoute><ProtectedAppLayout /></ProtectedRoute>
                  } />
                </Routes>
              </DataSaverProvider>
            </LanguageProvider>
          </NetworkProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
