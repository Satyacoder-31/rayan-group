const fs = require('fs');
const js = fs.readFileSync('src/scripts/finance.js', 'utf8');

const regex = /hasPermission\(['"]([a-zA-Z_]+)['"]\)/g;
let m;
const perms = new Set();
while ((m = regex.exec(js)) !== null) {
  perms.add(m[1]);
}
console.log('Permissions checked in finance.js:', [...perms]);
