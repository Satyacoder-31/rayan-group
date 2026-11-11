const fs = require('fs');

async function verifyLive() {
  console.log('Fetching live database from https://rayan-group.com/api/finance.php?action=get_state ...');
  const res = await fetch('https://rayan-group.com/api/finance.php?action=get_state');
  const state = await res.json();
  const db = state.data || state;

  console.log('Fetched successfully.');

  // Let's check Chipotle invoices
  const chipInvs = (db.invoices || []).filter(i => 
    (i.invoice_no && ['REC-RG-INV-44010', 'REC-RG-INV-44014', 'REC-RG-INV-44015', 'REC-RG-INV-44019'].includes(i.invoice_no))
  );
  console.log('--- LIVE INVOICES ---');
  chipInvs.forEach(i => console.log(i.invoice_no, 'grand_total:', i.grand_total, 'paid:', i.amount_paid, 'due:', i.balance_due, 'status:', i.status));

  // Let's check credit notes
  const chipCNs = (db.credit_notes || []).filter(c => 
    c.credit_note_no === 'CN-REC-015' || c.ref_invoice_no === 'REC-RG-INV-44014' || c.credit_note_no === 'CN-REC-021'
  );
  console.log('--- LIVE CREDIT NOTES ---');
  chipCNs.forEach(c => console.log(c.credit_note_no, 'ref_inv:', c.ref_invoice_no, 'amount:', c.total_credit_amount));

  // Let's check receipts
  const chipRVs = (db.customer_receipts || []).filter(r => 
    ['rec-mvy4dz7o', 'rec-mvy4fwvn'].includes(r.id) || ['REC-RV-44028', 'REC-RV-44029', 'REC-RV-44031', 'REC-RV-44046'].includes(r.receipt_no)
  );
  console.log('--- LIVE RECEIPTS ---');
  chipRVs.forEach(r => console.log(r.receipt_no, 'received:', r.amount_received, 'allocated:', r.allocated_amount, 'allocs:', JSON.stringify(r.allocations)));

  // Run ledger function from finance.js
  class MockApp {
    constructor(db) { this.db = db; this.activeCompanyId = 'rayan-corp-uae'; this.activeCurrency = 'AED'; }
    matchesActiveCompany(cid) { return !cid || cid === this.activeCompanyId; }
    formatCompanyName(n) { return n; }
  }
  const app = new MockApp(db);
  const content = fs.readFileSync('src/scripts/finance.js', 'utf8');
  const lines = content.split('\n');
  const start = 9200; // Find getProjectLedgerData
  let fnBody = '';
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('getProjectLedgerData(projectId)')) {
      for (let j = i; j < i + 250; j++) {
        fnBody += lines[j] + '\n';
        if (lines[j].trim() === '};' && j > i + 100) break;
      }
      break;
    }
  }

  eval('MockApp.prototype.getProjectLedgerData = ' + fnBody.replace(/getProjectLedgerData\(projectId\)\s*\{/, 'function(projectId) {'));

  const ledger = app.getProjectLedgerData('prj-mw3rnn9m');
  console.log('\n=== LIVE LEDGER RESULT FOR CHIPOTLE ===');
  console.log(JSON.stringify({
    invoiced: ledger.invoiced,
    credited: ledger.credited,
    netInvoiced: ledger.netInvoiced,
    collected: ledger.collected,
    pendingDue: ledger.pendingDue,
    billsCost: ledger.billsCost,
    totalCost: ledger.totalCost,
    netProfit: ledger.netProfit,
    profitMargin: ledger.profitMargin,
    cashPosition: ledger.cashPosition
  }, null, 2));
}

verifyLive();

