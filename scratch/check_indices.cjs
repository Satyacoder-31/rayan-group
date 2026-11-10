const fs = require('fs');
const js = fs.readFileSync('src/scripts/finance.js', 'utf8');

console.log('normIdx:', js.indexOf("cn.credit_note_no.startsWith('CN-RG-')"));
console.log('filterIdx:', js.indexOf("const matchQ = (inv.invoice_no || '').toLowerCase().includes(q)"));
console.log('rowsIdx:', js.indexOf('<span class="fin-customer-cell">${inv.customer_name'));
console.log('editIdx:', js.indexOf('inv.customer_name = newCustName;'));
