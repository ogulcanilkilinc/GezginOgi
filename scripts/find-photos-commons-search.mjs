// Fourth pass: hand-written Commons search queries for the last places without a cover photo.
// For each place, every query ("||"-separated) is searched in the File namespace; JPEGs at least
// 1000 px wide with a free license are listed as candidates in scripts/commons-search-candidates.json,
// for picking by hand (scripts/apply-commons-search-photos.cjs).
import fs from 'fs';

const UA = 'GezginOgi/1.0 (https://github.com/ogulcanilkilinc/GezginOgi; photo matcher)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getJson(url) {
  for (let i = 0; i < 6; i++) {
    try {
      await sleep(150);
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status >= 500) { await sleep(1500 * (i + 1)); continue; }
      return await res.json();
    } catch { await sleep(1500 * (i + 1)); }
  }
  return null;
}
const strip = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const ROUND2 = process.argv[2] === '2';
export const QUERIES = ROUND2 ? {
  'go-zenger-pasa': 'Ankara Kalesi evleri||Ankara Castle houses||Ankara Citadel',
  'go-haci-abdullah': 'hünkar beğendi||Hünkar beğendi',
  'go-seven-mehmet': 'kalamar tava||fried calamari Turkey||Antalya Kaleiçi',
  'go-van-kahvaltisi': 'serpme kahvaltı||Turkish breakfast spread||Van otlu peynir',
  'go-paris-yemek': 'café terrasse Paris||Paris café terrace||steak frites',
  'ank-ziraat-mektebi-meteoroloji': 'Atatürk Ziraat Mektebi||Keçiören Ankara||Etlik Ankara',
  'ank-kibris-koyu-kanyonu': 'Mamak Ankara||Mamak kanyon',
  'ank-exp-alicin-kanyonu': 'Kızılcahamam||Kızılcahamam kanyon',
  'ank-exp-beynam-ormani': 'Kesikköprü||Bala Ankara||Beynam orman',
  'ank-dp-27': 'Hasanoğlan||Elmadağ kayak||Elmadağ dağı',
  'go-elmadag-kayak': 'Elmadağ kayak||Elmadağ dağı||Elmadag ski',
  'go-egriova': 'Kızılcahamam Soğuksu||Soğuksu Milli Parkı||Kızılcahamam orman',
  'go-guvem-sutunlari': 'Güvem||Güvem Kızılcahamam||Kızılcahamam bazalt',
  'tr-81-hak-2': 'Hakkari köprü||Hakkari Zap vadisi||Hakkari mountains',
  'ank-exp-camlidere-taslasmis-orman': 'Pelitçik||Çamlıdere fosil||silicified wood Ankara'
} : {
  'ank-farabi-arjantin-kokteyl': 'Arjantin Caddesi Ankara||Kavaklıdere Ankara street',
  'ank-esat-aspava': 'Aspava||Küçükesat',
  'ank-cici-piknik-ankara-doneri': 'yaprak döner||doner kebab Ankara',
  'ank-ayranci-antika-goksu-balik': 'Ayrancı Ankara||meze rakı table',
  'ank-filistin-melly-lou': 'Gaziosmanpaşa Çankaya||Filistin Caddesi Ankara',
  'ank-bulten-buklum-mahalle-barlari': 'Tunalı Hilmi Caddesi||Kavaklıdere',
  'ank-cinnah-guvenevler-kahve-cikolata': 'Cinnah Caddesi||Güvenevler Ankara',
  'ank-alma-aruni-trilye-gastronomi': 'Gaziosmanpaşa Ankara||Çankaya Ankara',
  'ank-ziraat-mektebi-meteoroloji': 'Ziraat Mektebi Ankara||Meteoroloji Müzesi Ankara||Kalaba Keçiören',
  'ank-kibris-koyu-kanyonu': 'Kıbrıs Köyü kanyon||Kıbrısköy Mamak',
  'ank-bilkent-cayyolu-park-caddesi': 'Bilkent Station||Çayyolu Ankara',
  'ank-exp-camlidere-taslasmis-orman': 'Pelitçik fosil orman||Çamlıdere taşlaşmış orman||Çamlıdere',
  'ank-exp-alicin-kanyonu': 'Alicin Manastırı||Alicin kanyon||Kızılcahamam Pazar',
  'ank-exp-beynam-ormani': 'Beynam||Beynam Ormanı',
  'ank-dp-21': 'Aluçdağı||Çamlıdere Karagöl||Çamlıdere Barajı',
  'ank-dp-27': 'Hasanoğlan Köy Enstitüsü||Elmadağ Kayak Merkezi||Elmadağ Ankara',
  'go-egriova': 'Eğriova||Eğriova Yaylası||Kızılcahamam yayla',
  'go-guvem-sutunlari': 'Güvem bazalt||Güvem basalt columns||Güvem Kızılcahamam',
  'go-sakarya-meydan-muharebesi': 'Duatepe||Sakarya Meydan Muharebesi||Mangaltepe Polatlı',
  'go-elmadag-kayak': 'Elmadağ Kayak Merkezi||Elmadağ ski||Elmadağ Ankara',
  'go-kirik-oklava': 'gözleme||Cebeci Ankara',
  'go-bizim-kofteci': 'ızgara köfte piyaz||Turkish köfte',
  'go-kebap-49': 'Adana kebap||Tunalı Hilmi',
  'go-f451-brew': 'Tunalı Hilmi Caddesi||Kavaklıdere',
  'go-prod-coffee': 'pour over coffee||Bahçelievler Ankara',
  'go-arabica-coffee': 'Beşevler Ankara||Bahçelievler 7. Cadde',
  'go-rispetto': 'Bahçelievler 7. Cadde||Bahçelievler Ankara',
  'go-zenger-pasa': 'Zenger Paşa Konağı||Ankara Kalesi evler',
  'go-haci-arif-bey': 'Kızılay Ankara||İskender kebap',
  'go-turk-hamam-muzesi': 'Türk Hamam Müzesi||Beypazarı hamam||Beypazarı',
  'tr-urla-bag-yolu': 'Urla vineyard||Urla bağ||Urla İzmir',
  'tr-81-isp-2': 'Kuyucak lavanta||lavender Isparta||Yalvaç Antiocheia',
  'tr-81-hak-2': 'Zap Suyu||Hakkari Meydan Medresesi||Hakkari',
  'go-kuyucak-lavanta': 'Kuyucak lavanta||lavender Isparta||lavanta tarlası',
  'go-kabak-koyu': 'Kabak Bay||Kabak Fethiye||Kabak Koyu',
  'go-rize-cay': 'tea plantation Rize||Rize çay bahçesi||Rize tea',
  'go-oskvank-ishan': 'Öşkvank||Oshki Monastery||Ishkhani Church',
  'go-van-kahvaltisi': 'Van kahvaltı||Van breakfast||otlu peynir',
  'go-islama-kofte': 'ıslama köfte||Akyazı köfte',
  'go-haci-abdullah': 'Hacı Abdullah||Beyoğlu lokanta',
  'go-seven-mehmet': '7 Mehmet||Antalya restaurant',
  'go-chez-galip': 'Chez Galip||Avanos hair museum||Avanos',
  'go-ciya-sofrasi': 'Çiya Sofrası||Kadıköy çarşı',
  'go-imam-cagdas': 'İmam Çağdaş||Gaziantep baklava',
  'wld-ort-alula-umman': 'Qasr al-Farid||Hegra tomb||Mada\'in Salih',
  'go-lyon-yemek': 'bouchon lyonnais||Lyon bouchon',
  'de-19': 'Altes Rathaus Bamberg||Bamberg Rathaus',
  'ch-02': 'Rheinfall||Rhine Falls Schaffhausen',
  'ch-04': 'Rigi Kulm||Rigi Lake Lucerne',
  'jp-02': 'teamLab Planets||teamLab Borderless',
  'ba-dp-5': 'Blagaj tekke||Blagaj Tekija',
  'id-dp-1': 'Tegallalang rice terraces||Tegalalang||Ubud rice terraces',
  'w195-mv-1': 'Maldives water villas||Maldives resort aerial||Maldives atoll',
  'w195-om-1': 'Sultan Qaboos Grand Mosque||Wadi Shab',
  'w195-ci-1': 'Basilica Our Lady of Peace Yamoussoukro||Grand-Bassam',
  'blk-me-4': 'Porto Montenegro||Tivat marina',
  'go-beyaz-col': 'White Desert Egypt||Sahara el Beyda||White Desert Farafra',
  'go-titikaka': 'Uros floating islands||Lake Titicaca Puno||Titicaca',
  'go-paris-yemek': 'Paris bistro||bistrot Paris terrasse',
  'go-maldivler': 'Maldives beach||Maldives water villas'
};

