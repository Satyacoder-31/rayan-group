const fs = require('fs');

let php = fs.readFileSync('public/api/finance.php', 'utf8');
const isCRLF = php.includes('\r\n');
if (isCRLF) {
  php = php.replace(/\r\n/g, '\n');
}

// 1. Version tag
php = php.replace(
  "'version_tag' => 'v77_bank_withdrawal_and_payment_out_fix',",
  "'version_tag' => 'v78_reconcile_paid_invoices',"
);

// 2. Add invoices to purgeDummyFinanceRecords
const target = `            if (($inv['invoice_no'] ?? '') === 'REC-RG-INV-44008' || ($inv['id'] ?? '') === 'inv-rec-rg-inv-44008') {
                $inv['amount_credited'] = 0.00;
                $inv['amount_paid'] = 5000.00;
                $inv['balance_due'] = 0.00;
                $inv['status'] = 'paid';
                $changed = true;
            }`;

const replacement = `            if (($inv['invoice_no'] ?? '') === 'REC-RG-INV-44008' || ($inv['id'] ?? '') === 'inv-rec-rg-inv-44008') {
                $inv['amount_credited'] = 0.00;
                $inv['amount_paid'] = 5000.00;
                $inv['balance_due'] = 0.00;
                $inv['status'] = 'paid';
                $changed = true;
            }
            if (($inv['invoice_no'] ?? '') === 'REC-RG-INV-44006' || ($inv['id'] ?? '') === 'inv-rec-rg-inv-44006') {
                $inv['amount_paid'] = 185597.36;
                $inv['balance_due'] = 0.00;
                $inv['status'] = 'paid';
                $changed = true;
            }
            if (($inv['invoice_no'] ?? '') === 'REC-RG-INV-44009' || ($inv['id'] ?? '') === 'inv-rec-rg-inv-44009') {
                $inv['amount_paid'] = 19668.60;
                $inv['balance_due'] = 0.00;
                $inv['status'] = 'paid';
                $changed = true;
            }
            if (($inv['invoice_no'] ?? '') === 'REC-RG-INV-44003' || ($inv['id'] ?? '') === 'inv-rec-rg-inv-44003') {
                $inv['amount_paid'] = 9000.00;
                $inv['balance_due'] = 0.00;
                $inv['status'] = 'paid';
                $inv['project_id'] = 'prj-mw4m1wc8';
                $inv['project_name'] = 'Project # Al Lisaili Villa Dubai';
                $changed = true;
            }
            if (($inv['invoice_no'] ?? '') === 'REC-RG-INV-1005' || ($inv['id'] ?? '') === 'inv-rec-rg-inv-1005') {
                $inv['amount_paid'] = 48300.00;
                $inv['balance_due'] = 0.00;
                $inv['status'] = 'paid';
                $changed = true;
            }`;

if (!php.includes(target)) {
  console.error('Target not found in public/api/finance.php!');
  process.exit(1);
}

php = php.replace(target, replacement);
if (isCRLF) {
  php = php.replace(/\n/g, '\r\n');
}
fs.writeFileSync('public/api/finance.php', php, 'utf8');
console.log('Successfully updated public/api/finance.php!');

