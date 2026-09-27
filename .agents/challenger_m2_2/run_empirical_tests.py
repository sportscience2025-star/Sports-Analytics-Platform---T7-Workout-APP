import os
import re
import sys
import json
import subprocess

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = r'e:\Nuove App Installate\App esercizi scienze motorie'
CSS_PATH = os.path.join(PROJECT_ROOT, 'css', 'style.css')
JS_ANALYSIS_PATH = os.path.join(PROJECT_ROOT, 'js', 'data-analysis.js')
CHROME_PATH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

print("=" * 60)
print("🔬 EMPIRICAL VERIFICATION HARNESS — MILESTONE 2.2")
print("=" * 60)

test_results = []

def record_test(name, passed, details):
    status = "PASS" if passed else "FAIL"
    test_results.append({"name": name, "passed": passed, "details": details})
    print(f"[{status}] {name}")
    print(f"       Details: {details}\n")

# ---------------------------------------------------------
# TEST 1: Responsive Layout Breakpoints (360px vs 280px)
# ---------------------------------------------------------
try:
    with open(CSS_PATH, 'r', encoding='utf-8') as f:
        css_content = f.read()

    container_default_match = re.search(r'\.chart-canvas-container\s*\{[^}]*height:\s*360px;', css_content)
    media_match = re.search(r'@media\s*\(\s*max-width:\s*768px\s*\)\s*\{[^}]*\.chart-canvas-container\s*\{[^}]*height:\s*280px;', css_content, re.DOTALL)
    
    if container_default_match and media_match:
        record_test("Responsive Layout Breakpoints CSS", True, 
                    "Found default .chart-canvas-container height: 360px and @media (max-width: 768px) height: 280px.")
    else:
        record_test("Responsive Layout Breakpoints CSS", False, 
                    f"Default match: {bool(container_default_match)}, Media match: {bool(media_match)}")
except Exception as e:
    record_test("Responsive Layout Breakpoints CSS", False, f"Exception: {e}")

# ---------------------------------------------------------
# TEST 2: Empty & Single-Point Dataset Chart Updates Handling
# ---------------------------------------------------------
try:
    with open(JS_ANALYSIS_PATH, 'r', encoding='utf-8') as f:
        js_content = f.read()

    vbt_empty_check = "vbtData.length < 2" in js_content and "Dati VBT insufficienti" in js_content
    rsi_empty_check = "djRSIs.length > 0" in js_content and "Nessun dato Drop Jump per tracciare l'andamento RSI" in js_content

    if vbt_empty_check and rsi_empty_check:
        record_test("Empty & Single-Point Chart Update Guardrails", True,
                    "Verified vbtData.length < 2 guard (shows warning for 0 or 1 point) and djRSIs.length > 0 check for fallback rendering.")
    else:
        record_test("Empty & Single-Point Chart Update Guardrails", False,
                    f"VBT Guard: {vbt_empty_check}, RSI Guard: {rsi_empty_check}")
except Exception as e:
    record_test("Empty & Single-Point Chart Update Guardrails", False, f"Exception: {e}")

# ---------------------------------------------------------
# TEST 3: Glassmorphism Tooltip Properties
# ---------------------------------------------------------
try:
    backdrop_blur = "backdrop-filter: blur(16px)" in css_content or "-webkit-backdrop-filter: blur(16px)" in css_content
    shadow_prop = "box-shadow: 0 12px 32px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)" in css_content
    bg_prop = "background: rgba(15, 23, 42, 0.85)" in css_content
    class_tooltip = ".glass-tooltip" in css_content
    js_tooltip_handler = "glassTooltipHandler" in js_content and "chartjs-glass-tooltip" in js_content

    if backdrop_blur and shadow_prop and bg_prop and class_tooltip and js_tooltip_handler:
        record_test("Glassmorphism Tooltip Specifications", True,
                    "Verified .glass-tooltip CSS rules (backdrop-filter: blur(16px), background rgba(15,23,42,0.85), dual box-shadow) and custom external tooltip handler.")
    else:
        record_test("Glassmorphism Tooltip Specifications", False,
                    f"Blur: {backdrop_blur}, Shadow: {shadow_prop}, BG: {bg_prop}, Handler: {js_tooltip_handler}")
except Exception as e:
    record_test("Glassmorphism Tooltip Specifications", False, f"Exception: {e}")

# ---------------------------------------------------------
# TEST 4: Neon Glow Shadow Plugin Properties
# ---------------------------------------------------------
try:
    plugin_def = "const neonGlowPlugin = {" in js_content and "id: 'neonGlow'" in js_content
    shadow_color_set = "ctx.shadowColor = glowColor" in js_content
    shadow_blur_set = "ctx.shadowBlur = glowBlur" in js_content
    shadow_offset_x = "ctx.shadowOffsetX = 0" in js_content
    shadow_offset_y = "ctx.shadowOffsetY = 0" in js_content
    before_draw = "beforeDatasetDraw(chart, args)" in js_content
    after_draw = "afterDatasetDraw(chart, args)" in js_content

    chart_instances_glow = js_content.count("glowColor:")

    if plugin_def and shadow_color_set and shadow_blur_set and shadow_offset_x and shadow_offset_y and before_draw and after_draw and chart_instances_glow >= 8:
        record_test("Neon Glow Shadow Plugin & Canvas Properties", True,
                    f"Verified neonGlowPlugin structure, Canvas 2D shadow properties (shadowColor, shadowBlur, shadowOffsetX/Y=0), and {chart_instances_glow} dataset glow instances across charts.")
    else:
        record_test("Neon Glow Shadow Plugin & Canvas Properties", False,
                    f"PluginDef: {plugin_def}, ShadowColor: {shadow_color_set}, GlowInstances: {chart_instances_glow}")
except Exception as e:
    record_test("Neon Glow Shadow Plugin & Canvas Properties", False, f"Exception: {e}")

# Save json report in agent folder
with open(os.path.join(PROJECT_ROOT, '.agents', 'challenger_m2_2', 'test_results.json'), 'w', encoding='utf-8') as f:
    json.dump(test_results, f, indent=2)

print("=" * 60)
passed_cnt = sum(1 for t in test_results if t['passed'])
total_cnt = len(test_results)
print(f"RESULTS: {passed_cnt}/{total_cnt} TESTS PASSED")
print("=" * 60)
