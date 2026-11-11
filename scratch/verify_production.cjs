async function verifyProduction() {
  console.log('Querying production server at https://rayan-group.com/api/finance.php?action=get_state ...');
  const res = await fetch('https://rayan-group.com/api/finance.php?action=get_state');
  const json = await res.json();
  const db = json.data;

  console.log('API version_tag:', json.version_tag);
  console.log('Storage:', json.storage);
  console.log('Invoices count:', db.invoices.length);
  console.log('Customer receipts count:', db.customer_receipts.length);

  const targets = ['REC-RG-INV-44009', 'REC-RG-INV-44003', 'REC-RG-INV-44008', 'REC-RG-INV-44006', 'REC-RG-INV-44011', 'REC-RG-INV-1005'];
  console.log('\n--- TARGET INVOICE AUDIT ---');
  targets.forEach(no => {
    const inv = db.invoices.find(i => i.invoice_no === no);
    if (inv) {
      console.log(`${inv.invoice_no.padEnd(17)} | Cust: ${inv.customer_name.padEnd(38)} | Total: AED ${String(inv.grand_total).padStart(9)} | Paid: AED ${String(inv.amount_paid).padStart(9)} | Due: AED ${String(inv.balance_due).padStart(7)} | Status: ${inv.status.toUpperCase()}`);
    } else {
      console.log(`MISSING: ${no}`);
    }
  });

  console.log('\n--- RECEIPT VOUCHERS AUDIT ---');
  const checkRcpRefs = ['PHUB564873075', '000867', 'CASH-SCRAP-44008', 'PHUB604192801'];
  db.customer_receipts.filter(r => {
    const s = JSON.stringify(r);
    return checkRcpRefs.some(ref => s.includes(ref));
  }).forEach(r => {
    console.log(`${r.receipt_no.padEnd(14)} | ${r.receipt_date} | ${r.customer_name.padEnd(38)} | AED ${String(r.amount_received).padStart(9)} | Method: ${r.payment_mode.padEnd(7)} | Ref: ${r.reference_no || r.cheque_no}`);
  });
}

verifyProduction();

