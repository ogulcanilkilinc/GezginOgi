// Applies the reviewed Wikipedia lead-image matches (scripts/wiki-photo-matches*.json) to places.json and photos.json.
// Each round lists match indexes (in file order) judged wrong or misleading during manual review
// (satellite views, maps, a painting, or a photo of a different spot).
const fs = require('fs');
const ROUNDS = [
  ['scripts/wiki-photo-matches.json', [6, 18, 27, 45, 59, 62, 79, 126, 138, 150, 153, 158, 159, 166]],
  ['scripts/wiki-photo-matches-2.json', [3, 4, 12, 17, 23, 25]]
];
const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
const photos = JSON.parse(fs.readFileSync('public/data/photos.json', 'utf8'));
const byId = Object.fromEntries(places.map((p) => [p.id, p]));
let applied = 0;
for (const [file, rejected] of ROUNDS) Object.entries(JSON.parse(fs.readFileSync(file, 'utf8'))).forEach(([id, m], i) => {
  if (rejected.includes(i)) return;
  const place = byId[id];
  if (!place || place.coverImage) return;
  place.coverImage = m.url;
  place.photoCredit = { artist: m.artist, license: m.license, licenseUrl: m.licenseUrl, page: m.page };
  photos[id] = { url: m.url, file: m.file, page: m.page, artist: m.artist, license: m.license, licenseUrl: m.licenseUrl, source: 'Wikipedia/Commons (elle doğrulandı)' };
  applied++;
});
fs.writeFileSync('public/data/places.json', JSON.stringify(places, null, 2) + '\n');
fs.writeFileSync('public/data/photos.json', JSON.stringify(photos, null, 2) + '\n');
console.log(`uygulandı: ${applied}, fotoğrafsız kalan: ${places.filter((p) => !p.coverImage).length}`);
