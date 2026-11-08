// Applies the hand-written Turkish highlights and how-to-visit texts to places.json.
const fs = require('fs');
const content = { ...require('./tr-content-1.cjs'), ...require('./tr-content-2.cjs') };
const FILE = 'public/data/places.json';
const places = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const byId = Object.fromEntries(places.map((p) => [p.id, p]));
let n = 0;
for (const [id, [highlights, howToVisit]] of Object.entries(content)) {
  const p = byId[id];
  if (!p) { console.log('bulunamadı:', id); continue; }
  p.highlights = highlights;
  p.howToVisit = howToVisit;
  n++;
}
fs.writeFileSync(FILE, JSON.stringify(places, null, 2) + '\n');
const stillEmpty = places.filter((p) => (p.country === 'Türkiye' || p.region === 'ankara') && (!p.highlights || !p.highlights.length));
console.log(`güncellenen: ${n}; hâlâ öne çıkanı boş Türkiye yeri: ${stillEmpty.length}`, stillEmpty.map((p) => p.id).join(', '));
