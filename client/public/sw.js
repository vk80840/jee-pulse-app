const CACHE_NAME = 'jee-pulse-v1.0.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;

// Files to cache on install
const STATIC_FILES = [
  '/',
  '/daily-log',
  '/progress', 
  '/syllabus',
  '/settings',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static files');
        // Don't fail the install if some files can't be cached
        return Promise.allSettled(
          STATIC_FILES.map(url => 
            cache.add(url).catch(err => 
              console.warn(`[SW] Failed to cache ${url}:`, err)
            )
          )
        );
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match current version
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default: cache-first strategy for everything else
  event.respondWith(cacheFirstStrategy(request));
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    // Try to get from cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first strategy failed:', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      return cache.match('/') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response for API calls when offline
    return new Response(
      JSON.stringify({ 
        error: 'Network unavailable', 
        message: 'This feature requires an internet connection' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests (HTML pages)
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation request failed, serving cached app shell');
    
    // Fallback to cached app shell (index.html)
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match('/');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Last resort offline page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>JEE Pulse - Offline</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 50px 20px; 
              background: #f8fafc;
              color: #374151;
            }
            .offline-container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .offline-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            h1 { color: #3b82f6; margin-bottom: 10px; }
            p { color: #6b7280; line-height: 1.5; }
            button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 20px;
            }
            button:hover { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📚</div>
            <h1>JEE Pulse</h1>
            <p>You're currently offline. Your data is still available locally, and any changes will sync when you're back online.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return (
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.ttf') ||
    pathname.endsWith('.json') ||
    pathname.includes('/assets/')
  );
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    console.log('[SW] Syncing offline data...');
    
    // In a real implementation, you would:
    // 1. Get offline data from IndexedDB/localStorage
    // 2. Send it to your backend API
    // 3. Update local storage with server response
    // 4. Notify the app of successful sync
    
    // For this PWA, since we're using localStorage only,
    // we just need to notify the app that sync is available
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_AVAILABLE',
        message: 'Connection restored. Data sync is available.'
      });
    });
    
    console.log('[SW] Offline data sync completed');
  } catch (error) {
    console.error('[SW] Failed to sync offline data:', error);
  }
}

// Handle push notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/manifest.json', // Will use the icon from manifest
    badge: '/manifest.json',
    vibrate: [200, 100, 200],
    tag: 'jee-pulse-notification',
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/manifest.json'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('JEE Pulse', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If app is already open, focus it
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Otherwise open new window
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'REQUEST_SYNC') {
    // Register background sync
    self.registration.sync.register('sync-data').catch((error) => {
      console.error('[SW] Failed to register background sync:', error);
    });
  }
});

// Cleanup old caches periodically
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupOldCaches());
  }
});

async function cleanupOldCaches() {
  try {
    const caches = await caches.keys();
    const oldCaches = caches.filter(name => 
      !name.includes(CACHE_NAME) && 
      (name.includes('jee-pulse') || name.includes('workbox'))
    );
    
    await Promise.all(oldCaches.map(name => caches.delete(name)));
    console.log('[SW] Cleaned up old caches:', oldCaches);
  } catch (error) {
    console.error('[SW] Failed to cleanup old caches:', error);
  }
}

console.log('[SW] Service Worker script loaded successfully');
