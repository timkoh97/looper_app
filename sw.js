/**
 * sw.js — Service worker for offline use.
 * - App shell: served from cache immediately, refreshed from the network in the background.
 * - Pads: served from the pad cache when downloaded (with HTTP Range support, which Safari
 *   requires for audio), otherwise passed through to the network.
 *
 * Bump SHELL_CACHE's version when shipping app changes so old shells are cleared.
 */

const SHELL_CACHE = 'pad-looper-shell-v18';
const PAD_CACHE = 'pad-looper-pads-v1'; // must match PAD_CACHE_NAME in js/offline.js

const SHELL_FILES = [
  './',
  'index.html',
  'css/style.css',
  'js/main.js',
  'js/audioEngine.js',
  'js/pads.js',
  'js/settings.js',
  'js/offline.js',
  'js/ui.js',
  'js/mobileSupport.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/artwork-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names
        .filter(name => name.startsWith('pad-looper-shell-') && name !== SHELL_CACHE)
        .map(name => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/pads/')) event.respondWith(servePad(event.request));
  else event.respondWith(serveShell(event));
});

/** Stale-while-revalidate: instant from cache (works offline), updated for next launch. */
async function serveShell(event) {
  const { request } = event;
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true })
    || (request.mode === 'navigate' ? await cache.match('./') : undefined);
  const refresh = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached || Response.error());
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return refresh;
}

/** Serves a downloaded pad from cache, slicing it for Range requests; otherwise uses the network. */
async function servePad(request) {
  const cache = await caches.open(PAD_CACHE);
  const cached = await cache.match(request.url, { ignoreSearch: true });
  if (!cached) return fetch(request);

  const rangeHeader = request.headers.get('range');
  if (!rangeHeader) return cached;

  const blob = await cached.blob();
  const [, startText, endText] = /bytes=(\d*)-(\d*)/.exec(rangeHeader) || [];
  let start = Number(startText) || 0;
  let end = endText ? Math.min(Number(endText), blob.size - 1) : blob.size - 1;
  if (startText === '' && endText) { // suffix range: last N bytes
    start = Math.max(blob.size - Number(endText), 0);
    end = blob.size - 1;
  }
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${blob.size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}
