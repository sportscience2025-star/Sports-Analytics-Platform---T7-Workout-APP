---
trigger: model_decision
description: "Attivare ogni volta che si creano, modificano o verificano diagrammi, nodi, rombi, badge, colori, spaziature o frecce sulla board Miro online (uXjVEbo6L2o=)."
---

# Regola 10: Standard Visivi Miro, Forme ISO, Misure e Frecce Ortogonali

## Scopo
Garantire che tutti i 18 flowchart e ogni schema sulla board Miro (`uXjVEbo6L2o=`) siano ordinati, proporzionati e leggibili da chiunque senza testo tagliato o frecce che si incrociano sui riquadri.

## Cosa l'AI NON può fare (Divieti assoluti)
- **Mai testo tagliato o compresso:** è vietato lasciare righe troncate o sovrapposte ai bordi in qualsiasi forma.
- **Mai rombi piccoli:** è vietato creare rombi decisionali con larghezza inferiore a `360px` o altezza inferiore a `125px`.
- **Mai frecce curve o diagonali cross-board:** vietati connettori inclinati, curvi casuali o diagonali lunghe che tagliano altri blocchi ("Laser Beams"); per collegamenti tra moduli lontani usare card locali di passaggio (`NAVIGA ALL'HUB CENTRALE`) o corridoi esterni liberi.
- **Mai frecce sopra riquadri o testi (Zero Crossing):** nessuna freccia deve mai passare sopra o sotto riquadri, rombi o testi intermedi.
- **Mai etichette verticali sulle frecce:** vietate didascalie ruotate o sovrapposte ai bordi delle forme.
- **Mai invadere i Badge (#01..#18):** nessuna freccia o forma può entrare nella **fascia perimetrale di rispetto di almeno `40px`** su tutti e 4 i lati di ciascuno dei 18 Badge identificativi.

## Cosa l'AI DEVE fare (Obblighi operativi)

### 1. Struttura a 4 Corsie (Swimlanes) & 4 Forme ISO
Ogni flowchart della Zona 4 deve essere organizzato rigorosamente in 4 corsie orizzontali/verticali coerenti:
1. **Corsia 1 — App Utente:** Thin Client UI/UX (React 18 / Mobile)
2. **Corsia 2 — API Gateway & RBAC:** controllo accessi e limiti Tier 1 / 2 / 3
3. **Corsia 3 — Server Segreto:** motori di calcolo proprietari ("Scatola Nera")
4. **Corsia 4 — Database Tripartito:** Silo 1 (Social), Silo 2 (Bunker Club) o Silo 3 (Research)

Forme ISO ammesse:
- `round_rectangle` (Rettangolo Arrotondato): Inizio / Fine flusso o Azione di avvio utente.
- `rectangle` (Rettangolo Standard): Schermata UI (Corsia 1) oppure Elaborazione/Servizio (Corsie 2 e 3).
- `diamond` (Rombo): Decisione logica `SE / ALLORA` con rami etichettati `SÌ` / `NO`.
- Cilindro / Database: Salvataggio dati con indicazione esplicita del Silo (`Silo 1`, `Silo 2`, `Silo 3`).

### 2. Colori & 4 Stati UI Obbligatori
- **Colori in Zona 4 su Miro:** usare la **Palette Funzionale per Corsia** (Client `#e0f2fe`, Gateway `#ede9fe`, Server `#d1fae5`, DB `#ffe4e6`, Decisioni `#fef3c7`, Vincoli/Alert `#fee2e2`).
- **Codice Gap Analysis nei capitolati `.md` e Zona 5:** Verde (`#2ecc71` Pronto in Beta), Giallo (`#f1c40f` Parziale/Refactor), Arancione (`#e67e22` Nuovo da sviluppare), Rosso/Viola (`#e74c3c` / `#9b59b6` Vincolo critico sicurezza o grandezze fisiche `F` in N, `P` in W, Carico in kg).
- **4 Stati UI in ogni flusso di interfaccia:** esplicitare sempre `Empty State` (primo accesso/nessun dato), `Loading State` (attesa risposta server), `Populated State` (dati completi), `Error / Fallback State` (errori rete, assenza baseline, prevenzione `NaN` / `undefined`).

### 3. Dimensioni e Spaziature Fisse (Anti-Sovrapposizione)
- **Rombi decisionali (`diamond`):** `W >= 360px`, `H >= 125px`, font `12-14px` con testo sintetico.
- **Riquadri standard:** `W = 380-500px` per far andare a capo il testo in modo naturale.
- **Distanza tra nodi consecutivi:** minimo `70-90px` tra blocchi collegati.
- **Badge identificativi (#01..#18):** `round_rectangle` con bordo `3.0px`, larghezza fissa `W = 520px`, altezza `H = 75px` (Tier 1 e Tier 2) fino a `H = 125px` (titoli multi-riga Tier 3), fascia libera attorno di `40px` su tutti i lati.
  - Palette Badge: Tier 1 Teal (`#0f766e` / bordo `#14b8a6`), Tier 2 Amber (`#b45309` / bordo `#f59e0b`), Tier 3 Indigo (`#4338ca` / bordo `#818cf8`), testo sempre bianco `#ffffff`. Indicare sempre numero (`#01`..`#18`), Tier, codice (`FLOW-1A`), titolo e colonna.

### 4. Frecce Ortogonali a 90 gradi, API Miro v2 & Verifica Finale
- Tutti i collegamenti devono usare esclusivamente **`shape: 'elbowed'`** (angoli a 90°), **`textOrientation: 'horizontal'`**, instradati solo nei **corridoi vuoti** tra le colonne dei blocchi.
- Usare endpoint REST Miro v2 `PATCH /v2/boards/{board_id}/shapes/{item_id}` e `/connectors/{item_id}` con punti di aggancio coerenti (`snapTo: top, bottom, left, right`).
- Prima di dichiarare conclusa qualsiasi modifica su Miro: eseguire lo script di controllo geometrico certificando **0 crossings** (zero intersezioni linea-riquadro) e verificare l'allineamento documentale richiesto dalla Regola 08.
