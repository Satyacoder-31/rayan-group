const fs = require('fs');

// 1. Update src/scripts/finance.js
let js = fs.readFileSync('src/scripts/finance.js', 'utf8');
js = js.replace("CURRENT_DB_VERSION = 'v2026_clean_v85'", "CURRENT_DB_VERSION = 'v2026_clean_v86'");

const billAddition = `    const bill1007 = (this.db.purchase_bills || []).find(b => b.bill_no === 'BILL-REC-1007' || b.id === 'bill-1793987304049');
    if (bill1007) {
      bill1007.amount_paid = 90499.27;
      bill1007.balance_due = 0.00;
      bill1007.status = 'paid';
    }
`;

const jsAnchor = "    const inv44015 = (this.db.invoices || []).find(i => i.invoice_no === 'REC-RG-INV-44015');";
if (js.includes(jsAnchor)) {
  js = js.replace(jsAnchor, billAddition + jsAnchor);
  console.log('Added bill1007 normalization to finance.js');
}
fs.writeFileSync('src/scripts/finance.js', js);

// 2. Update public/api/finance.php
let php = fs.readFileSync('public/api/finance.php', 'utf8');
php = php.replace(
  "// Migration v85: Reconcile Chipotle Project PRJ-REC-102-CHIP-2025 financials down to the fil",
  "// Migration v86: Reconcile Chipotle Project PRJ-REC-102-CHIP-2025 financials down to the fil"
);
php = php.replace(
  "$chkChip85 = $pdo->query(\"SELECT setting_val FROM finance_settings WHERE setting_key = 'chipotle_fils_reconcile_v85'\")->fetchColumn();",
  "$chkChip86 = $pdo->query(\"SELECT setting_val FROM finance_settings WHERE setting_key = 'chipotle_fils_reconcile_v86'\")->fetchColumn();"
);
php = php.replace(
  "if (!$chkChip85) {",
  "if (!$chkChip86) {"
);
php = php.replace(
  "$pdo->exec(\"REPLACE INTO finance_settings (setting_key, setting_val, updated_at) VALUES ('chipotle_fils_reconcile_v85', 'completed', NOW())\");",
  `$pdo->exec("UPDATE finance_purchase_bills SET amount_paid = 90499.27, balance_due = 0.00, status = 'paid' WHERE bill_no = 'BILL-REC-1007' OR id = 'bill-1793987304049'");
                            $pdo->exec("REPLACE INTO finance_settings (setting_key, setting_val, updated_at) VALUES ('chipotle_fils_reconcile_v86', 'completed', NOW())");`
);
fs.writeFileSync('public/api/finance.php', php);
console.log('Updated public/api/finance.php for Migration v86');

// 3. Ensure updated_db.json and data files have bill1007 fully paid
const db = JSON.parse(fs.readFileSync('scratch/updated_db.json', 'utf8'));
const b = (db.purchase_bills || []).find(x => x.bill_no === 'BILL-REC-1007' || x.id === 'bill-1793987304049');
if (b) {
  b.amount_paid = 90499.27;
  b.balance_due = 0.00;
  b.status = 'paid';
}
const updatedStr = JSON.stringify(db, null, 2);
fs.writeFileSync('scratch/updated_db.json', updatedStr);
fs.writeFileSync('data/finance-data.json', updatedStr);
fs.writeFileSync('public/data/finance-data.json', updatedStr);
fs.writeFileSync('dist/data/finance-data.json', updatedStr);
console.log('Synchronized database files for v86');
