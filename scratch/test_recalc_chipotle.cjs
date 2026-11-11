const fs = require('fs');
const db = JSON.parse(fs.readFileSync('scratch/updated_db.json', 'utf8'));

// Test recalculateInvoiceBalance as implemented in finance.js
function matchInvoiceRef(inv, targetNo, targetId) {
  if (!inv) return false;
  const invNo = String(inv.invoice_no || '').trim().toUpperCase();
  const invId = String(inv.id || '').trim().toLowerCase();
  const tNo = String(targetNo || '').trim().toUpperCase();
  const tId = String(targetId || '').trim().toLowerCase();
  if (tNo && (invNo === tNo || invId === tNo.toLowerCase())) return true;
  if (tId && (invId === tId || invNo.toLowerCase() === tId)) return true;
  return false;
}

function recalculateInvoiceBalance(inv) {
  const grand = Math.round((Number(inv.grand_total) || 0) * 100) / 100;
  let paid = 0;
  (db.customer_receipts || []).forEach(rcp => {
    if (rcp.status === 'void') return;
    (rcp.allocations || []).forEach(alloc => {
      if (matchInvoiceRef(inv, alloc.invoice_no, alloc.invoice_id) || (rcp.ref_invoice_no && matchInvoiceRef(inv, rcp.ref_invoice_no))) {
        paid += Number(alloc.amount_allocated) || 0;
      }
    });
  });
  paid = Math.round(paid * 100) / 100;
  let credited = 0;
  (db.credit_notes || []).forEach(cn => {
    if (cn.status === 'void') return;
    if (matchInvoiceRef(inv, cn.invoice_no || cn.ref_invoice_no, cn.invoice_id)) {
      credited += Number(cn.total_credit_amount) || 0;
    }
  });
  credited = Math.round(credited * 100) / 100;
  let bal = Math.max(0, Math.round((grand - paid - credited) * 100) / 100);
  if (bal <= 0.02) bal = 0;
  inv.amount_paid = paid;
  inv.amount_credited = credited;
  inv.balance_due = bal;
}

['REC-RG-INV-44010', 'REC-RG-INV-44014', 'REC-RG-INV-44015', 'REC-RG-INV-44019'].forEach(no => {
  const inv = db.invoices.find(i => i.invoice_no === no);
  recalculateInvoiceBalance(inv);
  console.log(inv.invoice_no, {
    grand_total: inv.grand_total,
    paid: inv.amount_paid,
    credited: inv.amount_credited,
    bal: inv.balance_due
  });
});
