# Handoff Report — explorer_scientific_hub_2

## 1. Observation

Direct code observations from the static analysis of the codebase:

*   **File Path**: `e:\Nuove App Installate\App esercizi scienze motorie\index.html`
    *   **Lines 71-77**: Main navigation structure uses anchor elements with `.nav-item` class and `data-view` attributes:
        ```html
        <nav class="main-nav">
            <a href="#" class="nav-item" data-view="catalog">Catalogo</a>
            <a href="#" class="nav-item" data-view="wizard">Programmazione</a>
            <a href="#" class="nav-item" data-view="analysis">Data Analisi</a>
            <a href="#" class="nav-item" data-view="favorites">Preferiti</a>
        </nav>
        ```
    *   **Lines 80-83**: The target mount point for view switching:
        ```html
        <main id="app-container" class="app-container">
            <!-- Content will be injected here by JS -->
            <div class="loading-state">Caricamento applicazione...</div>
        </main>
        ```

*   **File Path**: `e:\Nuove App Installate\App esercizi scienze motorie\js\app.js`
    *   **Lines 38-44**: Binds view switching on `.nav-item` click events:
        ```javascript
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                switchView(view);
            });
        });
        ```
    *   **Lines 57-67**: `switchView(viewName)` updates class `active` on `.nav-item` links and calls `renderView(viewName)`:
        ```javascript
        async function switchView(viewName) {
            state.currentView = viewName;
            navButtons.forEach(btn => {
                if (btn.dataset.view === viewName) btn.classList.add('active');
                else btn.classList.remove('active');
            });
            renderView(viewName);
        }
        ```
    *   **Lines 70-80**: `renderView(viewName)` clears `appContainer.innerHTML` and uses a `switch` statement for view rendering:
        ```javascript
        function renderView(viewName) {
            // ...
            appContainer.innerHTML = ''; // Clear current view
            switch (viewName) {
                case 'catalog':
                    // ...
        ```

*   **File Path**: `e:\Nuove App Installate\App esercizi scienze motorie\css\style.css`
    *   **Lines 1-35**: CSS Variables representing the dark mode theme:
        ```css
        :root {
            --bg-body: #0f172a;
            --bg-surface: #1e293b;
            --bg-surface-hover: #334155;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --accent: #0ea5e9;
            --border: #334155;
            --input-bg: #0f172a;
            /* ... */
        }
        ```
    *   **Lines 1611-1630**: Navigation item styling, including active styling:
        ```css
        .nav-item {
            color: var(--text-secondary);
            text-decoration: none;
            padding: 0.5rem 1rem;
            /* ... */
        }
        .nav-item.active {
            color: var(--primary);
            background-color: rgba(59, 130, 246, 0.1);
        }
        ```
    *   **Lines 264-280**: Exercise card styling, including hover effects:
        ```css
        .exercise-card {
            background-color: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 1.5rem;
            /* ... */
        }
        .exercise-card:hover {
            transform: translateY(-4px);
            border-color: var(--primary);
            box-shadow: var(--shadow-md);
        }
        ```

*   **File Path**: `e:\Nuove App Installate\App esercizi scienze motorie\js\ui.js`
    *   **Lines 1163-1230**: `window.App.renderFilters` rendering filter bar:
        ```javascript
        window.App.renderFilters = function (containerId, onFilterChange) {
            const container = document.getElementById(containerId);
            // ...
            container.innerHTML = `
                <div class="filter-bar">
                    <div class="search-group">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="filter-search" placeholder="Cerca esercizi (es. Squat, Panca)..." />
                    </div>
                    // ...
        ```
    *   **Lines 1387-1415**: `window.App.renderCatalog` creating cards:
        ```javascript
        window.App.renderCatalog = function (exercises) {
            const grid = document.getElementById('catalog-grid');
            // ...
            exercises.forEach(ex => {
                const card = document.createElement('div');
                card.className = 'exercise-card';
                // ...
        ```

## 2. Logic Chain

1. **SPA view management**: Observations in `index.html` (lines 71-77) and `js/app.js` (lines 38-44) confirm that view switching is completely driven by binding click events on `.nav-item` links and resolving their `data-view` attributes to update the application routing.
2. **Dynamic injection**: Observation in `js/app.js` (lines 70-80) shows that adding a new view simply requires adding a new `case` within the `renderView(viewName)` router block, clearing `#app-container`, and executing a custom layout render function.
3. **Coherent dark mode styling**: Observations in `css/style.css` (lines 1-35, 1611-1630, 264-280) show that all styles are defined globally using specific CSS variables (`--bg-surface`, `--primary`, `--text-secondary`, etc.). By reusing classes like `.filter-bar`, `.search-group`, `.select-group`, and `.exercise-card`, the new scientific hub will naturally inherit the responsive layouts, animations, and dark mode colors of the app.
4. **Modularity**: Creating `js/sources-data.js` and `js/scientific-hub.js` prevents cluttering existing codebase, maintaining separation of concerns while integrating seamlessly with the core controller `js/app.js` and markup in `index.html`.

## 3. Caveats

*   **Offline capability**: The new files need to be cached if the application has a Service Worker (`sw.js`). We did not analyze the asset list in `sw.js` to add the new script files to the offline cache list.
*   **External Links**: Scientific source DOIs link to `https://doi.org/...`. In a strict offline/sandboxed PWA environment, external links will require active network connections, which may fail when offline.
*   **Existing Database Mismatch**: There is no existing scientific sources dataset in `js/data.js`, so the dataset must be completely created from scratch in the implementation phase.

## 4. Conclusion

A new 'Libreria Fonti' (Scientific Hub) tab and view can be integrated without modifying the existing routing or styling core. The implementation blueprint requires:
1. Adding `<a href="#" class="nav-item" data-view="scientific_hub">Libreria Fonti</a>` to `index.html`.
2. Adding a `case 'scientific_hub'` router handler in `js/app.js` that calls a rendering script.
3. Creating `js/sources-data.js` to store a global `window.App.scientificSources` array.
4. Creating `js/scientific-hub.js` to host the filter, catalog, and detailed modal rendering methods.
5. Declaring these two new scripts in `index.html` to be loaded globally.

## 5. Verification Method

To verify the integration outline and subsequent implementation:
1. **Manual Inspection**: Open the browser console and check that `window.App` contains `renderScientificHub` and `scientificSources` once the scripts are loaded.
2. **Switching Verification**: Clicking the "Libreria Fonti" menu item should correctly trigger `switchView('scientific_hub')`, toggling the `.active` class on the nav link (turning it blue with a subtle background) and clearing `#app-container` to mount the source hero, filter bar, and grids.
3. **Filtering Verification**: Typing into the search bar or changing the dropdown select should trigger catalog updates and correctly update the meta-counter.
4. **Modal Verification**: Clicking any source card should call `window.App.openModal()` and render the key clinical recommendations list.
