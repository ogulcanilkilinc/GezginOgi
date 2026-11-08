// public/sw.js
// Service Worker for Keşif Atlasım - Offline PWA Support
// Provides offline viewing of places, notes, travel journal, and maps when roaming or without data.

const CACHE_NAME = 'kesif-atlasim-cache-v1';

// Static core assets to pre-cache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './data/places.json',
  './data/photos.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Best-effort precaching; don't fail install if a non-critical file is missing
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Precache failed for:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests and http/https schemes
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Places & Photos JSON: Stale-While-Revalidate strategy
  // Serves instant cached copy, fetches latest in background and updates cache
  if (url.pathname.includes('/data/places.json') || url.pathname.includes('/data/photos.json')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(req, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 2. Navigation (HTML document): Network first, fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallback = await caches.match('./index.html') || await caches.match('/index.html');
          return fallback;
        })
    );
    return;
  }

  // 3. Static Assets (JS, CSS, Web Fonts, Images): Cache-first with network fallback
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            // Cache successful same-origin or font/tile assets
            if (url.origin === self.location.origin || url.hostname.includes('fonts.') || url.hostname.includes('unpkg.com')) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
          }
          return networkResponse;
        })
        .catch(() => {
          // Return nothing or let consumer handle offline
          return null;
        });
    })
  );
});
