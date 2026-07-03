// StickAINote Service Worker
// v2 — Network-first for pages/data, cache-first ONLY for immutable hashed assets.
// The previous cache-first strategy served stale app bundles after new deploys,
// which broke note saving and hid the Recover button on installed PWAs.

const CACHE_NAME = "stickanote-v2";

// App shell files to pre-cache for offline fallback
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
      // Individual failures shouldn't break install
      return Promise.allSettled(
        APP_SHELL.map((url) => cache.add(url).catch(() => {}))
      );
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate: clean ALL old caches (including stickanote-v1) and request persistent storage
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
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
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch strategy:
// - API routes: network-only (never cache user data)
// - /_next/static/: cache-first (content-hashed, immutable — safe to cache forever)
// - Navigations / pages / everything else: NETWORK-FIRST, cache fallback for offline
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Skip chrome-extension, data URLs, etc
  if (!url.protocol.startsWith("http")) return;

  // API routes: network-only with offline error response
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ error: "Offline" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          })
      )
    );
    return;
  }

  // Immutable Next.js build assets (content-hashed filenames): cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Pages and all other assets: NETWORK-FIRST so new deploys reach the client,
  // falling back to cache only when offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          // Offline fallback for navigation requests
          if (request.mode === "navigate") {
            return caches
              .match("/notes")
              .then((notes) => notes || caches.match("/"))
              .then(
                (page) => page || new Response("Offline", { status: 503 })
              );
          }
          return new Response("Offline", { status: 503 });
        })
      )
  );
});
