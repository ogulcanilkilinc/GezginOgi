// The user's own photos ({ placeId: [url, ...] }) live in IndexedDB, which holds hundreds of MB,
// instead of localStorage (~5 MB, about 35-50 photos). Photos saved by earlier versions in
// localStorage are moved over on first load. If IndexedDB cannot be opened (some private
// browsing modes), localStorage is used as before.
const LEGACY_KEY = 'kesif_atlasim_user_photos_v1';
const DB_NAME = 'gezginogi';
const STORE = 'kv';
const RECORD = 'userPhotos';

let dbPromise = null;
function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB yok'));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }).catch((e) => {
      dbPromise = null;
      throw e;
    });
  }
  return dbPromise;
}

function run(mode, fn) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

function readLegacy() {
  try {
    return JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

// Last loaded or saved photos, for code that merges synchronously
let cache = {};
export function cachedPhotos() {
  return cache;
}

export async function loadPhotos() {
  const legacy = readLegacy();
  try {
    const stored = await run('readonly', (s) => s.get(RECORD));
    let photos = stored || {};
    if (legacy && Object.keys(legacy).length) {
      // Move the old localStorage photos over; a place already in IndexedDB keeps its newer list
      photos = { ...legacy, ...photos };
      await run('readwrite', (s) => s.put(photos, RECORD));
    }
    if (legacy) localStorage.removeItem(LEGACY_KEY);
    cache = photos;
  } catch (e) {
    cache = legacy || {};
  }
  // Ask the browser not to clear this storage when space runs low (mainly Safari)
  try {
    navigator.storage?.persist?.();
  } catch (e) {}
  return cache;
}

export async function savePhotos(photos) {
  cache = photos;
  try {
    await run('readwrite', (s) => s.put(photos, RECORD));
  } catch (e) {
    if (e && e.name === 'QuotaExceededError') throw e;
    // No IndexedDB here: fall back to localStorage
    localStorage.setItem(LEGACY_KEY, JSON.stringify(photos));
  }
}
