const CACHE_NAME = "daf2026-offline-v1";
const OFFLINE_URLS = ["offline.html", "en/offline.html"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => {
    const isEnglish = new URL(event.request.url).pathname.includes("/en/");
    return caches.match(isEnglish ? "en/offline.html" : "offline.html");
  }));
});
