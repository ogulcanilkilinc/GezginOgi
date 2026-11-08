// Automatic cloud sync: pulls on load and when the tab regains focus,
// pushes changed places a few seconds after each edit.
import { useEffect, useRef, useState } from 'react';
import {
  getCloudConfig,
  isCloudConfigured,
  isCustomPlace,
  pullPlacesFromCloud,
  pushChanges,
  userStateSignature
} from './cloudSyncService';

// Ids with local changes not yet pushed; survives reloads and offline periods.
const PENDING_KEY = 'kesif_atlasim_sync_pending_v1';
const PUSH_DELAY_MS = 2500;
const FOCUS_PULL_MIN_INTERVAL_MS = 30000;
const EMPTY_STATE = { visited: false, visitedDate: '', favorite: false, userRating: 0, userNotes: '', userPhotos: [], checklist: [] };

function readPending() {
  try {
    return new Set(JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'));
  } catch (e) {
    return new Set();
  }
}
function writePending(set) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify([...set]));
  } catch (e) {}
}

export function useAutoSync({ places, setPlaces, isLoadingPlaces, disabled }) {
  // 'off' | 'syncing' | 'ok' | 'pending' | 'error'
  const [status, setStatus] = useState('off');
  const [message, setMessage] = useState('');
  const baselineRef = useRef(null); // Map id -> signature known to equal the cloud
  const customIdsRef = useRef(new Set()); // custom place ids known to the cloud
  const placesRef = useRef(places);
  const busyRef = useRef(false);
  const lastPullRef = useRef(0);
  const retryTimerRef = useRef(null);
  placesRef.current = places;

  const enabled = () => {
    const config = getCloudConfig();
    return !disabled && isCloudConfigured(config) && config.autoSync !== false;
  };

  // Baseline = what the cloud holds. A place the cloud has no row for counts as
  // "empty", so local marks made before sync was set up get pushed too.
  const resetBaseline = (list, keepLocalIds, cloudIds) => {
    const map = new Map();
    list.forEach((p) => {
      if (keepLocalIds.has(p.id)) return;
      if (cloudIds.has(p.id)) map.set(p.id, userStateSignature(p));
      else if (!isCustomPlace(p)) map.set(p.id, userStateSignature({ ...p, ...EMPTY_STATE }));
    });
    baselineRef.current = map;
    customIdsRef.current = new Set(list.filter((p) => isCustomPlace(p) && cloudIds.has(p.id)).map((p) => p.id));
  };

  const pull = async () => {
    if (busyRef.current || !enabled()) return;
    busyRef.current = true;
    setStatus('syncing');
    try {
      const pending = readPending();
      const res = await pullPlacesFromCloud(placesRef.current, getCloudConfig(), pending);
      lastPullRef.current = Date.now();
      resetBaseline(res.places, pending, res.cloudIds);
      setPlaces(res.places);
      setStatus(pending.size > 0 ? 'pending' : 'ok');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Buluttan çekme hatası');
    } finally {
      busyRef.current = false;
    }
  };

  const push = async () => {
    if (busyRef.current || !enabled() || !baselineRef.current) return;
    const pending = readPending();
    if (pending.size === 0) return;
    busyRef.current = true;
    setStatus('syncing');
    try {
      const current = placesRef.current;
      const byId = new Map(current.map((p) => [p.id, p]));
      const changed = [...pending].map((id) => byId.get(id)).filter(Boolean);
      const deleted = [...pending].filter((id) => !byId.has(id));
      await pushChanges(changed, deleted, getCloudConfig());
      changed.forEach((p) => baselineRef.current.set(p.id, userStateSignature(p)));
      deleted.forEach((id) => {
        baselineRef.current.delete(id);
        customIdsRef.current.delete(id);
      });
      // Only clear what was sent unchanged; edits made during the push stay pending
      const stillPending = readPending();
      const latest = new Map(placesRef.current.map((p) => [p.id, p]));
      pending.forEach((id) => {
        const sent = byId.get(id);
        const now = latest.get(id);
        const done = sent ? !!now && userStateSignature(now) === userStateSignature(sent) : !now;
        if (done) stillPending.delete(id);
      });
      writePending(stillPending);
      setStatus(stillPending.size > 0 ? 'pending' : 'ok');
      setMessage('');
      if (stillPending.size > 0) retryTimerRef.current = setTimeout(push, PUSH_DELAY_MS);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Buluta gönderme hatası');
    } finally {
      busyRef.current = false;
    }
  };

  // Initial pull once the guide data has loaded
  useEffect(() => {
    if (isLoadingPlaces || baselineRef.current) return;
    if (!enabled()) {
      setStatus('off');
      return;
    }
    pull().then(() => push());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingPlaces, disabled]);

  // Track local edits and push them after a short pause
  useEffect(() => {
    if (!baselineRef.current || isLoadingPlaces || disabled) return;
    const pending = readPending();
    const seen = new Set();
    places.forEach((p) => {
      seen.add(p.id);
      if (baselineRef.current.get(p.id) !== userStateSignature(p)) pending.add(p.id);
      if (isCustomPlace(p)) customIdsRef.current.add(p.id);
    });
    // Custom places that were deleted locally
    customIdsRef.current.forEach((id) => {
      if (!seen.has(id)) pending.add(id);
    });
    writePending(pending);
    if (pending.size === 0) return;
    setStatus('pending');
    const t = setTimeout(push, PUSH_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  // Fetch changes from other devices when coming back to the tab or back online
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastPullRef.current < FOCUS_PULL_MIN_INTERVAL_MS) return;
      // The first pull failed (offline, bad settings): start over instead of staying idle
      if (!baselineRef.current) pull().then(() => push());
      else if (readPending().size > 0) push();
      else pull();
    };
    const onOnline = () => (baselineRef.current ? push() : pull().then(() => push()));
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('online', onOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  // Also used right after sync is configured: starts with a pull if nothing was synced yet
  const syncNow = async () => {
    if (!baselineRef.current) {
      await pull();
      return push();
    }
    return readPending().size > 0 ? push() : pull();
  };

  return { status, message, syncNow };
}
