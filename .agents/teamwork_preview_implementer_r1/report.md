> [!WARNING] **Skepticism Disclaimer**
> Sono fiducioso nella coerenza sintattica e nella struttura CSS/DOM verificata tramite test_check.py, ma la resa visiva dei font e del blur dipende dal rendering specifico della GPU/browser dell'utente.

## 1. What I changed
- `js/ui/catalog.js`:
  - Sostituito il pulsante `.btn-icon` ("Scheda →") con il nuovo pulsante a pillola `.btn-card-action`: `<button class="btn-card-action" title="Vedi dettagli esercizio"><span>Scheda</span><span class="action-arrow">→</span></button>`.
- `js/ui/render-filters.js`:
  - Ristrutturato il dropdown `#menu-muscle` separando la testata di ricerca (`.dropdown-search-wrap` con icona SVG di ricerca) dal corpo delle opzioni (`.dropdown-options-list`).
  - Incapsulate le opzioni in `.dropdown-options-list` anche nei menu `#menu-level`, `#menu-equipment`, `#menu-quality` e `#menu-sort`.
  - Aggiornato il listener di ricerca muscoli con normalizzazione `trim()` e gestione della propagazione del click.
- `css/style.css`:
  - Rimossa la duplicazione/conflitto tra le definizioni di `.custom-select-menu` (ex righe 3876-4036 eliminate).
  - Impostato layout e stile Apple Minimal frosted glass su `.custom-select-menu` (`min-width: 280px; max-width: 360px; backdrop-filter: blur(24px); border-radius: 12px;`).
  - Fissata la testata `.dropdown-search-wrap` (`flex-shrink: 0; background: rgba(30, 41, 59, 0.8)`) e reso indipendente lo scroll su `.dropdown-options-list` (`max-height: 280px; overflow-y: auto; overscroll-behavior: contain`).
  - Rifinite le voci `.custom-option` con padding `0.55rem 0.75rem`, raggio `8px` e transizioni morbide.
  - Ottimizzato layout `.exercise-card`: aggiunti `position: relative; overflow: hidden; padding: 1.25rem;`.
  - Posizionato `.favorite-btn` in absolute in alto a destra (`position: absolute; top: 1rem; right: 1rem; z-index: 2`) con `.card-header` provvisto di `padding-right: 2.25rem` per prevenire qualsiasi sovrapposizione con i badge.
  - Abilitato flex wrap su `.card-tags` e ridotta la dimensione di `.tag` a `0.68rem` con padding armonico (`0.2rem 0.55rem`), impedendo overflow orizzontali anche con badge lunghi come `MULTIARTICOLARE`.
  - Impostato `max-width: 100%; flex-wrap: wrap;` su `.sec-muscles-wrap` e overflow ellipsis su `.sec-muscle-pill` e `.tag.chip--equipment`.
  - Definito lo stile di `.btn-card-action` (pillola con sfondo blu traslucido, bordo e freccia animata in hover).
- `sw.js`:
  - Incrementata la versione di cache a `t7-workout-v84`.
- `test_check.py`:
  - Aggiornata la verifica della cache a `t7-workout-v84`.

## 2. Why
- Risolve l'overflow orizzontale nelle card esercizi con badge lunghi e muscoli secondari multipli, evitando sovrapposizioni con l'icona preferiti.
- Sostituisce il vecchio pulsante circolare distorto con un'elegante pillola Apple Minimal.
- Isola la barra di ricerca del filtro "Muscolo" in una testata rigida e indipendente, impedendo lo scorrimento di elementi (come "Medio Gluteo") sopra o sotto l'input.
- Elimina le ridondanze e conflitti di selettori CSS garantendo un tema frosted glass coerente.
- Invalida la cache PWA per distribuire gli aggiornamenti ai client.

## 3. Verification Record
- **Deep Verification (ran actual tests):**
  - Eseguito `py test_check.py`: superati con successo tutti i controlli sintattici su JS, bilanciamento delimitatori ({}, (), []) e verifica di corrispondenza CACHE_NAME (`t7-workout-v84`).
- **Shallow Verification (manual run only):**
  - Ispezione statica dei selettori CSS e delle classi DOM modificate in `catalog.js`, `render-filters.js` e `style.css`.
- **Unverified aspects:**
  - Rendering pixel-perfect in browser reali con diversi motori grafici (Blink, WebKit, Gecko) o dispositivi con schermi con densità pixel insolita.

## 4. Known Issues
- `Minor Robustness Risk` — Se un browser non supporta `-webkit-backdrop-filter`, lo sfondo del menu a tendina utilizzerà la fallback opaca `rgba(15, 23, 42, 0.95)`, garantendo comunque leggibilità totale senza degradazione funzionale.

## 5. Untested Edge Cases & Next Step
- Testare visivamente nel browser l'apertura del catalogo filtrando contemporaneamente per stringa di testo lunga e muscolo specifico per verificare il refresh delle card animate e il rendering dei tag wrapped su viewport inferiori a 360px.
