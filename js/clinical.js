/**
 * CLINICAL UI MANAGER
 * Handles the Conditions Selection page, chips/cards toggle, and Impact Widget updates.
 */

class ClinicalManager {
    constructor() {
        this.selectedConditions = [];
        this.calculator = null;
        this.DOM = {
            grid: null,
            widget: null,
            btnGenerate: null
        };
    }

    init(containerId = 'clinical-grid-container', preSelectedConditions = []) {
        const grid = document.getElementById(containerId);
        if (!grid) return; // Not on clinical page

        this.DOM.grid = grid;
        this.DOM.widget = document.getElementById('impact-widget');
        
        // Populate pre-selected conditions if passed from the wizard
        this.selectedConditions = preSelectedConditions || [];

        // Init Calculator with current exercises
        this.calculator = new window.ImpactCalculator(window.App.getExercises());

        this.renderConditionsGrid();
        this.updateImpactWidget(); 
    }

    renderConditionsGrid() {
        const conditions = window.App.getConditions();
        // Custom Category Ordering based on the user's screenshot
        const categoryOrder = ['colonna', 'arti_inferiori', 'arti_superiori', 'altri_distretti', 'sistemiche', 'neurologiche', 'reumatologiche', 'post_chirurgiche', 'speciali'];
        
        // Group by Category
        const grouped = conditions.reduce((acc, cond) => {
            acc[cond.category] = acc[cond.category] || [];
            acc[cond.category].push(cond);
            return acc;
        }, {});

        // Sort categories by predefined order
        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            let idxA = categoryOrder.indexOf(a);
            let idxB = categoryOrder.indexOf(b);
            if (idxA === -1) idxA = 999;
            if (idxB === -1) idxB = 999;
            return idxA - idxB;
        });

        this.DOM.grid.innerHTML = '';

        // Inject Styles dynamically if not present
        if (!document.getElementById('clinical-grid-styles')) {
            const s = document.createElement('style');
            s.id = 'clinical-grid-styles';
            s.textContent = `
                .clinical-compact-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 1.5rem;
                    background: rgba(16, 185, 129, 0.05);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                }
                .clinical-col {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .clinical-col-header {
                    font-size: 0.85rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: var(--accent);
                    margin-bottom: 0.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(16, 185, 129, 0.2);
                    display: flex;
                    justify-content: space-between;
                }
                .clinical-checkbox-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .clinical-checkbox-item:hover {
                    opacity: 0.8;
                }
                .clinical-checkbox-item input[type="checkbox"] {
                    appearance: none;
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 4px;
                    background: rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    flex-shrink: 0;
                    position: relative;
                    margin-top: 2px;
                }
                .clinical-checkbox-item input[type="checkbox"]:checked {
                    background: var(--accent);
                    border-color: var(--accent);
                }
                .clinical-checkbox-item input[type="checkbox"]:checked::after {
                    content: '';
                    position: absolute;
                    left: 5px;
                    top: 2px;
                    width: 4px;
                    height: 8px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }
                .clinical-checkbox-item span {
                    font-size: 0.9rem;
                    color: var(--text-primary);
                    line-height: 1.3;
                }
                @media(max-width: 768px) {
                    .clinical-compact-container {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(s);
        }

        const mainContainer = document.createElement('div');
        mainContainer.className = 'clinical-compact-container';

        for (const category of sortedCategories) {
            const items = grouped[category];

            // Column Wrapper
            const col = document.createElement('div');
            col.className = 'clinical-col';

            // Header
            const header = document.createElement('div');
            header.className = 'clinical-col-header';
            header.innerHTML = `<span>${this.translateCategory(category)}</span> <span id="count-${category}"></span>`;
            col.appendChild(header);

            // Checkboxes
            items.forEach(cond => {
                const label = document.createElement('label');
                label.className = 'clinical-checkbox-item';
                
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.value = cond.id;
                cb.dataset.category = cond.category;
                if (this.selectedConditions.includes(cond.id)) {
                    cb.checked = true;
                }
                
                cb.addEventListener('change', (e) => {
                    this.toggleCondition(cond.id, cb.checked, cond.category);
                });

                const span = document.createElement('span');
                span.textContent = cond.name;

                label.appendChild(cb);
                label.appendChild(span);
                col.appendChild(label);
            });

            mainContainer.appendChild(col);
        }
        
        this.DOM.grid.appendChild(mainContainer);
        
        // Initial counter update
        sortedCategories.forEach(cat => this.updateCategoryCounter(cat));
    }


    toggleCondition(id, isChecked, category) {
        const index = this.selectedConditions.indexOf(id);
        
        if (isChecked && index === -1) {
            this.selectedConditions.push(id);
        } else if (!isChecked && index !== -1) {
            this.selectedConditions.splice(index, 1);
        }

        // Update Category Counter
        this.updateCategoryCounter(category);

        // Update Widget
        this.updateImpactWidget();
    }

    updateCategoryCounter(category) {
        const countSpan = document.getElementById(`count-${category}`);
        if (!countSpan) return;

        // Count selected in this category
        const total = window.App.getConditions().filter(c => c.category === category).length;
        const selected = this.selectedConditions.filter(id => {
            const c = window.App.getConditions().find(x => x.id === id);
            return c && c.category === category;
        }).length;

        countSpan.textContent = `${selected}/${total}`;
        if (selected > 0) countSpan.classList.add('active');
        else countSpan.classList.remove('active');
    }

    updateImpactWidget() {
        const impact = this.calculator.calculate(this.selectedConditions);

        // Elements
        const elExcluded = document.getElementById('stat-excluded');
        const elAdapted = document.getElementById('stat-adapted');
        const elRisk = document.getElementById('stat-risk');
        const widget = document.querySelector('.impact-summary');

        if (elExcluded) elExcluded.textContent = impact.excluded.length;
        if (elAdapted) elAdapted.textContent = impact.adapted.length;

        if (elRisk) {
            elRisk.textContent = impact.riskLevel.toUpperCase();
            elRisk.className = `risk-badge risk-${impact.riskLevel}`;
        }

        // Animation
        if (widget) {
            widget.classList.remove('pulse-update');
            void widget.offsetWidth; // trigger reflow
            widget.classList.add('pulse-update');
        }
    }

    translateCategory(cat) {
        const map = {
            'colonna': 'Colonna Vertebrale',
            'arti_inferiori': 'Arti Inferiori',
            'arti_superiori': 'Arti Superiori',
            'altri_distretti': 'Altri Distretti / Gomito & Polso',
            'sistemiche': 'Cardiometaboliche & Sistemiche',
            'neurologiche': 'Neurologiche',
            'reumatologiche': 'Reumatologiche',
            'post_chirurgiche': 'Post-Chirurgiche',
            'speciali': 'Speciali & Sport'
        };
        return map[cat] || cat;
    }
}

// Singleton
window.ClinicalManager = new ClinicalManager();
