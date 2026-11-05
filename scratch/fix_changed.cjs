const fs = require('fs');

const phpPath = 'public/api/finance.php';
let php = fs.readFileSync(phpPath, 'utf8');

const targetStr = `$data['projects'] = array_values(array_filter($data['projects'], function($p) {\n                return ($p['id'] ?? '') !== 'prj-mvr2yfnl';\n            }));`;
const replacementStr = `$data['projects'] = array_values(array_filter($data['projects'], function($p) {\n                return ($p['id'] ?? '') !== 'prj-mvr2yfnl';\n            }));\n            $changed = true;`;

if (php.includes(targetStr)) {
    php = php.replace(targetStr, replacementStr);
    console.log('Added $changed = true to v54 migration');
} else {
    console.warn('Could not find targetStr');
}

fs.writeFileSync(phpPath, php, 'utf8');
fs.copyFileSync(phpPath, 'dist/api/finance.php');
console.log('Updated public & dist/api/finance.php');
