const fs = require('fs');

let php = fs.readFileSync('public/api/finance.php', 'utf8').replace(/\r\n/g, '\n');

const searchMarker = '$pdo->exec("DELETE FROM finance_invoices WHERE invoice_no IN (\'REC-RG-INV-44035\'';
const endPdoMarker = '$pdo->exec("UPDATE finance_customer_receipts SET';

const startIdx = php.indexOf(searchMarker);
const endIdx = php.indexOf(endPdoMarker);

console.log('startIdx:', startIdx, 'endIdx:', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const replacePdoBlock = [
    '// v2026_clean_v17: Refresh MySQL tables with the verified RGC Sales dataset',
    '            try {',
    '                $chkMig = $pdo->query("SELECT value FROM finance_settings WHERE id = \'sales_migration_v17\'")->fetchColumn();',
    '            } catch (Exception $e) { $chkMig = false; }',
    '            if (!$chkMig) {',
    '                $pdo->exec("DELETE FROM finance_invoices WHERE company_id = \'rayan-corp-uae\'");',
    '                $pdo->exec("DELETE FROM finance_receipts WHERE data_json LIKE \'%rayan-corp-uae%\'");',
    '                $pdo->exec("DELETE FROM finance_credit_notes WHERE data_json LIKE \'%rayan-corp-uae%\'");',
    '                $pdo->exec("DELETE FROM finance_customers WHERE company_id = \'rayan-corp-uae\'");',
    '',
    '                if (!empty($data[\'invoices\']) && is_array($data[\'invoices\'])) {',
    '                    $stmtInv = $pdo->prepare("REPLACE INTO finance_invoices (id, invoice_no, company_id, customer_id, customer_name, customer_trn, invoice_date, due_date, grand_total, amount_paid, balance_due, currency, status, data_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");',
    '                    foreach ($data[\'invoices\'] as $inv) {',
    '                        $stmtInv->execute([',
    '                            $inv[\'id\'], $inv[\'invoice_no\'], $inv[\'company_id\'] ?? \'rayan-corp-uae\',',
    '                            $inv[\'customer_id\'] ?? \'\', $inv[\'customer_name\'] ?? \'\', $inv[\'customer_trn\'] ?? \'\',',
    '                            $inv[\'invoice_date\'] ?? date(\'Y-m-d\'), $inv[\'due_date\'] ?? date(\'Y-m-d\'),',
    '                            floatval($inv[\'grand_total\'] ?? 0), floatval($inv[\'amount_paid\'] ?? 0),',
    '                            floatval($inv[\'balance_due\'] ?? 0), $inv[\'currency\'] ?? \'AED\',',
    '                            $inv[\'status\'] ?? \'unpaid\', json_encode($inv, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)',
    '                        ]);',
    '                    }',
    '                }',
    '                if (!empty($data[\'customer_receipts\']) && is_array($data[\'customer_receipts\'])) {',
    '                    $stmtRcp = $pdo->prepare("REPLACE INTO finance_receipts (id, receipt_no, customer_id, customer_name, receipt_date, amount_received, currency, payment_mode, reference_no, data_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");',
    '                    foreach ($data[\'customer_receipts\'] as $rcp) {',
    '                        $stmtRcp->execute([',
    '                            $rcp[\'id\'], $rcp[\'receipt_no\'], $rcp[\'customer_id\'] ?? \'\', $rcp[\'customer_name\'] ?? \'\',',
    '                            $rcp[\'receipt_date\'] ?? date(\'Y-m-d\'), floatval($rcp[\'amount_received\'] ?? 0),',
    '                            $rcp[\'currency\'] ?? \'AED\', $rcp[\'payment_mode\'] ?? \'Online\',',
    '                            $rcp[\'reference_no\'] ?? \'\', json_encode($rcp, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)',
    '                        ]);',
    '                    }',
    '                }',
    '                if (!empty($data[\'customers\']) && is_array($data[\'customers\'])) {',
    '                    $stmtCust = $pdo->prepare("REPLACE INTO finance_customers (id, code, name, contact_person, email, phone, trn, gstin, credit_limit, opening_balance, balance, currency, data_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");',
    '                    foreach ($data[\'customers\'] as $c) {',
    '                        $stmtCust->execute([',
    '                            $c[\'id\'], $c[\'code\'] ?? \'\', $c[\'name\'] ?? \'\', $c[\'contact_person\'] ?? \'\',',
    '                            $c[\'email\'] ?? \'\', $c[\'phone\'] ?? \'\', $c[\'trn\'] ?? \'\', $c[\'gstin\'] ?? \'\',',
    '                            floatval($c[\'credit_limit\'] ?? 0), 0, floatval($c[\'outstanding_dues\'] ?? 0),',
    '                            \'AED\', json_encode($c, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)',
    '                        ]);',
    '                    }',
    '                }',
    '                try {',
    '                    $pdo->exec("REPLACE INTO finance_settings (id, value, updated_at) VALUES (\'sales_migration_v17\', \'completed\', NOW())");',
    '                } catch (Exception $e) {}',
    '            }',
    '            '
  ].join('\n');

  php = php.slice(0, startIdx) + replacePdoBlock + php.slice(endIdx);
  fs.writeFileSync('public/api/finance.php', php, 'utf8');
  console.log('finance.php successfully updated with v17 migration!');
} else {
  console.error('Markers not found!');
}

