// src/services/cloudSyncService.js
// Secure, row-level Cloud Synchronization Service for GezginOgi.
// Supports both Supabase Native Auth (Session-based, zero secret leaks)
// and User-defined Private Passphrase.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';
import { dataUrlToBlob } from './photoStore';

const SYNC_CONFIG_KEY = 'kesif_atlasim_cloud_config';
const AUTH_SESSION_KEY = 'kesif_atlasim_auth_session';

// Signed-in account (e-mail link or Google): the guide's own Supabase project, per-user tables
export function getAccountSession() {
  const s = getAuthSession();
  return s && s.access_token && s.user && s.user.id ? s : null;
}

export function getCloudConfig() {
  if (getAccountSession()) return { supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY, mode: 'account', autoSync: true };
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

const isAccount = (config) => !!config && config.mode === 'account';
// Photos still held only on this device (taken before signing in) are never sent as table data;
// they are uploaded to the private photo folder first (see AccountModal)
const isDeviceOnlyPhoto = (src) => typeof src === 'string' && src.startsWith('data:');
const tables = (config) =>
  isAccount(config)
    ? { state: 'gz_place_state', custom: 'gz_custom_places', doc: 'gz_documents' }
    : { state: 'user_place_state', custom: 'user_custom_places', doc: 'user_documents' };
const owner = (config) => (isAccount(config) ? { user_id: getAccountSession().user.id } : {});

let refreshing = null;
// A valid access token: renewed shortly before it expires. Offline keeps the old session for later.
export async function ensureSession() {
  const s = getAccountSession();
  if (!s) return null;
  if (s.expires_at && s.expires_at - Math.floor(Date.now() / 1000) > 60) return s;
  if (!s.refresh_token) return s;
  if (!refreshing) {
    refreshing = fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: s.refresh_token })
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.access_token) {
          const next = { ...s, ...data, expires_at: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600) };
          saveAuthSession(next);
          return next;
        }
        if (res.status === 400 || res.status === 401) localStorage.removeItem(AUTH_SESSION_KEY);
        return null;
      })
      .catch(() => s)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export function saveCloudConfig(config) {
  try {
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Cloud config kaydetme hatası:', e);
  }
}

export function clearCloudConfig() {
  try {
    localStorage.removeItem(SYNC_CONFIG_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch (e) {
    console.error('Cloud config silme hatası:', e);
  }
}

export function getAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveAuthSession(session) {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Auth session kaydetme hatası:', e);
  }
}

/**
 * Supabase Auth: Sign in with Email and Password
 */
export async function signInWithEmail(supabaseUrl, supabaseKey, email, password) {
  const baseUrl = supabaseUrl.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || data.message || 'Giriş başarısız.');
  }

  saveAuthSession(data);
  return data;
}

/**
 * Supabase Auth: Send Magic Link / OTP to email
 */
