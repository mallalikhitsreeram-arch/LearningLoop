import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, RefreshCw, BookOpen, MessageSquare, Target, Heart, Wind, Sun, Moon, Music, Activity } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CHALLENGES = [
  { id: 'understand', label: "I couldn't understand the topics", icon: '📖' },
  { id: 'time',      label: "I didn't have enough time to prepare", icon: '⏰' },
  { id: 'forgot',    label: "I forgot what I studied", icon: '🧠' },
  { id: 'difficult', label: "The questions were too difficult", icon: '❓' },
  { id: 'distracted',label: "I was distracted", icon: '📱' },
  { id: 'schedule',  label: "I couldn't manage my study schedule", icon: '📅' },
  { id: 'pressure',  label: "I feel pressured about my results", icon: '😥' },
  { id: 'start',     label: "I'm not sure where to start", icon: '🔍' },
  { id: 'other',     label: "Other", icon: '💬' },
];

const CHALLENGE_INSIGHTS = {
  understand: {
    title: "Understanding Gaps",
    insight: "That happens when a topic's foundation is unclear. Instead of trying to cover everything again, let's identify the exact concept causing difficulty.",
    causes: ["Missing foundational concepts", "Not enough worked examples", "Content moved too fast", "Need visual/practical explanation"],
    steps: [
      { icon: '📚', label: 'Review the basics', desc: 'Go back to the core concept, not the advanced material.' },
      { icon: '🎥', label: 'Watch a short explanation', desc: 'Sometimes a 5-minute video works better than 30 minutes of reading.' },
      { icon: '✏️', label: 'Try 5 easy questions', desc: 'Build confidence from the ground up.' },
      { icon: '📈', label: 'Try 5 medium questions', desc: 'Gradually increase difficulty.' },
      { icon: '💬', label: 'Ask for help', desc: 'Ask an AI, a student, or your teacher.' },
      { icon: '🔄', label: 'Retake a short practice test', desc: 'Measure your improvement.' },
    ],
  },
  time: {
    title: "Time Management",
    insight: "Preparation time matters, but smart preparation matters more. Let's plan a focused study schedule around your available time.",
    causes: ["No structured study plan", "Too many topics at once", "Underestimating preparation time", "Distractions during study time"],
    steps: [
      { icon: '📋', label: 'List your weak topics', desc: 'Focus only on what matters most, not everything.' },
      { icon: '⏱️', label: 'Use Pomodoro technique', desc: '25 minutes focused + 5 minute break — repeat.' },
      { icon: '🎯', label: 'Set a daily practice goal', desc: 'Even 30 minutes of focused practice beats 3 hours of distracted studying.' },
      { icon: '📅', label: 'Create a 7-day plan', desc: 'Assign specific topics to specific days.' },
      { icon: '🔁', label: 'Review the night before', desc: 'A quick 15-minute revision before sleeping greatly improves retention.' },
    ],
  },
  forgot: {
    title: "Memory & Retention",
    insight: "Forgetting is completely normal — it's how our brains work. The key is a revision strategy, not just more reading.",
    causes: ["Passive reading without active recall", "No spaced repetition", "Too much content in one session", "Not connecting concepts"],
    steps: [
      { icon: '🔁', label: 'Spaced repetition', desc: 'Revise after 1 day, 3 days, 7 days, then 1 month.' },
      { icon: '📝', label: 'Write notes in your own words', desc: 'Summarise what you learned — don\'t copy.' },
      { icon: '🃏', label: 'Make simple flashcards', desc: 'Question on one side, answer on the other.' },
      { icon: '🎙️', label: 'Teach it to yourself', desc: 'Explain the concept out loud as if teaching someone else.' },
      { icon: '🌙', label: 'Sleep after studying', desc: 'Your brain consolidates memory during sleep.' },
    ],
  },
  difficult: {
    title: "Difficult Questions",
    insight: "Difficult questions are a sign that you're ready to grow. The goal isn't to get everything right — it's to understand where you went wrong.",
    causes: ["Questions required application, not just recall", "New question formats or patterns", "Insufficient practice with varied questions", "Time pressure during the test"],
    steps: [
      { icon: '🔍', label: 'Analyse wrong answers', desc: 'Understand why each answer was wrong, not just what the right answer is.' },
      { icon: '📚', label: 'Study the question pattern', desc: 'Practice similar questions from the same chapter.' },
      { icon: '✏️', label: 'Solve step by step', desc: 'Don\'t jump to answers — break each problem down slowly.' },
      { icon: '⏰', label: 'Practise timed sets', desc: 'Build speed and accuracy under time conditions.' },
      { icon: '🤝', label: 'Discuss with a peer', desc: 'Sometimes a different explanation helps.' },
    ],
  },
  distracted: {
    title: "Focus & Distractions",
    insight: "Distractions are everywhere — but they can be managed. Small environment changes have a big impact on focus.",
    causes: ["Phone notifications during study time", "Noisy or uncomfortable study environment", "Mental fatigue or overload", "No clear study goal for the session"],
    steps: [
      { icon: '📵', label: 'Phone-free sessions', desc: 'Put your phone in another room for 25-minute blocks.' },
      { icon: '🎯', label: 'Set a micro-goal', desc: 'Before starting: "I will complete 5 questions from Chapter 3."' },
      { icon: '🎧', label: 'Use ambient sounds', desc: 'Light instrumental music or white noise can reduce distractions.' },
      { icon: '🪑', label: 'Change your study space', desc: 'A small change in environment can reset your focus.' },
      { icon: '🎯', label: 'Try Focus Mode', desc: 'Use the built-in Focus Mode to stay on track.' },
    ],
  },
  schedule: {
    title: "Study Schedule",
    insight: "Without a plan, every day feels like starting from scratch. A simple structure makes a big difference.",
    causes: ["No daily/weekly study routine", "Too many subjects without prioritisation", "Inconsistent study times", "Skipping revision sessions"],
    steps: [
      { icon: '📅', label: 'Build a weekly timetable', desc: 'Assign subjects to specific time slots each day.' },
      { icon: '🏆', label: 'Prioritise weak subjects', desc: 'Spend more time on topics where you score lowest.' },
      { icon: '🔁', label: 'Stick to a consistent time', desc: 'Study at the same time each day to build a habit.' },
      { icon: '✅', label: 'Daily task list', desc: 'Write 3 specific tasks each morning and tick them off.' },
      { icon: '🌟', label: 'Celebrate small wins', desc: 'Reward yourself when you complete your daily goal.' },
    ],
  },
  pressure: {
    title: "Performance Pressure",
    insight: "Feeling pressured about results is very common. It's important to know that your score does not define your intelligence or your future.",
    causes: ["High expectations from self or others", "Comparing results with classmates", "Fear of disappointing family", "All-or-nothing thinking"],
    steps: [
      { icon: '🌱', label: 'Progress over perfection', desc: 'Focus on improving by even 5% — not on getting everything right.' },
      { icon: '💬', label: 'Talk to someone', desc: 'Share your feelings with a trusted friend, teacher, or parent.' },
      { icon: '📊', label: 'Look at your progress', desc: 'Compare yourself to your past self, not to others.' },
      { icon: '🧘', label: 'Take a breathing break', desc: 'A 2-minute breathing exercise can reduce stress immediately.' },
      { icon: '🎯', label: 'Set realistic goals', desc: 'Small, achievable milestones build confidence.' },
    ],
  },
  start: {
    title: "Getting Started",
    insight: "Not knowing where to start is one of the most common feelings — and it's completely fixable with a simple first step.",
    causes: ["Feeling overwhelmed by the syllabus", "No clear starting point", "Too many topics seem equally important", "Procrastination"],
    steps: [
      { icon: '📋', label: 'List what you know', desc: 'Write down topics you already understand. That\'s your foundation.' },
      { icon: '📍', label: 'Pick the easiest topic first', desc: 'A quick win builds momentum.' },
      { icon: '⏱️', label: 'Start with just 10 minutes', desc: 'Tell yourself: "I\'ll study for just 10 minutes." You\'ll often keep going.' },
      { icon: '🤖', label: 'Ask AI for a study plan', desc: 'Our AI assistant can create a personalised plan for you.' },
      { icon: '📅', label: 'Create a simple schedule', desc: 'Divide your syllabus into small daily chunks.' },
    ],
  },
  other: {
    title: "Your Situation",
    insight: "Every student's challenge is unique. What matters is that you've taken the first step by recognising something is difficult.",
    causes: ["Personal circumstances affecting study", "Health or wellbeing issues", "Unexpected life events", "Multiple compounding factors"],
    steps: [
      { icon: '💬', label: 'Talk to someone', desc: 'A teacher, counsellor, or trusted adult can provide real support.' },
      { icon: '🌱', label: 'Be kind to yourself', desc: 'Struggles are part of learning. You\'re doing your best.' },
      { icon: '🎯', label: 'Take one small step', desc: 'Even studying for 15 minutes today is progress.' },
      { icon: '🧘', label: 'Take a reset', desc: 'Try a breathing or mindfulness exercise from the section below.' },
    ],
  },
};

