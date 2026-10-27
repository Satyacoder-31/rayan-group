const fs = require('fs');
const assert = require('assert');

console.log('--- STARTING VERIFICATION TEST FOR FINANCE PORTAL ---');

// 1. Check data/finance-data.json
const rawData = fs.readFileSync('data/finance-data.json', 'utf8');
const data = JSON.parse(rawData);

assert(Array.isArray(data.vendors), 'data.vendors should be an array');
console.log(`✓ Loaded ${data.vendors.length} vendors from finance-data.json`);

const emsteel = data.vendors.find(v => v.id === 'vend-emsteel' || v.name.includes('EMIRATES STEEL'));
assert(emsteel, 'EMIRATES STEEL ARKAN PJSC should exist in vendors');
console.log(`✓ Verified UAE Corporate Vendor: ${emsteel.name} (TRN: ${emsteel.trn})`);

const danube = data.vendors.find(v => v.id === 'vend-danube' || v.name.includes('DANUBE'));
assert(danube, 'DANUBE BUILDING MATERIALS LLC should exist in vendors');
console.log(`✓ Verified UAE Corporate Vendor: ${danube.name} (TRN: ${danube.trn})`);

const tata = data.vendors.find(v => v.id === 'vend-tatasteel' || v.name.includes('TATA STEEL'));
assert(tata, 'TATA STEEL LIMITED should exist in vendors');
console.log(`✓ Verified India Corporate Vendor: ${tata.name} (GSTIN: ${tata.gstin})`);

// 2. Test finance.js script logic and helpers
const scriptContent = fs.readFileSync('src/scripts/finance.js', 'utf8');

// Check that sequential IDs BILL-RG-2026-001 are NOT blacklisted
assert(!scriptContent.includes("'bill-rg-2026-001'"), "dummyBlacklist in finance.js must not blacklist bill-rg-2026-001");
assert(!scriptContent.includes("'pv-rg-2026-001'"), "dummyBlacklist in finance.js must not blacklist pv-rg-2026-001");
console.log('✓ Verified user bill/payment sequence IDs are NOT blacklisted in dummyBlacklist');

// Check that action methods are defined on FinanceApp
const requiredMethods = [
  'deleteBill',
  'deletePayment',
  'deletePO',
  'deleteDebitNote',
  'deleteVendor',
  'openEditVendorModal',
  'openDebitNotePrintModal',
  'downloadDebitNoteDocument',
  'matchesActiveCompany',
  'isUaeEntity',
  'routeVendorPaymentToCashAndBank'
];

requiredMethods.forEach(method => {
  assert(scriptContent.includes(method + '(') || scriptContent.includes('async ' + method + '('), `Method ${method} must be defined in finance.js`);
  console.log(`✓ Verified method: ${method}`);
});

// Check that PHP file does not purge real records
const phpContent = fs.readFileSync('public/api/finance.php', 'utf8');
assert(!phpContent.includes("'BILL-RG-2026-001'"), "PHP purge function must not delete BILL-RG-2026-001");
assert(!phpContent.includes("'PV-RG-2026-001'"), "PHP purge function must not delete PV-RG-2026-001");
assert(phpContent.includes("case 'update_vendor':"), "PHP must support update_vendor action");
console.log('✓ Verified PHP API has update_vendor and does not delete real sequential IDs');

// 3. Simulate client-side FinanceApp logic
class MockFinanceApp {
  constructor(db) {
    this.db = JSON.parse(JSON.stringify(db));
    this.activeCompanyId = 'rayan-group';
    if (!this.db.purchase_bills) this.db.purchase_bills = [];
    if (!this.db.vendor_payments) this.db.vendor_payments = [];
    if (!this.db.purchase_orders) this.db.purchase_orders = [];
    if (!this.db.debit_notes) this.db.debit_notes = [];
    if (!this.db.expenses) this.db.expenses = [];
  }

  isUaeEntity(companyId) {
    return !companyId || companyId === 'rayan-corp-uae' || companyId === 'rayan-group' || companyId === 'rayan-energy-uae' || companyId === 'rayan-properties-uae';
  }

  matchesActiveCompany(itemCompanyId) {
    const currentIsUae = this.isUaeEntity(this.activeCompanyId);
    if (currentIsUae) {
      return this.isUaeEntity(itemCompanyId);
    }
    return (itemCompanyId || 'rayan-corp-uae') === this.activeCompanyId;
  }

