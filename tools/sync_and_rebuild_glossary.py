# -*- coding: utf-8 -*-
"""
sync_and_rebuild_glossary.py
Sincronizza, integra e rigenera al 100%:
- tools/generate_glossary.py (array TERMS autorevole)
- architecture-blueprint/00-capitolato-tecnico-e-glossario/00-GLOSSARIO-TERMINI-TECNICI.md
"""

import os
import re
import unicodedata
from collections import defaultdict

SHORTENED_ELI5 = {
    "Modelli AI Interni T7 (Inferenza Dedicata 70% vs 100%)": "Modelli AI proprietari T7 a due livelli di potenza.",
    "Separazione Database Data Analisi vs Catalogo (Isolamento Tier 2)": "I video di analisi restano isolati fuori dal catalogo.",
    "Universal Multi-Format Export (Report, Grafici, Presentazioni)": "Esporta analisi in PDF, Excel, Word e PowerPoint liberamente.",
    "Isolamento Data Analisi Tier 1 (Zero Correlazione Cross-Modulo)": "Dati di corsa isolati senza connessione con altre sezioni.",
    "Cross-Module Baseline Bridge (Data Analisi verso Programmazione e Catalogo)": "Aggiorna schede e catalogo usando i dati delle partite.",
    "Angoli Principali Biomeccanici": "Grandi angoli articolari calcolati con la geometria pura.",
    "Angoli Specifici Biomeccanici": "Angoli complessi come rotazione bacino o cedimento del ginocchio.",
    "Trigonometria Deterministica 2D (Goniometro Digitale)": "Goniometro digitale che calcola gradi esatti senza tirare a indovinare.",
    "Zero AI Biomeccanica (Elaborazione Matematica Pura)": "Zero intelligenza artificiale: solo calcoli matematici certi e verificabili.",
    "Clonazione dello Stile e Lessico del Coach (Style-Cloning)": "L'AI replica lo stile e il lessico del coach.",
    "Controllo Incrociato & Avvisi di Conflitto (Conflict Alert Schede-Referti)": "Allarme automatico se l'allenamento confligge con un referto medico.",
    "Wearable T7 (Ecosistema Hardware Proprietario T7)": "Dispositivi e sensori indossabili ufficiali progettati da T7.",
    "Analisi Sommaria Metriche Lattato (Soglie Aerobica/Anaerobica T7)": "Stima rapida delle soglie di lattato dai sensori T7.",
    "RAG 100% Private (Isolamento Totale Dati Societari)": "AI blindata che impara solo dai documenti societari interni.",
    "Role-Based RAG (Controllo Accessi Gerarchico Medico / S&C / Atleta)": "Accesso gerarchico alle risposte AI per proteggere il segreto.",
    "Video Ingest Tiers (Zero Upload Tier 1, 1080p Pro Tier 2, 4K/8K Enterprise Tier 3)": "Regole video: zero upload base, 1080p coach, 4K/8K club.",
    "Live Camera AI Real-Time Correction (Feedback Esecutivo sul Momento)": "La telecamera rileva l'esecuzione e corregge subito gli errori.",
    "Schede Tecniche di Sintesi (Studi Premium Copyright-Safe)": "Riassunti pratici e legali dei migliori studi a pagamento.",
    "Area Studio Digitale In-App (Offline / IndexedDB)": "Quaderno digitale con note ed evidenziatore attivo anche offline.",
    "Commissione Scientifica T7 (Peer-Review Community)": "Comitato di esperti che convalida ricerche e tesi inviate.",
    "Bollettino Settimanale Accademico (Feed Tematico Sportivo)": "Rassegna settimanale con le ultime novità scientifiche sui tuoi sport.",
    "Chatbot AI Studi Scientifici (Assistente Documentale 24/7)": "Assistente virtuale per fare domande sullo studio scientifico aperto.",
    "RAG Sync Libreria Fonti (Sincronizzazione Bunker Silo 2)": "Invia studi al bunker RAG per potenziare la squadra.",
    "Indicatori di Qualita Scientifica (CEBM Oxford e Quartili JCR)": "Badge chiari sull'autorevolezza e rigore di ciascuno studio scientifico."
}

