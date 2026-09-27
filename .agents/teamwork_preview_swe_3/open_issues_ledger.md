# Open Issues Ledger

- [Round 3] Unverified aspect: Physical multi-touch drag/tap latency on low-end mobile devices (simulated via Node/jsdom event dispatch).
- [Round 3] Unverified aspect: Production service worker lifecycle in live Chromium/WebKit PWA standalone window (verified via static syntax check and cache version alignment).
- [Round 3] Unverified aspect: Visual pixel rendering in physical iOS Safari hardware or Android WebView devices.
- [Round 3] Known issue: jsdom tests do not calculate real CSS layout dimensions or bounding client rects (e.g. clientWidth < 540px media query rendering).
- [Round 3] Known issue: LocalStorage in Safari Private Browsing mode could theoretically throw if storage quota is 0, though existing app helpers wrap storage access in try/catch blocks.
