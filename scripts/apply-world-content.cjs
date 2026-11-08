// Applies the hand-written world highlights; howToVisit is replaced only when a new text is given.
const fs = require('fs');
const content = Object.assign({}, ...[1, 2, 3, 4].map((i) => require(`./world-content-${i}.cjs`)));
const FILE = 'public/data/places.json';
const places = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const byId = Object.fromEntries(places.map((p) => [p.id, p]));
let n = 0;
for (const [id, [highlights, howToVisit]] of Object.entries(content)) {
  const p = byId[id];
  if (!p) { console.log('bulunamadı:', id); continue; }
  p.highlights = highlights;
  if (howToVisit) p.howToVisit = howToVisit;
  n++;
}
fs.writeFileSync(FILE, JSON.stringify(places, null, 2) + '\n');
const empty = places.filter((p) => !p.highlights || !p.highlights.length);
const generic = places.filter((p) => (p.howToVisit || '').startsWith('En yakın uluslararası havalimanından'));
console.log(`güncellenen: ${n}; öne çıkanı boş: ${empty.length}`, empty.map((p) => p.id).join(', '));
console.log(`genel ulaşım metni kalan: ${generic.length}`, generic.map((p) => p.id).join(', '));
