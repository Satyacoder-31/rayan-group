const fs = require('fs');

const php = fs.readFileSync('public/api/finance.php', 'utf8');

const target = "v2026_clean_v54";
const idx = php.indexOf(target);
console.log(php.substring(idx + 14000, idx + 16500));
