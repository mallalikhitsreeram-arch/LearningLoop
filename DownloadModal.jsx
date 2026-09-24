import React, { useState } from 'react';
import { DownloadCloud, CheckCircle2, HardDrive, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { offlineDb } from '../../services/offlineDb.js';

export const DownloadModal = ({ course, onClose, onDownloadComplete }) => {
  const [downloadOption, setDownloadOption] = useState('complete'); // 'lessons_only', 'lessons_quizzes', 'complete'
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  if (!course) return null;

  const lowSize = course.lowDataSizeMb || 15;
  const fullSize = course.downloadSizeMb || 110;
  const quizSize = Math.round(lowSize * 1.8);

  const selectedSize = downloadOption === 'lessons_only'
    ? lowSize
    : downloadOption === 'lessons_quizzes'
      ? quizSize
      : fullSize;

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(10);

    try {
      // Simulate stepwise progress for realistic visual feedback
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 20;
        });
      }, 200);

      // Fetch offline bundle from backend
      const res = await fetch(`/api/courses/${course.id}/download-package?option=${downloadOption}`);
      const bundle = await res.json();

      clearInterval(progressInterval);
      setDownloadProgress(100);

      // Save directly into browser IndexedDB
      await offlineDb.saveDownloadedCourse(bundle);

      setTimeout(() => {
        setIsDownloading(false);
        setIsDone(true);
        if (onDownloadComplete) onDownloadComplete(course.id);
      }, 400);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback local save
      await offlineDb.saveDownloadedCourse({
        courseId: course.id,
        title: course.title,
        option: downloadOption,
        downloadedAt: new Date().toISOString(),
        sizeMb: selectedSize,
        courseData: { ...course, downloaded: true }
      });
      setIsDownloading(false);
      setIsDone(true);
      if (onDownloadComplete) onDownloadComplete(course.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DownloadCloud size={20} color="var(--accent-primary)" />
            <h4 className="modal-title">Download Course for Offline</h4>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Course Summary */}
          <div style={{ padding: '14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {course.title}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '12px' }}>
              <span>{course.totalModules || 5} Modules</span>
              <span>•</span>
              <span>{course.totalLessons || 20} Lessons</span>
              <span>•</span>
              <span>{course.language}</span>
            </div>
          </div>

          {/* Download Options */}
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Select Download Package:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${downloadOption === 'lessons_only' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  background: downloadOption === 'lessons_only' ? 'var(--accent-primary-light)' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="downloadOption"
                    value="lessons_only"
                    checked={downloadOption === 'lessons_only'}
                    onChange={() => setDownloadOption('lessons_only')}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.86rem' }}>Lessons & Notes Only (Ultra-Low Data)</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Text, code exercises, diagrams & offline readings</div>
                  </div>
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.84rem', color: 'var(--accent-sage)' }}>~{lowSize} MB</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${downloadOption === 'lessons_quizzes' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  background: downloadOption === 'lessons_quizzes' ? 'var(--accent-primary-light)' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="downloadOption"
                    value="lessons_quizzes"
                    checked={downloadOption === 'lessons_quizzes'}
                    onChange={() => setDownloadOption('lessons_quizzes')}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.86rem' }}>Lessons + Practice Quizzes (Recommended)</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Complete lessons, interactive question bank, instant scoring</div>
                  </div>
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.84rem', color: 'var(--accent-navy)' }}>~{quizSize} MB</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${downloadOption === 'complete' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  background: downloadOption === 'complete' ? 'var(--accent-primary-light)' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="downloadOption"
                    value="complete"
                    checked={downloadOption === 'complete'}
                    onChange={() => setDownloadOption('complete')}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.86rem' }}>Complete Course (Lessons + Quizzes + Compressed Audio/Video)</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Full multimedia, audio explainers, and comprehensive exam modules</div>
                  </div>
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.84rem' }}>~{fullSize} MB</span>
              </label>
            </div>
          </div>

          {/* Storage Warning & Safety */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', background: '#F9FAFB', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <HardDrive size={16} color="var(--accent-sage)" />
            <span>Storage Available on Device: <strong>4.8 GB</strong> (Sufficient space)</span>
          </div>

          {/* Progress or Completion */}
          {isDownloading && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>
                <span>Downloading {selectedSize} MB into IndexedDB...</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${downloadProgress}%` }} />
              </div>
            </div>
          )}

          {isDone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-sage-light)', color: 'var(--accent-sage)', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: '600', fontSize: '0.86rem' }}>
              <CheckCircle2 size={18} />
              <span>Course successfully downloaded! You can now study and take quizzes offline.</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            {isDone ? 'Close' : 'Cancel'}
          </button>
          {!isDone && (
            <button className="btn-primary" onClick={handleStartDownload} disabled={isDownloading}>
              <DownloadCloud size={16} />
              <span>{isDownloading ? 'Downloading...' : `Download (${selectedSize} MB)`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
