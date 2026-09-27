# Changes made to resolve RAG UI Adversarial test failure

## 1. Fixed Path Resolution in `tests/test_rag_ui_adversarial.js`
Changed hardcoded relative paths to root-relative paths using `path.join(__dirname, '..', ...)` to correctly resolve files loaded from the headless browser iframe:
- Line 56: `fs.readFileSync('js/rag-engine.js', 'utf8')` -> `fs.readFileSync(path.join(__dirname, '..', 'js', 'rag-engine.js'), 'utf8')`
- Line 60: `fs.readFileSync('js/rag-ui.js', 'utf8')` -> `fs.readFileSync(path.join(__dirname, '..', 'js', 'rag-ui.js'), 'utf8')`
- Line 107: `fs.readFileSync('css/style.css', 'utf8')` -> `fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8')`

## 2. Fixed Test Runner Duplicate Results / Race Conditions
Headless browser executions of the test suite experienced a race condition where a failed synchronous test (`test_vbt_fallbacks.js`) posted duplicate messages before the runner loaded the next test (`test_rag_ui_adversarial.js`), causing the runner to erroneously assign the logs of the failed test to the RAG UI test. We fixed this with:
- **`tests/iframe_runner.html`**: Added `testFile` parameter to the posted message in `reportResult` to allow the parent runner to match results precisely.
- **`tests/runner.html`**: Updated the message listener to identify test results by `result.testFile`, ignore duplicate messages for already resolved tests, and added a cache-busting timestamp parameter `t` to the iframe `src` load URL.

## 3. Prevented Browser & Service Worker Caching of Test Suite Scripts
To guarantee Edge does not serve stale cached versions of the test runner or scripts, we implemented:
- **`sw.js`**: Bumped Service Worker cache name to `t7-workout-v43` and added a fetch bypass rule to skip intercepting/caching any request containing `/tests/`.
- **`verify_tests.py`**: Added HTTP Cache-Control headers to the HTTP server response (`no-store, no-cache, must-revalidate`), cleared the Edge local profile directory `tmp_edge_user_data_verify`, and added `--disable-http-cache` and `--no-sandbox` arguments to the browser invocation command.
