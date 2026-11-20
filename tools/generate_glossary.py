# -*- coding: utf-8 -*-
"""
Script per la generazione enciclopedica di 00-GLOSSARIO-TERMINI-TECNICI.md
Contiene 158 Schede Terminologiche complete con ELI5 (<= 10 parole).
"""
import re
import os
import unicodedata
from collections import defaultdict

GLOSSARY_PATH = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "00-GLOSSARIO-TERMINI-TECNICI.md")

TERMS = [
    {
        "name": '3 Silos Database (Multi-Tenant Data Isolation)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Tre cassaforti separate per utenti normali, club professionistici e università.',
        "spiegazione": "Un'architettura a compartimenti stagni in cui i dati vengono segregati in 3 ambienti fisicamente o logicamente isolati, con regole di sicurezza e crittografia differenziate.",
        "ruolo": '- *Silo 1 (Public, Social & Movely):* Gestisce i profili amatoriali e il marketplace professionisti.\n- *Silo 2 (Encrypted Club Bunkers):* Partizioni criptate con chiavi Cloud KMS dedicate per ciascuna societa professionistica di Tier 3 (nessun club puo accedere ai dati di altri club).\n- *Silo 3 (De-identified Research Warehouse):* Dati biomeccanici anonimizzati per studi scientifici universitari.',
        "zona": 'Zona 2 (Architettura C4), Zona 5 (Database ERD), Corsia 4 in tutti i Flowchart.',
        "flows": ['#01', '#02', '#03', '#04', '#05', '#06', '#07', '#08', '#09', '#10', '#11', '#12', '#13', '#14', '#15', '#16', '#17', '#18']
    },
    {
        "name": '32 Protocolli Riabilitativi Clinici (cli_01..cli_32)',
        "cat": 'Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)',
        "eli5": 'Schede riabilitative ufficiali per curare le lesioni passo dopo passo.',
        "spiegazione": 'Insieme codificato di 32 percorsi terapeutici basati su linee guida ortopediche e fisiatriche internazionali per la gestione delle patologie muscolo-scheletriche piu diffuse.',
        "ruolo": 'Fornisce ai fisioterapisti (Tier 2/3) schemi di riabilitazione standardizzati con progressione controllata di carichi, angoli articolari protetti e indicatori di sicurezza.',
        "zona": 'Colonna 6, Riga 2 (Physio Rehab ROM) e Corsia 3 Server.',
        "flows": ['#12']
    },
    {
        "name": 'ACWR (Acute:Chronic Workload Ratio)',
        "cat": 'Telemetria Pro, Performance Tracking & Carico Rosa (Tier 3)',
        "eli5": "Confronta la fatica settimanale con l'allenamento dell'ultimo mese.",
        "spiegazione": "Il rapporto matematico tra il carico di lavoro svolto nell'ultima settimana (carico acuto) e la media del carico svolto nelle ultime 4 settimane (carico cronico): ACWR = Carico Acuto / Carico Cronico.",
        "ruolo": 'Quando il rapporto supera la soglia critica (> 1.5), segnala un picco di fatica a rischio infortunio, innescando allarmi medici e rimodulazione dei carichi.',
        "zona": 'Colonna 2, Riga 3 e Motore Periodizzazione Microciclo.',
        "flows": ['#08', '#14', '#15']
    },
    {
        "name": 'ACWR EWMA (Exponentially Weighted Moving Average)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Rapporto acuto-cronico che pesa maggiormente i giorni più recenti.',
        "spiegazione": "Variante dell'indice ACWR che applica un decadimento esponenziale ai carichi passati, assegnando un peso decrescente alle sessioni piu lontane nel tempo.",
        "ruolo": "Rappresenta fedelmente la risposta fisiologica reale del corpo, evitando l'effetto a gradino delle medie mobili semplici e anticipando stati di sovrallenamento.",
        "zona": 'Colonna 3, Riga 3 (Microciclo MD-X) e Corsia 3 Server.',
        "flows": ['#15']
    },
    {
        "name": 'AI Content Gatekeeper',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Filtro intelligente che blocca contenuti tossici, spam e video pericolosi.',
        "spiegazione": 'Sistema di moderazione multimodale automatizzato che analizza testi, immagini e micro-video caricati sulla community, intercettando hate speech, spam commerciale, disinformazione su sostanze dopanti o esecuzioni biomeccaniche gravemente lesive prima della pubblicazione.',
        "ruolo": "Protegge l'integrità della community B2C Together Social (FLOW-TS1) analizzando i post in tempo reale ed evitando la diffusione di messaggi tossici o video pericolosi per gli atleti amatoriali.",
        "zona": 'Companion Apps: Together Social (#20 / #TS1) e Corsia 3 Server Scatola Nera.',
        "flows": ['#20']
    },
    {
        "name": 'Albero Cartelle Gerarchico (PostgreSQL ltree)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Struttura di cartelle e sottocartelle velocissima per archivi complessi.',
        "spiegazione": 'Estensione nativa di PostgreSQL (ltree) basata su percorsi etichettati indicizzati GiST che consente gerarchie annidate illimitate (es. club.stagione_26.match_analisi.avversari) con query di sottoalbero in millisecondi.',
        "ruolo": 'Gestisce la tassonomia complessa dei Preferiti Personali e di Team/Staff in Tier 3 (Silo 2 Bunker KMS), garantendo navigazione istantanea e ricerca filtrata per ramo.',
        "zona": 'Colonna 6, Riga 3 (Preferiti Enterprise) e Corsia 4 Silo 2.',
        "flows": ['#18']
    },
    {
        "name": 'Ambassador Educational Feed',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Pillole video e consigli scientifici pubblicati da esperti accreditati.',
        "spiegazione": 'Bacheca editoriale certificata contenente brevi pillole video da 30-60 secondi, guide posturali e consigli ergonomici creati esclusivamente da professionisti accreditati dalla Commissione Scientifica.',
        "ruolo": "Offre formazione continua e affidabile sull'ergonomia e sul movimento corretto, priva di algoritmi di polarizzazione, pubblicità commerciale o contenuti non verificati.",
        "zona": 'Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 1 / 3.',
        "flows": ['#19']
    },
    {
        "name": 'Analisi Sommaria Metriche Lattato (Soglie Aerobica/Anaerobica T7)',
        "cat": 'Telemetria Wearable & Dispositivi Mobili',
        "eli5": 'Stima rapida delle soglie di lattato dai sensori T7.',
        "spiegazione": 'Elaborazione fisiologica di primo livello applicata alle serie temporali acquisite esclusivamente da dispositivi indossabili proprietari T7 durante test incrementali (es. test del lattato a gradini o rampe cardio), con calcolo approssimato delle soglie ventilatorie/lattacide (LT1 ~2.0 mmol/L e LT2 / OBLA ~4.0 mmol/L).',
        "ruolo": 'Consente ai professionisti P.IVA di Tier 2 (FLOW-4B) di visualizzare un prospetto sintetico della curva lattacida senza accedere alle analisi fisiologiche multi-variate, ai modelli predittivi avanzati e alla potenza illimitata riservati al Tier 3.',
        "zona": 'Colonna 4, Riga 2 (VBT & PAP Biomechanics).',
        "flows": ['#10']
    },
    {
        "name": 'Angoli Principali Biomeccanici',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Grandi angoli articolari calcolati con la geometria pura.',
        "spiegazione": 'Macro-angoli articolari misurati sul piano anatomico primario (sagittale o frontale) tra segmenti corporei principali tramite formule trigonometriche deterministiche senza intelligenza artificiale.',
        "ruolo": 'Base oggettiva di valutazione del movimento per Tier 1 (goniometro manuale), estesa con considerazioni AI in Tier 2 e Tier 3.',
        "zona": 'Colonna 4, Righe 1, 2 e 3 (Data Analisi).',
        "flows": ['#04', '#10', '#16']
    },
    {
        "name": 'Angoli Specifici Biomeccanici',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Angoli complessi come rotazione bacino o cedimento del ginocchio.',
        "spiegazione": 'Micro-angolazioni segmentali e deviazioni multi-planari (valgismo/varismo dinamico, tilt pelvico, asimmetrie bilaterali L/R e deviazioni frame-by-frame) elaborate da modelli di visione artificiale.',
        "ruolo": 'Rilevamento automatico delle asimmetrie e compensazioni posturali fini in Tier 2 (AI 70%) e Tier 3 (AI 100%).',
        "zona": 'Colonna 4, Righe 2 e 3 (Data Analisi Pro & Elite).',
        "flows": ['#10', '#16']
    },
    {
        "name": 'API Gateway & Feature Gating',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Dogana digitale che sblocca solo le funzioni del tuo abbonamento.',
        "spiegazione": "Punto d'accesso unico e sicuro per tutte le richieste tra app utente e microservizi cloud, integrato con filtri di autorizzazione per livello di abbonamento.",
        "ruolo": 'Smista il traffico applicando il Feature Gating per i 3 Tier (Base, Pro, Elite), proteggendo i servizi interni e bloccando chiamate non autorizzate.',
        "zona": 'Corsia 2 di tutti i Flowchart (Zona 4) e Topologia C4.',
        "flows": ['#01', '#07', '#13']
    },
    {
        "name": 'Apple HealthKit & Google Health Connect Pipeline',
        "cat": 'Telemetria Wearable & Dispositivi Mobili',
        "eli5": 'Collega smartwatch e telefoni per leggere passi, sonno e battito.',
        "spiegazione": 'Framework di sincronizzazione asincrona che raccoglie in sicurezza i dati biometrici registrati da dispositivi indossabili Apple e Android.',
        "ruolo": "Alimenta il diario dell'atleta con metriche passive di recupero (frequenza cardiaca a riposo, sonno profondo/REM, passi) senza richiedere inserimento manuale.",
        "zona": 'Colonna 4, Riga 1 (Wearable Sync) e Corsia 1 / 2.',
        "flows": ['#04']
    },
    {
        "name": 'Area Studio Digitale In-App (Offline / IndexedDB)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Quaderno digitale con note ed evidenziatore attivo anche offline.',
        "spiegazione": 'Modulo applicativo interattivo basato su canvas grafico vettoriale locale che consente di sottolineare, disegnare a mano libera, aggiungere note testuali e abbozzare mappe concettuali su articoli e PDF personali, persistendo tutto in IndexedDB sul client senza costi cloud.',
        "ruolo": "Strumento operativo introdotto in Tier 2 (manuale) e potenziato in Tier 3 (con supporto AI e Chatbot integrato) per l'approfondimento professionale continuo.",
        "zona": 'Colonna 5, Righe 2 e 3 (Libreria Fonti).',
        "flows": ['#11', '#17']
    },
    {
        "name": 'Bar Path Optical Tracking (Traiettoria Bilanciere da CV)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Disegna una linea per vedere se sollevi il bilanciere dritto.',
        "spiegazione": "Algoritmo di Computer Vision che individua i dischi o l'asta del bilanciere nei video e ne traccia la traiettoria millimetrica nello spazio bidimensionale.",
        "ruolo": "Permette a coach e atleti di analizzare l'efficienza meccanica dell'alzata (inclinazione, oscillazioni parassite, verticalita della spinta) per correggere la traiettoria.",
        "zona": 'Colonna 2 e 5, Riga 2 (Coach Hub & Together Pro).',
        "flows": ['#08', '#11']
    },
    {
        "name": 'Baricentro di Squadra, Ampiezza & Profondità Tattica',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": "Mappa dall'alto dove si muove tutta la squadra in campo.",
        "spiegazione": 'Metriche geometriche spaziali calcolate sulle posizioni di tutti i calciatori in campo: coordinata media (baricentro), dispersione laterale (ampiezza) e longitudinale (profondita).',
        "ruolo": 'Fornisce ai match analyst indicatori istantanei sulla compattezza del blocco squadra durante le fasi di possesso e non possesso palla.',
        "zona": 'Colonna 5, Riga 3 (Tactical Vision & Voronoi CV).',
        "flows": ['#17']
    },
    {
        "name": 'BMR Mifflin-St Jeor & Harris-Benedict (Fabbisogno Metabolico)',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Calcola le calorie minime che bruci stando fermo a letto.',
        "spiegazione": 'Equazioni antropometriche validate a livello clinico per stimare il metabolismo basale giornaliero in base a peso, altezza, eta e sesso biologico.',
        "ruolo": "Determina il dispendio calorico teorico di base durante l'onboarding dell'utente comune, impostando i target energetici e nutrizionali ottimali.",
        "zona": 'Colonna 1, Riga 1 (Consumer Onboarding) e Corsia 3 Server.',
        "flows": ['#01']
    },
    {
        "name": 'Bollettino Settimanale Accademico (Feed Tematico Sportivo)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Rassegna settimanale con le ultime novità scientifiche sui tuoi sport.',
        "spiegazione": 'Servizio automatizzato di intelligence scientifica che analizza settimanalmente le banche dati mondiali, seleziona le pubblicazioni piu rilevanti per le discipline praticate dal club e distribuisce newsletter esecutive di sintesi.',
        "ruolo": 'Riservato a Tier 3 Enterprise, azzera i tempi morti di monitoraggio accademico per gli staff dei top club sportivi.',
        "zona": 'Colonna 5, Riga 3 (Libreria Fonti Enterprise).',
        "flows": ['#17']
    },
    {
        "name": 'Booking Macchinari e Laboratori Avanzati',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Prenotazione oraria di laboratori biomeccanici e attrezzature scientifiche di vertice.',
        "spiegazione": "Modulo di prenotazione, noleggio e fatturazione per l'utilizzo temporaneo di laboratori universitari, apparecchiature isocinetiche, pedane di forza triassiali, sistemi ottici 3D e camere ipobariche condivise da centri di eccellenza.",
        "ruolo": "Ottimizza la saturazione e l'ammortamento dei macchinari ad alto costo tra club professionistici, università e centri di riabilitazione accreditati (FLOW-TS3), gestendo contratti e orari in Silo 1.",
        "zona": 'Companion Apps: Together Social (#22 / #TS3) e Corsia 1 / 3.',
        "flows": ['#22']
    },
    {
        "name": 'Cartelle Tematiche & Tag Personalizzati (Preferiti Pro)',
        "cat": 'Principi Architetturali di Prodotto',
        "eli5": 'Cartelle ed etichette personali per ordinare esercizi e fonti.',
        "spiegazione": "Sistema di tassonomia personale basato su cartelle tematiche e tag liberi definiti dal professionista (es. 'Protocolli Ipertrofia', 'Articoli Nutrizione') per filtrare deterministicamente puntatori a esercizi, video 1080p, template e fonti scientifiche.",
        "ruolo": "Potenzia l'operativita quotidiana di coach e fisioterapisti P.IVA in Tier 2 (Silo 1 Pro), mantenendo l'isolamento da Data Analisi, AI, RAG e condivisione di squadra.",
        "zona": 'Colonna 6, Righe 2 e 3 (Preferiti Pro ed Enterprise) e Corsia 1 / 4.',
        "flows": ['#12', '#18']
    },
    {
        "name": 'Chatbot AI Studi Scientifici (Assistente Documentale 24/7)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Assistente virtuale per fare domande sullo studio scientifico aperto.',
        "spiegazione": "Modello linguistico conversazionale integrato nell'interfaccia di lettura che riceve in contesto il full-text dello studio scientifico e risponde istantaneamente a quesiti specifici, citando pagine e tabelle del paper.",
        "ruolo": 'Funzionalita esclusiva di Tier 3 per accelerare la comprensione metodologica e generare automaticamente mappe e schemi di studio.',
        "zona": 'Colonna 5, Riga 3 (Libreria Fonti Enterprise).',
        "flows": ['#17']
    },
    {
        "name": 'Clickwrap Liability Waiver (Manleva Medico-Legale Digitale)',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Firma digitale dove confermi di essere sano prima di allenarti.',
        "spiegazione": "Contratto digitale a presa d'atto attiva con cui l'utente dichiara che la piattaforma fornisce supporto all'allenamento e non consulenza medica o diagnostica.",
        "ruolo": 'Tutela civilmente e penalmente la piattaforma da responsabilita in caso di infortuni, archiviando timestamp UTC e hash crittografico in Silo 1.',
        "zona": 'Colonna 1, Riga 1 (Onboarding Consumer B2C).',
        "flows": ['#01']
    },
    {
        "name": 'Clonazione dello Stile e Lessico del Coach (Style-Cloning)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": "L'AI replica lo stile e il lessico del coach.",
        "spiegazione": "Modulo di adattamento linguistico few-shot che apprende il tono di voce, il gergo tecnico e le formule comunicative dell'allenatore a partire da documenti e trascrizioni caricate.",
        "ruolo": "Attivabile su richiesta nel Tier 3 per generare istruzioni, feedback e programmi perfettamente allineati all'identita comunicativa dello staff tecnico.",
        "zona": 'Colonna 4, Riga 3 (Data Analisi) e Colonna 3, Riga 3 (Programmazione).',
        "flows": ['#15', '#16']
    },
    {
        "name": 'Cloud KMS (Key Management Service)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Cassaforte cloud per le chiavi che proteggono i dati.',
        "spiegazione": 'Servizio hardware crittografico gestito per la creazione, rotazione e custodia sicura di chiavi simmetriche e asimmetriche a norma FIPS 140-2 Livello 3.',
        "ruolo": 'Protegge le partizioni Silo 2 (Bunker Club) e Silo 3 (Cartelle Cliniche EMR): neppure gli amministratori di T7 possono decifrare i dati dei club.',
        "zona": 'Zona 1 (ADR Sicurezza), Zona 2 (Silo 2) e Corsia 4 nei Flowchart.',
        "flows": ['#13', '#14', '#15', '#18']
    },
    {
        "name": 'Cloudflare Turnstile (Scudo Anti-Bot Invisibile)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Verifica che sei umano senza farti risolvere noiosi puzzle.',
        "spiegazione": 'Soluzione avanzata di convalida delle sessioni web e mobile che distingue il traffico umano dai bot automatici senza mostrare captcha visivi.',
        "ruolo": 'Blocca scraping massivo, registrazioni automatizzate e attacchi di credential stuffing sui form di registrazione e login.',
        "zona": 'Colonna 1, Riga 1 e 2 (Corsia 2 API Gateway).',
        "flows": ['#01', '#07']
    },
    {
        "name": 'CMJ (Countermovement Jump) & Abalakov Jump',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Salto verticale per misurare quanto sono esplosive le tue gambe.',
        "spiegazione": 'Test cinematici standardizzati di salto verticale su pedana di forza o telecamera: CMJ con mani ai fianchi per isolare gli arti inferiori, Abalakov con oscillazione braccia.',
        "ruolo": "Valuta l'efficienza del ciclo allungamento-accorciamento (SSC) e monitora l'affaticamento neuromuscolare nel corso della stagione agonistica.",
        "zona": 'Colonna 4, Riga 2 (VBT & PAP Biomechanics).',
        "flows": ['#10']
    },
    {
        "name": 'Co-Pay Welfare Wallet',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Borsellino digitale aziendale per cofinanziare servizi salute e benessere.',
        "spiegazione": 'Portafoglio digitale che gestisce la ripartizione dei pagamenti per servizi di salute e benessere tra la quota welfare aziendale (flexible benefit) e la quota a carico del dipendente.',
        "ruolo": 'Consente acquisti fluidi di prestazioni sanitarie e posturali convenzionate con emissione di ricevute fiscali conformi e tracciamento contabile su Silo 1.',
        "zona": 'Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 2 / 4.',
        "flows": ['#19']
    },
    {
        "name": 'Color-Coding Neuromuscolare Dinamico (Fasce Muscolari Colorate)',
        "cat": 'Grafica 3D, WebGL & Rendering Biomeccanico',
        "eli5": "Colora i muscoli dell'avatar in base a quanto lavorano.",
        "spiegazione": "Colorazione cromatica ad alto contrasto dei distretti anatomici dell'avatar 3D che varia in tempo reale in base al grado di attivazione e al ruolo meccanico.",
        "ruolo": "Evidenzia all'atleta i muscoli agonisti primari (rosso), sinergisti secondari (arancione) e stabilizzatori/core (giallo/verde) durante ogni fase dell'esercizio.",
        "zona": 'Colonna 2, Righe 1, 2 e 3 (Catalogo 3D).',
        "flows": ['#02', '#08', '#14']
    },
    {
        "name": 'Commissione Scientifica T7 (Peer-Review Community)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Comitato di esperti che convalida ricerche e tesi inviate.',
        "spiegazione": "Organo collegiale di revisione paritaria interno all'ecosistema T7 che esamina le proposte di integrazione studi (via DOI/PMID) e valuta la solidita metodologica di tesi, casi studio e ricerche inedite caricate dai professionisti prima della divulgazione.",
        "ruolo": "Garantisce il rigore e la credibilita scientifica dell'archivio, offrendo al contempo un canale di valorizzazione professionale per coach e accademici di Tier 2 e 3.",
        "zona": 'Colonna 5, Righe 2 e 3 (Libreria Fonti Pro ed Enterprise).',
        "flows": ['#11', '#17']
    },
    {
        "name": 'Confronto Video Side-by-Side (Clip Atleta vs Avatar 3D)',
        "cat": 'Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)',
        "eli5": 'Confronta il tuo video col modello 3D per correggerti.',
        "spiegazione": "Interfaccia sdoppiata che sincronizza il filmato reale registrato dallo smartphone dell'atleta con l'animazione tridimensionale ideale del catalogo biomeccanico.",
        "ruolo": 'Consente a coach e fisioterapisti di evidenziare visivamente compensi posturali, asimmetrie ed errori tecnici mediante strumenti di disegno goniometrico a schermo.',
        "zona": 'Colonna 2 e 6, Riga 2 (Coach Hub & Physio Rehab).',
        "flows": ['#08', '#12']
    },
    {
        "name": 'Consenso Esplicito Biometrico Art. 9 GDPR',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'Permesso indispensabile per raccogliere dati medici e del corpo.',
        "spiegazione": "Consenso informato granulare e qualificato, richiesto dall'Art. 9 del Regolamento UE 2016/679 per il trattamento di categorie particolari di dati (salute e biometria).",
        "ruolo": 'Autorizza la raccolta di telemetria cardiaca, test VBT, GPS e cartelle cliniche societarie in bunker criptati, con possibilita di revoca immediata.',
        "zona": 'Colonna 1 e 6, Riga 3 (Bunker Onboarding & Medical Room).',
        "flows": ['#13', '#18']
    },
    {
        "name": 'Controllo Incrociato & Avvisi di Conflitto (Conflict Alert Schede-Referti)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": "Allarme automatico se l'allenamento confligge con un referto medico.",
        "spiegazione": 'Motore semantico e deterministico di validazione che confronta le schede create con i limiti articolari, i carichi massimi eccentrici e i referti clinici archiviati nel RAG.',
        "ruolo": 'Blocca sul nascere prescrizioni di carico inappropriate per atleti in fase di recupero o con sovraccarichi tendinei nel Tier 3.',
        "zona": 'Colonna 4, Riga 3 (Data Analisi) e Colonna 3, Riga 3 (Programmazione).',
        "flows": ['#15', '#16']
    },
    {
        "name": 'Cross-Module Baseline Bridge (Data Analisi verso Programmazione e Catalogo)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Aggiorna schede e catalogo usando i dati delle partite.',
        "spiegazione": 'Canale architetturale di integrazione e bus dati bidirezionale che collega la sezione Data Analisi con la Programmazione (#15) e il Catalogo Esercizi (#14), trasformando ogni riscontro sul campo in elemento fondante della baseline fisiologica e delle schede personalizzate.',
        "ruolo": "Converte il modulo Data Analisi di Tier 3 (FLOW-4C) nella fonte primaria di conoscenza interna societaria: alimenta costantemente il Chatbot di supporto 24/7, il motore RAG privato, i carichi proposti per il microciclo e l'archiviazione di video corretti all'interno del catalogo di club.",
        "zona": 'Colonna 4, Riga 3 (Data Analisi Elite).',
        "flows": ['#16']
    },
    {
        "name": 'Cues Propriocettivi Verbali & Criteri Oggettivi di Validità',
        "cat": 'Grafica 3D, WebGL & Rendering Biomeccanico',
        "eli5": "Consigli vocali automatici per correggere la postura durante l'esercizio.",
        "spiegazione": "Istruzioni attentive sintetiche focalizzate sul corpo o sull'ambiente circostante, abbinate a soglie geometriche per decretare la validita di una ripetizione.",
        "ruolo": "Insegna la corretta tecnica esecutiva nell'avatar 3D e previene compensi scorretti, evidenziando in rosso i punti critici di errore.",
        "zona": 'Colonna 2, Riga 1 e 2.',
        "flows": ['#02', '#08']
    },
    {
        "name": 'Decoupled Readiness Sub-Scores (4 Domini Indipendenti)',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Quattro punteggi separati per non mascherare crolli fisici isolati.',
        "spiegazione": 'Architettura di monitoraggio che valuta e visualizza in modo autonomo 4 domini biologici (Fisiologico, Neurocognitivo, Neuromuscolare, Tolleranza al Carico) prima di qualsiasi aggregazione in un indice complessivo.',
        "ruolo": "Previene l'effetto mascheramento (in cui valori cardiaci eccellenti compensano un grave crollo neurale o contrattile), consentendo modulazioni prescrittive mirate su specifici sistemi biologici in affanno.",
        "zona": 'Colonna 3, Riga 3 (Readiness Section Tier 3) e Corsia 1 / 3.',
        "flows": ['#15']
    },
    {
        "name": 'Diagrammi di Voronoi & Spazio di Controllo Pitch',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Colora il campo per mostrare quale squadra controlla ogni zona.',
        "spiegazione": "Tassellatura bidimensionale del terreno di gioco che assegna a ciascun giocatore l'area di campo piu vicina a lui rispetto a qualsiasi altro compagno o avversario.",
        "ruolo": 'Calcola in tempo reale le superfici di influenza territoriale e gli spazi liberi attaccabili durante le azioni di gioco riprese da telecamere tattiche.',
        "zona": 'Colonna 5, Riga 3 (Tactical Vision CV).',
        "flows": ['#17']
    },
    {
        "name": "Digital Twin Biomeccanico dell'Atleta",
        "cat": 'Telemetria Pro, Performance Tracking & Carico Rosa (Tier 3)',
        "eli5": "Copia virtuale 3D dell'atleta che simula movimenti e fatiche.",
        "spiegazione": "Modello computazionale tridimensionale parametrizzato sulle caratteristiche antropometriche e storiche di un singolo atleta d'elite.",
        "ruolo": 'Simula sollecitazioni articolari, forze di taglio sul ginocchio e carichi muscolari per anticipare il rischio lesivo e personalizzare il microciclo.',
        "zona": 'Colonna 2, Riga 3 (Multi-Staff Cockpit).',
        "flows": ['#14']
    },
    {
        "name": 'DOP / HDOP (Dilution of Precision Satellite Filtering)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Filtra i dati GPS imprecisi quando i satelliti prendono male.',
        "spiegazione": 'Indice geometrico della disposizione della costellazione satellitare visibile; valori elevati indicano bassa accuratezza posizionale.',
        "ruolo": "Ripulisce la telemetria GPS dai picchi di velocita fittizi causati dall'effetto canyoning delle tribune degli stadi o condizioni meteo avverse.",
        "zona": 'Colonna 4, Riga 3 (GPS Adaptive Z-Score).',
        "flows": ['#16']
    },
    {
        "name": 'Doppio Livello Preferiti (Personali vs Team/Staff Pinning)',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'Spazio personale separato dalla bacheca condivisa con documenti fissati.',
        "spiegazione": 'Architettura multi-scope di Tier 3 che separa i Preferiti Personali (visibili solo al singolo operatore) dai Preferiti di Team/Staff (condivisi con il club e dotati di pinning prioritario in alto per documenti e routine cruciali).',
        "ruolo": "Permette agli staff dei club professionistici di standardizzare l'accesso immediato a routine 4K, report Match Analisi, Readiness e documenti RAG senza mescolarli con gli appunti privati del singolo.",
        "zona": 'Colonna 6, Riga 3 (Preferiti Enterprise All-in-One) e Corsia 1 / 4.',
        "flows": ['#18']
    },
    {
        "name": 'Draco Geometry Compression & Progressive LOD',
        "cat": 'Grafica 3D, WebGL & Rendering Biomeccanico',
        "eli5": 'Rimpicciolisce i file 3D per caricarli velocemente sullo smartphone.',
        "spiegazione": "Algoritmo open source di quantizzazione geometrica delle mesh tridimensionali unito all'adattamento dinamico dei vertici renderizzati in base al framerate.",
        "ruolo": "Permette il caricamento istantaneo dell'avatar biomeccanico 3D da 1-2 MB su rete mobile, preservando 60 FPS stabili su qualsiasi terminale.",
        "zona": 'Colonna 2, Riga 1 (Personal Cockpit).',
        "flows": ['#02']
    },
    {
        "name": 'Dual-Stream Toggle (Video Reale vs Avatar 3D Stilizzato)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": "Pulsante per passare dal video vero all'omino 3D stilizzato.",
        "spiegazione": 'Comando di visualizzazione che alterna il video MP4 registrato con telecamera e il modello 3D generato dai punti cinematici estratti.',
        "ruolo": "Permette all'utente di passare dalla visione didattica tridimensionale priva di distrazioni al filmato reale, tutelando storage e privacy.",
        "zona": 'Colonna 2, Riga 2 e 3.',
        "flows": ['#08']
    },
    {
        "name": 'DUP (Daily Undulating Periodization)',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Alterna giorni pesanti, medi e leggeri nella stessa settimana d'allenamento.",
        "spiegazione": "Modello di periodizzazione dell'allenamento che varia intensita, volume e obiettivo fisiologico ad ogni singola sessione settimanale.",
        "ruolo": "Ottimizza l'adattamento neuromuscolare ed evita stalli di prestazione, generato automaticamente dal Wizard di Programmazione Tier 2.",
        "zona": 'Colonna 3, Riga 2 (Macrocicli IA & Triage 119).',
        "flows": ['#09']
    },
    {
        "name": 'Dynamic Forensic Watermarking Anti-Leak',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'Marchio invisibile nei video per scoprire chi diffonde immagini riservate.',
        "spiegazione": 'Tecnologia di marcatura steganografica digitale applicata dinamicamente sui frame video con ID sessione, timestamp e ID utente.',
        "ruolo": 'Protegge i video degli allenamenti e le sedute tattiche del club da fughe di notizie e leak verso i media o squadre concorrenti.',
        "zona": 'Colonna 2, Riga 3 (Secret Club Vault).',
        "flows": ['#14']
    },
    {
        "name": 'Electronic Medical Record (EMR) & Segreto Medico',
        "cat": 'Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)',
        "eli5": 'Cartella clinica blindata visibile solo dal medico della squadra.',
        "spiegazione": "Cartella sanitaria elettronica protetta da cifratura a livello di colonna conforme a HIPAA e GDPR per l'archiviazione di referti e terapie.",
        "ruolo": "Separa i dati diagnostici dai parametri fisici sportivi: lo staff tecnico vede la disponibilita all'allenamento, ma non le patologie protette da segreto medico.",
        "zona": 'Colonna 6, Riga 3 (Medical Room EMR Silo 3).',
        "flows": ['#18']
    },
    {
        "name": 'Epley 1RM Formula & Stima Sub-Massimale',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Formula che stima il tuo carico massimo senza farti rischiare.',
        "spiegazione": 'Formula matematica empirica per stimare il massimale teorico (1RM): 1RM = Carico * (1 + Ripetizioni / 30).',
        "ruolo": "Calcola in tempo reale il potenziale massimale durante le serie ordinarie del Workout Player, senza costringere l'atleta a test rischiosi.",
        "zona": 'Colonna 3, Riga 1 (Workout Player).',
        "flows": ['#03']
    },
    {
        "name": 'Ereditarietà Funzionale a Cascata Top-Down (Tier 1 -> Tier 2 -> Tier 3)',
        "cat": 'Principi Architetturali di Prodotto',
        "eli5": 'I livelli superiori includono tutte le funzioni di quelli inferiori.',
        "spiegazione": 'Regola architetturale che garantisce che le funzionalita dei tier inferiori siano incluse per ereditarieta nei software di livello superiore.',
        "ruolo": 'Preserva coerenza funzionale ed ergonomica su tutta la suite: Tier 2 include Tier 1; Tier 3 include Tier 1 e Tier 2 con logiche enterprise.',
        "zona": 'Regola Architetturale 08 & 10 su tutta la Zona 4.',
        "flows": ['#01', '#07', '#13']
    },
    {
        "name": 'Excel Sbloccato (protected: false) & Data Interoperability',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'File Excel senza formule bloccate, liberamente modificabili dal coach.',
        "spiegazione": 'File foglio di calcolo generato con celle e fogli completamente editabili e privi di password di blocco o macro proprietarie.',
        "ruolo": 'Consente a preparatori e scienziati motori di esportare i dati telemetrici e le schede per rielaborarli liberamente nei propri software gestionali.',
        "zona": 'Colonna 4, Riga 2 e Riga 3 (Export VBT & GPS).',
        "flows": ['#10', '#16']
    },
    {
        "name": 'Fallback per Nuovi Acquisti (Cold Start senza Baseline)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Stima provvisoria della forma per i nuovi atleti senza storico.',
        "spiegazione": 'Algoritmo euristico che assegna valori di riferimento temporanei a un atleta privo dello storico delle ultime 4 settimane.',
        "ruolo": 'Evita errori di divisione per zero o schermate vuote nel calcolo dello Z-Score per i nuovi tesserati, garantendo monitoraggio immediato.',
        "zona": 'Colonna 4, Riga 3 (GPS Adaptive Z-Score).',
        "flows": ['#16']
    },
    {
        "name": 'Family Plan Welfare',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Estende i benefit di movimento e benessere ai familiari.',
        "spiegazione": 'Funzionalità che consente al lavoratore di estendere i benefit aziendali di movimento ed educazione posturale ai componenti del proprio nucleo familiare tramite profili secondari collegati.',
        "ruolo": 'Promuove abitudini salutari condivise in famiglia, mantenendo i dati di ciascun membro rigorosamente separati e isolati nella partizione Silo 1.',
        "zona": 'Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 1 / 4.',
        "flows": ['#19']
    },
    {
        "name": 'Fan-Out on Write & Redis Cluster ZSET (Timeline Social)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Distribuisce i post istantaneamente senza rallentare la bacheca social.',
        "spiegazione": 'Architettura di messaggistica che scrive il post pubblicato direttamente nelle code cronologiche Redis (Sorted Set) dei follower.',
        "ruolo": 'Garantisce tempi di caricamento del feed inferiori a 50 millisecondi nella community Movely Together anche con milioni di utenti attivi.',
        "zona": 'Colonna 5, Riga 1 (Together Social B2C).',
        "flows": ['#05']
    },
    {
        "name": 'Fasi Biomeccaniche: Concentrica vs Eccentrica & TUT (Time Under Tension)',
        "cat": 'Grafica 3D, WebGL & Rendering Biomeccanico',
        "eli5": "Tempo trascorso spingendo e frenando il peso durante l'esercizio.",
        "spiegazione": 'Scansione dei tempi di lavoro muscolare tra contrazione concentrica (sollevamento), eccentrica (discesa controllata) e pause isometriche.',
        "ruolo": "L'avatar 3D guida visivamente e con segnali acustici la cadenza prescritta dal preparatore, massimizzando lo stimolo ipertrofico o tendineo.",
        "zona": 'Colonna 2 e 3, Riga 1 (Catalogo 3D & Workout Player).',
        "flows": ['#02', '#03']
    },
    {
        "name": 'Feature Gating Clinico & Ordine Sanitario (FNOFI / TSRM-PSTRP)',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": "Sblocca le funzioni riabilitative solo per fisioterapisti iscritti all'albo.",
        "spiegazione": "Controllo autorizzativo che condiziona l'accesso a funzionalita riabilitative e cartelle cliniche alla verifica dell'iscrizione all'albo professionale.",
        "ruolo": "Tutela legale contro l'esercizio abusivo della professione sanitaria, limitando i moduli diagnostico-terapeutici ai soli professionisti abilitati.",
        "zona": 'Colonna 1 e 6, Riga 2 (Pro Onboarding & Physio Rehab).',
        "flows": ['#07', '#12']
    },
    {
        "name": 'Feature Gating Tier 1 (Consumer)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": "Blocco automatico che limita l'accesso al piano gratuito base.",
        "spiegazione": 'Regola di controllo accessi a livello API Gateway che restringe le chiamate e le viste alle sole funzionalità aperte del piano base.',
        "ruolo": "Garantisce la separazione commerciale impedendo l'accesso non autorizzato a funzioni professionali dei Tier 2 e 3.",
        "zona": 'Corsia 2 Gateway e Zona 1 Miro.',
        "flows": ['#01', '#02', '#03', '#04', '#05', '#06']
    },
    {
        "name": 'FFMI (Fat-Free Mass Index) & Normalizzazione Antropometrica',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": "Misura quanti muscoli hai togliendo il grasso e l'altezza.",
        "spiegazione": "Rapporto tra la massa magra e il quadrato dell'altezza: FFMI = Massa Magra (kg) / Altezza (m)^2.",
        "ruolo": "Valuta il potenziale muscolare dell'atleta e normalizza i carichi di lavoro evitando le distorsioni del semplice indice di massa corporea (BMI).",
        "zona": 'Colonna 1 e 3, Riga 1 e 2.',
        "flows": ['#01', '#09']
    },
    {
        "name": 'Filtro Outlier MAD (Median Absolute Deviation)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Cancella i numeri assurdi causati da errori dei sensori.',
        "spiegazione": 'Misura di dispersione statistica robusta che identifica i valori anomali basandosi sulla mediana invece che sulla media aritmetica.',
        "ruolo": 'Scarta picchi spuri di battito cardiaco o ripetizioni errate nei test VBT e salti PAP senza farsi ingannare da anomalie estreme dei sensori.',
        "zona": 'Colonna 4, Righe 1, 2 e 3.',
        "flows": ['#04', '#10']
    },
    {
        "name": 'Filtro Silenzioso RBAC & PostgreSQL RLS (Segreto Medico Preferiti)',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'Nasconde i referti medici allo staff non autorizzato.',
        "spiegazione": 'Meccanismo di difesa in profondita conforme al GDPR Art. 9 che combina Envoy RBAC (Corsia 2) e PostgreSQL Row-Level Security (Silo 2) per escludere silenziosamente referti clinici e documenti sanitari dai risultati di ricerca e dal pinning visibili ai ruoli tecnici.',
        "ruolo": "Garantisce che i documenti clinici fissati nei Preferiti di Team/Staff siano visibili esclusivamente allo Staff Medico, impedendo ad allenatori e preparatori qualsiasi fuga di dati o rivelazione dell'esistenza stessa del referto.",
        "zona": 'Colonna 6, Riga 3 (Preferiti Enterprise) e Corsia 2 / 4.',
        "flows": ['#18']
    },
    {
        "name": 'Find Your Gym Bro / Gym Girl',
        "cat": 'Principi Architetturali di Prodotto',
        "eli5": 'Trova compagni di allenamento compatibili per livello, palestra e orari.',
        "spiegazione": 'Funzionalità opt-in di matching geolocalizzato e motivazionale che permette agli atleti B2C di connettersi con altri utenti che frequentano la stessa palestra o praticano la stessa disciplina, con preferenze orarie e livelli di forza affini.',
        "ruolo": "Aumenta l'aderenza all'allenamento e il senso di appartenenza nella community amatoriale Together Social (FLOW-TS1), tutelando la privacy tramite consenso esplicito e raggio geografico mascherato.",
        "zona": 'Companion Apps: Together Social (#20 / #TS1) e Corsia 1 Client.',
        "flows": ['#20']
    },
    {
        "name": 'Gemini Interactions API & Embedding-2 (Guardrail Enclave T7)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Motore AI stateless privato con controlli di sicurezza integrati.',
        "spiegazione": "Integrazione server-side mediante SDK ufficiale @google/genai con ai.models.embedContent (gemini-embedding-2) per la vettorizzazione semantica e ai.interactions.create (gemini-2.5-flash-lite, store: false, output JSON strutturato) protetta da BudgetConfig e SafetyPolicy nell'enclave privata T7.",
        "ruolo": 'Alimenta la ricerca semantica e il reranking intelligente dei Preferiti Enterprise (FLOW-6C) senza conservazione esterna dei dati sensibili del club e con zero esposizione sul Thin Client.',
        "zona": 'Colonna 6, Riga 3 (Preferiti Enterprise) e Corsia 3 Server Scatola Nera.',
        "flows": ['#18']
    },
    {
        "name": 'Gestione Preferiti Studi Scientifici',
        "cat": 'Ricerca Scientifica & Documentazione Accademica (Tier 1-2-3)',
        "eli5": 'Salva e organizza le ricerche scientifiche in cartelle personalizzate.',
        "spiegazione": 'Modulo di indicizzazione e archiviazione locale e cloud che permette agli utenti professionali di creare cartelle tematiche di studi preferiti.',
        "ruolo": 'Velocizza la consultazione e il recupero di evidenze cliniche durante la progettazione di schede o percorsi riabilitativi.',
        "zona": 'Colonna 5, Riga 2 e 3 (Libreria Fonti).',
        "flows": ['#11', '#17']
    },
    {
        "name": 'glTF / GLB & Compressione Google Draco Mesh',
        "cat": 'Grafica 3D, WebGL & Rendering Biomeccanico',
        "eli5": 'Formato leggero per far girare modelli 3D su smartphone.',
        "spiegazione": 'Formato standard di trasmissione di modelli tridimensionali ottimizzato per il web, con compressione lossy/lossless delle geometrie dei vertici.',
        "ruolo": "Consente all'app mobile di scaricare i modelli anatomici 3D con consumo dati minimo e avvio immediato delle animazioni biomeccaniche.",
        "zona": 'Colonna 2, Riga 1 (Personal Cockpit).',
        "flows": ['#02']
    },
    {
        "name": 'Goniometro Digitale AI (Markerless Joint Angle Extraction)',
        "cat": 'Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)',
        "eli5": 'Misura quanto pieghi ginocchia e spalle usando solo la fotocamera.',
        "spiegazione": "Algoritmo di visione artificiale che misura in tempo reale l'angolo tra segmenti corporei estraendo le coordinate 3D delle articolazioni da flussi video.",
        "ruolo": "Permette a fisioterapisti e chinesiologi di quantificare con precisione clinica l'ampiezza di movimento (ROM) e monitorare il recupero post-chirurgico.",
        "zona": 'Colonna 6, Riga 2 (Physio Rehab ROM).',
        "flows": ['#12']
    },
    {
        "name": 'Graceful Degradation & WebGL Performance Fallback',
        "cat": 'Grafica 3D, WebGL & Rendering Biomeccanico',
        "eli5": 'Semplifica la grafica 3D quando lo smartphone è sotto sforzo.',
        "spiegazione": 'Strategia software che riduce automaticamente qualita grafica, ombre e dettagli di rendering se il framerate scende sotto i 30 FPS.',
        "ruolo": "Assicura che l'applicazione rimanga reattiva ed utilizzabile anche su dispositivi datati o con accelerazione grafica limitata.",
        "zona": 'Colonna 2, Riga 1 (Thin Client WebGL).',
        "flows": ['#02']
    },
    {
        "name": 'Heart Rate Variability (HRV) & rMSSD Recovery Score',
        "cat": 'Telemetria Wearable & Dispositivi Mobili',
        "eli5": 'Misura il recupero fisico analizzando le variazioni del battito cardiaco.',
        "spiegazione": "Variazione temporale millimetrica tra battiti cardiaci consecutivi (intervalli R-R); l'indice rMSSD quantifica l'attivita del sistema nervoso parasimpatico.",
        "ruolo": 'Fornisce la misura oggettiva del recupero da stress fisico ed emotivo, regolando i volumi di allenamento della seduta odierna.',
        "zona": 'Colonna 4, Riga 1 e Riga 3 (Wearable & GPS).',
        "flows": ['#04', '#16']
    },
    {
        "name": 'HRV Fusion (Integrazione Carico Interno/Esterno)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Combina i chilometri corsi con la fatica cardiaca registrata.',
        "spiegazione": 'Modello algoritmico che combina i dati cinematici esterni (distanze sprint e accelerazioni GPS) con la risposta fisiologica interna (HRV ed FC).',
        "ruolo": 'Permette allo staff tecnico di individuare atleti a parita di chilometri percorsi che stanno sopportando un costo biologico troppo alto.',
        "zona": 'Colonna 4, Riga 3 (GPS Adaptive Z-Score).',
        "flows": ['#16']
    },
    {
        "name": 'IndexedDB & Optimistic Transaction Queue',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": "Salva l'allenamento offline e lo invia appena torna internet.",
        "spiegazione": 'Database transazionale client-side nel browser abbinato a una coda di mutazioni ottimistiche sincronizzate in background con backoff esponenziale.',
        "ruolo": "Permette all'atleta di registrare ripetizioni e carichi anche in palestre interrate prive di connessione, sincronizzando i dati al ritorno online.",
        "zona": 'Colonna 3, Riga 1 (Workout Player Thin Client).',
        "flows": ['#03']
    },
    {
        "name": 'Indicatori di Qualita Scientifica (CEBM Oxford e Quartili JCR)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": "Badge chiari sull'autorevolezza e rigore di ciascuno studio scientifico.",
        "spiegazione": "Metriche di validita accademica basate sulla gerarchia delle prove dell'Oxford Centre for Evidence-Based Medicine (Livello I-V) e sul fattore d'impatto della rivista (Quartili ISI Web of Science Q1-Q4).",
        "ruolo": "Permette allo staff di Tier 3 di filtrare e ordinare istantaneamente gli studi in base all'affidabilita metodologica.",
        "zona": 'Colonna 5, Riga 3 (Libreria Fonti Enterprise).',
        "flows": ['#17']
    },
    {
        "name": 'INI-PEC (Indice Nazionale Posta Elettronica Certificata) & Two-Way OTP',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Codice inviato via PEC per blindare la Partita IVA.',
        "spiegazione": 'Registro pubblico delle caselle PEC di professionisti e aziende italiane, interrogato per verificare la reale titolarita di una Partita IVA tramite codice OTP.',
        "ruolo": "Blocca all'origine frodi e tentativi di registrazione di account professionali con Partite IVA altrui nell'onboarding Tier 2.",
        "zona": 'Colonna 1, Riga 2 (Setup Fiscale P.IVA).',
        "flows": ['#07']
    },
    {
        "name": 'Isolamento Data Analisi Tier 1 (Zero Correlazione Cross-Modulo)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Dati di corsa isolati senza connessione con altre sezioni.',
        "spiegazione": "Regola di segregazione del flusso dati che proibisce qualsiasi correlazione automatica o scambio informativo tra il modulo Data Analisi di Tier 1 e gli altri moduli dell'applicazione (Programmazione Allenamento, Catalogo Esercizi o Social Network).",
        "ruolo": "Mantiene l'esperienza B2C circoscritta all'ispezione immediata del video e dei dati della sessione corrente, delimitando rigorosamente il perimetro funzionale rispetto alla convergenza multi-modulo di Tier 2 e alla sinergia omnicomprensiva con baseline bridge di Tier 3.",
        "zona": 'Colonna 4, Riga 1 (Data Analisi Casual).',
        "flows": ['#04']
    },
    {
        "name": 'K-Anonymity & Zero-Knowledge Privacy Shield',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Protegge la tua identità mescolando i dati nel gruppo.',
        "spiegazione": 'Principio matematico di de-identificazione dei dati in cui le informazioni di un individuo non sono distinguibili da almeno k-1 altri soggetti nel dataset.',
        "ruolo": 'Protegge la privacy dei dipendenti nei report ergonomici aziendali e i dati clinici dei pazienti trasferiti nel Research Warehouse Silo 3.',
        "zona": 'Colonna 6, Riga 1 e Riga 3 (Desk-Care & Research Silo 3).',
        "flows": ['#06', '#18']
    },
    {
        "name": 'K-Anonymity HR Privacy Firewall',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": "Anonimizza i dati benessere per tutelare i dipendenti dall'azienda.",
        "spiegazione": "Meccanismo di protezione crittografica e statistica basato sul principio del k-anonimato (con soglia minima k >= 5), che blocca l'esposizione di dati aggregati per gruppi aziendali con meno di 5 individui.",
        "ruolo": "Impedisce al datore di lavoro o all'HR di risalire ai dati posturali, abitudini o risposte individuali dei singoli dipendenti, tutelando la privacy secondo il GDPR.",
        "zona": 'Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 3 Server Scatola Nera.',
        "flows": ['#19']
    },
    {
        "name": 'KYB (Know Your Business) & UBO (Ultimate Beneficial Owner)',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'Verifica che identifica titolari e dirigenti della società sportiva.',
        "spiegazione": "Procedura di conformita normativa antiriciclaggio che accerta l'identita legale dei rappresentanti e del titolare effettivo di un club professionistico.",
        "ruolo": 'Assicura che solo figure munite di effettivi poteri di rappresentanza aziendale possano attivare partizioni societarie Silo 2 e firmare contratti.',
        "zona": 'Colonna 1, Riga 3 (Enterprise Bunker Onboarding).',
        "flows": ['#13']
    },
    {
        "name": 'Libreria Esercizi a Due Livelli di Club (Bozza Atleta vs Ufficiale Societaria)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Cartella per testare un esercizio prima di approvarlo ufficialmente.',
        "spiegazione": 'Architettura di persistenza che isola le varianti custom create per un singolo tesserato dalla libreria ufficiale validata dallo staff.',
        "ruolo": 'Consente a medici e preparatori di sperimentare protocolli specifici per un atleta infortunato prima di promuoverli a standard di squadra.',
        "zona": 'Colonna 2, Riga 3 (Multi-Staff Cockpit).',
        "flows": ['#14']
    },
    {
        "name": 'Limitatore Goniometrico di ROM Touch (Range of Motion Lock)',
        "cat": 'Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)',
        "eli5": "Blocco virtuale che impedisce di piegare troppo l'articolazione lesa.",
        "spiegazione": "Comando visivo interattivo sull'avatar 3D che consente al clinico di fissare il range escursionale massimo consentito a un'articolazione.",
        "ruolo": "Protegge tessuti biologici in via di guarigione o neo-legamenti chirurgici, bloccando visivamente l'animazione all'angolo limite impostato.",
        "zona": 'Colonna 2 e 6, Riga 2.',
        "flows": ['#12']
    },
    {
        "name": 'Lista Lineare Preferiti (Tier 1 Base)',
        "cat": 'Principi Architetturali di Prodotto',
        "eli5": 'Elenco piatto di esercizi e programmi salvati senza cartelle.',
        "spiegazione": 'Organizzazione visiva essenziale a lista singola e cronologica riservata agli utenti Consumer, priva di sottocartelle, etichette personalizzate, fonti scientifiche, video personalizzati o ricerca AI.',
        "ruolo": "Consente all'utente amatoriale di Tier 1 di contrassegnare e richiamare in un tocco esercizi 3D dal Catalogo (#02) e programmi pre-confezionati base (#03), applicando in modo rigoroso il Feature Gating di fascia.",
        "zona": 'Colonna 6, Riga 1 (Preferiti Tier 1) e Corsia 1 Client.',
        "flows": ['#06']
    },
    {
        "name": 'Live Camera AI Real-Time Correction (Feedback Esecutivo sul Momento)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": "La telecamera rileva l'esecuzione e corregge subito gli errori.",
        "spiegazione": "Pipeline di computer vision a 60fps che acquisisce lo stream video in diretta, analizza la postura istantanea dell'atleta e proietta suggerimenti correttivi in sovrimpressione a schermo in tempo reale.",
        "ruolo": "Funzionalita chiave di Tier 2 e Tier 3: permette correzione sul momento degli errori biomeccanici durante l'esercizio e trascrizione dei feedback nel video salvato.",
        "zona": 'Colonna 4, Righe 2 e 3 (Thin Client UI & Server Vision).',
        "flows": ['#10', '#16']
    },
    {
        "name": 'Markerless Motion Capture (Computer Vision AI da Campo)',
        "cat": 'Telemetria Pro, Performance Tracking & Carico Rosa (Tier 3)',
        "eli5": 'Calcola gli angoli del corpo senza applicare sensori addosso.',
        "spiegazione": 'Tecnologia di stima della posa umana basata su reti neurali convoluzionali che ricostruisce scheletri cinematici 3D da normali video RGB.',
        "ruolo": 'Estrae metriche biomeccaniche su gesti tecnici e atletici durante allenamenti e gare senza applicare marker invasivi sugli atleti.',
        "zona": 'Colonna 2 e 5, Riga 2 e Riga 3.',
        "flows": ['#08', '#14', '#17']
    },
    {
        "name": 'Mean Propulsive Velocity (MPV) vs Peak Velocity',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Velocità reale con cui spingi il bilanciere escludendo decelerazioni.',
        "spiegazione": "L'MPV misura la velocita media della sola porzione concentrica in cui l'accelerazione del bilanciere e maggiore o uguale all'accelerazione di gravita (-9.81 m/s^2).",
        "ruolo": "Esclude la fase di decelerazione passiva tipica dei pesi submassimali, fornendo la metrica piu affidabile e scientifica per stimare l'1RM nel VBT.",
        "zona": 'Colonna 4, Riga 2 (VBT & PAP Biomechanics).',
        "flows": ['#10']
    },
    {
        "name": 'MediaPipe BlazePose 3D (Edge Pose Estimation su Video Mobile)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Calcola i punti del corpo direttamente sullo smartphone del coach.',
        "spiegazione": "Modello di machine learning leggero sviluppato da Google per l'inferenza in tempo reale sul dispositivo di 33 landmark anatomici 3D.",
        "ruolo": "Esegue il tracciamento del corpo sul telefono del professionista, riducendo la latenza a zero ed evitando l'upload di video pesanti sul cloud.",
        "zona": 'Colonna 2, Riga 2 e 3 (Coach Hub).',
        "flows": ['#08']
    },
    {
        "name": 'Microciclo MD-X & Modello Titolari vs Panchinari',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Programmazione settimanale scandita a ritroso dal giorno della partita.',
        "spiegazione": 'Struttura di periodizzazione calcistica che pianifica i carichi giornalieri in base ai giorni che mancano alla partita (MD-4, MD-3, ecc.) o che la seguono (MD+1).',
        "ruolo": 'Distingue automaticamente i volumi tra i titolari che necessitano di recupero e i panchinari che devono compensare il mancato carico gara.',
        "zona": 'Colonna 3, Riga 3 (Team Microcycle MD-X).',
        "flows": ['#15']
    },
    {
        "name": 'Mini-Triage Visivo del Benessere',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Questionario rapido illustrato per misurare postura, sonno ed energia.',
        "spiegazione": 'Strumento di autovalutazione visiva non clinico a risposta rapida (inferiore a 60 secondi) basato su sagome corporee interattive per mappare sensazioni di rigidità articolare, affaticamento visivo e livello energetico.',
        "ruolo": 'Determina in tempo reale le micro-pause ergonomiche più adatte al lavoratore senza raccogliere dati diagnostici o informazioni sanitarie sensibili.',
        "zona": 'Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 1 Client.',
        "flows": ['#19']
    },
    {
        "name": "Minimal Detectable Change (MDC 95%) & Cohen's d",
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Certifica se il miglioramento è reale o dovuto al caso.',
        "spiegazione": "L'MDC calcola la variazione minima reale necessaria per superare l'errore di misura dello strumento con confidenza al 95%; il d di Cohen misura l'ampiezza dell'effetto pratico.",
        "ruolo": "Certifica scientificamente al coach se il potenziamento post-attivazione (PAP) o l'aumento di salto CMJ e un reale progresso biologico.",
        "zona": 'Colonna 4, Riga 2 (VBT & PAP).',
        "flows": ['#10']
    },
    {
        "name": 'Modelli AI Interni T7 (Inferenza Dedicata 70% vs 100%)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Modelli AI proprietari T7 a due livelli di potenza.',
        "spiegazione": 'Reti neurali proprietarie T7 ospitate su infrastruttura cloud privata (zero chiamate a fornitori terzi): profilo calibrato al 70% per Tier 2 (veloce, leggero, note sintetiche) e profilo top al 100% per Tier 3 (analisi approfondite illimitate).',
        "ruolo": 'Rispetta il vincolo della nota strategica ("sviluppare modelli AI interni per TIER 2 e TIER 3") garantendo sovranita del dato e sostenibilita dei costi.',
        "zona": 'Colonna 4, Righe 2 e 3 (Corsia 3 Server Scatola Nera).',
        "flows": ['#10', '#16']
    },
    {
        "name": 'Movely Companion App',
        "cat": 'Principi Architetturali di Prodotto',
        "eli5": 'Applicazione per il benessere aziendale e le pause attive.',
        "spiegazione": "Applicazione companion dedicata all'ecosistema Corporate Wellness, concepita per guidare i lavoratori in micro-pause attive alla scrivania, mobilità articolare ed educazione posturale quotidiana.",
        "ruolo": 'Offre ai dipendenti aziendali un punto di accesso leggero al benessere lavorativo, separato fisicamente da carichi atletici pesanti e referti clinici, persistito su Silo 1.',
        "zona": 'Companion Apps: Movely Ecosystem (#19 / #M1), Silo 1.',
        "flows": ['#19']
    },
    {
        "name": 'Movely Corporate Wellness & Ergonomic Engine',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Consiglia micro-pause attive per proteggere la postura da ufficio.',
        "spiegazione": 'Modulo per la prevenzione dei disturbi muscolo-scheletrici da lavoro sedentario che notifica routine di mobilità articolare e stretching.',
        "ruolo": 'Monitora i tempi di inattivita alla scrivania e propone esercizi a basso impatto senza richiedere abbigliamento sportivo, tutelando la privacy dei lavoratori.',
        "zona": 'Colonna 6, Riga 1 (Movely Desk-Care).',
        "flows": ['#06']
    },
    {
        "name": 'mTLS (Mutual Transport Layer Security) & Chiavi Hardware FIDO2',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": "Doppia chiave e chiavetta fisica per blindare l'accesso societario.",
        "spiegazione": 'Autenticazione bidirezionale crittografica tra client e server integrata con token fisici a tocco per prevenire intercettazioni man-in-the-middle.',
        "ruolo": 'Garantisce che solo i dispositivi registrati e certificati dallo staff societario possano connettersi al Bunker Silo 2 del club.',
        "zona": 'Colonna 1, Riga 3 (Bunker Onboarding Security Gate).',
        "flows": ['#13']
    },
    {
        "name": 'Multi-Camera 4K Sync & Secret Club Vault',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'Caveau che sincronizza video multi-angolari per lo staff societario.',
        "spiegazione": 'Infrastruttura di storage cloud criptata a tenuta stagna che sincronizza i flussi video ad altissima risoluzione registrati da telecamere simultanee.',
        "ruolo": 'Consente a staff medico e match analyst di vivisezionare infortuni o gesti atletici da angolazioni multiple perfettamente sincronizzate al frame.',
        "zona": 'Colonna 2, Riga 3 (Multi-Staff Cockpit).',
        "flows": ['#14']
    },
    {
        "name": 'MVT (Minimum Velocity Threshold)',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'La velocità minima sotto cui il bilanciere non sale.',
        "spiegazione": "Velocita media concentrica limite al di sotto della quale l'atleta non riesce a completare l'alzata prima del cedimento neuromuscolare.",
        "ruolo": "Punto di ancoraggio terminale della retta di regressione carico-velocita per calcolare l'1RM teorico giornaliero con precisione millimetrica.",
        "zona": 'Colonna 4, Riga 2 (VBT Biomechanics).',
        "flows": ['#10']
    },
    {
        "name": 'Open Access Papers (Studi Scientifici Pubblici e Gratuiti)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Articoli scientifici liberi che chiunque puo leggere gratis senza abbonamento.',
        "spiegazione": 'Pubblicazioni accademiche peer-reviewed distribuite con licenze aperte (Creative Commons CC-BY) liberamente consultabili e fruibili dal pubblico senza barriere di pagamento.',
        "ruolo": 'Costituisce la base documentale di Tier 1 (e superiore) nella Libreria Fonti, consentendo la consultazione protetta in sola lettura in-app.',
        "zona": 'Colonna 5, Righe 1, 2 e 3 (Libreria Fonti).',
        "flows": ['#05', '#11', '#17']
    },
    {
        "name": 'OrbitControls (Yaw 360° e Pitch Zenitale/Nadir)',
        "cat": 'Grafica 3D, WebGL & Rendering Biomeccanico',
        "eli5": 'Ruota la visuale con le dita per ogni angolazione.',
        "spiegazione": 'Controllore di telecamera interattivo WebGL che consente di ruotare su asse azimutale (Yaw 360°) e polare (Pitch) con zoom progressivo.',
        "ruolo": "Permette all'utente di esaminare l'esecuzione dell'omino 3D da qualunque prospettiva (zenitale, laterale o dal basso) per capire la cinematica.",
        "zona": 'Colonna 2, Riga 1, 2 e 3.',
        "flows": ['#02']
    },
    {
        "name": 'ORCID Researcher Verification',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": "Verifica ufficiale tramite identità accademica ORCID per accedere all'area ricercatori.",
        "spiegazione": "Procedura di autenticazione e convalida accademica basata sulle API OAuth di ORCID (Open Researcher and Contributor ID), che certifica l'affiliazione universitaria o l'attività di ricerca scientifica del professionista.",
        "ruolo": "Abilita i ricercatori e i docenti universitari all'interno del Marketplace Pro (FLOW-TS2) alla pubblicazione di bandi per la raccolta di volontari e alla moderazione di tavole rotonde peer-to-peer tra scienziati dello sport.",
        "zona": 'Companion Apps: Together Social (#21 / #TS2) e Corsia 2 Gateway.',
        "flows": ['#21']
    },
    {
        "name": 'Osgnach Metabolic Power (W/kg) & High Metabolic Load Distance',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Energia spesa nelle accelerazioni anche a bassa velocità lineare.',
        "spiegazione": 'Modello bioenergetico di Pietro Enrico di Prampero e Cristian Osgnach che equipara la corsa accelerata in piano alla corsa a velocita costante in salita.',
        "ruolo": 'Misura il reale dispendio energetico nel calcio durante accelerazioni e decelerazioni brusche, invisibili al semplice computo dei chilometri percorsi.',
        "zona": 'Colonna 4, Riga 3 (GPS Adaptive Z-Score).',
        "flows": ['#16']
    },
    {
        "name": 'PAP (Post-Activation Potentiation)',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Sollevare un carico pesante per saltare più in alto.',
        "spiegazione": 'Fenomeno di facilitazione neuromuscolare in cui una contrazione massimale aumenta la forza e la rapidita dei movimenti successivi.',
        "ruolo": 'Modulo di calcolo per identificare la finestra temporale ideale (tipicamente 4-8 minuti) tra serie pesanti di riscaldamento e salti o sprint ottimali.',
        "zona": 'Colonna 4, Riga 2 (VBT & PAP).',
        "flows": ['#10']
    },
    {
        "name": 'PAR-Q+ (Physical Activity Readiness Questionnaire) & Digital Triage',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": "Questionario rapido che intercetta rischi medici prima dell'allenamento.",
        "spiegazione": "Questionario di autovalutazione dello stato di salute strutturato su 7 quesiti clinici per identificare controindicazioni all'attivita fisica.",
        "ruolo": "Intercetta sintomi cardiorespiratori o dolori articolari all'onboarding: in caso di esito positivo attiva la modalita cautelativa e disabilita esercizi pesanti.",
        "zona": 'Colonna 1, Riga 1 (Consumer Onboarding).',
        "flows": ['#01']
    },
    {
        "name": 'Periodizzazione a Blocchi & Coniugata',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Schemi avanzati che alternano volume, forza massima ed esplosività.',
        "spiegazione": 'Modelli avanzati di programmazione: la periodizzazione a blocchi concentra stimoli omogenei (Accumulo, Trasformazione, Realizzazione); la coniugata allena piu qualita simultaneamente.',
        "ruolo": 'Consente a preparatori di atleti esperti di programmare il raggiungimento del picco di forma in corrispondenza delle gare principali.',
        "zona": 'Colonna 3, Riga 2 (Macrocicli IA).',
        "flows": ['#09']
    },
    {
        "name": 'Potenza di Calcolo AI 100% (Tier 3 Enterprise)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Massima potenza di calcolo senza limiti per club professionistici.',
        "spiegazione": 'Allocazione prioritaria di risorse GPU e cluster dedicati per inferenze LLM illimitate, visione artificiale avanzata e RAG societario privato.',
        "ruolo": 'Alimenta la suite tattica 4K, la traduzione accademica automatica e la clonazione metodologica del capo allenatore.',
        "zona": 'Zona 4, Riga 3 e Corsia 3 Server Scatola Nera.',
        "flows": ['#14', '#15', '#16', '#17']
    },
    {
        "name": 'Progressive LOD (Level of Detail Dinamico WebGL)',
        "cat": 'Grafica 3D, WebGL & Rendering Biomeccanico',
        "eli5": "Riduce i dettagli grafici per mantenere l'animazione sempre fluida.",
        "spiegazione": 'Tecnica di rendering che adatta la complessita poligonale della mesh in base alla distanza di visione e alle performance hardware del dispositivo.',
        "ruolo": 'Evita cali di frame rate e surriscaldamento dello smartphone, mantenendo la visualizzazione degli esercizi fluida a 60 FPS su ogni fascia di dispositivo.',
        "zona": 'Colonna 2, Riga 1 e 2.',
        "flows": ['#02']
    },
    {
        "name": 'Puntatore Relazionale Preferiti (Zero-Duplication Bookmark)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": "Collegamento rapido all'asset originale senza duplicare file pesanti.",
        "spiegazione": "Record leggero su database relazionale che memorizza esclusivamente l'identificativo univoco (bookmark_id) e il tipo di risorsa referenziata, risolvendo l'asset in tempo reale senza mai clonare modelli 3D, video, PDF o report.",
        "ruolo": 'Costituisce la spina dorsale deterministica della Colonna 6 Preferiti su tutti e tre i Tier (Silo 1 per Tier 1/2, Silo 2 Bunker KMS per Tier 3), azzerando la duplicazione dello storage e garantendo coerenza immediata agli aggiornamenti della sorgente.',
        "zona": 'Colonna 6, Righe 1, 2 e 3 (Preferiti) e Corsia 3 / 4.',
        "flows": ['#06', '#12', '#18']
    },
    {
        "name": 'PVT-B (Brief Psychomotor Vigilance Task 3-min)',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Test di reazione rapida per misurare la fatica cerebrale.',
        "spiegazione": 'Test neurocognitivo standardizzato di 3 minuti basato su stimoli visivi casuali (ISI 1-4s). Calcola tempo di reazione mediano (Median RT), velocità di risposta (1/RT), variabilità intra-individuale, lapsus calibrati (RT > 355ms o 2x baseline individuale) e partenze anticipate (false starts < 100ms), quantificando vigilanza comportamentale e attenzione sostenuta.',
        "ruolo": 'In Tier 3 implementa il protocollo duale: somministrazione mattutina a digiuno (baseline del SNC e recupero sistemico) e pre-sessione acuta (arousal e prontezza neuromuscolare immediata). Rileva la fatica centrale prima dei cali prestativi fisici.',
        "zona": 'Colonna 3, Riga 3 (Cockpit Élite Tier 3) e Corsia 1 / 3.',
        "flows": ['#15', '#16']
    },
    {
        "name": 'RAG 100% Private (Isolamento Totale Dati Societari)',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'AI blindata che impara solo dai documenti societari interni.',
        "spiegazione": "Architettura di Retrieval-Augmented Generation confinata all'interno di un'enclave crittografica dedicata per singolo club (Silo 2 KMS), con divieto assoluto di trasmissione verso modelli di terze parti o dataset pubblici.",
        "ruolo": 'Pilastro esclusivo del Tier 3: garantisce che cartelle cliniche, note vocali, contratti e studi societari rimangano di proprieta esclusiva del club al 100%.',
        "zona": 'Colonna 4, Riga 3 (Corsia 3 Server e Corsia 4 Silo 2).',
        "flows": ['#16']
    },
    {
        "name": 'RAG Gerarchico Scientifico (Retrieval-Augmented Generation)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Motore AI che risponde attingendo solo a studi scientifici.',
        "spiegazione": 'Architettura di generazione potenziata da recupero semantico su database di letteratura biomedica con pesatura gerarchica delle fonti (RCT 1.3, Coorte 1.1, Expert 1.0).',
        "ruolo": 'Genera spiegazioni e programmi di allenamento rigorosamente ancorati alle evidenze scientifiche, azzerando le allucinazioni tipiche dei modelli generici.',
        "zona": 'Zona 2 (Scientific RAG Engine) e Corsia 3 Server.',
        "flows": ['#08', '#09']
    },
    {
        "name": 'RAG Sync Libreria Fonti (Sincronizzazione Bunker Silo 2)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Invia studi al bunker RAG per potenziare la squadra.',
        "spiegazione": "Pipeline di ingestione semantica e vettorizzazione che indicizza con un click un articolo scientifico o un riassunto approvato all'interno dello schema `team_scientific_rag` protetto da Cloud KMS nel Bunker Silo 2.",
        "ruolo": 'Crea il ponte strategico tra teoria scientifica e pianificazione pratica: le evidenze sincronizzate alimentano direttamente i motori decisionali di Programmazione (#15) e Data Analisi (#16).',
        "zona": 'Colonna 5, Riga 3 (Libreria Fonti Enterprise).',
        "flows": ['#17']
    },
    {
        "name": 'RBAC (Role-Based Access Control a 3 Tiers x 8 Ruoli)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Assegna permessi su misura a medici, coach e atleti.',
        "spiegazione": "Modello di sicurezza che regola l'accesso alle risorse e alle viste applicative combinando il livello di abbonamento con il ruolo organizzativo dell'utente.",
        "ruolo": 'Regola i permessi degli 8 ruoli formali (Atleta, Coach, Fisioterapista, Medico, Preparatore, Match Analyst, Ricercatore, Admin) tutelando il segreto professionale.',
        "zona": 'Zona 1, Riga 1, 2 e 3 (Onboarding & Access Gate).',
        "flows": ['#01', '#07', '#13']
    },
    {
        "name": 'Regressione OLS (Ordinary Least Squares) per 1RM',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Stima il massimale incrociando carichi e velocità di spinta.',
        "spiegazione": 'Metodo statistico di interpolazione lineare che stima la retta carico-velocita minimizzando la somma dei quadrati delle differenze tra valori osservati e teorici.',
        "ruolo": "Calcola l'1RM teorico giornaliero estrapolando la velocita di soglia minima (MVT) dai dati delle serie di riscaldamento sub-massimali.",
        "zona": 'Colonna 4, Riga 2 (VBT Biomechanics).',
        "flows": ['#10']
    },
    {
        "name": 'Return To Play (RTP)',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Percorso a tappe per rientrare in campo dopo l'infortunio.",
        "spiegazione": "Processo sequenziale basato su criteri clinico-funzionali che guida il reinserimento graduale dell'atleta infortunato fino alla piena attivita competitiva.",
        "ruolo": 'Monitora indici di simmetria degli arti (LSI) e test di carico prima di autorizzare il passaggio alla fase successiva, riducendo drasticamente le ricadute.',
        "zona": 'Colonna 6, Riga 2 e 3.',
        "flows": ['#12', '#18']
    },
    {
        "name": 'Return To Play (RTP) a 6 Fasi Congiunto',
        "cat": 'Telemetria Pro, Performance Tracking & Carico Rosa (Tier 3)',
        "eli5": 'Sei tappe con firma congiunta di medico e preparatore.',
        "spiegazione": "Protocollo riabilitativo avanzato diviso in 6 stadi inderogabili che richiede l'approvazione digitale sia del Medico Sociale che dell'Head Strength & Conditioning Coach.",
        "ruolo": 'Elimina discrezionalita soggettive nelle societa di Serie A ed elite, sbloccando i carichi di squadra solo dopo il superamento oggettivo di ogni fase.',
        "zona": 'Colonna 6, Riga 3 (Medical Room EMR Silo 3).',
        "flows": ['#18']
    },
    {
        "name": 'Revisione Biomeccanica Deterministica (Calcolo Angoli Principali NO AI)',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": "Misurazione matematica pura degli angoli articolari senza usare l'intelligenza artificiale.",
        "spiegazione": "Algoritmo geometrico basato sul prodotto scalare di vettori cartesiani che ricava l'ampiezza in gradi tra due segmenti corporei senza reti neurali, senza RAG e senza correlazioni con altre sezioni.",
        "ruolo": "Cuore del modulo Data Analisi di Tier 1 (FLOW-4A): offre all'utente amatoriale un goniometro digitale trasparente a costo computazionale zero.",
        "zona": 'Colonna 4, Riga 1 (Data Analisi Consumer).',
        "flows": ['#04']
    },
    {
        "name": 'Revisione Coerente AI (Multimodal RAG & Web Biomechanical Audit)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'AI che analizza video ed esercizi suggerendo correzioni scientifiche.',
        "spiegazione": "Pipeline di audit intelligente che analizza contemporaneamente la registrazione video dell'esercizio e le note scritte del preparatore confrontandole con la letteratura scientifica.",
        "ruolo": "Fornisce una revisione tecnica oggettiva al coach, evidenziando incongruenze anatomiche o rischi lesivi prima che l'esercizio sia salvato nel catalogo.",
        "zona": 'Colonna 2, Riga 2 e 3.',
        "flows": ['#08']
    },
    {
        "name": 'Ricerca Ibrida Preferiti (PostgreSQL tsvector + pgvector AI)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Combina ricerca esatta per parole e ricerca semantica AI.',
        "spiegazione": 'Motore di recupero documentale a doppio canale che fonde lo score lessicale full-text (PostgreSQL tsvector con indice GIN) e la similarita coseno su vettori semantici (pgvector HNSW), integrando fusione RRF e reranking contestuale.',
        "ruolo": "Permette allo staff di Tier 3 di ritrovare istantaneamente esercizi 4K, programmi annuali, report Data Analisi, studi scientifici, file RAG e referti nell'enclave privata Silo 2 Bunker KMS.",
        "zona": 'Colonna 6, Riga 3 (Preferiti Enterprise) e Corsia 3 / 4.',
        "flows": ['#18']
    },
    {
        "name": 'Robust Z-Score (MAD - Median Absolute Deviation)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Standardizzazione statistica protetta da errori e valori anomali estremi.',
        "spiegazione": 'Tecnica statistica non parametrica che normalizza le metriche usando la mediana e la MAD: Z_robust = (x - mediana) / (1.4826 * MAD), dove MAD = mediana(|x_i - mediana(x)|). Sostituisce media e deviazione standard classiche.',
        "ruolo": 'Normalizza parametri eterogenei su rolling window di 28 giorni senza subire distorsioni da singoli outlier o distribuzioni asimmetriche, garantendo baseline stabili per carico interno, esterno e test cognitivi.',
        "zona": 'Colonna 3 e 4, Riga 3 e Corsia 3 Server.',
        "flows": ['#15', '#16']
    },
    {
        "name": 'Role-Based RAG (Controllo Accessi Gerarchico Medico / S&C / Atleta)',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'Accesso gerarchico alle risposte AI per proteggere il segreto.',
        "spiegazione": "Meccanismo di recupero e filtraggio vettoriale condizionato dal ruolo dell'utente: i referti sanitari guidano i vincoli di carico per l'allenatore senza esporre diagnosi confidenziali tutelate dal segreto professionale.",
        "ruolo": "Risolve il conflitto storico tra area medica e area tecnica nel Tier 3, consentendo prevenzione automatica senza violare la privacy dell'atleta.",
        "zona": 'Colonna 4, Riga 3 (Data Analisi Elite) e Colonna 6, Riga 3 (Medical Room).',
        "flows": ['#16', '#18']
    },
    {
        "name": 'Rolling Reserve & Escrow Anti-Chargeback',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Somma trattenuta a garanzia contro contestazioni o rimborsi bancari.',
        "spiegazione": 'Meccanismo prudenziale di pagamento in cui una percentuale dei compensi incassati dal professionista viene trattenuta in garanzia per un intervallo prefissato.',
        "ruolo": 'Protegge la piattaforma e gli utenti finali da chargeback bancari fraudolenti o inadempienze contrattuali nei servizi del marketplace Together Pro.',
        "zona": 'Colonna 1 e 5, Riga 2.',
        "flows": ['#07']
    },
    {
        "name": 'Routing Ortogonale & Standard Zero-Crossing (Design Diagrammi ISO)',
        "cat": 'Principi Architetturali di Prodotto',
        "eli5": 'Frecce a novanta gradi senza sovrapposizioni tra i riquadri.',
        "spiegazione": 'Regola grafica per la progettazione di diagrammi tecnici che impone segmenti connettori a 90 gradi instradati unicamente in corridoi dedicati.',
        "ruolo": 'Azzeramento delle sovrapposizioni visive sulle board Miro e massima chiarezza comunicativa tra architetti software, clinici e programmatori.',
        "zona": 'Regola 10 su tutti i 18 Flowchart (Zona 4).',
        "flows": ['#01', '#02', '#03', '#04', '#05', '#06', '#07', '#08', '#09', '#10', '#11', '#12', '#13', '#14', '#15', '#16', '#17', '#18']
    },
    {
        "name": 'SAML 2.0 Enterprise Federation & Single Sign-On',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'Accesso aziendale unificato con le credenziali ufficiali del club.',
        "spiegazione": 'Protocollo di autenticazione federata basato su asserzioni XML crittografiche scambiate tra un Identity Provider aziendale e il service provider.',
        "ruolo": 'Permette ai club di connettere il proprio gestionale aziendale (es. Microsoft Entra ID o Okta) per gestire le utenze di dirigenti, medici e staff in modo centralizzato.',
        "zona": 'Colonna 1, Riga 3 (Bunker Onboarding KMS).',
        "flows": ['#13']
    },
    {
        "name": 'Scala VAS del Dolore (Visual Analogue Scale 0-10)',
        "cat": 'Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)',
        "eli5": 'Cursore da zero a dieci dove indicare il dolore.',
        "spiegazione": 'Strumento di misurazione unidimensionale del dolore soggettivo rappresentato da una linea continua graduata da 0 (nessun dolore) a 10 (dolore insopportabile).',
        "ruolo": "Consente al paziente di registrare il dolore articolare durante l'esecuzione degli esercizi riabilitativi; punteggi VAS >= 4 bloccano la progressione del carico.",
        "zona": 'Colonna 6, Riga 2 (Physio Rehab ROM).',
        "flows": ['#12']
    },
    {
        "name": 'Scale RPE & RIR (Borg CR10 / Reps in Reserve)',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Voto della fatica percepita e ripetizioni rimaste di riserva.',
        "spiegazione": "Metodologie di quantificazione soggettiva dello sforzo: la scala RPE (Borg CR10) misura la fatica percepita; l'indice RIR specifica il numero di ripetizioni residue prima del cedimento.",
        "ruolo": "Regola l'autoregolazione del carico nel Workout Player quando non sono presenti encoder lineari, adeguando le serie residue allo stato di forma del momento.",
        "zona": 'Colonna 3, Riga 1 (Workout Player).',
        "flows": ['#03']
    },
    {
        "name": 'Schede Tecniche di Sintesi (Studi Premium Copyright-Safe)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Riassunti pratici e legali dei migliori studi a pagamento.',
        "spiegazione": "Documenti strutturati redatti da ricercatori e revisori accademici che distillano obiettivi, metodologia, evidenze numeriche e applicazioni pratiche per l'allenatore relative a studi protetti da copyright editoriale, corredati da link DOI ufficiale.",
        "ruolo": 'Funzionalita fondamentale di Tier 2 e Tier 3 che consente ai professionisti di aggiornarsi sulle ricerche internazionali ad alto costo nel pieno rispetto della legge.',
        "zona": 'Colonna 5, Righe 2 e 3 (Libreria Fonti Pro ed Enterprise).',
        "flows": ['#11', '#17']
    },
    {
        "name": 'Secret Club Vault & Multi-Camera 4K Sync',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'Archivio criptato multi-angolare riservato allo staff della società.',
        "spiegazione": 'Archivio multimediale a tenuta stagna integrato con algoritmi di sincronizzazione temporale al millisecondo per riprese multi-angolo ad alta definizione.',
        "ruolo": 'Custodisce registrazioni tattiche e biomeccaniche ad accesso ristretto, impedendo diffusioni non autorizzate o perdite di materiale proprietario del club.',
        "zona": 'Colonna 2, Riga 3 (Multi-Staff Cockpit).',
        "flows": ['#14']
    },
    {
        "name": 'Separazione Database Data Analisi vs Catalogo (Isolamento Tier 2)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'I video di analisi restano isolati fuori dal catalogo.',
        "spiegazione": 'Principio architetturale di segregazione per cui in Tier 2 le registrazioni video con correzioni trascritte risiedono esclusivamente nel database di Data Analisi, impedendo la scrittura nello schema del Catalogo Esercizi.',
        "ruolo": 'Impedisce inquinamento della libreria standard in Tier 2, riservando la sincronizzazione video con il Catalogo solo al Tier 3 (FLOW-4C verso FLOW-2C).',
        "zona": 'Colonna 4, Riga 2 (Corsia 4 Silo 1 Pro).',
        "flows": ['#10']
    },
    {
        "name": 'Service Worker Offline-First & Cache Storage API',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": "Garantisce il pieno funzionamento dell'app anche senza connessione internet.",
        "spiegazione": 'Script in background del browser che intercetta le richieste di rete servendo asset memorizzati localmente e gestendo la sincronizzazione asincrona.',
        "ruolo": "Rende la PWA pienamente operativa anche in ambienti senza segnale (palestre interrate, campi isolati), garantendo caricamento istantaneo dell'interfaccia.",
        "zona": 'Colonna 3, Riga 1 (Workout Player).',
        "flows": ['#03']
    },
    {
        "name": 'Smart Clinic Zero-Coda',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Prenotazione rapida di visite specialistiche convenzionate senza attese.',
        "spiegazione": 'Sistema di prenotazione in tempo reale di visite fisioterapiche, valutazioni posturali ed esami specialistici presso cliniche convenzionate con check-in digitale e zero tempi di attesa.',
        "ruolo": "Gestisce la sola logistica dell'appuntamento e l'utilizzo dei voucher welfare, escludendo l'archiviazione o il transito di referti medici all'interno dell'app Movely.",
        "zona": 'Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 1 / 2.',
        "flows": ['#19']
    },
    {
        "name": 'SMPTE Timecode Multi-Camera Synchronization',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Allinea al millisecondo più telecamere puntate sullo stesso atleta.',
        "spiegazione": 'Protocollo standard di sincronizzazione temporale cinematografica (SMPTE) che aggancia i flussi video registrati contemporaneamente da diverse angolazioni (frontale, laterale, zenitale) garantendo un disallineamento inferiore a 10 millisecondi.',
        "ruolo": 'Permette allo staff della prima squadra di visualizzare il gesto tecnico da 3 prospettive sincronizzate o di confrontarlo con il Digital Twin 3D.',
        "zona": 'Colonna 2, Riga 3 (Multi-Staff Cockpit).',
        "flows": ['#14']
    },
    {
        "name": 'Soggetto Volontario Cavia Tokenomics',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Incentivi in crediti per utenti che partecipano volontariamente a ricerche.',
        "spiegazione": 'Sistema di micro-tokenomics cross-ecosistema che premia gli atleti B2C che accettano di candidarsi come volontari ("cavie") per tesi, studi scientifici o protocolli universitari pubblicati da ricercatori e preparatori.',
        "ruolo": 'Collega in modo etico la community amatoriale (FLOW-TS1) con i bandi di ricerca accademica del Marketplace Pro (FLOW-TS2), accreditando token spendibili in sconti su abbonamenti, gadget o consulenze specialistiche.',
        "zona": 'Companion Apps: Together Social (#20 / #TS1, #21 / #TS2) e Corsia 3 / 4 Silo 1.',
        "flows": ['#20', '#21']
    },
    {
        "name": 'Staff Recruiting & Scouting Board',
        "cat": 'Principi Architetturali di Prodotto',
        "eli5": 'Bacheca riservata per assumere preparatori, fisioterapisti e analisti sportivi qualificati.',
        "spiegazione": 'Bacheca di offerte e candidature riservata al recruiting di staff tecnico e sanitario (preparatori atletici, sport scientist, video analyst, fisioterapisti), con filtri basati su certificazioni, paper pubblicati ed esperienza sul campo verificata.',
        "ruolo": "Facilita l'incontro trasparente e confidenziale tra club di vertice ed eccellenze professionali del movimento umano (FLOW-TS3), eliminando intermediari e garantendo la veridicità dei titoli tramite controlli di piattaforma.",
        "zona": 'Companion Apps: Together Social (#22 / #TS3) e Corsia 1 / 3.',
        "flows": ['#22']
    },
    {
        "name": 'Step-Up Verification (Verifica Telefono Anti-Troll per Community)',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Richiede il cellulare per bloccare profili falsi e molesti.',
        "spiegazione": "Meccanismo di sicurezza condizionale che richiede un'autenticazione a due fattori via SMS unicamente quando l'utente vuole pubblicare post o messaggiare.",
        "ruolo": "Mantiene l'iscrizione base veloce e accessibile, bloccando pero bot farm e profili fake all'interno del social network Movely Together.",
        "zona": 'Colonna 1 e 5, Riga 1.',
        "flows": ['#01', '#05']
    },
    {
        "name": 'Stripe Identity & Biometric Liveness 3D',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Scansione facciale 3D contro documenti falsi o foto statiche.',
        "spiegazione": "Servizio di verifica dell'identita che combina scansione OCR di documenti ufficiali (patente, CIE) con rilevamento biometrico dinamico della vitalita facciale.",
        "ruolo": "Accerta l'autenticita dell'identita dei coach e professionisti prima di consentire l'incasso di denaro e la creazione di conti su Stripe Connect.",
        "zona": 'Colonna 1, Riga 2 (Onboarding Pro).',
        "flows": ['#07']
    },
    {
        "name": 'Swimlanes (Corsie Architetturali nei Flowchart)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Corsie grafiche nei diagrammi che separano app, server e database.',
        "spiegazione": 'Suddivisione a corsie parallele nei diagrammi di flusso di processo che assegna ogni azione allo specifico livello architetturale responsabile.',
        "ruolo": 'Separa rigidamente Thin Client UI, API Gateway, Server Scatola Nera e Database Silos nei 18 diagrammi di flusso della Zona 4.',
        "zona": 'Tutti i 18 Flowchart (Zona 4).',
        "flows": ['#01', '#02', '#03', '#04', '#05', '#06', '#07', '#08', '#09', '#10', '#11', '#12', '#13', '#14', '#15', '#16', '#17', '#18']
    },
    {
        "name": 'Tactical Vision & Omografia Prospettica 2D da Telecamera Campo',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Trasforma le riprese della tribuna in lavagna tattica zenitale.',
        "spiegazione": 'Trasformazione geometrica proiettiva che rimappa i punti ripresi da una telecamera prospettica sulle coordinate piane 2D del terreno di gioco.',
        "ruolo": 'Converte video tattici registrati dagli spalti in mappe 2D zenitali navigabili per analizzare distanze, linee di passaggio e spaziature della squadra.',
        "zona": 'Colonna 5, Riga 3 (Tactical Video CV).',
        "flows": ['#17']
    },
    {
        "name": 'Tassonomia MeSH Sportiva (Classificazione Ricerca)',
        "cat": 'Ricerca Scientifica & Documentazione Accademica (Tier 1-2-3)',
        "eli5": 'Sistema standard per classificare e trovare gli studi scientifici.',
        "spiegazione": 'Albero tassonomico Medical Subject Headings (MeSH) integrato con descrittori specialistici di scienze motorie per la catalogazione rigorosa delle pubblicazioni peer-reviewed.',
        "ruolo": 'Organizza le ricerche scientifiche in macro-categorie e filtri specialistici per consentire recuperi documentali precisi in Libreria Fonti.',
        "zona": 'Colonna 5, Righe 1, 2 e 3 (Libreria Fonti).',
        "flows": ['#05', '#11', '#17']
    },
    {
        "name": 'Telestrator & Tactical Video Annotations',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Disegna frecce, traiettorie e linee direttamente sopra i video.',
        "spiegazione": 'Strumento di overlay grafico e disegno vettoriale dinamico che consente ai preparatori e match analyst di tracciare frecce direzionali, linee di spinta, vettori di forza articolare in Newton e cerchi di evidenziazione sui singoli fotogrammi del video.',
        "ruolo": 'Trasforma i video del club in schede didattiche interattive e visualizza le sollecitazioni articolari prima della validazione congiunta con il medico sociale.',
        "zona": 'Colonna 2, Riga 3 (Multi-Staff Cockpit).',
        "flows": ['#14']
    },
    {
        "name": 'Template Riutilizzabili Preferiti (Clonazione Modelli Pro)',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Schede salvate come modelli base pronti per nuovi clienti.',
        "spiegazione": "Meccanismo deterministico che contrassegna programmi di allenamento di Tier 2 (#09) come modelli riutilizzabili nei Preferiti, consentendo la clonazione parametrica su nuovi clienti senza alterare l'originale.",
        "ruolo": 'Riduce i tempi di compilazione delle schede per preparatori e fisioterapisti P.IVA (FLOW-6B) mantenendo la separazione rigorosa dai dati di Data Analisi.',
        "zona": 'Colonna 6, Righe 2 e 3 (Preferiti Pro ed Enterprise) e Corsia 3 Server.',
        "flows": ['#12', '#18']
    },
    {
        "name": 'Text-to-Kinematics 3D Synthesis (Generatore di Esercizi Solo-Testo)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Genera animazioni 3D partendo solo dalla descrizione del coach.',
        "spiegazione": "Modello generativo di machine learning che converte istruzioni descrittive testuali in sequenze di rotazioni articolari per l'avatar 3D.",
        "ruolo": 'Consente a coach e staff (Tier 2/3) di creare varianti personalizzate di esercizi senza dover registrare video reali in palestra.',
        "zona": 'Colonna 2, Riga 2 e 3 (Coach Hub).',
        "flows": ['#08']
    },
    {
        "name": 'Thin Client (Guscio Visivo)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Interfaccia leggera mentre i calcoli restano protetti sul server.',
        "spiegazione": "Applicazione client leggera focalizzata unicamente sulla gestione dell'interfaccia utente e priva di algoritmi matematici o formule nel codice sorgente.",
        "ruolo": 'Protegge la proprieta intellettuale (IP) di T7: formule di carico, regressioni VBT e triage clinico risiedono esclusivamente sul server centrale.',
        "zona": 'Corsia 1 di tutti i Flowchart (Zona 4) e Topologia C4.',
        "flows": ['#01', '#02', '#03', '#04', '#05', '#06']
    },
    {
        "name": 'Together Pro Marketplace & Video Annotazione Tecnica',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Vetrina dove i professionisti vendono consulenze e video-analisi tecniche.',
        "spiegazione": 'Ecosistema commerciale B2B integrato con strumenti WebRTC per la revisione e sovraimpressione di linee guida grafiche su video inviati dagli atleti.',
        "ruolo": 'Permette a preparatori e chinesiologi di monetizzare consulenze a distanza erogando feedback biomeccanici certificati con compensi protetti da Stripe.',
        "zona": 'Colonna 5, Riga 2 (Together Pro Business).',
        "flows": ['#11']
    },
    {
        "name": 'Together Social Network & Movely Marketplace',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Community sportiva per condividere allenamenti e prenotare consulenze professionali.',
        "spiegazione": 'Ambiente social e commerciale che connette utenti casual con la rete di coach, chinesiologi e fisioterapisti qualificati della piattaforma.',
        "ruolo": "Favorisce la fidelizzazione e la motivazione all'allenamento permettendo la condivisione di traguardi e l'ingaggio di professionisti certificati.",
        "zona": 'Colonna 5, Riga 1 (Together Social B2C).',
        "flows": ['#05']
    },
    {
        "name": 'Together Social Workout Sharing',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": "Condivisione su Together Social dei dati generici dell'allenamento completato.",
        "spiegazione": "Funzionalità integrata nell'ecosistema T7 Workout che genera un riepilogo con metriche generiche (durata, volume totale, esercizi svolti) al termine della sessione registrata, permettendo la condivisione all'interno del social network Together Social per stimolare la community senza esporre dati sensibili.",
        "ruolo": "Abilita la condivisione social peer-to-peer e community-driven tra gli atleti dei Tier 1, 2 e 3 sull'app integrata Together Social.",
        "zona": 'Colonna 3, Righe 1, 2 e 3 (Programmazione degli Esercizi) e Corsia 1 / 4.',
        "flows": ['#03', '#09', '#15']
    },
    {
        "name": 'Tonnellaggio & Volume di Carico (Sets x Reps x Kg)',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Chili complessivi sollevati durante l'intera seduta di allenamento.",
        "spiegazione": 'La somma cumulativa della massa sollevata per ogni ripetizione completata: Tonnellaggio = Somma(Serie * Ripetizioni * Carico in kg).',
        "ruolo": 'Metrica fondamentale per quantificare il volume meccanico della sessione e calcolare la densita di carico nel Workout Player.',
        "zona": 'Colonna 3, Riga 1 (Workout Player).',
        "flows": ['#03']
    },
    {
        "name": 'Training Readiness Composite Score',
        "cat": 'Telemetria Wearable & Dispositivi Mobili',
        "eli5": 'Indice giornaliero da zero a cento sulla prontezza fisica.',
        "spiegazione": 'Indice sintetico ponderato (scala 0-100) derivato dalla combinazione di qualita del sonno, variabilita cardiaca HRV a riposo e carico pregresso.',
        "ruolo": "Comunica immediatamente all'atleta se e opportuno affrontare una sessione intensa o ridurre il carico per evitare sovrallenamento.",
        "zona": 'Colonna 4, Riga 1 (Wearable Sync).',
        "flows": ['#04']
    },
    {
        "name": 'Triage Clinico Patologie & ImpactCalculator',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Filtro medico che blocca o adatta gli esercizi pericolosi.',
        "spiegazione": "Motore algoritmico basato su una matrice clinica di 119 patologie che calcola l'impatto biomeccanico articolare di ciascun esercizio del catalogo.",
        "ruolo": "Classifica gli esercizi in Esclusi, Adattati (con restrizioni di ROM) o Disponibili, salvaguardando l'atleta da movimenti potenzialmente lesivi.",
        "zona": 'Colonna 3, Riga 2 (Macrocicli IA & Triage 119).',
        "flows": ['#09']
    },
    {
        "name": 'Trigonometria Deterministica 2D (Goniometro Digitale)',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Goniometro digitale che calcola gradi esatti senza tirare a indovinare.',
        "spiegazione": "Calcolo geometrico e trigonometrico bidimensionale sul piano di ripresa video basato sul prodotto scalare di vettori cartesiani tra coordinate di keypoint articolari (es. anca-ginocchio-caviglia per la flesso-estensione), restituendo l'angolo articolare esatto in gradi senza alcuna inferenza probabilistica, rete neurale o modello black-box.",
        "ruolo": "Strumento fondamentale del modulo Data Analisi di Tier 1 (FLOW-4A): permette all'utente amatoriale di posizionare marker o misurare i gradi dei principali snodi articolari durante la corsa o un esercizio con esecuzione deterministica a latenza zero sul dispositivo.",
        "zona": 'Colonna 4, Riga 1 (Data Analisi Casual).',
        "flows": ['#04']
    },
    {
        "name": 'Two-Phase Injury Risk Architecture (Architettura Rischio Infortuni)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Doppio filtro matematico per bloccare gli atleti a rischio.',
        "spiegazione": 'Modello predittivo a due stadi: la Fase 1 esegue una matrice deterministica di Red Flags (hard-stop vincolanti su asimmetrie > 15%, spike ACWR > 1.50 e deficit neurali); la Fase 2 stima il rischio continuo tramite regressione logistica multivariata o machine learning calibrato su serie longitudinali di club.',
        "ruolo": "Tutela l'integrità degli atleti di Tier 3 bloccando sessioni a rischio trauma acuto (Fase 1) e guidando lo staff tecnico nella regolazione fine del volume e intensità settimanale (Fase 2).",
        "zona": 'Colonna 3, Riga 3 (Readiness Section Tier 3) e Corsia 3 Server.',
        "flows": ['#15']
    },
    {
        "name": 'Universal Multi-Format Export (Report, Grafici, Presentazioni)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Esporta analisi in PDF, Excel, Word e PowerPoint liberamente.',
        "spiegazione": 'Motore documentale integrato che compila tabelle telemetriche, grafici cinematici e relazioni tecniche in molteplici formati interoperabili (.pdf, .xlsx protetto=false, .docx, .pptx, .csv).',
        "ruolo": 'Fornisce agli staff professionistici di Tier 3 la massima liberta di condivisione interna verso atleti, dirigenti e consulenti esterni.',
        "zona": 'Colonna 4, Riga 3 (Data Analisi Elite).',
        "flows": ['#16']
    },
    {
        "name": 'Valgismo Dinamico del Ginocchio',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": "Cedimento del ginocchio verso l'interno durante piegamenti o atterraggi.",
        "spiegazione": "Deviazione verso l'interno dell'articolazione del ginocchio durante movimenti di carico, indicativa di debolezza del medio gluteo o deficit di controllo motorio.",
        "ruolo": 'Rilevato automaticamente dalla Computer Vision per segnalare il rischio lesivo a carico del legamento crociato anteriore (LCA).',
        "zona": 'Colonna 2 e 4, Riga 2.',
        "flows": ['#08', '#10', '#12']
    },
    {
        "name": 'Variable Playback Rate & Frame-by-Frame Scrubbing (120fps)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Rallentatore millimetrico per analizzare ogni istante del movimento.',
        "spiegazione": 'Controlli di riproduzione dinamica con velocità variabile (da 0.25x a 2.0x per Tier 2 (1080p); scrubbing frame-by-frame a 120fps per Tier 3 (4K/8K)) per esaminare dettagli impercettibili a occhio nudo come impatti al suolo, deviazioni angolari e inversioni di fase concentrica/eccentrica.',
        "ruolo": 'Fornisce a coach e preparatori uno strumento di precisione chirurgica per la diagnostica biomeccanica e la riatletizzazione.',
        "zona": 'Colonna 2, Righe 2 e 3 (Coach Hub & Multi-Staff Cockpit).',
        "flows": ['#08', '#14']
    },
    {
        "name": 'VBT (Velocity Based Training)',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Misura la velocità di sollevamento per dosare la forza.',
        "spiegazione": "Metodologia di autoregolazione dell'allenamento contro resistenze basata sul tracciamento in tempo reale della velocita propulsiva del bilanciere.",
        "ruolo": "Permette di prescrivere carichi dinamici in base allo stato neuromuscolare effettivo del giorno e stimare l'1RM senza test massimali rischiosi.",
        "zona": 'Colonna 4, Riga 2 (VBT & PAP Biomechanics).',
        "flows": ['#10']
    },
    {
        "name": 'Video Ingest Tiers (Zero Upload Tier 1, 1080p Pro Tier 2, 4K/8K Enterprise Tier 3)',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Regole video: zero upload base, 1080p coach, 4K/8K club.',
        "spiegazione": "Policy architetturale di segmentazione della capacità video: Tier 1 Consumer a **Zero Upload** (dedicato esclusivamente alla consultazione interattiva dell'Avatar 3D e video pre-renderizzato 2D fallback); Tier 2 Pro (Coach e Fisioterapisti P.IVA) con upload video fino a **1080p Full HD a 60fps** (con trimming WebCodecs, controlli di velocità slow-motion 0.25x-2.0x e MediaPipe 3D); Tier 3 Enterprise/Club con acquisizione broadcast **4K / 8K** (multi-camera SMPTE sync, 120fps frame scrubbing, Telestrator tattico, Dynamic Forensic Watermark e doppio livello di libreria Secret Club Vault).",
        "ruolo": "Protegge l'integrità del business model, abbatte i costi di storage su Silo 1, garantisce conformità GDPR e offre un percorso di upgrade coerente e scalabile.",
        "zona": 'Colonna 2, Righe 1, 2 e 3 (Catalogo Esercizi & 3D Video Tiers).',
        "flows": ['#02', '#08', '#14']
    },
    {
        "name": 'VIES & Sistema di Interscambio (SDI)',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Verifica istantanea della Partita IVA e fatturazione elettronica automatica.',
        "spiegazione": "Banca dati europea per la verifica transfrontaliera della validita delle Partite IVA unita al nodo di fatturazione elettronica dell'Agenzia delle Entrate.",
        "ruolo": "Valida in tempo reale le credenziali fiscali dei professionisti nell'onboarding Tier 2, emettendo fatture elettroniche automatiche a norma di legge.",
        "zona": 'Colonna 1, Riga 2 (Setup Fiscale P.IVA).',
        "flows": ['#07']
    },
    {
        "name": 'VIP & Elite Lounges',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": "Spazi di networking riservati a club professionistici e atleti d'elite.",
        "spiegazione": 'Stanze digitali di networking e confronto a invito blindato, crittografate end-to-end e riservate esclusivamente a dirigenti, preparatori e staff di franchigie di Serie A, Eurolega e federazioni olimpiche (Tier 3).',
        "ruolo": 'Garantisce riservatezza assoluta su metodologie avanzate, trattative di staff e casi studio ad alte prestazioni (FLOW-TS3), proteggendo le comunicazioni tramite profilazione crittografica e Ghost Mode.',
        "zona": 'Companion Apps: Together Social (#22 / #TS3) e Corsia 2 / 3.',
        "flows": ['#22']
    },
    {
        "name": 'VIP Priority Inbox Anti-Spam',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Casella messaggi protetta a crediti per filtrare comunicazioni irrilevanti.',
        "spiegazione": 'Meccanismo di messaggistica asimmetrica a micro-tariffe che impone un costo in crediti o token per inviare messaggi diretti a profili ad alta visibilità (coach affermati, atleti di vertice, ricercatori di punta), restituendo i token se il destinatario accetta la conversazione.',
        "ruolo": "Protegge i professionisti accreditati (FLOW-TS2) dall'overload informativo e dallo spam quotidiano, garantendo priorità assoluta alle richieste di consulenza autentiche e alle collaborazioni professionali ad alto valore.",
        "zona": 'Companion Apps: Together Social (#21 / #TS2) e Corsia 2 / 3.',
        "flows": ['#21']
    },
    {
        "name": 'Visualizzatore PDF Protetto In-App (Read-Only)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Lettore interno di documenti che impedisce download non autorizzati.',
        "spiegazione": 'Componente client di rendering vettoriale PDF su canvas isolato che disabilita il menu contestuale, la stampa e il download di file non autorizzati.',
        "ruolo": 'Consente la fruizione di paper protetti in sola lettura rispettando le licenze di distribuzione scientifica.',
        "zona": 'Colonna 5, Riga 1 (Libreria Fonti Tier 1) e Corsia 1 Client.',
        "flows": ['#05']
    },
    {
        "name": 'Wearable T7 (Ecosistema Hardware Proprietario T7)',
        "cat": 'Telemetria Wearable & Dispositivi Mobili',
        "eli5": 'Dispositivi e sensori indossabili ufficiali progettati da T7.',
        "spiegazione": 'Linea di dispositivi hardware proprietari (fasce cardio, sensori inerziali IMU e biosensori per il test del lattato) con protocolli di comunicazione crittografati dedicati.',
        "ruolo": 'In Tier 2 rappresentano gli unici dispositivi indossabili collegabili (lettura dati interni con analisi sommaria delle metriche chiave); in Tier 3 convivono con la compatibilita verso qualsiasi wearable del mercato.',
        "zona": 'Colonna 4, Righe 2 e 3 (Telemetria Wearable).',
        "flows": ['#10', '#16']
    },
    {
        "name": 'WebAuthn (Passkeys & Biometria Hardware)',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Accesso sicuro con impronta o volto senza memorizzare password.',
        "spiegazione": 'Standard aperto di autenticazione crittografica a chiave pubblica gestito tramite enclave sicura hardware (Touch ID, Face ID, Windows Hello).',
        "ruolo": 'Elimina password deboli e rischi di phishing consentendo un accesso sicuro in 1 tap sia su browser web che su app smartphone.',
        "zona": 'Colonna 1, Riga 1 (Consumer Onboarding).',
        "flows": ['#01']
    },
    {
        "name": 'WebCodecs API & Client-Side Lossless Trimming',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Taglia i video direttamente nel browser senza sprecare internet.',
        "spiegazione": "Standard web moderno ad alte prestazioni che consente di decodificare, ritagliare e ricodificare fotogrammi video tramite accelerazione hardware direttamente sul dispositivo dell'utente, senza inviare file pesanti al server per il solo ritaglio di inizio e fine clip.",
        "ruolo": 'Permette il trimming istantaneo e lossless client-side per Tier 2 (taglio clip singola coach) e Tier 3 (multi-traccia SMPTE) eliminando tempi morti ed evitando costi e latenze di transcodifica server.',
        "zona": 'Colonna 2, Righe 1, 2 e 3 (Catalogo 3D & Video Ingest).',
        "flows": ['#02', '#08', '#14']
    },
    {
        "name": 'WebRTC MediaStream & Secure Video Recording',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Registrazione video sicura dal browser senza salvare file non autorizzati.',
        "spiegazione": 'Protocollo di comunicazione in tempo reale che cattura e trasmette flussi video criptati direttamente nel browser senza richiedere plugin esterni.',
        "ruolo": "Consente l'acquisizione di registrazioni video in palestra per l'analisi cinematica e le video-consulenze a distanza tra coach e allievi.",
        "zona": 'Colonna 2 e 5, Riga 2 (Coach Hub & Together Pro).',
        "flows": ['#08', '#11']
    },
    {
        "name": 'Workout Session Tracker (Avvia Sessione)',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Interfaccia da palestra per registrare serie, carichi, ripetizioni e recuperi.',
        "spiegazione": "Interfaccia interattiva da palestra che si avvia con il pulsante 'Avvia Sessione' all'apertura del programma giornaliero o di un workout libero, dotata di timer di recupero inter-serie, spunta delle serie completate e campi di input per inserire i carichi effettivi sollevati in kg e le ripetizioni reali eseguite.",
        "ruolo": 'Fornisce il player esecutivo in sala pesi su tutti i 3 Tier, registrando i volumi reali sul database e predisponendo i dati generici per la condivisione social.',
        "zona": 'Colonna 3, Righe 1, 2 e 3 (Programmazione degli Esercizi) e Corsia 1 Client.',
        "flows": ['#03', '#09', '#15']
    },
    {
        "name": 'WORM Storage (Write-Once-Read-Many) Audit Logs',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'Registro blindato in cui nessuno può cancellare le registrazioni.',
        "spiegazione": 'Tecnologia di archiviazione digitale immutabile in cui i dati possono essere registrati una sola volta e non possono essere alterati ne cancellati da nessun amministratore.',
        "ruolo": 'Custodisce i log di accesso a referti medici, contratti e manleve dei club sportivi garantendo valenza probatoria e conformita GDPR.',
        "zona": 'Colonna 1, Riga 3 (Enterprise Bunker Onboarding).',
        "flows": ['#13']
    },
    {
        "name": 'YOLOv8 Deep Learning Object Detection da Campo',
        "cat": 'Video Analysis In-App, AI Multimodale & Custom Exercise Creator',
        "eli5": 'Riconosce istantaneamente giocatori, arbitri e pallone nei video.',
        "spiegazione": 'Rete neurale convoluzionale ad altissima velocita per il rilevamento di oggetti multipli in tempo reale su flussi video complessi.',
        "ruolo": 'Individua e traccia continuamente le posizioni dei calciatori e del pallone sui filmati delle partite registrati dalla tribuna.',
        "zona": 'Colonna 5, Riga 3 (Tactical Vision CV).',
        "flows": ['#17']
    },
    {
        "name": 'Z-Score Adattivo (Normalizzazione Statistica)',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Confronta i parametri odierni con la media storica personale.',
        "spiegazione": "Misura di deviazione statistica che standardizza un valore osservato rispetto alla media e deviazione standard personale dell'atleta: z = (x - mu) / sigma.",
        "ruolo": 'Confronta parametri biometrici eterogenei (sonno, HRV, RPE, carichi GPS) su una scala universale priva di unita di misura per prevenire sovraccarichi.',
        "zona": 'Colonna 4, Riga 3 (GPS Adaptive Z-Score).',
        "flows": ['#16']
    },
    {
        "name": 'Z-Weighting & Gestione Doppio Ruolo Tattico',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Pesa i chilometri corsi in base alla posizione tattica.',
        "spiegazione": 'Ponderazione algoritmica che ricalcola i riferimenti prestativi quando un calciatore gioca in posizioni tattiche differenti (es. terzino vs difensore centrale).',
        "ruolo": 'Evita di penalizzare o sovrastimare un atleta valutando il suo carico esterno rispetto alla specifica richiesta biomeccanica della sua posizione in campo.',
        "zona": 'Colonna 4, Riga 3 (GPS Adaptive Z-Score).',
        "flows": ['#16']
    },
    {
        "name": 'Zero AI Biomeccanica (Elaborazione Matematica Pura)',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Zero intelligenza artificiale: solo calcoli matematici certi e verificabili.',
        "spiegazione": "Principio architetturale vincolante per il Tier 1 che vieta categoricamente l'invocazione di modelli di intelligenza artificiale, reti neurali o motori RAG per l'analisi del movimento: tutti i calcoli derivano esclusivamente da equazioni fisiche, cinematica classica e formule trigonometriche note.",
        "ruolo": 'Garantisce trasparenza scientifica assoluta, esclude costi di inferenza cloud per gli account consumer, assicura funzionamento offline su qualsiasi dispositivo mobile ed evidenzia la netta demarcazione di valore rispetto ai modelli AI proprietari dei Tier 2 e Tier 3.',
        "zona": 'Colonna 4, Riga 1 (Data Analisi Casual).',
        "flows": ['#04']
    },
    {
        "name": 'Diario Nutrizione e Stile di Vita',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Traccia peso, pasti, idratazione ed abitudini quotidiane.',
        "spiegazione": 'Modulo per la registrazione e il monitoraggio di peso corporeo, circonferenze, idratazione, timing nutrizionale e abitudini alimentari per sportivi e atleti.',
        "ruolo": 'Garantisce la progressione antropometrica, l\'aderenza dietetica e l\'ottimizzazione del recupero, differenziato nei 3 Tier con regole di isolamento e gating sanitario.',
        "zona": 'Colonna 7, Righe 1, 2 e 3 (Diario Nutrizione).',
        "flows": ['#23', '#24', '#25']
    },
    {
        "name": 'Tasso di Sudorazione (Sweat Rate)',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Litri di sudore persi per ora durante l\'allenamento.',
        "spiegazione": 'Volume di liquidi corporei espulsi tramite sudorazione durante l\'attività fisica, calcolato tramite la differenza tra peso pre e post-esercizio corretta per liquidi ingeriti ed escrezioni.',
        "ruolo": 'Permette di stimare la disidratazione acuta e calcolare il reintegro idro-elettrolitico (120-150% del deficit) per prevenire cali di prestazione e crampi.',
        "zona": 'Colonna 7, Righe 1 e 2 (Diario Nutrizione e Pro Hub).',
        "flows": ['#23', '#24']
    },
    {
        "name": 'Classificazione Evidenze Integratori Sportivi',
        "cat": 'Ricerca Scientifica & Documentazione Accademica (Tier 1-2-3)',
        "eli5": 'Guida scientifica sull\'efficacia reale degli integratori per sportivi.',
        "spiegazione": 'Tassonomia basata sulle linee guida internazionali ISSN e AIS che suddivide i supplementi in quattro classi (A: efficacia dimostrata, B: promettenti, C: privi di prove, D: rischiosi o vietati).',
        "ruolo": 'Protegge l\'utente amatoriale e il professionista da acquisti inutili, orientando le scelte nutrizionali solo su sostanze con solida evidenza scientifica.',
        "zona": 'Colonna 7, Righe 1 e 2 (Guide & Filtro Sicurezza).',
        "flows": ['#23', '#24']
    },
    {
        "name": 'Fabbisogno Energetico Basale e Totale',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Calorie necessarie per vivere ed allenarsi ogni giorno.',
        "spiegazione": 'Quantità di calorie giornaliere consumate a riposo per le funzioni vitali (BMR) e dispendio energetico complessivo comprensivo delle attività lavorative e sportive (TDEE).',
        "ruolo": 'Fornisce la baseline energetica su cui calibrare il bilancio calorico (ipocalorico, normocalorico, ipercalorico) nei piani nutrizionali dei 3 Tier.',
        "zona": 'Colonna 7, Righe 1, 2 e 3 (Calcolatori & Piani).',
        "flows": ['#23', '#24', '#25']
    },
    {
        "name": 'Tutela Legale Nutrizione (Legge 3/2018 & Art. 348 c.p.)',
        "cat": 'Sicurezza, Anti-Frode & Fiscalità Digitale B2B',
        "eli5": 'Diete grammate solo a nutrizionisti, educazione ai coach.',
        "spiegazione": 'Quadro normativo italiano che riserva la prescrizione di diete grammate e piani clinici esclusivamente a Biologi Nutrizionisti, Dietisti e Medici, sanzionando penalmente l\'esercizio abusivo.',
        "ruolo": 'Attiva a livello API Gateway lo sblocco dell\'editor diete solo per i professionisti abilitati, proteggendo preparatori e personal trainer tramite modalità di sola educazione alimentare.',
        "zona": 'Colonna 7, Riga 2 (Legal RBAC Gateway).',
        "flows": ['#24']
    },
    {
        "name": 'BIA Vettoriale BIVA',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Mappa grafica dell\'idratazione e massa cellulare dell\'atleta.',
        "spiegazione": 'Metodica di bioimpedenziometria che analizza i parametri grezzi di resistenza (R) e reattanza (Xc) su un piano cartesiano probabilistico (ellissi di tolleranza di Piccoli), senza stime matematiche empiriche.',
        "ruolo": 'Permette ai professionisti di Tier 2 e ai club di Tier 3 di diagnosticare stati di disidratazione, iperidratazione e integrità delle membrane cellulari prima e dopo la competizione.',
        "zona": 'Colonna 7, Righe 2 e 3 (Composizione Corporea Pro/Elite).',
        "flows": ['#24', '#25']
    },
    {
        "name": 'Massa Grassa FM e Massa Magra FFM',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Chili di muscoli e grasso che compongono il corpo.',
        "spiegazione": 'Scomposizione bicompartimentale del peso corporeo in tessuto adiposo (Fat Mass) e compartimento magro comprensivo di muscoli, scheletro, organi e acqua corporea (Fat-Free Mass).',
        "ruolo": 'Costituisce la metrica fondamentale su cui calibrare l\'apporto proteico (g/kg FFM), l\'Energy Availability e il monitoraggio delle oscillazioni ponderali durante la stagione agonistica.',
        "zona": 'Colonna 7, Righe 1, 2 e 3 (Composizione Corporea).',
        "flows": ['#23', '#24', '#25']
    },
    {
        "name": 'Plicometria Jackson-Pollock',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Misura lo spessore del grasso con apposito calibro.',
        "spiegazione": 'Protocollo antropometrico che misura lo spessore delle pliche cutanee in millimetri in punti anatomici codificati per stimare la densità corporea e la percentuale di grasso.',
        "ruolo": 'Fornisce al preparatore e nutrizionista di Tier 2 uno strumento economico e affidabile per monitorare le variazioni distrettuali di grasso sottocutaneo nel tempo.',
        "zona": 'Colonna 7, Riga 2 (Hub Composizione Corporea Pro).',
        "flows": ['#24']
    },
    {
        "name": 'Wearable Esclusivo T7',
        "cat": 'Telemetria Wearable & Dispositivi Mobili',
        "eli5": 'Importa calorie solo da bracciali ufficiali a marchio T7.',
        "spiegazione": 'Vincolo architetturale di Tier 2 che limita l\'importazione automatica del dispendio calorico giornaliero esclusivamente ai dispositivi hardware proprietari dell\'ecosistema T7.',
        "ruolo": 'Delinea la barriera commerciale e tecnica tra Tier 2 (monomarca) e Tier 3 (Any-Wearable), garantendo affidabilità e certificazione del dato di dispendio.',
        "zona": 'Colonna 7, Riga 2 (Corsia 3 Server Scatola Nera).',
        "flows": ['#24']
    },
    {
        "name": 'Esportazione Multi-Formato Sbloccata',
        "cat": 'Ingegneria Software & Architettura Cloud',
        "eli5": 'Scarica tabelle e diete modificabili senza blocchi password.',
        "spiegazione": 'Capacità di esportare schede e piani nutrizionali in formati multipli sbloccati (.pdf, .xlsx senza password, .docx, .txt), consentendo personalizzazioni al professionista.',
        "ruolo": 'Supera i vincoli di sola lettura del Tier 1 (Read-Only PDF), permettendo a preparatori e nutrizionisti di integrare fogli di calcolo e formule proprietarie.',
        "zona": 'Colonna 7, Righe 2 e 3 (Export Station).',
        "flows": ['#24', '#25']
    },
    {
        "name": 'AI Rationale Limitata 70%',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Spiega razionale della dieta con link a studi scientifici.',
        "spiegazione": 'Servizio di generazione automatica di note esplicative sul piano nutrizionale e sugli integratori con potenza calibrata al 70%, quota token mensile e link diretti ai paper scientifici di Colonna 5.',
        "ruolo": 'Fornisce al professionista P.IVA spiegazioni scientifiche pronte per il cliente senza eccedere nei costi computazionali dell\'infrastruttura.',
        "zona": 'Colonna 7, Riga 2 (Corsia 3 Server).',
        "flows": ['#24']
    },
    {
        "name": 'Energy Availability EA & Sindrome REDs',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Calorie rimaste per il corpo dopo l\'esercizio fisico.',
        "spiegazione": 'Rapporto tra l\'energia alimentare residua (calorie ingerite meno spesa dell\'allenamento) e la massa magra FFM: EA = (EI - EEE) / FFM. Valori inferiori a 30 kcal/kg FFM/die innescano la sindrome REDs.',
        "ruolo": 'Costituisce il pilastro preventivo primario in Tier 3: monitora continuamente atlete e atleti prevenendo fratture da stress, amenorrea, disfunzioni tiroidee e calo prestazionale.',
        "zona": 'Colonna 7, Riga 3 (Corsia 3 Server Scatola Nera).',
        "flows": ['#25']
    },
    {
        "name": 'DEXA Dual-Energy X-ray Absorptiometry',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Esame radiologico gold standard per densità ossea e muscolare.',
        "spiegazione": 'Tecnologia a doppio raggio X a basso dosaggio considerata il riferimento d\'oro per la misurazione tricompartimentale di densità minerale ossea (BMD), massa grassa e massa magra distrettuale.',
        "ruolo": 'Consente allo staff medico di Tier 3 di caricare referti strumentali in PDF/XLSX aggiornando automaticamente la FFM e i parametri di potenza atletica in Data Analisi.',
        "zona": 'Colonna 7, Riga 3 (Cockpit Medico Elite).',
        "flows": ['#25']
    },
    {
        "name": 'Periodizzazione Nutrizionale Dinamica',
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": 'Adatta cibo e carboidrati al carico GPS quotidiano.',
        "spiegazione": 'Modulazione quotidiana automatizzata di macronutrienti e calorie in funzione del microciclo MD-X (#15) e del dispendio energetico rilevato dalle pettorine GPS (#16).',
        "ruolo": 'Satura il glicogeno nei giorni pre-gara (MD-1) e massimizza la riparazione tissutale e la sintesi proteica nei giorni post-gara (MD+1) o di recupero.',
        "zona": 'Colonna 7, Riga 3 (Corsia 3 Server).',
        "flows": ['#25']
    },
    {
        "name": 'Red Flags Cliniche Human-in-the-Loop',
        "cat": 'Prescrizione Clinica & Riabilitazione P.IVA (Tier 2)',
        "eli5": 'Blocco automatico per anomalie mediche con alert al dottore.',
        "spiegazione": 'Campanelli d\'allarme clinico (calo ponderale rapido > 3% in 48h, amenorrea secondaria, disidratazione severa) che intercettano condizioni patologiche bloccando gli automatismi software.',
        "ruolo": 'Congela gli adattamenti nutrizionali automatici e invia notifiche ad alta priorità a Medico Sociale e Nutrizionista, imponendo una visita clinica prima del nulla osta.',
        "zona": 'Colonna 7, Riga 3 (Corsia 2 Gateway & Corsia 3 Server).',
        "flows": ['#25']
    },
    {
        "name": 'Certificazione Antidoping per Lotto Batch',
        "cat": 'Sicurezza Enterprise & Identità Societaria (Tier 3)',
        "eli5": 'Verifica che il lotto dell\'integratore sia esente da doping.',
        "spiegazione": 'Controllo incrociato in tempo reale del numero di lotto (Batch ID) dell\'integratore sulle banche dati internazionali di laboratori accreditati WADA (Informed Sport, Cologne List, NSF).',
        "ruolo": 'Azzera il rischio di squalifiche per contaminazione accidentale negli atleti professionisti di club Serie A ed Eurolega prima della somministrazione.',
        "zona": 'Colonna 7, Riga 3 (Corsia 3 Server).',
        "flows": ['#25']
    },
    {
        "name": 'Potenza Relativa Watt su kg W-kg',
        "cat": 'Biomeccanica & Valutazione Funzionale',
        "eli5": 'Rapporto tra watt generati e peso corporeo dell\'atleta.',
        "spiegazione": 'Espressione della potenza meccanica generata durante un gesto atletico normalizzata per la massa corporea dell\'atleta: W/kg = Potenza (W) / Peso (kg).',
        "ruolo": 'Permette il confronto oggettivo tra atleti di taglia diversa nei test sui salti (CMJ) e nelle accelerazioni GPS, ricalcolato all\'istante ad ogni variazione ponderale registrata in Nutrizione.',
        "zona": 'Colonna 7, Riga 3 e Colonna 4, Riga 3 (Data Analisi).',
        "flows": ['#16', '#25']
    },
    {
        "name": 'Chatbot Nutrizionale RAG 24/7',
        "cat": 'Algoritmi, Statistica & Machine Learning',
        "eli5": 'Assistente 24 ore addestrato sui protocolli del nutrizionista.',
        "spiegazione": 'Assistente conversazionale basato su RAG privato (Silo 2 Bunker KMS) che risponde 24 ore su 24 all\'atleta replicando il lessico, i protocolli e le ricette del nutrizionista sociale.',
        "ruolo": 'Fornisce indicazioni istantanee su scelte alimentari durante trasferte, ristoranti o orari notturni, senza esporre dati all\'esterno del club.',
        "zona": 'Colonna 7, Riga 3 (Corsia 3 Server).',
        "flows": ['#25']
    },
]

