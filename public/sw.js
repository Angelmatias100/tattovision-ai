const CACHE_NAME = 'tattoovision-v1';

const PRECACHE_ASSETS = [
  '/manifest.json',
  '/logo.jpeg',
];

// ── Install: precache static shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: clear old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for API/auth, cache-first for static assets ──────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Never intercept navigation requests — Safari iOS rejects redirect responses from SW
  if (event.request.mode === 'navigate') return;

  const url = new URL(request.url);

  // Skip Clerk auth endpoints, API routes, and cross-origin requests
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/sign-in') ||
    url.pathname.startsWith('/sign-up')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      // Return cached response immediately, revalidate in background
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached); // Offline fallback: serve from cache

      return cached || networkFetch;
    })
  );
});
