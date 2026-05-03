const CACHE_VERSION = 'shimechamhoc-v2.0.0-rc1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const results = await Promise.allSettled(APP_SHELL.map(asset => cache.add(asset)));
    const failed = results
      .map((result, index) => ({ result, asset: APP_SHELL[index] }))
      .filter(item => item.result.status === 'rejected');

    if (failed.length) {
      console.warn('[ShimeChamhoc SW] Some app-shell assets failed to cache:', failed.map(item => item.asset));
    }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('./index.html');
          return cached || new Response('<!doctype html><meta charset="utf-8"><title>Offline</title><body>Ứng dụng chưa có cache offline. Hãy mở lại khi có mạng.</body>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.status === 200 && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      throw error;
    }
  })());
});
