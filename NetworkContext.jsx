import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncEngine } from '../services/syncEngine.js';

const NetworkContext = createContext(null);

export const NetworkProvider = ({ children }) => {
  // Mode can be: 'online', 'weak2g' (low data / simulated intermittent), 'offline'
  const [networkMode, setNetworkMode] = useState('online');
  const [browserOnline, setBrowserOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'pending', 'failed'
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Effective online boolean: true only if browser is online AND user hasn't toggled simulated offline
  const isEffectiveOnline = browserOnline && networkMode !== 'offline';

  const refreshPendingCount = useCallback(async () => {
    const count = await syncEngine.getPendingCount();
    setPendingCount(count);
    if (count > 0 && syncStatus !== 'syncing') {
      setSyncStatus('pending');
    } else if (count === 0 && syncStatus !== 'syncing') {
      setSyncStatus('synced');
    }
  }, [syncStatus]);

  const triggerSync = useCallback(async (studentId = 'usr-student-1') => {
    if (!isEffectiveOnline) return;
    setSyncStatus('syncing');
    const res = await syncEngine.syncPendingActivities(studentId, isEffectiveOnline);
    if (res.success) {
      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      refreshPendingCount();
    } else {
      setSyncStatus('failed');
    }
  }, [isEffectiveOnline, refreshPendingCount]);

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => {
      setBrowserOnline(true);
      if (networkMode !== 'offline') {
        triggerSync();
      }
    };
    const handleOffline = () => {
      setBrowserOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    refreshPendingCount();

    // Subscribe to syncEngine events
    const unsub = syncEngine.subscribe((event) => {
      if (event.type === 'queued') {
        refreshPendingCount();
      } else if (event.status === 'syncing') {
        setSyncStatus('syncing');
      } else if (event.status === 'synced') {
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        refreshPendingCount();
      } else if (event.status === 'failed') {
        setSyncStatus('failed');
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
    };
  }, [networkMode, triggerSync, refreshPendingCount]);

  // Switch network mode (e.g. from top nav simulation switch)
  const setMode = (newMode) => {
    setNetworkMode(newMode);
    if (newMode === 'online') {
      triggerSync();
    }
  };

  return (
    <NetworkContext.Provider value={{
      networkMode,
      setMode,
      isEffectiveOnline,
      browserOnline,
      pendingCount,
      syncStatus,
      lastSyncTime,
      triggerSync,
      refreshPendingCount
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
