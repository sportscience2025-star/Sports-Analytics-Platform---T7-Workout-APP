/**
 * UI Catalog — Exercise Grid, Detail View & Translation Helpers
 * Extracted from ui.js
 */
window.App = window.App || {};

const STAGGER_LIMIT = 8;

/**
 * Renderizza la griglia delle card degli esercizi nel catalogo
 * @param {Array<Object>} exercises - Lista degli esercizi da renderizzare
 * @returns {void}
 */
window.App.renderCatalog = function (exercises) {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return; // Guard clause

    grid.innerHTML = '';

    if (exercises.length === 0) {
        grid.innerHTML = `
            <div class="empty-state animate-fade-in" style="grid-column: 1 / -1; margin: 2rem 0;">
                <div class="empty-state-title" style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Nessun esercizio trovato</div>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">Prova a modificare i termini di ricerca o a resettare i filtri attivi.</p>
            </div>
        `;
        return;
    }

    exercises.forEach((ex, idx) => {
        if (!ex) return;
        const card = document.createElement('div');
        const staggerClass = `stagger-${(idx % STAGGER_LIMIT) + 1}`;
        card.className = `exercise-card animate-fade-in-up ${staggerClass}`;

        // Qualità allenata (solo testo, senza emoji decorative)
        const quality = ex.quality || 'N/A';
        const qualityClass = quality ? `quality-${quality.toLowerCase()}` : 'secondary';
        const exName = (window.escapeHTML ? window.escapeHTML(ex.name) : ex.name) || 'Esercizio';
        const exMuscle = (window.escapeHTML ? window.escapeHTML(ex.primaryMuscle) : ex.primaryMuscle) || 'Target non specificato';
        const exEquipment = (window.escapeHTML ? window.escapeHTML(translateEquipment(ex.equipment)) : translateEquipment(ex.equipment)) || 'Attrezzatura varia';
        const exLevel = translateLevel(ex.level);
        const exType = translateType(ex.type);
        const typeSlug = (ex.type || '').toLowerCase();
        const typeClass = typeSlug ? `tag--${typeSlug}` : '';
        const exDesc = (window.escapeHTML ? window.escapeHTML(ex.description) : ex.description) || 'Esercizio validato per programmazione atletica e clinica.';
        const exId = ex.id || '';

        // Micro-pill dei muscoli secondari (massimo 3)
        const secMuscles = Array.isArray(ex.secondaryMuscles) ? ex.secondaryMuscles.slice(0, 3) : [];
        const secMusclesHTML = secMuscles.length > 0
            ? `<div class="sec-muscles-wrap">${secMuscles.map(m => `<span class="sec-muscle-pill">${window.escapeHTML ? window.escapeHTML(m) : m}</span>`).join('')}</div>`
            : '';

        card.innerHTML = `
            <div class="card-header">
                <div class="card-tags">
                    <span class="tag tag--type ${typeClass}">${exType}</span>
                    <span class="tag ${qualityClass}">${quality}</span>
                    <span class="tag secondary">${exLevel}</span>
                </div>
                <button class="favorite-btn ${window.App.isFavorite(exId) ? 'active' : ''}" data-id="${exId}" title="Aggiungi ai preferiti">
                    ${window.App.isFavorite(exId) ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="card-body">
                <h3>${exName}</h3>
                <p class="muscle-target">${exMuscle}</p>
                ${secMusclesHTML}
                <p class="description">${exDesc}</p>
            </div>
            <div class="card-actions">
                <span class="tag chip--equipment">${exEquipment}</span>
                <button type="button" class="btn-card-action" title="Vedi dettagli esercizio"><span>Scheda</span><span class="action-arrow">→</span></button>
            </div>
        `;

        // Favorite button handler
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const exerciseId = e.currentTarget.dataset.id;
            const isNowFavorite = window.App.toggleFavorite(exerciseId);

            // Update button
            e.currentTarget.classList.toggle('active', isNowFavorite);
            e.currentTarget.textContent = isNowFavorite ? '❤️' : '🤍';

            // Update badge if exists
            if (typeof updateFavoritesBadge === 'function') {
                updateFavoritesBadge();
            }
        });

        // Card click handler (excluding favorite button)
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn')) {
                renderDetail(ex);
            }
        });

        grid.appendChild(card);
    });
};

/**
 * Renderizza la modale di dettaglio per un esercizio specifico
 * @param {Object} exercise - Dati dell'esercizio selezionato
 */
