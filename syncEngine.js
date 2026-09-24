// Client-side synchronization engine for offline activities
import { offlineDb } from './offlineDb.js';

class SyncEngine {
  constructor() {
    this.isSyncing = false;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(status) {
    this.listeners.forEach(fn => fn(status));
  }

  // Queue an offline activity (e.g. lesson completed, offline quiz attempt)
  async queueActivity(type, payload, studentId = 'usr-student-1') {
    const event = {
      activityEventId: `evt-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      studentId,
      ...payload,
      timestamp: new Date().toISOString()
    };

    const saved = await offlineDb.enqueueSyncEvent(event);
    this.notify({ type: 'queued', event: saved });
    return saved;
  }

  // Synchronize all pending events to backend
  async syncPendingActivities(studentId = 'usr-student-1', isOnline = true) {
    if (!isOnline) {
      this.notify({ status: 'offline', message: 'Offline mode active. Synchronization paused.' });
      return { success: false, reason: 'offline' };
    }

    if (this.isSyncing) return { success: false, reason: 'in_progress' };

    try {
      this.isSyncing = true;
      this.notify({ status: 'syncing' });

      const pendingEvents = await offlineDb.getPendingSyncEvents();

      if (pendingEvents.length === 0) {
        this.isSyncing = false;
        this.notify({ status: 'synced', pendingCount: 0 });
        return { success: true, processedCount: 0 };
      }

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          events: pendingEvents
        })
      });

      if (!response.ok) {
        throw new Error(`Sync server responded with ${response.status}`);
      }

      const data = await response.json();

      // Mark events as synced in IndexedDB
      if (Array.isArray(data.results)) {
        for (const item of data.results) {
          await offlineDb.markEventSynced(item.eventId, item);
        }
      }

      this.isSyncing = false;
      this.notify({ status: 'synced', pendingCount: 0, serverData: data });
      return { success: true, serverData: data };
    } catch (err) {
      console.warn('Sync attempt failed, keeping events in queue for next reconnection:', err);
      this.isSyncing = false;
      this.notify({ status: 'failed', error: err.message });
      return { success: false, error: err.message };
    }
  }

  // Check count of pending events in queue
  async getPendingCount() {
    try {
      const pending = await offlineDb.getPendingSyncEvents();
      return pending.length;
    } catch (err) {
      return 0;
    }
  }
}

export const syncEngine = new SyncEngine();
