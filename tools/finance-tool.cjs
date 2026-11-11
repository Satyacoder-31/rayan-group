#!/usr/bin/env node
/**
 * Rayan Group - Finance & Accounts Fast Management CLI
 * Usage:
 *   node tools/finance-tool.cjs inspect <query>
 *   node tools/finance-tool.cjs project <project_code_or_id>
 *   node tools/finance-tool.cjs set-invoice <invoice_no> [--paid] [--amount-paid <num>] [--balance <num>] [--grand-total <num>]
 *   node tools/finance-tool.cjs set-bill <bill_no> [--paid] [--amount-paid <num>] [--balance <num>] [--grand-total <num>]
 *   node tools/finance-tool.cjs sync
 *   node tools/finance-tool.cjs verify
 *   node tools/finance-tool.cjs bump-version
 */

const fs = require('fs');
const path = require('path');

const DB_PATHS = [
  path.resolve(__dirname, '../data/finance-data.json'),
  path.resolve(__dirname, '../public/data/finance-data.json'),
  path.resolve(__dirname, '../dist/data/finance-data.json')
];

const FINANCE_JS_PATH = path.resolve(__dirname, '../src/scripts/finance.js');
const LIVE_API_URL = 'https://rayan-group.com/api/finance.php';

function loadLocalDb() {
  for (const p of DB_PATHS) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch (e) {}
    }
  }
  throw new Error('Could not find or parse local finance-data.json');
}

function saveLocalDb(db) {
  const jsonStr = JSON.stringify(db, null, 2);
  for (const p of DB_PATHS) {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(p, jsonStr, 'utf8');
      console.log(`Saved: ${path.relative(process.cwd(), p)}`);
    } catch (e) {
      console.warn(`Could not save to ${p}:`, e.message);
    }
  }
}

async function fetchLiveDb() {
  try {
    const res = await fetch(`${LIVE_API_URL}?action=get_state`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const state = await res.json();
    return state.data || state;
  } catch (e) {
    console.warn(`Warning: Could not fetch live database (${e.message})`);
    return null;
  }
}

function loadProjectLedgerFunction() {
  const content = fs.readFileSync(FINANCE_JS_PATH, 'utf8');
  const lines = content.split('\n');
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('getProjectLedgerData(projectId)')) {
      start = i;
    }
    if (start !== -1 && lines[i].includes('parseProjectSequence(code)')) {
      end = i;
      break;
    }
  }
  if (start === -1 || end === -1) {
    throw new Error('Could not extract getProjectLedgerData from src/scripts/finance.js');
  }

  const fnBody = lines.slice(start, end).join('\n');
  return fnBody;
}

