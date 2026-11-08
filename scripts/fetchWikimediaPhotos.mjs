// scripts/fetchWikimediaPhotos.mjs
// Automated Wikimedia Commons image matcher for all 1291 places in Keşif Atlasım.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.join(__dirname, '../gezi-haritam/src/data/wikimediaPhotoMap.json');

// Load initial places
const initialPlacesModule = await import('../gezi-haritam/src/data/initialPlaces.js');
const places = initialPlacesModule.INITIAL_PLACES;

console.log(`Loaded ${places.length} places to process.`);

// Load existing map if any (for resuming)
let photoMap = {};
if (fs.existsSync(outputFile)) {
  try {
    photoMap = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    console.log(`Resuming with ${Object.keys(photoMap).length} cached photo matches.`);
  } catch (e) {
    console.log('Starting fresh photo map.');
  }
}

function cleanTitleForSearch(place) {
  let raw = place.name || '';
  // strip prefixes like 'Kocaeli —', 'Ankara —', 'Vizesiz Balkanlar:'
  raw = raw.replace(/^[A-Za-zÇĞİÖŞÜçğıöşü\s]+[—:\-]\s*/, '');
  // strip parentheses & brackets
  raw = raw.replace(/\(.*?\)/g, '');
  raw = raw.replace(/\[.*?\]/g, '');

  // split on comma, &, /, ' ve ', ' ile ', ' and '
  const parts = raw
    .split(/[,&/]|(?:\s+ve\s+)|\s+ile\s+|\s+and\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const candidates = [];
  for (const part of parts) {
    if (part.length >= 3) {
      candidates.push(part);
      // Also try cleaning common descriptors like 'Kordonu', 'Müzesi'
      const simplified = part
        .replace(/\s+(Kordonu|Sahili|Yaylaları|Yaylası|Plajı|Koyu|Turu|Rotası|Konakları|Vadisi)$/i, '')
        .trim();
      if (simplified.length >= 3 && simplified !== part) {
        candidates.push(simplified);
      }
    }
  }

  const fullTrim = raw.trim();
  if (fullTrim.length >= 3 && !candidates.includes(fullTrim)) {
    candidates.push(fullTrim);
  }

  // Also try with city if candidate is short
  if (place.city && !candidates.some((c) => c.toLowerCase().includes(place.city.toLowerCase()))) {
    if (parts[0]) candidates.push(`${parts[0]} ${place.city}`);
  }

  return [...new Set(candidates)];
}

function isValidImage(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (
    lower.includes('flag_of_') ||
    lower.includes('coat_of_arms') ||
    lower.includes('emblem_of_') ||
    lower.includes('insignia') ||
    lower.includes('locator_map') ||
    lower.includes('in_turkey.svg') ||
    lower.includes('.svg')
  ) {
    return false;
  }
  return (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.webp') ||
    lower.includes('.jpg?') ||
    lower.includes('.jpeg?') ||
    lower.includes('.png?') ||
    lower.includes('.webp?')
  );
}

function upgradeImageUrl(rawImg) {
  if (!rawImg) return '';
  let cleanImg = rawImg;
  if (cleanImg.includes('/thumb/') && cleanImg.includes('/330px-')) {
    cleanImg = cleanImg.replace('/330px-', '/800px-');
  } else if (cleanImg.includes('/thumb/') && cleanImg.includes('/300px-')) {
    cleanImg = cleanImg.replace('/300px-', '/800px-');
  } else if (cleanImg.includes('/thumb/') && cleanImg.includes('/320px-')) {
    cleanImg = cleanImg.replace('/320px-', '/800px-');
  }
  return cleanImg;
}

async function queryWiki(term, lang = 'tr') {
  try {
    // 1. Try direct summary first (fastest)
    const directUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
    const directRes = await fetch(directUrl, {
      headers: { 'User-Agent': 'KesifAtlasimBot/1.0 (ogulcan@kesifatlasim.com)' }
    });
    if (directRes.ok) {
      const summary = await directRes.json();
      const rawImg = summary.thumbnail?.source || summary.originalimage?.source;
      if (isValidImage(rawImg)) {
        return {
          title: summary.title,
          imageUrl: upgradeImageUrl(rawImg),
          description: summary.description || '',
          wikiUrl: summary.content_urls?.desktop?.page || ''
        };
      }
    }

    // 2. Search fallback
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      term
    )}&utf8=&format=json&srlimit=2`;
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'KesifAtlasimBot/1.0 (ogulcan@kesifatlasim.com)' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const hits = data.query?.search;
    if (!hits || hits.length === 0) return null;

    for (const hit of hits) {
      const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        hit.title
      )}`;
      const sRes = await fetch(summaryUrl, {
        headers: { 'User-Agent': 'KesifAtlasimBot/1.0 (ogulcan@kesifatlasim.com)' }
      });
      if (!sRes.ok) continue;
      const summary = await sRes.json();
      const rawImg = summary.thumbnail?.source || summary.originalimage?.source;
      if (isValidImage(rawImg)) {
        return {
          title: summary.title,
          imageUrl: upgradeImageUrl(rawImg),
          description: summary.description || '',
          wikiUrl: summary.content_urls?.desktop?.page || ''
        };
      }
    }
  } catch (err) {
    // network retry / skip
  }
  return null;
}

async function processPlace(place) {
  if (photoMap[place.id]) {
    return photoMap[place.id];
  }

  const terms = cleanTitleForSearch(place);
  const primaryLang = place.region === 'dunya' ? 'en' : 'tr';
  const fallbackLang = place.region === 'dunya' ? 'tr' : 'en';

  for (const term of terms) {
    let result = await queryWiki(term, primaryLang);
    if (!result) {
      result = await queryWiki(term, fallbackLang);
    }
    if (result) {
      photoMap[place.id] = result;
      return result;
    }
  }

  return null;
}

// Run in parallel chunks
const CONCURRENCY = 8;
let processed = 0;
let matched = Object.keys(photoMap).length;

console.log('Starting parallel Wikimedia batch matching with refined queries...');

for (let i = 0; i < places.length; i += CONCURRENCY) {
  const chunk = places.slice(i, i + CONCURRENCY);
  await Promise.all(
    chunk.map(async (p) => {
      const res = await processPlace(p);
      processed++;
      if (res) matched++;
    })
  );

  if ((i + CONCURRENCY) % 40 === 0 || i + CONCURRENCY >= places.length) {
    fs.writeFileSync(outputFile, JSON.stringify(photoMap, null, 2), 'utf8');
    const pct = Math.round((processed / places.length) * 100);
    console.log(`Progress: ${processed}/${places.length} (${pct}%) — Total Matched Photos: ${matched}`);
  }

  await new Promise((r) => setTimeout(r, 80));
}

// Final write
fs.writeFileSync(outputFile, JSON.stringify(photoMap, null, 2), 'utf8');
console.log(`\n🎉 Wikimedia photo matching completed!`);
console.log(`Total places: ${places.length}, Total authentic Wikimedia photos matched: ${Object.keys(photoMap).length}`);
