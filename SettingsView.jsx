import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Wifi, HardDrive, RefreshCw, Globe, Shield, Trash2, CheckCircle2 } from 'lucide-react';
import { useDataSaver } from '../../context/DataSaverContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { offlineDb } from '../../services/offlineDb.js';

export const SettingsView = () => {
  const { dataPreference, setDataPreference, wifiOnlyDownloads, setWifiOnlyDownloads, autoSyncOnReconnect, setAutoSyncOnReconnect } = useDataSaver();
  const { lang, setLang, t } = useLanguage();
  const { triggerSync, lastSyncTime } = useNetwork();

  const [downloadedCourses, setDownloadedCourses] = useState([]);
  const [deviceStorageSizeMb, setDeviceStorageSizeMb] = useState(138);
  const [clearedNotice, setClearedNotice] = useState(false);

  useEffect(() => {
    offlineDb.getAllDownloadedCourses().then(list => {
      setDownloadedCourses(list);
      const totalMb = list.reduce((acc, curr) => acc + (curr.sizeMb || 20), 18);
      setDeviceStorageSizeMb(totalMb);
    });
  }, []);

  const handleDeleteOfflineCourse = async (courseId) => {
    await offlineDb.deleteDownloadedCourse(courseId);
    setDownloadedCourses(prev => prev.filter(c => c.courseId !== courseId));
    setDeviceStorageSizeMb(prev => Math.max(15, prev - 25));
  };

  const handleClearSharedStorage = async () => {
    await offlineDb.clearSharedDeviceCache();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="section-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '700' }}>
            System &amp; Offline Preferences
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Configure low-bandwidth settings, local device storage, and internationalization.
          </p>
        </div>
      </div>

      {clearedNotice && (
        <div style={{ background: 'var(--accent-sage-light)', color: 'var(--accent-sage)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
          <CheckCircle2 size={18} />
          <span>Local session cache cleared. Shared institutional device is now secured.</span>
        </div>
      )}

      {/* Data Saver Mode */}
      <div className="content-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Wifi size={18} color="var(--accent-primary)" />
          <h3 className="section-title">Data-Saving Mode &amp; Network Bandwidth</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { id: 'low_data', title: 'Low Data (Default)', desc: 'Prefers text, code notes & audio. Saves up to 85% data.' },
              { id: 'balanced', title: 'Balanced', desc: 'Standard 240p video and diagrams when bandwidth allows.' },
              { id: 'high_quality', title: 'High Quality', desc: 'Auto-streams high-resolution video when on Wi-Fi.' }
            ].map(item => (
              <label
                key={item.id}
                style={{
                  border: `1px solid ${dataPreference === item.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  background: dataPreference === item.id ? 'var(--accent-primary-light)' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.88rem' }}>
                  <input
                    type="radio"
                    name="dataPref"
                    value={item.id}
                    checked={dataPreference === item.id}
                    onChange={() => setDataPreference(item.id)}
                  />
                  <span>{item.title}</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {item.desc}
                </div>
              </label>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={wifiOnlyDownloads}
                onChange={(e) => setWifiOnlyDownloads(e.target.checked)}
              />
              <span>Download large course packages only on Wi-Fi connections</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoSyncOnReconnect}
                onChange={(e) => setAutoSyncOnReconnect(e.target.checked)}
              />
              <span>Automatically synchronize offline progress when connectivity returns</span>
            </label>
          </div>
        </div>
      </div>

      {/* Offline Storage Management */}
      <div className="content-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardDrive size={18} color="var(--accent-sage)" />
            <h3 className="section-title">Device Storage &amp; IndexedDB Manager</h3>
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--accent-sage)' }}>
            {deviceStorageSizeMb} MB Cached Offline
          </span>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Manage downloaded lessons, offline quizzes, and local database cache to optimize device performance.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>C Programming (Core Modules &amp; Quizzes)</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>18 MB • Downloaded on this device</div>
            </div>
            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--accent-crimson)' }} onClick={() => handleDeleteOfflineCourse('crs-c-lang')}>
              <Trash2 size={13} /> Remove
            </button>
          </div>

          {downloadedCourses.map((c) => (
            <div key={c.courseId} style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{c.title}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{c.sizeMb} MB • Cached in IndexedDB</div>
              </div>
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--accent-crimson)' }} onClick={() => handleDeleteOfflineCourse(c.courseId)}>
                <Trash2 size={13} /> Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Language Selection */}
      <div className="content-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Globe size={18} color="var(--accent-navy)" />
          <h3 className="section-title">Language &amp; Localization</h3>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { code: 'en', label: 'English' },
            { code: 'te', label: 'తెలుగు (Telugu)' },
            { code: 'hi', label: 'हिन्दी (Hindi)' }
          ].map(l => (
            <button
              key={l.code}
              className={lang === l.code ? "btn-primary" : "btn-secondary"}
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shared Device Security */}
      <div className="content-card" style={{ border: '1px solid #FEE2E2', background: '#FFFDFD' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-crimson)', marginBottom: '8px' }}>
          <Shield size={18} />
          <h3 className="section-title" style={{ color: 'var(--accent-crimson)' }}>Shared Institutional Device Isolation</h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          If you are using a shared computer at a college lab or community center, clear all local session tokens and pending records to protect your privacy.
        </p>
        <button className="btn-secondary" style={{ color: 'var(--accent-crimson)', borderColor: '#FCA5A5' }} onClick={handleClearSharedStorage}>
          Clear Shared Device Cache &amp; Isolate Data
        </button>
      </div>
    </div>
  );
};
