importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const CACHE_NAME = 'storyapp-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/src/styles/styles.css',
  '/src/styles/responsive.css',
  '/src/app.js',
  '/note.png',
  '/fallback.jpg',
  '/icons/icon-192x192.png',
  '/icons/badge-96x96.png',
];

// --- PRECACHE & RUNTIME CACHING ---
if (workbox) {
  console.log('Workbox berhasil dimuat');

  workbox.precaching.precacheAndRoute([
    { url: '/', revision: '1' },
    { url: '/index.html', revision: '1' },
    { url: '/manifest.json', revision: '1' },
    { url: '/icons/icon-192x192.png', revision: '1' },
    { url: '/icons/icon-512x512.png', revision: '1' },
    { url: '/icons/badge-96x96.png', revision: '1' },
  ]);

  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'document',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'assets-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );
} else {
  console.log('Workbox gagal dimuat, menggunakan cache manual');
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request)
            .then(response => {
              if (response.ok && event.request.url.startsWith('http')) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache));
              }
              return response;
            })
            .catch(() => {
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/offline.html');
              }
            });
        })
    );
  });
}

// --- PUSH NOTIFICATION HANDLING ---
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');

  let notification = {
    title: 'StoryApp',
    options: {
      body: 'Ada pembaruan baru di StoryApp!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-96x96.png',
      vibrate: [100, 50, 100],
      data: { url: '/' },
      actions: [
        {
          action: 'open',
          title: 'Buka App',
          icon: '/icons/icon-192x192.png',
        },
        {
          action: 'close',
          title: 'Tutup',
        },
      ],
      tag: 'storyapp-push-default'
    },
  };

  if (event.data) {
    try {
      const dataJson = event.data.json();
      notification.title = dataJson.title || notification.title;
      notification.options = { ...notification.options, ...dataJson.options, ...dataJson };
      // Ensure tag always exists for anti-spam
      if (!notification.options.tag) notification.options.tag = 'storyapp-push-default';
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.getNotifications({ tag: notification.options.tag, includeTriggered: true }).then((notifications) => {
      notifications.forEach(n => n.close());
      return self.registration.showNotification(notification.title, notification.options);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data && event.notification.data.url ? event.notification.data.url : '/');
      }
    })
  );
});

// Service Worker Install and Activate (for manual fallback)
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('storyapp-') && cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        )
      ),
    ])
  );
});
