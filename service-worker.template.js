/* global __PRECACHE_URLS__ */
const CACHE_NAME = 'streamlist-shell-__CACHE_VERSION__';
const ROOT = new URL('./', self.location.href);
const URLS = __PRECACHE_URLS__.map((path) => new URL(path, ROOT).href);
const SHELL = new URL('index.html', ROOT).href;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS)));
  // An updated worker waits until the old app windows close, avoiding mixed builds.
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('streamlist-shell-') && name !== CACHE_NAME) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      // Use the shell from this worker's build for every React Router route.
      const cached = await (await caches.open(CACHE_NAME)).match(SHELL);
      return cached || fetch(request);
    })());
  } else if (URLS.includes(url.href)) {
    event.respondWith((async () => {
      const cached = await (await caches.open(CACHE_NAME)).match(request);
      return cached || fetch(request);
    })());
  } else if (url.pathname.startsWith('/assets/')) {
    // Keep an older open tab working while a new build is waiting to activate.
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});
