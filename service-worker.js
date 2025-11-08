// service-worker.js
const CACHE_VERSION = 'v306';
const CACHE_NAME = `confession-cache-${CACHE_VERSION}`;

// Khi service worker được cài đặt
self.addEventListener('install', event => {
  console.log('Service Worker installed');
  
  // Force service worker to activate immediately
  self.skipWaiting();
});

// Khi service worker được kích hoạt
self.addEventListener('activate', event => {
  console.log('Service Worker activated');
  
  // Xóa tất cả cache cũ
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Yêu cầu service worker kiểm soát tất cả các trang ngay lập tức
  return self.clients.claim();
});

// Khi trình duyệt yêu cầu tài nguyên
self.addEventListener('fetch', event => {
  // Không cache POST request (API, form submit)
  if (event.request.method !== 'GET') {
    return; // Để request đi thẳng mạng, SW không can thiệp
  }

  // Không cache JSON (API static), luôn lấy mạng trước
  if (event.request.url.endsWith('.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Các GET request khác (CSS, JS, img) → cache bình thường
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});













