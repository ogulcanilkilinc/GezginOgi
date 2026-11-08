import { ANKARA_PLACES } from './ankaraPlaces.js';
import { TURKIYE_PLACES } from './turkiyePlaces.js';
import { DUNYA_PLACES } from './dunyaPlaces.js';
import { EXTRA_PLACES } from './extraPlaces.js';
import { MORE_PLACES } from './morePlaces.js';
import { MEGA_COLLECTION } from './megaCollection.js';
import { MEGA_COLLECTION_2 } from './megaCollection2.js';
import { WORLD_MTP_FRONTIERS } from './worldMTPFrontiers.js';
import { WORLD_UNESCO_ASIA_AFRICA } from './worldUNESCOAsiaAfrica.js';
import { WORLD_UNESCO_AMERICAS_EUROPE } from './worldUNESCOAmericasEurope.js';
import { WORLD_MTP_3 } from './worldMTP3.js';
import { WORLD_MTP_4 } from './worldMTP4.js';
import { TURKIYE_ANKARA_EXPANSION } from './turkiyeAnkaraExpansion.js';
import { ENCYCLOPEDIA_EUROPE_1 } from './encyclopediaEurope1.js';
import { COUNTRY_DEEP_PACKS_1 } from './countryDeepPacks1.js';
import { COUNTRY_DEEP_PACKS_2 } from './countryDeepPacks2.js';
import { COUNTRY_DEEP_PACKS_3 } from './countryDeepPacks3.js';
import { TURKIYE_ANKARA_DEEP_PACK } from './turkiyeAnkaraDeepPack.js';
import { TURKIYE_81_IL_PART1 } from './turkiye81IlPart1.js';
import { TURKIYE_81_IL_PART2 } from './turkiye81IlPart2.js';
import { WORLD_ALL_COUNTRIES_ATLAS } from './worldAllCountriesAtlas.js';
import { BALKANLAR_NISAN_PACK } from './balkanlarNisanPack.js';
import { BALKANLAR_DEEP_PACK } from './balkanlarDeepPack.js';
import { EUROPE_DEEP_PACK } from './europeDeepPack.js';
import { AMERICAS_DEEP_PACK } from './americasDeepPack.js';
import { GEZGIN_OGI_PACK } from './gezginOgiPack.js';
import { resolveCuratedPhoto } from './curatedPhotoResolver.js';

