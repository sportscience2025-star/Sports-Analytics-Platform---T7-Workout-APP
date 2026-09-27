# Analisi Integrazione 'Libreria Fonti' (Scientific Hub)

Questa analisi definisce la strategia tecnica e i dettagli architetturali per implementare la nuova sezione **'Libreria Fonti' (Scientific Hub)** all'interno dell'applicazione T7 Workout. L'analisi è puramente esplorativa e non modifica alcun file sorgente.

---

## 1. Analisi dell'Architettura di Navigazione e Gestione delle Viste

L'applicazione T7 Workout utilizza un'architettura **Single Page Application (SPA)** nativa, gestita interamente tramite JavaScript lato client. 

### A. Definizione del Menu di Navigazione (`index.html`)
La barra di navigazione principale è definita nell'header dell'applicazione:
```html
<header class="app-header">
    <div class="logo">
        <h1>T7 <span class="highlight">Workout</span></h1>
    </div>
    <nav class="main-nav">
        <a href="#" class="nav-item" data-view="catalog">Catalogo</a>
        <a href="#" class="nav-item" data-view="wizard">Programmazione</a>
        <a href="#" class="nav-item" data-view="analysis">Data Analisi</a>
        <a href="#" class="nav-item" data-view="favorites">Preferiti</a>
    </nav>
</header>
```
Ogni elemento di navigazione ha la classe `nav-item` e un attributo custom `data-view` che specifica l'identificativo univoco della vista di destinazione.

### B. Gestione degli Eventi e Stato della Navigazione (`js/app.js`)
L'applicazione traccia lo stato della vista corrente tramite una variabile di stato globale `state.currentView`. All'avvio dell'applicazione (`DOMContentLoaded`), la funzione `init()` inizializza i listener di navigazione:
```javascript
// Registrazione degli Event Listener in js/app.js
function setupEventListeners() {
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
        });
    });
    // ...
}
```
Quando un utente fa clic su una voce di navigazione:
1. Viene invocata la funzione `switchView(viewName)`.
2. `switchView` aggiorna `state.currentView`, rimuove la classe `active` da tutti i pulsanti di navigazione, la assegna all'elemento attivo e invoca `renderView(viewName)`:
```javascript
async function switchView(viewName) {
    state.currentView = viewName;

    navButtons.forEach(btn => {
        if (btn.dataset.view === viewName) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    renderView(viewName);
}
```

### C. Meccanismo di Rendering / Router (`js/app.js`)
Il rendering delle viste avviene ripulendo il contenitore principale (`#app-container`) e iniettando dinamicamente il markup corrispondente:
```javascript
function renderView(viewName) {
    // Rimozione di eventuali grafici o istanze attive per prevenire memory leak
    if (state.analysisUI && typeof state.analysisUI.cleanup === 'function') {
        state.analysisUI.cleanup();
        state.analysisUI = null;
    }

    appContainer.innerHTML = ''; // Svuota la vista corrente

    switch (viewName) {
        case 'catalog':
            // Rendering del catalogo ed esecuzione dei relativi filtri...
            break;
        case 'wizard':
            // Rendering del wizard di programmazione IA...
            break;
        case 'analysis':
            // Rendering del modulo di analisi dati VBT/Salti...
            break;
        case 'favorites':
            // Rendering degli esercizi salvati dall'utente...
            break;
        default:
            appContainer.innerHTML = `<h2>Errore 404</h2><p>Vista non trovata</p>`;
    }
}
```

---

## 2. Palette Colori e Regole di Stile (Premium Dark Mode)

L'interfaccia utente è interamente stilizzata con un tema **Premium Dark Mode**, basato su tonalità di blu profondo e grigio ardesia definiti in `css/style.css` mediante variabili CSS:

