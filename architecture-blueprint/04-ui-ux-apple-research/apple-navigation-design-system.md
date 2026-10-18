# APPLE-INSPIRED DESIGN SYSTEM & NAVIGATION SPECIFICATION
## T7 Workout — Sports Analytics Platform

---

## 1. VISIONE DESIGN SYSTEM & FILOSOFIA UX

La progettazione dell'interfaccia utente di **T7 Workout** adotta i principi del design industriale Apple (Human Interface Guidelines), declinati nel contesto dell'alto rendimento sportivo:
1. **Chiarezza Assoluta (Clarity):** Il testo e le metriche chiave (Watt, N, m/s, kg) sono sempre leggibili a colpo d'occhio, sia in palestra sotto luce artificiale sia all'aperto sul campo d'allenamento sotto la luce solare diretta.
2. **Profondita e Stratificazione (Depth & Translucency):** Uso controllato di superfici scure a contrasto elevato, con effetti di sfuocatura dello sfondo (`backdrop-filter: blur(20px)`) che separano visivamente la shell di navigazione dai dati sottostanti.
3. **Regola dei Due Click (Two-Click Rule):** Qualsiasi schermata o funzione core della piattaforma (dal profilo VBT di un atleta alla prescrizione clinica) e raggiungibile in un massimo di 2 interazioni touch/mouse dal Cockpit.
4. **Zero Sovraccarico Cognitivo:** L'interfaccia adotta un paradigma gerarchico: visione macro sintetica $\rightarrow$ espansione progressiva al tocco $\rightarrow$ drawer tecnico di dettaglio.

---

## 2. COMPONENTI DELLA GLOBAL NAVIGATION SHELL

### 2.1 Fixed Top Navigation Bar
- **Altezza:** `64px` fissa su desktop, `56px` su dispositivi mobile.
- **Sfondo:** Nero semi-trasparente (`rgba(15, 23, 42, 0.85)`) con effetto glassmorphism.
- **Elementi di Sinistra:** Logotipo T7 Workout + Pill identificativo del Tier attivo (`TIER 1 BASE`, `TIER 2 PRO`, `TIER 3 ELITE CLUB`).
- **Elemento Centrale (Core UX): Selettore Permanente di Contesto Atleta/Squadra:**
  - Componente reattivo ad accesso globale.
  - Permette di selezionare istantaneamente con un click:
    - *Vista Squadra Intera:* Visualizzazione aggregata di gruppo (readiness media, heatmap microciclo).
    - *Singolo Atleta:* Filtro su uno specifico atleta con ricerca testuale rapida (nome, cognome, ruolo).
  - Accanto al nome dell'atleta compare un indicatore cromatico di stato clinico:
    - `Verde`: Disponibile al 100%.
    - `Giallo`: Infortunio minore o carico ridotto.
    - `Rosso`: Blocco clinico o protocollo Return-to-Play attivo.
  - La selezione del contesto viene propagata a tutti i 10 moduli via Context API / Global State senza richiedere il ricaricamento della pagina.
- **Elementi di Destra:**
  - Icona di stato BLE (Verde = Hardware collegato, Grigio = Disconnesso).
  - Campanella notifiche con badge conteggio alert clinici o di affaticamento.
  - Avatar utente con menu dropdown per profilo, fatturazione e switch organizzazione.

### 2.2 Primary Navigation Menu
- **Desktop (Larghezza schermo $\ge 1024\text{px}$):**
  - Sidebar fissa a sinistra, larghezza collassabile da `260px` a `72px`.
  - Iconografia minimalista con tooltip al passaggio del cursore.
- **Mobile (Larghezza schermo $< 1024\text{px}$):**
  - Bottom Navigation Bar ancorata in basso a `5` schede principali + pulsante "Altro" con menu a comparsa (sheet modale).

---

## 3. COLOR PALETTE E ACCENTI NEON

Il tema Dark Cockpit sfrutta sfondi scuri profondi per massimizzare il contrasto e il risparmio energetico su schermi OLED:

| Token Colore | Codice HEX / RGBA | Ruolo Semantico |
| :--- | :--- | :--- |
| `--bg-canvas` | `#090d16` | Sfondo primario dell'applicazione |
| `--bg-surface` | `#0f172a` | Superficie delle card e dei pannelli |
| `--bg-glass` | `rgba(15, 23, 42, 0.80)` | Header e drawer con sfocatura |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Delimitazione pulita delle card |
| `--text-primary` | `#f8fafc` | Titoli, valori numerici chiave |
| `--text-secondary` | `#94a3b8` | Etichette, unita di misura, descrizioni |
| `--neon-cyan` | `#38bdf8` | Accento VBT, velocita, navigazione attiva |
| `--neon-emerald` | `#10b981` | Stato ottimale, forza esplosiva, $P_{\max}$ |
| `--neon-amber` | `#f59e0b` | Attenzione, affaticamento moderato |
| `--neon-rose` | `#f43f5e` | Allarme medico, sovraccarico, esclusione |
| `--neon-purple` | `#a855f7` | Statistica avanzata PAP, Z-Score |

---

## 4. TIPOGRAFIA E SCALE DIMENSIONALI

- **Font Family Primario:** `system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif`.
- **Numeri e Metriche:** `font-variant-numeric: tabular-nums;` obbligatorio su tutte le tabelle e metriche live per impedire che il layout traballi al variare dei numeri decimali.
- **Gerarchia Tipografica:**
  - `Hero Metric:` 36px, Semibold (per 1RM stimato, Z-Score e Watt massimi).
  - `Section Title:` 20px, Bold (per i titoli dei moduli).
  - `Card Header:` 15px, Medium (per le intestazioni dei grafici).
  - `Body Text:` 14px, Regular (per descrizioni ed esercizi).
  - `Caption / Unit:` 12px, Regular (per unita di misura N, W, kg, m/s).
