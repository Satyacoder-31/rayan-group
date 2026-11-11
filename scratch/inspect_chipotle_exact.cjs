const fs = require('fs');
const db = JSON.parse(fs.readFileSync('scratch/updated_db.json', 'utf8'));

console.log('=== CHIPOTLE INVOICES ===');
db.invoices.filter(i => (i.project_name || '').toLowerCase().includes('chipotle') || (i.project_id || '').toLowerCase().includes('chip')).forEach(i => {
  console.log(i.invoice_no, {
    grand_total: i.grand_total,
    amount_paid: i.amount_paid,
    balance_due: i.balance_due,
    amount_credited: i.amount_credited,
    status: i.status
  });
});

console.log('\n=== CHIPOTLE RECEIPTS ===');
db.customer_receipts.filter(r => {
  const s = JSON.stringify(r);
  return s.includes('44010') || s.includes('44014') || s.includes('44015') || s.includes('44019') || s.includes('Chipotle');
}).forEach(r => {
  console.log(r.id, r.receipt_no, r.receipt_date, r.amount_received, r.allocated_amount, JSON.stringify(r.allocations));
});

console.log('\n=== CHIPOTLE CREDIT NOTES ===');
db.credit_notes.filter(cn => {
  const s = JSON.stringify(cn);
  return s.includes('44010') || s.includes('44014') || s.includes('44015') || s.includes('44019') || s.includes('Chipotle');
}).forEach(cn => {
  console.log(cn.credit_note_no, cn.invoice_no, cn.total_credit_amount, cn.taxable_amount, cn.tax_amount);
});
