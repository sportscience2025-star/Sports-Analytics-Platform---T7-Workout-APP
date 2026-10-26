# -*- coding: utf-8 -*-
"""
Script per la generazione enciclopedica di 00-GLOSSARIO-TERMINI-TECNICI.md
Contiene:
- Indice Analitico A-Z Cliccabile
- Matrice di Tracciabilita Incrociata (Termine <-> Flussi #01..#18)
- 90 Schede Terminologiche complete con ELI5 (<= 10 parole), Spiegazione Semplificata, Ruolo Operativo T7 e Zona di Riferimento.
"""
import re
import os

GLOSSARY_PATH = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "00-GLOSSARIO-TERMINI-TECNICI.md")

TERMS = [
    {
        "name": "3 Silos Database (Multi-Tenant Data Isolation)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Tre cassaforti separate per utenti normali, club professionistici e università.",
        "spiegazione": "Un'architettura a compartimenti stagni in cui i dati vengono segregati in 3 ambienti fisicamente o logicamente isolati, con regole di sicurezza e crittografia differenziate.",
        "ruolo": "- *Silo 1 (Public, Social & Movely):* Gestisce i profili amatoriali e il marketplace professionisti.\n- *Silo 2 (Encrypted Club Bunkers):* Partizioni criptate con chiavi Cloud KMS dedicate per ciascuna societa professionistica di Tier 3 (nessun club puo accedere ai dati di altri club).\n- *Silo 3 (De-identified Research Warehouse):* Dati biomeccanici anonimizzati per studi scientifici universitari.",
        "zona": "Zona 2 (Architettura C4), Zona 5 (Database ERD), Corsia 4 in tutti i Flowchart.",
        "flows": ["#01", "#02", "#03", "#04", "#05", "#06", "#07", "#08", "#09", "#10", "#11", "#12", "#13", "#14", "#15", "#16", "#17", "#18"]
    },
    {
        "name": "32 Protocolli Riabilitativi Clinici (cli_01..cli_32)",
        "cat": "Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)",
        "eli5": "Schede riabilitative ufficiali per curare le lesioni passo dopo passo.",
        "spiegazione": "Insieme codificato di 32 percorsi terapeutici basati su linee guida ortopediche e fisiatriche internazionali per la gestione delle patologie muscolo-scheletriche piu diffuse.",
        "ruolo": "Fornisce ai fisioterapisti (Tier 2/3) schemi di riabilitazione standardizzati con progressione controllata di carichi, angoli articolari protetti e indicatori di sicurezza.",
        "zona": "Colonna 6, Riga 2 (Physio Rehab ROM) e Corsia 3 Server.",
        "flows": ["#12"]
    },
    {
        "name": "ACWR (Acute:Chronic Workload Ratio)",
        "cat": "Telemetria Pro, Performance Tracking & Carico Rosa (Tier 3)",
        "eli5": "Confronta la fatica settimanale con l'allenamento dell'ultimo mese.",
        "spiegazione": "Il rapporto matematico tra il carico di lavoro svolto nell'ultima settimana (carico acuto) e la media del carico svolto nelle ultime 4 settimane (carico cronico): ACWR = Carico Acuto / Carico Cronico.",
        "ruolo": "Quando il rapporto supera la soglia critica (> 1.5), segnala un picco di fatica a rischio infortunio, innescando allarmi medici e rimodulazione dei carichi.",
        "zona": "Colonna 2, Riga 3 e Motore Periodizzazione Microciclo.",
        "flows": ["#08", "#14", "#15"]
    },
    {
        "name": "ACWR EWMA (Exponentially Weighted Moving Average)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Rapporto acuto-cronico che pesa maggiormente i giorni più recenti.",
        "spiegazione": "Variante dell'indice ACWR che applica un decadimento esponenziale ai carichi passati, assegnando un peso decrescente alle sessioni piu lontane nel tempo.",
        "ruolo": "Rappresenta fedelmente la risposta fisiologica reale del corpo, evitando l'effetto a gradino delle medie mobili semplici e anticipando stati di sovrallenamento.",
        "zona": "Colonna 3, Riga 3 (Microciclo MD-X) e Corsia 3 Server.",
        "flows": ["#15"]
    },
    {
        "name": "API Gateway & Feature Gating",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Dogana digitale che sblocca solo le funzioni del tuo abbonamento.",
        "spiegazione": "Punto d'accesso unico e sicuro per tutte le richieste tra app utente e microservizi cloud, integrato con filtri di autorizzazione per livello di abbonamento.",
        "ruolo": "Smista il traffico applicando il Feature Gating per i 3 Tier (Base, Pro, Elite), proteggendo i servizi interni e bloccando chiamate non autorizzate.",
        "zona": "Corsia 2 di tutti i Flowchart (Zona 4) e Topologia C4.",
        "flows": ["#01", "#07", "#13"]
    },
    {
        "name": "Apple HealthKit & Google Health Connect Pipeline",
        "cat": "Telemetria Wearable & Dispositivi Mobili",
        "eli5": "Collega smartwatch e telefoni per leggere passi, sonno e battito.",
        "spiegazione": "Framework di sincronizzazione asincrona che raccoglie in sicurezza i dati biometrici registrati da dispositivi indossabili Apple e Android.",
        "ruolo": "Alimenta il diario dell'atleta con metriche passive di recupero (frequenza cardiaca a riposo, sonno profondo/REM, passi) senza richiedere inserimento manuale.",
        "zona": "Colonna 4, Riga 1 (Wearable Sync) e Corsia 1 / 2.",
        "flows": ["#04"]
    },
    {
        "name": "Bar Path Optical Tracking (Traiettoria Bilanciere da CV)",
        "cat": "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "eli5": "Disegna una linea per vedere se sollevi il bilanciere dritto.",
        "spiegazione": "Algoritmo di Computer Vision che individua i dischi o l'asta del bilanciere nei video e ne traccia la traiettoria millimetrica nello spazio bidimensionale.",
        "ruolo": "Permette a coach e atleti di analizzare l'efficienza meccanica dell'alzata (inclinazione, oscillazioni parassite, verticalita della spinta) per correggere la traiettoria.",
        "zona": "Colonna 2 e 5, Riga 2 (Coach Hub & Together Pro).",
        "flows": ["#08", "#11"]
    },
    {
        "name": "Baricentro di Squadra, Ampiezza & Profondità Tattica",
        "cat": "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "eli5": "Mappa dall'alto dove si muove tutta la squadra in campo.",
        "spiegazione": "Metriche geometriche spaziali calcolate sulle posizioni di tutti i calciatori in campo: coordinata media (baricentro), dispersione laterale (ampiezza) e longitudinale (profondita).",
        "ruolo": "Fornisce ai match analyst indicatori istantanei sulla compattezza del blocco squadra durante le fasi di possesso e non possesso palla.",
        "zona": "Colonna 5, Riga 3 (Tactical Vision & Voronoi CV).",
        "flows": ["#17"]
    },
    {
        "name": "BMR Mifflin-St Jeor & Harris-Benedict (Fabbisogno Metabolico)",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Calcola le calorie minime che bruci stando fermo a letto.",
        "spiegazione": "Equazioni antropometriche validate a livello clinico per stimare il metabolismo basale giornaliero in base a peso, altezza, eta e sesso biologico.",
        "ruolo": "Determina il dispendio calorico teorico di base durante l'onboarding dell'utente comune, impostando i target energetici e nutrizionali ottimali.",
        "zona": "Colonna 1, Riga 1 (Consumer Onboarding) e Corsia 3 Server.",
        "flows": ["#01"]
    },
    {
        "name": "Clickwrap Liability Waiver (Manleva Medico-Legale Digitale)",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Firma digitale dove confermi di essere sano prima di allenarti.",
        "spiegazione": "Contratto digitale a presa d'atto attiva con cui l'utente dichiara che la piattaforma fornisce supporto all'allenamento e non consulenza medica o diagnostica.",
        "ruolo": "Tutela civilmente e penalmente la piattaforma da responsabilita in caso di infortuni, archiviando timestamp UTC e hash crittografico in Silo 1.",
        "zona": "Colonna 1, Riga 1 (Onboarding Consumer B2C).",
        "flows": ["#01"]
    },
    {
        "name": "Cloud KMS (Key Management Service)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Cassaforte cloud per le chiavi che proteggono i dati.",
        "spiegazione": "Servizio hardware crittografico gestito per la creazione, rotazione e custodia sicura di chiavi simmetriche e asimmetriche a norma FIPS 140-2 Livello 3.",
        "ruolo": "Protegge le partizioni Silo 2 (Bunker Club) e Silo 3 (Cartelle Cliniche EMR): neppure gli amministratori di T7 possono decifrare i dati dei club.",
        "zona": "Zona 1 (ADR Sicurezza), Zona 2 (Silo 2) e Corsia 4 nei Flowchart.",
        "flows": ["#13", "#14", "#15", "#18"]
    },
    {
        "name": "Cloudflare Turnstile (Scudo Anti-Bot Invisibile)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Verifica che sei umano senza farti risolvere noiosi puzzle.",
        "spiegazione": "Soluzione avanzata di convalida delle sessioni web e mobile che distingue il traffico umano dai bot automatici senza mostrare captcha visivi.",
        "ruolo": "Blocca scraping massivo, registrazioni automatizzate e attacchi di credential stuffing sui form di registrazione e login.",
        "zona": "Colonna 1, Riga 1 e 2 (Corsia 2 API Gateway).",
        "flows": ["#01", "#07"]
    },
    {
        "name": "CMJ (Countermovement Jump) & Abalakov Jump",
        "cat": "Biomeccanica & Valutazione Funzionale",
        "eli5": "Salto verticale per misurare quanto sono esplosive le tue gambe.",
        "spiegazione": "Test cinematici standardizzati di salto verticale su pedana di forza o telecamera: CMJ con mani ai fianchi per isolare gli arti inferiori, Abalakov con oscillazione braccia.",
        "ruolo": "Valuta l'efficienza del ciclo allungamento-accorciamento (SSC) e monitora l'affaticamento neuromuscolare nel corso della stagione agonistica.",
        "zona": "Colonna 4, Riga 2 (VBT & PAP Biomechanics).",
        "flows": ["#10"]
    },
    {
        "name": "Color-Coding Neuromuscolare Dinamico (Fasce Muscolari Colorate)",
        "cat": "Grafica 3D, WebGL & Rendering Biomeccanico",
        "eli5": "Colora i muscoli dell'avatar in base a quanto lavorano.",
        "spiegazione": "Colorazione cromatica ad alto contrasto dei distretti anatomici dell'avatar 3D che varia in tempo reale in base al grado di attivazione e al ruolo meccanico.",
        "ruolo": "Evidenzia all'atleta i muscoli agonisti primari (rosso), sinergisti secondari (arancione) e stabilizzatori/core (giallo/verde) durante ogni fase dell'esercizio.",
        "zona": "Colonna 2, Righe 1, 2 e 3 (Catalogo 3D).",
        "flows": ["#02", "#08", "#14"]
    },
    {
        "name": "Confronto Video Side-by-Side (Clip Atleta vs Avatar 3D)",
        "cat": "Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)",
        "eli5": "Confronta il tuo video col modello 3D per correggerti.",
        "spiegazione": "Interfaccia sdoppiata che sincronizza il filmato reale registrato dallo smartphone dell'atleta con l'animazione tridimensionale ideale del catalogo biomeccanico.",
        "ruolo": "Consente a coach e fisioterapisti di evidenziare visivamente compensi posturali, asimmetrie ed errori tecnici mediante strumenti di disegno goniometrico a schermo.",
        "zona": "Colonna 2 e 6, Riga 2 (Coach Hub & Physio Rehab).",
        "flows": ["#08", "#12"]
    },
    {
        "name": "Consenso Esplicito Biometrico Art. 9 GDPR",
        "cat": "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "eli5": "Permesso indispensabile per raccogliere dati medici e del corpo.",
        "spiegazione": "Consenso informato granulare e qualificato, richiesto dall'Art. 9 del Regolamento UE 2016/679 per il trattamento di categorie particolari di dati (salute e biometria).",
        "ruolo": "Autorizza la raccolta di telemetria cardiaca, test VBT, GPS e cartelle cliniche societarie in bunker criptati, con possibilita di revoca immediata.",
        "zona": "Colonna 1 e 6, Riga 3 (Bunker Onboarding & Medical Room).",
        "flows": ["#13", "#18"]
    },
    {
        "name": "Cues Propriocettivi Verbali & Criteri Oggettivi di Validità",
        "cat": "Grafica 3D, WebGL & Rendering Biomeccanico",
        "eli5": "Consigli vocali automatici per correggere la postura durante l'esercizio.",
        "spiegazione": "Istruzioni attentive sintetiche focalizzate sul corpo o sull'ambiente circostante, abbinate a soglie geometriche per decretare la validita di una ripetizione.",
        "ruolo": "Insegna la corretta tecnica esecutiva nell'avatar 3D e previene compensi scorretti, evidenziando in rosso i punti critici di errore.",
        "zona": "Colonna 2, Riga 1 e 2.",
        "flows": ["#02", "#08"]
    },
    {
        "name": "Diagrammi di Voronoi & Spazio di Controllo Pitch",
        "cat": "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "eli5": "Colora il campo per mostrare quale squadra controlla ogni zona.",
        "spiegazione": "Tassellatura bidimensionale del terreno di gioco che assegna a ciascun giocatore l'area di campo piu vicina a lui rispetto a qualsiasi altro compagno o avversario.",
        "ruolo": "Calcola in tempo reale le superfici di influenza territoriale e gli spazi liberi attaccabili durante le azioni di gioco riprese da telecamere tattiche.",
        "zona": "Colonna 5, Riga 3 (Tactical Vision CV).",
        "flows": ["#17"]
    },
    {
        "name": "Digital Twin Biomeccanico dell'Atleta",
        "cat": "Telemetria Pro, Performance Tracking & Carico Rosa (Tier 3)",
        "eli5": "Copia virtuale 3D dell'atleta che simula movimenti e fatiche.",
        "spiegazione": "Modello computazionale tridimensionale parametrizzato sulle caratteristiche antropometriche e storiche di un singolo atleta d'elite.",
        "ruolo": "Simula sollecitazioni articolari, forze di taglio sul ginocchio e carichi muscolari per anticipare il rischio lesivo e personalizzare il microciclo.",
        "zona": "Colonna 2, Riga 3 (Multi-Staff Cockpit).",
        "flows": ["#14"]
    },
    {
        "name": "DOP / HDOP (Dilution of Precision Satellite Filtering)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Filtra i dati GPS imprecisi quando i satelliti prendono male.",
        "spiegazione": "Indice geometrico della disposizione della costellazione satellitare visibile; valori elevati indicano bassa accuratezza posizionale.",
        "ruolo": "Ripulisce la telemetria GPS dai picchi di velocita fittizi causati dall'effetto canyoning delle tribune degli stadi o condizioni meteo avverse.",
        "zona": "Colonna 4, Riga 3 (GPS Adaptive Z-Score).",
        "flows": ["#16"]
    },
    {
        "name": "Draco Geometry Compression & Progressive LOD",
        "cat": "Grafica 3D, WebGL & Rendering Biomeccanico",
        "eli5": "Rimpicciolisce i file 3D per caricarli velocemente sullo smartphone.",
        "spiegazione": "Algoritmo open source di quantizzazione geometrica delle mesh tridimensionali unito all'adattamento dinamico dei vertici renderizzati in base al framerate.",
        "ruolo": "Permette il caricamento istantaneo dell'avatar biomeccanico 3D da 1-2 MB su rete mobile, preservando 60 FPS stabili su qualsiasi terminale.",
        "zona": "Colonna 2, Riga 1 (Personal Cockpit).",
        "flows": ["#02"]
    },
    {
        "name": "Dual-Stream Toggle (Video Reale vs Avatar 3D Stilizzato)",
        "cat": "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "eli5": "Pulsante per passare dal video vero all'omino 3D stilizzato.",
        "spiegazione": "Comando di visualizzazione che alterna il video MP4 registrato con telecamera e il modello 3D generato dai punti cinematici estratti.",
        "ruolo": "Permette all'utente di passare dalla visione didattica tridimensionale priva di distrazioni al filmato reale, tutelando storage e privacy.",
        "zona": "Colonna 2, Riga 2 e 3.",
        "flows": ["#08"]
    },
    {
        "name": "DUP (Daily Undulating Periodization)",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Alterna giorni pesanti, medi e leggeri nella stessa settimana d'allenamento.",
        "spiegazione": "Modello di periodizzazione dell'allenamento che varia intensita, volume e obiettivo fisiologico ad ogni singola sessione settimanale.",
        "ruolo": "Ottimizza l'adattamento neuromuscolare ed evita stalli di prestazione, generato automaticamente dal Wizard di Programmazione Tier 2.",
        "zona": "Colonna 3, Riga 2 (Macrocicli IA & Triage 119).",
        "flows": ["#09"]
    },
    {
        "name": "Dynamic Forensic Watermarking Anti-Leak",
        "cat": "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "eli5": "Marchio invisibile nei video per scoprire chi diffonde immagini riservate.",
        "spiegazione": "Tecnologia di marcatura steganografica digitale applicata dinamicamente sui frame video con ID sessione, timestamp e ID utente.",
        "ruolo": "Protegge i video degli allenamenti e le sedute tattiche del club da fughe di notizie e leak verso i media o squadre concorrenti.",
        "zona": "Colonna 2, Riga 3 (Secret Club Vault).",
        "flows": ["#14"]
    },
    {
        "name": "Electronic Medical Record (EMR) & Segreto Medico",
        "cat": "Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)",
        "eli5": "Cartella clinica blindata visibile solo dal medico della squadra.",
        "spiegazione": "Cartella sanitaria elettronica protetta da cifratura a livello di colonna conforme a HIPAA e GDPR per l'archiviazione di referti e terapie.",
        "ruolo": "Separa i dati diagnostici dai parametri fisici sportivi: lo staff tecnico vede la disponibilita all'allenamento, ma non le patologie protette da segreto medico.",
        "zona": "Colonna 6, Riga 3 (Medical Room EMR Silo 3).",
        "flows": ["#18"]
    },
    {
        "name": "Epley 1RM Formula & Stima Sub-Massimale",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Formula che stima il tuo carico massimo senza farti rischiare.",
        "spiegazione": "Formula matematica empirica per stimare il massimale teorico (1RM): 1RM = Carico * (1 + Ripetizioni / 30).",
        "ruolo": "Calcola in tempo reale il potenziale massimale durante le serie ordinarie del Workout Player, senza costringere l'atleta a test rischiosi.",
        "zona": "Colonna 3, Riga 1 (Workout Player).",
        "flows": ["#03"]
    },
    {
        "name": "Ereditarietà Funzionale a Cascata Top-Down (Tier 1 -> Tier 2 -> Tier 3)",
        "cat": "Principi Architetturali di Prodotto",
        "eli5": "I livelli superiori includono tutte le funzioni di quelli inferiori.",
        "spiegazione": "Regola architetturale che garantisce che le funzionalita dei tier inferiori siano incluse per ereditarieta nei software di livello superiore.",
        "ruolo": "Preserva coerenza funzionale ed ergonomica su tutta la suite: Tier 2 include Tier 1; Tier 3 include Tier 1 e Tier 2 con logiche enterprise.",
        "zona": "Regola Architetturale 08 & 10 su tutta la Zona 4.",
        "flows": ["#01", "#07", "#13"]
    },
    {
        "name": "Excel Sbloccato (protected: false) & Data Interoperability",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "File Excel senza formule bloccate, liberamente modificabili dal coach.",
        "spiegazione": "File foglio di calcolo generato con celle e fogli completamente editabili e privi di password di blocco o macro proprietarie.",
        "ruolo": "Consente a preparatori e scienziati motori di esportare i dati telemetrici e le schede per rielaborarli liberamente nei propri software gestionali.",
        "zona": "Colonna 4, Riga 2 e Riga 3 (Export VBT & GPS).",
        "flows": ["#10", "#16"]
    },
    {
        "name": "Fallback per Nuovi Acquisti (Cold Start senza Baseline)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Stima provvisoria della forma per i nuovi atleti senza storico.",
        "spiegazione": "Algoritmo euristico che assegna valori di riferimento temporanei a un atleta privo dello storico delle ultime 4 settimane.",
        "ruolo": "Evita errori di divisione per zero o schermate vuote nel calcolo dello Z-Score per i nuovi tesserati, garantendo monitoraggio immediato.",
        "zona": "Colonna 4, Riga 3 (GPS Adaptive Z-Score).",
        "flows": ["#16"]
    },
    {
        "name": "Fan-Out on Write & Redis Cluster ZSET (Timeline Social)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Distribuisce i post istantaneamente senza rallentare la bacheca social.",
        "spiegazione": "Architettura di messaggistica che scrive il post pubblicato direttamente nelle code cronologiche Redis (Sorted Set) dei follower.",
        "ruolo": "Garantisce tempi di caricamento del feed inferiori a 50 millisecondi nella community Movely Together anche con milioni di utenti attivi.",
        "zona": "Colonna 5, Riga 1 (Together Social B2C).",
        "flows": ["#05"]
    },
    {
        "name": "Fasi Biomeccaniche: Concentrica vs Eccentrica & TUT (Time Under Tension)",
        "cat": "Grafica 3D, WebGL & Rendering Biomeccanico",
        "eli5": "Tempo trascorso spingendo e frenando il peso durante l'esercizio.",
        "spiegazione": "Scansione dei tempi di lavoro muscolare tra contrazione concentrica (sollevamento), eccentrica (discesa controllata) e pause isometriche.",
        "ruolo": "L'avatar 3D guida visivamente e con segnali acustici la cadenza prescritta dal preparatore, massimizzando lo stimolo ipertrofico o tendineo.",
        "zona": "Colonna 2 e 3, Riga 1 (Catalogo 3D & Workout Player).",
        "flows": ["#02", "#03"]
    },
    {
        "name": "Feature Gating Clinico & Ordine Sanitario (FNOFI / TSRM-PSTRP)",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Sblocca le funzioni riabilitative solo per fisioterapisti iscritti all'albo.",
        "spiegazione": "Controllo autorizzativo che condiziona l'accesso a funzionalita riabilitative e cartelle cliniche alla verifica dell'iscrizione all'albo professionale.",
        "ruolo": "Tutela legale contro l'esercizio abusivo della professione sanitaria, limitando i moduli diagnostico-terapeutici ai soli professionisti abilitati.",
        "zona": "Colonna 1 e 6, Riga 2 (Pro Onboarding & Physio Rehab).",
        "flows": ["#07", "#12"]
    },
    {
        "name": "FFMI (Fat-Free Mass Index) & Normalizzazione Antropometrica",
        "cat": "Biomeccanica & Valutazione Funzionale",
        "eli5": "Misura quanti muscoli hai togliendo il grasso e l'altezza.",
        "spiegazione": "Rapporto tra la massa magra e il quadrato dell'altezza: FFMI = Massa Magra (kg) / Altezza (m)^2.",
        "ruolo": "Valuta il potenziale muscolare dell'atleta e normalizza i carichi di lavoro evitando le distorsioni del semplice indice di massa corporea (BMI).",
        "zona": "Colonna 1 e 3, Riga 1 e 2.",
        "flows": ["#01", "#09"]
    },
    {
        "name": "Filtro Outlier MAD (Median Absolute Deviation)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Cancella i numeri assurdi causati da errori dei sensori.",
        "spiegazione": "Misura di dispersione statistica robusta che identifica i valori anomali basandosi sulla mediana invece che sulla media aritmetica.",
        "ruolo": "Scarta picchi spuri di battito cardiaco o ripetizioni errate nei test VBT e salti PAP senza farsi ingannare da anomalie estreme dei sensori.",
        "zona": "Colonna 4, Righe 1, 2 e 3.",
        "flows": ["#04", "#10"]
    },
    {
        "name": "glTF / GLB & Compressione Google Draco Mesh",
        "cat": "Grafica 3D, WebGL & Rendering Biomeccanico",
        "eli5": "Formato leggero per far girare modelli 3D su smartphone.",
        "spiegazione": "Formato standard di trasmissione di modelli tridimensionali ottimizzato per il web, con compressione lossy/lossless delle geometrie dei vertici.",
        "ruolo": "Consente all'app mobile di scaricare i modelli anatomici 3D con consumo dati minimo e avvio immediato delle animazioni biomeccaniche.",
        "zona": "Colonna 2, Riga 1 (Personal Cockpit).",
        "flows": ["#02"]
    },
    {
        "name": "Goniometro Digitale AI (Markerless Joint Angle Extraction)",
        "cat": "Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)",
        "eli5": "Misura quanto pieghi ginocchia e spalle usando solo la fotocamera.",
        "spiegazione": "Algoritmo di visione artificiale che misura in tempo reale l'angolo tra segmenti corporei estraendo le coordinate 3D delle articolazioni da flussi video.",
        "ruolo": "Permette a fisioterapisti e chinesiologi di quantificare con precisione clinica l'ampiezza di movimento (ROM) e monitorare il recupero post-chirurgico.",
        "zona": "Colonna 6, Riga 2 (Physio Rehab ROM).",
        "flows": ["#12"]
    },
    {
        "name": "Graceful Degradation & WebGL Performance Fallback",
        "cat": "Grafica 3D, WebGL & Rendering Biomeccanico",
        "eli5": "Semplifica la grafica 3D quando lo smartphone è sotto sforzo.",
        "spiegazione": "Strategia software che riduce automaticamente qualita grafica, ombre e dettagli di rendering se il framerate scende sotto i 30 FPS.",
        "ruolo": "Assicura che l'applicazione rimanga reattiva ed utilizzabile anche su dispositivi datati o con accelerazione grafica limitata.",
        "zona": "Colonna 2, Riga 1 (Thin Client WebGL).",
        "flows": ["#02"]
    },
    {
        "name": "Heart Rate Variability (HRV) & rMSSD Recovery Score",
        "cat": "Telemetria Wearable & Dispositivi Mobili",
        "eli5": "Misura il recupero fisico analizzando le variazioni del battito cardiaco.",
        "spiegazione": "Variazione temporale millimetrica tra battiti cardiaci consecutivi (intervalli R-R); l'indice rMSSD quantifica l'attivita del sistema nervoso parasimpatico.",
        "ruolo": "Fornisce la misura oggettiva del recupero da stress fisico ed emotivo, regolando i volumi di allenamento della seduta odierna.",
        "zona": "Colonna 4, Riga 1 e Riga 3 (Wearable & GPS).",
        "flows": ["#04", "#16"]
    },
    {
        "name": "HRV Fusion (Integrazione Carico Interno/Esterno)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Combina i chilometri corsi con la fatica cardiaca registrata.",
        "spiegazione": "Modello algoritmico che combina i dati cinematici esterni (distanze sprint e accelerazioni GPS) con la risposta fisiologica interna (HRV ed FC).",
        "ruolo": "Permette allo staff tecnico di individuare atleti a parita di chilometri percorsi che stanno sopportando un costo biologico troppo alto.",
        "zona": "Colonna 4, Riga 3 (GPS Adaptive Z-Score).",
        "flows": ["#16"]
    },
    {
        "name": "IndexedDB & Optimistic Transaction Queue",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Salva l'allenamento offline e lo invia appena torna internet.",
        "spiegazione": "Database transazionale client-side nel browser abbinato a una coda di mutazioni ottimistiche sincronizzate in background con backoff esponenziale.",
        "ruolo": "Permette all'atleta di registrare ripetizioni e carichi anche in palestre interrate prive di connessione, sincronizzando i dati al ritorno online.",
        "zona": "Colonna 3, Riga 1 (Workout Player Thin Client).",
        "flows": ["#03"]
    },
    {
        "name": "INI-PEC (Indice Nazionale Posta Elettronica Certificata) & Two-Way OTP",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Codice inviato via PEC per blindare la Partita IVA.",
        "spiegazione": "Registro pubblico delle caselle PEC di professionisti e aziende italiane, interrogato per verificare la reale titolarita di una Partita IVA tramite codice OTP.",
        "ruolo": "Blocca all'origine frodi e tentativi di registrazione di account professionali con Partite IVA altrui nell'onboarding Tier 2.",
        "zona": "Colonna 1, Riga 2 (Setup Fiscale P.IVA).",
        "flows": ["#07"]
    },
    {
        "name": "K-Anonymity & Zero-Knowledge Privacy Shield",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Protegge la tua identità mescolando i dati nel gruppo.",
        "spiegazione": "Principio matematico di de-identificazione dei dati in cui le informazioni di un individuo non sono distinguibili da almeno k-1 altri soggetti nel dataset.",
        "ruolo": "Protegge la privacy dei dipendenti nei report ergonomici aziendali e i dati clinici dei pazienti trasferiti nel Research Warehouse Silo 3.",
        "zona": "Colonna 6, Riga 1 e Riga 3 (Desk-Care & Research Silo 3).",
        "flows": ["#06", "#18"]
    },
    {
        "name": "KYB (Know Your Business) & UBO (Ultimate Beneficial Owner)",
        "cat": "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "eli5": "Verifica che identifica titolari e dirigenti della società sportiva.",
        "spiegazione": "Procedura di conformita normativa antiriciclaggio che accerta l'identita legale dei rappresentanti e del titolare effettivo di un club professionistico.",
        "ruolo": "Assicura che solo figure munite di effettivi poteri di rappresentanza aziendale possano attivare partizioni societarie Silo 2 e firmare contratti.",
        "zona": "Colonna 1, Riga 3 (Enterprise Bunker Onboarding).",
        "flows": ["#13"]
    },
    {
        "name": "Libreria Esercizi a Due Livelli di Club (Bozza Atleta vs Ufficiale Societaria)",
        "cat": "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "eli5": "Cartella per testare un esercizio prima di approvarlo ufficialmente.",
        "spiegazione": "Architettura di persistenza che isola le varianti custom create per un singolo tesserato dalla libreria ufficiale validata dallo staff.",
        "ruolo": "Consente a medici e preparatori di sperimentare protocolli specifici per un atleta infortunato prima di promuoverli a standard di squadra.",
        "zona": "Colonna 2, Riga 3 (Multi-Staff Cockpit).",
        "flows": ["#14"]
    },
    {
        "name": "Limitatore Goniometrico di ROM Touch (Range of Motion Lock)",
        "cat": "Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)",
        "eli5": "Blocco virtuale che impedisce di piegare troppo l'articolazione lesa.",
        "spiegazione": "Comando visivo interattivo sull'avatar 3D che consente al clinico di fissare il range escursionale massimo consentito a un'articolazione.",
        "ruolo": "Protegge tessuti biologici in via di guarigione o neo-legamenti chirurgici, bloccando visivamente l'animazione all'angolo limite impostato.",
        "zona": "Colonna 2 e 6, Riga 2.",
        "flows": ["#12"]
    },
    {
        "name": "Markerless Motion Capture (Computer Vision AI da Campo)",
        "cat": "Telemetria Pro, Performance Tracking & Carico Rosa (Tier 3)",
        "eli5": "Calcola gli angoli del corpo senza applicare sensori addosso.",
        "spiegazione": "Tecnologia di stima della posa umana basata su reti neurali convoluzionali che ricostruisce scheletri cinematici 3D da normali video RGB.",
        "ruolo": "Estrae metriche biomeccaniche su gesti tecnici e atletici durante allenamenti e gare senza applicare marker invasivi sugli atleti.",
        "zona": "Colonna 2 e 5, Riga 2 e Riga 3.",
        "flows": ["#08", "#14", "#17"]
    },
    {
        "name": "Mean Propulsive Velocity (MPV) vs Peak Velocity",
        "cat": "Biomeccanica & Valutazione Funzionale",
        "eli5": "Velocità reale con cui spingi il bilanciere escludendo decelerazioni.",
        "spiegazione": "L'MPV misura la velocita media della sola porzione concentrica in cui l'accelerazione del bilanciere e maggiore o uguale all'accelerazione di gravita (-9.81 m/s^2).",
        "ruolo": "Esclude la fase di decelerazione passiva tipica dei pesi submassimali, fornendo la metrica piu affidabile e scientifica per stimare l'1RM nel VBT.",
        "zona": "Colonna 4, Riga 2 (VBT & PAP Biomechanics).",
        "flows": ["#10"]
    },
    {
        "name": "MediaPipe BlazePose 3D (Edge Pose Estimation su Video Mobile)",
        "cat": "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "eli5": "Calcola i punti del corpo direttamente sullo smartphone del coach.",
        "spiegazione": "Modello di machine learning leggero sviluppato da Google per l'inferenza in tempo reale sul dispositivo di 33 landmark anatomici 3D.",
        "ruolo": "Esegue il tracciamento del corpo sul telefono del professionista, riducendo la latenza a zero ed evitando l'upload di video pesanti sul cloud.",
        "zona": "Colonna 2, Riga 2 e 3 (Coach Hub).",
        "flows": ["#08"]
    },
    {
        "name": "Microciclo MD-X & Modello Titolari vs Panchinari",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Programmazione settimanale scandita a ritroso dal giorno della partita.",
        "spiegazione": "Struttura di periodizzazione calcistica che pianifica i carichi giornalieri in base ai giorni che mancano alla partita (MD-4, MD-3, ecc.) o che la seguono (MD+1).",
        "ruolo": "Distingue automaticamente i volumi tra i titolari che necessitano di recupero e i panchinari che devono compensare il mancato carico gara.",
        "zona": "Colonna 3, Riga 3 (Team Microcycle MD-X).",
        "flows": ["#15"]
    },
    {
        "name": "Minimal Detectable Change (MDC 95%) & Cohen's d",
        "cat": "Biomeccanica & Valutazione Funzionale",
        "eli5": "Certifica se il miglioramento è reale o dovuto al caso.",
        "spiegazione": "L'MDC calcola la variazione minima reale necessaria per superare l'errore di misura dello strumento con confidenza al 95%; il d di Cohen misura l'ampiezza dell'effetto pratico.",
        "ruolo": "Certifica scientificamente al coach se il potenziamento post-attivazione (PAP) o l'aumento di salto CMJ e un reale progresso biologico.",
        "zona": "Colonna 4, Riga 2 (VBT & PAP).",
        "flows": ["#10"]
    },
    {
        "name": "Movely Corporate Wellness & Ergonomic Engine",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Consiglia micro-pause attive per proteggere la postura da ufficio.",
        "spiegazione": "Modulo per la prevenzione dei disturbi muscolo-scheletrici da lavoro sedentario che notifica routine di mobilità articolare e stretching.",
        "ruolo": "Monitora i tempi di inattivita alla scrivania e propone esercizi a basso impatto senza richiedere abbigliamento sportivo, tutelando la privacy dei lavoratori.",
        "zona": "Colonna 6, Riga 1 (Movely Desk-Care).",
        "flows": ["#06"]
    },
    {
        "name": "mTLS (Mutual Transport Layer Security) & Chiavi Hardware FIDO2",
        "cat": "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "eli5": "Doppia chiave e chiavetta fisica per blindare l'accesso societario.",
        "spiegazione": "Autenticazione bidirezionale crittografica tra client e server integrata con token fisici a tocco per prevenire intercettazioni man-in-the-middle.",
        "ruolo": "Garantisce che solo i dispositivi registrati e certificati dallo staff societario possano connettersi al Bunker Silo 2 del club.",
        "zona": "Colonna 1, Riga 3 (Bunker Onboarding Security Gate).",
        "flows": ["#13"]
    },
    {
        "name": "Multi-Camera 4K Sync & Secret Club Vault",
        "cat": "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "eli5": "Caveau che sincronizza video multi-angolari per lo staff societario.",
        "spiegazione": "Infrastruttura di storage cloud criptata a tenuta stagna che sincronizza i flussi video ad altissima risoluzione registrati da telecamere simultanee.",
        "ruolo": "Consente a staff medico e match analyst di vivisezionare infortuni o gesti atletici da angolazioni multiple perfettamente sincronizzate al frame.",
        "zona": "Colonna 2, Riga 3 (Multi-Staff Cockpit).",
        "flows": ["#14"]
    },
    {
        "name": "MVT (Minimum Velocity Threshold)",
        "cat": "Biomeccanica & Valutazione Funzionale",
        "eli5": "La velocità minima sotto cui il bilanciere non sale.",
        "spiegazione": "Velocita media concentrica limite al di sotto della quale l'atleta non riesce a completare l'alzata prima del cedimento neuromuscolare.",
        "ruolo": "Punto di ancoraggio terminale della retta di regressione carico-velocita per calcolare l'1RM teorico giornaliero con precisione millimetrica.",
        "zona": "Colonna 4, Riga 2 (VBT Biomechanics).",
        "flows": ["#10"]
    },
    {
        "name": "OrbitControls (Yaw 360° e Pitch Zenitale/Nadir)",
        "cat": "Grafica 3D, WebGL & Rendering Biomeccanico",
        "eli5": "Ruota la visuale con le dita per ogni angolazione.",
        "spiegazione": "Controllore di telecamera interattivo WebGL che consente di ruotare su asse azimutale (Yaw 360°) e polare (Pitch) con zoom progressivo.",
        "ruolo": "Permette all'utente di esaminare l'esecuzione dell'omino 3D da qualunque prospettiva (zenitale, laterale o dal basso) per capire la cinematica.",
        "zona": "Colonna 2, Riga 1, 2 e 3.",
        "flows": ["#02"]
    },
    {
        "name": "Osgnach Metabolic Power (W/kg) & High Metabolic Load Distance",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Energia spesa nelle accelerazioni anche a bassa velocità lineare.",
        "spiegazione": "Modello bioenergetico di Pietro Enrico di Prampero e Cristian Osgnach che equipara la corsa accelerata in piano alla corsa a velocita costante in salita.",
        "ruolo": "Misura il reale dispendio energetico nel calcio durante accelerazioni e decelerazioni brusche, invisibili al semplice computo dei chilometri percorsi.",
        "zona": "Colonna 4, Riga 3 (GPS Adaptive Z-Score).",
        "flows": ["#16"]
    },
    {
        "name": "PAP (Post-Activation Potentiation)",
        "cat": "Biomeccanica & Valutazione Funzionale",
        "eli5": "Sollevare un carico pesante per saltare più in alto.",
        "spiegazione": "Fenomeno di facilitazione neuromuscolare in cui una contrazione massimale aumenta la forza e la rapidita dei movimenti successivi.",
        "ruolo": "Modulo di calcolo per identificare la finestra temporale ideale (tipicamente 4-8 minuti) tra serie pesanti di riscaldamento e salti o sprint ottimali.",
        "zona": "Colonna 4, Riga 2 (VBT & PAP).",
        "flows": ["#10"]
    },
    {
        "name": "PAR-Q+ (Physical Activity Readiness Questionnaire) & Digital Triage",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Questionario rapido che intercetta rischi medici prima dell'allenamento.",
        "spiegazione": "Questionario di autovalutazione dello stato di salute strutturato su 7 quesiti clinici per identificare controindicazioni all'attivita fisica.",
        "ruolo": "Intercetta sintomi cardiorespiratori o dolori articolari all'onboarding: in caso di esito positivo attiva la modalita cautelativa e disabilita esercizi pesanti.",
        "zona": "Colonna 1, Riga 1 (Consumer Onboarding).",
        "flows": ["#01"]
    },
    {
        "name": "Periodizzazione a Blocchi & Coniugata",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Schemi avanzati che alternano volume, forza massima ed esplosività.",
        "spiegazione": "Modelli avanzati di programmazione: la periodizzazione a blocchi concentra stimoli omogenei (Accumulo, Trasformazione, Realizzazione); la coniugata allena piu qualita simultaneamente.",
        "ruolo": "Consente a preparatori di atleti esperti di programmare il raggiungimento del picco di forma in corrispondenza delle gare principali.",
        "zona": "Colonna 3, Riga 2 (Macrocicli IA).",
        "flows": ["#09"]
    },
    {
        "name": "Progressive LOD (Level of Detail Dinamico WebGL)",
        "cat": "Grafica 3D, WebGL & Rendering Biomeccanico",
        "eli5": "Riduce i dettagli grafici per mantenere l'animazione sempre fluida.",
        "spiegazione": "Tecnica di rendering che adatta la complessita poligonale della mesh in base alla distanza di visione e alle performance hardware del dispositivo.",
        "ruolo": "Evita cali di frame rate e surriscaldamento dello smartphone, mantenendo la visualizzazione degli esercizi fluida a 60 FPS su ogni fascia di dispositivo.",
        "zona": "Colonna 2, Riga 1 e 2.",
        "flows": ["#02"]
    },
    {
        "name": "RAG Gerarchico Scientifico (Retrieval-Augmented Generation)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Motore AI che risponde attingendo solo a studi scientifici.",
        "spiegazione": "Architettura di generazione potenziata da recupero semantico su database di letteratura biomedica con pesatura gerarchica delle fonti (RCT 1.3, Coorte 1.1, Expert 1.0).",
        "ruolo": "Genera spiegazioni e programmi di allenamento rigorosamente ancorati alle evidenze scientifiche, azzerando le allucinazioni tipiche dei modelli generici.",
        "zona": "Zona 2 (Scientific RAG Engine) e Corsia 3 Server.",
        "flows": ["#08", "#09"]
    },
    {
        "name": "RBAC (Role-Based Access Control a 3 Tiers x 8 Ruoli)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Assegna permessi su misura a medici, coach e atleti.",
        "spiegazione": "Modello di sicurezza che regola l'accesso alle risorse e alle viste applicative combinando il livello di abbonamento con il ruolo organizzativo dell'utente.",
        "ruolo": "Regola i permessi degli 8 ruoli formali (Atleta, Coach, Fisioterapista, Medico, Preparatore, Match Analyst, Ricercatore, Admin) tutelando il segreto professionale.",
        "zona": "Zona 1, Riga 1, 2 e 3 (Onboarding & Access Gate).",
        "flows": ["#01", "#07", "#13"]
    },
    {
        "name": "Regressione OLS (Ordinary Least Squares) per 1RM",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Stima il massimale incrociando carichi e velocità di spinta.",
        "spiegazione": "Metodo statistico di interpolazione lineare che stima la retta carico-velocita minimizzando la somma dei quadrati delle differenze tra valori osservati e teorici.",
        "ruolo": "Calcola l'1RM teorico giornaliero estrapolando la velocita di soglia minima (MVT) dai dati delle serie di riscaldamento sub-massimali.",
        "zona": "Colonna 4, Riga 2 (VBT Biomechanics).",
        "flows": ["#10"]
    },
    {
        "name": "Return To Play (RTP)",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Percorso a tappe per rientrare in campo dopo l'infortunio.",
        "spiegazione": "Processo sequenziale basato su criteri clinico-funzionali che guida il reinserimento graduale dell'atleta infortunato fino alla piena attivita competitiva.",
        "ruolo": "Monitora indici di simmetria degli arti (LSI) e test di carico prima di autorizzare il passaggio alla fase successiva, riducendo drasticamente le ricadute.",
        "zona": "Colonna 6, Riga 2 e 3.",
        "flows": ["#12", "#18"]
    },
    {
        "name": "Return To Play (RTP) a 6 Fasi Congiunto",
        "cat": "Telemetria Pro, Performance Tracking & Carico Rosa (Tier 3)",
        "eli5": "Sei tappe con firma congiunta di medico e preparatore.",
        "spiegazione": "Protocollo riabilitativo avanzato diviso in 6 stadi inderogabili che richiede l'approvazione digitale sia del Medico Sociale che dell'Head Strength & Conditioning Coach.",
        "ruolo": "Elimina discrezionalita soggettive nelle societa di Serie A ed elite, sbloccando i carichi di squadra solo dopo il superamento oggettivo di ogni fase.",
        "zona": "Colonna 6, Riga 3 (Medical Room EMR Silo 3).",
        "flows": ["#18"]
    },
    {
        "name": "Revisione Coerente AI (Multimodal RAG & Web Biomechanical Audit)",
        "cat": "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "eli5": "AI che analizza video ed esercizi suggerendo correzioni scientifiche.",
        "spiegazione": "Pipeline di audit intelligente che analizza contemporaneamente la registrazione video dell'esercizio e le note scritte del preparatore confrontandole con la letteratura scientifica.",
        "ruolo": "Fornisce una revisione tecnica oggettiva al coach, evidenziando incongruenze anatomiche o rischi lesivi prima che l'esercizio sia salvato nel catalogo.",
        "zona": "Colonna 2, Riga 2 e 3.",
        "flows": ["#08"]
    },
    {
        "name": "Rolling Reserve & Escrow Anti-Chargeback",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Somma trattenuta a garanzia contro contestazioni o rimborsi bancari.",
        "spiegazione": "Meccanismo prudenziale di pagamento in cui una percentuale dei compensi incassati dal professionista viene trattenuta in garanzia per un intervallo prefissato.",
        "ruolo": "Protegge la piattaforma e gli utenti finali da chargeback bancari fraudolenti o inadempienze contrattuali nei servizi del marketplace Together Pro.",
        "zona": "Colonna 1 e 5, Riga 2.",
        "flows": ["#07"]
    },
    {
        "name": "Routing Ortogonale & Standard Zero-Crossing (Design Diagrammi ISO)",
        "cat": "Principi Architetturali di Prodotto",
        "eli5": "Frecce a novanta gradi senza sovrapposizioni tra i riquadri.",
        "spiegazione": "Regola grafica per la progettazione di diagrammi tecnici che impone segmenti connettori a 90 gradi instradati unicamente in corridoi dedicati.",
        "ruolo": "Azzeramento delle sovrapposizioni visive sulle board Miro e massima chiarezza comunicativa tra architetti software, clinici e programmatori.",
        "zona": "Regola 10 su tutti i 18 Flowchart (Zona 4).",
        "flows": ["#01", "#02", "#03", "#04", "#05", "#06", "#07", "#08", "#09", "#10", "#11", "#12", "#13", "#14", "#15", "#16", "#17", "#18"]
    },
    {
        "name": "SAML 2.0 Enterprise Federation & Single Sign-On",
        "cat": "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "eli5": "Accesso aziendale unificato con le credenziali ufficiali del club.",
        "spiegazione": "Protocollo di autenticazione federata basato su asserzioni XML crittografiche scambiate tra un Identity Provider aziendale e il service provider.",
        "ruolo": "Permette ai club di connettere il proprio gestionale aziendale (es. Microsoft Entra ID o Okta) per gestire le utenze di dirigenti, medici e staff in modo centralizzato.",
        "zona": "Colonna 1, Riga 3 (Bunker Onboarding KMS).",
        "flows": ["#13"]
    },
    {
        "name": "Scala VAS del Dolore (Visual Analogue Scale 0-10)",
        "cat": "Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)",
        "eli5": "Cursore da zero a dieci dove indicare il dolore.",
        "spiegazione": "Strumento di misurazione unidimensionale del dolore soggettivo rappresentato da una linea continua graduata da 0 (nessun dolore) a 10 (dolore insopportabile).",
        "ruolo": "Consente al paziente di registrare il dolore articolare durante l'esecuzione degli esercizi riabilitativi; punteggi VAS >= 4 bloccano la progressione del carico.",
        "zona": "Colonna 6, Riga 2 (Physio Rehab ROM).",
        "flows": ["#12"]
    },
    {
        "name": "Scale RPE & RIR (Borg CR10 / Reps in Reserve)",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Voto della fatica percepita e ripetizioni rimaste di riserva.",
        "spiegazione": "Metodologie di quantificazione soggettiva dello sforzo: la scala RPE (Borg CR10) misura la fatica percepita; l'indice RIR specifica il numero di ripetizioni residue prima del cedimento.",
        "ruolo": "Regola l'autoregolazione del carico nel Workout Player quando non sono presenti encoder lineari, adeguando le serie residue allo stato di forma del momento.",
        "zona": "Colonna 3, Riga 1 (Workout Player).",
        "flows": ["#03"]
    },
    {
        "name": "Secret Club Vault & Multi-Camera 4K Sync",
        "cat": "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "eli5": "Archivio criptato multi-angolare riservato allo staff della società.",
        "spiegazione": "Archivio multimediale a tenuta stagna integrato con algoritmi di sincronizzazione temporale al millisecondo per riprese multi-angolo ad alta definizione.",
        "ruolo": "Custodisce registrazioni tattiche e biomeccaniche ad accesso ristretto, impedendo diffusioni non autorizzate o perdite di materiale proprietario del club.",
        "zona": "Colonna 2, Riga 3 (Multi-Staff Cockpit).",
        "flows": ["#14"]
    },
    {
        "name": "Service Worker Offline-First & Cache Storage API",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Garantisce il pieno funzionamento dell'app anche senza connessione internet.",
        "spiegazione": "Script in background del browser che intercetta le richieste di rete servendo asset memorizzati localmente e gestendo la sincronizzazione asincrona.",
        "ruolo": "Rende la PWA pienamente operativa anche in ambienti senza segnale (palestre interrate, campi isolati), garantendo caricamento istantaneo dell'interfaccia.",
        "zona": "Colonna 3, Riga 1 (Workout Player).",
        "flows": ["#03"]
    },
    {
        "name": "Step-Up Verification (Verifica Telefono Anti-Troll per Community)",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Richiede il cellulare per bloccare profili falsi e molesti.",
        "spiegazione": "Meccanismo di sicurezza condizionale che richiede un'autenticazione a due fattori via SMS unicamente quando l'utente vuole pubblicare post o messaggiare.",
        "ruolo": "Mantiene l'iscrizione base veloce e accessibile, bloccando pero bot farm e profili fake all'interno del social network Movely Together.",
        "zona": "Colonna 1 e 5, Riga 1.",
        "flows": ["#01", "#05"]
    },
    {
        "name": "Stripe Identity & Biometric Liveness 3D",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Scansione facciale 3D contro documenti falsi o foto statiche.",
        "spiegazione": "Servizio di verifica dell'identita che combina scansione OCR di documenti ufficiali (patente, CIE) con rilevamento biometrico dinamico della vitalita facciale.",
        "ruolo": "Accerta l'autenticita dell'identita dei coach e professionisti prima di consentire l'incasso di denaro e la creazione di conti su Stripe Connect.",
        "zona": "Colonna 1, Riga 2 (Onboarding Pro).",
        "flows": ["#07"]
    },
    {
        "name": "Swimlanes (Corsie Architetturali nei Flowchart)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Corsie grafiche nei diagrammi che separano app, server e database.",
        "spiegazione": "Suddivisione a corsie parallele nei diagrammi di flusso di processo che assegna ogni azione allo specifico livello architetturale responsabile.",
        "ruolo": "Separa rigidamente Thin Client UI, API Gateway, Server Scatola Nera e Database Silos nei 18 diagrammi di flusso della Zona 4.",
        "zona": "Tutti i 18 Flowchart (Zona 4).",
        "flows": ["#01", "#02", "#03", "#04", "#05", "#06", "#07", "#08", "#09", "#10", "#11", "#12", "#13", "#14", "#15", "#16", "#17", "#18"]
    },
    {
        "name": "Tactical Vision & Omografia Prospettica 2D da Telecamera Campo",
        "cat": "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "eli5": "Trasforma le riprese della tribuna in lavagna tattica zenitale.",
        "spiegazione": "Trasformazione geometrica proiettiva che rimappa i punti ripresi da una telecamera prospettica sulle coordinate piane 2D del terreno di gioco.",
        "ruolo": "Converte video tattici registrati dagli spalti in mappe 2D zenitali navigabili per analizzare distanze, linee di passaggio e spaziature della squadra.",
        "zona": "Colonna 5, Riga 3 (Tactical Video CV).",
        "flows": ["#17"]
    },
    {
        "name": "Text-to-Kinematics 3D Synthesis (Generatore di Esercizi Solo-Testo)",
        "cat": "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "eli5": "Genera animazioni 3D partendo solo dalla descrizione del coach.",
        "spiegazione": "Modello generativo di machine learning che converte istruzioni descrittive testuali in sequenze di rotazioni articolari per l'avatar 3D.",
        "ruolo": "Consente a coach e staff (Tier 2/3) di creare varianti personalizzate di esercizi senza dover registrare video reali in palestra.",
        "zona": "Colonna 2, Riga 2 e 3 (Coach Hub).",
        "flows": ["#08"]
    },
    {
        "name": "Thin Client (Guscio Visivo)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Interfaccia leggera mentre i calcoli restano protetti sul server.",
        "spiegazione": "Applicazione client leggera focalizzata unicamente sulla gestione dell'interfaccia utente e priva di algoritmi matematici o formule nel codice sorgente.",
        "ruolo": "Protegge la proprieta intellettuale (IP) di T7: formule di carico, regressioni VBT e triage clinico risiedono esclusivamente sul server centrale.",
        "zona": "Corsia 1 di tutti i Flowchart (Zona 4) e Topologia C4.",
        "flows": ["#01", "#02", "#03", "#04", "#05", "#06"]
    },
    {
        "name": "Together Pro Marketplace & Video Annotazione Tecnica",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Vetrina dove i professionisti vendono consulenze e video-analisi tecniche.",
        "spiegazione": "Ecosistema commerciale B2B integrato con strumenti WebRTC per la revisione e sovraimpressione di linee guida grafiche su video inviati dagli atleti.",
        "ruolo": "Permette a preparatori e chinesiologi di monetizzare consulenze a distanza erogando feedback biomeccanici certificati con compensi protetti da Stripe.",
        "zona": "Colonna 5, Riga 2 (Together Pro Business).",
        "flows": ["#11"]
    },
    {
        "name": "Together Social Network & Movely Marketplace",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Community sportiva per condividere allenamenti e prenotare consulenze professionali.",
        "spiegazione": "Ambiente social e commerciale che connette utenti casual con la rete di coach, chinesiologi e fisioterapisti qualificati della piattaforma.",
        "ruolo": "Favorisce la fidelizzazione e la motivazione all'allenamento permettendo la condivisione di traguardi e l'ingaggio di professionisti certificati.",
        "zona": "Colonna 5, Riga 1 (Together Social B2C).",
        "flows": ["#05"]
    },
    {
        "name": "Tonnellaggio & Volume di Carico (Sets x Reps x Kg)",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Chili complessivi sollevati durante l'intera seduta di allenamento.",
        "spiegazione": "La somma cumulativa della massa sollevata per ogni ripetizione completata: Tonnellaggio = Somma(Serie * Ripetizioni * Carico in kg).",
        "ruolo": "Metrica fondamentale per quantificare il volume meccanico della sessione e calcolare la densita di carico nel Workout Player.",
        "zona": "Colonna 3, Riga 1 (Workout Player).",
        "flows": ["#03"]
    },
    {
        "name": "Training Readiness Composite Score",
        "cat": "Telemetria Wearable & Dispositivi Mobili",
        "eli5": "Indice giornaliero da zero a cento sulla prontezza fisica.",
        "spiegazione": "Indice sintetico ponderato (scala 0-100) derivato dalla combinazione di qualita del sonno, variabilita cardiaca HRV a riposo e carico pregresso.",
        "ruolo": "Comunica immediatamente all'atleta se e opportuno affrontare una sessione intensa o ridurre il carico per evitare sovrallenamento.",
        "zona": "Colonna 4, Riga 1 (Wearable Sync).",
        "flows": ["#04"]
    },
    {
        "name": "Triage Clinico Patologie & ImpactCalculator",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Filtro medico che blocca o adatta gli esercizi pericolosi.",
        "spiegazione": "Motore algoritmico basato su una matrice clinica di 119 patologie che calcola l'impatto biomeccanico articolare di ciascun esercizio del catalogo.",
        "ruolo": "Classifica gli esercizi in Esclusi, Adattati (con restrizioni di ROM) o Disponibili, salvaguardando l'atleta da movimenti potenzialmente lesivi.",
        "zona": "Colonna 3, Riga 2 (Macrocicli IA & Triage 119).",
        "flows": ["#09"]
    },
    {
        "name": "Valgismo Dinamico del Ginocchio",
        "cat": "Biomeccanica & Valutazione Funzionale",
        "eli5": "Cedimento del ginocchio verso l'interno durante piegamenti o atterraggi.",
        "spiegazione": "Deviazione verso l'interno dell'articolazione del ginocchio durante movimenti di carico, indicativa di debolezza del medio gluteo o deficit di controllo motorio.",
        "ruolo": "Rilevato automaticamente dalla Computer Vision per segnalare il rischio lesivo a carico del legamento crociato anteriore (LCA).",
        "zona": "Colonna 2 e 4, Riga 2.",
        "flows": ["#08", "#10", "#12"]
    },
    {
        "name": "VBT (Velocity Based Training)",
        "cat": "Biomeccanica & Valutazione Funzionale",
        "eli5": "Misura la velocità di sollevamento per dosare la forza.",
        "spiegazione": "Metodologia di autoregolazione dell'allenamento contro resistenze basata sul tracciamento in tempo reale della velocita propulsiva del bilanciere.",
        "ruolo": "Permette di prescrivere carichi dinamici in base allo stato neuromuscolare effettivo del giorno e stimare l'1RM senza test massimali rischiosi.",
        "zona": "Colonna 4, Riga 2 (VBT & PAP Biomechanics).",
        "flows": ["#10"]
    },
    {
        "name": "VIES & Sistema di Interscambio (SDI)",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Verifica istantanea della Partita IVA e fatturazione elettronica automatica.",
        "spiegazione": "Banca dati europea per la verifica transfrontaliera della validita delle Partite IVA unita al nodo di fatturazione elettronica dell'Agenzia delle Entrate.",
        "ruolo": "Valida in tempo reale le credenziali fiscali dei professionisti nell'onboarding Tier 2, emettendo fatture elettroniche automatiche a norma di legge.",
        "zona": "Colonna 1, Riga 2 (Setup Fiscale P.IVA).",
        "flows": ["#07"]
    },
    {
        "name": "WebAuthn (Passkeys & Biometria Hardware)",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Accesso sicuro con impronta o volto senza memorizzare password.",
        "spiegazione": "Standard aperto di autenticazione crittografica a chiave pubblica gestito tramite enclave sicura hardware (Touch ID, Face ID, Windows Hello).",
        "ruolo": "Elimina password deboli e rischi di phishing consentendo un accesso sicuro in 1 tap sia su browser web che su app smartphone.",
        "zona": "Colonna 1, Riga 1 (Consumer Onboarding).",
        "flows": ["#01"]
    },
    {
        "name": "WebRTC MediaStream & Secure Video Recording",
        "cat": "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "eli5": "Registrazione video sicura dal browser senza salvare file non autorizzati.",
        "spiegazione": "Protocollo di comunicazione in tempo reale che cattura e trasmette flussi video criptati direttamente nel browser senza richiedere plugin esterni.",
        "ruolo": "Consente l'acquisizione di registrazioni video in palestra per l'analisi cinematica e le video-consulenze a distanza tra coach e allievi.",
        "zona": "Colonna 2 e 5, Riga 2 (Coach Hub & Together Pro).",
        "flows": ["#08", "#11"]
    },
    {
        "name": "WORM Storage (Write-Once-Read-Many) Audit Logs",
        "cat": "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "eli5": "Registro blindato in cui nessuno può cancellare le registrazioni.",
        "spiegazione": "Tecnologia di archiviazione digitale immutabile in cui i dati possono essere registrati una sola volta e non possono essere alterati ne cancellati da nessun amministratore.",
        "ruolo": "Custodisce i log di accesso a referti medici, contratti e manleve dei club sportivi garantendo valenza probatoria e conformita GDPR.",
        "zona": "Colonna 1, Riga 3 (Enterprise Bunker Onboarding).",
        "flows": ["#13"]
    },
    {
        "name": "YOLOv8 Deep Learning Object Detection da Campo",
        "cat": "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "eli5": "Riconosce istantaneamente giocatori, arbitri e pallone nei video.",
        "spiegazione": "Rete neurale convoluzionale ad altissima velocita per il rilevamento di oggetti multipli in tempo reale su flussi video complessi.",
        "ruolo": "Individua e traccia continuamente le posizioni dei calciatori e del pallone sui filmati delle partite registrati dalla tribuna.",
        "zona": "Colonna 5, Riga 3 (Tactical Vision CV).",
        "flows": ["#17"]
    },
    {
        "name": "Z-Score Adattivo (Normalizzazione Statistica)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Confronta i parametri odierni con la media storica personale.",
        "spiegazione": "Misura di deviazione statistica che standardizza un valore osservato rispetto alla media e deviazione standard personale dell'atleta: z = (x - mu) / sigma.",
        "ruolo": "Confronta parametri biometrici eterogenei (sonno, HRV, RPE, carichi GPS) su una scala universale priva di unita di misura per prevenire sovraccarichi.",
        "zona": "Colonna 4, Riga 3 (GPS Adaptive Z-Score).",
        "flows": ["#16"]
    },
    {
        "name": "Z-Weighting & Gestione Doppio Ruolo Tattico",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Pesa i chilometri corsi in base alla posizione tattica.",
        "spiegazione": "Ponderazione algoritmica che ricalcola i riferimenti prestativi quando un calciatore gioca in posizioni tattiche differenti (es. terzino vs difensore centrale).",
        "ruolo": "Evita di penalizzare o sovrastimare un atleta valutando il suo carico esterno rispetto alla specifica richiesta biomeccanica della sua posizione in campo.",
        "zona": "Colonna 4, Riga 3 (GPS Adaptive Z-Score).",
        "flows": ["#16"]
    }
]

