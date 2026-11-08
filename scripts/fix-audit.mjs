import fs from 'fs';

const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
const photos = JSON.parse(fs.readFileSync('public/data/photos.json', 'utf8'));
let review = JSON.parse(fs.readFileSync('scripts/photo-review.json', 'utf8'));

// 1. The 14 weak/wrong/suspicious places to purge
const PURGE_LIST = {
  'wld-av-ingiltere-londra-stonehenge': 'Başka yapı: Londra Üniversitesi binası (Senate House)',
  'us-c-4': 'Başka yapı: Wall Street metro durağı',
  'us-c-5': 'Başka yapı: Harvard Sanders Tiyatrosu (Özgürlük Yolu değil)',
  'mx-dp-1': 'Başka yapı: Antropoloji Müzesi girişi (Zócalo değil)',
  'gr-c-4': 'Başka yapı: Epidavros tiyatrosu (Korint Kanalı değil)',
  'uz-dp-2': 'Başka yapı: Bibi Hanım türbesi (Şah-ı Zinde değil)',
  'wld-af-luksor-ebu-simbel': 'Zayıf ilgi: Luksor otel caddesi',
  'it-21': 'Zayıf ilgi: Alberobello tren istasyonu (Trulli değil)',
  'uk-06': 'Zayıf ilgi: Ladbroke Grove metro istasyonu',
  'wld-amsterdam-jordaan': 'Zayıf ilgi: Amsterdam tramvay durağı',
  'blk-me-8': 'Zayıf ilgi: Bar limanı (Stari Bar değil)',
  'ank-ulucanlar': 'Zayıf ilgi: Genel Ankara panoraması (Ulucanlar Müzesi değil)',
  'tr-ist-11': 'Şüpheli dosya adı: thumbnail.jpg',
  'eg-c-2': 'Şüpheli dosya adı: thumbnail.jpg'
};

const byId = Object.fromEntries(places.map(p => [p.id, p]));

let purgedCount = 0;
for (const [id, reason] of Object.entries(PURGE_LIST)) {
  if (photos[id]) {
    delete photos[id];
    purgedCount++;
  }
  const p = byId[id];
  if (p) {
    p.coverImage = '';
    delete p.photoCredit;
    // Add to review list if not already there
    if (!review.some(r => r.id === id)) {
      review.push({
        id,
        name: p.name,
        city: p.city,
        country: p.country,
        why: reason,
        searched: p.name,
        candidate: ''
      });
    } else {
      const existing = review.find(r => r.id === id);
      if (existing) existing.why = reason;
    }
  }
}

// 2. Convert any unscaled original URLs to 960px thumbnails
let convertedCount = 0;
for (const [id, ph] of Object.entries(photos)) {
  const u = ph.url;
  if (!u.includes('/thumb/')) {
    // URL format: https://upload.wikimedia.org/wikipedia/commons/x/xy/Filename.ext
    const match = u.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([0-9a-f]\/[0-9a-f]{2}\/)(.+)$/i);
    if (match) {
      const hash = match[1];
      const filename = match[2];
      const newUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash}${filename}/960px-${filename}`;
      ph.url = newUrl;
      convertedCount++;
      if (byId[id]) {
        byId[id].coverImage = newUrl;
      }
    }
  }
}

// 3. Save files
fs.writeFileSync('public/data/places.json', JSON.stringify(places));
fs.writeFileSync('public/data/photos.json', JSON.stringify(photos, null, 2));

review.sort((a, b) => (a.country || '').localeCompare(b.country || '', 'tr') || a.name.localeCompare(b.name, 'tr'));
fs.writeFileSync('scripts/photo-review.json', JSON.stringify(review, null, 2));

const csv = ['id;yer;şehir;ülke;neden;aranan;en yakın aday']
  .concat(review.map((r) => [r.id, r.name, r.city, r.country, r.why, r.searched, r.candidate].map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(';')))
  .join('\n');
fs.writeFileSync('scripts/photo-review.csv', '\ufeff' + csv);

console.log(`Temizlenen şüpheli/zayıf fotoğraf: ${purgedCount}`);
console.log(`960px thumbnail formatına çevrilen: ${convertedCount}`);
console.log(`Kalan fotoğraflı yer sayısı: ${Object.keys(photos).length}`);
console.log(`İnceleme listesindeki yer sayısı: ${review.length}`);
