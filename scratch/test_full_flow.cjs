const fs = require('fs');

async function testFullFlow() {
  const res = await fetch('https://rayan-group.com/api/finance.php?action=get_state');
  const state = await res.json();
  const db = state.data || state;

  class MockApp {
    constructor(db) { this.db = db; this.activeCompanyId = 'rayan-corp-uae'; this.activeCurrency = 'AED'; }
    matchesActiveCompany(cid) { return !cid || cid === this.activeCompanyId; }
    formatCompanyName(n) { return n; }
    recalculateInvoiceBalance(inv) {}
    recalculateBillBalance(b) {}
    matchInvoiceRef(i, no, id) {
      if (!i) return false;
      const curNo = (i.invoice_no || '').toLowerCase().trim();
      const curId = (i.id || '').toLowerCase().trim();
      if (no && (curNo === no.toLowerCase().trim() || curId === no.toLowerCase().trim())) return true;
      if (id && (curId === id.toLowerCase().trim() || curNo === id.toLowerCase().trim())) return true;
      return false;
    }
  }
  const app = new MockApp(db);
  const content = fs.readFileSync('src/scripts/finance.js', 'utf8');

  // Load normalizeAllBalances (lines 831 to 1605)
  const normLines = content.split('\n').slice(830, 1605).join('\n');
  eval('MockApp.prototype.normalizeAllBalances = ' + normLines.replace(/normalizeAllBalances\(\)\s*\{/, 'function() {'));

  // Load getProjectLedgerData (lines 9239 to 9461)
  const ledgerLines = content.split('\n').slice(9238, 9460).join('\n');
  eval('MockApp.prototype.getProjectLedgerData = ' + ledgerLines.replace(/getProjectLedgerData\(projectId\)\s*\{/, 'function(projectId) {'));

  app.normalizeAllBalances();

  const ledger = app.getProjectLedgerData('prj-mw3rnn9m');
  console.log('\n=============================================');
  console.log('FINAL BROWSER SIMULATION ON LIVE DATA:');
  console.log('Customer Collections: AED', ledger.collected);
  console.log('Pending Client Due:   AED', ledger.pendingDue);
  console.log('Total Costs:          AED', ledger.totalCost);
  console.log('Net Profit:           AED', ledger.netProfit, '(' + ledger.profitMargin + '%)');
  console.log('Cash Flow Position:   AED', ledger.cashPosition);
  console.log('Invoiced:             AED', ledger.invoiced);
  console.log('Credited:             AED', ledger.credited);
  console.log('Net Invoiced:         AED', ledger.netInvoiced);
  console.log('=============================================\n');
}

testFullFlow();