async function renderDetail(exercise) {
    window.App.renderDetail = renderDetail;
    if (!exercise) return;

    const exId = exercise.id || 'unknown';
    const exName = (window.escapeHTML ? window.escapeHTML(exercise.name) : exercise.name) || 'Dettaglio Esercizio';
    const exMuscle = (window.escapeHTML ? window.escapeHTML(exercise.primaryMuscle) : exercise.primaryMuscle) || 'Muscoli Principali';
    const exTagline = (window.escapeHTML ? window.escapeHTML(exercise.tagline) : exercise.tagline) || '';

    let content = `
        <div class="exercise-detail-modal">
            <!-- HERO SECTION with Media -->
            <div class="modal-hero">
                <div id="media-container-${exId}" class="modal-media-container">
                    <!-- Placeholder immediately visible (senza emoji) -->
                    <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background: radial-gradient(circle, #1e293b 0%, #0f172a 100%);">
                        <span style="font-size:1.15rem; font-weight:700; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.1em;">${exMuscle}</span>
                    </div>
                </div>
                
                <div class="hero-overlay">
                    <h2 style="font-size:2rem;">${exName}</h2>
                    <p style="color:rgba(255,255,255,0.8); font-size:0.95rem; margin:0;">${exTagline}</p>
                </div>
            </div>

            <!-- SCROLLABLE CONTENT -->
            <div class="modal-scroll-content">
                
                <!-- Unified Metadata Chips (senza emoji) -->
                <div class="chip-container">
                    <!-- Essential Tags -->
                    <span class="chip chip--primary">
                        ${translateType(exercise.type)}
                    </span>
                    <span class="chip">
                        ${translateEquipment(exercise.equipment)}
                    </span>
                    <span class="chip">
                        ${translateLevel(exercise.level)}
                    </span>
                    <span class="chip">
                        ${exercise.quality || 'N/A'}
                    </span>
                    <!-- Muscle Tags (Merged) -->
                    ${(exercise.muscles || []).map(m => `<span class="chip chip--muscle">${window.escapeHTML ? window.escapeHTML(m) : m}</span>`).join('')}
                </div>

                ${(exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0) ? `
                <!-- Secondary Muscles Involved -->
                <div class="detail-sec-muscles" style="margin: 1.25rem 0 0.5rem 0;">
                    <h5 style="color:var(--text-secondary); font-size:0.82rem; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.4rem; font-weight:700;">Muscoli Secondari Coinvolti</h5>
                    <div class="chip-container">
                        ${exercise.secondaryMuscles.map(m => `<span class="chip chip--secondary-muscle">${window.escapeHTML ? window.escapeHTML(m) : m}</span>`).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Execution Section -->
                <section class="execution-section">
                    <h3 class="detail-section-title">
                        Come Eseguire
                    </h3>
                    
                    ${exercise.execution ? `
                        <!-- 1. Context -->
                        <div class="exec-context" style="margin-bottom:1.5rem; color:var(--text-secondary); line-height:1.6; font-size:0.95rem;">
                            ${exercise.execution.context || exercise.description || 'Esegui il movimento in modo controllato prestando attenzione alla corretta tecnica e respirazione.'}
                        </div>

                        <!-- 2. Setup -->
                        ${exercise.execution.setup ? `
                        <div class="exec-block">
                            <h5 style="color:var(--primary); margin-bottom:0.5rem;">Setup Iniziale</h5>
                            <ul class="setup-list" style="padding-left:1.25rem; color:var(--text-primary); margin-bottom:1.5rem;">
                                ${exercise.execution.setup.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>` : ''}

                        <!-- 3. Steps -->
                        <div class="exec-block">
                            <h5 style="color:var(--primary); margin-bottom:0.5rem;">Esecuzione</h5>
                            <ul class="step-list">
                                ${(exercise.execution.steps || []).map((step, idx) => `
                                    <li class="step-item">
                                        <span class="step-number">${idx + 1}</span>
                                        <span class="step-text">${step}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <!-- 4. Cues -->
                        ${exercise.execution.cues ? `
                        <div class="exec-block" style="background:rgba(59,130,246,0.1); padding:1rem; border-radius:var(--radius-sm); border-left:3px solid var(--accent); margin:1.5rem 0;">
                            <h5 style="color:var(--accent); margin-top:0; margin-bottom:0.5rem;">Cue Tecnici</h5>
                            <ul style="margin:0; padding-left:1.25rem;">
                                ${exercise.execution.cues.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>` : ''}

                        <!-- 5. Criteria -->
                        ${exercise.execution.criteria ? `
                        <div class="exec-block">
                            <h5 style="color:#10b981; margin-bottom:0.5rem;">Criteri di Validità</h5>
                            <ul style="padding-left:1.25rem; color:var(--text-secondary);">
                                ${exercise.execution.criteria.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>` : ''}

                    ` : `<div class="bio-box" style="color:var(--text-secondary); line-height:1.6; font-size:0.95rem;">${exercise.description || 'Nessuna descrizione dettagliata disponibile per questo esercizio. Assicurati di mantenere una postura corretta e movimenti controllati.'}</div>`}
                </section>

                <hr style="border:0; border-top:1px solid var(--border); margin: 2rem 0;">

                <!-- Errors Section -->
                <section class="errors-section">
                    <h3 class="detail-section-title" style="color: var(--danger, #ef4444);">
                        Errori Comuni da Evitare
                    </h3>
                    
                    <div class="error-grid">
                        ${(exercise.errors || []).map(err => {
                            const isObj = typeof err === 'object' && err !== null;
                            const title = isObj ? (err.error || 'Errore') : (err || 'Errore');
                            const why = isObj ? err.why : '';
                            const fix = isObj ? err.fix : '';

                            return `
                                <div class="error-card">
                                    <h5 class="error-title">${window.escapeHTML ? window.escapeHTML(title) : title}</h5>
                                    ${why ? `
                                        <div class="error-detail-block error-why">
                                            <span class="error-label">Perché:</span>
                                            <p>${window.escapeHTML ? window.escapeHTML(why) : why}</p>
                                        </div>` : ''}
                                    ${fix ? `
                                        <div class="error-detail-block error-fix">
                                            <span class="error-label">Correzione:</span>
                                            <p>${window.escapeHTML ? window.escapeHTML(fix) : fix}</p>
                                        </div>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </section>

                ${(exercise.variants && exercise.variants.length > 0) ? `
                <hr style="border:0; border-top:1px solid var(--border); margin: 2rem 0;">

                <!-- Variants Section -->
                <section class="variants-section">
                    <h3 class="detail-section-title">
                        Varianti Correlate
                    </h3>
                    <div class="variants-container">
                        ${exercise.variants.map(v => `
                            <span class="chip chip--variant clickable-variant" data-variant="${window.escapeHTML ? window.escapeHTML(v) : v}">${window.escapeHTML ? window.escapeHTML(v) : v}</span>
                        `).join('')}
                    </div>
                </section>
                ` : ''}
            </div>
        </div>
    `;
    window.App.openModal(content);

    // Setup interactive variant navigation
    const modalEl = document.querySelector('.exercise-detail-modal');
    if (modalEl) {
        modalEl.querySelectorAll('.clickable-variant').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const varName = (e.currentTarget.dataset.variant || '').toLowerCase().trim();
                const matched = (window.App.exercises || []).find(x => x && x.name && x.name.toLowerCase().trim() === varName);
                if (matched) {
                    renderDetail(matched);
                }
            });
        });
    }

    // 2. Fetch Media (Async)
    try {
        const media = await window.App.getExerciseMedia(exercise.name);
        const mediaContainer = document.getElementById(`media-container-${exercise.id}`);

        // Only override the thematic hero if we have a REAL video or a specific non-placeholder image
        // Since getExerciseMedia currently returns a placeholder poster by default, we block it unless there's a video.
        if (mediaContainer && media.videoUrl) {
            mediaContainer.innerHTML = `
                <video src="${media.videoUrl}" poster="${media.poster}" controls style="width:100%; height:100%; object-fit:cover; border-radius: var(--radius-md);"></video>
            `;
        }
        // Note: If we had real images (not generic placeholders), we would check for them here.
        // For now, the CSS Hero with the Icon is better than the text-based placeholder.
    } catch (err) {
        console.error('Media load failed', err);
    }
}
window.App.renderDetail = renderDetail;

