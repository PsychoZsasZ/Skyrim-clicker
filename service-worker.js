const CACHE_NAME = "skyrim-cache-v1";
const ASSETS = [
  "index.html",
  "styles.css",      // if you have a separate CSS file
  "main.js",         // your JS bundle (or list each JS file)
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png"
  // add any other images / sounds / fonts you want cached
];

// Install: cache core files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: cleanup old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => (key === CACHE_NAME ? null : caches.delete(key)))
      )
    )
  );
});

// Fetch: serve from cache, fall back to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});