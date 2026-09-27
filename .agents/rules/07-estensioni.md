---
trigger: always_on
---

# Sincronizzazione Estensioni & Tooling IDE (Antigravity / VS Code)

## Obiettivo

Garantire che l'ambiente di sviluppo e le estensioni dell'IDE rimangano identici e allineati tra PC Fisso e Portatile in modo automatico e senza perdite di memoria, utilizzando `.vscode/extensions.json` come registro condiviso su Git.

## 1. Tracciamento (.vscode/extensions.json)

- **Criterio di aggiunta:**
  - Ogni volta che si concorda l'adozione di un nuovo tool, oppure se l'utente menziona di aver installato una nuova estensione sul portatile o sul fisso, l'agente registra tempestivamente il suo ID univoco nell'array `recommendations` di `.vscode/extensions.json`.

---

## 2. Condizione di Controllo (Lazy Check)

- **Zero overhead:** Non interrogare né verificare le estensioni via terminale a ogni prompt.
- **Trigger autonomi di attivazione:**
  1. Quando un'operazione di `git pull` include modifiche al file `.vscode/extensions.json`.
  2. Quando l'utente chiede esplicitamente un controllo (es. "verifica estensioni", "allinea estensioni").
  3. Quando l'agente stesso modifica `.vscode/extensions.json`.

---

## 3. Procedura di Notifica e Installazione

1. **Nessun forzatura da terminale:** Non eseguire installazioni silenziose o forzate via terminale.
2. **Avviso all'utente in chat:** Quando si rileva o si aggiorna il file `.vscode/extensions.json`, avvisare sempre l'utente con il seguente messaggio:
   > *"La lista delle estensioni raccomandate è stata aggiornata in `.vscode/extensions.json`. Clicca su **'Install All'** nel pop-up in basso a destra dell'IDE, oppure apri il pannello Estensioni (`Ctrl+Shift+X`), digita `@recommended` e clicca su Installa per allineare l'ambiente."*
3. **Fallback da terminale:** Utilizzare l'installazione via riga di comando (`code --install-extension <id>`) esclusivamente se l'utente lo richiede esplicitamente o se segnala che l'interfaccia grafica non risponde.
