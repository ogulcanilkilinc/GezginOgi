// src/services/cloudSyncService.js
// Granular, secure, row-level Cloud Synchronization Service for Keşif Atlasım.
// Syncs per-place user overrides (visited, notes, rating, favorite) and custom-added places.
// Secured with Supabase PostgreSQL Row Level Security (RLS) and Master PIN verification.

const SYNC_CONFIG_KEY = 'kesif_atlasim_cloud_config';

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
  } catch (e) {
    console.error('Cloud config silme hatası:', e);
  }
}

/**
 * Pushes only user-modified states (visited, notes, rating, favorite) and custom places.
 * Payload is tiny (< 10 KB) instead of 2.6 MB monolithic blob, preventing cross-device overwrites!
 */
export async function pushPlacesToCloud(places, config) {
  if (!config || !config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Supabase URL ve Anon Key tanımlı değil.');
  }

  const baseUrl = config.supabaseUrl.replace(/\/$/, '');
  const pin = config.pin || '1965';

  const headers = {
    'apikey': config.supabaseKey,
    'Authorization': `Bearer ${config.supabaseKey}`,
    'Content-Type': 'application/json',
    'x-sync-pin': pin,
    'Prefer': 'resolution=merge-duplicates'
  };

  // 1. Filter user state overrides (only places user actually touched)
  const modifiedStates = places
    .filter((p) => p.visited || p.favorite || (p.userNotes && p.userNotes.trim().length > 0) || p.userRating > 0 || p.rating > 0)
    .map((p) => ({
      place_id: p.id,
      visited: !!p.visited,
      visited_date: p.visitedDate || (p.visited ? new Date().toISOString() : ''),
      favorite: !!p.favorite,
      user_rating: p.userRating || p.rating || 0,
      user_notes: p.userNotes || '',
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

  // Upload user_place_state
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

  // Upload user_custom_places
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
    syncedStatesCount: modifiedStates.length,
    syncedCustomCount: customPlaces.length
  };
}

/**
 * Pulls row-level user states from Supabase and merges them safely into local places
 */
export async function pullPlacesFromCloud(localPlaces, config) {
  if (!config || !config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Supabase URL ve Anon Key tanımlı değil.');
  }

  const baseUrl = config.supabaseUrl.replace(/\/$/, '');
  const pin = config.pin || '1965';

  const headers = {
    'apikey': config.supabaseKey,
    'Authorization': `Bearer ${config.supabaseKey}`,
    'x-sync-pin': pin
  };

  // 1. Fetch user_place_state
  const resState = await fetch(`${baseUrl}/rest/v1/user_place_state?select=*`, {
    method: 'GET',
    headers
  });

  if (!resState.ok) {
    const err = await resState.text();
    throw new Error(`Bulut durumlarını çekme hatası (${resState.status}): ${err}`);
  }

  const states = await resState.json();

  // 2. Fetch user_custom_places
  let customPlaces = [];
  try {
    const resCustom = await fetch(`${baseUrl}/rest/v1/user_custom_places?select=*`, {
      method: 'GET',
      headers
    });
    if (resCustom.ok) {
      const rows = await resCustom.json();
      customPlaces = rows.map((r) => r.data).filter(Boolean);
    }
  } catch (e) {
    console.warn('Custom places fetch error:', e);
  }

  // 3. Merge granularly: Map state by place_id
  const stateMap = new Map();
  if (Array.isArray(states)) {
    states.forEach((s) => {
      if (s && s.place_id) stateMap.set(s.place_id, s);
    });
  }

  // Apply to existing localPlaces
  const updatedPlaces = localPlaces.map((p) => {
    const cloudState = stateMap.get(p.id);
    if (!cloudState) return p;

    return {
      ...p,
      visited: cloudState.visited !== undefined ? cloudState.visited : p.visited,
      visitedDate: cloudState.visited_date || p.visitedDate || '',
      favorite: cloudState.favorite !== undefined ? cloudState.favorite : p.favorite,
      userRating: cloudState.user_rating || p.userRating || 0,
      rating: cloudState.user_rating || p.rating || 0,
      userNotes: cloudState.user_notes !== undefined && cloudState.user_notes !== '' ? cloudState.user_notes : p.userNotes
    };
  });

  // Also include any custom places from cloud not present locally
  const existingIds = new Set(updatedPlaces.map((p) => p.id));
  customPlaces.forEach((cp) => {
    if (!existingIds.has(cp.id)) {
      updatedPlaces.push(cp);
      existingIds.add(cp.id);
    }
  });

  return {
    places: updatedPlaces,
    statesCount: states.length,
    customCount: customPlaces.length,
    updatedAt: new Date().toISOString()
  };
}
