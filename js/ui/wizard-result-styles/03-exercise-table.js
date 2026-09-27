/**
 * js/ui/wizard-result-styles/03-exercise-table.js
 * ═══════════════════════════════════════════════════════════════════
 * Stili CSS Report Risultato: Tabella Interattiva Esercizi Desktop.
 * Registra il frammento CSS in window.App.ResultStyles.chunks.
 *
 * Sezioni contenute:
 *   - .ex-table-wrapper & .ex-interactive-table (Tabella desktop)
 *   - .ex-row-interactive (Righe, hover, stati adattati clinici)
 *   - .ex-name-btn, .adapted-badge, .cell-highlight, .ex-inline-note, .ex-action-btn
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};
    window.App.ResultStyles = window.App.ResultStyles || {};
    window.App.ResultStyles.chunks = window.App.ResultStyles.chunks || {};

    const CHUNK_KEY = 'exerciseTable';

    window.App.ResultStyles.chunks[CHUNK_KEY] = 
            /* ── Miglioramento 5: Tabella Interattiva Esercizi Principali ── */
            .ex-table-wrapper {
                width: 100%;
                overflow-x: auto;
                border-radius: 10px;
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                background: rgba(0, 0, 0, 0.2);
            }
            .ex-interactive-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
                font-size: 0.9rem;
            }
            .ex-interactive-table th {
                padding: 0.85rem 1rem;
                background: rgba(255, 255, 255, 0.03);
                color: var(--text-secondary, #94a3b8);
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
                font-size: 0.78rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                white-space: nowrap;
            }
            .ex-interactive-table th.col-actions {
                width: 44px;
                text-align: center;
                padding-right: 0.75rem;
            }
            .ex-row-interactive {
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                transition: background 0.15s ease;
            }
            .ex-row-interactive:last-child {
                border-bottom: none;
            }
            .ex-row-interactive:hover {
                background: rgba(255, 255, 255, 0.03);
            }
            .ex-row-interactive.is-adapted {
                background: rgba(245, 158, 11, 0.04);
            }
            .ex-row-interactive.is-adapted:hover {
                background: rgba(245, 158, 11, 0.07);
            }
            .ex-interactive-table td {
                padding: 0.85rem 1rem;
                color: var(--text-primary, #f8fafc);
                vertical-align: middle;
            }
            .ex-cell-name {
                min-width: 180px;
            }
            .ex-name-btn {
                background: transparent;
                border: none;
                color: var(--text-primary, #f8fafc);
                font-family: inherit;
                font-size: 0.92rem;
                font-weight: 600;
                cursor: pointer;
                padding: 0;
                text-align: left;
                transition: color 0.15s ease;
            }
            .ex-name-btn:hover {
                color: var(--primary, #6366f1);
                text-decoration: underline;
            }
            .adapted-badge {
                display: inline-block;
                background: rgba(245, 158, 11, 0.15);
                color: #fbbf24;
                font-size: 0.65rem;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 4px;
                margin-left: 0.5rem;
                letter-spacing: 0.04em;
                vertical-align: middle;
            }
            .cell-highlight {
                color: var(--accent, #10b981);
                font-weight: 700;
            }
            .ex-inline-note {
                font-size: 0.76rem;
                color: #f59e0b;
                margin-top: 0.25rem;
                line-height: 1.35;
            }
            .ex-action-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                color: var(--text-secondary, #94a3b8);
                width: 30px;
                height: 30px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .ex-action-btn:hover {
                color: #fff;
                background: var(--primary, #6366f1);
                border-color: var(--primary, #6366f1);
            }

    ;
})();
