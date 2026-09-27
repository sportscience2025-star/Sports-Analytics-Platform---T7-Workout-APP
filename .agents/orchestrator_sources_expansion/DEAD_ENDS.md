# Dead Ends Log — Task 1

| Iteration | Approach Tried | Why It Failed | Files Touched |
|---|---|---|---|
| 1 | Ingesting PMIDs from legacy `knowledge-base.js` and LLM-assisted research without live programmatic NCBI E-utilities title/author resolution. | Forensic integrity audit revealed 136 mismatched PMIDs (pointing to unrelated oncology/biology papers), 2 non-existent PMIDs, and 5 hallucinated PMIDs from Group A. 53.8% of PMIDs failed NCBI verification. | `js/data/sources/*.js` |
