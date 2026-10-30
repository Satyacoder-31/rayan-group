const fs = require('fs');
const html = fs.readFileSync('scratch/gdrive_page.html', 'utf8');

console.log('--- Content around 286706 ---');
console.log(html.slice(286500, 295000));