TERM_ALIASES = {
    "PAR-Q+ (Physical Activity Readiness Questionnaire) & Digital Triage": [
        "par-q-physical-activity-readiness-questionnaire-digital-triage"
    ],
    "Video Ingest Tiers (Zero Upload Tier 1, 1080p Pro Tier 2, 4K/8K Enterprise Tier 3)": [
        "video-ingest-tiers-policy-tier-1-zero-upload-tier-2-1080p-tier-3-4k8k",
        "video-ingest-tiers-1080p-consumer-2k-pro-4k8k-enterprise"
    ],
    "Zero AI Biomeccanica (Elaborazione Matematica Pura)": [
        "zero-ai-biomeccanica"
    ],
    "Isolamento Data Analisi Tier 1 (Zero Correlazione Cross-Modulo)": [
        "isolamento-data-analisi-tier-1"
    ],
    "Open Access Papers (Studi Scientifici Pubblici e Gratuiti)": [
        "open-access-papers-studi-scientifici-pubblici-gratuiti"
    ],
    "Digital Twin Biomeccanico dell'Atleta": [
        "digital-twin-biomeccanico-dellatleta"
    ],
    "Analisi Sommaria Metriche Lattato (Soglie Aerobica/Anaerobica T7)": [
        "analisi-sommaria-metriche-lattato"
    ],
    "32 Protocolli Riabilitativi Clinici (cli_01..cli_32)": [
        "32-protocolli-riabilitativi-clinici-cli01cli32"
    ],
    "SAML 2.0 Enterprise Federation & Single Sign-On": [
        "saml-20-enterprise-federation-single-sign-on"
    ],
    "Role-Based RAG (Controllo Accessi Gerarchico Medico / S&C / Atleta)": [
        "role-based-rag-controllo-accessi-gerarchico-medico--sc--atleta"
    ],
    "Controllo Incrociato & Avvisi di Conflitto (Conflict Alert Schede-Referti)": [
        "controllo-incrociato--avvisi-di-conflitto-conflict-alert-schede-referti"
    ],
    "Chatbot AI Studi Scientifici (Assistente Documentale 24/7)": [
        "chatbot-ai-studi-scientifici-assistente-documentale-247"
    ],
    "Potenza di Calcolo AI 100% (Tier 3 Enterprise)": [
        "potenza-di-calcolo-ai-100-tier-3"
    ],
    "Workout Session Tracker (Avvia Sessione)": [
        "workout-session-tracker",
        "avvia-sessione"
    ],
    "Together Social Workout Sharing": [
        "together-social",
        "together-app"
    ],
    "Find Your Gym Bro / Gym Girl": [
        "find-your-gym-bro-gym-girl",
        "find-your-gym-bro"
    ],
    "VIP & Elite Lounges": [
        "vip-elite-lounges",
        "vip-and-elite-lounges"
    ],
    "Soggetto Volontario Cavia Tokenomics": [
        "soggetto-volontario-cavia-tokenomics",
        "token-cavia-cross-ecosistema"
    ]
}

