# -*- coding: utf-8 -*-
"""
Adversarial Red-Team verification suite for Colonna 6 ("PREFERITI") reorganization.
Supports --pre-deploy (Gate 2) and --post-deploy (Gate 4), outputting a structured
6-check JSON verdict (PASS / FAIL) modeled on an adversarial security audit.
"""

import argparse
import glob
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

FLOW_6A_MD = os.path.join(SPEC_DIR, "06-software-1-flow-6a-movely-desk-care.md")
FLOW_6B_MD = os.path.join(SPEC_DIR, "12-software-2-flow-6b-physio-rehab-rom.md")
FLOW_6C_MD = os.path.join(SPEC_DIR, "18-software-3-flow-6c-medical-room-research-silo3.md")
REGISTRY_MD = os.path.join(SPEC_DIR, "MASTER-FLOWCHART-REGISTRY.md")
GLOSSARY_MD = os.path.join(SPEC_DIR, "00-GLOSSARIO-TERMINI-TECNICI.md")

FLOW_6A_MMD = os.path.join(FLOW_ROOT, "software-1-consumer-b2c", "flow-6a-movely-desk-care.mmd")
FLOW_6B_MMD = os.path.join(FLOW_ROOT, "software-2-pro-b2b", "flow-6b-physio-rehab-rom.mmd")
FLOW_6C_MMD = os.path.join(FLOW_ROOT, "software-3-elite-club-enterprise", "flow-6c-medical-room-research-silo3.mmd")

RULE_08_REL = ".agents/rules/08-miro-architecture-blueprint.md"
ROOT_TEST_CHECK = os.path.join(REPO_ROOT, "test_check.py")

DEPLOY_SCRIPT_CJS = os.path.join(REPO_ROOT, "architecture-blueprint", "deploy-miro-favorites-tiers-iso.cjs")
POST_DEPLOY_REPORT_JSON = os.path.join(REPO_ROOT, "scratch", "deploy_col6_report.json")

EXPECTED_SPEC_COUNT = 18
EXPECTED_HTTP_ERROR_COLUMNS = 6
MAX_ELI5_WORDS = 10
MIN_DIAMOND_WIDTH_PX = 360.0
MIN_DIAMOND_HEIGHT_PX = 125.0
MIN_BADGE_CLEARANCE_PX = 40.0
EXPECTED_TOTAL_DEPLOYED_NODES = 48
GEMINI_EMBEDDING_2_DEFAULT_DIM = 3072
BLOCKING_SEVERITIES = ("critical", "major", "moderate")

FLOW_EXPECTATIONS: Dict[str, Dict[str, Any]] = {
    "FLOW-6A": {
        "badge": "#06",
        "shape_id": "3458764688417722722",
        "coord_x": "8960.19",
        "coord_y": "602.88",
        "iso_nodes": 14,
        "md_path": FLOW_6A_MD,
        "mmd_path": FLOW_6A_MMD,
        "parking_keywords": ("Movely Desk-Care", "parcheggiat"),
    },
    "FLOW-6B": {
        "badge": "#12",
        "shape_id": "3458764688417722770",
        "coord_x": "9108.26",
        "coord_y": "3815.00",
        "iso_nodes": 16,
        "md_path": FLOW_6B_MD,
        "mmd_path": FLOW_6B_MMD,
        "parking_keywords": ("Physio Rehab", "ROM", "parcheggiat"),
    },
    "FLOW-6C": {
        "badge": "#18",
        "shape_id": "3458764688417722810",
        "coord_x": "9225.38",
        "coord_y": "8230.99",
        "iso_nodes": 18,
        "md_path": FLOW_6C_MD,
        "mmd_path": FLOW_6C_MMD,
        "parking_keywords": ("Medical Room", "EMR", "Silo 3", "parcheggiat"),
    },
}

AUDITED_EMOJI_FILES = [
    FLOW_6A_MD,
    FLOW_6B_MD,
    FLOW_6C_MD,
    REGISTRY_MD,
    GLOSSARY_MD,
    FLOW_6A_MMD,
    FLOW_6B_MMD,
    FLOW_6C_MMD,
    os.path.join(REPO_ROOT, "tools", "generate_glossary.py"),
    os.path.join(REPO_ROOT, "tools", "sync_and_rebuild_glossary.py"),
    os.path.join(REPO_ROOT, "tools", "redteam_favorites_verify.py"),
]

DEPRECATED_GEMINI_PATTERNS = [
    r"text-embedding-004",
    r"gemini-1\.5",
    r"gemini-1\.0",
]

REQUIRED_SECTIONS_REGEX = [
    r"^##\s+1\.",
    r"^##\s+2\.",
    r"^##\s+3\.",
    r"^##\s+4\.",
    r"^###\s+Livello\s+A",
    r"^###\s+Livello\s+B",
    r"^##\s+5\.",
    r"^##\s+6\.",
    r"^##\s+7\.",
]

REQUIRED_UI_STATES = (
    "Empty State",
    "Loading State",
    "Populated State",
    "Error / Fallback State",
)

EMOJI_REGEX = re.compile(
    "["
    "\U0001F300-\U0001F9FF"
    "\U0001FA00-\U0001FAFF"
    "\u2600-\u27BF"
    "\u2300-\u23FF"
    "\u2B50\u2B55\u2934\u2935\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE"
    "\u200D\uFE0F"
    "]",
    flags=re.UNICODE,
)

# Forbidden Col 1-5 filename prefixes (spec files 01..05, 07..11, 13..17)
COL_1_5_SPEC_PREFIXES = (
    "01-", "02-", "03-", "04-", "05-",
    "07-", "08-", "09-", "10-", "11-",
    "13-", "14-", "15-", "16-", "17-",
)

COL_1_5_MMD_PREFIXES = (
    "flow-1", "flow-2", "flow-3", "flow-4", "flow-5",
)


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def read_text(path: str) -> str:
    """Read a UTF-8 text file and return its full content string."""
    with open(path, "r", encoding="utf-8") as handle:
        return handle.read()


def rel_path(path: str) -> str:
    """Convert an absolute filesystem path to a clean repo-relative POSIX path."""
    return os.path.relpath(path, REPO_ROOT).replace("\\", "/")


def find_line_number(content: str, pattern: str, flags: int = re.IGNORECASE) -> Optional[int]:
    """Return the 1-based line number of the first regex match in content, or None."""
    match = re.search(pattern, content, flags)
    if not match:
        return None
    return content[: match.start()].count("\n") + 1


def add_finding(
    findings: List[Dict[str, Any]],
    check_id: str,
    severity: str,
    file_path: str,
    line: Optional[int],
    issue: str,
    recommendation: str,
) -> None:
    """Append a structured Red-Team finding dictionary to the findings list."""
    findings.append(
        {
            "check": check_id,
            "severity": severity,
            "file": rel_path(file_path) if os.path.isabs(file_path) else file_path,
            "line": line,
            "issue": issue,
            "recommendation": recommendation,
        }
    )