const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
const missing = new Set(places.filter((p) => !p.coverImage).map((p) => p.id));
const out = {};
for (const [id, q] of Object.entries(QUERIES)) {
  if (!missing.has(id)) continue;
  const seen = new Set();
  out[id] = [];
  for (const query of q.split('||')) {
    const s = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=15&srsearch=${encodeURIComponent(query + ' filetype:bitmap')}`);
    const titles = (s?.query?.search || []).map((r) => r.title).filter((t) => !seen.has(t));
    titles.forEach((t) => seen.add(t));
    if (!titles.length) continue;
    const ii = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1280&titles=${encodeURIComponent(titles.join('|'))}`);
    for (const page of Object.values(ii?.query?.pages || {})) {
      const info = page.imageinfo?.[0];
      if (!info || info.mime !== 'image/jpeg' || info.width < 1000) continue;
      const md = info.extmetadata || {};
      const license = strip(md.LicenseShortName?.value);
      if (!license) continue;
      out[id].push({
        q: query, file: page.title.replace(/^File:/, ''), w: info.width, h: info.height,
        url: info.thumburl, page: info.descriptionurl,
        artist: strip(md.Artist?.value) || 'Bilinmiyor', license, licenseUrl: md.LicenseUrl?.value || '',
        desc: strip(md.ImageDescription?.value).slice(0, 140)
      });
    }
  }
}
fs.writeFileSync(ROUND2 ? 'scripts/commons-search-candidates-2.json' : 'scripts/commons-search-candidates.json', JSON.stringify(out, null, 2) + '\n');
console.log(Object.entries(out).map(([id, c]) => `${id}: ${c.length}`).join('\n'));