*   **Variabili di Base (`:root`)**:
    *   `--bg-body`: `#0f172a` (Spazio Profondo / Blu Scuro per il corpo pagina)
    *   `--bg-surface`: `#1e293b` (Grigio Ardesia 800 per le card e i contenitori)
    *   `--bg-surface-hover`: `#334155` (Slate 700 per gli stati hover)
    *   `--text-primary`: `#f8fafc` (Slate 50, quasi bianco per i testi principali)
    *   `--text-secondary`: `#94a3b8` (Slate 400, grigio medio per testi secondari e descrizioni)
    *   `--primary`: `#3b82f6` (Blu Vivace per pulsanti e link principali)
    *   `--accent`: `#0ea5e9` (Azzurro Sky per dettagli e badge attivi)
    *   `--border`: `#334155` (Slate 700 per i bordi delle card e divisori)
    *   `--input-bg`: `#0f172a` (Uguale a `--bg-body` per dare profondità a input e select)
    *   `--radius-sm`/`--radius-md`/`--radius-lg`: `8px`, `12px`, `16px` per angoli arrotondati coerenti.

*   **Elementi Chiave da Riusare**:
    *   **Barra Filtri (`.filter-bar`)**: Utilizza sfondo `--bg-surface`, bordi `--border`, ed è un contenitore flessibile (`display: flex; flex-wrap: wrap; gap: 1rem;`).
    *   **Campi di Ricerca (`.search-group`)**: Ha un input con icona di ricerca posizionata in assoluto a sinistra.
    *   **Esercizio Card (`.exercise-card`)**: Card flessibile con altezza minima `220px`, transizione fluida su trasformazioni (`transform 0.2s`), bordo `--border` che diventa `--primary` al passaggio del mouse con sollevamento verticale (`transform: translateY(-4px)`).
    *   **Tag / Badge (`.tag`)**: Forma a pillola (`border-radius: 9999px`) con sfondi semitrasparenti basati sulle categorie o sui livelli di esperienza.

---

## 3. Schema Dati e Mockup per 'Libreria Fonti'

Si propone di definire il database delle fonti scientifiche all'interno di un nuovo file dedicato (`js/sources-data.js`) o di appenderlo a `js/data.js` per mantenerlo accessibile globalmente sotto il namespace `window.App.scientificSources`.

### A. Schema JavaScript di una Fonte Scientifica
Ogni fonte sarà descritta dal seguente schema:
```typescript
interface ScientificSource {
    id: string;               // Identificativo univoco (es. "src_001")
    title: string;            // Titolo della linea guida o studio
    authors: string;          // Autori o ente (es. "American Heart Association")
    journal: string;          // Rivista scientifica o editore (es. "Circulation")
    year: number;             // Anno di pubblicazione
    scientificArea: string;   // Area scientifica per il filtraggio
    doi?: string;             // Digital Object Identifier (opzionale)
    summary: string;          // Riassunto dell'evidenza clinica / abstract
    keyTakeaways: string[];   // Lista delle raccomandazioni cliniche operative
    clinicalConditions: string[]; // Riferimento agli ID delle patologie gestiti dall'app
}
```

