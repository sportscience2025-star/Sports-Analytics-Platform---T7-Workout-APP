# -*- coding: utf-8 -*-
import re
import os

glossary_path = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "00-GLOSSARIO-TERMINI-TECNICI.md")
with open(glossary_path, encoding="utf-8") as fp:
    gloss = fp.read()

anchors = re.findall(r'<a id="([^"]+)"></a>', gloss)
for a in anchors:
    if any(k in a for k in ['pvt', 'robust', 'decoupled', 'injury', 'kms', 'readiness', 'acwr', 'coach', 'bridge']):
        print(a)
