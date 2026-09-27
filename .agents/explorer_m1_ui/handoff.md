# Handoff Report — Explorer 1 (Milestone 1: Requirement R1 - UI Filtering Simplification)

## 1. Observation

### Quick Filter Buttons ("Category Quick-Pills")
- **File Path**: `js/ui.js`
- **Function**: `window.App.renderFilters = function (containerId, onFilterChange)` (lines 1311–1650)
- **Configuration Data** (lines 1327–1335):
  ```js
  const categoryPills = [
      { id: 'all', label: 'Tutti', icon: '' },
      { id: 'Chest', label: 'Pettorali', key: 'Chest' },
      { id: 'Back', label: 'Schiena', key: 'Back' },
      { id: 'Legs', label: 'Gambe', key: 'Legs' },
      { id: 'Shoulders', label: 'Spalle', key: 'Shoulders' },
      { id: 'Arms', label: 'Braccia', key: 'Arms' },
      { id: 'Core', label: 'Core', key: 'Core' }
  ];
  ```
- **HTML Template Generation** (lines 1337–1346):
  ```js
  const pillsHtml = `
      <div class="category-pills-bar">
          ${categoryPills.map(p => `
              <button type="button" class="category-pill-btn ${p.id === 'all' ? 'active' : ''}" data-category-pill="${p.id}">
                  ${p.label}
              </button>
          `).join('')}
      </div>
  `;
  ```
  Injected into `.catalog-filter-wrapper` at line 1378: `${pillsHtml}`.
- **DOM Elements**:
  - Container: `<div class="category-pills-bar">`
  - Buttons: `<button class="category-pill-btn" data-category-pill="...">`
- **Event Listeners & Interaction** (lines 1504–1529):
  ```js
  const pillBtns = container.querySelectorAll('.category-pill-btn');
  pillBtns.forEach(btn => {
      btn.addEventListener('click', () => {
          pillBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const catId = btn.dataset.categoryPill;
          if (catId === 'all') {
              currentFilters.muscle = 'all';
          } else {
              const catGroup = taxonomy[catId];
              if (catGroup && catGroup.muscles && catGroup.muscles.length > 0) {
                  currentFilters.muscle = catGroup.muscles[0];
              } else {
                  currentFilters.muscle = 'all';
              }
          }
          updateCustomSelectUI('muscle', currentFilters.muscle);
          notifyChange();
      });
  });
  ```
- **Reset Listener interaction** (line 1636):
  ```js
  pillBtns.forEach(b => b.classList.toggle('active', b.dataset.categoryPill === 'all'));
  ```
- **CSS Styling** (`css/style.css`, lines 3254–3300):
  - `.category-pills-bar` (flex layout, horizontal overflow scrolling)
  - `.category-pill-btn`, `.category-pill-btn:hover`, `.category-pill-btn.active` (rounded pills with glassmorphism styling).

---

### Muscle Dropdown Menu ("Muscolo: ...")
- **File Path**: `js/ui.js`
- **Function**: `window.App.renderFilters` (lines 1311–1650)
- **Data Source**: `window.App.MUSCLE_TAXONOMY` loaded from `js/data.js` (lines 12130+).
- **HTML Template Generation** (lines 1388–1412):
  ```html
  <div class="custom-select-container" id="container-muscle">
      <button type="button" class="custom-select-trigger" id="trigger-muscle">
          <span class="trigger-text">Muscolo: Tutti</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
      <div class="custom-select-menu hidden" id="menu-muscle">
          <div class="dropdown-search-wrap">
              <input type="text" class="dropdown-search-input" id="search-muscle-input" placeholder="Cerca muscolo..." />
          </div>
          <div class="custom-option selected" data-val="all">
              <span>Tutti i Muscoli</span>
              <span class="check-icon">✓</span>
          </div>
          ${Object.keys(taxonomy).map(key => `
              <div class="dropdown-group-header">${taxonomy[key].label}</div>
              ${taxonomy[key].muscles.map(m => `
                  <div class="custom-option" data-val="${m}">
                      <span>${m}</span>
                      <span class="check-icon">✓</span>
                  </div>
              `).join('')}
          `).join('')}
      </div>
  </div>
  ```
- **DOM Elements**:
  - Container: `#container-muscle` (`.custom-select-container`)
  - Trigger Button: `#trigger-muscle` (`.custom-select-trigger`)
  - Label Text: `.trigger-text` inside `#trigger-muscle` (displays `"Muscolo: Tutti"` or `"Muscolo: <MuscleName>"`)
  - Menu: `#menu-muscle` (`.custom-select-menu`)
  - Search Input: `#search-muscle-input` (`.dropdown-search-input`)
  - Options: `.custom-option` with `data-val="..."`.
