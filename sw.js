// Service Worker for Ultimate Finance Dashboard
// Provides offline caching and PWA functionality

const CACHE_NAME = 'finance-dashboard-v3.0.0';
const STATIC_CACHE_NAME = 'finance-static-v3.0.0';
const DYNAMIC_CACHE_NAME = 'finance-dynamic-v3.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    // CDN resources that should be cached
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.js',
    'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/fuse.js/6.6.2/fuse.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js',
    'https://unpkg.com/tesseract.js@4.0.2/dist/tesseract.min.js',
    'https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/dist/d3-sankey.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        Promise.all([
            // Cache static files
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('[SW] Caching static files...');
                return cache.addAll(STATIC_FILES.slice(0, 3)); // Cache basic files first
            }),
            // Cache CDN resources with error handling
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                console.log('[SW] Caching CDN resources...');
                return Promise.allSettled(
                    STATIC_FILES.slice(3).map(url => 
                        fetch(url)
                            .then(response => {
                                if (response.ok) {
                                    return cache.put(url, response);
                                }
                                throw new Error(`Failed to fetch ${url}`);
                            })
                            .catch(error => {
                                console.warn(`[SW] Failed to cache ${url}:`, error);
                            })
                    )
                );
            })
        ]).then(() => {
            console.log('[SW] Installation complete');
            return self.skipWaiting();
        })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => 
                            cacheName.startsWith('finance-') && 
                            cacheName !== STATIC_CACHE_NAME &&
                            cacheName !== DYNAMIC_CACHE_NAME
                        )
                        .map(cacheName => {
                            console.log(`[SW] Deleting old cache: ${cacheName}`);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Take control of all clients
            self.clients.claim()
        ]).then(() => {
            console.log('[SW] Activation complete');
        })
    );
});

// Fetch event - serve cached content with network fallback
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Handle different types of requests
    if (url.origin === self.location.origin) {
        // Same-origin requests - use cache first strategy
        event.respondWith(cacheFirstStrategy(request));
    } else if (isCDNResource(url)) {
        // CDN resources - use stale while revalidate strategy
        event.respondWith(staleWhileRevalidateStrategy(request));
    } else {
        // Other requests - network first strategy
        event.respondWith(networkFirstStrategy(request));
    }
});

// Cache first strategy for static files
async function cacheFirstStrategy(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log(`[SW] Serving from cache: ${request.url}`);
            return cachedResponse;
        }
        
        // Fallback to network
        console.log(`[SW] Fetching from network: ${request.url}`);
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error(`[SW] Cache first strategy failed for ${request.url}:`, error);
        
        // Return offline fallback for HTML requests
        if (request.destination === 'document') {
            return caches.match('/index.html');
        }
        
        // Return basic error response
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network first strategy with cache fallback
async function networkFirstStrategy(request) {
    try {
        console.log(`[SW] Network first: ${request.url}`);
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log(`[SW] Network failed, trying cache: ${request.url}`);
        
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return error response
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stale while revalidate strategy for CDN resources
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.warn(`[SW] Failed to update ${request.url}:`, error);
        return cachedResponse;
    });
    
    // Return cached response immediately, update in background
    if (cachedResponse) {
        console.log(`[SW] Serving stale content: ${request.url}`);
        return cachedResponse;
    }
    
    // If no cache, wait for network
    console.log(`[SW] No cache, waiting for network: ${request.url}`);
    return fetchPromise;
}

// Check if URL is a CDN resource
function isCDNResource(url) {
    const cdnHosts = [
        'cdnjs.cloudflare.com',
        'cdn.jsdelivr.net',
        'unpkg.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com'
    ];
    
    return cdnHosts.some(host => url.hostname.includes(host));
}

// Background sync for data persistence
self.addEventListener('sync', event => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'background-sync-transactions') {
        event.waitUntil(syncTransactions());
    }
});

// Sync transactions when back online
async function syncTransactions() {
    try {
        // Get pending transactions from IndexedDB
        const pendingTransactions = await getPendingTransactions();
        
        if (pendingTransactions.length > 0) {
            console.log(`[SW] Syncing ${pendingTransactions.length} transactions...`);
            
            // Process each transaction
            for (const transaction of pendingTransactions) {
                await processTransaction(transaction);
            }
            
            // Notify clients of successful sync
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SYNC_COMPLETE',
                        data: { count: pendingTransactions.length }
                    });
                });
            });
        }
    } catch (error) {
        console.error('[SW] Sync failed:', error);
    }
}

// Get pending transactions (placeholder - would use IndexedDB)
async function getPendingTransactions() {
    // In a real implementation, this would query IndexedDB
    return [];
}

// Process individual transaction (placeholder)
async function processTransaction(transaction) {
    // In a real implementation, this would handle the transaction
    console.log('[SW] Processing transaction:', transaction.id);
}

// Handle push notifications
self.addEventListener('push', event => {
    console.log('[SW] Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New financial activity detected',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'finance-notification',
        actions: [
            {
                action: 'view',
                title: 'View Dashboard',
                icon: '/icons/action-view.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/icons/action-dismiss.png'
            }
        ],
        vibrate: [200, 100, 200],
        requireInteraction: true
    };
    
    event.waitUntil(
        self.registration.showNotification('Finance Dashboard', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Periodic background sync for data updates
self.addEventListener('periodicsync', event => {
    console.log('[SW] Periodic sync:', event.tag);
    
    if (event.tag === 'update-exchange-rates') {
        event.waitUntil(updateExchangeRates());
    }
});

// Update exchange rates in background
async function updateExchangeRates() {
    try {
        console.log('[SW] Updating exchange rates...');
        
        // This would typically fetch from a currency API
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        
        if (response.ok) {
            const data = await response.json();
            
            // Store in cache for offline access
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put('exchange-rates', new Response(JSON.stringify(data)));
            
            console.log('[SW] Exchange rates updated');
        }
    } catch (error) {
        console.warn('[SW] Failed to update exchange rates:', error);
    }
}

// Message handling from main thread
self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);
    
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_TRANSACTION':
            cacheTransaction(data);
            break;
            
        case 'GET_CACHE_STATUS':
            getCacheStatus().then(status => {
                event.ports[0].postMessage({ type: 'CACHE_STATUS', data: status });
            });
            break;
            
        default:
            console.warn('[SW] Unknown message type:', type);
    }
});

// Cache transaction data
async function cacheTransaction(transaction) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const key = `transaction-${transaction.id}`;
        
        cache.put(key, new Response(JSON.stringify(transaction)));
        console.log(`[SW] Cached transaction: ${transaction.id}`);
    } catch (error) {
        console.error('[SW] Failed to cache transaction:', error);
    }
}

// Get cache status
async function getCacheStatus() {
    try {
        const cacheNames = await caches.keys();
        const status = {
            caches: cacheNames.length,
            size: 0,
            lastUpdated: new Date().toISOString()
        };
        
        // Calculate approximate cache size
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            status.size += keys.length;
        }
        
        return status;
    } catch (error) {
        console.error('[SW] Failed to get cache status:', error);
        return { error: error.message };
    }
}

// Error handling
self.addEventListener('error', event => {
    console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker script loaded');