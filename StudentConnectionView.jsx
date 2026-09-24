import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, ThumbsUp, Search, Plus, X, CheckCircle, UserCheck, UserX, Send, Star, Zap } from 'lucide-react';

// ─── localStorage ──────────────────────────────────────────────────────────
const LS = {
  CONNECTIONS:  'll_connections',
  REQUESTS:     'll_connection_requests',
  CREDITS:      'll_learning_credits',
  DOUBTS:       'll_doubts',
};
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k) ?? JSON.stringify(d)); } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ─── Mock peers ──────────────────────────────────────────────────────────────
const PEERS = [
  { id: 'u1', name: 'Arjun Sharma',    level: 'Class 10', skills: ['Mathematics', 'Physics'], interests: ['Coding', 'Robotics'], streak: 15, solved: 120, bio: 'Love solving logic puzzles and building small projects.' },
  { id: 'u2', name: 'Priya Reddy',     level: 'Class 10', skills: ['English', 'Science'],    interests: ['Writing', 'Biology'],  streak: 8,  solved: 87,  bio: 'Passionate about science communication and creative writing.' },
  { id: 'u3', name: 'Rahul Nair',      level: 'Class 11', skills: ['Chemistry', 'Biology'],  interests: ['Medicine', 'Research'],streak: 22, solved: 210, bio: 'Aspiring doctor who loves chemistry experiments.' },
  { id: 'u4', name: 'Sneha Patel',     level: 'Class 10', skills: ['Maths', 'CS'],           interests: ['App Dev', 'AI'],        streak: 5,  solved: 64,  bio: 'Building my first mobile app — happy to collaborate!' },
  { id: 'u5', name: 'Vikram Suresh',   level: 'Class 12', skills: ['Physics', 'Maths'],      interests: ['Space', 'Engineering'], streak: 18, solved: 175, bio: 'Interested in aerospace and competitive maths.' },
  { id: 'u6', name: 'Kavya Iyer',      level: 'Class 11', skills: ['English', 'Social Sc'], interests: ['History', 'Debate'],    streak: 10, solved: 92,  bio: 'Debate enthusiast and history buff.' },
];

const SEED_DOUBTS = [
  { id: 'd1', question: 'How to solve quadratic equations using the quadratic formula?', subject: 'Mathematics', level: 'Class 10', replies: 4, upvotes: 12, time: '2h ago', answered: true, postedBy: 'Arjun Sharma' },
  { id: 'd2', question: 'What is the difference between prokaryotes and eukaryotes?', subject: 'Science', level: 'Class 10', replies: 2, upvotes: 9, time: '4h ago', answered: false, postedBy: 'Priya Reddy' },
  { id: 'd3', question: 'Can someone explain the types of sentences in English grammar?', subject: 'English', level: 'Class 10', replies: 7, upvotes: 15, time: '6h ago', answered: true, postedBy: 'Sneha Patel' },
  { id: 'd4', question: 'How does photosynthesis work at the molecular level?', subject: 'Science', level: 'Class 10', replies: 1, upvotes: 6, time: '1d ago', answered: false, postedBy: 'Rahul Nair' },
  { id: 'd5', question: 'What is the significance of the French Revolution for modern democracy?', subject: 'Social Science', level: 'Class 10', replies: 3, upvotes: 8, time: '1d ago', answered: false, postedBy: 'Kavya Iyer' },
];

const SUBJECT_COLORS = {
  Mathematics: '#4A90E2', Science: '#9B59B6', English: '#27AE60',
  'Social Science': '#E67E22', Chemistry: '#E74C3C', Biology: '#1ABC9C',
  Physics: '#3498DB', 'Computer Science': '#F39C12',
};

