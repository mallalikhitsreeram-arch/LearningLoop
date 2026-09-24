import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  BookOpen,
  Target,
  Heart,
  Clock,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Camera,
  AlertCircle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const StudentOnboardingPage = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, getAuthHeaders } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // -------------------------------------------------------------
  // STEP 1 STATE: "Let's Know You"
  // -------------------------------------------------------------
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Prefer not to say');

  // Education Level & Dynamic Fields
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [collegeOrSchool, setCollegeOrSchool] = useState('');
  const [degree, setDegree] = useState('B.Tech in Computer Science');
  const [branchOrStream, setBranchOrStream] = useState('Computer Science & Engineering');
  const [classOrYear, setClassOrYear] = useState('1st Year');

  // Learning Interests (Multi-select)
  const interestOptions = [
    'Programming',
    'Web Development',
    'AI & Machine Learning',
    'Data Science',
    'Cybersecurity',
    'Cloud Computing',
    'App Development',
    'Mathematics',
    'Science',
    'Communication',
    'Aptitude',
    'Logical Reasoning',
    'Competitive Programming',
    'Other'
  ];
  const [selectedInterests, setSelectedInterests] = useState(['Programming', 'Web Development']);
  const [customInterest, setCustomInterest] = useState('');

  // Career Goal
  const careerGoalOptions = [
    'Software Developer',
    'AI/ML Engineer',
    'Data Scientist',
    'Web Developer',
    'Cybersecurity Professional',
    'Entrepreneur',
    'Government Job',
    'Higher Studies',
    'Researcher',
    'Other'
  ];
  const [selectedGoal, setSelectedGoal] = useState('Software Developer');
  const [customGoal, setCustomGoal] = useState('');
  const [goalDescription, setGoalDescription] = useState('');

  // Hobbies & Personal Interests
  const hobbyOptions = [
    'Sports',
    'Gaming',
    'Music',
    'Reading',
    'Drawing',
    'Coding',
    'Movies',
    'Travel',
    'Writing',
    'Photography',
    'Other'
  ];
  const [selectedHobbies, setSelectedHobbies] = useState(['Coding', 'Music']);
  const [customHobby, setCustomHobby] = useState('');

  // Study Preferences
  const [dailyStudyTime, setDailyStudyTime] = useState('1 hour');
  const [preferredLearningStyle, setPreferredLearningStyle] = useState('Practice');

  // Profile Photo (Optional)
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.avatar || null);

  // -------------------------------------------------------------
  // STEP 2 STATE: "Connect With Your Parent"
  // -------------------------------------------------------------
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentRelation, setParentRelation] = useState('Father');

  // OTP Verification
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Success Completion State
  const [isCompletedSuccess, setIsCompletedSuccess] = useState(false);

  // -------------------------------------------------------------
  // INITIAL STATUS CHECK & RESUME POINT DETECTION
  // -------------------------------------------------------------
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/student/profile/status', {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();

          // Already completely onboarded: proceed directly to dashboard
          if (data.profileCompleted) {
            navigate('/dashboard', { replace: true });
            return;
          }

          // Populate existing profile data if student previously saved partial step
          if (data.profile) {
            const p = data.profile;
            if (p.fullName) setFullName(p.fullName);
            if (p.dob) setDateOfBirth(p.dob);
            if (p.gender) setGender(p.gender);
            if (p.educationLevel) setEducationLevel(p.educationLevel);
            if (p.collegeOrSchool || p.college) setCollegeOrSchool(p.collegeOrSchool || p.college);
            if (p.degree || p.courseName) setDegree(p.degree || p.courseName);
            if (p.branchOrStream) setBranchOrStream(p.branchOrStream);
            if (p.classOrYear || p.yearSemester) setClassOrYear(p.classOrYear || p.yearSemester);
            if (Array.isArray(p.interests) && p.interests.length > 0) setSelectedInterests(p.interests);
            if (p.careerGoal || p.currentGoal) setSelectedGoal(p.careerGoal || p.currentGoal);
            if (p.goalDescription) setGoalDescription(p.goalDescription);
            if (Array.isArray(p.hobbies) && p.hobbies.length > 0) setSelectedHobbies(p.hobbies);
            if (p.dailyStudyTime) setDailyStudyTime(p.dailyStudyTime);
            if (p.preferredLearningStyle) setPreferredLearningStyle(p.preferredLearningStyle);
            if (p.parentName) setParentName(p.parentName);
            if (p.parentEmail) setParentEmail(p.parentEmail);
            if (p.parentPhone) setParentPhone(p.parentPhone);

            // Resume at Step 2 if Step 1 was already completed
            if (p.step1Completed && !p.step2Completed) {
              setCurrentStep(2);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile status:', err);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    checkStatus();
  }, [getAuthHeaders, navigate]);

  // Handle Interest Toggle
  const toggleInterest = (interest) => {
    setErrorMessage('');
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Handle Hobby Toggle
  const toggleHobby = (hobby) => {
    setErrorMessage('');
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter(h => h !== hobby));
    } else {
      setSelectedHobbies([...selectedHobbies, hobby]);
    }
  };

  // -------------------------------------------------------------
  // STEP 1 SUBMISSION
  // -------------------------------------------------------------
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!collegeOrSchool.trim()) {
      setErrorMessage(
        educationLevel === 'School' || educationLevel === 'Intermediate'
          ? 'Please enter your School or Junior College name.'
          : 'Please enter your College or Institution name.'
      );
      return;
    }

    if (selectedInterests.length === 0 && !customInterest.trim()) {
      setErrorMessage('Please select at least one learning interest.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/student/profile/step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          dateOfBirth,
          gender,
          educationLevel,
          collegeOrSchool: collegeOrSchool.trim(),
          degree: degree.trim(),
          branchOrStream: branchOrStream.trim(),
          classOrYear,
          interests: selectedInterests,
          otherInterest: customInterest.trim(),
          careerGoal: selectedGoal,
          otherGoal: customGoal.trim(),
          goalDescription: goalDescription.trim(),
          hobbies: selectedHobbies,
          otherHobbies: customHobby.trim(),
          dailyStudyTime,
          preferredLearningStyle,
          profilePhoto
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        if (data.user && setCurrentUser) {
          setCurrentUser(data.user);
        }
        // Advance to Step 2
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(data.error || 'Failed to save profile. Please try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Network error while saving profile. Please check connection.');
    }
  };

  // -------------------------------------------------------------
  // STEP 2: SEND PARENT OTP
  // -------------------------------------------------------------
  const handleSendParentOtp = async () => {
    setErrorMessage('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!parentEmail.trim() || !emailRegex.test(parentEmail.trim())) {
      setErrorMessage('Please enter a valid parent/guardian email address.');
      return;
    }

    if (!parentName.trim()) {
      setErrorMessage('Please enter your parent or guardian name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/student/parent-otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          parentEmail: parentEmail.trim(),
          parentName: parentName.trim(),
          parentPhone: parentPhone.trim(),
          relation: parentRelation
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setOtpSent(true);
        setResendCooldown(30); // 30-second cooldown
        if (data.devOtp) {
          setDevOtpHint(data.devOtp);
          setOtp(data.devOtp); // Auto-fill in development for fast demo testing
        }
      } else {
        setErrorMessage(data.error || 'Failed to send OTP to parent email.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Network error while requesting parent verification OTP.');
    }
  };

  // -------------------------------------------------------------
  // STEP 2: VERIFY PARENT OTP
  // -------------------------------------------------------------
  const handleVerifyParentOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification OTP.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/student/parent-otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          otp: otp.trim(),
          parentEmail: parentEmail.trim(),
          parentName: parentName.trim(),
          parentPhone: parentPhone.trim(),
          relation: parentRelation
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        if (data.user && setCurrentUser) {
          setCurrentUser(data.user);
        }
        setIsCompletedSuccess(true);
      } else {
        setErrorMessage(data.error || 'Invalid OTP. Please check the code.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Network error while verifying OTP.');
    }
  };

  if (isLoadingStatus) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Preparing Your Learning Profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '32px 16px'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}>
        {/* Header with Brand & Progress Indicator */}
        <div style={{
          padding: '28px 32px 20px',
          background: 'linear-gradient(180deg, var(--bg-surface-subtle) 0%, var(--bg-surface) 100%)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Brand Tagline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#1E2022',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5H4" />
                  <path d="M4 14l-3-3 3-3" />
                  <path d="M17 12a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5h8" />
                  <path d="M20 10l3 3-3 3" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                LEARNING LOOPS
              </span>
            </div>

            <span style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              letterSpacing: '0.04em',
              color: 'var(--accent-primary)',
              textTransform: 'uppercase',
              backgroundColor: 'var(--accent-primary-light)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)'
            }}>
              STUDENT ONBOARDING
            </span>
          </div>

          {/* Progress Indicator */}
          {!isCompletedSuccess && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
                  STEP {currentStep} OF 2: {currentStep === 1 ? "LET'S KNOW YOU" : 'PARENT CONNECTION'}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {currentStep === 1 ? '1. About You  ➔  2. Parent' : '1. Completed ✓  ➔  2. Parent Verification'}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div style={{ height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: currentStep === 1 ? '50%' : '100%',
                  backgroundColor: 'var(--accent-primary)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div style={{
            margin: '20px 32px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #FECACA',
            fontSize: '0.84rem'
          }}>
            <AlertCircle size={18} flexShrink={0} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Container */}
        <div style={{ padding: '28px 32px 36px' }}>
          {/* ========================================================= */}
          {/* SUCCESS COMPLETION SCREEN                                 */}
          {/* ========================================================= */}
          {isCompletedSuccess ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--accent-primary-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 4px 16px rgba(217, 107, 67, 0.2)'
              }}>
                <Sparkles size={36} />
              </div>

              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.8rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                You're all set!
              </h2>

              <p style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                maxWidth: '440px',
                margin: '0 auto 24px',
                lineHeight: '1.5'
              }}>
                Your learning profile is ready. Welcome to Learning Loops, <strong>{fullName}</strong>.
              </p>

              {/* Profile Summary Card */}
              <div style={{
                background: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                padding: '18px 24px',
                textAlign: 'left',
                maxWidth: '480px',
                margin: '0 auto 28px',
                fontSize: '0.86rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>TARGET CAREER</span>
                    <strong style={{ color: 'var(--accent-primary)' }}>{selectedGoal === 'Other' ? customGoal : selectedGoal}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>DAILY COMMITMENT</span>
                    <strong>{dailyStudyTime} / day</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>INSTITUTION</span>
                    <strong>{collegeOrSchool}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>PARENT VERIFIED</span>
                    <strong style={{ color: 'var(--accent-sage)' }}>✓ {parentName}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                id="go-to-dashboard-btn"
                style={{
                  padding: '14px 32px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  margin: '0 auto',
                  display: 'inline-flex'
                }}
                onClick={() => navigate('/dashboard', { replace: true })}
              >
                <span>Go to My Dashboard →</span>
              </button>
            </div>
          ) : currentStep === 1 ? (
            /* ========================================================= */
            /* STEP 1: "LET'S KNOW YOU" FORM                             */
            /* ========================================================= */
            <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}>
                  Let's Know You
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Tell us a little about yourself so Learning Loops can personalize your learning journey.
                </p>
              </div>

              {/* SECTION A: BASIC STUDENT INFO */}
              <div style={{ background: '#FAF9F6', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.04em' }}>
                  A. Personal &amp; Academic Background
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Full Name */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      Full Name <span style={{ color: 'var(--accent-primary)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.88rem',
                        background: '#FFFFFF'
                      }}
                    />
                  </div>

                  {/* DOB & Gender */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                        Date of Birth <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.86rem',
                          background: '#FFFFFF'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                        Gender <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.86rem',
                          background: '#FFFFFF'
                        }}
                      >
                        <option>Prefer not to say</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Education Level */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      Education Level <span style={{ color: 'var(--accent-primary)' }}>*</span>
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.88rem',
                        background: '#FFFFFF',
                        fontWeight: '600'
                      }}
                    >
                      <option value="Undergraduate">Undergraduate (B.Tech, B.Sc, BCA, etc.)</option>
                      <option value="Diploma">Diploma / Polytechnic</option>
                      <option value="Intermediate">Intermediate (11th / 12th / Junior College)</option>
                      <option value="School">School (Secondary / High School)</option>
                      <option value="Postgraduate">Postgraduate (M.Tech, MCA, etc.)</option>
                      <option value="Other">Other Academic Program</option>
                    </select>
                  </div>

                  {/* Dynamic Fields Based on Education Level */}
                  {educationLevel === 'School' || educationLevel === 'Intermediate' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                          School / Junior College Name <span style={{ color: 'var(--accent-primary)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Model Junior College"
                          value={collegeOrSchool}
                          onChange={(e) => setCollegeOrSchool(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.88rem',
                            background: '#FFFFFF'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                          Class / Stream
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 11th - Science (MPC)"
                          value={classOrYear}
                          onChange={(e) => setClassOrYear(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.88rem',
                            background: '#FFFFFF'
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                          College / Institution Name <span style={{ color: 'var(--accent-primary)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Government Engineering College"
                          value={collegeOrSchool}
                          onChange={(e) => setCollegeOrSchool(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.88rem',
                            background: '#FFFFFF'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                            Degree &amp; Branch
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. B.Tech Computer Science"
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.88rem',
                              background: '#FFFFFF'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                            Year / Semester
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2nd Year / 3rd Sem"
                            value={classOrYear}
                            onChange={(e) => setClassOrYear(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.88rem',
                              background: '#FFFFFF'
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SECTION B: LEARNING INTERESTS */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    What are you interested in learning? <span style={{ color: 'var(--accent-primary)' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Multi-select</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  {interestOptions.map(interest => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 'var(--radius-full)',
                          border: active ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          background: active ? 'var(--accent-primary-light)' : '#FFFFFF',
                          color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
                          fontWeight: active ? '700' : '500',
                          fontSize: '0.82rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {active ? `✓ ${interest}` : interest}
                      </button>
                    );
                  })}
                </div>

                {selectedInterests.includes('Other') && (
                  <input
                    type="text"
                    placeholder="Enter custom interest (e.g. Internet of Things, Blockchain)"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem'
                    }}
                  />
                )}
              </div>

              {/* SECTION C: CAREER / FUTURE GOAL */}
              <div style={{ background: '#FAF9F6', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  What do you want to become? <span style={{ color: 'var(--accent-primary)' }}>*</span>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
                  {careerGoalOptions.map(goal => {
                    const active = selectedGoal === goal;
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => { setSelectedGoal(goal); setErrorMessage(''); }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: active ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          background: active ? 'var(--accent-primary-light)' : '#FFFFFF',
                          color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
                          fontWeight: active ? '700' : '500',
                          fontSize: '0.82rem',
                          textAlign: 'left'
                        }}
                      >
                        {active ? `★ ${goal}` : goal}
                      </button>
                    );
                  })}
                </div>

                {selectedGoal === 'Other' && (
                  <input
                    type="text"
                    placeholder="Specify your career goal"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                      marginBottom: '12px',
                      background: '#FFFFFF'
                    }}
                  />
                )}

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Tell us about your goal <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(Optional short description)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Aspire to work on modern cloud applications and build full-stack projects."
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                      resize: 'none',
                      background: '#FFFFFF'
                    }}
                  />
                </div>
              </div>

              {/* SECTION D: HOBBIES AND PERSONAL INTERESTS */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  What do you enjoy doing? <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  {hobbyOptions.map(hobby => {
                    const active = selectedHobbies.includes(hobby);
                    return (
                      <button
                        key={hobby}
                        type="button"
                        onClick={() => toggleHobby(hobby)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          border: active ? '1.5px solid var(--accent-sage)' : '1px solid var(--border-subtle)',
                          background: active ? 'var(--accent-sage-light)' : '#FFFFFF',
                          color: active ? 'var(--accent-sage)' : 'var(--text-primary)',
                          fontWeight: active ? '700' : '500',
                          fontSize: '0.8rem'
                        }}
                      >
                        {active ? `✓ ${hobby}` : hobby}
                      </button>
                    );
                  })}
                </div>

                {selectedHobbies.includes('Other') && (
                  <input
                    type="text"
                    placeholder="Enter custom hobby"
                    value={customHobby}
                    onChange={(e) => setCustomHobby(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem'
                    }}
                  />
                )}
              </div>

              {/* SECTION E: STUDY PREFERENCES */}
              <div style={{ background: '#FAF9F6', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  How much time can you study each day? <span style={{ color: 'var(--accent-primary)' }}>*</span>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  {['30 minutes', '1 hour', '1–2 hours', '2–3 hours', '3–4 hours', '4+ hours'].map(time => {
                    const active = dailyStudyTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setDailyStudyTime(time)}
                        style={{
                          padding: '10px 6px',
                          borderRadius: 'var(--radius-md)',
                          border: active ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          background: active ? 'var(--accent-primary-light)' : '#FFFFFF',
                          color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
                          fontWeight: active ? '700' : '600',
                          fontSize: '0.82rem',
                          textAlign: 'center'
                        }}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Preferred Learning Style <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </label>
                  <select
                    value={preferredLearningStyle}
                    onChange={(e) => setPreferredLearningStyle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                      background: '#FFFFFF'
                    }}
                  >
                    <option value="Practice">Practice (Hands-on problem solving)</option>
                    <option value="Projects">Projects (Building real apps)</option>
                    <option value="Video">Video (Visual explanations)</option>
                    <option value="Reading">Reading (Text &amp; technical documentation)</option>
                    <option value="Mixed">Mixed (Balanced learning approach)</option>
                  </select>
                </div>
              </div>

              {/* Submit Step 1 Button */}
              <button
                type="submit"
                id="continue-step2-btn"
                className="btn-primary"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '13px 20px',
                  fontSize: '0.95rem',
                  fontWeight: '700'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Step 2: Parent Connection →</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ========================================================= */
            /* STEP 2: "CONNECT WITH YOUR PARENT" FORM                   */
            /* ========================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}>
                  Connect With Your Parent
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Add a parent or guardian so they can stay connected with your learning progress.
                </p>
              </div>

              {/* Parent Info Inputs */}
              <div style={{ background: '#FAF9F6', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>
                  Parent / Guardian Details
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    Parent / Guardian Full Name <span style={{ color: 'var(--accent-primary)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={parentName}
                    disabled={otpSent}
                    onChange={(e) => setParentName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.88rem',
                      background: otpSent ? '#F3F4F6' : '#FFFFFF'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      Parent Email Address <span style={{ color: 'var(--accent-primary)' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={parentEmail}
                      disabled={otpSent}
                      onChange={(e) => setParentEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.88rem',
                        background: otpSent ? '#F3F4F6' : '#FFFFFF'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      Relationship
                    </label>
                    <select
                      value={parentRelation}
                      disabled={otpSent}
                      onChange={(e) => setParentRelation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.88rem',
                        background: otpSent ? '#F3F4F6' : '#FFFFFF'
                      }}
                    >
                      <option>Father</option>
                      <option>Mother</option>
                      <option>Guardian</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    Parent Mobile Phone Number <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98490 12345"
                    value={parentPhone}
                    disabled={otpSent}
                    onChange={(e) => setParentPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.88rem',
                      background: otpSent ? '#F3F4F6' : '#FFFFFF'
                    }}
                  />
                </div>

                {/* Send OTP Button */}
                {!otpSent ? (
                  <button
                    type="button"
                    id="send-parent-otp-btn"
                    className="btn-primary"
                    disabled={isSubmitting}
                    onClick={handleSendParentOtp}
                    style={{
                      marginTop: '6px',
                      padding: '11px 20px',
                      justifyContent: 'center',
                      fontSize: '0.92rem',
                      fontWeight: '700'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                        <span>Generating OTP...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        <span>Send OTP to Parent's Email</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#ECFDF5', borderRadius: 'var(--radius-sm)', border: '1px solid #A7F3D0', fontSize: '0.82rem', color: '#065F46' }}>
                    <span>✓ OTP sent to <strong>{parentEmail}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.78rem', textDecoration: 'underline' }}
                    >
                      Change Email
                    </button>
                  </div>
                )}
              </div>

              {/* OTP Verification Form */}
              {otpSent && (
                <form onSubmit={handleVerifyParentOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--accent-primary)', textAlign: 'center' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                      Enter 6-Digit Verification Code
                    </label>

                    <input
                      type="text"
                      required
                      id="parent-otp-input"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      style={{
                        width: '200px',
                        margin: '0 auto 12px',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-subtle)',
                        fontSize: '1.4rem',
                        letterSpacing: '0.25em',
                        textAlign: 'center',
                        fontWeight: '800',
                        color: 'var(--text-primary)',
                        display: 'block'
                      }}
                    />

                    {/* Development OTP Helper Notice */}
                    {devOtpHint && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--accent-sage)', fontWeight: '600', marginBottom: '10px' }}>
                        ★ Demo/Presentation Code: <strong>{devOtpHint}</strong> (or enter 424242)
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
                      <button
                        type="submit"
                        id="verify-parent-btn"
                        className="btn-primary"
                        disabled={isSubmitting || otp.trim().length !== 6}
                        style={{
                          padding: '11px 28px',
                          fontSize: '0.92rem',
                          fontWeight: '700'
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Verify Parent</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={resendCooldown > 0 || isSubmitting}
                        onClick={handleSendParentOtp}
                        style={{ fontSize: '0.84rem', padding: '10px 16px' }}
                      >
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Back to Step 1 Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setCurrentStep(1); setErrorMessage(''); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Step 1: About You</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
