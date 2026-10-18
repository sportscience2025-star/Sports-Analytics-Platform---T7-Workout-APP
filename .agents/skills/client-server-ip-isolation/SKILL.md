---
name: client-server-ip-isolation
description: >-
  Use this skill automatically whenever designing application logic flows, API contracts,
  security rules, Tier 1/2/3 subscription gating, proprietary algorithm protection,
  or multi-tenant database partitions (Social, Club Bunker, Research Warehouse).
---

# Client-Server IP Isolation & Database Silos Skill

Questa skill definisce le regole architettoniche e le specifiche tecniche per proteggere la proprietà intellettuale (IP) dei motori di calcolo proprietari della piattaforma T7 Workout, garantendo la separazione tra Thin Client e Server Centrale e l'isolamento dei 3 Silos del database.

---

## 1. Architettura Thin Client vs Server "Scatola Nera"

```mermaid
flowchart TD
    subgraph Client["Thin Client (App Web / Mobile)"]
        UI["Interfaccia Utente (UI/UX)"]
        Cache["Stato Locale & Cache Offline"]
        Sensors["Input Sensori / Form Dati"]
    end

    subgraph Gateway["API Gateway"]
        Auth["Autenticazione & JWT"]
        Gating["Feature Gating (Tier 1 / 2 / 3)"]
        RateLimit["Rate Limiting & Anti-Scraping"]
    end

    subgraph Server["Server Centrale Scatola Nera"]
        M1["ImpactCalculator (Triage Clinico)"]
        M2["VBT Engine (Regressione OLS & 1RM)"]
        M3["Microcycle Engine (Z-Score & Carichi)"]
        M4["Periodization Engine (DUP / Blocchi)"]
        M5["RAG Engine (Moltiplicatori Fonti)"]
    end

    subgraph DB["Database Tripartito (3 Camere Stagne)"]
        Silo1["Silo 1: Public, Social & Movely DB"]
        Silo2["Silo 2: Encrypted Club Bunkers (Tier 3)"]
        Silo3["Silo 3: De-identified Research Warehouse"]
    end

    Sensors -->|Chiamata API Criptata| Gateway
    Gateway --> Auth --> Gating --> RateLimit
    RateLimit --> Server
    Server --> DB
    Server -->|Output Elaborato (JSON)| Gateway
    Gateway -->|Risultato Renderizzabile| UI
```

### Regole Inviolabili di Tutela IP:
1. **Zero Formule nel Client:** Nel codice scaricato dall'utente (React 18 / app mobile) non devono essere presenti:
   - Formule matematiche di stima o predizione carichi.
   - Algoritmi di regressione VBT (es. coefficienti OLS, MVT, LD).
   - Logiche di scoring o triage clinico patologie (`ImpactCalculator`).
   - Pesi o prompt del motore RAG.
2. **Comunicazione Input/Output Esclusiva:** Il client invia parametri grezzi (es. `{ loadKg: 80, reps: [ { v: 0.72 }, { v: 0.68 } ] }`) e riceve solo il risultato finito da visualizzare (es. `{ estimated1RM: 105, velocityLossPct: 5.5 }`).

---

## 2. Il Motore RAG Scientifico e i Moltiplicatori Gerarchici

Il motore RAG proprietario risiede unicamente sul Server esterno e applica pesature matematiche rigorose in base all'autorevolezza della letteratura:
- **Tier 1 (Moltiplicatore $\times 1.3$):** Linee guida internazionali, metanalisi di alto livello e consensus scientifici ufficiali.
- **Tier 2 (Moltiplicatore $\times 1.1$):** Trial clinici controllati randomizzati (RCT) e studi sperimentali peer-reviewed con solido campione.
- **Tier 3 (Moltiplicatore $\times 1.0$):** Case report, studi osservazionali e opinioni di esperti.

---

## 3. Database Tripartito a 3 Camere Stagne

Ogni schema API e modello dati deve indicare esplicitamente il Silo di destinazione:
1. **Silo 1 – Social, Marketplace & Movely B2B/B2C:**
   - Dati utenti amatoriali, post social, ricerca nutrizionisti, fisioterapisti e coach.
   - Cifratura standard at-rest e in-transit.
2. **Silo 2 – Encrypted Club Bunkers (Tier 3 Pro):**
   - Tenant isolation rigida: ciascun Club professionistico dispone di chiavi crittografiche dedicate.
   - Nessun dato medico, GPS, biometrico o tattico può essere indicizzato o accessibile da altri account.
3. **Silo 3 – De-identified Research Warehouse:**
   - Pipeline ETL con filtro di anonimizzazione irreversibile (rimozione identificativi personali).
   - Riservato a ricercatori e docenti per studi universitari nel Research Hub.

---

## 4. Specifiche e Contratti API
Salvare tutti i contratti OpenAPI / JSON Schema e diagrammi di sequenza in:
`E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP\architecture-blueprint\03-database-silos-and-api-contracts\`
