const CACHE = "ahmedov-proxy-frontend-v4";
const BASE_PATH = new URL("./", self.location).pathname.replace(/\/$/, "") + "/";
const FALLBACKS = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}app`,
  `${BASE_PATH}payment`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}favicon.ico`,
  `${BASE_PATH}assets/icons/icon-192.svg`,
  `${BASE_PATH}assets/icons/icon-512.svg`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FALLBACKS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const path = url.pathname;

  if (path.startsWith("/api/") || path.startsWith("/proxy/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  const isDocument = event.request.mode === "navigate" || event.request.destination === "document";
  if (isDocument) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/proxy/index.html"))),
    );
    return;
  }

const isCodeAsset = path.startsWith(BASE_PATH + "assets/js/") || path.startsWith(BASE_PATH + "assets/css/");
if (isCodeAsset) {
  // ❗ ВСЕГДА БЕЗ КЕША
  event.respondWith(fetch(event.request, { cache: "no-store" }));
  return;
}

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.type === "opaque" || response.status >= 400) {
            return response;
          }
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("/proxy/index.html"));
    }),
  );
});

// Push-уведомления администратору (новые оплаты)
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data ? event.data.text() : "" }; }
  const title = data.title || "ahmedov.proxy";
  event.waitUntil(Promise.all([
    self.registration.showNotification(title, {
      body: data.body || "",
      tag: data.tag || "payments",
      icon: `${BASE_PATH}assets/icons/icon-192.svg`,
      badge: `${BASE_PATH}assets/icons/icon-192.svg`,
      data: { url: `${BASE_PATH}${data.url || ""}` },
    }),
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => list.forEach((c) => c.postMessage({ type: "push", data }))),
  ]));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || BASE_PATH;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.postMessage({ type: "open-payments" });
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
