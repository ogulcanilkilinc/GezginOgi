// Finds licensed photos for places that have no photo yet.
// For each name segment, search Wikipedia (tr, then en). Accept an article only if:
//   - its coordinates are within MAX_KM of the place, and
//   - its title contains the segment's most distinctive word.
// The article's lead image must be a JPEG photo (no maps, flags or logos).
// License and author come from Commons extmetadata.
// Output: scripts/wikipedia-photo-matches.json ({ placeId: photoEntry }), for review before applying.
// Resumable: caches API responses in scripts/.cache/
import fs from 'fs';

const UA = 'GezginOgi/1.0 (https://github.com/ogulcanilkilinc/GezginOgi; photo matcher)';
const CACHE_DIR = 'scripts/.cache';
const MAX_KM = 20;
fs.mkdirSync(CACHE_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cacheFile = `${CACHE_DIR}/wikipedia-photos.json`;
const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
let dirty = 0;

async function getJson(url) {
  if (cache[url]) return cache[url];
  for (let i = 0; i < 8; i++) {
    try {
      await sleep(120);
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status >= 500) {
        await sleep(1500 * (i + 1));
        continue;
      }
      const json = await res.json();
      cache[url] = json;
      if (++dirty % 25 === 0) fs.writeFileSync(cacheFile, JSON.stringify(cache));
      return json;
    } catch (e) {
      await sleep(1500 * (i + 1));
    }
  }
  return null;
}

const norm = (s) =>
  (s || '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const GENERIC = new Set(
  ('muzesi muze museum museo musee milli ulusal national park parki parki kalesi kale castle fortress camii cami mosque ' +
    'antik kenti kent ancient city sehir sehri eski old town gol golu lake dag dagi mount mountain vadisi valley sahil beach plaji ' +
    'adasi adalari island islands koyu bay selalesi waterfall falls kanyonu canyon carsi carsisi bazaar meydani square sokak sokaklari ' +
    'caddesi street kilisesi church manastiri monastery sarayi palace kopru koprusu bridge tarihi historic merkezi center centre ' +
    've and the of de la le del des di da and ile rotasi rota bolgesi region turu tour gezisi yolu road kulesi tower').split(' ')
);

function segmentsOf(place) {
  const raw = place.name
    .split(/\s[—–-]\s|[:,&+/()]|\sve\s|\sand\s/)
    .map((s) => s.replace(/\b(UNESCO|Gizli|Rota)\b/gi, '').trim())
    .filter((s) => norm(s).length >= 4);
  const skip = new Set([norm(place.city), norm(place.country)]);
  const specific = raw.filter((s) => !skip.has(norm(s)));
  return [...specific, ...raw.filter((s) => skip.has(norm(s)))].slice(0, 4);
}

function keyWord(segment) {
  const words = norm(segment).split(' ').filter((w) => w.length >= 4 && !GENERIC.has(w));
  return words.sort((a, b) => b.length - a.length)[0] || null;
}

function km(a, b) {
  const R = 6371, t = Math.PI / 180;
  const dLat = (b[0] - a[0]) * t, dLon = (b[1] - a[1]) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const BAD_FILE = /map|flag|logo|locator|karte|harita|coat|arms|seal|plan|diagram|location|svg|png|gif|tif|bayrak|arma|emblem|icon/i;
const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function findForPlace(place, usedFiles) {
  for (const seg of segmentsOf(place)) {
    const kw = keyWord(seg);
    if (!kw) continue;
    for (const lang of ['tr', 'en']) {
      const api = `https://${lang}.wikipedia.org/w/api.php`;
      const search = await getJson(
        `${api}?action=query&format=json&generator=search&gsrlimit=5&gsrsearch=${encodeURIComponent(seg)}` +
          `&prop=coordinates|pageimages&piprop=name&coprimary=primary`
      );
      const pages = Object.values(search?.query?.pages || {}).sort((a, b) => a.index - b.index);
      for (const pg of pages) {
        const co = pg.coordinates?.[0];
        if (!co || !pg.pageimage) continue;
        if (km(place.coords, [co.lat, co.lon]) > MAX_KM) continue;
        if (!norm(pg.title).split(' ').some((w) => w.startsWith(kw) || kw.startsWith(w) && w.length >= 5)) continue;
        const file = pg.pageimage;
        if (BAD_FILE.test(file) || !/\.jpe?g$/i.test(file) || usedFiles.has(file)) continue;
        const info = await getJson(
          `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata` +
            `&iiurlwidth=960&titles=${encodeURIComponent('File:' + file)}`
        );
        const ii = Object.values(info?.query?.pages || {})[0]?.imageinfo?.[0];
        const meta = ii?.extmetadata || {};
        const license = stripHtml(meta.LicenseShortName?.value);
        if (!ii?.thumburl || !license || /fair use|non-free/i.test(license)) continue;
        return {
          url: ii.thumburl,
          file: file.replace(/_/g, ' '),
          page: ii.descriptionurl,
          artist: stripHtml(meta.Artist?.value).slice(0, 120) || 'Wikimedia Commons',
          license,
          licenseUrl: meta.LicenseUrl?.value || '',
          source: 'Wikimedia Commons',
          matchedVia: `${lang}.wikipedia: ${pg.title}`
        };
      }
    }
  }
  return null;
}

const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
const photos = JSON.parse(fs.readFileSync('public/data/photos.json', 'utf8'));
const usedFiles = new Set(Object.values(photos).map((p) => (p.file || '').replace(/ /g, '_')));
const usedSpaced = new Set(Object.values(photos).map((p) => (p.file || '').replace(/_/g, ' ')));
const missing = places.filter((p) => !photos[p.id] && Array.isArray(p.coords));
console.log(`Fotoğrafsız yer: ${missing.length}`);

const out = {};
let i = 0;
for (const place of missing) {
  i++;
  const hit = await findForPlace(place, usedFiles);
  if (hit && !usedSpaced.has(hit.file)) {
    out[place.id] = hit;
    usedFiles.add(hit.file.replace(/ /g, '_'));
    usedSpaced.add(hit.file);
  }
  if (i % 25 === 0) console.log(`${i}/${missing.length} — bulunan: ${Object.keys(out).length}`);
}
fs.writeFileSync(cacheFile, JSON.stringify(cache));
fs.writeFileSync('scripts/wikipedia-photo-matches.json', JSON.stringify(out, null, 2));
console.log(`Bitti. ${Object.keys(out).length}/${missing.length} yer için fotoğraf bulundu.`);
