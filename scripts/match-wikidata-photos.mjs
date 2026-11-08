// Wikidata P18 photo matcher for all places.
// - Name segments -> wbsearchentities (tr, en)
// - Confident only if: item has P18 + P625, coordinates within threshold of the place,
//   normalized label/alias matches the searched segment
// - One Wikidata item / one image file per place (greedy by score)
// - Commons imageinfo (iiurlwidth=960) returns canonical URL + license/author metadata
// Output: scripts/photo-matches.json (confident), scripts/photo-review.json (uncertain)
// Resumable: caches in scripts/.cache/
import fs from 'fs';

const UA = 'GezginOgi/1.0 (https://github.com/ogulcanilkilinc/GezginOgi; photo matcher)';
const CACHE_DIR = 'scripts/.cache';
fs.mkdirSync(CACHE_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadCache(name) {
  const f = `${CACHE_DIR}/${name}.json`;
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
}
function saveCache(name, obj) {
  fs.writeFileSync(`${CACHE_DIR}/${name}.json`, JSON.stringify(obj));
}
const searchCache = loadCache('search');
const entityCache = loadCache('entities');
const commonsCache = loadCache('commons');

async function getJson(url) {
  for (let i = 0; i < 10; i++) {
    try {
      await sleep(100);
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status >= 500) {
        console.warn(`[HTTP ${res.status}] ${url.slice(0, 80)}... Bekleniyor (${i + 1}/10)`);
        await sleep(4000 * (i + 1));
        continue;
      }
      return await res.json();
    } catch (e) {
      console.warn(`[Ağ Hatası] ${e.message} - ${url.slice(0, 80)}... Bekleniyor (${i + 1}/10)`);
      await sleep(2500 * (i + 1));
    }
  }
  console.error('[Kalıcı Hata] ' + url);
  return {};
}

async function pool(items, n, fn) {
  let idx = 0;
  const workers = Array.from({ length: n }, async () => {
    while (idx < items.length) {
      const my = idx++;
      await fn(items[my], my);
    }
  });
  await Promise.all(workers);
}

