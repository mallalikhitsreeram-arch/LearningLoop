import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, ExternalLink, Search, Plus, X, CheckCircle, ChevronRight, Upload } from 'lucide-react';

// ─── localStorage helpers ──────────────────────────────────────────────────
const LS_KEY = 'll_internship_applications';
const loadApps = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } };
const saveApps = (apps) => { try { localStorage.setItem(LS_KEY, JSON.stringify(apps)); } catch {} };

// ─── Mock data ─────────────────────────────────────────────────────────────
const INTERNSHIPS = [
  {
    id: 'i1', title: 'Frontend Developer Intern', company: 'TechStart Solutions', companyLogo: '💻',
    location: 'Remote', duration: '2 months', stipend: '₹5,000/month',
    skills: ['HTML', 'CSS', 'React'], type: 'Tech', deadline: '25 Sep 2026', featured: true,
    eduLevel: 'Class 11–12 / College', desc: 'Build responsive web interfaces for our EdTech products using React and CSS.',
  },
  {
    id: 'i2', title: 'Data Science Intern', company: 'Analytics Hub', companyLogo: '📊',
    location: 'Hyderabad', duration: '3 months', stipend: '₹8,000/month',
    skills: ['Python', 'ML', 'Data Analysis'], type: 'Tech', deadline: '30 Sep 2026', featured: true,
    eduLevel: 'College', desc: 'Work with real datasets, build ML models, and derive insights for business decisions.',
  },
  {
    id: 'i3', title: 'Content Writer', company: 'EduMedia', companyLogo: '✍️',
    location: 'Remote', duration: '1 month', stipend: '₹3,000/month',
    skills: ['English', 'Writing', 'SEO'], type: 'Content', deadline: '20 Sep 2026', featured: false,
    eduLevel: 'Class 10 / 11–12', desc: 'Create educational content, blog posts, and study material for our learning platform.',
  },
  {
    id: 'i4', title: 'Research Assistant', company: 'DRDO', companyLogo: '🔬',
    location: 'Delhi', duration: '6 months', stipend: 'Unpaid (Certificate)',
    skills: ['Physics', 'Research', 'Documentation'], type: 'Research', deadline: '15 Oct 2026', featured: false,
    eduLevel: 'College', desc: 'Assist senior researchers in experimental work, literature reviews, and report writing.',
  },
  {
    id: 'i5', title: 'Marketing Intern', company: 'GrowthHive', companyLogo: '📣',
    location: 'Bangalore', duration: '2 months', stipend: '₹4,000/month',
    skills: ['Digital Marketing', 'Social Media', 'Analytics'], type: 'Marketing', deadline: '10 Oct 2026', featured: false,
    eduLevel: 'College', desc: 'Plan and execute social media campaigns, track KPIs, and grow brand awareness.',
  },
  {
    id: 'i6', title: 'App Developer Intern', company: 'MobiApps', companyLogo: '📱',
    location: 'Remote', duration: '3 months', stipend: '₹7,000/month',
    skills: ['React Native', 'JavaScript', 'APIs'], type: 'Tech', deadline: '5 Oct 2026', featured: true,
    eduLevel: 'College', desc: 'Develop cross-platform mobile applications using React Native with REST API integration.',
  },
];

const TYPE_COLORS = { Tech: '#4A90E2', Content: '#27AE60', Research: '#9B59B6', Marketing: '#E67E22' };
const STATUS_COLORS = {
  Applied: { bg: '#EBF3FD', color: '#4A90E2' },
  'Under Review': { bg: '#FEF9ED', color: '#F39C12' },
  Shortlisted: { bg: '#E8FBF2', color: '#27AE60' },
  Rejected: { bg: '#FDEDEC', color: '#E74C3C' },
};

// ─── Apply Modal ─────────────────────────────────────────────────────────────
const ApplyModal = ({ job, onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: '', email: '', eduLevel: '', skills: '', resume: null, motivation: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.eduLevel.trim()) e.eduLevel = 'Education level required';
    if (!form.motivation.trim()) e.motivation = 'Please add a short message';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSubmit({
      jobId: job.id, jobTitle: job.title, company: job.company,
      appliedAt: new Date().toLocaleDateString('en-IN'),
      status: 'Applied', ...form, resume: form.resume?.name || null,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,41,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '16px' }}>
        <div style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '40px 32px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E8FBF2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={34} color="#27AE60" />
          </div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Application Submitted! ✓</div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been submitted successfully.
          </div>
          <button className="btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Done</button>
        </div>
      </div>
    );
  }

  const F = ({ label, id, error, children }) => (
    <div>
      <label style={{ fontWeight: '600', fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '5px', display: 'block' }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: '0.72rem', color: '#E74C3C', marginTop: '3px' }}>{error}</div>}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,41,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '16px' }}>
      <div style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '20px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)', animation: 'scaleIn 0.2s ease' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-primary)' }}>Apply for Internship</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{job.title} · {job.company}</div>
          </div>
          <button onClick={onClose} style={{ padding: '4px', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <F label="Full Name *" error={errors.name}>
            <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
          </F>
          <F label="Email Address *" error={errors.email}>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
          </F>
          <F label="Education Level *" error={errors.eduLevel}>
            <select className="form-input" value={form.eduLevel} onChange={e => setForm(p => ({ ...p, eduLevel: e.target.value }))}>
              <option value="">Select education level</option>
              <option>Class 10</option><option>Class 11–12</option>
              <option>Undergraduate (Year 1–2)</option><option>Undergraduate (Year 3–4)</option>
              <option>Postgraduate</option>
            </select>
          </F>
          <F label="Your Skills" error={errors.skills}>
            <input className="form-input" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="e.g. Python, React, Communication" />
          </F>
          <F label="Resume / CV (optional)">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', border: '1.5px dashed var(--border-subtle)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Upload size={15} />
              {form.resume ? form.resume.name : 'Upload PDF / DOC (optional)'}
              <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setForm(p => ({ ...p, resume: e.target.files?.[0] || null }))} />
            </label>
          </F>
          <F label="Why do you want this internship? *" error={errors.motivation}>
            <textarea className="form-input" rows={4} value={form.motivation}
              onChange={e => setForm(p => ({ ...p, motivation: e.target.value }))}
              placeholder="Tell us what excites you about this opportunity..." style={{ resize: 'vertical' }}
            />
          </F>

          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} style={{ flex: 2, justifyContent: 'center' }}>Submit Application</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────
