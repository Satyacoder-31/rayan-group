const fs = require('fs');
const content = fs.readFileSync('public/api/finance.php', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(10268, 10320).join('\n'));