export async function sendMagicLink(supabaseUrl, supabaseKey, email) {
  const baseUrl = supabaseUrl.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/auth/v1/otp`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error_description || data.msg || data.message || 'Sihirli bağlantı gönderilemedi.');
  }

  return true;
}

/**
 * Build request headers with session token or private pass
 */
function buildHeaders(config) {
  const session = getAuthSession();
  const token = session?.access_token || config.supabaseKey;
  if (!/^[\x21-\x7e]+$/.test(config.supabaseKey || '')) {
    throw new Error('Supabase anahtarı geçersiz (gizli ••• hâliyle kopyalanmış olabilir). Bulut Eşleme penceresinde anahtarı yeniden yapıştırın.');
  }

  const headers = {
    'apikey': config.supabaseKey,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  };

  // Old shared-passphrase mode: the passphrase travels as a custom header
  if (!isAccount(config) && config.privatePassphrase) {
    headers['x-sync-pass'] = syncPassHeader(config.privatePassphrase);
  }

  return headers;
}

// HTTP headers only carry Latin-1, so a passphrase with Turkish letters (ğ, ş, ı…)
// is sent percent-encoded. Plain ASCII passphrases stay as they are, so existing
// SQL policies keep matching. The SQL snippet uses the same value.
export function syncPassHeader(pass) {
  return /^[\x20-\x7e]*$/.test(pass) ? pass : encodeURIComponent(pass);
}

export function isCustomPlace(p) {
  return !!(p.isCustom || p.id.startsWith('custom_') || p.id.startsWith('custom-') || p.id.startsWith('user_'));
}

// The user-editable part of a place, as stored in user_place_state.
// Note: p.rating is the guide's rating, never the user's.
function toStateRow(p) {
  return {
    place_id: p.id,
    visited: !!p.visited,
    visited_date: p.visitedDate || '',
    favorite: !!p.favorite,
    user_rating: p.userRating || 0,
    user_notes: p.userNotes || '',
    user_photos: p.userPhotos || [],
    checklist: p.checklist || [],
    updated_at: new Date().toISOString()
  };
}

// Comparable signature of a place's user state (and full data for custom places).
export function userStateSignature(p) {
  const state = toStateRow(p);
  delete state.updated_at;
  return JSON.stringify(isCustomPlace(p) ? [state, p] : state);
}

const quoteIds = (ids) => `(${ids.map((id) => `"${String(id).replace(/"/g, '')}"`).join(',')})`;

/**
 * Pushes exactly the given changed places (including cleared states such as
 * "not visited anymore" or "all photos removed") and deletes removed custom places.
 */
export async function pushChanges(changedPlaces, deletedIds, config) {
  await ensureSession();
  const baseUrl = config.supabaseUrl.replace(/\/$/, '');
  const headers = buildHeaders(config);
  const T = tables(config);
  const own = owner(config);

  const send = async (url, method, body) => {
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) throw new Error(`Bulut eşleme hatası (${res.status}): ${await res.text()}`);
  };

  if (changedPlaces.length > 0) {
    await send(`${baseUrl}/rest/v1/${T.state}`, 'POST', changedPlaces.map((p) => {
      const row = { ...own, ...toStateRow(p) };
      if (isAccount(config)) row.user_photos = row.user_photos.filter((x) => !isDeviceOnlyPhoto(x));
      return row;
    }));
    const custom = changedPlaces.filter(isCustomPlace);
    if (custom.length > 0) {
      const now = new Date().toISOString();
      await send(
        `${baseUrl}/rest/v1/${T.custom}`,
        'POST',
        custom.map((p) => ({ ...own, id: p.id, data: p, updated_at: now }))
      );
    }
  }

  if (deletedIds.length > 0) {
    await send(`${baseUrl}/rest/v1/${T.state}?place_id=in.${encodeURIComponent(quoteIds(deletedIds))}`, 'DELETE');
    await send(`${baseUrl}/rest/v1/${T.custom}?id=in.${encodeURIComponent(quoteIds(deletedIds))}`, 'DELETE');
  }
}

/**
 * One JSON document per id in user_documents (e.g. 'trip').
 * Returns { data, updatedAt } or null when the cloud has no such document.
 */
export async function fetchCloudDocument(id, config) {
  await ensureSession();
  const baseUrl = config.supabaseUrl.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/rest/v1/${tables(config).doc}?id=eq.${encodeURIComponent(id)}&select=data,updated_at`, {
    headers: buildHeaders(config)
  });
  if (!res.ok) throw new Error(`Bulut belge hatası (${res.status}): ${await res.text()}`);
  const rows = await res.json();
  return rows.length > 0 ? { data: rows[0].data, updatedAt: Date.parse(rows[0].updated_at) } : null;
}

