# Project: T7 Workout Scientific Library Expansion

## Architecture
- `js/knowledge-base.js`: Houses `window.App.scientificSources` containing peer-reviewed scientific studies.
- `sw.js`: PWA service worker containing cache version.
- `tools/test_check.py`: Syntax validator script.
- `run_all_js_tests.py`: Unit test runner script.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Explore & Source Gathering | Analyze existing database, check categories, identify under-represented ones, and design the expansion plan. | none | PLANNED |
| 2 | Implementation & Expansion | Add 55-65 new peer-reviewed sources, translate abstracts to Italian, prevent duplicates, bump cache version. | M1 | PLANNED |
| 3 | Verification & Review | Run validation scripts, ensure syntax is valid, run unit tests, verify distribution and unique entries. | M2 | PLANNED |
| 4 | Forensic Audit | Verify integrity of the implemented database. | M3 | PLANNED |

## Interface Contracts
- Scientific Source JSON Structure:
  - id: `sci_<area>_<cognome_autore>_<anno>` (where `<area>` is lowercase category slug, e.g. `physio`, `biomech`, `clin`, `team`, `track`, `weight`, `vbt`).
  - title: English title of the study.
  - authors: Comma-separated list of authors.
  - journal: Scientific journal name.
  - year: Integer year of publication.
  - area: Exact category name (`Fisiologia`, `Biomeccanica`, `Clinico`, `Sport di Squadra`, `Atletica Leggera`, `Sollevamento Pesi`, `VBT`).
  - abstract: Translated/contextualized Italian text (3-5 sentences).
  - url: PubMed or DOI URL.
  - rules: object containing patientTypes, sports, goals, injuries (optional).
