const fs = require('fs');
const js = fs.readFileSync('src/scripts/finance.js', 'utf8');

const rRowsIdx = js.indexOf('renderInvoiceRows(invoices)');
console.log(js.substring(rRowsIdx + 500, rRowsIdx + 1200));
