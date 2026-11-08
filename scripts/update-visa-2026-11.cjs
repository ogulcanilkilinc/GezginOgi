// Visa corrections for Turkish ordinary (bordo) passport holders, checked on 8 Nov 2026 against
// Wikipedia "Visa requirements for Turkish citizens" (Timatic-referenced) and news for the big changes
// (Montenegro visa from 1 Nov 2026). Patches the same entry in all three places that hold it:
// public/data/places.json (visaStatus), src/data/visaData.js and scripts/enrich-places-metadata.mjs.
const fs = require('fs');

const E = (label, duration, notes) => ({ category: 'kapi_evize', label, duration, notes });
const F = (label, duration, notes) => ({ category: 'vizesiz', label, duration, notes });
const UPDATES = {
  'Karadağ': {
    category: 'vize_gerekli',
    label: 'Vize Şart (1 Kasım 2026’dan beri)',
    duration: 'Değişken',
    notes: 'Karadağ 1 Kasım 2026’dan itibaren bordo pasaportlu Türk vatandaşlarından vize istiyor. Geçerli Schengen, ABD, Birleşik Krallık veya İrlanda vizesi ya da oturum izni olanlar muaf olabiliyor; yola çıkmadan Karadağ Büyükelçiliği veya THY duyurusundan teyit et.'
  },
  'Rusya': E('e-Vize (30 Gün)', '30 gün', 'Bordo pasaportla vizesiz giriş 2016’dan beri askıda. Rusya Dışişleri Bakanlığı’nın resmi e-vize sitesinden 30 güne kadar turistik e-vize alınır.'),
  'Hindistan': {
    category: 'vize_gerekli',
    label: 'Vize Şart (Konsolosluk)',
    duration: 'Değişken',
    notes: 'Türk vatandaşları şu an Hindistan e-vize listesinde değil; vize Hindistan Büyükelçiliği veya Konsolosluğu üzerinden alınır. Yola çıkmadan güncel durumu teyit et.'
  },
  'Lübnan': F('Kapıda Ücretsiz Vize (1 Ay)', '1 ay', 'Beyrut Havalimanı’nda ücretsiz giriş vizesi verilir, 1 ay daha uzatılabilir. Pasaportta İsrail damgası olmamalı.'),
  'Umman': F('Vizesiz (30 Gün)', '30 gün', 'Türkiye–Umman karşılıklı vize muafiyeti kapsamında turistik ziyaretlerde 30 güne kadar vize gerekmez.'),
  'Jamaika': F('Vizesiz (90 Gün)', '90 gün', 'Bordo pasaportla turistik ziyaretlerde 90 güne kadar vize gerekmez.'),
  'Zambiya': F('Vizesiz (90 Gün)', '90 gün', 'Zambiya turistik ziyaretlerde vize istemiyor. Victoria Şelaleleri’nde Zimbabve tarafına geçeceksen Zimbabve vizesi veya KAZA Univisa gerekir.'),
  'Angola': F('Vizesiz (30 Gün)', '30 gün', 'Angola turistik ziyaretlerde Türk vatandaşlarına 30 güne kadar vize muafiyeti tanıyor.'),
  'Belize': F('Vizesiz (90 Gün)', '90 gün', 'Bordo pasaportla turistik ziyaretlerde 90 güne kadar vize gerekmez.'),
  'Vanuatu': F('Vizesiz (120 Gün)', '120 gün', 'Bordo pasaportla turistik ziyaretlerde 120 güne kadar vize gerekmez.'),
  'Etiyopya': E('e-Vize / Kapıda Vize', '90 gün', 'Online e-vize veya kapıda vize. e-Vize ile gelenler Addis Ababa Bole Havalimanı’ndan girmeli.'),
  'Namibya': E('e-Vize / Kapıda Vize', '90 gün', 'Online e-vize veya havalimanında kapıda vize alınabilir.'),
  'Bhutan': E('e-Vize + Günlük SDF', '90 gün', 'Online e-vize ile girilir; ayrıca kişi başı günlük Sürdürülebilir Kalkınma Ücreti (SDF) ödenir.'),
  'Myanmar': E('e-Vize (28 Gün)', '28 gün', 'Online e-vize; Yangon, Nay Pyi Taw veya Mandalay havalimanlarından girilir. Güvenlik durumunu Dışişleri’nden kontrol et.'),
  'Küba': E('e-Vize / Turist Kartı', '90 gün', 'Online e-vize (turist kartı) ile girilir; ücretli olarak 90 güne uzatılabilir.'),
  'Kuveyt': E('e-Vize / Kapıda Vize', '3 ay', 'Online e-vize veya havalimanında kapıda vize alınabilir.'),
  'Sudan': E('Kapıda Vize · ⚠️ Güvenlik Uyarısı', '1 ay', 'Türkiye’den doğrudan gelişte kapıda vize verilir. ⚠️ İç çatışma nedeniyle Dışişleri seyahat uyarısı mevcut; zorunlu olmadıkça gidilmemeli.'),
  'Senegal': E('Kapıda Vize', '1 ay', 'Havalimanında kapıda vize alınır.'),
  'Mozambik': E('e-Vize / Kapıda Vize', '30 gün', 'Online e-vize veya kapıda vize alınabilir.'),
  'Benin': E('e-Vize (30 Gün)', '30 gün', 'Resmi portaldan online e-vize alınır.'),
  'Guyana': E('e-Vize', 'Değişken', 'Online e-vize ile girilir.'),
  'Papua Yeni Gine & Solomon Adaları': E('e-Vize (60 Gün)', '60 gün', 'Papua Yeni Gine için online e-vize. Solomon Adaları’nın giriş şartlarını ayrıca kontrol et.'),
  'Zimbabve': E('e-Vize / Kapıda / KAZA Univisa', '1 ay', 'Online e-vize veya kapıda vize; Zambiya ile birlikte gezilecekse KAZA Univisa pratik.'),
  'Bangladeş': E('Kapıda Vize (30 Gün)', '30 gün', 'Havalimanında kapıda vize alınır.'),
  'Meksika': E('SAE Elektronik İzin (Hava Yolu)', '180 gün', 'Uçakla gelişte online SAE elektronik izni alınır. Geçerli ABD, Kanada, Birleşik Krallık, Japonya veya Schengen vizesi olanlar vizesiz girer.'),
  'Bahreyn': E('e-Vize / Kapıda Vize', '14 gün', 'Online e-vize veya kapıda vize alınabilir.'),
  'Nijerya': E('e-Vize (30 Gün)', '30 gün', 'Online e-vize ile girilir. Güvenlik durumunu Dışişleri’nden kontrol et.'),
  'Kamerun': E('e-Vize', 'Değişken', 'Online e-vize ile girilir.'),
  'Cibuti': E('e-Vize (90 Gün)', '90 gün', 'Online e-vize ile girilir.'),
  'Kongo': E('e-Vize · ⚠️ Güvenlik Uyarısı', '7 gün', 'Demokratik Kongo için online e-vize. ⚠️ Doğu bölgelerde (Virunga dahil) silahlı çatışma riski; Dışişleri uyarılarını kontrol et.'),
  'Samoa & Tonga': E('Kapıda Giriş İzni', '31-90 gün', 'Samoa’da kapıda giriş izni (90 gün), Tonga’da kapıda vize (31 gün).')
};

