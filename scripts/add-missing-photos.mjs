// scripts/add-missing-photos.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const photosPath = path.resolve(__dirname, '../public/data/photos.json');

const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));

const MISSING_PHOTOS = {
  'ank-tuz-golu-sereflikochisar': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Lake_Tuz.jpg/960px-Lake_Tuz.jpg',
    file: 'Lake_Tuz.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Lake_Tuz.jpg',
    artist: 'bgag (Wikimedia Commons)',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    source: 'Wikimedia Commons'
  },
  'tr-ayvalik-cunda': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Ayvalik_seafront.jpg/960px-Ayvalik_seafront.jpg',
    file: 'Ayvalik_seafront.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Ayvalik_seafront.jpg',
    artist: 'Nedim Ardoğa',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    source: 'Wikimedia Commons'
  },
  'tr-tazi-kanyonu-aspendos': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/K%C3%B6pr%C3%BCl%C3%BC_Kanyon.jpg/960px-K%C3%B6pr%C3%BCl%C3%BC_Kanyon.jpg',
    file: 'Köprülü_Kanyon.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:K%C3%B6pr%C3%BCl%C3%BC_Kanyon.jpg',
    artist: 'Bernard Gagnon',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    source: 'Wikimedia Commons'
  },
  'tr-exp-mersin-kizkalesi-tarsus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Korykos_-_K%C4%B1zkalesi_01_%28cropped%29.jpg/960px-Korykos_-_K%C4%B1zkalesi_01_%28cropped%29.jpg',
    file: 'Korykos_-_Kızkalesi_01_(cropped).jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Korykos_-_K%C4%B1zkalesi_01_(cropped).jpg',
    artist: 'Zeynel Cebeci',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'Wikimedia Commons'
  },
  'wld-tokyo-shibuya-asakusa': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Day2-2_%2840909714314%29.jpg/960px-Day2-2_%2840909714314%29.jpg',
    file: 'Day2-2_(40909714314).jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Day2-2_(40909714314).jpg',
    artist: 'IQRemix (Tokyo Shibuya Crossing)',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    source: 'Wikimedia Commons'
  },
  'wld-mtp4-romanya-transilvanya': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Bran_Castle_TB1.jpg/960px-Bran_Castle_TB1.jpg',
    file: 'Bran_Castle_TB1.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Bran_Castle_TB1.jpg',
    artist: 'Florin CB (Wikimedia Commons)',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    source: 'Wikimedia Commons'
  },
  'vn-dp-4': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/H%E1%BB%99i_An%2C_Ancient_Town%2C_2020-01_CN-06.jpg/960px-H%E1%BB%99i_An%2C_Ancient_Town%2C_2020-01_CN-06.jpg',
    file: 'Hội_An,_Ancient_Town,_2020-01_CN-06.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:H%E1%BB%99i_An%2C_Ancient_Town%2C_2020-01_CN-06.jpg',
    artist: 'Carschten',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'Wikimedia Commons'
  },
  'ma-dp-4': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Merzouga_Dunes_2011.jpg/960px-Merzouga_Dunes_2011.jpg',
    file: 'Merzouga_Dunes_2011.jpg',
    page: 'https://commons.wikimedia.org/wiki/File:Merzouga_Dunes_2011.jpg',
    artist: 'Rosa Cabecinhas & Isabel Macedo',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    source: 'Wikimedia Commons'
  }
};

let added = 0;
for (const [id, meta] of Object.entries(MISSING_PHOTOS)) {
  photos[id] = meta;
  added++;
  console.log(`✓ Eklendi: ${id} -> ${meta.file} (${meta.artist})`);
}

fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2), 'utf8');
console.log(`✅ photos.json başarıyla güncellendi. Toplam kayıt: ${Object.keys(photos).length}`);