export async function pushCloudDocument(id, data, updatedAt, config) {
  await ensureSession();
  const baseUrl = config.supabaseUrl.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/rest/v1/${tables(config).doc}`, {
    method: 'POST',
    headers: buildHeaders(config),
    body: JSON.stringify([{ ...owner(config), id, data, updated_at: new Date(updatedAt).toISOString() }])
  });
  if (!res.ok) throw new Error(`Bulut belge hatası (${res.status}): ${await res.text()}`);
}

/**
 * Pushes only user-modified states and custom places.
 */
export async function pushPlacesToCloud(places, config) {
  if (!config || !config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Supabase URL ve Anon Key tanımlı değil.');
  }

  const baseUrl = config.supabaseUrl.replace(/\/$/, '');
  const headers = buildHeaders(config);

  // 1. Filter user state overrides
  const modifiedStates = places
    .filter(
      (p) =>
        p.visited ||
        p.favorite ||
        (p.userNotes && p.userNotes.trim().length > 0) ||
        (p.userPhotos && p.userPhotos.length > 0) ||
        (p.checklist && p.checklist.some((c) => c.done)) ||
        p.userRating > 0
    )
    .map(toStateRow);

  // 2. Filter user-created custom places
  const customPlaces = places
    .filter(isCustomPlace)
    .map((p) => ({
      id: p.id,
      data: p,
      updated_at: new Date().toISOString()
    }));

  if (modifiedStates.length > 0) {
    const resState = await fetch(`${baseUrl}/rest/v1/user_place_state`, {
      method: 'POST',
      headers,
      body: JSON.stringify(modifiedStates)
    });

    if (!resState.ok) {
      const err = await resState.text();
      throw new Error(`Durum eşleme hatası (${resState.status}): ${err}`);
    }
  }

  if (customPlaces.length > 0) {
    const resCustom = await fetch(`${baseUrl}/rest/v1/user_custom_places`, {
      method: 'POST',
      headers,
      body: JSON.stringify(customPlaces)
    });

    if (!resCustom.ok) {
      const err = await resCustom.text();
      throw new Error(`Özel mekan eşleme hatası (${resCustom.status}): ${err}`);
    }
  }

  return {
    success: true,
    syncedStatesCount: modifiedStates.length,
    syncedCustomCount: customPlaces.length
  };
}

/**
 * Pulls row-level changes from Supabase and merges them safely.
 */
export async function pullPlacesFromCloud(localPlaces, config, keepLocalIds = new Set()) {
  if (!config || !config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Supabase URL ve Anon Key tanımlı değil.');
  }

  await ensureSession();
  const baseUrl = config.supabaseUrl.replace(/\/$/, '');
  const headers = buildHeaders(config);
  const T = tables(config);

  const resState = await fetch(`${baseUrl}/rest/v1/${T.state}?select=*`, {
    method: 'GET',
    headers
  });

  if (!resState.ok) {
    const err = await resState.text();
    throw new Error(`Buluttan çekme hatası (${resState.status}): ${err}`);
  }

  const cloudStates = await resState.json();

  let cloudCustom = [];
  try {
    const resCustom = await fetch(`${baseUrl}/rest/v1/${T.custom}?select=*`, {
      method: 'GET',
      headers
    });
    if (resCustom.ok) {
      cloudCustom = await resCustom.json();
    }
  } catch (e) {}

  const stateMap = new Map();
  if (Array.isArray(cloudStates)) {
    cloudStates.forEach((st) => {
      stateMap.set(st.place_id, st);
    });
  }

  // The cloud row is the truth for every place, including cleared values
  // (unvisited, empty notes, all photos removed) — except places with local
  // changes that have not been pushed yet (keepLocalIds).
  const customMap = new Map((Array.isArray(cloudCustom) ? cloudCustom : []).filter((c) => c.data).map((c) => [c.id, c]));
  const mergedPlaces = localPlaces.map((local) => {
    if (keepLocalIds.has(local.id)) return local;
    // A custom place edited on another device: take the cloud's copy
    const cloudCustomRow = customMap.get(local.id);
    const pl = cloudCustomRow ? { ...cloudCustomRow.data, id: local.id, isCustom: true } : local;
    const cState = stateMap.get(pl.id);
    if (!cState) return pl;

    return {
      ...pl,
      visited: !!cState.visited,
      visitedDate: cState.visited_date || '',
      favorite: !!cState.favorite,
      userRating: cState.user_rating || 0,
      userNotes: cState.user_notes || '',
      userPhotos: [
        ...(Array.isArray(cState.user_photos) ? cState.user_photos : []),
        ...(isAccount(config) ? (pl.userPhotos || []).filter(isDeviceOnlyPhoto) : [])
      ],
      checklist: Array.isArray(cState.checklist) ? cState.checklist : []
    };
  });

  if (Array.isArray(cloudCustom) && cloudCustom.length > 0) {
    const existingIds = new Set(mergedPlaces.map((p) => p.id));
    cloudCustom.forEach((c) => {
      if (c.data && !existingIds.has(c.id) && !keepLocalIds.has(c.id)) {
        mergedPlaces.push({
          ...c.data,
          id: c.id,
          isCustom: true
        });
        existingIds.add(c.id);
      }
    });
  }

  return {
    success: true,
    places: mergedPlaces,
    statesCount: cloudStates.length,
    customCount: cloudCustom.length,
    cloudIds: new Set([...stateMap.keys(), ...customMap.keys()])
  };
}

/**
 * Uploads a photo to Supabase Storage ('user_photos' bucket) if configured.
 * Returns public URL if uploaded, or null on fallback.
 */
export async function uploadPhotoToSupabase(dataUrl, placeId, config) {
  if (!config || !config.supabaseUrl || !config.supabaseKey) return null;
  try {
    const baseUrl = config.supabaseUrl.replace(/\/$/, '');
    const headers = buildHeaders(config);

    const blob = dataUrlToBlob(dataUrl);

    // Random UUID: the bucket is public, so file names must be impossible to guess
    const fileName = `${placeId}_${crypto.randomUUID()}.jpg`;
    const res = await fetch(`${baseUrl}/storage/v1/object/user_photos/${fileName}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'image/jpeg'
      },
      body: blob
    });

    if (res.ok) {
      return `${baseUrl}/storage/v1/object/public/user_photos/${fileName}`;
    }
  } catch (err) {
    console.warn('Supabase Storage yükleme atlandı (yerel saklama kullanılacak):', err);
  }
  return null;
}

/**
 * Deletes a photo from the Supabase Storage bucket when the user removes it.
 * Only acts on URLs that point to this project's user_photos bucket.
 */
export async function deletePhotoFromSupabase(photoUrl, config) {
  if (!config || !config.supabaseUrl || !config.supabaseKey || typeof photoUrl !== 'string') return;
  const baseUrl = config.supabaseUrl.replace(/\/$/, '');
  const prefix = `${baseUrl}/storage/v1/object/public/user_photos/`;
  if (!photoUrl.startsWith(prefix)) return;
  try {
    await fetch(`${baseUrl}/storage/v1/object/user_photos/${photoUrl.slice(prefix.length)}`, {
      method: 'DELETE',
      headers: buildHeaders(config)
    });
  } catch (err) {
    console.warn('Supabase Storage silme atlandı:', err);
  }
}

export function isCloudConfigured(config = getCloudConfig()) {
  return !!(config && config.supabaseUrl && config.supabaseKey && (isAccount(config) || config.privatePassphrase));
}
