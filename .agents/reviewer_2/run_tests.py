import subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
print("Running run_all_js_tests.py...")
res = subprocess.run([sys.executable, 'run_all_js_tests.py'], capture_output=True, text=True)
print("Return code:", res.returncode)
print("=== STDOUT ===")
print(res.stdout)
print("=== STDERR ===")
print(res.stderr)
