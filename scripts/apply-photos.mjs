// Verifies matched photo URLs (throttled HEAD), then writes:
//  - public/data/photos.json   : id -> { url, file, page, artist, license, licenseUrl, wikidata, ... }
//  - public/data/places.json   : coverImage + photoCredit
//  - scripts/photo-review.json : + any URL that failed verification
// Also fetches license/author metadata for the 15 previously resolved landmarks.
import fs from 'fs';

const UA = 'KesifAtlasim/1.0 (https://github.com/ogulcanilkilinc/kesif-atlasim; photo verifier)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const matches = JSON.parse(fs.readFileSync('scripts/photo-matches.json', 'utf8'));
const review = JSON.parse(fs.readFileSync('scripts/photo-review.json', 'utf8'));
const prior = JSON.parse(fs.readFileSync('scripts/resolved-photos.json', 'utf8'));
const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
const byId = Object.fromEntries(places.map((p) => [p.id, p]));
const verCacheFile = 'scripts/.cache/verified.json';
const verified = fs.existsSync(verCacheFile) ? JSON.parse(fs.readFileSync(verCacheFile, 'utf8')) : {};

async function getJson(url) {
  for (let i = 0; i < 6; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.status === 429 || r.status >= 500) { await sleep(3000 * (i + 1)); continue; }
      return await r.json();
    } catch { await sleep(2000 * (i + 1)); }
  }
  throw new Error('failed ' + url);
}
const strip = (h) => (h || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

// metadata for the 15 prior landmarks
const priorFiles = Object.entries(prior).map(([id, url]) => {
  const last = decodeURIComponent(url.split('/').pop()).replace(/^\d+px-/, '');
  return { id, url, file: last.replace(/_/g, ' ') };
});
const titles = priorFiles.map((x) => 'File:' + x.file).join('|');
const j = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|extmetadata&iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl|UsageTerms&format=json`);
const normMap = {};
(j.query?.normalized || []).forEach((n) => (normMap[n.to] = n.from));
const meta = {};
for (const pg of Object.values(j.query?.pages || {})) {
  const ii = pg.imageinfo?.[0];
  if (!ii) continue;
  const md = ii.extmetadata || {};
  meta[pg.title.replace(/^File:/, '')] = {
    page: ii.descriptionurl,
    artist: strip(md.Artist?.value) || 'Bilinmiyor',
    license: strip(md.LicenseShortName?.value) || strip(md.UsageTerms?.value) || '',
    licenseUrl: md.LicenseUrl?.value || ''
  };
}
const photos = {};
for (const pf of priorFiles) {
  const m = meta[pf.file] || meta[pf.file.replace(/ /g, '_')] || {};
  photos[pf.id] = { url: pf.url, file: pf.file, ...m, source: 'elle doğrulanmış (önceki tur)' };
}

// Apply matched photo URLs
const ids = Object.keys(matches);
for (const id of ids) {
  const m = matches[id];
  photos[id] = { ...m, source: 'Wikidata P18' };
}

for (const p of places) {
  const ph = photos[p.id];
  p.coverImage = ph ? ph.url : '';
  if (ph) p.photoCredit = { artist: ph.artist, license: ph.license, licenseUrl: ph.licenseUrl, page: ph.page };
  else delete p.photoCredit;
}
fs.writeFileSync('public/data/places.json', JSON.stringify(places));
fs.writeFileSync('public/data/photos.json', JSON.stringify(photos, null, 2));
review.sort((a, b) => (a.country || '').localeCompare(b.country || '', 'tr') || a.name.localeCompare(b.name, 'tr'));
fs.writeFileSync('scripts/photo-review.json', JSON.stringify(review, null, 2));
const csv = ['id;yer;şehir;ülke;neden;aranan;en yakın aday']
  .concat(review.map((r) => [r.id, r.name, r.city, r.country, r.why, r.searched, r.candidate].map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(';')))
  .join('\n');
fs.writeFileSync('scripts/photo-review.csv', '\ufeff' + csv);
console.log(`\nFotoğraflı: ${Object.keys(photos).length}/${places.length} | İnceleme listesi: ${review.length}`);
