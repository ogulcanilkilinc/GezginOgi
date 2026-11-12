// Applies the hand-picked Commons search results (scripts/commons-search-candidates*.json) to
// places.json and photos.json. Bars, cafés and restaurants get a photo of their street, area or
// best-known dish, since free photos of the venues themselves do not exist; the credit says so.
const fs = require('fs');

// place id -> exact Commons file name, picked by hand from the candidates
const PICKS = {
  'ank-farabi-arjantin-kokteyl': 'Arjantin Caddesi, Ankara.jpg',
  'ank-esat-aspava': 'Fishmonger in Esat Street.jpg',
  'ank-cici-piknik-ankara-doneri': 'Döner kebab in Ankara, Turkey.jpg',
  'ank-ayranci-antika-goksu-balik': 'Bitpazarı.jpg',
  'ank-filistin-melly-lou': 'GOP - Çankaya.jpg',
  'ank-bulten-buklum-mahalle-barlari': 'Tunalı Hilmi Street (May 31, 2013).jpg',
  'ank-cinnah-guvenevler-kahve-cikolata': 'Sycamore tree-lined road (Jinnah Avenue) - panoramio.jpg',
  'ank-alma-aruni-trilye-gastronomi': 'Gazi Osman Paşa - Çankaya 001.jpg',
  'ank-ziraat-mektebi-meteoroloji': 'Ziraat Mektebi Atatürk Büstü 2026-09-01 13.26.05 1793906901.jpg',
  'ank-exp-beynam-ormani': 'Kesikkopruadaciklar.jpg',
  'ank-dp-21': 'Çamlıdere Yaylası - panoramio.jpg',
  'go-sakarya-meydan-muharebesi': 'Battle of Sakarya National Historic Park, Polatlı, Ankara, Turkey.jpg',
  'go-kirik-oklava': 'Gözleme in Ankara.jpg',
  'go-bizim-kofteci': 'Turkish köfte and fries.jpg',
  'go-kebap-49': 'Adana kebap in Ankara.jpg',
  'go-f451-brew': '2012 ankara türkiye, tunalı hilmi caddesi - panoramio.jpg',
  'go-prod-coffee': 'Coffee pour over using Hario cone.jpg',
  'go-arabica-coffee': 'Beşevler.jpg',
  'go-rispetto': 'Restaurant in Ankara.jpg',
  'go-zenger-pasa': 'Ankara Kale 034.jpg',
  'go-haci-arif-bey': 'Ankara asv2021-10 img70 Kızılay Square.jpg',
  'go-turk-hamam-muzesi': 'Beypazarı, Ankara, Turkey - panoramio.jpg',
  'tr-urla-bag-yolu': 'Izmir-Urla Late evening street view.jpg',
  'tr-81-isp-2': 'Pisidia Antioechia 03.jpg',
  'tr-81-hak-2': 'Hakkari Cilo Dağı.jpg',
  'go-kuyucak-lavanta': 'Isparta Kuyucak Köyü Lavanta Bahçeleri.jpg',
  'go-kabak-koyu': 'Kabak beach.jpg',
  'go-rize-cay': 'Rize Tea Plantation 2005-jk.jpg',
  'go-oskvank-ishan': 'Oshki 4.jpg',
  'go-van-kahvaltisi': 'Vankahvalti.jpg',
  'go-islama-kofte': 'Islama köfte in Kadıköy.jpg',
  'go-haci-abdullah': 'Hunkarbegendi.jpg',
  'go-seven-mehmet': 'Kalamar tava, Turkish style fried calamari.jpg',
  'go-chez-galip': 'Hair museum in Avanos Cappadochia 8652.jpg',
  'go-ciya-sofrasi': 'Kadikoy Carsi.JPG',
  'go-imam-cagdas': 'Baklava and Pistachios for Sale - Gaziantep.jpg',
  'wld-ort-alula-umman': 'Qasr al Farid.JPG',
  'go-lyon-yemek': 'Bouchon lyonnais.JPG',
  'de-19': 'Bamberg Altes Rathaus BW 1.JPG',
  'ch-02': 'Rheinfall Panorama revised.jpg',
  'ch-04': 'Rigi Kulm Feb 2012 Nebelmeer.jpg',
  'jp-02': 'At teamLab Planets (48277798316).jpg',
  'ba-dp-5': 'Blagaj tekke.jpg',
  'id-dp-1': 'Tegallalang Rice Terraces.jpg',
  'w195-mv-1': 'Diamonds Thudufushi Beach and Water Villas, May 2017 -03.jpg',
  'w195-om-1': 'Sultan Qaboos Grand Mosque (1).jpg',
  'w195-ci-1': 'Basilique notre Dame de la Paix de Yamoussoukro 1.jpg',
  'blk-me-4': 'Porto Montenegro 03.JPG',
  'go-beyaz-col': 'White Desert, Egypt.jpg',
  'go-titikaka': 'Islas flotantes de los Uros, Lago Titicaca, Perú, 2015-08-01, DD 17.JPG',
  'go-paris-yemek': 'Paris, à la terrasse du café, place Saint-André-des-Art, 2020.jpg'
};

const candidates = {};
for (const f of ['scripts/commons-search-candidates.json', 'scripts/commons-search-candidates-2.json']) {
  for (const [id, list] of Object.entries(JSON.parse(fs.readFileSync(f, 'utf8')))) {
    candidates[id] = (candidates[id] || []).concat(list);
  }
}
const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
const photos = JSON.parse(fs.readFileSync('public/data/photos.json', 'utf8'));
const byId = Object.fromEntries(places.map((p) => [p.id, p]));
let applied = 0;
for (const [id, file] of Object.entries(PICKS)) {
  const place = byId[id];
  const m = (candidates[id] || []).find((c) => c.file === file);
  if (!place || !m) { console.log('bulunamadı:', id, file); continue; }
  if (place.coverImage && !(photos[id] && photos[id].source === 'Wikimedia Commons arama (elle seçildi)')) continue;
  place.coverImage = m.url;
  place.photoCredit = { artist: m.artist, license: m.license, licenseUrl: m.licenseUrl, page: m.page };
  photos[id] = { url: m.url, file: m.file, page: m.page, artist: m.artist, license: m.license, licenseUrl: m.licenseUrl, source: 'Wikimedia Commons arama (elle seçildi)' };
  applied++;
}
fs.writeFileSync('public/data/places.json', JSON.stringify(places, null, 2) + '\n');
fs.writeFileSync('public/data/photos.json', JSON.stringify(photos, null, 2) + '\n');
console.log(`uygulandı: ${applied}; fotoğrafsız kalan: ${places.filter((p) => !p.coverImage).map((p) => p.id).join(', ')}`);
