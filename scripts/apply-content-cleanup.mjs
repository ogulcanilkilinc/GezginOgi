// Replaces generic template text in public/data/places.json with place-appropriate content:
// - "local specialties" lists that name other countries' dishes -> the province's / country's own dishes
// - filler "highlights" lines that only repeat the place name -> removed
// - "best time" filler -> a sentence built from the place's own season tags
// - "how to visit" templates that mention the wrong countries' trains/boats -> a neutral, accurate sentence
import fs from 'fs';
import { createRequire } from 'module';
import { provincesOfPlace } from '../src/data/turkeyProvinces.js';

const require = createRequire(import.meta.url);
const { PROVINCE_FOOD, COUNTRY_FOOD } = require('./food-by-region.cjs');
const FILE = 'public/data/places.json';
const places = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const starts = (s, prefixes) => prefixes.some((p) => (s || '').startsWith(p));
const WRONG_FOOD = [
  'Bölgesel Anadolu mutfağı, zeytinyağlılar, deniz ürünleri',
  'Her ilin coğrafi işaretli yöresel yemekleri',
  'Karadeniz pidesi ve mıhlaması, Tokat kebabı',
  'İspanyol Tapas & Paella, Portekiz Deniz Ürünleri',
  'Boşnak Böreği, Ćevapi (Köfte), Kajmak, Karadağ Deniz Ürünleri',
  'Norveç Kral Yengeci ve Somonu, İsveç Köftesi',
  'Kore Barbeküsü ve Bibimbap, Tayland Pad Thai',
  'Fas Tajin ve Nane Çayı, Meksika Tacos al Pastor',
  'Ülkenin geleneksel ulusal yemekleri'
];
const VIENNA = 'Viyana’da **Wiener Schnitzel**';
const DUTCH = 'Hollanda’da sıcak **Stroopwafel**';
const FILLER_HIGHLIGHT = /ana gezi, mimari ve panoramik seyir noktası|çevresindeki tarihi sokaklar, kültür durakları ve yürüyüş rotası|Gezginler için en fotojenik kadrajlar ve yerel atmosfer/;
const FILLER_BEST = /sabah erken saatler \(08:30-10:30\) veya gün batımı öncesi altın saatler/;
const WRONG_VISIT = [
  'Hızlı tren ağları (AVE, Shinkansen, SBB)',
  'Asya’da yüksek hızlı trenler (KTX)',
  'Bölgesel iç hat uçuşları, hızlı trenler (Fas Al Boraq)',
  'Balkan şehirleri arasında manzaralı karayolları, trenler ve nehir-fiyort tekneleriyle',
  'Şehir içi toplu taşıma, vapurlar, teleferikler ve antik kent/koy rotaları',
  'Şehirlerarası karayolu, hızlı tren (YHT) ve ilçe minibüs/otobüs hatları',
  'Karadeniz Sahil Yolu, Doğu/Kurtalan Ekspresi'
];
// Nordic template names Norway's fjord ferries and Iceland's Ring Road; keep it only there
const NORDIC_VISIT = 'Fiyort feribotları, panoramik dağ trenleri (Flåmsbana)';
// Provinces on Ankara's high-speed rail (YHT) lines
const YHT = new Set(['Ankara', 'Eskişehir', 'Bilecik', 'Kocaeli', 'Sakarya', 'İstanbul', 'Konya', 'Karaman', 'Kırıkkale', 'Yozgat', 'Sivas']);
const SEASON_TR = { ilkbahar: 'ilkbahar', yaz: 'yaz', sonbahar: 'sonbahar', kis: 'kış' };
const listTr = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} ve ${a[a.length - 1]}`);

const stats = { food: 0, foodMissing: new Set(), highlights: 0, best: 0, visit: 0 };
for (const p of places) {
  const isTr = p.country === 'Türkiye' || p.region === 'ankara';
  const provs = isTr ? provincesOfPlace(p) : [];

  // Local specialties
  const ls = p.localSpecialties || '';
  const wrongFood =
    !ls.trim() ||
    starts(ls, WRONG_FOOD) ||
    (ls.startsWith(VIENNA) && p.country !== 'Avusturya') ||
    (ls.startsWith(DUTCH) && p.country !== 'Hollanda');
  if (wrongFood) {
    let food = null;
    if (isTr && provs.length) food = provs.slice(0, 2).map((pr) => PROVINCE_FOOD[pr]).filter(Boolean).join(' ');
    else if (!isTr) food = COUNTRY_FOOD[p.country];
    if (food) {
      p.localSpecialties = food;
      stats.food++;
    } else stats.foodMissing.add(`${p.country}${provs.length ? '/' + provs[0] : ''} (${p.id})`);
  }

  // Highlights
  if (Array.isArray(p.highlights)) {
    const kept = p.highlights.filter((h) => !FILLER_HIGHLIGHT.test(h));
    if (kept.length !== p.highlights.length) {
      p.highlights = kept;
      stats.highlights++;
    }
  }

  // Best time
  if (FILLER_BEST.test(p.bestTimeText || '')) {
    const s = (p.seasons || []).filter((x) => SEASON_TR[x]);
    p.bestTimeText =
      s.length === 4 || s.length === 0
        ? 'Her mevsim gezilebilir. Kalabalıktan kaçmak için sabah erken saatlerde gitmek en iyisi.'
        : `En uygun dönem: ${listTr(['ilkbahar', 'yaz', 'sonbahar', 'kis'].filter((x) => s.includes(x)).map((x) => SEASON_TR[x]))}. Kalabalıktan kaçmak için sabah erken saatlerde gitmek en iyisi.`;
    stats.best++;
  }

  // How to visit
  if (starts(p.howToVisit, WRONG_VISIT) || (starts(p.howToVisit, [NORDIC_VISIT]) && !['Norveç', 'İzlanda'].includes(p.country))) {
    p.howToVisit = isTr
      ? `Şehir merkezine şehirlerarası otobüsle ya da en yakın havalimanından ulaşılır${provs.some((pr) => YHT.has(pr)) ? '; Ankara’dan YHT ile de gidilebilir' : ''}. Çevredeki noktaları gezmek için araç kiralamak ya da yerel turlara katılmak en rahatıdır.`
      : 'En yakın uluslararası havalimanından ulaşılır. Çevredeki noktalar için araç kiralamak, toplu taşıma ya da yerel turlar en pratik yoldur.';
    stats.visit++;
  }
}

fs.writeFileSync(FILE, JSON.stringify(places, null, 2) + '\n');
console.log(`yöresel lezzet: ${stats.food}, öne çıkanlar: ${stats.highlights}, en iyi zaman: ${stats.best}, nasıl gezilir: ${stats.visit}`);
if (stats.foodMissing.size) console.log('yemek bilgisi bulunamayan:', [...stats.foodMissing].join(', '));
