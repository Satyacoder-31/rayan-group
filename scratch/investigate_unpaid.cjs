const fs = require('fs');

let data;
try {
  data = JSON.parse(fs.readFileSync('dist/data/finance-data.json', 'utf8'));
} catch (e) {
  console.error("Failed to read dist/data/finance-data.json", e);
}

console.log("Invoices count:", data.invoices?.length);
console.log("Customer receipts count:", data.customer_receipts?.length);

console.log("\n=================== 1. SEARCH FOR 19,668.60 (MAP / TECHNICAL SERVICES) ===================");
const inv19k = (data.invoices || []).filter(i => Math.abs(Number(i.grand_total) - 19668.60) < 1 || (i.customer_name && i.customer_name.toLowerCase().includes("technical")));
inv19k.forEach(i => console.log(`[Invoice] ID: ${i.id} | No: ${i.invoice_no} | Client: ${i.customer_name} | Total: ${i.grand_total} | Paid: ${i.amount_paid} | Due: ${i.balance_due} | Status: ${i.status}`));

const rcp19k = (data.customer_receipts || []).filter(r => {
  const str = JSON.stringify(r);
  return str.includes("19668") || str.includes("18732") || (r.customer_name && r.customer_name.toLowerCase().includes("technical"));
});
rcp19k.forEach(r => console.log(`[Receipt] ID: ${r.id} | No: ${r.receipt_no} | Client: ${r.customer_name} | Amount: ${r.amount} | Invoices: ${JSON.stringify(r.allocated_invoices)}`));

console.log("\n=================== 2. SEARCH FOR VILLA / 9,000 ===================");
const inv9k = (data.invoices || []).filter(i => Math.abs(Number(i.grand_total) - 9000) < 1 || JSON.stringify(i).toLowerCase().includes("villa"));
inv9k.forEach(i => console.log(`[Invoice] ID: ${i.id} | No: ${i.invoice_no} | Client: ${i.customer_name} | Prj: ${i.project_name} | Total: ${i.grand_total} | Paid: ${i.amount_paid} | Due: ${i.balance_due} | Status: ${i.status}`));

const rcp9k = (data.customer_receipts || []).filter(r => {
  const str = JSON.stringify(r).toLowerCase();
  return str.includes("villa") || str.includes("9000") || (r.allocated_invoices && r.allocated_invoices.some(a => JSON.stringify(a).includes("1014") || JSON.stringify(a).includes("1015") || JSON.stringify(a).includes("1023") || JSON.stringify(a).includes("1024")));
});
rcp9k.forEach(r => console.log(`[Receipt] ID: ${r.id} | No: ${r.receipt_no} | Client: ${r.customer_name} | Amount: ${r.amount} | Invoices: ${JSON.stringify(r.allocated_invoices)}`));

console.log("\n=================== 3. SEARCH FOR 5,000 & 185,597.36 ===================");
const invOther = (data.invoices || []).filter(i => Math.abs(Number(i.grand_total) - 5000) < 1 || Math.abs(Number(i.grand_total) - 185597.36) < 1);
invOther.forEach(i => console.log(`[Invoice] ID: ${i.id} | No: ${i.invoice_no} | Client: ${i.customer_name} | Total: ${i.grand_total} | Paid: ${i.amount_paid} | Due: ${i.balance_due} | Status: ${i.status}`));

const rcpOther = (data.customer_receipts || []).filter(r => {
  const str = JSON.stringify(r);
  return str.includes("185597") || str.includes("35597") || str.includes("5000") || (r.allocated_invoices && r.allocated_invoices.some(a => invOther.some(i => i.invoice_no === a.invoice_no)));
});
rcpOther.forEach(r => console.log(`[Receipt] ID: ${r.id} | No: ${r.receipt_no} | Client: ${r.customer_name} | Amount: ${r.amount} | Invoices: ${JSON.stringify(r.allocated_invoices)}`));
