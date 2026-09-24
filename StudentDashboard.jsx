import React, { useState } from 'react';
import {
  BookOpen, CheckSquare, BarChart3, Sparkles, ArrowRight,
  Flame, Target, TrendingUp, CheckCircle, Circle, Play,
  DownloadCloud, Briefcase, FolderKanban, Heart,
  Zap, Trophy, Activity, Bot, ChevronRight,
} from 'lucide-react';
import { FocusDashboardCard } from '../focusmode/FocusDashboardCard.jsx';
import { AiTutorModal } from '../ai/AiTutorModal.jsx';

// ─── SVG Progress Ring ──────────────────────────────────────────────────────
const ProgressRing = ({ pct = 68, size = 80, strokeWidth = 7, color = '#4A90E2' }) => {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const fontSize = Math.round(size * 0.19);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x="50%" y="50%"
        dominantBaseline="middle" textAnchor="middle"
        fill="var(--text-primary)" fontSize={fontSize} fontWeight="800"
        className="progress-ring-text"
        style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%', fontFamily: 'Outfit, sans-serif' }}
      >
        {pct}%
      </text>
    </svg>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// ─── Learning Loop Steps ────────────────────────────────────────────────────
const LOOP_STEPS = [
  { label: 'Learn',    emoji: '📚', color: 'var(--accent-primary)', bg: 'var(--accent-primary-light)' },
  { label: 'Practice', emoji: '✏️', color: 'var(--accent-green)', bg: 'var(--accent-green-light)' },
  { label: 'Track',   emoji: '📊', color: 'var(--accent-amber)', bg: 'var(--accent-amber-light)' },
  { label: 'Improve', emoji: '🎯', color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-light)' },
  { label: 'Achieve', emoji: '🏆', color: 'var(--accent-purple)', bg: 'var(--accent-purple-light)' },
];

// ─── Default mock data (used when API data is not yet loaded) ───────────────
const MOCK_COURSES = [
  { id: 'm1', title: 'Python Programming',  subtitle: 'AI & ML · Chapter 3',        progress: 72, emoji: '🐍', color: 'var(--accent-primary)', bg: 'var(--accent-primary-light)', lastActivity: '2 hours ago' },
  { id: 'm2', title: 'Data Structures',     subtitle: 'DSA · Arrays & Trees',        progress: 45, emoji: '🌲', color: 'var(--accent-green)', bg: 'var(--accent-green-light)', lastActivity: 'Yesterday' },
  { id: 'm3', title: 'Mathematics',         subtitle: 'Class 10 · Quadratic Eq.',    progress: 61, emoji: '📐', color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-light)', lastActivity: '3 hours ago' },
  { id: 'm4', title: 'C Programming',       subtitle: 'Fundamentals · Pointers',     progress: 28, emoji: '💻', color: 'var(--accent-purple)', bg: 'var(--accent-purple-light)', lastActivity: '1 day ago' },
];

const MOCK_TASKS = [
  { id: 't1', name: 'Watch: Python Functions (Video)',   time: '15 min' },
  { id: 't2', name: 'Practice: 10 Algebra Questions',   time: '20 min' },
  { id: 't3', name: 'Complete: C Programming Quiz',      time: '15 min' },
  { id: 't4', name: 'Review: Weak Topics (Pointers)',   time: '10 min' },
];

const MOCK_SUBJECTS = [
  { name: 'Mathematics',   pct: 68, color: 'var(--accent-primary)' },
  { name: 'Science',       pct: 54, color: 'var(--accent-purple)' },
  { name: 'English',       pct: 40, color: 'var(--accent-green)' },
  { name: 'C Programming', pct: 32, color: 'var(--accent-amber)' },
];

const CAREER_CARDS = [
  {
    emoji: '🎥', title: 'Interview Lab', tab: 'interview_lab', color: 'var(--accent-primary)', bg: 'var(--accent-primary-light)',
    desc: 'AI-powered mock interviews with instant feedback and performance scoring.',
    cta: 'Start Practicing',
  },
  {
    emoji: '💼', title: 'Internships', tab: 'internships', color: 'var(--accent-purple)', bg: 'var(--accent-purple-light)',
    desc: 'Real-world internship opportunities matched to your skills and interests.',
    cta: 'Explore Openings',
  },
  {
    emoji: '🤝', title: 'Project Collaboration', tab: 'projects', color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-light)',
    desc: 'Build projects with peers, contribute to open-source and grow your portfolio.',
    cta: 'Find Projects',
  },
];

