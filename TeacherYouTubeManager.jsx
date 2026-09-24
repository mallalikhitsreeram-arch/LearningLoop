import React, { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Layers,
  X,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  Globe,
  Sliders,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

// Fallback course lesson mapping in case network is disconnected
const FALLBACK_COURSE_LESSONS = [
  {
    courseId: 'crs-c-lang',
    courseTitle: 'C Programming',
    topics: ['Variables & Data Types', 'Control Structures & Loops', 'Functions & Scope', 'Pointers & Memory Allocation', 'File I/O & Structs'],
    lessons: [
      { id: 'les-c-1', title: 'C Syntax, Compilers & Structure' },
      { id: 'les-c-2', title: 'Variables, Constants & Data Types' },
      { id: 'les-c-3', title: 'Conditional Statements (if-else, switch)' },
      { id: 'les-c-4', title: 'For, While & Do-While Loops' },
      { id: 'les-c-5', title: 'Function Prototypes & Call by Value' },
      { id: 'les-c-6', title: 'Recursion & Call Stack Dynamics' },
      { id: 'les-c-7', title: 'Understanding Memory Addresses & Dereferencing' },
      { id: 'les-c-8', title: 'Dynamic Memory: malloc, calloc, realloc & free' },
      { id: 'les-c-9', title: 'User Defined Data Types: struct & typedef' },
      { id: 'les-c-10', title: 'File Operations (fopen, fread, fwrite, fclose)' }
    ]
  },
  {
    courseId: 'crs-python',
    courseTitle: 'Python Fundamentals & Scripting',
    topics: ['Syntax & Types', 'Data Structures', 'Functions & Lambdas', 'Modules & Packages'],
    lessons: [
      { id: 'les-py-1', title: 'Python Variables, Constants & Data Types' },
      { id: 'les-py-2', title: 'Conditionals, Boolean Logic & Nested Branching' },
      { id: 'les-py-3', title: 'Python Loops for Beginners' },
      { id: 'les-py-4', title: 'Functions & Scope Dynamics' }
    ]
  },
  {
    courseId: 'crs-ai',
    courseTitle: 'Introduction to Artificial Intelligence',
    topics: ['Search & Heuristics', 'Supervised vs Unsupervised ML', 'Neural Network Basics', 'Natural Language Processing'],
    lessons: [
      { id: 'les-ai-1', title: 'Introduction to Machine Learning' },
      { id: 'les-ai-2', title: 'Linear Regression Explained' },
      { id: 'les-ai-3', title: 'Logistic Regression & Classification' },
      { id: 'les-ai-4', title: 'Model Evaluation & Confusion Matrix' }
    ]
  }
];

export function extractYouTubeId(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : '';
}

export const TeacherYouTubeManager = () => {
  const { currentUser, getAuthHeaders } = useAuth();

  const [videos, setVideos] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Preview Modal state for clicking Preview in list
  const [previewModalVideo, setPreviewModalVideo] = useState(null);

  // Add / Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [formData, setFormData] = useState({
    courseId: 'crs-c-lang',
    lessonId: 'les-c-2',
    youtubeUrl: '',
    title: '',
    topic: 'Variables & Data Types',
    description: '',
    difficulty: 'Beginner',
    language: 'English',
    visibility: 'Assigned Students',
    channelTitle: '',
    duration: '15m',
    isPrimary: false
  });
  const [previewId, setPreviewId] = useState('');

  // Fetch courses dynamically from database
  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const parsed = data.map(c => ({
            courseId: c.id,
            courseTitle: c.title,
            topics: c.topics || [],
            lessons: (c.modules || []).flatMap(m => m.lessons || []).map(l => ({
              id: l.id,
              title: l.title,
              summary: l.summary || ''
            }))
          }));
          setCoursesData(parsed);
        } else {
          setCoursesData(FALLBACK_COURSE_LESSONS);
        }
      })
      .catch(() => {
        setCoursesData(FALLBACK_COURSE_LESSONS);
      });
  }, []);

  const activeCourses = coursesData.length > 0 ? coursesData : FALLBACK_COURSE_LESSONS;

  const fetchVideos = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/teacher/youtube-videos', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to load video lessons.');
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with video service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Update preview ID whenever URL changes
  useEffect(() => {
    const id = extractYouTubeId(formData.youtubeUrl);
    setPreviewId(id);
  }, [formData.youtubeUrl]);

  const handleOpenAdd = () => {
    const firstCourse = activeCourses.find(c => c.courseId === 'crs-c-lang') || activeCourses[0];
    const firstLesson = firstCourse?.lessons.find(l => l.id === 'les-c-2') || firstCourse?.lessons[0];
    const firstTopic = firstCourse?.topics?.[0] || 'Variables & Data Types';

    setEditingVideoId(null);
    setFormData({
      courseId: firstCourse?.courseId || 'crs-c-lang',
      lessonId: firstLesson?.id || 'les-c-2',
      youtubeUrl: '',
      title: '',
      topic: firstTopic,
      description: '',
      difficulty: 'Beginner',
      language: 'English',
      visibility: 'Assigned Students',
      channelTitle: currentUser?.name || 'Faculty Instructor',
      duration: '15m',
      isPrimary: false
    });
    setPreviewId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVideoId(v.id);
    setFormData({
      courseId: v.courseId || 'crs-c-lang',
      lessonId: v.lessonId || 'les-c-2',
      youtubeUrl: v.youtubeUrl || (v.youtubeVideoId ? `https://www.youtube.com/watch?v=${v.youtubeVideoId}` : ''),
      title: v.title || '',
      topic: v.topic || '',
      description: v.description || '',
      difficulty: v.difficulty || 'Beginner',
      language: v.language || 'English',
      visibility: v.visibility || 'Assigned Students',
      channelTitle: v.channelTitle || v.channelName || '',
      duration: v.duration || '15m',
      isPrimary: Boolean(v.isPrimary)
    });
    setPreviewId(v.youtubeVideoId || extractYouTubeId(v.youtubeUrl));
    setIsModalOpen(true);
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!previewId) {
      alert('Please enter a valid YouTube video URL or 11-character video ID.');
      return;
    }

    try {
      const url = editingVideoId
        ? `/api/teacher/youtube-videos/${editingVideoId}`
        : '/api/teacher/youtube-videos';
      const method = editingVideoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          ...formData,
          youtubeVideoId: previewId,
          youtubeUrl: formData.youtubeUrl,
          videoUrl: `https://www.youtube.com/watch?v=${previewId}`
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to save video resource.');
      }

      setSuccessMsg(editingVideoId ? 'Video resource updated successfully!' : 'Video submitted successfully for student use!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsModalOpen(false);
      fetchVideos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteVideo = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove video: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/teacher/youtube-videos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete video.');
      }
      setSuccessMsg('Video resource removed successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchVideos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (v) => {
    try {
      const res = await fetch(`/api/teacher/youtube-videos/${v.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          isActive: !v.isActive
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle status.');
      }
      fetchVideos();
    } catch (err) {
      alert(err.message);
    }
  };

  // Selected course's available lessons for dynamic dropdown
  const currentCourseObj = activeCourses.find(c => c.courseId === formData.courseId) || activeCourses[0];
  const currentCourseLessons = currentCourseObj?.lessons || [];
  const currentLessonObj = currentCourseLessons.find(l => l.id === formData.lessonId) || currentCourseLessons[0];

  // Topics derived from course + lesson
  const availableTopics = [
    ...(currentCourseObj?.topics || []),
    ...(currentLessonObj?.title ? [currentLessonObj.title] : [])
  ];
  const uniqueTopics = [...new Set(availableTopics.filter(Boolean))];

  // Filtered list of videos based on Search, Course, and Status
  const filteredVideos = videos.filter(v => {
    const matchesCourse = courseFilter === 'all' || v.courseId === courseFilter;
    const vStatus = (v.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && (vStatus === 'published' || vStatus === 'approved')) ||
      (statusFilter === 'pending' && (vStatus === 'pending' || vStatus === 'pending_approval')) ||
      (statusFilter === 'rejected' && vStatus === 'rejected');

    const searchLower = searchFilter.toLowerCase();
    const matchesSearch =
      (v.title || '').toLowerCase().includes(searchLower) ||
      (v.courseTitle || '').toLowerCase().includes(searchLower) ||
      (v.courseId || '').toLowerCase().includes(searchLower) ||
      (v.lessonTitle || '').toLowerCase().includes(searchLower) ||
      (v.lessonId || '').toLowerCase().includes(searchLower) ||
      (v.topic || '').toLowerCase().includes(searchLower) ||
      (v.channelTitle || '').toLowerCase().includes(searchLower) ||
      (v.channelName || '').toLowerCase().includes(searchLower) ||
      (v.addedByName || '').toLowerCase().includes(searchLower) ||
      (v.status || '').toLowerCase().includes(searchLower);

    return matchesCourse && matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner with Action Button */}
      <div className="content-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Video size={20} color="var(--accent-crimson, #DC2626)" />
            <span>Course YouTube Educational Videos</span>
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Attach authentic YouTube video explanations to curriculum lessons so students can learn topics visually.
          </p>
        </div>

        <button
          id="btn-add-youtube-video"
          className="btn-primary"
          onClick={handleOpenAdd}
          style={{ background: '#DC2626', borderColor: '#DC2626' }}
        >
          <Plus size={16} />
          <span>+ Add YouTube Video</span>
        </button>
      </div>

      {/* Success / Alert Banner */}
      {successMsg && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: '600' }}>
          <CheckCircle2 size={18} color="#16A34A" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: '600' }}>
          <AlertCircle size={18} color="#DC2626" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filters Bar: Search, Course, Status */}
      <div className="content-card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            id="search-youtube-input"
            type="text"
            placeholder="Search by video title, course, lesson, topic, teacher..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.84rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            id="filter-course-select"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
          >
            <option value="all">All Courses</option>
            {activeCourses.map(c => (
              <option key={c.courseId} value={c.courseId}>{c.courseTitle}</option>
            ))}
          </select>

          <select
            id="filter-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published / Approved</option>
            <option value="pending">Pending Approval</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <button
          onClick={fetchVideos}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
          title="Refresh videos"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Videos Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '-8px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          My YouTube Resources ({filteredVideos.length})
        </h4>
      </div>

      {isLoading ? (
        <div className="content-card" style={{ textAlign: 'center', padding: '36px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-subtle)', borderTopColor: '#DC2626', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
          <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Loading attached curriculum videos...</span>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Video size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>No YouTube Videos Found</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {searchFilter || courseFilter !== 'all' || statusFilter !== 'all'
              ? 'No videos match the current filters.'
              : 'No YouTube educational videos have been added yet.'}
          </p>
          <button className="btn-primary" onClick={handleOpenAdd} style={{ marginTop: '14px', background: '#DC2626', borderColor: '#DC2626' }}>
            <Plus size={15} /> Add First Video
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredVideos.map((v) => {
            const courseObj = activeCourses.find(c => c.courseId === v.courseId);
            const lessonObj = courseObj?.lessons?.find(l => l.id === v.lessonId);
            const isPublished = ['approved', 'published', 'APPROVED', 'PUBLISHED'].includes(v.status);

            return (
              <div
                key={v.id}
                className="content-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                  border: v.isPrimary ? '1.5px solid rgba(220, 38, 38, 0.4)' : '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                {/* Thumbnail Header with Preview Click */}
                <div
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    background: '#000',
                    aspectRatio: '16/9',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPreviewModalVideo(v)}
                  title="Click to preview video"
                >
                  <img
                    src={`https://img.youtube.com/vi/${v.youtubeVideoId}/mqdefault.jpg`}
                    alt={v.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}>
                    <Play size={24} fill="#fff" />
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '6px',
                    background: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    {v.duration || '15m'}
                  </div>

                  {v.isPrimary && (
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: '#DC2626',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      Primary
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {courseObj?.courseTitle || v.courseTitle || v.courseId}
                    </div>

                    {/* Status Badge */}
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      textTransform: 'capitalize',
                      background:
                        isPublished ? '#DCFCE7' :
                        v.status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                      color:
                        isPublished ? '#166534' :
                        v.status === 'rejected' ? '#991B1B' : '#92400E'
                    }}>
                      {isPublished ? 'Published' : (v.status || 'Pending Approval')}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.3' }}>
                    {v.title}
                  </h4>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Lesson: <strong>{lessonObj?.title || v.lessonTitle || v.lessonId}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px', fontSize: '0.74rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>📺 {v.channelTitle || v.channelName}</span>
                    <span>•</span>
                    <span className="badge-pill" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>{v.topic}</span>
                    {v.difficulty && (
                      <span style={{ fontSize: '0.68rem', background: '#F1F5F9', padding: '1px 5px', borderRadius: '3px' }}>
                        {v.difficulty}
                      </span>
                    )}
                    {v.visibility && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        • {v.visibility}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Controls */}
                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Active Switch / Disable */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                    <input
                      type="checkbox"
                      checked={v.isActive !== false}
                      onChange={() => handleToggleActive(v)}
                    />
                    <span style={{ color: v.isActive !== false ? '#16A34A' : 'var(--text-muted)' }}>
                      {v.isActive !== false ? 'Active' : 'Disabled'}
                    </span>
                  </label>

                  {/* Actions: Preview, Edit, Delete */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => setPreviewModalVideo(v)}
                      style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                      title="Preview video"
                    >
                      <Eye size={13} />
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() => handleOpenEdit(v)}
                      style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                      title="Edit details"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() => handleDeleteVideo(v.id, v.title)}
                      style={{ padding: '5px 8px', fontSize: '0.72rem', color: '#DC2626' }}
                      title="Delete video"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Preview Modal */}
      {previewModalVideo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="content-card" style={{ maxWidth: '640px', width: '100%', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                  {previewModalVideo.title}
                </h3>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {previewModalVideo.channelTitle || previewModalVideo.channelName} • Topic: {previewModalVideo.topic}
                </div>
              </div>
              <button
                onClick={() => setPreviewModalVideo(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', aspectRatio: '16/9', marginBottom: '14px' }}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${previewModalVideo.youtubeVideoId}?autoplay=1&rel=0`}
                title={previewModalVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a
                href={`https://www.youtube.com/watch?v=${previewModalVideo.youtubeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                <ExternalLink size={13} /> Open on YouTube
              </a>

              <button
                className="btn-secondary"
                onClick={() => setPreviewModalVideo(null)}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="content-card" style={{ maxWidth: '660px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={20} color="#DC2626" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                  {editingVideoId ? 'Edit YouTube Educational Video' : 'Attach New YouTube Educational Video'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Course & Lesson Selection (PART 3) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Course <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    id="select-course-input"
                    value={formData.courseId}
                    onChange={(e) => {
                      const newCourseId = e.target.value;
                      const cObj = activeCourses.find(c => c.courseId === newCourseId) || activeCourses[0];
                      const firstLesson = cObj?.lessons?.[0]?.id || '';
                      const firstTopic = cObj?.topics?.[0] || '';
                      setFormData({
                        ...formData,
                        courseId: newCourseId,
                        lessonId: firstLesson,
                        topic: firstTopic
                      });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  >
                    {activeCourses.map(c => (
                      <option key={c.courseId} value={c.courseId}>{c.courseTitle}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Target Lesson <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    id="select-lesson-input"
                    value={formData.lessonId}
                    onChange={(e) => {
                      const newLessonId = e.target.value;
                      const lObj = currentCourseLessons.find(l => l.id === newLessonId);
                      setFormData({
                        ...formData,
                        lessonId: newLessonId,
                        topic: lObj?.title || formData.topic
                      });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  >
                    {currentCourseLessons.map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic Selection (PART 4) */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  Topic / Subtopic <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: uniqueTopics.length > 0 ? '1fr 1fr' : '1fr', gap: '8px' }}>
                  {uniqueTopics.length > 0 && (
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      style={{ padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                    >
                      {uniqueTopics.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="custom">Custom Topic...</option>
                    </select>
                  )}
                  <input
                    type="text"
                    required
                    placeholder="e.g. Variables & Data Types"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* YouTube URL (PART 5 & PART 6) */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  YouTube URL or Video ID <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="youtube-url-input"
                  type="text"
                  required
                  placeholder="e.g. https://www.youtube.com/watch?v=PDzKufPL51Q or PDzKufPL51Q"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
                {previewId ? (
                  <div style={{ fontSize: '0.74rem', color: '#16A34A', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Detected YouTube Video ID: <strong>{previewId}</strong>
                  </div>
                ) : formData.youtubeUrl ? (
                  <div style={{ fontSize: '0.74rem', color: '#DC2626', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={13} /> Please enter a valid YouTube video URL.
                  </div>
                ) : null}
              </div>

              {/* Video Preview Player (PART 6) */}
              {previewId && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Video Preview
                  </div>
                  <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', aspectRatio: '16/9', border: '1px solid var(--border-subtle)' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${previewId}?rel=0`}
                      title="YouTube video preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Title & Channel */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Video Title <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    id="video-title-input"
                    type="text"
                    required
                    placeholder="e.g. C Variables and Data Types Explained"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Channel / Instructor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bro Code, NeuralNine"
                    value={formData.channelTitle}
                    onChange={(e) => setFormData({ ...formData, channelTitle: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
              </div>

              {/* Difficulty, Language, Visibility (PART 2) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                  >
                    <option value="English">English</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Bilingual">Bilingual</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Visibility
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                  >
                    <option value="Assigned Students">Assigned Students</option>
                    <option value="All Students">All Students</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
              </div>

              {/* Description (PART 2) */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  Description / Key Takeaways
                </label>
                <textarea
                  rows={2}
                  placeholder="Beginner-friendly explanation of C variables and data types..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              {/* Primary Video Checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                />
                <span>Set as <strong>Primary Video</strong> (Displayed first on the lesson page)</span>
              </label>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  id="btn-save-youtube-video"
                  type="submit"
                  className="btn-primary"
                  style={{ background: '#DC2626', borderColor: '#DC2626' }}
                  disabled={!previewId}
                >
                  {editingVideoId ? 'Update Video' : 'Save Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
