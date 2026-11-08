// src/services/cloudSyncService.js
// Lightweight, secure Cloud Synchronization Service for Keşif Atlasım.
// Connects to Supabase / REST cloud endpoints for real-time multi-device sync with Master PIN security.

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
 * Uploads user places & progress to Supabase Cloud
 */
export async function pushPlacesToCloud(places, config) {
  if (!config || !config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Supabase URL ve Anon Key tanımlı değil.');
  }

  const endpoint = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/user_sync`;
  const payload = {
    sync_id: config.syncId || 'default_user',
    places_data: places,
    updated_at: new Date().toISOString()
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'apikey': config.supabaseKey,
      'Authorization': `Bearer ${config.supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Buluta kaydetme başarısız (${res.status}): ${errText}`);
  }

  return true;
}

/**
 * Pulls latest user places & progress from Supabase Cloud
 */
export async function pullPlacesFromCloud(config) {
  if (!config || !config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Supabase URL ve Anon Key tanımlı değil.');
  }

  const syncId = config.syncId || 'default_user';
  const endpoint = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/user_sync?sync_id=eq.${syncId}&select=*`;

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'apikey': config.supabaseKey,
      'Authorization': `Bearer ${config.supabaseKey}`
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Buluttan veri çekme başarısız (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].places_data)) {
    return {
      places: data[0].places_data,
      updatedAt: data[0].updated_at
    };
  }

  return null;
}
