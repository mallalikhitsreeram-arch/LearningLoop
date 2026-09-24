import React, { useState, useEffect } from 'react';
import { FolderKanban, Users, Plus, X, CheckCircle, Clock, UserCheck, UserX, ChevronRight } from 'lucide-react';

// ─── localStorage ──────────────────────────────────────────────────────────
const LS = {
  REQUESTS: 'll_project_requests',
  MEMBERS:  'll_project_members',
  MY_PROJ:  'll_my_projects',
};
const load = (k, d = []) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ─── Mock projects ─────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 'p1', title: 'Smart Agriculture IoT', emoji: '🌱', color: '#27AE60',
    desc: 'Building a sensor-based smart irrigation system using Raspberry Pi and Python.',
    skills: ['Python', 'IoT', 'Data Science'], status: 'In Progress',
    members: ['Arjun Sharma', 'Priya Reddy'], maxMembers: 6,
    owner: 'Arjun Sharma', roles: ['Backend Dev', 'IoT Engineer', 'Data Analyst'],
    level: 'College',
  },
  {
    id: 'p2', title: 'EduBot – AI Study Assistant', emoji: '🤖', color: '#4A90E2',
    desc: 'An AI chatbot that helps students clear doubts 24/7 using NLP and Flask.',
    skills: ['NLP', 'Python', 'Flask', 'React'], status: 'Recruiting',
    members: ['Rahul Nair'], maxMembers: 4,
    owner: 'Rahul Nair', roles: ['Frontend Dev', 'ML Engineer'],
    level: 'College',
  },
  {
    id: 'p3', title: 'Campus Marketplace App', emoji: '🛒', color: '#9B59B6',
    desc: 'Buy and sell study materials, books, and notes within your campus community.',
    skills: ['React Native', 'Node.js', 'MongoDB'], status: 'In Progress',
    members: ['Sneha Patel', 'Rohan Mehta', 'Kavya Iyer'], maxMembers: 6,
    owner: 'Sneha Patel', roles: ['Backend Dev', 'UI/UX Designer'],
    level: 'College',
  },
  {
    id: 'p4', title: 'Mental Health Tracker', emoji: '💚', color: '#E74C3C',
    desc: 'A wellness app to help students track mood, stress levels, and daily habits.',
    skills: ['React', 'Firebase', 'UI/UX'], status: 'Recruiting',
    members: ['Deepa Kumar'], maxMembers: 4,
    owner: 'Deepa Kumar', roles: ['Frontend Dev', 'Firebase Dev'],
    level: 'Class 11–12 / College',
  },
  {
    id: 'p5', title: 'Open Source Math Library', emoji: '📐', color: '#F39C12',
    desc: 'Community-built mathematical utilities for students and developers.',
    skills: ['JavaScript', 'Algorithms', 'Testing'], status: 'Active',
    members: ['Vikram S', 'Nandita R', 'Suresh T'], maxMembers: 8,
    owner: 'Vikram S', roles: ['Algorithm Contributor', 'Test Engineer'],
    level: 'Any',
  },
  {
    id: 'p6', title: 'Career Path Visualizer', emoji: '🗺️', color: '#1ABC9C',
    desc: 'A visual tool to explore different career trajectories based on skills and interests.',
    skills: ['D3.js', 'React', 'Data'], status: 'Ideation',
    members: ['Ananya B'], maxMembers: 4,
    owner: 'Ananya B', roles: ['Frontend Dev', 'Data Curator'],
    level: 'College',
  },
];

const STATUS_COLORS = { 'In Progress': '#4A90E2', Recruiting: '#27AE60', Active: '#F39C12', Ideation: '#9B59B6' };
const CURRENT_USER = 'You'; // In real app, from auth context

// ─── Join Request Modal ───────────────────────────────────────────────────────
const JoinRequestModal = ({ project, onClose, onSubmit }) => {
  const [role, setRole] = useState(project.roles[0] || '');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!skills.trim()) return;
    onSubmit({ projectId: project.id, projectTitle: project.title, role, skills, message, status: 'Pending', requestedAt: new Date().toLocaleDateString('en-IN') });
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,41,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '16px' }}>
        <div style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '40px 32px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '14px' }}>✅</div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.2rem', marginBottom: '8px' }}>Request Sent!</div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Your request to join <strong>{project.title}</strong> has been sent to the project owner. You'll be notified when they respond.
          </div>
          <button className="btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Got it</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,41,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '16px' }}>
      <div style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-xl)', animation: 'scaleIn 0.2s ease', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.1rem' }}>Request to Join</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{project.title}</div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontWeight: '600', fontSize: '0.82rem', display: 'block', marginBottom: '5px' }}>Preferred Role</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
              {project.roles.map(r => <option key={r}>{r}</option>)}
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style={{ fontWeight: '600', fontSize: '0.82rem', display: 'block', marginBottom: '5px' }}>Your Skills *</label>
            <input className="form-input" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. Python, React, ML, Data Analysis" />
            {!skills.trim() && <div style={{ fontSize: '0.72rem', color: '#E74C3C', marginTop: '2px' }}>Required</div>}
          </div>
          <div>
            <label style={{ fontWeight: '600', fontSize: '0.82rem', display: 'block', marginBottom: '5px' }}>Why do you want to join? (optional)</label>
            <textarea className="form-input" rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell the team why you're a great fit..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button className="btn-primary" onClick={handleSend} style={{ flex: 2, justifyContent: 'center' }}>Send Request</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────