def extract_mmd_subgraph_nodes(mmd_text: str) -> List[str]:
    """Extract ordered ISO node IDs declared inside the 4 swimlane subgraphs of a .mmd file."""
    in_subgraph = False
    nodes: List[str] = []
    node_decl_re = re.compile(r"^\s*([A-Z][A-Z0-9_]+)\s*(\(\[|\[\(|\[\"|\[|\{\"|\{)")
    for raw_line in mmd_text.splitlines():
        stripped = raw_line.strip()
        if stripped.startswith("subgraph "):
            in_subgraph = True
            continue
        if stripped == "end":
            in_subgraph = False
            continue
        if in_subgraph:
            match = node_decl_re.match(raw_line)
            if match:
                nodes.append(match.group(1))
    return nodes


def extract_md_livello_b_nodes(md_text: str) -> List[str]:
    """Extract numbered ISO node IDs listed in the Livello B alignment block of a spec .md file."""
    match = re.search(r"Allineamento 1:1 ai \d+ Nodi ISO[\s\S]*?(?=\n-\s+\*\*|\n---)", md_text)
    if not match:
        return []
    block = match.group(0)
    return re.findall(r"^\s*\d+\.\s+`([A-Z][A-Z0-9_]+)`", block, flags=re.MULTILINE)


def get_sections_1_to_6(md_text: str) -> str:
    """Return text of sections 1 through 6 of a spec .md file, excluding Section 7 cascade notes."""
    split_match = re.search(r"^##\s+7\.", md_text, flags=re.MULTILINE)
    if not split_match:
        return md_text
    return md_text[: split_match.start()]


# ---------------------------------------------------------------------------
# Check 1: Privilege Escalation & Tier Leakage (Envoy RBAC + PostgreSQL RLS)
# ---------------------------------------------------------------------------

