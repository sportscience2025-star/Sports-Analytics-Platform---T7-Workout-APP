# Adversarial Review & QA Report (Round 1)

> [!WARNING] **Skepticism Disclaimer**
> Alta confidenza sulla correzione dell'overflow visivo e sulla gestione dello stato del dropdown verificata empiricamente tramite DevTools sia a livello di computed styles che di comportamento funzionale; rimane da verificare il comportamento sotto touch scrolling ad alta latenza su dispositivi iOS fisici datati.

## 1. What the prior attempt got wrong

### Issue 1: Cascade Override sui Badge `.tag` (Mancata applicazione del ridimensionamento R1)
- **Input:** Card esercizio nel catalogo contenente badge tipo (`MULTIARTICOLARE`), qualità (`FORZA`) o livello (`PRINCIPIANTE`).
- **Expected:** Badge stilizzati con `font-size: 0.68rem; padding: 0.2rem 0.55rem; letter-spacing: 0.03em; line-height: 1.2; border-radius: 9999px;` per prevenire la saturazione orizzontale della riga.
- **Actual:** `window.getComputedStyle(.tag)` restituiva `fontSize: 13.6px` (0.85rem), `padding: 4px 12px` (0.25rem 0.75rem) e `borderRadius: 20px`.
- **Root cause:** In `css/style.css`, l'ex riga 2238 conteneva una regola globale non scoped `.tag { background: rgba(255,255,255,0.05); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; border: 1px solid var(--border); }` associata alla sezione `.meta-tags`. Poiché appariva dopo la riga 697 con medesima specificità (`0,0,1,0`), sovrascriveva a cascata tutte le dimensioni dei badge in tutte le card dell'applicazione.

### Issue 2: Dropdown Search State Retention & Fallimento Reset (Bug Funzionale)
- **Input:** Utente digita "medio" nel campo di ricerca del menu muscoli, seleziona "Medio Gluteo" o preme il pulsante generale "↺ Reset".
- **Expected:** Al reset dei filtri o alla riapertura successiva del menu a tendina, il campo `#search-muscle-input` deve essere ripulito e tutte le 33 opzioni muscolari e i 7 header tassonomici devono essere visibili.
- **Actual:** Il valore `"medio"` rimaneva persistito in `#search-muscle-input`; alla riapertura del menu muscoli o dopo il click su Reset, solo 2 opzioni erano visibili e 0 header erano mostrati, rendendo impossibile selezionare altri muscoli senza cancellazione manuale del testo.
- **Root cause:** L'event listener del pulsante `#btn-reset-filters` non resettava il valore né ripristinava il `display` di `.custom-option` e `.dropdown-group-header`. Inoltre, la selezione di un muscolo e la riapertura del menu non azzeravano il filtro di ricerca interno.

### Issue 3: Accumulo di Event Listener su `document` (Memory Leak)
- **Input:** Navigazione ripetuta tra le viste dell'applicazione (Catalogo ↔ Preferiti).
- **Expected:** Gli event handler globali per la chiusura dei menu a tendina non devono accumularsi.
- **Actual:** Ogni invocazione di `window.App.renderFilters` registrava un nuovo listener anonimo `document.addEventListener('click', ...)`, moltiplicando i listener globali ad ogni cambio vista.
- **Root cause:** Mancanza di tracciamento e rimozione (`removeEventListener`) del listener globale precedente.

### Issue 4: Mancanza di Chiusura da Tastiera (Escape Key)
- **Input:** Pressione del tasto `Escape` con un menu a tendina aperto.
- **Expected:** Chiusura immediata del dropdown secondo le convenzioni Apple Minimal.
- **Actual:** Il menu restava aperto; l'utente doveva cliccare con il mouse all'esterno.
- **Root cause:** Assenza di binding per l'evento `keydown` (Escape).

---

## 2. What I changed

- **`css/style.css`**:
  - Eseguito scoping chirurgico della regola globale `.tag` in `.meta-tags .tag` (ex riga 2238/2270), eliminando l'override accidentale dei badge card.
  - Rafforzato il selettore dei badge con `.tag, .card-tags .tag` con `font-size: 0.68rem; padding: 0.2rem 0.55rem; letter-spacing: 0.03em; line-height: 1.2; border-radius: 9999px; max-width: 100%; overflow: hidden; text-overflow: ellipsis;`.
  - Aggiunti `min-width: 0; flex-shrink: 1;` a `.tag.chip--equipment` per garantire perfetto layout flessibile nelle card strette.
  - Aggiunto `flex-shrink: 0; margin-left: 0.5rem;` a `.custom-option .check-icon` per evitare distorsioni della spunta su etichette lunghe.
  - Aggiunti stati `:active` e `:focus-visible` al pulsante pillola `.btn-card-action`.
  - Impostato `#container-sort .custom-select-menu` con `left: auto; right: 0; transform-origin: top right;` per scongiurare overflow orizzontali del viewport su desktop e tablet.
  - Aggiunta classe `.dropdown-empty-state` per il feedback testuale discreto in caso di ricerca senza corrispondenze.
