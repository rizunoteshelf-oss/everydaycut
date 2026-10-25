// EverydayCut Progressive Web App Service Worker (Two-Tier Offline Engine)
const CACHE_NAME = 'everydaycut-core-v1';

// Tier 1 Core App Shell & Static Runtime Assets
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
  '/samples/portrait.jpg',
  '/samples/signature.jpg',
  '/samples/sneakers.jpg',
  '/samples/watch.jpg',
  '/samples/car.jpg',
  '/wasm/ort-wasm-simd-threaded.jsep.mjs',
  '/wasm/ort-wasm-simd-threaded.jsep.wasm',
  '/wasm/ort-wasm-simd-threaded.mjs',
  '/wasm/ort-wasm-simd-threaded.wasm',
];

// Install Event: Pre-cache App Shell & Runtime
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use catch on each to avoid failing if a single asset is in-flight
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Precache failed for ${url}:`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear obsolete cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate / Cache-First
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET and cross-origin tracking/analytics requests
  if (event.request.method !== 'GET') return;
  if (!url.origin.includes(self.location.origin) && !url.hostname.includes('huggingface.co')) {
    return;
  }

  // 1. WASM & Large Static Binaries: Cache-First
  if (url.pathname.includes('/wasm/') || url.pathname.endsWith('.wasm')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 2. Navigation Requests: Network-first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 3. App Shell & Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