- **Event Listeners & Interaction** (lines 1531–1621):
  - Manages opening/closing dropdowns, handling option selection, updating `currentFilters.muscle`, updating trigger UI via `updateCustomSelectUI('muscle', selectedVal)`, filtering dropdown items via `#search-muscle-input`, and calling `notifyChange()`.

---

### External Callers & Query Engine
- **`js/app.js`** (lines 130–145, 246–275):
  - Calls `window.App.renderFilters('filter-container', callback)` for both the main exercise Catalog view and the Favorites view.
  - Receives `filters` object containing `filters.muscle` and passes it to `window.App.getExercises(filters)`.
- **`js/data.js`** (lines 12233–12238):
  - `window.App.getExercises(filters)` filters exercises based on `filters.muscle`:
    ```js
    if (filters.muscle && filters.muscle !== 'all') {
        results = results.filter(ex =>
            ex.primaryMuscle === filters.muscle ||
            (ex.muscles && ex.muscles.includes(filters.muscle))
        );
    }
    ```

---

## 2. Logic Chain

1. **Separation of Filtering UI**: The quick filter buttons (`.category-pills-bar`) and the muscle dropdown (`#container-muscle`) are both rendered inside `window.App.renderFilters` in `js/ui.js`.
2. **Independent State Handling**: Clicking a quick filter pill updated `currentFilters.muscle` and called `updateCustomSelectUI('muscle', currentFilters.muscle)`. The dropdown itself independently manages `currentFilters.muscle` through its own `.custom-option` click handlers.
3. **Decoupled Engine**: Neither `js/app.js` nor `js/data.js` rely on the existence of `.category-pills-bar` or `.category-pill-btn`. They only read `filters.muscle` from the state object emitted by `onFilterChange`.
4. **Clean Removal**: Therefore, removing the HTML generation, configuration array, and event listeners for `.category-pills-bar` from `js/ui.js` will leave the muscle dropdown menu 100% functional without affecting any backend filtering or catalog rendering.

---

## 3. Caveats
- **CSS Cleanliness**: While removing `.category-pills-bar` and `.category-pill-btn` from `js/ui.js` immediately hides the element, the unused CSS rules in `css/style.css` (lines 3254–3300) should also be cleaned up to prevent orphan styles.
- **Service Worker Cache**: Any changes to `js/ui.js` or `css/style.css` require incrementing the cache version in `sw.js` per project rule `AGENTS.md` so clients get the updated UI immediately.

---

## 4. Conclusion & Recommended Fix Strategy

### Goal
Remove the horizontal quick filter buttons row while preserving full functionality of the "Muscolo: ..." custom dropdown menu.

### Concrete Modification Steps for Implementer:

1. **Edit `js/ui.js`**:
   - Delete `categoryPills` array (lines 1327–1335).
   - Delete `pillsHtml` variable definition (lines 1337–1346).
   - Remove `${pillsHtml}` line from `container.innerHTML` template literal (line 1378).
   - Delete Section 2 "Category Pills binding" event listener block (lines 1504–1529).
   - In Reset button listener, remove line 1636: `pillBtns.forEach(b => b.classList.toggle('active', b.dataset.categoryPill === 'all'));`.

2. **Edit `css/style.css`**:
   - Remove unused styling block for `.category-pills-bar` and `.category-pill-btn` (lines 3254–3300).

3. **Bump SW Cache in `sw.js`**:
   - Increment cache name (e.g. `const CACHE_NAME = 't7-workout-v15';` -> `'t7-workout-v16'`).

---

## 5. Verification Method

To independently verify after implementation:
1. **Syntax Check**: Run `py test_check.py` to verify JS balance and formatting.
2. **Test Suite**: Run `py run_all_js_tests.py` to verify no regressions in JS test suites.
3. **UI Inspection**: Load the Catalog view (`#catalog-view`) and verify:
   - The quick filter pills ("Pettorali", "Schiena", etc.) are completely absent above the search bar.
   - Clicking "Muscolo: Tutti" opens the custom muscle dropdown.
   - Selecting any muscle (e.g. "Pettorale Maggiore") correctly filters the catalog grid and updates trigger text to "Muscolo: Pettorale Maggiore".
   - Clicking "Reset" clears the filter back to "Muscolo: Tutti".
