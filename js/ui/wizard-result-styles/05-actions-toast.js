/**
 * js/ui/wizard-result-styles/05-actions-toast.js
 * ═══════════════════════════════════════════════════════════════════
 * Stili CSS Report Risultato: Toast Notifiche e Azioni di Esportazione.
 * Registra il frammento CSS in window.App.ResultStyles.chunks.
 *
 * Sezioni contenute:
 *   - .undo-toast (Toast rollback azioni con animazione slideIn)
 *   - .report-actions-v3 & .export-btns (Pulsanti esportazione PDF, Excel e chiusura)
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};
    window.App.ResultStyles = window.App.ResultStyles || {};
    window.App.ResultStyles.chunks = window.App.ResultStyles.chunks || {};

    const CHUNK_KEY = 'actionsToast';

    window.App.ResultStyles.chunks[CHUNK_KEY] = 
            /* ── Toast Undo ── */
            .undo-toast {
                position: fixed;
                bottom: 24px;
                left: 24px;
                background: #1e293b;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 10px;
                padding: 0.75rem 1.25rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                z-index: 1200;
                animation: slideInToast 0.25s ease;
            }
            .undo-toast.hidden {
                display: none;
            }
            @keyframes slideInToast {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .undo-toast-msg {
                font-size: 0.88rem;
                color: var(--text-primary, #f8fafc);
            }
            .undo-toast-btn {
                background: var(--accent, #10b981);
                color: #fff;
                border: none;
                border-radius: 6px;
                padding: 0.4rem 0.8rem;
                font-weight: 600;
                cursor: pointer;
                font-size: 0.82rem;
            }
            .undo-toast-btn:hover {
                background: #059669;
            }

            /* ── Bottoni Azioni Export ── */
            .report-actions-v3 {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1.5rem;
                margin-top: 2.5rem;
                padding: 1.5rem 2rem;
                border-radius: 16px;
                background: rgba(255, 255, 255, 0.02);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.05);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            .report-actions-v3.report-actions-top {
                margin-top: 1.25rem;
                margin-bottom: 2rem;
            }
            .export-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .export-label {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: var(--text-secondary, #94a3b8);
                font-weight: 700;
                margin-left: 0.25rem;
            }
            .export-btns {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            .btn-pdf-export, .btn-excel-export, .btn-close-report {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.8rem 1.6rem;
                border-radius: 10px;
                font-weight: 600;
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid transparent;
            }
            .btn-pdf-export {
                background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
                color: #fff;
                box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            .btn-pdf-export:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
            .btn-excel-export {
                background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                color: #fff;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            .btn-excel-export:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
            .btn-close-report {
                background: rgba(255, 255, 255, 0.03);
                color: var(--text-secondary, #94a3b8);
                border: 1px solid rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
            }
            .btn-close-report:hover {
                background: rgba(255, 255, 255, 0.08);
                color: var(--text-primary, #f8fafc);
                border-color: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .btn-pdf-export svg, .btn-excel-export svg, .btn-close-report svg {
                transition: transform 0.3s ease;
            }
            .btn-pdf-export:hover svg { transform: translateY(2px); }
            .btn-excel-export:hover svg { transform: scale(1.1); }
            .btn-close-report:hover svg { transform: translateX(-3px); }

    ;
})();
