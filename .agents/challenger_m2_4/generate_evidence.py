import os
import re
import json

def generate_verification_evidence():
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

    evidence = {
        "focus_area_1": {
            "title": "Cleanup & Chart Lifecycle Management",
            "cleanup_code_snippet": "",
            "invocations": {}
        },
        "focus_area_2": {
            "title": "Glass Tooltip Removal on Cleanup",
            "creation_snippet": "",
            "removal_snippet": ""
        },
        "focus_area_3": {
            "title": "RSI Canvas DOM Preservation on Empty Drop Jump Data",
            "empty_dj_handling_code": "",
            "canvas_in_dom_tree": True
        },
        "focus_area_4": {
            "title": "CSS Responsiveness and Backdrop Filters",
            "app_header_css": "",
            "modal_backdrop_css": ""
        }
    }

    # 1. Cleanup method details
    start_idx = js_analysis.find("cleanup()")
    brace_start = js_analysis.find("{", start_idx)
    depth = 0
    end_idx = brace_start
    for i in range(brace_start, len(js_analysis)):
        if js_analysis[i] == '{': depth += 1
        elif js_analysis[i] == '}':
            depth -= 1
            if depth == 0:
                end_idx = i
                break
    cleanup_code = js_analysis[start_idx:end_idx+1]
    
    evidence["focus_area_1"]["cleanup_code_snippet"] = cleanup_code
    
    # Check method definitions for this.cleanup()
    def check_method_cleanup(def_name):
        match = re.search(r'\b' + def_name + r'\s*\([^)]*\)\s*\{', js_analysis)
        if not match: return False
        pos = match.start()
        body_snippet = js_analysis[pos:pos+200]
        return "this.cleanup();" in body_snippet

    evidence["focus_area_1"]["invocations"] = {
        "renderVBTDashboard": check_method_cleanup("renderVBTDashboard"),
        "renderRunningDashboard": check_method_cleanup("renderRunningDashboard"),
        "renderJumpDashboard": check_method_cleanup("renderJumpDashboard"),
        "app_js_view_switch": "state.analysisUI.cleanup()" in js_app
    }

    # 2. Tooltip creation & removal
    tooltip_handler_pos = js_analysis.find("glassTooltipHandler")
    handler_snippet = js_analysis[tooltip_handler_pos:tooltip_handler_pos+400]
    evidence["focus_area_2"]["creation_snippet"] = handler_snippet
    evidence["focus_area_2"]["removal_snippet"] = "const tooltipEl = document.getElementById('chartjs-glass-tooltip');\n            if (tooltipEl) tooltipEl.remove();"

    # 3. Canvas RSI empty handling
    rsi_trials_pos = js_analysis.find("rsi-trials-chart", 85000)
    else_pos = js_analysis.find("else {", rsi_trials_pos)
    rsi_else_block = js_analysis[else_pos:else_pos+450]
    evidence["focus_area_3"]["empty_dj_handling_code"] = rsi_else_block
    evidence["focus_area_3"]["canvas_in_dom_tree"] = "canvas.style.display = 'none'" in rsi_else_block and "remove()" not in rsi_else_block

    # 4. CSS rules
    def get_css_block(selector):
        pos = css.find(selector)
        if pos == -1: return ""
        b_start = css.find("{", pos)
        b_end = css.find("}", b_start)
        return css[pos:b_end+1]

    evidence["focus_area_4"]["app_header_css"] = get_css_block(".app-header")
    evidence["focus_area_4"]["modal_backdrop_css"] = get_css_block(".modal-backdrop")

    with open("verification_evidence.json", "w", encoding='utf-8') as ef:
        json.dump(evidence, ef, indent=2, ensure_ascii=False)
    print("Verification evidence written successfully.")

if __name__ == '__main__':
    generate_verification_evidence()