def run_check_1_security_rbac_rls(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Audit Tier 1/2/3 RBAC boundaries, DB isolation, and Silo 2 GDPR Art. 9 RLS policies."""
    check_id = "check_1_privilege_escalation_rbac_rls"
    md_6a = read_text(FLOW_6A_MD)
    mmd_6a = read_text(FLOW_6A_MMD)
    md_6b = read_text(FLOW_6B_MD)
    mmd_6b = read_text(FLOW_6B_MMD)
    md_6c = read_text(FLOW_6C_MD)
    mmd_6c = read_text(FLOW_6C_MMD)

    # --- Attack 1A: Tier 1 (FLOW-6A) ---
    tier1_required_md = [
        (r"CATALOG_EXERCISE_3D", "Tier 1 must whitelist CATALOG_EXERCISE_3D (#02)."),
        (r"BASE_PROGRAM", "Tier 1 must whitelist BASE_PROGRAM (#03)."),
        (r"LINEAR_LIST|lista\s+semplice\s+e\s+lineare", "Tier 1 must enforce a flat linear list."),
        (r"403\s+Forbidden", "Tier 1 must return HTTP 403 Forbidden for blocked features."),
        (r"NO\s+sottocartelle", "Tier 1 must explicitly reject subfolders."),
        (r"NO\s+tag", "Tier 1 must explicitly reject tags."),
        (r"NO\s+fonti", "Tier 1 must explicitly reject scientific sources."),
        (r"NO\s+video\s+personalizzati|NO\s+video\s+custom|video\s+custom", "Tier 1 must explicitly reject custom videos."),
        (r"NO\s+template", "Tier 1 must explicitly reject templates."),
        (r"NO\s+Data\s+Analisi|Data\s+Analisi", "Tier 1 must explicitly reject Data Analisi."),
        (r"NO\s+AI", "Tier 1 must explicitly reject AI."),
        (r"NO\s+RAG", "Tier 1 must explicitly reject RAG."),
    ]
    for pattern, msg in tier1_required_md:
        if not re.search(pattern, md_6a, flags=re.IGNORECASE):
            add_finding(findings, check_id, "critical", FLOW_6A_MD, None, msg, "Add explicit Tier 1 RBAC enforcement in 06 spec.")

    for pattern, label in (
        (r"#02", "Catalogo 3D (#02)"),
        (r"#03", "Programmi Base (#03)"),
        (r"403\s+Forbidden", "HTTP 403 Forbidden"),
        (r"NO\s+Cartelle/Tag", "NO Cartelle/Tag"),
        (r"NO\s+AI,\s*NO\s+RAG", "NO AI, NO RAG"),
    ):
        if not re.search(pattern, mmd_6a, flags=re.IGNORECASE):
            add_finding(findings, check_id, "major", FLOW_6A_MMD, None, f"FLOW-6A Mermaid missing required guard: {label}.", "Ensure flow-6a .mmd encodes all Tier 1 RBAC boundaries.")

    # Verify DB CHECK constraint in 06 spec restricts to exact 2 types
    check_6a_sql = re.search(r"CHECK\s*\(\s*resource_type\s+IN\s*\(([^)]+)\)\s*\)", md_6a, flags=re.IGNORECASE)
    if not check_6a_sql or set(re.findall(r"'([^']+)'", check_6a_sql.group(1))) != {"CATALOG_EXERCISE_3D", "BASE_PROGRAM"}:
        add_finding(
            findings,
            check_id,
            "critical",
            FLOW_6A_MD,
            find_line_number(md_6a, r"resource_type"),
            "Tier 1 DB CHECK constraint must restrict resource_type strictly to ('CATALOG_EXERCISE_3D', 'BASE_PROGRAM').",
            "Tighten PostgreSQL CHECK constraint on user_favorites in 06 spec.",
        )

    # Adversarial feature-leakage check in Tier 1 active sections (1..6) and .mmd
    sec16_6a = get_sections_1_to_6(md_6a)
    for forbidden_pat, desc in (
        (r"\bltree\b", "ltree hierarchical tree leaked into Tier 1"),
        (r"\bpgvector\b", "pgvector semantic search leaked into Tier 1"),
        (r"gemini-embedding-2|interactions\.create", "Gemini AI SDK leaked into Tier 1"),
        (r"TEAM_STAFF|pro_favorite_folders", "Tier 2/3 schema leaked into Tier 1"),
    ):
        for target_path, target_text in ((FLOW_6A_MD, sec16_6a), (FLOW_6A_MMD, mmd_6a)):
            line = find_line_number(target_text, forbidden_pat)
            if line is not None:
                add_finding(findings, check_id, "critical", target_path, line, f"Tier leakage detected: {desc}.", "Remove Tier 2/3 capability from Tier 1 active sections.")

    # --- Attack 1B: Tier 2 (FLOW-6B) ---
    tier2_required_md = [
        (r"PRO_CUSTOM_VIDEO_1080P|#08", "Tier 2 must allow 1080p custom videos (#08)."),
        (r"PRO_PROGRAM_TEMPLATE|#09", "Tier 2 must allow reusable program templates (#09)."),
        (r"SCIENTIFIC_SOURCE_OA|SCIENTIFIC_SOURCE_SUMMARY|LOCAL_STUDY_NOTE_REF|#11", "Tier 2 must allow scientific sources and local notes (#11)."),
        (r"Cartelle\s+Tematiche", "Tier 2 must support thematic folders."),
        (r"Tag\s+personalizzati|pro_favorite_tags", "Tier 2 must support custom tags."),
        (r"DATA_ANALYSIS_ISOLATION_TIER2", "Tier 2 must explicitly block Data Analisi (#10) with DB separation."),
        (r"NO\s+AI", "Tier 2 must explicitly forbid AI."),
        (r"NO\s+RAG", "Tier 2 must explicitly forbid RAG."),
        (r"PERSONAL_ONLY|NO\s+condivisione\s+Team/Staff|Condivisione\s+Team\s+Non\s+Ammess", "Tier 2 must explicitly forbid Team/Staff sharing."),
    ]
    for pattern, msg in tier2_required_md:
        if not re.search(pattern, md_6b, flags=re.IGNORECASE):
            add_finding(findings, check_id, "critical", FLOW_6B_MD, None, msg, "Add explicit Tier 2 RBAC and DB isolation rules in 12 spec.")

    for pattern, label in (
        (r"#08", "Video 1080p (#08)"),
        (r"#09", "Template (#09)"),
        (r"#11", "Fonti & Appunti (#11)"),
        (r"Data\s+Analisi", "Blocco Data Analisi"),
        (r"NO\s+AI,\s*NO\s+RAG", "NO AI, NO RAG"),
        (r"Condivisione\s+Team", "Blocco Condivisione Team"),
    ):
        if not re.search(pattern, mmd_6b, flags=re.IGNORECASE):
            add_finding(findings, check_id, "major", FLOW_6B_MMD, None, f"FLOW-6B Mermaid missing required guard: {label}.", "Ensure flow-6b .mmd explicitly depicts Tier 2 permissions and DB separation.")

    # Adversarial check: ensure Tier 2 SQL CHECK excludes any DATA_ANALYSIS or CLINICAL type
    check_6b_sql = re.search(r"CHECK\s*\(\s*resource_type\s+IN\s*\(([^)]+)\)\s*\)", md_6b, flags=re.IGNORECASE)
    if not check_6b_sql:
        add_finding(findings, check_id, "critical", FLOW_6B_MD, None, "Missing PostgreSQL CHECK constraint on pro_favorite_pointers.resource_type.", "Define explicit whitelist CHECK constraint excluding Data Analisi and Tier 3 types.")
    else:
        allowed_6b = set(re.findall(r"'([^']+)'", check_6b_sql.group(1)))
        for bad_type in allowed_6b:
            if any(tok in bad_type.upper() for tok in ("DATA_ANALYSIS", "CLINICAL", "4K", "RAG", "MATCH")):
                add_finding(findings, check_id, "critical", FLOW_6B_MD, find_line_number(md_6b, bad_type), f"Tier 2 CHECK constraint leaks forbidden type '{bad_type}'.", "Remove Tier 3 or Data Analisi types from Tier 2 DB whitelist.")

    # Adversarial feature-leakage check in Tier 2 active sections (1..6) and .mmd
    sec16_6b = get_sections_1_to_6(md_6b)
    for forbidden_pat, desc in (
        (r"\bltree\b", "ltree complex tree leaked into Tier 2 active spec"),
        (r"\bpgvector\b", "pgvector leaked into Tier 2 active spec"),
        (r"gemini-embedding-2|interactions\.create", "Gemini AI SDK leaked into Tier 2 active spec"),
        (r"club_favorite_items", "Silo 2 club table leaked into Tier 2 active spec"),
    ):
        for target_path, target_text in ((FLOW_6B_MD, sec16_6b), (FLOW_6B_MMD, mmd_6b)):
            line = find_line_number(target_text, forbidden_pat)
            if line is not None:
                add_finding(findings, check_id, "critical", target_path, line, f"Tier leakage detected: {desc}.", "Keep Tier 3 features strictly confined to FLOW-6C.")

    # --- Attack 1C: Tier 3 (FLOW-6C) ---
    tier3_required_md = [
        (r"#14", "Tier 3 must include 4K Catalog pointers (#14)."),
        (r"#15", "Tier 3 must include Seasonal Program pointers (#15)."),
        (r"#16", "Tier 3 must include Data Analisi & Readiness pointers (#16)."),
        (r"#17", "Tier 3 must include Scientific Sources pointers (#17)."),
        (r"RAG", "Tier 3 must include RAG staff documents."),
        (r"Match\s+Analisi|MATCH_ANALYSIS_REPORT", "Tier 3 must include Match Analysis reports."),
        (r"Referti|CLINICAL_MEDICAL_REPORT", "Tier 3 must include clinical reports."),
        (r"PERSONAL", "Tier 3 must support PERSONAL scope."),
        (r"TEAM_STAFF", "Tier 3 must support TEAM_STAFF scope."),
        (r"Pinning|is_pinned", "Tier 3 must support Team/Staff pinning."),
        (r"\bltree\b", "Tier 3 must use PostgreSQL ltree folder tree."),
        (r"\btsvector\b", "Tier 3 must include PostgreSQL Full-Text tsvector search."),
        (r"\bpgvector\b", "Tier 3 must include pgvector semantic search."),
        (r"ENABLE\s+ROW\s+LEVEL\s+SECURITY", "Tier 3 must enable PostgreSQL RLS."),
        (r"FORCE\s+ROW\s+LEVEL\s+SECURITY", "Tier 3 must enforce FORCE ROW LEVEL SECURITY."),
        (r"CLINICAL_GDPR_ART9", "Tier 3 must classify clinical records under CLINICAL_GDPR_ART9."),
        (r"R4_TEAM_DOCTOR", "Tier 3 RLS must authorize R4_TEAM_DOCTOR."),
        (r"R3_TEAM_PHYSIO", "Tier 3 RLS must authorize R3_TEAM_PHYSIO."),
        (r"silenzios|zero\s+leakage|zero\s+existence", "Tier 3 must enforce silent masking with zero existence hint."),
    ]
    for pattern, msg in tier3_required_md:
        if not re.search(pattern, md_6c, flags=re.IGNORECASE):
            add_finding(findings, check_id, "critical", FLOW_6C_MD, None, msg, "Add missing Tier 3 security or All-in-One contract in 18 spec.")

    for pattern, label in (
        (r"#14", "Catalogo 4K (#14)"),
        (r"#15", "Programmazione (#15)"),
        (r"#16", "Data Analisi (#16)"),
        (r"#17", "Fonti (#17)"),
        (r"Pinning", "Team/Staff Pinning"),
        (r"\bltree\b", "Albero ltree"),
        (r"\btsvector\b", "Full-Text tsvector"),
        (r"\bpgvector\b", "Semantic pgvector"),
        (r"GDPR\s+Art\.\s*9", "GDPR Art. 9"),
        (r"Filtro\s+Silenzioso", "Silent RBAC mask"),
        (r"RLS", "PostgreSQL RLS"),
    ):
        if not re.search(pattern, mmd_6c, flags=re.IGNORECASE):
            add_finding(findings, check_id, "major", FLOW_6C_MMD, None, f"FLOW-6C Mermaid missing required element: {label}.", "Ensure flow-6c .mmd includes all Tier 3 All-in-One and GDPR Art. 9 RLS controls.")

    # --- Deep Red-Team Adversarial Attacks on Tier 3 RLS & Authority Source ---
    # Attack A (Checklist #1 Update Bypass & #3 Business Logic):
    # With FORCE ROW LEVEL SECURITY, defining ONLY FOR SELECT blocks all writes or invites unsafe FOR ALL workarounds.
    has_write_rls = bool(
        re.search(r"FOR\s+(INSERT|UPDATE|DELETE|ALL)\b", md_6c, flags=re.IGNORECASE)
        and re.search(r"WITH\s+CHECK\s*\(", md_6c, flags=re.IGNORECASE)
    )
    if not has_write_rls:
        add_finding(
            findings,
            check_id,
            "major",
            FLOW_6C_MD,
            find_line_number(md_6c, r"CREATE\s+POLICY"),
            "PostgreSQL RLS snippet on club_favorite_items defines ONLY FOR SELECT with FORCE ROW LEVEL SECURITY, omitting FOR INSERT/UPDATE/DELETE WITH CHECK policies. Under FORCE RLS all writes fail (broken business logic), or a naive FOR ALL policy would allow non-medical staff to UPDATE sensitivity_class from CLINICAL_GDPR_ART9 to STANDARD or mutate other users' PERSONAL rows.",
            "Add explicit FOR INSERT, FOR UPDATE (USING + WITH CHECK preventing sensitivity_class downgrade by non-medical roles and enforcing owner/team ACL), and FOR DELETE RLS policies for club_favorite_items, club_favorite_trees, and club_favorite_embeddings.",
        )

    # Attack B (GDPR Art. 9 Zero Existence Disclosure on club_favorite_trees):
    # flow-6c .mmd sends DB_FAV_TREES directly to RENDER_ROLE_RESULTS; if club_favorite_trees lacks sensitivity_class,
    # a medical folder created under TEAM_STAFF leaks its label/path to non-medical staff!
    trees_schema_match = re.search(r"-\s+`club_favorite_trees`:[^\n]+", md_6c)
    trees_line = find_line_number(md_6c, r"`club_favorite_trees`:")
    if trees_schema_match and "sensitivity_class" not in trees_schema_match.group(0):
        add_finding(
            findings,
            check_id,
            "major",
            FLOW_6C_MD,
            trees_line,
            "GDPR Art. 9 metadata/existence-disclosure hole: club_favorite_trees lacks a sensitivity_class column while DB_FAV_TREES feeds RENDER_ROLE_RESULTS directly. If Medical Staff creates a clinical subfolder under TEAM_STAFF (e.g. 'referti_lca_atleta'), coaches/trainers see the folder path/label even when items inside are hidden, leaking the existence of clinical records.",
            "Add sensitivity_class VARCHAR(32) NOT NULL DEFAULT 'STANDARD' CHECK (sensitivity_class IN ('STANDARD','CLINICAL_GDPR_ART9')) to club_favorite_trees and apply the identical silent GDPR Art. 9 PostgreSQL RLS SELECT/WRITE policies to club_favorite_trees and club_favorite_embeddings.",
        )

    # Attack C (Checklist #2 Authority Source - Spoofable Tenant Header):
    # Request contract includes X-Club-Tenant-ID; spec should explicitly prohibit trusting client-supplied tenant/role headers over mTLS/JWT claims.
    if "X-Club-Tenant-ID" in md_6c:
        has_header_anti_spoof = bool(
            re.search(r"X-Club-Tenant-ID[^\n]*(ignor|verific|confront|mTLS|JWT|spoof)", md_6c, flags=re.IGNORECASE)
        )
        if not has_header_anti_spoof:
            add_finding(
                findings,
                check_id,
                "moderate",
                FLOW_6C_MD,
                find_line_number(md_6c, r"X-Club-Tenant-ID"),
                "Authority source ambiguity: POST /api/v1/enterprise/favorites/search accepts client header X-Club-Tenant-ID without explicitly stating that Envoy must cross-validate it against the mTLS certificate / signed JWT club_id claim and reject mismatches (HTTP 403) before setting app.current_club_id.",
                "Explicitly specify in Corsia 2 / Section 6 that app.current_club_id is derived exclusively from the mTLS/JWT claim and any mismatch with X-Club-Tenant-ID is rejected with HTTP 403.",
            )

    check_findings = [f for f in findings if f["check"] == check_id and f["severity"] in BLOCKING_SEVERITIES]
    return {
        "id": check_id,
        "status": "FAIL" if check_findings else "PASS",
        "blocking_findings": len(check_findings),
    }


# ---------------------------------------------------------------------------
# Check 2: Cross-Artifact Consistency 1:1
# ---------------------------------------------------------------------------

def run_check_2_cross_artifact_consistency(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Verify 1:1 alignment of ISO node counts, node IDs, LIVE badge IDs/coords, and parking notes."""
    check_id = "check_2_cross_artifact_consistency"
    registry_text = read_text(REGISTRY_MD)

    for flow_code, expected in FLOW_EXPECTATIONS.items():
        md_text = read_text(expected["md_path"])
        mmd_text = read_text(expected["mmd_path"])
        target_nodes = expected["iso_nodes"]

        # 1. Count ISO nodes in .mmd and compare with expected & .md Livello B list
        mmd_nodes = extract_mmd_subgraph_nodes(mmd_text)
        md_nodes = extract_md_livello_b_nodes(md_text)

        if len(mmd_nodes) != target_nodes:
            add_finding(
                findings,
                check_id,
                "critical",
                expected["mmd_path"],
                None,
                f"{flow_code} .mmd has {len(mmd_nodes)} ISO nodes inside 4 swimlanes; expected {target_nodes}.",
                f"Align {flow_code} .mmd swimlane node count to exactly {target_nodes}.",
            )

        if len(md_nodes) != target_nodes:
            add_finding(
                findings,
                check_id,
                "critical",
                expected["md_path"],
                find_line_number(md_text, r"Allineamento 1:1"),
                f"{flow_code} .md Livello B lists {len(md_nodes)} ISO nodes; expected {target_nodes}.",
                f"Align {flow_code} .md Livello B node inventory to exactly {target_nodes}.",
            )

        if mmd_nodes != md_nodes:
            add_finding(
                findings,
                check_id,
                "major",
                expected["md_path"],
                find_line_number(md_text, r"Allineamento 1:1"),
                f"{flow_code} ISO node ID list mismatch between .mmd ({mmd_nodes}) and .md Livello B ({md_nodes}).",
                "Synchronize exact ordered ISO node IDs 1:1 between .mmd and .md.",
            )

        # 2. Verify header line in .md declares exact Shape ID, LIVE coords, and ISO node count
        badge_line_re = (
            rf"{re.escape(expected['badge'])}.*"
            rf"X:\s*{re.escape(expected['coord_x'])},\s*Y:\s*{re.escape(expected['coord_y'])}.*"
            rf"{re.escape(expected['shape_id'])}.*"
            rf"Nodi ISO:\s*`?{target_nodes}`?"
        )
        if not re.search(badge_line_re, md_text):
            add_finding(
                findings,
                check_id,
                "critical",
                expected["md_path"],
                4,
                f"{flow_code} .md header metadata does not match LIVE Badge {expected['badge']} / ID {expected['shape_id']} / coords ({expected['coord_x']}, {expected['coord_y']}) / {target_nodes} ISO nodes.",
                "Fix Section 1 Badge Miro Board line to match LIVE metadata.",
            )

        # 3. Verify MASTER-FLOWCHART-REGISTRY.md master table row & Section 6 detail match 1:1
        reg_row_re = (
            rf"\|\s*\*\*{re.escape(expected['badge'])}\*\*\s*\|.*?"
            rf"`{re.escape(flow_code)}`.*?"
            rf"\|\s*{target_nodes}\s*\|\s*`{re.escape(expected['shape_id'])}`\s*\|"
            rf"\s*`X:\s*{re.escape(expected['coord_x'])},\s*Y:\s*{re.escape(expected['coord_y'])}`\s*\|"
        )
        if not re.search(reg_row_re, registry_text):
            add_finding(
                findings,
                check_id,
                "critical",
                REGISTRY_MD,
                find_line_number(registry_text, re.escape(flow_code)),
                f"MASTER-FLOWCHART-REGISTRY.md row for {expected['badge']} ({flow_code}) does not match expected ISO count ({target_nodes}), Shape ID ({expected['shape_id']}), or LIVE coords ({expected['coord_x']}, {expected['coord_y']}).",
                "Update master inventory table row in MASTER-FLOWCHART-REGISTRY.md.",
            )

        # 4. Verify explicit Parking Notes in both .md and Registry
        for kw in expected["parking_keywords"]:
            if not re.search(re.escape(kw), md_text, flags=re.IGNORECASE):
                add_finding(
                    findings,
                    check_id,
                    "major",
                    expected["md_path"],
                    10,
                    f"{flow_code} .md missing explicit parking note keyword '{kw}'.",
                    "Include explicit parking note for legacy Col 6 module in Section 1 and Section 2.",
                )
            if not re.search(re.escape(kw), registry_text, flags=re.IGNORECASE):
                add_finding(
                    findings,
                    check_id,
                    "major",
                    REGISTRY_MD,
                    find_line_number(registry_text, r"Parking"),
                    f"MASTER-FLOWCHART-REGISTRY.md missing explicit parking note keyword '{kw}'.",
                    "Include explicit parking note in Section 6 of MASTER-FLOWCHART-REGISTRY.md.",
                )

    check_findings = [f for f in findings if f["check"] == check_id and f["severity"] in BLOCKING_SEVERITIES]
    return {
        "id": check_id,
        "status": "FAIL" if check_findings else "PASS",
        "blocking_findings": len(check_findings),
    }


# ---------------------------------------------------------------------------
# Check 3: Spec Quality, Current Gemini SDK & Zero Emoji
# ---------------------------------------------------------------------------

def run_check_3_spec_quality_sdk_emoji(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Verify 7 Doppio Livello sections, KPI table, sequenceDiagram, 4 UI states, 6-col HTTP matrix, Gemini SDK, and zero emoji."""
    check_id = "check_3_spec_quality_sdk_emoji"

    for flow_code, meta in FLOW_EXPECTATIONS.items():
        md_path = meta["md_path"]
        md_text = read_text(md_path)

        # 1. All 7 Doppio Livello sections
        for sec_pat in REQUIRED_SECTIONS_REGEX:
            if not re.search(sec_pat, md_text, flags=re.MULTILINE):
                add_finding(
                    findings,
                    check_id,
                    "major",
                    md_path,
                    None,
                    f"{flow_code} missing required Doppio Livello section matching '{sec_pat}'.",
                    "Restore all 7 Doppio Livello sections per Rule 08.",
                )

        # 2. KPI table in Livello A
        if not re.search(r"Tabella\s+KPI", md_text, flags=re.IGNORECASE):
            add_finding(findings, check_id, "major", md_path, None, f"{flow_code} missing KPI acceptance table in Livello A.", "Add Markdown KPI table under Livello A.")

        # 3. Valid mermaid sequenceDiagram block
        if not re.search(r"```mermaid\s+sequenceDiagram[\s\S]*?```", md_text):
            add_finding(findings, check_id, "critical", md_path, None, f"{flow_code} missing valid ```mermaid sequenceDiagram``` block.", "Add sequenceDiagram block in Section 3.")

        # 4. Explicit 4 UI States
        for ui_state in REQUIRED_UI_STATES:
            if ui_state not in md_text:
                add_finding(
                    findings,
                    check_id,
                    "major",
                    md_path,
                    find_line_number(md_text, r"4 Stati UI"),
                    f"{flow_code} missing explicit UI state '{ui_state}'.",
                    "Document all 4 mandatory UI states per Rule 10.",
                )

        # 5. 6-column HTTP Error Matrix
        err_hdr = re.search(r"###\s+Matrice\s+Errori\s+HTTP[^\n]*\n+\|([^\n]+)\|", md_text, flags=re.IGNORECASE)
        if not err_hdr:
            add_finding(findings, check_id, "major", md_path, None, f"{flow_code} missing 6-column HTTP Error Matrix header.", "Add 6-column HTTP Error Matrix in Section 6.")
        else:
            cols = [c.strip() for c in err_hdr.group(1).split("|") if c.strip()]
            if len(cols) != EXPECTED_HTTP_ERROR_COLUMNS:
                add_finding(
                    findings,
                    check_id,
                    "major",
                    md_path,
                    find_line_number(md_text, r"Matrice\s+Errori\s+HTTP"),
                    f"{flow_code} HTTP Error Matrix has {len(cols)} columns; expected {EXPECTED_HTTP_ERROR_COLUMNS}.",
                    "Use exact 6-column HTTP Error Matrix format per Rule 08.",
                )

    # 6. Current @google/genai SDK verification on 18 spec and flow-6c .mmd
    md_6c = read_text(FLOW_6C_MD)
    mmd_6c = read_text(FLOW_6C_MMD)

    required_6c_md_tokens = (
        "@google/genai",
        "gemini-embedding-2",
        "interactions.create",
        "store: false",
        "response_format",
        "BudgetConfig",
        "SafetyPolicy",
    )
    for token in required_6c_md_tokens:
        if token not in md_6c:
            add_finding(
                findings,
                check_id,
                "critical",
                FLOW_6C_MD,
                None,
                f"18 spec missing required current @google/genai token '{token}'.",
                f"Include '{token}' in Tier 3 AI enclave contract.",
            )

    required_6c_mmd_tokens = (
        "@google/genai",
        "gemini-embedding-2",
        "interactions.create",
        "store: false",
        "BudgetConfig",
        "SafetyPolicy",
    )
    for token in required_6c_mmd_tokens:
        if token not in mmd_6c:
            add_finding(
                findings,
                check_id,
                "critical",
                FLOW_6C_MMD,
                None,
                f"flow-6c .mmd missing required current @google/genai token '{token}'.",
                f"Include '{token}' in flow-6c .mmd server nodes.",
            )

    # Adversarial check: verify gemini-embedding-2 dimensionality matches pgvector column dimension
    vec_match = re.search(r"VECTOR\((\d+)\)", md_6c)
    if vec_match and "gemini-embedding-2" in md_6c:
        vec_dim = int(vec_match.group(1))
        if vec_dim != GEMINI_EMBEDDING_2_DEFAULT_DIM:
            has_dim_cfg = bool(re.search(rf"outputDimensionality\s*:\s*{vec_dim}", md_6c))
            if not has_dim_cfg:
                add_finding(
                    findings,
                    check_id,
                    "major",
                    FLOW_6C_MD,
                    find_line_number(md_6c, r"ai\.models\.embedContent"),
                    f"Schema/SDK contract mismatch: club_favorite_embeddings declares VECTOR({vec_dim}) while ai.models.embedContent(model: 'gemini-embedding-2') omits config: {{ outputDimensionality: {vec_dim} }}. gemini-embedding-2 defaults to {GEMINI_EMBEDDING_2_DEFAULT_DIM} dimensions and will fail at runtime on PostgreSQL pgvector insert/query.",
                    f"Add config: {{ outputDimensionality: {vec_dim} }} to ai.models.embedContent(...) in Section 4 Livello B of 18 spec (or align VECTOR column to {GEMINI_EMBEDDING_2_DEFAULT_DIM}).",
                )

    # Deprecated Gemini models check across all Col 6 artifacts
    for target_path in (FLOW_6A_MD, FLOW_6B_MD, FLOW_6C_MD, FLOW_6A_MMD, FLOW_6B_MMD, FLOW_6C_MMD, REGISTRY_MD):
        txt = read_text(target_path)
        for dep_pat in DEPRECATED_GEMINI_PATTERNS:
            line = find_line_number(txt, dep_pat)
            if line is not None:
                add_finding(
                    findings,
                    check_id,
                    "critical",
                    target_path,
                    line,
                    f"Deprecated Gemini model reference matching '{dep_pat}' found.",
                    "Replace with current @google/genai models (gemini-embedding-2 / gemini-2.5-flash-lite).",
                )

    # 7. Zero Emoji across all modified/created files (Rule 01)
    for target_path in AUDITED_EMOJI_FILES:
        if not os.path.exists(target_path):
            continue
        txt = read_text(target_path)
        for line_idx, line_str in enumerate(txt.splitlines(), start=1):
            if EMOJI_REGEX.search(line_str):
                # Avoid false positives on our own regex literal definition in this verifier script
                if os.path.abspath(target_path) == os.path.abspath(__file__):
                    continue
                add_finding(
                    findings,
                    check_id,
                    "major",
                    target_path,
                    line_idx,
                    f"Forbidden emoji/decorative symbol detected (Rule 01) at line {line_idx}.",
                    "Remove all emojis and decorative unicode symbols from project files.",
                )
                break

    check_findings = [f for f in findings if f["check"] == check_id and f["severity"] in BLOCKING_SEVERITIES]
    return {
        "id": check_id,
        "status": "FAIL" if check_findings else "PASS",
        "blocking_findings": len(check_findings),
    }


# ---------------------------------------------------------------------------
# Check 4: Glossary Health & Line 9 Links
# ---------------------------------------------------------------------------

def run_check_4_glossary_and_links(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Verify 0 broken internal glossary anchors, 0 broken line 9 links across 18 specs, exact header count, and ELI5 <= 10 words."""
    check_id = "check_4_glossary_health_line9_links"
    gloss_text = read_text(GLOSSARY_MD)

    defined_anchors = set(re.findall(r'<a id="([^"]+)"></a>', gloss_text))
    internal_refs = re.findall(r"\]\(#([^\)]+)\)", gloss_text)
    broken_internal = sorted({ref for ref in internal_refs if ref not in defined_anchors})
    for broken in broken_internal:
        add_finding(
            findings,
            check_id,
            "critical",
            GLOSSARY_MD,
            find_line_number(gloss_text, re.escape(f"(#{broken})")),
            f"Broken internal glossary anchor '#{broken}'.",
            "Fix anchor slug in tools/sync_and_rebuild_glossary.py and rebuild glossary.",
        )

    terms = re.findall(r'^#### ((?:<a id="[^"]+"></a>)+)(.+)$', gloss_text, flags=re.MULTILINE)
    eli5_matches = re.findall(r'^\*\*ELI5:\*\* "([^"]+)"$', gloss_text, flags=re.MULTILINE)

    header_top = re.search(r"\*\*(\d+)\s+Termini Tecnici e Acronimi Ufficiali\*\*", gloss_text)
    header_sec = re.search(r"##\s+Schede Terminologiche Enciclopediche \((\d+) Termini Ufficiali\)", gloss_text)

    if not header_top or int(header_top.group(1)) != len(terms):
        add_finding(
            findings,
            check_id,
            "major",
            GLOSSARY_MD,
            4,
            f"Glossary top banner count ({header_top.group(1) if header_top else 'missing'}) does not match actual term count ({len(terms)}).",
            "Rebuild glossary so header count matches exact term count.",
        )

    if not header_sec or int(header_sec.group(1)) != len(terms):
        add_finding(
            findings,
            check_id,
            "major",
            GLOSSARY_MD,
            find_line_number(gloss_text, r"Schede Terminologiche Enciclopediche"),
            f"Glossary section header count ({header_sec.group(1) if header_sec else 'missing'}) does not match actual term count ({len(terms)}).",
            "Rebuild glossary so section count matches exact term count.",
        )

    if len(eli5_matches) != len(terms):
        add_finding(
            findings,
            check_id,
            "major",
            GLOSSARY_MD,
            None,
            f"ELI5 count ({len(eli5_matches)}) does not match term count ({len(terms)}).",
            "Ensure every glossary entry has an ELI5 line.",
        )

    for eli5_text in eli5_matches:
        word_count = len(eli5_text.split())
        if word_count > MAX_ELI5_WORDS:
            add_finding(
                findings,
                check_id,
                "major",
                GLOSSARY_MD,
                find_line_number(gloss_text, re.escape(eli5_text)),
                f"ELI5 exceeds {MAX_ELI5_WORDS} words ({word_count} words): '{eli5_text}'.",
                f"Shorten ELI5 to <= {MAX_ELI5_WORDS} words per Rule 08.",
            )

    # Check Line 9 links across all 18 spec files
    all_specs = sorted(glob.glob(os.path.join(SPEC_DIR, "[0-1][0-9]-*.md")))
    flow_specs = [p for p in all_specs if not p.endswith("00-GLOSSARIO-TERMINI-TECNICI.md")]
    if len(flow_specs) != EXPECTED_SPEC_COUNT:
        add_finding(
            findings,
            check_id,
            "critical",
            SPEC_DIR,
            None,
            f"Expected {EXPECTED_SPEC_COUNT} spec files; found {len(flow_specs)}.",
            "Verify all 18 spec files exist in architecture-blueprint/00-capitolato-tecnico-e-glossario/.",
        )

    for spec_path in flow_specs:
        lines = read_text(spec_path).splitlines()
        for line_idx, line_str in enumerate(lines[:15], start=1):
            if "Riferimento Glossario:" in line_str:
                links = re.findall(r"\[([^\]]+)\]\(00-GLOSSARIO-TERMINI-TECNICI\.md#([^\)]+)\)", line_str)
                for text, anchor in links:
                    if anchor not in defined_anchors:
                        add_finding(
                            findings,
                            check_id,
                            "critical",
                            spec_path,
                            line_idx,
                            f"Broken Line 9 glossary link '{text}' -> #{anchor}.",
                            "Align anchor slug with 00-GLOSSARIO-TERMINI-TECNICI.md.",
                        )

    check_findings = [f for f in findings if f["check"] == check_id and f["severity"] in BLOCKING_SEVERITIES]
    return {
        "id": check_id,
        "status": "FAIL" if check_findings else "PASS",
        "term_count": len(terms),
        "blocking_findings": len(check_findings),
    }


# ---------------------------------------------------------------------------
# Check 5: Scope Integrity & Root test_check.py
# ---------------------------------------------------------------------------

def run_check_5_scope_and_root_tests(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Verify Rule 08 is untouched, no Col 1-5 or src/ files were modified, and root test_check.py exits 0."""
    check_id = "check_5_scope_integrity_and_test_check"

    # 1. Verify git diff -- .agents/rules/08-miro-architecture-blueprint.md is EMPTY (staged + unstaged)
    diff_rule08 = subprocess.run(
        ["git", "diff", "HEAD", "--", RULE_08_REL],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    if diff_rule08.stdout.strip():
        add_finding(
            findings,
            check_id,
            "critical",
            RULE_08_REL,
            None,
            "Scope violation: .agents/rules/08-miro-architecture-blueprint.md was modified.",
            "Revert unauthorized changes to Rule 08.",
        )

    # 2. Verify no Col 1-5 files or src/ files were modified
    status_proc = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    changed_files: List[str] = []
    for raw_line in status_proc.stdout.splitlines():
        if len(raw_line) < 4:
            continue
        path_part = raw_line[3:].strip().strip('"')
        if " -> " in path_part:
            path_part = path_part.split(" -> ", 1)[1].strip('"')
        changed_files.append(path_part.replace("\\", "/"))

    for ch in changed_files:
        base = os.path.basename(ch)
        if ch.startswith("src/"):
            add_finding(
                findings,
                check_id,
                "critical",
                ch,
                None,
                f"Scope violation: src/ file '{ch}' was modified during Colonna 6 blueprint reorganization.",
                "Revert out-of-scope src/ modification.",
            )
        if ch.startswith("architecture-blueprint/00-capitolato-tecnico-e-glossario/") and base.startswith(COL_1_5_SPEC_PREFIXES):
            add_finding(
                findings,
                check_id,
                "critical",
                ch,
                None,
                f"Scope violation: Col 1-5 spec file '{ch}' was modified.",
                "Revert out-of-scope Col 1-5 spec modification (Rule 08).",
            )
        if ch.startswith("architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/") and base.startswith(COL_1_5_MMD_PREFIXES):
            add_finding(
                findings,
                check_id,
                "critical",
                ch,
                None,
                f"Scope violation: Col 1-5 Mermaid file '{ch}' was modified.",
                "Revert out-of-scope Col 1-5 Mermaid modification (Rule 08).",
            )

    # 3. Run root py test_check.py and require exit code 0
    if not os.path.exists(ROOT_TEST_CHECK):
        add_finding(
            findings,
            check_id,
            "critical",
            ROOT_TEST_CHECK,
            None,
            "Root test_check.py is missing.",
            "Restore root test_check.py immediately.",
        )
        tc_rc = -1
    else:
        tc_proc = subprocess.run(
            [sys.executable, ROOT_TEST_CHECK],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        tc_rc = tc_proc.returncode
        if tc_rc != 0:
            add_finding(
                findings,
                check_id,
                "critical",
                ROOT_TEST_CHECK,
                None,
                f"Root test_check.py failed with exit code {tc_rc}: {(tc_proc.stderr or tc_proc.stdout).strip()[:300]}",
                "Resolve root test_check.py failure before proceeding.",
            )

    check_findings = [f for f in findings if f["check"] == check_id and f["severity"] in BLOCKING_SEVERITIES]
    return {
        "id": check_id,
        "status": "FAIL" if check_findings else "PASS",
        "root_test_check_exit_code": tc_rc,
        "blocking_findings": len(check_findings),
    }


# ---------------------------------------------------------------------------
# Check 6: Post-Deploy Miro Geometry & Secret Hygiene
# ---------------------------------------------------------------------------

def run_check_6_post_deploy_miro(findings: List[Dict[str, Any]], enforce: bool) -> Dict[str, Any]:
    """Audit Miro deploy script for secret hygiene and live post-deploy geometry report against Rule 10."""
    check_id = "check_6_post_deploy_miro_geometry_and_secrets"
    if not enforce:
        return {
            "id": check_id,
            "status": "SKIPPED",
            "reason": "Skipped in --pre-deploy mode; enforced in --post-deploy (Gate 4).",
            "blocking_findings": 0,
        }

    # 1. Inspect deploy script for zero hardcoded Miro tokens
    if not os.path.exists(DEPLOY_SCRIPT_CJS):
        add_finding(
            findings,
            check_id,
            "critical",
            DEPLOY_SCRIPT_CJS,
            None,
            "Missing Miro deploy script architecture-blueprint/deploy-miro-favorites-tiers-iso.cjs.",
            "Create deploy-miro-favorites-tiers-iso.cjs reading process.env.MIRO_ACCESS_TOKEN.",
        )
    else:
        cjs_text = read_text(DEPLOY_SCRIPT_CJS)
        if "process.env.MIRO_ACCESS_TOKEN" not in cjs_text:
            add_finding(
                findings,
                check_id,
                "critical",
                DEPLOY_SCRIPT_CJS,
                None,
                "Deploy script does not read process.env.MIRO_ACCESS_TOKEN.",
                "Use process.env.MIRO_ACCESS_TOKEN exclusively for Miro API authentication.",
            )
        # Detect hardcoded JWT / Bearer / Miro eyJ tokens
        secret_patterns = [
            r"eyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{10,}",
            r"MIRO_ACCESS_TOKEN\s*[:=]\s*['\"][A-Za-z0-9_\-\.]{16,}['\"]",
            r"Bearer\s+eyJ[A-Za-z0-9_\-\.]+",
        ]
        for sp in secret_patterns:
            line = find_line_number(cjs_text, sp, flags=0)
            if line is not None:
                add_finding(
                    findings,
                    check_id,
                    "critical",
                    DEPLOY_SCRIPT_CJS,
                    line,
                    "Hardcoded Miro access token / secret detected in deploy script.",
                    "Remove hardcoded token immediately and read solely from process.env.MIRO_ACCESS_TOKEN.",
                )

    # 2. Inspect live post-deploy geometry report (scratch/deploy_col6_report.json)
    if not os.path.exists(POST_DEPLOY_REPORT_JSON):
        add_finding(
            findings,
            check_id,
            "critical",
            POST_DEPLOY_REPORT_JSON,
            None,
            "Missing post-deploy geometry report scratch/deploy_col6_report.json.",
            "Run live Miro deployment and export geometry audit report to scratch/deploy_col6_report.json.",
        )
    else:
        try:
            report = json.loads(read_text(POST_DEPLOY_REPORT_JSON))
        except json.JSONDecodeError as exc:
            add_finding(
                findings,
                check_id,
                "critical",
                POST_DEPLOY_REPORT_JSON,
                None,
                f"Invalid JSON in deploy_col6_report.json: {exc}",
                "Regenerate valid JSON report from live Miro deployment.",
            )
            report = {}

        # Verify 0 crossings
        crossings = report.get("crossings", report.get("line_box_crossings"))
        if crossings is None or crossings != 0:
            add_finding(
                findings,
                check_id,
                "critical",
                POST_DEPLOY_REPORT_JSON,
                None,
                f"Rule 10 Zero-Crossing violation: reported crossings = {crossings} (required: 0).",
                "Re-route connectors through empty corridors until crossings == 0.",
            )

        # Verify No-Fly Zone >= 40px around all 3 Badges (#06, #12, #18)
        badge_clearances = report.get("badge_clearances", {})
        for flow_code, meta in FLOW_EXPECTATIONS.items():
            badge_key = meta["badge"]
            clearance = badge_clearances.get(badge_key, badge_clearances.get(flow_code))
            if clearance is None or float(clearance) < MIN_BADGE_CLEARANCE_PX:
                add_finding(
                    findings,
                    check_id,
                    "critical",
                    POST_DEPLOY_REPORT_JSON,
                    None,
                    f"Rule 10 Badge No-Fly Zone violation on {badge_key} ({flow_code}): clearance = {clearance}px (minimum {MIN_BADGE_CLEARANCE_PX}px).",
                    f"Move colliding shapes/connectors at least {MIN_BADGE_CLEARANCE_PX}px away from badge {badge_key}.",
                )

        # Verify all diamonds >= 360x125px
        shapes = report.get("shapes", [])
        for shp in shapes:
            if shp.get("shape") == "diamond":
                width = float(shp.get("width", 0))
                height = float(shp.get("height", 0))
                if width < MIN_DIAMOND_WIDTH_PX or height < MIN_DIAMOND_HEIGHT_PX:
                    add_finding(
                        findings,
                        check_id,
                        "major",
                        POST_DEPLOY_REPORT_JSON,
                        None,
                        f"Rule 10 diamond dimension violation on node '{shp.get('id', 'unknown')}': {width}x{height}px (min {MIN_DIAMOND_WIDTH_PX}x{MIN_DIAMOND_HEIGHT_PX}px).",
                        "Resize decision diamond to at least 360x125px.",
                    )

        # Verify all connectors shape == 'elbowed' and textOrientation == 'horizontal'
        connectors = report.get("connectors", [])
        if not connectors:
            add_finding(
                findings,
                check_id,
                "major",
                POST_DEPLOY_REPORT_JSON,
                None,
                "Post-deploy report contains no connectors snapshot to verify elbowed/horizontal compliance.",
                "Include live connectors snapshot array in scratch/deploy_col6_report.json.",
            )
        for conn in connectors:
            if conn.get("shape") != "elbowed":
                add_finding(
                    findings,
                    check_id,
                    "major",
                    POST_DEPLOY_REPORT_JSON,
                    None,
                    f"Rule 10 connector '{conn.get('id', 'unknown')}' has shape='{conn.get('shape')}' (required: 'elbowed').",
                    "Set connector shape to 'elbowed'.",
                )
            if conn.get("textOrientation", "horizontal") != "horizontal":
                add_finding(
                    findings,
                    check_id,
                    "major",
                    POST_DEPLOY_REPORT_JSON,
                    None,
                    f"Rule 10 connector '{conn.get('id', 'unknown')}' has textOrientation='{conn.get('textOrientation')}' (required: 'horizontal').",
                    "Set connector textOrientation to 'horizontal'.",
                )

        # Verify exact 1:1 node counts (14/16/18 = 48 nodes)
        node_counts = report.get("node_counts", {})
        total_nodes = 0
        for flow_code, meta in FLOW_EXPECTATIONS.items():
            cnt = node_counts.get(flow_code, node_counts.get(meta["badge"]))
            if cnt != meta["iso_nodes"]:
                add_finding(
                    findings,
                    check_id,
                    "critical",
                    POST_DEPLOY_REPORT_JSON,
                    None,
                    f"Post-deploy Miro node count mismatch for {flow_code}: live={cnt}, expected={meta['iso_nodes']}.",
                    f"Deploy exact {meta['iso_nodes']} ISO nodes for {flow_code}.",
                )
            if isinstance(cnt, int):
                total_nodes += cnt
        if total_nodes != EXPECTED_TOTAL_DEPLOYED_NODES:
            add_finding(
                findings,
                check_id,
                "critical",
                POST_DEPLOY_REPORT_JSON,
                None,
                f"Total live deployed ISO nodes = {total_nodes}; expected {EXPECTED_TOTAL_DEPLOYED_NODES} (14+16+18).",
                "Align total live ISO nodes across #06/#12/#18 to 48.",
            )

    check_findings = [f for f in findings if f["check"] == check_id and f["severity"] in BLOCKING_SEVERITIES]
    return {
        "id": check_id,
        "status": "FAIL" if check_findings else "PASS",
        "blocking_findings": len(check_findings),
    }


# ---------------------------------------------------------------------------
# Scoring & CLI Entrypoint
# ---------------------------------------------------------------------------

def compute_security_score(findings: List[Dict[str, Any]]) -> int:
    """Compute a 1-5 Red-Team security & integrity score based on highest finding severity."""
    severities = {f["severity"] for f in findings}
    if "critical" in severities:
        return 1
    if "major" in severities:
        return 2
    if "moderate" in severities:
        return 3
    if "minor" in severities:
        return 4
    return 5


def main() -> int:
    """Parse CLI arguments, execute all 6 adversarial checks, print JSON verdict, and return exit code."""
    parser = argparse.ArgumentParser(
        description="Adversarial Red-Team verification suite for Colonna 6 (PREFERITI)."
    )
    mode_group = parser.add_mutually_exclusive_group(required=True)
    mode_group.add_argument("--pre-deploy", action="store_true", help="Run Gate 2 pre-deploy checks (Checks 1-5; Check 6 skipped).")
    mode_group.add_argument("--post-deploy", action="store_true", help="Run Gate 4 post-deploy checks (All Checks 1-6 enforced).")
    args = parser.parse_args()

    mode_name = "post-deploy" if args.post_deploy else "pre-deploy"
    findings: List[Dict[str, Any]] = []

    checks = [
        run_check_1_security_rbac_rls(findings),
        run_check_2_cross_artifact_consistency(findings),
        run_check_3_spec_quality_sdk_emoji(findings),
        run_check_4_glossary_and_links(findings),
        run_check_5_scope_and_root_tests(findings),
        run_check_6_post_deploy_miro(findings, enforce=args.post_deploy),
    ]

    score = compute_security_score(findings)
    failed_checks = [c["id"] for c in checks if c["status"] == "FAIL"]
    verdict = "FAIL" if failed_checks else "PASS"

    summary = (
        f"Gate {'4 (post-deploy)' if args.post_deploy else '2 (pre-deploy)'} Red-Team audit {verdict}: "
        f"{len(failed_checks)} failed check(s), {len(findings)} total finding(s), score {score}/5."
    )

    payload = {
        "mode": mode_name,
        "verdict": verdict,
        "score": score,
        "summary": summary,
        "checks": checks,
        "findings": findings,
    }
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    return 0 if verdict == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
