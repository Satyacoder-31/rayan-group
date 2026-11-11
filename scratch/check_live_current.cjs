async function checkLive() {
  const res = await fetch('https://rayan-group.com/api/finance.php?action=get_state');
  const json = await res.json();
  const db = json.data || {};
  console.log('Live Server Status:', json.success, 'version:', json.version_tag);
  console.log('Invoices:', (db.invoices || []).length);
  console.log('Customer Receipts:', (db.customer_receipts || []).length);
  console.log('Employees:', (db.employees || []).length);
  console.log('Payroll:', (db.payroll || []).length);
  
  const targetNos = ['REC-RG-INV-44006', 'REC-RG-INV-44008', 'REC-RG-INV-44009', 'REC-RG-INV-44003', 'REC-RG-INV-44011'];
  (db.invoices || []).filter(i => targetNos.includes(i.invoice_no)).forEach(i => {
    console.log(i.invoice_no, 'Total:', i.grand_total, 'Paid:', i.amount_paid, 'Due:', i.balance_due, 'Status:', i.status);
  });
}
checkLive();