// ─── Breathing Exercise ────────────────────────────────────────────────────────
const BreathingExercise = ({ onDone }) => {
  const PHASES = [
    { label: 'Inhale', duration: 4, color: '#4A90E2', bg: '#EBF3FD' },
    { label: 'Hold', duration: 4, color: '#9B59B6', bg: '#F4ECF8' },
    { label: 'Exhale', duration: 6, color: '#27AE60', bg: '#E8FBF2' },
  ];
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);
  const TOTAL_CYCLES = 4; // about 2 minutes

  useEffect(() => {
    const phase = PHASES[phaseIdx];
    const totalMs = phase.duration * 1000;
    const step = 50;
    const inc = (step / totalMs) * 100;
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p + inc >= 100) {
          const nextPhase = (phaseIdx + 1) % PHASES.length;
          const nextCycle = nextPhase === 0 ? cycle + 1 : cycle;
          if (nextCycle >= TOTAL_CYCLES) { clearInterval(intervalRef.current); setDone(true); return 100; }
          setPhaseIdx(nextPhase);
          setCycle(nextCycle);
          return 0;
        }
        return p + inc;
      });
    }, step);
    return () => clearInterval(intervalRef.current);
  }, [phaseIdx]);

  const phase = PHASES[phaseIdx];
  const size = 160;
  const r = 65;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Well done!</div>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>You completed 4 breathing cycles. Feel a little calmer?</div>
        <button className="btn-primary" onClick={onDone}>Continue →</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Cycle {cycle + 1} of {TOTAL_CYCLES}</div>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', margin: '0 auto', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-surface-subtle)" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={phase.color} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: `stroke-dashoffset 0.05s linear, stroke 0.5s ease` }} />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fill={phase.color} fontSize="22" fontWeight="800" fontFamily="Outfit, sans-serif"
          style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}>
          {phase.label}
        </text>
        <text x="50%" y="63%" dominantBaseline="middle" textAnchor="middle"
          fill="var(--text-muted)" fontSize="13" fontFamily="Outfit, sans-serif"
          style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}>
          {phase.duration}s
        </text>
      </svg>
      <div style={{ marginTop: '16px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
        {phase.label === 'Inhale' ? 'Breathe in slowly through your nose...' : phase.label === 'Hold' ? 'Hold gently...' : 'Breathe out slowly through your mouth...'}
      </div>
    </div>
  );
};