// ─── Post Doubt Modal ─────────────────────────────────────────────────────────
const PostDoubtModal = ({ onClose, onSubmit }) => {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [level, setLevel] = useState('Class 10');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (question.trim().length < 10) { setError('Please write a more detailed question (at least 10 characters).'); return; }
    onSubmit({ question, subject, level });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,41,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '16px' }}>
      <div style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-xl)', animation: 'scaleIn 0.2s ease', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.1rem' }}>Post a Doubt 🤔</div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontWeight: '600', fontSize: '0.82rem', display: 'block', marginBottom: '5px' }}>Your Question *</label>
            <textarea className="form-input" rows={4} value={question} onChange={e => { setQuestion(e.target.value); setError(''); }}
              placeholder="Describe your doubt clearly..." style={{ resize: 'vertical' }} />
            {error && <div style={{ fontSize: '0.72rem', color: '#E74C3C', marginTop: '3px' }}>{error}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontWeight: '600', fontSize: '0.82rem', display: 'block', marginBottom: '5px' }}>Subject</label>
              <select className="form-input" value={subject} onChange={e => setSubject(e.target.value)}>
                {Object.keys(SUBJECT_COLORS).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: '600', fontSize: '0.82rem', display: 'block', marginBottom: '5px' }}>Level</label>
              <select className="form-input" value={level} onChange={e => setLevel(e.target.value)}>
                {['Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12','College'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} style={{ flex: 2, justifyContent: 'center' }}><Send size={14} /> Post Doubt</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Credit Toast ─────────────────────────────────────────────────────────────
const CreditToast = ({ visible }) => (
  visible ? (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9000,
      background: '#1A2332', color: '#fff', padding: '12px 20px', borderRadius: '12px',
      display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      animation: 'scaleIn 0.25s ease', fontSize: '0.86rem', fontWeight: '600',
    }}>
      <Zap size={16} color="#F39C12" />
      You earned <span style={{ color: '#F39C12', fontWeight: '800' }}>+10 Learning Credits</span> for helping a student!
    </div>
  ) : null
);

