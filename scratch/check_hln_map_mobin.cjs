const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/live_db_clean.json', 'utf8'));

console.log("=== ALL INVOICES FOR HLN TECHNICAL SERVICES ===");
const hlnInvoices = data.invoices.filter(i => (i.customer_name || '').toLowerCase().includes('hln'));
hlnInvoices.forEach(i => {
  console.log(`INV: ${i.invoice_no} | Date: ${i.invoice_date} | Total: ${i.grand_total} | Paid: ${i.amount_paid} | Due: ${i.balance_due} | Status: ${i.status}`);
});

console.log("\n=== ALL RECEIPTS FOR HLN TECHNICAL SERVICES ===");
const hlnReceipts = data.customer_receipts.filter(r => (r.customer_name || '').toLowerCase().includes('hln') || JSON.stringify(r).includes('cust-hln'));
hlnReceipts.forEach(r => {
  console.log(`REC: ${r.receipt_no} | Date: ${r.receipt_date} | Mode: ${r.payment_mode} | Ref: ${r.reference_no || r.cheque_no} | Received: ${r.amount_received} | Allocations:`, JSON.stringify(r.allocations));
});

console.log("\nTotal HLN Invoiced:", hlnInvoices.reduce((s, i) => s + Number(i.grand_total || 0), 0));
console.log("Total HLN Receipts:", hlnReceipts.reduce((s, r) => s + Number(r.amount_received || 0), 0));

console.log("\n=== ALL INVOICES FOR MAP OUT ===");
const mapInvoices = data.invoices.filter(i => (i.customer_name || '').toLowerCase().includes('map'));
mapInvoices.forEach(i => {
  console.log(`INV: ${i.invoice_no} | Date: ${i.invoice_date} | Total: ${i.grand_total} | Paid: ${i.amount_paid} | Due: ${i.balance_due} | Status: ${i.status}`);
});

console.log("\n=== ALL RECEIPTS FOR MAP OUT ===");
const mapReceipts = data.customer_receipts.filter(r => (r.customer_name || '').toLowerCase().includes('map') || JSON.stringify(r).includes('cust-mapout'));
mapReceipts.forEach(r => {
  console.log(`REC: ${r.receipt_no} | Date: ${r.receipt_date} | Mode: ${r.payment_mode} | Ref: ${r.reference_no || r.cheque_no} | Received: ${r.amount_received} | Allocations:`, JSON.stringify(r.allocations));
});

console.log("\n=== SEARCHING FOR 19668.60 or 9000 or 5000 or 35597.36 ACROSS ENTIRE DB ===");
['customer_receipts', 'bank_transfers', 'cash_vouchers'].forEach(table => {
  (data[table] || []).forEach(row => {
    const s = JSON.stringify(row);
    if (s.includes('19668') || s.includes('19,668') || s.includes('35597') || s.includes('35,597') || s.includes('44009') || s.includes('44003') || s.includes('44008') || s.includes('Lisaili') || s.includes('lisaili')) {
      console.log(`Found in ${table}: [${row.id || row.receipt_no || row.voucher_no || row.reference_no}] ->`, s);
    }
  });
});
