// public/sw.js
// Service Worker for GezginOgi - Robust Offline PWA Support
// Automatically precaches all compiled JS chunks, CSS, fonts, and data for seamless offline usage.

const CACHE_NAME = 'gezginogi-build-mwc2ga8o';

// Map tiles the user has looked at are kept in their own cache, which survives new builds,
// so recently viewed areas still show a map offline
const TILE_CACHE = 'gezginogi-tiles-v1';
const TILE_LIMIT = 600;

// Precache list - dynamically populated with all build chunks by inject-sw-assets.mjs
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./favicon.svg",
  "./manifest.json",
  "./data/places.json",
  "./assets/BorderCrossingsModal-CrWZJCCc.js",
  "./assets/CloudSyncModal-Dkn1eE5a.js",
  "./assets/CountryIntelModal-CH0iLRic.js",
  "./assets/CurrencyBudgetModal-DFzxEFal.js",
  "./assets/EmergencyConsulateModal-DBU_mqXv.js",
  "./assets/icons-vendor-DrESObBc.js",
  "./assets/index-DuiBz7mI.js",
  "./assets/index-ttJuyVO6.css",
  "./assets/ItineraryModal-BR6-BVGJ.js",
  "./assets/leaflet-vendor-Dy36dnF4.js",
  "./assets/NearbyRadarModal-OJGd3rx7.js",
  "./assets/PackingChecklistModal-c3b4DdRg.js",
  "./assets/PassportModal-BLFp7SJ-.js",
  "./assets/PlaceFormModal-CDfW5q2U.js",
  "./assets/RouteSimulatorModal-DdaSls1h.js",
  "./assets/ScratchMapModal-BiWTkXcu.js",
  "./assets/SearchableLocationModal-DDYDmyye.js",
  "./assets/SeasonalCalendarModal-RbO55gvg.js",
  "./assets/TravelSoundtrackModal-D70i_-3g.js"
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
          .filter((name) => name !== CACHE_NAME && name !== TILE_CACHE)
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

  // 0. Freshness checks (?_t=...) always go to the network, never to the cache
  if (url.searchParams.has('_t')) {
    return;
  }

  // 0b. OpenStreetMap tiles: cache-first. The tile is fetched as a CORS request so the stored
  // response is a normal one (an opaque response would be charged megabytes of quota).
  if (url.hostname === 'tile.openstreetmap.org') {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(req.url);
        if (cached) return cached;
        try {
          const res = await fetch(req.url, { mode: 'cors', credentials: 'omit' });
          if (res.ok) {
            cache.put(req.url, res.clone());
            // Now and then drop the oldest tiles so the cache stays around TILE_LIMIT entries
            if (Math.random() < 0.05) {
              cache.keys().then((keys) => {
                for (let i = 0; i < keys.length - TILE_LIMIT; i++) cache.delete(keys[i]);
              });
            }
          }
          return res;
        } catch (err) {
          return Response.error();
        }
      })
    );
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
