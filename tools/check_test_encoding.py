for tf in [
    'tests/test_periodization_stress.js',
    'tests/test_regression_edge_cases.js',
    'tests/test_adversarial_physics.js',
    'tests/test_chart_verification.js'
]:
    with open(tf, 'r', encoding='utf-8') as f:
        text = f.read()
    print(f"{tf}: contains `${{`? { '${' in text }, contains backtick? { '`' in text }")
