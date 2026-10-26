# -*- coding: utf-8 -*-
import glob
import os
import re

def verify():
    # 1. Verify Rules
    rule08_path = os.path.join(".agents", "rules", "08-miro-architecture-blueprint.md")
    with open(rule08_path, encoding="utf-8") as fp:
        r08 = fp.read()
    assert "Matrice delle 6 Colonne Funzionali della ZONA 4" in r08, "Rule 08: Missing 6 columns matrix"
    assert "Tabella Master Ufficiale di Corrispondenza (18 Badge Miro Online)" in r08, "Rule 08: Missing Master Table"
    assert "Doppio Livello di Lettura" in r08, "Rule 08: Missing Doppio Livello di Lettura"
    print("Rule 08: PASSED")

    rule10_path = os.path.join(".agents", "rules", "10-miro-design-standards-and-routing.md")
    with open(rule10_path, encoding="utf-8") as fp:
        r10 = fp.read()
    assert "Standard Visivi & Geometrici dei Badge di Identificazione Flusso" in r10, "Rule 10: Missing badge standard"
    assert "No-Fly Zone" in r10, "Rule 10: Missing No-Fly Zone"
    assert "W = 520" in r10, "Rule 10: Missing W=520"
    print("Rule 10: PASSED")

    # 2. Verify Glossary
    glossary_path = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "00-GLOSSARIO-TERMINI-TECNICI.md")
    with open(glossary_path, encoding="utf-8") as fp:
        gloss = fp.read()
    terms = re.findall(r"^#### <a id=\"[^\"]+\"></a>(.+)$", gloss, re.MULTILINE)
    eli5s = re.findall(r"^\*\*ELI5:\*\* \".+\"$", gloss, re.MULTILINE)
    print(f"Glossary: Found {len(terms)} terms, {len(eli5s)} ELI5 lines")
    assert len(terms) >= 90, f"Glossary has only {len(terms)} terms, expected >= 90"
    assert len(terms) == len(eli5s), f"Mismatch: {len(terms)} terms vs {len(eli5s)} ELI5s"
    assert "## Indice Analitico A-Z" in gloss, "Glossary: Missing Indice Analitico A-Z"
    assert "## Matrice di Tracciabilità Incrociata" in gloss, "Glossary: Missing Matrice di Tracciabilita"
    print("Glossary: PASSED")

    # 3. Verify 18 Flowchart Spec Files
    files = sorted(glob.glob("architecture-blueprint/00-capitolato-tecnico-e-glossario/[0-1][0-9]-*.md"))
    flow_files = [f for f in files if not f.endswith("00-GLOSSARIO-TERMINI-TECNICI.md")]
    assert len(flow_files) == 18, f"Expected 18 flow files, found {len(flow_files)}"
    for f in flow_files:
        fname = os.path.basename(f)
        with open(f, encoding="utf-8") as fp:
            fc = fp.read()
        assert "sequenceDiagram" in fc, f"{fname}: missing sequenceDiagram"
        assert "Indicatori di Accettazione Operativa & Clinica (KPI)" in fc, f"{fname}: missing KPI table"
        assert "Matrice Errori HTTP & Strategie di Resilienza" in fc, f"{fname}: missing Error matrix"
        assert "Miro Shape ID" in fc, f"{fname}: missing Miro Shape ID"
    print("18 Flow Spec Files: ALL 18 PASSED")

    # 4. Check specific coordinate fixes
    f02_path = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "02-software-1-flow-2a-personal-cockpit.md")
    with open(f02_path, encoding="utf-8") as fp:
        assert "X: 27.35, Y: 179.87" in fp.read(), "Flow 02: coordinates not fixed"

    f08_path = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "08-software-2-flow-2b-coach-hub.md")
    with open(f08_path, encoding="utf-8") as fp:
        assert "X: 251.36, Y: 2940" in fp.read(), "Flow 08: coordinates not fixed"
    print("Coordinate Fixes (#02 and #08): PASSED")

    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    verify()
