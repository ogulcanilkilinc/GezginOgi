// scripts/execute-clean-merge.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const placesPath = path.resolve(__dirname, '../public/data/places.json');

const places = JSON.parse(fs.readFileSync(placesPath, 'utf8'));
const placesById = new Map(places.map((p) => [p.id, p]));

// Verified duplicate clusters: keepId and removeIds
const MERGE_CLUSTERS = [
  // --- 1. 3'LÜ VE 2'Lİ ANKARA MÜKERRERLERİ ---
  {
    topic: 'Tuz Gölü',
    keepId: 'ank-tuz-golu-sereflikochisar',
    removeIds: ['ank-dp-34', 'go-tuz-golu']
  },
  {
    topic: 'Beynam Atatürk Ormanı',
    keepId: 'ank-exp-beynam-ormani',
    removeIds: ['ank-dp-35', 'go-beynam']
  },
  {
    topic: 'Mogan Gölü Parkı',
    keepId: 'ank-mogan-golbasi',
    removeIds: ['ank-dp-17']
  },
  {
    topic: 'Bahçelievler 7. Cadde',
    keepId: 'ank-dp-12',
    removeIds: ['ank-bahcelievler-3cadde']
  },
  {
    topic: 'MTA Tabiat Tarihi Müzesi',
    keepId: 'ank-mta-tabiat-tarihi',
    removeIds: ['ank-dp-15']
  },
  {
    topic: 'Pembe Köşk',
    keepId: 'ank-dp-10',
    removeIds: ['ank-pembe-kosk-dikmen-sakura']
  },
  {
    topic: 'Alicin Manastırı / Kanyonu',
    keepId: 'ank-exp-alicin-kanyonu',
    removeIds: ['ank-alicin-manastiri-abaci']
  },
  {
    topic: 'Botanik Parkı & Atakule',
    keepId: 'ank-dp-13',
    removeIds: ['ank-botanik-atakule']
  },
  {
    topic: 'GOP Arjantin & Filistin Rotası',
    keepId: 'ank-farabi-arjantin-kokteyl',
    removeIds: ['ank-exp-gop-arjantin-filistin']
  },

  // --- 2. TÜRKİYE ŞEHİRLERİ MÜKERRERLERİ ---
  {
    topic: 'Ayvalık & Cunda Adası',
    keepId: 'tr-ayvalik-cunda',
    removeIds: ['tr-bal-1', 'tr-exp-ayvalik-cunda-kazdaglari']
  },
  {
    topic: 'Bozcaada & Gökçeada',
    keepId: 'tr-exp-bozcaada-gokceada',
    removeIds: ['tr-can-4']
  },
  {
    topic: 'Gaziantep Zeugma Müzesi',
    keepId: 'tr-gaziantep-zeugma',
    removeIds: ['tr-gaz-1']
  },
  {
    topic: 'Bolu Yedigöller & Abant',
    keepId: 'tr-bolu-yedigoller-abant',
    removeIds: ['tr-bol-1']
  },
  {
    topic: 'Eskişehir Odunpazarı Evleri',
    keepId: 'tr-eskisehir-odunpazari-omm',
    removeIds: ['tr-esk-1']
  },
  {
    topic: 'Dalyan Kaunos & İztuzu',
    keepId: 'tr-dalyan-iztuzu-kaunos',
    removeIds: ['tr-mug-6']
  },
  {
    topic: 'Akyaka Azmak Nehri',
    keepId: 'tr-mug-7',
    removeIds: ['tr-akyaka-azmak-bodrum']
  },
  {
    topic: 'Artvin Borçka Karagöl & Macahel',
    keepId: 'tr-artvin-borcka-karagol-macahel',
    removeIds: ['tr-art-1']
  },
  {
    topic: 'Van Akdamar Adası',
    keepId: 'tr-van-akdamar-ishakpasa',
    removeIds: ['tr-van-1']
  },
  {
    topic: 'Amasra Kalesi',
    keepId: 'tr-81-bar-1',
    removeIds: ['tr-amasra-safranbolu']
  },
  {
    topic: 'Kaş & Antiphellos',
    keepId: 'tr-kas-kaputas',
    removeIds: ['tr-ant-11']
  },
  {
    topic: 'Rize Pokut Yaylası',
    keepId: 'tr-pokut-yaylasi',
    removeIds: ['tr-riz-1']
  },
  {
    topic: 'Aksaray Ihlara Vadisi & Selime',
    keepId: 'tr-ihlara-vadisi',
    removeIds: ['tr-exp-aksaray-ihlara-selime']
  },
  {
    topic: 'Antalya Köprülü Kanyon',
    keepId: 'tr-tazi-kanyonu-aspendos',
    removeIds: ['go-koprulu-kanyon']
  },
  {
    topic: 'Trabzon Hamsiköy',
    keepId: 'tr-sumela-trabzon',
    removeIds: ['go-hamsikoy']
  },
  {
    topic: 'Kastamonu Valla & Horma Kanyonu',
    keepId: 'tr-kastamonu-horma-valla',
    removeIds: ['tr-kas-1']
  },
  {
    topic: 'Hatay Antakya & Titus Tüneli',
    keepId: 'tr-hatay-antakya-titus-vakifli',
    removeIds: ['tr-hat-1']
  },
  {
    topic: 'Mersin Kızkalesi & Cennet-Cehennem',
    keepId: 'tr-exp-mersin-kizkalesi-tarsus',
    removeIds: ['tr-mer-1']
  },
  {
    topic: 'Bitlis Nemrut Krateri',
    keepId: 'tr-exp-bitlis-nemrut-krater-ahlat',
    removeIds: ['tr-81-bit-1']
  },
  {
    topic: 'Ordu & Giresun Yaylaları',
    keepId: 'tr-exp-ordu-persembe-mavigol',
    removeIds: ['tr-ord-1']
  },

  // --- 3. BALKANLAR & AVRUPA MÜKERRERLERİ ---
  {
    topic: 'Bosna-Hersek Jajce Şelalesi',
    keepId: 'ba-dp-8',
    removeIds: ['bos-jajce-pliva-waterfalls']
  },
  {
    topic: 'Kosova Prizren Kalesi & Şadırvan',
    keepId: 'blk-xk-1',
    removeIds: ['ksv-prizren-castle-sadirvan']
  },
  {
    topic: 'Bosna-Hersek Trebinje Arslanağa',
    keepId: 'blk-ba-9',
    removeIds: ['bos-trebinje-arslanagic']
  },
  {
    topic: 'Bosna-Hersek Bihać Una Şelaleleri',
    keepId: 'blk-ba-11',
    removeIds: ['bos-bihac-una-strbacki-buk']
  },
  {
    topic: 'Kuzey Makedonya Manastır (Bitola)',
    keepId: 'blk-mk-3',
    removeIds: ['mkd-bitola-sirok-sokak']
  },
  {
    topic: 'Bulgaristan Filibe (Plovdiv)',
    keepId: 'blk-bg-1',
    removeIds: ['bgr-plovdiv-old-town']
  },
  {
    topic: 'Sırbistan Uvac Kanyonu',
    keepId: 'rs-dp-6',
    removeIds: ['srb-uvac-canyon-meanders']
  },
  {
    topic: 'Yunanistan Selanik Atatürk Evi',
    keepId: 'gr-03',
    removeIds: ['gr-c-7']
  },
  {
    topic: 'Yunanistan Kavala Su Kemerleri',
    keepId: 'gr-04',
    removeIds: ['gr-c-8']
  },
  {
    topic: 'Hollanda Rotterdam Küp Evler',
    keepId: 'nl-06',
    removeIds: ['nl-c-4']
  },
  {
    topic: 'Hollanda Maastricht Dominikanen',
    keepId: 'nl-09',
    removeIds: ['nl-c-8']
  },
  {
    topic: 'Portekiz Lizbon Alfama Tram 28',
    keepId: 'pt-01',
    removeIds: ['prt-lisbon-alfama-belem']
  },
  {
    topic: 'Romanya Transilvanya Bran Kalesi',
    keepId: 'wld-mtp4-romanya-transilvanya',
    removeIds: ['rou-brasov-bran-peles']
  },
  {
    topic: 'Slovenya Bled & Bohinj',
    keepId: 'wld-mtp4-slovenya-bled-predjama',
    removeIds: ['svn-bled-bohinj-lakes']
  },

  // --- 4. DÜNYA & DİĞER KITA MÜKERRERLERİ ---
  {
    topic: 'Arjantin Buenos Aires La Boca',
    keepId: 'ar-dp-1',
    removeIds: ['arg-buenos-aires-la-boca-recoleta']
  },
  {
    topic: 'Kolombiya Cartagena Surları',
    keepId: 'co-dp-1',
    removeIds: ['col-cartagena-indias-walled-city']
  },
  {
    topic: 'Mısır Kıpti Kahire Asılı Kilise',
    keepId: 'eg-04',
    removeIds: ['eg-c-3']
  },
  {
    topic: 'Çin Hangzhou Batı Gölü',
    keepId: 'cn-04',
    removeIds: ['cn-c-5']
  },
  {
    topic: 'Venezuela Melek (Angel) Şelalesi',
    keepId: 'wld-mtp4-angel-selalesi-roraima',
    removeIds: ['go-melek-selalesi']
  },
  {
    topic: 'ABD Yellowstone',
    keepId: 'wld-am-abd-yellowstone-yosemite',
    removeIds: ['go-yellowstone']
  },
  {
    topic: 'Japonya Asakusa Senso-ji',
    keepId: 'wld-tokyo-shibuya-asakusa',
    removeIds: ['go-asakusa']
  },
  {
    topic: 'İsrail Müzesi',
    keepId: 'w195-il-1',
    removeIds: ['go-israil-muzesi']
  },
  {
    topic: 'Fas Merzouga Sahra Çölü',
    keepId: 'ma-dp-4',
    removeIds: ['go-merzouga']
  },
  {
    topic: 'Tanzanya Ngorongoro',
    keepId: 'tz-dp-1',
    removeIds: ['go-ngorongoro']
  },
  {
    topic: 'Vietnam Hoi An',
    keepId: 'vn-dp-4',
    removeIds: ['go-hoi-an']
  },

  // --- 5. ESKİ YEMEK STUBLARI (Zengin şehir kayıtlarına aktarılır) ---
  {
    topic: 'Roma Gastronomi',
    keepId: 'wld-roma-kolezyum',
    removeIds: ['go-roma-yemek']
  },
  {
    topic: 'Viyana Gastronomi',
    keepId: 'at-04',
    removeIds: ['go-viyana-yemek']
  },
  {
    topic: 'Bangkok Gastronomi',
    keepId: 'th-dp-1',
    removeIds: ['go-bangkok-yemek']
  },
  {
    topic: 'Seul Gastronomi',
    keepId: 'wld-seul-gyeongbokgung-bukchon',
    removeIds: ['go-seul-yemek']
  },
  {
    topic: 'Milano Gastronomi',
    keepId: 'it-14',
    removeIds: ['go-milano-yemek']
  },
  {
    topic: 'Nice Gastronomi',
    keepId: 'fr-13',
    removeIds: ['go-nice-yemek']
  },
  {
    topic: 'Münih Gastronomi',
    keepId: 'de-14',
    removeIds: ['go-munih-yemek']
  },
  {
    topic: 'Brüksel Gastronomi',
    keepId: 'be-c-2',
    removeIds: ['go-bruksel-yemek']
  },
  {
    topic: 'New Orleans Gastronomi',
    keepId: 'us-09',
    removeIds: ['go-new-orleans-yemek']
  },
  {
    topic: 'Saraybosna Gastronomi',
    keepId: 'blk-ba-3',
    removeIds: ['go-saraybosna-yemek']
  },
  {
    topic: 'Amritsar Gastronomi',
    keepId: 'in-dp-10',
    removeIds: ['go-amritsar-yemek']
  },
  {
    topic: 'Hanoi Gastronomi',
    keepId: 'vn-dp-2',
    removeIds: ['go-hanoi-yemek']
  },
  {
    topic: 'Madrid Gastronomi',
    keepId: 'es-c-1',
    removeIds: ['go-madrid-yemek']
  },
  {
    topic: 'Kyoto Gastronomi',
    keepId: 'jp-c-7',
    removeIds: ['go-kyoto-yemek']
  },
  {
    topic: 'New York Gastronomi',
    keepId: 'us-c-4',
    removeIds: ['go-new-york-yemek']
  },
  {
    topic: 'Pekin Gastronomi',
    keepId: 'cn-c-2',
    removeIds: ['go-pekin-yemek']
  },
  {
    topic: 'Şanghay Gastronomi',
    keepId: 'cn-c-3',
    removeIds: ['go-sanghay-yemek']
  }
];