// ---------- text helpers ----------
const norm = (s) =>
  (s || '')
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[’'`´".!?()\[\]]/g, '')
    .replace(/[-–—_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const GENERIC_TAIL = /\s+(rotas[ıi]|turu|gezisi|y[üu]r[üu]y[üu]ş[üu]|sokaklar[ıi]|teras[ıi]|manzaras[ıi]|b[öo]lgesi|kahve rotas[ıi]|deneyimi|ziyareti|seyir noktas[ıi]|gün batım[ıi]|tekne turu|bar rotas[ıi])$/i;

function cleanSeg(s) {
  let t = (s || '').replace(/\s+/g, ' ').trim();
  for (let i = 0; i < 3; i++) t = t.replace(GENERIC_TAIL, '').trim();
  t = t.replace(/^(eski|tarihi|antik)\s+/i, (m) => m); // keep
  return t;
}

function segmentsOf(place) {
  let n = place.name || '';
  n = n.replace(/\((?:[^)]*?(?:UNESCO|Vizesiz)[^)]*?)\)/gi, ' ');
  if (n.includes(' — ')) n = n.split(' — ').slice(1).join(' — ');
  const m = n.match(/^([^:]{2,40}):\s*(.+)$/);
  if (m) n = m[2];
  const parens = [...n.matchAll(/\(([^)]+)\)/g)].map((x) => x[1]);
  const base = n.replace(/\([^)]*\)/g, ' ');
  const segs = [];
  base.split(/,|&|\s+ve\s+|\s+ile\s+|;|\s\+\s|:|\s\/\s/).forEach((s) => segs.push(cleanSeg(s.replace(/["“”]/g, ''))));
  parens.forEach((pp) => pp.split(/,|\/|\s+ve\s+/).forEach((s) => segs.push(cleanSeg(s.replace(/["“”]/g, '')))));
  const seen = new Set();
  return segs
    .filter((s) => s && s.length >= 3 && !/^\d+$/.test(s))
    .filter((s) => { const k = norm(s); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 6);
}

function haversineKm(a, b) {
  const R = 6371, toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(b[0] - a[0]), dLon = toR(b[1] - a[1]);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function labelMatches(term, labels) {
  const t = norm(term);
  if (t.length < 3) return false;
  for (const l0 of labels) {
    const l = norm(l0);
    if (!l) continue;
    if (l === t) return true;
    const [short, long] = l.length < t.length ? [l, t] : [t, l];
    if (short.length >= 4 && long.includes(short) && short.length / long.length >= 0.55) return true;
  }
  return false;
}

const SETTLEMENT_P31 = new Set(['Q515', 'Q5119', 'Q1549591', 'Q3957', 'Q532', 'Q486972', 'Q6256', 'Q3624078',
  'Q15284', 'Q1637706', 'Q747074', 'Q484170', 'Q2039348', 'Q15630906', 'Q48336', 'Q1115575', 'Q200250',
  'Q1093829', 'Q7930989', 'Q10864048', 'Q35657', 'Q34876', 'Q1620908', 'Q1907114', 'Q13218690', 'Q50330360']);
const BAD_FILE = /(\.svg$|map|karte|harita|locator|location|logo|flag|bayrak|coat[_ ]of[_ ]arms|arma|seal|diagram|plan\b)/i;

// ---------- Wikidata ----------
async function search(term, lang) {
  const key = `${lang}|${term}`;
  if (searchCache[key]) return searchCache[key];
  const u = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(term)}&language=${lang}&uselang=${lang}&type=item&limit=7&format=json`;
  const j = await getJson(u);
  const out = (j.search || []).map((r) => ({ id: r.id, label: r.label, matchText: r.match?.text }));
  searchCache[key] = out;
  return out;
}

async function fetchEntities(ids) {
  const need = ids.filter((id) => !entityCache[id]);
  for (let i = 0; i < need.length; i += 50) {
    const chunk = need.slice(i, i + 50);
    const u = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${chunk.join('|')}&props=claims|labels|aliases&languages=tr|en&format=json`;
    const j = await getJson(u);
    for (const [id, e] of Object.entries(j.entities || {})) {
      const c = e.claims || {};
      const coord = c.P625?.[0]?.mainsnak?.datavalue?.value;
      const labels = [];
      for (const lg of ['tr', 'en']) {
        if (e.labels?.[lg]) labels.push(e.labels[lg].value);
        (e.aliases?.[lg] || []).forEach((a) => labels.push(a.value));
      }
      entityCache[id] = {
        p18: (c.P18 || []).map((x) => x.mainsnak?.datavalue?.value).filter(Boolean),
        coord: coord ? [coord.latitude, coord.longitude] : null,
        p31: (c.P31 || []).map((x) => x.mainsnak?.datavalue?.value?.id).filter(Boolean),
        hasPop: !!c.P1082,
        labels,
        labelTr: e.labels?.tr?.value || '',
        labelEn: e.labels?.en?.value || ''
      };
    }
  }
}

// ---------- main ----------
const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
const alreadyDone = JSON.parse(fs.readFileSync('scripts/resolved-photos.json', 'utf8'));
const todo = places.filter((p) => !alreadyDone[p.id]);
console.log(`İşlenecek yer: ${todo.length}`);

const perPlace = loadCache('perPlace');
let done = 0;

await pool(todo, 3, async (p) => {
  if (perPlace[p.id]) {
    done++;
    if (done % 50 === 0) console.log(`${done}/${todo.length}`);
    return;
  }

  const segs = segmentsOf(p);
  const found = [];
  const rejected = [];
  const radius = p.category === 'doga' ? 8 : 1.5;

  for (let si = 0; si < segs.length; si++) {
    const term = segs[si];
    for (const lang of ['tr', 'en']) {
      let res;
      try { res = await search(term, lang); } catch { continue; }
      const ids = res.map((r) => r.id);
      if (!ids.length) continue;
      await fetchEntities(ids);
      for (const r of res) {
        const e = entityCache[r.id];
        if (!e) continue;
        const labs = [...e.labels, r.label, r.matchText].filter(Boolean);
        const lm = labelMatches(term, labs);
        const dist = e.coord ? haversineKm(p.coords, e.coord) : null;
        const file = e.p18.find((f) => !BAD_FILE.test(f));
        const settlement = e.hasPop || e.p31.some((x) => SETTLEMENT_P31.has(x));
        const info = { qid: r.id, label: e.labelTr || e.labelEn || r.label, term, seg: si, dist: dist == null ? null : +dist.toFixed(2), file: file || null, settlement };
        if (!lm) continue;
        if (!file) { rejected.push({ ...info, why: 'Wikidata kaydında fotoğraf (P18) yok' }); continue; }
        if (dist == null) { rejected.push({ ...info, why: 'Kayıtta koordinat yok, konum doğrulanamadı' }); continue; }
        const maxR = settlement ? Math.max(radius, 8) : radius;
        if (dist > maxR) { rejected.push({ ...info, why: `Koordinat uzak (${dist.toFixed(1)} km)` }); continue; }
        if (settlement && si > 0) { rejected.push({ ...info, why: 'Şehir/yerleşim kaydı, yerin ana adı değil' }); continue; }
        // score: earlier segment better, closer better, tr label exact better
        const exact = labs.some((l) => norm(l) === norm(term)) ? 0 : 0.5;
        found.push({ ...info, score: si * 2 + exact + dist / maxR + (settlement ? 1.5 : 0) });
      }
      if (found.some((f) => f.seg === si)) break; // tr hit -> skip en for this segment
    }
    if (found.length) break;
  }
  found.sort((a, b) => a.score - b.score);
  const uniq = [];
  const seenQ = new Set();
  for (const f of found) if (!seenQ.has(f.qid)) { seenQ.add(f.qid); uniq.push(f); }
  rejected.sort((a, b) => (a.dist ?? 1e9) - (b.dist ?? 1e9));
  perPlace[p.id] = { segs, cands: uniq.slice(0, 4), rejected: rejected.slice(0, 2) };

  done++;
  if (done % 20 === 0) {
    console.log(`${done}/${todo.length}`);
    saveCache('search', searchCache);
    saveCache('entities', entityCache);
    saveCache('perPlace', perPlace);
  }
});
saveCache('search', searchCache);
saveCache('entities', entityCache);
saveCache('perPlace', perPlace);

// ---------- greedy unique assignment ----------
const usedQ = new Set();
const usedFiles = new Set(Object.values(alreadyDone).map((u) => decodeURIComponent(u.split('/').pop()).replace(/^\d+px-/, '').replace(/_/g, ' ')));
const all = [];
for (const [id, v] of Object.entries(perPlace)) v.cands.forEach((c) => all.push({ id, ...c }));
all.sort((a, b) => a.score - b.score);
const assigned = {};
const lostToDup = {};
for (const c of all) {
  if (assigned[c.id]) continue;
  if (usedQ.has(c.qid) || usedFiles.has(c.file)) { lostToDup[c.id] = lostToDup[c.id] || c; continue; }
  assigned[c.id] = c;
  usedQ.add(c.qid);
  usedFiles.add(c.file);
}

// ---------- Commons metadata ----------
const strip = (h) => (h || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const files = [...new Set(Object.values(assigned).map((a) => a.file))].filter((f) => !commonsCache[f]);
for (let i = 0; i < files.length; i += 40) {
  const chunk = files.slice(i, i + 40);
  const titles = chunk.map((f) => 'File:' + f).join('|');
  const u = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=960&iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl|Credit|UsageTerms&format=json`;
  const j = await getJson(u);
  const normMap = {};
  (j.query?.normalized || []).forEach((n) => (normMap[n.to] = n.from));
  for (const pg of Object.values(j.query?.pages || {})) {
    const from = (normMap[pg.title] || pg.title).replace(/^File:/, '');
    const ii = pg.imageinfo?.[0];
    if (!ii) { commonsCache[from] = { missing: true }; continue; }
    const md = ii.extmetadata || {};
    commonsCache[from] = {
      url: `https://upload.wikimedia.org${new URL(ii.thumburl || ii.url).pathname}`,
      mime: ii.mime,
      page: ii.descriptionurl,
      artist: strip(md.Artist?.value) || 'Bilinmiyor',
      license: strip(md.LicenseShortName?.value) || strip(md.UsageTerms?.value) || '',
      licenseUrl: md.LicenseUrl?.value || ''
    };
  }
  saveCache('commons', commonsCache);
  await sleep(300);
}

// ---------- outputs ----------
const matches = {};
const review = [];
for (const p of todo) {
  const a = assigned[p.id];
  const cm = a && commonsCache[a.file];
  if (a && cm && !cm.missing && /^image\/(jpeg|png|webp)/.test(cm.mime || '')) {
    matches[p.id] = {
      url: cm.url, file: a.file, page: cm.page, artist: cm.artist, license: cm.license, licenseUrl: cm.licenseUrl,
      wikidata: a.qid, wikidataLabel: a.label, matchedOn: a.term, distanceKm: a.dist
    };
    continue;
  }
  const v = perPlace[p.id] || { segs: [], rejected: [] };
  let why, cand;
  if (a && cm) { why = 'Commons dosyası alınamadı/uygun biçimde değil'; cand = a; }
  else if (lostToDup[p.id]) { why = 'Eşleşen kayıt/fotoğraf başka bir yerde kullanılıyor'; cand = lostToDup[p.id]; }
  else if (v.rejected[0]) { why = v.rejected[0].why; cand = v.rejected[0]; }
  else { why = 'Wikidata\'da adla eşleşen kayıt bulunamadı'; }
  review.push({ id: p.id, name: p.name, city: p.city, country: p.country, why, searched: v.segs.join(' | '),
    candidate: cand ? `${cand.qid} ${cand.label}${cand.dist != null ? ` (${cand.dist} km)` : ''}` : '' });
}
fs.writeFileSync('scripts/photo-matches.json', JSON.stringify(matches, null, 2));
fs.writeFileSync('scripts/photo-review.json', JSON.stringify(review, null, 2));
console.log(`\nKesin eşleşme: ${Object.keys(matches).length}  |  İnceleme listesi: ${review.length}`);
