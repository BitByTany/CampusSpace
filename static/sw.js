const C = "campusspace-v1", SHELL = ["/", "/css/style.css", "/js/app.js", "/manifest.webmanifest", "/icons/icon-192.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => clients.claim())));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.pathname.startsWith("/api/") || u.pathname.startsWith("/admin")) return; // live data is never cached
  e.respondWith(fetch(e.request).then(r => { caches.open(C).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request)));
});
