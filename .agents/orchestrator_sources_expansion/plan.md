# Piano Operativo: Espansione e Modularizzazione Fonti Scientifiche (Task 1)

## Obiettivi e Target
- **Fonti Totali**: Da 161 ad almeno 251 (+90 nuove fonti peer-reviewed).
- **Aree Tematiche**: 7 aree (Atletica Leggera, Sollevamento Pesi / Forza, Fisiologia, VBT, Biomeccanica, Clinico / Riabilitazione, Sport di Squadra).
- **Integrità Scientifica**: Fonti reali e verificabili (DOI, PMID, Autori autorevoli, Journal indicizzati PubMed/Scopus/Cochrane/etc., razionali chiari).
- **Modularizzazione**: `js/data/sources/` con:
  - `atletica.js`
  - `sollevamento-pesi.js`
  - `fisiologia.js`
  - `vbt.js`
  - `biomeccanica.js`
  - `clinico.js`
  - `sport-squadra.js`
  - `index.js` (aggregatore ed export su `window.App.scientificSources`)
- **PWA & Cache**:
  - `sw.js`: aggiornamento `CORE_ASSETS` con i nuovi file, bump cache da `t7-workout-v68` a `t7-workout-v69`.
  - `index.html`: inclusione ordinata dei moduli sorgente o index aggregatore, rimozione pulita del vecchio file monolitico `knowledge-base.js` o suo aggiornamento come shim trasparente per retrocompatibilità.
  - `test_check.py`: aggiornamento verifica versione cache (`t7-workout-v69`) e inclusione dei nuovi file `.js` nella scansione sintattica.
- **Validazione**: Esecuzione `py test_check.py` con esito Exit 0 senza regressioni sintattiche o di cache.

---

## Fasi Operative e Milestones

### Milestone 1: Exploration & Inventory
- **Obiettivo**: Mappare le 161 fonti esistenti in `js/knowledge-base.js`, estrarre lo schema esatto degli oggetti fonte, verificare come `window.App.scientificSources` viene consumato nel resto dell'app, analizzare `index.html`, `sw.js` e `test_check.py`.
- **Ruoli**: 2 Explorers in parallelo.
  - Explorer 1: Analisi `js/knowledge-base.js` (estrazione lista chiavi/ID/DOI/titoli per prevenire duplicati, conteggio per area, schema dati).
  - Explorer 2: Analisi integrazione PWA (`index.html`, `sw.js`, `test_check.py`, consumatori di `scientificSources` nel codebase).

### Milestone 2: Scientific Sources Synthesis & Compilation
- **Obiettivo**: Generare le nuove ≥90 fonti scientifiche autentiche distribuite nelle 7 aree (~13-15 nuove per area), strutturate nel formato JSON esatto, verificate e validate contro duplicati.
- **Ruoli**: Worker scientifici.

### Milestone 3: Implementation & Modularization
- **Obiettivo**: Creare la cartella `js/data/sources/`, scrivere i 7 moduli + `index.js`, aggiornare `index.html`, aggiornare `sw.js` (cache v69), aggiornare `test_check.py`.
- **Ruoli**: Worker di implementazione.

### Milestone 4: Verification, Review & Forensic Audit
- **Obiettivo**:
  - Reviewer: Verifica conformità architettura, assenza emoji spontanee, commenti, costanti.
  - Challenger: Verifica conteggio fonti (>=250), unicità ID, assenza duplicati, validità schema, esecuzione `py test_check.py`.
  - Auditor forense: Integrità scientifica (studi reali con DOI/PMID effettivi, assenza dati fittizi o dummy).
