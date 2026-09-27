## 2026-06-17T21:30:27Z
You are a worker agent. Your working directory is e:\Nuove App Installate\App esercizi scienze motorie\.agents\worker_scientific_hub\.
Your goal is to implement the requirements for the Scientific Hub integration.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please read:
1. e:\Nuove App Installate\App esercizi scienze motorie\.agents\orchestrator_scientific_hub\plan.md and SCOPE.md.
2. e:\Nuove App Installate\App esercizi scienze motorie\.agents\explorer_scientific_hub_1\proposed_knowledge-base.js, proposed_logic.patch, proposed_index.patch.
3. e:\Nuove App Installate\App esercizi scienze motorie\.agents\explorer_scientific_hub_2\analysis.md.
4. e:\Nuove App Installate\App esercizi scienze motorie\.agents\explorer_scientific_hub_3\proposed_test_knowledge_base.js.

Tasks:
1. Create `js/knowledge-base.js` defining a global array `window.App.scientificSources` containing at least the 5 required scientific studies (González-Badillo 2010, Samozino 2012, Pareja-Blanco 2017, Escamilla 2001, Seiler 2010). Align the keys of the objects exactly to: `id`, `title`, `authors`, `journal`, `year`, `area`, `abstract`, `url`, `rules`.
Expose it also as `window.ScientificKnowledgeBase = window.App.scientificSources;`.

2. Update `js/logic.js` to replace static technical explanations with dynamic, rule-matching explanations. RFE/Goal/Injuries/Sport should drive matching. Append citations and bibliography links.
Also, update clinical knee exercise notes in `js/logic.js` (such as `cli_01`) so they contain BOTH the phrases "Limitare flessione ginocchio" and "60°" (to satisfy R4 assertions).

3. Update `index.html` to add a navigation item for 'Libreria Fonti' (Scientific Hub, data-view="scientific_hub") and load `js/knowledge-base.js` before `js/logic.js`.

4. Update `js/app.js` to add the router case 'scientific_hub' that renders the outer HTML container and delegates rendering to `window.App.renderScientificHub`.

5. Update `js/ui.js` to implement `window.App.renderScientificHub` and the detail modal display. The UI must include a search text box and category filtering chips (Tutti, Biomeccanica, Fisiologia, VBT, Clinico). Cards must display Title, Authors, Journal/Year, Takeaway, Area badge, and direct clickable PubMed/DOI links.

6. Update `sw.js` to add './js/knowledge-base.js' to CACHE assets.

7. Write `test_knowledge_base.js` at the project root based on `proposed_test_knowledge_base.js`, run it (`node test_knowledge_base.js`), ensure all tests pass cleanly, and document the output in your handoff report.

Notify the parent orchestrator (main agent, conv ID 0e6887a6-04ab-45f7-b50f-b1b77abb5715) when done.
