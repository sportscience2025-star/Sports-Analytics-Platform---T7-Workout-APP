# -*- coding: utf-8 -*-
"""
Script di Rilascio per la Riga 2 (Partita IVA) e la Riga 3 (Team di Alto Livello)
costruite esattamente nello stesso stile visivo, geometrico e cromatico dei 6 flowchart originali della Riga 1.
"""

import urllib.request
import json
import time
import sys

TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U"
BOARD_ID = "uXjVEbo6L2o="
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def api_call(url, payload=None, method="POST", retries=3):
    data_bytes = json.dumps(payload).encode("utf-8") if payload else None
    req = urllib.request.Request(url, data=data_bytes, headers=HEADERS, method=method)
    for attempt in range(retries):
        try:
            res = urllib.request.urlopen(req)
            return json.loads(res.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_time = 2.0 * (attempt + 1)
                time.sleep(wait_time)
                continue
            err_body = e.read().decode("utf-8") if hasattr(e, "read") else str(e)
            print(f"[HTTP Error {e.code}] URL: {url} | Body: {err_body}")
            raise
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(1.0)
    return None

def create_shape(content, shape_type, x, y, width, height, fill_color, border_color, border_width="2.0", text_color="#0f172a"):
    url = f"https://api.miro.com/v2/boards/{BOARD_ID}/shapes"
    payload = {
        "data": {
            "content": f"<p>{content}</p>",
            "shape": shape_type
        },
        "style": {
            "fillColor": fill_color,
            "borderColor": border_color,
            "borderWidth": border_width,
            "textAlign": "center",
            "color": text_color
        },
        "position": {
            "origin": "center",
            "x": x,
            "y": y
        },
        "geometry": {
            "width": width,
            "height": height
        }
    }
    res = api_call(url, payload)
    time.sleep(0.04)
    return res["id"]

def create_connector(start_id, end_id, caption="", stroke_color="#64748b"):
    url = f"https://api.miro.com/v2/boards/{BOARD_ID}/connectors"
    payload = {
        "startItem": {"id": start_id, "snapTo": "auto"},
        "endItem": {"id": end_id, "snapTo": "auto"},
        "style": {
            "strokeColor": stroke_color,
            "strokeWidth": "2.0",
            "strokeStyle": "normal"
        },
        "shape": "curved"
    }
    if caption:
        payload["captions"] = [{"content": caption, "position": "50%"}]
    res = api_call(url, payload)
    time.sleep(0.04)
    return res["id"]

# ==============================================================================
# RIGA 2: SOFTWARE 2 - PARTITA IVA / SPECIALIST EDITION (Delta Y = +1750)
# ==============================================================================

def deploy_row_2_piva():
    print("\n==================================================================")
    print("  AVVIO RILASCIO RIGA 2: PARTITA IVA / PRO SPECIALIST EDITION")
    print("==================================================================")
    DY = 1750  # Offset Y rispetto a Riga 1
    
    # --------------------------------------------------------------------------
    # COLONNA 1: ONBOARDING P.IVA (X = -2200)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 1: Onboarding P.IVA...")
    h1 = create_shape("1. ONBOARDING PROFESSIONALE &amp; SETUP FISCALE P.IVA (T7 PRO)", "round_rectangle", -2200, 350 + DY, 1150, 70, "#0284c7", "#0369a1", "2.0", "#ffffff")
    w1 = create_shape("<strong>T7 Pro Specialist - Portale Professionisti</strong><br/>Setup Studio Chinesiologico, Fisioterapia &amp; Personal Training", "round_rectangle", -2200, 490 + DY, 380, 100, "#f0f9ff", "#0284c7")
    d1 = create_shape("<strong>Hai gi&agrave; una P.IVA registrata?</strong><br/>Bivio: <strong>S&igrave;</strong> (Login Pro) | <strong>No</strong> (Nuovo Studio)", "rhombus", -2200, 705 + DY, 340, 176, "#e0f2fe", "#0284c7")
    
    # Ramo Destro (Login Pro)
    l1 = create_shape("<strong>Percorso Login Pro: Accesso Riservato</strong><br/>- Credenziali Studio / FIDO2 Passkey<br/>- Verifica Sessione Crittografata", "round_rectangle", -1820, 870 + DY, 340, 130, "#f0f9ff", "#0284c7")
    l2 = create_shape("<strong>Verifica Licenza Tier 2</strong><br/>- Controllo abbonamento Pro attivo<br/>- Decrittazione chiavi tenant P.IVA", "round_rectangle", -1820, 1070 + DY, 330, 120, "#f0f9ff", "#0284c7")
    l3 = create_shape("<strong>Accesso Coach Hub Confermato</strong><br/>- Roster clienti sincronizzato<br/>- Dashboard fatturazione pronta", "round_rectangle", -1820, 1270 + DY, 340, 130, "#fffbeb", "#f59e0b")
    
    # Ramo Sinistro (Registrazione Nuovo Studio)
    r1 = create_shape("<strong>Step 1: Dati Fiscali &amp; P.IVA</strong><br/>- Verifica VIES / Agenzia Entrate<br/>- Ragione Sociale &amp; Codice SDI", "round_rectangle", -2550, 870 + DY, 340, 130, "#f0f9ff", "#0284c7")
    r2 = create_shape("<strong>Step 2: Albo &amp; Certificazioni</strong><br/>- Chinesiologia / Fisioterapia / CONI<br/>- Assicurazione professionale", "round_rectangle", -2550, 1070 + DY, 330, 120, "#f0f9ff", "#0284c7")
    r3 = create_shape("<strong>Step 3: Setup Stripe Connect</strong><br/>- Onboarding conto incassi clienti<br/>- Ricezione pagamenti e abbonamenti", "round_rectangle", -2550, 1270 + DY, 340, 130, "#f0f9ff", "#0284c7")
    r4 = create_shape("<strong>Step 4: Branding Studio &amp; Quota Atleti</strong><br/>- Caricamento logo personalizzato<br/>- Inizializzazione slot fino a 30 atleti", "round_rectangle", -2550, 1497 + DY, 350, 164, "#fffbeb", "#f59e0b")
    
    c1 = create_shape("<strong>Ingresso Coach Hub (Sessione Pro Attiva)</strong><br/>- Roster Atleti, Generatore DUP, VBT &amp; Stripe pronti", "round_rectangle", -2200, 1700 + DY, 440, 95, "#faf5ff", "#7c3aed")
    
    # Connettori Colonna 1
    create_connector(h1, w1)
    create_connector(w1, d1)
    create_connector(d1, l1, "Già Registrato", "#0284c7")
    create_connector(d1, r1, "Nuovo Studio", "#0284c7")
    create_connector(l1, l2)
    create_connector(l2, l3)
    create_connector(l3, c1)
    create_connector(r1, r2)
    create_connector(r2, r3)
    create_connector(r3, r4)
    create_connector(r4, c1)

    # --------------------------------------------------------------------------
    # COLONNA 2: COACH HUB MULTI-CLIENTE (X = -800)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 2: Coach Hub Multi-Cliente...")
    h2 = create_shape("2. COACH HUB MULTI-CLIENTE &amp; GESTIONE ADERENZA", "round_rectangle", -800, 350 + DY, 1150, 70, "#7c3aed", "#6d28d9", "2.0", "#ffffff")
    hub2 = create_shape("<strong>Coach Cockpit Hub (Panoramica Atleti)</strong><br/>- Layout Dark con Selettore Rapido Cliente Attivo<br/>- Adherence Score &amp; Notifiche Scadenze Schede", "round_rectangle", -800, 490 + DY, 480, 120, "#faf5ff", "#7c3aed")
    rt2 = create_shape("<strong>Client Router, Event Bus &amp; Billing Gating</strong><br/>- Router con sincronizzazione stato atleta in memoria<br/>- Controllo accessi per profilo cliente e fatturazione Stripe", "round_rectangle", -800, 670 + DY, 480, 90, "#f3e8ff", "#7c3aed")
    
    # Sotto-colonna Sinistra (X = -1020)
    v1 = create_shape("<strong>1. Roster Clienti &amp; Aderenza</strong><br/>- Tabella 30 atleti con stato scheda<br/>- Aderenza settimanale % e RPE alert", "round_rectangle", -1020, 870 + DY, 350, 140, "#faf5ff", "#7c3aed")
    v2 = create_shape("<strong>2. Generatore DUP Wizard</strong><br/>- Stepper 5 fasi con Triage 119 patologie<br/>- Modulazione volume e progressioni", "round_rectangle", -1020, 1090 + DY, 350, 140, "#faf5ff", "#7c3aed")
    v3 = create_shape("<strong>3. Analisi Biomeccanica VBT/PAP</strong><br/>- 4 Grafici Chart.js: Curva F-V, Potenza Pmax,<br/>- Trend salti CMJ e reattività RSI", "round_rectangle", -1020, 1310 + DY, 350, 140, "#faf5ff", "#7c3aed")
    
    # Sotto-colonna Destra (X = -580)
    v4 = create_shape("<strong>4. Libreria 322 Fonti PubMed</strong><br/>- Archivio evidenze scientifiche peer-reviewed<br/>- Riferimenti per protocolli di carico", "round_rectangle", -580, 870 + DY, 350, 140, "#faf5ff", "#7c3aed")
    v5 = create_shape("<strong>5. AI Kinesiologist Specialist</strong><br/>- Assistente IA basato su evidenze scientifiche<br/>- Risoluzione dubbi biomeccanici e recupero", "round_rectangle", -580, 1090 + DY, 350, 140, "#faf5ff", "#7c3aed")
    v6 = create_shape("<strong>6. Branding Studio &amp; Export XLSX</strong><br/>- Header personalizzato per le schede atleti<br/>- Esportazione Excel libera senza password", "round_rectangle", -580, 1310 + DY, 350, 140, "#faf5ff", "#7c3aed")
    
    fb2 = create_shape("<strong>Allarmi Aderenza &amp; Feedback Clinico</strong><br/>- Notifiche rosse per atleti con RPE &gt; 9 anomalo o dolore<br/>- Badge di superamento record e aderenza perfetta", "round_rectangle", -800, 1540 + DY, 480, 120, "#f3e8ff", "#7c3aed")
    
    create_connector(h2, hub2)
    create_connector(hub2, rt2)
    create_connector(rt2, v1)
    create_connector(rt2, v4)
    create_connector(v1, v2)
    create_connector(v4, v5)
    create_connector(v2, v3)
    create_connector(v5, v6)
    create_connector(v3, fb2)
    create_connector(v6, fb2)

    # --------------------------------------------------------------------------
    # COLONNA 3: ARCHITETTURA DI SISTEMA B2B (X = 600)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 3: Architettura B2B...")
    h3 = create_shape("3. ARCHITETTURA DI SISTEMA B2B &amp; DATA REPOSITORY PRO", "round_rectangle", 600, 350 + DY, 1150, 70, "#059669", "#047857", "2.0", "#ffffff")
    tc3 = create_shape("<strong>Thin Client: React 18 + Vite Pro Cockpit</strong><br/>- UI/UX Dark Theme ad alto contrasto<br/>- BLE Web Bluetooth per encoder Vitruve", "round_rectangle", 400, 497 + DY, 350, 113, "#f0fdf4", "#059669")
    sw3 = create_shape("<strong>Cache Offline &amp; Silo 1 Pro Partition</strong><br/>- Service Worker con cache schede client<br/>- Database tenant isolato per professionista", "round_rectangle", 800, 497 + DY, 350, 113, "#f0fdf4", "#059669")
    
    fd3 = create_shape("<strong>Architettura Feature-Driven Specialistica (src/features/)</strong><br/>Separazione netta: Catalog, Programming, Analysis, Sources, RAG, Clinic", "round_rectangle", 600, 660 + DY, 520, 80, "#dcfce7", "#059669")
    
    # Sotto-colonna Sinistra (X = 400)
    eng1 = create_shape("<strong>Server Physics Engine VBT</strong><br/>- Regressione Ibrida (AIC/R2_adj)<br/>- Filtro MAD sui residui di velocit&agrave;<br/>- Stima 1RM con IC 95%", "round_rectangle", 400, 870 + DY, 350, 130, "#f0fdf4", "#059669")
    eng2 = create_shape("<strong>Risk Analyzer &amp; 119 Triage</strong><br/>- Screening controindicazioni articolari<br/>- Esclusione carichi assiali per rachide<br/>- Calcolo punteggio di compatibilit&agrave;", "round_rectangle", 400, 1080 + DY, 350, 130, "#f0fdf4", "#059669")
    eng3 = create_shape("<strong>Catalogo 296 Esercizi Validati</strong><br/>- 6 Distretti anatomici completi<br/>- Tag chinesiologici e biomeccanici", "round_rectangle", 400, 1290 + DY, 350, 120, "#f0fdf4", "#059669")
    
    # Sotto-colonna Destra (X = 800)
    eng4 = create_shape("<strong>PAP Stats Engine (Post-Activation)</strong><br/>- Analisi salti CMJ/SJ e RSI index<br/>- Student t-test e Cohen's d<br/>- Soglia clinica Minimal Detectable Change (MDC)", "round_rectangle", 800, 870 + DY, 350, 130, "#f0fdf4", "#059669")
    eng5 = create_shape("<strong>Periodization Builder DUP</strong><br/>- Modelli DUP, a blocchi e coniugata<br/>- Session Builder con Warmup dinamico<br/>- Generatore Openpyxl .xlsx non protetto", "round_rectangle", 800, 1080 + DY, 350, 130, "#f0fdf4", "#059669")
    eng6 = create_shape("<strong>Matrice 119 Patologie Cliniche</strong><br/>- Classificazione colonna, spalle, ginocchio<br/>- 32 Protocolli clinici riabilitativi cli_01..32", "round_rectangle", 800, 1290 + DY, 350, 120, "#f0fdf4", "#059669")
    
    src3 = create_shape("<strong>Archivio 322 Fonti Scientifiche Peer-Reviewed</strong><br/>- Metadati PubMed completi per ciascun protocollo di carico e triage", "round_rectangle", 600, 1490 + DY, 520, 110, "#dcfce7", "#059669")
    
    create_connector(h3, fd3)
    create_connector(tc3, fd3)
    create_connector(sw3, fd3)
    create_connector(fd3, eng1)
    create_connector(fd3, eng4)
    create_connector(eng1, eng2)
    create_connector(eng4, eng5)
    create_connector(eng2, eng3)
    create_connector(eng5, eng6)
    create_connector(eng3, src3)
    create_connector(eng6, src3)

    # --------------------------------------------------------------------------
    # COLONNA 4: WORKFLOW ALGORITMICI SPECIALISTICI (X = 2150)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 4: Workflow Algoritmici Pro...")
    h4 = create_shape("4. WORKFLOW FUNZIONALI SPECIALISTICI (TRIAGE 119, VBT OLS, PAP)", "round_rectangle", 2150, 350 + DY, 1350, 70, "#d97706", "#b45309", "2.0", "#ffffff")
    
    # Sub-header 1, 2, 3
    sh1 = create_shape("<strong>WORKFLOW 1: GENERATORE SCHEDE DUP &amp; TRIAGE 119</strong>", "round_rectangle", 1700, 480 + DY, 320, 50, "#fef3c7", "#d97706")
    sh2 = create_shape("<strong>WORKFLOW 2: PIPELINE BIOMECCANICA VBT BLE</strong>", "round_rectangle", 2150, 480 + DY, 320, 50, "#fef3c7", "#d97706")
    sh3 = create_shape("<strong>WORKFLOW 3: ANALISI SALTI PAP &amp; REATTIVIT&Agrave;</strong>", "round_rectangle", 2600, 480 + DY, 320, 50, "#fef3c7", "#d97706")
    
    # Sub-colonna 1: Generatore DUP
    w1_1 = create_shape("<strong>1. Selezione Atleta Roster</strong><br/>- Caricamento profilo e storico carichi<br/>- Livello atleta e frequenza (3-5 gg)", "round_rectangle", 1700, 610 + DY, 320, 110, "#fffbeb", "#d97706")
    w1_2 = create_shape("<strong>2. Checklist 119 Patologie</strong><br/>- Incrocio clinico su colonna, spalla, ginocchio<br/>- Gradi di mobilit&agrave; articolare (ROM)", "round_rectangle", 1700, 780 + DY, 320, 110, "#fffbeb", "#d97706")
    w1_3 = create_shape("<strong>3. Triage &amp; Blacklist Esercizi</strong><br/>- Esclusione automatica movimenti vietati<br/>- Sostituzione con varianti protette", "round_rectangle", 1700, 950 + DY, 320, 110, "#fffbeb", "#d97706")
    w1_4 = create_shape("<strong>4. Periodizzazione DUP 12-16 Sett.</strong><br/>- Ondulazione carichi Ipertrofia/Forza/Potenza<br/>- Modulazione RPE e %1RM", "round_rectangle", 1700, 1120 + DY, 320, 110, "#fffbeb", "#d97706")
    w1_5 = create_shape("<strong>5. Export Excel Openpyxl Sbloccato</strong><br/>- Foglio .xlsx formattato multi-tab<br/>- Nessuna password o blocco formule", "round_rectangle", 1700, 1290 + DY, 320, 110, "#fffbeb", "#d97706")
    
    # Sub-colonna 2: VBT
    w2_1 = create_shape("<strong>1. Connessione BLE Vitruve</strong><br/>- Accoppiamento Bluetooth Web API<br/>- Stream telemetria m/s in tempo reale", "round_rectangle", 2150, 610 + DY, 320, 110, "#fffbeb", "#d97706")
    w2_2 = create_shape("<strong>2. 4 Serie Carichi Incrementali</strong><br/>- Rilevazione velocit&agrave; media propulsiva (MPV)<br/>- Massima intenzione di spinta registrata", "round_rectangle", 2150, 780 + DY, 320, 110, "#fffbeb", "#d97706")
    w2_3 = create_shape("<strong>3. Filtro Outlier Robusto MAD</strong><br/>- Scarto ripetizioni sporche (MAD &gt; 3)<br/>- Pulizia metrologica dei residui", "round_rectangle", 2150, 950 + DY, 320, 110, "#fffbeb", "#d97706")
    w2_4 = create_shape("<strong>4. Regressione Ibrida VBT</strong><br/>- Fitting Lineare vs Polinomiale (AIC/R2_adj)<br/>- Calcolo V0, F0, Potenza Massima Pmax", "round_rectangle", 2150, 1120 + DY, 320, 110, "#fffbeb", "#d97706")
    w2_5 = create_shape("<strong>5. Stima 1RM con IC 95%</strong><br/>- Calcolo massimale giornaliero stimato<br/>- Rendering Neon su Chart.js", "round_rectangle", 2150, 1290 + DY, 320, 110, "#fffbeb", "#d97706")
    
    # Sub-colonna 3: PAP
    w3_1 = create_shape("<strong>1. Baseline Jump Test CMJ/SJ</strong><br/>- 3 Salti di riferimento pre-stimolo<br/>- Altezza media (cm) e RSI Flight/Contact", "round_rectangle", 2600, 610 + DY, 320, 110, "#fffbeb", "#d97706")
    w3_2 = create_shape("<strong>2. Stimolo Condizionante Pesante</strong><br/>- Carico 85-90% 1RM o contrast training<br/>- Attivazione unit&agrave; motorie ad alta soglia", "round_rectangle", 2600, 780 + DY, 320, 110, "#fffbeb", "#d97706")
    w3_3 = create_shape("<strong>3. Finestre Rilevazione Post-PAP</strong><br/>- Test a 4', 8' e 12' minuti di recupero<br/>- Valutazione della curva Fatica vs Potenziamento", "round_rectangle", 2600, 950 + DY, 320, 110, "#fffbeb", "#d97706")
    w3_4 = create_shape("<strong>4. Motore Statistico PAP</strong><br/>- Paired Student's t-test e Cohen's d<br/>- Verifica soglia clinica MDC 95%", "round_rectangle", 2600, 1120 + DY, 320, 110, "#fffbeb", "#d97706")
    w3_5 = create_shape("<strong>5. Profilo Esplosivo Atleta</strong><br/>- Identificazione del timing PAP ottimale<br/>- Archiviazione nel diario atleta", "round_rectangle", 2600, 1290 + DY, 320, 110, "#fffbeb", "#d97706")
    
    create_connector(h4, sh1)
    create_connector(h4, sh2)
    create_connector(h4, sh3)
    create_connector(sh1, w1_1); create_connector(w1_1, w1_2); create_connector(w1_2, w1_3); create_connector(w1_3, w1_4); create_connector(w1_4, w1_5)
    create_connector(sh2, w2_1); create_connector(w2_1, w2_2); create_connector(w2_2, w2_3); create_connector(w2_3, w2_4); create_connector(w2_4, w2_5)
    create_connector(sh3, w3_1); create_connector(w3_1, w3_2); create_connector(w3_2, w3_3); create_connector(w3_3, w3_4); create_connector(w3_4, w3_5)

    # --------------------------------------------------------------------------
    # COLONNA 5: TOGETHER PRO BUSINESS (X = 3799)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 5: Together Business Pro...")
    h5 = create_shape("Together Pro - Vetrina Professionale, Lead Generation &amp; Video Review", "round_rectangle", 3799, 350 + DY, 1350, 70, "#fff6b6", "#eab308", "2.0", "#0f172a")
    
    t_sh1 = create_shape("<strong>TOGETHER PRO 1: VETRINA &amp; PACKAGES</strong>", "round_rectangle", 3350, 480 + DY, 320, 50, "#fef08a", "#ca8a04")
    t_sh2 = create_shape("<strong>TOGETHER PRO 2: LEAD ONBOARDING</strong>", "round_rectangle", 3799, 480 + DY, 320, 50, "#fef08a", "#ca8a04")
    t_sh3 = create_shape("<strong>TOGETHER PRO 3: VIDEO REVISIONE TECNICA</strong>", "round_rectangle", 4250, 480 + DY, 320, 50, "#fef08a", "#ca8a04")
    
    t1_nodes = [
        create_shape("<strong>1. Profilo Vetrina Pubblico</strong><br/>- Bio, certificazioni e aree di specializzazione", "round_rectangle", 3350, 610 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>2. Creazione Pacchetti Coaching</strong><br/>- Tariffe mensili, trimestrali e sedute 1-to-1", "round_rectangle", 3350, 780 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>3. Recensioni &amp; Case Studies</strong><br/>- Feedback verificati e risultati raggiunti dagli atleti", "round_rectangle", 3350, 950 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>4. Marketplace Discovery</strong><br/>- Indicizzazione per citt&agrave; e specialit&agrave; clinico-sportiva", "round_rectangle", 3350, 1120 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>5. Condivisione Schede Modello</strong><br/>- Pubblicazione schede d'esempio nella community", "round_rectangle", 3350, 1290 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>6. Statistiche Profilo Professionale</strong><br/>- Visualizzazioni vetrina e conversion rate lead", "round_rectangle", 3350, 1460 + DY, 320, 110, "#fefce8", "#eab308")
    ]
    t2_nodes = [
        create_shape("<strong>1. Ricezione Richiesta Cliente</strong><br/>- Scheda anamnestica compilata dal nuovo atleta", "round_rectangle", 3799, 610 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>2. Valutazione Compatibilit&agrave;</strong><br/>- Audit patologico preliminare e obiettivi sportivi", "round_rectangle", 3799, 780 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>3. Invio Proposta Economica</strong><br/>- Preventivo Stripe con checkout automatico", "round_rectangle", 3799, 950 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>4. Attivazione Contratto Coaching</strong><br/>- Inserimento automatico nel roster attivo del coach", "round_rectangle", 3799, 1120 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>5. Assegnazione Prima Scheda DUP</strong><br/>- Notifica push all'atleta con il nuovo piano di lavoro", "round_rectangle", 3799, 1290 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>6. Monitoraggio Aderenza Mensile</strong><br/>- Rinnovo automatico e reportistica progressi", "round_rectangle", 3799, 1460 + DY, 320, 110, "#fefce8", "#eab308")
    ]
    t3_nodes = [
        create_shape("<strong>1. Ricezione Video Esecuzione</strong><br/>- Clip caricata dall'atleta (Squat, Panca, Stacco)", "round_rectangle", 4250, 610 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>2. Player con Canvas Overlay</strong><br/>- Rallentatore 60fps e controllo frame-by-frame", "round_rectangle", 4250, 780 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>3. Tool Tracciamento Angoli</strong><br/>- Misurazione angoli ginocchio, anca e inclinazione busto", "round_rectangle", 4250, 950 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>4. Note Vocali &amp; Cues Visivi</strong><br/>- Registrazione correzioni audio sincrone al movimento", "round_rectangle", 4250, 1120 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>5. Rendering Feedback Video</strong><br/>- Sovrimpressione grafica delle correzioni tecniche", "round_rectangle", 4250, 1290 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>6. Notifica Immediata Atleta</strong><br/>- Visualizzazione correzione nel Workout Player", "round_rectangle", 4250, 1460 + DY, 320, 110, "#fefce8", "#eab308")
    ]
    
    create_connector(h5, t_sh1); create_connector(h5, t_sh2); create_connector(h5, t_sh3)
    for i in range(len(t1_nodes)-1): create_connector(t1_nodes[i], t1_nodes[i+1])
    for i in range(len(t2_nodes)-1): create_connector(t2_nodes[i], t2_nodes[i+1])
    for i in range(len(t3_nodes)-1): create_connector(t3_nodes[i], t3_nodes[i+1])
    create_connector(t_sh1, t1_nodes[0]); create_connector(t_sh2, t2_nodes[0]); create_connector(t_sh3, t3_nodes[0])

    # --------------------------------------------------------------------------
    # COLONNA 6: PHYSIO REHAB & CLINICA (X = 5448)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 6: Physio Rehab & Clinica...")
    h6 = create_shape("Physio Rehab - Protocolli Riabilitativi, Misurazione ROM &amp; Scala VAS", "round_rectangle", 5448, 350 + DY, 1350, 70, "#c6dcff", "#0284c7", "2.0", "#0f172a")
    
    p_sh1 = create_shape("<strong>PHYSIO 1: ARCHIVIO PROTOCOLLI CLINICI</strong>", "round_rectangle", 5000, 480 + DY, 320, 50, "#bae6fd", "#0284c7")
    p_sh2 = create_shape("<strong>PHYSIO 2: TRACKING ROM GONIOMETRICO</strong>", "round_rectangle", 5448, 480 + DY, 320, 50, "#bae6fd", "#0284c7")
    p_sh3 = create_shape("<strong>PHYSIO 3: MONITORAGGIO DOLORE VAS</strong>", "round_rectangle", 5900, 480 + DY, 320, 50, "#bae6fd", "#0284c7")
    
    p1_nodes = [
        create_shape("<strong>1. Selezione Distretto Lesione</strong><br/>- Ginocchio (LCA, menisco), Spalla, Rachide", "round_rectangle", 5000, 610 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>2. Scelta Protocollo cli_01..32</strong><br/>- Linee guida validate da letteratura scientifica", "round_rectangle", 5000, 780 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>3. Fasi Riabilitazione (1-4)</strong><br/>- Protezione, Recupero ROM, Rinforzo, Return to Sport", "round_rectangle", 5000, 950 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>4. Esercizi Isometrici &amp; Catena Chiusa</strong><br/>- Esercizi a basso stress articolare per fase acuta", "round_rectangle", 5000, 1120 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>5. Criteri Superamento Milestone</strong><br/>- Test di forza simmetrica e assenza di versamento", "round_rectangle", 5000, 1290 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>6. Integrazione con Scheda Coach</strong><br/>- Passaggio dal fisioterapista al preparatore atletico", "round_rectangle", 5000, 1460 + DY, 320, 110, "#f0f9ff", "#38bdf8")
    ]
    p2_nodes = [
        create_shape("<strong>1. Valutazione Articolare Attiva/Passiva</strong><br/>- Misura gradi mobilit&agrave; iniziale dell'articolazione", "round_rectangle", 5448, 610 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>2. Goniometro Digitale / Video</strong><br/>- Rilevazione automatica angolo tramite fotocamera PWA", "round_rectangle", 5448, 780 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>3. Derivata Recupero ROM</strong><br/>- Calcolo guadagno percentuale settimanale in gradi", "round_rectangle", 5448, 950 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>4. Confronto con Arto Sano</strong><br/>- Limb Symmetry Index (LSI) &gt; 90% come target", "round_rectangle", 5448, 1120 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>5. Grafico Evoluzione Flesso-Estensione</strong><br/>- Curve Chart.js di recupero escursione articolare", "round_rectangle", 5448, 1290 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>6. Certificazione Ripristino Articolare</strong><br/>- Validazione formale del terapista per fase di carico", "round_rectangle", 5448, 1460 + DY, 320, 110, "#f0f9ff", "#38bdf8")
    ]
    p3_nodes = [
        create_shape("<strong>1. Input Scala del Dolore VAS (0-10)</strong><br/>- Rilevazione prima, durante e dopo ogni esercizio", "round_rectangle", 5900, 610 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>2. Soglia di Tolleranza Clinica</strong><br/>- Dolore accettabile se VAS &le; 3 e regredisce in 24h", "round_rectangle", 5900, 780 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>3. Allarme Sovraccarico VAS &gt; 4</strong><br/>- Alert rosso per infiammazione acuta", "round_rectangle", 5900, 950 + DY, 320, 110, "#fee2e2", "#dc2626"),
        create_shape("<strong>4. De-escalation Automatica Carico</strong><br/>- Riduzione del 20-30% delle serie o passaggio a regressione", "round_rectangle", 5900, 1120 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>5. Storico Andamento Dolore</strong><br/>- Correlazione tra volume di lavoro e livelli di fastidio", "round_rectangle", 5900, 1290 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>6. Report Clinico Conclusivo</strong><br/>- Esportazione fascicolo riabilitativo per il paziente", "round_rectangle", 5900, 1460 + DY, 320, 110, "#f0f9ff", "#38bdf8")
    ]
    
    create_connector(h6, p_sh1); create_connector(h6, p_sh2); create_connector(h6, p_sh3)
    for i in range(len(p1_nodes)-1): create_connector(p1_nodes[i], p1_nodes[i+1])
    for i in range(len(p2_nodes)-1): create_connector(p2_nodes[i], p2_nodes[i+1])
    for i in range(len(p3_nodes)-1): create_connector(p3_nodes[i], p3_nodes[i+1])
    create_connector(p_sh1, p1_nodes[0]); create_connector(p_sh2, p2_nodes[0]); create_connector(p_sh3, p3_nodes[0])

    print("OK Riga 2 (Partita IVA) completata con successo!")

# ==============================================================================
# RIGA 3: SOFTWARE 3 - TEAM DI ALTO LIVELLO / ELITE CLUB (Delta Y = +3500)
# ==============================================================================

def deploy_row_3_team():
    print("\n==================================================================")
    print("  AVVIO RILASCIO RIGA 3: TEAM DI ALTO LIVELLO / B2B ENTERPRISE")
    print("==================================================================")
    DY = 3500  # Offset Y rispetto a Riga 1
    
    # --------------------------------------------------------------------------
    # COLONNA 1: ACCESSO BUNKER CLUB (X = -2200)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 1: Accesso Bunker Club...")
    h1 = create_shape("1. ACCESSO BLINDATO BUNKER CLUB &amp; KMS SILO 2 (PRO TEAMS)", "round_rectangle", -2200, 350 + DY, 1150, 70, "#0284c7", "#0369a1", "2.0", "#ffffff")
    w1 = create_shape("<strong>T7 Elite Club - Bunker Societario Riservato</strong><br/>Enclave di Sicurezza per Club di Serie A &amp; Leghe Professionistiche", "round_rectangle", -2200, 490 + DY, 380, 100, "#f0f9ff", "#0284c7")
    d1 = create_shape("<strong>Canale di Autenticazione Staff / Atleta?</strong><br/>Bivio: <strong>Staff Club</strong> (mTLS / FIDO2) | <strong>Invito Giocatore</strong>", "rhombus", -2200, 705 + DY, 340, 176, "#e0f2fe", "#0284c7")
    
    # Ramo Destro (Staff Club)
    l1 = create_shape("<strong>Accesso Staff Multidisciplinare</strong><br/>- Mutual TLS (mTLS) su VPN aziendale<br/>- Passkey Hardware FIDO2 Level 3 societaria", "round_rectangle", -1820, 870 + DY, 340, 130, "#f0f9ff", "#0284c7")
    l2 = create_shape("<strong>Verifica Crittografica &amp; KMS Decrypt</strong><br/>- Aggancio chiave Cloud KMS dedicata del Club<br/>- Caricamento partizione crittografata Silo 2", "round_rectangle", -1820, 1070 + DY, 330, 120, "#f0f9ff", "#0284c7")
    l3 = create_shape("<strong>Sessione Bunker Staff Attiva</strong><br/>- Emissione JWT con claim di ruolo R1..R8<br/>- Registro audit log immutabile delle attivit&agrave;", "round_rectangle", -1820, 1270 + DY, 340, 130, "#fffbeb", "#f59e0b")
    
    # Ramo Sinistro (Nuovo Ingresso Giocatore / Acquisizione)
    r1 = create_shape("<strong>Invito Riservato Medico Sociale</strong><br/>- Magic Link o QR biometrico temporaneo<br/>- Generato esclusivamente dal Medico del Club", "round_rectangle", -2550, 870 + DY, 340, 130, "#f0f9ff", "#0284c7")
    r2 = create_shape("<strong>Associazione Cartella EMR Giocatore</strong><br/>- Creazione record sanitario crittografato<br/>- Consenso GDPR Sanitario &amp; segreto professionale", "round_rectangle", -2550, 1070 + DY, 330, 120, "#f0f9ff", "#0284c7")
    r3 = create_shape("<strong>Attestazione Dispositivo Atleta</strong><br/>- Registrazione biometrica Face ID / Touch ID<br/>- Blocco su dispositivi personali non autorizzati", "round_rectangle", -2550, 1270 + DY, 340, 130, "#f0f9ff", "#0284c7")
    r4 = create_shape("<strong>Abilitazione Modulo Scheda &amp; GPS</strong><br/>- Accesso limitato alla sola vista atleta<br/>- Zero visibilit&agrave; sulle cartelle di altri compagni", "round_rectangle", -2550, 1497 + DY, 350, 164, "#fffbeb", "#f59e0b")
    
    c1 = create_shape("<strong>Ingresso Cockpit di Squadra (Sessione Blindata)</strong><br/>- Viste personalizzate per Allenatore, Medico, Preparatore &amp; Analyst", "round_rectangle", -2200, 1700 + DY, 440, 95, "#faf5ff", "#7c3aed")
    
    create_connector(h1, w1); create_connector(w1, d1)
    create_connector(d1, l1, "Staff Club", "#0284c7")
    create_connector(d1, r1, "Giocatore", "#0284c7")
    create_connector(l1, l2); create_connector(l2, l3); create_connector(l3, c1)
    create_connector(r1, r2); create_connector(r2, r3); create_connector(r3, r4); create_connector(r4, c1)

    # --------------------------------------------------------------------------
    # COLONNA 2: COCKPIT MULTI-STAFF INTEGRATO (X = -800)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 2: Cockpit Multi-Staff...")
    h2 = create_shape("2. COCKPIT MULTI-STAFF INTEGRATO CON SEGREGAZIONE DEI RUOLI", "round_rectangle", -800, 350 + DY, 1150, 70, "#7c3aed", "#6d28d9", "2.0", "#ffffff")
    hub2 = create_shape("<strong>Team Squad Cockpit (Hub Multidisciplinare)</strong><br/>- Layout Dark con Selettore Globale Squadra / Ruolo Staff R1..R8<br/>- Segregazione crittografica automatica dei dati clinici", "round_rectangle", -800, 490 + DY, 480, 120, "#faf5ff", "#7c3aed")
    rt2 = create_shape("<strong>RBAC Claims Router &amp; Health Data Redactor</strong><br/>- Filtro automatico: i dati medici privati sono oscurati a coach e analyst<br/>- Notifiche cross-staff istantanee sullo stato degli atleti", "round_rectangle", -800, 670 + DY, 480, 90, "#f3e8ff", "#7c3aed")
    
    # Sotto-colonna Sinistra (X = -1020)
    v1 = create_shape("<strong>1. Vista Tattica Allenatore (R7)</strong><br/>- Stato disponibilit&agrave; atleti (Verde/Giallo/Rosso)<br/>- Schieramento tattico e minutaggi partita", "round_rectangle", -1020, 870 + DY, 350, 140, "#faf5ff", "#7c3aed")
    v2 = create_shape("<strong>2. Vista Preparatore Atletico (R5)</strong><br/>- Microciclo MD-X e carichi GPS campo<br/>- Indice ACWR EWMA e monitoraggio fatica", "round_rectangle", -1020, 1090 + DY, 350, 140, "#faf5ff", "#7c3aed")
    v3 = create_shape("<strong>3. Vista Telemetria &amp; Z-Score</strong><br/>- Radar Z-Score rolling 28 giorni multi-metrica<br/>- Allarmi spike neuromuscolari &gt; 2.0 SD", "round_rectangle", -1020, 1310 + DY, 350, 140, "#faf5ff", "#7c3aed")
    
    # Sotto-colonna Destra (X = -580)
    v4 = create_shape("<strong>4. Vista Match Analyst (R6)</strong><br/>- Clip video tattiche sincronizzate multi-camera<br/>- Coordinate tracking 2D ed eventi partita", "round_rectangle", -580, 870 + DY, 350, 140, "#faf5ff", "#7c3aed")
    v5 = create_shape("<strong>5. Vista Medico Sociale (R4)</strong><br/>- Cartella clinica EMR completa riservata<br/>- Gestione protocollo Return to Play a 6 fasi", "round_rectangle", -580, 1090 + DY, 350, 140, "#faf5ff", "#7c3aed")
    v6 = create_shape("<strong>6. Vista Ricerca Universitaria (Silo 3)</strong><br/>- Pipeline ETL anonimizzata k-anonymity &gt;= 5<br/>- Export per studi accademici biomeccanici", "round_rectangle", -580, 1310 + DY, 350, 140, "#faf5ff", "#7c3aed")
    
    fb2 = create_shape("<strong>Allarmi Squadra &amp; Sincronizzazione Staff</strong><br/>- Il Medico contrassegna l'atleta come NON DISPONIBILE -&gt; Aggiornamento istantaneo per il Coach<br/>- Registro decisionale con tracciabilit&agrave; per lo staff tecnico", "round_rectangle", -800, 1540 + DY, 480, 120, "#f3e8ff", "#7c3aed")
    
    create_connector(h2, hub2); create_connector(hub2, rt2)
    create_connector(rt2, v1); create_connector(rt2, v4)
    create_connector(v1, v2); create_connector(v4, v5)
    create_connector(v2, v3); create_connector(v5, v6)
    create_connector(v3, fb2); create_connector(v6, fb2)

    # --------------------------------------------------------------------------
    # COLONNA 3: ARCHITETTURA BUNKER & RESEARCH LAKE (X = 600)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 3: Architettura Bunker & Research Lake...")
    h3 = create_shape("3. ARCHITETTURA BUNKER ISOLATA (KMS SILO 2) &amp; RESEARCH LAKE (SILO 3)", "round_rectangle", 600, 350 + DY, 1150, 70, "#059669", "#047857", "2.0", "#ffffff")
    tc3 = create_shape("<strong>Thin Client Staff: React 18 + Strict TS</strong><br/>- Cockpit Multi-Ruolo ad alte prestazioni<br/>- Ingestion telemetria GPS 10Hz/18Hz in streaming", "round_rectangle", 400, 497 + DY, 350, 113, "#f0fdf4", "#059669")
    sw3 = create_shape("<strong>Silo 2 Bunker KMS &amp; Silo 3 Data Lake</strong><br/>- Crittografia a riposo AES-256-GCM per Club<br/>- Partizione de-identificata per ricerca scientifica", "round_rectangle", 800, 497 + DY, 350, 113, "#f0fdf4", "#059669")
    
    fd3 = create_shape("<strong>Architettura Enterprise Feature-Driven (src/features/)</strong><br/>Microcycles, Telemetry, TacticalCV, MedicalEMR, ResearchETL, StaffRBAC", "round_rectangle", 600, 660 + DY, 520, 80, "#dcfce7", "#059669")
    
    # Sotto-colonna Sinistra (X = 400)
    eng1 = create_shape("<strong>Team ACWR Engine (EWMA)</strong><br/>- Rapporto carico acuto/cronico ponderato<br/>- Prevenzione picchi lesivi &gt; 1.5 ACWR<br/>- Compensazione riserve e carichi panchina", "round_rectangle", 400, 870 + DY, 350, 130, "#f0fdf4", "#059669")
    eng2 = create_shape("<strong>Tactical Computer Vision Engine</strong><br/>- Modelli YOLO e Pose Estimation per campo<br/>- Trasformazione omografica prospettica 2D<br/>- Calcolo diagrammi di Voronoi e spazi dominati", "round_rectangle", 400, 1080 + DY, 350, 130, "#f0fdf4", "#059669")
    eng3 = create_shape("<strong>Silo 2: Bunker Database Club</strong><br/>- Dati atleti, GPS grezzo e schede riservate<br/>- Chiavi crittografiche KMS non condivise", "round_rectangle", 400, 1290 + DY, 350, 120, "#f0fdf4", "#059669")
    
    # Sotto-colonna Destra (X = 800)
    eng4 = create_shape("<strong>Adaptive Z-Score Rolling Engine</strong><br/>- Normalizzazione su 28 giorni (X - mu) / sigma<br/>- Fusione dati GPS campo con HRV cardiaco<br/>- Fallback cold-start per nuovi acquisti", "round_rectangle", 800, 870 + DY, 350, 130, "#f0fdf4", "#059669")
    eng5 = create_shape("<strong>Return-to-Play Clinical Validator</strong><br/>- Verifica formale a 6 stadi clinico-funzionali<br/>- Firma digitale crittografica del Medico Sociale<br/>- Sblocco graduale carichi dal lavoro differenziato", "round_rectangle", 800, 1080 + DY, 350, 130, "#f0fdf4", "#059669")
    eng6 = create_shape("<strong>Silo 3: Research Data Warehouse</strong><br/>- Coorte anonimizzata irreversibile (k &gt;= 5)<br/>- Accesso API accademico per atenei partner", "round_rectangle", 800, 1290 + DY, 350, 120, "#f0fdf4", "#059669")
    
    src3 = create_shape("<strong>Audit di Sicurezza &amp; Conformit&agrave; HIPAA / GDPR Sanitario</strong><br/>- Tracciabilit&agrave; immutabile accessi e tutela del segreto sportivo e industriale del Club", "round_rectangle", 600, 1490 + DY, 520, 110, "#dcfce7", "#059669")
    
    create_connector(h3, fd3); create_connector(tc3, fd3); create_connector(sw3, fd3)
    create_connector(fd3, eng1); create_connector(fd3, eng4)
    create_connector(eng1, eng2); create_connector(eng4, eng5)
    create_connector(eng2, eng3); create_connector(eng5, eng6)
    create_connector(eng3, src3); create_connector(eng6, src3)

    # --------------------------------------------------------------------------
    # COLONNA 4: WORKFLOW ALGORITMICI SQUADRA (X = 2150)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 4: Workflow Algoritmici Squadra...")
    h4 = create_shape("4. WORKFLOW TATTICI &amp; TELEMETRICI SQUADRA (MD-X, GPS, VIDEO CV)", "round_rectangle", 2150, 350 + DY, 1350, 70, "#d97706", "#b45309", "2.0", "#ffffff")
    
    sh1 = create_shape("<strong>WORKFLOW 1: MICROCICLO GARA MD-X &amp; PANCHINA</strong>", "round_rectangle", 1700, 480 + DY, 320, 50, "#fef3c7", "#d97706")
    sh2 = create_shape("<strong>WORKFLOW 2: TELEMETRIA GPS &amp; Z-SCORE 28GG</strong>", "round_rectangle", 2150, 480 + DY, 320, 50, "#fef3c7", "#d97706")
    sh3 = create_shape("<strong>WORKFLOW 3: VIDEO COMPUTER VISION SUL CAMPO</strong>", "round_rectangle", 2600, 480 + DY, 320, 50, "#fef3c7", "#d97706")
    
    # Sub-colonna 1: Microciclo Gara
    w1_1 = create_shape("<strong>1. Definizione Timeline MD-X</strong><br/>- MD-4 Forza, MD-3 Tattica, MD-2 Velocit&agrave;<br/>- MD-1 Rifinitura, MD Gara, MD+1 Scarico", "round_rectangle", 1700, 610 + DY, 320, 110, "#fffbeb", "#d97706")
    w1_2 = create_shape("<strong>2. Bilanciamento Doppio Ruolo</strong><br/>- Es. Terzino / Esterno Alto: calcolo del volume<br/>- Modulazione delle richieste metaboliche", "round_rectangle", 1700, 780 + DY, 320, 110, "#fffbeb", "#d97706")
    w1_3 = create_shape("<strong>3. Compensazione Riserve Panchina</strong><br/>- Ricalcolo automatico del lavoro post-gara<br/>- Sessione compensativa MD+1 per chi non ha giocato", "round_rectangle", 1700, 950 + DY, 320, 110, "#fffbeb", "#d97706")
    w1_4 = create_shape("<strong>4. Monitoraggio Indice ACWR EWMA</strong><br/>- Mantenimento finestra ottimale 0.8 - 1.3<br/>- Allerta immediata se picco lesivo &gt; 1.5", "round_rectangle", 1700, 1120 + DY, 320, 110, "#fffbeb", "#d97706")
    w1_5 = create_shape("<strong>5. Validazione Doppia Firma</strong><br/>- Approvazione congiunta Preparatore + Allenatore<br/>- Distribuzione automatica nei tablet dello staff", "round_rectangle", 1700, 1290 + DY, 320, 110, "#fffbeb", "#d97706")
    
    # Sub-colonna 2: GPS & Z-Score
    w2_1 = create_shape("<strong>1. Ingestion Batch GPS da Campo</strong><br/>- Ricezione dati 10Hz/18Hz al fischio finale<br/>- Filtraggio perdite segnale satellitare (DOP &lt; 2)", "round_rectangle", 2150, 610 + DY, 320, 110, "#fffbeb", "#d97706")
    w2_2 = create_shape("<strong>2. Estrazione Metriche Chiave</strong><br/>- Distanza Totale (TD), High-Speed Running (&gt;19.8km/h)<br/>- Sprint Distance (&gt;25.2km/h) e Accelerazioni &gt; 3m/s2", "round_rectangle", 2150, 780 + DY, 320, 110, "#fffbeb", "#d97706")
    w2_3 = create_shape("<strong>3. Normalizzazione Z-Score Rolling</strong><br/>- Calcolo deviazione standard su finestra mobile 28gg<br/>- Isolamento delle variazioni reali dal rumore", "round_rectangle", 2150, 950 + DY, 320, 110, "#fffbeb", "#d97706")
    w2_4 = create_shape("<strong>4. Fusione HRV &amp; Wellness Mattutino</strong><br/>- Integrazione rMSSD cardiaco e fatica soggettiva<br/>- Profilo neuromuscolare composito", "round_rectangle", 2150, 1120 + DY, 320, 110, "#fffbeb", "#d97706")
    w2_5 = create_shape("<strong>5. Radar Fatica &amp; Alert Staff</strong><br/>- Segnalazione atleti a rischio sovraccarico (Z &gt; +2.0)<br/>- Suggerimento rimodulazione carichi seduta successiva", "round_rectangle", 2150, 1290 + DY, 320, 110, "#fffbeb", "#d97706")
    
    # Sub-colonna 3: Computer Vision
    w3_1 = create_shape("<strong>1. Acquisizione Video Multi-Camera</strong><br/>- Telecamere tattiche campo 4K sincronizzate<br/>- Rete privata isolata del Club (zero internet)", "round_rectangle", 2600, 610 + DY, 320, 110, "#fffbeb", "#d97706")
    w3_2 = create_shape("<strong>2. YOLO &amp; Pose Detection</strong><br/>- Rilevamento automatico coordinate giocatori e palla<br/>- Tracking continuo con re-identificazione numerica", "round_rectangle", 2600, 780 + DY, 320, 110, "#fffbeb", "#d97706")
    w3_3 = create_shape("<strong>3. Proiezione Omografica 2D</strong><br/>- Trasformazione prospettiva telecamera a piano campo<br/>- Mappatura metrica esatta delle distanze tra reparti", "round_rectangle", 2600, 950 + DY, 320, 110, "#fffbeb", "#d97706")
    w3_4 = create_shape("<strong>4. Spazi Dominati &amp; Voronoi</strong><br/>- Calcolo superficie utile controllata da ciascun team<br/>- Compattezza squadra (m) e linee di pressione avversarie", "round_rectangle", 2600, 1120 + DY, 320, 110, "#fffbeb", "#d97706")
    w3_5 = create_shape("<strong>5. Generazione Dossier Tattico</strong><br/>- Report sintetico con clip sincronizzate e dati posizionali<br/>- Archiviazione blindata in Silo 2 per il Match Analyst", "round_rectangle", 2600, 1290 + DY, 320, 110, "#fffbeb", "#d97706")
    
    create_connector(h4, sh1); create_connector(h4, sh2); create_connector(h4, sh3)
    create_connector(sh1, w1_1); create_connector(w1_1, w1_2); create_connector(w1_2, w1_3); create_connector(w1_3, w1_4); create_connector(w1_4, w1_5)
    create_connector(sh2, w2_1); create_connector(w2_1, w2_2); create_connector(w2_2, w2_3); create_connector(w2_3, w2_4); create_connector(w2_4, w2_5)
    create_connector(sh3, w3_1); create_connector(w3_1, w3_2); create_connector(w3_2, w3_3); create_connector(w3_3, w3_4); create_connector(w3_4, w3_5)

    # --------------------------------------------------------------------------
    # COLONNA 5: VIDEO ANALISI TATTICA CONFIDENZIALE (X = 3799)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 5: Tactical Vision Pro...")
    h5 = create_shape("Tactical Vision - Computer Vision Campo, Densit&agrave; &amp; Voronoi (Zero Social)", "round_rectangle", 3799, 350 + DY, 1350, 70, "#fff6b6", "#eab308", "2.0", "#0f172a")
    
    t_sh1 = create_shape("<strong>TACTICAL 1: COMPUTER VISION &amp; POSE</strong>", "round_rectangle", 3350, 480 + DY, 320, 50, "#fef08a", "#ca8a04")
    t_sh2 = create_shape("<strong>TACTICAL 2: OMOGRAFIA &amp; METRICHE</strong>", "round_rectangle", 3799, 480 + DY, 320, 50, "#fef08a", "#ca8a04")
    t_sh3 = create_shape("<strong>TACTICAL 3: DOSSIER TATTICO SILO 2</strong>", "round_rectangle", 4250, 480 + DY, 320, 50, "#fef08a", "#ca8a04")
    
    t1_nodes = [
        create_shape("<strong>1. Rilevamento Coordinate (X,Y)</strong><br/>- Tracciamento automatico 22 giocatori sul campo", "round_rectangle", 3350, 610 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>2. Analisi Posturale Corsa &amp; Duelli</strong><br/>- Valutazione simmetria falcata e angoli d'appoggio", "round_rectangle", 3350, 780 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>3. Riconoscimento Modulo di Gioco</strong><br/>- Identificazione automatica schieramento (4-3-3, 3-5-2)", "round_rectangle", 3350, 950 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>4. Baricentro Medio della Squadra</strong><br/>- Posizione media longitudinale e trasversale", "round_rectangle", 3350, 1120 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>5. Calcolo Densita Posizionale</strong><br/>- Heatmap di presenza in fase offensiva e difensiva", "round_rectangle", 3350, 1290 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>6. Filtro Privacy No-Social</strong><br/>- Canali di esportazione verso social rigorosamente bloccati", "round_rectangle", 3350, 1460 + DY, 320, 110, "#fee2e2", "#dc2626")
    ]
    t2_nodes = [
        create_shape("<strong>1. Proiezione Ortogonale Campo</strong><br/>- Correzione distorsione lenti grandangolari", "round_rectangle", 3799, 610 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>2. Distanza Inter-Reparto</strong><br/>- Lunghezza e ampiezza squadra nelle varie fasi di gioco", "round_rectangle", 3799, 780 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>3. Diagrammi di Controllo Spazi</strong><br/>- Aree di influenza Voronoi attorno alla palla", "round_rectangle", 3799, 950 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>4. Trigger Pressione Squadra</strong><br/>- Rilevamento automatico inizio pressing alto", "round_rectangle", 3799, 1120 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>5. Corridoi di Passaggio Liberi</strong><br/>- Identificazione linee di passaggio interrotte o disponibili", "round_rectangle", 3799, 1290 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>6. Sincronizzazione con Dati GPS</strong><br/>- Correlazione tra velocit&agrave; video e telemetria sensore", "round_rectangle", 3799, 1460 + DY, 320, 110, "#fefce8", "#eab308")
    ]
    t3_nodes = [
        create_shape("<strong>1. Tagging Eventi Partita</strong><br/>- Marcatura transizioni positive/negative e duelli aerei", "round_rectangle", 4250, 610 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>2. Playlist Clip per Allenatore</strong><br/>- Selezione istantanea dei momenti chiave da rivedere", "round_rectangle", 4250, 780 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>3. Sovrimpressione Grafica Tattica</strong><br/>- Disegno frecce di movimento e cerchi di marcatura", "round_rectangle", 4250, 950 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>4. Watermark Confidenziale Dinamico</strong><br/>- Marcatura con ID utente per prevenire leak di dati", "round_rectangle", 4250, 1120 + DY, 320, 110, "#fee2e2", "#dc2626"),
        create_shape("<strong>5. Archiviazione Silo 2 Bunker</strong><br/>- Salvataggio protetto da crittografia Cloud KMS", "round_rectangle", 4250, 1290 + DY, 320, 110, "#fefce8", "#eab308"),
        create_shape("<strong>6. Consegna Relazione a Head Coach</strong><br/>- Presentazione pre-partita e analisi post-gara", "round_rectangle", 4250, 1460 + DY, 320, 110, "#fefce8", "#eab308")
    ]
    
    create_connector(h5, t_sh1); create_connector(h5, t_sh2); create_connector(h5, t_sh3)
    for i in range(len(t1_nodes)-1): create_connector(t1_nodes[i], t1_nodes[i+1])
    for i in range(len(t2_nodes)-1): create_connector(t2_nodes[i], t2_nodes[i+1])
    for i in range(len(t3_nodes)-1): create_connector(t3_nodes[i], t3_nodes[i+1])
    create_connector(t_sh1, t1_nodes[0]); create_connector(t_sh2, t2_nodes[0]); create_connector(t_sh3, t3_nodes[0])

    # --------------------------------------------------------------------------
    # COLONNA 6: MEDICAL ROOM EMR & RESEARCH SILO 3 (X = 5448)
    # --------------------------------------------------------------------------
    print("-> Deploy Colonna 6: Medical Room EMR & Research...")
    h6 = create_shape("Medical Room - Cartella Clinica EMR, Return to Play &amp; Research Silo 3", "round_rectangle", 5448, 350 + DY, 1350, 70, "#c6dcff", "#0284c7", "2.0", "#0f172a")
    
    m_sh1 = create_shape("<strong>MEDICAL 1: CARTELLA CLINICA EMR</strong>", "round_rectangle", 5000, 480 + DY, 320, 50, "#bae6fd", "#0284c7")
    m_sh2 = create_shape("<strong>MEDICAL 2: RETURN TO PLAY 6 FASI</strong>", "round_rectangle", 5448, 480 + DY, 320, 50, "#bae6fd", "#0284c7")
    m_sh3 = create_shape("<strong>MEDICAL 3: DE-ID RESEARCH SILO 3</strong>", "round_rectangle", 5900, 480 + DY, 320, 50, "#bae6fd", "#0284c7")
    
    m1_nodes = [
        create_shape("<strong>1. Cartella Sanitaria Atleta Silo 2</strong><br/>- Storico infortuni, risonanze magnetiche, ecografie", "round_rectangle", 5000, 610 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>2. Crittografia Cloud KMS Isolato</strong><br/>- Accesso esclusivo per il Medico Sociale (Ruolo R4)", "round_rectangle", 5000, 780 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>3. Registro Visite &amp; Terapie Giornaliere</strong><br/>- Tracciamento trattamenti fisioterapici e farmacologici", "round_rectangle", 5000, 950 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>4. Gestione Idoneit&agrave; Agonistica</strong><br/>- Monitoraggio scadenze visite medico-sportive obbligatorie", "round_rectangle", 5000, 1120 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>5. Oscuramento Dati Sensibili</strong><br/>- Staff tecnico e dirigenza vedono solo Disponibile/Non Disponibile", "round_rectangle", 5000, 1290 + DY, 320, 110, "#fee2e2", "#dc2626"),
        create_shape("<strong>6. Audit Trail Immutabile Sanitario</strong><br/>- Log conforme HIPAA e GDPR Art. 9 sui dati di salute", "round_rectangle", 5000, 1460 + DY, 320, 110, "#f0f9ff", "#38bdf8")
    ]
    m2_nodes = [
        create_shape("<strong>1. Fase 1: Riposo &amp; Controllo Acuto</strong><br/>- Riduzione del dolore e contenimento dell'edema", "round_rectangle", 5448, 610 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>2. Fase 2: Terapie &amp; Mobilizzazione</strong><br/>- Fisioterapia strumentale e recupero mobilit&agrave; passiva", "round_rectangle", 5448, 780 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>3. Fase 3: Lavoro Differenziato Campo</strong><br/>- Corsa rettilinea e condizionamento metabolico individuale", "round_rectangle", 5448, 950 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>4. Fase 4: Con Gruppo Senza Contatto</strong><br/>- Esercitazioni tecniche con pettorina jolly protetta", "round_rectangle", 5448, 1120 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>5. Fase 5: In Gruppo con Contatto Pieno</strong><br/>- Partecipazione a partitelle e contrasti ad alta intensit&agrave;", "round_rectangle", 5448, 1290 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>6. Fase 6: Idoneit&agrave; Convocazione Gara</strong><br/>- Firma digitale del Medico Sociale per reintegro ufficiale", "round_rectangle", 5448, 1460 + DY, 320, 110, "#f0f9ff", "#38bdf8")
    ]
    m3_nodes = [
        create_shape("<strong>1. Consenso Informato Ricerca</strong><br/>- Opt-in volontario atleta e societ&agrave; per fini scientifici", "round_rectangle", 5900, 610 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>2. Pipeline ETL di Anonimizzazione</strong><br/>- Rimozione totale di nomi, date di nascita e dati PII", "round_rectangle", 5900, 780 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>3. Algoritmo K-Anonimato (k &ge; 5)</strong><br/>- Impossibilit&agrave; di re-identificare l'atleta nella coorte", "round_rectangle", 5900, 950 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>4. Ingestion Silo 3 Research Lake</strong><br/>- Aggregazione telemetria GPS e lesioni per studi accademici", "round_rectangle", 5900, 1120 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>5. Modelli Predittivi di Infortunio</strong><br/>- Machine learning universitario per validazione indici di rischio", "round_rectangle", 5900, 1290 + DY, 320, 110, "#f0f9ff", "#38bdf8"),
        create_shape("<strong>6. Ritorno Valore Scientifico al Club</strong><br/>- Benchmark anonimo con la media delle squadre del campionato", "round_rectangle", 5900, 1460 + DY, 320, 110, "#f0f9ff", "#38bdf8")
    ]
    
    create_connector(h6, m_sh1); create_connector(h6, m_sh2); create_connector(h6, m_sh3)
    for i in range(len(m1_nodes)-1): create_connector(m1_nodes[i], m1_nodes[i+1])
    for i in range(len(m2_nodes)-1): create_connector(m2_nodes[i], m2_nodes[i+1])
    for i in range(len(m3_nodes)-1): create_connector(m3_nodes[i], m3_nodes[i+1])
    create_connector(m_sh1, m1_nodes[0]); create_connector(m_sh2, m2_nodes[0]); create_connector(m_sh3, m3_nodes[0])

    print("OK Riga 3 (Team di Alto Livello) completata con successo!")

def main():
    arg = sys.argv[1] if len(sys.argv) > 1 else "--all"
    if arg in ["--row2", "--all"]:
        deploy_row_2_piva()
    if arg in ["--row3", "--all"]:
        deploy_row_3_team()

if __name__ == "__main__":
    main()