### B. Dataset Mockup (5 Record di Esempio)
```javascript
window.App.scientificSources = [
    {
        id: "src_001",
        title: "Exercise Standards for Testing and Training in Patients with Heart Failure",
        authors: "AHA Committee on Exercise, Rehabilitation, and Prevention",
        journal: "Circulation",
        year: 2023,
        scientificArea: "Cardiologia",
        doi: "10.1161/CIR.0000000000001045",
        summary: "Linee guida cliniche per la prescrizione dell'allenamento in soggetti con scompenso cardiaco stabile. Enfatizza la progressione del volume e il monitoraggio dei sintomi.",
        keyTakeaways: [
            "Iniziare con intensità aerobica pari al 40-50% del VO2max.",
            "L'allenamento di forza deve privilegiare il circuito a basso carico (30-40% 1RM) per evitare l'aumento eccessivo della pressione post-carico.",
            "Evitare categoricamente sforzi isometrici massimali e la manovra di Valsalva."
        ],
        clinicalConditions: ["heart_failure"]
    },
    {
        id: "src_002",
        title: "ACSM's Guidelines for Exercise Testing and Prescription in Low Back Pain",
        authors: "American College of Sports Medicine (ACSM)",
        journal: "Lippincott Williams & Wilkins",
        year: 2024,
        scientificArea: "Ortopedia",
        doi: "10.1249/MSS.0000000000003102",
        summary: "Standard clinici per la gestione del dolore lombare aspecifico e cronico tramite esercizio fisico strutturato, focalizzandosi sulla stabilità spinale e la mobilità dell'anca.",
        keyTakeaways: [
            "Incoraggiare l'attività fisica aerobica a basso impatto per favorire la vascolarizzazione discale.",
            "Esercizi di core stability (es. protocollo Big 3 di McGill) devono essere eseguiti mantenendo la colonna in posizione neutra.",
            "Evitare flessioni e torsioni represse sotto carico nella fase acuta."
        ],
        clinicalConditions: ["lumbar_pain", "sensitive_back"]
    },
    {
        id: "src_003",
        title: "Physical Activity and Exercise in Patients with Type 2 Diabetes",
        authors: "American Diabetes Association (ADA)",
        journal: "Diabetes Care",
        year: 2023,
        scientificArea: "Metabolico",
        doi: "10.2337/dci23-0045",
        summary: "Raccomandazioni sul tempismo, la tipologia e il volume di allenamento di forza e cardio per migliorare la sensibilità all'insulina e il controllo della glicemia.",
        keyTakeaways: [
            "Combinare esercizio aerobico e di contro-resistenza produce benefici superiori rispetto a una sola modalità.",
            "L'allenamento di forza deve coinvolgere i grandi gruppi muscolari per ottimizzare il trasporto del glucosio tramite i recettori GLUT4.",
            "Monitorare la glicemia prima e dopo l'allenamento per prevenire crisi ipoglicemiche ritardate."
        ],
        clinicalConditions: ["diabetes_t2"]
    },
    {
        id: "src_004",
        title: "Guidelines for Sports Training in Multiple Sclerosis: Safe Prescriptions",
        authors: "European Charcot Foundation",
        journal: "Multiple Sclerosis Journal",
        year: 2024,
        scientificArea: "Neurologia",
        doi: "10.1177/1352458524110903",
        summary: "Un'analisi dettagliata sull'allenamento della forza e dell'equilibrio per combattere l'atrofia e la fatica nei pazienti affetti da Sclerosi Multipla recidivante-remittente.",
        keyTakeaways: [
            "L'allenamento deve svolgersi in un ambiente climatizzato per prevenire il fenomeno di Uhthoff (sensibilità al calore).",
            "Privilegiare macchine guidate rispetto ai pesi liberi per compensare eventuali deficit di equilibrio e coordinazione.",
            "Prevedere pause frequenti (rapporto lavoro-recupero 1:2) per gestire l'insorgenza della fatica neurologica."
        ],
        clinicalConditions: ["multiple_sclerosis"]
    },
    {
        id: "src_005",
        title: "Resistance Training for Older Adults: Position Statement",
        authors: "National Strength and Conditioning Association (NSCA)",
        journal: "Journal of Strength and Conditioning Research",
        year: 2022,
        scientificArea: "Geriatria",
        doi: "10.1519/JSC.0000000000003230",
        summary: "Dichiarazione ufficiale sull'efficacia dell'allenamento di forza ad alta intensità contro la sarcopenia, l'osteopenia e il declino funzionale nella popolazione anziana.",
        keyTakeaways: [
            "Carichi pari al 70-85% 1RM sono sicuri e necessari per promuovere la sintesi proteica e stimolare la densità minerale ossea.",
            "Includere una componente di potenza (velocità di esecuzione concentrica) per mantenere la reattività e prevenire le cadute.",
            "Fornire una fase iniziale estesa di apprendimento motorio per consolidare la tecnica."
        ],
        clinicalConditions: ["sarcopenia", "osteoporosis"]
    }
];
```

---

## 4. Guida all'Implementazione Passo-Passo (Blueprint)

### Passo 1: Aggiungere il Tab di Navigazione in `index.html`
Si deve inserire la nuova voce `"Libreria Fonti"` all'interno dell'elemento `<nav class="main-nav">` in `index.html`. 
```html
<!-- index.html (Modifica proposta) -->
<nav class="main-nav">
    <a href="#" class="nav-item" data-view="catalog">Catalogo</a>
    <a href="#" class="nav-item" data-view="wizard">Programmazione</a>
    <a href="#" class="nav-item" data-view="analysis">Data Analisi</a>
    <a href="#" class="nav-item" data-view="scientific_hub">Libreria Fonti</a> <!-- Nuovo Tab -->
    <a href="#" class="nav-item" data-view="favorites">Preferiti</a>
</nav>
```

