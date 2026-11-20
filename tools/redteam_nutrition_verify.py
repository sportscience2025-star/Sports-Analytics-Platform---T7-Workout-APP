# -*- coding: utf-8 -*-
"""
tools/redteam_nutrition_verify.py

Adversarial Red-Team verification suite for Colonna 7: Diario Nutrizione e Stile di Vita
(#23/FLOW-NUT-1A, #24/FLOW-NUT-2B, #25/FLOW-NUT-3C).
Outputs structured 6-check JSON verdict (PASS / FAIL) modeled on an adversarial security audit.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from typing import Any, Dict, List, Optional, Tuple

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

SPEC_DIR = os.path.join(REPO_ROOT, "architecture-blueprint", "00-capitolato-tecnico-e-glossario")
FLOW_DIR_T1 = os.path.join(REPO_ROOT, "architecture-blueprint", "02-miro-zones-and-swimlanes", "18-flowcharts", "software-1-consumer-b2c")
FLOW_DIR_T2 = os.path.join(REPO_ROOT, "architecture-blueprint", "02-miro-zones-and-swimlanes", "18-flowcharts", "software-2-pro-b2b")
FLOW_DIR_T3 = os.path.join(REPO_ROOT, "architecture-blueprint", "02-miro-zones-and-swimlanes", "18-flowcharts", "software-3-elite-club-enterprise")

FLOW_NUT1_MD = os.path.join(SPEC_DIR, "23-software-1-flow-nut-1a-consumer-nutrition.md")
FLOW_NUT2_MD = os.path.join(SPEC_DIR, "24-software-2-flow-nut-2b-pro-nutrition.md")
FLOW_NUT3_MD = os.path.join(SPEC_DIR, "25-software-3-flow-nut-3c-elite-nutrition.md")

FLOW_NUT1_MMD = os.path.join(FLOW_DIR_T1, "flow-nut-1a-consumer-nutrition.mmd")
FLOW_NUT2_MMD = os.path.join(FLOW_DIR_T2, "flow-nut-2b-pro-nutrition.mmd")
FLOW_NUT3_MMD = os.path.join(FLOW_DIR_T3, "flow-nut-3c-elite-nutrition.mmd")

REGISTRY_MD = os.path.join(SPEC_DIR, "MASTER-FLOWCHART-REGISTRY.md")
GLOSSARY_MD = os.path.join(SPEC_DIR, "00-GLOSSARIO-TERMINI-TECNICI.md")
DEPLOY_SCRIPT = os.path.join(REPO_ROOT, "architecture-blueprint", "deploy-miro-nutrition-tiers-iso.cjs")
REPORT_PATH = os.path.join(REPO_ROOT, "scratch", "deploy_nutrition_report.json")

EXPECTED_ISO_PER_TIER = 16
TOTAL_EXPECTED_ISO = 48

REQUIRED_SECTIONS = [
    "## 1. Identificativo & Titolo Ufficiale",
    "## 2. Obiettivo di Business & Target Utente",
    "## 3. Attori & Architettura a 4 Corsie (Swimlanes)",
    "## 4. Flusso Passo-Passo",
    "## 5. Rami Decisionali & Gestione Errori",
    "## 6. Contratti Dati JSON & Matrice Errori HTTP",
    "## 7. Ereditarieta di Tier & Sblocco Funzionalita a Cascata"
]

REQUIRED_GLOSSARY_TERMS = [
    "diario-nutrizione-e-stile-di-vita",
    "tasso-di-sudorazione-sweat-rate",
    "classificazione-evidenze-integratori-sportivi",
    "fabbisogno-energetico-basale-e-totale",
    "tutela-legale-legge-32018-e-art-348-cp",
    "bia-vettoriale-biva",
    "massa-grassa-fm-e-massa-magra-ffm",
    "plicometria-jackson-pollock",
    "wearable-esclusivo-t7",
    "esportazione-multi-formato-sbloccata",
    "ai-rationale-limitata-70",
    "energy-availability-ea-e-sindrome-reds",
    "dexa-dual-energy-x-ray-absorptiometry",
    "periodizzazione-nutrizionale-dinamica",
    "red-flags-cliniche-human-in-the-loop",
    "certificazione-antidoping-per-lotto-batch",
    "potenza-relativa-watt-su-kg-w-kg",
    "chatbot-nutrizionale-rag-247"
]

EMOJI_PATTERN = re.compile(
    r"[\U0001F300-\U0001F9FF]|[\U0001FA00-\U0001FAFF]|[\u2600-\u26FF]|[\u2700-\u27BF]"
)


# ---------------------------------------------------------------------------
# Check 1: Scientific Rigor, Legal Split & REDs Compliance
# ---------------------------------------------------------------------------
def check_1_scientific_and_legal_compliance() -> Dict[str, Any]:
    findings = []
    specs = [
        (FLOW_NUT1_MD, ["Sudorazione", "L/h", "ISSN", "Read-Only", "Silo 1"]),
        (FLOW_NUT2_MD, ["Legge 3/2018", "348", "BIA", "Jackson-Pollock", "FFM", ".xlsx"]),
        (FLOW_NUT3_MD, ["Energy Availability", "REDs", "DEXA", "Red Flags", "Watt/kg", "Antidoping", "Informed Sport"])
    ]

    for path, keywords in specs:
        if not os.path.exists(path):
            findings.append(f"Spec missing: {os.path.basename(path)}")
            continue
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        for kw in keywords:
            if kw.lower() not in content.lower():
                findings.append(f"Spec {os.path.basename(path)} missing required domain concept: '{kw}'")

    return {
        "check": "check_1_scientific_and_legal_compliance",
        "verdict": "PASS" if not findings else "FAIL",
        "findings": findings
    }


# ---------------------------------------------------------------------------
# Check 2: Structure, 7 Sections & Dual-Layer Reading
# ---------------------------------------------------------------------------
def check_2_spec_structure_and_dual_layer() -> Dict[str, Any]:
    findings = []
    specs = [FLOW_NUT1_MD, FLOW_NUT2_MD, FLOW_NUT3_MD]

    for path in specs:
        if not os.path.exists(path):
            findings.append(f"Spec missing: {os.path.basename(path)}")
            continue
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        for sec in REQUIRED_SECTIONS:
            if sec not in content:
                findings.append(f"Spec {os.path.basename(path)} missing mandatory section '{sec}'")

        if "sequenceDiagram" not in content:
            findings.append(f"Spec {os.path.basename(path)} missing Mermaid sequenceDiagram")

        if "CREATE TABLE" not in content:
            findings.append(f"Spec {os.path.basename(path)} missing relational schema SQL DDL")

        # 6-column error matrix check
        if "| Codice HTTP | Errore Interno | Condizione Scatenante | Risposta Client | Azione Automatica Client | Ripristino Utente |" not in content:
            findings.append(f"Spec {os.path.basename(path)} missing complete 6-column HTTP error matrix")

    return {
        "check": "check_2_spec_structure_and_dual_layer",
        "verdict": "PASS" if not findings else "FAIL",
        "findings": findings
    }


# ---------------------------------------------------------------------------
# Check 3: Mermaid Flowcharts & ISO 5807 Compliance
# ---------------------------------------------------------------------------
def check_3_mermaid_flowcharts_iso() -> Dict[str, Any]:
    findings = []
    mmd_files = [FLOW_NUT1_MMD, FLOW_NUT2_MMD, FLOW_NUT3_MMD]

    for path in mmd_files:
        if not os.path.exists(path):
            findings.append(f"Mermaid file missing: {os.path.basename(path)}")
            continue
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        if "flowchart TD" not in content:
            findings.append(f"File {os.path.basename(path)} must start with flowchart TD")

        for lane in ["LANE_CLIENT", "LANE_GATEWAY", "LANE_SERVER", "LANE_DB"]:
            if lane not in content:
                findings.append(f"File {os.path.basename(path)} missing lane '{lane}'")

        # Count nodes
        node_matches = re.findall(r"^\s+([A-Z0-9_]+)(?:\[|\(|\{|\{\|)", content, re.MULTILINE)
        node_count = len(set(node_matches) - {"TITLE"})
        if node_count != EXPECTED_ISO_PER_TIER:
            findings.append(f"File {os.path.basename(path)} has {node_count} nodes, expected {EXPECTED_ISO_PER_TIER}")

    return {
        "check": "check_3_mermaid_flowcharts_iso",
        "verdict": "PASS" if not findings else "FAIL",
        "findings": findings
    }


# ---------------------------------------------------------------------------
# Check 4: Glossary Health & Anchor Resolution
# ---------------------------------------------------------------------------
def check_4_glossary_health_and_anchors() -> Dict[str, Any]:
    findings = []
    if not os.path.exists(GLOSSARY_MD):
        return {"check": "check_4_glossary_health_and_anchors", "verdict": "FAIL", "findings": ["Glossary missing"]}

    with open(GLOSSARY_MD, "r", encoding="utf-8") as f:
        glossary_content = f.read()

    anchors = set(re.findall(r'<a id="([^"]+)"></a>', glossary_content))

    for term in REQUIRED_GLOSSARY_TERMS:
        if term not in anchors:
            findings.append(f"Required anchor '{term}' not found in glossary")

    # Check ELI5 <= 10 words
    eli5_matches = re.findall(r'\*\*ELI5:\*\*\s*"([^"]+)"', glossary_content)
    for m in eli5_matches:
        words = m.strip().split()
        if len(words) > 10:
            findings.append(f"ELI5 exceeds 10 words ({len(words)} words): '{m}'")

    return {
        "check": "check_4_glossary_health_and_anchors",
        "verdict": "PASS" if not findings else "FAIL",
        "findings": findings
    }


# ---------------------------------------------------------------------------
# Check 5: Deploy Script & Token Security
# ---------------------------------------------------------------------------
def check_5_deploy_script_and_token_security() -> Dict[str, Any]:
    findings = []
    if not os.path.exists(DEPLOY_SCRIPT):
        return {"check": "check_5_deploy_script_and_token_security", "verdict": "FAIL", "findings": ["Deploy script missing"]}

    with open(DEPLOY_SCRIPT, "r", encoding="utf-8") as f:
        script_text = f.read()

    if "process.env.MIRO_ACCESS_TOKEN" not in script_text:
        findings.append("Deploy script does not use process.env.MIRO_ACCESS_TOKEN")

    hardcoded_match = re.search(r"MIRO_ACCESS_TOKEN\s*[:=]\s*['\"][A-Za-z0-9_\-\.]{16,}['\"]", script_text)
    if hardcoded_match:
        findings.append(f"Hardcoded token detected in deploy script: {hardcoded_match.group(0)}")

    if not os.path.exists(REPORT_PATH):
        findings.append("Deploy report scratch/deploy_nutrition_report.json not found")
    else:
        with open(REPORT_PATH, "r", encoding="utf-8") as f:
            report_data = json.load(f)
        if report_data.get("verdict") != "PASS":
            findings.append(f"Deploy report verdict is not PASS: {report_data.get('verdict')}")
        if report_data.get("nodes_created") != TOTAL_EXPECTED_ISO:
            findings.append(f"Deploy report nodes_created {report_data.get('nodes_created')} != {TOTAL_EXPECTED_ISO}")
        if report_data.get("badges_created") != 3:
            findings.append(f"Deploy report badges_created {report_data.get('badges_created')} != 3")

    return {
        "check": "check_5_deploy_script_and_token_security",
        "verdict": "PASS" if not findings else "FAIL",
        "findings": findings
    }


# ---------------------------------------------------------------------------
# Check 6: Master Registry Synchronization & Zero Emoji
# ---------------------------------------------------------------------------
def check_6_registry_sync_and_zero_emoji() -> Dict[str, Any]:
    findings = []
    if not os.path.exists(REGISTRY_MD):
        return {"check": "check_6_registry_sync_and_zero_emoji", "verdict": "FAIL", "findings": ["Registry missing"]}

    with open(REGISTRY_MD, "r", encoding="utf-8") as f:
        reg_text = f.read()

    for badge in ["#23", "#24", "#25"]:
        if badge not in reg_text:
            findings.append(f"Registry missing entry for badge {badge}")

    for shape_id in ["3458764691143273851", "3458764691143273853", "3458764691143273855"]:
        if shape_id not in reg_text:
            findings.append(f"Registry missing Live Miro Shape ID {shape_id}")

    # Zero Emoji Check on all files in Colonna 7
    files_to_check = [
        FLOW_NUT1_MD, FLOW_NUT2_MD, FLOW_NUT3_MD,
        FLOW_NUT1_MMD, FLOW_NUT2_MMD, FLOW_NUT3_MMD,
        DEPLOY_SCRIPT, REGISTRY_MD
    ]
    for fp in files_to_check:
        if os.path.exists(fp):
            with open(fp, "r", encoding="utf-8") as f:
                c = f.read()
            m = EMOJI_PATTERN.search(c)
            if m:
                findings.append(f"Forbidden emoji found in {os.path.basename(fp)}: {m.group(0)}")

    return {
        "check": "check_6_registry_sync_and_zero_emoji",
        "verdict": "PASS" if not findings else "FAIL",
        "findings": findings
    }


# ---------------------------------------------------------------------------
# Main Routine
# ---------------------------------------------------------------------------
def main():
    checks = [
        check_1_scientific_and_legal_compliance(),
        check_2_spec_structure_and_dual_layer(),
        check_3_mermaid_flowcharts_iso(),
        check_4_glossary_health_and_anchors(),
        check_5_deploy_script_and_token_security(),
        check_6_registry_sync_and_zero_emoji()
    ]

    all_pass = all(c["verdict"] == "PASS" for c in checks)
    result = {
        "suite": "redteam_nutrition_verify",
        "verdict": "PASS" if all_pass else "FAIL",
        "total_checks": len(checks),
        "passed_checks": sum(1 for c in checks if c["verdict"] == "PASS"),
        "failed_checks": sum(1 for c in checks if c["verdict"] == "FAIL"),
        "checks": checks
    }

    print(json.dumps(result, indent=2))
    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()
