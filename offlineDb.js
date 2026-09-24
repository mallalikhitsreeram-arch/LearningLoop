// Browser IndexedDB client storage for LEARNING LOOPS
const DB_NAME = 'LearningLoopsOfflineDB';
const DB_VERSION = 2;

let dbInstance = null;

function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Downloaded courses store
      if (!db.objectStoreNames.contains('downloaded_courses')) {
        db.createObjectStore('downloaded_courses', { keyPath: 'courseId' });
      }

      // Offline quizzes store
      if (!db.objectStoreNames.contains('offline_quizzes')) {
        db.createObjectStore('offline_quizzes', { keyPath: 'testId' });
      }

      // Offline sync queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'activityEventId' });
        syncStore.createIndex('status', 'status', { unique: false });
      }

      // Local user preferences & device cache
      if (!db.objectStoreNames.contains('device_cache')) {
        db.createObjectStore('device_cache', { keyPath: 'key' });
      }

      // Downloaded E-books store
      if (!db.objectStoreNames.contains('downloaded_ebooks')) {
        db.createObjectStore('downloaded_ebooks', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

export const offlineDb = {
  // Save downloaded course bundle
  async saveDownloadedCourse(bundle) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('downloaded_courses', 'readwrite');
      const store = tx.objectStore('downloaded_courses');
      const req = store.put(bundle);
      req.onsuccess = () => resolve(bundle);
      req.onerror = () => reject(req.error);
    });
  },

  // Get single downloaded course
  async getDownloadedCourse(courseId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('downloaded_courses', 'readonly');
      const store = tx.objectStore('downloaded_courses');
      const req = store.get(courseId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  // List all downloaded courses
  async getAllDownloadedCourses() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('downloaded_courses', 'readonly');
      const store = tx.objectStore('downloaded_courses');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  // Delete downloaded course (free up local storage)
  async deleteDownloadedCourse(courseId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('downloaded_courses', 'readwrite');
      const store = tx.objectStore('downloaded_courses');
      const req = store.delete(courseId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  // Save downloaded e-book
  async saveDownloadedEBook(ebook) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('downloaded_ebooks', 'readwrite');
      const store = tx.objectStore('downloaded_ebooks');
      const req = store.put({
        ...ebook,
        downloadedAt: new Date().toISOString()
      });
      req.onsuccess = () => resolve(ebook);
      req.onerror = () => reject(req.error);
    });
  },

  // Get single downloaded e-book
  async getDownloadedEBook(ebookId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('downloaded_ebooks', 'readonly');
      const store = tx.objectStore('downloaded_ebooks');
      const req = store.get(ebookId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  // List all downloaded e-books
  async getAllDownloadedEBooks() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('downloaded_ebooks', 'readonly');
      const store = tx.objectStore('downloaded_ebooks');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  // Delete downloaded e-book
  async deleteDownloadedEBook(ebookId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('downloaded_ebooks', 'readwrite');
      const store = tx.objectStore('downloaded_ebooks');
      const req = store.delete(ebookId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  // Add event to offline sync queue
  async enqueueSyncEvent(event) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const item = {
        ...event,
        activityEventId: event.activityEventId || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        status: 'pending',
        timestamp: event.timestamp || new Date().toISOString()
      };
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  },

  // Get pending events
  async getPendingSyncEvents() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        resolve(list.filter(item => item.status === 'pending' || item.status === 'failed'));
      };
      req.onerror = () => reject(req.error);
    });
  },

  // Mark events as synced or updated
  async markEventSynced(eventId, serverResponse) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const getReq = store.get(eventId);
      getReq.onsuccess = () => {
        if (getReq.result) {
          const updated = { ...getReq.result, status: 'synced', serverResponse, syncedAt: new Date().toISOString() };
          store.put(updated);
        }
        resolve(true);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  },

  // Clear device storage on shared logout
  async clearSharedDeviceCache() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['sync_queue', 'device_cache'], 'readwrite');
      tx.objectStore('sync_queue').clear();
      tx.objectStore('device_cache').clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
};
