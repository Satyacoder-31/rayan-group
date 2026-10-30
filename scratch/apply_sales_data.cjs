const fs = require('fs');

const builtInvs = JSON.parse(fs.readFileSync('scratch/built_invoices.json', 'utf8'));
const builtRcps = JSON.parse(fs.readFileSync('scratch/built_receipts.json', 'utf8'));
const builtCusts = JSON.parse(fs.readFileSync('scratch/built_customers.json', 'utf8'));

for (const p of ['data/finance-data.json', 'public/data/finance-data.json']) {
  if (fs.existsSync(p)) {
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    // Clear old sales & income data and populate with new
    d.invoices = builtInvs;
    d.customer_receipts = builtRcps;
    d.credit_notes = [];
    d.customers = builtCusts;

    fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf8');
    console.log(`Successfully updated ${p}`);
  }
}

