// Applies the reviewed Commons matches (scripts/commons-photo-matches.json) to places.json and photos.json.
// REJECTED lists match indexes (in file order) judged wrong or misleading during manual review.
const fs = require('fs');
const REJECTED = new Set([1, 2, 3, 8, 9, 10, 12, 15, 16, 18, 21, 31, 33, 34, 35, 37, 39, 43, 46, 53, 71, 78, 81, 86, 87, 89,
  91, 92, 95, 99, 100, 103, 105, 106, 111, 113, 115, 120, 121, 123, 125, 128, 129, 130, 137, 142, 143, 148, 151, 154, 155,
  158, 160, 170, 171, 172, 173, 176, 177, 186, 188, 204, 230, 235, 248]);
const matches = Object.entries(JSON.parse(fs.readFileSync('scripts/commons-photo-matches.json', 'utf8')));
const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
const photos = JSON.parse(fs.readFileSync('public/data/photos.json', 'utf8'));
const byId = Object.fromEntries(places.map((p) => [p.id, p]));
let applied = 0;
matches.forEach(([id, m], i) => {
  if (REJECTED.has(i)) return;
  const place = byId[id];
  if (!place || place.coverImage) return;
  const url = m.url.replace('//thumb.wikimedia.org', '//upload.wikimedia.org').split('?')[0];
  place.coverImage = url;
  place.photoCredit = { artist: m.artist, license: m.license, licenseUrl: m.licenseUrl, page: m.page };
  photos[id] = { url, file: m.file, page: m.page, artist: m.artist, license: m.license, licenseUrl: m.licenseUrl, source: 'Wikimedia Commons (elle doğrulandı)' };
  applied++;
});
fs.writeFileSync('public/data/places.json', JSON.stringify(places, null, 2) + '\n');
fs.writeFileSync('public/data/photos.json', JSON.stringify(photos, null, 2) + '\n');
console.log(`uygulandı: ${applied}, fotoğrafsız kalan: ${places.filter((p) => !p.coverImage).length}`);
