import React, { useState } from 'react';
import { Target, Heart, Clock, Users, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const OnboardingModal = ({ isOpen, onClose, onFinish }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [step, setStep] = useState(1);

  // Form states
  const [personal, setPersonal] = useState({
    fullName: currentUser?.name || 'Aarav Sharma',
    dob: '2004-06-15',
    college: 'Government Polytechnic College, Nizamabad',
    courseName: 'Diploma in Computer Engineering',
    yearSemester: '2nd Year / 4th Sem',
    phone: currentUser?.phone || '+91 98765 43210',
    email: currentUser?.email || 'aarav.sharma@example.edu'
  });

  const [interests, setInterests] = useState(['Web Development', 'Programming', 'AI']);
  const [goals, setGoals] = useState(['Placement preparation', 'Web Development']);
  const [learningTime, setLearningTime] = useState({
    dailyMinutes: 60,
    preferredDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    preferredTime: 'Evening (6:00 PM - 8:00 PM)',
    difficulty: 'Balanced'
  });

  const [parent, setParent] = useState({
    name: 'Rajesh Sharma',
    phone: '+91 98490 12345',
    email: 'rajesh.sharma@example.com',
    otp: '424242',
    verified: true
  });

  const [teacherProfile, setTeacherProfile] = useState({
    designation: currentUser?.designation || 'Assistant Professor',
    department: 'Computer Science & Engineering',
    college: 'Government Polytechnic / Engineering College',
    subjects: ['C Programming', 'Data Structures']
  });

  if (!isOpen) return null;

  const handleTeacherComplete = async () => {
    try {
      const res = await fetch('/api/teacher/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          ...teacherProfile
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
    onClose();
    if (onFinish) onFinish();
  };

  const isTeacher = currentUser?.role === 'teacher';

  if (isTeacher) {
    return (
      <div className="modal-overlay">
        <div className="modal-card" style={{ maxWidth: '580px', width: '95%' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>
              Faculty Profile Setup
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>LEARNING LOOPS TEACHER PORTAL</span>
          </div>

          <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>Complete Your Faculty Profile</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Please confirm your department and teaching details to personalize your class analytics and test builder.
              </p>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                disabled
                value={currentUser?.name || ''}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: '#F8F9FA' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Academic Designation</label>
                <input
                  type="text"
                  value={teacherProfile.designation}
                  onChange={(e) => setTeacherProfile({ ...teacherProfile, designation: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Department</label>
                <input
                  type="text"
                  value={teacherProfile.department}
                  onChange={(e) => setTeacherProfile({ ...teacherProfile, department: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>College / Institution</label>
              <input
                type="text"
                value={teacherProfile.college}
                onChange={(e) => setTeacherProfile({ ...teacherProfile, college: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Primary Subjects Taught</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['C Programming', 'Data Structures', 'Web Technologies', 'Python & AI', 'Computer Networks', 'Database Systems'].map(subj => {
                  const active = teacherProfile.subjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => {
                        setTeacherProfile(prev => ({
                          ...prev,
                          subjects: active ? prev.subjects.filter(s => s !== subj) : [...prev.subjects, subj]
                        }));
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                        background: active ? 'var(--accent-primary-light)' : '#fff',
                        color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
                        fontWeight: active ? '700' : '500',
                        fontSize: '0.82rem'
                      }}
                    >
                      {active ? `✓ ${subj}` : subj}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleTeacherComplete}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              <span>Save Faculty Profile &amp; Go to Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const interestOptions = [
    'Programming', 'AI', 'Web Development', 'Data Science',
    'Cybersecurity', 'Robotics', 'Electronics', 'Mathematics',
    'Science', 'Design', 'Communication'
  ];

  const goalOptions = [
    'Placement preparation', 'Programming', 'Project development',
    'Competitive exams', 'Communication', 'AI', 'Career exploration', 'Skill development'
  ];

  const toggleInterest = (item) => {
    setInterests(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const toggleGoal = (item) => {
    setGoals(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const handleComplete = async () => {
    try {
      const res = await fetch('/api/student/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          personalDetails: personal,
          interests,
          goals,
          learningTime,
          parentDetails: parent
        })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
    setStep(6);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '640px', width: '95%' }}>
        {/* Step Indicator */}
        {step < 6 && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>
              Step {step} of 5: {step === 1 ? 'Personal Details' : step === 2 ? 'Areas of Interest' : step === 3 ? 'Career Goals' : step === 4 ? 'Learning Schedule' : 'Parent Verification'}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>LEARNING LOOPS ONBOARDING</span>
          </div>
        )}

        <div className="modal-body" style={{ padding: '24px' }}>
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Tell us about yourself</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  This helps tailor courses to your academic college and semester level.
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  value={personal.fullName}
                  onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>School / College</label>
                  <input
                    type="text"
                    value={personal.college}
                    onChange={(e) => setPersonal({ ...personal, college: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Course / Branch</label>
                  <input
                    type="text"
                    value={personal.courseName}
                    onChange={(e) => setPersonal({ ...personal, courseName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Year / Semester</label>
                  <input
                    type="text"
                    value={personal.yearSemester}
                    onChange={(e) => setPersonal({ ...personal, yearSemester: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Date of Birth</label>
                  <input
                    type="date"
                    value={personal.dob}
                    onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>What subjects fascinate you?</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Select one or more topics so our recommendation engine can curate relevant modules.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {interestOptions.map(opt => {
                  const active = interests.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleInterest(opt)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                        background: active ? 'var(--accent-primary-light)' : '#fff',
                        color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
                        fontWeight: active ? '700' : '500',
                        fontSize: '0.86rem'
                      }}
                    >
                      {active ? `✓ ${opt}` : opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>What are your primary goals?</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Whether placement preparation or building full-stack applications, we align your loop to it.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {goalOptions.map(opt => {
                  const active = goals.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleGoal(opt)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${active ? 'var(--accent-sage)' : 'var(--border-subtle)'}`,
                        background: active ? 'var(--accent-sage-light)' : '#fff',
                        color: active ? 'var(--accent-sage)' : 'var(--text-primary)',
                        fontWeight: active ? '700' : '500',
                        fontSize: '0.86rem'
                      }}
                    >
                      {active ? `★ ${opt}` : opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Learning Time */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Daily Time Commitment</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Small daily steps create massive outcomes. How much time can you commit each day?
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    style={{
                      padding: '16px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${learningTime.dailyMinutes === mins ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      background: learningTime.dailyMinutes === mins ? 'var(--accent-primary-light)' : '#fff',
                      textAlign: 'center'
                    }}
                    onClick={() => setLearningTime({ ...learningTime, dailyMinutes: mins })}
                  >
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{mins}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Minutes / Day</div>
                  </button>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Preferred Study Slot</label>
                <select
                  value={learningTime.preferredTime}
                  onChange={(e) => setLearningTime({ ...learningTime, preferredTime: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                >
                  <option>Morning (6:00 AM - 8:00 AM)</option>
                  <option>Afternoon (2:00 PM - 4:00 PM)</option>
                  <option>Evening (6:00 PM - 8:00 PM)</option>
                  <option>Night (9:00 PM - 11:00 PM)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 5: Parent Details */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Parent / Guardian Visibility</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Link a verified parent so they can celebrate your milestones, streaks, and attendance.
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Parent Name</label>
                <input
                  type="text"
                  value={parent.name}
                  onChange={(e) => setParent({ ...parent, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Parent Mobile Phone</label>
                  <input
                    type="text"
                    value={parent.phone}
                    onChange={(e) => setParent({ ...parent, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>OTP Code (Demo: 424242)</label>
                  <input
                    type="text"
                    value={parent.otp}
                    onChange={(e) => setParent({ ...parent, otp: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--accent-sage)', fontWeight: '600' }}>
                <CheckCircle2 size={16} /> Parent phone verified via secure backend OTP.
              </div>
            </div>
          )}

          {/* Step 6: Completion Screen */}
          {step === 6 && (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Sparkles size={32} />
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
                YOUR LEARNING LOOP STARTS NOW
              </h2>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px', lineHeight: '1.5' }}>
                Target track: <strong>{goals[0] || 'Web Development'}</strong> • {learningTime.dailyMinutes} mins/day commitment.
                Your offline downloads and streak tracking are ready.
              </p>

              <button
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.95rem', margin: '0 auto', display: 'inline-flex' }}
                onClick={() => {
                  onClose();
                  if (onFinish) onFinish();
                }}
              >
                <span>GO TO DASHBOARD</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 6 && (
          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button
              className="btn-secondary"
              disabled={step === 1}
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              style={{ opacity: step === 1 ? 0.4 : 1 }}
            >
              <ArrowLeft size={16} /> Back
            </button>

            {step < 5 ? (
              <button className="btn-primary" onClick={() => setStep(prev => prev + 1)}>
                <span>Next Step</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn-primary" onClick={handleComplete}>
                <span>Complete Onboarding</span>
                <CheckCircle2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
