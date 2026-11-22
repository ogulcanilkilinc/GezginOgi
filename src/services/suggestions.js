// Suggestions from signed-in users (new places, corrections) and the community guide: what the owner
// approved is stored in gz_community, readable by everyone, and merged into the guide when the app loads.
import { accountFetch, getAccount } from './account';
import { CATEGORIES, REGIONS, SEASONS } from '../data/metadata';

const TEXT_FIELDS = ['name', 'subRegion', 'city', 'country', 'duration', 'bestTimeText', 'whatAwaits', 'howToVisit', 'localSpecialties', 'budget'];
// What a correction may change (never links, images or map coordinates)
export const EDITABLE_FIELDS = {
  whatAwaits: 'Bu yerde seni ne bekliyor? (kısa tanıtım)',
  howToVisit: 'Nasıl gidilir / ziyaret ipuçları',
  localSpecialties: 'Yöresel lezzetler ve yakın çevre',
  bestTimeText: 'En iyi zaman',
  highlights: 'Öne çıkanlar (her satır bir madde)',
  budget: 'Bütçe',
  duration: 'Süre'
};

const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);

function cleanList(v) {
  const list = Array.isArray(v) ? v : String(v || '').split('\n');
  return list.map((x) => clean(x, 300)).filter(Boolean).slice(0, 12);
}

// Keeps only known fields with safe values; used before sending a suggestion and again before showing one
export function sanitizePlace(raw) {
  const out = {};
  TEXT_FIELDS.forEach((k) => {
    if (raw[k] != null) out[k] = clean(raw[k], k === 'whatAwaits' || k === 'howToVisit' || k === 'localSpecialties' ? 4000 : 300);
  });
  out.highlights = cleanList(raw.highlights);
  const cat = CATEGORIES.find((c) => c.id === raw.category && c.id !== 'all');
  out.category = cat ? cat.id : 'kultur';
  const reg = REGIONS.find((r) => r.id === raw.region && r.id !== 'all');
  out.region = reg ? reg.id : 'dunya';
  out.durationCategory = ['kisa', 'yarim', 'tam', 'cokgun'].includes(raw.durationCategory) ? raw.durationCategory : 'yarim';
  const seasons = SEASONS.map((s) => s.id);
  out.seasons = (Array.isArray(raw.seasons) ? raw.seasons : []).filter((s) => seasons.includes(s));
  const [lat, lng] = Array.isArray(raw.coords) ? raw.coords.map(Number) : [NaN, NaN];
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) out.coords = [lat, lng];
  return out;
}

export function sanitizePatch(raw) {
  const out = {};
  Object.keys(EDITABLE_FIELDS).forEach((k) => {
    if (raw[k] == null) return;
    out[k] = k === 'highlights' ? cleanList(raw[k]) : clean(raw[k], k === 'bestTimeText' || k === 'budget' || k === 'duration' ? 400 : 4000);
  });
  return out;
}

// ---------------------------------------------------------------- suggestions
export async function submitSuggestion({ kind, placeId, payload, note }) {
  if (!getAccount()) throw new Error('Öneri göndermek için giriş yapmalısın.');
  const body = { kind, place_id: placeId || null, payload: kind === 'edit' ? sanitizePatch(payload) : sanitizePlace(payload), note: clean(note, 1000) };
  if (kind === 'edit' && Object.keys(body.payload).length === 0) throw new Error('Değiştirilecek bir alan yok.');
  if (kind === 'new_place' && (!body.payload.name || !body.payload.coords)) throw new Error('Yerin adı ve konumu gerekli.');
  const res = await accountFetch('/rest/v1/gz_suggestions', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Öneri gönderilemedi. Biraz sonra tekrar dene.');
}

async function getJson(path) {
  const res = await accountFetch(path);
  if (!res.ok) throw new Error('Liste alınamadı.');
  return res.json();
}

export const listMySuggestions = () => getJson('/rest/v1/gz_suggestions?select=*&order=created_at.desc&limit=50');
export const listPendingSuggestions = () => getJson('/rest/v1/gz_suggestions?select=*&status=eq.pending&order=created_at.asc&limit=100');

export async function checkIsAdmin() {
  const acc = getAccount();
  if (!acc) return false;
  try {
    const rows = await getJson(`/rest/v1/gz_admins?select=user_id&user_id=eq.${acc.id}`);
    return rows.length > 0;
  } catch (e) {
    return false;
  }
}

// Owner approves: the content goes to the community guide, then the suggestion is closed
export async function approveSuggestion(s) {
  const data = s.kind === 'edit' ? sanitizePatch(s.payload) : sanitizePlace(s.payload);
  const res = await accountFetch('/rest/v1/gz_community', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ kind: s.kind, place_id: s.place_id, data, suggestion_id: s.id, author_id: s.user_id })
  });
  if (!res.ok) throw new Error('Rehbere eklenemedi.');
  const upd = await accountFetch(`/rest/v1/gz_suggestions?id=eq.${s.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'approved', reviewed_at: new Date().toISOString() })
  });
  if (!upd.ok) throw new Error('Öneri durumu güncellenemedi.');
}

export async function rejectSuggestion(s, reviewNote) {
  const res = await accountFetch(`/rest/v1/gz_suggestions?id=eq.${s.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'rejected', review_note: clean(reviewNote, 500), reviewed_at: new Date().toISOString() })
  });
  if (!res.ok) throw new Error('Öneri güncellenemedi.');
}

// ---------------------------------------------------------------- community guide
export async function fetchCommunity() {
  const res = await accountFetch('/rest/v1/gz_community?select=id,kind,place_id,data,created_at&order=created_at.asc&limit=1000');
  if (!res.ok) return [];
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

// Merges approved corrections and new places into the guide's place list
export function applyCommunity(places, rows) {
  if (!rows || rows.length === 0) return places;
  const patches = new Map();
  rows.filter((r) => r.kind === 'edit' && r.place_id).forEach((r) => {
    patches.set(r.place_id, { ...(patches.get(r.place_id) || {}), ...sanitizePatch(r.data || {}) });
  });
  const have = new Set(places.map((p) => p.id));
  const merged = places.map((p) => (patches.has(p.id) ? { ...p, ...patches.get(p.id), communityEdited: true } : p));
  rows.filter((r) => r.kind === 'new_place').forEach((r) => {
    const id = `community-${r.id}`;
    if (have.has(id)) return;
    const d = sanitizePlace(r.data || {});
    if (!d.name || !d.coords) return;
    merged.push({
      ...d,
      id,
      isCommunity: true,
      coverImage: '',
      description: d.whatAwaits,
      blogArticle: d.whatAwaits,
      rating: 0,
      visited: false,
      visitedDate: '',
      favorite: false,
      userNotes: '',
      userRating: 0
    });
  });
  return merged;
}
