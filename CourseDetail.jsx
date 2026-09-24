import React, { useState, useEffect } from 'react';
import { ArrowLeft, DownloadCloud, PlayCircle, CheckCircle2, Lock, Clock, Layers, Star } from 'lucide-react';
import { DownloadModal } from './DownloadModal.jsx';
import { LessonViewer } from './LessonViewer.jsx';

export const CourseDetail = ({ course, onBack, onActiveContextChange }) => {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [courseData, setCourseData] = useState(course);

  useEffect(() => {
    if (course?.id) {
      fetch(`/api/courses/${course.id}`)
        .then(res => res.json())
        .then(fullCourse => {
          if (fullCourse && Array.isArray(fullCourse.modules) && fullCourse.modules.length > 0) {
            setCourseData(fullCourse);
          }
        })
        .catch(() => {});
    }
  }, [course?.id]);

  if (selectedLesson) {
    return (
      <LessonViewer
        course={courseData}
        lesson={selectedLesson}
        onActiveContextChange={onActiveContextChange}
        onBack={() => {
          setSelectedLesson(null);
          if (onActiveContextChange) {
            onActiveContextChange({
              courseTitle: courseData.title,
              courseId: courseData.id
            });
          }
        }}
        onLessonCompleted={(lessonId) => {
          // Update local state
          const updated = { ...courseData };
          if (updated.modules) {
            for (const mod of updated.modules) {
              const l = mod.lessons?.find(x => x.id === lessonId);
              if (l) l.status = 'completed';
            }
          }
          setCourseData(updated);
        }}
      />
    );
  }

  const modules = courseData.modules || [
    {
      id: "mod-default-1",
      title: "Module 1: Foundations & Architecture",
      lessons: [
        { id: "les-def-1", title: "Introduction & Environment Setup", durationMins: 20, status: "completed", summary: "Compiler and IDE setup, running your first program." },
        { id: "les-def-2", title: "Syntax, Data Types & Operators", durationMins: 25, status: "completed", summary: "Primitive types, typecasting, expressions." }
      ]
    },
    {
      id: "mod-default-2",
      title: "Module 2: Practical Implementation",
      lessons: [
        { id: "les-def-3", title: "Modular Architecture & Problem Solving", durationMins: 30, status: "in_progress", summary: "Breaking down complex specifications into deterministic components." }
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top back button */}
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: '500' }}
      >
        <ArrowLeft size={16} /> All Courses
      </button>

      {/* Course Hero Card */}
      <div className="content-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="badge-pill">{courseData.category}</span>
              <span className="badge-pill" style={{ color: 'var(--accent-sage)', background: 'var(--accent-sage-light)' }}>
                {courseData.difficulty}
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {courseData.title}
            </h1>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '680px' }}>
              {courseData.description}
            </p>

            <div style={{ display: 'flex', gap: '16px', marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {courseData.durationHours} Hours Total
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={14} /> {modules.length} Modules
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706' }}>
                <Star size={14} fill="#D97706" /> {courseData.rating || 4.8}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px' }}>
            <button className="btn-primary" onClick={() => setIsDownloadModalOpen(true)} style={{ justifyContent: 'center' }}>
              <DownloadCloud size={16} />
              <span>Download for Offline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Syllabus Tree */}
      <div className="content-card">
        <h3 className="section-title" style={{ marginBottom: '16px' }}>Course Syllabus & Modules</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {modules.map((mod, modIdx) => (
            <div key={mod.id || modIdx} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px 16px', fontWeight: '700', fontSize: '0.92rem' }}>
                {mod.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(mod.lessons || []).map((les, lesIdx) => {
                  const isCompleted = les.status === 'completed';
                  return (
                    <div
                      key={les.id || lesIdx}
                      style={{
                        padding: '12px 16px',
                        borderTop: lesIdx > 0 ? '1px solid var(--border-subtle)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background 0.1s ease'
                      }}
                      onClick={() => setSelectedLesson(les)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isCompleted ? (
                          <CheckCircle2 size={18} color="var(--accent-sage)" />
                        ) : (
                          <PlayCircle size={18} color="var(--accent-primary)" />
                        )}
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: '600' }}>{les.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{les.durationMins || 25} mins • Offline Cached</div>
                        </div>
                      </div>

                      <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                        {isCompleted ? 'Review' : 'Start Lesson'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isDownloadModalOpen && (
        <DownloadModal
          course={courseData}
          onClose={() => setIsDownloadModalOpen(false)}
          onDownloadComplete={() => {}}
        />
      )}
    </div>
  );
};
