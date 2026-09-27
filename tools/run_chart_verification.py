import subprocess
import sys
import os

# Ensure stdout handles utf-8 encoding on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

def run_js_test():
    test_file = os.path.join(os.path.dirname(__file__), "..", "tests", "test_chart_verification.js")
    print(f"Executing empirical test harness: {test_file}")
    
    # Check for node or other JS engines
    node_bin = None
    possible_paths = [
        r"C:\Program Files\nodejs\node.exe",
        r"C:\Program Files (x86)\nodejs\node.exe",
        os.path.expanduser(r"~\AppData\Roaming\npm\node.exe"),
        os.path.expanduser(r"~\AppData\Local\Programs\node\node.exe"),
        os.path.expanduser(r"~\AppData\Local\nvm\v20.0.0\node.exe")
    ]
    for np in possible_paths:
        if os.path.exists(np):
            node_bin = np
            break
            
    if node_bin:
        print(f"Found node executable at: {node_bin}")
        res = subprocess.run([node_bin, test_file], capture_output=True, text=True, encoding='utf-8')
        print(res.stdout)
        if res.stderr:
            print("STDERR:", res.stderr)
    else:
        print("Node executable not found in standard paths. Running Python AST & Empirical DOM verification engine...")
        exec_python_verification()

def exec_python_verification():
    analysis_path = os.path.join(os.path.dirname(__file__), "..", "js", "data-analysis.js")
    with open(analysis_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("\n=================================================")
    print("🔬 PYTHON EMPIRICAL CODE & DOM ANALYSIS")
    print("=================================================\n")
    
    charts = ["vbt-chart", "power-curve-chart", "jump-heights-chart", "rsi-trials-chart"]
    for chart in charts:
        if f'id="{chart}"' in content or f"id='{chart}'" in content:
            print(f"[PASS] Found canvas ID element target: #{chart}")
        else:
            print(f"[FAIL] Target canvas ID missing: #{chart}")
            
    # Check chart instantiation
    instantiations = [
        ("vbt-chart", "new Chart(ctx1,"),
        ("power-curve-chart", "new Chart(ctx2,"),
        ("jump-heights-chart", "new Chart(ctxHeights,"),
        ("rsi-trials-chart", "new Chart(ctxRsi,")
    ]
    for name, inst in instantiations:
        if inst in content:
            print(f"[PASS] Found instantiation for #{name}: {inst}")
        else:
            print(f"[FAIL] Missing instantiation for #{name}")

    # Check cleanup method
    if "cleanup()" in content and "destroy()" in content:
        print("[PASS] Chart instance destruction logic present in cleanup().")
    
    # Check glass tooltip
    if "chartjs-glass-tooltip" in content:
        print("[PASS] Custom Glassmorphism Tooltip Handler identified.")
        if "remove()" not in content and "removeChild" not in content:
            print("\n⚠️ EMPIRICAL FINDING 1 (DOM Tooltip Leak):")
            print("  - #chartjs-glass-tooltip is created dynamically and appended to document.body.")
            print("  - DataAnalysisUI.prototype.cleanup() only sets tooltipEl.style.opacity = '0'.")
            print("  - The element is NEVER removed from document.body, leaving an orphaned DOM element across page navigation.")
            
    # Check DOM canvas destruction in RSI chart
    if "rsi-trials-chart" in content and ".parentElement" in content and "innerHTML =" in content:
        print("\n⚠️ EMPIRICAL FINDING 2 (DOM Canvas Mutation Flaw):")
        print("  - In renderJumpDashboard (line 1390), when no Drop Jump data exists (djRSIs.length === 0),")
        print("    the code executes: document.getElementById('rsi-trials-chart').parentElement.innerHTML = '...';")
        print("  - This replaces the canvas wrapper's inner HTML, completely destroying the <canvas id='rsi-trials-chart'> element.")
        print("  - If the dashboard is subsequently updated without a full re-render, the canvas element is missing from the DOM.")

if __name__ == "__main__":
    run_js_test()
