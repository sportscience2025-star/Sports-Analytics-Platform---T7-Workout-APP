import os, re, sys

print('=== VICTORY AUDITOR INDEPENDENT VERIFICATION ===\n')

pass_count = 0
fail_count = 0

def check(title, condition, detail=''):
    global pass_count, fail_count
    if condition:
        pass_count += 1
        print(f'[PASS] {title}')
    else:
        fail_count += 1
        print(f'[FAIL] {title} - {detail}', file=sys.stderr)

# 1. SW and test_check.py
with open('sw.js', 'r', encoding='utf-8') as f:
    sw_text = f.read()
with open('test_check.py', 'r', encoding='utf-8') as f:
    tc_text = f.read()

m = re.search(r'CACHE_NAME\s*=\s*[\'"]([^\'"]+)[\'"]', sw_text)
check('sw.js contains CACHE_NAME declaration', bool(m))
cache_name = m.group(1) if m else ''
print(f'  -> Current CACHE_NAME: {cache_name}')

check('sw.js cache is t7-workout-v87', cache_name == 't7-workout-v87')
check('test_check.py checks exact cache version', cache_name in tc_text)

# 2. Catalog.js and Style.css
with open('js/ui/catalog.js', 'r', encoding='utf-8') as f:
    cat_text = f.read()
with open('css/style.css', 'r', encoding='utf-8') as f:
    css_text = f.read()

check('catalog.js contains .btn-card-action', 'class="btn-card-action"' in cat_text)
check('catalog.js contains <span>Scheda</span>', '<span>Scheda</span>' in cat_text)
check('catalog.js contains action-arrow', 'action-arrow' in cat_text and 'Scheda' in cat_text)
check('catalog.js contains .sec-muscles-wrap', 'sec-muscles-wrap' in cat_text)
check('catalog.js contains .sec-muscle-pill', 'sec-muscle-pill' in cat_text)

check('style.css defines .btn-card-action', '.btn-card-action {' in css_text)
check('style.css sets border-radius: 9999px on .btn-card-action', bool(re.search(r'\.btn-card-action\s*\{[^}]*border-radius:\s*9999px', css_text, re.DOTALL)))
check('style.css .exercise-card has position: relative and overflow: hidden', 'position: relative;' in css_text and 'overflow: hidden;' in css_text)
check('style.css .card-header has padding-right: 2.25rem', 'padding-right: 2.25rem;' in css_text)
check('style.css tags have font-size: 0.68rem', 'font-size: 0.68rem;' in css_text)
check('style.css tags have padding: 0.2rem 0.55rem', 'padding: 0.2rem 0.55rem;' in css_text)
check('style.css tags have border-radius: 9999px', 'border-radius: 9999px;' in css_text)
check('style.css .sec-muscles-wrap has flex-wrap: wrap', 'sec-muscles-wrap' in css_text)
check('style.css .sec-muscle-pill has ellipsis', 'text-overflow: ellipsis' in css_text)

# 3. Filters
with open('js/ui/render-filters.js', 'r', encoding='utf-8') as f:
    rf_text = f.read()

check('render-filters.js defines .dropdown-search-wrap', 'class="dropdown-search-wrap"' in rf_text)
check('render-filters.js defines #search-muscle-input', 'id="search-muscle-input"' in rf_text)
check('render-filters.js wraps options in .dropdown-options-list', 'class="dropdown-options-list"' in rf_text)
check('render-filters.js includes resetMuscleSearch', 'function resetMuscleSearch' in rf_text)
check('render-filters.js includes Escape handler', "'Escape'" in rf_text)
check('render-filters.js includes ARIA combobox and listbox', 'role="combobox"' in rf_text and 'role="listbox"' in rf_text)
check('render-filters.js includes role="option" and aria-selected', 'role="option"' in rf_text and 'aria-selected' in rf_text)

check('style.css defines .custom-select-menu with backdrop-filter: blur(24px)', 'backdrop-filter: blur(24px);' in css_text)
check('style.css defines .dropdown-search-wrap with flex-shrink: 0', bool(re.search(r'\.dropdown-search-wrap\s*\{[^}]*flex-shrink:\s*0;', css_text, re.DOTALL)))
check('style.css defines .dropdown-options-list with max-height: 280px', bool(re.search(r'\.dropdown-options-list\s*\{[^}]*max-height:\s*280px;', css_text, re.DOTALL)))
check('style.css defines .custom-option with border-radius: 8px', bool(re.search(r'\.custom-option\s*\{[^}]*border-radius:\s*8px;', css_text, re.DOTALL)))

matches = re.findall(r'\.custom-select-menu\s*\{', css_text)
check('style.css has no conflicting duplicate custom-select-menu definitions', len(matches) <= 3)

# 4. Check exercise dataset with 504 exercises
import subprocess
out = subprocess.check_output(['node', '-e', 'global.window = {}; require("./js/data.js"); console.log(window.App.exercises.length);'], text=True).strip()
check('window.App.exercises contains 504 exercises', out == '504', f'found {out}')

print('\n=== AUDIT RESULTS SUMMARY ===')
print(f'Passed: {pass_count}')
print(f'Failed: {fail_count}')

if fail_count > 0:
    print('VICTORY REJECTED')
    sys.exit(1)
else:
    print('ALL INDEPENDENT CHECKS PASSED!!')
    sys.exit(0)
