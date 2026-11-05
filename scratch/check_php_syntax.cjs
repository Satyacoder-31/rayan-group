const fs = require('fs');

const php = fs.readFileSync('public/api/finance.php', 'utf8');

// Check basic balance of braces
let braceCount = 0;
let inString = false;
let stringChar = '';
let inComment = false;

for (let i = 0; i < php.length; i++) {
    const c = php[i];
    const next = php[i+1];

    if (!inString && !inComment && c === '/' && next === '/') {
        // line comment
        while (i < php.length && php[i] !== '\n') i++;
        continue;
    }
    if (!inString && !inComment && c === '/' && next === '*') {
        inComment = true;
        i++;
        continue;
    }
    if (inComment && c === '*' && next === '/') {
        inComment = false;
        i++;
        continue;
    }
    if (inComment) continue;

    if (!inString && (c === '"' || c === "'")) {
        inString = true;
        stringChar = c;
        continue;
    }
    if (inString && c === stringChar && php[i-1] !== '\\') {
        inString = false;
        continue;
    }
    if (inString) continue;

    if (c === '{') braceCount++;
    if (c === '}') braceCount--;
}

console.log('PHP Braces balance:', braceCount);
console.log('In string at end:', inString);
console.log('In comment at end:', inComment);
