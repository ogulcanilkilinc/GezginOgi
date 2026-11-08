// Second pass for places still without a photo: search Wikimedia Commons files directly.
// For each name segment, search the File namespace. Accept a file only if:
//   - its title contains the segment's most distinctive word, and
//   - it is a JPEG photo at least 800 px wide with a free license, and
//   - when the file carries a location, it is within MAX_KM of the place.
// Bars are skipped (a street photo would mislead). Output: scripts/commons-photo-matches.json for review.
// Resumable: caches API responses in scripts/.cache/
import fs from 'fs';

const UA = 'GezginOgi/1.0 (https://github.com/ogulcanilkilinc/GezginOgi; photo matcher)';
const CACHE_DIR = 'scripts/.cache';
const MAX_KM = 25;
fs.mkdirSync(CACHE_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cacheFile = `${CACHE_DIR}/commons-photos.json`;
const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
let dirty = 0;

async function getJson(url) {
  if (cache[url]) return cache[url];
  for (let i = 0; i < 8; i++) {
    try {
      await sleep(150);
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
  ('muzesi muze museum museo musee milli ulusal national park parki kalesi kale castle fortress camii cami mosque ' +
    'antik kenti kent ancient city sehir sehri eski old town gol golu lake dag dagi mount mountain vadisi valley sahil beach plaji ' +
    'adasi adalari island islands koyu bay selalesi waterfall falls kanyonu canyon carsi carsisi bazaar meydani square sokak sokaklari ' +
    'caddesi street kilisesi church manastiri monastery sarayi palace kopru koprusu bridge tarihi historic merkezi center centre ' +
    've and the of de la le del des di da ile rotasi rota bolgesi region turu tour gezisi yolu road kulesi tower ' +
    'meshur unlu efsane gizli tabiat parki ormani orman rotasi hatti mesafede dakika saat ankara istanbul').split(' ')
);

function segmentsOf(place) {
  return place.name
    .split(/\s[—–-]\s|[:,&+/()"!]|\sve\s|\sand\s/)
    .map((s) => s.replace(/\b(UNESCO|Gizli|Rota|Rotası)\b/gi, '').trim())
    .filter((s) => norm(s).length >= 4)
    .filter((s) => ![norm(place.city), norm(place.country)].includes(norm(s)))
    .slice(0, 4);
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

const BAD_FILE = /map|flag|logo|locator|karte|harita|coat|arms|seal|plan|diagram|location|bayrak|arma|emblem|icon|stamp|pul|banknote|coin|poster|sign\b|tabela|menu|interior of a bus|selfie/i;
const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function findForPlace(place, usedFiles) {
  for (const seg of segmentsOf(place)) {
    const kw = keyWord(seg);
    if (!kw) continue;
    const search = await getJson(
      'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=12' +
        `&gsrsearch=${encodeURIComponent(seg + ' filetype:bitmap')}` +
        '&prop=imageinfo|coordinates&iiprop=url|extmetadata|size|mime&iiurlwidth=960&coprimary=primary'
    );
    const pages = Object.values(search?.query?.pages || {}).sort((a, b) => a.index - b.index);
    for (const pg of pages) {
      const title = pg.title.replace(/^File:/, '');
      const ii = pg.imageinfo?.[0];
      if (!ii || ii.mime !== 'image/jpeg' || ii.width < 800 || ii.width < ii.height * 0.9) continue;
      if (BAD_FILE.test(title) || usedFiles.has(title)) continue;
      if (!norm(title).split(' ').some((w) => w.startsWith(kw) || (kw.startsWith(w) && w.length >= 5))) continue;
      const co = pg.coordinates?.[0];
      if (co && km(place.coords, [co.lat, co.lon]) > MAX_KM) continue;
      const meta = ii.extmetadata || {};
      const license = stripHtml(meta.LicenseShortName?.value);
      if (!license || /fair use|non-free/i.test(license)) continue;
      return {
        url: ii.thumburl,
        file: title,
        page: ii.descriptionurl,
        artist: stripHtml(meta.Artist?.value).slice(0, 120) || 'Wikimedia Commons',
        license,
        licenseUrl: meta.LicenseUrl?.value || '',
        source: 'Wikimedia Commons',
        matchedVia: `commons: "${seg}" (${co ? Math.round(km(place.coords, [co.lat, co.lon])) + ' km' : 'konumsuz'})`
      };
    }
  }
  return null;
}

const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
const usedFiles = new Set(
  places.filter((p) => p.photoCredit?.page).map((p) => decodeURIComponent(p.photoCredit.page.split('File:')[1] || '').replace(/_/g, ' '))
);
const missing = places.filter((p) => !p.coverImage && Array.isArray(p.coords) && p.category !== 'bar');
console.log(`Fotoğrafsız yer (bar hariç): ${missing.length}`);

const out = {};
let i = 0;
for (const place of missing) {
  i++;
  const hit = await findForPlace(place, usedFiles);
  if (hit) {
    out[place.id] = hit;
    usedFiles.add(hit.file);
  }
  if (i % 25 === 0) console.log(`${i}/${missing.length} — bulunan: ${Object.keys(out).length}`);
}
fs.writeFileSync(cacheFile, JSON.stringify(cache));
fs.writeFileSync('scripts/commons-photo-matches.json', JSON.stringify(out, null, 2));
console.log(`Bitti. ${Object.keys(out).length}/${missing.length} yer için fotoğraf bulundu.`);