- **`js/ui/render-filters.js`**:
  - Implementata funzione `resetMuscleSearch()` che azzera l'input e ripristina la visualizzazione di tutte le opzioni e categorie tassonomiche.
  - Integrato `resetMuscleSearch()` sia nel listener del pulsante generale `#btn-reset-filters`, sia alla selezione di un'opzione muscolare, sia all'apertura del dropdown.
  - Aggiunto supporto a `Escape` key per la chiusura rapida di qualsiasi dropdown attivo.
  - Implementata pulizia dei listener globali (`_activeFilterCloseHandler` e `_activeFilterKeyHandler`) per prevenire memory leak tra viste.
  - Aggiunto stato vuoto visivo `#muscle-empty-state` ("Nessun muscolo trovato") in `.dropdown-options-list` quando la ricerca non produce risultati.
  - Abilitato il click su `.dropdown-search-wrap` per dare immediato focus all'input di ricerca.
- **`js/ui/catalog.js`**:
  - Aggiunto esplicitamente l'attributo `type="button"` a `.btn-card-action`.
- **`sw.js` & `test_check.py`**:
  - Incrementata la versione di cache a `t7-workout-v85` in `sw.js` e aggiornata la verifica corrispondente in `test_check.py`.

---

## 3. Verification Record

- **Deep Verification (ran actual tests):**
  - Eseguito `py test_check.py`: esito positivo con codice di uscita 0 (`All syntax checks passed.`). Cache allineata a `t7-workout-v85`.
  - Verificato con Chrome DevTools MCP il computed style effettivo di `.tag`:
    - `fontSize: 10.88px` (0.68rem)
    - `padding: 3.2px 8.8px` (0.2rem 0.55rem)
    - `borderRadius: 9999px`
    - `lineHeight: 13.056px`
  - Verificata l'assenza di overflow su tutte le 504 card in catalogo: `overflowsCount: 0`.
  - Verificato su viewport mobile 360px: `overflowsCount: 0`.
  - Verificato il comportamento del dropdown `#menu-muscle` in DevTools:
    - Scorrimento di 150px in `.dropdown-options-list`: la testata di ricerca `#search-muscle-input` rimane immobile (`searchWrapMoved: false`), nessun elemento scorre sopra di essa (`medioGluteoOverlapsSearch: false`).
    - Ricerca per "medio": filtraggio dinamico corretto a 2 opzioni.
    - Selezione di "Medio Gluteo": chiusura menu e aggiornamento trigger ("Muscolo: Medio Gluteo").
    - Riapertura: input azzerato (`""`), 33 opzioni muscolari ripristinate, 7 header di gruppo ripristinati.
    - Reset generale: azzeramento filtri, input ripulito e ripristino istantaneo di tutte le 33 opzioni e 7 header.
    - Ricerca inesistente ("muscolointrovabile12345"): comparsa del messaggio "Nessun muscolo trovato" (`display: block`).
    - Tasto `Escape`: chiusura immediata del menu.
  - Verificata l'apertura e selezione per tutti i 5 dropdown (`#menu-muscle`, `#menu-level`, `#menu-equipment`, `#menu-quality`, `#menu-sort`).
  - Verificato ordinamento alfabetico A-Z e debounce filtering: 35 esercizi filtrati e ordinati per nome in modo impeccabile.
  - Verificata l'apertura della modale di dettaglio al click su `.btn-card-action` e la corretta propagazione senza interferenza con `.favorite-btn`.
- **Shallow Verification (manual only):**
  - Catturati e ispezionati due screenshot ad alta risoluzione della UI: verificato design Apple Minimal frosted glass, allineamento spaziale dei badge, aspetto a pillola del pulsante Scheda ed eleganza visiva del dropdown fluttuante.
- **Unverified aspects:**
  - Rendering del blur (`backdrop-filter`) su browser legacy che non supportano CSS backdrop-filter (fallback con colore solido opaco `rgba(15, 23, 42, 0.95)` comunque operativo).
  - Comportamento su display touch fisici iOS con scrolling inerziale rapido a 120Hz.

---

## 4. Known Issues

- `Shallow Verification` — Nessun difetto critico o funzionale riscontrato. L'integrazione è stata validata con tool reali di automazione browser e runner di test del repository.
- `Minor Robustness Risk` — Qualora un browser disabiliti o non implementi `backdrop-filter` o `-webkit-backdrop-filter`, lo sfondo del dropdown visualizza il colore scuro `rgba(15, 23, 42, 0.95)`, garantendo totale leggibilità ma privo dell'effetto di sfocatura dello sfondo.

---

## 5. Remaining risk & next step

Il task è completamente risolto:
1. L'overflow delle card è azzerato e i badge sono microscopicamente proporzionati a `0.68rem` senza sbordare in nessuno dei 504 esercizi.
2. Il pulsante `Scheda` è un'elegante pillola azzurra translucida animata in hover e click.
3. La barra di ricerca del filtro muscoli è ancorata saldamente alla testata del menu, senza alcuna sovrapposizione visiva di elementi durante lo scrolling.
4. I bug di ritenzione della ricerca e di accumulo dei listener sono stati completamente eliminati.
5. Cache Service Worker aggiornata a `t7-workout-v85` e suite `test_check.py` passata al 100%.
Nessun ulteriore round di implementazione necessario.
