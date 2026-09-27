---
trigger: manual
---

# Project Guidelines & Rules

## Multi-Agent Safety Rules (Progetto T7 Workout PWA)

- **Chirurgia precisa**: modifica solo i file strettamente necessari alla task assegnata. Non fare refactoring strutturale di file che non rientrano nel perimetro della richiesta. Lavora, inserisci e modifica file sempre e solo nei limiti della tua zona di lavoro che è la cartella: "App esercizi scienze motorie". Non ti è concesso andare a modificare altri file dentro al computer, se per un qualsiasi motivo dovessi fare un operazione del genere dovrai richiederlo in modo chiaro ed esplicito.
- **Bump SW cache**: ogni volta che si modificano file JS, CSS o asset, incrementa il numero di versione della cache in `sw.js` (es: `t7-workout-v14` → `t7-workout-v15`) per invalidare la cache browser.
- **Nessun conflitto cross-agent**: se un file è stato modificato di recente da un'altra IA (visibile dai diff nel contesto), non riscrivere quelle sezioni — integra solo le modifiche necessarie.
- **Test dopo ogni modifica**: eseguire `py test_check.py` dopo ogni modifica a file `.js`. Riportare sempre i risultati all'utente in modo riassuntivo ma chiaro: file modificati, esito del test, eventuali errori. Non eseguire altri script di test a meno che l'utente non lo richieda esplicitamente per iscritto oppure se ne sono necessari altri di altro tipo l'agente lo deve richiedere esplicitamente specificando il motivo per cui vorrebbe fare quei test.
- **Validazione Sintattica Obbligatoria (JavaScript)**: Se `py test_check.py` riporta un errore (es. "Unclosed {" o "Mismatched ("), l'agente deve risolvere immediatamente il problema sintattico prima di procedere oltre.

- **Parsing Intelligente dei Dati**: Quando si processano ID grezzi (es. ID dispositivo, ID sensori), estrarre sempre il nome leggibile (es. tramite split su _) per i valori di default della UI, evitando di usare placeholder generici a meno che non sia strettamente necessario.
- **Validazione UI Binding**: Verificare sempre che i risultati di calcoli complessi (es. metriche biometriche o fisiche) restituiscano un valore valido prima del binding sulla UI. Prevenire in ogni modo la comparsa della stringa "undefined" nelle interfacce, applicando calcoli di fallback o nascondendo il dato.

## Rules Relative al Progetto

- **Protocollo Esaurimento Contesto / Token (Handoff):** Se il task non può essere completato nella sessione attiva perché si sta quasi per finire i token: arrestarsi in stato stabile e fare un recap di quello che si è fatto in modo che quando i token torneranno attivi l'agente che riprendere in mano il lavoro che è stato interrotto riuscirà a capire meglio cosa deve fare, cosa è stato fatto, come deve farlo e quindi a concludere in modo più efficiente e veloce. Nel riassunto mettere:
  1. `Stato completamento`: file modificati ed esito dei test.
  2. `Punto di blocco`: riga o funzione esatta interrotta.
  3. `Next Steps puntuali`: i comandi esatti e i file che l'agente successivo dovrà prendere in carico.

## Integrità Dati, Formule Biometriche e UI

- **Dimensioni Fisiche e Vincoli Biometrici:**
  - Controllo di coerenza sui valori: se una stima o un calcolo produce parametri anomali o fisicamente impossibili, applicare fallback al dato grezzo o calcolo stimato standard.

## Esportazione Fogli di Calcolo (Excel / Sheet)

- **Modificabilità Totale:** Qualsiasi file `.xlsx` o foglio generato per il coach deve essere privo di celle bloccate, privo di protezioni con password e strutturato con formattazione tabellare chiara, in modo che l'allenatore possa inserire note, correzioni o carichi a mano libera.

## Database, Tassonomia & Ricerca Esercizi

- **Deduplicazione Semantica:** Prima di inserire nuovi esercizi nel database locale, verificare se la variante esiste già (confrontando sia il nome che il pattern motorio: es. Push-up vs Piegamenti sulle braccia).
- **Tassonomia Ricerca:** Ogni esercizio deve contenere campi obbligatori coerenti per l'indicizzazione: `id`, `name`, `primary_muscle`, `equipment`, `movement_pattern`, `difficulty`.

