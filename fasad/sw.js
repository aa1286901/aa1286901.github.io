// Пути относительные: они считаются от папки, где лежит sw.js,
// поэтому приложение работает и в корне домена, и в подпапке /fasad/
const CACHE_NAME = 'fasad-007'; // при деплое заменяется на номер коммита
const STATIC_ASSETS = [
  './',
  'index.html',
  'offline.html',

  // CSS
  'css/variables.css',
  'css/reset.css',
  'css/base.css',
  'css/components.css',
  'css/layout.css',
  'css/responsive.css',
  'css/mobile-pwa.css',
  'css/ios-fixes.css',
  'css/editor.css',
  'css/catalog.css',

  // JS
  'js/api.js',
  'js/ui.js',
  'js/auth.js',
  'js/router.js',
  'js/projects.js',
  'js/materials.js',
  'js/camera.js',
  'js/stone-preview.js',
  'js/configurator.js',
  'js/project-page.js',
  'js/coins.js',
  'js/admin.js',
  'js/kp.js',
  'js/kp-house.js',
  'js/viewer3d.js',
  'js/catalog.js',
  'js/profile.js',
  'js/screens.js',
  'js/app.js',

  // Data (только каталог — база пользователей в кэш не попадает)
  'data/materials.json',
  'data/catalog.json',

  // PWA
  'manifest.json',
  'app-favicon.ico',
  'app-icon-32.png',
  'app-icon-180.png',
  'app-icon-192.png',
  'app-icon-512.png',
];

// === Install: кэшируем статические файлы ===
// Каждый файл кэшируется отдельно: если одного нет, установка не срывается целиком.
// cache: 'reload' — мимо кэша браузера, чтобы после обновления не попали старые файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Кэширование статических файлов...');
      return Promise.allSettled(STATIC_ASSETS.map((asset) => cache.add(new Request(asset, { cache: 'reload' }))));
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

// === Fetch ===
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // POST/DELETE и чужие домены не трогаем
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Для API — всегда сеть, ответы с личными данными в кэш не кладём
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
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
  
  // Страница, скрипты, стили и данные — сначала сеть, чтобы после обновления сайта
  // не смешивались новая страница и старые скрипты. Кэш — только когда нет интернета
  const fresh = event.request.mode === 'navigate' || /\.(html|js|css|json)$/.test(url.pathname) || url.pathname.endsWith('/');
  if (fresh) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true })
          .then((cached) => cached || (event.request.mode === 'navigate'
            ? caches.match('offline.html')
            : new Response('Нет подключения к интернету', { status: 503 }))))
    );
    return;
  }

  // Картинки (текстуры камня, изделия, иконки) — из кэша, они не меняются
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }))
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
    icon: 'app-icon-192.png',
    badge: 'app-icon-96.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(self.registration.scope)
  );
});

console.log('[SW] Service Worker загружен');
