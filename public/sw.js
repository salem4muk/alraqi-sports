const CACHE_VERSION = "alraqi-sports-v23";
const APP_SHELL = [
  "/index.html",
  "/manifest.json?v=next-22",
  "/css/main.css?v=next-32",
  "/css/player.css?v=next-21",
  "/css/responsive.css?v=next-31",
  "/js/app.js?v=next-49",
  "/js/api.js?v=next-36",
  "/js/channels.js?v=next-26",
  "/js/i18n.js?v=next-22",
  "/js/matches.js?v=next-36",
  "/js/player.js?v=next-24",
  "/js/search.js?v=next-21",
  "/js/standings.js?v=next-23",
  "/js/teams.js?v=next-21",
  "/languages/ar.json?v=next-22",
  "/languages/teams.json",
  "/assets/icons/app-icon-192.png",
  "/assets/icons/app-icon-512.png",
  "/assets/icons/favicon-32.png",
  "/assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_VERSION)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/index.html")));
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") return response;
        const responseToCache = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, responseToCache));
        return response;
      });
    })
  );
});
