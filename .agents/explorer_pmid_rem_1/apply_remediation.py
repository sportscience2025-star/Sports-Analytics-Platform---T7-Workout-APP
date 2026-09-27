"""
apply_remediation.py
Helper script for the Implementer / Coordinator to apply the 67 verified remediations
to js/data/sources/biomeccanica.js, clinico.js, and sport-squadra.js.
DO NOT execute during read-only investigation.
"""

import json
import re
import os

SOURCES_DIR = r"e:/Nuove App Installate/App esercizi scienze motorie/js/data/sources"
DICT_FILE = r"e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/remediation_dict.json"

def main():
    with open(DICT_FILE, 'r', encoding='utf-8') as f:
        remed_dict = json.load(f)

    file_targets = {
        'biomeccanica': os.path.join(SOURCES_DIR, 'biomeccanica.js'),
        'clinico': os.path.join(SOURCES_DIR, 'clinico.js'),
        'sportSquadra': os.path.join(SOURCES_DIR, 'sport-squadra.js')
    }

    for area_key, file_path in file_targets.items():
        if not os.path.exists(file_path):
            print(f"Error: {file_path} not found")
            continue

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        mod_count = 0
        for entry_id, r in remed_dict.items():
            if r["area"] != area_key:
                continue
            
            old_url = r["current_url"]
            new_url = r["correct_url"]
            if old_url in content:
                content = content.replace(old_url, new_url)
                mod_count += 1
                print(f"Replaced in {area_key}: {entry_id} -> {new_url}")
            else:
                print(f"Warning: URL {old_url} for {entry_id} not found verbatim in {file_path}")

        print(f"Total replacements staged for {area_key}: {mod_count}")

if __name__ == "__main__":
    main()
