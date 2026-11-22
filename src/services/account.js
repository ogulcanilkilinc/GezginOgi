// User accounts (Supabase Auth): e-mail link or Google sign-in, session handling, private photos,
// suggestions and the community guide. The project URL and the anon key are public by design:
// what a signed-in or anonymous visitor may do is decided by the row level security rules in
// supabase/hesaplar.sql, never by hiding this key.
import { getAuthSession, saveAuthSession, ensureSession } from './cloudSyncService';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';
import { cachePhotoBlob, getCachedPhotoBlob, dataUrlToBlob, clearAllPhotoData } from './photoStore';

export { SUPABASE_URL, SUPABASE_ANON_KEY };

export const PHOTO_BUCKET = 'gz_photos';
export const PHOTO_QUOTA = 300;
const PHOTO_PREFIX = 'gz:';
const REFRESH_KEY = 'kesif_atlasim_auth_error';

const anonHeaders = { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };

function siteUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

// ---------------------------------------------------------------- session
export function getAccount() {
  const s = getAuthSession();
  if (!s || !s.access_token || !s.user || !s.user.id) return null;
  return { id: s.user.id, email: s.user.email || '', provider: s.user.app_metadata?.provider || '' };
}

export function hasAccount() {
  return !!getAccount();
}

function storeSession(data) {
  const expiresAt = data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600);
  saveAuthSession({ ...data, expires_at: expiresAt });
}

// Tokens arrive in the address hash after an e-mail link or Google sign-in
export async function consumeAuthRedirect() {
  const hash = window.location.hash || '';
  if (!/access_token=|error_description=/.test(hash)) return { signedIn: false };
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  history.replaceState(null, '', window.location.pathname + window.location.search);
  if (params.get('error_description')) {
    try {
      sessionStorage.setItem(REFRESH_KEY, params.get('error_description').replace(/\+/g, ' '));
    } catch (e) {}
    return { signedIn: false, error: params.get('error_description') };
  }
  const access = params.get('access_token');
  if (!access) return { signedIn: false };
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${access}` } });
  if (!res.ok) return { signedIn: false, error: 'Giriş doğrulanamadı.' };
  const user = await res.json();
  storeSession({
    access_token: access,
    refresh_token: params.get('refresh_token'),
    expires_in: Number(params.get('expires_in')) || 3600,
    expires_at: Number(params.get('expires_at')) || undefined,
    token_type: 'bearer',
    user
  });
  return { signedIn: true };
}

export function takeAuthError() {
  try {
    const e = sessionStorage.getItem(REFRESH_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    return e;
  } catch (err) {
    return null;
  }
}

export async function sendLoginLink(email) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/otp?redirect_to=${encodeURIComponent(siteUrl())}`, {
    method: 'POST',
    headers: anonHeaders,
    body: JSON.stringify({ email: email.trim(), create_user: true })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.msg || data.error_description || data.message || '';
    if (res.status === 429 || /rate limit/i.test(msg)) throw new Error('Çok fazla bağlantı istendi. Birkaç dakika sonra tekrar dene.');
    throw new Error(msg || 'Giriş bağlantısı gönderilemedi.');
  }
}

export function startGoogleLogin() {
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(siteUrl())}`;
}

export async function signOutAccount() {
  const s = getAuthSession();
  try {
    if (s && s.access_token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${s.access_token}` } });
    }
  } catch (e) {}
  try {
    localStorage.removeItem('kesif_atlasim_auth_session');
  } catch (e) {}
}

// ---------------------------------------------------------------- REST helper
export async function accountFetch(path, init = {}) {
  const s = await ensureSession();
  const token = (s && s.access_token) || SUPABASE_ANON_KEY;
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) }
  });
}

// ---------------------------------------------------------------- private photos
export const isPrivatePhoto = (src) => typeof src === 'string' && src.startsWith(PHOTO_PREFIX);