const BADGES = {
  turkiye: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  kimlikle: 'bg-teal-100 text-teal-800 border-teal-300',
  vizesiz: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  kapi_evize: 'bg-amber-100 text-amber-900 border-amber-300',
  schengen: 'bg-blue-100 text-blue-900 border-blue-300',
  vize_gerekli: 'bg-rose-100 text-rose-900 border-rose-300'
};
const ICONS = { turkiye: '🇹🇷', kimlikle: '🪪', vizesiz: '✈️', kapi_evize: '🎫', schengen: '🇪🇺', vize_gerekli: '🔒' };

// 1. places.json
const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));
let n = 0;
places.forEach((p) => {
  const u = UPDATES[p.country];
  if (!u) return;
  p.visaStatus = {
    ...p.visaStatus,
    ...u,
    badgeClass: BADGES[u.category],
    icon: ICONS[u.category],
    isVisaFree: ['turkiye', 'kimlikle', 'vizesiz'].includes(u.category),
    source: 'Kaynak: Timatic/Wikipedia vize tablosu & güncel haberler · Kontrol: 8 Kasım 2026'
  };
  n++;
});
fs.writeFileSync('public/data/places.json', JSON.stringify(places, null, 2) + '\n');

// 2. JS tables: replace the entry, or add it before the table's closing brace
const lit = (u) =>
  `{\n    category: '${u.category}',\n    label: ${JSON.stringify(u.label)},\n    duration: ${JSON.stringify(u.duration)},\n    notes: ${JSON.stringify(u.notes)}\n  }`;
function patchTable(file, tableStart) {
  let src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const start = src.indexOf(tableStart);
  const end = src.indexOf('\n};', start);
  let table = src.slice(start, end);
  const added = [];
  for (const [country, u] of Object.entries(UPDATES)) {
    const key = country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\n  '${key}': \\{[^}]*\\}`);
    if (re.test(table)) table = table.replace(re, `\n  '${country}': ${lit(u)}`);
    else added.push(`  '${country}': ${lit(u)}`);
  }
  if (added.length) table = table.replace(/,?\s*$/, ',\n  // Added in the November 2026 visa check\n' + added.join(',\n'));
  fs.writeFileSync(file, src.slice(0, start) + table + src.slice(end));
  return added.length;
}
const a1 = patchTable('src/data/visaData.js', 'export const COUNTRY_VISA_INFO = {');
const a2 = patchTable('scripts/enrich-places-metadata.mjs', 'const COUNTRY_VISA_INFO = {');
console.log(`places: ${n} yer güncellendi; visaData.js: ${a1} yeni ülke; enrich: ${a2} yeni ülke`);
