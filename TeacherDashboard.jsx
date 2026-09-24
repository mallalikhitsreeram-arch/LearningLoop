import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Award, FileText, PlusCircle, BarChart3, Upload, CheckCircle2, Video, Folder } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { TeacherYouTubeManager } from './TeacherYouTubeManager.jsx';
import { AdvancedTestBuilder } from './AdvancedTestBuilder.jsx';
import { TestAnalyticsView } from './TestAnalyticsView.jsx';
import { TeacherFileManager } from './TeacherFileManager.jsx';

export const TeacherDashboard = ({ activeTab = 'teacher_overview', onSubTabChange }) => {
  const { currentUser, getAuthHeaders } = useAuth();
  const [classes, setClasses] = useState([]);

  const getSubTabFromTab = (tab) => {
    if (tab === 'teacher_test_builder') return 'test_builder';
    if (tab === 'teacher_analytics') return 'analytics';
    if (tab === 'teacher_resources') return 'resources';
    if (tab === 'teacher_youtube') return 'youtube';
    return 'overview';
  };

  const [activeSubTab, setActiveSubTab] = useState(getSubTabFromTab(activeTab));

  useEffect(() => {
    setActiveSubTab(getSubTabFromTab(activeTab));
  }, [activeTab]);

  useEffect(() => {
    fetch(`/api/teacher/classes/${currentUser?.id || 'usr-teacher-1'}`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClasses(data);
      })
      .catch(() => {});
  }, [currentUser]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="content-card" style={{ background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <GraduationCap size={18} />
              <span>Faculty Academic Portal</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: '800', marginTop: '4px' }}>
              Welcome back, {currentUser?.name || 'Faculty Member'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Manage assigned batches, build custom mock tests, share low-data PDF notes &amp; e-books, and inspect topic diagnostics.
            </p>
          </div>

          {/* Sub tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface-subtle)', padding: '4px', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
            <button
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: activeSubTab === 'overview' ? '700' : '500',
                background: activeSubTab === 'overview' ? 'var(--bg-surface)' : 'transparent',
                color: activeSubTab === 'overview' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              onClick={() => { setActiveSubTab('overview'); if (onSubTabChange) onSubTabChange('teacher_overview'); }}
            >
              Classes Overview
            </button>
            <button
              id="tab-teacher-test-builder"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: activeSubTab === 'test_builder' ? '700' : '500',
                background: activeSubTab === 'test_builder' ? 'var(--bg-surface)' : 'transparent',
                color: activeSubTab === 'test_builder' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              onClick={() => { setActiveSubTab('test_builder'); if (onSubTabChange) onSubTabChange('teacher_test_builder'); }}
            >
              Test Builder
            </button>
            <button
              id="tab-teacher-analytics"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: activeSubTab === 'analytics' ? '700' : '500',
                background: activeSubTab === 'analytics' ? 'var(--bg-surface)' : 'transparent',
                color: activeSubTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              onClick={() => { setActiveSubTab('analytics'); if (onSubTabChange) onSubTabChange('teacher_analytics'); }}
            >
              Class Analytics
            </button>
            <button
              id="tab-teacher-resources"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: activeSubTab === 'resources' ? '700' : '500',
                background: activeSubTab === 'resources' ? 'var(--bg-surface)' : 'transparent',
                color: activeSubTab === 'resources' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              onClick={() => { setActiveSubTab('resources'); if (onSubTabChange) onSubTabChange('teacher_resources'); }}
            >
              My Resources
            </button>
            <button
              id="tab-teacher-youtube"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: activeSubTab === 'youtube' ? '700' : '500',
                background: activeSubTab === 'youtube' ? 'var(--bg-surface)' : 'transparent',
                color: activeSubTab === 'youtube' ? 'var(--text-primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onClick={() => { setActiveSubTab('youtube'); if (onSubTabChange) onSubTabChange('teacher_youtube'); }}
            >
              <Video size={14} color={activeSubTab === 'youtube' ? 'var(--accent-coral)' : undefined} />
              <span>YouTube Videos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtab 1: Classes Overview */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {classes.map((cls) => (
            <div key={cls.id} className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="badge-pill">{cls.department} • {cls.semester}</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: '6px' }}>{cls.name}</h3>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-navy-light)', color: 'var(--accent-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Students</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{cls.totalStudents}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Class Avg</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-sage)' }}>{cls.averageScore}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Active Tests</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{cls.activeTestsCount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 2: Advanced Test Builder */}
      {activeSubTab === 'test_builder' && (
        <AdvancedTestBuilder
          onTestCreated={(newTest) => {
            setActiveSubTab('analytics');
            if (onSubTabChange) onSubTabChange('teacher_analytics');
          }}
        />
      )}

      {/* Subtab 3: Class & Test Analytics */}
      {activeSubTab === 'analytics' && (
        <TestAnalyticsView />
      )}

      {/* Subtab 4: Resources & File Manager */}
      {activeSubTab === 'resources' && (
        <TeacherFileManager />
      )}

      {/* Subtab 5: YouTube Video Lessons */}
      {activeSubTab === 'youtube' && (
        <TeacherYouTubeManager />
      )}
    </div>
  );
};