// ─── Main View ────────────────────────────────────────────────────────────────
export const StudentConnectionView = () => {
  const [activeTab, setActiveTab] = useState('doubts');
  const [connections, setConnections]   = useState(() => load(LS.CONNECTIONS, []));
  const [connRequests, setConnRequests] = useState(() => load(LS.REQUESTS, []));
  const [credits, setCredits]           = useState(() => load(LS.CREDITS, 0));
  const [doubts, setDoubts]             = useState(() => load(LS.DOUBTS, SEED_DOUBTS));
  const [showPostDoubt, setShowPostDoubt] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [toast, setToast] = useState(false);
  const [upvoted, setUpvoted] = useState({});

  useEffect(() => { save(LS.CONNECTIONS, connections); }, [connections]);
  useEffect(() => { save(LS.REQUESTS, connRequests); }, [connRequests]);
  useEffect(() => { save(LS.CREDITS, credits); }, [credits]);
  useEffect(() => { save(LS.DOUBTS, doubts); }, [doubts]);

  const connectedIds = new Set(connections.map(c => c.id));
  const requestedIds = new Set(connRequests.filter(r => r.direction === 'out' && r.status !== 'Rejected').map(r => r.peerId));
  const incomingPending = connRequests.filter(r => r.direction === 'in' && r.status === 'Pending');

  const handleConnect = (peer) => {
    if (connectedIds.has(peer.id) || requestedIds.has(peer.id)) return;
    setConnRequests(prev => [...prev, { peerId: peer.id, peerName: peer.name, direction: 'out', status: 'Pending', sentAt: new Date().toLocaleDateString('en-IN') }]);
  };

  const handleAccept = (req) => {
    setConnRequests(prev => prev.map(r => r === req ? { ...r, status: 'Accepted' } : r));
    const peer = PEERS.find(p => p.id === req.peerId) || { id: req.peerId, name: req.peerName };
    setConnections(prev => [...prev, { id: peer.id, name: peer.name, connectedAt: new Date().toLocaleDateString('en-IN') }]);
  };

  const handleReject = (req) => {
    setConnRequests(prev => prev.map(r => r === req ? { ...r, status: 'Rejected' } : r));
  };

  const handleHelp = (doubtId) => {
    setDoubts(prev => prev.map(d => d.id === doubtId ? { ...d, answered: true, replies: d.replies + 1 } : d));
    setCredits(prev => prev + 10);
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  };

  const handleUpvote = (doubtId) => {
    if (upvoted[doubtId]) return;
    setDoubts(prev => prev.map(d => d.id === doubtId ? { ...d, upvotes: d.upvotes + 1 } : d));
    setUpvoted(prev => ({ ...prev, [doubtId]: true }));
  };

  const handlePostDoubt = ({ question, subject, level }) => {
    const newDoubt = { id: `d${Date.now()}`, question, subject, level, replies: 0, upvotes: 0, time: 'Just now', answered: false, postedBy: 'You' };
    setDoubts(prev => [newDoubt, ...prev]);
  };

  const filteredPeers = PEERS.filter(p =>
    !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.skills.some(s => s.toLowerCase().includes(searchQ.toLowerCase())) ||
    p.interests.some(i => i.toLowerCase().includes(searchQ.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Student Connection 🤝</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ask doubts, help peers, and build your learning network.</p>
        </div>
        {credits > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: '#FEF9ED', border: '1.5px solid #FDD49B', fontSize: '0.84rem', fontWeight: '700', color: '#92600A' }}>
            <Zap size={15} color="#F39C12" /> {credits} Learning Credits
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-row" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${activeTab === 'doubts' ? 'active' : ''}`} onClick={() => setActiveTab('doubts')}>Doubt Wall</button>
        <button className={`tab-btn ${activeTab === 'peers' ? 'active' : ''}`} onClick={() => setActiveTab('peers')}>Find Peers</button>
        <button className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>
          My Connections {connections.length > 0 && <span style={{ marginLeft: '5px', background: '#4A90E2', color: '#fff', borderRadius: '10px', padding: '0 6px', fontSize: '0.7rem' }}>{connections.length}</span>}
        </button>
        {incomingPending.length > 0 && (
          <button className={`tab-btn ${activeTab === 'incoming' ? 'active' : ''}`} onClick={() => setActiveTab('incoming')}>
            Requests <span style={{ marginLeft: '5px', background: '#E74C3C', color: '#fff', borderRadius: '10px', padding: '0 6px', fontSize: '0.7rem' }}>{incomingPending.length}</span>
          </button>
        )}
      </div>

      {/* ── DOUBT WALL ── */}
      {activeTab === 'doubts' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" placeholder="Search doubts..." style={{ paddingLeft: '36px' }} value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={() => setShowPostDoubt(true)} style={{ flexShrink: 0 }}>
              <Plus size={15} /> Post Doubt
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {doubts
              .filter(d => !searchQ || d.question.toLowerCase().includes(searchQ.toLowerCase()) || d.subject.toLowerCase().includes(searchQ.toLowerCase()))
              .map(d => (
              <div key={d.id} className="content-card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.94rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{d.question}</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ padding: '2px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600', background: `${SUBJECT_COLORS[d.subject] || '#4A90E2'}15`, color: SUBJECT_COLORS[d.subject] || '#4A90E2' }}>{d.subject}</span>
                      <span style={{ padding: '2px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600', background: '#F4ECF8', color: '#9B59B6' }}>{d.level}</span>
                      {d.answered && <span style={{ padding: '2px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600', background: '#E8FBF2', color: '#27AE60' }}>✓ Answered</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={13} /> {d.replies} replies</span>
                      <button onClick={() => handleUpvote(d.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: upvoted[d.id] ? '#4A90E2' : 'var(--text-muted)', fontWeight: upvoted[d.id] ? '700' : '400', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <ThumbsUp size={13} /> {d.upvotes}
                      </button>
                      <span>{d.time}</span>
                      {d.postedBy && <span>by {d.postedBy}</span>}
                    </div>
                  </div>
                  {!d.answered && (
                    <button onClick={() => handleHelp(d.id)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: '8px', background: '#EBF3FD', color: '#4A90E2', fontWeight: '700', fontSize: '0.8rem', border: '1.5px solid #BFDFFF', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#4A90E2'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#EBF3FD'; e.currentTarget.style.color = '#4A90E2'; }}>
                      Help Student +10 ⚡
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FIND PEERS ── */}
      {activeTab === 'peers' && (
        <div>
          <div style={{ marginBottom: '14px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search by name, skill, or interest..." style={{ paddingLeft: '36px' }} value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' }}>
            {filteredPeers.map((p, i) => {
              const connected = connectedIds.has(p.id);
              const requested = requestedIds.has(p.id);
              return (
                <div key={p.id} className="content-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `hsl(${i * 57}, 60%, 60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '1.1rem', flexShrink: 0 }}>
                      {p.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{p.level}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.4' }}>{p.bio}</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {p.skills.map(s => <span key={s} style={{ padding: '2px 7px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '600', background: '#EBF3FD', color: '#4A90E2' }}>{s}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {p.interests.map(s => <span key={s} style={{ padding: '2px 7px', borderRadius: '20px', fontSize: '0.68rem', background: '#F4ECF8', color: '#9B59B6' }}>{s}</span>)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    <span>🔥 {p.streak}d streak</span><span>✅ {p.solved} solved</span>
                  </div>
                  {connected ? (
                    <div style={{ width: '100%', padding: '8px', textAlign: 'center', background: '#E8FBF2', color: '#27AE60', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem' }}>
                      CONNECTED ✓
                    </div>
                  ) : requested ? (
                    <div style={{ width: '100%', padding: '8px', textAlign: 'center', background: '#FEF9ED', color: '#F39C12', borderRadius: '8px', fontWeight: '600', fontSize: '0.82rem' }}>
                      Request Sent ✓
                    </div>
                  ) : (
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }} onClick={() => handleConnect(p)}>
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MY CONNECTIONS ── */}
      {activeTab === 'connections' && (
        <div>
          {connections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🤝</div>
              <div style={{ fontWeight: '600', marginBottom: '6px' }}>No connections yet</div>
              <div style={{ fontSize: '0.84rem' }}>Find peers and send connection requests to build your network.</div>
              <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('peers')}>Find Peers</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
              {connections.map((c, i) => {
                const peer = PEERS.find(p => p.id === c.id) || { name: c.name, level: '', skills: [] };
                return (
                  <div key={i} className="content-card" style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `hsl(${i * 70}, 60%, 60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '1rem' }}>
                        {peer.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{peer.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{peer.level}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {peer.skills?.map(s => <span key={s} style={{ padding: '2px 7px', borderRadius: '20px', fontSize: '0.68rem', background: '#EBF3FD', color: '#4A90E2' }}>{s}</span>)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Connected on {c.connectedAt}</div>
                    <button style={{ marginTop: '10px', width: '100%', padding: '7px', borderRadius: '8px', background: '#EBF3FD', color: '#4A90E2', fontSize: '0.78rem', fontWeight: '600', border: '1px solid #BFDFFF', cursor: 'pointer' }}
                      onClick={() => { setActiveTab('doubts'); }}>
                      Ask Doubt Together
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── INCOMING REQUESTS ── */}
      {activeTab === 'incoming' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {incomingPending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No pending requests.</div>
          ) : incomingPending.map((req, i) => {
            const peer = PEERS.find(p => p.id === req.peerId) || { name: req.peerName, skills: [] };
            return (
              <div key={i} className="content-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `hsl(${i * 70 + 30}, 60%, 60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700' }}>
                    {peer.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{peer.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Wants to connect · {req.sentAt}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAccept(req)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', background: '#E8FBF2', color: '#27AE60', fontWeight: '700', fontSize: '0.82rem', border: '1.5px solid #A9E6C5', cursor: 'pointer' }}>
                    <UserCheck size={14} /> Accept
                  </button>
                  <button onClick={() => handleReject(req)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', background: '#FDEDEC', color: '#E74C3C', fontWeight: '700', fontSize: '0.82rem', border: '1.5px solid #F5B5B0', cursor: 'pointer' }}>
                    <UserX size={14} /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Doubt Modal */}
      {showPostDoubt && <PostDoubtModal onClose={() => setShowPostDoubt(false)} onSubmit={handlePostDoubt} />}

      {/* Credit Toast */}
      <CreditToast visible={toast} />
    </div>
  );
};
