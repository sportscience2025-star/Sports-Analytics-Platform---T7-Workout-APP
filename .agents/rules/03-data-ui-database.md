---
trigger: model_decision
description: "Attivare quando si lavora su calcoli biometrici, parsing di ID dispositivi/sensori, visualizzazione dati nell'interfaccia UI o aggiunta/indicizzazione esercizi nel database."
---

# Regola 03: Integrità Dati Biometrici, Interfaccia UI e Database Esercizi

## Scopo
Evitare che l'app mostri errori grezzi (come `"undefined"`), valori fisici assurdi o esercizi duplicati nel catalogo locale.

## Cosa l'AI NON può fare (Divieti assoluti)
- **Mai mostrare `"undefined"` in schermata:** è vietato stampare o collegare all'interfaccia il testo `"undefined"` o risultati non validati.
- **Niente sigle o placeholder pigri:** non mostrare ID tecnici grezzi né etichette generiche nella UI quando è possibile ricavare un nome leggibile.
- **Niente esercizi duplicati:** non aggiungere un nuovo esercizio nel database locale se esiste già una variante equivalente (anche con nome diverso).

## Cosa l'AI DEVE fare (Obblighi operativi)
- **Controllo di coerenza sui valori biometrici:** verificare sempre che formule e stime restituiscano valori plausibili; se un risultato è anomalo o fisicamente impossibile, applicare un ripiego (fallback) al dato grezzo o a una stima standard.
- **Validazione prima del rendering UI:** controllare che ogni calcolo complesso restituisca un valore valido prima di mostrarlo a schermo; in caso contrario applicare il fallback o nascondere il dato.
- **Lettura pulita degli ID grezzi:** quando si leggono ID di dispositivi o sensori, estrarre il nome leggibile (es. dividendo sul carattere `_`) per i testi mostrati all'utente.
- **Deduplicazione semantica degli esercizi:** prima di inserire un esercizio, controllare sia il nome sia il movimento svolto (es. *Push-up* vs *Piegamenti sulle braccia*).
- **Campi obbligatori della scheda esercizio:** garantire che ogni esercizio contenga sempre tutti i campi di indicizzazione: `id`, `name`, `primary_muscle`, `equipment`, `movement_pattern`, `difficulty`.
