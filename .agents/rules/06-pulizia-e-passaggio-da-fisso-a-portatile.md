---
trigger: always_on
---

# Regola 06: Sincronizzazione Multi-Dispositivo (PC Fisso <-> Portatile) e Igiene Git

## Scopo
Tenere sempre allineati **PC Fisso** (`E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP`) e **Portatile** (`C:\Users\srigo\Sports-Analytics-Platform---T7-Workout-APP`) tramite GitHub, evitando conflitti di file e lavoro perso.

**Autonomia Git:** l'AI è autorizzata a eseguire nel terminale i comandi Git necessari dentro la cartella del progetto (`git status`, `git pull`, `git add`, `git commit`, `git push`, `git rebase`). Deve chiedere permesso solo per comandi distruttivi, comandi fuori dal repository o modifiche alle impostazioni di sistema.

## Cosa l'AI NON può fare (Divieti assoluti)
- **Non lavorare su codice sporco o non aggiornato:** se `git status --porcelain` rileva file modificati non salvati, fermarsi subito e avvisare l'utente. Non creare piani, non leggere codice e non modificare file finché il ramo locale non è allineato al 100% con `origin/main`.
- **Non caricare file spazzatura:** è vietato includere nei salvataggi Git file temporanei, cache o file di sistema Windows (`Thumbs.db`).
- **Non lasciare modifiche pendenti (per sessioni di modifica):** al termine di un task che ha modificato file tracciati, non chiudere la sessione senza aver committato e pushato su GitHub.
- **Esenzione per sola lettura e subagenti:** nei compiti di sola lettura/audit/pianificazione senza file tracciati modificati, e per i subagenti di verifica o esplorazione, è vietato eseguire `git commit` o `git push` autonomi (il salvataggio finale spetta solo all'agente principale a fine lavoro).

## Cosa l'AI DEVE fare (Obblighi operativi)
1. **Controllo iniziale (Pre-Flight Check):** all'inizio della sessione eseguire `git status --porcelain`; se pulito, eseguire `git pull origin main` (risolvendo eventuali conflitti preservando l'integrità del codice).
2. **Igiene pre-salvataggio:** verificare che eventuali file temporanei o di cache siano esclusi da `.gitignore` e rispettare le verifiche della Regola 01 (`py test_check.py`, `npm run typecheck`, `sw.js` per i rilasci).
3. **Salvataggio finale (Post-Task Sync, se sono stati modificati file):** eseguire in sequenza:
   1. `git status` per controllare i file modificati ed escludere file indesiderati.
   2. `git add <file>` (oppure `git add -A` solo dopo verifica).
   3. `git commit -m "feat/fix: [descrizione sintetica e chiara del lavoro svolto]"`.
   4. `git push origin main` (se fallisce per divergenza remota: `git pull --rebase origin main`, risolvere eventuali conflitti e riprovare il push).
4. **Conferma all'utente:** comunicare sempre l'hash del commit generato e l'esito dell'allineamento su GitHub.