const QUICK_ACCESS = [
  { emoji: '📚', label: 'Library',       tab: 'resources',          color: 'var(--accent-primary)' },
  { emoji: '🏆', label: 'Achievements',  tab: 'achievements',       color: 'var(--accent-purple)' },
  { emoji: '👥', label: 'Connect',       tab: 'student_connection', color: 'var(--accent-cyan)' },
  { emoji: '✅', label: 'Practice',      tab: 'practice',           color: 'var(--accent-green)' },
  { emoji: '📝', label: 'Tests',         tab: 'tests',              color: 'var(--accent-amber)' },
  { emoji: '⚙️', label: 'Settings',     tab: 'settings',           color: 'var(--text-secondary)' },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export const StudentDashboard = ({
  dashboardData,
  currentUser,
  onNavigate,
  onPracticeWeakTopic,
  onOpenFocus,
}) => {
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tasksDone, setTasksDone]     = useState({});

  // ── Data Extraction ──
  const firstName     = dashboardData?.user?.name?.split(' ')[0]
                     || currentUser?.name?.split(' ')[0]
                     || 'Student';
  const streak        = dashboardData?.student?.learningStreak
                     || dashboardData?.kpis?.currentStreak
                     || 7;
  const overallPct    = dashboardData?.kpis?.averageTestScore || 68;
  const courses       = dashboardData?.recommendations?.length
                     ? dashboardData.recommendations.slice(0, 4)
                     : MOCK_COURSES;
  const tasks         = dashboardData?.dailyGoal?.tasks || MOCK_TASKS;
  const subjects      = dashboardData?.topicPerformance?.slice(0, 4) || MOCK_SUBJECTS;

  const completedCount = Object.values(tasksDone).filter(Boolean).length;
  const taskPct        = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  // ── Streak week ──
  const DAYS        = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx    = new Date().getDay(); // 0 = Sunday
  const adjToday    = todayIdx === 0 ? 6 : todayIdx - 1;
  const streakDays  = DAYS.map((lbl, i) => ({
    lbl,
    done:    i < adjToday,
    isToday: i === adjToday,
  }));

  const toggleTask = (id) => setTasksDone(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="sdv2-root">

      {/* ══════════════════════════════════════════════
          1. HERO BANNER
      ══════════════════════════════════════════════ */}
      <div className="sdv2-hero">
        {/* Left content */}
        <div className="sdv2-hero-left">
          <div className="sdv2-hero-eyebrow">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 className="sdv2-hero-h1">{getGreeting()}, {firstName}! 👋</h1>
          <p className="sdv2-hero-subtitle">
            Keep building your skills today. You're on a great path!
          </p>
          <div className="sdv2-hero-pills">
            <span className="sdv2-pill sdv2-pill--flame">
              <Flame size={13} /> {streak} Day Streak
            </span>
            <span className="sdv2-pill sdv2-pill--blue">
              <TrendingUp size={13} /> {overallPct}% Progress
            </span>
            <span className="sdv2-pill sdv2-pill--ghost">
              <Target size={13} /> {completedCount}/{tasks.length} Done Today
            </span>
          </div>
          <div className="sdv2-hero-actions">
            <button
              id="hero-continue-learning-btn"
              className="sdv2-hero-btn-primary"
              onClick={() => onNavigate('courses')}
            >
              <Play size={15} /> Continue Learning
            </button>
            <button
              id="hero-open-ai-tutor-btn"
              className="sdv2-hero-btn-secondary"
              onClick={() => setIsTutorOpen(true)}
            >
              <Sparkles size={15} /> Open AI Tutor
            </button>
          </div>
        </div>

        {/* Right — ring + today's tasks */}
        <div className="sdv2-hero-right">
          <div className="sdv2-hero-ring-box">
            <ProgressRing pct={overallPct} size={88} strokeWidth={8} color="#60A5FA" />
            <div className="sdv2-hero-ring-label">Overall<br />Progress</div>
          </div>
          <div className="sdv2-hero-tasklist">
            <div className="sdv2-hero-tasklist-title">Today's Tasks</div>
            {tasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                className={`sdv2-hero-task${tasksDone[task.id] ? ' done' : ''}`}
                onClick={() => toggleTask(task.id)}
              >
                {tasksDone[task.id]
                  ? <CheckCircle size={13} style={{ color: '#60A5FA', flexShrink: 0 }} />
                  : <Circle size={13} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                }
                <span>{task.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          2. LEARNING LOOP IDENTITY STRIP
      ══════════════════════════════════════════════ */}
      <div className="sdv2-loop-strip">
        <div className="sdv2-loop-brand">
          <div className="sdv2-loop-brand-name">THE LEARNING LOOP</div>
          <div className="sdv2-loop-brand-tag">Where Your Every Contribution Counts</div>
        </div>
        <div className="sdv2-loop-flow">
          {LOOP_STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              <div
                className="sdv2-loop-step"
                style={{ '--step-color': step.color, '--step-bg': step.bg }}
              >
                <span className="sdv2-loop-emoji">{step.emoji}</span>
                <span className="sdv2-loop-lbl">{step.label}</span>
              </div>
              {i < LOOP_STEPS.length - 1 && (
                <span className="sdv2-loop-arrow">→</span>
              )}
            </React.Fragment>
          ))}
          <div className="sdv2-loop-repeat">↺</div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          3. CONTINUE LEARNING + AI TUTOR
      ══════════════════════════════════════════════ */}
      <div className="sdv2-main-row">

        {/* ── Continue Learning ── */}
        <div className="sdv2-card sdv2-main-col-wide">
          <div className="sdv2-card-hdr">
            <span className="sdv2-card-title">
              <BookOpen size={17} style={{ color: '#4A90E2' }} /> Continue Learning
            </span>
            <button className="sdv2-link-btn" onClick={() => onNavigate('courses')}>
              View All <ChevronRight size={13} />
            </button>
          </div>
          <div className="sdv2-course-grid">
            {courses.slice(0, 4).map((course, i) => {
              const pct   = course.progress ?? course.completionPercent ?? 0;
              const emoji = course.emoji || ['📐', '🔬', '📖', '🌍'][i % 4];
              const color = course.color || '#4A90E2';
              const bg    = course.bg    || '#EBF3FD';
              return (
                <div
                  key={course.id || i}
                  className="sdv2-cc"
                  style={{ '--cc': color, '--cc-bg': bg }}
                  onClick={() => onNavigate('courses')}
                >
                  <div className="sdv2-cc-row1">
                    <div className="sdv2-cc-icon">{emoji}</div>
                    <div className="sdv2-cc-info">
                      <div className="sdv2-cc-name">{course.title || course.name}</div>
                      <div className="sdv2-cc-sub">{course.subtitle || course.subject || ''}</div>
                    </div>
                    <div className="sdv2-cc-pct">{pct}%</div>
                  </div>
                  <div className="sdv2-cc-bar">
                    <div className="sdv2-cc-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="sdv2-cc-row2">
                    <span className="sdv2-cc-time">
                      <Activity size={11} /> {course.lastActivity || 'Recently'}
                    </span>
                    <span className="sdv2-cc-cta">{pct > 0 ? 'Continue' : 'Start'} →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AI Tutor Card ── */}
        <div className="sdv2-ai-card sdv2-main-col-narrow">
          <div className="sdv2-ai-top">
            <div className="sdv2-ai-icon-box"><Bot size={22} /></div>
            <div>
              <div className="sdv2-ai-name">AI Tutor</div>
              <div className="sdv2-ai-sub">No internet · No external API</div>
            </div>
          </div>
          <p className="sdv2-ai-desc">
            Ask questions, understand concepts, and learn at your own pace — powered entirely by the Learning Loops local knowledge base.
          </p>
          <div className="sdv2-ai-chips">
            {['⚛️ Physics', '📐 Maths', '🧪 Chemistry', '🌿 Biology', '💻 CS'].map(s => (
              <span key={s} className="sdv2-ai-chip">{s}</span>
            ))}
          </div>
          <button
            id="ai-card-open-tutor-btn"
            className="sdv2-ai-cta"
            onClick={() => setIsTutorOpen(true)}
          >
            <Sparkles size={16} /> Open AI Tutor
          </button>
          <div className="sdv2-ai-foot">
            <Zap size={12} /> Instant answers · Offline friendly
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          4. TODAY'S PLAN + YOUR PROGRESS
      ══════════════════════════════════════════════ */}
      <div className="sdv2-grid-2">

        {/* ── Today's Plan ── */}
        <div className="sdv2-card">
          <div className="sdv2-card-hdr">
            <span className="sdv2-card-title">
              <Target size={17} style={{ color: '#E67E22' }} /> Today's Plan
            </span>
            <span className="sdv2-badge-pct">{taskPct}% done</span>
          </div>
          <div className="sdv2-planbar">
            <div className="sdv2-planbar-fill" style={{ width: `${taskPct}%` }} />
          </div>
          <div className="sdv2-tasklist">
            {tasks.map(task => {
              const done = !!tasksDone[task.id];
              return (
                <div
                  key={task.id}
                  className={`sdv2-task${done ? ' done' : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <span className="sdv2-task-chk">
                    {done
                      ? <CheckCircle size={16} style={{ color: '#27AE60' }} />
                      : <Circle size={16} style={{ color: '#CBD5E0' }} />
                    }
                  </span>
                  <span className="sdv2-task-name">{task.name || task.topic}</span>
                  <span className="sdv2-task-time">{task.time || `${task.estimatedMinutes || 15}m`}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Your Progress ── */}
        <div className="sdv2-card">
          <div className="sdv2-card-hdr">
            <span className="sdv2-card-title">
              <BarChart3 size={17} style={{ color: '#9B59B6' }} /> Your Progress
            </span>
            <button className="sdv2-link-btn" onClick={() => onNavigate('progress')}>
              Details <ChevronRight size={13} />
            </button>
          </div>
          <div className="sdv2-prog-row">
            <div className="sdv2-ring-col">
              <ProgressRing pct={overallPct} size={78} strokeWidth={7} color="#9B59B6" />
              <div className="sdv2-ring-lbl">Overall</div>
            </div>
            <div className="sdv2-bars">
              {subjects.map((sub, i) => (
                <div key={i} className="sdv2-bar-row">
                  <div className="sdv2-bar-name">{sub.name || sub.topic}</div>
                  <div className="sdv2-bar-track">
                    <div
                      className="sdv2-bar-fill"
                      style={{ width: `${sub.pct ?? sub.score ?? 0}%`, background: sub.color || '#4A90E2' }}
                    />
                  </div>
                  <div className="sdv2-bar-num" style={{ color: sub.color || '#4A90E2' }}>
                    {sub.pct ?? sub.score ?? 0}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="sdv2-streak-week">
            {streakDays.map(day => (
              <div key={day.lbl} className="sdv2-streak-day">
                <div className="sdv2-streak-lbl">{day.lbl}</div>
                <div className={`sdv2-streak-dot${day.done ? ' done' : day.isToday ? ' today' : ''}`}>
                  {day.done ? '✓' : day.isToday ? '·' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          5. OFFLINE LEARNING — UNIQUE DIFFERENTIATOR
      ══════════════════════════════════════════════ */}
      <div className="sdv2-offline-card">
        <div className="sdv2-offline-body">
          <div className="sdv2-offline-icon"><DownloadCloud size={28} /></div>
          <div className="sdv2-offline-text">
            <div className="sdv2-offline-title">Learn Even Without Internet</div>
            <div className="sdv2-offline-desc">
              Learning Loops is built for India — works on 2G, low bandwidth, and completely offline.
              A key differentiator for rural and semi-urban students nationwide.
            </div>
            <div className="sdv2-offline-meta">
              <span>📥 24 lessons downloaded</span>
              <span>📝 8 offline notes</span>
              <span>🔄 Synced 2h ago</span>
            </div>
          </div>
        </div>
        <button
          id="offline-open-btn"
          className="sdv2-offline-btn"
          onClick={() => onNavigate('downloads')}
        >
          <DownloadCloud size={14} /> Open Offline Learning <ArrowRight size={13} />
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          6. CAREER & GROWTH
      ══════════════════════════════════════════════ */}
      <div className="sdv2-card">
        <div className="sdv2-card-hdr">
          <span className="sdv2-card-title">
            <Trophy size={17} style={{ color: '#F39C12' }} /> Career & Growth
          </span>
          <span className="sdv2-card-tagline">Build skills → Prove skills → Get opportunities</span>
        </div>
        <div className="sdv2-career-grid">
          {CAREER_CARDS.map(card => (
            <div
              key={card.tab}
              className="sdv2-career-card"
              style={{ '--crc': card.color, '--crb': card.bg }}
              onClick={() => onNavigate(card.tab)}
            >
              <div className="sdv2-career-emoji">{card.emoji}</div>
              <div className="sdv2-career-name">{card.title}</div>
              <div className="sdv2-career-desc">{card.desc}</div>
              <div className="sdv2-career-link">{card.cta} <ArrowRight size={13} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          7. FOCUS MODE + WELLBEING
      ══════════════════════════════════════════════ */}
      <div className="sdv2-grid-2">
        {/* Focus Mode — using existing FocusDashboardCard component */}
        <FocusDashboardCard onOpenFocus={onOpenFocus} />

        {/* Wellbeing Card */}
        <div className="sdv2-wb-card">
          <div className="sdv2-wb-hdr">
            <Heart size={17} style={{ color: '#E91E63' }} />
            <span className="sdv2-card-title-inline">Student Wellbeing</span>
          </div>
          <p className="sdv2-wb-msg">
            Learning doesn't always go as planned — and that's perfectly okay. Here are some ways to get back on track.
          </p>
          <div className="sdv2-wb-actions">
            {[
              { icon: <CheckSquare size={14} />, label: 'Review Mistakes', action: () => onNavigate('practice') },
              { icon: <Bot size={14} />,          label: 'Ask AI Tutor',   action: () => setIsTutorOpen(true) },
              { icon: <Heart size={14} />,         label: 'Take a Break',  action: () => onNavigate('wellbeing') },
            ].map((b, i) => (
              <button key={i} className="sdv2-wb-btn" onClick={b.action}>
                {b.icon} {b.label}
              </button>
            ))}
          </div>
          <div className="sdv2-wb-quote">"Progress, not perfection."</div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          8. QUICK ACCESS
      ══════════════════════════════════════════════ */}
      <div className="sdv2-card">
        <div className="sdv2-card-hdr">
          <span className="sdv2-card-title">
            <Zap size={17} style={{ color: '#F39C12' }} /> Quick Access
          </span>
        </div>
        <div className="sdv2-qa-grid">
          {QUICK_ACCESS.map(item => (
            <div
              key={item.tab}
              id={`quick-access-${item.tab}`}
              className="sdv2-qa-card"
              style={{ '--qa-c': item.color }}
              onClick={() => onNavigate(item.tab)}
            >
              <span className="sdv2-qa-emoji">{item.emoji}</span>
              <span className="sdv2-qa-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Tutor Modal ── */}
      {isTutorOpen && <AiTutorModal onClose={() => setIsTutorOpen(false)} />}
    </div>
  );
};
