// scripts/analyze-true-duplicates.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const candidatesPath = path.resolve(__dirname, '../duplicate-candidates.json');

const pairs = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));

// False positive patterns where distinct places share a common keyword or city
const FALSE_POSITIVE_KEYWORDS = [
  ['anitkabir', 'meclis'],
  ['anitkabir', 'tbmm'],
  ['cermodern', 'cso'],
  ['resim ve heykel', 'cermodern'],
  ['resim ve heykel', 'cso'],
  ['topkapi', 'yerebatan'],
  ['ayasofya', 'topkapi'],
  ['ayasofya', 'yerebatan'],
  ['galata kulesi', 'galataport'],
  ['dolmabahce', 'besiktas'],
  ['ayasofya', 'sultanahmet camii'],
  ['kapalicarsi', 'misir carsisi']
];

function isFalsePositive(name1, name2) {
  const n1 = name1.toLowerCase();
  const n2 = name2.toLowerCase();
  for (const [kw1, kw2] of FALSE_POSITIVE_KEYWORDS) {
    if ((n1.includes(kw1) && n2.includes(kw2)) || (n1.includes(kw2) && n2.includes(kw1))) {
      return true;
    }
  }
  return false;
}

const verifiedDuplicates = [];
const falsePositives = [];

for (const pair of pairs) {
  if (isFalsePositive(pair.p1.name, pair.p2.name)) {
    falsePositives.push({ pair, reason: 'Farklı iki tarihi yapı (ortak kelime veya yakın mesafe)' });
    continue;
  }

  // Check if they truly refer to the same destination
  verifiedDuplicates.push(pair);
}

console.log(`Toplam Şüpheli Çift: ${pairs.length}`);
console.log(`Elenen Yanıltıcı / Farklı Yapılar: ${falsePositives.length}`);
console.log(`İncelenecek Gerçek Adaylar: ${verifiedDuplicates.length}`);

// Write candidate pairs for inspection
fs.writeFileSync(
  path.resolve(__dirname, '../verified-duplicates-check.json'),
  JSON.stringify(verifiedDuplicates, null, 2),
  'utf8'
);
