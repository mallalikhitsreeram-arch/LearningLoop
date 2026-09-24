import React, { useCallback } from 'react';
import { useFocusSession } from './useFocusSession.js';
import { FocusSetupModal } from './FocusSetupModal.jsx';
import { FocusActiveScreen } from './FocusActiveScreen.jsx';
import { FocusViolationModal } from './FocusViolationModal.jsx';
import { FocusEndScreen } from './FocusEndScreen.jsx';

/**
 * FocusMode — top-level orchestrator.
 * Rendered once at the App level (student only).
 * Exposes { openSetup } for the sidebar button trigger.
 */
export const FocusMode = ({ onNavigate }) => {
  const {
    session,
    screen,
    endReason,
    startSession,
    recordViolation,
    dismissViolation,
    completeSession,
    endSession,
    openSetup,
    closeSetup,
  } = useFocusSession();

  const handleNavigate = useCallback((tab) => {
    endSession('manual');
    onNavigate(tab);
  }, [endSession, onNavigate]);

  if (screen === 'idle') return null;

  if (screen === 'setup') {
    return (
      <FocusSetupModal
        onStart={startSession}
        onClose={closeSetup}
      />
    );
  }

  if (screen === 'active' && session) {
    return (
      <FocusActiveScreen
        session={session}
        onViolation={recordViolation}
        onComplete={completeSession}
        onAbandon={() => endSession('manual')}
      />
    );
  }

  if (screen === 'violation' && session) {
    return (
      <>
        {/* Keep active screen behind modal */}
        <FocusActiveScreen
          session={session}
          onViolation={() => {}} // paused during modal
          onComplete={completeSession}
          onAbandon={() => endSession('manual')}
        />
        <FocusViolationModal
          session={session}
          onReturn={dismissViolation}
        />
      </>
    );
  }

  if (screen === 'end') {
    return (
      <FocusEndScreen
        session={session}
        endReason={endReason}
        onNavigate={handleNavigate}
      />
    );
  }

  return null;
};

// Re-export the hook so Sidebar can use openSetup directly
export { useFocusSession };
