import React, { useState, useEffect } from 'react';
import { Users, Clock, Award, Flame, CheckCircle, BookOpen, ShieldCheck, Calendar as CalendarIcon, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ActivityCalendar } from '../dashboard/ActivityCalendar.jsx';

export const ParentDashboard = ({ activeTab = 'parent_dashboard' }) => {
  const { currentUser, getAuthHeaders, switchRole } = useAuth();
  const [parentData, setParentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const fetchParentProgress = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const parentId = currentUser?.role === 'parent' ? currentUser.id : 'usr-parent-1';
        const res = await fetch(`/api/parent/child-progress/${parentId}`, {
          headers: getAuthHeaders()
        });

        if (!res.ok) {
          throw new Error(`Failed to load parent data (${res.status})`);
        }

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setParentData(data);
      } catch (err) {
        console.error('Parent dashboard fetch error:', err);
        setLoadError(err.message || 'Could not load parent monitoring data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParentProgress();
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'parent_calendar') {
      const el = document.getElementById('parent-calendar-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="content-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-sage)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px'
        }} />
        <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
          Loading verified parent monitoring portal...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="content-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ color: 'var(--accent-crimson)', fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>
          Unable to Load Parent Dashboard
        </div>
        <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {loadError}
        </div>
        <button
          className="btn-primary"
          onClick={() => switchRole('parent')}
          style={{ margin: '0 auto' }}
        >
          <UserCheck size={16} /> Switch to Rajesh Sharma (Parent)
        </button>
      </div>
    );
  }

  const {
    student = {
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      college: 'Government Polytechnic College, Nizamabad',
      course: 'Diploma in Computer Engineering'
    },
    metrics = {},
    recentTests = [],
    recentBadges = [],
    activityHistory = []
  } = parentData || {};

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Admin Notice if viewing in admin mode */}
      {currentUser?.role === 'admin' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-amber-light)',
          border: '1px solid #FED7AA',
          fontSize: '0.84rem',
          color: '#9A3412'
        }}>
          <div>
            Viewing Parent Monitoring Portal in <strong>Administrative Oversight Mode</strong>.
          </div>
        </div>
      )}

      {/* Verified Parent Banner */}
      <div className="content-card" style={{ background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
              alt={student.name}
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-sage)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-sage)', fontWeight: '700', fontSize: '0.78rem' }}>
                <ShieldCheck size={16} /> Verified Parent Portal
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '800', marginTop: '2px' }}>
                Monitoring Progress: {student.name}
              </h2>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {student.college} • {student.course}
              </div>
            </div>
          </div>

          <div className="streak-pill" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            <Flame size={18} color="#D97706" />
            <span>{metrics.learningStreak || 12} DAY STREAK</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-title">Study Time</span>
          <div className="kpi-value">{Math.floor((metrics.learningTimeMinutes || 1120) / 60)}h {(metrics.learningTimeMinutes || 1120) % 60}m</div>
          <div className="kpi-footer-sub">Total Lifetime Hours</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Today's Target</span>
          <div className="kpi-value">{metrics.todayCompletedMinutes || 35} / {metrics.dailyTargetMinutes || 60}m</div>
          <div className="kpi-footer-sub">{Math.round(((metrics.todayCompletedMinutes || 35) / (metrics.dailyTargetMinutes || 60)) * 100)}% completed today</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Average Score</span>
          <div className="kpi-value" style={{ color: 'var(--accent-sage)' }}>{metrics.averageTestScore || 82}%</div>
          <div className="kpi-footer-sub">Exams &amp; Assessments</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Courses Completed</span>
          <div className="kpi-value" style={{ color: 'var(--accent-navy)' }}>{metrics.coursesCompleted || 4}</div>
          <div className="kpi-footer-sub">Certified Milestones</div>
        </div>
      </div>

      {/* 3-Month Activity Calendar */}
      <div id="parent-calendar-section">
        <ActivityCalendar history={activityHistory} />
      </div>

      {/* Recent Test Scores & Achievements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <div className="content-card">
          <h3 className="section-title" style={{ marginBottom: '14px' }}>Latest Exam Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentTests.map((t, idx) => (
              <div key={t.id || idx} style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{t.testTitle || t.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.attemptDate?.split('T')[0] || 'Recent'}</div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-sage)' }}>
                  {t.scorePercentage || t.score || 82}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <h3 className="section-title" style={{ marginBottom: '14px' }}>Earned Badges</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentBadges.map((b, idx) => (
              <div key={b.id || idx} style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--accent-amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
                  <Award size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{b.name}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{b.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
