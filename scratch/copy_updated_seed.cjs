const fs = require('fs');

const updated = fs.readFileSync('scratch/updated_db.json', 'utf8');

fs.writeFileSync('data/finance-data.json', updated, 'utf8');
console.log('Updated data/finance-data.json');

fs.writeFileSync('public/data/finance-data.json', updated, 'utf8');
console.log('Updated public/data/finance-data.json');

fs.writeFileSync('dist/data/finance-data.json', updated, 'utf8');
console.log('Updated dist/data/finance-data.json');

