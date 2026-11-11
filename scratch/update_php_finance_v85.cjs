const fs = require('fs');

let php = fs.readFileSync('public/api/finance.php', 'utf8');

// 1. Remove cn-1793555201785 from cnSerialMap
php = php.replace(
  "                    ['id' => 'cn-1793555201785', 'inv' => 'REC-RG-INV-44014', 'date' => '2025-06-15', 'new_no' => 'CN-REC-015'],\r\n",
  ""
);
php = php.replace(
  "                    ['id' => 'cn-1793555201785', 'inv' => 'REC-RG-INV-44014', 'date' => '2025-06-15', 'new_no' => 'CN-REC-015'],\n",
  ""
);

// 2. Remove cn-1793555201785 from cnCanonicalList
php = php.replace(
  "                            ['id' => 'cn-1793555201785', 'inv' => 'REC-RG-INV-44014', 'date' => '2025-06-15', 'no' => 'CN-REC-015'],\r\n",
  ""
);
php = php.replace(
  "                            ['id' => 'cn-1793555201785', 'inv' => 'REC-RG-INV-44014', 'date' => '2025-06-15', 'no' => 'CN-REC-015'],\n",
  ""
);

// 3. Add Migration v85
const migrationV85 = `                    // Migration v85: Reconcile Chipotle Project PRJ-REC-102-CHIP-2025 financials down to the fil
                    try {
                        $chkChip85 = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'chipotle_fils_reconcile_v85'")->fetchColumn();
                        if (!$chkChip85) {
                            $pdo->exec("UPDATE finance_invoices SET grand_total = 20044.43, sub_total = 19089.93, taxable_subtotal = 19089.93, vat_total = 954.50, total_tax = 954.50, amount_paid = 20044.43, balance_due = 0.00, amount_credited = 0.00, status = 'paid' WHERE invoice_no = 'REC-RG-INV-44010'");
                            $pdo->exec("UPDATE finance_invoices SET grand_total = 20044.01, amount_paid = 20044.01, balance_due = 0.00, amount_credited = 0.00, status = 'paid' WHERE invoice_no = 'REC-RG-INV-44014'");
                            $pdo->exec("UPDATE finance_invoices SET grand_total = 67784.14, amount_paid = 50000.00, balance_due = 17784.14, status = 'partially_paid' WHERE invoice_no = 'REC-RG-INV-44015'");
                            $pdo->exec("UPDATE finance_customer_receipts SET amount_received = 20044.01, allocated_amount = 20044.01, allocations = '[{\\"invoice_id\\":\\"inv-rec-rg-inv-44014\\",\\"invoice_no\\":\\"REC-RG-INV-44014\\",\\"amount_allocated\\":20044.01}]' WHERE id = 'rec-mvy4fwvn' OR receipt_no = 'REC-RV-44031' OR reference_no = '017236'");
                            $pdo->exec("DELETE FROM finance_credit_notes WHERE id = 'cn-1793555201785' OR credit_note_no = 'CN-REC-015'");
                            $pdo->exec("UPDATE finance_projects SET contract_value = 107872.58, approved_budget = 107872.58 WHERE id = 'prj-mw3rnn9m' OR code = 'PRJ-REC-102-CHIP-2025'");
                            $pdo->exec("REPLACE INTO finance_settings (setting_key, setting_val, updated_at) VALUES ('chipotle_fils_reconcile_v85', 'completed', NOW())");
                        }
                    } catch (Exception $e) {}

`;

const anchor = "                    // Migration v47: Universal M/S normalization across MySQL tables";
if (php.includes(anchor)) {
  php = php.replace(anchor, migrationV85 + anchor);
  console.log('Added Migration v85 to finance.php');
} else {
  console.error('Anchor for migration not found in finance.php');
}

fs.writeFileSync('public/api/finance.php', php);
console.log('public/api/finance.php saved!');
