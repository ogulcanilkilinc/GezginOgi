// scripts/categorize-duplicates.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const candidatesPath = path.resolve(__dirname, '../duplicate-candidates.json');

const pairs = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));

const ankara = [];
const turkiye = [];
const abroad = [];

for (const pair of pairs) {
  const isAnk =
    pair.p1.id.startsWith('ank-') ||
    pair.p2.id.startsWith('ank-') ||
    pair.p1.subRegion?.includes('ankara') ||
    pair.p2.subRegion?.includes('ankara');

  const isTr = pair.p1.country === 'Türkiye' || pair.p2.country === 'Türkiye';

  if (isAnk) ankara.push(pair);
  else if (isTr) turkiye.push(pair);
  else abroad.push(pair);
}

console.log(`Ankara Çiftleri: ${ankara.length}`);
console.log(`Türkiye (Diğer Şehirler) Çiftleri: ${turkiye.length}`);
console.log(`Yurtdışı Çiftleri: ${abroad.length}`);

// Group by exact duplicated topic
function getDuplicateTopic(name1, name2) {
  const n1 = name1.toLowerCase();
  const n2 = name2.toLowerCase();
  if (n1.includes('mogan') && n2.includes('mogan')) return 'Mogan Gölü';
  if (n1.includes('bahçelievler') && n2.includes('bahçelievler')) return 'Bahçelievler 7. Cadde';
  if (n1.includes('pembe köşk') && n2.includes('pembe köşk')) return 'Pembe Köşk';
  if (n1.includes('mta') && n2.includes('mta')) return 'MTA Tabiat Tarihi Müzesi';
  if (n1.includes('alicin') && n2.includes('alicin')) return 'Alicin Kanyonu / Manastırı';
  if (n1.includes('beynam') && n2.includes('beynam')) return 'Beynam Ormanı';
  if (n1.includes('tuz gölü') && n2.includes('tuz gölü')) return 'Tuz Gölü';
  if (n1.includes('bozcaada') && n2.includes('bozcaada')) return 'Bozcaada';
  if (n1.includes('yedigöller') && n2.includes('yedigöller')) return 'Yedigöller';
  if (n1.includes('zeugma') && n2.includes('zeugma')) return 'Zeugma';
  if (n1.includes('odunpazarı') && n2.includes('odunpazarı')) return 'Odunpazarı';
  if (n1.includes('akyaka') && n2.includes('akyaka')) return 'Akyaka';
  if (n1.includes('borçka') && n2.includes('borçka')) return 'Borçka Karagöl';
  if (n1.includes('akdamar') && n2.includes('akdamar')) return 'Akdamar';
  if (n1.includes('dalyan') && n2.includes('dalyan')) return 'Dalyan';
  if (n1.includes('amasra') && n2.includes('amasra')) return 'Amasra';
  if (n1.includes('cunda') && n2.includes('cunda')) return 'Ayvalık - Cunda';
  if (n1.includes('botanik') && n2.includes('botanik')) return 'Botanik Parkı & Atakule';
  if ((n1.includes('filistin') || n1.includes('arjantin')) && (n2.includes('filistin') || n2.includes('arjantin'))) return 'GOP (Arjantin / Filistin Cad.)';
  return null;
}

const exactMatches = [];
for (const p of pairs) {
  const topic = getDuplicateTopic(p.p1.name, p.p2.name);
  if (topic) {
    exactMatches.push({ topic, ...p });
  }
}

console.log(`Birebir İsmi Geçen Net Tekrarlar: ${exactMatches.length}`);
exactMatches.forEach((em, idx) => {
  console.log(`[${idx + 1}] [${em.topic}]`);
  console.log(`     A: "${em.p1.name}" (${em.p1.id})`);
  console.log(`     B: "${em.p2.name}" (${em.p2.id})`);
  console.log(`     Mesafe: ${em.distMeters}m | Öneri: Kalsın -> "${em.recommendation.keepName}" (${em.recommendation.keepId})`);
});
