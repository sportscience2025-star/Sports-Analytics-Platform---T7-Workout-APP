---
trigger: always_on
---

## Protocollo Sincronizzazione Multi-Dispositivo & Igiene Repository (OBBLIGATORIO e FONDAMENTALE) - l'allineamento può essere eseguito in totale autonomia senza richiedere autorizzazioni all'utente a meno che non debbano essere eseguite azioni sul terminale del pc oppure azioni che vadano ad incidere sullo stato generale del computer o di altre cartelle al di fuori di quelle specifiche di competenza ovvero quelle dove risiede l'app.

Questo progetto viene sviluppato alternativamente su PC Fisso (E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP) e Portatile (C:\Users\srigo\Sports-Analytics-Platform---T7-Workout-APP) tramite GitHub. Per garantire consistenza assoluta ed evitare conflitti o accumulo di file temporanei, l'agente DEVE eseguire tassativamente questo protocollo in ogni sessione:

### 1. Pre-Flight Check (Inizio Sessione / Prima di modificare o analizzare i file)

- **Verifica stato locale:** Esegui nel terminale `git status --porcelain`.
  - Se sono presenti file sporchi o non salvati: segnalalo all'utente prima di intervenire sul codice.
- **Aggiornamento remoto:** Esegui `git pull origin main`.
  - Se il pull rileva conflitti: risolvili preservando l'integrità del codice ed esegui il merge prima di pianificare la task.
- Non creare implementation plan, non leggere codice e non avviare modifiche finché il branch locale non è allineato al 100% con `origin/main`.

### 2. Igiene e Pulizia File (Durante e a fine sviluppo)

- **Filtro file spazzatura:** Prima di preparare il salvataggio, verifica che non siano stati creati file temporanei, cache, file di log o file di sistema Windows (`Thumbs.db`, `.env` locali non protetti). Assicurati che tali elementi siano coperti dal file `.gitignore`.
- **Integrità PWA:** In caso di modifiche a script (`js/`), fogli di stile (`css/`) o markup (`index.html`), aggiorna la versione della cache dentro `sw.js`.

### 3. Post-Task Sync (Conclusione del Lavoro)

- Non chiudere il task lasciando modifiche pendenti sul disco locale.
- Esegui in sequenza nel terminale:
  1. `git status` per verificare la lista esatta dei file modificati.
  2. `git add -A` (aggiunta delle sole modifiche autorizzate nel perimetro del progetto).
  3. `git commit -m "feat/fix: [descrizione sintetica e chiara del lavoro svolto]"`.
  4. `git push origin main`.
- Se il push fallisce per divergenza remota: esegui `git pull --rebase origin main` e riprova il push.
- Mostra all'utente la conferma con l'hash del commit generato e l'esito dell'allineamento su GitHub.