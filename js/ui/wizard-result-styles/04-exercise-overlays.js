/**
 * js/ui/wizard-result-styles/04-exercise-overlays.js
 * ═══════════════════════════════════════════════════════════════════
 * Stili CSS Report Risultato: Overlays, Menu Contestuale e Modali.
 * Registra il frammento CSS in window.App.ResultStyles.chunks.
 *
 * Sezioni contenute:
 *   - .ex-context-menu (Menu contestuale esercizio)
 *   - .swap-panel-overlay & .swap-panel-box (Pannello swap con AI suggestions e ricerca)
 *   - .edit-modal-overlay & .edit-modal-box (Modal modifica specifiche)
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};
    window.App.ResultStyles = window.App.ResultStyles || {};
    window.App.ResultStyles.chunks = window.App.ResultStyles.chunks || {};

    const CHUNK_KEY = 'exerciseOverlays';

    window.App.ResultStyles.chunks[CHUNK_KEY] = 
            /* ── Miglioramento 6: Menu Contestuale Esercizio ── */
            .ex-context-menu {
                position: fixed;
                z-index: 1050;
                background: #1e293b;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 10px;
                padding: 0.4rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
                display: flex;
                flex-direction: column;
                min-width: 170px;
                animation: fadeInMenu 0.15s ease;
            }
            .ex-context-menu.hidden {
                display: none;
            }
            @keyframes fadeInMenu {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .ecm-item {
                background: transparent;
                border: none;
                color: var(--text-primary, #f8fafc);
                padding: 0.6rem 0.85rem;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.6rem;
                cursor: pointer;
                transition: background 0.15s ease;
                text-align: left;
                width: 100%;
                font-family: inherit;
            }
            .ecm-item:hover {
                background: rgba(255, 255, 255, 0.08);
            }
            .ecm-item.ecm-swap {
                color: #38bdf8;
            }
            .ecm-item.ecm-swap:hover {
                background: rgba(56, 189, 248, 0.12);
            }
            .ecm-item.ecm-danger {
                color: #f87171;
            }
            .ecm-item.ecm-danger:hover {
                background: rgba(239, 68, 68, 0.15);
            }
            .ecm-divider {
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 0.3rem 0;
            }

            /* ── Miglioramento 7 & 8: Pannello Swap Modale ── */
            .swap-panel-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                z-index: 1100;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }
            .swap-panel-overlay.hidden {
                display: none;
            }
            .swap-panel-box {
                background: #1e293b;
                border: 1px solid var(--border, rgba(255,255,255,0.15));
                border-radius: 16px;
                width: 100%;
                max-width: 580px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
                overflow: hidden;
            }
            .sp-header {
                padding: 1.25rem 1.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
            }
            .sp-header h3 {
                font-size: 1.2rem;
                font-weight: 700;
                color: var(--text-primary, #f8fafc);
                margin: 0;
            }
            .sp-close {
                background: transparent;
                border: none;
                color: var(--text-muted, #64748b);
                font-size: 1.6rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                transition: color 0.15s ease;
            }
            .sp-close:hover {
                color: #fff;
            }
            .sp-current {
                padding: 0.85rem 1.5rem;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
            }
            .sp-label {
                color: var(--text-secondary, #94a3b8);
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .sp-body-scroll {
                padding: 1.25rem 1.5rem;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }
            .sp-ai-section {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            .sp-ai-badge {
                background: rgba(99, 102, 241, 0.15);
                color: #818cf8;
                font-size: 0.75rem;
                font-weight: 700;
                padding: 3px 8px;
                border-radius: 4px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                display: inline-block;
            }
            .sp-ai-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .sp-ai-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(99, 102, 241, 0.2);
                padding: 0.75rem 1rem;
                border-radius: 10px;
                transition: border-color 0.15s ease;
            }
            .sp-ai-item:hover {
                border-color: rgba(99, 102, 241, 0.4);
                background: rgba(99, 102, 241, 0.05);
            }
            .sp-ai-item-name {
                font-size: 0.92rem;
                font-weight: 600;
                color: var(--text-primary, #f8fafc);
            }
            .sp-ai-item-reason {
                font-size: 0.78rem;
                color: var(--text-secondary, #94a3b8);
                margin-top: 0.2rem;
            }
            .sp-select-btn {
                background: var(--primary, #6366f1);
                color: #fff;
                border: none;
                border-radius: 6px;
                padding: 0.45rem 0.9rem;
                font-size: 0.82rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s ease;
                white-space: nowrap;
            }
            .sp-select-btn:hover {
                background: #4f46e5;
            }
            .sp-search-section {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                border-top: 1px solid var(--border, rgba(255,255,255,0.1));
                padding-top: 1.25rem;
            }
            .sp-search-input {
                width: 100%;
                background: rgba(0, 0, 0, 0.25);
                border: 1px solid var(--border, rgba(255,255,255,0.15));
                border-radius: 8px;
                padding: 0.75rem 1rem;
                color: var(--text-primary, #f8fafc);
                font-size: 0.9rem;
                font-family: inherit;
                box-sizing: border-box;
            }
            .sp-search-input:focus {
                border-color: var(--primary, #6366f1);
                outline: none;
            }
            .sp-search-results {
                display: flex;
                flex-direction: column;
                gap: 0.4rem;
                max-height: 180px;
                overflow-y: auto;
            }
            .sp-search-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.04);
                padding: 0.6rem 0.85rem;
                border-radius: 8px;
                transition: background 0.15s ease;
            }
            .sp-search-item:hover {
                background: rgba(255, 255, 255, 0.06);
            }
            .sp-search-item-info {
                display: flex;
                flex-direction: column;
            }
            .sp-search-item-name {
                font-size: 0.88rem;
                font-weight: 500;
                color: var(--text-primary, #f8fafc);
            }
            .sp-search-item-sub {
                font-size: 0.75rem;
                color: var(--text-muted, #64748b);
            }

            /* ── Modal Modifica Specifiche Esercizio ── */
            .edit-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                z-index: 1100;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }
            .edit-modal-overlay.hidden {
                display: none;
            }
            .edit-modal-box {
                background: #1e293b;
                border: 1px solid var(--border, rgba(255,255,255,0.15));
                border-radius: 16px;
                width: 100%;
                max-width: 480px;
                padding: 1.75rem;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
            }
            .edit-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }
            .edit-modal-header h3 {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--text-primary, #f8fafc);
                margin: 0;
            }
            .edit-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            .edit-field {
                display: flex;
                flex-direction: column;
                gap: 0.35rem;
            }
            .edit-field label {
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--text-secondary, #94a3b8);
            }
            .edit-field input {
                background: rgba(0, 0, 0, 0.25);
                border: 1px solid var(--border, rgba(255,255,255,0.15));
                border-radius: 8px;
                padding: 0.6rem 0.8rem;
                color: var(--text-primary, #f8fafc);
                font-size: 0.9rem;
                font-family: inherit;
            }
            .edit-field input:focus {
                border-color: var(--primary, #6366f1);
                outline: none;
            }
            .edit-modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 0.75rem;
            }
            .btn-cancel-edit {
                background: transparent;
                border: 1px solid var(--border, rgba(255,255,255,0.15));
                color: var(--text-secondary, #94a3b8);
                border-radius: 8px;
                padding: 0.6rem 1.2rem;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
            }
            .btn-save-edit {
                background: var(--primary, #6366f1);
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: 0.6rem 1.4rem;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
            }

    ;
})();
