# -*- coding: utf-8 -*-
"""
Struttura dati completa per i 18 Flowchart Architetturali Multi-Software e la Zona 0
suddivisi per i 6 Pilastri Funzionali e le 3 Tipologie di Software (Consumer, Pro, Elite Club).
"""

ZONA_0_DATA = {
    "title": "ZONA 0: LIVING TECHNICAL GLOSSARY & RBAC MATRIX",
    "x": -2600,
    "y": 5200,
    "width": 1900,
    "height": 7600,
    "sections": [
        {
            "header": "MASTER ECOSYSTEM INDEX & 3-TIER ARCHITECTURE",
            "content": "<p><strong>PIATTAFORMA T7 WORKOUT - MATRICE 3 SOFTWARE</strong></p>"
                       "<p><strong>Software 1: Consumer Edition (B2C)</strong> - App per amatori e sportivi singoli.</p>"
                       "<p><strong>Software 2: Pro Specialist Edition (B2B P.IVA)</strong> - Suite per Personal Trainer, Fisioterapisti e Chinesiologi.</p>"
                       "<p><strong>Software 3: Elite Club & Research (B2B Enterprise)</strong> - Piattaforma per Squadre Professionistiche, Staff Multidisciplinare e Laboratori Universitari.</p>"
        },
        {
            "header": "MATRICE RUOLI & PERMESSI (RBAC R1..R8)",
            "content": "<p><strong>R1: Atleta Consumer / Pro</strong> - Accesso al proprio diario, workout player e preferiti.</p>"
                       "<p><strong>R2: Personal Trainer / Coach</strong> - Gestione roster clienti, generazione macrocicli IA e analisi video.</p>"
                       "<p><strong>R3: Fisioterapista</strong> - Protocolli clinici riabilitativi cli_01..cli_32, ROM e scala VAS.</p>"
                       "<p><strong>R4: Medico Sociale</strong> - Cartella clinica EMR riservata, autorizzazione Return-to-Play.</p>"
                       "<p><strong>R5: Preparatore Atletico (S&C)</strong> - Gestione carichi microciclo MD-X, GPS, VBT e test salti PAP.</p>"
                       "<p><strong>R6: Match Analyst</strong> - Video analisi tattico-biomeccanica sul campo (CV) e codifica eventi.</p>"
                       "<p><strong>R7: Head Coach (Allenatore)</strong> - Vista tattica squadra, disponibilità atleti, pianificazione gara.</p>"
                       "<p><strong>R8: Club Executive / Admin</strong> - Gestione quote societarie, contratti e audit di sicurezza.</p>"
        },
        {
            "header": "GLOSSARIO BIOMECCANICO & STATISTICO CORE",
            "content": "<p><strong>VBT (Velocity Based Training)</strong>: Monitoraggio in tempo reale della velocita della barra (m/s). Calcolo V0, F0, Pmax e stima 1RM tramite regressione ibrida (AIC/R2_adj) con filtro outlier MAD (Median Absolute Deviation).</p>"
                       "<p><strong>PAP (Post-Activation Potentiation)</strong>: Potenziamento post-attivazione tramite stimolo condizionante. Valutazione risposta esplosiva (CMJ/SJ) con t-test, Cohen's d e soglia Minimal Detectable Change (MDC 95%).</p>"
                       "<p><strong>Z-Score Adattivo</strong>: Normalizzazione continua (X - mu) / sigma su finestra mobile rolling a 28 giorni per telemetria GPS e variabilita cardiaca HRV. Rilevamento automatico spike fatica > 2.0 SD.</p>"
                       "<p><strong>ACWR (Acute:Chronic Workload Ratio)</strong>: Rapporto tra carico acuto (7 giorni) e cronico (28 giorni) calcolato tramite EWMA (Exponentially Weighted Moving Average) per minimizzare il rischio lesivo.</p>"
                       "<p><strong>119 Clinical Triage</strong>: Matrice clinica proprietaria che analizza rachide, spalla, ginocchio e condizioni sistemiche escludendo in tempo reale gli esercizi biomeccanicamente controindicati.</p>"
        },
        {
            "header": "ARCHITETTURA DATABASE A 3 SILOS",
            "content": "<p><strong>Silo 1: Dati Relazionali & Social Standard</strong> - Profili utenti B2C, anagrafiche P.IVA, catalogo 296 esercizi, feed Together e marketplace.</p>"
                       "<p><strong>Silo 2: Bunker Club KMS Enclave</strong> - Database crittografato isolato per ciascun club di Serie A/Pro. Chiavi KMS dedicate, mTLS, zero integrazioni social, conformita HIPAA/GDPR Sanitario.</p>"
                       "<p><strong>Silo 3: Research Data Warehouse</strong> - Coorte di telemetria e dati clinici anonimizzati (k-anonymity >= 5, l-diversity) per ricerca scientifica universitaria e validazione algoritmi.</p>"
        }
    ]
}

