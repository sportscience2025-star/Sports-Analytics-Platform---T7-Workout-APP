/**
 * js/ui/wizard-result-styles/06-responsive.js
 * ═══════════════════════════════════════════════════════════════════
 * Stili CSS Report Risultato: Media Queries e Adattamento Mobile.
 * Registra il frammento CSS in window.App.ResultStyles.chunks.
 *
 * Sezioni contenute:
 *   - @media (max-width: 768px) (Layout compatto mobile)
 *   - Card-view mobile per tabella esercizi e tabella timeline
 *   - Adattamento responsive header, rationale e azioni
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};
    window.App.ResultStyles = window.App.ResultStyles || {};
    window.App.ResultStyles.chunks = window.App.ResultStyles.chunks || {};

    const CHUNK_KEY = 'responsive';

    window.App.ResultStyles.chunks[CHUNK_KEY] = 
            /* ── Media Queries Responsive (Mobile) ── */
            @media (max-width: 768px) {
                .program-result-v3 {
                    padding: 1.25rem;
                    margin: 1rem 0;
                    border-radius: 12px;
                }
                .report-header-v3 {
                    flex-direction: column;
                    gap: 1rem;
                }
                .rc-grid {
                    grid-template-columns: 1fr;
                    gap: 0.75rem;
                }
                .prog-table thead {
                    display: none;
                }
                .prog-table tbody {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .prog-table tr {
                    display: flex;
                    flex-direction: column;
                    border: 1px solid var(--border, rgba(255,255,255,0.1));
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    background: rgba(15, 23, 42, 0.4);
                }
                .prog-table td {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border: none;
                    padding: 0.3rem 0;
                    font-size: 0.88rem;
                }
                .prog-table td::before {
                    content: attr(data-label);
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    color: var(--text-secondary, #94a3b8);
                    font-weight: 600;
                    margin-right: 1rem;
                    flex-shrink: 0;
                }

                /* Mobile Card view per tabella interattiva esercizi */
                .ex-interactive-table thead {
                    display: none;
                }
                .ex-interactive-table tbody {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .ex-row-interactive {
                    display: flex;
                    flex-direction: column;
                    border: 1px solid var(--border, rgba(255,255,255,0.1));
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    background: rgba(15, 23, 42, 0.4);
                }
                .ex-interactive-table td {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border: none;
                    padding: 0.25rem 0;
                    font-size: 0.88rem;
                }
                .ex-interactive-table td[data-label="#"] {
                    display: none;
                }
                .ex-interactive-table td.ex-cell-name {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.35rem;
                }
                .ex-interactive-table td.ex-cell-name::before {
                    margin-bottom: 0.15rem;
                }
                .ex-interactive-table td::before {
                    content: attr(data-label);
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    color: var(--text-secondary, #94a3b8);
                    font-weight: 600;
                    margin-right: 1rem;
                    flex-shrink: 0;
                }
                .ex-interactive-table td.col-actions {
                    justify-content: flex-end;
                    padding-top: 0.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    margin-top: 0.25rem;
                }
                .ex-interactive-table td.col-actions::before {
                    display: none;
                }
                .report-actions-v3 {
                    flex-direction: column;
                    align-items: stretch;
                    padding: 1.25rem;
                }
                .btn-close-report {
                    justify-content: center;
                }
                .export-btns {
                    flex-direction: column;
                }
                .export-btns button {
                    justify-content: center;
                }
            }

    ;
})();
