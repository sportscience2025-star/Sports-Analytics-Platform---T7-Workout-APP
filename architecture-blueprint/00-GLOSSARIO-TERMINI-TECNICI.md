# Glossario Tecnico Evolutivo & Dizionario dei Concetti Architetturali (ZONA 0)

Questo documento costituisce la versione locale e sincronizzata su Git della **Living Technical Glossary Board (ZONA 0)** presente sulla lavagna Miro online del progetto T7 (Board ID: `uXjVEbo6L2o=`).

> **Regola Vincolante (Regola 08):** Questa board deve essere aggiornata progressivamente e tempestivamente ogni volta che vengono apportate modifiche agli schemi, introdotti nuovi flussi, o utilizzati termini tecnici complessi, acronimi o formule (sia lato ingegneria software che lato scienze motorie). L'obiettivo è facilitare la comprensione istantanea a chiunque consulti gli schemi (sviluppatori Software House, preparatori, medici, stakeholder, nuovi agenti AI).

---

## Struttura Standard di Ogni Voce

- **Termine Ufficiale & Acronimo:** Nome del concetto o della tecnologia.
- **Spiegazione Semplificata:** Significato chiaro spiegato con parole accessibili.
- **Ruolo Operativo nel Progetto T7:** Perché esiste, dove interviene e quale problema risolve nel sistema.
- **Zona / Flusso di Riferimento:** Collocazione negli schemi (Zona Miro o Corsia del Flowchart).

---

## Categoria 1: Ingegneria Software & Architettura Cloud

### Thin Client (Guscio Visivo)
- **Spiegazione Semplificata:** Un'applicazione client leggera che gestisce unicamente l'interfaccia utente (rendering, input, transizioni visive) senza memorizzare sul dispositivo formule di calcolo, algoritmi matematici o database completi.
- **Ruolo Operativo nel Progetto T7:** Tutela totale della proprietà intellettuale (IP). L'app per smartphone (iOS/Android) o web (React/TS) invia input al server e riceve il risultato elaborato, impedendo la decompilazione o il furto degli algoritmi proprietari.
- **Zona di Riferimento:** Corsia 1 di tutti i Flowchart (Zona 4) e Topologia C4 (Zona 2).

### API Gateway & Feature Gating
- **Spiegazione Semplificata:** Il punto d'accesso unico e sicuro per tutte le richieste tra l'app utente e i server di calcolo. Verifica l'identità dell'utente e il suo livello di abbonamento prima di consentire l'accesso a una funzione.
- **Ruolo Operativo nel Progetto T7:** Smista il traffico e applica il controllo degli accessi per i 3 Tier (Base, Pro, Elite), proteggendo i microservizi interni e bloccando chiamate non autorizzate.
- **Zona di Riferimento:** Corsia 2 di tutti i Flowchart (Zona 4).

### 3 Silos Database (Multi-Tenant Data Isolation)
- **Spiegazione Semplificata:** Un'architettura a compartimenti stagni in cui i dati vengono segregati in 3 ambienti fisicamente o logicamente isolati, con regole di sicurezza e crittografia differenziate.
- **Ruolo Operativo nel Progetto T7:**
  - *Silo 1 (Public, Social & Movely):* Gestisce i profili amatoriali e il marketplace professionisti.
  - *Silo 2 (Encrypted Club Bunkers):* Partizioni criptate con chiavi Cloud KMS dedicate per ciascuna società professionistica di Tier 3 (nessun club può accedere ai dati di altri club).
  - *Silo 3 (De-identified Research Warehouse):* Dati biomeccanici anonimizzati per studi scientifici universitari.
- **Zona di Riferimento:** Zona 2 (Architettura C4), Zona 5 (Database ERD), Corsia 4 nei Flowchart.

### RBAC (Role-Based Access Control a 3 Tiers x 8 Ruoli)
- **Spiegazione Semplificata:** Modello di controllo degli accessi in cui i permessi sono assegnati in base al ruolo formale ricoperto dall'utente nell'organizzazione e al livello di abbonamento attivo.
- **Ruolo Operativo nel Progetto T7:** Regola in modo granulare cosa possono visualizzare e modificare gli 8 ruoli (Atleta, Coach, Fisioterapista, Medico, Preparatore, Match Analyst, Ricercatore, Admin).
- **Zona di Riferimento:** Zona 1 (Schema 01 - Glossario RBAC).

