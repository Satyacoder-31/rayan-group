const fs = require('fs');

const php = fs.readFileSync('public/api/finance.php', 'utf8');

const target = "canonById";
const idx = php.indexOf(target);
console.log(php.substring(idx + 1000, idx + 2500));