NEW_TERMS = [
    {
        "name": "Workout Session Tracker (Avvia Sessione)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Interfaccia da palestra per registrare serie, carichi, ripetizioni e recuperi.",
        "spiegazione": "Interfaccia interattiva da palestra che si avvia con il pulsante 'Avvia Sessione' all'apertura del programma giornaliero o di un workout libero, dotata di timer di recupero inter-serie, spunta delle serie completate e campi di input per inserire i carichi effettivi sollevati in kg e le ripetizioni reali eseguite.",
        "ruolo": "Fornisce il player esecutivo in sala pesi su tutti i 3 Tier, registrando i volumi reali sul database e predisponendo i dati generici per la condivisione social.",
        "zona": "Colonna 3, Righe 1, 2 e 3 (Programmazione degli Esercizi) e Corsia 1 Client.",
        "flows": ["#03", "#09", "#15"]
    },
    {
        "name": "Together Social Workout Sharing",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Condivisione su Together Social dei dati generici dell'allenamento completato.",
        "spiegazione": "Funzionalità integrata nell'ecosistema T7 Workout che genera un riepilogo con metriche generiche (durata, volume totale, esercizi svolti) al termine della sessione registrata, permettendo la condivisione all'interno del social network Together Social per stimolare la community senza esporre dati sensibili.",
        "ruolo": "Abilita la condivisione social peer-to-peer e community-driven tra gli atleti dei Tier 1, 2 e 3 sull'app integrata Together Social.",
        "zona": "Colonna 3, Righe 1, 2 e 3 (Programmazione degli Esercizi) e Corsia 1 / 4.",
        "flows": ["#03", "#09", "#15"]
    },
    {
        "name": "PVT-B (Brief Psychomotor Vigilance Task 3-min)",
        "cat": "Biomeccanica & Valutazione Funzionale",
        "eli5": "Test di reazione rapida per misurare la fatica cerebrale.",
        "spiegazione": "Test neurocognitivo standardizzato di 3 minuti basato su stimoli visivi casuali (ISI 1-4s). Calcola tempo di reazione mediano (Median RT), velocità di risposta (1/RT), variabilità intra-individuale, lapsus calibrati (RT > 355ms o 2x baseline individuale) e partenze anticipate (false starts < 100ms), quantificando vigilanza comportamentale e attenzione sostenuta.",
        "ruolo": "In Tier 3 implementa il protocollo duale: somministrazione mattutina a digiuno (baseline del SNC e recupero sistemico) e pre-sessione acuta (arousal e prontezza neuromuscolare immediata). Rileva la fatica centrale prima dei cali prestativi fisici.",
        "zona": "Colonna 3, Riga 3 (Cockpit Élite Tier 3) e Corsia 1 / 3.",
        "flows": ["#15", "#16"]
    },
    {
        "name": "Robust Z-Score (MAD - Median Absolute Deviation)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Standardizzazione statistica protetta da errori e valori anomali estremi.",
        "spiegazione": "Tecnica statistica non parametrica che normalizza le metriche usando la mediana e la MAD: Z_robust = (x - mediana) / (1.4826 * MAD), dove MAD = mediana(|x_i - mediana(x)|). Sostituisce media e deviazione standard classiche.",
        "ruolo": "Normalizza parametri eterogenei su rolling window di 28 giorni senza subire distorsioni da singoli outlier o distribuzioni asimmetriche, garantendo baseline stabili per carico interno, esterno e test cognitivi.",
        "zona": "Colonna 3 e 4, Riga 3 e Corsia 3 Server.",
        "flows": ["#15", "#16"]
    },
    {
        "name": "Decoupled Readiness Sub-Scores (4 Domini Indipendenti)",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Quattro punteggi separati per non mascherare crolli fisici isolati.",
        "spiegazione": "Architettura di monitoraggio che valuta e visualizza in modo autonomo 4 domini biologici (Fisiologico, Neurocognitivo, Neuromuscolare, Tolleranza al Carico) prima di qualsiasi aggregazione in un indice complessivo.",
        "ruolo": "Previene l'effetto mascheramento (in cui valori cardiaci eccellenti compensano un grave crollo neurale o contrattile), consentendo modulazioni prescrittive mirate su specifici sistemi biologici in affanno.",
        "zona": "Colonna 3, Riga 3 (Readiness Section Tier 3) e Corsia 1 / 3.",
        "flows": ["#15"]
    },
    {
        "name": "Two-Phase Injury Risk Architecture (Architettura Rischio Infortuni)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Doppio filtro matematico per bloccare gli atleti a rischio.",
        "spiegazione": "Modello predittivo a due stadi: la Fase 1 esegue una matrice deterministica di Red Flags (hard-stop vincolanti su asimmetrie > 15%, spike ACWR > 1.50 e deficit neurali); la Fase 2 stima il rischio continuo tramite regressione logistica multivariata o machine learning calibrato su serie longitudinali di club.",
        "ruolo": "Tutela l'integrità degli atleti di Tier 3 bloccando sessioni a rischio trauma acuto (Fase 1) e guidando lo staff tecnico nella regolazione fine del volume e intensità settimanale (Fase 2).",
        "zona": "Colonna 3, Riga 3 (Readiness Section Tier 3) e Corsia 3 Server.",
        "flows": ["#15"]
    },
    {
        "name": "Tassonomia MeSH Sportiva (Classificazione Ricerca)",
        "cat": "Ricerca Scientifica & Documentazione Accademica (Tier 1-2-3)",
        "eli5": "Sistema standard per classificare e trovare gli studi scientifici.",
        "spiegazione": "Albero tassonomico Medical Subject Headings (MeSH) integrato con descrittori specialistici di scienze motorie per la catalogazione rigorosa delle pubblicazioni peer-reviewed.",
        "ruolo": "Organizza le ricerche scientifiche in macro-categorie e filtri specialistici per consentire recuperi documentali precisi in Libreria Fonti.",
        "zona": "Colonna 5, Righe 1, 2 e 3 (Libreria Fonti).",
        "flows": ["#05", "#11", "#17"]
    },
    {
        "name": "Visualizzatore PDF Protetto In-App (Read-Only)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Lettore interno di documenti che impedisce download non autorizzati.",
        "spiegazione": "Componente client di rendering vettoriale PDF su canvas isolato che disabilita il menu contestuale, la stampa e il download di file non autorizzati.",
        "ruolo": "Consente la fruizione di paper protetti in sola lettura rispettando le licenze di distribuzione scientifica.",
        "zona": "Colonna 5, Riga 1 (Libreria Fonti Tier 1) e Corsia 1 Client.",
        "flows": ["#05"]
    },
    {
        "name": "Feature Gating Tier 1 (Consumer)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Blocco automatico che limita l'accesso al piano gratuito base.",
        "spiegazione": "Regola di controllo accessi a livello API Gateway che restringe le chiamate e le viste alle sole funzionalità aperte del piano base.",
        "ruolo": "Garantisce la separazione commerciale impedendo l'accesso non autorizzato a funzioni professionali dei Tier 2 e 3.",
        "zona": "Corsia 2 Gateway e Zona 1 Miro.",
        "flows": ["#01", "#02", "#03", "#04", "#05", "#06"]
    },
    {
        "name": "Gestione Preferiti Studi Scientifici",
        "cat": "Ricerca Scientifica & Documentazione Accademica (Tier 1-2-3)",
        "eli5": "Salva e organizza le ricerche scientifiche in cartelle personalizzate.",
        "spiegazione": "Modulo di indicizzazione e archiviazione locale e cloud che permette agli utenti professionali di creare cartelle tematiche di studi preferiti.",
        "ruolo": "Velocizza la consultazione e il recupero di evidenze cliniche durante la progettazione di schede o percorsi riabilitativi.",
        "zona": "Colonna 5, Riga 2 e 3 (Libreria Fonti).",
        "flows": ["#11", "#17"]
    },
    {
        "name": "Potenza di Calcolo AI 100% (Tier 3 Enterprise)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Massima potenza di calcolo senza limiti per club professionistici.",
        "spiegazione": "Allocazione prioritaria di risorse GPU e cluster dedicati per inferenze LLM illimitate, visione artificiale avanzata e RAG societario privato.",
        "ruolo": "Alimenta la suite tattica 4K, la traduzione accademica automatica e la clonazione metodologica del capo allenatore.",
        "zona": "Zona 4, Riga 3 e Corsia 3 Server Scatola Nera.",
        "flows": ["#14", "#15", "#16", "#17"]
    },
    {
        "name": "Puntatore Relazionale Preferiti (Zero-Duplication Bookmark)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Collegamento rapido all'asset originale senza duplicare file pesanti.",
        "spiegazione": "Record leggero su database relazionale che memorizza esclusivamente l'identificativo univoco (bookmark_id) e il tipo di risorsa referenziata, risolvendo l'asset in tempo reale senza mai clonare modelli 3D, video, PDF o report.",
        "ruolo": "Costituisce la spina dorsale deterministica della Colonna 6 Preferiti su tutti e tre i Tier (Silo 1 per Tier 1/2, Silo 2 Bunker KMS per Tier 3), azzerando la duplicazione dello storage e garantendo coerenza immediata agli aggiornamenti della sorgente.",
        "zona": "Colonna 6, Righe 1, 2 e 3 (Preferiti) e Corsia 3 / 4.",
        "flows": ["#06", "#12", "#18"]
    },
    {
        "name": "Lista Lineare Preferiti (Tier 1 Base)",
        "cat": "Principi Architetturali di Prodotto",
        "eli5": "Elenco piatto di esercizi e programmi salvati senza cartelle.",
        "spiegazione": "Organizzazione visiva essenziale a lista singola e cronologica riservata agli utenti Consumer, priva di sottocartelle, etichette personalizzate, fonti scientifiche, video personalizzati o ricerca AI.",
        "ruolo": "Consente all'utente amatoriale di Tier 1 di contrassegnare e richiamare in un tocco esercizi 3D dal Catalogo (#02) e programmi pre-confezionati base (#03), applicando in modo rigoroso il Feature Gating di fascia.",
        "zona": "Colonna 6, Riga 1 (Preferiti Tier 1) e Corsia 1 Client.",
        "flows": ["#06"]
    },
    {
        "name": "Cartelle Tematiche & Tag Personalizzati (Preferiti Pro)",
        "cat": "Principi Architetturali di Prodotto",
        "eli5": "Cartelle ed etichette personali per ordinare esercizi e fonti.",
        "spiegazione": "Sistema di tassonomia personale basato su cartelle tematiche e tag liberi definiti dal professionista (es. 'Protocolli Ipertrofia', 'Articoli Nutrizione') per filtrare deterministicamente puntatori a esercizi, video 1080p, template e fonti scientifiche.",
        "ruolo": "Potenzia l'operativita quotidiana di coach e fisioterapisti P.IVA in Tier 2 (Silo 1 Pro), mantenendo l'isolamento da Data Analisi, AI, RAG e condivisione di squadra.",
        "zona": "Colonna 6, Righe 2 e 3 (Preferiti Pro ed Enterprise) e Corsia 1 / 4.",
        "flows": ["#12", "#18"]
    },
    {
        "name": "Template Riutilizzabili Preferiti (Clonazione Modelli Pro)",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Schede salvate come modelli base pronti per nuovi clienti.",
        "spiegazione": "Meccanismo deterministico che contrassegna programmi di allenamento di Tier 2 (#09) come modelli riutilizzabili nei Preferiti, consentendo la clonazione parametrica su nuovi clienti senza alterare l'originale.",
        "ruolo": "Riduce i tempi di compilazione delle schede per preparatori e fisioterapisti P.IVA (FLOW-6B) mantenendo la separazione rigorosa dai dati di Data Analisi.",
        "zona": "Colonna 6, Righe 2 e 3 (Preferiti Pro ed Enterprise) e Corsia 3 Server.",
        "flows": ["#12", "#18"]
    },
    {
        "name": "Doppio Livello Preferiti (Personali vs Team/Staff Pinning)",
        "cat": "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "eli5": "Spazio personale separato dalla bacheca condivisa con documenti fissati.",
        "spiegazione": "Architettura multi-scope di Tier 3 che separa i Preferiti Personali (visibili solo al singolo operatore) dai Preferiti di Team/Staff (condivisi con il club e dotati di pinning prioritario in alto per documenti e routine cruciali).",
        "ruolo": "Permette agli staff dei club professionistici di standardizzare l'accesso immediato a routine 4K, report Match Analisi, Readiness e documenti RAG senza mescolarli con gli appunti privati del singolo.",
        "zona": "Colonna 6, Riga 3 (Preferiti Enterprise All-in-One) e Corsia 1 / 4.",
        "flows": ["#18"]
    },
    {
        "name": "Albero Cartelle Gerarchico (PostgreSQL ltree)",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Struttura di cartelle e sottocartelle velocissima per archivi complessi.",
        "spiegazione": "Estensione nativa di PostgreSQL (ltree) basata su percorsi etichettati indicizzati GiST che consente gerarchie annidate illimitate (es. club.stagione_26.match_analisi.avversari) con query di sottoalbero in millisecondi.",
        "ruolo": "Gestisce la tassonomia complessa dei Preferiti Personali e di Team/Staff in Tier 3 (Silo 2 Bunker KMS), garantendo navigazione istantanea e ricerca filtrata per ramo.",
        "zona": "Colonna 6, Riga 3 (Preferiti Enterprise) e Corsia 4 Silo 2.",
        "flows": ["#18"]
    },
    {
        "name": "Ricerca Ibrida Preferiti (PostgreSQL tsvector + pgvector AI)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Combina ricerca esatta per parole e ricerca semantica AI.",
        "spiegazione": "Motore di recupero documentale a doppio canale che fonde lo score lessicale full-text (PostgreSQL tsvector con indice GIN) e la similarita coseno su vettori semantici (pgvector HNSW), integrando fusione RRF e reranking contestuale.",
        "ruolo": "Permette allo staff di Tier 3 di ritrovare istantaneamente esercizi 4K, programmi annuali, report Data Analisi, studi scientifici, file RAG e referti nell'enclave privata Silo 2 Bunker KMS.",
        "zona": "Colonna 6, Riga 3 (Preferiti Enterprise) e Corsia 3 / 4.",
        "flows": ["#18"]
    },
    {
        "name": "Filtro Silenzioso RBAC & PostgreSQL RLS (Segreto Medico Preferiti)",
        "cat": "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "eli5": "Nasconde i referti medici allo staff non autorizzato.",
        "spiegazione": "Meccanismo di difesa in profondita conforme al GDPR Art. 9 che combina Envoy RBAC (Corsia 2) e PostgreSQL Row-Level Security (Silo 2) per escludere silenziosamente referti clinici e documenti sanitari dai risultati di ricerca e dal pinning visibili ai ruoli tecnici.",
        "ruolo": "Garantisce che i documenti clinici fissati nei Preferiti di Team/Staff siano visibili esclusivamente allo Staff Medico, impedendo ad allenatori e preparatori qualsiasi fuga di dati o rivelazione dell'esistenza stessa del referto.",
        "zona": "Colonna 6, Riga 3 (Preferiti Enterprise) e Corsia 2 / 4.",
        "flows": ["#18"]
    },
    {
        "name": "Gemini Interactions API & Embedding-2 (Guardrail Enclave T7)",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Motore AI stateless privato con controlli di sicurezza integrati.",
        "spiegazione": "Integrazione server-side mediante SDK ufficiale @google/genai con ai.models.embedContent (gemini-embedding-2) per la vettorizzazione semantica e ai.interactions.create (gemini-2.5-flash-lite, store: false, output JSON strutturato) protetta da BudgetConfig e SafetyPolicy nell'enclave privata T7.",
        "ruolo": "Alimenta la ricerca semantica e il reranking intelligente dei Preferiti Enterprise (FLOW-6C) senza conservazione esterna dei dati sensibili del club e con zero esposizione sul Thin Client.",
        "zona": "Colonna 6, Riga 3 (Preferiti Enterprise) e Corsia 3 Server Scatola Nera.",
        "flows": ["#18"]
    },
    {
        "name": "Movely Companion App",
        "cat": "Principi Architetturali di Prodotto",
        "eli5": "Applicazione per il benessere aziendale e le pause attive.",
        "spiegazione": "Applicazione companion dedicata all'ecosistema Corporate Wellness, concepita per guidare i lavoratori in micro-pause attive alla scrivania, mobilità articolare ed educazione posturale quotidiana.",
        "ruolo": "Offre ai dipendenti aziendali un punto di accesso leggero al benessere lavorativo, separato fisicamente da carichi atletici pesanti e referti clinici, persistito su Silo 1.",
        "zona": "Companion Apps: Movely Ecosystem (#19 / #M1), Silo 1.",
        "flows": ["#19"]
    },
    {
        "name": "K-Anonymity HR Privacy Firewall",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Anonimizza i dati benessere per tutelare i dipendenti dall'azienda.",
        "spiegazione": "Meccanismo di protezione crittografica e statistica basato sul principio del k-anonimato (con soglia minima k >= 5), che blocca l'esposizione di dati aggregati per gruppi aziendali con meno di 5 individui.",
        "ruolo": "Impedisce al datore di lavoro o all'HR di risalire ai dati posturali, abitudini o risposte individuali dei singoli dipendenti, tutelando la privacy secondo il GDPR.",
        "zona": "Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 3 Server Scatola Nera.",
        "flows": ["#19"]
    },
    {
        "name": "Mini-Triage Visivo del Benessere",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Questionario rapido illustrato per misurare postura, sonno ed energia.",
        "spiegazione": "Strumento di autovalutazione visiva non clinico a risposta rapida (inferiore a 60 secondi) basato su sagome corporee interattive per mappare sensazioni di rigidità articolare, affaticamento visivo e livello energetico.",
        "ruolo": "Determina in tempo reale le micro-pause ergonomiche più adatte al lavoratore senza raccogliere dati diagnostici o informazioni sanitarie sensibili.",
        "zona": "Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 1 Client.",
        "flows": ["#19"]
    },
    {
        "name": "Family Plan Welfare",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Estende i benefit di movimento e benessere ai familiari.",
        "spiegazione": "Funzionalità che consente al lavoratore di estendere i benefit aziendali di movimento ed educazione posturale ai componenti del proprio nucleo familiare tramite profili secondari collegati.",
        "ruolo": "Promuove abitudini salutari condivise in famiglia, mantenendo i dati di ciascun membro rigorosamente separati e isolati nella partizione Silo 1.",
        "zona": "Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 1 / 4.",
        "flows": ["#19"]
    },
    {
        "name": "Smart Clinic Zero-Coda",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Prenotazione rapida di visite specialistiche convenzionate senza attese.",
        "spiegazione": "Sistema di prenotazione in tempo reale di visite fisioterapiche, valutazioni posturali ed esami specialistici presso cliniche convenzionate con check-in digitale e zero tempi di attesa.",
        "ruolo": "Gestisce la sola logistica dell'appuntamento e l'utilizzo dei voucher welfare, escludendo l'archiviazione o il transito di referti medici all'interno dell'app Movely.",
        "zona": "Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 1 / 2.",
        "flows": ["#19"]
    },
    {
        "name": "Ambassador Educational Feed",
        "cat": "Metodologia d'Allenamento & Clinica Sportiva",
        "eli5": "Pillole video e consigli scientifici pubblicati da esperti accreditati.",
        "spiegazione": "Bacheca editoriale certificata contenente brevi pillole video da 30-60 secondi, guide posturali e consigli ergonomici creati esclusivamente da professionisti accreditati dalla Commissione Scientifica.",
        "ruolo": "Offre formazione continua e affidabile sull'ergonomia e sul movimento corretto, priva di algoritmi di polarizzazione, pubblicità commerciale o contenuti non verificati.",
        "zona": "Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 1 / 3.",
        "flows": ["#19"]
    },
    {
        "name": "Co-Pay Welfare Wallet",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Borsellino digitale aziendale per cofinanziare servizi salute e benessere.",
        "spiegazione": "Portafoglio digitale che gestisce la ripartizione dei pagamenti per servizi di salute e benessere tra la quota welfare aziendale (flexible benefit) e la quota a carico del dipendente.",
        "ruolo": "Consente acquisti fluidi di prestazioni sanitarie e posturali convenzionate con emissione di ricevute fiscali conformi e tracciamento contabile su Silo 1.",
        "zona": "Companion Apps: Movely Ecosystem (#19 / #M1) e Corsia 2 / 4.",
        "flows": ["#19"]
    },
    {
        "name": "AI Content Gatekeeper",
        "cat": "Algoritmi, Statistica & Machine Learning",
        "eli5": "Filtro intelligente che blocca contenuti tossici, spam e video pericolosi.",
        "spiegazione": "Sistema di moderazione multimodale automatizzato che analizza testi, immagini e micro-video caricati sulla community, intercettando hate speech, spam commerciale, disinformazione su sostanze dopanti o esecuzioni biomeccaniche gravemente lesive prima della pubblicazione.",
        "ruolo": "Protegge l'integrità della community B2C Together Social (FLOW-TS1) analizzando i post in tempo reale ed evitando la diffusione di messaggi tossici o video pericolosi per gli atleti amatoriali.",
        "zona": "Companion Apps: Together Social (#20 / #TS1) e Corsia 3 Server Scatola Nera.",
        "flows": ["#20"]
    },
    {
        "name": "Find Your Gym Bro / Gym Girl",
        "cat": "Principi Architetturali di Prodotto",
        "eli5": "Trova compagni di allenamento compatibili per livello, palestra e orari.",
        "spiegazione": "Funzionalità opt-in di matching geolocalizzato e motivazionale che permette agli atleti B2C di connettersi con altri utenti che frequentano la stessa palestra o praticano la stessa disciplina, con preferenze orarie e livelli di forza affini.",
        "ruolo": "Aumenta l'aderenza all'allenamento e il senso di appartenenza nella community amatoriale Together Social (FLOW-TS1), tutelando la privacy tramite consenso esplicito e raggio geografico mascherato.",
        "zona": "Companion Apps: Together Social (#20 / #TS1) e Corsia 1 Client.",
        "flows": ["#20"]
    },
    {
        "name": "Soggetto Volontario Cavia Tokenomics",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Incentivi in crediti per utenti che partecipano volontariamente a ricerche.",
        "spiegazione": "Sistema di micro-tokenomics cross-ecosistema che premia gli atleti B2C che accettano di candidarsi come volontari (\"cavie\") per tesi, studi scientifici o protocolli universitari pubblicati da ricercatori e preparatori.",
        "ruolo": "Collega in modo etico la community amatoriale (FLOW-TS1) con i bandi di ricerca accademica del Marketplace Pro (FLOW-TS2), accreditando token spendibili in sconti su abbonamenti, gadget o consulenze specialistiche.",
        "zona": "Companion Apps: Together Social (#20 / #TS1, #21 / #TS2) e Corsia 3 / 4 Silo 1.",
        "flows": ["#20", "#21"]
    },
    {
        "name": "ORCID Researcher Verification",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Verifica ufficiale tramite identità accademica ORCID per accedere all'area ricercatori.",
        "spiegazione": "Procedura di autenticazione e convalida accademica basata sulle API OAuth di ORCID (Open Researcher and Contributor ID), che certifica l'affiliazione universitaria o l'attività di ricerca scientifica del professionista.",
        "ruolo": "Abilita i ricercatori e i docenti universitari all'interno del Marketplace Pro (FLOW-TS2) alla pubblicazione di bandi per la raccolta di volontari e alla moderazione di tavole rotonde peer-to-peer tra scienziati dello sport.",
        "zona": "Companion Apps: Together Social (#21 / #TS2) e Corsia 2 Gateway.",
        "flows": ["#21"]
    },
    {
        "name": "VIP Priority Inbox Anti-Spam",
        "cat": "Sicurezza, Anti-Frode & Fiscalità Digitale B2B",
        "eli5": "Casella messaggi protetta a crediti per filtrare comunicazioni irrilevanti.",
        "spiegazione": "Meccanismo di messaggistica asimmetrica a micro-tariffe che impone un costo in crediti o token per inviare messaggi diretti a profili ad alta visibilità (coach affermati, atleti di vertice, ricercatori di punta), restituendo i token se il destinatario accetta la conversazione.",
        "ruolo": "Protegge i professionisti accreditati (FLOW-TS2) dall'overload informativo e dallo spam quotidiano, garantendo priorità assoluta alle richieste di consulenza autentiche e alle collaborazioni professionali ad alto valore.",
        "zona": "Companion Apps: Together Social (#21 / #TS2) e Corsia 2 / 3.",
        "flows": ["#21"]
    },
    {
        "name": "VIP & Elite Lounges",
        "cat": "Sicurezza Enterprise & Identità Societaria (Tier 3)",
        "eli5": "Spazi di networking riservati a club professionistici e atleti d'elite.",
        "spiegazione": "Stanze digitali di networking e confronto a invito blindato, crittografate end-to-end e riservate esclusivamente a dirigenti, preparatori e staff di franchigie di Serie A, Eurolega e federazioni olimpiche (Tier 3).",
        "ruolo": "Garantisce riservatezza assoluta su metodologie avanzate, trattative di staff e casi studio ad alte prestazioni (FLOW-TS3), proteggendo le comunicazioni tramite profilazione crittografica e Ghost Mode.",
        "zona": "Companion Apps: Together Social (#22 / #TS3) e Corsia 2 / 3.",
        "flows": ["#22"]
    },
    {
        "name": "Booking Macchinari e Laboratori Avanzati",
        "cat": "Ingegneria Software & Architettura Cloud",
        "eli5": "Prenotazione oraria di laboratori biomeccanici e attrezzature scientifiche di vertice.",
        "spiegazione": "Modulo di prenotazione, noleggio e fatturazione per l'utilizzo temporaneo di laboratori universitari, apparecchiature isocinetiche, pedane di forza triassiali, sistemi ottici 3D e camere ipobariche condivise da centri di eccellenza.",
        "ruolo": "Ottimizza la saturazione e l'ammortamento dei macchinari ad alto costo tra club professionistici, università e centri di riabilitazione accreditati (FLOW-TS3), gestendo contratti e orari in Silo 1.",
        "zona": "Companion Apps: Together Social (#22 / #TS3) e Corsia 1 / 3.",
        "flows": ["#22"]
    },
    {
        "name": "Staff Recruiting & Scouting Board",
        "cat": "Principi Architetturali di Prodotto",
        "eli5": "Bacheca riservata per assumere preparatori, fisioterapisti e analisti sportivi qualificati.",
        "spiegazione": "Bacheca di offerte e candidature riservata al recruiting di staff tecnico e sanitario (preparatori atletici, sport scientist, video analyst, fisioterapisti), con filtri basati su certificazioni, paper pubblicati ed esperienza sul campo verificata.",
        "ruolo": "Facilita l'incontro trasparente e confidenziale tra club di vertice ed eccellenze professionali del movimento umano (FLOW-TS3), eliminando intermediari e garantendo la veridicità dei titoli tramite controlli di piattaforma.",
        "zona": "Companion Apps: Together Social (#22 / #TS3) e Corsia 1 / 3.",
        "flows": ["#22"]
    }
]

