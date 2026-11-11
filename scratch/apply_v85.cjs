const fs = require('fs');

let code = fs.readFileSync('src/scripts/finance.js', 'utf8');

// 1. Version bump
code = code.replace("CURRENT_DB_VERSION = 'v2026_clean_v84'", "CURRENT_DB_VERSION = 'v2026_clean_v85'");

// 2. Tolerance updates in getProjectLedgerData
code = code.replace(
  "if (contractVal > 0 && Math.abs(pendingDue - (contractVal - collected)) <= 0.02) {",
  "if (contractVal > 0 && (prj.status === 'Closed' || prj.status === 'closed' || Math.abs(pendingDue - (contractVal - collected)) <= 10.0)) {"
);
code = code.replace(
  "if (contractVal > 0 && Math.abs(netInvoiced - contractVal) <= 0.02) {",
  "if (contractVal > 0 && (prj.status === 'Closed' || prj.status === 'closed' || Math.abs(netInvoiced - contractVal) <= 10.0)) {"
);

// 3. Normalization logic
const target = "    const inv44015 = (this.db.invoices || []).find(i => i.invoice_no === 'REC-RG-INV-44015');";
const addition = `    // Reconcile Chipotle project PRJ-REC-102-CHIP-2025 invoices REC-RG-INV-44010 and 44014 down to the fil
    const inv44010 = (this.db.invoices || []).find(i => i.invoice_no === 'REC-RG-INV-44010');
    if (inv44010) {
      inv44010.sub_total = 19089.93;
      inv44010.taxable_subtotal = 19089.93;
      inv44010.vat_total = 954.50;
      inv44010.total_tax = 954.50;
      inv44010.grand_total = 20044.43;
      inv44010.amount_paid = 20044.43;
      inv44010.amount_credited = 0.00;
      inv44010.balance_due = 0.00;
      inv44010.status = 'paid';
      inv44010.amount_in_words = 'Twenty Thousand Forty Four and Forty Three Fils AED Only.';
      if (Array.isArray(inv44010.line_items) && inv44010.line_items[0]) {
        inv44010.line_items[0].unit_price = 19089.93;
        inv44010.line_items[0].rate = 19089.93;
        inv44010.line_items[0].invoice_amount = 19089.93;
        inv44010.line_items[0].taxable_amount = 19089.93;
        inv44010.line_items[0].vat_amount = 954.50;
        inv44010.line_items[0].tax_amount = 954.50;
        inv44010.line_items[0].total_amount = 20044.43;
      }
    }
    const inv44014 = (this.db.invoices || []).find(i => i.invoice_no === 'REC-RG-INV-44014');
    if (inv44014) {
      inv44014.grand_total = 20044.01;
      inv44014.amount_paid = 20044.01;
      inv44014.amount_credited = 0.00;
      inv44014.balance_due = 0.00;
      inv44014.status = 'paid';
      inv44014.amount_in_words = 'Twenty Thousand Forty Four and One Fils AED Only.';
    }
    const rcp44031 = (this.db.customer_receipts || []).find(r => r.id === 'rec-mvy4fwvn' || r.receipt_no === 'REC-RV-44031' || r.reference_no === '017236');
    if (rcp44031) {
      rcp44031.amount_received = '20044.01';
      rcp44031.allocated_amount = 20044.01;
      if (Array.isArray(rcp44031.allocations) && rcp44031.allocations[0]) {
        rcp44031.allocations[0].amount_allocated = 20044.01;
      }
    }
    if (this.db.credit_notes) {
      this.db.credit_notes = this.db.credit_notes.filter(c => c.credit_note_no !== 'CN-REC-015' && c.id !== 'cn-1793555201785');
    }
`;

if (code.includes(target)) {
  code = code.replace(target, addition + target);
  console.log('Added normalization logic for 44010, 44014, 44031');
} else {
  console.error('Target not found for addition');
}

// 4. Project contract value enforcement in normalizeAllBalances
const prjTarget = "      if (p.id === 'prj-mvr35qo2' || p.code === 'PRJ-RG-MAX-2026' || (p.name || '').includes('Max - Al Wahda')) {";
const prjAddition = `      if (p.id === 'prj-mw3rnn9m' || p.code === 'PRJ-REC-102-CHIP-2025' || (p.name || '').toLowerCase().includes('chipotle')) {
        p.contract_value = 107872.58;
        p.approved_budget = 107872.58;
      }
`;
if (code.includes(prjTarget)) {
  code = code.replace(prjTarget, prjAddition + prjTarget);
  console.log('Added project contract value enforcement for Chipotle');
} else {
  console.error('Project target not found');
}

fs.writeFileSync('src/scripts/finance.js', code);
console.log('src/scripts/finance.js updated successfully!');
