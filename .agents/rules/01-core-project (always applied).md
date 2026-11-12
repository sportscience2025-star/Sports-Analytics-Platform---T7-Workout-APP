---
trigger: always_on
---

# Regola 01: Sicurezza Operativa, Perimetro di Lavoro e Verifiche

## Scopo
Proteggere l'integrità del progetto, evitare modifiche non richieste e garantire che ogni cambiamento al codice venga verificato prima di proseguire.

## Cosa l'AI NON può fare (Divieti assoluti)
- **Non uscire dal progetto:** è vietato creare, modificare o eliminare file fuori dalla cartella `Sports-Analytics-Platform---T7-Workout-APP`. Se un'operazione esterna fosse indispensabile, chiedere prima autorizzazione chiara ed esplicita all'utente.
- **Non modificare codice non richiesto:** è vietato fare pulizia o ristrutturare file che non rientrano nel compito assegnato.
- **Non sovrascrivere modifiche recenti altrui:** se nei diff recenti risultano modifiche eseguite da un'altra IA, integrare il nuovo lavoro senza riscrivere quelle parti.
- **Non usare JavaScript (`js/` o `.js`):** il progetto usa solo TypeScript strict (`src/` con `.ts`/`.tsx` e `allowJs: false` in `tsconfig.json`). Vietato creare nuovi file `.js` o ripristinare `js/`.
- **Non lanciare test non autorizzati:** non eseguire script di test diversi da quelli approvati a meno che l'utente non lo chieda per iscritto, oppure previa richiesta esplicita e motivata dell'AI.
- **Non inserire emoji o immagini spontanee:** vietato aggiungere emoji, icone decorative o immagini nell'applicazione o nei file generati se non richieste esplicitamente dall'utente.

## Cosa l'AI DEVE fare (Obblighi operativi)
- **Lavorare con precisione chirurgica:** toccare solo i file strettamente necessari all'obiettivo.
- **Verificare sempre dopo ogni modifica al codice:** dopo qualsiasi modifica in `src/` (`.ts`, `.tsx`), `index.html`, `sw.js` o `tsconfig.json`, eseguire `py test_check.py` (e `npm run typecheck` per verificare i tipi TypeScript).
- **Correggere subito eventuali errori:** se `py test_check.py` o il controllo tipi segnala un errore (es. parentesi non chiuse, catalogo incoerente, errori di sintassi), risolverlo immediatamente prima di continuare.
- **Riportare sempre i risultati:** comunicare all'utente elenco dei file modificati, esito dei controlli ed eventuali errori.
- **Aggiornare la cache del Service Worker (`sw.js`) per i rilasci:** incrementare la versione della cache in `sw.js` (es. `t7-workout-v125` -> `t7-workout-v126`) quando si preparano commit di produzione o si modificano asset in `CORE_ASSETS`, `css/` o `index.html` (nota: su `localhost` il Service Worker è bypassato in sviluppo).
- **Usare subagenti sui compiti complessi:** quando la task è articolata o multi-fase, suddividere le mansioni assegnando ruoli mirati a subagenti specializzati per essere rapidi ed efficaci.
- **Passaggio di consegne (Handoff) a fine contesto:** se i token o il contesto stanno per esaurirsi prima di finire, fermarsi in uno stato stabile e scrivere un riepilogo con:
  1. `Stato completamento`: file modificati ed esito dei test.
  2. `Punto di blocco`: riga o funzione esatta interrotta.
  3. `Next Steps puntuali`: comandi esatti e file che il prossimo agente dovrà prendere in carico.