- **Utilizzare sempre più agenti per ogni task specifica:** Se si riceve un compito complesso si deve assegnare per ogni mansioni un sub-agente creato e pensato appositamente per svolgere quel compito. Bisogna essere assolutamente efficaci ed efficienti nel portare a termine la task.

## Regola: Struttura e Modularità dei File: FONDAMENTALE

### Principio generale

Ogni file `.js` deve avere una responsabilità unica e ben definita.
È vietato creare file monolitici da centinaia o migliaia di righe che gestiscono
logiche eterogenee e non correlate tra loro.

### Linee guida obbligatorie

1. **Riutilizzo prioritario del codice esistente**
   Prima di scrivere nuovo codice, l'agente deve sempre verificare se esistono già
   file, cartelle o funzioni pertinenti nel progetto. Il codice esistente va
   riutilizzato e riorganizzato, non duplicato o riscritto da zero.
2. **Suddivisione per responsabilità (Single Responsibility)**
   Ogni funzione o gruppo di funzioni strettamente correlate deve risiedere in
   un file dedicato, con un nome che ne descriva chiaramente lo scopo
   (es. `validateUser.js`, `formatDate.js`, `sendEmail.js`).
3. **Organizzazione coerente in cartelle**
   I nuovi file devono essere posizionati in cartelle coerenti con la struttura
   già esistente nel progetto.
   Non lasciare mai file sparsi nella root del progetto senza una motivazione precisa.
4. **File di aggregazione (entry point)**
   Dopo aver suddiviso la logica in più moduli, creare un file principale
   (es. `index.js`) che importa ed esporta i singoli moduli, così da avere un
   unico punto di accesso lineare e leggibile per il resto dell'applicazione.
5. **Obiettivo finale**
   Il codice deve essere facile da leggere, correggere, debuggare e aggiornare,
   senza dover scorrere migliaia di righe per individuare una singola funzione.

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

- **Emoji:** Non utilizzare emoji, figure o immagini in modo spontaneo nell'applicazione durante un operazione che ti ho assegnato a meno che non sia io a richiedertelo in modo esplicito.

## Ricerca e implementazione di informazioni e dati: Andare sempre a prediligere la letteratura scientifica e fonti accreditate. Lascio qui di seguito link e siti da consultare per primi e da cui trarre e prendere dati e informazioni

- **Tier 1 (Massima autorevolezza):** Revisioni sistematiche, meta-analisi e linee guida ufficiali (es. Cochrane Library, PEDro, ACSM, NSCA, NICE, WHO).
- **Tier 2 (Trial e studi clinico-sportivi):** Trial controllati randomizzati (RCT) da riviste peer-reviewed di settore (es. JSCR, BJSM, IJSPP, Sports Medicine, JOSPT, MSSE).
- **Tier 3 (Database accademici per ricerca):** Per reperire evidenza scientifica primaria, interroga esclusivamente database indicizzati: PubMed, SPORTDiscus, Scopus, Web of Science, Europe PMC.
- **Divieti:** Cerca di non basare prescrizioni di carico, volumi o protocolli di riscaldamento/defaticamento su blog generici, forum o siti non peer-reviewed.
- **Trasparenza:** Quando introduci una scelta metodologica complessa (es. progressione a onde, deload al 50%, protocollo PAP per centometristi), specifica nei commenti del codice o nel piano il razionale scientifico di riferimento.

- **Nessun Numero Magico nel Codice**: Valori numerici fissi con significato specifico (es. costanti fisiche, soglie, durate) devono essere dichiarati come `const` con nome descrittivo in MAIUSCOLO all'inizio del file o del modulo (es. `const GRAVITY_MPS2 = 9.81;`, `const DEBOUNCE_MS = 250;`, `const IQR_MIN_REPS = 4;`). Non disperdere numeri senza contesto nel corpo delle funzioni.

- **Commenti Obbligatori sul Codice (JavaScript)**: Ogni funzione, metodo o classe deve essere preceduta da un commento breve (`//` o `/** */`) che descriva: cosa fa, cosa riceve in input e cosa restituisce. I blocchi logici non ovvi all'interno di una funzione (algoritmi statistici, formule fisiche, logiche di fallback) devono anch'essi avere un commento inline esplicativo. Non commentare righe ovvie (es. `i++`). L'obiettivo è che chiunque rilegga il file capisca il significato di ogni funzione in meno di 5 secondi senza doverla eseguire mentalmente.
