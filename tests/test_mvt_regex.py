import re

def extractMVT(text, exercise):
    if not text or not exercise:
        return None
    lower_text = text.lower()
    lower_exercise = exercise.lower()
    
    # 1. Try regex with exercise name and MVT sequence
    # specificRegex = new RegExp(lowerExercise + '\\s+mvt\\s*(?:di|da|a|:|==?|\\s)\\s*(0\\.\\d+)', 'i')
    pattern1 = re.escape(lower_exercise) + r'\s+mvt\s*(?:di|da|a|:|==?|\s)\s*(0\.\d+)'
    match = re.search(pattern1, lower_text, re.IGNORECASE)
    if match and match.group(1):
        return float(match.group(1))

    # 2. specificRegex2 = new RegExp('mvt\\s*(?:di|da|a|:|==?|\\s|per|lo|il)*\\s*' + lowerExercise + '\\s*(?:di|da|a|:|==?|\\s|di\\s*circa)*\\s*(0\\.\\d+)', 'i')
    pattern2 = r'mvt\s*(?:di|da|a|:|==?|\s|per|lo|il)*\s*' + re.escape(lower_exercise) + r'\s*(?:di|da|a|:|==?|\s|di\\s*circa)*\s*(0\.\d+)'
    match = re.search(pattern2, lower_text, re.IGNORECASE)
    if match and match.group(1):
        return float(match.group(1))

    # 3. Vicinity match
    exercise_index = lower_text.find(lower_exercise)
    if exercise_index != -1:
        start_idx = max(0, exercise_index - 150)
        end_idx = min(len(lower_text), exercise_index + 200)
        vicinity = lower_text[start_idx:end_idx]
        # mvtRegex = /mvt\s*(?:di|da|a|:|==?|\s)\s*(0\.\d+)/i
        pattern3 = r'mvt\s*(?:di|da|a|:|==?|\s)\s*(0\.\d+)'
        match = re.search(pattern3, vicinity, re.IGNORECASE)
        if match and match.group(1):
            return float(match.group(1))
            
    return None

test_cases = [
    # (Text, Exercise, Expected result/evaluation)
    ("Squat MVT is 0.35 m/s or maybe 0.40 m/s", "Squat", "multiple MVTs and 'is' helper"),
    ("Squat MVT 0.m/s", "Squat", "malformed decimal 0."),
    ("Squat MVT 0.4", "Squat", "malformed decimal 0.4 (no units)"),
    ("Squat MVT di 0.35", "Squat", "standard di"),
    ("MVT per lo Squat di circa 0.38", "Squat", "standard di circa"),
    ("MVT Squat 0.35", "Squat", "no separator"),
    ("Stacco MVT: 0.15", "Stacco", "with colon"),
    ("Squat MVT: 0.35 m/s or maybe 0.40 m/s", "Squat", "multiple MVTs with colon"),
    ("Leg Press MVT: 0.50", "Squat", "different exercise"),
    ("Squat is cool but Bench Press MVT: 0.18", "Squat", "exercise present but MVT belongs to another"),
]

print("=== MVT REGEX STRESS TESTS ===")
for text, exercise, desc in test_cases:
    res = extractMVT(text, exercise)
    print(f"Text: '{text}'")
    print(f"Exercise: '{exercise}'")
    print(f"Desc: {desc}")
    print(f"Result: {res}")
    print("-" * 50)
