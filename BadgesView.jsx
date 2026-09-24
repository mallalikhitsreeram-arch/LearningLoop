import React, { useState, useEffect } from 'react';
import { Trophy, Award, Flame, CheckCircle, Zap, BookOpen, Compass, Scroll, Lock } from 'lucide-react';
import { CertificateModal } from './CertificateModal.jsx';

export const BadgesView = () => {
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activeCertificate, setActiveCertificate] = useState(null);

  useEffect(() => {
    fetch('/api/student/dashboard/usr-student-1')
      .then(res => res.json())
      .then(data => {
        if (data.badges) setBadges(data.badges);
      })
      .catch(() => {});

    fetch('/api/certificates/usr-student-1')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCertificates(data);
      })
      .catch(() => {});
  }, []);

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'Flame': return <Flame size={20} color="#D97706" />;
      case 'Award': return <Award size={20} color="var(--accent-primary)" />;
      case 'CheckCircle': return <CheckCircle size={20} color="var(--accent-sage)" />;
      case 'Zap': return <Zap size={20} color="#EAB308" />;
      case 'BookOpen': return <BookOpen size={20} color="var(--accent-navy)" />;
      case 'Compass': return <Compass size={20} color="#8B5CF6" />;
      default: return <Trophy size={20} color="var(--accent-amber)" />;
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Badges Section */}
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Achievements &amp; Milestone Badges</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Recognition for consistency, problem solving, course completions, and assessment mastery.
            </p>
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--accent-sage)' }}>
            {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {badges.map((badge) => (
            <div
              key={badge.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                backgroundColor: badge.unlocked ? '#FFF' : '#FAFAFA',
                opacity: badge.unlocked ? 1 : 0.75
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: badge.unlocked ? 'var(--bg-surface-subtle)' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {badge.unlocked ? getBadgeIcon(badge.icon) : <Lock size={18} color="var(--text-muted)" />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-muted)' }}>
                    {badge.category}
                  </span>
                  {badge.unlocked && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-sage)', fontWeight: '700' }}>✓ Earned</span>
                  )}
                </div>

                <h4 style={{ fontSize: '0.96rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {badge.name}
                </h4>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                  {badge.description}
                </p>

                {!badge.unlocked && (
                  <div style={{ marginTop: '8px' }}>
                    <div className="progress-track" style={{ height: '5px' }}>
                      <div className="progress-fill" style={{ width: `${badge.progress}%` }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {badge.progress}% completed
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates Section */}
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Official Certificates</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Accredited credentials earned upon completing all lessons and passing final examinations.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {certificates.map((cert) => (
            <div key={cert.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: '700' }}>
                  <Scroll size={14} /> CERTIFIED
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginTop: '4px' }}>{cert.courseTitle}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Issued: {cert.completionDate} • Grade: {cert.score}
                </div>
              </div>

              <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.82rem', justifyContent: 'center' }} onClick={() => setActiveCertificate(cert)}>
                View &amp; Print Certificate
              </button>
            </div>
          ))}
        </div>
      </div>

      {activeCertificate && (
        <CertificateModal certificate={activeCertificate} onClose={() => setActiveCertificate(null)} />
      )}
    </div>
  );
};
