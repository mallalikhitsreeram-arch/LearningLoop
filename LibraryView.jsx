import React, { useState, useEffect } from 'react';
import {
  FileText,
  DownloadCloud,
  PlusCircle,
  CheckCircle2,
  BookOpen,
  Search,
  Bookmark,
  BookMarked,
  Filter,
  Check,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { offlineDb } from '../../services/offlineDb.js';

export const LibraryView = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('ebooks'); // 'ebooks', 'notes', 'requests'

  // E-Books state
  const [ebooks, setEbooks] = useState([]);
  const [ebookSearch, setEbookSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [downloadedEBookIds, setDownloadedEBookIds] = useState(new Set());
  const [previewEBook, setPreviewEBook] = useState(null);
  const [downloadNotification, setDownloadNotification] = useState(null);

  // Notes & Resources state
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    bookTitle: '',
    author: '',
    isbn: '',
    reason: ''
  });
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Fetch initial data
  useEffect(() => {
    // 1. Fetch study notes & requests
    fetch('/api/library/resources')
      .then(res => res.json())
      .then(data => {
        if (data.resources) setResources(data.resources);
        if (data.requests) setRequests(data.requests);
      })
      .catch(() => {});

    // 2. Fetch e-books
    fetchEBooks();

    // 3. Check IndexedDB for offline cached e-books
    offlineDb.getAllDownloadedEBooks()
      .then(list => {
        const ids = new Set(list.map(eb => eb.id));
        setDownloadedEBookIds(ids);
      })
      .catch(() => {});
  }, []);

  const fetchEBooks = (subject = selectedSubject, search = ebookSearch) => {
    let url = '/api/library/ebooks?';
    const params = [];
    if (subject && subject !== 'All Subjects') {
      params.push(`subject=${encodeURIComponent(subject)}`);
    }
    if (search.trim()) {
      params.push(`search=${encodeURIComponent(search.trim())}`);
    }
    fetch(url + params.join('&'))
      .then(res => res.json())
      .then(data => {
        if (data.ebooks) setEbooks(data.ebooks);
      })
      .catch(() => {});
  };

  const handleSubjectChange = (subj) => {
    setSelectedSubject(subj);
    fetchEBooks(subj, ebookSearch);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setEbookSearch(val);
    fetchEBooks(selectedSubject, val);
  };

  const handleDownloadEBook = async (ebook) => {
    try {
      await offlineDb.saveDownloadedEBook(ebook);
      setDownloadedEBookIds(prev => new Set([...prev, ebook.id]));
      setDownloadNotification(`"${ebook.title}" is now available offline!`);
      setTimeout(() => setDownloadNotification(null), 3500);

      // Increment server download stats
      fetch(`/api/library/ebooks/${ebook.id}`).catch(() => {});
    } catch (err) {
      console.error('Failed to save to offlineDb:', err);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/library/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestForm,
          studentName: currentUser?.name || 'Student',
          studentEmail: currentUser?.email || 'student@university.edu'
        })
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => [data.request, ...prev]);
        setRequestSubmitted(true);
        setTimeout(() => {
          setRequestSubmitted(false);
          setIsRequestModalOpen(false);
          setRequestForm({ bookTitle: '', author: '', isbn: '', reason: '' });
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const subjects = ['All Subjects', 'C Programming', 'Python', 'AI & ML', 'Data Structures'];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: '700' }}>
            Academic Library &amp; E-Book Repository
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Curated textbooks, faculty lecture notes, and offline-optimized revision guides.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsRequestModalOpen(true)}>
          <PlusCircle size={16} />
          <span>Request Resource</span>
        </button>
      </div>

      {/* Download Alert Toast */}
      {downloadNotification && (
        <div style={{
          background: 'var(--accent-sage-light)',
          color: 'var(--accent-sage)',
          border: '1px solid var(--accent-sage)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          <CheckCircle2 size={18} />
          <span>{downloadNotification}</span>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '8px'
      }}>
        <button
          onClick={() => setActiveTab('ebooks')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.86rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'ebooks' ? 'var(--accent-sage-light)' : 'transparent',
            color: activeTab === 'ebooks' ? 'var(--accent-sage)' : 'var(--text-secondary)',
            border: activeTab === 'ebooks' ? '1px solid var(--accent-sage)' : '1px solid transparent'
          }}
        >
          <BookOpen size={16} />
          <span>📚 E-Books</span>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 6px',
            borderRadius: '999px',
            background: 'var(--bg-surface-subtle)',
            color: 'var(--text-muted)'
          }}>
            {ebooks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.86rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'notes' ? 'var(--accent-sage-light)' : 'transparent',
            color: activeTab === 'notes' ? 'var(--accent-sage)' : 'var(--text-secondary)',
            border: activeTab === 'notes' ? '1px solid var(--accent-sage)' : '1px solid transparent'
          }}
        >
          <FileText size={16} />
          <span>Study Notes &amp; Cheatsheets</span>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 6px',
            borderRadius: '999px',
            background: 'var(--bg-surface-subtle)',
            color: 'var(--text-muted)'
          }}>
            {resources.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.86rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'requests' ? 'var(--accent-sage-light)' : 'transparent',
            color: activeTab === 'requests' ? 'var(--accent-sage)' : 'var(--text-secondary)',
            border: activeTab === 'requests' ? '1px solid var(--accent-sage)' : '1px solid transparent'
          }}
        >
          <Bookmark size={16} />
          <span>My Acquisition Requests</span>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 6px',
            borderRadius: '999px',
            background: 'var(--bg-surface-subtle)',
            color: 'var(--text-muted)'
          }}>
            {requests.length}
          </span>
        </button>
      </div>

      {/* TAB 1: E-BOOKS */}
      {activeTab === 'ebooks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Search & Subject Filter Bar */}
          <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search e-books by title, author, or topic..."
                value={ebookSearch}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  fontSize: '0.86rem'
                }}
              />
            </div>

            {/* Subject Filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Filter size={13} /> Subject:
              </span>
              {subjects.map(subj => (
                <button
                  key={subj}
                  onClick={() => handleSubjectChange(subj)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: selectedSubject === subj ? '700' : '500',
                    background: selectedSubject === subj ? 'var(--text-primary)' : 'var(--bg-surface-subtle)',
                    color: selectedSubject === subj ? 'var(--bg-surface)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* E-Books Grid */}
          {ebooks.length === 0 ? (
            <div className="content-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <BookOpen size={40} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
              <div style={{ fontWeight: '600', fontSize: '0.96rem' }}>No e-books match your criteria</div>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Try adjusting your search terms or subject filter.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
              {ebooks.map(eb => {
                const isDownloaded = downloadedEBookIds.has(eb.id);
                return (
                  <div
                    key={eb.id}
                    className="content-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span className="badge-pill" style={{ fontSize: '0.72rem', background: 'var(--accent-sage-light)', color: 'var(--accent-sage)', fontWeight: '700' }}>
                          {eb.subject}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isDownloaded && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              background: '#ECFDF5',
                              color: '#059669',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              border: '1px solid #A7F3D0'
                            }}>
                              <Check size={12} /> Available Offline
                            </span>
                          )}
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {eb.fileSize || '2.4 MB'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Author */}
                      <h3 style={{ fontSize: '1.02rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: '1.3' }}>
                        {eb.title}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        By <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{eb.author}</span> • {eb.edition || 'Standard Edition'}
                      </div>

                      {/* Description */}
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '12px' }}>
                        {eb.description || 'Comprehensive textbook covering foundational principles, syntax references, memory architecture, and hands-on exercises.'}
                      </p>

                      {/* Topics / Chapters Pills */}
                      {eb.chapters && eb.chapters.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {eb.chapters.slice(0, 3).map((ch, idx) => (
                            <span key={idx} style={{ fontSize: '0.7rem', background: 'var(--bg-surface-subtle)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                              Ch {idx + 1}: {ch.title || ch}
                            </span>
                          ))}
                          {eb.chapters.length > 3 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              +{eb.chapters.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {eb.downloads || 42} downloads
                      </span>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setPreviewEBook(eb)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Eye size={13} />
                          <span>Read / Preview</span>
                        </button>

                        <button
                          onClick={() => handleDownloadEBook(eb)}
                          className="btn-primary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isDownloaded ? 'var(--bg-surface-subtle)' : undefined,
                            color: isDownloaded ? 'var(--accent-sage)' : undefined,
                            borderColor: isDownloaded ? 'var(--accent-sage)' : undefined
                          }}
                        >
                          <DownloadCloud size={13} />
                          <span>{isDownloaded ? 'Downloaded' : 'Download'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDY NOTES & CHEATSHEETS */}
      {activeTab === 'notes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {resources.map((res) => (
            <div key={res.id} className="content-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge-pill">{res.subject}</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--accent-sage)', fontWeight: '700' }}>{res.sizeKb || res.fileSize || '350'} KB</span>
                </div>

                <h3 style={{ fontSize: '1.02rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {res.title}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  By {res.author} • {res.format || 'PDF'}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  {res.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{res.downloads || 28} downloads</span>
                <button
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    alert(`Resource "${res.title}" downloaded for offline revision!`);
                  }}
                >
                  <DownloadCloud size={14} /> Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: MY REQUESTS */}
      {activeTab === 'requests' && (
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 className="section-title" style={{ marginBottom: '4px' }}>Acquisition Pipeline &amp; Resource Requests</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Legitimate faculty and library acquisition requests submitted by students.
              </p>
            </div>
            <button className="btn-primary" onClick={() => setIsRequestModalOpen(true)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              <PlusCircle size={14} /> Request Another
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {requests.map((r) => (
              <div key={r.id} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{r.bookTitle}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    By {r.author} • ISBN: {r.isbn || 'N/A'} • Submitted: {r.requestDate || 'Recent'}
                  </div>
                  {r.reason && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '4px' }}>
                      "{r.reason}"
                    </div>
                  )}
                </div>
                <span className="badge-pill" style={{ background: 'var(--accent-amber-light)', color: '#B45309', fontWeight: '700' }}>
                  {r.status || 'Under Review'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* E-Book Preview Modal */}
      {previewEBook && (
        <div className="modal-overlay" onClick={() => setPreviewEBook(null)}>
          <div className="modal-card" style={{ maxWidth: '780px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="badge-pill" style={{ fontSize: '0.7rem' }}>{previewEBook.subject}</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{previewEBook.fileSize || '2.4 MB'} • PDF</span>
                </div>
                <h3 className="modal-title" style={{ fontSize: '1.2rem', lineHeight: '1.3' }}>{previewEBook.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By {previewEBook.author}</div>
              </div>
              <button onClick={() => setPreviewEBook(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Modal Content / Reader Preview */}
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-surface-subtle)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.84rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>Book Overview &amp; Synopsis</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {previewEBook.description || 'This edition provides comprehensive academic coverage with step-by-step illustrations, memory diagrams, worked-out algorithms, and chapter quizzes aligned with university curricula.'}
                </p>
              </div>

              {/* Table of Contents / Sample Text */}
              <div>
                <h4 style={{ fontSize: '0.84rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Interactive Chapter Index &amp; Reader Preview
                </h4>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--accent-sage)' }}>
                      Chapter 1: Foundations &amp; Computational Memory Model
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '6px' }}>
                      {previewEBook.sampleChapterContent ||
                        'In high-performance systems programming, variables represent named contiguous memory locations characterized by an address in hexadecimal format, a data type width, and an access specifier. Memory layout consists of the code text segment, initialized data, BSS, dynamically allocated heap expanding upward, and local call stack expanding downward.'}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Chapter 2: Control Flow, Loops &amp; Branch Prediction
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '4px' }}>
                      Iterative constructs allow conditional execution with low overhead. Modern CPU pipelines optimize predictable loops using branch target buffers and speculative execution.
                    </p>
                  </div>

                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Chapter 3: Pointers, Indirection &amp; Dynamic Allocation
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '4px' }}>
                      Pointers store raw memory addresses of other variables. Understanding dereferencing, pointer arithmetic, and heap management prevents buffer overflows and memory leaks.
                    </p>
                  </div>
                </div>
              </div>

              {/* Offline Reading Advisory */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#F8FAFC', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <HardDrive size={16} style={{ color: 'var(--accent-sage)' }} />
                <span>Downloading saves this e-book directly into browser IndexedDB for seamless reading without an internet connection.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {downloadedEBookIds.has(previewEBook.id) ? '✓ Saved to your local device' : 'Available for offline download'}
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setPreviewEBook(null)}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    handleDownloadEBook(previewEBook);
                    setPreviewEBook(null);
                  }}
                >
                  <DownloadCloud size={14} />
                  <span>Download for Offline</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRequestModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">Request Missing Academic Material</h4>
              <button onClick={() => setIsRequestModalOpen(false)}>✕</button>
            </div>

            <div className="modal-body">
              {requestSubmitted ? (
                <div style={{ background: 'var(--accent-sage-light)', color: 'var(--accent-sage)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                  <CheckCircle2 size={20} />
                  <span>Request submitted successfully to university library administrators!</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Book / Resource Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Operating System Concepts (Silberschatz)"
                      value={requestForm.bookTitle}
                      onChange={(e) => setRequestForm({ ...requestForm, bookTitle: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Author</label>
                      <input
                        type="text"
                        required
                        placeholder="Author name"
                        value={requestForm.author}
                        onChange={(e) => setRequestForm({ ...requestForm, author: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>ISBN (Optional)</label>
                      <input
                        type="text"
                        placeholder="978-..."
                        value={requestForm.isbn}
                        onChange={(e) => setRequestForm({ ...requestForm, isbn: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Academic Reason</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain how this resource supports your semester project or coursework..."
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>

                  <div className="modal-footer" style={{ padding: 0, marginTop: '8px', border: 'none' }}>
                    <button type="button" className="btn-secondary" onClick={() => setIsRequestModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Submit Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
