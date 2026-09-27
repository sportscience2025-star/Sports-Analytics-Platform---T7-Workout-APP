const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Simple static HTTP server for the app
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const PORT = 8123;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT_DIR, reqPath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

server.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);

    // Find Edge executable
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const userDataDir = path.join(__dirname, 'temp_edge_profile');

    const browser = spawn(edgePath, [
        '--headless=new',
        `--remote-debugging-port=9333`,
        `--user-data-dir=${userDataDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        `http://localhost:${PORT}/index.html`
    ]);

    // Wait for CDP port to open
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 200));
        try {
            const listRes = await fetch('http://localhost:9333/json/list');
            const pages = await listRes.json();
            if (pages && pages.length > 0 && pages[0].webSocketDebuggerUrl) {
                wsUrl = pages[0].webSocketDebuggerUrl;
                break;
            }
        } catch (e) {}
    }

    if (!wsUrl) {
        console.error('Failed to connect to browser CDP');
        browser.kill();
        server.close();
        process.exit(1);
    }

    console.log('Connected to CDP at:', wsUrl);

    // Connect via native WebSocket
    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.id && pending.has(data.id)) {
            pending.get(data.id)(data);
            pending.delete(data.id);
        }
    };

    function sendCommand(method, params = {}) {
        return new Promise((resolve) => {
            const id = msgId++;
            pending.set(id, resolve);
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    ws.onopen = async () => {
        console.log('WebSocket connection established.');
        await sendCommand('Page.enable');
        await sendCommand('Runtime.enable');
        await sendCommand('Log.enable');

        ws.addEventListener('message', (ev) => {
            const m = JSON.parse(ev.data);
            if (m.method === 'Runtime.consoleAPICalled') {
                console.log('[Browser Console]', m.params.type, m.params.args.map(a => a.value));
            } else if (m.method === 'Runtime.exceptionThrown') {
                console.error('[Browser Exception]', m.params.exceptionDetails);
            }
        });

        // Navigate cleanly to index.html with CDP attached
        await sendCommand('Page.navigate', { url: `http://localhost:${PORT}/index.html` });

        // Wait up to 5s for catalog-grid to have cards
        for (let i = 0; i < 25; i++) {
            await new Promise(r => setTimeout(r, 300));
            const check = await sendCommand('Runtime.evaluate', {
                expression: 'document.querySelectorAll(".exercise-card").length',
                returnByValue: true
            });
            if (check.result && check.result.result && check.result.result.value > 0) {
                console.log(`Cards loaded after ${(i+1)*300}ms: ${check.result.result.value} cards`);
                break;
            }
        }

        // Comprehensive Browser Evaluation
        const evalRes = await sendCommand('Runtime.evaluate', {
            expression: `(async () => {
                const results = { passed: [], failed: [] };
                function assert(name, condition, detail = '') {
                    if (condition) {
                        results.passed.push(name);
                    } else {
                        results.failed.push({ name, detail });
                    }
                }

                // --- 1. Exercise Card Checks ---
                const cards = document.querySelectorAll('.exercise-card');
                assert('504 cards rendered', cards.length === 504, 'Found ' + cards.length);

                let overflowCount = 0;
                cards.forEach(card => {
                    if (card.scrollWidth > card.clientWidth + 1) overflowCount++;
                });
                assert('Zero card horizontal overflows', overflowCount === 0, 'Overflows: ' + overflowCount);

                const firstTag = document.querySelector('.card-tags .tag');
                if (firstTag) {
                    const style = window.getComputedStyle(firstTag);
                    assert('Tag font-size is ~0.68rem (10.88px)', Math.abs(parseFloat(style.fontSize) - 10.88) < 1.0, 'Got ' + style.fontSize);
                    assert('Tag border-radius is 9999px (pill)', style.borderRadius === '9999px', 'Got ' + style.borderRadius);
                } else {
                    assert('Card tag found', false, 'No tag found');
                }

                const firstBtn = document.querySelector('.btn-card-action');
                if (firstBtn) {
                    const btnStyle = window.getComputedStyle(firstBtn);
                    assert('btn-card-action border-radius is 9999px', btnStyle.borderRadius === '9999px', 'Got ' + btnStyle.borderRadius);
                    assert('btn-card-action has action-arrow', !!firstBtn.querySelector('.action-arrow'), 'No action-arrow span');
                } else {
                    assert('btn-card-action exists', false, 'No btn-card-action found');
                }

                // --- 2. Dropdown Filter Checks ---
                const triggerMuscle = document.querySelector('#trigger-muscle');
                const menuMuscle = document.querySelector('#menu-muscle');
                const searchMuscleInput = document.querySelector('#search-muscle-input');
                const optionsList = menuMuscle ? menuMuscle.querySelector('.dropdown-options-list') : null;

                assert('Trigger and menu exist', !!triggerMuscle && !!menuMuscle && !!optionsList);

                // Open muscle menu
                triggerMuscle.click();
                assert('Menu opens on click', !menuMuscle.classList.contains('hidden'));

                // Test category search for "spalle"
                searchMuscleInput.value = 'spalle';
                searchMuscleInput.dispatchEvent(new Event('input', { bubbles: true }));

                const deltoideOpt = Array.from(menuMuscle.querySelectorAll('.custom-option')).find(o => o.textContent.includes('Deltoide Anteriore'));
                const visibleOptionsCountSpalle = Array.from(menuMuscle.querySelectorAll('.custom-option')).filter(o => o.style.display !== 'none').length;
                const spalleHeader = Array.from(menuMuscle.querySelectorAll('.dropdown-group-header')).find(h => h.textContent.includes('Spalle'));
                const spalleHdrVisible = spalleHeader ? spalleHeader.style.display !== 'none' : false;

                assert('Category search "spalle" reveals shoulder muscles', visibleOptionsCountSpalle >= 4, 'Visible count: ' + visibleOptionsCountSpalle);
                assert('Category search "spalle" keeps Spalle header visible', spalleHdrVisible, 'Spalle header visible: ' + spalleHdrVisible);

                // Test ARIA attributes on triggers and options
                assert('Trigger has aria-haspopup="listbox"', triggerMuscle.getAttribute('aria-haspopup') === 'listbox', 'Got: ' + triggerMuscle.getAttribute('aria-haspopup'));
                assert('Trigger has aria-expanded="true"', triggerMuscle.getAttribute('aria-expanded') === 'true', 'Got: ' + triggerMuscle.getAttribute('aria-expanded'));
                assert('Options list has role="listbox"', optionsList.getAttribute('role') === 'listbox', 'Got: ' + optionsList.getAttribute('role'));

                const firstOpt = menuMuscle.querySelector('.custom-option');
                assert('Option has role="option"', firstOpt && firstOpt.getAttribute('role') === 'option', 'Got: ' + (firstOpt ? firstOpt.getAttribute('role') : null));

                // Test Escape key closes menu
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                assert('Escape key closes menu', menuMuscle.classList.contains('hidden'));

                // --- 3. Favorites View Filter Checks ---
                // Add 1 exercise to favorites
                const firstFavBtn = cards[0].querySelector('.favorite-btn');
                if (firstFavBtn && !firstFavBtn.classList.contains('active')) {
                    firstFavBtn.click();
                }

                // Switch to favorites view
                window.App.switchView('favorites');
                await new Promise(r => setTimeout(r, 300));

                const favCards = document.querySelectorAll('.exercise-card');
                assert('Favorites view has favorite exercise', favCards.length >= 1, 'Fav cards: ' + favCards.length);

                // Test quality filter on favorites
                const triggerQualityFav = document.querySelector('#trigger-quality');
                const menuQualityFav = document.querySelector('#menu-quality');
                if (triggerQualityFav && menuQualityFav) {
                    triggerQualityFav.click();
                    const forzaOpt = Array.from(menuQualityFav.querySelectorAll('.custom-option')).find(o => o.dataset.val === 'Forza');
                    if (forzaOpt) {
                        forzaOpt.click();
                        await new Promise(r => setTimeout(r, 200));
                        const favForzaCount = document.querySelectorAll('.exercise-card').length;
                        // Exercise 0 is Forza or not?
                        const ex0 = window.App.exercises[0];
                        const shouldBeCount = (ex0.quality === 'Forza') ? 1 : 0;
                        assert('Favorites view filters by quality (Forza)', favForzaCount === shouldBeCount, 'Got ' + favForzaCount + ', expected ' + shouldBeCount);
                    }
                }

                // Switch back to catalog view
                window.App.switchView('catalog');
                await new Promise(r => setTimeout(r, 400));

                // Re-query active elements from catalog view
                const activeTriggerMuscle = document.querySelector('#trigger-muscle');
                const activeMenuMuscle = document.querySelector('#menu-muscle');
                const activeSearchMuscleInput = document.querySelector('#search-muscle-input');
                const activeOptionsList = activeMenuMuscle ? activeMenuMuscle.querySelector('.dropdown-options-list') : null;
                const activeTriggerLevel = document.querySelector('#trigger-level');
                const activeMenuLevel = document.querySelector('#menu-level');

                // --- 4. Deep Keyboard Navigation & Interaction Tests ---
                assert('Level trigger and menu exist', !!activeTriggerLevel && !!activeMenuLevel);

                activeTriggerLevel.focus();
                activeTriggerLevel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                assert('ArrowDown opens level menu', !activeMenuLevel.classList.contains('hidden'));

                const intermedioOpt = Array.from(activeMenuLevel.querySelectorAll('.custom-option')).find(o => o.dataset.val === 'Intermedio');
                if (intermedioOpt) {
                    intermedioOpt.focus();
                    intermedioOpt.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                    assert('Enter selects Intermedio in level menu', activeTriggerLevel.querySelector('.trigger-text').textContent.includes('Intermedio'));
                    assert('Menu closes after selection', activeMenuLevel.classList.contains('hidden'));
                }

                // Test Muscle Search Enter-key auto-selection
                activeTriggerMuscle.click();
                activeSearchMuscleInput.value = 'deltoide anteriore';
                activeSearchMuscleInput.dispatchEvent(new Event('input', { bubbles: true }));
                activeSearchMuscleInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                assert('Enter key in search selects first match', activeTriggerMuscle.querySelector('.trigger-text').textContent.includes('Deltoide Anteriore'));
                assert('Menu closed after Enter selection', activeMenuLevel.classList.contains('hidden'));

                // Test Empty State on search
                activeTriggerMuscle.click();
                activeSearchMuscleInput.value = 'nonexistentmusclename12345';
                activeSearchMuscleInput.dispatchEvent(new Event('input', { bubbles: true }));
                const emptyState = activeMenuMuscle.querySelector('#muscle-empty-state');
                const emptyStateDisplay = emptyState ? window.getComputedStyle(emptyState).display : 'no element';
                assert('Empty state visible on nonexistent search', emptyStateDisplay === 'block', 'Got display: ' + emptyStateDisplay);

                // Test fixed search header during scroll
                activeSearchMuscleInput.value = '';
                activeSearchMuscleInput.dispatchEvent(new Event('input', { bubbles: true }));
                activeOptionsList.scrollTop = 200;
                const searchWrap = activeMenuMuscle.querySelector('.dropdown-search-wrap');
                const searchWrapRect = searchWrap.getBoundingClientRect();
                const menuRect = activeMenuMuscle.getBoundingClientRect();
                assert('Search wrap stays pinned at menu top', Math.abs(searchWrapRect.top - menuRect.top) < 2);

                // Close muscle menu
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

                // --- 5. Detail Modal Test ---
                const firstCardBtn = document.querySelector('.exercise-card .btn-card-action');
                if (firstCardBtn) {
                    firstCardBtn.click();
                    await new Promise(r => setTimeout(r, 200));
                    const modalBackdrop = document.querySelector('#modal-backdrop');
                    assert('Detail modal opens on card action click', modalBackdrop && !modalBackdrop.classList.contains('hidden'));

                    const modalClose = document.querySelector('#modal-close');
                    if (modalClose) modalClose.click();
                    await new Promise(r => setTimeout(r, 200));
                    assert('Detail modal closes on close button click', modalBackdrop && modalBackdrop.classList.contains('hidden'));
                }

                // --- 6. Container Styling Verification (No double border/box) ---
                const filterWrapper = document.querySelector('.catalog-filter-wrapper');
                if (filterWrapper) {
                    const fwStyle = window.getComputedStyle(filterWrapper);
                    assert('catalog-filter-wrapper has transparent background (no double box)', fwStyle.backgroundColor === 'rgba(0, 0, 0, 0)', 'Got ' + fwStyle.backgroundColor);
                }

                // --- 7. Reset Button Test ---
                const resetBtn = document.querySelector('#btn-reset-filters');
                assert('Reset button is visible after filter changes', resetBtn && resetBtn.style.display !== 'none');
                if (resetBtn) {
                    resetBtn.click();
                    await new Promise(r => setTimeout(r, 200));
                    assert('Reset button hides after click', resetBtn.style.display === 'none');
                    const muscleTrigText = activeTriggerMuscle.querySelector('.trigger-text').textContent;
                    const levelTrigText = activeTriggerLevel.querySelector('.trigger-text').textContent;
                    assert('Muscle trigger reset', muscleTrigText.includes('Tutti'), 'Got: ' + muscleTrigText);
                    assert('Level trigger reset', levelTrigText.includes('Tutti'), 'Got: ' + levelTrigText);
                }

                return results;
            })()`,
            awaitPromise: true,
            returnByValue: true
        });

        // --- 8. Mobile 360px Viewport Emulation ---
        await sendCommand('Emulation.setDeviceMetricsOverride', {
            width: 360,
            height: 740,
            deviceScaleFactor: 2,
            mobile: true
        });

        await new Promise(r => setTimeout(r, 400));

        const mobileRes = await sendCommand('Runtime.evaluate', {
            expression: `(() => {
                const results = { passed: [], failed: [] };
                function assert(name, condition, detail = '') {
                    if (condition) results.passed.push(name);
                    else results.failed.push({ name, detail });
                }

                // Check doc horizontal scroll
                const docScrollWidth = document.documentElement.scrollWidth;
                assert('Mobile 360px viewport has no horizontal page scroll', docScrollWidth <= 360, 'docScrollWidth: ' + docScrollWidth);

                // Check card overflow
                let cardOverflowCount = 0;
                document.querySelectorAll('.exercise-card').forEach(c => {
                    if (c.scrollWidth > c.clientWidth + 1) cardOverflowCount++;
                });
                assert('Mobile 360px has zero card horizontal overflows', cardOverflowCount === 0, 'Card overflows: ' + cardOverflowCount);

                // Check trigger width fills parent container (100% responsive)
                const trigger = document.querySelector('#trigger-muscle');
                if (trigger) {
                    const trigWidth = trigger.getBoundingClientRect().width;
                    const parentWidth = trigger.parentElement.getBoundingClientRect().width;
                    assert('Mobile trigger fills 100% of container', Math.abs(trigWidth - parentWidth) < 2, 'trigWidth: ' + trigWidth + ', parentWidth: ' + parentWidth);
                }

                return results;
            })()`,
            returnByValue: true
        });

        console.log('=== DESKTOP TEST RESULTS ===');
        if (evalRes.result && evalRes.result.result && evalRes.result.result.value) {
            const val = evalRes.result.result.value;
            console.log('PASSED:', val.passed.length);
            val.passed.forEach(p => console.log('  [PASS]', p));
            console.log('FAILED:', val.failed.length);
            val.failed.forEach(f => console.log('  [FAIL]', f.name, '-->', f.detail));
        } else {
            console.log('Error evaluating:', JSON.stringify(evalRes));
        }

        console.log('=== MOBILE 360px TEST RESULTS ===');
        if (mobileRes.result && mobileRes.result.result && mobileRes.result.result.value) {
            const val = mobileRes.result.result.value;
            console.log('PASSED:', val.passed.length);
            val.passed.forEach(p => console.log('  [PASS]', p));
            console.log('FAILED:', val.failed.length);
            val.failed.forEach(f => console.log('  [FAIL]', f.name, '-->', f.detail));
        }

        ws.close();
        browser.kill();
        server.close();
        try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
        process.exit(0);
    };
});