def make_slug(name):
    # Genera un'ancora markdown pulita
    s = name.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s)
    return s.strip('-')

def generate_markdown():
    lines = []
    lines.append("# Glossario Tecnico Evolutivo & Dizionario dei Concetti Architetturali (ZONA 0)")
    lines.append("")
    lines.append("Questo documento costituisce la versione locale e sincronizzata su Git della **Living Technical Glossary Board (ZONA 0)** presente sulla lavagna Miro online del progetto T7 (Board ID: `uXjVEbo6L2o=`).")
    lines.append("")
    lines.append("> **Regola Vincolante (Regola 08):** Questa board deve essere aggiornata progressivamente e tempestivamente ogni volta che vengono apportate modifiche agli schemi, introdotti nuovi flussi, o utilizzati termini tecnici complessi, acronimi o formule (sia lato ingegneria software che lato scienze motorie). L'obiettivo e facilitare la comprensione istantanea a chiunque consulti gli schemi (sviluppatori Software House, preparatori, medici, stakeholder, nuovi agenti AI).")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Indice Analitico A-Z")
    lines.append("")

    # Genera barra delle lettere
    letters = sorted(list(set([t["name"][0].upper() for t in TERMS if t["name"][0].isalpha()])))
    letter_bar = " | ".join([f"[{l}](#letter-{l.lower()})" for l in letters])
    lines.append(letter_bar)
    lines.append("")

    # Raggruppa per lettera
    from collections import defaultdict
    by_letter = defaultdict(list)
    for t in sorted(TERMS, key=lambda x: x["name"].lower()):
        first_char = t["name"][0].upper()
        if not first_char.isalpha():
            first_char = "#"
        by_letter[first_char].append(t)

    for char in sorted(by_letter.keys()):
        anchor = f"letter-{char.lower()}" if char.isalpha() else "letter-num"
        lines.append(f"### <a id=\"{anchor}\"></a>{char}")
        lines.append("")
        for t in by_letter[char]:
            slug = make_slug(t["name"])
            lines.append(f"- [{t['name']}](#{slug}) — *{t['cat']}*")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## Matrice di Tracciabilità Incrociata (Termini Tecnici <-> Flowcharts #01..#18)")
    lines.append("")
    lines.append("| # | Termine Tecnico & Acronimo | Categoria Architetturale | Flussi Miro Correlati (#01..#18) |")
    lines.append("| :-: | :--- | :--- | :--- |")

    for i, t in enumerate(sorted(TERMS, key=lambda x: x["name"].lower()), 1):
        slug = make_slug(t["name"])
        flows_str = ", ".join(t["flows"])
        lines.append(f"| **{i:02d}** | [{t['name']}](#{slug}) | {t['cat']} | `{flows_str}` |")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append(f"## Schede Terminologiche Enciclopediche ({len(TERMS)} Termini Ufficiali)")
    lines.append("")

    # Raggruppa per categoria
    by_cat = defaultdict(list)
    for t in sorted(TERMS, key=lambda x: x["name"].lower()):
        by_cat[t["cat"]].append(t)

    categories_order = [
        "Ingegneria Software & Architettura Cloud",
        "Biomeccanica & Valutazione Funzionale",
        "Algoritmi, Statistica & Machine Learning",
        "Metodologia d'Allenamento & Clinica Sportiva",
        "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "Grafica 3D, WebGL & Rendering Biomeccanico",
        "Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)",
        "Telemetria Wearable & Dispositivi Mobili",
        "Telemetria Pro, Performance Tracking & Carico Rosa (Tier 3)",
        "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "Principi Architetturali di Prodotto",
        "Video Analysis In-App, AI Multimodale & Custom Exercise Creator"
    ]

    # Stampa per categoria ordinata
    for cat_name in categories_order:
        terms_in_cat = by_cat.get(cat_name, [])
        if not terms_in_cat:
            continue
        lines.append(f"### {cat_name}")
        lines.append("")
        for t in terms_in_cat:
            slug = make_slug(t["name"])
            lines.append(f"#### <a id=\"{slug}\"></a>{t['name']}")
            lines.append(f"**ELI5:** \"{t['eli5']}\"")
            lines.append("")
            lines.append(f"- **Spiegazione Semplificata:** {t['spiegazione']}")
            lines.append(f"- **Ruolo Operativo nel Progetto T7:** {t['ruolo']}")
            lines.append(f"- **Zona / Flusso di Riferimento:** {t['zona']} (Flussi Miro: `{', '.join(t['flows'])}`)")
            lines.append("")

    return "\n".join(lines)

if __name__ == "__main__":
    content = generate_markdown()
    with open(GLOSSARY_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Glossario scritto con successo in {GLOSSARY_PATH} con {len(TERMS)} termini.")
