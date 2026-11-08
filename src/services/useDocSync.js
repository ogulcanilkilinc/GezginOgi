// Keeps one small JSON document (e.g. the trip plan) in sync with the cloud.
// The newest edit wins: each side remembers when it last changed.
import { useEffect, useRef } from 'react';
import { fetchCloudDocument, getCloudConfig, isCloudConfigured, pushCloudDocument } from './cloudSyncService';

const META_KEY = 'kesif_atlasim_doc_meta_v1';
const PUSH_DELAY_MS = 2500;
const FOCUS_PULL_MIN_INTERVAL_MS = 30000;

function readMeta(id) {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || '{}')[id] || { updatedAt: 0, dirty: false };
  } catch (e) {
    return { updatedAt: 0, dirty: false };
  }
}
function writeMeta(id, meta) {
  try {
    const all = JSON.parse(localStorage.getItem(META_KEY) || '{}');
    all[id] = meta;
    localStorage.setItem(META_KEY, JSON.stringify(all));
  } catch (e) {}
}

export function useDocSync({ id, value, setValue, isEmpty, disabled }) {
  const valueRef = useRef(value);
  const skipNextChangeRef = useRef(true); // the first render is the stored value, not an edit
  const busyRef = useRef(false);
  const lastPullRef = useRef(0);
  valueRef.current = value;

  const enabled = () => !disabled && isCloudConfigured(getCloudConfig()) && getCloudConfig().autoSync !== false;

  const push = async () => {
    if (busyRef.current || !enabled()) return;
    const meta = readMeta(id);
    if (!meta.dirty) return;
    busyRef.current = true;
    try {
      const sent = JSON.stringify(valueRef.current);
      await pushCloudDocument(id, valueRef.current, meta.updatedAt, getCloudConfig());
      // An edit made while sending stays dirty and goes out next time
      if (JSON.stringify(valueRef.current) === sent) writeMeta(id, { ...readMeta(id), dirty: false });
    } catch (e) {
      // Stays dirty; retried on the next edit, focus or reconnect
    } finally {
      busyRef.current = false;
    }
  };

  const pull = async () => {
    if (busyRef.current || !enabled()) return;
    busyRef.current = true;
    let needPush = false;
    try {
      const cloud = await fetchCloudDocument(id, getCloudConfig());
      lastPullRef.current = Date.now();
      const meta = readMeta(id);
      if (cloud && cloud.updatedAt > meta.updatedAt && !meta.dirty) {
        skipNextChangeRef.current = true;
        setValue(cloud.data);
        writeMeta(id, { updatedAt: cloud.updatedAt, dirty: false });
      } else if (meta.dirty || (!cloud && !isEmpty(valueRef.current))) {
        // Local edits (or a plan made before sync was set up) go up
        if (!meta.dirty) writeMeta(id, { updatedAt: meta.updatedAt || Date.now(), dirty: true });
        needPush = true;
      }
    } catch (e) {
      // Offline or misconfigured; tried again on focus or reconnect
    } finally {
      busyRef.current = false;
    }
    if (needPush) await push();
  };

  // Pull once on start
  useEffect(() => {
    pull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  // Local edits: stamp them and push after a short pause
  useEffect(() => {
    if (skipNextChangeRef.current) {
      skipNextChangeRef.current = false;
      return;
    }
    if (disabled) return;
    writeMeta(id, { updatedAt: Date.now(), dirty: true });
    const t = setTimeout(push, PUSH_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Changes from other devices when coming back to the tab; unsent edits when back online
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastPullRef.current < FOCUS_PULL_MIN_INTERVAL_MS) return;
      pull();
    };
    const onOnline = () => pull();
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('online', onOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  return { syncNow: pull };
}
