// Second visa check, 11 Nov 2026: the two countries the first pass could not confirm.
// Dominican Republic: mfa.gov.tr ("Türk Vatandaşlarının Tabi Olduğu Vize Uygulamaları") says ordinary
// passport holders need a visa and can get a 30-day visa at the airport.
// Taiwan: boca.gov.tw lists Türkiye (ordinary passports) as eligible for the online eVisa.
// Patches the same three places as update-visa-2026-11.cjs.
const fs = require('fs');

const E = (label, duration, notes) => ({ category: 'kapi_evize', label, duration, notes });
const UPDATES = {
  'Dominik Cumhuriyeti': E('Kapıda Vize (30 Gün)', '30 gün', 'Bordo pasaportla vizeye tabi; havalimanında 30 gün süreli vize alınır. Giriş ve çıkış için resmi portaldan online E-Ticket formu doldurulur.'),
  'Tayvan': E('e-Vize', 'Değişken', 'Türkiye, Tayvan’ın online e-vize listesinde (bordo pasaport). Başvuru Tayvan Konsolosluk İşleri Bürosu’nun (boca.gov.tw) resmi sitesinden yapılır; liste karşılıklılık esasına göre değişebildiği için yola çıkmadan teyit et.')
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
    source: p.country === 'Tayvan' ? 'Kaynak: Tayvan Konsolosluk İşleri Bürosu (boca.gov.tw) · Kontrol: 11 Kasım 2026' : 'Kaynak: T.C. Dışişleri Bakanlığı (mfa.gov.tr) · Kontrol: 11 Kasım 2026'
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
