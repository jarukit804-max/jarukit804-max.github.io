
const CACHE_NAME = 'hatyai-rescue-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('firebase')) {
    return; // don't cache firebase
  }
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request).then(r => {
      return caches.open(CACHE_NAME).then(cache => { cache.put(e.request, r.clone()); return r; });
    }).catch(()=>caches.match('/index.html')))
  );
});
