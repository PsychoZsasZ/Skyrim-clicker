// Bump this when you deploy a new build
const CACHE_NAME = "northern-path-v1";

const OFFLINE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./skyrim-map.jpg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

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

self.addEventListener("fetch", event => {
  const req = event.request;

  // Only handle same-origin GET requests
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req)
        .then(res => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          return res;
        })
        .catch(() => {
          // If it's a navigation request and we're offline, fallback to index.html
          if (req.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
