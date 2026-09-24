import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Volume2,
  Video,
  FileText,
  DownloadCloud,
  Sparkles,
  Play,
  BookOpen,
  AlertCircle,
  WifiOff,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useDataSaver } from '../../context/DataSaverContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { syncEngine } from '../../services/syncEngine.js';
import { LessonNotebookModal } from './LessonNotebookModal.jsx';

export const LessonViewer = ({ course, lesson, onBack, onLessonCompleted, onActiveContextChange }) => {
  const { isEffectiveOnline } = useNetwork();
  const { isLowData } = useDataSaver();
  const { getAuthHeaders } = useAuth();

  // Media tabs: 'notes' | 'audio' | 'video' | 'youtube'
  const [activeMediaTab, setActiveMediaTab] = useState(isLowData ? 'notes' : 'youtube');
  const [videoQuality, setVideoQuality] = useState('144p');
  const [isCompleting, setIsCompleting] = useState(false);
  const [completedState, setCompletedState] = useState(lesson.status === 'completed');

  // YouTube learning states
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isMarkingWatched, setIsMarkingWatched] = useState(false);
  const [videoWatchedState, setVideoWatchedState] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  // Fetch approved & active YouTube learning videos for this lesson
  useEffect(() => {
    if (course?.id && lesson?.id) {
      setIsLoadingVideos(true);
      fetch(`/api/courses/${course.id}/lessons/${lesson.id}/youtube-videos`, {
        headers: getAuthHeaders()
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.videos)) {
            setYoutubeVideos(data.videos);
            if (data.videos.length > 0) {
              const primary = data.videos[0];
              setSelectedVideo(primary);
              setVideoWatchedState(primary.progress?.status === 'watched');
            }
          }
        })
        .catch(err => console.error('Error loading YouTube videos:', err))
        .finally(() => setIsLoadingVideos(false));
    }
  }, [course?.id, lesson?.id]);

  // Update active video context for the floating AI assistant
  useEffect(() => {
    if (onActiveContextChange) {
      onActiveContextChange({
        courseTitle: course?.title || '',
        courseId: course?.id || '',
        lessonTitle: lesson?.title || '',
        lessonId: lesson?.id || '',
        activeMediaTab,
        videoTitle: selectedVideo?.title || '',
        youtubeVideoId: selectedVideo?.youtubeVideoId || ''
      });
    }
  }, [course?.title, lesson?.title, activeMediaTab, selectedVideo]);

  // Handle Mark as Watched
  const handleMarkVideoWatched = async () => {
    if (!selectedVideo) return;
    setIsMarkingWatched(true);

    try {
      if (isEffectiveOnline) {
        const res = await fetch(`/api/courses/${course.id}/lessons/${lesson.id}/youtube-progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            youtubeVideoId: selectedVideo.youtubeVideoId,
            status: 'watched',
            progressPercentage: 100
          })
        });
        await res.json();
      }

      setVideoWatchedState(true);
      setCompletedState(true);
      if (onLessonCompleted) onLessonCompleted(lesson.id);
    } catch (err) {
      console.error('Error updating video watch progress:', err);
    } finally {
      setIsMarkingWatched(false);
    }
  };

  // Handle Complete Lesson Overall
  const handleCompleteLesson = async () => {
    setIsCompleting(true);

    try {
      if (isEffectiveOnline) {
        const res = await fetch(`/api/courses/${course.id}/lesson-complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            lessonId: lesson.id,
            durationMinutes: lesson.durationMins || 25
          })
        });
        await res.json();
      } else {
        await syncEngine.queueActivity('lesson_completed', {
          courseId: course.id,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          durationMinutes: lesson.durationMins || 25
        });
      }

      setCompletedState(true);
      setIsCompleting(false);
      if (onLessonCompleted) onLessonCompleted(lesson.id);
    } catch (err) {
      console.error('Error completing lesson:', err);
      setCompletedState(true);
      setIsCompleting(false);
      if (onLessonCompleted) onLessonCompleted(lesson.id);
    }
  };

  const otherVideos = youtubeVideos.filter(v => selectedVideo && v.id !== selectedVideo.id);

  return (
    <div className="content-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Back button & Lesson header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back to Course Syllabus
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isEffectiveOnline && (
            <span className="data-saver-tag">
              ⚡ Offline Mode (Cached Lesson)
            </span>
          )}
          {completedState ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-sage)', fontWeight: '700', fontSize: '0.84rem' }}>
              <CheckCircle2 size={16} /> Completed
            </span>
          ) : (
            <button className="btn-sage" onClick={handleCompleteLesson} disabled={isCompleting}>
              <CheckCircle2 size={16} />
              <span>{isCompleting ? 'Saving...' : 'Mark Lesson Completed'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Lesson Meta */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase' }}>
          {course.title} • {lesson.durationMins || 25} Mins
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '800', marginTop: '4px' }}>
          {lesson.title}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {lesson.summary || "Comprehensive walkthrough covering core concepts, memory models, and syntax best practices."}
        </p>
      </div>

      {/* Media Format Selector with Data Usage Indicators */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-subtle)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {/* 1. Text & Notes */}
          <button
            id="tab-lesson-notes"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: activeMediaTab === 'notes' ? '700' : '500',
              background: activeMediaTab === 'notes' ? '#fff' : 'transparent',
              color: activeMediaTab === 'notes' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: activeMediaTab === 'notes' ? '1px solid var(--border-subtle)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveMediaTab('notes')}
          >
            <FileText size={14} />
            <span>Text &amp; Notes</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-sage)', fontWeight: '600' }}>(Very Low: 45 KB)</span>
          </button>

          {/* 2. Audio Explainer */}
          <button
            id="tab-lesson-audio"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: activeMediaTab === 'audio' ? '700' : '500',
              background: activeMediaTab === 'audio' ? '#fff' : 'transparent',
              color: activeMediaTab === 'audio' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: activeMediaTab === 'audio' ? '1px solid var(--border-subtle)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveMediaTab('audio')}
          >
            <Volume2 size={14} />
            <span>Audio Explainer</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-navy)', fontWeight: '600' }}>(Low Data: 650 KB)</span>
          </button>

          {/* 3. Compressed Video */}
          <button
            id="tab-lesson-video"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: activeMediaTab === 'video' ? '700' : '500',
              background: activeMediaTab === 'video' ? '#fff' : 'transparent',
              color: activeMediaTab === 'video' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: activeMediaTab === 'video' ? '1px solid var(--border-subtle)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveMediaTab('video')}
          >
            <Video size={14} />
            <span>Compressed Video</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Medium / Low)</span>
          </button>

          {/* 4. YouTube Video Tab */}
          <button
            id="tab-lesson-youtube"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: activeMediaTab === 'youtube' ? '700' : '500',
              background: activeMediaTab === 'youtube' ? '#fff' : 'transparent',
              color: activeMediaTab === 'youtube' ? '#DC2626' : 'var(--text-secondary)',
              border: activeMediaTab === 'youtube' ? '1px solid #FCA5A5' : 'none',
              cursor: 'pointer',
              boxShadow: activeMediaTab === 'youtube' ? '0 1px 4px rgba(220, 38, 38, 0.12)' : 'none'
            }}
            onClick={() => setActiveMediaTab('youtube')}
          >
            <Play size={13} fill={activeMediaTab === 'youtube' ? '#DC2626' : 'currentColor'} />
            <span style={{ fontWeight: '700' }}>▶ YouTube Video</span>
            <span style={{ fontSize: '0.7rem', color: '#DC2626', opacity: 0.85 }}>(Higher Data Usage)</span>
          </button>
        </div>

        {activeMediaTab === 'video' && (
          <div style={{ display: 'flex', gap: '4px', fontSize: '0.74rem' }}>
            {['144p', '240p', '360p'].map(q => (
              <button
                key={q}
                onClick={() => setVideoQuality(q)}
                style={{
                  padding: '2px 8px',
                  borderRadius: '3px',
                  fontWeight: videoQuality === q ? '700' : '400',
                  background: videoQuality === q ? 'var(--accent-primary)' : 'transparent',
                  color: videoQuality === q ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          MEDIA DISPLAY SECTION
          ========================================================================= */}

      {/* 1. AUDIO EXPLAINER */}
      {activeMediaTab === 'audio' && (
        <div style={{ padding: '16px', background: 'var(--accent-navy-light)', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Volume2 size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Instructor Voice Explainer — Audio-Only Mode</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Low-bandwidth streaming (32 kbps mono optimized for 2G network)</div>
            <div style={{ marginTop: '8px', height: '6px', background: '#DCE7F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '45%', height: '100%', background: 'var(--accent-navy)' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--accent-navy)' }}>08:14 / 18:30</div>
        </div>
      )}

      {/* 2. COMPRESSED VIDEO */}
      {activeMediaTab === 'video' && (
        <div style={{ background: '#1E2022', borderRadius: 'var(--radius-md)', padding: '40px 20px', textAlign: 'center', color: '#fff', marginBottom: '24px' }}>
          <Video size={48} style={{ opacity: 0.5, margin: '0 auto 12px' }} />
          <div style={{ fontWeight: '600', fontSize: '1.05rem' }}>Adaptive Video Stream ({videoQuality} Quality)</div>
          <div style={{ fontSize: '0.78rem', color: '#A0AEC0', marginTop: '4px' }}>
            Data consumption: ~3.2 MB for entire lesson • Auto-buffered for offline playback
          </div>
        </div>
      )}

      {/* 3. YOUTUBE LEARNING SECTION */}
      {activeMediaTab === 'youtube' && (
        <div style={{ marginBottom: '28px' }}>
          {/* Offline Guard */}
          {!isEffectiveOnline ? (
            <div
              style={{
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                borderRadius: 'var(--radius-md)',
                padding: '30px 20px',
                textAlign: 'center'
              }}
            >
              <WifiOff size={40} color="#C2410C" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#9A3412', margin: '0 0 6px' }}>
                YouTube video requires an internet connection
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#9A3412', maxWidth: '520px', margin: '0 auto 18px', lineHeight: '1.5' }}>
                You are currently in offline mode. To save mobile data or continue learning without internet, please switch to downloaded notes or the cached audio explainer.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  onClick={() => setActiveMediaTab('notes')}
                  style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                >
                  <FileText size={15} /> Open Text &amp; Notes
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setActiveMediaTab('audio')}
                  style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                >
                  <Volume2 size={15} /> Use Audio Explainer
                </button>
              </div>
            </div>
          ) : isLoadingVideos ? (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Loading recommended YouTube explanations...</div>
            </div>
          ) : selectedVideo ? (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Low-Bandwidth Alert */}
              {isLowData && (
                <div
                  style={{
                    background: 'var(--accent-primary-light)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    color: '#1E40AF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '14px'
                  }}
                >
                  <AlertCircle size={14} color="#3B82F6" />
                  <span>Low Data Mode: Streaming video consumes more data. Audio Explainer or Text &amp; Notes provide full coverage at ~90% lower bandwidth.</span>
                </div>
              )}

              {/* Subheader & AI Notebook Trigger */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge-pill" style={{ background: '#FEE2E2', color: '#DC2626', fontWeight: '700' }}>
                    ▶ YouTube Learning Video
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Learn this topic visually
                  </span>
                </div>

                <button
                  id="open-lesson-notebook-btn"
                  onClick={() => setIsNotebookOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    background: 'var(--accent-primary-light)',
                    color: 'var(--accent-primary)',
                    border: '1px solid rgba(217, 107, 67, 0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <BookOpen size={14} />
                  <span>Open AI Notebook</span>
                </button>
              </div>

              {/* Responsive 16:9 Official YouTube Player */}
              <div
                style={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: '12px',
                  background: '#0F172A',
                  marginBottom: '14px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
                }}
              >
                <iframe
                  id="youtube-lesson-player"
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeVideoId}?rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>

              {/* Video Meta & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Recommended for this lesson
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    {selectedVideo.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>Channel: <strong>{selectedVideo.channelName}</strong></span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={12} /> {selectedVideo.duration}</span>
                    <span>•</span>
                    <span>Topic: <strong>{selectedVideo.topic}</strong></span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                    {selectedVideo.description}
                  </p>
                </div>

                {/* Progress Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  {videoWatchedState ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: '#DCFCE7',
                        color: '#166534',
                        fontWeight: '700',
                        fontSize: '0.84rem'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Watched ✓</span>
                    </div>
                  ) : (
                    <button
                      id="mark-youtube-watched-btn"
                      className="btn-sage"
                      onClick={handleMarkVideoWatched}
                      disabled={isMarkingWatched}
                      style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                    >
                      <Check size={16} />
                      <span>{isMarkingWatched ? 'Recording...' : 'Mark as Watched'}</span>
                    </button>
                  )}
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Updates your course progress
                  </span>
                </div>
              </div>

              {/* Multiple Videos Section ("More explanations") */}
              {otherVideos.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} />
                    <span>More Explanations for this Topic</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    {otherVideos.map((vid) => (
                      <div
                        key={vid.id}
                        onClick={() => {
                          setSelectedVideo(vid);
                          setVideoWatchedState(vid.progress?.status === 'watched');
                        }}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface-subtle)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                      >
                        <div style={{ position: 'relative', width: '70px', height: '46px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, background: '#000' }}>
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{ position: 'absolute', bottom: '2px', right: '3px', background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: '0.62rem', padding: '1px 3px', borderRadius: '2px', fontWeight: '600' }}>
                            {vid.duration}
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {vid.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {vid.channelName} • {vid.topic}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State: No approved video */
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '36px 20px',
                textAlign: 'center'
              }}
            >
              <Video size={40} color="var(--text-muted)" style={{ margin: '0 auto 10px', opacity: 0.6 }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
                No video has been added for this lesson yet.
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 16px', lineHeight: '1.5' }}>
                Our faculty team regularly adds verified educational videos. In the meantime, try the Text &amp; Notes or Audio Explainer below.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button className="btn-primary" onClick={() => setActiveMediaTab('notes')} style={{ fontSize: '0.82rem', padding: '7px 16px' }}>
                  <FileText size={14} /> Open Text &amp; Notes
                </button>
                <button className="btn-secondary" onClick={() => setActiveMediaTab('audio')} style={{ fontSize: '0.82rem', padding: '7px 16px' }}>
                  <Volume2 size={14} /> Audio Explainer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          LESSON TEXT, CODE EXAMPLES & CURRICULUM (Always below media)
          ========================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.7', fontSize: '0.92rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            1. Core Concept Overview
          </h3>
          <p>
            In procedural programming and system architecture, understanding memory addressing is the foundation of high-performance software. When a variable is declared, the operating system allocates a contiguous block of bytes in either the <strong>Stack frame</strong> or the <strong>Heap</strong>.
          </p>
        </div>

        {/* Code Snippet Box */}
        <div style={{ background: '#1E2022', color: '#E2E8F0', padding: '16px 20px', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', overflowX: 'auto' }}>
          <div style={{ color: '#718096', marginBottom: '8px', fontSize: '0.75rem' }}>// Example: Variable Declaration, Memory Address &amp; Value Inspection</div>
          <span style={{ color: '#90CDF4' }}>#include</span> <span style={{ color: '#68D391' }}>&lt;stdio.h&gt;</span>{'\n'}
          <span style={{ color: '#90CDF4' }}>int</span> <span style={{ color: '#FAF089' }}>main</span>() {'{'}{'\n'}
          {'    '}<span style={{ color: '#90CDF4' }}>int</span> target = <span style={{ color: '#F6AD55' }}>42</span>;{'\n'}
          {'    '}<span style={{ color: '#90CDF4' }}>int</span> *ptr = &amp;target; <span style={{ color: '#718096' }}>// Stores memory address</span>{'\n\n'}
          {'    '}printf(<span style={{ color: '#68D391' }}>"Value: %d\n"</span>, *ptr); <span style={{ color: '#718096' }}>// Dereference operator *</span>{'\n'}
          {'    '}printf(<span style={{ color: '#68D391' }}>"Memory Address: %p\n"</span>, (<span style={{ color: '#90CDF4' }}>void</span>*)ptr);{'\n'}
          {'    '}<span style={{ color: '#90CDF4' }}>return</span> <span style={{ color: '#F6AD55' }}>0</span>;{'\n'}
          {'}'}
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            2. Common Pitfalls &amp; Diagnostics
          </h3>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Uninitialized Variables:</strong> In C, uninitialized local stack variables contain indeterminate garbage memory values.</li>
            <li><strong>Type Overflow:</strong> Exceeding integer bounds (e.g. <code>INT_MAX</code>) causes silent wraparound or undefined behavior.</li>
            <li><strong>Format Specifier Mismatch:</strong> Passing an integer to <code>%f</code> or a pointer to <code>%d</code> leads to stack misalignment.</li>
          </ul>
        </div>
      </div>

      {/* Footer Complete Action */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '32px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Return to Syllabus
        </button>

        {completedState ? (
          <span style={{ color: 'var(--accent-sage)', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={18} /> Lesson Finished
          </span>
        ) : (
          <button className="btn-primary" onClick={handleCompleteLesson} disabled={isCompleting}>
            <CheckCircle2 size={16} />
            <span>{isCompleting ? 'Updating...' : 'Finish & Record Lesson'}</span>
          </button>
        )}
      </div>

      {/* Integrated AI Notebook Creator Modal */}
      <LessonNotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        courseId={course?.id}
        courseTitle={course?.title}
        lessonId={lesson?.id}
        lessonTitle={lesson?.title}
        youtubeVideoId={selectedVideo?.youtubeVideoId}
        videoTitle={selectedVideo?.title}
      />
    </div>
  );
};