export const InternshipsView = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [applyJob, setApplyJob] = useState(null);
  const [applications, setApplications] = useState(loadApps);

  // Persist on change
  useEffect(() => saveApps(applications), [applications]);

  const appliedIds = new Set(applications.map(a => a.jobId));

  const handleApply = (appData) => {
    setApplications(prev => [appData, ...prev]);
    setApplyJob(null);
  };

  const filtered = INTERNSHIPS.filter(job => {
    const matchType = typeFilter === 'all' || job.type.toLowerCase() === typeFilter;
    const matchSearch = !searchQ || job.title.toLowerCase().includes(searchQ.toLowerCase()) || job.company.toLowerCase().includes(searchQ.toLowerCase()) || job.skills.some(s => s.toLowerCase().includes(searchQ.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Internships & Opportunities 💼
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Discover internships matched to your skills and interests.</p>
      </div>

      {/* Tabs */}
      <div className="tabs-row" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
          Browse Opportunities
        </button>
        <button className={`tab-btn ${activeTab === 'applied' ? 'active' : ''}`} onClick={() => setActiveTab('applied')}>
          My Applications {applications.length > 0 && <span style={{ marginLeft: '5px', background: '#4A90E2', color: '#fff', borderRadius: '10px', padding: '0 6px', fontSize: '0.7rem' }}>{applications.length}</span>}
        </button>
      </div>

      {/* ── BROWSE ── */}
      {activeTab === 'browse' && (
        <>
          {/* Search + filter */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="form-input" placeholder="Search by title, company, skills..." style={{ paddingLeft: '36px' }} value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['All', 'Tech', 'Content', 'Research', 'Marketing'].map(t => (
                <button key={t} onClick={() => setTypeFilter(t.toLowerCase())} style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '600',
                  border: `1.5px solid ${typeFilter === t.toLowerCase() ? '#4A90E2' : 'var(--border-subtle)'}`,
                  background: typeFilter === t.toLowerCase() ? '#EBF3FD' : 'var(--bg-surface)',
                  color: typeFilter === t.toLowerCase() ? '#4A90E2' : 'var(--text-secondary)', cursor: 'pointer',
                }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.map(job => {
              const applied = appliedIds.has(job.id);
              return (
                <div key={job.id} className="content-card" style={{ padding: '20px', position: 'relative' }}>
                  {job.featured && (
                    <span style={{ position: 'absolute', top: '14px', right: '14px', background: '#FEF9ED', color: '#F39C12', border: '1px solid #FDD49B', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px' }}>⭐ Featured</span>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{job.companyLogo}</span>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{job.title}</div>
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{job.company}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', marginTop: '4px' }}>{job.desc}</div>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {job.location}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {job.duration}</span>
                        <span style={{ fontWeight: '600', color: '#27AE60' }}>💰 {job.stipend}</span>
                        <span>🎓 {job.eduLevel}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600', background: `${TYPE_COLORS[job.type]}15`, color: TYPE_COLORS[job.type] }}>{job.type}</span>
                        {job.skills.map(s => <span key={s} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', background: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' }}>{s}</span>)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Deadline: {job.deadline}</div>
                      {applied ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#E8FBF2', color: '#27AE60', fontWeight: '700', fontSize: '0.86rem', border: '1.5px solid #A9E6C5' }}>
                          <CheckCircle size={15} /> APPLIED ✓
                        </div>
                      ) : (
                        <button className="btn-primary" style={{ fontSize: '0.84rem' }} onClick={() => setApplyJob(job)}>
                          Apply Now <ExternalLink size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No opportunities match your search.</div>
            )}
          </div>
        </>
      )}

      {/* ── MY APPLICATIONS ── */}
      {activeTab === 'applied' && (
        <div>
          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
              <div style={{ fontWeight: '600', marginBottom: '6px' }}>No applications yet</div>
              <div style={{ fontSize: '0.84rem' }}>Browse opportunities and click "Apply Now" to get started.</div>
              <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('browse')}>Browse Opportunities</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {applications.map((app, i) => {
                const sc = STATUS_COLORS[app.status] || STATUS_COLORS['Applied'];
                return (
                  <div key={i} className="content-card" style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: '3px' }}>{app.jobTitle}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>{app.company}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Applied on {app.appliedAt}</div>
                    </div>
                    <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', background: sc.bg, color: sc.color }}>
                      {app.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} onSubmit={handleApply} />}
    </div>
  );
};
