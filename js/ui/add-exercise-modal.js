/**
 * UI Add Exercise Modal
 * Extracted from ui.js
 */
window.App = window.App || {};
window.App.renderAddExerciseModal = function (onSuccessCallback) {
    // Generate Options Dynamically from NEW Taxonomy
    let muscleOptions = '';
    const taxonomy = window.App.MUSCLE_TAXONOMY;

    if (taxonomy) {
        Object.keys(taxonomy).forEach(key => {
            const group = taxonomy[key];
            muscleOptions += `<optgroup label="${group.label}">`;
            group.muscles.forEach(muscle => {
                muscleOptions += `<option value="${muscle}">${muscle}</option>`;
            });
            muscleOptions += `</optgroup>`;
        });
    } else {
        muscleOptions = `<option value="Pettorale Maggiore">Pettorale Maggiore</option>`; // Fallback
    }

    const content = `
        <div class="modal-form-container">
            <h3>Aggiungi Nuovo Esercizio</h3>
            <form id="add-exercise-form">
                <div class="form-group">
                    <label>Nome Esercizio *</label>
                    <input type="text" name="name" required placeholder="Es. Panca Piana">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Gruppo Muscolare *</label>
                        <select name="primaryMuscle">
                           ${muscleOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Livello *</label>
                        <select name="level">
                            <option value="Principiante">Principiante</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Avanzato">Avanzato</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Attrezzatura</label>
                        <select name="equipment">
                            <option value="Bilanciere">Bilanciere</option>
                            <option value="Manubri">Manubri</option>
                            <option value="Macchine">Macchine</option>
                            <option value="Corpo Libero">Corpo Libero</option>
                            <option value="Cavi">Cavi</option>
                            <option value="Sbarra Trazioni">Sbarra Trazioni</option>
                            <option value="Attrezzi">Altri Attrezzi</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo Movimento</label>
                        <select name="type">
                            <option value="Multiarticolare">Multiarticolare</option>
                            <option value="Isolamento">Isolamento</option>
                            <option value="Isometrico">Isometrico</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Descrizione Breve</label>
                    <textarea name="description" rows="2" placeholder="Descrivi l'esercizio..."></textarea>
                </div>

                <button type="submit" class="btn-primary" style="width: 100%;">Salva Esercizio</button>
            </form>
        </div>
    `;
    window.App.openModal(content);

    // Handle Submit
    setTimeout(() => {
        const form = document.getElementById('add-exercise-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            // Determine Category from Taxonomy based on selected Primary Muscle
            let category = 'Isolamento'; // Default
            if (taxonomy) {
                const selectedMuscle = formData.get('primaryMuscle');
                for (const [catKey, group] of Object.entries(taxonomy)) {
                    if ((group.muscles && group.muscles.includes(selectedMuscle)) || (group.sub && group.sub.includes(selectedMuscle))) {
                        category = catKey;
                        break;
                    }
                }
            }

            const newEx = {
                name: formData.get('name'),
                category: category,
                primaryMuscle: formData.get('primaryMuscle'),
                muscles: [formData.get('primaryMuscle')],
                level: formData.get('level'),
                equipment: formData.get('equipment'),
                type: formData.get('type'),
                description: formData.get('description'),
            };

            window.App.addExercise(newEx);
            window.App.closeModal();

            // Refresh catalog
            // Trigger a filter change event or standard refresh logic
            // Since we passed onSuccessCallback which is essentially onFilterChange from the parent
            const filters = {
                search: document.getElementById('filter-search')?.value || '',
                muscle: 'all',
                level: 'all',
                equipment: 'all'
            };
            if (onSuccessCallback) onSuccessCallback(filters);
            alert('Esercizio Aggiunto!');
        });
    }, 100);

};
