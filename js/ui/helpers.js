/**
 * UI Helpers — escapeHTML, initNumberSteppers
 * Extracted from ui.js
 */
window.App = window.App || {};

// Helper: Escape HTML to prevent XSS
window.escapeHTML = function (str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
};

// Helper: Custom MVT Number Stepper (R2)
window.App.initNumberSteppers = function (container = document) {
    const wrappers = container.querySelectorAll('.mvt-stepper-wrap');
    wrappers.forEach(wrap => {
        const input = wrap.querySelector('input.stepper-input');
        const btnMinus = wrap.querySelector('.stepper-btn.minus');
        const btnPlus = wrap.querySelector('.stepper-btn.plus');

        if (!input || input.dataset.stepperInit === 'true') return;
        input.dataset.stepperInit = 'true';

        const step = parseFloat(input.getAttribute('step')) || 0.01;
        const min = input.getAttribute('min') !== null ? parseFloat(input.getAttribute('min')) : 0.05;
        const max = input.getAttribute('max') !== null ? parseFloat(input.getAttribute('max')) : 1.50;

        const updateVal = (delta) => {
            let current = parseFloat(input.value) || 0.30;
            let updated = current + delta;
            updated = Math.round(updated * 100) / 100;
            if (updated < min) updated = min;
            if (updated > max) updated = max;
            input.value = updated.toFixed(2);

            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        };

        if (btnMinus) {
            btnMinus.addEventListener('click', (e) => {
                e.preventDefault();
                updateVal(-step);
            });
        }
        if (btnPlus) {
            btnPlus.addEventListener('click', (e) => {
                e.preventDefault();
                updateVal(step);
            });
        }
    });
};
