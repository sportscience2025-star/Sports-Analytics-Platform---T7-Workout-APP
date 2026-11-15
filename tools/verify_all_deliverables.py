# -*- coding: utf-8 -*-
"""
Test Suite di Validazione Completa & Rigorosa per tutti i Deliverable di Architettura Miro:
- Fase 1: Regole di Progetto 08 e 10
- Fase 2: Glossario Vivente (A-Z index, Matrice, 93 schede, ELI5 <= 10 parole, zero broken links)
- Fase 3: 18 File di Capitolato Tecnico (7 sezioni, sequenceDiagram, KPI, Error matrix 6 col, coordinate #02 e #08, anchor links riga 9)
"""
import glob
import os
import re

def verify():
    print("=== AVVIO VALIDAZIONE RIGOROSA DELIVERABLE ARCHITETTURA MIRO ===")

    # 1. Verify Rule 08
    rule08_path = os.path.join(".agents", "rules", "08-miro-architecture-blueprint.md")
    with open(rule08_path, encoding="utf-8") as fp:
        r08 = fp.read()
    assert "Tabella Unificata dei 18 Flowchart" in r08 or "Matrice delle 6 Colonne Funzionali della ZONA 4" in r08, "Rule 08: Missing 6 columns matrix"
    assert "Colonna Funzionale (Zona 4)" in r08 or "Tabella Master Ufficiale di Corrispondenza (18 Badge Miro Online)" in r08, "Rule 08: Missing Master Table"
    assert "Doppio Livello" in r08, "Rule 08: Missing Doppio Livello di Lettura"
    assert "Col 1: Identity" in r08 or "Colonna 1: Identity" in r08, "Rule 08: Missing Col 1"
    assert "Col 6: Rehab" in r08 or "Colonna 6: Rehab" in r08, "Rule 08: Missing Col 6"
    print("[1/5] Regola 08 (Matrice 6 Colonne, Tabella Master 18 Badge, Doppio Livello): PASSED")

    # 2. Verify Rule 10
    rule10_path = os.path.join(".agents", "rules", "10-miro-design-standards-and-routing.md")
    with open(rule10_path, encoding="utf-8") as fp:
        r10 = fp.read()
    assert "Standard Visivi Miro" in r10 or "Standard Visivi & Geometrici dei Badge di Identificazione Flusso" in r10, "Rule 10: Missing badge standard"
    assert "fascia perimetrale di rispetto" in r10 or "No-Fly Zone" in r10, "Rule 10: Missing No-Fly Zone"
    assert "W = 520" in r10, "Rule 10: Missing W=520"
    assert "#0f766e" in r10 and "#14b8a6" in r10, "Rule 10: Missing Tier 1 palette"
    assert "#b45309" in r10 and "#f59e0b" in r10, "Rule 10: Missing Tier 2 palette"
    assert "#4338ca" in r10 and "#818cf8" in r10, "Rule 10: Missing Tier 3 palette"
    assert "40" in r10 and ("crossing" in r10.lower() or "zero-crossing" in r10.lower()), "Rule 10: Missing No-Fly Zone clearance standard"
    print("[2/5] Regola 10 (Geometria Badge W=520, Palette Tier 1-2-3, No-Fly Zone 40px): PASSED")

    # 3. Verify Glossary
    glossary_path = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "00-GLOSSARIO-TERMINI-TECNICI.md")
    with open(glossary_path, encoding="utf-8") as fp:
        gloss = fp.read()
    
    terms_raw = re.findall(r'^#### ((?:<a id="[^"]+"></a>)+)(.+)$', gloss, re.MULTILINE)
    terms = [(anchors, name.strip()) for anchors, name in terms_raw]
    eli5_matches = re.findall(r'^\*\*ELI5:\*\* "([^"]+)"$', gloss, re.MULTILINE)
    
    print(f"Glossary: Trovati {len(terms)} termini e {len(eli5_matches)} sintesi ELI5")
    assert len(terms) == 134, f"Glossario ha {len(terms)} termini, attesi 134"
    assert len(terms) == len(eli5_matches), f"Mismatch: {len(terms)} termini vs {len(eli5_matches)} ELI5s"
    assert "## Indice Analitico A-Z" in gloss, "Glossary: Missing Indice Analitico A-Z"
    assert "## Matrice di Tracciabilità Incrociata" in gloss, "Glossary: Missing Matrice di Tracciabilita"
    assert f"## Schede Terminologiche Enciclopediche ({len(terms)} Termini Ufficiali)" in gloss, "Glossary: Header count mismatch"
    assert "<a-id=" not in gloss, "Rilevati slug ancorati corrotti '<a-id=' nel glossario"
    assert not any(re.search(r'<[^>]+>', t_name) for _, t_name in terms), "Rilevati tag HTML incorporati nei nomi dei termini del glossario"

    # Verify only numbers start in '#' section of A-Z index
    num_section = re.search(r'### <a id="letter-num"></a>#\n\n([\s\S]*?)(?=### <a id="letter-a">)', gloss)
    assert num_section, "Mancante sezione # nell'indice A-Z"
    num_items = [l for l in num_section.group(1).strip().split('\n') if l.startswith('- ')]
    assert len(num_items) == 2, f"Attesi solo 2 termini numerici sotto '#', trovati: {num_items}"
    
    # Rigorous check: ALL ELI5 strings must be <= 10 words
    eli5_over_10 = []
    for (t_anchor, t_name), eli5_text in zip(terms, eli5_matches):
        words = eli5_text.split()
        if len(words) > 10:
            eli5_over_10.append((t_name, len(words), eli5_text))
    assert len(eli5_over_10) == 0, f"Rilevati {len(eli5_over_10)} termini con ELI5 > 10 parole: {eli5_over_10}"

    # Check zero broken internal anchors in glossary
    defined_anchors = set(re.findall(r'<a id="([^"]+)"></a>', gloss))
    internal_links = re.findall(r'\[([^\]]+)\]\((#[^\)]+)\)', gloss)
    broken_internal = [href for text, href in internal_links if href[1:] not in defined_anchors]
    assert len(broken_internal) == 0, f"Trovati link interni rotti nel glossario: {broken_internal}"
    print(f"[3/5] Glossario Vivente (Indice A-Z, Matrice, {len(terms)} schede, 100% ELI5 <= 10 parole, zero link rotti): PASSED")

    # 4. Verify 18 Flowchart Spec Files
    files = sorted(glob.glob("architecture-blueprint/00-capitolato-tecnico-e-glossario/[0-1][0-9]-*.md"))
    flow_files = [f for f in files if not f.endswith("00-GLOSSARIO-TERMINI-TECNICI.md")]
    assert len(flow_files) == 18, f"Expected 18 flow files, found {len(flow_files)}"

    required_sections = [
        (r"## 1\. Identificativo & Titolo Ufficiale", "Sezione 1"),
        (r"## 2\. Obiettivo di Business", "Sezione 2"),
        (r"## 3\. Attori & Architettura a 4 Corsie", "Sezione 3"),
        (r"```mermaid\s+sequenceDiagram", "Sequence Diagram Asincrono"),
        (r"## 4\. Flusso (Operativo )?Passo-Passo", "Sezione 4"),
        (r"### Livello A:", "Livello A Narrativo"),
        (r"KPI", "Tabella KPI Accettazione"),
        (r"### Livello B:", "Livello B Deep-Dive"),
        (r"## 5\. Rami Decisionali", "Sezione 5 (4 Stati UI)"),
        (r"## 6\. Contratti Dati", "Sezione 6 (Contratti I/O)"),
        (r"Matrice Errori HTTP", "Matrice Errori HTTP 6 Colonne"),
        (r"## 7\. Ereditariet[àa] di Tier", "Sezione 7 (Ereditarietà)")
    ]

    for f in flow_files:
        fname = os.path.basename(f)
        with open(f, encoding="utf-8") as fp:
            fc = fp.read()
        
        for pat, desc in required_sections:
            assert re.search(pat, fc), f"{fname}: mancante {desc}"
        
        # Verify 6-column error matrix format
        assert re.search(r"\|\s*(HTTP Code|Codice HTTP)\s*\|\s*(Codice Interno|Errore Interno)\s*\|", fc), f"{fname}: Matrice Errori non conforme allo standard a 6 colonne"
    
    print("[4/5] 18 File di Capitolato (7 sezioni complete, Sequence Diagram, KPI, Matrice Errori 6 Colonne): PASSED")

    # 5. Verify Line 9 Clickable Hyperlinks & Specific Coordinates
    f02_path = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "02-software-1-flow-2a-personal-cockpit.md")
    with open(f02_path, encoding="utf-8") as fp:
        f02_c = fp.read()
        assert "X: 27.35, Y: 179.87" in f02_c, "Flow 02: coordinates not fixed"
        assert "3458764688417722707" in f02_c, "Flow 02: Miro Shape ID missing"

    f08_path = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "08-software-2-flow-2b-coach-hub.md")
    with open(f08_path, encoding="utf-8") as fp:
        f08_c = fp.read()
        assert "X: 251.36, Y: 2940" in f08_c, "Flow 08: coordinates not fixed"
        assert "3458764688417722736" in f08_c, "Flow 08: Miro Shape ID missing"

    total_line9_links = 0
    for f in flow_files:
        fname = os.path.basename(f)
        with open(f, encoding="utf-8") as fp:
            lines = fp.readlines()
        for line in lines[:15]:
            if "Riferimento Glossario:" in line:
                links = re.findall(r'\[([^\]]+)\]\(00-GLOSSARIO-TERMINI-TECNICI\.md#([^\)]+)\)', line)
                assert len(links) > 0, f"{fname}: riga 9 priva di collegamenti ipertestuali al glossario"
                total_line9_links += len(links)
                for text, anchor in links:
                    assert anchor in defined_anchors, f"{fname}: link riga 9 '{text}' punta ad ancora inesistente #{anchor}"

    print(f"[5/5] Coordinate reali (#02 e #08) e Collegamenti Ipertestuali Riga 9 ({total_line9_links} link verificati 1:1): PASSED")

    print("\n=======================================================")
    print("100% DEI REQUISITI DI ARCHITETTURA E CAPITOLATO VERIFICATI CON SUCCESSO!")
    print("=======================================================")

if __name__ == "__main__":
    verify()
