/**
 * T7 Workout - Service Worker v5
 * Network-first for HTML, Cache-first for assets, Offline fallback
 */

const CACHE_NAME = 't7-workout-v103';
const OFFLINE_URL = './offline.html';

const CORE_ASSETS = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    // Styles
    './css/style.css',
    // Vendor Libraries
    './js/vendor/xlsx.full.min.js',
    './js/vendor/exceljs.min.js',
    // Scripts
    './js/data/taxonomy.js',
    './js/data/conditions.js',
    './js/data/exercises.js',
    './js/data/init.js',
    './js/data/filters.js',
    './js/data.js',
    './js/data/sources/atletica.js',
    './js/data/sources/sollevamento-pesi.js',
    './js/data/sources/fisiologia.js',
    './js/data/sources/vbt.js',
    './js/data/sources/biomeccanica.js',
    './js/data/sources/clinico.js',
    './js/data/sources/sport-squadra.js',
    './js/data/sources/riabilitazione.js',
    './js/data/sources/nutrizione-sportiva.js',
    './js/data/sources/prevenzione-infortuni.js',
    './js/data/sources/psicologia-sport.js',
    './js/data/sources/sport-individuali.js',
    './js/data/sources/index.js',
    './js/media.js',
    './js/knowledge-base.js',
    './js/physics-engine.js',
    './js/parser/exercise-dict.js',
    './js/parser/athlete-resolver.js',
    './js/parser/load-aggregator.js',
    './js/parser/header-mapper.js',
    './js/parser/instrument-detector.js',
    './js/parser/file-readers.js',
    './js/parser.js',
    './js/analysis/test-registry.js',
    './js/analysis/medicine-ball-physics.js',
    './js/analysis/reactive-grid.js',
    './js/analysis/data-classifier.js',
    './js/analysis/rag-integration.js',
    './js/analysis/adaptive-ui-charts.js',
    './js/analysis/adaptive-ui-mapping.js',
    './js/analysis/adaptive-ui.js',
    './js/analysis/analysis-exporter.js',
    './js/analysis/pap/pap-integrity-validator.js',
    './js/analysis/pap/pap-stats-engine.js',
    './js/analysis/pap/pap-coach-engine.js',
    './js/analysis/pap/pap-benchmark-data.js',
    './js/analysis/pap/pap-dashboard-charts.js',
    './js/analysis/pap/pap-dashboard-tabs.js',
    './js/analysis/pap/pap-dashboard-export.js',
    './js/analysis/pap/pap-dashboard-view.js',
    './js/analysis/pap/index.js',
    './js/logic/risk-analyzer.js',
    './js/logic/periodization.js',
    './js/logic/phase-builder.js',
    './js/logic/session-builder.js',
    './js/logic/exercise-formatter.js',
    './js/logic/warmup-cooldown.js',
    './js/logic/rag-rationale-adapter.js',
    './js/logic/rationale-generator.js',
    './js/logic/data-persistence.js',
    './js/logic.js',
    './js/ui/helpers.js',
    './js/ui/favorites.js',
    './js/ui/exercise-detail-resolver.js',
    './js/ui/wizard-state.js',
    './js/ui/wizard-result-styles/01-report-shell.js',
    './js/ui/wizard-result-styles/02-progression-bibliography.js',
    './js/ui/wizard-result-styles/03-exercise-table.js',
    './js/ui/wizard-result-styles/04-exercise-overlays.js',
    './js/ui/wizard-result-styles/05-actions-toast.js',
    './js/ui/wizard-result-styles/06-responsive.js',
    './js/ui/wizard-result-styles/07-print.js',
    './js/ui/wizard-result-styles/index.js',
    './js/ui/wizard-result-builder.js',
    './js/ui/wizard-swap.js',
    './js/ui/wizard-intake.js',
    './js/ui/wizard.js',
    './js/ui/export.js',
    './js/ui/render-filters.js',
    './js/ui/add-exercise-modal.js',
    './js/ui/catalog.js',
    './js/ui/scientific-hub.js',
    './js/ui.js',
    './js/data-analysis.js',
    './js/rag-engine.js',
    './js/rag-ui.js',
    './js/rag-knowledge-bridge.js',
    './js/rag-worker.js',
    './js/views/catalog-view.js',
    './js/views/wizard-view.js',
    './js/views/analysis-view.js',
    './js/views/favorites-view.js',
    './js/views/scientific-hub-view.js',
    './js/views/rag-view.js',
    './js/app.js',
    './js/impact-calculator.js',
    './js/clinical.js',
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
