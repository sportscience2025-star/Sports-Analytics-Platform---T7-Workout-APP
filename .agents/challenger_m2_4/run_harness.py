import os
import re
import json

def run_rigorous_analysis():
    base_dir = r"e:\Nuove App Installate\App esercizi scienze motorie"
    js_analysis_path = os.path.join(base_dir, "js", "data-analysis.js")
    js_app_path = os.path.join(base_dir, "js", "app.js")
    css_path = os.path.join(base_dir, "css", "style.css")

    with open(js_analysis_path, 'r', encoding='utf-8') as f:
        js_analysis = f.read()
    with open(js_app_path, 'r', encoding='utf-8') as f:
        js_app = f.read()
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()

    report = {}

    # Extract cleanup method using balanced brace matching
    start_idx = js_analysis.find("cleanup()")
    if start_idx != -1:
        brace_start = js_analysis.find("{", start_idx)
        depth = 0
        end_idx = brace_start
        for i in range(brace_start, len(js_analysis)):
            if js_analysis[i] == '{':
                depth += 1
            elif js_analysis[i] == '}':
                depth -= 1
                if depth == 0:
                    end_idx = i
                    break
        cleanup_body = js_analysis[brace_start:end_idx+1]
        report['cleanup_body'] = cleanup_body
        report['destroys_chartInstance'] = 'this.chartInstance.destroy()' in cleanup_body
        report['destroys_powerCurveChart'] = 'this.powerCurveChart.destroy()' in cleanup_body
        report['destroys_jumpHeightChart'] = 'this.jumpHeightChart.destroy()' in cleanup_body
        report['destroys_rsiChart'] = 'this.rsiChart.destroy()' in cleanup_body
        report['removes_glass_tooltip'] = "document.getElementById('chartjs-glass-tooltip')" in cleanup_body and "tooltipEl.remove()" in cleanup_body

    # Check invocations of cleanup
    report['renderVBTDashboard_invokes_cleanup'] = "renderVBTDashboard(data, athlete, exercise) {\n            this.cleanup();" in js_analysis or "renderVBTDashboard(data, athlete, exercise) {\r\n            this.cleanup();" in js_analysis or bool(re.search(r'renderVBTDashboard\s*\([^)]*\)\s*\{\s*this\.cleanup\(\);', js_analysis))
    report['renderRunningDashboard_invokes_cleanup'] = bool(re.search(r'renderRunningDashboard\s*\([^)]*\)\s*\{\s*this\.cleanup\(\);', js_analysis))
    report['renderJumpDashboard_invokes_cleanup'] = bool(re.search(r'renderJumpDashboard\s*\([^)]*\)\s*\{\s*this\.cleanup\(\);', js_analysis))
    report['app_renderView_invokes_cleanup'] = "state.analysisUI.cleanup()" in js_app

    # Check Glass Tooltip creation in body
    report['glass_tooltip_creation'] = "document.createElement('div')" in js_analysis and "tooltipEl.id = 'chartjs-glass-tooltip'" in js_analysis and "document.body.appendChild(tooltipEl)" in js_analysis

    # Check RSI canvas preservation in DOM tree when DJ is empty
    rsi_section_match = re.search(r'const ctxRsi = document\.getElementById\(\'rsi-trials-chart\'\)[\s\S]*?options:', js_analysis)
    if rsi_section_match:
        rsi_code = rsi_section_match.group(0)
        report['rsi_canvas_empty_handled'] = "canvas.style.display = 'none'" in rsi_code and "canvas.parentElement.appendChild" in rsi_code
        report['rsi_canvas_not_removed_via_remove'] = "canvas.remove()" not in rsi_code and "canvas.parentElement.removeChild" not in rsi_code

    # Check CSS rules
    app_header_match = re.search(r'\.app-header\s*\{([^}]+)\}', css)
    if app_header_match:
        header_css = app_header_match.group(1)
        report['app_header_css'] = {
            'position_sticky': 'position: sticky;' in header_css or 'position:sticky;' in header_css or 'position: sticky' in header_css,
            'top_0': 'top: 0' in header_css,
            'z_index_100': 'z-index: 100' in header_css,
            'webkit_backdrop_filter': '-webkit-backdrop-filter: blur(10px)' in header_css,
            'backdrop_filter': 'backdrop-filter: blur(10px)' in header_css,
            'background_color_rgba': 'background-color: rgba(30, 41, 59, 0.95)' in header_css
        }

    modal_backdrop_match = re.search(r'\.modal-backdrop\s*\{([^}]+)\}', css)
    if modal_backdrop_match:
        backdrop_css = modal_backdrop_match.group(1)
        report['modal_backdrop_css'] = {
            'position_fixed': 'position: fixed' in backdrop_css,
            'top_0': 'top: 0' in backdrop_css,
            'left_0': 'left: 0' in backdrop_css,
            'width_100vw': 'width: 100vw' in backdrop_css,
            'height_100vh': 'height: 100vh' in backdrop_css,
            'background_color_rgba': 'background-color: rgba(0, 0, 0, 0.7)' in backdrop_css,
            'webkit_backdrop_filter': '-webkit-backdrop-filter: blur(4px)' in backdrop_css,
            'backdrop_filter': 'backdrop-filter: blur(4px)' in backdrop_css,
            'z_index_1000': 'z-index: 1000' in backdrop_css
        }

    print(json.dumps(report, indent=2))
    with open("verification_results.json", "w") as rf:
        json.dump(report, rf, indent=2)

if __name__ == '__main__':
    run_rigorous_analysis()
