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

---

## Categoria 6: Grafica 3D, WebGL & Rendering Biomeccanico

### glTF / GLB & Compressione Google Draco Mesh
- **Spiegazione Semplificata:** Il formato standard per i modelli 3D su internet (spesso definito "il JPEG del 3D"). La compressione Draco è un algoritmo open-source di Google che riduce del 70-85% le dimensioni dei file tridimensionali senza perdita visibile di qualità.
- **Ruolo Operativo nel Progetto T7:** Permette al Catalogo Esercizi di caricare l'avatar umano 3D in meno di 1 secondo anche su connessioni mobili lente 4G/5G, occupando pochissimi megabyte di memoria e riducendo il consumo di batteria dello smartphone.
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Riga 1 (Casual B2C).

### Progressive LOD (Level of Detail Dinamico WebGL)
- **Spiegazione Semplificata:** Tecnica che adatta automaticamente la complessità visiva del modello 3D (numero di poligoni e dettagli muscolari) in base alla potenza del dispositivo dell'utente. Se il telefono scalda o rallenta, il motore abbassa i dettagli per mantenere l'animazione sempre fluida.
- **Ruolo Operativo nel Progetto T7:** Garantisce che l'omino biomeccanico 3D si muova sempre a 60 frame al secondo (FPS) sia su un iPhone o PC da gaming di ultima generazione, sia su uno smartphone economico datato.
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Corsia 1 (Guscio Visivo WebGL).

