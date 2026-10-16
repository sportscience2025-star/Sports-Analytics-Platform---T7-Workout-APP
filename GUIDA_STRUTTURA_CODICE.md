# Guida Visuale all'Architettura e all'Avvio di T7 Workout Platform

Questa guida è stata creata appositamente per spiegare in modo chiaro e immediato:
1. **Come avviare l'applicazione con 1 clic**.
2. **Perché l'app richiede Vite e come funziona il meccanismo**.
3. **La mappa completa dei file (corrispondenza tra vecchio codice `js/` e nuovo codice `src/`)**.
4. **Come leggere e modificare i file TypeScript senza perdersi**.
5. **Il Flowchart ufficiale dell'architettura e dei flussi su Miro** ([FLOWCHART_MIRO.md](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/FLOWCHART_MIRO.md)).

---

## 1. Come Avviare l'Applicazione (I 3 Modi Semplicissimi)

> [!NOTE]
> **Attenzione**: Cliccare su `AVVIA_APP.bat` con il tasto sinistro dentro VS Code apre il file come testo per leggerlo. Per **eseguirlo**, usa uno dei seguenti 3 metodi:

### Metodo A: Da Esplora File di Windows (Doppio Clic Diretto)
1. Apri la normale cartella di Windows: `E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP`.
2. Trova il file **`AVVIA_APP.bat`** (ha l'icona con gli ingranaggi di Windows).
3. Fai **doppio clic con il tasto sinistro** sull'icona.
4. Si aprirà una finestra nera del prompt dei comandi e **il tuo browser si aprirà automaticamente** su:
   `http://localhost:5173`
5. Per chiudere l'app: chiudi semplicemente la finestra nera del prompt.

### Metodo B: Direttamente da dentro VS Code (Scorciatoia a 1-Clic)
1. In qualsiasi momento dentro VS Code, premi sulla tastiera:
   `Ctrl + Shift + B`
   *(oppure menu in alto: **Terminale** -> **Esegui task di compilazione...** -> seleziona **Avvia T7 Workout Platform**)*.
2. L'app si avvia in background e il browser si apre da solo.

### Metodo C: Dal Terminale Integrato di VS Code
1. Premi `Ctrl + \`` (oppure menu **Terminale** -> **Nuovo Terminale**).
2. Digita: `npm run dev` e premi Invio.
3. Il browser si aprirà automaticamente all'indirizzo dell'app.

---

## 2. Perché non bastava aprire `index.html`?

Nel vecchio codice (`.js`), il browser leggeva file JavaScript semplici e lenti.
Con **React 18 e TypeScript**, il codice è scritto in file `.tsx` (che uniscono HTML ed elaborazioni biomeccaniche) e `.ts` (dati e matematica tipizzata).
- I browser (Chrome, Edge, Firefox) **non comprendono la sintassi `.tsx` direttamente**.
- **Vite** è un compilatore locale ultra-rapido che traduce i file `.tsx` in JavaScript istantaneo (in meno di 2 millisecondi) mentre li usi.
- Avviando `AVVIA_APP.bat`, Vite si attiva e permette al browser di visualizzare tutto perfettamente.

---

## 3. Mappa del Codice: Dove Trovare Ogni Cosa

Tutto il codice del progetto si trova ora ordinato dentro la cartella **`src/`**.
Ecco la corrispondenza esatta con la struttura che conoscevi prima:

### A. Esercizi e Catalogo (296 Esercizi)
Prima era un unico file gigante (`exercises.js`). Ora è diviso per distretto muscolare:
| Vecchia Posizione | Nuova Posizione (`src/`) | Contenuto |
| :--- | :--- | :--- |
| `js/data/exercises.js` | `src/data/exercises/chest.ts` | Esercizi per il Petto |
| `js/data/exercises.js` | `src/data/exercises/back.ts` | Esercizi per il Dorso |
| `js/data/exercises.js` | `src/data/exercises/legs.ts` | Esercizi per le Gambe |
| `js/data/exercises.js` | `src/data/exercises/shoulders.ts` | Esercizi per le Spalle |
| `js/data/exercises.js` | `src/data/exercises/arms.ts` | Esercizi per Braccia (Bicipiti, Tricipiti) |
| `js/data/exercises.js` | `src/data/exercises/core.ts` | Esercizi per Addome e Core |
| `js/data/exercises.js` | `src/data/exercises/clinical-knee.ts` | Esercizi clinici per il ginocchio (`cli_01`..`cli_32`) |

### B. Patologie e Condizioni Cliniche (119 Condizioni)
Prima stavano in `conditions.js`. Ora sono divise per apparato anatomico:
| Vecchia Posizione | Nuova Posizione (`src/`) | Contenuto |
| :--- | :--- | :--- |
| `js/data/conditions.js` | `src/data/conditions/colonna.ts` | Ernie, lombalgie, cervicalgie, spondilolisi |
| `js/data/conditions.js` | `src/data/conditions/arti-superiori.ts` | Cuffia dei rotatori, impingement spalla, gomito |
| `js/data/conditions.js` | `src/data/conditions/arti-inferiori.ts` | LCA, menischi, caviglia, tendinopatia rotulea |
| `js/data/conditions.js` | `src/data/conditions/sistemiche.ts` | Diabete, ipertensione, osteoporosi |
| `js/data/conditions.js` | `src/data/conditions/neurologiche-speciali.ts` | Condizioni neurologiche e posturali |

### C. Fonti Scientifiche e Studi (322 Pubblicazioni)
| Vecchia Posizione | Nuova Posizione (`src/`) | Contenuto |
| :--- | :--- | :--- |
| `js/data/sources/*.js` | `src/data/sources.ts` | Tutte le 322 fonti peer-reviewed (Morin, Samozino, Schoenfeld, Badillo) |

### D. Calcoli Fisici, Biomeccanica e Statistica
| Vecchia Posizione | Nuova Posizione (`src/`) | Contenuto |
| :--- | :--- | :--- |
| `js/physics-engine.js` | `src/physics/physics-engine.ts` | Formule VBT, F-V Profile, 1RM, Outlier IQR |
| `js/analysis/pap/` | `src/physics/pap-stats-engine.ts` | Statistica PAP, Student t-test, Cohen's d, MDC 95%, RSI |
| `js/analysis/medicine-ball...` | `src/physics/medicine-ball-physics.ts` | Balistica e lanci con palla medica |

### E. Logica di Allenamento & Periodizzazione
| Vecchia Posizione | Nuova Posizione (`src/`) | Contenuto |
| :--- | :--- | :--- |
| `js/logic/risk-analyzer.js` | `src/logic/risk-analyzer.ts` | Valutazione rischio pesato e patologie multiple |
| `js/logic/periodization.js` | `src/logic/periodization.ts` | Selezione modello (DUP, Block, Lineare, Coniugato) |
| `js/logic/session-builder.js` | `src/logic/session-builder.ts` | Composizione seduta e accoppiamento esercizi |
| `js/logic/warmup-cooldown.js` | `src/logic/warmup-cooldown.ts` | Riscaldamento dinamico e defaticamento |

### F. Schermate e Interfaccia Grafica (Cosa vedi a video)
Tutte le schermate visive si trovano dentro `src/components/`:
| Sezione a Video | File Componente (`src/components/`) |
| :--- | :--- |
| **Navigazione & Barra Superiore** | `src/App.tsx` |
| **Programmazione (Wizard Schede)** | `src/components/wizard/WorkoutWizardView.tsx` |
| **Catalogo Esercizi** | `src/components/exercises/ExerciseCatalogView.tsx` e `ExerciseCard.tsx` |
| **Analisi VBT** | `src/components/vbt/VBTAnalysisView.tsx` |
| **Analisi PAP (Salti)** | `src/components/pap/PAPAnalysisView.tsx` |
| **Libreria Scientifica & RAG** | `src/components/rag/RAGKnowledgeView.tsx` |

---

## 4. Come Leggere un File TypeScript Facilmente

TypeScript è semplicemente **JavaScript con le etichette di sicurezza**.
Non serve essere programmatori esperti per comprenderlo. Ecco le uniche tre cose da sapere:

1. **Le `interface` (cartella `src/types/`)**:
   Sono come la "carta d'identità" di un oggetto. Esempio:
   ```typescript
   interface Exercise {
       id: string;          // deve avere un testo come id
       name: string;        // deve avere un nome
       primaryMuscles: string[]; // elenco di muscoli
   }
   ```
   Servono all'editor per avvisarti subito se dimentichi un campo o sbagli a scrivere il nome di una proprietà.

2. **File `.ts` vs File `.tsx`**:
   - Se finisce per **`.ts`**: contiene solo dati, numeri, formule fisiche o funzioni matematiche.
   - Se finisce per **`.tsx`**: contiene elementi visivi di React (pulsanti, tabelle, grafici).

3. **I `hooks` (cartella `src/hooks/`)**:
   I file che iniziano per `use...` (es. `useWorkoutWizard.ts`) sono i "motori" delle schermate: raccolgono i dati, calcolano i pesi e li passano alla grafica senza sporcare i componenti visivi.

---

## 5. Supporto per l'IDE

Grazie al file `.vscode/settings.json` appena configurato:
- L'IDE utilizza automaticamente il compilatore TypeScript integrato nella cartella del progetto.
- I file `.ts` e `.tsx` vengono colorati ed evidenziati con la sintassi corretta.
- Quando apri VS Code, clicca su **"Install All"** nel pop-up delle estensioni consigliate (`Prettier`, `ESLint`, `TypeScript`) per avere il supporto grafico completo.

---

## 6. Flowchart Ufficiale su Miro (Mappa Visuale Interattiva)

La mappa visuale completa dell'applicazione T7 Workout, con l'intero flusso di Onboarding (Welcome, Login vs Registrazione con codice fiscale e anamnesi clinica su 119 patologie), la Dashboard e i workflow algoritmici (VBT, PAP, Periodizzazione), è consultabile sulla board ufficiale:
- **Board Miro**: [FITNESS APP FLOWCHART](https://miro.com/app/board/uXjVEbo6L2o=)
- **Documento di Sintesi nel Repository**: consultare [FLOWCHART_MIRO.md](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/FLOWCHART_MIRO.md) per l'indice dettagliato dei 4 macro-blocchi.

