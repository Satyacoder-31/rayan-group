const fs = require('fs');
const content = fs.readFileSync('public/api/finance.php', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('function syncToRelationalTables'));
console.log('syncToRelationalTables at line', idx + 1);
console.log(lines.slice(idx, idx + 80).join('\n'));

