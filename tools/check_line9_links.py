# -*- coding: utf-8 -*-
import glob
import os
import re

glossary_path = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "00-GLOSSARIO-TERMINI-TECNICI.md")
with open(glossary_path, encoding="utf-8") as fp:
    gloss = fp.read()

defined_anchors = set(re.findall(r'<a id="([^"]+)"></a>', gloss))

files = sorted(glob.glob("architecture-blueprint/00-capitolato-tecnico-e-glossario/[0-1][0-9]-*.md"))
flow_files = [f for f in files if not f.endswith("00-GLOSSARIO-TERMINI-TECNICI.md")]

missing_anchors = []
for f in flow_files:
    fname = os.path.basename(f)
    with open(f, encoding="utf-8") as fp:
        lines = fp.readlines()
    for line in lines[:15]:
        if "Riferimento Glossario:" in line:
            links = re.findall(r'\[([^\]]+)\]\(00-GLOSSARIO-TERMINI-TECNICI\.md#([^\)]+)\)', line)
            for text, anchor in links:
                if anchor not in defined_anchors:
                    missing_anchors.append((fname, text, anchor))

print(f"Total missing line 9 anchors: {len(missing_anchors)}")
for fname, text, anchor in missing_anchors:
    print(f"  {fname}: '{text}' -> #{anchor}")
