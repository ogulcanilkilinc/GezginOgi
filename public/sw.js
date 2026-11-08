// public/sw.js
// Service Worker for Keşif Atlasım - Robust Offline PWA Support
// Automatically precaches all compiled JS chunks, CSS, fonts, and data for seamless offline usage.

const CACHE_NAME = 'kesif-atlasim-build-mw7nztvt';

// Precache list - dynamically populated with all build chunks by inject-sw-assets.mjs
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./favicon.svg",
  "./manifest.json",
  "./data/places.json",
  "./data/photos.json",
  "./assets/BorderCrossingsModal-D1NVJcXr.js",
  "./assets/CloudSyncModal-CglMXPyT.js",
  "./assets/CountryIntelModal-Cabz46hg.js",
  "./assets/CurrencyBudgetModal-NlfjDVH_.js",
  "./assets/EmergencyConsulateModal-BhQ_tacL.js",
  "./assets/icons-vendor-dXrqPX5M.js",
  "./assets/index-C90xQoP3.css",
  "./assets/index-D-5avNwu.js",
  "./assets/ItineraryModal-CaBbKsLr.js",
  "./assets/leaflet-vendor-jaox9G8N.js",
  "./assets/NearbyRadarModal-1nkC0Nei.js",
  "./assets/PackingChecklistModal-bpKYFjJm.js",
  "./assets/PassportModal-D-PnmxXX.js",
  "./assets/PlaceFormModal-Dtk2TrFE.js",
  "./assets/RouteSimulatorModal-D5UfPt--.js",
  "./assets/ScratchMapModal-DMteUCmA.js",
  "./assets/SearchableLocationModal-ZxpoJXDt.js",
  "./assets/SeasonalCalendarModal-COaEAbsd.js",
  "./assets/TravelSoundtrackModal-EmY9PbfN.js"
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

  // 1a. Places JSON: Stale-While-Revalidate with search query normalization (?v= stripped)
  if (url.pathname.includes('/data/places.json')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cleanUrl = getNormalizedUrl(req.url);
        const cachedResponse =
          (await cache.match(cleanUrl)) ||
          (await cache.match('./data/places.json')) ||
          (await cache.match(req, { ignoreSearch: true }));

        const networkFetch = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(cleanUrl, networkResponse.clone());
              cache.put('./data/places.json', networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // 1b. Photos JSON: Stale-While-Revalidate strictly isolated (never fallbacks to places.json!)
  if (url.pathname.includes('/data/photos.json')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cleanUrl = getNormalizedUrl(req.url);
        const cachedResponse =
          (await cache.match(cleanUrl)) ||
          (await cache.match('./data/photos.json')) ||
          (await cache.match(req, { ignoreSearch: true }));

        const networkFetch = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(cleanUrl, networkResponse.clone());
              cache.put('./data/photos.json', networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || new Response('{}', { headers: { 'Content-Type': 'application/json' } }));

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
