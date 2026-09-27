# Scope: Scientific Hub Integration

## Architecture
- `js/knowledge-base.js`: Module containing the scientific literature database.
- `js/logic.js`: Generation logic for programs and technical explanations, drawing dynamic references from the knowledge base.
- `index.html`, `js/app.js`, `js/ui.js`: Presentation layers to incorporate the new "Libreria Fonti" view, navigation tabs, search text box, and area filtering chips.
- `test_knowledge_base.js`: Verification script for mathematical, logic, and integration checks.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration | Analyze logic.js structure, UI components, tab manager, styling guidelines | None | DONE |
| 2 | Implementation | Implement knowledge-base, dynamic explanation generation, UI tab, search/filters | M1 | IN_PROGRESS |
| 3 | Verification & Audit | Verify implementation via test runner, challengers, and auditor | M2 | PLANNED |

## Interface Contracts
### KnowledgeBase (in `js/knowledge-base.js`)
- `const ScientificKnowledgeBase = [...]` (Array of objects representing the sources)
- Each item: `{ id, title, authors, journal, year, area, abstract, url, rules: { ... } }`

### Program Generation (in `js/logic.js`)
- Must integrate references from `ScientificKnowledgeBase` in AI explanations, appending a citation list with PubMed/DOI links.

### UI (in `js/ui.js` / `js/app.js` / `index.html`)
- Tab `scientific-hub` or `libreria-fonti`.
- Event listeners for search inputs and filter chips.