### Cloud KMS (Key Management Service)
- **Spiegazione Semplificata:** Servizio cloud per la gestione, rotazione e custodia sicura di chiavi crittografiche hardware.
- **Ruolo Operativo nel Progetto T7:** Cripta i database e gli allegati sanitari dei club professionistici (Silo 2), garantendo che neppure gli amministratori di sistema della piattaforma possano leggere in chiaro i dati medici o contrattuali delle squadre.
- **Zona di Riferimento:** Zona 1 (ADR Sicurezza) e Zona 2 (Silo 2).

### Swimlanes (Corsie Architetturali nei Flowchart)
- **Spiegazione Semplificata:** Suddivisione verticale o orizzontale di un diagramma di flusso che separa chiaramente le responsabilità tra i vari attori o strati del sistema.
- **Ruolo Operativo nel Progetto T7:** Ogni diagramma operativo è strutturato su 4 corsie (1: App Utente -> 2: API Gateway -> 3: Server Segreto -> 4: Database), evidenziando il confine insuperabile tra Client e Server.
- **Zona di Riferimento:** Zona 4 (Flowchart Operativi).

---

## Categoria 2: Biomeccanica & Valutazione Funzionale

### VBT (Velocity Based Training)
- **Spiegazione Semplificata:** Metodologia di allenamento contro resistenze basata sul monitoraggio in tempo reale della velocità di sollevamento del bilanciere mediante trasduttori lineari (encoder) o telecamere.
- **Ruolo Operativo nel Progetto T7:** Permette di regolare il carico giornaliero in base alla reale freschezza neuromuscolare dell'atleta e di stimare il massimale (1RM) senza dover eseguire test massimali ad alto rischio di infortunio.
- **Zona di Riferimento:** Zona 2 (Motore Biomeccanico), Zona 4 (Flowchart VBT).

### MVT (Minimum Velocity Threshold)
- **Spiegazione Semplificata:** La velocità minima con cui un atleta riesce a completare l'ultima ripetizione valida di un esercizio prima del cedimento muscolare concentrico (es. ~0.15 m/s per la panca piana, ~0.30 m/s per lo squat).
- **Ruolo Operativo nel Progetto T7:** Parametro fondamentale per calcolare l'1RM teorico tramite l'intersezione della retta di regressione lineare con la soglia minima.
- **Zona di Riferimento:** Zona 2 (Motore VBT) e Zona 4.

### PAP (Post-Activation Potentiation)
- **Spiegazione Semplificata:** Fenomeno fisiologico acuto per cui l'esecuzione di una contrazione muscolare massimale o sub-massimale aumenta temporaneamente la capacità del muscolo di esprimere potenza e velocità nei minuti successivi.
- **Ruolo Operativo nel Progetto T7:** Modulo per testare l'efficacia del riscaldamento e delle serie pesanti prima di sprint o salti, analizzando indici statistici (Cohen d, MDC 95%) per confermare se il potenziamento è reale.
- **Zona di Riferimento:** Zona 2 e Zona 4 (Flowchart VBT/PAP).

### CMJ (Countermovement Jump) & Abalakov Jump
- **Spiegazione Semplificata:** Test standardizzati di salto verticale su pedana di forza o con sensori. Il CMJ misura l'altezza di salto con mani sui fianchi sfruttando il ciclo allungamento-accorciamento (SSC). L'Abalakov include l'uso oscillatorio delle braccia.
- **Ruolo Operativo nel Progetto T7:** Monitoraggio dello stato di affaticamento neuromuscolare nel corso della stagione e valutazione dell'efficienza elastica degli atleti.
- **Zona di Riferimento:** Zona 2 (Valutazione Esplosività) e Zona 3.

### Valgismo Dinamico del Ginocchio
- **Spiegazione Semplificata:** Deviazione mediale dell'articolazione del ginocchio durante movimenti di carico (atterraggio da un salto, discesa in squat), indicatore di deficit di controllo neuromuscolare e fattore di rischio per lesioni del legamento crociato anteriore (LCA).
- **Ruolo Operativo nel Progetto T7:** Tracciato automaticamente dal modulo di Video Analisi Biomeccanica per allertare preparatori e fisioterapisti su asimmetrie o rischi infortunistici.
- **Zona di Riferimento:** Zona 2 (Video Analysis Engine) e Zona 4 (Flowchart Video Biomechanics).

