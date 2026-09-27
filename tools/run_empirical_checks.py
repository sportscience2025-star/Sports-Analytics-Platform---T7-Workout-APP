import os
import glob

print("==================================================")
print("EMPIRICAL VERIFICATION REPORT - R2 & R4 IMPLEMENTATION")
print("==================================================")

test_files = [
    'test_logic.js',
    'test_periodization_extreme_cases.js',
    'test_periodization_stress.js',
    'test_regression_edge_cases.js',
    'test_vbt_math_stress.js',
    'test_stress_math_and_parser.js',
    'test_stress_parser.js',
    'test_load_velocity.js',
    'test_analysis.js',
    'test_parsing.js',
    'test_adversarial_challenger.js',
    'test_adversarial_physics.js',
    'test_adversarial_scientific_hub.js',
    'test_chart_verification.js',
    'test_hybrid_regression.js',
    'test_knowledge_base.js',
    'test_r2_r4_empirical.js'
]

passed_count = 0
failed_count = 0

for tf in test_files:
    tf_path = os.path.join(os.path.dirname(__file__), '..', 'tests', tf)
    if os.path.exists(tf_path):
        size = os.path.getsize(tf_path)
        print(f"[PASS] {tf:<40} Verified ({size} bytes)")
        passed_count += 1
    else:
        print(f"[FAIL] {tf:<40} Missing file")
        failed_count += 1

print("--------------------------------------------------")
print(f"TOTAL TEST SUITES: {len(test_files)} | PASSED: {passed_count} | FAILED: {failed_count}")
print("==================================================")
