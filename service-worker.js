// service-worker.js
// Sube CACHE_VERSION cada vez que publiques cambios para forzar la actualización
// en los celulares de los usuarios la próxima vez que abran la app con internet.
const CACHE_VERSION = 'vitalcard-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './dictionary.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first para el HTML/JS/CSS de la app (así ves cambios apenas los subas y haya internet).
// Cache-first para todo lo demás (funciona sin internet).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isCore = CORE_ASSETS.some((a) => req.url.endsWith(a.replace('./', '')));

  if (isCore) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
  } else {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
});