const idsToRemove = new Set();
let mergedCount = 0;

for (const cluster of MERGE_CLUSTERS) {
  const keepPlace = placesById.get(cluster.keepId);
  if (!keepPlace) {
    console.warn(`[UYARI] keepId bulunamadı: ${cluster.keepId} (${cluster.topic})`);
    continue;
  }

  for (const remId of cluster.removeIds) {
    const remPlace = placesById.get(remId);
    if (!remPlace) {
      console.warn(`[UYARI] removeId bulunamadı: ${remId} (${cluster.topic})`);
      continue;
    }

    // Merge attributes safely
    if (!keepPlace.coverImage && remPlace.coverImage) {
      keepPlace.coverImage = remPlace.coverImage;
    }
    if (remPlace.visited) {
      keepPlace.visited = true;
    }
    if (remPlace.userNotes && !keepPlace.userNotes) {
      keepPlace.userNotes = remPlace.userNotes;
    }
    if (remPlace.userPhotos && remPlace.userPhotos.length > 0) {
      keepPlace.userPhotos = Array.from(new Set([...(keepPlace.userPhotos || []), ...remPlace.userPhotos]));
    }
    if (remPlace.highlights && (!keepPlace.highlights || keepPlace.highlights.length === 0)) {
      keepPlace.highlights = remPlace.highlights;
    }
    if (remPlace.localSpecialties && !keepPlace.localSpecialties) {
      keepPlace.localSpecialties = remPlace.localSpecialties;
    }

    idsToRemove.add(remId);
    mergedCount++;
    console.log(`✓ Birleştirildi: [${cluster.topic}] "${remPlace.name}" (${remId}) --> "${keepPlace.name}" (${keepPlace.id})`);
  }
}

const cleanedPlaces = places.filter((p) => !idsToRemove.has(p.id));

console.log(`\n========================================`);
console.log(`Eski Mekan Sayısı: ${places.length}`);
console.log(`Temizlenen / Birleştirilen Mükerrer: ${idsToRemove.size}`);
console.log(`Yeni Mekan Sayısı: ${cleanedPlaces.length}`);
console.log(`========================================\n`);

fs.writeFileSync(placesPath, JSON.stringify(cleanedPlaces, null, 2), 'utf8');
console.log('✅ public/data/places.json başarıyla güncellendi.');
