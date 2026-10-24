const CACHE_NAME = 'fasad-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  
  // CSS
  '/css/variables.css',
  '/css/reset.css',
  '/css/base.css',
  '/css/components.css',
  '/css/layout.css',
  '/css/responsive.css',
  '/css/mobile-pwa.css',
  '/css/ios-fixes.css',
  
  // JS
  '/js/api.js',
  '/js/ui.js',
  '/js/auth.js',
  '/js/router.js',
  '/js/projects.js',
  '/js/materials.js',
  '/js/camera.js',
  '/js/generation.js',
  '/js/catalog.js',
  '/js/profile.js',
  '/js/screens.js',
  '/js/app.js',
  
  // Data
  '/data/materials.json',
  '/data/cornices.json',
  '/data/database.json',
  
  // PWA
  '/manifest.json',
  '/offline.html',
];

// === Install: кэшируем все статические файлы ===
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Кэширование статических файлов...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Статические файлы закэшированы');
      return self.skipWaiting();
    })
  );
});

// === Activate: очищаем старые кэши ===
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Удаление старого кэша:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Активация завершена');
      return self.clients.claim();
    })
  );
});

// === Fetch: сначала кэш, потом сеть ===
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Для API — всегда сеть (чтобы актуальные данные)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Клонируем ответ и кладём в кэш
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          // Оффлайн — возвращаем ошибку
          return new Response(JSON.stringify({
            success: false,
            error: 'Нет подключения к интернету'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }
  
  // Для статических файлов — кэш → сеть
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) {
          // Есть в кэше — отдаём мгновенно
          const networkFetch = fetch(event.request).then((networkResponse) => {
            // Обновляем кэш в фоне (stale-while-revalidate)
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
            return networkResponse;
          }).catch(() => {});
          return cached;
        }
        
        // Нет в кэше — загружаем из сети
        return fetch(event.request).then((response) => {
          // Кладём в кэш для будущих запросов
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        }).catch(() => {
          // Оффлайн — для HTML пытаемся отдать главную
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          return new Response('Нет подключения к интернету');
        });
      })
  );
});

// === Background Sync: повтор API-запросов при восстановлении ===
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-api') {
    event.waitUntil(syncApiRequests());
  }
});

async function syncApiRequests() {
  // Здесь можно добавить логику повторной отправки отложенных запросов
  console.log('[SW] Background sync запущен');
}

// === Push Notifications (если нужно в будущем) ===
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Fasad AI';
  const options = {
    body: data.body || 'Новое обновление!',
    icon: 'manifest.json',
    badge: 'manifest.json',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow('/')
  );
});

console.log('[SW] Service Worker загружен');
