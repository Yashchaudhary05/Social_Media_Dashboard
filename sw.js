const CACHE_NAME = "sm-dashboard-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/data.json",
  "/manifest.json",
  "/images/favicon-32x32.png",
  "/images/icon-meta.svg",
  "/images/icon-instagram.svg",
  "/images/icon-x.svg",
  "/images/icon-youtube.svg",
  "/images/icon-linkedin.svg",
  "/images/icon-github.svg",
  "/images/icon-up.svg",
  "/images/icon-down.svg",
];

// Install — cache core assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
