const fs = require('fs');

const bundle = fs.readFileSync('dist/assets/billing-wimYUV9U.js', 'utf8');
const idx = bundle.indexOf('renderInvoicesTab');
if (idx !== -1) {
  console.log(bundle.slice(idx, idx + 1500));
} else {
  console.log('renderInvoicesTab not found by name, looking for invoices table render');
  const tableIdx = bundle.indexOf('inv-table-body');
  if (tableIdx !== -1) {
    console.log(bundle.slice(tableIdx - 200, tableIdx + 1200));
  }
}