### OrbitControls (Yaw 360° e Pitch Zenitale/Nadir)
- **Spiegazione Semplificata:** Sistema di telecamera virtuale interattiva che permette all'utente di ruotare intorno all'omino 3D trascinando il dito o il mouse in qualsiasi direzione: orizzontalmente (Yaw a 360°), dall'alto verso il basso (Pitch zenitale, vista a volo d'uccello) o dal basso (Nadir, vista dal suolo), con zoom avanti e indietro (Pinch-to-zoom).
- **Ruolo Operativo nel Progetto T7:** Consente all'atleta o al chinesiologo di osservare l'esercizio da qualunque angolazione desiderata (frontale, laterale, posteriore o dall'alto), verificando ad esempio se la schiena curva o se le ginocchia collassano verso l'interno durante uno squat.
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Riga 1.

### Color-Coding Neuromuscolare Dinamico (Fasce Muscolari Colorate)
- **Spiegazione Semplificata:** Colorazione cromatica accesa dei muscoli del corpo 3D che cambia colore e intensità in tempo reale mentre l'omino si muove, evidenziando quali muscoli stanno lavorando e con quale ruolo.
- **Ruolo Operativo nel Progetto T7:**
  - *Rosso acceso (Agonista Primario):* Il muscolo motore principale che solleva il carico (es. Gran Pettorale nella panca piana o Quadricipite nello squat).
  - *Arancione (Sinergista Secondario):* I muscoli che assistono il movimento (es. Deltoide anteriore e Tricipite).
  - *Giallo / Verde (Stabilizzatore / Core):* I muscoli posturali che mantengono stabile il corpo durante lo sforzo (es. Addominali, Erettori spinali, Glutei).
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Riga 1, 2 e 3.

### Fasi Biomeccaniche: Concentrica vs Eccentrica & TUT (Time Under Tension)
- **Spiegazione Semplificata:** La fase concentrica è quando il muscolo si accorcia sollevando il peso (es. spinta verso l'alto nello squat); la fase eccentrica è quando il muscolo resiste alla gravità allungandosi (es. discesa controllata). Il TUT è il tempo totale (in secondi) in cui il muscolo resta sotto tensione durante ogni ripetizione (es. 3 secondi a scendere, 1 secondo a salire).
- **Ruolo Operativo nel Progetto T7:** L'avatar 3D scandisce visivamente e con feedback sonoro il tempo di discesa e salita raccomandato, insegnando all'utente la cadenza esatta per massimizzare la crescita muscolare o prevenire strappi tendinei.
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Riga 1.

### Cues Propriocettivi Verbali & Criteri Oggettivi di Validità
- **Spiegazione Semplificata:** I "cues" sono brevi frasi di istruzione mentale che aiutano a posizionare il corpo in modo corretto (es. "spingi il pavimento via coi piedi", "petto in fuori", "gomiti a freccia non aperti a T"). I criteri di validità sono le regole per considerare una ripetizione valida (es. "la coscia deve scendere parallela al pavimento").
- **Ruolo Operativo nel Progetto T7:** Fornisce indicazioni pedagogiche chiare sia visive che testuali per ciascun esercizio, visualizzando in rosso i punti critici dove si commettono tipicamente errori pericolosi.
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Riga 1.

---

## Categoria 7: Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)

### Limitatore Goniometrico di ROM Touch (Range of Motion Lock)
- **Spiegazione Semplificata:** Uno strumento visivo interattivo sull'avatar 3D che consente al fisioterapista o al preparatore di bloccare l'escursione consentita a un'articolazione (es. "blocca il ginocchio a massimo 60 gradi di flessione").
- **Ruolo Operativo nel Progetto T7:** Quando il paziente apre la scheda a casa, l'avatar 3D non mostra l'esercizio completo, ma si ferma esattamente all'angolo prescritto dal medico/fisioterapista, proteggendo legamenti appena operati o zone infiammate da sovraccarichi impropri.
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Riga 2 (P.IVA Fisio/Coach).

### Confronto Video Side-by-Side (Clip Atleta vs Avatar 3D)
- **Spiegazione Semplificata:** Schermata divisa in due parti: a sinistra viene riprodotto il video registrato con lo smartphone dall'atleta mentre si allena; a destra viene riprodotto l'omino 3D perfetto che esegue lo stesso identico movimento sincronizzato.
- **Ruolo Operativo nel Progetto T7:** Permette al coach o al chinesiologo di sovrapporre le due immagini per evidenziare visivamente all'atleta le differenze di traiettoria, postura e velocità, con strumenti goniometrici di disegno a video.
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Riga 2.

---

## Categoria 8: Telemetria Pro, Performance Tracking & Carico Rosa (Tier 3)

### Digital Twin Biomeccanico dell'Atleta
- **Spiegazione Semplificata:** Una replica digitale tridimensionale esatta dell'atleta reale, personalizzata sulle sue specifiche misure corporee (lunghezza di femore, tibia, tronco, braccia) e sul suo storico di infortuni e carichi.
- **Ruolo Operativo nel Progetto T7:** Simula le forze di taglio, i momenti torcenti sulle ginocchia e i carichi vertebrali specifici per quel singolo giocatore durante ogni esercizio, permettendo allo staff di Serie A o squadre professionistiche di prevenire infortuni prima ancora che si manifestino sul campo.
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Riga 3 (Elite Pro Teams).

### Markerless Motion Capture (Computer Vision AI da Campo)
- **Spiegazione Semplificata:** Tecnologia di intelligenza artificiale che estrae la postura e gli angoli articolari dell'atleta analizzando normali video registrati con smartphone o telecamere da campo, senza bisogno che il giocatore indossi tute speciali con palline riflettenti o sensori invasivi.
- **Ruolo Operativo nel Progetto T7:** Rileva automaticamente e in tempo reale deviazioni posturali (es. valgismo del ginocchio, asimmetria di spinta) durante allenamenti e partite, inviando i dati cinematici al Digital Twin.
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Riga 3 e Motore Video Analysis.

### ACWR (Acute:Chronic Workload Ratio)
- **Spiegazione Semplificata:** Il rapporto matematico tra il carico di lavoro svolto nell'ultima settimana (carico acuto, ovvero quanto sei stanco oggi) e la media del carico svolto nelle ultime 4 settimane (carico cronico, ovvero quanto sei allenato):
  $$\text{ACWR} = \frac{\text{Carico Acuto (ultimi 7 giorni)}}{\text{Carico Cronico (ultimi 28 giorni)}}$$
- **Ruolo Operativo nel Progetto T7:** Quando il rapporto supera la soglia di pericolo (generalmente $> 1.5$, la cosiddetta "zona a rischio infortuni"), il sistema avverte istantaneamente lo staff medico e riduce automaticamente volume e intensità nel catalogo esercizi del giocatore per evitare lesioni muscolari da sovraccarico.
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Riga 3 & Motore Periodizzazione.

### Return To Play (RTP) a 6 Fasi Congiunto
- **Spiegazione Semplificata:** Protocollo multidisciplinare standardizzato diviso in 6 livelli consecutivi (da riabilitazione passiva in clinica, a corsa rettilinea, cambi di direzione, allenamento parziale col gruppo, fino al match ufficiale). Nessuna fase può essere superata senza la doppia firma digitale congiunta del Medico Sociale e del Responsabile Preparazione Fisica (Head S&C).
- **Ruolo Operativo nel Progetto T7:** Sblocca gli esercizi del catalogo per il giocatore infortunato in modo progressivo e controllato, eliminando discussioni soggettive e azzerando le ricadute premature.
- **Zona di Riferimento:** Colonna 2 (Catalogo Esercizi 3D), Riga 3.

---

## Categoria 9: Sicurezza Enterprise & Identità Societaria (Tier 3)

### KYB (Know Your Business) & UBO (Ultimate Beneficial Owner)
- **Spiegazione Semplificata:** Processo di rigorosa verifica dell'identità aziendale di una società sportiva professionistica. Oltre ai dati fiscali, identifica i legali rappresentanti e il "Titolare Effettivo" (UBO), cioè le persone fisiche che controllano o possiedono effettivamente la società sportiva.
- **Ruolo Operativo nel Progetto T7:** Previene tentativi di truffa, frode societaria, spoofing o riciclaggio, garantendo che solo i dirigenti con effettivi poteri di firma depositati alla Camera di Commercio (REA/Visura) possano vincolare contrattualmente un club a T7 e accedere ai dati sanitari dei tesserati.
- **Zona di Riferimento:** Riga 3, Colonna 1 (Onboarding Pro Teams).

### mTLS (Mutual Transport Layer Security) & Chiavi Hardware FIDO2
- **Spiegazione Semplificata:** mTLS è una crittografia avanzata in cui sia il server che il dispositivo client si autenticano a vicenda tramite certificati digitali crittografici (doppia serratura). Le chiavi hardware FIDO2 (es. YubiKey USB/NFC) sono chiavette fisiche che l'utente deve toccare per autorizzare l'accesso, rendendo impossibile il furto di password anche in caso di hackeraggio del computer.
- **Ruolo Operativo nel Progetto T7:** Protegge il Silo 2 (Club Bunkers) delle squadre professionistiche: nessun computer o tablet dello staff può collegarsi al database societario se non è in possesso del certificato di squadra mTLS e della chiavetta hardware autorizzata.
- **Zona di Riferimento:** Riga 3, Colonna 1 (Onboarding Pro Teams Security Gate).

### Consenso Esplicito Biometrico Art. 9 GDPR
- **Spiegazione Semplificata:** L'articolo 9 del Regolamento Europeo sulla Privacy (GDPR) proibisce il trattamento di dati particolari (come parametri biometrici, genetici e sanitari) a meno che non ci sia un consenso esplicito, informato e separato firmato con firma digitale qualificata.
- **Ruolo Operativo nel Progetto T7:** Assicura che prima di archiviare dati di frequenza cardiaca, test VBT, carichi di forza o video biomeccanici di atleti professionisti, ogni giocatore firmi digitalmente l'informativa speciale, segregando i dati sanitari in partizioni criptate e isolate.
- **Zona di Riferimento:** Riga 3, Colonna 1 (Onboarding Pro Teams Compliance Gate).

---

## Categoria 10: Principi Architetturali di Prodotto

### Ereditarietà Funzionale a Cascata Top-Down (Tier 1 $\rightarrow$ Tier 2 $\rightarrow$ Tier 3)
- **Spiegazione Semplificata:** Regola secondo cui i pacchetti di livello superiore contengono sempre e al 100% tutte le funzionalità di base dei pacchetti inferiori, arricchendole con strumenti professionali aggiuntivi.
  - *Tier 1 (Casual B2C):* Riceve l'esperienza base pulita (Catalogo Esercizi 3D, rotazione 360°, evidenziazione muscoli, cues essenziali).
  - *Tier 2 (P.IVA B2B):* Riceve tutto il Tier 1 + strumenti per professionisti (limitatore ROM touch, confronto video side-by-side, prescrizione schede pazienti).
  - *Tier 3 (Pro Teams B2B):* Riceve tutto il Tier 1 + tutto il Tier 2 + strumenti enterprise (Digital Twin su misura, telemetria di squadra, ACWR, mTLS, bunker criptati).
- **Ruolo Operativo nel Progetto T7:** Ogni modifica o miglioramento introdotto per l'utente casual viene automaticamente ereditato e mantenuto anche per fisioterapisti, coach e club professionistici, mentre le funzioni complesse e costose restano inaccessibili al piano base.
- **Zona di Riferimento:** Regola Architetturale 08 & 10, applicata a tutte le colonne dei Flowchart.

### Routing Ortogonale & Standard Zero-Crossing (Design Diagrammi ISO)
- **Spiegazione Semplificata:** Regola grafica che impone alle linee di collegamento nei diagrammi di muoversi esclusivamente ad angolo retto (orizzontale o verticale) lungo canali dedicati, vietando tassativamente alle frecce di sovrapporsi ai testi o di attraversare diagonalmente i riquadri.
- **Ruolo Operativo nel Progetto T7:** Garantisce leggibilità immediata e pulizia visiva assoluta sulle board Miro per chiunque debba implementare o consultare i flussi, eliminando la confusione visiva ed evitando fraintendimenti architetturali.
- **Zona di Riferimento:** Regola 10 (Design ISO, Routing Ortogonale & Zero Crossing).
