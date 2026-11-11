const fs = require('fs');
const db = JSON.parse(fs.readFileSync('scratch/updated_db.json', 'utf8'));

console.log('=== REC-RG-INV-44010 ===');
const inv44010 = db.invoices.find(i => i.invoice_no === 'REC-RG-INV-44010');
console.log(JSON.stringify(inv44010, null, 2));

console.log('=== CN-REC-015 ===');
const cn15 = db.credit_notes.find(c => c.credit_note_no === 'CN-REC-015' || c.id === 'cn-1793555201785');
console.log(JSON.stringify(cn15, null, 2));

console.log('=== REC-RG-INV-44014 ===');
const inv44014 = db.invoices.find(i => i.invoice_no === 'REC-RG-INV-44014');
console.log(JSON.stringify(inv44014, null, 2));