### Passo 2: Creare il File di Gestione Interfaccia (`js/scientific-hub.js`)
Si propone di creare un file modulare `js/scientific-hub.js` ed includerlo in `index.html` prima di `js/app.js`. Questo file conterrà la logica per il filtraggio e il rendering della vista.

```javascript
/**
 * js/scientific-hub.js
 * Modulo per la gestione dello Scientific Hub
 */
(function () {
    'use strict';

    window.App = window.App || {};

    // Stato locale per la vista delle fonti
    const hubState = {
        filters: {
            search: '',
            area: 'all'
        }
    };

    /**
     * Inizializzatore principale della vista
     */
    window.App.renderScientificHub = function (filterContainerId, gridContainerId) {
        // Renderizza la barra dei filtri
        renderFilters(filterContainerId);
        
        // Prima esecuzione del rendering dell'elenco card
        updateCatalog(gridContainerId);
    };

    /**
     * Renderizza i filtri della Libreria Fonti
     */
    function renderFilters(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="filter-bar">
                <div class="search-group">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="source-filter-search" placeholder="Cerca studi, autori o patologie..." value="${hubState.filters.search}">
                </div>
                
                <div class="select-group">
                    <select id="source-filter-area">
                        <option value="all">Tutte le Aree Scientifiche</option>
                        <option value="Cardiologia">Cardiologia / Cardiovascolare</option>
                        <option value="Ortopedia">Ortopedia / Muscoloscheletrico</option>
                        <option value="Metabolico">Metabolico / Endocrino</option>
                        <option value="Neurologia">Neurologia</option>
                        <option value="Geriatria">Geriatria / Senior</option>
                        <option value="Performance">Fisiologia e Performance</option>
                    </select>
                </div>
            </div>
        `;

        // Gestione degli input ed eventi di filtraggio (Debounced per la ricerca)
        const searchInput = container.querySelector('#source-filter-search');
        const areaSelect = container.querySelector('#source-filter-area');

        areaSelect.value = hubState.filters.area;

        let debounceTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                hubState.filters.search = e.target.value;
                updateCatalog('sources-grid');
            }, 250);
        });

        areaSelect.addEventListener('change', (e) => {
            hubState.filters.area = e.target.value;
            updateCatalog('sources-grid');
        });
    }

    /**
     * Filtra e renderizza le card
     */
    async function updateCatalog(gridContainerId) {
        const grid = document.getElementById(gridContainerId);
        if (!grid) return;

        // Recupero del database mockup globale
        const allSources = window.App.scientificSources || [];
        
        // Algoritmo di filtraggio
        const filtered = allSources.filter(source => {
            const matchesArea = hubState.filters.area === 'all' || source.scientificArea === hubState.filters.area;
            
            const searchTerm = hubState.filters.search.toLowerCase();
            const matchesSearch = !searchTerm || 
                source.title.toLowerCase().includes(searchTerm) ||
                source.authors.toLowerCase().includes(searchTerm) ||
                source.journal.toLowerCase().includes(searchTerm) ||
                source.summary.toLowerCase().includes(searchTerm) ||
                source.keyTakeaways.some(t => t.toLowerCase().includes(searchTerm));
                
            return matchesArea && matchesSearch;
        });

        // Aggiorna il contatore dei risultati
        const counter = document.getElementById('sources-counter');
        if (counter) {
            const count = filtered.length;
            counter.innerHTML = `<strong>${count}</strong> ${count === 1 ? 'fonte disponibile' : 'fonti disponibili'}`;
        }

        // Renderizza
        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                    <div class="empty-state-title" style="font-size: 1.2rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">Nessuna fonte trovata</div>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Prova a modificare i termini di ricerca o la categoria.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(source => {
            const card = document.createElement('div');
            card.className = 'exercise-card source-card'; // Eredita lo stile delle card standard
            card.style.cursor = 'pointer';

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="card-tags" style="display: flex; gap: 0.5rem;">
                        <span class="tag primary">${source.scientificArea}</span>
                        <span class="tag secondary">${source.year}</span>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">${source.journal}</span>
                </div>
                <div class="card-body" style="margin-top: 0.75rem; flex-grow: 1; display: flex; flex-direction: column; gap: 0.5rem;">
                    <h3 style="font-size: 1.15rem; font-weight: 600; line-height: 1.3; color: var(--text-primary); margin: 0;">${source.title}</h3>
                    <p style="font-size: 0.82rem; color: var(--accent); font-weight: 500; margin: 0;">${source.authors}</p>
                    <p class="description" style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin: 0.5rem 0 0;">${source.summary}</p>
                </div>
                <div class="card-actions" style="margin-top: 1.25rem; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${source.doi ? `DOI: ${source.doi.substring(0, 15)}...` : ''}</span>
                    <button class="btn-text" style="color: var(--primary); font-weight: 600; font-size: 0.9rem; background: none; border: none; cursor: pointer;">Leggi evidenza →</button>
                </div>
            `;

            // Evento per l'apertura del dettaglio in un Modal
            card.addEventListener('click', () => {
                window.App.renderSourceDetail(source);
            });

            grid.appendChild(card);
        });
    }

    /**
     * Renderizza il modal dettagliato per la singola fonte
     */
    window.App.renderSourceDetail = function (source) {
        let doiLink = '';
        if (source.doi) {
            doiLink = `
                <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                    <strong>DOI:</strong> <a href="https://doi.org/${source.doi}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none;">${source.doi} ↗</a>
                </div>
            `;
        }

        const content = `
            <div class="exercise-detail-modal source-detail-modal">
                <div class="modal-hero" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 2rem; border-radius: var(--radius-md) var(--radius-md) 0 0; border-bottom: 1px solid var(--border);">
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <span class="tag primary">${source.scientificArea}</span>
                        <span class="tag secondary">${source.year}</span>
                    </div>
                    <h2 style="font-size: 1.6rem; color: var(--text-primary); line-height: 1.3; margin: 0 0 0.5rem;">${source.title}</h2>
                    <p style="color: var(--accent); font-weight: 600; font-size: 0.95rem; margin: 0;">${source.authors}</p>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0.25rem 0 0;">Rivista: <strong>${source.journal}</strong></p>
                    ${doiLink}
                </div>
                
                <div class="modal-scroll-content" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; max-height: calc(75vh - 200px); overflow-y: auto;">
                    <!-- Abstract / Riassunto -->
                    <section>
                        <h4 style="font-size: 1rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 700; letter-spacing: 0.05em;">Abstract & Contesto</h4>
                        <p style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.6; margin: 0;">${source.summary}</p>
                    </section>

                    <hr style="border: 0; border-top: 1px solid var(--border); margin: 0.5rem 0;">

                    <!-- Raccomandazioni Cliniche Principali -->
                    <section>
                        <h4 style="font-size: 1rem; text-transform: uppercase; color: #10b981; margin-bottom: 0.75rem; font-weight: 700; letter-spacing: 0.05em;">✅ Linee Guida Operative</h4>
                        <ul class="takeaway-list" style="padding-left: 1.25rem; color: var(--text-primary); margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                            ${source.keyTakeaways.map(takeaway => `
                                <li style="font-size: 0.95rem; line-height: 1.5; color: var(--text-primary);">
                                    ${takeaway}
                                </li>
                            `).join('')}
                        </ul>
                    </section>
                    
                    <!-- Patologie Associate in T7 Workout -->
                    ${source.clinicalConditions && source.clinicalConditions.length > 0 ? `
                        <hr style="border: 0; border-top: 1px solid var(--border); margin: 0.5rem 0;">
                        <section>
                            <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 700;">Patologie Correlate in T7</h4>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                ${source.clinicalConditions.map(condId => {
                                    // Risolve il nome della patologia clinica dal database globale
                                    const allConds = window.App.clinicalConditions || [];
                                    const match = allConds.find(c => c.id === condId);
                                    const name = match ? match.name : condId;
                                    return `<span class="tag secondary" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border);">${name}</span>`;
                                }).join('')}
                            </div>
                        </section>
                    ` : ''}
                </div>
            </div>
        `;
        window.App.openModal(content);
    };

})();
```

### Passo 3: Includere il Nuovo Script in `index.html`
Per caricare le funzioni e il dataset appena creati, occorre dichiarare i nuovi script in `index.html` prima dello script controller principale (`js/app.js`):
```html
<!-- index.html (Modifica proposta) -->
    <!-- Scripts -->
    <script src="js/data.js?v=pwa_v13"></script>
    <script src="js/sources-data.js?v=pwa_v13"></script> <!-- Nuovo file dati mockup -->
    ...
    <script src="js/ui.js?v=pwa_v13"></script>
    <script src="js/scientific-hub.js?v=pwa_v13"></script> <!-- Nuovo controller UI -->
    <script src="js/app.js?v=pwa_v13"></script>
