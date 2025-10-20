// service-worker.js
const CACHE_VERSION = 'v1.0';
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
  // Đối với file JSON, luôn yêu cầu mạng và không sử dụng cache
  if (event.request.url.endsWith('.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => {
          // Nếu không có kết nối mạng, thử lấy từ cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Đối với các tài nguyên khác, kiểm tra mạng trước, sau đó mới dùng cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone response
        const responseClone = response.clone();
        
        // Mở cache và lưu response
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseClone);
          });
        
        return response;
      })
      .catch(() => {
        // Nếu không có kết nối mạng, thử lấy từ cache
        return caches.match(event.request);
      })
  );
});