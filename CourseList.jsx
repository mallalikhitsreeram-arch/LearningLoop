import React, { useState, useEffect } from 'react';
import { BookOpen, DownloadCloud, CheckCircle2, Star, Clock, Layers } from 'lucide-react';
import { DownloadModal } from './DownloadModal.jsx';
import { offlineDb } from '../../services/offlineDb.js';

export const CourseList = ({ onSelectCourse, initialFilter = 'all' }) => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState(initialFilter); // 'all', 'enrolled', 'downloaded'
  const [downloadModalCourse, setDownloadModalCourse] = useState(null);
  const [downloadedCourseIds, setDownloadedCourseIds] = useState(new Set(['crs-c-lang']));

  useEffect(() => {
    if (initialFilter) setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch(() => {});

    // Check IndexedDB for downloaded courses
    offlineDb.getAllDownloadedCourses().then(list => {
      const ids = new Set(list.map(b => b.courseId));
      ids.add('crs-c-lang'); // Default demo downloaded course
      setDownloadedCourseIds(ids);
    });
  }, []);

  const handleDownloadCompleted = (courseId) => {
    setDownloadedCourseIds(prev => new Set([...prev, courseId]));
  };

  const filteredCourses = courses.filter(c => {
    if (filter === 'enrolled') return c.enrolled;
    if (filter === 'downloaded') return downloadedCourseIds.has(c.id);
    return true;
  });

  return (
    <div>
      {/* Header & Filters */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '700' }}>
            Explore Courses & Curricula
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            High quality, low-bandwidth optimized technical courses available online and offline.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface-subtle)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: filter === 'all' ? '700' : '500',
              background: filter === 'all' ? '#fff' : 'transparent',
              color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: filter === 'all' ? 'var(--shadow-sm)' : 'none'
            }}
            onClick={() => setFilter('all')}
          >
            All Courses ({courses.length})
          </button>
          <button
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: filter === 'enrolled' ? '700' : '500',
              background: filter === 'enrolled' ? '#fff' : 'transparent',
              color: filter === 'enrolled' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: filter === 'enrolled' ? 'var(--shadow-sm)' : 'none'
            }}
            onClick={() => setFilter('enrolled')}
          >
            Active & Enrolled
          </button>
          <button
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: filter === 'downloaded' ? '700' : '500',
              background: filter === 'downloaded' ? '#fff' : 'transparent',
              color: filter === 'downloaded' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: filter === 'downloaded' ? 'var(--shadow-sm)' : 'none'
            }}
            onClick={() => setFilter('downloaded')}
          >
            📥 Downloaded / Offline Ready
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="courses-grid">
        {filteredCourses.map((course) => {
          const isDownloaded = downloadedCourseIds.has(course.id);
          return (
            <div className="course-card" key={course.id}>
              <div className="course-card-top">
                <div className="course-badge-row">
                  <span className="badge-pill">{course.category}</span>
                  {isDownloaded && (
                    <span className="badge-pill badge-offline-ready">
                      <CheckCircle2 size={12} /> Offline Ready
                    </span>
                  )}
                </div>

                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>

                <div className="course-meta-row" style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={13} />
                    <span>{course.totalModules || 5} Modules</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    <span>{course.durationHours}h</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706' }}>
                    <Star size={13} fill="#D97706" />
                    <span>{course.rating || 4.8}</span>
                  </div>
                </div>

                {course.enrolled && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: '600', marginBottom: '4px' }}>
                      <span>Course Progress</span>
                      <span>{course.progressPercent || 0}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${course.progressPercent || 0}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', justifyContent: 'center' }}
                  onClick={() => onSelectCourse(course)}
                >
                  <BookOpen size={14} />
                  <span>{course.progressPercent === 100 ? 'Review Course' : (course.enrolled ? 'Continue' : 'Start Course')}</span>
                </button>

                <button
                  className="btn-secondary"
                  title="Download for offline access"
                  style={{ padding: '8px 12px' }}
                  onClick={() => setDownloadModalCourse(course)}
                >
                  <DownloadCloud size={15} color={isDownloaded ? "var(--accent-sage)" : "var(--text-secondary)"} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {downloadModalCourse && (
        <DownloadModal
          course={downloadModalCourse}
          onClose={() => setDownloadModalCourse(null)}
          onDownloadComplete={handleDownloadCompleted}
        />
      )}
    </div>
  );
};
