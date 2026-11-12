---
trigger: model_decision
description: "Attivare quando si ricercano o implementano formule di scienze motorie, protocolli di allenamento/riabilitazione, citazioni bibliografiche o fonti RAG private di Tier 3."
---

# Regola 04: Rigore Scientifico e Fonti delle Scienze Motorie

## Scopo
Garantire che carichi, protocolli e logiche di allenamento poggino su letteratura scientifica accreditata, distinguendo chiaramente l'autorevolezza degli studi dai piani commerciali dell'app.

> **Nota terminologica:** I livelli indicati qui sotto misurano l'**autorevolezza delle fonti scientifiche** (Livelli di Evidenza 1, 2, 3) e **NON vanno confusi** con i Piani di Abbonamento commerciali dell'app (Tier 1 Base, Tier 2 Pro, Tier 3 Elite della Regola 08).

## Cosa l'AI NON può fare (Divieti assoluti)
- **Niente fonti amatoriali:** vietato basare prescrizioni di carico, volumi o protocolli (riscaldamento, defaticamento, riabilitazione) su blog generici, forum o siti non revisionati dalla comunità scientifica (peer-reviewed).
- **Non confondere evidenza scientifica e piani d'abbonamento:** non scambiare la scala delle fonti accademiche con i livelli di accesso utente (Tier 1/2/3).

## Cosa l'AI DEVE fare (Obblighi operativi)
- **Seguire la scala di priorità scientifica:**
  - **Evidenza Livello 1 (Priorità massima):** revisioni sistematiche, meta-analisi e linee guida ufficiali (es. Cochrane Library, PEDro, ACSM, NSCA, NICE, WHO).
  - **Evidenza Livello 2 (Trial clinico-sportivi):** studi controllati randomizzati (RCT) pubblicati su riviste peer-reviewed di settore (es. JSCR, BJSM, IJSPP, Sports Medicine, JOSPT, MSSE).
  - **Evidenza Livello 3 (Database accademici per ricerca):** interrogare esclusivamente archivi scientifici indicizzati (PubMed, SPORTDiscus, Scopus, Web of Science, Europe PMC).
- **Spiegare sempre il razionale:** quando si introduce una metodologia complessa (es. progressione a onde, scarico al 50%, protocollo PAP), documentare nei commenti del codice o nel piano il riferimento scientifico usato.
- **Fonti interne nel solo RAG privato (Piano Tier 3 Elite):** esclusivamente dentro il RAG riservato di un club in Tier 3 (Role-Based RAG), considerare validi come fonti primarie accanto alla letteratura anche i documenti interni del club (referti medici, note vocali trascritte, linee guida societarie, test storici e stile del coach), **citando sempre in modo esplicito** la fonte interna utilizzata in ogni risposta generata.
