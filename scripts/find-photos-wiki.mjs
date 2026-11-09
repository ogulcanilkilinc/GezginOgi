// Third pass: take the lead image of a hand-picked Wikipedia article (scripts/wiki-photo-titles.cjs)
// for places still without a cover photo. The file must live on Commons (so it is freely licensed),
// be a JPEG at least 800 px wide. Output: scripts/wiki-photo-matches.json for manual review.
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const TITLES = require(process.argv[2] ? './' + process.argv[2] : './wiki-photo-titles.cjs');
const OUT = process.argv[3] || 'scripts/wiki-photo-matches.json';
const UA = 'GezginOgi/1.0 (https://github.com/ogulcanilkilinc/GezginOgi; photo matcher)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let i = 0; i < 6; i++) {
    try {
      await sleep(120);
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status >= 500) { await sleep(1500 * (i + 1)); continue; }
      return await res.json();
    } catch { await sleep(1500 * (i + 1)); }
  }
  return null;
}
const strip = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
const out = {};
const misses = [];
for (const p of places.filter((x) => !x.coverImage && TITLES[x.id])) {
  const raw = TITLES[p.id];
  const [lang, title] = raw.startsWith('tr:') ? ['tr', raw.slice(3)] : ['en', raw];
  const pi = await getJson(`https://${lang}.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages&piprop=name&titles=${encodeURIComponent(title)}`);
  const page = pi && Object.values(pi.query?.pages || {})[0];
  const file = page?.pageimage;
  if (!file) { misses.push(`${p.id} (${raw}): görsel yok`); continue; }
  const ii = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1280&titles=${encodeURIComponent('File:' + file)}`);
  const info = ii && Object.values(ii.query?.pages || {})[0]?.imageinfo?.[0];
  if (!info) { misses.push(`${p.id} (${raw}): Commons’ta değil (${file})`); continue; }
  if (info.mime !== 'image/jpeg' || info.width < 800) { misses.push(`${p.id} (${raw}): uygun değil ${info.mime} ${info.width}px (${file})`); continue; }
  const md = info.extmetadata || {};
  out[p.id] = {
    url: info.thumburl, file, page: info.descriptionurl,
    artist: strip(md.Artist?.value) || 'Bilinmiyor', license: strip(md.LicenseShortName?.value), licenseUrl: md.LicenseUrl?.value || '',
    article: raw
  };
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`eşleşen: ${Object.keys(out).length}`);
console.log(misses.join('\n'));
