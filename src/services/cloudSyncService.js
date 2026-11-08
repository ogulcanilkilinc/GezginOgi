// src/services/cloudSyncService.js
// Secure, row-level Cloud Synchronization Service for Keşif Atlasım.
// Supports both Supabase Native Auth (Session-based, zero secret leaks)
// and User-defined Private Passphrase.

const SYNC_CONFIG_KEY = 'kesif_atlasim_cloud_config';
const AUTH_SESSION_KEY = 'kesif_atlasim_auth_session';

export function getCloudConfig() {
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
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

  const headers = {
    'apikey': config.supabaseKey,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  };

  // If user configured a private passphrase, send it as custom header
  if (config.privatePassphrase) {
    headers['x-sync-pass'] = config.privatePassphrase;
  }

  return headers;
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
        p.userRating > 0 ||
        p.rating > 0
    )
    .map((p) => ({
      place_id: p.id,
      visited: !!p.visited,
      visited_date: p.visitedDate || (p.visited ? new Date().toISOString() : ''),
      favorite: !!p.favorite,
      user_rating: p.userRating || p.rating || 0,
      user_notes: p.userNotes || '',
      user_photos: p.userPhotos || [],
      checklist: p.checklist || [],
      updated_at: new Date().toISOString()
    }));

  // 2. Filter user-created custom places
  const customPlaces = places
    .filter((p) => p.isCustom || p.id.startsWith('custom_') || p.id.startsWith('user_'))
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
export async function pullPlacesFromCloud(localPlaces, config) {
  if (!config || !config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Supabase URL ve Anon Key tanımlı değil.');
  }

  const baseUrl = config.supabaseUrl.replace(/\/$/, '');
  const headers = buildHeaders(config);

  const resState = await fetch(`${baseUrl}/rest/v1/user_place_state?select=*`, {
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
    const resCustom = await fetch(`${baseUrl}/rest/v1/user_custom_places?select=*`, {
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

  const mergedPlaces = localPlaces.map((pl) => {
    const cState = stateMap.get(pl.id);
    if (!cState) return pl;

    return {
      ...pl,
      visited: cState.visited !== undefined ? cState.visited : pl.visited,
      visitedDate: cState.visited_date || pl.visitedDate || '',
      favorite: cState.favorite !== undefined ? cState.favorite : pl.favorite,
      userRating: cState.user_rating || pl.userRating || 0,
      userNotes: cState.user_notes !== undefined ? cState.user_notes : pl.userNotes || '',
      userPhotos: Array.isArray(cState.user_photos) && cState.user_photos.length > 0 ? cState.user_photos : pl.userPhotos || [],
      checklist: Array.isArray(cState.checklist) && cState.checklist.length > 0 ? cState.checklist : pl.checklist || []
    };
  });

  if (Array.isArray(cloudCustom) && cloudCustom.length > 0) {
    const existingIds = new Set(mergedPlaces.map((p) => p.id));
    cloudCustom.forEach((c) => {
      if (c.data && !existingIds.has(c.id)) {
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
    customCount: cloudCustom.length
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

    const blobRes = await fetch(dataUrl);
    const blob = await blobRes.blob();

    const fileName = `${placeId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`;
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