TERM_ALIASES = {'PAR-Q+ (Physical Activity Readiness Questionnaire) & Digital Triage': ['par-q-physical-activity-readiness-questionnaire-digital-triage'], 'Video Ingest Tiers (Zero Upload Tier 1, 1080p Pro Tier 2, 4K/8K Enterprise Tier 3)': ['video-ingest-tiers-policy-tier-1-zero-upload-tier-2-1080p-tier-3-4k8k', 'video-ingest-tiers-1080p-consumer-2k-pro-4k8k-enterprise'], 'Zero AI Biomeccanica (Elaborazione Matematica Pura)': ['zero-ai-biomeccanica'], 'Isolamento Data Analisi Tier 1 (Zero Correlazione Cross-Modulo)': ['isolamento-data-analisi-tier-1'], 'Open Access Papers (Studi Scientifici Pubblici e Gratuiti)': ['open-access-papers-studi-scientifici-pubblici-gratuiti'], "Digital Twin Biomeccanico dell'Atleta": ['digital-twin-biomeccanico-dellatleta'], 'Analisi Sommaria Metriche Lattato (Soglie Aerobica/Anaerobica T7)': ['analisi-sommaria-metriche-lattato'], '32 Protocolli Riabilitativi Clinici (cli_01..cli_32)': ['32-protocolli-riabilitativi-clinici-cli01cli32'], 'SAML 2.0 Enterprise Federation & Single Sign-On': ['saml-20-enterprise-federation-single-sign-on'], 'Role-Based RAG (Controllo Accessi Gerarchico Medico / S&C / Atleta)': ['role-based-rag-controllo-accessi-gerarchico-medico--sc--atleta'], 'Controllo Incrociato & Avvisi di Conflitto (Conflict Alert Schede-Referti)': ['controllo-incrociato--avvisi-di-conflitto-conflict-alert-schede-referti'], 'Chatbot AI Studi Scientifici (Assistente Documentale 24/7)': ['chatbot-ai-studi-scientifici-assistente-documentale-247'], 'Potenza di Calcolo AI 100% (Tier 3 Enterprise)': ['potenza-di-calcolo-ai-100-tier-3'], 'Workout Session Tracker (Avvia Sessione)': ['workout-session-tracker', 'avvia-sessione'], 'Together Social Workout Sharing': ['together-social', 'together-app'], 'Find Your Gym Bro / Gym Girl': ['find-your-gym-bro-gym-girl', 'find-your-gym-bro'], 'VIP & Elite Lounges': ['vip-elite-lounges', 'vip-and-elite-lounges'], 'Soggetto Volontario Cavia Tokenomics': ['soggetto-volontario-cavia-tokenomics', 'token-cavia-cross-ecosistema'], 'Diario Nutrizione e Stile di Vita': ['diario-nutrizione-e-stile-di-vita', 'diario-nutrizione'], 'Tasso di Sudorazione (Sweat Rate)': ['tasso-di-sudorazione-sweat-rate', 'tasso-di-sudorazione'], 'Classificazione Evidenze Integratori Sportivi': ['classificazione-evidenze-integratori-sportivi', 'classificazione-evidenze-integratori'], 'Fabbisogno Energetico Basale e Totale': ['fabbisogno-energetico-basale-e-totale', 'fabbisogno-energetico-basale-e-totale-bmr-tdee', 'fabbisogno-energetico-basale'], 'Tutela Legale Nutrizione (Legge 3/2018 & Art. 348 c.p.)': ['tutela-legale-legge-32018-e-art-348-cp', 'tutela-legale-nutrizione-legge-32018-art-348-cp', 'tutela-legale-nutrizione'], 'BIA Vettoriale BIVA': ['bia-vettoriale-biva', 'bia-vettoriale'], 'Massa Grassa FM e Massa Magra FFM': ['massa-grassa-fm-e-massa-magra-ffm', 'massa-grassa-fm'], 'Plicometria Jackson-Pollock': ['plicometria-jackson-pollock', 'plicometria-jackson-pollock-3-e-7-pliche'], 'Wearable Esclusivo T7': ['wearable-esclusivo-t7', 'wearable-proprietario-t7'], 'Esportazione Multi-Formato Sbloccata': ['esportazione-multi-formato-sbloccata', 'export-multi-formato-sbloccato'], 'AI Rationale Limitata 70%': ['ai-rationale-limitata-70', 'ai-rationale-70'], 'Energy Availability EA & Sindrome REDs': ['energy-availability-ea-e-sindrome-reds', 'energy-availability-ea'], 'DEXA Dual-Energy X-ray Absorptiometry': ['dexa-dual-energy-x-ray-absorptiometry', 'dexa'], 'Periodizzazione Nutrizionale Dinamica': ['periodizzazione-nutrizionale-dinamica', 'periodizzazione-nutrizionale'], 'Red Flags Cliniche Human-in-the-Loop': ['red-flags-cliniche-human-in-the-loop', 'red-flags-cliniche'], 'Certificazione Antidoping per Lotto Batch': ['certificazione-antidoping-per-lotto-batch', 'certificazione-antidoping-per-lotto'], 'Potenza Relativa Watt su kg W-kg': ['potenza-relativa-watt-su-kg-w-kg', 'potenza-relativa-watt-su-kg'], 'Chatbot Nutrizionale RAG 24/7': ['chatbot-nutrizionale-rag-247', 'chatbot-nutrizionale-rag']}

