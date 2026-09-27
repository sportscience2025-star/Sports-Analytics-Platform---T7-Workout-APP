## 2026-06-15T14:25:00Z
You are the teamwork_preview_worker. Your working directory is e:\Nuove App Installate\App esercizi scienze motorie\.agents\worker_parsing.
Your mission is to implement robust data parsing for Excel and PDF files in the sports science app.

### Tasks:
1. Update `index.html` to load the PDF.js library from the CDN:
   `<script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"></script>`
   (Place it next to other script tags, e.g. Day.js).
2. Update `js/parser.js` to:
   - Map jump-related headers:
     - `jumpHeight`: "altezza salto", "jump height", "altura salto", "altezza", "height", "altura", "volo", "h"
     - `contactTime`: "tempo contatto", "contact time", "tiempo contatto", "contatto", "tc", "contact_time"
     - `dropHeight`: "altezza caduta", "drop height", "altura caida", "caduta"
     - (And maps Jump type / Salto / Ejercicio / Esercizio to `exercise` so it integrates nicely).
   - In `parseExcel`, change the row filtering logic so that rows containing jump metrics (`record.jumpHeight > 0` or `record.contactTime > 0`) are not dropped (currently it requires `record.load > 0 || record.distance > 0`).
   - Implement `static async parsePDF(file)` in `DataParser` using PDF.js. It should extract text from pages and parse it.
   - Implement a robust `static _parseTextData(text)` method to parse raw text (from PDF or image OCR). It must match athlete names, exercise/jump types, dates, loads/velocities, and jump heights/contact times, returning normalized records:
     `{ athlete, exercise, load, velocity, date, jumpHeight, contactTime }`
3. Update `js/data-analysis.js`'s `handleFile(file)` to:
   - Identify PDF files (`file.type.includes('pdf') || file.name.endsWith('.pdf')`) and call `this.parseResult = await window.DataParser.parsePDF(file)`.
4. Create a sample raw messy Excel file `sample_messy_data.xlsx` and a sample PDF file `sample_messy_data.pdf` at the project root containing:
   - VBT rows (at least 5 rows with loads and velocities).
   - Jump test rows (SJ, CMJ, DJ) with heights and contact times.
5. Create `test_parsing.js` at the project root. This Node.js script must:
   - Mock browser APIs (like `FileReader` or others) or implement a node-compatible test flow.
   - Load SheetJS (`xlsx`) and standard libraries.
   - Run `DataParser` parsing logic against `sample_messy_data.xlsx` and `sample_messy_data.pdf`.
   - Verify and assert that the resulting JSON files contain correct athlete names, test dates, loads, and velocity/jump metrics.
   - Output a cleanly structured JSON file containing the parsed data.
6. Run `node test_parsing.js` using terminal tools. Verify that the tests pass and verify the output layout.
7. Create a handoff report at `e:\Nuove App Installate\App esercizi scienze motorie\.agents\worker_parsing\handoff.md` showing:
   - List of modified files.
   - Execution command and output of `node test_parsing.js`.
   - Structural explanation of the new parsing methods.
8. Send a message to the caller (id: ede19483-177d-48b4-9574-90335d83c33b) when done.

### MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
