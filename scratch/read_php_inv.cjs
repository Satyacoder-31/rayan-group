const fs = require('fs');
const content = fs.readFileSync('public/api/finance.php', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(1700, 1725).join('\n'));

