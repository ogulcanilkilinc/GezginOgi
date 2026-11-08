// public/sw.js
// Service Worker for Keşif Atlasım - Robust Offline PWA Support
// Automatically precaches all compiled JS chunks, CSS, fonts, and data for seamless offline usage.

const CACHE_NAME = 'kesif-atlasim-cache-v2';

// Precache list - dynamically populated with all build chunks by inject-sw-assets.mjs
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./favicon.svg",
  "./manifest.json",
  "./data/places.json",
  "./data/photos.json",
  "./assets/BorderCrossingsModal-BbVccx4V.js",
  "./assets/CloudSyncModal-igpopOeZ.js",
  "./assets/CountryIntelModal-Bx-POMaX.js",
  "./assets/CurrencyBudgetModal-DgEp2MnM.js",
  "./assets/EmergencyConsulateModal-BCv3vESs.js",
  "./assets/icons-vendor-dXrqPX5M.js",
  "./assets/index-Dbcho-mn.css",
  "./assets/index-DUlj7DQm.js",
  "./assets/ItineraryModal-MqXn0x6g.js",
  "./assets/leaflet-vendor-jaox9G8N.js",
  "./assets/NearbyRadarModal-C_x_AVyF.js",
  "./assets/PackingChecklistModal-CEDvQODI.js",
  "./assets/PassportModal-Bry9jVBs.js",
  "./assets/PlaceFormModal-CM7yiC4V.js",
  "./assets/RouteSimulatorModal-CR2ApV-Q.js",
  "./assets/ScratchMapModal-DWBax4LI.js",
  "./assets/SearchableLocationModal-CQD6Km0q.js",
  "./assets/SeasonalCalendarModal-quTcgRWL.js",
  "./assets/TravelSoundtrackModal-C2ijpGLI.js"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Precaching assets for offline usage...');
      // Best-effort precaching; do not fail install if an optional asset is not yet available
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Precache skipped for:', url, err.message);
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

// Helper: Normalize URL by stripping query parameters (?v=...)
function getNormalizedUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    return `${u.origin}${u.pathname}`;
  } catch (e) {
    return urlStr.split('?')[0];
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests with HTTP/HTTPS schemes
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Places & Photos JSON: Stale-While-Revalidate with search query normalization (?v= stripped)
  if (url.pathname.includes('/data/places.json') || url.pathname.includes('/data/photos.json')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cleanUrl = getNormalizedUrl(req.url);
        const isPhotos = url.pathname.includes('/data/photos.json');

        // Look up using normalized URL or with ignoreSearch; never cross-fallback photos to places!
        const cachedResponse =
          (await cache.match(cleanUrl)) ||
          (await cache.match(req, { ignoreSearch: true })) ||
          (isPhotos ? (await cache.match('./data/photos.json')) : (await cache.match('./data/places.json'))) ||
          (isPhotos ? new Response('[]', { headers: { 'Content-Type': 'application/json' } }) : null);

        const networkFetch = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              // Store normalized so duplicates with ?v= are never stored
              cache.put(cleanUrl, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // 2. Navigation (HTML document): Network-first with fast 1.2s timeout -> Fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      new Promise((resolve) => {
        let timedOut = false;
        const timeoutId = setTimeout(async () => {
          timedOut = true;
          const fallback =
            (await caches.match('./index.html')) ||
            (await caches.match('/index.html')) ||
            (await caches.match(req, { ignoreSearch: true }));
          if (fallback) resolve(fallback);
        }, 1200);

        fetch(req)
          .then(async (networkResponse) => {
            clearTimeout(timeoutId);
            if (networkResponse && networkResponse.status === 200) {
              const cache = await caches.open(CACHE_NAME);
              cache.put('./index.html', networkResponse.clone());
            }
            if (!timedOut) resolve(networkResponse);
          })
          .catch(async () => {
            clearTimeout(timeoutId);
            const fallback =
              (await caches.match('./index.html')) ||
              (await caches.match('/index.html')) ||
              (await caches.match(req, { ignoreSearch: true }));
            resolve(fallback);
          });
      })
    );
    return;
  }

  // 3. Static Assets (.js, .css, .woff2, .svg, .png, .jpg): Cache-First
  const isStaticAsset =
    url.pathname.includes('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.hostname.includes('fonts.');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(async (cached) => {
        if (cached) return cached;

        try {
          const networkResponse = await fetch(req);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // In offline mode, attempt matching by clean pathname
          const clean = getNormalizedUrl(req.url);
          const fallback = await caches.match(clean, { ignoreSearch: true });
          return fallback || null;
        }
      })
    );
    return;
  }

  // 4. Fallback for all other GET requests: Cache with Network Fallback
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      return (
        cached ||
        fetch(req)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
              const cache = await caches.open(CACHE_NAME);
              cache.put(req, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null)
      );
    })
  );
});
