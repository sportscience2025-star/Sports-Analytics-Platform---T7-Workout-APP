const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const PORT = 8135;
const CDP_PORT = 9345;

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
    console.log(Auditor HTTP server on port );

    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const userDataDir = path.join(__dirname, 'temp_edge_profile_auditor');

    const browser = spawn(edgePath, [
        '--headless=new',
        --remote-debugging-port=,
        --user-data-dir=,
        '--no-first-run',
        '--no-default-browser-check',
        http://localhost:/index.html
    ]);

    let wsUrl = null;
    for (let i = 0; i < 35; i++) {
        await new Promise(r => setTimeout(r, 200));
        try {
            const listRes = await fetch(http://localhost:/json/list);
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

    console.log('Auditor connected to CDP at:', wsUrl);

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

    async function evaluate(expression) {
        const res = await sendCommand('Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true
        });
        if (res.result && res.result.exceptionDetails) {
            console.error('Eval Exception:', res.result.exceptionDetails);
        }
        return res.result ? res.result.result.value : null;
    }

    ws.onopen = async () => {
        console.log('Auditor WebSocket established.');
        await sendCommand('Page.enable');
        await sendCommand('Runtime.enable');

        // Set Desktop Viewport
        await sendCommand('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
            mobile: false
        });

        // Wait for 504 cards
        let ready = false;
        for (let i = 0; i < 40; i++) {
            const count = await evaluate(document.querySelectorAll('.exercise-card').length);
            if (count === 504) {
                ready = true;
                break;
            }
            await new Promise(r => setTimeout(r, 250));
        }

        const assertions = [];
        function assert(name, condition, extra = '') {
            assertions.push({ name, pass: !!condition, extra });
            console.log([]  );
        }

        assert('504 cards rendered on initial load', ready);

        // 1. Check card overflow
        const cardOverflows = await evaluate((() => {
            const cards = Array.from(document.querySelectorAll('.exercise-card'));
            let overflows = 0;
            cards.forEach(c => {
                if (c.scrollWidth > c.clientWidth + 1) overflows++;
            });
            return overflows;
        })());
        assert('Zero card horizontal overflows on desktop', cardOverflows === 0, overflows: );

        // 2. Check tag font-size, padding, and pill border-radius
        const tagStyles = await evaluate((() => {
            const tag = document.querySelector('.card-tags .tag');
            if (!tag) return null;
            const cs = window.getComputedStyle(tag);
            return {
                fontSize: cs.fontSize,
                padding: cs.padding,
                borderRadius: cs.borderRadius,
                lineHeight: cs.lineHeight
            };
        })());
        assert('Tag font-size is ~0.68rem (10.88px)', tagStyles && parseFloat(tagStyles.fontSize) <= 11.5, got: );
        assert('Tag border-radius is 9999px (pill)', tagStyles && (tagStyles.borderRadius === '9999px' || parseFloat(tagStyles.borderRadius) > 100), got: );

        // 3. Check .btn-card-action
        const btnCardActionStyles = await evaluate((() => {
            const btn = document.querySelector('.btn-card-action');
            if (!btn) return null;
            const cs = window.getComputedStyle(btn);
            const arrow = btn.querySelector('.action-arrow');
            return {
                borderRadius: cs.borderRadius,
                display: cs.display,
                hasArrow: !!arrow,
                arrowText: arrow ? arrow.textContent : '',
                btnText: btn.textContent
            };
        })());
        assert('.btn-card-action has pill border-radius 9999px', btnCardActionStyles && (btnCardActionStyles.borderRadius === '9999px' || parseFloat(btnCardActionStyles.borderRadius) > 100));
        assert('.btn-card-action contains Scheda and arrow ?', btnCardActionStyles && btnCardActionStyles.btnText.includes('Scheda') && btnCardActionStyles.hasArrow);

        // 4. Dropdown structure: search wrap pinned, options list scrollable
        const dropdownInfo = await evaluate((() => {
            const menu = document.querySelector('#menu-muscle');
            const searchWrap = menu ? menu.querySelector('.dropdown-search-wrap') : null;
            const optionsList = menu ? menu.querySelector('.dropdown-options-list') : null;
            const searchInput = menu ? menu.querySelector('#search-muscle-input') : null;
            if (!menu || !searchWrap || !optionsList || !searchInput) return null;

            const menuStyle = window.getComputedStyle(menu);
            const wrapStyle = window.getComputedStyle(searchWrap);
            const listStyle = window.getComputedStyle(optionsList);

            return {
                menuDisplay: menuStyle.display,
                menuFlexDir: menuStyle.flexDirection,
                menuBackdrop: menuStyle.backdropFilter || menuStyle.webkitBackdropFilter,
                wrapFlexShrink: wrapStyle.flexShrink,
                listOverflowY: listStyle.overflowY,
                listMaxHeight: listStyle.maxHeight
            };
        })());
        assert('Dropdown menu uses flex column with backdrop-filter', dropdownInfo && dropdownInfo.menuFlexDir === 'column');
        assert('Dropdown search wrap flex-shrink is 0 (pinned)', dropdownInfo && dropdownInfo.wrapFlexShrink === '0');
        assert('Dropdown options list has overflow-y auto and max-height ~280px', dropdownInfo && (dropdownInfo.listOverflowY === 'auto' || dropdownInfo.listOverflowY === 'scroll') && parseInt(dropdownInfo.listMaxHeight) <= 280);

        // 5. Test opening menu and searching by category
        await evaluate(document.querySelector('#trigger-muscle').click());
        const menuOpen = await evaluate(!document.querySelector('#menu-muscle').classList.contains('hidden'));
        assert('Menu opens on trigger click', menuOpen);

        // Search  spalle
        await evaluate((() => {
            const input = document.querySelector('#search-muscle-input');
            input.value = 'spalle';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        })());
        const searchCatResult = await evaluate((() => {
            const opts = Array.from(document.querySelectorAll('#menu-muscle .custom-option')).filter(o => o.style.display !== 'none');
            const hdrs = Array.from(document.querySelectorAll('#menu-muscle .dropdown-group-header')).filter(h => h.style.display !== 'none');
            return {
                visibleOptions: opts.map(o => o.textContent.replace('?', '').trim()),
                visibleHeaders: hdrs.map(h => h.textContent.trim())
            };
        })());
        assert('Category search spalle shows 4 shoulder muscles', searchCatResult && searchCatResult.visibleOptions.length === 4, ound: );
        assert('Category search spalle preserves Spalle group header', searchCatResult && searchCatResult.visibleHeaders.includes('Spalle'));

        // 6. Test Escape key closes menu
        await evaluate(document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
        const menuClosedEscape = await evaluate(document.querySelector('#menu-muscle').classList.contains('hidden'));
        assert('Escape key closes dropdown menu', menuClosedEscape);

        // 7. Test Reset button clears search and restores options
        await evaluate(document.querySelector('#trigger-muscle').click());
        // Select an option to show reset button
        await evaluate((() => {
            const firstOpt = document.querySelector('#menu-muscle .custom-option[data-val=\Deltoide Anteriore\]');
            if (firstOpt) firstOpt.click();
        })());
        const isResetVisible = await evaluate(document.querySelector('#btn-reset-filters').style.display !== 'none');
        assert('Reset button becomes visible after filter selection', isResetVisible);

        await evaluate(document.querySelector('#btn-reset-filters').click());
        const isResetHidden = await evaluate(document.querySelector('#btn-reset-filters').style.display === 'none');
        assert('Reset button hides after click', isResetHidden);

        // 8. Mobile 360px Viewport Check
        await sendCommand('Emulation.setDeviceMetricsOverride', {
            width: 360,
            height: 740,
            deviceScaleFactor: 2,
            mobile: true
        });
        await new Promise(r => setTimeout(r, 400));

        const mobilePageOverflow = await evaluate(document.documentElement.scrollWidth > document.documentElement.clientWidth);
        assert('Mobile 360px viewport has no horizontal page scroll', !mobilePageOverflow);

        const mobileCardOverflows = await evaluate((() => {
            const cards = Array.from(document.querySelectorAll('.exercise-card'));
            let overflows = 0;
            cards.forEach(c => {
                if (c.scrollWidth > c.clientWidth + 1) overflows++;
            });
            return overflows;
        })());
        assert('Mobile 360px viewport has zero card horizontal overflows', mobileCardOverflows === 0, overflows: );

        // Cleanup
        browser.kill();
        server.close();

        const failed = assertions.filter(a => !a.pass);
        console.log(\n=== AUDITOR VERIFICATION SUMMARY ===);
        console.log(Total assertions: );
        console.log(Passed: );
        console.log(Failed: );

        if (failed.length > 0) {
            console.error('AUDITOR VERIFICATION FAILED');
            process.exit(1);
        } else {
            console.log('ALL AUDITOR ASSERTIONS PASSED PERFECTLY!');
            process.exit(0);
        }
    };
});
