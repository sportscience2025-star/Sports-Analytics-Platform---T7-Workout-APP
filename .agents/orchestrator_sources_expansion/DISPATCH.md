# Dispatch Log

## 2026-09-14T12:51:52Z
Sei il Project Orchestrator per il completamento del Task 1 dell'Implementation Plan del progetto T7 Workout PWA.

La tua working directory dedicata è:
`e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_sources_expansion`

Leggi attentamente:
1. Le richieste originali dell'utente in:
   `e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md`
2. Le istruzioni dettagliate del Task 1 in:
   `C:/Users/ptomm/.gemini/antigravity/brain/573bb3b8-38a8-4ebe-9f4a-1cecf21c1c4b/prompt_draft.md`
3. Le regole del progetto in:
   `e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md`

Obiettivo:
- Espandere il database delle fonti scientifiche da 161 a oltre 250 voci (almeno 90 nuove fonti peer-reviewed di alta caratura: PubMed, Cochrane, PEDro, SPORTDiscus, etc.) suddivise nelle 7 aree tematiche:
  1. Atletica Leggera
  2. Sollevamento Pesi / Forza
  3. Fisiologia
  4. VBT (Velocity Based Training)
  5. Biomeccanica
  6. Clinico / Riabilitazione
  7. Sport di Squadra
- Prevenire duplicati rispetto agli studi già presenti in `js/knowledge-base.js`.
- Rispettare rigorosamente il formato JSON delle fonti scientifiche specificato in `prompt_draft.md`.
- Modularizzare `js/knowledge-base.js` creando file dedicati per area nella cartella `js/data/sources/` (es. `atletica.js`, `sollevamento-pesi.js`, `fisiologia.js`, `vbt.js`, `biomeccanica.js`, `clinico.js`, `sport-squadra.js`).
- Creare l'entry-point aggregatore `js/data/sources/index.js` che unisce tutte le fonti e definisce `window.App.scientificSources`.
- Aggiornare `index.html` caricando i nuovi file nell'ordine corretto e rimuovendo il riferimento al vecchio file monolitico se opportuno.
- Aggiornare `sw.js`: aggiungere i nuovi percorsi in `CORE_ASSETS` e incrementare `CACHE_NAME` (da `t7-workout-v68` a `t7-workout-v69`).
- Aggiornare `test_check.py` per allineare la versione della cache a `t7-workout-v69` e verificare la sintassi dei nuovi file.
- Eseguire `py test_check.py` e assicurarsi che tutti i controlli passino (Exit 0).
- Rispetta tutte le regole di progetto: niente emoji spontanee, commenti obbligatori su ogni funzione, costanti in MAIUSCOLO, nessuna regressione, chirurgia precisa.

Utilizza sub-agenti specializzati per suddividere il lavoro (es. per la ricerca parallela nelle diverse aree tematiche e per la validazione).
Mantieni aggiornati `BRIEFING.md`, `plan.md` e `progress.md` nella tua working directory.
Quando il lavoro è completato e validato con i test, invia un messaggio formale di vittoria / completamento al coordinatore.