def make_slug(name):
    clean = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode('utf-8')
    clean = re.sub(r'[\(\)\,\/\:\.\&\%\"\'\+]', ' ', clean)
    clean = re.sub(r'\s+', '-', clean.strip().lower())
    clean = re.sub(r'-+', '-', clean)
    return clean

def generate_markdown():
    lines = [
        "# Glossario Tecnico Vivente & Matrice di Tracciabilità dei Flussi (18 Flowcharts T7)",
        "",
        "> **Documento Autoritativo di Architettura (Zona 0 - Miro Board `uXjVEbo6L2o=`)**  ",
        f"> Censimento enciclopedico di **{len(TERMS)} Termini Tecnici e Acronimi Ufficiali** del progetto *Sports Analytics Platform — T7 Workout APP*.  ",
        "> Ogni voce include: Identificativo univoco, Sintesi ELI5 (strettamente $\\le 10$ parole per non-tecnici), Spiegazione Operativa, Ruolo Architetturale in T7 e Mappatura 1:1 sui 18 Flussi.",
        "",
        "---",
        "",
        "## Indice Analitico A-Z",
        ""
    ]

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
        "Video Analysis In-App, AI Multimodale & Custom Exercise Creator",
        "Ricerca Scientifica & Documentazione Accademica (Tier 1-2-3)"
    ]

    for c in by_cat.keys():
        if c not in categories_order:
            categories_order.append(c)

    for cat_name in categories_order:
        terms_in_cat = by_cat.get(cat_name, [])
        if not terms_in_cat:
            continue
        lines.append(f"### {cat_name}")
        lines.append("")
        for t in terms_in_cat:
            slug = make_slug(t["name"])
            anchors_html = f'<a id="{slug}"></a>'
            if t["name"] in TERM_ALIASES:
                for alias in TERM_ALIASES[t["name"]]:
                    if alias != slug:
                        anchors_html += f'<a id="{alias}"></a>'

            lines.append(f"#### {anchors_html}{t['name']}")
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