---

## Categoria 3: Algoritmi, Statistica & Machine Learning

### Z-Score Adattivo (Normalizzazione Statistica)
- **Spiegazione Semplificata:** Indice statistico che indica di quante deviazioni standard un determinato valore rilevato oggi si discosta dalla media storica personale di quell'atleta: $z = \frac{x - \mu}{\sigma}$.
- **Ruolo Operativo nel Progetto T7:** Normalizza dati eterogenei (sonno, variabilità cardiaca HRV, RPE, distanze sprint GPS) su una scala comune personalizzata, evitando allarmi inutili o sottovalutazioni della fatica.
- **Zona di Riferimento:** Zona 2 (Team Microcycle Engine) e Zona 4 (Flowchart Z-Score).

### Z-Weighting & Gestione Doppio Ruolo Tattico
- **Spiegazione Semplificata:** Ponderazione dinamica dei parametri fisici in base alla specifica posizione tattica occupata dall'atleta in campo (es. terzino vs difensore centrale). Se un calciatore ricopre più ruoli, i carichi di riferimento vengono fusi proporzionalmente.
- **Ruolo Operativo nel Progetto T7:** Consente di confrontare l'atleta non con una media generica di squadra, ma con il profilo fisiologico specifico richiesto dal suo compito in campo.
- **Zona di Riferimento:** Zona 2 e Zona 4 (Flowchart Z-Score).

### Fallback per Nuovi Acquisti (Cold Start senza Baseline)
- **Spiegazione Semplificata:** Meccanismo di sicurezza algoritmica che interviene quando un nuovo atleta entra in squadra e non possiede uno storico di misurazioni su cui calcolare media e deviazione standard.
- **Ruolo Operativo nel Progetto T7:** Assegna temporaneamente valori di riferimento basati sulla media del ruolo e su indici antropometrici, prevenendo errori a schermo (`NaN`, `undefined`) e carichi di lavoro eccessivi nei primi microcicli.
- **Zona di Riferimento:** Zona 4 (Flowchart Z-Score & Gestione Edge Cases).

### RAG Gerarchico Scientifico (Retrieval-Augmented Generation)
- **Spiegazione Semplificata:** Sistema di intelligenza artificiale che risponde o genera piani di allenamento attingendo a un database indicizzato di letteratura scientifica revisionata (PubMed, peer-reviewed), applicando moltiplicatori di autorevolezza alle fonti.
- **Ruolo Operativo nel Progetto T7:** Pesa le evidenze scientifiche secondo una gerarchia rigida:
  - Meta-analisi e Trial Clinici Randomizzati (RCT): moltiplicatore $\times 1.3$.
  - Studi di Coorte e Serie Temporali: moltiplicatore $\times 1.1$.
  - Opinioni di Esperti o Report Descrittivi: moltiplicatore $\times 1.0$.
  Garantisce che ogni prescrizione sia scientificamente fondata e verificabile.
- **Zona di Riferimento:** Zona 2 (Scientific Evidence RAG Engine).

### Regressione OLS (Ordinary Least Squares) per 1RM
- **Spiegazione Semplificata:** Metodo matematico di regressione lineare che trova la retta di migliore approssimazione tra i carichi sollevati e le relative velocità propulsive misurate durante le serie di riscaldamento.
- **Ruolo Operativo nel Progetto T7:** Calcola con precisione millimetrica il carico massimale giornaliero (1RM a MVT) scartando automaticamente eventuali ripetizioni anomale o esecuzioni errate.
- **Zona di Riferimento:** Zona 2 (Motore VBT) e Zona 4.

---

## Categoria 4: Metodologia d'Allenamento & Clinica Sportiva

### DUP (Daily Undulating Periodization)
- **Spiegazione Semplificata:** Modello di periodizzazione dell'allenamento in cui volume, intensità e stimoli neuromuscolari variano da una sessione all'altra all'interno della stessa settimana (es. Lunedì Ipertrofia, Mercoledì Forza Massima, Venerdì Potenza Esplosiva).
- **Ruolo Operativo nel Progetto T7:** Generato automaticamente dal Wizard di Programmazione per atleti e clienti Tier 2, ottimizzando l'adattamento neuromuscolare e riducendo il rischio di plateau.
- **Zona di Riferimento:** Zona 2 (Periodization Engine) e Zona 4 (Flowchart Macrocycle).

