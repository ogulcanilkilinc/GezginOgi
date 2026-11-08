// Filters scripts/wikipedia-photo-matches.json (from find-photos-wikipedia.mjs) down to trustworthy matches.
// Usage (from the project root): node scripts/filter-wikipedia-photos.cjs [--print-kept] [--print-rejected]
const fs = require('fs');
const M = JSON.parse(fs.readFileSync('scripts/wikipedia-photo-matches.json', 'utf8'));
const P = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
const byId = Object.fromEntries(P.map((p) => [p.id, p]));

const norm = (s) =>
  (s || '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

// Things that are rarely what the place is about, unless the place itself names them
const OFF_TOPIC = /station|stazione|bahnhof|airport|aeroporto|havalimani|metro|stadyum|stadium|stadion|gari\b|opera|lokomotif|dampflok|train\b|prefecture|kapelle|chapel|wc\b|part dieu|sorvagsvatn|kanaat|parliament of/;

// Matches reviewed by hand and judged wrong or misleading for the place
const MANUAL_REJECT = [
  'Kahire',            // Giza place got the Cairo opera house
  'Atomium',           // Grand-Place got the Atomium
  'Priene',            // Kuşadası Güvercinada got Priene
  'Çınarcık',          // Sudüşen Şelalesi got a Çınarcık view
  'Kayaköy',           // Ölüdeniz got Kayaköy
  'Sakız Adası',       // Prefecture building
  'Sarıkamış',         // Ski centre got the Atatürk monument
  'Xanthos',           // Kaputaş got a Xanthos tomb
  'Ürgüp',             // Avanos got a Ürgüp view
  'Nallıhan',          // Bird sanctuary got the town
  'Akçaabat',          // Köfte got a neighbourhood photo
  'Elbeğendi, Midyat', // A village, not Midyat's sights
  'Tokyo',             // teamLab got Shinjuku skyline
  'Lucerne',           // Luzern bridge got the Lion monument
  'Chengdu', 'Tarihî Kahire', 'Izmaylovo District', 'Stockholm', 'Kopenhag', 'Phuket Big Buddha',
  'Batum Botanik Bahçesi', 'Chapultepec', 'Autoworld (museum)', 'Bad Ischl', 'Occupy Wall Street',
  'Kennedy Uzay Merkezi Kalkış Kompleksi 39', 'Charyn Millî Parkı', 'University of Abuja', 'Banja of Peja',
  'Siege of Dubrovnik', 'Semeru Yanardağı', 'Bamberg'
];

const SPECIFIC_VENUE = new Set(['muze', 'restoran', 'bar']);
const kept = {};
const rejected = [];
for (const [id, m] of Object.entries(M)) {
  const p = byId[id];
  const title = m.matchedVia.replace(/^\w+\.wikipedia: /, '');
  const t = norm(title);
  const f = norm(m.file);
  const name = norm(p.name);
  let why = null;
  const off = (t + ' ' + f).match(OFF_TOPIC);
  if (off && !name.includes(off[0].trim())) why = `konu dışı (${off[0].trim()})`;
  else if (MANUAL_REJECT.includes(title)) why = 'elle reddedildi';
  // "Ankara — CerModern": an article about the leading city is not about the venue
  else if (/ — /.test(p.name) && t === norm(p.name.split(/ — /)[0])) why = 'baştaki şehir adının genel fotoğrafı';
  else if ((t === norm(p.city) || t === norm(p.country)) && SPECIFIC_VENUE.has(p.category)) why = 'mekan yerine genel şehir fotoğrafı';
  else if (t === norm(p.country)) why = 'genel ülke fotoğrafı';
  // Food entries only got city landmarks, not the dish; Yaowarat is a street-food street itself
  else if (p.category === 'restoran' && title !== 'Yaowarat Road') why = 'yemek yerine şehir fotoğrafı';
  if (why) rejected.push(`${p.name.slice(0, 50)} => ${title} (${why})`);
  else kept[id] = m;
}

if (process.argv.includes('--print-kept')) {
  Object.entries(kept).forEach(([id, m]) =>
    console.log(`${byId[id].name.slice(0, 48).padEnd(48)} [${byId[id].category}] => ${m.matchedVia.replace(/^\w+\.wikipedia: /, '').slice(0, 40)} | ${m.file.slice(0, 32)}`)
  );
}
if (process.argv.includes('--print-rejected')) rejected.forEach((r) => console.log('RED: ' + r));
console.log(`kept ${Object.keys(kept).length}, rejected ${rejected.length}`);
fs.writeFileSync('scripts/wikipedia-photo-matches.filtered.json', JSON.stringify(kept, null, 2));
