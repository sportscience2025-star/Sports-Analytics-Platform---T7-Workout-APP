# CAPITOLATO TECNICO DI APPALTO & SPECIFICHE DI SVILUPPO SOFTWARE
## Piattaforma: T7 Workout — Sports Analytics Platform
### Documento di Consegna Ufficiale per la Software House Incaricata

---

## 1. PREMESSA ED OBIETTIVI DELL'APPALTO

Il presente capitolato definisce i requisiti funzionali, architetturali, prestazionali e di sicurezza per l'ingegnerizzazione industriale della piattaforma **T7 Workout (Sports Analytics Platform)**.
La piattaforma si rivolge al mercato dello sport ad alte prestazioni, della riabilitazione clinico-sportiva e del coaching evidence-based. L'infrastruttura e concepita per scalare su 3 Tier commerciali:
- **Tier 1 (Base / Amatoriale - B2C):** Atleti amatoriali, appassionati di fitness, accesso al social Movely e diario base.
- **Tier 2 (Pro Coach & Clinic - B2B Freelance):** Preparatori atletici, personal trainer, fisioterapisti indipendenti, centri riabilitativi (fino a 50 atleti gestiti).
- **Tier 3 (Elite Club & Research - B2B Enterprise):** Societa sportive professionistiche, federazioni, leghe, universita e centri di ricerca accademici.

---

## 2. VINCOLI ARCHITETTURALI INDEROGABILI (ADR MANDATORY)

Lo sviluppo deve conformarsi rigorosamente alle seguenti Architectural Decision Record:

### 2.1 ADR-01: Tutela Assoluta dell'IP ("Thin Client + Server Scatola Nera")
- **Divieto di Formule nel Client:** E fatto divieto tassativo di inserire nel codice frontend (bundle JavaScript/TypeScript scaricato nel browser o distribuito tramite app store) formule matematiche proprietarie, coefficienti di regressione VBT, logiche di cutoff patologico, euristiche di periodizzazione o prompt del motore RAG.
- **Ruolo del Thin Client:** Il client React 18 / mobile funge esclusivamente da presentatore visuale (Dark Cockpit, grafici Chart.js neon, input form, selettore di contesto).
- **Elaborazione Algoritmica:** Qualsiasi elaborazione scientifica avviene all'interno del perimetro sicuro del backend (microservizi Cloud Run). Il client invia parametri grezzi (es. carico in kg e tempi di spostamento) e riceve il payload JSON finito da plottare.

### 2.2 ADR-02: Isolamento Multi-Tenant a 3 Silos Stagni
Il database centrale PostgreSQL deve essere rigorosamente partizionato in 3 compartimenti isolati:
1. **Silo 1 (Public, Social & Movely DB):** Gestione di account utenti Tier 1, bacheca sociale, messaggistica, marketplace professionisti P.IVA e pagamenti Stripe.
2. **Silo 2 (Encrypted Club Bunkers - Tier 3):** Ogni societa sportiva cliente possiede un bunker di dati isolato tramite Row-Level Security o schema per-tenant dedicato. Tutti i dati a riposo (cartelle cliniche, test VBT, tracciamenti GPS, video tecnici) devono essere crittografati con chiavi distinte gestite tramite Google Cloud KMS. Nessun dato clinico o di performance esce dal bunker del club.
3. **Silo 3 (De-identified Research Warehouse):** Magazzino analitico per la ricerca scientifica. Alimentato da una pipeline ETL notturna che estrae dati da Silo 2, rimuove ogni informazione identificativa (PII), genera un synthetic hash crittografico non reversibile e aggrega le serie numeriche per disciplina, categoria e ruolo tattico.

### 2.3 ADR-03: Rigore Dimensionale delle Grandezze Fisiche (Sistema Internazionale)
- **Unita Obbligatorie:** Forza unicamente in Newton ($F$ in $\text{N}$), Potenza in Watt ($P$ in $\text{W}$), Velocita in metri al secondo ($v$ in $\text{m/s}$), Carico in chilogrammi ($L$ in $\text{kg}$), Angoli in gradi sessagesimali ($^{\circ}$).
- **Prevenzione Anomalie Runtime:** Implementare validatori runtime e sanitizer su tutte le pipeline dati: e vietata la presenza di valori `NaN`, `Infinity` o `undefined` sia nelle API response sia nell'interfaccia utente.

---

## 3. AMBITO APPLICATIVO E SPECIFICA DEI 10 MODULI

La piattaforma e suddivisa in 10 moduli interconnessi:

1. **M01 - Profilo, Anamnesi & Readiness:** Raccolta dati biometrici, questionari RPE/sonno, acquisizione HRV RMSSD e tempi di reazione PVT tramite tocco. Calcolo dello scostamento dalla baseline.
2. **M02 - Catalogo Esercizi & Pre-Attivazione:** Gestione del catalogo di 296 esercizi codificati e dei 32 protocolli specifici per il ginocchio (`cli_01`..`cli_32`). Associazione automatica di link video CDN.
3. **M03 - Programmazione & Macrocicli IA:** Generazione guidata di macrocicli di 12-16 settimane basati su DUP, Blocchi o progressione lineare. Calcolo automatico delle settimane di scarico con riduzione del volume del 40-50%.
4. **M04 - Clinica, Infortuni & Return-to-Play:** Screening su 119 patologie categorizzate. Motore `ImpactCalculator` per applicare cutoff binari: `EXCLUDED` (vietato), `ADAPTED` (con limitazioni di ROM), `AVAILABLE` (consentito).
5. **M05 - Data Analisi & VBT:** Acquisizione dati da encoder lineari via Bluetooth o file Excel/CSV. Regressione lineare OLS e quadratica polinomiale con filtro residui IQR. Calcolo $F_0$, $v_0$, $P_{\max}$, stima $1\text{RM}$ al punto MVT (0.30 m/s) con intervallo di confidenza al 95%. PAP test con t-Student e soglia MDC 95%.
6. **M06 - Microciclo Squadra & Z-Score:** Calcolo dello Z-Score composito di squadra incrociando carico esterno (GPS, sprint ad alta intensita HSR) e interno (HRV). Gestione della ponderazione frazionaria per atleti con doppio ruolo tattico. Algoritmo di fallback su mediana ponderata di ruolo per nuovi acquisti privi di baseline storica (<6 mesi).
7. **M07 - Video Analisi Biomeccanica & Match:** Upload video MP4/MOV a 60/120 fps. Modello di pose estimation su GPU Cloud Run per il calcolo di angoli articolari (valgismo/varismo dinamico del ginocchio) e indice di asimmetria bilaterale.
8. **M08 - Motore RAG & Libreria Scientifica:** Ingestione della letteratura scientifica (322 paper PubMed con PMID) e delle dispense proprietarie del coach. Pesatura gerarchica delle evidenze: Meta-analisi x1.3, RCT x1.1, studi osservazionali x1.0.
9. **M09 - Social Network & Marketplace Movely:** B2B/B2C marketplace per professionisti con tariffe orarie e pacchetti di consulenza. Iniezione automatica della scheda acquistata nel diario del cliente.
10. **M10 - Research Hub Accademico:** Interfaccia di esportazione per universita e ricercatori accreditati per l'estrazione di serie temporali aggregate da Silo 3 conformi al GDPR.

---

## 4. REQUISITI FRONTEND (THIN CLIENT REACT 18)

- **Global Navigation Shell:** Implementare un layout ispirato al design industriale Apple con:
  - Fixed Top Header contenente il **Selettore Permanente di Contesto Atleta/Squadra** (switch immediato tra visione aggregata di squadra e scheda singolo atleta).
  - Regola aurea dei 2 click: nessuna funzione core puo distare piu di 2 interazioni touch dalla dashboard.
  - Dark Cockpit Theme con superfici glassmorphism (`backdrop-filter: blur(20px)`) e grafici neon ad alto contrasto.
- **Gestione dei 4 Stati UI Obbligatoria su Ogni Vista:**
  1. *Empty State:* Layout guidato con checklist interattiva, zero pagine bianche o tabelle mute.
  2. *Loading State:* Skeleton screens pulsanti hardware-accelerated con barra percentuale.
  3. *Populated State:* Vista completa e reattiva con dati a regime.
  4. *Error / Fallback State:* Banner esplicativi con tasto 'Riprova' ed exponential backoff. Modalita offline Service Worker attiva.
- **Export dei Dati:** Generazione di file Excel (.xlsx) totalmente sbloccati (`protected: false`) con colonne dedicate per le note e il feedback sul campo da parte del preparatore atletico, unitamente a PDF con QR code video.

---

## 5. REQUISITI BACKEND E INFRASTRUTTURA CLOUD

- **Architettura a Microservizi:** Distribuzione su Google Cloud Run (container stateless scalabili da 0 a N):
  - `Engine 1:` Biomechanics & VBT OLS Service
  - `Engine 2:` Periodization & ImpactCalculator Service
  - `Engine 3:` Team Microcycle, GPS & Z-Score Service
  - `Engine 4:` RAG & Evidence Hierarchy Service
  - `Engine 5:` Document I/O & Unlocked Excel Exporter Service
- **Sicurezza di Rete:**
  - Cloud Armor WAF con regole anti-scraping e rate limiting.
  - Envoy API Gateway con validazione token JWT/OAuth2 e Tier Gatekeeper.
  - Comunicazioni interne crittografate tramite mTLS.

---

## 6. CRITERI DI ACCETTAZIONE, TESTING E COLLAUDO

La Software House e tenuta a consegnare:
1. **Copertura Test:** Copertura unitaria e d'integrazione minima dell'85% sul backend.
2. **Validazione Sintattica:** Ogni modifica a file JavaScript o script di build deve passare con esito 100% positivo lo script di test di progetto: `py test_check.py`.
3. **Conformita Metrologica:** I calcoli VBT, stime $1\text{RM}$, intervalli di confidenza 95% e Z-Score devono corrispondere ai test case matematici documentati in `architecture-blueprint/03-database-silos-and-api-contracts/api-contracts-spec.json`.
4. **Isolamento Silo 2:** Superamento del penetration test che certifichi l'impossibilita assoluta di cross-tenant data leak tra club sportivi concorrenti.