### Periodizzazione a Blocchi & Coniugata
- **Spiegazione Semplificata:** Sistemi avanzati di organizzazione dei carichi. La periodizzazione a blocchi concentra carichi altamente concentrati e specializzati su poche qualità motorie (Accumulo, Trasformazione, Realizzazione). Il metodo coniugato allena contemporaneamente forza massima e velocità dinamica.
- **Ruolo Operativo nel Progetto T7:** Selezionabili nel generatore di schede per atleti evoluti e squadre professionistiche in base al calendario gare.
- **Zona di Riferimento:** Zona 2 (Periodization Engine).

### Triage Clinico Patologie & ImpactCalculator
- **Spiegazione Semplificata:** Modello algoritmico di sicurezza sanitaria che incrocia le patologie diagnosticate all'atleta (su 119 condizioni mediche codificate) con l'archivio degli esercizi, calcolando l'impatto biomeccanico articolare.
- **Ruolo Operativo nel Progetto T7:** Assegna a ogni esercizio uno stato vincolante:
  - *ESCLUSO:* Esercizio vietato perché sollecita l'articolazione lesa.
  - *ADATTATO:* Esercizio consentito solo entro determinati angoli di movimento (ROM limitato) o con carico ridotto.
  - *DISPONIBILE:* Esercizio sicuro ed eseguibile.
- **Zona di Riferimento:** Zona 2 (Clinical Triage Engine) e Zona 4.

### Return To Play (RTP)
- **Spiegazione Semplificata:** Il percorso a tappe guidato dai criteri clinico-funzionali che un atleta infortunato deve superare per passare dalla riabilitazione passiva al ritorno in campo in sicurezza.
- **Ruolo Operativo nel Progetto T7:** I fisioterapisti e i medici sociali (Tier 2/3) monitorano le metriche di forza simmetrica (LSI - Limb Symmetry Index) e i test funzionali prima di dare il via libera al rientro.
- **Zona di Riferimento:** Zona 2 e Zona 3 (Integrazione Clinica $\rightarrow$ Programmazione).


---

## Categoria 5: Sicurezza, Anti-Frode & Fiscalità Digitale B2B

### INI-PEC (Indice Nazionale Posta Elettronica Certificata) & Two-Way OTP
- **Spiegazione Semplificata:** Il registro pubblico telematico istituito dal Ministero delle Imprese e del Made in Italy che raccoglie tutti gli indirizzi di Posta Elettronica Certificata (PEC) ufficiali di imprese e liberi professionisti registrati in Italia.
- **Ruolo Operativo nel Progetto T7:** Strumento cardine dello scudo anti-spoofing nell'onboarding P.IVA. Quando un utente inserisce una Partita IVA, il server interroga INI-PEC e invia un codice monouso (OTP) a 6 cifre direttamente alla PEC aziendale ufficiale. Se il richiedente non ha accesso alla casella PEC dell'azienda reale, la registrazione viene bloccata istantaneamente, azzerando le truffe di furto d'identità fiscale.
- **Zona di Riferimento:** Riga 2, Colonna 1 (Onboarding P.IVA Anti-Frode) e Corsia 2 API Gateway.

### VIES & Sistema di Interscambio (SDI)
- **Spiegazione Semplificata:** VIES (VAT Information Exchange System) è il sistema europeo di validazione in tempo reale delle Partite IVA intracomunitarie. Lo SDI è il nodo telematico dell'Agenzia delle Entrate per la fatturazione elettronica B2B tramite Codice Destinatario a 7 caratteri.
- **Ruolo Operativo nel Progetto T7:** Convalida la reale esistenza e lo stato attivo della Partita IVA all'atto dell'immatricolazione, bloccando codici fiscali fittizi o partite IVA cessate e garantendo la piena conformità fiscale degli abbonamenti SaaS.
- **Zona di Riferimento:** Riga 2, Colonna 1 (Setup Fiscale P.IVA).