// Uploads a downscaled JPEG data URL to the user's own folder; returns the stored reference ("gz:<path>")
export async function uploadPrivatePhoto(source, placeId) {
  const acc = getAccount();
  if (!acc) return null;
  const blob = typeof source === 'string' ? dataUrlToBlob(source) : source;
  const path = `${acc.id}/${String(placeId).replace(/[^\w.-]/g, '_')}_${crypto.randomUUID()}.jpg`;
  const res = await accountFetch(`/storage/v1/object/${PHOTO_BUCKET}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/jpeg' },
    body: blob
  });
  if (!res.ok) {
    const txt = await res.text();
    if (/row-level security|policy|403|exceeded/i.test(txt) || res.status === 403) {
      throw new Error(`Fotoğraf kotası dolmuş olabilir (en çok ${PHOTO_QUOTA} fotoğraf). Eski bazı fotoğrafları sil.`);
    }
    throw new Error('Fotoğraf buluta yüklenemedi.');
  }
  const ref = PHOTO_PREFIX + path;
  cachePhotoBlob(ref, blob).catch(() => {});
  return ref;
}

export async function deletePrivatePhoto(ref) {
  if (!isPrivatePhoto(ref)) return;
  try {
    await accountFetch(`/storage/v1/object/${PHOTO_BUCKET}/${ref.slice(PHOTO_PREFIX.length)}`, { method: 'DELETE' });
  } catch (e) {}
  // keep the cache tidy
  import('./photoStore').then((m) => m.removeCachedPhoto(ref)).catch(() => {});
}

const urlCache = new Map();
// Turns a stored photo reference into something an <img> can show. Private photos are downloaded
// with the user's session once and kept on the device (IndexedDB), so they also work offline.
export async function resolvePhotoSrc(src) {
  if (!isPrivatePhoto(src)) return src;
  if (urlCache.has(src)) return urlCache.get(src);
  let blob = await getCachedPhotoBlob(src).catch(() => null);
  if (!blob) {
    const res = await accountFetch(`/storage/v1/object/authenticated/${PHOTO_BUCKET}/${src.slice(PHOTO_PREFIX.length)}`);
    if (!res.ok) throw new Error('photo');
    blob = await res.blob();
    cachePhotoBlob(src, blob).catch(() => {});
  }
  const url = URL.createObjectURL(blob);
  urlCache.set(src, url);
  return url;
}

// Number of photos the user has stored in the cloud (for the quota display)
export async function countPrivatePhotos() {
  const acc = getAccount();
  if (!acc) return 0;
  const res = await accountFetch(`/storage/v1/object/list/${PHOTO_BUCKET}`, {
    method: 'POST',
    body: JSON.stringify({ prefix: acc.id, limit: 1000 })
  });
  if (!res.ok) return 0;
  const rows = await res.json();
  return Array.isArray(rows) ? rows.length : 0;
}

// Photos saved by the old shared-passphrase mode sit in a public bucket: copy them into the private one
export const LEGACY_PHOTO_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/user_photos/`;
// Needs moving to the private folder: from the old public bucket, or taken on this device before signing in
export const isLegacyPhoto = (src) => typeof src === 'string' && (src.startsWith(LEGACY_PHOTO_PREFIX) || src.startsWith('data:'));

export async function migrateLegacyPhoto(url, placeId) {
  if (url.startsWith('data:')) return uploadPrivatePhoto(url, placeId);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Eski fotoğraf indirilemedi.');
  return uploadPrivatePhoto(await res.blob(), placeId);
}

// This device's copy of the personal data (it stays in the account in the cloud). Done on sign-out so the
// next person who signs in on a shared device does not receive the previous person's marks and photos.
export async function clearLocalPersonalData() {
  ['kesif_atlasim_user_overrides_v1', 'kesif_atlasim_sync_pending_v1', 'kesif_atlasim_doc_meta_v1', 'kesif_atlasim_trip_v1'].forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch (e) {}
  });
  await clearAllPhotoData();
}
