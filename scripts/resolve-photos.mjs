// Resolves landmark photos via official Wikidata (P18) + Commons imageinfo API.
// Never hand-builds /thumb/x/xy/ paths: Commons returns the canonical thumburl itself.
// Usage: node scripts/resolve-photos.mjs  (writes public/data/places.json + src/data/curatedPhotoResolver map)
import fs from 'fs';

const UA = 'KesifAtlasim/1.0 (https://github.com/ogulcanilkilinc/kesif-atlasim)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Either a known Commons file (user-verified working) or an enwiki title -> Wikidata P18
const TARGETS = {
  'ank-anitkabir': { file: "Ataturk's Mausoleum (6225341313).jpg" },
  'ank-anadolu-medeniyetleri': { file: 'Museum of Anatolian Civilizations001.jpg' },
  'ank-kugulu-tunali': { file: 'Ankara Kuğulu Park.JPG' },
  'tr-efes': { file: 'Library of Celsus side view.jpg' },
  'wld-roma-kolezyum': { file: 'Colosseo 2020.jpg' },
  'wld-peru-machu-picchu': { file: 'Machu Picchu, 2023 (012).jpg' },
  'wld-balkan-saraybosna-mostar-ohrid': { file: 'Mostar Old Town Panorama 2007.jpg' },
  'go-tuz-golu': { wiki: 'Lake Tuz' },
  'tr-kapadokya': { wiki: 'Göreme Historical National Park' },
  'tr-pamukkale-hierapolis': { wiki: 'Pamukkale' },
  'tr-kas-kaputas': { wiki: 'Kaputaş Beach' },
  'tr-istanbul-galata-karakoy-moda': { wiki: 'Galata Tower' },
  'tr-gobeklitepe': { wiki: 'Göbekli Tepe' },
  'tr-nemrut-dagi': { wiki: 'Mount Nemrut' },
  'tr-sumela-trabzon': { wiki: 'Sumela Monastery' }
};

async function getJson(url) {
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status === 429) { await sleep(2000 * (i + 1)); continue; }
    return res.json();
  }
  throw new Error('rate limited: ' + url);
}

async function p18FromWiki(title) {
  const u = `https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=${encodeURIComponent(title)}&props=claims&format=json`;
  const j = await getJson(u);
  const ent = Object.values(j.entities || {})[0];
  const claim = ent?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  return claim ? { file: claim, qid: ent.id } : null;
}

async function commonsThumb(file) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent('File:' + file)}&prop=imageinfo&iiprop=url&iiurlwidth=960&format=json`;
  const j = await getJson(u);
  const page = Object.values(j.query?.pages || {})[0];
  if (!page || page.missing !== undefined || !page.imageinfo) return null;
  // API path is canonical (hash folder computed by Commons). Serve from upload.wikimedia.org without tracking params.
  const u2 = new URL(page.imageinfo[0].thumburl);
  return `https://upload.wikimedia.org${u2.pathname}`;
}

async function headOk(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA } });
      if (res.status === 429) { await sleep(2500 * (i + 1)); continue; }
      return res.status === 200 && (res.headers.get('content-type') || '').startsWith('image/');
    } catch (e) {
      await sleep(1500);
    }
  }
  return false;
}

const resolved = {};
for (const [id, t] of Object.entries(TARGETS)) {
  let file = t.file;
  let src = 'file';
  if (!file) {
    const p = await p18FromWiki(t.wiki);
    file = p?.file;
    src = p ? `Wikidata ${p.qid} P18` : 'P18 yok';
  }
  const thumb = file ? await commonsThumb(file) : null;
  const ok = thumb ? await headOk(thumb) : false;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${id} | ${src} | ${file || '-'} | ${thumb || '-'}`);
  if (ok) resolved[id] = thumb;
  await sleep(400);
}

const placesPath = 'public/data/places.json';
const places = JSON.parse(fs.readFileSync(placesPath, 'utf8'));
let n = 0;
for (const p of places) {
  p.coverImage = resolved[p.id] || '';
  if (p.coverImage) n++;
}
fs.writeFileSync(placesPath, JSON.stringify(places));
fs.writeFileSync('scripts/resolved-photos.json', JSON.stringify(resolved, null, 2));
console.log(`\nFotoğraflı yer: ${n} / ${places.length}`);
