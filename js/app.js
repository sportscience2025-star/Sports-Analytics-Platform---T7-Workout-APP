/**
 * Main Application Controller
 */

window.App = window.App || {};

// State
const state = {
    currentView: 'catalog',
    filters: {},
    exercises: [],
    programContext: {},
    analysisUI: null,
    currentProgram: null
};
window.App.state = state;
window.App.switchView = function(viewName) { return switchView(viewName); };

// DOM Elements
const appContainer = document.getElementById('app-container');
const navButtons = document.querySelectorAll('.nav-item');

// Initialization
async function init() {


    try {
        const stored = localStorage.getItem('t7_current_program');
        if (stored) state.currentProgram = JSON.parse(stored);
    } catch (_) {}

    // Initial Load
    state.exercises = await window.App.getExercises();
    renderView('catalog');

    // Initialize favorites badge
    if (typeof updateFavoritesBadge === 'function') {
        updateFavoritesBadge();
    }

    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    // Navigation (Desktop Header)
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            if (view) switchView(view);
        });
    });

    // Bottom Navigation (Mobile)
    const bottomNavBtns = document.querySelectorAll('.bottom-nav-item');
    bottomNavBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            if (view) switchView(view);
        });
    });

    // Modal Close
    const closeModalBtn = document.getElementById('modal-close');
    const modalBackdrop = document.getElementById('modal-backdrop');

    if (closeModalBtn) closeModalBtn.addEventListener('click', window.App.closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', (e) => {
        if (e.target.id === 'modal-backdrop') window.App.closeModal();
    });
}

// Navigation Logic
async function switchView(viewName) {
    state.currentView = viewName;

    // Update Top Nav UI (Desktop)
    navButtons.forEach(btn => {
        if (btn.dataset.view === viewName) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Update Bottom Nav UI (Mobile)
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        if (btn.dataset.view === viewName) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    renderView(viewName);
}


// Rendering Logic (Modular View Router)
function renderView(viewName) {
    // Teardown active view cleanup if present
    if (state.activeView && typeof state.activeView.cleanup === 'function') {
        try {
            state.activeView.cleanup(state);
        } catch (err) {
            console.warn(`[App] Error in cleanup for view ${viewName}:`, err);
        }
    }
    // Cleanup active Chart.js instances to prevent memory leaks
    if (state.analysisUI && typeof state.analysisUI.cleanup === 'function') {
        state.analysisUI.cleanup();
        state.analysisUI = null;
    }

    appContainer.innerHTML = ''; // Clear current view

    const viewModule = window.App.Views && window.App.Views[viewName];
    if (viewModule && typeof viewModule.render === 'function') {
        state.activeView = viewModule;
        viewModule.render(appContainer, state);
    } else {
        appContainer.innerHTML = `<h2>Errore 404</h2><p>Vista non trovata</p>`;
    }
}


// Modal Helpers
window.App.openModal = function (content) {
    const backdrop = document.getElementById('modal-backdrop');
    const body = document.getElementById('modal-body');
    body.innerHTML = content;
    backdrop.classList.remove('hidden');
};

window.App.closeModal = function () {
    document.getElementById('modal-backdrop').classList.add('hidden');
};

/**
 * UI wrapper for importAllData — triggered by file <input> change
 * @param {File} file
 */
window.App._handleImport = function (file) {
    if (!file) return;
    window.App.importAllData(file);
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    init().catch(err => {
        console.error('[App] Initialization failed:', err);
        if (appContainer) {
            appContainer.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:60vh;flex-direction:column;gap:1rem;">
                <span style="font-size:2rem;">⚠️</span>
                <h3 style="color:var(--text-primary);margin:0;">Errore di inizializzazione</h3>
                <p style="color:var(--text-secondary);margin:0;">Ricarica la pagina per riprovare.</p>
                <button onclick="location.reload()" style="padding:.5rem 1.25rem;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Ricarica</button>
            </div>`;
        }
    });
});
