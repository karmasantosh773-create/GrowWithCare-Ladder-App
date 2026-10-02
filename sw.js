// GWC F&O Ladder Scan - service worker (basic app-shell caching, taaki phone
// par "app" jaisa fast khule, bina internet ke bhi shell dikhe - live data
// phir bhi internet se hi aayega)
const CACHE_NAME = "gwc-ladder-v1";
const SHELL_FILES = ["./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(SHELL_FILES); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  // Live data (Apps Script URL) hamesha network se mangwao, kabhi cache mat karo
  if (e.request.url.indexOf("script.google.com") >= 0) return;

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request);
    })
  );
});
