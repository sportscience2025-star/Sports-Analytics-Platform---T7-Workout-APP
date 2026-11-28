/**
 * T7 Workout - Service Worker
 * Versione: t7-workout-v127
 * Network-first per HTML, Cache-first resiliente per asset statici, Offline fallback.
 * Supporta bypass completo in ambiente di sviluppo Vite locale.
 */

const CACHE_NAME = 't7-workout-v127';
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
                console.log('[SW] Pre-caching core assets with resilient error handling...');
                // Caricamento tollerante: un singolo asset mancante non abortisce l'intera installazione
                const cachePromises = CORE_ASSETS.map(asset => {
                    return cache.add(asset).catch(err => {
                        console.warn(`[SW] Warning: asset non pre-caricato (${asset}):`, err);
                    });
                });
                return Promise.allSettled(cachePromises);
            })
            .then(() => {
                console.log('[SW] Skip waiting attivato');
                return self.skipWaiting();
            })
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
                        console.log('[SW] Eliminazione vecchia cache stantìa:', key);
                        return caches.delete(key);
                    })
            );
        }).then(() => {
            console.log('[SW] Clients claim completato');
            return self.clients.claim();
        })
    );
});

// ── FETCH ────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Salta richieste non GET
    if (request.method !== 'GET') return;

    // Salta richieste cross-origin
    if (!request.url.startsWith(self.location.origin)) return;

    // Salta suite di test
    if (request.url.includes('/tests/')) return;

    // Rileva se siamo su localhost / 127.0.0.1
    const isLocalhost = Boolean(
        self.location.hostname === 'localhost' ||
        self.location.hostname === '[::1]' ||
        self.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
    );

    // Bypass categorico della cache su localhost per garantire asset sempre freschi in sviluppo
    if (isLocalhost) {
        return;
    }

    // Pagine HTML: Network-first con fallback a cache e pagina offline
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
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

    // Asset statici (JS, CSS, immagini): Cache-first con fallback di rete
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;

            return fetch(request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            });
        })
    );
});
