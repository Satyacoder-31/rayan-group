const fs = require('fs');
const db = JSON.parse(fs.readFileSync('scratch/live_db_clean.json', 'utf8'));

// Emulate getProjectLedgerData
const prj = db.projects.find(p => p.id === 'prj-mw3rnn9m');
console.log('Project:', prj.code, prj.name);

const invoices = db.invoices || [];
const bills = db.purchase_bills || [];
const receipts = db.customer_receipts || [];
const creditNotes = db.credit_notes || [];

const prjInvoices = invoices.filter(i => {
  const pName = (i.project_name || '').toLowerCase();
  const pId = (i.project_id || '').toLowerCase();
  return pName.includes('chipotle') || pId.includes('chip') || pId === prj.id.toLowerCase();
});

console.log('\n--- PROJECT INVOICES ---');
prjInvoices.forEach(i => {
  console.log(i.invoice_no, {
    grand_total: i.grand_total,
    amount_paid: i.amount_paid,
    balance_due: i.balance_due,
    amount_credited: i.amount_credited,
    status: i.status
  });
});

const invNos = new Set(prjInvoices.map(i => (i.invoice_no || '').trim().toLowerCase()));
const invIds = new Set(prjInvoices.map(i => (i.id || '').trim().toLowerCase()));

const prjReceipts = receipts.filter(r => {
  const allocs = r.allocations || r.allocated_invoices;
  if (allocs && Array.isArray(allocs) && allocs.length > 0) {
    return allocs.some(ai => (ai.invoice_no && invNos.has(ai.invoice_no.trim().toLowerCase())) || (ai.invoice_id && invIds.has(ai.invoice_id.trim().toLowerCase())));
  }
  return false;
});

console.log('\n--- PROJECT RECEIPTS ---');
prjReceipts.forEach(r => {
  console.log(r.receipt_no, r.amount_received, r.allocations);
});

const prjCreditNotes = creditNotes.filter(cn => {
  const cnInvNo = (cn.invoice_no || cn.ref_invoice_no || '').trim().toLowerCase();
  const cnInvId = (cn.invoice_id || '').trim().toLowerCase();
  return (cnInvNo && invNos.has(cnInvNo)) || (cnInvId && invIds.has(cnInvId));
});

console.log('\n--- PROJECT CREDIT NOTES ---');
prjCreditNotes.forEach(cn => {
  console.log(cn.credit_note_no, cn.invoice_no, cn.total_credit_amount);
});

const autoInvoiced = Math.round(prjInvoices.reduce((s, i) => s + (Number(i.grand_total) || 0), 0) * 100) / 100;
const autoCreditedFromInvs = Math.round(prjInvoices.reduce((s, i) => s + (Number(i.amount_credited) || 0), 0) * 100) / 100;
const autoCreditedFromNotes = Math.round(prjCreditNotes.reduce((s, cn) => s + (Number(cn.total_credit_amount) || 0), 0) * 100) / 100;
const autoCredited = Math.max(autoCreditedFromInvs, autoCreditedFromNotes);

const autoCollectedFromInvs = Math.round(prjInvoices.reduce((s, i) => s + (Number(i.amount_paid) || 0), 0) * 100) / 100;
const autoCollectedFromReceipts = Math.round(prjReceipts.reduce((s, r) => {
  const allocs = r.allocations || r.allocated_invoices;
  if (allocs && Array.isArray(allocs) && allocs.length > 0) {
    const prjAllocAmt = allocs.reduce((as, ai) => {
      const matchNo = ai.invoice_no && invNos.has(ai.invoice_no.trim().toLowerCase());
      const matchId = ai.invoice_id && invIds.has(ai.invoice_id.trim().toLowerCase());
      return matchNo || matchId ? as + (Number(ai.amount_allocated ?? ai.amount ?? 0)) : as;
    }, 0);
    return s + prjAllocAmt;
  }
  return s + (Number(r.amount_received) || 0);
}, 0) * 100) / 100;
const autoCollected = Math.max(autoCollectedFromInvs, autoCollectedFromReceipts);

const prjBills = bills.filter(b => (b.project_name || '').toLowerCase().includes('chipotle') || b.project_id === prj.id);
const autoBillsCost = Math.round(prjBills.reduce((s, b) => s + (Number(b.grand_total) || 0), 0) * 100) / 100;
const autoBillsPaid = Math.round(prjBills.reduce((s, b) => s + Math.min(Number(b.amount_paid) || 0, Number(b.grand_total) || 0), 0) * 100) / 100;

const autoPendingDue = prjInvoices.reduce((s, i) => s + (Number(i.balance_due) || 0), 0);
const netInvoiced = Math.max(0, Math.round((autoInvoiced - autoCredited) * 100) / 100);
const netProfit = Math.round((netInvoiced - autoBillsCost) * 100) / 100;
const cashPosition = Math.round((autoCollected - autoBillsPaid) * 100) / 100;

console.log('\n--- CALCULATED METRICS ---');
console.log({
  autoInvoiced,
  autoCreditedFromInvs,
  autoCreditedFromNotes,
  autoCredited,
  netInvoiced,
  autoCollectedFromInvs,
  autoCollectedFromReceipts,
  autoCollected,
  autoBillsCost,
  autoBillsPaid,
  autoPendingDue,
  netProfit,
  cashPosition
});

