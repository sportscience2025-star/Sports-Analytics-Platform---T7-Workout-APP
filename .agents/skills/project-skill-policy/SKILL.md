---
name: project-skill-policy
description: >
  Policy di selezione delle skill per il progetto T7 Workout PWA.
  Definisce quali skill globali sono pertinenti per questo codebase
  (PWA JavaScript pura, biomeccanica, Chart.js, Service Worker, Git)
  e quali devono essere ignorate per non sprecare token e contesto.
  Attivare questa skill all'inizio di ogni sessione per ricordare
  la politica di utilizzo delle skill.
---

# Policy Skill — Progetto T7 Workout PWA

## Contesto del Progetto

- **Tipo**: Progressive Web App (PWA) — HTML + CSS + JavaScript vanilla
- **Nessun backend cloud**: niente Firebase, GCP, BigQuery, Spanner
- **Nessun database remoto**: dati locali o RAG in-browser (WASM)
- **Nessuna bioinformatica**: nessuna genomica, proteomica, sequenze
- **Stack**: JS puro, Chart.js, Service Worker, Python per test locali

---

## SKILL UTILI (da usare quando pertinenti)

### Sempre rilevanti per questo progetto

| Skill | Quando usarla |
|-------|--------------|
| antigravity-guide | Domande su IDE Antigravity, CLI, keybinding, slash commands |
| agy-customizations | Creare/modificare skill, regole, hook nel progetto |
| modern-web-guidance | Qualsiasi task HTML/CSS/JS frontend — ATTIVARE SEMPRE per task frontend |
| chrome-devtools | Debug browser, analisi performance, network, console errors |
| a11y-debugging | Audit accessibilita (ARIA, focus, contrasto, tastiera) |
| debug-optimize-lcp | Ottimizzazione LCP e Core Web Vitals della PWA |
| memory-leak-debugging | Memory leak JS, analisi heap, performance runtime |
| accidental-data-loss-prevention | Prima di qualsiasi operazione distruttiva |
| managing-python-dependencies | Quando si usano script Python (test_check.py, run_single_test.py) |
| workflow-skill-creator | Quando l utente vuole trasformare un workflow in una nuova skill |
| ui-ux-pattern-extractor | Replicazione stile/UX, ispezione siti web esterni, estrazione CSS/layout |
| app-navigation-integrator | Unificazione navigazione interna, routing fluido, coerenza moduli PWA |
| react-ts-reverse-architect | Reverse engineering Beta React/TS, Gap Analysis, mappa dipendenze |
| miro-software-house-blueprint | Diagrammi e flowchart Miro a 5 Zone e 4 Swimlanes per la Software House |
| client-server-ip-isolation | Tutela IP algoritmi proprietari, Thin Client vs Server, 3 Silos DB |
| sports-science-biometrics-guard | Validazione grandezze fisiche SI, doppio ruolo, fallback atleti, export Excel |

### Condizionalmente utili (solo se task specifica lo richiede)

| Skill | Quando usarla |
|-------|--------------|
| gemini-api-dev | Se si integra Gemini API nel RAG engine o knowledge base |
| google-antigravity-sdk | Se si costruiscono agenti autonomi per task scientifiche |
| chrome-extensions | Solo se si crea una Chrome Extension della PWA |

---

## SKILL DA IGNORARE — Google Cloud / BigQuery / Data Platform

bigquery-sql, bigquery-bigframes, bigquery-ai-ml, bigquery-graph,
bigquery-graph-author, bigquery-graph-query, bigquery-data-transfer-service,
bigtable-basics, dataform-bigquery, dbt-bigquery, gcp-spark,
gcp-spark-troubleshooting, gcp-managed-spark-upgrades, gcp-dataflow,
gcp-data-pipelines, gcp-pipeline-orchestration, gcp-managed-airflow-dag-authoring,
gcp-managed-airflow-migrations, gcp-managed-airflow-recommendations,
gcp-composer-troubleshooting, gcp-pipeline-resource-provisioning,
gcs-security-assessment, google-cloud-storage-basics,
google-cloud-storage-bucket-architect, google-cloud-storage-fuse,
discovering-gcp-data-assets, federate-lakehouse-catalog, data-autocleaning,
schema-mapping, dak-setup, notebook-guidance, building-data-apps, ml-best-practices,
google-cloud-auth-verification, enforcing-resource-attribution,
resolving-mcp-region-configs

## SKILL DA IGNORARE — Firebase

firebase-basics, firebase-hosting-basics, firebase-app-hosting-basics,
firebase-auth-basics, firebase-firestore, firestore-rules-creation,
firebase-security-rules-auditor, firebase-data-connect,
firebase-remote-config-basics, firebase-crashlytics, firebase-ai-logic-basics,
extension-to-functions-codebase, xcode-project-setup

## SKILL DA IGNORARE — Bioinformatica / Scienze (non rilevante per scienze motorie computazionali)

alphafold-database-fetch-and-analyze, alphagenome-atlas-website-links,
alphagenome-single-variant-analysis, alphagenome-variant-impact-score,
chembl-database, clinvar-database, clinical-trials-database, dbsnp-database,
embl-ebi-ols, encode-ccres-database, ensembl-database, foldseek-structural-search,
gnomad-database, gtex-database, human-protein-atlas-database, interpro-database,
jaspar-database, literature-search-arxiv, literature-search-biorxiv,
literature-search-europepmc, literature-search-openalex, ncbi-sequence-fetch,
openfda-database, opentargets-database, pdb-database, predictingthepast,
protein-sequence-msa, protein-sequence-similarity-search, pubchem-database,
pubmed-database, pymol, quickgo-database, reactome-database, string-database,
ucsc-conservation-and-tfbs, unibind-database, uniprot-database

## SKILL DA IGNORARE — Altro

uv, credentials, troubleshooting (MCP), gemini-omni-flash-api,
gemini-live-api-dev

---

## Regola di Default

Se non sai quale skill usare, applica questa priorita:
1. modern-web-guidance — per qualsiasi task HTML/CSS/JS
2. chrome-devtools — per debug e analisi performance
3. antigravity-guide — per domande sull IDE e gli agenti
4. Nessuna altra skill senza una ragione esplicita documentata
