const fs = require('fs');
const vm = require('vm');

const files = [
    '../js/data.js',
    '../js/app.js',
    '../js/ui.js'
];

global.window = {
    App: {},
    localStorage: {
        getItem: () => "[]",
        setItem: () => { }
    },
    document: {
        getElementById: () => ({}),
        addEventListener: () => { }
    }
};

files.forEach(file => {
    try {
        const code = fs.readFileSync(file, 'utf8');
        const script = new vm.Script(code);
        script.runInThisContext();
        console.log(`${file}: OK`);
    } catch (e) {
        console.log(`${file}: ERROR`);
        console.log(e.message);
        console.log(e.stack);
    }
});
