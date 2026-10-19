// ========================================================
// Service Worker: Cache Asset Proyek Secara Offline
// ========================================================
const CACHE_NAME = 'umkm-fotocopy-assets-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './catatan_transaksi.md',
  './catatan_transaksi.txt'
];

// Tahap Install: Simpan file-file proyek ke Cache Storage
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Tahap Activate: Bersihkan cache versi lama jika ada pembaruan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== 'umkm-fotocopy-cache-v1') {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Tahap Fetch: Strategi Cache-First dengan Network Fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback jika offline
        return caches.match('./index.html');
      });
    })
  );
});