```

### Passo 4: Integrare la Vista nel Router (`js/app.js`)
Nel file `js/app.js`, occorre estendere la funzione `renderView(viewName)` aggiungendo la gestione del caso `'scientific_hub'`:
```javascript
// js/app.js (Modifica proposta)
function renderView(viewName) {
    // ... pulizia grafici ...
    appContainer.innerHTML = ''; // Clear current view

    switch (viewName) {
        case 'catalog':
            // ...
            break;
            
        case 'scientific_hub':
            // Struttura Skeleton per lo Scientific Hub
            const hubWrapper = document.createElement('div');
            hubWrapper.innerHTML = `
                <div class="section-hero">
                    <div class="hero-content">
                        <span class="hero-label">Libreria Scientifica</span>
                        <h1 class="hero-title">Libreria Fonti</h1>
                        <p class="hero-subtitle">Linee guida, studi clinici e metanalisi per supportare la programmazione clinica e l'allenamento basato sulle evidenze.</p>
                        <div class="hero-meta">
                            <span class="meta-badge" id="sources-counter"><strong>...</strong> fonti disponibili</span>
                        </div>
                    </div>
                </div>
                <div id="sources-filter-container"></div>
                <div id="sources-grid" class="catalog-grid"></div>
            `;
            appContainer.appendChild(hubWrapper);

            // Inizializza i componenti e renderizza il catalogo delle fonti
            if (window.App.renderScientificHub) {
                window.App.renderScientificHub('sources-filter-container', 'sources-grid');
            } else {
                const grid = document.getElementById('sources-grid');
                if (grid) grid.innerHTML = '<p class="error-state">Errore: Modulo Scientific Hub non caricato.</p>';
            }
            break;
            
        // ... altri case ...
    }
}
```

---

## 5. Layout Mockup e Visualizzazione Responsiva (Figma/UI Concept)

La struttura visiva si adatta automaticamente all'interfaccia corrente ed eredita tutte le proprietà responsive e le transizioni animate del tema scuro premium:

1.  **L'Hero Banner (`.section-hero`)**:
    *   Sfondo scuro integrato con contorni sfumati.
    *   Un testo di introduzione (`.hero-subtitle`) a contrasto bilanciato con colore grigio chiaro (`var(--text-secondary)`).
    *   Un contatore dinamico (`#sources-counter`) evidenziato all'interno di un badge che mostra in tempo reale quante fonti corrispondono ai criteri attuali.

