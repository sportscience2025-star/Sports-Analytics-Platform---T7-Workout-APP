---
trigger: always_on
---

# Regola: Orchestrazione Autonoma di Tool, MCP e Skills

## 1. Principio Fondamentale di Autonomia

- **Obiettivo dell'Utente vs Selezione Strumenti:** L'utente esprimerà esclusivamente il proprio obiettivo finale, requisiti funzionali e contesto discorsivo (ad esempio: *"migliora l'interfaccia dell'app"*, *"prendi spunto da Apple.com"*, *"rendi la navigazione tra i moduli più fluida e integrata"*). L'agente non deve MAI attendere né chiedere all'utente quale server MCP o quale Skill attivare.
- **Auto-Routing in Fase di Planning:** Durante l'analisi iniziale e la pianificazione di qualsiasi richiesta, l'agente deve determinare in completa autonomia le Skills pertinenti e gli strumenti MCP necessari, attivandoli e dichiarandoli chiaramente nel piano operativo.

---

## 2. Matrice di Attivazione e Routing Intelligente

| Contesto / Intento Utente | Skill da Attivare Autonomamente | Server MCP & Tool di Riferimento | Output / Azione Richiesta |
| :--- | :--- | :--- | :--- |
| **Ispirazione esterna, replicazione stile/UX, estrazione CSS da siti web** (es. Apple, Garmin, Linear, Strava) | `ui-ux-pattern-extractor` | `playwright`, `chrome-devtools` (`navigate_page`, `take_snapshot`, `get_css_styles`, `evaluate_script`) | Salva il dossier in `ui-research/<target>_spec.md` prima di modificare il codice dell'app. |
| **Miglioramento navigazione interna, unificazione layout, fluidità tra moduli, passaggio dati senza perdita di stato** | `app-navigation-integrator` | `chrome-devtools`, `playwright` (`click`, `evaluate_script`, `take_screenshot`) | Audit routing, unificazione top/bottom bar, centralizzazione stato, verifica percorsi di click e viewport. |
| **Debug interfaccia locale, test reattività, ispezione console e prestazioni PWA** | `modern-web-guidance`, `chrome-devtools` | `chrome-devtools` (`list_console_messages`, `performance_start_trace`, `lighthouse_audit`) | Risoluzione errori runtime JS/CSS, audit LCP e responsive design. |
| **Operazioni sul codice JavaScript e architettura modulare** | `project-skill-policy`, `agy-customizations` | File tools (`view_file`, `replace_file_content`, `run_command` per `py test_check.py`) | Rispetto assoluto delle Regole 01 (chirurgia precisa) e 02 (modularità, no numeri magici, commenti). |

---

## 3. Vincoli Rigorosi di Isolamento su Disco E:

- **Cartella di Lavoro Esclusiva:** Qualsiasi file, profilo browser temporaneo, binario, cache npm o log deve essere salvato tassativamente dentro `"E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP"`.
- **Nessuna Scrittura su Disco C:** È fatto divieto assoluto di salvare file temporanei, dump o profili sul disco `C:\`.
- **Configurazione Sessioni:** Le sessioni del browser per automazione e ispezione devono utilizzare sempre e solo:
  - Profilo Playwright: `"E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP\.browser-env\playwright-profile"`
  - Binari Playwright: `"E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP\.browser-env\playwright-browsers"`
  - Profilo Chrome DevTools: `"E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP\.browser-env\chrome-devtools-profile"`
  - Cache npm: `"E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP\.browser-env\npm-cache"`
  - Temp directory: `"E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP\.browser-env\temp"`
- **Quotatura dei Percorsi:** Tutti i comandi e percorsi devono essere racchiusi tra virgolette doppie per evitare errori dovuti a spazi nel nome delle directory.