// ─── Main Reset Room View ──────────────────────────────────────────────────────
export const WellbeingView = ({ onNavigate, initialChallenge }) => {
  const [step, setStep] = useState(initialChallenge ? 2 : 1); // 1=mood, 2=challenge, 3=insight, 4=solutions, 5=reset, 6=return
  const [mood, setMood] = useState(null);
  const [selectedChallenges, setSelectedChallenges] = useState(initialChallenge ? [initialChallenge] : []);
  const [customNote, setCustomNote] = useState('');
  const [activeReset, setActiveReset] = useState(null);
  const [completedResets, setCompletedResets] = useState([]);

  const primaryChallenge = selectedChallenges[0];
  const insight = primaryChallenge ? CHALLENGE_INSIGHTS[primaryChallenge] : null;

  const MOODS = [
    { label: 'Great', emoji: '😄', value: 5, color: '#27AE60' },
    { label: 'Good', emoji: '🙂', value: 4, color: '#4A90E2' },
    { label: 'Okay', emoji: '😐', value: 3, color: '#F39C12' },
    { label: 'Stressed', emoji: '😟', value: 2, color: '#E67E22' },
    { label: 'Overwhelmed', emoji: '😣', value: 1, color: '#E74C3C' },
  ];

  const toggleChallenge = (id) => {
    setSelectedChallenges(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const RESET_ACTIVITIES = [
    { id: 'breathing', label: '2-Minute Breathing', emoji: '🌬️', desc: 'Calm your nervous system with a guided breathing exercise.' },
    { id: 'movement', label: '5-Minute Movement Break', emoji: '🏃', desc: 'Stand up, stretch, and reset your body and mind.' },
    { id: 'braindump', label: 'Brain Dump', emoji: '📝', desc: 'Write everything on your mind — no filter, no rules.' },
    { id: 'gratitude', label: '3 Things I\'m Grateful For', emoji: '🌟', desc: 'A quick gratitude moment to shift your mindset.' },
    { id: 'music', label: '5-Minute Calm Music', emoji: '🎵', desc: 'Close your eyes and listen to something peaceful.' },
  ];

  const [brainDumpText, setBrainDumpText] = useState('');
  const [gratitude, setGratitude] = useState(['', '', '']);

  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
      {['Mood', 'Challenge', 'Insight', 'Solutions', 'Reset', 'Forward'].map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600',
            background: step === i + 1 ? '#4A90E2' : step > i + 1 ? '#E8FBF2' : 'var(--bg-surface-subtle)',
            color: step === i + 1 ? '#fff' : step > i + 1 ? '#27AE60' : 'var(--text-muted)',
          }}>{s}</div>
          {i < 5 && <div style={{ width: '16px', height: '1px', background: 'var(--border-subtle)' }} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '4px' }}>
          🧘 The Reset Room
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Understand the challenge. Take a breath. Make a plan. Try again.
        </p>
      </div>

      <StepIndicator />

      {/* ── STEP 1: MOOD CHECK ── */}
      {step === 1 && (
        <div className="content-card" style={{ background: 'linear-gradient(135deg, #F0F7FF, #FFF0F7)', border: '1.5px solid #BFDFFF' }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
            How are you feeling right now? 🌟
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            There's no wrong answer — just be honest with yourself.
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            {MOODS.map(m => (
              <button key={m.value} onClick={() => setMood(m.value)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                padding: '14px 18px', borderRadius: '14px', border: `2px solid ${mood === m.value ? m.color : 'var(--border-subtle)'}`,
                background: mood === m.value ? `${m.color}15` : 'var(--bg-surface)', cursor: 'pointer',
                transform: mood === m.value ? 'translateY(-2px)' : 'none', transition: 'all 0.15s ease',
              }}>
                <span style={{ fontSize: '1.9rem' }}>{m.emoji}</span>
                <span style={{ fontSize: '0.76rem', fontWeight: '700', color: mood === m.value ? m.color : 'var(--text-muted)' }}>{m.label}</span>
              </button>
            ))}
          </div>
          {mood && (
            <>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center' }}>
                {mood >= 4 ? "That's great to hear! You're in a good place to learn. 🌟" :
                 mood === 3 ? "You're doing okay. Let's make sure you have what you need. 💪" :
                 mood === 2 ? "It's okay to feel stressed. Let's understand what's happening and find a way forward. 🌱" :
                 "Being overwhelmed is a signal your mind needs a reset. You're in the right place. Let's work through this together. 🤝"}
              </div>
              {mood <= 3 ? (
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep(2)}>
                  Let's Work Through It <ArrowRight size={15} />
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>Explore Reset Room</button>
                  <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={() => onNavigate?.('dashboard')}>
                    Continue Learning <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── STEP 2: CHALLENGE SELECTION ── */}
      {step === 2 && (
        <div className="content-card">
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>
            What are you experiencing? 🔍
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Select all that apply — the more you share, the better we can help.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {CHALLENGES.map(c => (
              <button key={c.id} onClick={() => toggleChallenge(c.id)} style={{
                padding: '12px 14px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                border: `2px solid ${selectedChallenges.includes(c.id) ? '#4A90E2' : 'var(--border-subtle)'}`,
                background: selectedChallenges.includes(c.id) ? '#EBF3FD' : 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease',
              }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{c.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: selectedChallenges.includes(c.id) ? '700' : '500', color: selectedChallenges.includes(c.id) ? '#4A90E2' : 'var(--text-primary)' }}>{c.label}</span>
              </button>
            ))}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.82rem', display: 'block', marginBottom: '5px' }}>Tell us more (optional)</label>
            <textarea className="form-input" rows={3} value={customNote} onChange={e => setCustomNote(e.target.value)}
              placeholder="Describe what happened in your own words..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ArrowLeft size={14} /> Back
            </button>
            <button className="btn-primary" disabled={selectedChallenges.length === 0} onClick={() => setStep(3)} style={{ flex: 1, justifyContent: 'center', opacity: selectedChallenges.length === 0 ? 0.5 : 1 }}>
              Understand the Challenge <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: CHALLENGE INSIGHT ── */}
      {step === 3 && insight && (
        <div>
          <div className="content-card" style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #F0F7FF, #fff)', border: '1.5px solid #BFDFFF' }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '800', marginBottom: '10px' }}>
              🔍 Let's Understand the Challenge
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              {insight.insight}
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.84rem', marginBottom: '8px' }}>Possible causes:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {insight.causes.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4A90E2', flexShrink: 0 }} /> {c}
                </div>
              ))}
            </div>
          </div>
          {selectedChallenges.length > 1 && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              You also selected: {selectedChallenges.slice(1).map(id => CHALLENGES.find(c => c.id === id)?.label).join(', ')}. We'll address the most impactful one first.
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ArrowLeft size={14} /> Back</button>
            <button className="btn-primary" onClick={() => setStep(4)} style={{ flex: 1, justifyContent: 'center' }}>See My Action Plan <ArrowRight size={15} /></button>
          </div>
        </div>
      )}

      {/* ── STEP 4: SOLUTIONS ── */}
      {step === 4 && insight && (
        <div className="content-card">
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>
            🎯 Let's Overcome It
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Practical steps to move forward with confidence.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {insight.steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4A90E2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.86rem', color: 'var(--text-primary)' }}>{s.icon} {s.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button className="btn-primary" style={{ fontSize: '0.84rem' }} onClick={() => onNavigate?.('practice')}>
              ✏️ Start Practice
            </button>
            <button className="btn-secondary" style={{ fontSize: '0.84rem' }} onClick={() => onNavigate?.('ai')}>
              🤖 Ask AI
            </button>
            <button className="btn-secondary" style={{ fontSize: '0.84rem' }} onClick={() => onNavigate?.('student_connection')}>
              💬 Ask a Student
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => setStep(3)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ArrowLeft size={14} /> Back</button>
            <button className="btn-primary" onClick={() => setStep(5)} style={{ flex: 1, justifyContent: 'center' }}>Take a Short Reset <ArrowRight size={15} /></button>
          </div>
        </div>
      )}

      {/* ── STEP 5: RESET ACTIVITIES ── */}
      {step === 5 && (
        <div className="content-card">
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>
            🧘 Take a Short Reset
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            A short break resets your focus. Pick an activity below.
          </div>

          {!activeReset ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {RESET_ACTIVITIES.map(act => {
                const done = completedResets.includes(act.id);
                return (
                  <button key={act.id} onClick={() => setActiveReset(act.id)} style={{
                    padding: '14px 16px', borderRadius: '12px', textAlign: 'left',
                    border: `1.5px solid ${done ? '#A9E6C5' : 'var(--border-subtle)'}`,
                    background: done ? '#E8FBF2' : 'var(--bg-surface)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { if (!done) e.currentTarget.style.background = 'var(--bg-surface-subtle)'; }}
                    onMouseLeave={e => { if (!done) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{act.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: done ? '#27AE60' : 'var(--text-primary)' }}>{act.label} {done && '✓'}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{act.desc}</div>
                    </div>
                    {!done && <ArrowRight size={16} color="var(--text-muted)" />}
                  </button>
                );
              })}
            </div>
          ) : activeReset === 'breathing' ? (
            <BreathingExercise onDone={() => { setCompletedResets(p => [...new Set([...p, 'breathing'])]); setActiveReset(null); }} />
          ) : activeReset === 'braindump' ? (
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.86rem', marginBottom: '8px' }}>📝 Write everything on your mind — no filter, no rules:</div>
              <textarea className="form-input" rows={6} value={brainDumpText} onChange={e => setBrainDumpText(e.target.value)}
                placeholder="Just write freely... worries, thoughts, anything..." style={{ resize: 'vertical', marginBottom: '12px' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" onClick={() => setActiveReset(null)}>Back</button>
                <button className="btn-primary" onClick={() => { setCompletedResets(p => [...new Set([...p, 'braindump'])]); setActiveReset(null); }}>Done ✓</button>
              </div>
            </div>
          ) : activeReset === 'gratitude' ? (
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.86rem', marginBottom: '12px' }}>🌟 Write 3 things you're grateful for right now:</div>
              {gratitude.map((g, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <label style={{ fontWeight: '600', fontSize: '0.78rem', display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>Thing {i + 1}</label>
                  <input className="form-input" value={g} onChange={e => setGratitude(prev => prev.map((v, j) => j === i ? e.target.value : v))} placeholder={["e.g. My supportive family", "e.g. A topic I understand well", "e.g. That I'm trying"][i]} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button className="btn-secondary" onClick={() => setActiveReset(null)}>Back</button>
                <button className="btn-primary" onClick={() => { setCompletedResets(p => [...new Set([...p, 'gratitude'])]); setActiveReset(null); }}>Done ✓</button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{RESET_ACTIVITIES.find(a => a.id === activeReset)?.emoji}</div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '6px' }}>{RESET_ACTIVITIES.find(a => a.id === activeReset)?.label}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {activeReset === 'movement' ? 'Stand up, roll your shoulders, reach your arms up, and take 5 deep breaths. Walk around for a few minutes.' : 'Close your eyes, take 5 deep breaths, and listen to something calm for 5 minutes.'}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={() => setActiveReset(null)}>Back</button>
                <button className="btn-primary" onClick={() => { setCompletedResets(p => [...new Set([...p, activeReset])]); setActiveReset(null); }}>Done ✓</button>
              </div>
            </div>
          )}

          {!activeReset && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button className="btn-secondary" onClick={() => setStep(4)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ArrowLeft size={14} /> Back</button>
              <button className="btn-primary" onClick={() => setStep(6)} style={{ flex: 1, justifyContent: 'center' }}>I'm Ready for the Next Step <ArrowRight size={15} /></button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 6: RETURN TO LEARNING ── */}
      {step === 6 && (
        <div className="content-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #F0FFF4, #fff)', border: '1.5px solid #A9E6C5' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🌱</div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Ready for the Next Step?
          </div>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
            Every challenge you face is making you a stronger learner. You've taken a step today — now take another one.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => onNavigate?.('practice')} style={{ fontSize: '0.86rem' }}>✏️ Start Practice</button>
            <button className="btn-secondary" onClick={() => onNavigate?.('courses')} style={{ fontSize: '0.86rem' }}>📚 Continue Learning</button>
            <button className="btn-secondary" onClick={() => onNavigate?.('progress')} style={{ fontSize: '0.86rem' }}>📊 Review Weak Topics</button>
            <button className="btn-secondary" onClick={() => onNavigate?.('dashboard')} style={{ fontSize: '0.86rem' }}>🏠 Return to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
};
