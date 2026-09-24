import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  HardDrive,
  Trash2,
  Eye,
  CheckCircle2,
  Layers,
  ArrowLeft,
  FileText,
  AlertCircle,
  DownloadCloud
} from 'lucide-react';
import { offlineDb } from '../../services/offlineDb.js';
import { CourseList } from '../courses/CourseList.jsx';
import { CourseDetail } from '../courses/CourseDetail.jsx';

export const OfflineDownloadsView = ({
  selectedCourse,
  onSelectCourse,
  onBackCourse,
  onActiveContextChange
}) => {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'ebooks'
  const [downloadedEBooks, setDownloadedEBooks] = useState([]);
  const [readingEBook, setReadingEBook] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Load offline e-books from IndexedDB
  const loadOfflineEBooks = async () => {
    try {
      const list = await offlineDb.getAllDownloadedEBooks();
      setDownloadedEBooks(list || []);
    } catch (err) {
      console.error('Failed to load offline ebooks:', err);
    }
  };

  useEffect(() => {
    loadOfflineEBooks();
  }, []);

  const handleDeleteEBook = async (id) => {
    try {
      await offlineDb.deleteDownloadedEBook(id);
      setDeleteConfirmId(null);
      loadOfflineEBooks();
    } catch (err) {
      console.error('Failed to delete offline ebook:', err);
    }
  };

  // Calculate approximate storage used
  const calculateTotalStorage = () => {
    let totalMb = 0;
    downloadedEBooks.forEach(eb => {
      const sizeStr = eb.fileSize || '2.0 MB';
      const num = parseFloat(sizeStr);
      if (!isNaN(num)) {
        if (sizeStr.toLowerCase().includes('kb')) {
          totalMb += num / 1024;
        } else {
          totalMb += num;
        }
      } else {
        totalMb += 2.0;
      }
    });
    return totalMb.toFixed(1);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="section-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: '700' }}>
            Offline Downloads &amp; Device Storage
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Access downloaded courses, study materials, and academic e-books completely offline without an internet connection.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '8px'
      }}>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.86rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'courses' ? 'var(--accent-sage-light)' : 'transparent',
            color: activeTab === 'courses' ? 'var(--accent-sage)' : 'var(--text-secondary)',
            border: activeTab === 'courses' ? '1px solid var(--accent-sage)' : '1px solid transparent'
          }}
        >
          <Layers size={16} />
          <span>📦 Downloaded Courses</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ebooks');
            loadOfflineEBooks();
          }}
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
          <span>📚 Offline E-Books &amp; Notes</span>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 6px',
            borderRadius: '999px',
            background: 'var(--bg-surface-subtle)',
            color: 'var(--text-muted)'
          }}>
            {downloadedEBooks.length}
          </span>
        </button>
      </div>

      {/* TAB 1: DOWNLOADED COURSES */}
      {activeTab === 'courses' && (
        <div>
          {selectedCourse ? (
            <CourseDetail
              course={selectedCourse}
              onBack={onBackCourse}
              onActiveContextChange={onActiveContextChange}
            />
          ) : (
            <CourseList onSelectCourse={onSelectCourse} initialFilter="downloaded" />
          )}
        </div>
      )}

      {/* TAB 2: OFFLINE E-BOOKS & NOTES */}
      {activeTab === 'ebooks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Storage Meter Banner */}
          <div className="content-card" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-sage-light)',
                color: 'var(--accent-sage)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HardDrive size={22} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                  Device Storage: {calculateTotalStorage()} MB Cached
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {downloadedEBooks.length} e-book{downloadedEBooks.length !== 1 ? 's' : ''} stored locally in browser IndexedDB
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.74rem',
                color: 'var(--accent-sage)',
                fontWeight: '700',
                background: 'var(--accent-sage-light)',
                padding: '4px 10px',
                borderRadius: '999px'
              }}>
                ⚡ Zero Data Usage Offline
              </span>
            </div>
          </div>

          {/* Downloaded E-Books List */}
          {downloadedEBooks.length === 0 ? (
            <div className="content-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <BookOpen size={48} style={{ opacity: 0.35, margin: '0 auto 12px', color: 'var(--accent-sage)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                No Offline E-Books Downloaded Yet
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 18px', lineHeight: '1.5' }}>
                Browse the Academic Library to download textbooks and course revision packs for uninterrupted offline reading.
              </p>
              <a
                href="/resources"
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontSize: '0.84rem' }}
              >
                <BookOpen size={16} />
                <span>Go to Academic Library</span>
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {downloadedEBooks.map((eb) => (
                <div
                  key={eb.id}
                  className="content-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge-pill" style={{ fontSize: '0.72rem', background: 'var(--accent-sage-light)', color: 'var(--accent-sage)', fontWeight: '700' }}>
                        {eb.subject || 'Academic'}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {eb.fileSize || '2.4 MB'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.02rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: '1.3' }}>
                      {eb.title}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      By {eb.author} • Downloaded {eb.downloadedAt ? new Date(eb.downloadedAt).toLocaleDateString() : 'Recently'}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '10px' }}>
                      {eb.description || 'Full offline copy available with chapter notes, examples, and study guide.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    <button
                      onClick={() => setReadingEBook(eb)}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Eye size={14} />
                      <span>Read Offline</span>
                    </button>

                    {deleteConfirmId === eb.id ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleDeleteEBook(eb.id)}
                          style={{
                            padding: '4px 8px',
                            background: 'var(--accent-crimson)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={{
                            padding: '4px 8px',
                            background: 'var(--bg-surface-subtle)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.74rem',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(eb.id)}
                        className="btn-secondary"
                        title="Delete from offline storage"
                        style={{ padding: '6px 10px', fontSize: '0.78rem', color: 'var(--accent-crimson)', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Offline Reader Modal */}
      {readingEBook && (
        <div className="modal-overlay" onClick={() => setReadingEBook(null)}>
          <div className="modal-card" style={{ maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="badge-pill" style={{ fontSize: '0.7rem' }}>{readingEBook.subject}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-sage)', fontWeight: '700' }}>⚡ Read from IndexedDB</span>
                </div>
                <h3 className="modal-title" style={{ fontSize: '1.25rem' }}>{readingEBook.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By {readingEBook.author}</div>
              </div>
              <button onClick={() => setReadingEBook(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: '1.6' }}>
              <div style={{ background: 'var(--bg-surface-subtle)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>Book Summary &amp; Offline Notes</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {readingEBook.description}
                </p>
              </div>

              {/* Full chapter content */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px', background: 'var(--bg-surface)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Chapter 1: Memory Fundamentals &amp; Core Architecture
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  {readingEBook.sampleChapterContent ||
                    'In systems programming and computer architecture, every variable occupies a concrete memory cell addressable by the CPU. The compiler maps variable identifiers to offsets relative to the base pointer or stack pointer during stack frame construction. Data types prescribe the bit-width (e.g. 8-bit char, 32-bit int, 64-bit long long) and interpretation scheme (two’s complement for signed values, IEEE 754 for floating point).'}
                </p>

                <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Chapter 2: Pointer Indirection &amp; Address Operations
                </h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  A pointer holds the numerical memory address of another memory block. The unary &amp; operator extracts the memory location, while the unary * dereferences the address to access or modify the underlying value. Pointer arithmetic scales by the size of the underlying type (ptr + 1 advances by sizeof(*ptr) bytes).
                </p>

                <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Chapter 3: Dynamic Memory Management (Heap vs Stack)
                </h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  The heap offers persistent, non-lexically scoped memory allocation via malloc, calloc, and realloc. Every heap allocation must be paired with free() to prevent memory leaks. Modern best practices enforce RAII or strict ownership models to eliminate dangling pointers.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setReadingEBook(null)}>
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
