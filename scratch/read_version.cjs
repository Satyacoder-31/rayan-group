const fs = require('fs');
const content = fs.readFileSync('src/scripts/finance.js', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(0, 30).join('\n'));