### Stripe Identity & Biometric Liveness 3D
- **Spiegazione Semplificata:** Sistema di verifica biometrica avanzata che confronta un documento di riconoscimento ufficiale (CIE o Passaporto) con un selfie dinamico 3D dell'utente, rilevando profondità e micro-movimenti per escludere foto statiche, maschere o deepfake.
- **Ruolo Operativo nel Progetto T7:** Impedisce a malintenzionati di creare account fittizi intestati a terzi o documenti clonati prima di connettere un conto bancario di incasso su Stripe Connect.
- **Zona di Riferimento:** Riga 2, Colonna 1 (Step 5 Stripe Connect).

### Rolling Reserve & Escrow Anti-Chargeback
- **Spiegazione Semplificata:** Meccanismo di sicurezza finanziaria che trattiene in una riserva cautelativa temporanea (7-14 giorni) una percentuale dei primi incassi ricevuti da un nuovo professionista.
- **Ruolo Operativo nel Progetto T7:** Protegge la piattaforma dal rischio di responsabilità oggettiva (*friendly fraud* o *chargeback rings* con carte di credito rubate), sbloccando i payout completi solo dopo che la telemetria dell'applicazione certifica l'effettiva erogazione dei servizi di allenamento e check-in degli atleti.
- **Zona di Riferimento:** Riga 2, Colonna 1 e Corsia 3 Server.

### Feature Gating Clinico & Ordine Sanitario (FNOFI / TSRM-PSTRP)
- **Spiegazione Semplificata:** Barriera di autorizzazione logica che sblocca determinati moduli diagnostico-riabilitativi solo se l'utente ha fornito evidenza certificata di appartenenza a un ordine professionale abilitante.
- **Ruolo Operativo nel Progetto T7:** Segrega rigidamente le funzioni sportive (VBT, DUP, PAP accessibili a Personal Trainer e Chinesiologi) dai protocolli terapeutici riabilitativi (`cli_01..32` e cartella EMR), tutelando la piattaforma dal rischio di esercizio abusivo della professione sanitaria (Art. 348 C.P.).
- **Zona di Riferimento:** Riga 2, Colonna 1 & Colonna 6 (Physio Rehab).


### PAR-Q+ (Physical Activity Readiness Questionnaire) & Digital Triage
- **Spiegazione Semplificata:** Standard internazionale di screening pre-partecipazione all'attività fisica composto da 7 domande mirate a identificare sintomi cardiorespiratori, dolori al torace sotto sforzo, vertigini o problemi ossei/articolari.
- **Ruolo Operativo nel Progetto T7:** Valuta l'idoneità dell'utente comune prima di autorizzare la generazione di schede ad alta intensità. Se vengono segnalate anomalie (Red Flags), gli algoritmi escludono automaticamente carichi massimali e forzati, limitando la scheda a esercizi a basso impatto (Low-Impact) e raccomandando una visita medica.
- **Zona di Riferimento:** Riga 1, Colonna 1 (Onboarding Consumer B2C).

### Clickwrap Liability Waiver (Manleva Medico-Legale Digitale)
- **Spiegazione Semplificata:** Accordo legale non pre-selezionato che richiede un'azione attiva dell'utente per confermare di aver compreso che l'applicazione è uno strumento di supporto al fitness e non un presidio medico o diagnostico.
- **Ruolo Operativo nel Progetto T7:** Tutela civilmente e penalmente la piattaforma da richieste di risarcimento in caso di infortuni derivanti da patologie pregresse non dichiarate, archiviando un audit trail immutabile con timestamp in Silo 1.
- **Zona di Riferimento:** Riga 1, Colonna 1 (Onboarding Consumer B2C).

### Step-Up Verification (Verifica Telefono Anti-Troll per Community)
- **Spiegazione Semplificata:** Meccanismo di sicurezza progressiva che richiede un fattore di autenticazione addizionale (SMS OTP sul numero di cellulare) solo quando l'utente tenta di compiere azioni a rischio o pubbliche.
- **Ruolo Operativo nel Progetto T7:** Mantiene l'iscrizione base rapida in 30 secondi, ma protegge la community Together e il marketplace Movely da bot farm, spammer e account anonimi molesti.
- **Zona di Riferimento:** Riga 1, Colonna 1 (Step 4 Social Gate) & Colonna 5 (Together B2C).
