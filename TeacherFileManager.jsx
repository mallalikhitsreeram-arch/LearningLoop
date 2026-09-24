import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FolderPlus,
  Upload,
  FileText,
  BookOpen,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Download,
  Eye,
  MoreVertical,
  ChevronRight,
  Search,
  Lock,
  Globe,
  Users,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const TeacherFileManager = () => {
  const { currentUser, getAuthHeaders } = useAuth();
  const fileInputRef = useRef(null);

  // Active view: 'resources' | 'ebooks'
  const [activeSection, setActiveSection] = useState('resources');

  // Resources state
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState('fld-c-lang');
  const [resources, setResources] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFileForUpload, setSelectedFileForUpload] = useState(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    title: '',
    subject: 'C Programming',
    courseId: 'crs-c-lang',
    folderId: 'fld-c-lang',
    format: 'PDF',
    description: '',
    visibility: 'all_students',
    status: 'published'
  });

  // E-Book Modal State
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [ebookForm, setEbookForm] = useState({
    title: '',
    author: '',
    subject: 'C Programming',
    courseId: 'crs-c-lang',
    topic: 'Loops & Pointers',
    description: '',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    coverUrl: '',
    accessLevel: 'all_students',
    visibility: 'all_students',
    status: 'published'
  });

  // Preview Modal
  const [previewItem, setPreviewItem] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch Folders and Resources
  const fetchData = () => {
    fetch('/api/teacher/folders', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFolders(data);
          if (data.length > 0 && !selectedFolderId) {
            setSelectedFolderId(data[0].id);
          }
        }
      })
      .catch(() => {});

    fetch('/api/teacher/resources', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setResources(data);
      })
      .catch(() => {});

    fetch('/api/library/ebooks')
      .then(res => res.json())
      .then(data => {
        if (data.ebooks) setEbooks(data.ebooks);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle native file selection
  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileForUpload(file);
      setUploadMetadata({
        ...uploadMetadata,
        title: file.name.replace(/\.[^/.]+$/, ""),
        format: file.name.split('.').pop()?.toUpperCase() || 'PDF',
        folderId: selectedFolderId
      });
      setIsUploadModalOpen(true);
    }
  };

  // Submit file upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teacher/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          ...uploadMetadata,
          fileName: selectedFileForUpload?.name || `${uploadMetadata.title}.pdf`,
          fileSize: selectedFileForUpload ? `${Math.round(selectedFileForUpload.size / 1024)} KB` : '450 KB',
          author: currentUser?.name || 'Faculty Instructor'
        })
      });

      if (res.ok) {
        setIsUploadModalOpen(false);
        setSelectedFileForUpload(null);
        setStatusMessage('File uploaded and indexed successfully!');
        setTimeout(() => setStatusMessage(null), 3000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create folder
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch('/api/teacher/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ name: newFolderName.trim() })
      });
      if (res.ok) {
        setIsFolderModalOpen(false);
        setNewFolderName('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add E-Book
  const handleAddEbook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/library/ebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          ...ebookForm,
          author: ebookForm.author || currentUser?.name || 'Faculty Member'
        })
      });
      if (res.ok) {
        setIsEbookModalOpen(false);
        setEbookForm({
          title: '',
          author: '',
          subject: 'C Programming',
          courseId: 'crs-c-lang',
          topic: 'Loops & Pointers',
          description: '',
          fileType: 'PDF',
          fileSize: '2.4 MB',
          coverUrl: '',
          accessLevel: 'all_students',
          visibility: 'all_students',
          status: 'published'
        });
        setStatusMessage('E-Book added and published to Student Library!');
        setTimeout(() => setStatusMessage(null), 3000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Resource
  const handleDeleteResource = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      const res = await fetch(`/api/teacher/resources/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResources = resources.filter(r => {
    if (selectedFolderId && r.folderId !== selectedFolderId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (r.title || '').toLowerCase().includes(q) ||
        (r.subject || '').toLowerCase().includes(q) ||
        (r.topic || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeFolder = folders.find(f => f.id === selectedFolderId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hidden browser file input for picking files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilePicked}
        style={{ display: 'none' }}
        accept=".pdf,.epub,.doc,.docx,.ppt,.pptx,.txt"
      />

      {/* Header Banner */}
      <div className="content-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: '800', textTransform: 'uppercase' }}>
            Resource &amp; Knowledge Repository
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '2px' }}>
            Faculty Resource &amp; File Manager
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Organize subject notes, slide decks, and approved e-books with permission controls.
          </p>
        </div>

        {/* Section switcher & Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-subtle)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
            <button
              type="button"
              onClick={() => setActiveSection('resources')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: activeSection === 'resources' ? '700' : '500',
                background: activeSection === 'resources' ? '#fff' : 'transparent',
                color: activeSection === 'resources' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              📁 My Resources
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('ebooks')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: activeSection === 'ebooks' ? '700' : '500',
                background: activeSection === 'ebooks' ? '#fff' : 'transparent',
                color: activeSection === 'ebooks' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              📚 E-Books ({ebooks.length})
            </button>
          </div>

          {activeSection === 'resources' ? (
            <>
              <button
                type="button"
                id="create-folder-btn"
                className="btn-secondary"
                onClick={() => setIsFolderModalOpen(true)}
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FolderPlus size={14} />
                <span>Create Folder</span>
              </button>

              <button
                type="button"
                id="upload-file-btn"
                className="btn-primary"
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={14} />
                <span>Upload File</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              id="add-ebook-btn"
              className="btn-primary"
              onClick={() => setIsEbookModalOpen(true)}
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={14} />
              <span>Add E-Book</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* SECTION 1: My Resources (Folders + Files) */}
      {activeSection === 'resources' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
          {/* Folders Navigation Sidebar */}
          <div className="content-card" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '0.86rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Folder size={16} /> Folders
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {folders.map(f => {
                const count = resources.filter(r => r.folderId === f.id).length;
                const isSelected = selectedFolderId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFolderId(f.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--accent-primary-light)' : 'transparent',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? '700' : '500',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Folder size={15} color={isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                      <span>{f.name}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Files List in Selected Folder */}
          <div className="content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>
                  📂 {activeFolder?.name || 'All Files'}
                </h4>
                <span className="badge-pill">{filteredResources.length} items</span>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search files, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            {filteredResources.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ margin: '0 0 12px' }}>No documents uploaded in this folder yet.</p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: '0.82rem' }}
                >
                  <Upload size={14} /> Upload First File
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredResources.map((res) => (
                  <div
                    key={res.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: '#fff',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {res.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span>{res.fileType || res.format}</span>
                          <span>•</span>
                          <span>{res.fileSize || `${res.sizeKb} KB`}</span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {res.visibility === 'private' ? <Lock size={11} /> : <Globe size={11} />}
                            {res.visibility === 'private' ? 'Private' : (res.visibility === 'assigned_classes' ? 'Assigned Classes' : 'All Students')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setPreviewItem(res)}
                        style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={13} />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => alert(`Downloading "${res.title}"...`)}
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                      >
                        <Download size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleDeleteResource(res.id)}
                        style={{ padding: '6px 10px', color: '#DC2626', borderColor: '#FCA5A5' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: E-Books Manager */}
      {activeSection === 'ebooks' && (
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>📚 Approved Academic E-Books</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Published e-books automatically appear in Student Library Resources and can be cached offline.
              </p>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsEbookModalOpen(true)}
              style={{ fontSize: '0.8rem' }}
            >
              <PlusCircle size={14} /> Add E-Book
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {ebooks.map(eb => (
              <div key={eb.id} className="content-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge-pill">{eb.subject}</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-sage)', fontWeight: '700' }}>{eb.fileSize}</span>
                  </div>

                  <h4 style={{ fontSize: '1.02rem', fontWeight: '800', margin: '0 0 4px' }}>{eb.title}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    By {eb.author} • Topic: <strong>{eb.topic}</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: '0 0 12px' }}>
                    {eb.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{eb.downloads || 0} downloads</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setPreviewItem(eb)}
                      style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                    >
                      Preview
                    </button>
                    <span className="badge-pill" style={{ background: '#DCFCE7', color: '#166534', fontWeight: '700' }}>
                      Published
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUploadModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">Upload Resource Document</h4>
              <button onClick={() => setIsUploadModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadMetadata.title}
                  onChange={(e) => setUploadMetadata({ ...uploadMetadata, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Subject</label>
                  <input
                    type="text"
                    required
                    value={uploadMetadata.subject}
                    onChange={(e) => setUploadMetadata({ ...uploadMetadata, subject: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Folder Destination</label>
                  <select
                    value={uploadMetadata.folderId}
                    onChange={(e) => setUploadMetadata({ ...uploadMetadata, folderId: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  >
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Visibility</label>
                  <select
                    value={uploadMetadata.visibility}
                    onChange={(e) => setUploadMetadata({ ...uploadMetadata, visibility: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  >
                    <option value="all_students">All Students (Public Library)</option>
                    <option value="assigned_classes">Assigned Classes Only</option>
                    <option value="private">Private (Teacher Only)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Format</label>
                  <input
                    type="text"
                    value={uploadMetadata.format}
                    onChange={(e) => setUploadMetadata({ ...uploadMetadata, format: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Description</label>
                <textarea
                  rows={2}
                  value={uploadMetadata.description}
                  onChange={(e) => setUploadMetadata({ ...uploadMetadata, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                />
              </div>

              <div className="modal-footer" style={{ border: 'none', padding: '10px 0 0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Upload &amp; Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {isFolderModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFolderModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">Create Resource Folder</h4>
              <button onClick={() => setIsFolderModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateFolder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Folder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                />
              </div>

              <div className="modal-footer" style={{ border: 'none', padding: '8px 0 0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFolderModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Folder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add E-Book Modal */}
      {isEbookModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEbookModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="var(--accent-primary)" />
                <h4 className="modal-title">Publish Academic E-Book</h4>
              </div>
              <button onClick={() => setIsEbookModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddEbook} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>E-Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C Programming Complete Guide"
                  value={ebookForm.title}
                  onChange={(e) => setEbookForm({ ...ebookForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Author / Faculty</label>
                  <input
                    type="text"
                    required
                    placeholder="Author name"
                    value={ebookForm.author}
                    onChange={(e) => setEbookForm({ ...ebookForm, author: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Subject</label>
                  <input
                    type="text"
                    required
                    value={ebookForm.subject}
                    onChange={(e) => setEbookForm({ ...ebookForm, subject: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Topic Focus</label>
                  <input
                    type="text"
                    value={ebookForm.topic}
                    onChange={(e) => setEbookForm({ ...ebookForm, topic: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>File Size</label>
                  <input
                    type="text"
                    value={ebookForm.fileSize}
                    onChange={(e) => setEbookForm({ ...ebookForm, fileSize: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', display: 'block', marginBottom: '3px' }}>Description &amp; Syllabus Alignment</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summary of chapters, core algorithms, and revision coverage..."
                  value={ebookForm.description}
                  onChange={(e) => setEbookForm({ ...ebookForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}
                />
              </div>

              <div className="modal-footer" style={{ border: 'none', padding: '10px 0 0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsEbookModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Publish to Student Library</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="modal-overlay" onClick={() => setPreviewItem(null)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h4 className="modal-title">{previewItem.title}</h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  By {previewItem.author} • {previewItem.fileType || previewItem.format}
                </span>
              </div>
              <button onClick={() => setPreviewItem(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem', whiteSpace: 'pre-line', maxHeight: '280px', overflowY: 'auto' }}>
                {previewItem.contentSnippet || previewItem.description || "Preview text content loaded from verified faculty storage archive."}
              </div>

              <div className="modal-footer" style={{ border: 'none', padding: '10px 0 0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setPreviewItem(null)}>Close</button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    alert(`Resource "${previewItem.title}" downloaded.`);
                    setPreviewItem(null);
                  }}
                >
                  <Download size={14} /> Download Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
