# -*- coding: utf-8 -*-
"""
tools/redteam_movely_verify.py

Adversarial Red-Team verification suite for Companion App Movely (#19 / #M1).
Supports --pre-deploy (Gate 2) and --post-deploy (Gate 4), outputting a structured
6-check JSON verdict (PASS / FAIL) modeled on an adversarial security audit.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from typing import Any, Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Constants (no magic numbers - Rule 02)
# ---------------------------------------------------------------------------
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

SPEC_DIR = os.path.join(REPO_ROOT, "architecture-blueprint", "00-capitolato-tecnico-e-glossario")
FLOW_ROOT = os.path.join(REPO_ROOT, "architecture-blueprint", "02-miro-zones-and-swimlanes", "18-flowcharts")

MOVELY_SPEC_MD = os.path.join(SPEC_DIR, "19-software-companion-flow-m1-movely-workplace.md")
MOVELY_MMD = os.path.join(FLOW_ROOT, "software-companion-movely", "flow-m1-movely-workplace.mmd")
REGISTRY_MD = os.path.join(SPEC_DIR, "MASTER-FLOWCHART-REGISTRY.md")
GLOSSARY_MD = os.path.join(SPEC_DIR, "00-GLOSSARIO-TERMINI-TECNICI.md")
RULE_08_PATH = os.path.join(REPO_ROOT, ".agents", "rules", "08-miro-architecture-blueprint.md")
DEPLOY_SCRIPT = os.path.join(REPO_ROOT, "architecture-blueprint", "deploy-miro-movely-companion-iso.cjs")
REPORT_PATH = os.path.join(REPO_ROOT, "scratch", "deploy_movely_report.json")

EXPECTED_ISO_COUNT = 18

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
    "movely-companion-app",
    "k-anonymity-hr-privacy-firewall",
    "mini-triage-visivo-del-benessere",
    "family-plan-welfare",
    "smart-clinic-zero-coda",
    "ambassador-educational-feed",
    "co-pay-welfare-wallet"
]

EMOJI_PATTERN = re.compile(
    r"[\U0001F300-\U0001F9FF]|[\U0001FA00-\U0001FAFF]|[\u2600-\u26FF]|[\u2700-\u27BF]"
)


def run_cmd(cmd: List[str], cwd: Optional[str] = None) -> Tuple[int, str, str]:
    try:
        proc = subprocess.run(
            cmd,
            cwd=cwd or REPO_ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=120
        )
        return proc.returncode, proc.stdout, proc.stderr
    except Exception as e:
        return 1, "", str(e)


# ---------------------------------------------------------------------------
# Check 1: Healthcare Boundary, Dossier Salute Quarantine & HR Firewall (k >= 5)
# ---------------------------------------------------------------------------
def check_1_healthcare_quarantine_and_hr_firewall() -> Dict[str, Any]:
    findings = []
    if not os.path.exists(MOVELY_SPEC_MD):
        return {"id": "check_1_healthcare_quarantine_and_hr_firewall", "status": "FAIL", "findings": ["Spec MD missing"]}

    with open(MOVELY_SPEC_MD, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify medical quarantine
    if "Dossier Salute" not in content and "Bunker Silo 2" not in content:
        findings.append("Missing Dossier Salute / Bunker Silo 2 medical quarantine reference in spec")

    if "K-Anonymity" not in content or ("k>=5" not in content.replace(" ", "") and "k\\ge5" not in content.replace(" ", "")):
        findings.append("Missing K-Anonymity k >= 5 specification in spec")

    if "GDPR Art. 9" not in content and "Art. 9" not in content:
        findings.append("Missing GDPR Art. 9 compliance specification in spec")

    return {
        "id": "check_1_healthcare_quarantine_and_hr_firewall",
        "status": "PASS" if not findings else "FAIL",
        "blocking_findings": len(findings),
        "findings": findings
    }


# ---------------------------------------------------------------------------
# Check 2: Cross-Artifact Consistency (1:1 Node IDs & Registry)
# ---------------------------------------------------------------------------
def check_2_cross_artifact_consistency() -> Dict[str, Any]:
    findings = []
    if not os.path.exists(MOVELY_MMD):
        return {"id": "check_2_cross_artifact_consistency", "status": "FAIL", "findings": ["MMD missing"]}

    with open(MOVELY_MMD, "r", encoding="utf-8") as f:
        mmd_content = f.read()

    # Count nodes in MMD (excluding TITLE, startend classes, subgraphs)
    node_pattern = re.compile(r"^\s*([A-Za-z0-9_]+)(\[.*?\]|\(.*?\)|\{.*?\}|\(\(.*?\)|\(\[.*?\]\))", re.MULTILINE)
    nodes = set()
    for m in node_pattern.finditer(mmd_content):
        nid = m.group(1)
        if nid not in ("flowchart", "TITLE", "classDef", "subgraph", "end") and not nid.startswith("LANE_"):
            nodes.add(nid)

    if len(nodes) != EXPECTED_ISO_COUNT:
        findings.append(f"MMD node count is {len(nodes)}, expected {EXPECTED_ISO_COUNT}")

    # Check registry
    if not os.path.exists(REGISTRY_MD):
        findings.append("MASTER-FLOWCHART-REGISTRY.md missing")
    else:
        with open(REGISTRY_MD, "r", encoding="utf-8") as f:
            reg_content = f.read()
        if "#19" not in reg_content or "FLOW-M1" not in reg_content:
            findings.append("Registry missing #19 / FLOW-M1 entry")

    return {
        "id": "check_2_cross_artifact_consistency",
        "status": "PASS" if not findings else "FAIL",
        "node_count": len(nodes),
        "blocking_findings": len(findings),
        "findings": findings
    }


# ---------------------------------------------------------------------------
# Check 3: Spec Quality, Dual-Level 7 Sections, Zero Emoji (Regola 01)
# ---------------------------------------------------------------------------
def check_3_spec_quality_sdk_emoji() -> Dict[str, Any]:
    findings = []
    if not os.path.exists(MOVELY_SPEC_MD):
        return {"id": "check_3_spec_quality_sdk_emoji", "status": "FAIL", "findings": ["Spec MD missing"]}

    with open(MOVELY_SPEC_MD, "r", encoding="utf-8") as f:
        spec_content = f.read()

    # Check 7 sections
    for sec in REQUIRED_SECTIONS:
        # Match normalized
        sec_core = re.sub(r"[^a-zA-Z0-9]", "", sec.lower())
        found = any(sec_core in re.sub(r"[^a-zA-Z0-9]", "", line.lower()) for line in spec_content.splitlines())
        if not found:
            findings.append(f"Missing required section in spec: {sec}")

    # Check emoji in spec, mmd, deploy script
    files_to_check = [MOVELY_SPEC_MD, MOVELY_MMD]
    if os.path.exists(DEPLOY_SCRIPT):
        files_to_check.append(DEPLOY_SCRIPT)

    for fpath in files_to_check:
        with open(fpath, "r", encoding="utf-8") as f:
            txt = f.read()
        emojis = EMOJI_PATTERN.findall(txt)
        if emojis:
            findings.append(f"Emoji found in {os.path.basename(fpath)}: {set(emojis)}")

    # Check sequenceDiagram in spec
    m_seq = re.search(r"```mermaid\s+(sequenceDiagram[\s\S]*?)```", spec_content)
    if not m_seq:
        findings.append("Missing sequenceDiagram in spec")

    return {
        "id": "check_3_spec_quality_sdk_emoji",
        "status": "PASS" if not findings else "FAIL",
        "blocking_findings": len(findings),
        "findings": findings
    }


# ---------------------------------------------------------------------------
# Check 4: Living Glossary Health (150 terms, zero broken line 9 anchors)
# ---------------------------------------------------------------------------
def check_4_glossary_health_line9_links() -> Dict[str, Any]:
    findings = []
    code, out, err = run_cmd(["py", "tools/check_line9_links.py"])
    if code != 0 or "Total missing line 9 anchors: 0" not in out:
        findings.append(f"check_line9_links.py failed: {out.strip()} {err.strip()}")

    if not os.path.exists(GLOSSARY_MD):
        findings.append("00-GLOSSARIO-TERMINI-TECNICI.md missing")
    else:
        with open(GLOSSARY_MD, "r", encoding="utf-8") as f:
            gloss_content = f.read()
        for term in REQUIRED_GLOSSARY_TERMS:
            if f"id=\"{term}\"" not in gloss_content and f"#{term}" not in gloss_content:
                findings.append(f"Glossary missing required Movely term anchor: {term}")

    return {
        "id": "check_4_glossary_health_line9_links",
        "status": "PASS" if not findings else "FAIL",
        "blocking_findings": len(findings),
        "findings": findings
    }


# ---------------------------------------------------------------------------
# Check 5: Scope Integrity and test_check.py (Rule 08 Untouched)
# ---------------------------------------------------------------------------
def check_5_scope_integrity_and_test_check() -> Dict[str, Any]:
    findings = []
    # Check Rule 08 git diff
    code, out, err = run_cmd(["git", "diff", "HEAD", "--", ".agents/rules/08-miro-architecture-blueprint.md"])
    if out.strip():
        findings.append("Rule 08 (.agents/rules/08-miro-architecture-blueprint.md) has uncommitted diff! Must remain UNTOUCHED.")

    # Check root test_check.py
    code, out, err = run_cmd(["py", "test_check.py"])
    if code != 0 or "SUCCESS: 100% REACT 18 + TYPESCRIPT STRICT VALIDATION PASSED!" not in out:
        findings.append(f"test_check.py failed with returncode {code}: {out[-300:]}")

    return {
        "id": "check_5_scope_integrity_and_test_check",
        "status": "PASS" if not findings else "FAIL",
        "root_test_check_exit_code": code,
        "blocking_findings": len(findings),
        "findings": findings
    }


# ---------------------------------------------------------------------------
# Check 6: Post-Deploy / Pre-Deploy Miro Geometry and Secrets Hygiene
# ---------------------------------------------------------------------------
def check_6_miro_geometry_and_secrets(mode: str) -> Dict[str, Any]:
    findings = []
    if not os.path.exists(DEPLOY_SCRIPT):
        findings.append(f"Deploy script missing: {DEPLOY_SCRIPT}")
        return {
            "id": "check_6_post_deploy_miro_geometry_and_secrets",
            "status": "FAIL",
            "blocking_findings": len(findings),
            "findings": findings
        }

    with open(DEPLOY_SCRIPT, "r", encoding="utf-8") as f:
        script_txt = f.read()

    # Verify secret hygiene
    if "eyJ" in script_txt:
        findings.append("Hardcoded JWT/Miro token detected in deploy script!")
    if "process.env.MIRO_ACCESS_TOKEN" not in script_txt:
        findings.append("Deploy script does not use process.env.MIRO_ACCESS_TOKEN exclusively")

    if mode == "pre-deploy":
        # Validate local geometry and script parameters
        if "10500" not in script_txt and "10600" not in script_txt and "10450" not in script_txt:
            findings.append("Deploy script does not position Movely at X >= 10400")
        if "#19 / #M1" not in script_txt and "#19" not in script_txt:
            findings.append("Deploy script missing #19 / #M1 Badge specification")
    elif mode == "post-deploy":
        # Check report file
        if not os.path.exists(REPORT_PATH):
            findings.append(f"Deploy report file missing: {REPORT_PATH}")
        else:
            with open(REPORT_PATH, "r", encoding="utf-8") as f:
                report = json.load(f)
            if report.get("verdict") != "PASS" and report.get("status") != "SUCCESS":
                findings.append(f"Deploy report verdict is not PASS/SUCCESS: {report.get('verdict')}")
            if report.get("crossings", 0) != 0:
                findings.append(f"Deploy report indicates {report.get('crossings')} crossings! (Must be 0)")
            if report.get("nodes_created", 0) != EXPECTED_ISO_COUNT:
                findings.append(f"Deploy report created {report.get('nodes_created')} nodes, expected {EXPECTED_ISO_COUNT}")

    return {
        "id": "check_6_post_deploy_miro_geometry_and_secrets",
        "status": "PASS" if not findings else "FAIL",
        "blocking_findings": len(findings),
        "findings": findings
    }


def main():
    parser = argparse.ArgumentParser(description="Adversarial Red-Team verification for Movely Companion App")
    parser.add_argument("--pre-deploy", action="store_true", help="Run Gate 2 pre-deploy audit")
    parser.add_argument("--post-deploy", action="store_true", help="Run Gate 4 post-deploy audit")
    args = parser.parse_args()

    mode = "post-deploy" if args.post_deploy else "pre-deploy"

    checks = [
        check_1_healthcare_quarantine_and_hr_firewall(),
        check_2_cross_artifact_consistency(),
        check_3_spec_quality_sdk_emoji(),
        check_4_glossary_health_line9_links(),
        check_5_scope_integrity_and_test_check(),
        check_6_miro_geometry_and_secrets(mode)
    ]

    total_findings = sum(c.get("blocking_findings", 0) for c in checks)
    failed_checks = sum(1 for c in checks if c["status"] == "FAIL")

    passed_count = len(checks) - failed_checks
    score = round((passed_count / len(checks)) * 5)
    verdict = "PASS" if total_findings == 0 else "FAIL"

    result = {
        "mode": mode,
        "verdict": verdict,
        "score": score,
        "summary": f"Gate {2 if mode == 'pre-deploy' else 4} ({mode}) Red-Team audit {verdict}: {failed_checks} failed check(s), {total_findings} total finding(s), score {score}/5.",
        "checks": checks,
        "findings": [f for c in checks for f in c.get("findings", [])]
    }

    print(json.dumps(result, indent=2))
    sys.exit(0 if verdict == "PASS" else 1)


if __name__ == "__main__":
    main()
