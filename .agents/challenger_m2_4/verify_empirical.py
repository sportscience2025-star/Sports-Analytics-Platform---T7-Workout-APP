import os
import re
import json

def verify_codebase():
    base_dir = r"e:\Nuove App Installate\App esercizi scienze motorie"
    js_analysis_path = os.path.join(base_dir, "js", "data-analysis.js")
    js_app_path = os.path.join(base_dir, "js", "app.js")
    css_path = os.path.join(base_dir, "css", "style.css")
    html_path = os.path.join(base_dir, "index.html")

    results = {}

    # 1. Verify cleanup() method & lifecycle
    with open(js_analysis_path, 'r', encoding='utf-8') as f:
        js_analysis = f.read()
    
    with open(js_app_path, 'r', encoding='utf-8') as f:
        js_app = f.read()

    # Check cleanup method definition
    cleanup_match = re.search(r'cleanup\s*\(\)\s*\{([^}]+chartjs-glass-tooltip[^}]+)\}', js_analysis, re.DOTALL)
    results['cleanup_defined'] = bool(cleanup_match)
    if cleanup_match:
        cleanup_body = cleanup_match.group(1)
        results['cleanup_tooltip_removal'] = 'chartjs-glass-tooltip' in cleanup_body and '.remove()' in cleanup_body
        results['cleanup_chartInstance_destroy'] = 'this.chartInstance.destroy()' in cleanup_body
        results['cleanup_powerCurveChart_destroy'] = 'this.powerCurveChart.destroy()' in cleanup_body
        results['cleanup_jumpHeightChart_destroy'] = 'this.jumpHeightChart.destroy()' in cleanup_body
        results['cleanup_rsiChart_destroy'] = 'this.rsiChart.destroy()' in cleanup_body
    
    # Check calls to cleanup in render dashboards
    results['renderVBT_calls_cleanup'] = bool(re.search(r'renderVBTDashboard[^{]+\{\s*this\.cleanup\(\);', js_analysis))
    results['renderRunning_calls_cleanup'] = bool(re.search(r'renderRunningDashboard[^{]+\{\s*this\.cleanup\(\);', js_analysis))
    results['renderJump_calls_cleanup'] = bool(re.search(r'renderJumpDashboard[^{]+\{\s*this\.cleanup\(\);', js_analysis))

    # Check app.js view switching cleanup
    results['app_view_switch_calls_cleanup'] = 'state.analysisUI.cleanup()' in js_app

    # 2. Glass Tooltip Handler creation & removal
    results['tooltip_created_in_body'] = 'document.body.appendChild(tooltipEl)' in js_analysis
    results['tooltip_id_matches'] = "tooltipEl.id = 'chartjs-glass-tooltip'" in js_analysis

    # 3. Canvas rsi-trials-chart preservation on empty Drop Jump data
    rsi_canvas_in_html = '<canvas id="rsi-trials-chart"></canvas>' in js_analysis
    rsi_empty_logic = re.search(r'const canvas = document\.getElementById\(\'rsi-trials-chart\'\);[^\n]*\n[^\n]*canvas\.style\.display = \'none\';', js_analysis)
    results['rsi_canvas_in_template'] = rsi_canvas_in_html
    results['rsi_canvas_hidden_not_removed'] = bool(rsi_empty_logic)

    # 4. CSS Verification for .app-header and .modal-backdrop
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()

    app_header_match = re.search(r'\.app-header\s*\{([^}]+)\}', css)
    modal_backdrop_match = re.search(r'\.modal-backdrop\s*\{([^}]+)\}', css)

    results['css_app_header_exists'] = bool(app_header_match)
    if app_header_match:
        body = app_header_match.group(1)
        results['app_header_webkit_backdrop'] = '-webkit-backdrop-filter: blur(10px)' in body
        results['app_header_backdrop'] = 'backdrop-filter: blur(10px)' in body
        results['app_header_sticky'] = 'position: sticky' in body

    results['css_modal_backdrop_exists'] = bool(modal_backdrop_match)
    if modal_backdrop_match:
        body = modal_backdrop_match.group(1)
        results['modal_backdrop_webkit_backdrop'] = '-webkit-backdrop-filter: blur(4px)' in body
        results['modal_backdrop_backdrop'] = 'backdrop-filter: blur(4px)' in body
        results['modal_backdrop_fixed'] = 'position: fixed' in body

    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    verify_codebase()
