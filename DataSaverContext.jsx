import React, { createContext, useContext, useState } from 'react';

const DataSaverContext = createContext(null);

export const DataSaverProvider = ({ children }) => {
  const [dataPreference, setDataPreference] = useState('low_data'); // 'low_data', 'balanced', 'high_quality'
  const [wifiOnlyDownloads, setWifiOnlyDownloads] = useState(true);
  const [autoSyncOnReconnect, setAutoSyncOnReconnect] = useState(true);
  const [preferAudioNotes, setPreferAudioNotes] = useState(true);

  const isLowData = dataPreference === 'low_data';

  return (
    <DataSaverContext.Provider value={{
      dataPreference,
      setDataPreference,
      isLowData,
      wifiOnlyDownloads,
      setWifiOnlyDownloads,
      autoSyncOnReconnect,
      setAutoSyncOnReconnect,
      preferAudioNotes,
      setPreferAudioNotes
    }}>
      {children}
    </DataSaverContext.Provider>
  );
};

export const useDataSaver = () => useContext(DataSaverContext);
