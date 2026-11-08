// scripts/find-duplicates.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const placesPath = path.resolve(__dirname, '../public/data/places.json');

const places = JSON.parse(fs.readFileSync(placesPath, 'utf8'));

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function normalizeStr(s) {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

function getTokens(s) {
  const norm = normalizeStr(s);
  const stopWords = new Set([
    've', 'veya', 'ile', 'bir', 'da', 'de', 'ta', 'te', 'caddesi', 'cad', 'sokak', 'sok',
    'koyu', 'koyu', 'koyu', 'kanyonu', 'vadisi', 'meydani', 'parki', 'muzesi', 'oren',
    'yeri', 'tarihi', 'antik', 'kenti', 'cami', 'camii', 'manastiri', 'kilisesi', 'sarayi',
    'kalesi', 'tepesi', 'golu', 'rotasi', 'merkezi', 'bölgesi', 'bolgesi', 'sehri'
  ]);
  return norm
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));
}

function tokenOverlap(toks1, toks2) {
  if (!toks1.length || !toks2.length) return 0;
  const set2 = new Set(toks2);
  let match = 0;
  for (const t of toks1) {
    if (set2.has(t)) match++;
    else {
      // prefix matching (e.g. bozcaad / bozcaada)
      for (const t2 of toks2) {
        if ((t.length >= 4 && t2.startsWith(t)) || (t2.length >= 4 && t.startsWith(t2))) {
          match += 0.8;
          break;
        }
      }
    }
  }
  return match / Math.min(toks1.length, toks2.length);
}

function richnessScore(p) {
  let score = 0;
  if (p.coverImage) score += 50;
  if (p.blogArticle && p.blogArticle.length > 50) score += 30;
  if (p.description) score += Math.min(40, Math.round(p.description.length / 5));
  if (p.localSpecialties) score += 15;
  if (p.practicalTips) score += 10;
  if (p.visited) score += 20;
  return score;
}

const duplicatePairs = [];
const seenPairs = new Set();

for (let i = 0; i < places.length; i++) {
  const p1 = places[i];
  if (!p1.coords || p1.coords.length !== 2) continue;
  const toks1 = getTokens(p1.name);

  for (let j = i + 1; j < places.length; j++) {
    const p2 = places[j];
    if (!p2.coords || p2.coords.length !== 2) continue;

    const dist = haversine(p1.coords[0], p1.coords[1], p2.coords[0], p2.coords[1]);
    const toks2 = getTokens(p2.name);
    const overlap = tokenOverlap(toks1, toks2);

    let isDuplicateCandidate = false;
    let reason = '';

    // Condition 1: Distance < 2.5 km and high token overlap
    if (dist <= 2.5 && overlap >= 0.5) {
      isDuplicateCandidate = true;
      reason = `Mesafe: ${(dist * 1000).toFixed(0)}m, İsim benzerliği: %${Math.round(overlap * 100)}`;
    }
    // Condition 2: Very close (< 600m) and at least 1 shared key token
    else if (dist <= 0.6 && overlap > 0.2) {
      isDuplicateCandidate = true;
      reason = `Çok yakın: ${(dist * 1000).toFixed(0)}m, Ortak kelime`;
    }
    // Condition 3: Exact same or identical root name in same city within 15 km (e.g. Tuz Gölü, Yedigöller, Bozcaada)
    else if (dist <= 15 && overlap >= 0.8 && p1.city === p2.city) {
      isDuplicateCandidate = true;
      reason = `Aynı şehir (${p1.city || 'Belirtilmemiş'}), Mesafe: ${dist.toFixed(1)} km, İsim birebir eşleşme`;
    }

    if (isDuplicateCandidate) {
      const pairKey = [p1.id, p2.id].sort().join('___');
      if (!seenPairs.has(pairKey)) {
        seenPairs.add(pairKey);
        const score1 = richnessScore(p1);
        const score2 = richnessScore(p2);

        const keep = score1 >= score2 ? p1 : p2;
        const remove = score1 >= score2 ? p2 : p1;

        duplicatePairs.push({
          p1,
          p2,
          distMeters: Math.round(dist * 1000),
          reason,
          recommendation: {
            keepId: keep.id,
            keepName: keep.name,
            keepScore: Math.max(score1, score2),
            removeId: remove.id,
            removeName: remove.name,
            removeScore: Math.min(score1, score2)
          }
        });
      }
    }
  }
}

console.log(`Bulunan Şüpheli Tekrar / Çift Sayısı: ${duplicatePairs.length}`);
fs.writeFileSync(
  path.resolve(__dirname, '../duplicate-candidates.json'),
  JSON.stringify(duplicatePairs, null, 2),
  'utf8'
);

duplicatePairs.slice(0, 30).forEach((pair, idx) => {
  console.log(`[${idx + 1}] ${pair.p1.name} (id: ${pair.p1.id}) <--> ${pair.p2.name} (id: ${pair.p2.id})`);
  console.log(`     ${pair.reason} | Öneri: Kalsın: "${pair.recommendation.keepName}" (${pair.recommendation.keepId}) vs Kaldır: "${pair.recommendation.removeName}" (${pair.recommendation.removeId})`);
});
