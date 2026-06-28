const fs = require('fs');
let code = fs.readFileSync('damage-calculator.js', 'utf8');
code = code.replace(
    '].map(normalizeFieldName);\n            if (value === null || value === undefined) return fallback;',
    '].map(normalizeFieldName);\n\n        function textValue(value, fallback = "") {\n            if (value === null || value === undefined) return fallback;'
);
fs.writeFileSync('damage-calculator.js', code);
