---
trigger: always_on
---

## Protocollo Sincronizzazione Multi-Dispositivo & Igiene Repository (OBBLIGATORIO e FONDAMENTALE) -

Garantire allineamento assoluto, consistenza e assenza di conflitti tra **PC Fisso** (`E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP`) e **Portatile** (`C:\Users\srigo\Sports-Analytics-Platform---T7-Workout-APP`) tramite GitHub. Questo progetto viene sviluppato alternativamente su PC Fisso (E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP) e Portatile (C:\Users\srigo\Sports-Analytics-Platform---T7-Workout-APP) tramite GitHub. Per garantire consistenza assoluta ed evitare conflitti o accumulo di file temporanei, l'agente DEVE eseguire tassativamente questo protocollo in ogni sessione:

**Ambito di Autonomia:** L'agente è pienamente autorizzato a eseguire in autonomia nel terminale i comandi Git necessari (`git status`, `git pull`, `git add`, `git commit`, `git push`, `git rebase`), purché operi esclusivamente all'interno della directory del progetto. È richiesta autorizzazione solo per operazioni distruttive, per comandi esterni al repository o che modificano impostazioni di sistema.

### 1. Pre-Flight Check (Inizio Sessione / Prima di modificare o analizzare i file)

1. **Verifica stato locale:** Esegui `git status --porcelain`.
   - Se il working tree è sporco (file modificati o non salvati): **arrestati subito** e segnalalo all'utente prima di intervenire o tirare giù modifiche.
2. **Aggiornamento remoto:** Se il working tree è pulito, esegui `git pull origin main`.
   - Se il pull rileva conflitti: risolvili preservando l'integrità del codice ed esegui il merge prima di procedere.
3. **Controllo bloccante:** Non creare file di pianificazione, non leggere codice e non iniziare modifiche finché il branch locale non è allineato al 100% con `origin/main`.

---

### 2. Igiene, Integrità e Validazione (Durante e a fine sviluppo)

- **Filtro spazzatura:** Prima di preparare il salvataggio, verifica che non siano stati creati file temporanei, cache o file di sistema Windows (`Thumbs.db`). Verifica che siano protetti dal `.gitignore`.
- **Integrità PWA (Cache Bump):** In caso di modifiche a script (`js/`), fogli di stile (`css/`) o markup (`index.html`), incrementa il numero di versione della cache in `sw.js`.
- **Validazione Sintattica Obbligatoria:** Se sono stati toccati file `.js`, eseguire `py test_check.py`. Non committare se il test fallisce.

---

### 3. Post-Task Sync (Conclusione del Lavoro)

Non chiudere mai la sessione lasciando modifiche pendenti sul disco locale. Esegui in sequenza:

1. `git status` per verificare la lista dei file modificati ed escludere file non voluti.
2. `git add <file>` (oppure `git add -A` solo dopo aver verificato che non vi siano file temporanei o estranei).
3. `git commit -m "feat/fix: [descrizione sintetica e chiara del lavoro svolto]"`.
4. `git push origin main`.
   - Se il push fallisce per divergenza remota: esegui `git pull --rebase origin main`, risolvi eventuali conflitti preservando il codice e riprova il push.
5. Riporta all'utente la conferma finale con l'hash del commit generato e l'esito dell'allineamento su GitHub.
