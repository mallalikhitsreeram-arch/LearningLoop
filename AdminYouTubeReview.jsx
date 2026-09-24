import React, { useState, useEffect } from 'react';
import {
  Video,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Check,
  X,
  Play,
  Trash2,
  Edit2,
  Globe,
  UploadCloud
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const AdminYouTubeReview = () => {
  const { getAuthHeaders } = useAuth();

  const [videos, setVideos] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewModalVideo, setPreviewModalVideo] = useState(null);

  // Edit Modal State
  const [editModalVideo, setEditModalVideo] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    topic: '',
    description: '',
    difficulty: 'Beginner',
    language: 'English',
    visibility: 'Assigned Students',
    status: 'published',
    isActive: true
  });

  const fetchVideos = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [vRes, cRes] = await Promise.all([
        fetch('/api/admin/youtube-resources', { headers: getAuthHeaders() }),
        fetch('/api/courses')
      ]);

      if (!vRes.ok) throw new Error('Failed to load video moderation list.');
      const data = await vRes.json();
      if (data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      }

      if (cRes.ok) {
        const cData = await cRes.json();
        if (Array.isArray(cData)) setCoursesList(cData);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with administrative backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUpdateStatus = async (id, newStatus, newActive) => {
    try {
      const body = {};
      if (newStatus !== undefined) body.status = newStatus;
      if (newActive !== undefined) body.isActive = newActive;

      const res = await fetch(`/api/admin/youtube-resources/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update video status.');
      }

      setSuccessMsg(`Video resource status updated successfully!`);
      setTimeout(() => setSuccessMsg(''), 3500);
      fetchVideos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteVideo = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete video: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/youtube-resources/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete video');

      setSuccessMsg('Video resource removed successfully.');
      setTimeout(() => setSuccessMsg(''), 3500);
      fetchVideos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenEdit = (v) => {
    setEditModalVideo(v);
    setEditForm({
      title: v.title || '',
      topic: v.topic || '',
      description: v.description || '',
      difficulty: v.difficulty || 'Beginner',
      language: v.language || 'English',
      visibility: v.visibility || 'Assigned Students',
      status: v.status || 'published',
      isActive: v.isActive !== false
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModalVideo) return;

    try {
      const res = await fetch(`/api/admin/youtube-resources/${editModalVideo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update video details');

      setSuccessMsg('Video resource details updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3500);
      setEditModalVideo(null);
      fetchVideos();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter videos based on Search, Course, and Status
  const filteredVideos = videos.filter(v => {
    const vStatus = (v.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'all' ? true :
      statusFilter === 'published' ? (vStatus === 'published' || vStatus === 'approved') :
      statusFilter === 'pending' ? (vStatus === 'pending' || vStatus === 'pending_approval') :
      vStatus === statusFilter.toLowerCase();

    const matchesCourse = courseFilter === 'all' ? true : v.courseId === courseFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (v.title || '').toLowerCase().includes(query) ||
      (v.courseTitle || '').toLowerCase().includes(query) ||
      (v.courseId || '').toLowerCase().includes(query) ||
      (v.lessonTitle || '').toLowerCase().includes(query) ||
      (v.lessonId || '').toLowerCase().includes(query) ||
      (v.topic || '').toLowerCase().includes(query) ||
      (v.channelTitle || '').toLowerCase().includes(query) ||
      (v.channelName || '').toLowerCase().includes(query) ||
      (v.addedByName || '').toLowerCase().includes(query) ||
      (v.status || '').toLowerCase().includes(query) ||
      (v.youtubeVideoId || '').toLowerCase().includes(query);

    return matchesStatus && matchesCourse && matchesSearch;
  });

  const totalCount = videos.length;
  const publishedCount = videos.filter(v => ['approved', 'published', 'APPROVED', 'PUBLISHED'].includes(v.status)).length;
  const pendingCount = videos.filter(v => ['pending', 'pending_approval', 'PENDING', 'PENDING_APPROVAL'].includes(v.status)).length;
  const rejectedCount = videos.filter(v => ['rejected', 'REJECTED'].includes(v.status)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner (PART 9) */}
      <div className="content-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Video size={20} color="#DC2626" />
            <span>YOUTUBE RESOURCE MANAGEMENT</span>
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Review, approve, publish, edit, or reject faculty video explanations. Only published/approved &amp; active videos are visible to students.
          </p>
        </div>

        <button
          onClick={fetchVideos}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div className="content-card" style={{ padding: '14px', borderLeft: '4px solid #2563EB' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL SUBMITTED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>{totalCount}</div>
        </div>

        <div className="content-card" style={{ padding: '14px', borderLeft: '4px solid #16A34A' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>PUBLISHED / APPROVED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16A34A', marginTop: '2px' }}>{publishedCount}</div>
        </div>

        <div className="content-card" style={{ padding: '14px', borderLeft: '4px solid #D97706' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>PENDING MODERATION</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#D97706', marginTop: '2px' }}>{pendingCount}</div>
        </div>

        <div className="content-card" style={{ padding: '14px', borderLeft: '4px solid #DC2626' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>REJECTED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#DC2626', marginTop: '2px' }}>{rejectedCount}</div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: '600' }}>
          <CheckCircle2 size={18} color="#16A34A" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="content-card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by title, course, lesson, topic, teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.84rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
          >
            <option value="all">All Courses</option>
            {coursesList.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <select
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
      </div>

      {/* Table: Video, Course, Lesson, Topic, Added By, Status, Visibility, Actions (PART 9) */}
      {isLoading ? (
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-subtle)', borderTopColor: '#DC2626', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
          <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Loading YouTube resources...</span>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Video size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>No Videos Matching Filter</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Adjust your search or filter options to inspect other submissions.
          </p>
        </div>
      ) : (
        <div className="content-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px' }}>Video</th>
                <th style={{ padding: '12px 14px' }}>Course</th>
                <th style={{ padding: '12px 14px' }}>Lesson</th>
                <th style={{ padding: '12px 14px' }}>Topic</th>
                <th style={{ padding: '12px 14px' }}>Added By</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Visibility</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVideos.map((v) => {
                const isPublished = ['approved', 'published', 'APPROVED', 'PUBLISHED'].includes(v.status);
                const isPending = ['pending', 'pending_approval', 'PENDING', 'PENDING_APPROVAL'].includes(v.status);
                const isRejected = ['rejected', 'REJECTED'].includes(v.status);

                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {/* 1. Video */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '64px',
                            height: '36px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            background: '#000',
                            flexShrink: 0,
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                          onClick={() => setPreviewModalVideo(v)}
                          title="Click to preview video"
                        >
                          <img
                            src={`https://img.youtube.com/vi/${v.youtubeVideoId}/default.jpg`}
                            alt={v.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff'
                          }}>
                            <Play size={14} fill="#fff" />
                          </div>
                        </div>

                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)', maxWidth: '240px', lineHeight: '1.2' }}>
                            {v.title}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span>ID: <code>{v.youtubeVideoId}</code></span>
                            <span>•</span>
                            <span>{v.duration || '15m'}</span>
                            {v.isPrimary && (
                              <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '1px 5px', borderRadius: '3px', fontWeight: '700', fontSize: '0.66rem' }}>PRIMARY</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Course */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{v.courseTitle || v.courseId}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{v.courseId}</div>
                    </td>

                    {/* 3. Lesson */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{v.lessonTitle || v.lessonId}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{v.lessonId}</div>
                    </td>

                    {/* 4. Topic */}
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge-pill" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>{v.topic}</span>
                    </td>

                    {/* 5. Added By */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{v.addedByName || v.channelName || 'Faculty'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{v.addedBy || 'Instructor'}</div>
                    </td>

                    {/* 6. Status */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background:
                          isPublished ? '#DCFCE7' :
                          isRejected ? '#FEE2E2' : '#FEF3C7',
                        color:
                          isPublished ? '#166534' :
                          isRejected ? '#991B1B' : '#92400E'
                      }}>
                        {isPublished && <CheckCircle2 size={12} />}
                        {isRejected && <XCircle size={12} />}
                        {isPending && <AlertTriangle size={12} />}
                        <span>{isPublished ? 'Published' : (v.status || 'Pending')}</span>
                      </span>
                    </td>

                    {/* 7. Visibility */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {v.visibility || 'Assigned Students'}
                      </span>
                    </td>

                    {/* 8. Actions: Preview, Approve, Reject, Publish, Disable, Edit, Delete (PART 9) */}
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* Preview */}
                        <button
                          onClick={() => setPreviewModalVideo(v)}
                          className="btn-secondary"
                          style={{ padding: '4px 7px', fontSize: '0.72rem' }}
                          title="Preview video"
                        >
                          <Eye size={12} />
                        </button>

                        {/* Approve */}
                        {!isPublished && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'approved', true)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              background: '#16A34A',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            title="Approve for student viewing"
                          >
                            <Check size={12} /> Approve
                          </button>
                        )}

                        {/* Publish */}
                        {v.status !== 'published' && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'published', true)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              background: '#2563EB',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            title="Publish immediately"
                          >
                            <UploadCloud size={12} /> Publish
                          </button>
                        )}

                        {/* Reject */}
                        {!isRejected && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'rejected', false)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              background: '#DC2626',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            title="Reject video"
                          >
                            <X size={12} /> Reject
                          </button>
                        )}

                        {/* Disable / Enable Toggle */}
                        <button
                          onClick={() => handleUpdateStatus(v.id, undefined, !v.isActive)}
                          style={{
                            padding: '4px 7px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            border: '1px solid var(--border-subtle)',
                            background: v.isActive !== false ? '#F0FDF4' : '#F1F5F9',
                            color: v.isActive !== false ? '#166534' : '#64748B',
                            cursor: 'pointer'
                          }}
                          title={v.isActive !== false ? 'Click to Disable' : 'Click to Enable'}
                        >
                          {v.isActive !== false ? 'Active' : 'Disabled'}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="btn-secondary"
                          style={{ padding: '4px 7px', fontSize: '0.72rem' }}
                          title="Edit metadata"
                        >
                          <Edit2 size={12} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteVideo(v.id, v.title)}
                          className="btn-secondary"
                          style={{ padding: '4px 7px', fontSize: '0.72rem', color: '#DC2626' }}
                          title="Delete resource"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                  {previewModalVideo.channelTitle || previewModalVideo.channelName} • {previewModalVideo.topic}
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

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    handleUpdateStatus(previewModalVideo.id, 'published', true);
                    setPreviewModalVideo(null);
                  }}
                  className="btn-primary"
                  style={{ background: '#2563EB', borderColor: '#2563EB', padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  Publish Video
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setPreviewModalVideo(null)}
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editModalVideo && (
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
          <div className="content-card" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Edit YouTube Resource</h3>
              </div>
              <button
                onClick={() => setEditModalVideo(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Video Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Topic</label>
                <input
                  type="text"
                  required
                  value={editForm.topic}
                  onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Difficulty</label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Language</label>
                  <select
                    value={editForm.language}
                    onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                  >
                    <option value="English">English</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Bilingual">Bilingual</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                  >
                    <option value="published">Published</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Visibility</label>
                <select
                  value={editForm.visibility}
                  onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                >
                  <option value="Assigned Students">Assigned Students</option>
                  <option value="All Students">All Students</option>
                  <option value="Public">Public</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                />
                <span>Active Resource (Visible when published)</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditModalVideo(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