2.  **La Barra Filtri (`.filter-bar`)**:
    *   Larghezza piena con allineamento orizzontale flessibile (`flex-wrap: wrap`).
    *   Si adatta sui dispositivi mobili impilando l'input di ricerca e il menu a tendina verticalmente.
    *   Tutti gli input usano lo sfondo nero profondo (`--input-bg` -> `#0f172a`) e i bordi grigio-blu ardesia (`--border` -> `#334155`).

3.  **La Griglia delle Card (`.catalog-grid`)**:
    *   Utilizza CSS Grid responsivo:
        `display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem;`
    *   Su desktop (schermi ampi), si espande fino a 3 colonne affiancate.
    *   Su tablet, si adatta a 2 colonne.
    *   Su smartphone (larghezza < 768px), collassa a singola colonna per massimizzare la leggibilità del titolo e degli autori dello studio.

4.  **Le Card delle Fonti (`.exercise-card.source-card`)**:
    *   Ereditano le transizioni di sollevamento hover e i bordi luminosi al passaggio del mouse.
    *   Presentano due tag nell'angolo in alto a sinistra per identificare immediatamente l'area di specializzazione medica (colore primario blu) e l'anno di pubblicazione (colore neutro).
    *   Visualizzano un pulsante discreto posizionato in basso a destra (`Leggi evidenza →`) che risalta solo all'hover sulla card, stimolando l'interazione per aprire i dettagli completi del paper.
