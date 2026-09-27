# Analisi e Piano di Implementazione - Caching RAG, Progress Bar Fallback e Refactoring Dev Mode

## Introduzione
Questo documento definisce il piano di implementazione dettagliato per i tre compiti richiesti riguardanti il motore RAG (Retrieval-Augmented Generation) dell'applicazione T7 Workout PWA. L'obiettivo è migliorare l'affidabilità su protocollo locale `file://`, prevenire i blocchi all'85% mostrando il progresso reale dello scaricamento del modello tramite fallback, e ottimizzare il toggling della modalità "Vista Avanzata" (Developer Mode) via CSS per evitare cicli di re-rendering costosi e preservare lo stato della UI.

---

## 1. Task 1: Disabilitazione della Cache Browser su Protocollo Locale 'file://'

### Obiettivo
Quando l'applicazione viene eseguita tramite protocollo locale `file://`, l'accesso alle API di Cache del browser può causare eccezioni bloccanti dovute alle restrizioni di sicurezza del browser. Occorre impostare `tf.env.useBrowserCache = false` all'interno dell'ambiente Transformers.js quando viene rilevato il protocollo `file://`.

### File Target
- `js/rag-engine.js` (intorno alla riga 324, all'interno del metodo `initFallbackEngine()`).

### Analisi e Linee Target
Nel metodo `initFallbackEngine()`, la libreria Transformers.js viene caricata dinamicamente dal CDN. Le impostazioni dell'ambiente (`tf.env`) vengono configurate subito dopo il caricamento:

```javascript
// Codice attuale (rag-engine.js:324-326)
if (tf && tf.env) {
    tf.env.allowLocalModels = false;
}
```

### Proposta di Modifica
Modificare la configurazione di `tf.env` per verificare il protocollo attivo e disabilitare `useBrowserCache` se il protocollo è `file:`:

```javascript
// Codice proposto (rag-engine.js:324-331)
if (tf && tf.env) {
    tf.env.allowLocalModels = false;
    const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
    if (isFileProtocol) {
        tf.env.useBrowserCache = false;
        console.log("[RAG Engine] Cache browser disabilitata su protocollo file://");
    }
}
```

---

## 2. Task 2: Progress Bar e Aggiornamenti dello Stato di Scaricamento Modello

### Obiettivo
Durante il caricamento di un documento su protocollo `file://` (fallback), la UI si blocca all'85% ("Salvataggio nel database locale...") mentre scarica silenziosamente il modello ONNX (~90MB). È necessario catturare la callback `progress_callback` di Transformers.js e inviare gli aggiornamenti di progresso reale alla UI di `js/rag-ui.js`.

### File Target
- `js/rag-engine.js` (costruttore della classe `RAGEngineClass` e metodo `initFallbackEngine()`).
- `js/rag-ui.js` (metodo `processNextFile()`).

### Proposta di Modifica (RAG Engine)
Aggiungere una callback di progresso registrabile nel motore:

```javascript
// 1. Aggiungere la variabile nel costruttore (rag-engine.js:225)
constructor(workerPath = 'js/rag-worker.js') {
    // ... variabili esistenti
    this.modelProgressCallback = null;
}

// 2. Passare la callback a pipeline() in initFallbackEngine() (rag-engine.js:333)
this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    progress_callback: (data) => {
        if (typeof this.modelProgressCallback === 'function') {
            this.modelProgressCallback(data);
        }
    }
});
```

### Proposta di Modifica (RAG UI)
Nel metodo `processNextFile()` di `js/rag-ui.js`, prima di chiamare `addDocument`, registriamo la callback per intercettare il progresso dello scaricamento dei file del modello e scalare la percentuale complessiva dall'85% al 95%:

```javascript
// Codice proposto prima di addDocument in processNextFile() (rag-ui.js:385)
if (window.RAGEngine) {
    window.RAGEngine.modelProgressCallback = (data) => {
        if (data.status === 'downloading') {
            const file = data.file || '';
            const progress = typeof data.progress === 'number' ? Math.round(data.progress) : 0;
            const isDev = wrapper.classList.contains('dev-mode-active');
            
            const msg = isDev
                ? `Download modello: ${file} (${progress}%)`
                : `Scaricamento componenti AI locali... (${progress}%)`;
            
            // Scala il progresso dal 85% al 95% della barra complessiva
            const scaledProgress = Math.min(95, Math.round(85 + (progress * 0.1)));
            updateProgress(scaledProgress, msg);
            
            addLog(`Scaricamento file modello (${file}): ${progress}%`);
        } else if (data.status === 'done') {
            addLog(`Scaricamento completato per: ${data.file || ''}`);
        } else if (data.status === 'ready') {
            addLog(`Modello caricato correttamente.`);
        }
    };
}

// Chiamata originale (rag-ui.js:387)
await window.RAGEngine.addDocument(file.name, fileType, arrayBuffer);

// Pulizia della callback nel blocco finally di processNextFile() (rag-ui.js:401)
if (window.RAGEngine) {
    window.RAGEngine.modelProgressCallback = null;
}
```

---

## 3. Task 3: Refactoring del Toggle della Vista Avanzata (Developer Mode) via CSS

### Obiettivo
Attualmente, il cambio di stato `this.state.devMode` invoca `await this.render()`, provocando il re-rendering completo dell'interfaccia e la perdita di stato dei moduli attivi (es: input di ricerca, stato di avanzamento).
Il refactoring prevede:
- Toggling di una classe `.dev-mode-active` sull'elemento contenitore principale `.rag-ui-wrapper`.
- Utilizzo di classi CSS utility (`.dev-only` e `.user-only`) per mostrare/nascondere dinamicamente i metadati e i log.
- Mantenimento dello stato di avanzamento testuale corretto e reattivo mid-upload.

### File Target
- `js/rag-ui.js`
- `css/style.css`

### Proposta di Modifica (RAG UI - Preservazione dello Stato e Rendering)
1. Modificare il costruttore di `RAGUI` per tenere traccia dello step attuale:
```javascript
constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.uploadQueue = [];
    this.isProcessing = false;
    this.state = {
        devMode: false
    };
    this.currentStepKey = 'init';
}
```

2. Nella renderizzazione iniziale (`render()`), inserire la classe dinamica e rimuovere il rendering completo dall'event listener del toggle:
```javascript
// Render iniziale con classe condizionale (rag-ui.js:21)
this.container.innerHTML = `
    <div class="rag-ui-wrapper ${this.state.devMode ? 'dev-mode-active' : ''}">
    ...
`;

// Gestione dell'evento toggle (rag-ui.js:112-118)
const devToggle = this.container.querySelector('#rag-dev-toggle');
const wrapper = this.container.querySelector('.rag-ui-wrapper');
if (devToggle && wrapper) {
    devToggle.addEventListener('change', (e) => {
        this.state.devMode = e.target.checked;
        if (this.state.devMode) {
            wrapper.classList.add('dev-mode-active');
        } else {
            wrapper.classList.remove('dev-mode-active');
        }
        
        // Aggiorna dinamicamente il testo della progress bar se in esecuzione
        const statusTextEl = this.container.querySelector('#upload-status-text');
        if (this.isProcessing && statusTextEl && this.currentStepKey) {
            statusTextEl.textContent = this.getStepText ? this.getStepText(this.currentStepKey) : '';
        }
    });
}
```

3. Modificare la logica di avanzamento in `processNextFile()` per eliminare le chiamate a `this.state.devMode` sul testo statico ed esporre `getStepText`:
```javascript
// All'inizio di processNextFile() (rag-ui.js:315)
this.currentStepKey = 'init';
const stepsDev = {
    init: 'Caricamento file...',
    read: 'Lettura file...',
    extract: 'Estrazione testo in corso...',
    embed: 'Generazione vettori di embedding locali...',
    save: 'Salvataggio nel database locale...',
    done: 'Completato con successo!'
};
const stepsUser = {
    init: 'Caricamento del documento...',
    read: 'Lettura del documento in corso...',
    extract: 'Analisi del testo e delle tabelle...',
    embed: 'Configurazione assistente personalizzato...',
    save: 'Archiviazione sicura sul dispositivo...',
    done: 'Documento indicizzato con successo!'
};

this.getStepText = (stepKey) => {
    const wrap = this.container.querySelector('.rag-ui-wrapper');
    const isDev = wrap && wrap.classList.contains('dev-mode-active');
    return isDev ? stepsDev[stepKey] : stepsUser[stepKey];
};

statusText.textContent = this.getStepText('init');

if (logsEl) {
    logsEl.innerHTML = '';
    // Nota: la visibilità è interamente gestita via CSS tramite la classe .dev-progress-logs
}

const addLog = (msg) => {
    if (logsEl) {
        const time = new Date().toLocaleTimeString('it-IT');
        logsEl.innerHTML += `<div>[${time}] ${msg}</div>`;
        logsEl.scrollTop = logsEl.scrollHeight;
    }
};

const updateProgress = (pct, stepKeyOrText) => {
    percentageEl.textContent = `${pct}%`;
    progressBar.style.width = `${pct}%`;
    if (stepKeyOrText) {
        if (stepsDev[stepKeyOrText] || stepsUser[stepKeyOrText]) {
            this.currentStepKey = stepKeyOrText;
            statusText.textContent = this.getStepText(stepKeyOrText);
        } else {
            statusText.textContent = stepKeyOrText;
        }
    }
};
```

4. Aggiornare i punti di rendering dei badge e metadati per includere entrambi gli stati contemporaneamente, filtrati via CSS:

- **Badge di Ricerca Semantica** (`setupSearch()`, rag-ui.js:180-208):
```javascript
const scoreVal = typeof chunk.score === 'number' ? chunk.score : 0;
let relevanceClass = 'relevance-low';
let relevanceLabel = 'Rilevanza Bassa';
if (scoreVal >= 0.8) {
    relevanceClass = 'relevance-high';
    relevanceLabel = 'Rilevanza Alta';
} else if (scoreVal >= 0.65) {
    relevanceClass = 'relevance-medium';
    relevanceLabel = 'Rilevanza Media';
}

const scoreBadge = `
    <span class="chunk-score dev-only">${score}</span>
    <span class="relevance-badge ${relevanceClass} user-only">${relevanceLabel}</span>
`;
```

- **Metadati Documenti Caricati** (`loadDocuments()`, rag-ui.js:254-256):
```javascript
const metaText = `
    <span class="dev-only">${fileType} • ${chunkCount} frammenti • Caricato il ${dateStr}</span>
    <span class="user-only">${fileType} • Pronto • Caricato il ${dateStr}</span>
`;
```

### Proposta di Modifica (CSS - style.css)
Aggiungere le regole di visualizzazione basate sul toggle `.dev-mode-active` ed impostare una classe utility `.hidden` generale se non presente:

```css
/* Definizione utility hidden generale */
.hidden {
    display: none !important;
}

/* Regole per la Vista Avanzata / Developer Mode */
.rag-ui-wrapper .dev-only {
    display: none !important;
}

.rag-ui-wrapper.dev-mode-active .dev-only {
    display: inline-block !important;
}

.rag-ui-wrapper.dev-mode-active .user-only {
    display: none !important;
}

.rag-ui-wrapper .user-only {
    display: inline-block !important;
}

/* Modifica stile console log per nasconderla di default e mostrarla come flex */
.dev-progress-logs {
    display: none !important; /* Copre la riga 3910 originale */
    margin-top: 0.75rem;
    padding: 0.6rem 0.8rem;
    background-color: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-sm);
    font-family: monospace;
    font-size: 0.75rem;
    color: var(--accent);
    max-height: 120px;
    overflow-y: auto;
    flex-direction: column;
    gap: 0.25rem;
}

.rag-ui-wrapper.dev-mode-active .dev-progress-logs {
    display: flex !important;
}
```

---

## 4. Cache Invalidation (Service Worker Bump)

Ogni modifica a file JavaScript o CSS richiede l'invalidazione della cache tramite l'incremento della versione nel Service Worker:

- **File**: `sw.js` (linea 6)
- **Operazione**: Cambiare `const CACHE_NAME = 't7-workout-v40';` in `const CACHE_NAME = 't7-workout-v41';`.

---

## 5. Metodo di Verifica Indipendente

1. **Validazione Sintattica**:
   Eseguire lo script di verifica sintattica del progetto:
   `py test_check.py`
   Verificare che restituisca `"All syntax checks passed."`.

2. **Verifica Manuale su file://**:
   - Aprire `index.html` direttamente nel browser Chrome o Edge usando il protocollo locale (`file:///path/to/index.html`).
   - Accedere alla tab **RAG**.
   - Caricare un file di test supportato (es. `.txt` o `.pdf`).
   - Verificare che all'85% appaia lo stato `"Scaricamento componenti AI locali..."` con il reale progresso percentuale di download del file del modello.
   - Aprire la console del browser per assicurarsi che non vengano sollevati errori legati a `Cache API` (grazie a `useBrowserCache = false`).
   - Attivare e disattivare la "Vista Avanzata" per testare che la visibilità dei metadati del documento e dei log cambi all'istante senza ricaricare la pagina o azzerare l'avanzamento.
