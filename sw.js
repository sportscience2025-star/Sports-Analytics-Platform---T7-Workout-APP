/**
 * T7 Workout - Service Worker
 * Network-first for HTML, Cache-first for assets, Offline fallback
 */

const CACHE_NAME = 't7-workout-v113';
const OFFLINE_URL = './offline.html';

const CORE_ASSETS = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    // Styles
    './css/style.css',
    // Icons
    './icons/icon-180.png',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png'
];

// ── INSTALL ──────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    console.log(`[SW] Installing ${CACHE_NAME}...`);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Pre-caching core assets');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// ── ACTIVATE ─────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    console.log(`[SW] Activating ${CACHE_NAME}...`);
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Removing old cache:', key);
                        return caches.delete(key);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// ── FETCH ────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests (Google Fonts will be fetched naturally)
    if (!request.url.startsWith(self.location.origin)) return;

    // Skip test suite files to prevent caching test scripts
    if (request.url.includes('/tests/')) return;

    // HTML pages: Network-first (always get latest), fallback to cache, then offline page
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache the fresh version
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then(cached => cached || caches.match(OFFLINE_URL));
                })
        );
        return;
    }

    // Static assets (JS, CSS, images): Cache-first, network fallback
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;

            return fetch(request).then(response => {
                // Only cache successful responses from our origin
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            });
        })
    );
});
