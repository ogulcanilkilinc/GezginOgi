const esbuild = require('./node_modules/esbuild');
const fs = require('fs');

async function run() {
  await esbuild.build({
    entryPoints: ['./src/data/initialPlaces.js'],
    bundle: true,
    platform: 'node',
    outfile: './temp-bundle.cjs',
    format: 'cjs'
  });

  const { INITIAL_PLACES } = require('./temp-bundle.cjs');
  console.log('Total places:', INITIAL_PLACES.length);

  // 1. Photo analysis
  const photoMap = new Map();
  INITIAL_PLACES.forEach(p => {
    const img = p.coverImage || 'NO_IMAGE';
    if (!photoMap.has(img)) photoMap.set(img, []);
    photoMap.get(img).push(p);
  });
  console.log('Unique photos count:', photoMap.size);
  const sortedPhotos = Array.from(photoMap.entries()).sort((a,b) => b[1].length - a[1].length);
  console.log('\nTop 15 most reused photos:');
  sortedPhotos.slice(0, 15).forEach(([url, list]) => {
    console.log(`${list.length} places share: ${url}`);
    console.log('  Examples:', list.slice(0, 5).map(p => `${p.name} (${p.city || p.country})`).join(', '));
  });

  // 2. Duplicate detection
  console.log('\n=== DUPLICATE ANALYSIS ===');
  // Exact or near coordinates (< 1km)
  const coordMatches = [];
  for (let i = 0; i < INITIAL_PLACES.length; i++) {
    for (let j = i + 1; j < INITIAL_PLACES.length; j++) {
      const p1 = INITIAL_PLACES[i], p2 = INITIAL_PLACES[j];
      const dLat = Math.abs(p1.coords[0] - p2.coords[0]);
      const dLng = Math.abs(p1.coords[1] - p2.coords[1]);
      if (dLat < 0.003 && dLng < 0.003) {
        coordMatches.push({ p1, p2, dLat, dLng });
      }
    }
  }
  console.log('Coordinate duplicates (< 300-500m):', coordMatches.length);
  coordMatches.forEach(m => {
    console.log(`[Coord match] "${m.p1.name}" (${m.p1.id}) <--> "${m.p2.name}" (${m.p2.id}) [${m.p1.coords}]`);
  });

  // Name duplicates
  const nameMap = new Map();
  INITIAL_PLACES.forEach(p => {
    // Normalize: remove prefix like "Peru — ", lowercase, clean punctuation
    let clean = p.name.toLowerCase();
    if (clean.includes('—')) clean = clean.split('—')[1].trim();
    if (clean.includes(':')) clean = clean.split(':')[0].trim();
    clean = clean.replace(/[\(\)\[\],.'’"“”-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!nameMap.has(clean)) nameMap.set(clean, []);
    nameMap.get(clean).push(p);
  });

  console.log('\n=== NAME DUPLICATES ===');
  for (const [name, list] of nameMap.entries()) {
    if (list.length > 1 && name.length > 3) {
      console.log(`[Name match x${list.length}] "${name}":`, list.map(p => `${p.name} (${p.id})`).join(' | '));
    }
  }

  fs.unlinkSync('./temp-bundle.cjs');
}

run().catch(console.error);