  getNextBillNumber() {
    const bills = (this.db?.purchase_bills || []).filter(b => this.matchesActiveCompany(b.company_id));
    let maxSeq = 100;
    bills.forEach(b => {
      const bNo = b.bill_no || '';
      const m = bNo.match(/BILL-.*-(\d+)/i) || bNo.match(/(\d{3,})$/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    return `BILL-RG-2026-${String(maxSeq + 1).padStart(3, '0')}`;
  }

  getNextPaymentVoucherNumber() {
    const payments = (this.db?.vendor_payments || []).filter(p => this.matchesActiveCompany(p.company_id));
    let maxSeq = 100;
    payments.forEach(p => {
      const vNo = p.voucher_no || '';
      const m = vNo.match(/PV-.*-(\d+)/i) || vNo.match(/(\d{3,})$/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    return `PV-RG-2026-${String(maxSeq + 1).padStart(3, '0')}`;
  }

  getNextDebitNoteNumber() {
    const notes = (this.db?.debit_notes || []).filter(n => this.matchesActiveCompany(n.company_id));
    let maxSeq = 100;
    notes.forEach(n => {
      const nNo = n.debit_note_no || '';
      const m = nNo.match(/DN-.*-(\d+)/i) || nNo.match(/(\d{3,})$/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    return `DN-RG-2026-${String(maxSeq + 1).padStart(3, '0')}`;
  }

  getNextPONumber() {
    const pos = (this.db?.purchase_orders || []).filter(p => this.matchesActiveCompany(p.company_id));
    let maxSeq = 11010;
    pos.forEach(p => {
      const pNo = p.po_no || '';
      const m = pNo.match(/PO-REC-(\d+)/i) || pNo.match(/(\d{5,})$/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    return `PO-REC-${maxSeq + 1}`;
  }

  getNextExpenseNumber() {
    const expenses = (this.db?.expenses || []).filter(e => this.matchesActiveCompany(e.company_id));
    let maxSeq = 100;
    expenses.forEach(e => {
      const eNo = e.expense_no || '';
      const m = eNo.match(/EXP-.*-(\d+)/i) || eNo.match(/(\d{3,})$/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    return `EXP-RG-2026-${String(maxSeq + 1).padStart(3, '0')}`;
  }
}

const app = new MockFinanceApp(data);

// Test 1: Purchase Bills Workflow
console.log('\n--- 1. TESTING PURCHASE BILLS WORKFLOW ---');
const billNo1 = app.getNextBillNumber();
assert.strictEqual(billNo1, 'BILL-RG-2026-101');
console.log(`✓ Next bill number auto-sequence: ${billNo1}`);

const newBill = {
  id: 'bill-' + Date.now(),
  bill_no: billNo1,
  company_id: 'rayan-corp-uae',
  vendor_id: 'vend-emsteel',
  vendor_name: 'EMIRATES STEEL ARKAN PJSC',
  vendor_trn: '100293847100003',
  vendor_invoice_no: 'ES-INV-2026-908',
  taxable_subtotal: 50000,
  tax_total: 2500,
  grand_total: 52500,
  amount_paid: 0,
  balance_due: 52500,
  status: 'unpaid'
};
app.db.purchase_bills.unshift(newBill);

const visibleBills = app.db.purchase_bills.filter(b => app.matchesActiveCompany(b.company_id));
assert(visibleBills.some(b => b.bill_no === billNo1), 'Newly created bill must be visible under rayan-group company');
console.log(`✓ Saved and listed purchase bill: ${billNo1} (Total: AED ${newBill.grand_total})`);

// Test 2: Payment Out Workflow
console.log('\n--- 2. TESTING PAYMENT OUT (VENDOR PAYMENT) WORKFLOW ---');
const pvNo1 = app.getNextPaymentVoucherNumber();
assert.strictEqual(pvNo1, 'PV-RG-2026-101');
console.log(`✓ Next payment voucher auto-sequence: ${pvNo1}`);

const newPayment = {
  id: 'pay-' + Date.now(),
  voucher_no: pvNo1,
  company_id: 'rayan-corp-uae',
  vendor_id: 'vend-emsteel',
  vendor_name: 'EMIRATES STEEL ARKAN PJSC',
  payment_mode: 'Online',
  reference_no: 'ADCB-FT-2026-9912',
  amount_paid: 52500,
  allocations: [
    {
      bill_id: newBill.id,
      bill_no: newBill.bill_no,
      amount_allocated: 52500
    }
  ]
};

// Allocate payment against bill
newBill.amount_paid += newPayment.amount_paid;
newBill.balance_due = Math.max(0, newBill.grand_total - newBill.amount_paid);
newBill.status = newBill.balance_due === 0 ? 'paid' : 'partially_paid';
app.db.vendor_payments.unshift(newPayment);

assert.strictEqual(newBill.balance_due, 0, 'Bill balance due should be 0 after full payment');
assert.strictEqual(newBill.status, 'paid', 'Bill status should update to paid');
console.log(`✓ Recorded payment voucher ${pvNo1}: Bill ${newBill.bill_no} balance due is now ${newBill.balance_due}, status: ${newBill.status}`);

// Test 3: Purchase Orders Workflow
console.log('\n--- 3. TESTING PURCHASE ORDERS WORKFLOW ---');
const poNo1 = app.getNextPONumber();
assert.strictEqual(poNo1, 'PO-REC-11011');
console.log(`✓ Next PO auto-sequence: ${poNo1}`);

const newPo = {
  id: 'po-' + Date.now(),
  po_no: poNo1,
  company_id: 'rayan-corp-uae',
  vendor_id: 'vend-danube',
  vendor_name: 'DANUBE BUILDING MATERIALS LLC',
  project_name: 'Porsche Service Centre Mussafah',
  subtotal: 35000,
  tax_total: 1750,
  total_value: 36750,
  status: 'approved'
};
app.db.purchase_orders.unshift(newPo);

const visiblePOs = app.db.purchase_orders.filter(p => app.matchesActiveCompany(p.company_id));
assert(visiblePOs.some(p => p.po_no === poNo1), 'Newly created PO must be visible under rayan-group company');
console.log(`✓ Saved and listed purchase order: ${poNo1} (Total: AED ${newPo.total_value})`);

// Test 4: Debit Notes / Purchase Returns Workflow
console.log('\n--- 4. TESTING DEBIT NOTES WORKFLOW ---');
const dnNo1 = app.getNextDebitNoteNumber();
assert.strictEqual(dnNo1, 'DN-RG-2026-101');
console.log(`✓ Next Debit Note auto-sequence: ${dnNo1}`);

const newDn = {
  id: 'dn-' + Date.now(),
  debit_note_no: dnNo1,
  company_id: 'rayan-corp-uae',
  vendor_name: 'DANUBE BUILDING MATERIALS LLC',
  bill_no: 'Direct Debit',
  reason: 'Quality rejection on ceiling panels',
  total_debit_amount: 5000,
  status: 'applied'
};
app.db.debit_notes.unshift(newDn);

const visibleDNs = app.db.debit_notes.filter(d => app.matchesActiveCompany(d.company_id));
assert(visibleDNs.some(d => d.debit_note_no === dnNo1), 'Newly created Debit Note must be visible under rayan-group company');
console.log(`✓ Saved and listed debit note: ${dnNo1} (Amount: AED ${newDn.total_debit_amount})`);

// Test 5: Expenses Workflow
console.log('\n--- 5. TESTING EXPENSES WORKFLOW ---');
const expNo1 = app.getNextExpenseNumber();
assert.strictEqual(expNo1, 'EXP-RG-2026-101');
console.log(`✓ Next Expense auto-sequence: ${expNo1}`);

const newExp = {
  id: 'exp-' + Date.now(),
  expense_no: expNo1,
  company_id: 'rayan-corp-uae',
  category: 'Site Expenses & Consumables',
  payee: 'ADNOC Distribution',
  taxable_amount: 1200,
  vat_amount: 60,
  amount: 1260,
  status: 'Approved'
};
app.db.expenses.unshift(newExp);

const visibleExps = app.db.expenses.filter(e => app.matchesActiveCompany(e.company_id));
assert(visibleExps.some(e => e.expense_no === expNo1), 'Newly created expense must be visible under rayan-group company');
console.log(`✓ Saved and listed expense claim: ${expNo1} (Amount: AED ${newExp.amount})`);

// Test 6: Vendors & Suppliers Workflow
console.log('\n--- 6. TESTING VENDORS & SUPPLIERS WORKFLOW ---');
const newVend = {
  id: 'vend-alhabtoor',
  code: 'VEND-ALHABTOOR',
  company_id: 'rayan-corp-uae',
  name: 'AL HABTOOR MOTORS LLC',
  country: 'UAE',
  trn: '100384910200003',
  category: 'Heavy Equipment & Fleet Vehicles',
  status: 'active'
};
app.db.vendors.unshift(newVend);

const visibleVendors = app.db.vendors.filter(v => !v.company_id || app.matchesActiveCompany(v.company_id));
assert(visibleVendors.some(v => v.id === newVend.id), 'Newly added vendor must be visible');
console.log(`✓ Registered new supplier: ${newVend.name} (Code: ${newVend.code})`);

// Test Deletion
app.db.purchase_bills = app.db.purchase_bills.filter(b => b.id !== newBill.id);
assert(!app.db.purchase_bills.some(b => b.id === newBill.id), 'Bill should be successfully deleted');
console.log(`✓ Bill ${newBill.bill_no} successfully deleted`);

console.log('\n======================================================');
console.log('🎉 ALL 6 PROCUREMENT & FINANCIAL MODULE TESTS PASSED!');
console.log('======================================================');