def make_slug(name):
    clean = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode('utf-8')
    clean = re.sub(r'[\(\)\,\/\:\.\&\%\"\'\+]', ' ', clean)
    clean = re.sub(r'\s+', '-', clean.strip().lower())
    clean = re.sub(r'-+', '-', clean)
    return clean

def run():
    glossary_path = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "00-GLOSSARIO-TERMINI-TECNICI.md")
    with open(glossary_path, encoding="utf-8") as fp:
        raw_gloss = fp.read()

    # Extract all term sections from existing glossary doc
    term_pattern = re.compile(
        r'#### <a id="([^"]+)"></a>([^\n]+)\n\*\*ELI5:\*\* "([^"]+)"\n\n- \*\*Spiegazione Semplificata:\*\* ([^\n]+)\n- \*\*Ruolo Operativo nel Progetto T7:\*\* ([\s\S]*?)\n- \*\*Zona / Flusso di Riferimento:\*\* ([^\n]+)',
        re.MULTILINE
    )

    matches = term_pattern.findall(raw_gloss)
    all_terms_map = {}

    for anchor, name, eli5, spiegazione, ruolo, zona_line in matches:
        name = re.sub(r'<a id="[^"]+"></a>', '', name).strip()
        flows_match = re.search(r'`([^`]+)`', zona_line)
        flows = [f.strip() for f in flows_match.group(1).split(",")] if flows_match else []
        zona = re.sub(r'\s*\(Flussi Miro:.*?\)', '', zona_line).strip()

        idx = raw_gloss.find(f'#### <a id="{anchor}"></a>')
        cat_matches = list(re.finditer(r'^### ([^\n]+)$', raw_gloss[:idx], re.MULTILINE))
        cat = cat_matches[-1].group(1).strip() if cat_matches else "Ingegneria Software & Architettura Cloud"

        if name in SHORTENED_ELI5:
            eli5 = SHORTENED_ELI5[name]

        all_terms_map[name] = {
            "name": name,
            "cat": cat,
            "eli5": eli5,
            "spiegazione": spiegazione.strip(),
            "ruolo": ruolo.strip(),
            "zona": zona,
            "flows": flows
        }

    for nt in NEW_TERMS:
        all_terms_map[nt["name"]] = nt

    sorted_terms = sorted(all_terms_map.values(), key=lambda x: x["name"].lower())
    print(f"Total merged terms: {len(sorted_terms)}")

    lines = [
        "# Glossario Tecnico Vivente & Matrice di Tracciabilità dei Flussi (18 Flowcharts T7)",
        "",
        "> **Documento Autoritativo di Architettura (Zona 0 - Miro Board `uXjVEbo6L2o=`)**  ",
        f"> Censimento enciclopedico di **{len(sorted_terms)} Termini Tecnici e Acronimi Ufficiali** del progetto *Sports Analytics Platform — T7 Workout APP*.  ",
        "> Ogni voce include: Identificativo univoco, Sintesi ELI5 (strettamente $\\le 10$ parole per non-tecnici), Spiegazione Operativa, Ruolo Architetturale in T7 e Mappatura 1:1 sui 18 Flussi.",
        "",
        "---",
        "",
        "## Indice Analitico A-Z",
        ""
    ]

    by_letter = defaultdict(list)
    for t in sorted_terms:
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

    for i, t in enumerate(sorted_terms, 1):
        slug = make_slug(t["name"])
        flows_str = ", ".join(t["flows"])
        lines.append(f"| **{i:02d}** | [{t['name']}](#{slug}) | {t['cat']} | `{flows_str}` |")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append(f"## Schede Terminologiche Enciclopediche ({len(sorted_terms)} Termini Ufficiali)")
    lines.append("")

    by_cat = defaultdict(list)
    for t in sorted_terms:
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

    new_glossary_content = "\n".join(lines)

    with open(glossary_path, "w", encoding="utf-8") as fp:
        fp.write(new_glossary_content)
    print(f"Updated {glossary_path} with {len(sorted_terms)} terms.")

    gen_script_path = os.path.join("tools", "generate_glossary.py")
    with open(gen_script_path, "w", encoding="utf-8") as fp:
        fp.write("# -*- coding: utf-8 -*-\n")
        fp.write('"""\n')
        fp.write('Script per la generazione enciclopedica di 00-GLOSSARIO-TERMINI-TECNICI.md\n')
        fp.write(f'Contiene {len(sorted_terms)} Schede Terminologiche complete con ELI5 (<= 10 parole).\n')
        fp.write('"""\n')
        fp.write('import re\nimport os\nimport unicodedata\nfrom collections import defaultdict\n\n')
        fp.write('GLOSSARY_PATH = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario", "00-GLOSSARIO-TERMINI-TECNICI.md")\n\n')
        fp.write("TERMS = [\n")
        for t in sorted_terms:
            fp.write("    {\n")
            fp.write(f'        "name": {repr(t["name"])},\n')
            fp.write(f'        "cat": {repr(t["cat"])},\n')
            fp.write(f'        "eli5": {repr(t["eli5"])},\n')
            fp.write(f'        "spiegazione": {repr(t["spiegazione"])},\n')
            fp.write(f'        "ruolo": {repr(t["ruolo"])},\n')
            fp.write(f'        "zona": {repr(t["zona"])},\n')
            fp.write(f'        "flows": {repr(t["flows"])}\n')
            fp.write("    },\n")
        fp.write("]\n\n")

        fp.write('''TERM_ALIASES = ''' + repr(TERM_ALIASES) + '''

def make_slug(name):
    clean = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode('utf-8')
    clean = re.sub(r'[\\(\\)\\,\\/\\:\\.\\&\\%\\"\\\'\\+]', ' ', clean)
    clean = re.sub(r'\\s+', '-', clean.strip().lower())
    clean = re.sub(r'-+', '-', clean)
    return clean

def generate_markdown():
    lines = [
        "# Glossario Tecnico Vivente & Matrice di Tracciabilità dei Flussi (18 Flowcharts T7)",
        "",
        "> **Documento Autoritativo di Architettura (Zona 0 - Miro Board `uXjVEbo6L2o=`)**  ",
        f"> Censimento enciclopedico di **{len(TERMS)} Termini Tecnici e Acronimi Ufficiali** del progetto *Sports Analytics Platform — T7 Workout APP*.  ",
        "> Ogni voce include: Identificativo univoco, Sintesi ELI5 (strettamente $\\\\le 10$ parole per non-tecnici), Spiegazione Operativa, Ruolo Architetturale in T7 e Mappatura 1:1 sui 18 Flussi.",
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
        lines.append(f"### <a id=\\"{anchor}\\"></a>{char}")
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
            lines.append(f"**ELI5:** \\"{t['eli5']}\\"")
            lines.append("")
            lines.append(f"- **Spiegazione Semplificata:** {t['spiegazione']}")
            lines.append(f"- **Ruolo Operativo nel Progetto T7:** {t['ruolo']}")
            lines.append(f"- **Zona / Flusso di Riferimento:** {t['zona']} (Flussi Miro: `{', '.join(t['flows'])}`)")
            lines.append("")

    return "\\n".join(lines)

if __name__ == "__main__":
    content = generate_markdown()
    with open(GLOSSARY_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Glossario scritto con successo in {GLOSSARY_PATH} con {len(TERMS)} termini.")
''')

    print(f"Updated {gen_script_path} with {len(sorted_terms)} terms.")

if __name__ == "__main__":
    run()
