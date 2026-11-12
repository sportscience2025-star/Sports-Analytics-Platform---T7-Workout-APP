---
trigger: always_on
---

# Regola 02: Struttura, Modularità e Chiarezza del Codice

## Scopo
Mantenere il codice TypeScript e React pulito, diviso in piccoli file specializzati e comprensibile in pochi secondi da qualsiasi sviluppatore o agente.

## Cosa l'AI NON può fare (Divieti assoluti)
- **Niente file giganti "tuttofare":** è vietato creare file da centinaia o migliaia di righe che mescolano logiche diverse (es. calcoli, chiamate di rete, interfaccia e salvataggio dati insieme).
- **Niente codice duplicato:** è vietato riscrivere da zero o copiare funzioni che esistono già nel progetto.
- **Niente file sparsi nella root:** è vietato lasciare nuovi file sorgente nella cartella principale del progetto senza motivo preciso.
- **Niente numeri senza nome ("numeri magici"):** è vietato inserire numeri fissi con significato specifico direttamente nel corpo delle funzioni (es. costanti fisiche, soglie, tempi di attesa).
- **Niente commenti inutili:** non commentare righe banali e autoevidenti (es. `i++`).

## Cosa l'AI DEVE fare (Obblighi operativi)
- **Riutilizzare prima di scrivere:** verificare sempre se in `src/` esistono già file, tipi, hook o helper adatti allo scopo e riutilizzarli.
- **Un file = una responsabilità:** dividere ogni gruppo di funzioni correlate in un file `.ts` o `.tsx` dedicato e dal nome parlante, dentro la cartella coerente del progetto (es. `src/services/...`, `src/hooks/...`, `src/components/...`, `src/utils/...`).
- **Creare un file di ingresso (`index.ts`):** quando una funzionalità viene divisa in più file dentro una cartella, creare un `index.ts` che esporta in modo ordinato i singoli moduli verso il resto dell'app.
- **Dichiarare tutte le costanti fisse in MAIUSCOLO:** definire i valori numerici significativi come `const` descrittive all'inizio del file o modulo (es. `const GRAVITY_MPS2 = 9.81;`, `const DEBOUNCE_MS = 250;`, `const IQR_MIN_REPS = 4;`).
- **Commentare ogni funzione e blocco complesso:**
  - Prima di ogni funzione, metodo, hook o classe, scrivere un commento breve (`//` o `/** */`) che indichi: **cosa fa**, **cosa riceve in input** e **cosa restituisce**.
  - Inserire brevi commenti esplicativi nei passaggi non immediati (algoritmi statistici, formule fisiche, logiche di ripiego/fallback), così che chi legge capisca il codice in meno di 5 secondi.
