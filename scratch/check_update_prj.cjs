const fs = require('fs');

const phpPath = 'public/api/finance.php';
let php = fs.readFileSync(phpPath, 'utf8');

const target = "DELETE FROM finance_projects WHERE id NOT IN";
const idx = php.indexOf(target);

console.log(idx !== -1 ? php.substring(idx - 200, idx + 200) : 'Not found');
