# Original User Request

## Initial Request — 2026-06-29T22:22:35Z

## Mission Requirements
1. R1. UI Filtering Simplification:
   - In the UI module (e.g., js/ui.js or similar), remove the horizontal row of rounded muscle quick filter buttons (e.g., "Pettorali", "Schiena", "Gambe").
   - Retain ONLY the dropdown menu currently labeled "Muscolo: ..." for selecting muscle filters to eliminate redundancy.

2. R2. Anatomical Hierarchy & Naming Overhaul:
   - Restructure muscle categories in data configuration files (such as js/knowledge-base.js and js/data.js).
   - Remove repetitions (e.g., "Gambe" under "Gambe (Legs)").
   - Add the muscle district/group "Piedi".
   - Specify main muscle bellies using standard Italian anatomical nomenclature (e.g. expand hamstrings into "Bicipite Femorale", "Semitendinoso", "Semimembranoso"; quadriceps into "Vasto Laterale", "Vasto Mediale", "Vasto Intermedio", "Retto Femorale", etc.).
   - Verify that all exercises, dropdowns, and internal structures reference these new anatomical terms accurately without breaking exercise search/filtering.

## Mandatory Safety & Verification Rules (AGENTS.md)
- Modifica solo i file strettamente necessari.
- Ogni volta che si modificano file JS, CSS o asset, incrementa la versione della cache in sw.js (es. t7-workout-v15 -> t7-workout-v16).
- Validazione UI Binding: Verificare sempre che non compaia "undefined" nelle interfacce.
- Validazione Sintattica Obbligatoria (JavaScript): Eseguire py test_check.py prima di considerare conclusa ogni modifica JS.
- Eseguire py run_all_js_tests.py dopo le modifiche e riportare i risultati.
