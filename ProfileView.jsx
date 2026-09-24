import React, { useState, useEffect } from 'react';
import { User, Flame, Award, BookOpen, Clock, Target, CheckCircle2, Edit3, X, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const INTEREST_OPTIONS = [
  'Web Development', 'AI & Machine Learning', 'Data Science', 'Cybersecurity',
  'Mobile App Development', 'Cloud Computing', 'Competitive Programming',
  'Game Development', 'Mathematics', 'Robotics & IoT'
];

const HOBBY_OPTIONS = [
  'Coding side projects', 'Reading tech blogs', 'Chess & Strategy games',
  'Gaming & Esports', 'Photography', 'Music & Instruments', 'Writing / Blogging'
];

const CAREER_OPTIONS = [
  'Software Developer / SDE', 'AI / ML Engineer', 'Full-Stack Web Developer',
  'Cloud & DevOps Engineer', 'Data Scientist', 'Cybersecurity Specialist',
  'Mobile App Developer', 'Higher Studies (MS/M.Tech)', 'Govt / PSU Exams', 'Other'
];

export const ProfileView = () => {
  const { currentUser, setCurrentUser, getAuthHeaders } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'interests', 'goals'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    dob: '',
    educationLevel: 'Undergraduate',
    college: '',
    courseName: '',
    yearSemester: '',
    careerGoal: 'Software Developer / SDE',
    goalDescription: '',
    interests: [],
    hobbies: [],
    dailyStudyTime: '1 hour',
    newInterestInput: '',
    newHobbyInput: ''
  });

  const fetchProfile = () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    fetch(`/api/student/dashboard/${currentUser.id}`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.profile) {
          setProfile(data.profile);
          populateForm(data.profile, data.user);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const populateForm = (p, u) => {
    setEditForm({
      fullName: u?.name || p?.fullName || currentUser?.name || '',
      dob: p?.dob || '',
      educationLevel: p?.educationLevel || 'Undergraduate',
      college: p?.college || p?.collegeOrSchool || '',
      courseName: p?.courseName || p?.degree || p?.branchOrStream || '',
      yearSemester: p?.yearSemester || p?.classOrYear || '',
      careerGoal: p?.careerGoal || p?.currentGoal || 'Software Developer / SDE',
      goalDescription: p?.goalDescription || '',
      interests: Array.isArray(p?.interests) ? [...p.interests] : ['Web Development'],
      hobbies: Array.isArray(p?.hobbies) ? [...p.hobbies] : ['Coding side projects'],
      dailyStudyTime: p?.dailyStudyTime || '1 hour',
      newInterestInput: '',
      newHobbyInput: ''
    });
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser?.id]);

  const toggleItem = (listName, item) => {
    setEditForm(prev => {
      const currentList = prev[listName];
      if (currentList.includes(item)) {
        return { ...prev, [listName]: currentList.filter(i => i !== item) };
      } else {
        return { ...prev, [listName]: [...currentList, item] };
      }
    });
  };

  const addCustomItem = (listName, inputName) => {
    const val = (editForm[inputName] || '').trim();
    if (!val) return;
    if (!editForm[listName].includes(val)) {
      setEditForm(prev => ({
        ...prev,
        [listName]: [...prev[listName], val],
        [inputName]: ''
      }));
    } else {
      setEditForm(prev => ({ ...prev, [inputName]: '' }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/student/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          fullName: editForm.fullName,
          dob: editForm.dob,
          educationLevel: editForm.educationLevel,
          college: editForm.college,
          courseName: editForm.courseName,
          yearSemester: editForm.yearSemester,
          interests: editForm.interests,
          careerGoal: editForm.careerGoal,
          goalDescription: editForm.goalDescription,
          hobbies: editForm.hobbies,
          dailyStudyTime: editForm.dailyStudyTime
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfile(data.profile);
      if (data.user && setCurrentUser) {
        setCurrentUser(data.user);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditModalOpen(false);
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  const p = profile || {
    college: currentUser?.college || 'Institution details pending',
    courseName: currentUser?.courseName || 'Track details pending',
    yearSemester: currentUser?.yearSemester || '1st Year',
    interests: [],
    goals: [],
    careerGoal: 'Software Developer',
    dailyLearningTargetMinutes: 60,
    currentStreak: 1,
    longestStreak: 1,
    totalProblemsSolved: 0,
    coursesCompleted: 0,
    currentGoal: 'Software Developer',
    parentName: 'Parent / Guardian',
    parentPhone: ''
  };

  const studentName = currentUser?.name || p.fullName || 'Student';

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Profile Header Card */}
      <div className="content-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <img
            src={currentUser?.avatar || p.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
            alt={studentName}
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-subtle)' }}
          />

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: '800' }}>
                  {studentName}
                </h2>
                <span className="streak-pill">
                  <Flame size={14} color="#D97706" /> {p.currentStreak ?? 1} DAYS
                </span>
              </div>

              <button
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', padding: '7px 14px' }}
                onClick={() => {
                  populateForm(profile, currentUser);
                  setIsEditModalOpen(true);
                }}
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {p.college || 'Institution'} • {p.courseName || 'Program'}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span>Role: <strong>{currentUser?.role?.toUpperCase() || 'STUDENT'}</strong></span>
              <span>•</span>
              <span>Year: <strong>{p.yearSemester || 'Year 1'}</strong></span>
              <span>•</span>
              <span>Target: <strong>{p.careerGoal || p.currentGoal || 'Software Developer'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        {['overview', 'interests', 'goals'].map(tab => (
          <button
            key={tab}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: activeTab === tab ? '700' : '500',
              background: activeTab === tab ? 'var(--accent-primary-light)' : 'transparent',
              color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.86rem',
              textTransform: 'capitalize'
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="section-title">Academic &amp; Family Verification</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Email Address</span>
              <strong>{currentUser?.email || 'N/A'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Phone Number</span>
              <strong>{currentUser?.phone || 'N/A'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Verified Parent / Guardian</span>
              <strong>{p.parentName || 'Parent / Guardian'} {p.parentPhone ? `(${p.parentPhone})` : ''}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Daily Study Commitment</span>
              <strong>{p.dailyLearningTargetMinutes ?? 60} minutes/day</strong>
            </div>
            {p.preferredLearningStyle && (
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Learning Style</span>
                <strong>{p.preferredLearningStyle}</strong>
              </div>
            )}
            {p.dob && (
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Date of Birth</span>
                <strong>{p.dob}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'interests' && (
        <div className="content-card">
          <h3 className="section-title" style={{ marginBottom: '12px' }}>Areas of Interest &amp; Hobbies</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Academic &amp; Technical Interests
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(p.interests && p.interests.length > 0) ? (
                p.interests.map((int, idx) => (
                  <span key={idx} className="badge-pill" style={{ padding: '6px 14px', fontSize: '0.84rem', background: 'var(--accent-navy-light)', color: 'var(--accent-navy)', fontWeight: '600' }}>
                    {int}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>No interests declared yet.</span>
              )}
            </div>
          </div>

          {p.hobbies && p.hobbies.length > 0 && (
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Personal Hobbies
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {p.hobbies.map((hob, idx) => (
                  <span key={idx} className="badge-pill" style={{ padding: '6px 14px', fontSize: '0.84rem', background: 'var(--accent-sage-light)', color: 'var(--accent-sage)', fontWeight: '600' }}>
                    {hob}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="content-card">
          <h3 className="section-title" style={{ marginBottom: '12px' }}>Career &amp; Learning Goals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CheckCircle2 size={18} color="var(--accent-sage)" />
                <strong style={{ fontSize: '1rem' }}>{p.careerGoal || p.currentGoal || 'Software Developer'}</strong>
              </div>
              {p.goalDescription && (
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '4px 0 0 26px', lineHeight: '1.4' }}>
                  "{p.goalDescription}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-card" style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>Edit Student Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="var(--text-secondary)" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {errorMsg && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: '#FEE2E2', color: '#991B1B', fontSize: '0.84rem' }}>
                  {errorMsg}
                </div>
              )}

              {saveSuccess && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: '#D1FAE5', color: '#065F46', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                />
              </div>

              {/* Academic Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Education Level</label>
                  <select
                    value={editForm.educationLevel}
                    onChange={(e) => setEditForm({ ...editForm, educationLevel: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  >
                    <option value="School">School (Class 6 - 10)</option>
                    <option value="Intermediate / +2">Intermediate / +2 / Junior College</option>
                    <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                    <option value="Undergraduate">Undergraduate (B.Tech / B.E / B.Sc / BCA)</option>
                    <option value="Postgraduate">Postgraduate (M.Tech / MCA / M.Sc)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>College / School Name</label>
                  <input
                    type="text"
                    value={editForm.college}
                    onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Degree / Stream / Branch</label>
                  <input
                    type="text"
                    value={editForm.courseName}
                    onChange={(e) => setEditForm({ ...editForm, courseName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Year / Semester</label>
                  <input
                    type="text"
                    value={editForm.yearSemester}
                    onChange={(e) => setEditForm({ ...editForm, yearSemester: e.target.value })}
                    placeholder="e.g. 2nd Year / 4th Sem"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {/* Career Goal */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Target Career Track</label>
                <select
                  value={editForm.careerGoal}
                  onChange={(e) => setEditForm({ ...editForm, careerGoal: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                >
                  {CAREER_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Target Goal Description (Optional)</label>
                <input
                  type="text"
                  value={editForm.goalDescription}
                  onChange={(e) => setEditForm({ ...editForm, goalDescription: e.target.value })}
                  placeholder="e.g. Crack placement tests at top tier tech companies"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                />
              </div>

              {/* Learning Interests */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Academic &amp; Learning Interests</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {INTEREST_OPTIONS.map(opt => {
                    const active = editForm.interests.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleItem('interests', opt)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 'var(--radius-full)',
                          border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                          background: active ? 'var(--accent-primary-light)' : '#fff',
                          color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
                          fontWeight: active ? '700' : '500',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        {active ? `✓ ${opt}` : opt}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={editForm.newInterestInput}
                    onChange={(e) => setEditForm({ ...editForm, newInterestInput: e.target.value })}
                    placeholder="Add custom interest..."
                    style={{ flex: 1, padding: '7px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                    onClick={() => addCustomItem('interests', 'newInterestInput')}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Hobbies */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Hobbies &amp; Extracurriculars</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {HOBBY_OPTIONS.map(opt => {
                    const active = editForm.hobbies.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleItem('hobbies', opt)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 'var(--radius-full)',
                          border: `1px solid ${active ? 'var(--accent-sage)' : 'var(--border-subtle)'}`,
                          background: active ? 'var(--accent-sage-light)' : '#fff',
                          color: active ? 'var(--accent-sage)' : 'var(--text-primary)',
                          fontWeight: active ? '700' : '500',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        {active ? `✓ ${opt}` : opt}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={editForm.newHobbyInput}
                    onChange={(e) => setEditForm({ ...editForm, newHobbyInput: e.target.value })}
                    placeholder="Add custom hobby..."
                    style={{ flex: 1, padding: '7px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                    onClick={() => addCustomItem('hobbies', 'newHobbyInput')}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Daily Study Time */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Daily Study Commitment</label>
                <select
                  value={editForm.dailyStudyTime}
                  onChange={(e) => setEditForm({ ...editForm, dailyStudyTime: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                >
                  <option value="30 minutes">30 minutes / day (Light)</option>
                  <option value="1 hour">1 hour / day (Recommended)</option>
                  <option value="1–2 hours">1–2 hours / day (Focused)</option>
                  <option value="2–3 hours">2–3 hours / day (Intensive)</option>
                  <option value="3–4 hours">3–4 hours / day (Advanced)</option>
                  <option value="4+ hours">4+ hours / day (Mastery)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isSaving}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSaving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
