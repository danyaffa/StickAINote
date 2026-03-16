// StickAINote Service Worker - Offline-first caching strategy

const CACHE_NAME = "stickanote-v1";

// App shell files to cache on install
const APP_SHELL = [
  "/",
  "/notes",
  "/manifest.json",
  "/StickAINote-Logo.png",
];

// Install: cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch(() => {
        // Individual failures shouldn't break install
        return Promise.allSettled(
          APP_SHELL.map((url) => cache.add(url).catch(() => {}))
        );
      });
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate: clean old caches and request persistent storage
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      ),
      // Request persistent storage so IndexedDB data survives restarts
      navigator.storage && navigator.storage.persist
        ? navigator.storage.persist().catch(() => {})
        : Promise.resolve(),
    ])
  );
  // Take control of all clients
  self.clients.claim();
});

// Fetch: Network-first for API, Cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension, data URLs, etc
  if (!url.protocol.startsWith("http")) return;

  // API routes: network-first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: "Offline" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  // Static assets and pages: cache-first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cache, but also update it in background
        event.waitUntil(
          fetch(request)
            .then((response) => {
              if (response.ok) {
                caches
                  .open(CACHE_NAME)
                  .then((cache) => cache.put(request, response));
              }
            })
            .catch(() => {})
        );
        return cached;
      }

      // Not in cache: fetch from network and cache it
      return fetch(request)
        .then((response) => {
          // Don't cache non-ok responses or opaque responses we can't inspect
          if (!response.ok) return response;

          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, clone));

          return response;
        })
        .catch(() => {
          // Offline fallback for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/notes") || caches.match("/");
          }
          return new Response("Offline", { status: 503 });
        });
    })
  );
});
