const fs = require('fs');
const js = fs.readFileSync('src/scripts/finance.js', 'utf8');

const rRowsIdx = js.indexOf('renderInvoiceRows(invoices)');
console.log('rRowsIdx:', rRowsIdx);
if (rRowsIdx >= 0) {
  console.log(js.substring(rRowsIdx, rRowsIdx + 600));
}
