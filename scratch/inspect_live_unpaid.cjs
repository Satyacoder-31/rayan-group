const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scratch/live_db.json', 'utf8'));
const data = raw.data || raw;

console.log("Live Invoices count:", data.invoices?.length);
console.log("Live Customer receipts count:", data.customer_receipts?.length);
console.log("Live Credit notes count:", data.credit_notes?.length);

console.log("\n=================== 1. SEARCH FOR MAP OUT / 19,668.60 ===================");
const inv19k = (data.invoices || []).filter(i => {
  const str = JSON.stringify(i).toLowerCase();
  return str.includes("19668") || str.includes("19,668") || str.includes("map");
});
inv19k.forEach(i => {
  console.log(`[Invoice] ID: ${i.id} | No: ${i.invoice_no} | Date: ${i.invoice_date} | Client: ${i.customer_name} | Total: ${i.grand_total} | Paid: ${i.amount_paid} | Due: ${i.balance_due} | Status: ${i.status}`);
});

const rcp19k = (data.customer_receipts || []).filter(r => {
  const str = JSON.stringify(r).toLowerCase();
  return str.includes("19668") || str.includes("19,668") || str.includes("map") || str.includes("44009") || str.includes("44011");
});
rcp19k.forEach(r => {
  console.log(`[Receipt] ID: ${r.id} | No: ${r.receipt_no} | Date: ${r.receipt_date} | Client: ${r.customer_name} | Amount: ${r.amount} | Allocations: ${JSON.stringify(r.allocated_invoices)}`);
});

console.log("\n=================== 2. SEARCH FOR VILLA / 9,000 ===================");
const inv9k = (data.invoices || []).filter(i => {
  const str = JSON.stringify(i).toLowerCase();
  return (str.includes("villa") && (str.includes("9000") || str.includes("9,000"))) || (i.grand_total == 9000 && str.includes("villa"));
});
inv9k.forEach(i => {
  console.log(`[Invoice] ID: ${i.id} | No: ${i.invoice_no} | Date: ${i.invoice_date} | Client: ${i.customer_name} | Prj: ${i.project_name} | Total: ${i.grand_total} | Paid: ${i.amount_paid} | Due: ${i.balance_due} | Status: ${i.status}`);
});

const rcp9k = (data.customer_receipts || []).filter(r => {
  const str = JSON.stringify(r).toLowerCase();
  return str.includes("villa") || (r.allocated_invoices && r.allocated_invoices.some(a => inv9k.some(i => i.invoice_no === a.invoice_no)));
});
rcp9k.forEach(r => {
  console.log(`[Receipt] ID: ${r.id} | No: ${r.receipt_no} | Date: ${r.receipt_date} | Client: ${r.customer_name} | Amount: ${r.amount} | Allocations: ${JSON.stringify(r.allocated_invoices)}`);
});

console.log("\n=================== 3. SEARCH FOR 5,000 & 185,597.36 (from Image 3) ===================");
const invImg3 = (data.invoices || []).filter(i => {
  return Math.abs(Number(i.grand_total) - 5000) < 1 || Math.abs(Number(i.grand_total) - 185597.36) < 1 || Math.abs(Number(i.grand_total) - 70300) < 1;
});
invImg3.forEach(i => {
  console.log(`[Invoice] ID: ${i.id} | No: ${i.invoice_no} | Date: ${i.invoice_date} | Client: ${i.customer_name} | Total: ${i.grand_total} | Paid: ${i.amount_paid} | Due: ${i.balance_due} | Status: ${i.status}`);
});

const rcpImg3 = (data.customer_receipts || []).filter(r => {
  const str = JSON.stringify(r);
  return str.includes("185597") || str.includes("150000") || str.includes("35597") || str.includes("5000") || (r.allocated_invoices && r.allocated_invoices.some(a => invImg3.some(i => i.invoice_no === a.invoice_no)));
});
rcpImg3.forEach(r => {
  console.log(`[Receipt] ID: ${r.id} | No: ${r.receipt_no} | Date: ${r.receipt_date} | Client: ${r.customer_name} | Amount: ${r.amount} | Allocations: ${JSON.stringify(r.allocated_invoices)}`);
});

