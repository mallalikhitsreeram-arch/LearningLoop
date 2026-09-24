import React from 'react';
import { WifiOff, DownloadCloud } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const OfflineBanner = ({ onGoToDownloads }) => {
  const { isEffectiveOnline, pendingCount } = useNetwork();
  const { t } = useLanguage();

  if (isEffectiveOnline) return null;

  return (
    <div className="offline-top-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <WifiOff size={16} />
        <span>
          <strong>{t('offline_mode')}:</strong> {t('offline_banner')}
        </span>
        {pendingCount > 0 && (
          <span style={{ background: '#FCE7DF', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
            {pendingCount} waiting to sync
          </span>
        )}
      </div>

      {onGoToDownloads && (
        <button
          onClick={onGoToDownloads}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
        >
          <DownloadCloud size={14} /> View Downloaded Courses
        </button>
      )}
    </div>
  );
};
