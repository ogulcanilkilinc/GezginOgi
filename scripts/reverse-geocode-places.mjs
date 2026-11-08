// Looks up which country / province each place's coordinates fall in (OpenStreetMap Nominatim),
// so places whose pin sits in the wrong country or province can be found.
// Respects Nominatim's policy: 1 request per second, identifying User-Agent, cached results.
// Output: scripts/.cache/reverse-geocode.json ({ placeId: { country, cc, province } })
import fs from 'fs';

const UA = 'GezginOgi/1.0 (https://github.com/ogulcanilkilinc/GezginOgi; data check)';
const CACHE = 'scripts/.cache/reverse-geocode.json';
fs.mkdirSync('scripts/.cache', { recursive: true });
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const places = JSON.parse(fs.readFileSync('public/data/places.json', 'utf8'));

let done = 0;
for (const p of places) {
  done++;
  if (cache[p.id] && cache[p.id].key === p.coords.join(',')) continue;
  const [lat, lon] = p.coords;
  let res = null;
  for (let i = 0; i < 4 && !res; i++) {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=8&accept-language=tr`,
        { headers: { 'User-Agent': UA } }
      );
      if (r.status === 429) { await sleep(5000); continue; }
      res = await r.json();
    } catch (e) {
      await sleep(3000);
    }
  }
  const a = res?.address || {};
  cache[p.id] = {
    key: p.coords.join(','),
    country: a.country || null,
    cc: a.country_code || null,
    province: a.province || a.state || null,
    error: res?.error || null
  };
  if (done % 50 === 0) {
    fs.writeFileSync(CACHE, JSON.stringify(cache));
    console.log(`${done}/${places.length}`);
  }
  await sleep(1100);
}
fs.writeFileSync(CACHE, JSON.stringify(cache));
console.log('bitti');
