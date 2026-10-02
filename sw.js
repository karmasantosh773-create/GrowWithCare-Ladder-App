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

// 02 Oct 2026 FIX: pehle "cache-first" tha - matlab ek baar cache hone ke
// baad, naya deploy karne par bhi PURANA hi dikhta rehta tha (jab tak
// user khud hard-refresh na kare). Ab "network-first" - hamesha pehle
// internet se naya mangwao, sirf OFFLINE hone par hi purana cache dikhao.
self.addEventListener("fetch", function (e) {
  // Live data (Apps Script URL) hamesha network se mangwao, kabhi cache mat karo
  if (e.request.url.indexOf("script.google.com") >= 0) return;

  e.respondWith(
    fetch(e.request).then(function (fresh) {
      var copy = fresh.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, copy); });
      return fresh;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});
