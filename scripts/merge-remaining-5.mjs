// scripts/merge-remaining-5.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const placesPath = path.resolve(__dirname, '../public/data/places.json');

const places = JSON.parse(fs.readFileSync(placesPath, 'utf8'));
const placesById = new Map(places.map((p) => [p.id, p]));

const MERGES = [
  {
    topic: 'Lizbon Alfama',
    keepId: 'pt-01',
    removeIds: ['wld-lizbon-sintra-porto', 'go-lizbon-yemek']
  },
  {
    topic: 'Marakeş',
    keepId: 'ma-dp-1',
    removeIds: ['wld-fas-marakes-safsavan']
  },
  {
    topic: 'Tiflis Eski Şehir',
    keepId: 'ge-dp-1',
    removeIds: ['wld-gurcistan-tiflis-kazbegi']
  },
  {
    topic: 'Arnavutluk Ksamil Adaları',
    keepId: 'al-dp-3',
    removeIds: ['wld-arnavutluk-ksamil-berat']
  },
  {
    topic: 'Kolombiya Cartagena & Medellín',
    keepId: 'co-dp-1',
    removeIds: ['wld-kolombiya-cartagena-cocora']
  }
];

const removeSet = new Set();

for (const m of MERGES) {
  const keep = placesById.get(m.keepId);
  if (!keep) {
    console.warn('Keep id not found:', m.keepId);
    continue;
  }

  for (const remId of m.removeIds) {
    const rem = placesById.get(remId);
    if (!rem) {
      console.warn('Remove id not found:', remId);
      continue;
    }

    if (!keep.coverImage && rem.coverImage) keep.coverImage = rem.coverImage;
    if (rem.visited) keep.visited = true;
    if (rem.userNotes && !keep.userNotes) keep.userNotes = rem.userNotes;
    if (rem.userPhotos && rem.userPhotos.length > 0) {
      keep.userPhotos = Array.from(new Set([...(keep.userPhotos || []), ...rem.userPhotos]));
    }
    if (rem.highlights && (!keep.highlights || keep.highlights.length === 0)) {
      keep.highlights = rem.highlights;
    }
    if (rem.localSpecialties && !keep.localSpecialties) {
      keep.localSpecialties = rem.localSpecialties;
    }
    removeSet.add(remId);
    console.log(`✓ Birleştirildi: [${m.topic}] "${rem.name}" (${remId}) --> "${keep.name}" (${keep.id})`);
  }
}

const cleaned = places.filter((p) => !removeSet.has(p.id));
console.log(`Önceki mekan sayısı: ${places.length}`);
console.log(`Silinen kopya sayısı: ${removeSet.size}`);
console.log(`Yeni mekan sayısı: ${cleaned.length}`);

fs.writeFileSync(placesPath, JSON.stringify(cleaned, null, 2), 'utf8');
console.log('✅ places.json güncellendi.');
