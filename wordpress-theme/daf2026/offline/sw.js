const CACHE_PREFIX = "daf2026-offline-";
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const OFFLINE_URLS = ["/offline.html", "/en/offline.html"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  if (/^\/(?:wp-admin(?:\/|$)|wp-login\.php$|wp-json(?:\/|$)|wp-cron\.php$|xmlrpc\.php$)/i.test(path) || url.searchParams.has("rest_route")) return;
  if (path === "/sw.js" || path === "/offline.html" || path === "/en/offline.html") return;

  event.respondWith(fetch(request).catch(async () => {
    const cache = await caches.open(CACHE_NAME);
    const fallback = await cache.match(path === "/en" || path.startsWith("/en/") ? "/en/offline.html" : "/offline.html");
    return fallback || Response.error();
  }));
});
