import subprocess
import sys

print("--- EXECUTING TEST SUITE VIA PYTHON ---")
result = subprocess.run([sys.executable, "run_all_js_tests.py"], capture_output=True, text=True)
print("STDOUT:")
print(result.stdout)
print("STDERR:")
print(result.stderr)
print(f"EXIT CODE: {result.returncode}")
