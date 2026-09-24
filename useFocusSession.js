import { useState, useEffect, useCallback, useRef } from 'react';

// ─── localStorage keys ────────────────────────────────────────────────────────
const LS = {
  ACTIVE:      'll_focus_active',
  START:       'll_focus_start',
  END:         'll_focus_end',
  TYPE:        'll_focus_type',
  VIOLATIONS:  'll_focus_violations',
  LIMIT:       'll_focus_limit',
  ACTIVITY:    'll_focus_activity',
  SUBMITTED:   'll_focus_submitted',
  HISTORY:     'll_focus_history',
};

const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};
const load = (key, def = null) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : def;
  } catch { return def; }
};
const clear = (keys) => keys.forEach(k => localStorage.removeItem(k));

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useFocusSession = () => {
  // ── Restore from localStorage on mount ──────────────────────────────────────
  const restoreOrDefault = () => {
    const active = load(LS.ACTIVE, false);
    if (!active) return null;

    const endStr = load(LS.END);
    const now = Date.now();
    const endTime = endStr ? new Date(endStr).getTime() : now;

    // If session already expired while page was closed, end it
    if (endTime <= now) {
      // Expired naturally — clear and record as completed
      const hist = load(LS.HISTORY, []);
      const start = load(LS.START);
      const durationMs = start ? (endTime - new Date(start).getTime()) : 0;
      hist.unshift({
        date: new Date(start || now).toLocaleDateString('en-IN'),
        duration: Math.round(durationMs / 60000),
        violations: load(LS.VIOLATIONS, 0),
        type: load(LS.TYPE, 'study'),
        activity: load(LS.ACTIVITY, ''),
        completed: true,
        timestamp: start || new Date().toISOString(),
      });
      save(LS.HISTORY, hist.slice(0, 30));
      clear([LS.ACTIVE, LS.START, LS.END, LS.TYPE, LS.VIOLATIONS, LS.LIMIT, LS.ACTIVITY, LS.SUBMITTED]);
      return null;
    }

    return {
      active: true,
      startTime: load(LS.START),
      endTime: load(LS.END),
      sessionType: load(LS.TYPE, 'study'),
      violations: load(LS.VIOLATIONS, 0),
      violationLimit: load(LS.LIMIT, 3),
      activity: load(LS.ACTIVITY, 'Learning Session'),
      submitted: load(LS.SUBMITTED, false),
    };
  };

  const [session, setSession] = useState(restoreOrDefault);

  // derived state
  const [screen, setScreen] = useState(() => {
    const s = restoreOrDefault();
    return s ? 'active' : 'idle'; // 'idle' | 'setup' | 'active' | 'violation' | 'end'
  });
  const [endReason, setEndReason] = useState(null); // 'completed' | 'violated' | 'manual'
  const lastViolationRef = useRef(0);

  // ── Start a new session ──────────────────────────────────────────────────────
  const startSession = useCallback((config) => {
    const { sessionType, durationMinutes, violationLimit, activity } = config;
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

    const sess = {
      active: true,
      startTime,
      endTime,
      sessionType,
      violations: 0,
      violationLimit,
      activity,
      submitted: false,
    };

    save(LS.ACTIVE, true);
    save(LS.START, startTime);
    save(LS.END, endTime);
    save(LS.TYPE, sessionType);
    save(LS.VIOLATIONS, 0);
    save(LS.LIMIT, violationLimit);
    save(LS.ACTIVITY, activity);
    save(LS.SUBMITTED, false);

    setSession(sess);
    setScreen('active');
  }, []);

  // ── Record a violation (debounced) ────────────────────────────────────────────
  const recordViolation = useCallback(() => {
    const now = Date.now();
    if (now - lastViolationRef.current < 2000) return; // 2-sec debounce
    lastViolationRef.current = now;

    setSession(prev => {
      if (!prev) return prev;
      const newCount = (prev.violations || 0) + 1;
      save(LS.VIOLATIONS, newCount);

      if (newCount >= prev.violationLimit) {
        // Limit reached
        const isTestType = ['mock_test', 'exam', 'practice'].includes(prev.sessionType);
        if (isTestType) {
          save(LS.SUBMITTED, true);
          save(LS.ACTIVE, false);
          setScreen('end');
          setEndReason('violated_test');
          _saveHistory(prev, newCount, false);
          return { ...prev, violations: newCount, submitted: true };
        } else {
          save(LS.ACTIVE, false);
          setScreen('end');
          setEndReason('violated_study');
          _saveHistory(prev, newCount, false);
          return { ...prev, violations: newCount };
        }
      }

      setScreen('violation');
      return { ...prev, violations: newCount };
    });
  }, []);

  // ── Dismiss violation modal — return to active ──────────────────────────────
  const dismissViolation = useCallback(() => {
    setScreen('active');
  }, []);

  // ── Timer expired naturally ───────────────────────────────────────────────────
  const completeSession = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      save(LS.ACTIVE, false);
      _saveHistory(prev, prev.violations, true);
      return prev;
    });
    setScreen('end');
    setEndReason('completed');
    clear([LS.ACTIVE, LS.START, LS.END, LS.TYPE, LS.VIOLATIONS, LS.LIMIT, LS.ACTIVITY, LS.SUBMITTED]);
  }, []);

  // ── Manual end (abandon) ─────────────────────────────────────────────────────
  const endSession = useCallback((reason = 'manual') => {
    setSession(prev => {
      if (prev) _saveHistory(prev, prev?.violations || 0, false);
      return null;
    });
    save(LS.ACTIVE, false);
    clear([LS.ACTIVE, LS.START, LS.END, LS.TYPE, LS.VIOLATIONS, LS.LIMIT, LS.ACTIVITY, LS.SUBMITTED]);
    setScreen('idle');
    setEndReason(reason);
  }, []);

  // ── Open setup modal ─────────────────────────────────────────────────────────
  const openSetup = useCallback(() => setScreen('setup'), []);
  const closeSetup = useCallback(() => setScreen('idle'), []);

  // ── History ──────────────────────────────────────────────────────────────────
  const getHistory = useCallback(() => load(LS.HISTORY, []), []);

  return {
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
    getHistory,
  };
};

// ─── Internal helper ──────────────────────────────────────────────────────────
function _saveHistory(sess, violations, completed) {
  try {
    const hist = load(LS.HISTORY, []);
    const start = sess.startTime ? new Date(sess.startTime) : new Date();
    const end = sess.endTime ? new Date(sess.endTime) : new Date();
    const durationMs = end - start;
    hist.unshift({
      date: start.toLocaleDateString('en-IN'),
      duration: Math.round(Math.max(durationMs, 0) / 60000),
      violations,
      type: sess.sessionType,
      activity: sess.activity,
      completed,
      timestamp: sess.startTime || new Date().toISOString(),
    });
    save(LS.HISTORY, hist.slice(0, 30));
  } catch {}
}
