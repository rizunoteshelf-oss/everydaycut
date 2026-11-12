// EverydayCut Progressive Web App Service Worker (Two-Tier Offline Engine)
const CACHE_NAME = 'everydaycut-core-v2';

// Tier 1 Core App Shell & UI Static Assets (Zero heavy WASM in initial precache)
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
];

// Install Event: Pre-cache App Shell & Runtime (<500 KB total payload)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Precache skipped for ${url}:`, err);
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

// Fetch Event: Intelligent Strategy Routing
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET and cross-origin tracking/analytics requests
  if (event.request.method !== 'GET') return;
  if (!url.origin.includes(self.location.origin) && !url.hostname.includes('huggingface.co')) {
    return;
  }

  // 1. WASM Binaries & Hugging Face Neural Weights: Runtime Cache-First
  // Downloaded on-demand when tool runs, then persisted offline
  if (
    url.pathname.includes('/wasm/') ||
    url.pathname.endsWith('.wasm') ||
    url.pathname.endsWith('.onnx') ||
    url.hostname.includes('huggingface.co')
  ) {
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