// Helpers
/**
 * Determina la classe badge CSS in base al livello di esperienza
 * @param {string} level - Livello (Beginner, Intermediate, Advanced)
 * @returns {string} Classe CSS associata
 */
function getLevelClass(level) {
    if (!level) return 'badge-gray';
    switch (String(level).toLowerCase()) {
        case 'beginner': return 'badge-green';
        case 'intermediate': return 'badge-yellow';
        case 'advanced': return 'badge-red';
        default: return 'badge-gray';
    }
}

/**
 * Traduce il livello di esperienza dall'inglese all'italiano
 * @param {string} level - Livello in lingua originale
 * @returns {string} Livello tradotto in italiano
 */
function translateLevel(level) {
    if (!level) return 'Non specificato';
    const map = { 'Beginner': 'Principiante', 'Intermediate': 'Intermedio', 'Advanced': 'Avanzato' };
    return map[level] || level;
}

/**
 * Traduce la tipologia di esercizio in italiano
 * @param {string} type - Tipo esercizio in lingua originale
 * @returns {string} Tipo tradotto
 */
function translateType(type) {
    if (!type) return 'Generale';
    const map = { 'Compound': 'Multiarticolare', 'Isolation': 'Isolamento', 'Isometric': 'Isometrico' };
    return map[type] || type;
}

/**
 * Traduce il tipo di attrezzatura in italiano
 * @param {string} eq - Attrezzatura in lingua originale
 * @returns {string} Attrezzatura tradotta
 */
function translateEquipment(eq) {
    if (!eq) return 'Corpo Libero';
    const map = { 'Bodyweight': 'Corpo Libero', 'Barbell': 'Bilanciere', 'Dumbbell': 'Manubri', 'Machine': 'Macchina', 'Cable': 'Cavi' };
    return map[eq] || eq;
}
