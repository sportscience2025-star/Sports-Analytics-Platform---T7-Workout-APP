---
name: sports-science-biometrics-guard
description: >-
  Use this skill automatically whenever implementing or auditing exercise science formulas,
  biometric metrics, chart scaling, physical dimensions (Force in N, Power in W, Load in kg),
  tactical dual-role management, baseline fallbacks for new athletes, or unencrypted Excel (.xlsx) exports.
---

# Sports Science & Biometrics Guard Skill

Questa skill agisce da guardiano scientifico e matematico per la piattaforma T7 Workout, assicurando rigore biomeccanico, coerenza dimensionale delle grandezze fisiche, gestione robusta dei profili atleti (inclusi casi limite come nuovi acquisti e doppi ruoli tattici) e corretta generazione di file Excel completamente sbloccati per i professionisti.

---

## 1. Validazione Dimensionale Inviolabile delle Grandezze Fisiche

Ogni formula, etichetta UI, grafico o export deve rispettare tassativamente le unità di misura del Sistema Internazionale (SI):

| Grandezza | Simbolo | Unità di Misura | Notazione UI Obbligatoria | Divieti Assoluti |
| :--- | :--- | :--- | :--- | :--- |
| **Forza** | $F$ | Newton | `N` (es. $2450\text{ N}$) | Mai confondere con kg o kgf |
| **Potenza** | $P$ | Watt | `W` (es. $4200\text{ W}$) | Mai esprimere in N o kg |
| **Carico / Massa** | $m$ / $L$ | Chilogrammi | `kg` (es. $120.0\text{ kg}$) | Mai omettere unità |
| **Velocità** | $v$ | Metri al secondo | `m/s` (es. $0.82\text{ m/s}$) | Non usare km/h per il VBT |
| **Accelerazione**| $a$ | Metri al secondo quadro | `m/s²` | Nessun valore adimensionale |
| **Altezza Salto** | $h$ | Centimetri | `cm` (es. $42.5\text{ cm}$) | Non confondere con metri |

---

## 2. Casi Limite e Gestione Baseline Atleti

### A. Fallback per Nuovi Atleti (< 6 mesi di storico dati)
- **Problema:** Quando un atleta è appena tesserato o non dispone di almeno 6 mesi di dati continuativi di carico/GPS/VBT, il calcolo dello Z-Score o della deviazione standard del microciclo risulterebbe inattendibile o genererebbe `NaN`/divisioni per zero.
- **Procedura di Fallback Obbligatoria:**
  1. Utilizzare come baseline provvisoria i valori mediani del ruolo tattico della squadra (Role-based Cohort Median).
  2. Applicare un intervallo di confidenza allargato ($\pm 20\%$) per i primi 30 giorni.
  3. Visualizzare nella UI un badge informativo chiaro: *"Baseline di ruolo temporanea (fase di calibrazione: X sessioni registrate)"*.
  4. Prevenire in modo assoluto qualsiasi comparsa di `undefined`, `NaN` o stringhe vuote.

### B. Gestione del Doppio Ruolo Tattico
- **Problema:** Nello sport professionistico (calcio, basket, rugby), molti atleti ricoprono più posizioni tattiche con profili metabolici e neuromuscolari radicalmente diversi (es. Terzino sinistro vs Ala offensiva, Playmaker vs Guardia).
- **Procedura di Ponderazione:**
  - La baseline di riferimento dell'atleta deve essere calcolata tramite media ponderata basata sulla percentuale di minuti giocati in ciascun ruolo:
    $$\text{Baseline}_{\text{Target}} = w_1 \cdot \text{Baseline}_{\text{Ruolo 1}} + w_2 \cdot \text{Baseline}_{\text{Ruolo 2}}$$
    dove $w_1 + w_2 = 1.0$.

---

## 3. Standard Esportazione Fogli di Calcolo Excel (`.xlsx`)

In conformità con i requisiti dei preparatori atletici e nutrizionisti Tier 2 / Tier 3:
- **File Totalmente Sbloccati:** Ogni file generato (tramite `exceljs` o equivalenti) deve avere `protected: false` su ogni foglio di lavoro (`worksheet.protect = false`).
- **Nessuna Password:** È vietato applicare blocchi, password o restrizioni di modifica alle celle. I preparatori devono poter manipolare liberamente formule, tabelle pivot e grafici.
- **Formattazione Ingegneristica:**
  - Intestazioni chiare con grandezza e unità di misura (es. `Carico (kg)`, `Velocità Media Propulsiva (m/s)`, `Potenza Picco (W)`).
  - Formato numerico esplicito per le celle (es. `0.00` per velocità, `0` per Watt, `0.0` per kg).
  - Stili di cella puliti: font professionale (Calibri o Segoe UI), contrasto elevato, zero colori fluorescenti.