BATCH_1_CONSUMER = [
    {
        "id": "1A",
        "title": "SOFTWARE 1 (B2C) - FLOW 1A: FAST CONSUMER ONBOARDING (30s)",
        "col": 0, "row": 0,
        "nodes": [
            {"id": "1A_N1", "lane": 1, "text": "<strong>Start: Apertura App</strong><br/>Welcome Screen Zero-Friction", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "1A_N2", "lane": 1, "text": "<strong>Bivio Autenticazione</strong><br/>Scelta canale di ingresso", "type": "diamond", "x_off": -350, "style": "amber"},
            {"id": "1A_N3", "lane": 1, "text": "<strong>1-Tap Passkey Biometrica</strong><br/>FIDO2 WebAuthn Touch/Face ID", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "1A_N4", "lane": 1, "text": "<strong>1-Tap Social Sign-In</strong><br/>Apple ID / Google One-Tap", "type": "rect", "x_off": 150, "style": "cyan"},
            {"id": "1A_N5", "lane": 2, "text": "<strong>API Gateway Ingest</strong><br/>POST /api/v1/auth/consumer", "type": "rect", "x_off": -350, "style": "purple"},
            {"id": "1A_N6", "lane": 2, "text": "<strong>Verifica Credenziali</strong><br/>Controllo Firma Crittografica", "type": "diamond", "x_off": -100, "style": "amber"},
            {"id": "1A_N7", "lane": 2, "text": "<strong>Emissione JWT Tier 1</strong><br/>Role: R1 Athlete + HttpOnly Cookie", "type": "rect", "x_off": 200, "style": "purple"},
            {"id": "1A_N8", "lane": 3, "text": "<strong>Provisioning Profilo B2C</strong><br/>Setup unita (kg/cm) e streak = 0", "type": "rect", "x_off": -100, "style": "green"},
            {"id": "1A_N9", "lane": 4, "text": "<strong>Silo 1: Salva Utente</strong><br/>auth_users, user_profiles", "type": "cylinder", "x_off": 0, "style": "rose"},
            {"id": "1A_N10", "lane": 1, "text": "<strong>Quick Goals & JIT Note</strong><br/>Obiettivi base. Anamnesi rimandata", "type": "rect", "x_off": 450, "style": "cyan"},
            {"id": "1A_N11", "lane": 1, "text": "<strong>End: Cockpit Attivo</strong><br/>Ingresso immediato alla dashboard", "type": "pill", "x_off": 700, "style": "teal"}
        ],
        "connectors": [
            ("1A_N1", "1A_N2", "Avvio"),
            ("1A_N2", "1A_N3", "Passkey"),
            ("1A_N2", "1A_N4", "Social"),
            ("1A_N3", "1A_N5", "Asserzione"),
            ("1A_N4", "1A_N5", "OAuth Token"),
            ("1A_N5", "1A_N6", "Inoltro"),
            ("1A_N6", "1A_N8", "Valido"),
            ("1A_N8", "1A_N9", "Write Silo 1"),
            ("1A_N9", "1A_N7", "Record Creato"),
            ("1A_N7", "1A_N10", "JWT 200 OK"),
            ("1A_N10", "1A_N11", "Accesso Cockpit")
        ]
    },
    {
        "id": "2A",
        "title": "SOFTWARE 1 (B2C) - FLOW 2A: PERSONAL ATHLETE COCKPIT & DIARY",
        "col": 1, "row": 0,
        "nodes": [
            {"id": "2A_N1", "lane": 1, "text": "<strong>Start: Cockpit Atleta</strong><br/>Apertura Home Dashboard", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "2A_N2", "lane": 1, "text": "<strong>Widget Scheda Oggi</strong><br/>Prossima sessione di allenamento", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "2A_N3", "lane": 1, "text": "<strong>Widget Readiness & Streak</strong><br/>Indice prontezza e giorni costanza", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "2A_N4", "lane": 2, "text": "<strong>Gateway: Fetch Cockpit</strong><br/>GET /api/v1/cockpit/athlete/today", "type": "rect", "x_off": -350, "style": "purple"},
            {"id": "2A_N5", "lane": 2, "text": "<strong>Edge Cache Check</strong><br/>Redis Cache Hit / Miss?", "type": "diamond", "x_off": -100, "style": "amber"},
            {"id": "2A_N6", "lane": 3, "text": "<strong>Readiness Calculator</strong><br/>Algoritmo RPE ieri + recupero", "type": "rect", "x_off": 150, "style": "green"},
            {"id": "2A_N7", "lane": 4, "text": "<strong>Silo 1: Schede & Log</strong><br/>Query completed_workouts, plans", "type": "cylinder", "x_off": 0, "style": "rose"},
            {"id": "2A_N8", "lane": 1, "text": "<strong>Calendario Storico Mensile</strong><br/>Riepilogo frequenza e volumi", "type": "rect", "x_off": 250, "style": "cyan"},
            {"id": "2A_N9", "lane": 1, "text": "<strong>CTA Avvia Allenamento</strong><br/>Inizia sessione odierna", "type": "pill", "x_off": 550, "style": "teal"}
        ],
        "connectors": [
            ("2A_N1", "2A_N2", "Rendering"),
            ("2A_N2", "2A_N4", "Richiesta Dati"),
            ("2A_N4", "2A_N5", "Verifica"),
            ("2A_N5", "2A_N7", "Cache Miss"),
            ("2A_N7", "2A_N6", "Dati Storici"),
            ("2A_N6", "2A_N3", "Calcolo Readiness"),
            ("2A_N5", "2A_N3", "Cache Hit"),
            ("2A_N3", "2A_N8", "Visualizza"),
            ("2A_N8", "2A_N9", "Pronto")
        ]
    },
    {
        "id": "3A",
        "title": "SOFTWARE 1 (B2C) - FLOW 3A: INTERACTIVE WORKOUT PLAYER & LOGGING",
        "col": 2, "row": 0,
        "nodes": [
            {"id": "3A_N1", "lane": 1, "text": "<strong>Start: Workout Player</strong><br/>Esercizio, Target Reps e Kg", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "3A_N2", "lane": 1, "text": "<strong>Input Serie Eseguita</strong><br/>Inserimento Kg reali e Ripetizioni", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "3A_N3", "lane": 1, "text": "<strong>Timer Recupero Attivo</strong><br/>Countdown sonoro e vibrazione", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "3A_N4", "lane": 1, "text": "<strong>Fine Workout: Log RPE</strong><br/>Fatica percepita sessione (1-10)", "type": "rect", "x_off": 200, "style": "cyan"},
            {"id": "3A_N5", "lane": 2, "text": "<strong>API Gateway Log Ingest</strong><br/>POST /api/v1/workouts/complete", "type": "rect", "x_off": 0, "style": "purple"},
            {"id": "3A_N6", "lane": 3, "text": "<strong>Volume & PR Calculator</strong><br/>Tonnellaggio e stima 1RM", "type": "rect", "x_off": 150, "style": "green"},
            {"id": "3A_N7", "lane": 3, "text": "<strong>Nuovo PR Rilevato?</strong><br/>Superato record precedente?", "type": "diamond", "x_off": 400, "style": "amber"},
            {"id": "3A_N8", "lane": 4, "text": "<strong>Silo 1: Salva Sessione</strong><br/>completed_workouts, athlete_records", "type": "cylinder", "x_off": 250, "style": "rose"},
            {"id": "3A_N9", "lane": 1, "text": "<strong>End: Card Riepilogo</strong><br/>Tonnellaggio, Badge PR e Calorie", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("3A_N1", "3A_N2", "Avvio Serie"),
            ("3A_N2", "3A_N3", "Serie Fatta"),
            ("3A_N3", "3A_N2", "Prossima Serie"),
            ("3A_N3", "3A_N4", "Ultima Serie"),
            ("3A_N4", "3A_N5", "Invia Log"),
            ("3A_N5", "3A_N6", "Elabora"),
            ("3A_N6", "3A_N7", "Verifica PR"),
            ("3A_N7", "3A_N8", "Scrittura DB"),
            ("3A_N8", "3A_N9", "Riepilogo")
        ]
    },
    {
        "id": "4A",
        "title": "SOFTWARE 1 (B2C) - FLOW 4A: WEARABLE HEALTH SYNC & TRENDS",
        "col": 3, "row": 0,
        "nodes": [
            {"id": "4A_N1", "lane": 1, "text": "<strong>Start: Connetti Dispositivo</strong><br/>Apple Health / Health Connect", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "4A_N2", "lane": 1, "text": "<strong>Autorizzazione Permessi</strong><br/>Passi, Sonno, FC Riposo", "type": "diamond", "x_off": -350, "style": "amber"},
            {"id": "4A_N3", "lane": 2, "text": "<strong>Gateway Sync Ingest</strong><br/>POST /api/v1/integrations/wearables", "type": "rect", "x_off": -200, "style": "purple"},
            {"id": "4A_N4", "lane": 3, "text": "<strong>Biometric Engine</strong><br/>Aggregazione sonno e FC riposo", "type": "rect", "x_off": 50, "style": "green"},
            {"id": "4A_N5", "lane": 3, "text": "<strong>Correlazione Carico</strong><br/>Impatto sonno su performance", "type": "rect", "x_off": 300, "style": "green"},
            {"id": "4A_N6", "lane": 4, "text": "<strong>Silo 1: Biometrics Store</strong><br/>biometrics_daily, sleep_logs", "type": "cylinder", "x_off": 150, "style": "rose"},
            {"id": "4A_N7", "lane": 1, "text": "<strong>Dashboard Trend</strong><br/>Grafici settimanali e punteggio", "type": "rect", "x_off": 450, "style": "cyan"},
            {"id": "4A_N8", "lane": 1, "text": "<strong>End: Insight Prontezza</strong><br/>Consiglio giornaliero di recupero", "type": "pill", "x_off": 700, "style": "teal"}
        ],
        "connectors": [
            ("4A_N1", "4A_N2", "Richiesta"),
            ("4A_N2", "4A_N3", "Concesso"),
            ("4A_N3", "4A_N4", "Stream Dati"),
            ("4A_N4", "4A_N6", "Salvataggio"),
            ("4A_N6", "4A_N5", "Analisi"),
            ("4A_N5", "4A_N7", "Genera Trend"),
            ("4A_N7", "4A_N8", "Insight Finale")
        ]
    },
    {
        "id": "5A",
        "title": "SOFTWARE 1 (B2C) - FLOW 5A: TOGETHER SOCIAL COMMUNITY & COACH MARKETPLACE",
        "col": 4, "row": 0,
        "nodes": [
            {"id": "5A_N1", "lane": 1, "text": "<strong>Start: Sezione Together</strong><br/>Feed Community & Condivisione", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "5A_N2", "lane": 1, "text": "<strong>Feed Schede & Record</strong><br/>PR amici, like e commenti", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "5A_N3", "lane": 1, "text": "<strong>Condividi Record PR</strong><br/>Pubblica nuovo traguardo", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "5A_N4", "lane": 1, "text": "<strong>Marketplace Coach</strong><br/>Esplora PT e Chinesiologi", "type": "rect", "x_off": 150, "style": "cyan"},
            {"id": "5A_N5", "lane": 2, "text": "<strong>API Gateway Social</strong><br/>POST /api/v1/social/posts", "type": "rect", "x_off": -200, "style": "purple"},
            {"id": "5A_N6", "lane": 2, "text": "<strong>API Gateway Lead</strong><br/>POST /api/v1/marketplace/hire", "type": "rect", "x_off": 150, "style": "purple"},
            {"id": "5A_N7", "lane": 3, "text": "<strong>Social Ranking Engine</strong><br/>Ordinamento feed e moderazione", "type": "rect", "x_off": -50, "style": "green"},
            {"id": "5A_N8", "lane": 3, "text": "<strong>Coach Matching Engine</strong><br/>Geolocalizzazione e specialita", "type": "rect", "x_off": 350, "style": "green"},
            {"id": "5A_N9", "lane": 4, "text": "<strong>Silo 1: Social & Leads</strong><br/>social_posts, coaching_leads", "type": "cylinder", "x_off": 100, "style": "rose"},
            {"id": "5A_N10", "lane": 1, "text": "<strong>End: Richiesta Inviata</strong><br/>Notifica al Coach nel Roster", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("5A_N1", "5A_N2", "Accesso"),
            ("5A_N2", "5A_N3", "Nuovo Post"),
            ("5A_N3", "5A_N5", "Pubblica"),
            ("5A_N5", "5A_N7", "Audit"),
            ("5A_N7", "5A_N9", "Salva Post"),
            ("5A_N1", "5A_N4", "Cerca Coach"),
            ("5A_N4", "5A_N6", "Richiesta Coaching"),
            ("5A_N6", "5A_N8", "Matching"),
            ("5A_N8", "5A_N9", "Crea Lead"),
            ("5A_N8", "5A_N10", "Notifica Inviata")
        ]
    },
    {
        "id": "6A",
        "title": "SOFTWARE 1 (B2C) - FLOW 6A: MOVELY DESK-CARE & ACTIVE MICRO-PAUSES",
        "col": 5, "row": 0,
        "nodes": [
            {"id": "6A_N1", "lane": 1, "text": "<strong>Start: Desk-Care Monitor</strong><br/>Timer Sedentarieta Attivo", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "6A_N2", "lane": 1, "text": "<strong>Trigger Sedentarieta</strong><br/>50 min senza movimento?", "type": "diamond", "x_off": -350, "style": "amber"},
            {"id": "6A_N3", "lane": 1, "text": "<strong>Notifica Micro-Pausa</strong><br/>Invito a 2 minuti di scarico", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "6A_N4", "lane": 1, "text": "<strong>Esercizi Postura Guidati</strong><br/>Cervicale, Spalle e Lombare", "type": "rect", "x_off": 150, "style": "cyan"},
            {"id": "6A_N5", "lane": 2, "text": "<strong>API Gateway Break Log</strong><br/>POST /api/v1/deskcare/complete", "type": "rect", "x_off": 150, "style": "purple"},
            {"id": "6A_N6", "lane": 3, "text": "<strong>Routine Rotator Engine</strong><br/>Rotazione micro-pause posturali", "type": "rect", "x_off": 0, "style": "green"},
            {"id": "6A_N7", "lane": 3, "text": "<strong>Posture Score Calculator</strong><br/>Indice benessere ergonomico", "type": "rect", "x_off": 350, "style": "green"},
            {"id": "6A_N8", "lane": 4, "text": "<strong>Silo 1: Wellness Log</strong><br/>deskcare_logs, streaks", "type": "cylinder", "x_off": 250, "style": "rose"},
            {"id": "6A_N9", "lane": 1, "text": "<strong>End: Pausa Completata</strong><br/>Streak posturale incrementato", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("6A_N1", "6A_N2", "Monitoraggio"),
            ("6A_N2", "6A_N3", "Soglia Raggiunta"),
            ("6A_N3", "6A_N4", "Avvia Guida"),
            ("6A_N4", "6A_N5", "Pausa Fatta"),
            ("6A_N5", "6A_N6", "Aggiorna"),
            ("6A_N6", "6A_N7", "Calcolo Score"),
            ("6A_N7", "6A_N8", "Salva"),
            ("6A_N8", "6A_N9", "Score OK")
        ]
    }
]

BATCH_2_PRO = [
    {
        "id": "1B",
        "title": "SOFTWARE 2 (B2B PRO P.IVA) - FLOW 1B: PROFESSIONAL ONBOARDING & STRIPE",
        "col": 0, "row": 1,
        "nodes": [
            {"id": "1B_N1", "lane": 1, "text": "<strong>Start: Registrazione Pro</strong><br/>Landing per Professionisti", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "1B_N2", "lane": 1, "text": "<strong>Dati Fiscali & Albo</strong><br/>P.IVA, Chinesiologia/CONI", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "1B_N3", "lane": 1, "text": "<strong>Setup Stripe Connect</strong><br/>Conto incassi per clienti", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "1B_N4", "lane": 2, "text": "<strong>Gateway Pro Ingest</strong><br/>POST /api/v1/pro/onboard", "type": "rect", "x_off": -350, "style": "purple"},
            {"id": "1B_N5", "lane": 2, "text": "<strong>Verifica VIES / Fiscale</strong><br/>P.IVA attiva e valida?", "type": "diamond", "x_off": -100, "style": "amber"},
            {"id": "1B_N6", "lane": 2, "text": "<strong>Emissione JWT Tier 2</strong><br/>Role: R2 Coach / R3 Physio", "type": "rect", "x_off": 150, "style": "purple"},
            {"id": "1B_N7", "lane": 3, "text": "<strong>Pro Tenant Provisioning</strong><br/>Inizializzazione quota 30 atleti", "type": "rect", "x_off": 0, "style": "green"},
            {"id": "1B_N8", "lane": 4, "text": "<strong>Silo 1: Tenant Pro</strong><br/>pro_tenants, stripe_accounts", "type": "cylinder", "x_off": 150, "style": "rose"},
            {"id": "1B_N9", "lane": 1, "text": "<strong>Personalizza Studio</strong><br/>Logo, Colori e Header schede", "type": "rect", "x_off": 400, "style": "cyan"},
            {"id": "1B_N10", "lane": 1, "text": "<strong>End: Coach Operativo</strong><br/>Accesso al Coach Hub", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("1B_N1", "1B_N2", "Avvio Form"),
            ("1B_N2", "1B_N4", "Invia P.IVA"),
            ("1B_N4", "1B_N5", "Verifica"),
            ("1B_N5", "1B_N3", "Valida -> Stripe"),
            ("1B_N3", "1B_N7", "Stripe Connesso"),
            ("1B_N7", "1B_N8", "Crea Tenant"),
            ("1B_N8", "1B_N6", "JWT Tier 2"),
            ("1B_N6", "1B_N9", "Branding"),
            ("1B_N9", "1B_N10", "Hub Pronto")
        ]
    },
    {
        "id": "2B",
        "title": "SOFTWARE 2 (B2B PRO P.IVA) - FLOW 2B: COACH MULTI-ATHLETE ROSTER & ADHERENCE HUB",
        "col": 1, "row": 1,
        "nodes": [
            {"id": "2B_N1", "lane": 1, "text": "<strong>Start: Coach Hub</strong><br/>Panoramica Roster Atleti", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "2B_N2", "lane": 1, "text": "<strong>Tabella Roster Completo</strong><br/>Stato Scheda, Aderenza % e Alert", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "2B_N3", "lane": 1, "text": "<strong>Badge Alert RPE/Dolore</strong><br/>Evidenziazione atleti a rischio", "type": "rect", "x_off": -100, "style": "red"},
            {"id": "2B_N4", "lane": 1, "text": "<strong>Invita Nuovo Atleta</strong><br/>Genera link / email onboarding", "type": "rect", "x_off": 150, "style": "cyan"},
            {"id": "2B_N5", "lane": 2, "text": "<strong>Gateway: Roster Query</strong><br/>GET /api/v1/pro/roster", "type": "rect", "x_off": -350, "style": "purple"},
            {"id": "2B_N6", "lane": 2, "text": "<strong>Controllo Quota Atleti</strong><br/>Limite Tier 2 raggiunto?", "type": "diamond", "x_off": 150, "style": "amber"},
            {"id": "2B_N7", "lane": 3, "text": "<strong>Adherence Engine</strong><br/>Pianificate vs Completate", "type": "rect", "x_off": -150, "style": "green"},
            {"id": "2B_N8", "lane": 3, "text": "<strong>Clinical Triage Scanner</strong><br/>Rilevamento allarmi clinici", "type": "rect", "x_off": 0, "style": "green"},
            {"id": "2B_N9", "lane": 4, "text": "<strong>Silo 1: Clienti Pro</strong><br/>pro_clients WHERE coach_id", "type": "cylinder", "x_off": -100, "style": "rose"},
            {"id": "2B_N10", "lane": 1, "text": "<strong>End: Gestione Scheda</strong><br/>Apertura profilo atleta scelto", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("2B_N1", "2B_N2", "Accesso"),
            ("2B_N2", "2B_N5", "Fetch Roster"),
            ("2B_N5", "2B_N9", "Query DB"),
            ("2B_N9", "2B_N7", "Elabora"),
            ("2B_N7", "2B_N8", "Verifica Alert"),
            ("2B_N8", "2B_N3", "Segnala Alert"),
            ("2B_N2", "2B_N4", "Aggiungi Cliente"),
            ("2B_N4", "2B_N6", "Quota Check"),
            ("2B_N6", "2B_N10", "Invito Valido"),
            ("2B_N3", "2B_N10", "Apri Scheda")
        ]
    },
    {
        "id": "3B",
        "title": "SOFTWARE 2 (B2B PRO P.IVA) - FLOW 3B: AI MACROCYCLE GENERATOR WITH 119 CLINICAL TRIAGE",
        "col": 2, "row": 1,
        "nodes": [
            {"id": "3B_N1", "lane": 1, "text": "<strong>Start: Wizard Schede</strong><br/>Selezione Atleta dal Roster", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "3B_N2", "lane": 1, "text": "<strong>Checklist 119 Patologie</strong><br/>Rachide, Spalla, Ginocchio, ROM", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "3B_N3", "lane": 1, "text": "<strong>Parametri Periodizzazione</strong><br/>DUP 12-16 sett, frequenza 3-5gg", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "3B_N4", "lane": 2, "text": "<strong>Gateway Programming Ingest</strong><br/>POST /api/v1/pro/programming", "type": "rect", "x_off": -200, "style": "purple"},
            {"id": "3B_N5", "lane": 3, "text": "<strong>119 Clinical Triage Engine</strong><br/>Blacklist esercizi vietati", "type": "rect", "x_off": -50, "style": "green"},
            {"id": "3B_N6", "lane": 3, "text": "<strong>DUP Progression Engine</strong><br/>Modulazione carichi e volume", "type": "rect", "x_off": 150, "style": "green"},
            {"id": "3B_N7", "lane": 3, "text": "<strong>Openpyxl Excel Engine</strong><br/>Generazione .xlsx non protetto", "type": "rect", "x_off": 350, "style": "green"},
            {"id": "3B_N8", "lane": 4, "text": "<strong>Silo 1: Schede & Esercizi</strong><br/>296 catalogati + 119 patologie", "type": "cylinder", "x_off": 50, "style": "rose"},
            {"id": "3B_N9", "lane": 1, "text": "<strong>Visualizzazione Scheda</strong><br/>Esercizi con badge rischio", "type": "rect", "x_off": 400, "style": "cyan"},
            {"id": "3B_N10", "lane": 1, "text": "<strong>End: Download Excel</strong><br/>File .xlsx pronto e salvato", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("3B_N1", "3B_N2", "Scelta Atleta"),
            ("3B_N2", "3B_N3", "Imposta DUP"),
            ("3B_N3", "3B_N4", "Genera Piano"),
            ("3B_N4", "3B_N5", "Audit Triage"),
            ("3B_N5", "3B_N8", "Filtro 296 Esercizi"),
            ("3B_N8", "3B_N6", "Calcolo Progressione"),
            ("3B_N6", "3B_N9", "Mostra a Schermo"),
            ("3B_N9", "3B_N7", "Esporta"),
            ("3B_N7", "3B_N10", "Scarica Excel")
        ]
    },
    {
        "id": "4B",
        "title": "SOFTWARE 2 (B2B PRO P.IVA) - FLOW 4B: BIOMECHANICAL VBT & PAP JUMP ANALYSIS",
        "col": 3, "row": 1,
        "nodes": [
            {"id": "4B_N1", "lane": 1, "text": "<strong>Start: Connetti Sensore BLE</strong><br/>Encoder Vitruve / Piattaforma", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "4B_N2", "lane": 1, "text": "<strong>Scelta Protocollo</strong><br/>VBT Carico-Velocita vs PAP Salti", "type": "diamond", "x_off": -350, "style": "amber"},
            {"id": "4B_N3", "lane": 1, "text": "<strong>Esecuzione Serie VBT</strong><br/>4 carichi a massima velocita", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "4B_N4", "lane": 1, "text": "<strong>Protocollo PAP Salti</strong><br/>Baseline CMJ -> 4, 8, 12 min", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "4B_N5", "lane": 2, "text": "<strong>Gateway Stream BLE</strong><br/>POST /api/v1/pro/biomechanics", "type": "rect", "x_off": 100, "style": "purple"},
            {"id": "4B_N6", "lane": 3, "text": "<strong>Filtro Outlier MAD</strong><br/>Scarto ripetizioni anomale", "type": "rect", "x_off": -50, "style": "green"},
            {"id": "4B_N7", "lane": 3, "text": "<strong>Regressione Ibrida VBT</strong><br/>Lineare vs Poly (AIC/R2_adj), 1RM", "type": "rect", "x_off": 150, "style": "green"},
            {"id": "4B_N8", "lane": 3, "text": "<strong>PAP Stats & MDC 95%</strong><br/>Student t-test e Cohen's d", "type": "rect", "x_off": 350, "style": "green"},
            {"id": "4B_N9", "lane": 4, "text": "<strong>Silo 1: Archivio Biomeccanica</strong><br/>vbt_trials, pap_tests", "type": "cylinder", "x_off": 250, "style": "rose"},
            {"id": "4B_N10", "lane": 1, "text": "<strong>End: Grafici Chart.js</strong><br/>Curve F-V, Pmax e Trend PAP", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("4B_N1", "4B_N2", "Accoppia BLE"),
            ("4B_N2", "4B_N3", "VBT"),
            ("4B_N2", "4B_N4", "PAP"),
            ("4B_N3", "4B_N5", "Stream m/s"),
            ("4B_N4", "4B_N5", "Stream Salti"),
            ("4B_N5", "4B_N6", "Filtro"),
            ("4B_N6", "4B_N7", "Fit VBT"),
            ("4B_N6", "4B_N8", "Fit PAP"),
            ("4B_N7", "4B_N9", "Salva Dati"),
            ("4B_N8", "4B_N9", "Salva Dati"),
            ("4B_N9", "4B_N10", "Render Grafici")
        ]
    },
    {
        "id": "5B",
        "title": "SOFTWARE 2 (B2B PRO P.IVA) - FLOW 5B: TOGETHER PRO BUSINESS & REMOTE CLIENT REVIEW",
        "col": 4, "row": 1,
        "nodes": [
            {"id": "5B_N1", "lane": 1, "text": "<strong>Start: Together Pro Suite</strong><br/>Gestione Vetrina & Clienti", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "5B_N2", "lane": 1, "text": "<strong>Vetrina Professionista</strong><br/>Bio, Pacchetti e Tariffe", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "5B_N3", "lane": 1, "text": "<strong>Coda Revisioni Video</strong><br/>Esecuzioni inviate dagli atleti", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "5B_N4", "lane": 1, "text": "<strong>Drawing Tool Angoli</strong><br/>Tracciamento biomeccanico su video", "type": "rect", "x_off": 150, "style": "cyan"},
            {"id": "5B_N5", "lane": 2, "text": "<strong>Gateway Pro Media</strong><br/>POST /api/v1/pro/video/feedback", "type": "rect", "x_off": 0, "style": "purple"},
            {"id": "5B_N6", "lane": 3, "text": "<strong>Media Transcoder Engine</strong><br/>Sovrimpressione cues e angoli", "type": "rect", "x_off": 200, "style": "green"},
            {"id": "5B_N7", "lane": 3, "text": "<strong>Push Dispatcher</strong><br/>Notifica immediata all'atleta", "type": "rect", "x_off": 400, "style": "green"},
            {"id": "5B_N8", "lane": 4, "text": "<strong>Silo 1: Video Feedback</strong><br/>video_reviews, pro_profiles", "type": "cylinder", "x_off": 100, "style": "rose"},
            {"id": "5B_N9", "lane": 1, "text": "<strong>End: Feedback Inviato</strong><br/>Atleta riceve correzione tecnica", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("5B_N1", "5B_N2", "Profilo"),
            ("5B_N1", "5B_N3", "Video In Arrivo"),
            ("5B_N3", "5B_N4", "Analizza"),
            ("5B_N4", "5B_N5", "Invia Correzione"),
            ("5B_N5", "5B_N6", "Transcodifica"),
            ("5B_N6", "5B_N8", "Salva Feedback"),
            ("5B_N8", "5B_N7", "Notifica"),
            ("5B_N7", "5B_N9", "Concluso")
        ]
    },
    {
        "id": "6B",
        "title": "SOFTWARE 2 (B2B PRO P.IVA) - FLOW 6B: PHYSIO REHAB PROTOCOLS & ROM TRACKING",
        "col": 5, "row": 1,
        "nodes": [
            {"id": "6B_N1", "lane": 1, "text": "<strong>Start: Modulo Clinico Physio</strong><br/>Selezione Paziente / Atleta", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "6B_N2", "lane": 1, "text": "<strong>Protocollo Riabilitativo</strong><br/>cli_01..32 (LCA, Cuffia, Rachide)", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "6B_N3", "lane": 1, "text": "<strong>Misura ROM Goniometrico</strong><br/>Gradi estensione / flessione", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "6B_N4", "lane": 1, "text": "<strong>Scala Dolore VAS (0-10)</strong><br/>Input soggettivo del paziente", "type": "rect", "x_off": 150, "style": "cyan"},
            {"id": "6B_N5", "lane": 2, "text": "<strong>Gateway Physio Session</strong><br/>POST /api/v1/pro/physio/session", "type": "rect", "x_off": 0, "style": "purple"},
            {"id": "6B_N6", "lane": 3, "text": "<strong>Derivata Recupero ROM</strong><br/>% incremento articolare settimanale", "type": "rect", "x_off": 150, "style": "green"},
            {"id": "6B_N7", "lane": 3, "text": "<strong>Allarme Dolore VAS > 4?</strong><br/>De-escalation immediata del carico", "type": "diamond", "x_off": 350, "style": "amber"},
            {"id": "6B_N8", "lane": 4, "text": "<strong>Silo 1: Cartella Clinica Pro</strong><br/>physio_sessions, rom_logs", "type": "cylinder", "x_off": 250, "style": "rose"},
            {"id": "6B_N9", "lane": 1, "text": "<strong>End: Milestone Clinica</strong><br/>Grafico evoluzione recupero", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("6B_N1", "6B_N2", "Seleziona Paziente"),
            ("6B_N2", "6B_N3", "Test ROM"),
            ("6B_N3", "6B_N4", "Valuta VAS"),
            ("6B_N4", "6B_N5", "Salva Seduta"),
            ("6B_N5", "6B_N6", "Elabora"),
            ("6B_N6", "6B_N7", "Soglia Dolore"),
            ("6B_N7", "6B_N8", "Archiviazione"),
            ("6B_N8", "6B_N9", "Milestone OK")
        ]
    }
]

BATCH_3_CLUB = [
    {
        "id": "1C",
        "title": "SOFTWARE 3 (B2B ENTERPRISE) - FLOW 1C: BUNKER CLUB ONBOARDING & KMS SILO 2",
        "col": 0, "row": 2,
        "nodes": [
            {"id": "1C_N1", "lane": 1, "text": "<strong>Start: Accesso Bunker Club</strong><br/>Portale Riservato Serie A / Elite", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "1C_N2", "lane": 1, "text": "<strong>Scansione Invito Blindato</strong><br/>Magic Link / QR Medico Sociale", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "1C_N3", "lane": 1, "text": "<strong>Passkey Hardware FIDO2</strong><br/>Dispositivo societario verificato", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "1C_N4", "lane": 2, "text": "<strong>Gateway mTLS & Firewall</strong><br/>Mutual TLS + IP Whitelist Club", "type": "rect", "x_off": -350, "style": "purple"},
            {"id": "1C_N5", "lane": 2, "text": "<strong>Emissione JWT Tier 3</strong><br/>Club Tenant + Ruolo R1..R8", "type": "rect", "x_off": 150, "style": "purple"},
            {"id": "1C_N6", "lane": 3, "text": "<strong>KMS Envelope Decryption</strong><br/>Aggancio chiave crittografica club", "type": "rect", "x_off": -100, "style": "green"},
            {"id": "1C_N7", "lane": 3, "text": "<strong>RBAC Provisioning & Audit</strong><br/>Registro immutabile accessi", "type": "rect", "x_off": 100, "style": "green"},
            {"id": "1C_N8", "lane": 4, "text": "<strong>Silo 2: Bunker KMS Enclave</strong><br/>Crittografia AES-256 a riposo", "type": "cylinder", "x_off": 0, "style": "rose"},
            {"id": "1C_N9", "lane": 1, "text": "<strong>End: Cockpit Blindato</strong><br/>Accesso sicuro staff multidisciplinare", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("1C_N1", "1C_N2", "Scan QR"),
            ("1C_N2", "1C_N3", "Biometria"),
            ("1C_N3", "1C_N4", "mTLS Handshake"),
            ("1C_N4", "1C_N6", "Autenticazione"),
            ("1C_N6", "1C_N8", "KMS Handshake"),
            ("1C_N8", "1C_N7", "Audit Trail"),
            ("1C_N7", "1C_N5", "Genera JWT"),
            ("1C_N5", "1C_N9", "Ingresso Squadra")
        ]
    },
    {
        "id": "2C",
        "title": "SOFTWARE 3 (B2B ENTERPRISE) - FLOW 2C: MULTI-STAFF SQUAD COCKPIT & ROLE SEGREGATION",
        "col": 1, "row": 2,
        "nodes": [
            {"id": "2C_N1", "lane": 1, "text": "<strong>Start: Cockpit Squadra</strong><br/>Accesso Multi-Staff", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "2C_N2", "lane": 1, "text": "<strong>Bivio Ruolo Staff (R1..R8)</strong><br/>Selettore Proiezione Vista", "type": "diamond", "x_off": -350, "style": "amber"},
            {"id": "2C_N3", "lane": 1, "text": "<strong>Vista Allenatore (R7)</strong><br/>Schieramento tattico e disponibilita", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "2C_N4", "lane": 1, "text": "<strong>Vista Preparatore (R5)</strong><br/>Carichi GPS e fatica", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "2C_N5", "lane": 1, "text": "<strong>Vista Medico (R4)</strong><br/>Cartella clinica e Return to Play", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "2C_N6", "lane": 2, "text": "<strong>Gateway RBAC Segregator</strong><br/>GET /api/v1/club/cockpit", "type": "rect", "x_off": 100, "style": "purple"},
            {"id": "2C_N7", "lane": 3, "text": "<strong>Data Redaction Engine</strong><br/>Oscuramento dati medici a non sanitari", "type": "rect", "x_off": 100, "style": "green"},
            {"id": "2C_N8", "lane": 3, "text": "<strong>Team Readiness Index</strong><br/>Media ponderata squadra", "type": "rect", "x_off": 300, "style": "green"},
            {"id": "2C_N9", "lane": 4, "text": "<strong>Silo 2: Squad Bunker Data</strong><br/>squad_roster, medical_records", "type": "cylinder", "x_off": 200, "style": "rose"},
            {"id": "2C_N10", "lane": 1, "text": "<strong>End: Cockpit Operativo</strong><br/>Ogni staff visualizza solo il consentito", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("2C_N1", "2C_N2", "Autenticazione"),
            ("2C_N2", "2C_N3", "Allenatore"),
            ("2C_N2", "2C_N4", "Preparatore"),
            ("2C_N2", "2C_N5", "Medico"),
            ("2C_N3", "2C_N6", "Query"),
            ("2C_N4", "2C_N6", "Query"),
            ("2C_N5", "2C_N6", "Query"),
            ("2C_N6", "2C_N7", "Filtro Privacy"),
            ("2C_N7", "2C_N9", "Lettura Silo 2"),
            ("2C_N9", "2C_N8", "Aggrega Score"),
            ("2C_N8", "2C_N10", "Cockpit Ready")
        ]
    },
    {
        "id": "3C",
        "title": "SOFTWARE 3 (B2B ENTERPRISE) - FLOW 3C: SQUAD MICROCYCLE PLANNING & MATCH DAY LOADS",
        "col": 2, "row": 2,
        "nodes": [
            {"id": "3C_N1", "lane": 1, "text": "<strong>Start: Microciclo Gara</strong><br/>Timeline MD-4 -> MD+1", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "3C_N2", "lane": 1, "text": "<strong>Doppi Ruoli Tattici</strong><br/>Es. Terzino / Esterno Alto", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "3C_N3", "lane": 1, "text": "<strong>Compensazione Panchina</strong><br/>Carichi riserve non impiegate", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "3C_N4", "lane": 2, "text": "<strong>Gateway Microcycle Ingest</strong><br/>POST /api/v1/club/microcycles", "type": "rect", "x_off": -150, "style": "purple"},
            {"id": "3C_N5", "lane": 2, "text": "<strong>Verifica Doppia Firma</strong><br/>Preparatore + Allenatore?", "type": "diamond", "x_off": 100, "style": "amber"},
            {"id": "3C_N6", "lane": 3, "text": "<strong>ACWR EWMA Engine</strong><br/>Finestra ottimale 0.8 - 1.3", "type": "rect", "x_off": 50, "style": "green"},
            {"id": "3C_N7", "lane": 3, "text": "<strong>Dual-Role Load Balancer</strong><br/>Compensazione metabolica ruoli", "type": "rect", "x_off": 300, "style": "green"},
            {"id": "3C_N8", "lane": 4, "text": "<strong>Silo 2: Piani Squadra</strong><br/>squad_microcycles, player_loads", "type": "cylinder", "x_off": 200, "style": "rose"},
            {"id": "3C_N9", "lane": 1, "text": "<strong>Grafico Carichi & Alert</strong><br/>Spike ACWR > 1.5 allarme rosso", "type": "rect", "x_off": 400, "style": "red"},
            {"id": "3C_N10", "lane": 1, "text": "<strong>End: Microciclo Validato</strong><br/>Distribuito a tutti gli atleti", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("3C_N1", "3C_N2", "Imposta Giorni"),
            ("3C_N2", "3C_N3", "Bilancia Ruoli"),
            ("3C_N3", "3C_N4", "Invia Piano"),
            ("3C_N4", "3C_N5", "Firma"),
            ("3C_N5", "3C_N6", "Calcola ACWR"),
            ("3C_N6", "3C_N7", "Bilanciamento"),
            ("3C_N7", "3C_N8", "Salva Silo 2"),
            ("3C_N8", "3C_N9", "Render ACWR"),
            ("3C_N9", "3C_N10", "Approvato")
        ]
    },
    {
        "id": "4C",
        "title": "SOFTWARE 3 (B2B ENTERPRISE) - FLOW 4C: GPS TELEMETRY & ADAPTIVE Z-SCORE FATIGUE",
        "col": 3, "row": 2,
        "nodes": [
            {"id": "4C_N1", "lane": 1, "text": "<strong>Start: Telemetria Campo</strong><br/>Ricezione Sessione GPS", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "4C_N2", "lane": 1, "text": "<strong>Pannello Live Metriche</strong><br/>TD, HSR (>19.8km/h), Sprint", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "4C_N3", "lane": 1, "text": "<strong>Heatmap Campo Dinamica</strong><br/>Densita posizionale giocatore", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "4C_N4", "lane": 2, "text": "<strong>Gateway High-Throughput</strong><br/>POST /api/v1/club/gps-batch", "type": "rect", "x_off": -200, "style": "purple"},
            {"id": "4C_N5", "lane": 3, "text": "<strong>GPS Parser & Filter</strong><br/>Scarto perdite segnale DOP < 2", "type": "rect", "x_off": -50, "style": "green"},
            {"id": "4C_N6", "lane": 3, "text": "<strong>Adaptive Z-Score Engine</strong><br/>Finestra mobile rolling 28gg", "type": "rect", "x_off": 150, "style": "green"},
            {"id": "4C_N7", "lane": 3, "text": "<strong>Fusione HRV Mattutino</strong><br/>Correlazione rMSSD cardiaco", "type": "rect", "x_off": 350, "style": "green"},
            {"id": "4C_N8", "lane": 4, "text": "<strong>Silo 2: Telemetria Bunker</strong><br/>gps_sessions, fatigue_zscores", "type": "cylinder", "x_off": 250, "style": "rose"},
            {"id": "4C_N9", "lane": 1, "text": "<strong>Radar Z-Score & Alert</strong><br/>Allarme fatica Z > +2.0 SD", "type": "rect", "x_off": 400, "style": "red"},
            {"id": "4C_N10", "lane": 1, "text": "<strong>End: Report Telemetria</strong><br/>Profilo carico completo salvato", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("4C_N1", "4C_N2", "Download GPS"),
            ("4C_N2", "4C_N4", "Batch Ingest"),
            ("4C_N4", "4C_N5", "Parsing"),
            ("4C_N5", "4C_N6", "Calcolo Z-Score"),
            ("4C_N6", "4C_N7", "Fusione HRV"),
            ("4C_N7", "4C_N8", "Scrittura Bunker"),
            ("4C_N8", "4C_N3", "Render Heatmap"),
            ("4C_N8", "4C_N9", "Radar Fatica"),
            ("4C_N9", "4C_N10", "Concluso")
        ]
    },
    {
        "id": "5C",
        "title": "SOFTWARE 3 (B2B ENTERPRISE) - FLOW 5C: CONFIDENTIAL TACTICAL VIDEO COMPUTER VISION",
        "col": 4, "row": 2,
        "nodes": [
            {"id": "5C_N1", "lane": 1, "text": "<strong>Start: Video Tattico Gara</strong><br/>Caricamento Clip Multi-Camera", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "5C_N2", "lane": 1, "text": "<strong>Player Video Privato</strong><br/>Watermark Confidenziale No-Social", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "5C_N3", "lane": 1, "text": "<strong>Tag Eventi Partita</strong><br/>Transizioni, Duelli e Pressione", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "5C_N4", "lane": 2, "text": "<strong>Gateway Secure Streaming</strong><br/>POST /api/v1/club/video/tactical", "type": "rect", "x_off": -200, "style": "purple"},
            {"id": "5C_N5", "lane": 3, "text": "<strong>YOLO & Pose Detection</strong><br/>Coordinate (X,Y) giocatori", "type": "rect", "x_off": -50, "style": "green"},
            {"id": "5C_N6", "lane": 3, "text": "<strong>Proiezione Omografica 2D</strong><br/>Trasformazione prospettiva campo", "type": "rect", "x_off": 150, "style": "green"},
            {"id": "5C_N7", "lane": 3, "text": "<strong>Diagrammi di Voronoi</strong><br/>Spazi dominati e compattezza (m)", "type": "rect", "x_off": 350, "style": "green"},
            {"id": "5C_N8", "lane": 4, "text": "<strong>Silo 2: Tattica Bunker</strong><br/>tactical_coordinates, match_events", "type": "cylinder", "x_off": 250, "style": "rose"},
            {"id": "5C_N9", "lane": 1, "text": "<strong>End: Dossier Tattico</strong><br/>Report interno per Allenatore", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("5C_N1", "5C_N2", "Upload"),
            ("5C_N2", "5C_N4", "Streaming"),
            ("5C_N4", "5C_N5", "CV YOLO"),
            ("5C_N5", "5C_N6", "Omografia"),
            ("5C_N6", "5C_N7", "Voronoi"),
            ("5C_N7", "5C_N8", "Archiviazione"),
            ("5C_N8", "5C_N3", "Tag Eventi"),
            ("5C_N3", "5C_N9", "Dossier Concluso")
        ]
    },
    {
        "id": "6C",
        "title": "SOFTWARE 3 (B2B ENTERPRISE) - FLOW 6C: MEDICAL ROOM EMR & RESEARCH WAREHOUSE (SILO 3)",
        "col": 5, "row": 2,
        "nodes": [
            {"id": "6C_N1", "lane": 1, "text": "<strong>Start: Medical Room EMR</strong><br/>Cartella Clinica Elettronica", "type": "pill", "x_off": -600, "style": "teal"},
            {"id": "6C_N2", "lane": 1, "text": "<strong>Stepper Return-to-Play</strong><br/>6 Fasi cliniche (Riposo -> Gara)", "type": "rect", "x_off": -350, "style": "cyan"},
            {"id": "6C_N3", "lane": 1, "text": "<strong>Firma Digitale Medico</strong><br/>Autorizzazione passaggio fase", "type": "rect", "x_off": -100, "style": "cyan"},
            {"id": "6C_N4", "lane": 1, "text": "<strong>Consenso Ricerca Silo 3</strong><br/>Opt-in ricerca universitaria", "type": "diamond", "x_off": 150, "style": "amber"},
            {"id": "6C_N5", "lane": 2, "text": "<strong>Gateway Medical Ingest</strong><br/>POST /api/v1/club/medical/rtp", "type": "rect", "x_off": -150, "style": "purple"},
            {"id": "6C_N6", "lane": 3, "text": "<strong>RTP Clinical Clearance</strong><br/>Verifica simmetria arti LSI > 90%", "type": "rect", "x_off": -50, "style": "green"},
            {"id": "6C_N7", "lane": 3, "text": "<strong>De-ID Anonymization ETL</strong><br/>K-anonimato >= 5 ed l-diversita", "type": "rect", "x_off": 250, "style": "green"},
            {"id": "6C_N8", "lane": 4, "text": "<strong>Silo 2: Cartella EMR Bunker</strong><br/>medical_records crittografati", "type": "cylinder", "x_off": 100, "style": "rose"},
            {"id": "6C_N9", "lane": 4, "text": "<strong>Silo 3: Research Lake</strong><br/>Coorte anonimizzata scientifica", "type": "cylinder", "x_off": 350, "style": "rose"},
            {"id": "6C_N10", "lane": 1, "text": "<strong>End: Idoneita Gara & Dati Silo 3</strong><br/>Atleta recuperato e ricerca alimentata", "type": "pill", "x_off": 650, "style": "teal"}
        ],
        "connectors": [
            ("6C_N1", "6C_N2", "Cartella"),
            ("6C_N2", "6C_N3", "Firma Step"),
            ("6C_N3", "6C_N5", "Invio Medico"),
            ("6C_N5", "6C_N6", "Audit Clinico"),
            ("6C_N6", "6C_N8", "Salva Silo 2"),
            ("6C_N2", "6C_N4", "Ricerca"),
            ("6C_N4", "6C_N7", "Consenso SI"),
            ("6C_N7", "6C_N9", "Export Silo 3"),
            ("6C_N8", "6C_N10", "Idoneita"),
            ("6C_N9", "6C_N10", "Dati Inviati")
        ]
    }
]
