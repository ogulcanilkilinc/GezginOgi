// Typo-tolerant search: Turkish-insensitive ("istanbul" finds "İstanbul",
// "cesme" finds "Çeşme") and forgiving of small typos ("kapadoya" finds "Kapadokya").

export function normalizeText(s) {
  return (s || '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Levenshtein distance with an early exit once it exceeds max
function withinDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return false;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return false;
    prev = cur;
  }
  return prev[b.length] <= max;
}

const allowedTypos = (len) => (len >= 8 ? 2 : len >= 4 ? 1 : 0);

export function buildSearchIndex(place) {
  const key = normalizeText([place.name, place.city, place.country, place.subRegion].join(' '));
  const body = normalizeText([place.whatAwaits, place.localSpecialties, place.blogArticle].join(' '));
  return { key, body, words: [...new Set(key.split(' ').filter((w) => w.length >= 3))] };
}

// Every query word must match: exactly anywhere in the text, or with a small typo in the name/city/country words
export function matchesSearch(index, query) {
  const terms = normalizeText(query).split(' ').filter(Boolean);
  if (terms.length === 0) return true;
  return terms.every((t) => {
    if (index.key.includes(t) || index.body.includes(t)) return true;
    const max = allowedTypos(t.length);
    if (max === 0) return false;
    return index.words.some((w) => withinDistance(t, w.slice(0, t.length + max), max) || withinDistance(t, w, max));
  });
}

// Place objects only change identity when edited, so the index is cached per object
const indexCache = new WeakMap();
export function getSearchIndex(place) {
  let idx = indexCache.get(place);
  if (!idx) {
    idx = buildSearchIndex(place);
    indexCache.set(place, idx);
  }
  return idx;
}
