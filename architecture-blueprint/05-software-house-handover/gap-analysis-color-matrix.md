# MATRICE DI GAP ANALYSIS ARCHITETTURALE (QUADRICROMIA)
## T7 Workout — Sports Analytics Platform

---

## 1. CRITERI DI CLASSIFICAZIONE CROMATICA

Per la consegna dell'architettura alla Software House incaricata dello sviluppo e del collaudo industriale, ogni componente funzionale e logico e stato categorizzato secondo quattro livelli di maturita:
- **VERDE (Pronto / Collaudato):** Codice o dati gia implementati nel repository, con test passati e logica funzionante. Richiede solo integrazione o incapsulamento backend.
- **GIALLO (Parziale / Refactoring):** Componenti parzialmente scritti o logiche storiche presenti nei commit legacy JS che devono essere integrate, completate o rifattorizzate.
- **ARANCIONE (Nuovo TO-BE):** Funzionalita architetturali progettate nelle specifiche ma non ancora scritte a codice. Richiedono implementazione ex novo secondo i contratti API definiti.
- **ROSSO (Vincolo Architetturale Inderogabile):** Requisiti critici di sicurezza, tutela dell'IP, isolamento multi-tenant o rigore metrologico che devono essere rigorosamente rispettati pena la non conformita del software.

---

## 2. TABELLA DI RACCORDO SOFTWARE HOUSE

| Componente Architetturale | Codice Colore | File Sorgente nel Repository `E:` | Azione Richiesta alla Software House |
| :--- | :--- | :--- | :--- |
| **Catalogo 296 Esercizi Base** | **VERDE** | `src/data/exercises/*.ts` | Migrazione tabelle su PostgreSQL (Silo 2). |
| **32 Protocolli Riabilitativi Ginocchio** | **VERDE** | `src/data/exercises/clinical-knee.ts` | Popolamento tabella `clinical_knee_prescriptions` e link CDN video. |
| **Tassonomia 119 Condizioni Cliniche** | **VERDE** | `src/data/conditions/*.ts` | Indicizzazione relazionale per query di triage $O(1)$. |
| **Archivio 322 Fonti PubMed (PMID/DOI)** | **VERDE** | `src/data/sources.ts` | Caricamento in vector store PostgreSQL (`pgvector`). |
| **Physics Engine VBT OLS & Residui IQR** | **VERDE** | `src/physics/physics-engine.ts` | Incapsulamento nel microservizio `Engine 1` (Server Scatola Nera). |
| **PAP Stats Engine (t-Student, Cohen d, MDC 95%)** | **VERDE** | `src/physics/pap-stats-engine.ts` | Incapsulamento nel microservizio `Engine 1` (Server Scatola Nera). |
| **Interfaccia Dark Cockpit & Chart.js Neon** | **VERDE** | `src/App.tsx`, `css/` | Mantenere come base grafica per il Thin Client PWA. |
| **ImpactCalculator Patologie & Cutoff Assiale** | **GIALLO** | `src/logic/risk-analyzer.ts` + `js/impact-calculator.js` (Git) | Integrare la logica di cutoff binario (ESCLUSO, ADATTATO, DISPONIBILE) in `Engine 2`. |
| **Generatore Macrocicli DUP / Blocchi 12-16 Settimane** | **GIALLO** | `src/logic/periodization.ts` | Estendere il wizard da 4 a 16 settimane con riduzione carichi automatica (-40%) nelle settimane di scarico. |
| **Esportatore Excel Sbloccato (`protected: false`)** | **GIALLO** | `src/features/programming/excelExporter.ts` | Spostare la generazione su `Engine 5` con colonne note feedback per il preparatore sul campo. |
| **Parser Universale Encoder VBT Disomogenei** | **GIALLO** | `src/parser/*` + `js/parser/*` (Git) | Ripristinare le euristiche di auto-detection delle colonne per Vitruve, GymAware, Beast. |
| **Global Navigation Shell con Selettore Permanente Atleta/Squadra** | **ARANCIONE** | Specifiche in `architecture-blueprint/02-miro-zones-and-swimlanes/` | Sviluppo della shell globale con state reattivo e selettore fisso in alto a 2 click. |
| **Microciclo Squadra & Z-Score con Fusione GPS/HRV** | **ARANCIONE** | Specifiche in `00-MASTER-EXECUTION-PLAN.md` | Sviluppo microservizio `Engine 3` per incrocio carico esterno/interno e allarmi fatica. |
| **Ponderazione Frazionaria Doppio Ruolo Tattico** | **ARANCIONE** | Specifiche contrattuali API | Implementazione pesatura minuti giocati in `Engine 3`. |
| **Algoritmo Fallback Baseline Nuovi Acquisti (<6 Mesi)** | **ARANCIONE** | Specifiche contrattuali API | Calcolo Z-Score stimato tramite mediana ponderata di ruolo della squadra in `Engine 3`. |
| **Video Analisi Biomeccanica (Pose Estimation) su GPU** | **ARANCIONE** | Specifiche in `zona4-08d-flowchart-video-biomechanics.mmd` | Pipeline Cloud Run su GPU per rilevamento angoli varo/valgo e asimmetrie bilaterali. |
| **Social Network & Marketplace Movely (B2B/B2C)** | **ARANCIONE** | Schemi in `schema-prisma-silo1-social.prisma` | Sviluppo feed, bacheca professionisti P.IVA e integrazione pagamenti Stripe. |
| **Pipeline De-identification ETL & Research Hub** | **ARANCIONE** | Schemi in `schema-prisma-silo3-research.prisma` | Sviluppo batch notturno con rimozione PII, hashing crittografico unidirezionale e Silo 3. |
| **Tutela IP: Thin Client con Zero Formule Matematiche (ADR-01)** | **ROSSO** | Vincolo di sicurezza | Audit del bundle JavaScript di produzione: eliminare ogni formula proprietaria dal client. |
| **Isolamento Multi-Tenant a 3 Silos con Cloud KMS (ADR-02)** | **ROSSO** | Vincolo architetturale | Provisioning PostgreSQL a 3 compartimenti con chiavi crittografiche per-tenant su Cloud KMS. |
| **Rigore Dimensionale Grandezze Fisiche SI (ADR-03)** | **ROSSO** | `src/types/physics.ts` | Validatori di input/output: Forza in N, Potenza in W, Velocita in m/s, Carico in kg. Mai valori adimensionali o NaN. |
