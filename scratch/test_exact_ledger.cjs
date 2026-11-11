const fs = require('fs');

const db = JSON.parse(fs.readFileSync('dist/data/finance-data.json', 'utf8'));

class MockApp {
  constructor(db) {
    this.db = db;
    this.activeCompanyId = 'rayan-corp-uae';
    this.activeCurrency = 'AED';
  }
  matchesActiveCompany(cid) {
    return !cid || cid === this.activeCompanyId;
  }
  formatCompanyName(n) { return n; }
}

const app = new MockApp(db);
const content = fs.readFileSync('src/scripts/finance.js', 'utf8');
const lines = content.split('\n');
const start = 9185;
const end = 9407;

const fnBody = lines.slice(start, end).join('\n');
eval('MockApp.prototype.getProjectLedgerData = ' + fnBody.replace(/getProjectLedgerData\(projectId\)\s*\{/, 'function(projectId) {'));

const res = app.getProjectLedgerData('prj-mw3rnn9m');
console.log('Result for Chipotle:', {
  invoiced: res.invoiced,
  credited: res.credited,
  netInvoiced: res.netInvoiced,
  collected: res.collected,
  pendingDue: res.pendingDue,
  billsCost: res.billsCost,
  siteExpenses: res.siteExpenses,
  totalCost: res.totalCost,
  netProfit: res.netProfit,
  profitMargin: res.profitMargin,
  cashPosition: res.cashPosition
});
