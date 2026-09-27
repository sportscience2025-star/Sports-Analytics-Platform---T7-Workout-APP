import re
import glob

def run_detailed_check():
    out_lines = []
    
    # 1. Inspect js/logic.js lines around 850-870 and 1160-1170
    with open('js/logic.js', 'r', encoding='utf-8') as f:
        logic_lines = f.readlines()
        
    out_lines.append("=== LOGIC.JS MUSCLE SEARCH / FILTERING CODE ===")
    for i in range(840, 875):
        if i < len(logic_lines):
            out_lines.append(f"{i+1:4d}: {logic_lines[i].rstrip()}")
            
    out_lines.append("\n=== LOGIC.JS KNEE ROM / GAMBE FILTERING CODE ===")
    for i in range(1155, 1175):
        if i < len(logic_lines):
            out_lines.append(f"{i+1:4d}: {logic_lines[i].rstrip()}")
            
    # 2. Inspect js/ui.js around currentFilters, filterExercises, and renderFilters
    with open('js/ui.js', 'r', encoding='utf-8') as f:
        ui_lines = f.readlines()
        
    out_lines.append("\n=== UI.JS FILTERING & SEARCH CODE ===")
    for i, line in enumerate(ui_lines):
        if any(k in line for k in ['currentFilters', 'filterExercises', 'notifyChange', 'getFilteredExercises', 'filterBy']):
            start = max(0, i-2)
            end = min(len(ui_lines), i+3)
            out_lines.append(f"--- line {i+1} ---")
            for j in range(start, end):
                out_lines.append(f"{j+1:4d}: {ui_lines[j].rstrip()}")
                
    with open('.agents/explorer_m1_data/analysis_out.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(out_lines))
    print("Done writing analysis_out.txt")

if __name__ == '__main__':
    run_detailed_check()
