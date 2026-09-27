const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = {};

class MockFileReader {
    readAsArrayBuffer(file) {
        setTimeout(() => {
            if (this.onload) {
                this.onload({
                    target: {
                        result: new Uint8Array(file).buffer
                    }
                });
            }
        }, 0);
    }
}
global.FileReader = MockFileReader;

const mockXLSX = {
    read: (data) => {
        const str = Buffer.from(data).toString('utf-8');
        try {
            const parsed = JSON.parse(str);
            if (parsed && parsed.sheets) {
                return {
                    SheetNames: Object.keys(parsed.sheets),
                    Sheets: parsed.sheets
                };
            }
        } catch (e) {}
        return { SheetNames: [], Sheets: {} };
    },
    utils: {
        sheet_to_json: (sheet) => sheet
    }
};