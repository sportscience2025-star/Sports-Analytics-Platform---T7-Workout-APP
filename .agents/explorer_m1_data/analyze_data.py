import re
import glob
import json

def analyze_all_js():
    js_files = glob.glob('js/*.js') + glob.glob('tests/*.js')
    
    print("=== SEARCHING JS FILES FOR MUSCLE REFERENCES ===")
    for filepath in js_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        matches = []
        for line_num, line in enumerate(content.splitlines(), 1):
            if any(k in line for k in ['MUSCLE_TAXONOMY', 'primaryMuscle', 'secondaryMuscles', 'muscles', 'filterByMuscle', 'muscleFilter', 'targetMuscle', 'distretto', 'distretti', 'gruppo']):
                matches.append((line_num, line.strip()))
        
        if matches:
            print(f"\n--- File: {filepath} ({len(matches)} matches) ---")
            for ln, line in matches[:15]: # Show first 15 per file
                print(f"  Line {ln}: {line[:120]}")
            if len(matches) > 15:
                print(f"  ... and {len(matches)-15} more matches.")

def analyze_exercise_structure():
    with open('js/data.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Let's count how exercises are structured
    ex_matches = re.findall(r'\{\s*id:\s*[\'\"]([^\'\"]+)[\'\"][\s\S]*?name:\s*[\'\"]([^\'\"]+)[\'\"][\s\S]*?primaryMuscle:\s*[\'\"]([^\'\"]+)[\'\"]', content)
    print(f"\nTotal exercises extracted via regex: {len(ex_matches)}")
    
    # Check primaryMuscle breakdown
    prim_counts = {}
    for eid, name, pm in ex_matches:
        prim_counts[pm] = prim_counts.get(pm, 0) + 1
    print("\nPrimary muscle distribution in exercises:")
    for pm, count in sorted(prim_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {pm}: {count}")

if __name__ == '__main__':
    analyze_all_js()
    analyze_exercise_structure()
