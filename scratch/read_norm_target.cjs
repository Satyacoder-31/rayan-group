const fs = require('fs');
const content = fs.readFileSync('src/scripts/finance.js', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(1115, 1175).join('\n'));

