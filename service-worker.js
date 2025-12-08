// 🔁 Bump this when you deploy a new version:
const CACHE_NAME = "northern-path-v2";

const OFFLINE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./skyrim-map.jpg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
  // If you add more local images/audio later, add them here.
];

// Install: pre-cache core assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch handler: cache-first for same-origin, with runtime caching
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== "GET") return;

  // Runtime caching for Google Fonts (cross-origin)
  if (url.origin.includes("fonts.googleapis.com") || url.origin.includes("fonts.gstatic.com")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        fetch(req)
          .then(res => {
            cache.put(req, res.clone());
            return res;
          })
          .catch(() => caches.match(req))
      )
    );
    return;
  }

  // Only cache same-origin requests from your site
  if (url.origin !== self.location.origin) return;

  // For navigation: offline fallback to index.html
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Cache-first for other same-origin GET requests
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req));
    })
  );
});
