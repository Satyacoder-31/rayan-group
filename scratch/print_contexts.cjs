const fs = require('fs');
const js = fs.readFileSync('src/scripts/finance.js', 'utf8');

console.log('--- NORM ---');
console.log(js.substring(35450, 35700));

console.log('--- FILTER ---');
console.log(js.substring(259550, 259800));

console.log('--- ROWS ---');
console.log(js.substring(235650, 235950));

console.log('--- EDIT ---');
console.log(js.substring(1421650, 1422150));
