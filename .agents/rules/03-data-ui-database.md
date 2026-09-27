---
trigger: manual
---

## Integrità Dati, Formule Biometriche e UI

- **Dimensioni Fisiche e Vincoli Biometrici:**
  - Controllo di coerenza sui valori: se una stima o un calcolo produce parametri anomali o fisicamente impossibili, applicare fallback al dato grezzo o calcolo stimato standard.

- **Parsing Intelligente dei Dati**: Quando si processano ID grezzi (es. ID dispositivo, ID sensori), estrarre sempre il nome leggibile (es. tramite split su _) per i valori di default della UI, evitando di usare placeholder generici a meno che non sia strettamente necessario.
- **Validazione UI Binding**: Verificare sempre che i risultati di calcoli complessi (es. metriche biometriche o fisiche) restituiscano un valore valido prima del binding sulla UI. Prevenire in ogni modo la comparsa della stringa "undefined" nelle interfacce, applicando calcoli di fallback o nascondendo il dato.

## Database, Tassonomia & Ricerca Esercizi

- **Deduplicazione Semantica:** Prima di inserire nuovi esercizi nel database locale, verificare se la variante esiste già (confrontando sia il nome che il pattern motorio: es. Push-up vs Piegamenti sulle braccia).
- **Tassonomia Ricerca:** Ogni esercizio deve contenere campi obbligatori coerenti per l'indicizzazione: `id`, `name`, `primary_muscle`, `equipment`, `movement_pattern`, `difficulty`.
