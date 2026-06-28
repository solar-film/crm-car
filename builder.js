const fs = require('fs');
let code = fs.readFileSync('damage-calculator.js', 'utf8');
fs.writeFileSync('test-strict.js', '"use strict";\n' + code + '\nDamageCalculator.buildDamageRows([], [], [], [], []);\nconsole.log("Strict Mode OK");');
