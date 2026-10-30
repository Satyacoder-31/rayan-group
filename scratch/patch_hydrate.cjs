const fs = require('fs');

let php = fs.readFileSync('public/api/finance.php', 'utf8').replace(/\r\n/g, '\n');

// Find in loadFinanceDb where $masterSeed is used
const target = `$masterSeed = getMasterSeed($candidates);
                    if ($masterSeed && !empty($masterSeed['companies'])) {
                        $data['companies'] = $masterSeed['companies'];
                    }`;

const replacement = `$masterSeed = getMasterSeed($candidates);
                    if ($masterSeed && !empty($masterSeed['companies'])) {
                        $data['companies'] = $masterSeed['companies'];
                    }
                    // Auto-hydrate verified RGC sales dataset if invoices are missing
                    if (empty($data['invoices']) || count($data['invoices']) < 50) {
                        if ($masterSeed && !empty($masterSeed['invoices']) && count($masterSeed['invoices']) >= 50) {
                            $data['invoices'] = $masterSeed['invoices'];
                            $data['customer_receipts'] = $masterSeed['customer_receipts'] ?? [];
                            $data['customers'] = $masterSeed['customers'] ?? [];
                            $data['credit_notes'] = [];
                        }
                    }`;

if (php.includes(target)) {
  php = php.replace(target, replacement);
  console.log('Successfully added auto-hydrate to loadFinanceDb in finance.php');
  fs.writeFileSync('public/api/finance.php', php, 'utf8');
} else {
  console.error('Target not found in finance.php!');
}
