const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/finance-data.json', 'utf8'));
const custs = data.customers || [];
const invs = data.invoices || [];
const rcps = data.customer_receipts || [];

console.log('Total customers:', custs.length);
custs.forEach((c, idx) => {
  const custInvs = invs.filter(i => i.customer_id === c.id || (i.customer_name && i.customer_name.toLowerCase() === (c.name || '').toLowerCase()));
  const custRcps = rcps.filter(r => r.customer_id === c.id || (r.customer_name && r.customer_name.toLowerCase() === (c.name || '').toLowerCase()));
  const earliestInv = custInvs.map(i => i.invoice_date || i.date).filter(Boolean).sort()[0] || 'none';
  console.log(
    (idx + 1).toString().padStart(2) + '. ' +
    c.id.padEnd(20) + ' | ' +
    (c.code || '').padEnd(16) + ' | ' +
    earliestInv.padEnd(10) + ' | ' +
    ('Invs:' + custInvs.length).padEnd(8) + ' | ' +
    c.name
  );
});
