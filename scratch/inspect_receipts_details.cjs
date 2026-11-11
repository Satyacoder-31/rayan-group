const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/live_db_clean.json', 'utf8'));

console.log("Customer receipt sample:");
console.log(JSON.stringify(data.customer_receipts[0], null, 2));

console.log("\nAll receipts for HLN TECHNICAL SERVICES:");
const hln = data.customer_receipts.filter(r => (r.customer_name || '').toLowerCase().includes("hln"));
hln.forEach(r => console.log(JSON.stringify(r, null, 2)));

console.log("\nAll receipts for MAP OUT DECOR:");
const map = data.customer_receipts.filter(r => (r.customer_name || '').toLowerCase().includes("map"));
map.forEach(r => console.log(JSON.stringify(r, null, 2)));

console.log("\nAll receipts for MOBIN AL LISAILI VILLA DUBAI:");
const mobin = data.customer_receipts.filter(r => (r.customer_name || '').toLowerCase().includes("mobin") || (r.customer_name || '').toLowerCase().includes("lisaili"));
mobin.forEach(r => console.log(JSON.stringify(r, null, 2)));

console.log("\nAll invoices for MOBIN AL LISAILI VILLA DUBAI:");
const mobinInv = data.invoices.filter(i => (i.customer_name || '').toLowerCase().includes("mobin") || (i.customer_name || '').toLowerCase().includes("lisaili") || (i.project_name || '').toLowerCase().includes("lisaili"));
mobinInv.forEach(i => console.log(JSON.stringify(i, null, 2)));
