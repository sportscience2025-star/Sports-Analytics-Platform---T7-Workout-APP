---
trigger: always_on
---

# Regola 09: Scelta Autonoma di Strumenti, MCP e Skills

## Scopo
Far scegliere all'AI in piena autonomia gli strumenti reali e le competenze adatte al compito, mantenendo tutti i file temporanei confinati dentro la cartella del progetto.

## Cosa l'AI NON può fare (Divieti assoluti)
- **Non chiedere all'utente quali strumenti usare:** l'utente indica l'obiettivo; vietato chiedergli quale MCP o quale skill attivare.
- **Non chiamare tool inesistenti o obsoleti:** vietato tentare di usare comandi non presenti nel runtime (come `view_file` o `replace_file_content`) o dare per attivi server MCP non caricati nella sessione corrente.
- **Mai scrivere file temporanei o cache fuori dal repo:** profili browser, binari Playwright, cache npm e file temporanei non devono mai uscire dalla radice del progetto (`<repo>\.browser-env\`).

## Cosa l'AI DEVE fare (Obblighi operativi)
- **Attivare autonomamente skill e strumenti reali in fase di piano:** usare esclusivamente i tool nativi (`read_file`, `edit_file`, `write_file`, `run_command`), gli MCP attivi nella sessione (es. `miro`) e il subagente `browser` per ispezioni o interazioni su pagine web live.
- **Seguire la tabella di instradamento:**
  - **Ispirazione UI/UX esterna (es. Apple, Strava, Linear):** attivare la skill `ui-ux-pattern-extractor` + subagente `browser` (o MCP browser se attivi) -> salvare il dossier in `ui-research/<target>_spec.md` prima di toccare il codice.
  - **Navigazione interna e coerenza tra moduli:** attivare `app-navigation-integrator` -> audit routing, barra navigazione, stato condiviso e verifica viewport.
  - **Debug interfaccia locale e prestazioni PWA:** attivare `modern-web-guidance` (+ subagente `browser` / `chrome-devtools` se disponibile) -> risolvere errori runtime e verificare responsività.
  - **Diagrammi Miro, C4 e capitolati:** attivare `miro-software-house-blueprint` + MCP `miro` (o script `.cjs` REST v2) -> applicare rigorosamente le Regole 08 e 10.
  - **Codice TypeScript/React e struttura modulare:** attivare `project-skill-policy` + tool `read_file`, `edit_file`, `write_file`, `run_command` (`py test_check.py`) -> rispettare le Regole 01 e 02.
- **Usare percorsi relativi a `.browser-env/` tra virgolette doppie:**
  - Profilo Playwright: `".browser-env\playwright-profile"` | Binari: `".browser-env\playwright-browsers"`
  - Profilo Chrome DevTools: `".browser-env\chrome-devtools-profile"`
  - Cache npm: `".browser-env\npm-cache"` | Temp: `".browser-env\temp"`
  Racchiudere sempre i percorsi tra virgolette doppie nei comandi per gestire gli spazi nei nomi delle cartelle.
