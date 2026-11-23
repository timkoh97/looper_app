/**
 * offline.js — Service worker registration and "download all pads for offline use".
 * Pads are stored in the Cache API; sw.js serves them from there when offline.
 */

export const PAD_CACHE_NAME = 'pad-looper-pads-v1'; // must match PAD_CACHE in sw.js

/** Registers the service worker (no-op where unsupported, e.g. file://). */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(error => console.warn('Service worker not registered:', error));
  }
}

/** Absolute URL for a pad file, used as its cache key. */
const toAbsoluteUrl = file => new URL(file, document.baseURI).href;

/** Returns how many of the given pad files are already cached. */
export async function countCachedPads(files) {
  if (!('caches' in window)) return 0;
  const cache = await caches.open(PAD_CACHE_NAME);
  const matches = await Promise.all(files.map(file => cache.match(toAbsoluteUrl(file))));
  return matches.filter(Boolean).length;
}

/**
 * Downloads and caches every pad not cached yet.
 * @param {string[]} files
 * @param {(fraction: number) => void} onProgress overall progress, 0–1
 */
export async function downloadPads(files, onProgress) {
  if (!('caches' in window)) throw new Error('Offline storage is not supported in this browser.');
  navigator.storage?.persist?.().catch(() => {}); // ask the browser not to evict the pads

  const cache = await caches.open(PAD_CACHE_NAME);
  for (const [index, file] of files.entries()) {
    const url = toAbsoluteUrl(file);
    if (!(await cache.match(url))) {
      const blob = await fetchWithProgress(url, fraction => onProgress((index + fraction) / files.length));
      await cache.put(url, new Response(blob, {
        headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(blob.size) },
      }));
    }
    onProgress((index + 1) / files.length);
  }
}

/** Fetches a file as a Blob, reporting per-file progress (0–1) when the size is known. */
async function fetchWithProgress(url, onProgress) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Download failed (${response.status}) for ${url}`);
  const totalBytes = Number(response.headers.get('Content-Length')) || 0;
  if (!response.body || !totalBytes) return response.blob();

  const reader = response.body.getReader();
  const chunks = [];
  let loadedBytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loadedBytes += value.length;
    onProgress(Math.min(loadedBytes / totalBytes, 1));
  }
  return new Blob(chunks, { type: 'audio/mpeg' });
}