class MockFinanceApp {
  constructor(db) {
    this.db = db;
    this.activeCompanyId = 'rayan-corp-uae';
    this.activeCurrency = 'AED';
  }
  matchesActiveCompany(cid) {
    return !cid || cid === this.activeCompanyId;
  }
  formatCompanyName(n) { return n || ''; }
  formatCurrency(val) { return `AED ${(Number(val) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
}

// -----------------------------------------------------------------------------
// COMMANDS
// -----------------------------------------------------------------------------

async function cmdInspect(query) {
  if (!query) {
    console.error('Usage: inspect <search_query>');
    process.exit(1);
  }
  const q = String(query).toLowerCase().trim();
  const db = loadLocalDb();
  console.log(`\n🔍 Searching Local Database for: "${query}" ...\n`);

  // Invoices
  const matchedInvs = (db.invoices || []).filter(i => 
    (i.invoice_no && i.invoice_no.toLowerCase().includes(q)) ||
    (i.id && i.id.toLowerCase().includes(q)) ||
    (i.customer_name && i.customer_name.toLowerCase().includes(q)) ||
    (i.project_name && i.project_name.toLowerCase().includes(q))
  );

  console.log(`=== INVOICES (${matchedInvs.length} found) ===`);
  matchedInvs.forEach(i => {
    console.log(`  📄 [${i.invoice_no}] - ${i.customer_name}`);
    console.log(`     Total: AED ${i.grand_total} | Paid: AED ${i.amount_paid} | Due: AED ${i.balance_due} | Status: ${i.status}`);
    console.log(`     Project: ${i.project_name || '(none)'} [${i.project_id || ''}]`);
    console.log(`     TRN: ${i.customer_trn || i.trn || '(none)'} | PO: ${i.po_reference || '(none)'}\n`);
  });

  // Receipts
  const matchedRcp = (db.customer_receipts || []).filter(r => 
    (r.receipt_no && r.receipt_no.toLowerCase().includes(q)) ||
    (r.reference_no && r.reference_no.toLowerCase().includes(q)) ||
    (r.cheque_no && r.cheque_no.toLowerCase().includes(q)) ||
    (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
    (r.project_name && r.project_name.toLowerCase().includes(q)) ||
    (JSON.stringify(r.allocations || []).toLowerCase().includes(q))
  );

  console.log(`=== RECEIPTS (${matchedRcp.length} found) ===`);
  matchedRcp.forEach(r => {
    console.log(`  💵 [${r.receipt_no}] - Received: AED ${r.amount_received} (Allocated: AED ${r.allocated_amount})`);
    console.log(`     Mode: ${r.payment_mode || ''} | Ref/Cheque: ${r.reference_no || r.cheque_no || ''} | Date: ${r.receipt_date}`);
    console.log(`     Allocations: ${JSON.stringify(r.allocations || [])}\n`);
  });

  // Bills
  const matchedBills = (db.purchase_bills || []).filter(b => 
    (b.bill_no && b.bill_no.toLowerCase().includes(q)) ||
    (b.id && b.id.toLowerCase().includes(q)) ||
    (b.vendor_name && b.vendor_name.toLowerCase().includes(q)) ||
    (b.project_name && b.project_name.toLowerCase().includes(q))
  );

  console.log(`=== PURCHASE BILLS (${matchedBills.length} found) ===`);
  matchedBills.forEach(b => {
    console.log(`  🧾 [${b.bill_no}] - ${b.vendor_name}`);
    console.log(`     Total: AED ${b.grand_total} | Paid: AED ${b.amount_paid} | Due: AED ${b.balance_due} | Status: ${b.status}`);
    console.log(`     Project: ${b.project_name || '(none)'} [${b.project_id || ''}]\n`);
  });

  // Projects
  const matchedPrjs = (db.projects || []).filter(p => 
    (p.code && p.code.toLowerCase().includes(q)) ||
    (p.id && p.id.toLowerCase().includes(q)) ||
    (p.name && p.name.toLowerCase().includes(q)) ||
    (p.client_name && p.client_name.toLowerCase().includes(q))
  );

  console.log(`=== PROJECTS (${matchedPrjs.length} found) ===`);
  matchedPrjs.forEach(p => {
    console.log(`  🏗️ [${p.code}] - ${p.name}`);
    console.log(`     Contract: AED ${p.contract_value} | Budget: AED ${p.approved_budget} | Status: ${p.status}`);
    console.log(`     ID: ${p.id} | Client: ${p.client_name || p.client || ''}\n`);
  });
}

async function cmdProject(projQuery) {
  if (!projQuery) {
    console.error('Usage: project <project_code_or_id>');
    process.exit(1);
  }
  const q = String(projQuery).toLowerCase().trim();
  const db = loadLocalDb();
  const prj = (db.projects || []).find(p => 
    (p.code && p.code.toLowerCase().includes(q)) ||
    (p.id && p.id.toLowerCase() === q) ||
    (p.name && p.name.toLowerCase().includes(q))
  );

  if (!prj) {
    console.error(`Project matching "${projQuery}" not found!`);
    process.exit(1);
  }

  const app = new MockFinanceApp(db);
  const fnBody = loadProjectLedgerFunction();
  eval('MockFinanceApp.prototype.getProjectLedgerData = ' + fnBody.replace(/getProjectLedgerData\(projectId\)\s*\{/, 'function(projectId) {'));

  const ledger = app.getProjectLedgerData(prj.id);
  if (!ledger) {
    console.error(`Failed to calculate ledger for project ${prj.code}`);
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log(`🏗️  PROJECT FINANCIAL CARD: ${prj.code}`);
  console.log(`    ${prj.name}`);
  console.log(`    Client: ${prj.client_name || prj.client || 'Corporate Client'} | Status: ${prj.status}`);
  console.log('======================================================');
  console.log(`  Contract Value:        AED ${(Number(prj.contract_value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`  Approved Budget:       AED ${(Number(prj.approved_budget) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`  Invoiced Gross:        AED ${(ledger.invoiced || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`  Credit Notes:          -AED ${(ledger.credited || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`  Net Invoiced:          AED ${(ledger.netInvoiced || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`  Customer Collections:  AED ${(ledger.collected || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`  Pending Client Due:    AED ${(ledger.pendingDue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`  Total Costs & Exp:     AED ${(ledger.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`    • Bills: AED ${(ledger.billsCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`    • Site Exp: AED ${(ledger.siteExpenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`    • Salaries: AED ${(ledger.salariesCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`  Net Profit:            AED ${(ledger.netProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} (${ledger.profitMargin}%)`);
  console.log(`  Cash Flow Position:    AED ${(ledger.cashPosition || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log('------------------------------------------------------');
  console.log(`  Linked Invoices:       ${ledger.prjInvoices.length} (${ledger.prjInvoices.map(i => i.invoice_no).join(', ')})`);
  console.log(`  Linked Receipts:       ${ledger.prjReceipts.length} (${ledger.prjReceipts.map(r => r.receipt_no).join(', ')})`);
  console.log(`  Linked Credit Notes:   ${ledger.prjCreditNotes.length} (${ledger.prjCreditNotes.map(c => c.credit_note_no).join(', ')})`);
  console.log(`  Linked Bills:          ${ledger.prjBills.length} (${ledger.prjBills.map(b => b.bill_no).join(', ')})`);
  console.log('======================================================\n');
}

async function cmdSetInvoice(invNo, args) {
  if (!invNo) {
    console.error('Usage: set-invoice <invoice_no> [--paid] [--amount-paid <val>] [--balance <val>] [--grand-total <val>] [--status <status>]');
    process.exit(1);
  }
  const db = loadLocalDb();
  const inv = (db.invoices || []).find(i => (i.invoice_no || '').toLowerCase() === invNo.toLowerCase());
  if (!inv) {
    console.error(`Invoice "${invNo}" not found in database!`);
    process.exit(1);
  }

  console.log(`Updating Invoice: ${inv.invoice_no} (Current: Total ${inv.grand_total}, Paid ${inv.amount_paid}, Balance ${inv.balance_due}, Status ${inv.status})`);

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--paid') {
      inv.amount_paid = Number(inv.grand_total);
      inv.balance_due = 0.00;
      inv.status = 'paid';
    } else if (a === '--unpaid') {
      inv.amount_paid = 0.00;
      inv.balance_due = Number(inv.grand_total);
      inv.status = 'unpaid';
    } else if (a === '--amount-paid' && args[i + 1] !== undefined) {
      inv.amount_paid = Number(args[++i]);
      inv.balance_due = Math.max(0, Math.round((Number(inv.grand_total) - inv.amount_paid - (Number(inv.amount_credited) || 0)) * 100) / 100);
      inv.status = inv.balance_due <= 0.02 ? 'paid' : (inv.amount_paid > 0 ? 'partially_paid' : 'unpaid');
    } else if (a === '--balance' && args[i + 1] !== undefined) {
      inv.balance_due = Number(args[++i]);
      inv.status = inv.balance_due <= 0.02 ? 'paid' : (inv.amount_paid > 0 ? 'partially_paid' : 'unpaid');
    } else if (a === '--grand-total' && args[i + 1] !== undefined) {
      const tot = Number(args[++i]);
      inv.grand_total = tot;
      inv.sub_total = Math.round((tot / 1.05) * 100) / 100;
      inv.taxable_subtotal = inv.sub_total;
      inv.vat_total = Math.round((tot - inv.sub_total) * 100) / 100;
      inv.total_tax = inv.vat_total;
      inv.balance_due = Math.max(0, Math.round((tot - (Number(inv.amount_paid) || 0) - (Number(inv.amount_credited) || 0)) * 100) / 100);
      inv.status = inv.balance_due <= 0.02 ? 'paid' : ((Number(inv.amount_paid) || 0) > 0 ? 'partially_paid' : 'unpaid');
    } else if (a === '--status' && args[i + 1] !== undefined) {
      inv.status = args[++i];
    }
  }

  saveLocalDb(db);
  console.log(`✅ Invoice ${inv.invoice_no} updated: Total ${inv.grand_total}, Paid ${inv.amount_paid}, Balance ${inv.balance_due}, Status ${inv.status}\n`);
}

async function cmdSetBill(billNo, args) {
  if (!billNo) {
    console.error('Usage: set-bill <bill_no> [--paid] [--amount-paid <val>] [--balance <val>] [--grand-total <val>] [--status <status>]');
    process.exit(1);
  }
  const db = loadLocalDb();
  const bill = (db.purchase_bills || []).find(b => (b.bill_no || '').toLowerCase() === billNo.toLowerCase());
  if (!bill) {
    console.error(`Purchase Bill "${billNo}" not found in database!`);
    process.exit(1);
  }

  console.log(`Updating Bill: ${bill.bill_no} (Current: Total ${bill.grand_total}, Paid ${bill.amount_paid}, Balance ${bill.balance_due}, Status ${bill.status})`);

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--paid') {
      bill.amount_paid = Number(bill.grand_total);
      bill.balance_due = 0.00;
      bill.status = 'paid';
    } else if (a === '--unpaid') {
      bill.amount_paid = 0.00;
      bill.balance_due = Number(bill.grand_total);
      bill.status = 'unpaid';
    } else if (a === '--amount-paid' && args[i + 1] !== undefined) {
      bill.amount_paid = Number(args[++i]);
      bill.balance_due = Math.max(0, Math.round((Number(bill.grand_total) - bill.amount_paid) * 100) / 100);
      bill.status = bill.balance_due <= 0.02 ? 'paid' : (bill.amount_paid > 0 ? 'partially_paid' : 'unpaid');
    } else if (a === '--grand-total' && args[i + 1] !== undefined) {
      const tot = Number(args[++i]);
      bill.grand_total = tot;
      bill.balance_due = Math.max(0, Math.round((tot - (Number(bill.amount_paid) || 0)) * 100) / 100);
      bill.status = bill.balance_due <= 0.02 ? 'paid' : ((Number(bill.amount_paid) || 0) > 0 ? 'partially_paid' : 'unpaid');
    } else if (a === '--status' && args[i + 1] !== undefined) {
      bill.status = args[++i];
    }
  }

  saveLocalDb(db);
  console.log(`✅ Bill ${bill.bill_no} updated: Total ${bill.grand_total}, Paid ${bill.amount_paid}, Balance ${bill.balance_due}, Status ${bill.status}\n`);
}

async function cmdSync() {
  const db = loadLocalDb();
  console.log('\n📤 Pushing full local database to https://rayan-group.com/api/finance.php?action=sync_full ...');

  const res = await fetch(`${LIVE_API_URL}?action=sync_full`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_db: db,
      user_name: 'Arshad Alam Shaikh',
      user_role: 'super_admin',
      user_email: 'superadmin@rayangroup.com'
    })
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`❌ Sync failed with HTTP ${res.status}:`, text.substring(0, 300));
    process.exit(1);
  }

  try {
    const json = JSON.parse(text);
    if (json.success) {
      console.log(`✅ Synchronization SUCCESSFUL! Storage: ${json.storage}\n`);
    } else {
      console.error('❌ Server returned failure:', json);
    }
  } catch (e) {
    console.log('Response:', text.substring(0, 300));
  }
}

async function cmdVerify() {
  const db = loadLocalDb();
  console.log('\n🔍 Verifying all project financials and balances...\n');

  const app = new MockFinanceApp(db);
  const fnBody = loadProjectLedgerFunction();
  eval('MockFinanceApp.prototype.getProjectLedgerData = ' + fnBody.replace(/getProjectLedgerData\(projectId\)\s*\{/, 'function(projectId) {'));

  let issuesFound = 0;
  (db.projects || []).forEach(prj => {
    const l = app.getProjectLedgerData(prj.id);
    if (!l) return;
    const cVal = Number(prj.contract_value) || 0;
    if (cVal > 0) {
      const mathSum = Math.round((l.collected + l.pendingDue) * 100) / 100;
      const diff = Math.abs(mathSum - cVal);
      if (diff > 0.05) {
        issuesFound++;
        console.warn(`⚠️ [MISMATCH] Project ${prj.code} (${prj.name}):`);
        console.warn(`    Contract Value: ${cVal} | Collections: ${l.collected} + PendingDue: ${l.pendingDue} = ${mathSum} (Diff: ${diff.toFixed(2)})`);
      }
    }
  });

  // Verify Invoice Paid Statuses
  (db.invoices || []).forEach(i => {
    const tot = Number(i.grand_total) || 0;
    const paid = Number(i.amount_paid) || 0;
    const bal = Number(i.balance_due) || 0;
    const cr = Number(i.amount_credited) || 0;
    const calcBal = Math.max(0, Math.round((tot - paid - cr) * 100) / 100);
    if (Math.abs(calcBal - bal) > 0.05) {
      issuesFound++;
      console.warn(`⚠️ [INVOICE BALANCE] ${i.invoice_no}: grand_total=${tot}, paid=${paid}, credited=${cr}, stored_bal=${bal}, calculated_bal=${calcBal}`);
    }
  });

  if (issuesFound === 0) {
    console.log('✅ ALL PROJECT FINANCIALS AND INVOICE BALANCES ARE 100% IN HARMONY!\n');
  } else {
    console.log(`\nFound ${issuesFound} issues to review.\n`);
  }
}

function cmdBumpVersion() {
  if (!fs.existsSync(FINANCE_JS_PATH)) {
    console.error('Cannot find src/scripts/finance.js');
    process.exit(1);
  }
  let content = fs.readFileSync(FINANCE_JS_PATH, 'utf8');
  const m = content.match(/CURRENT_DB_VERSION\s*=\s*['"]v2026_clean_v(\d+)['"]/);
  if (!m) {
    console.error('Could not match CURRENT_DB_VERSION in finance.js');
    process.exit(1);
  }
  const curNum = parseInt(m[1], 10);
  const nextNum = curNum + 1;
  const newVer = `v2026_clean_v${nextNum}`;
  content = content.replace(m[0], `CURRENT_DB_VERSION = '${newVer}'`);
  fs.writeFileSync(FINANCE_JS_PATH, content, 'utf8');
  console.log(`✅ Bumped client cache version to: ${newVer}`);
  return newVer;
}

// -----------------------------------------------------------------------------
// MAIN ENTRY
// -----------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const cmd = (args[0] || '').toLowerCase();

  switch (cmd) {
    case 'inspect':
      await cmdInspect(args[1]);
      break;
    case 'project':
      await cmdProject(args[1]);
      break;
    case 'set-invoice':
      await cmdSetInvoice(args[1], args.slice(2));
      break;
    case 'set-bill':
      await cmdSetBill(args[1], args.slice(2));
      break;
    case 'sync':
      await cmdSync();
      break;
    case 'verify':
      await cmdVerify();
      break;
    case 'bump-version':
      cmdBumpVersion();
      break;
    default:
      console.log(`
Rayan Group - Finance & Accounts Fast CLI

Commands:
  inspect <query>          Inspect invoices, receipts, bills & projects matching query
  project <code_or_id>     Calculate and show full Project Financial Card
  set-invoice <inv_no>     Update invoice status, paid amount, balance due, grand total
  set-bill <bill_no>       Update purchase bill status and balances
  sync                     Push full local database to live MySQL server
  verify                   Validate all project ledger math and invoice balances
  bump-version             Bump client localStorage cache version
      `);
      break;
  }
}

main().catch(err => {
  console.error('Command Error:', err);
  process.exit(1);
});
