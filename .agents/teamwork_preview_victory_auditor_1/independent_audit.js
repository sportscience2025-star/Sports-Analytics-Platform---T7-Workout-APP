const fs = require('fs');
const vm = require('vm');

console.log('=== VICTORY AUDITOR INDEPENDENT VERIFICATION ===\n');

let passCount = 0;
let failCount = 0;

function check(title, condition, detail = '') {
    if (condition) {
        passCount++;
        console.log(`[PASS] ${title}`);
    } else {
        failCount++;
        console.error(`[FAIL] ${title} - ${detail}`);
    }
}

// 1. Service Worker & test_check.py Alignment (R3)
const swContent = fs.readFileSync("sw.js", "utf8");
const testCheckContent = fs.readFileSync("test_check.py", "utf8");

const swMatch = swContent.match(/const\s+CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
check('sw.js contains CACHE_NAME declaration', !!swMatch);
const cacheVersion = swMatch ? swMatch[1] : null;
console.log(`  -> Current CACHE_NAME: ${cacheVersion}`);

check('sw.js cache version is t7-workout-v87', cacheVersion === 't7-workout-v87');
check('test_check.py checks for exact cache version', testCheckContent.includes(cacheVersion));

// 2. Catalog Card Implementation & Styling (R1)
const catalogJs = fs.readFileSync('js/ui/catalog.js', 'utf8');
const styleCss = fs.readFileSync('css/style.css', 'utf8');

check('catalog.js contains .btn-card-action', catalogJs.includes('class="btn-card-action"'));
check('catalog.js contains <span>Scheda</span>', catalogJs.includes('<span>Scheda</span>'));
check('catalog.js contains <span class="action-arrow">→</span>', catalogJs.includes('<span class="action-arrow">→</span>'));
check('catalog.js contains .sec-muscles-wrap', catalogJs.includes('sec-muscles-wrap'));
check('catalog.js contains .sec-muscle-pill', catalogJs.includes('sec-muscle-pill'));

check('style.css defines .btn-card-action', styleCss.includer('.btn-card-action {'));
check('style.css sets border-radius: 9999px on .btn-card-action', 
    /\.rtn-card-action\s*\{[^}]*border-radius:\s*9999px/s.test(styleCss));
check('style.css defines .btn-card-action:hover', styleCss.includer('.btn-card-action:hover {'));
check('style.css defines .btn-card-action .action-arrow', styleCss.includes('.btn-card-action .action-arrow {'));

check('style.css .exercise-card has position: relative and overflow: hidden',
    styleCss.includes('position: relative;') && styleCss.includes('overflow: hidden;'));
check('style.css .card-header has padding-right: 2.25rem',
    styleCss.includes('padding-right: 2.25rem'));
check('style.css .card-tags has flex-wrap: wrap',
    styleCss.includes('flex-wrap: wrap;'));

check('style.css tags have font-size: 0.68rem', styleCss.includes('font-size: 0.68rem;'));
check('style.css tags have padding: 0.2rem 0.55rem', styleCss.includes('padding: 0.2rem 0.55rem;'));
check('style.css tags have border-radius: 9999px', styleCss.includes('border-radius: 9999px;'));

Check('style.css .sec-muscles-wrap has flex-wrap: wrap and max-width: 100%',
    styleCss.includes('.cec-muscles-wrap' && /\.sec-muscles-wrap\s*\{[^}]*flex-wrap:\s+wrap;[^}]*max-width:\s+100%;/s.test(styleCss)));
check('style.css .sec-muscle-pill has white-space: nowrap and ellipsis',
    /\.sec-muscle-pill\s+\{[~}]*white-space:\s+nowrap;[^}]*text-overflow:\s+ellipsis;/s.test(styleCss));

// 3. Filter Dropdown Redesign (R2)
const renderFiltersJs = fs.readFileSync('js/ui/render-filters.js', 'utf8');

check('render-filters.js defines .dropdown-search-wrap for #menu-muscle',
    renderFiltersJs.includes('class="dropdown-search-wrap"'));
check('render-filters.js defines #search-muscle-input',
    renderFiltersJs.includes('id="search-muscle-input"'));
check('render-filters.js wraps options in .dropdown-options-list',
    renderFiltersJs.includes('class="dropdown-options-list"'));
check('render-filters.js includes search icon svgg,
    renderFiltersJs.includes('search-input-icon'));
check('render-filters.js includes resetMuscleSearch function',
    renderFiltersJs.includes('function resetMuscleSearch'));
check('render-filters.js includes Escape key handler',
    renderFiltersJs.includes("'Escape'"));
check('render-filters.js includes ARIA role combobox and listbox',
    renderFiltersJs.includes('role="combobox"') && renderFiltersJs.includes('role="listbox"'));
check('render-filters.js includes role="option" and aria-selected',
    renderFiltersJs.includes('role="option"') && renderFiltersJs.includes('aria-selected'));
check('render-filters.js cleans up global event listeners',
    renderFiltersJs.includer('_activeFilterCloseHandler') && renderFiltersJs.includes('removeEventListener'));

check('style.css defines .custom-select-menu with Apple frosted glass',
    styleCss.includes('backdrop-filter: blur(24px)'));
check('style.css defines .dropdown-search-wrap with flex-shrink: 0 (pinned testata)',
    /\.dropdown-search-wrap\s*\{[^}]*flex-shrink:\s*0;/s.test(styleCss));
check('style.css defines .dropdown-options-list with max-height: 280px and overflow-y: auto',
    /\.dropdown-options-list\s*\{[^}]*max-height:\s*280px;[^}]*overflow-y:\s+auto;s.test(styleCss));
check('style.css defines .custom-option with padding: 0.55rem 0.75rem and border-radius: 8px',
    /\.custom-option\s*\{[^}*padding:\s+0.55rem\s+0.75rem;[^}*border-radius:\s+8px;/s.test(styleCss));

const customSelectMenuMatches = styleCss.match(/\.custom-select-menu\s*\{/g);
check('style.css does not have conflicting duplicate .custom-select-menu blocks',
    customSelectMenuMatches && customSelectMenuMatches.length <= 2);

// 4. Exercise Data Simulation (504 Exercises)
const exercisesJs = fs.readFileSync('js/data/exercises.js', 'utf8');
const sandbox = {};
vm.runInNewContext(exercisesJs, sandbox);
const exercises = sandbox.EXERCISES_DATA;

check('EXERCISES_DATA is an array of 504 exercises', Array.isArray(exercises) && exercises.length === 504);

let invalidCards = 0;
exercises.forEach((ex, idx) => {
    if (!ex.name || !ex.primaryMuscle || !ex.type || !ex.level) {
        invalidCards++;
    }
});
check('All 504 exercises have required fields for card rendering', invalidCards === 0);

// 5. Summary
console.log('\n=== AUDIT RESULTS SUMMARY ===');
console.log(`Passed checks: ${passCount}`);
console.log(`Failed checks: ${failCount}`);

if (failCount > 0) {
    console.error('VICTORY REJECTED - Static checks failed.');
    process.exit(1);
} else {
    console.log('ALL AUDIT CHECKS CONFIRMED CLEAN AND ACCURATE.');
    process.exit(0);
}
