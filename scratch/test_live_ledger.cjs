const fs = require('fs');

async function check() {
  const res = await fetch('https://rayan-group.com/api/finance.php?action=get_state');
  const state = await res.json();
  const db = state.data || state;

  class MockApp {
    constructor(db) { this.db = db; this.activeCompanyId = 'rayan-corp-uae'; this.activeCurrency = 'AED'; }
    matchesActiveCompany(cid) { return !cid || cid === this.activeCompanyId; }
    formatCompanyName(n) { return n; }
  }
  const app = new MockApp(db);
  const content = fs.readFileSync('src/scripts/finance.js', 'utf8');
  const lines = content.split('\n');
  const fnBody = lines.slice(9232, 9454).join('\n');
  eval('MockApp.prototype.getProjectLedgerData = ' + fnBody.replace(/getProjectLedgerData\(projectId\)\s*\{/, 'function(projectId) {'));

  const ledger = app.getProjectLedgerData('prj-mw3rnn9m');
  console.log('LIVE LEDGER RESULT:');
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

check();