export const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: '🌍', color: '#f59e0b', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'muze', label: 'Müze & Tarih', icon: '🏛️', color: '#8b5cf6', bg: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  { id: 'doga', label: 'Doğa & Manzara', icon: '🌲', color: '#10b981', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'restoran', label: 'Restoran & Lezzet', icon: '🍽️', color: '#f97316', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  { id: 'bar', label: 'Bar, Kafe & Gece', icon: '🍸', color: '#ec4899', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  { id: 'kultur', label: 'Sokak & Kültür', icon: '🧭', color: '#06b6d4', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { id: 'gizli', label: 'Gizli Cevher', icon: '📸', color: '#eab308', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
];

export const REGIONS = [
  { id: 'all', label: 'Tüm Dünya', flag: '🌐', center: [25.0, 20.0], zoom: 2, desc: 'Ankara, Türkiye (81 İl) ve Dünya (195 Ülke) genelindeki tüm keşif noktaları' },
  { id: 'ankara', label: 'Ankara', flag: '📍', center: [39.9208, 32.8541], zoom: 11, desc: 'Başkentin müzeleri, parkları, 25 ilçesi, lezzet durakları ve sosyal hayatı' },
  { id: 'turkiye', label: 'Türkiye (81 İl)', flag: '🇹🇷', center: [39.0, 35.2], zoom: 6, desc: '81 ilin tamamında antik kentler, kanyonlar, şelaleler ve gastronomi rotaları' },
  { id: 'balkanlar', label: 'Balkanlar (Nisan Özel)', flag: '🌸', center: [42.65, 19.65], zoom: 6, desc: 'Nisan ayı Balkanlar turu için şelaleler, Osmanlı köprüleri, fiyortlar ve gastronomi durakları' },
  { id: 'dunya', label: 'Dünya (195 Ülke)', flag: '✈️', center: [20.0, 15.0], zoom: 2, desc: '195 ülke, ülke başına 20-30+ ikonik nokta, MTP sınır adaları ve UNESCO Mirasları' },
];

export const SEASONS = [
  { id: 'ilkbahar', label: 'İlkbahar', icon: '🌸' },
  { id: 'yaz', label: 'Yaz', icon: '☀️' },
  { id: 'sonbahar', label: 'Sonbahar', icon: '🍂' },
  { id: 'kis', label: 'Kış', icon: '❄️' },
];

export const DURATIONS = [
  { id: 'all', label: '⏱️ Tüm Süreler' },
  { id: 'kisa', label: '⚡ Hızlı Keşif (1-3 Saat)' },
  { id: 'yarim', label: '🌤️ Yarım Gün (3-5 Saat)' },
  { id: 'tam', label: '🎒 Tam Gün / Hafta Sonu' },
];

export function extractLocationInfo(place) {
  let country = 'Türkiye';
  let city = 'Ankara';

  if (place.region === 'ankara') {
    country = 'Türkiye';
    if (place.city && place.city.includes(',')) {
      city = place.city.split(',')[0].trim();
    } else {
      city = 'Ankara';
    }
  } else if (place.region === 'turkiye') {
    country = 'Türkiye';
    // Extract province from "İl — Yer" or "İlçe, İl"
    if (place.name && place.name.includes('—')) {
      const prefix = place.name.split('—')[0].trim();
      if (prefix && prefix !== 'Türkiye' && prefix.length < 25) {
        city = prefix;
      }
    } else if (place.city && place.city.includes(',')) {
      const parts = place.city.split(',');
      const last = parts[parts.length - 1].trim();
      city = (last && last !== 'Türkiye') ? last : parts[0].trim();
    } else {
      city = place.city || 'İstanbul';
    }
  } else {
    // World places
    if (place.name && place.name.includes('—')) {
      const prefix = place.name.split('—')[0].trim();
      if (prefix && prefix.length > 1 && prefix.length < 35 && !prefix.includes('(')) {
        country = prefix;
      }
    } else if (
      place.country &&
      ![
        'Avrupa',
        'Asya',
        'Dünya Ülkeleri',
        'Asya Destinasyonları',
        'Küresel Rotalar',
        'Balkanlar & Doğu Avrupa',
        'İskandinavya & İzlanda',
        'Avusturya & İsviçre',
        'Hollanda & Belçika',
      ].includes(place.country)
    ) {
      country = place.country;
    } else if (place.city && place.city.includes(',')) {
      const parts = place.city.split(',');
      country = parts[parts.length - 1].trim();
    } else {
      country = place.subRegion || 'Uluslararası';
    }

    if (country === 'Bosna/Sırbistan Sınırı') country = 'Bosna-Hersek';

    // Extract city
    if (place.city) {
      if (place.city.includes(',')) {
        city = place.city.split(',')[0].trim();
      } else {
        city = place.city.trim();
      }
    } else {
      city = country;
    }
  }

  // Clean city from slashes
  if (city.includes('/')) {
    city = city.split('/')[0].trim();
  }

  return { country, city };
}

const allExtra = [
  ...EXTRA_PLACES,
  ...MORE_PLACES,
  ...MEGA_COLLECTION,
  ...MEGA_COLLECTION_2,
  ...TURKIYE_ANKARA_EXPANSION,
  ...TURKIYE_ANKARA_DEEP_PACK,
  ...TURKIYE_81_IL_PART1,
  ...TURKIYE_81_IL_PART2,
  ...WORLD_MTP_FRONTIERS,
  ...WORLD_UNESCO_ASIA_AFRICA,
  ...WORLD_UNESCO_AMERICAS_EUROPE,
  ...WORLD_MTP_3,
  ...WORLD_MTP_4,
  ...ENCYCLOPEDIA_EUROPE_1,
  ...COUNTRY_DEEP_PACKS_1,
  ...COUNTRY_DEEP_PACKS_2,
  ...COUNTRY_DEEP_PACKS_3,
  ...WORLD_ALL_COUNTRIES_ATLAS,
  ...BALKANLAR_NISAN_PACK,
  ...BALKANLAR_DEEP_PACK,
  ...EUROPE_DEEP_PACK,
  ...AMERICAS_DEEP_PACK,
  ...GEZGIN_OGI_PACK,
];

const extraAnkara = allExtra.filter((p) => p.region === 'ankara');
const extraTurkiye = allExtra.filter((p) => p.region === 'turkiye');
const extraDunya = allExtra.filter((p) => p.region === 'dunya');

const rawPlaces = [
  ...ANKARA_PLACES,
  ...extraAnkara,
  ...TURKIYE_PLACES,
  ...extraTurkiye,
  ...DUNYA_PLACES,
  ...extraDunya,
];

const BALKAN_COUNTRIES_SET = new Set([
  'Bosna-Hersek',
  'Bosna/Sırbistan Sınırı',
  'Karadağ',
  'Sırbistan',
  'Arnavutluk',
  'Kuzey Makedonya',
  'Kosova',
  'Hırvatistan',
  'Slovenya',
  'Bulgaristan',
  'Yunanistan',
  'Romanya',
]);

// Exact landmark slug extractor to merge multiple records of the same attraction
function extractLandmarkSlug(name) {
  const text = (name || '').toLowerCase();
  if (text.includes('anıtkabir')) return 'anitkabir';
  if (text.includes('anadolu medeniyetleri')) return 'anadolu-medeniyetleri';
  if (text.includes('çubuk karagöl') || text.includes('cubuk karagol')) return 'cubuk-karagol';
  if (text.includes('machu picchu')) return 'machu-picchu';
  if (text.includes('kurtarıcı isa') || text.includes('cristo redentor')) return 'cristo-redentor';
  if (text.includes('chichén itzá') || text.includes('chichen itza')) return 'chichen-itza';
  if (text.includes('zermatt') || text.includes('matterhorn')) return 'zermatt-matterhorn';
  if (text.includes('giethoorn')) return 'giethoorn';
  if (text.includes('lahey') || text.includes('den haag')) return 'den-haag';
  if (text.includes('plitvice')) return 'plitvice-lakes';
  if (text.includes('prag') && (text.includes('karl köprüsü') || text.includes('charles bridge'))) return 'prague-charles-bridge';
  if (text.includes('prag') && (text.includes('astronomik saat') || text.includes('eski şehir'))) return 'prague-astronomical-clock';
  if (text.includes('prag kalesi') || text.includes('prague castle')) return 'prague-castle';
  if (text.includes('kotor') && (text.includes('fiyort') || text.includes('körfez') || text.includes('kale'))) return 'kotor-bay';
  if (text.includes('mostar') && text.includes('köprü')) return 'mostar-bridge';
  if (text.includes('blagaj') && (text.includes('tekke') || text.includes('alperenler'))) return 'blagaj-tekke';
  if (text.includes('kravice')) return 'kravice-waterfalls';
  if (text.includes('altınköy')) return 'altinkoy';
  if (text.includes('rahmi m. koç') && text.includes('ankara')) return 'rahmi-koc-ankara';
  if (text.includes('ulucanlar')) return 'ulucanlar';
  if (text.includes('i. tbmm') || text.includes('kurtuluş savaşı müzesi')) return 'tbmm-1';
  if (text.includes('ii. tbmm') || text.includes('cumhuriyet müzesi')) return 'tbmm-2';
  if (text.includes('eymir')) return 'eymir-golu';
  if (text.includes('seğmenler')) return 'segmenler-parki';
  if (text.includes('atakule')) return 'atakule';
  if (text.includes('kocatepe camii')) return 'kocatepe-camii';
  if (text.includes('cermodern')) return 'cermodern';
  if (text.includes('cso ada')) return 'cso-ada';
  if (text.includes('gordion')) return 'gordion';
  if (text.includes('beypazarı')) return 'beypazari';
  if (text.includes('nallıhan')) return 'nallihan';
  if (text.includes('kızılcahamam soğuksu')) return 'kizilcahamam-soguksu';
  if (text.includes('tuz gölü') && (text.includes('ankara') || text.includes('şereflikoçhisar'))) return 'tuz-golu-ankara';
  return null;
}

function cleanTitle(name) {
  let clean = (name || '').toLowerCase();
  if (clean.includes('—')) clean = clean.split('—')[1].trim();
  if (clean.includes(':')) clean = clean.split(':')[0].trim();
  return clean.replace(/[\(\)\[\],.'’"“”-]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Deduplicate by ID, landmark slug, and coordinate match, while preserving the richest description
const dedupedList = [];
const seenIds = new Set();

rawPlaces.forEach((p) => {
  if (!p || !p.id || !p.coords || p.coords.length !== 2) return;
  if (seenIds.has(p.id)) return;
  seenIds.add(p.id);

  const [pLat, pLng] = p.coords;
  const pSlug = extractLandmarkSlug(p.name);
  const pTitle = cleanTitle(p.name);

  const matchIdx = dedupedList.findIndex((item) => {
    const [iLat, iLng] = item.coords;
    const dLat = Math.abs(pLat - iLat);
    const dLng = Math.abs(pLng - iLng);
    const iSlug = extractLandmarkSlug(item.name);

    // 1. If both match the same curated landmark slug
    if (pSlug && iSlug && pSlug === iSlug) return true;

    // 2. Exact coordinates match (< 100 meters) AND titles match
    if (dLat < 0.001 && dLng < 0.001) {
      const iTitle = cleanTitle(item.name);
      if (pTitle === iTitle || pTitle.includes(iTitle) || iTitle.includes(pTitle)) {
        return true;
      }
    }

    return false;
  });

  if (matchIdx !== -1) {
    // Keep the version with more detailed text and blog content
    const existing = dedupedList[matchIdx];
    const pScore = (p.blogArticle?.length || 0) + (p.highlights?.length || 0) * 60 + (p.whatAwaits?.length || 0);
    const eScore = (existing.blogArticle?.length || 0) + (existing.highlights?.length || 0) * 60 + (existing.whatAwaits?.length || 0);

    if (pScore > eScore) {
      dedupedList[matchIdx] = {
        ...existing,
        ...p,
        checklist: existing.checklist?.length ? existing.checklist : p.checklist
      };
    }
  } else {
    dedupedList.push(p);
  }
});

export const INITIAL_PLACES = dedupedList.map((p) => {
  const { country, city } = extractLocationInfo(p);
  const curatedImage = resolveCuratedPhoto({ ...p, country, city });

  return {
    ...p,
    visited: false,
    visitedDate: '',
    favorite: false,
    country,
    city,
    coverImage: curatedImage,
    isBalkan: BALKAN_COUNTRIES_SET.has(country) || p.subRegion === 'Balkanlar (Nisan Özel)',
  };
});
