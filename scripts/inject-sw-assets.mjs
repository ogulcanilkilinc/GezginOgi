// scripts/inject-sw-assets.mjs
// Injects all built Vite asset chunks into dist/sw.js so the Service Worker precaches 100% of JS, CSS, and data.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const assetsDir = path.resolve(distDir, 'assets');
const distSwPath = path.resolve(distDir, 'sw.js');
const publicSwPath = path.resolve(__dirname, '../public/sw.js');

if (!fs.existsSync(assetsDir)) {
  console.log('dist/assets not found, skipping sw injection.');
  process.exit(0);
}

const assetFiles = fs.readdirSync(assetsDir);
const assetUrls = assetFiles
  .filter((f) => f.endsWith('.js') || f.endsWith('.css'))
  .map((f) => `./assets/${f}`);

const basePrecache = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './data/places.json',
  './data/photos.json'
];

const fullPrecache = [...basePrecache, ...assetUrls];
const buildId = Date.now().toString(36);
const cacheName = `kesif-atlasim-build-${buildId}`;

console.log(`[SW Injection] Found ${assetUrls.length} build chunks. Total precache assets: ${fullPrecache.length}`);
console.log(`[SW Injection] Generating new Cache ID: ${cacheName}`);

function updateSwFile(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  let content = fs.readFileSync(targetPath, 'utf8');

  // 1. Replace CACHE_NAME with new build ID so stale chunk caches are automatically purged on activate
  content = content.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = '${cacheName}';`);

  // 2. Replace PRECACHE_URLS array
  const precacheStr = `const PRECACHE_URLS = ${JSON.stringify(fullPrecache, null, 2)};`;
  content = content.replace(/const PRECACHE_URLS = \[[\s\S]*?\];/, precacheStr);

  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`[SW Injection] Injected ${fullPrecache.length} assets & ${cacheName} into: ${path.basename(targetPath)}`);
}

updateSwFile(distSwPath);
updateSwFile(publicSwPath);