export const ProjectCollabView = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [requests, setRequests] = useState(() => load(LS.REQUESTS, []));
  const [members, setMembers] = useState(() => load(LS.MEMBERS, {}));
  const [myProjects, setMyProjects] = useState(() => load(LS.MY_PROJ, []));
  const [joinModal, setJoinModal] = useState(null);

  useEffect(() => { save(LS.REQUESTS, requests); }, [requests]);
  useEffect(() => { save(LS.MEMBERS, members); }, [members]);
  useEffect(() => { save(LS.MY_PROJ, myProjects); }, [myProjects]);

  const requestedIds = new Set(requests.filter(r => r.status !== 'Rejected').map(r => r.projectId));
  const acceptedIds = new Set(myProjects.map(p => p.projectId));

  const handleJoinRequest = (reqData) => {
    setRequests(prev => [reqData, ...prev]);
    setJoinModal(null);
  };

  const handleAccept = (req) => {
    setRequests(prev => prev.map(r => r === req ? { ...r, status: 'Accepted' } : r));
    setMyProjects(prev => [...prev, { projectId: req.projectId, projectTitle: req.projectTitle, joinedAt: new Date().toLocaleDateString('en-IN'), role: req.role }]);
    setMembers(prev => ({ ...prev, [req.projectId]: [...(prev[req.projectId] || []), CURRENT_USER] }));
  };

  const handleReject = (req) => {
    setRequests(prev => prev.map(r => r === req ? { ...r, status: 'Rejected' } : r));
  };

  // Pending requests for "owner" view (mock — in real app would filter by current user's projects)
  const pendingRequests = requests.filter(r => r.status === 'Pending');

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Project Collaboration 🛠️</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join teams, build projects, and gain real-world experience.</p>
        </div>
        <button className="btn-primary"><Plus size={15} /> Start Project</button>
      </div>

      {/* Tabs */}
      <div className="tabs-row" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>Browse Projects</button>
        <button className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>
          My Projects {myProjects.length > 0 && <span style={{ marginLeft: '5px', background: '#27AE60', color: '#fff', borderRadius: '10px', padding: '0 6px', fontSize: '0.7rem' }}>{myProjects.length}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
          Join Requests {pendingRequests.length > 0 && <span style={{ marginLeft: '5px', background: '#E67E22', color: '#fff', borderRadius: '10px', padding: '0 6px', fontSize: '0.7rem' }}>{pendingRequests.length}</span>}
        </button>
      </div>

      {/* ── BROWSE ── */}
      {activeTab === 'browse' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {PROJECTS.map(p => {
            const joined = acceptedIds.has(p.id);
            const requested = requestedIds.has(p.id);
            return (
              <div key={p.id} className="content-card" style={{ borderLeft: `3px solid ${p.color}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{p.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{p.title}</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: `${STATUS_COLORS[p.status]}15`, color: STATUS_COLORS[p.status] }}>{p.status}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '10px' }}>{p.desc}</p>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  🎓 {p.level} &nbsp;·&nbsp; Open roles: {p.roles.join(', ')}
                </div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {p.skills.map(s => <span key={s} style={{ padding: '2px 7px', borderRadius: '20px', fontSize: '0.7rem', background: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' }}>{s}</span>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Users size={14} /> {p.members.length}/{p.maxMembers} members
                  </div>
                  {joined ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: '700', color: '#27AE60' }}>
                      <CheckCircle size={14} /> Joined ✓
                    </div>
                  ) : requested ? (
                    <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#F39C12', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> Request Sent ✓
                    </div>
                  ) : (
                    <button className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }} onClick={() => setJoinModal(p)}>
                      {p.status === 'Recruiting' ? 'Request to Join' : 'View Project'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MY PROJECTS ── */}
      {activeTab === 'my' && (
        <div>
          {myProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛠️</div>
              <div style={{ fontWeight: '600', marginBottom: '6px' }}>No projects yet</div>
              <div style={{ fontSize: '0.84rem' }}>Request to join a project or start your own.</div>
              <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('browse')}>Browse Projects</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myProjects.map((mp, i) => {
                const proj = PROJECTS.find(p => p.id === mp.projectId);
                return (
                  <div key={i} className="content-card" style={{ padding: '18px 20px', borderLeft: `3px solid ${proj?.color || '#4A90E2'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: '3px' }}>{proj?.emoji} {mp.projectTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Role: {mp.role}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Joined on {mp.joinedAt}</div>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', background: '#E8FBF2', color: '#27AE60', fontSize: '0.76rem', fontWeight: '700' }}>Active Member ✓</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── JOIN REQUESTS (owner view) ── */}
      {activeTab === 'requests' && (
        <div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            As a project owner, you can review and accept/reject join requests below.
          </div>
          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📬</div>
              No join requests yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map((req, i) => {
                const proj = PROJECTS.find(p => p.id === req.projectId);
                return (
                  <div key={i} className="content-card" style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {proj?.emoji} {req.projectTitle}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          Role: {req.role} &nbsp;·&nbsp; Skills: {req.skills}
                        </div>
                        {req.message && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{req.message}"</div>}
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>Requested on {req.requestedAt}</div>
                      </div>
                      {req.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleAccept(req)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', background: '#E8FBF2', color: '#27AE60', fontWeight: '700', fontSize: '0.82rem', border: '1.5px solid #A9E6C5', cursor: 'pointer' }}>
                            <UserCheck size={14} /> Accept
                          </button>
                          <button onClick={() => handleReject(req)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', background: '#FDEDEC', color: '#E74C3C', fontWeight: '700', fontSize: '0.82rem', border: '1.5px solid #F5B5B0', cursor: 'pointer' }}>
                            <UserX size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', background: req.status === 'Accepted' ? '#E8FBF2' : '#FDEDEC', color: req.status === 'Accepted' ? '#27AE60' : '#E74C3C' }}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Join Request Modal */}
      {joinModal && <JoinRequestModal project={joinModal} onClose={() => setJoinModal(null)} onSubmit={handleJoinRequest} />}
    </div>
  );
};
