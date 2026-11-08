// scripts/sanitizePhotos.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, '../gezi-haritam/public/data/places.json');
let places = JSON.parse(fs.readFileSync(file, 'utf8'));

// High-quality verified 800px thumbnails
const VERIFIED_THUMBNAILS = {
  'ank-anitkabir': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Ataturk%27s_Mausoleum_%286225341313%29.jpg/800px-Ataturk%27s_Mausoleum_%286225341313%29.jpg',
  'ank-1meclis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Ankara_asv2021-10_img45_Cumhuriyet_Street_on_29Oct.jpg/800px-Ankara_asv2021-10_img45_Cumhuriyet_Street_on_29Oct.jpg',
  'go-kurtulus-savasi-muzesi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Ankara_asv2021-10_img45_Cumhuriyet_Street_on_29Oct.jpg/800px-Ankara_asv2021-10_img45_Cumhuriyet_Street_on_29Oct.jpg',
  'ank-2meclis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Ankara_asv2021-10_img71_Republic_Museum.jpg/800px-Ankara_asv2021-10_img71_Republic_Museum.jpg',
  'ank-anadolu-med': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Museum_of_Anatolian_Civilizations001.jpg/800px-Museum_of_Anatolian_Civilizations001.jpg',
  'go-anadolu-medeniyetleri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Museum_of_Anatolian_Civilizations001.jpg/800px-Museum_of_Anatolian_Civilizations001.jpg',
  'ank-kugulu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Ankara_Ku%C4%9Fulu_Park.JPG/800px-Ankara_Ku%C4%9Fulu_Park.JPG',
  'go-kugulu-park': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Ankara_Ku%C4%9Fulu_Park.JPG/800px-Ankara_Ku%C4%9Fulu_Park.JPG',
  'ank-segmenler': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Ankara%2C_Turkey_-_panoramio_%2892%29.jpg/800px-Ankara%2C_Turkey_-_panoramio_%2892%29.jpg',
  'go-segmenler-parki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Ankara%2C_Turkey_-_panoramio_%2892%29.jpg/800px-Ankara%2C_Turkey_-_panoramio_%2892%29.jpg',
  'tr-efes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Library_of_Celsus_side_view.jpg/800px-Library_of_Celsus_side_view.jpg',
  'tr-kapadokya': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Cappadocia_Hot_Air_Balloons.jpg/800px-Cappadocia_Hot_Air_Balloons.jpg',
  'tr-pamukkale': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Pamukkale00.JPG/800px-Pamukkale00.JPG',
  'tr-nemrut': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Mount_Nemrut_heads.jpg/800px-Mount_Nemrut_heads.jpg',
  'tr-sumela': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Sumela_from_across_valley.JPG/800px-Sumela_from_across_valley.JPG',
  'tr-gobeklitepe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/G%C3%B6bekli_Tepe%2C_Urfa.jpg/800px-G%C3%B6bekli_Tepe%2C_Urfa.jpg',
  'tr-salda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Salda_G%C3%B6l%C3%BC%2C_Burdur.jpg/800px-Salda_G%C3%B6l%C3%BC%2C_Burdur.jpg',
  'dunya-mostar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Mostar_Old_Town_Panorama_2007.jpg/800px-Mostar_Old_Town_Panorama_2007.jpg',
  'dunya-kolezyum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/800px-Colosseo_2020.jpg',
  'dunya-machu-picchu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Machu_Picchu%2C_2023_%28012%29.jpg/800px-Machu_Picchu%2C_2023_%28012%29.jpg',
  'go-galata-port-moda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Galata_Tower_in_Istanbul.JPG/800px-Galata_Tower_in_Istanbul.JPG',
  'go-kas-kekova-batik': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Kaputa%C5%9F_Beach%2C_Ka%C5%9F%2C_Antalya%2C_Turkey.jpg/800px-Kaputa%C5%9F_Beach%2C_Ka%C5%9F%2C_Antalya%2C_Turkey.jpg',
  'go-tuz-golu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Lake_Tuz_at_sunset.jpg/800px-Lake_Tuz_at_sunset.jpg'
};

const INVALID_PATTERNS = [
  'guercino',
  'çatık_kaş',
  'catik_kas',
  'logo',
  'diagram',
  'districts',
  'bestekar',
  'voleybol',
  'salinity',
  'st_luke',
  'insignia',
  'coat_of_arms'
];

const seenPhotos = new Set();
let removedBad = 0;
let removedDuplicates = 0;
let convertedThumbnails = 0;

places = places.map((p) => {
  let img = p.coverImage || '';

  // 1. Direct explicit high-quality override
  if (VERIFIED_THUMBNAILS[p.id]) {
    img = VERIFIED_THUMBNAILS[p.id];
  } else if (p.id.includes('anitkabir') || (p.name && p.name.toLowerCase().includes('anıtkabir'))) {
    img = VERIFIED_THUMBNAILS['ank-anitkabir'];
  }

  // 2. Reject bad patterns (paintings, logos, diagrams)
  const lower = img.toLowerCase();
  if (INVALID_PATTERNS.some((pat) => lower.includes(pat))) {
    img = '';
    removedBad++;
  }

  // 3. Convert raw upload.wikimedia.org to /thumb/.../800px-...
  if (img && img.startsWith('https://upload.wikimedia.org/wikipedia/commons/') && !img.includes('/thumb/')) {
    const parts = img.split('upload.wikimedia.org/wikipedia/commons/');
    if (parts[1]) {
      const slashParts = parts[1].split('/');
      const filename = slashParts[slashParts.length - 1];
      img = `https://upload.wikimedia.org/wikipedia/commons/thumb/${parts[1]}/800px-${filename}`;
      convertedThumbnails++;
    }
  }

  // 4. Guarantee strict uniqueness (0 duplicates)
  if (img) {
    if (seenPhotos.has(img)) {
      img = '';
      removedDuplicates++;
    } else {
      seenPhotos.add(img);
    }
  }

  return {
    ...p,
    coverImage: img
  };
});

fs.writeFileSync(file, JSON.stringify(places), 'utf8');

console.log('Sanitization complete!');
console.log('Removed bad paintings/logos:', removedBad);
console.log('Removed duplicates:', removedDuplicates);
console.log('Converted to 800px thumbnails:', convertedThumbnails);
console.log('Total authentic unique places with photos:', places.filter((p) => p.coverImage).length);
