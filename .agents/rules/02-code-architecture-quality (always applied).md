---
trigger: always_on
---

# Regola: Struttura e Modularità dei File

## Principio generale - FONDAMENTALE DA SEGUIRE SEMPRE

Ogni file `.js` deve avere una responsabilità unica e ben definita.
È vietato creare file monolitici da centinaia o migliaia di righe che gestiscono
logiche eterogenee e non correlate tra loro.

## Linee guida obbligatorie - FONDAMENTALE E DA SEGUIRE SEMPRE

1. **Riutilizzo prioritario del codice esistente**
   Prima di scrivere nuovo codice, l'agente deve sempre verificare se esistono già file, cartelle o funzioni pertinenti nel progetto. Il codice esistente va riutilizzato e riorganizzato, non duplicato o riscritto da zero.
2. **Suddivisione per responsabilità (Single Responsibility)**
   Ogni funzione o gruppo di funzioni strettamente correlate deve risiedere in un file dedicato, con un nome che ne descriva chiaramente lo scopo (es. `validateUser.js`, `formatDate.js`, `sendEmail.js`).
3. **Organizzazione coerente in cartelle**
   I nuovi file devono essere posizionati in cartelle coerenti con la struttura già esistente nel progetto. Non lasciare mai file sparsi nella root del progetto senza una motivazione precisa.
4. **File di aggregazione (entry point)**
   Dopo aver suddiviso la logica in più moduli, creare un file principale (es. `index.js`) che importa ed esporta i singoli moduli, così da avere un unico punto di accesso lineare e leggibile per il resto dell'applicazione.
5. **Obiettivo finale**
   Il codice deve essere facile da leggere, correggere, debuggare e aggiornare, senza dover scorrere migliaia di righe per individuare una singola funzione.

### Esempio pratico

❌ Da evitare:
`userManager.js` (3000 righe: validazione, database, email, logging, API...)
✅ Corretto:

```
/services/user/
  ├── validateUser.js
  ├── userDatabase.js
  ├── userEmail.js
  ├── userLogger.js
  └── index.js        (aggrega ed esporta i moduli sopra)
```

- **Nessun Numero Magico nel Codice**: Valori numerici fissi con significato specifico (es. costanti fisiche, soglie, durate) devono essere dichiarati come `const` con nome descrittivo in MAIUSCOLO all'inizio del file o del modulo (es. `const GRAVITY_MPS2 = 9.81;`, `const DEBOUNCE_MS = 250;`, `const IQR_MIN_REPS = 4;`). Non disperdere numeri senza contesto nel corpo delle funzioni.

- **Commenti Obbligatori sul Codice (JavaScript)**: Ogni funzione, metodo o classe deve essere preceduta da un commento breve (`//` o `/** */`) che descriva: cosa fa, cosa riceve in input e cosa restituisce. I blocchi logici non ovvi all'interno di una funzione (algoritmi statistici, formule fisiche, logiche di fallback) devono anch'essi avere un commento inline esplicativo. Non commentare righe ovvie (es. `i++`). L'obiettivo è che chiunque rilegga il file capisca il significato di ogni funzione in meno di 5 secondi senza doverla eseguire mentalmente.
