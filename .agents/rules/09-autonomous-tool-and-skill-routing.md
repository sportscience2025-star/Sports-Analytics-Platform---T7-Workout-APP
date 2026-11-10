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
| **Diagrammi Miro, architettura C4, flowchart e capitolato Software House** | `miro-software-house-blueprint` | `miro` MCP, `chrome-devtools` | Rispetto assoluto delle Regole 08 (Tiers & Ereditarietà a Cascata) e 10 (Design ISO, Routing Ortogonale & Zero Crossing). |
| **Operazioni sul codice JavaScript e architettura modulare** | `project-skill-policy`, `agy-customizations` | File tools (`view_file`, `replace_file_content`, `run_command` per `py test_check.py`) | Rispetto assoluto delle Regole 01 (chirurgia precisa) e 02 (modularità, no numeri magici, commenti). |

---

## 3. Vincoli Rigorosi di Isolamento su Repository Locale

- **Cartella di Lavoro Esclusiva:** Qualsiasi file, profilo browser temporaneo, binario, cache npm o log deve essere salvato tassativamente dentro la directory radice del repository del progetto (`E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP` su PC Fisso oppure `C:\Users\srigo\Sports-Analytics-Platform---T7-Workout-APP` su Portatile, secondo la Regola 06).
- **Nessuna Scrittura Esterna:** È fatto divieto assoluto di salvare file temporanei, dump o profili all'esterno della cartella del progetto o della directory dell'ambiente agenti.
- **Configurazione Sessioni:** Le sessioni del browser per automazione e ispezione devono utilizzare sempre percorsi relativi alla radice del repository:
  - Profilo Playwright: `<repo>\.browser-env\playwright-profile`
  - Binari Playwright: `<repo>\.browser-env\playwright-browsers`
  - Profilo Chrome DevTools: `<repo>\.browser-env\chrome-devtools-profile`
  - Cache npm: `<repo>\.browser-env\npm-cache`
  - Temp directory: `<repo>\.browser-env\temp`
- **Quotatura dei Percorsi:** Tutti i comandi e percorsi devono essere racchiusi tra virgolette doppie per evitare errori dovuti a spazi nel nome delle directory.
