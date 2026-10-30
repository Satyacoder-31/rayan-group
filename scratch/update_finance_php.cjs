const fs = require('fs');

let php = fs.readFileSync('public/api/finance.php', 'utf8');

// 1. In purgeDummyFinanceRecords, add migration v17
const searchPdoBlock = `$pdo->exec("DELETE FROM finance_invoices WHERE invoice_no IN ('REC-RG-INV-44035', 'REC-RG-INV-44015') OR id IN ('inv-rec-rg-inv-44035', 'inv-rec-rg-inv-44015') OR customer_name LIKE '%TOP ROCK%'");
            $topRockJson = json_encode($topRockInvoice, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            $stmt = $pdo->prepare("REPLACE INTO finance_invoices (id, invoice_no, company_id, customer_id, customer_name, customer_trn, invoice_date, due_date, grand_total, amount_paid, balance_due, currency, status, data_json, updated_at) VALUES (
                'inv-rec-rg-inv-44035',
                'REC-RG-INV-44035',
                'rayan-corp-uae',
                'cust-1792414691494',
                'M/S TOP ROCK INTERIORS LLC.',
                '100360644700003',
                '2026-06-19',
                '2026-06-19',
                26466.77,
                26466.77,
                0,
                'AED',
                'paid',
                :data_json,
                NOW()
            )");
            $stmt->execute([':data_json' => $topRockJson]);

            $pdo->exec("REPLACE INTO finance_receipts (id, receipt_no, customer_id, customer_name, receipt_date, amount_received, currency, payment_mode, reference_no, data_json, updated_at) VALUES (
                'rec-rv-44035',
                'REC-RV-44035',
                'cust-toprock',
                'M/S TOP ROCK INTERIORS LLC.',
                '2026-10-19',
                26466.77,
                'AED',
                'Online',
                'WIRE-ADCB-99210',
                '{\"id\":\"rec-rv-44035\",\"receipt_no\":\"REC-RV-44035\",\"ref_invoice_no\":\"REC-RG-INV-44035\",\"company_id\":\"rayan-corp-uae\",\"customer_name\":\"M/S TOP ROCK INTERIORS LLC.\",\"amount_received\":26466.77,\"currency\":\"AED\",\"payment_mode\":\"Online\",\"payment_type\":\"Online Bank Transfer / Corporate Wire\",\"reference_no\":\"WIRE-ADCB-99210\",\"bank_name\":\"Abu Dhabi Commercial Bank (ADCB)\",\"notes\":\"Settlement towards Tax Invoice #REC-RG-INV-44035. Official client collection acknowledgement.\",\"allocations\":[{\"invoice_id\":\"inv-rec-rg-inv-44035\",\"invoice_no\":\"REC-RG-INV-44035\",\"amount_allocated\":26466.77}]}',
                NOW()
            )");`;

const replacePdoBlock = `// v2026_clean_v17: Refresh MySQL tables with the verified RGC Sales dataset
            try {
                $chkMig = $pdo->query("SELECT value FROM finance_settings WHERE id = 'sales_migration_v17'")->fetchColumn();
            } catch (Exception $e) { $chkMig = false; }
            if (!$chkMig) {
                $pdo->exec("DELETE FROM finance_invoices WHERE company_id = 'rayan-corp-uae'");
                $pdo->exec("DELETE FROM finance_receipts WHERE data_json LIKE '%rayan-corp-uae%'");
                $pdo->exec("DELETE FROM finance_credit_notes WHERE data_json LIKE '%rayan-corp-uae%'");
                $pdo->exec("DELETE FROM finance_customers WHERE company_id = 'rayan-corp-uae'");

                if (!empty($data['invoices']) && is_array($data['invoices'])) {
                    $stmtInv = $pdo->prepare("REPLACE INTO finance_invoices (id, invoice_no, company_id, customer_id, customer_name, customer_trn, invoice_date, due_date, grand_total, amount_paid, balance_due, currency, status, data_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
                    foreach ($data['invoices'] as $inv) {
                        $stmtInv->execute([
                            $inv['id'], $inv['invoice_no'], $inv['company_id'] ?? 'rayan-corp-uae',
                            $inv['customer_id'] ?? '', $inv['customer_name'] ?? '', $inv['customer_trn'] ?? '',
                            $inv['invoice_date'] ?? date('Y-m-d'), $inv['due_date'] ?? date('Y-m-d'),
                            floatval($inv['grand_total'] ?? 0), floatval($inv['amount_paid'] ?? 0),
                            floatval($inv['balance_due'] ?? 0), $inv['currency'] ?? 'AED',
                            $inv['status'] ?? 'unpaid', json_encode($inv, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                        ]);
                    }
                }
                if (!empty($data['customer_receipts']) && is_array($data['customer_receipts'])) {
                    $stmtRcp = $pdo->prepare("REPLACE INTO finance_receipts (id, receipt_no, customer_id, customer_name, receipt_date, amount_received, currency, payment_mode, reference_no, data_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
                    foreach ($data['customer_receipts'] as $rcp) {
                        $stmtRcp->execute([
                            $rcp['id'], $rcp['receipt_no'], $rcp['customer_id'] ?? '', $rcp['customer_name'] ?? '',
                            $rcp['receipt_date'] ?? date('Y-m-d'), floatval($rcp['amount_received'] ?? 0),
                            $rcp['currency'] ?? 'AED', $rcp['payment_mode'] ?? 'Online',
                            $rcp['reference_no'] ?? '', json_encode($rcp, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                        ]);
                    }
                }
                if (!empty($data['customers']) && is_array($data['customers'])) {
                    $stmtCust = $pdo->prepare("REPLACE INTO finance_customers (id, code, name, contact_person, email, phone, trn, gstin, credit_limit, opening_balance, balance, currency, data_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
                    foreach ($data['customers'] as $c) {
                        $stmtCust->execute([
                            $c['id'], $c['code'] ?? '', $c['name'] ?? '', $c['contact_person'] ?? '',
                            $c['email'] ?? '', $c['phone'] ?? '', $c['trn'] ?? '', $c['gstin'] ?? '',
                            floatval($c['credit_limit'] ?? 0), 0, floatval($c['outstanding_dues'] ?? 0),
                            'AED', json_encode($c, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                        ]);
                    }
                }
                try {
                    $pdo->exec("REPLACE INTO finance_settings (id, value, updated_at) VALUES ('sales_migration_v17', 'completed', NOW())");
                } catch (Exception $e) {}
            }`;

if (php.includes(searchPdoBlock)) {
  php = php.replace(searchPdoBlock, replacePdoBlock);
  console.log('Successfully replaced searchPdoBlock in finance.php');
} else {
  console.error('searchPdoBlock not found in finance.php!');
}

// 2. Clean deduplication in sanitizeAndDeduplicateData
// Find starting point:
const startMarker = `// 2. Deduplicate receipts and cleanly handle TOP ROCK REC-RV-44035`;
const endMarker = `// 5. Automatic self-healing guarantee:`;

const startIdx = php.indexOf(startMarker);
const endIdx = php.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `// 2. Deduplicate receipts by receipt_no / id
        $dedupedReceipts = [];
        foreach ($filtered as $r) {
            $rcpId = strtolower(trim($r['id'] ?? ''));
            $rcpNo = strtoupper(trim($r['receipt_no'] ?? ''));
            $key = $rcpNo ?: $rcpId;
            if (!$key) continue;
            $dedupedReceipts[$key] = $r;
        }

        `;
  php = php.slice(0, startIdx) + replacement + php.slice(endIdx);
  console.log('Successfully replaced receipt deduplication block in finance.php');
} else {
  console.error('Deduplication markers not found in finance.php!');
}

fs.writeFileSync('public/api/finance.php', php, 'utf8');
console.log('finance.php updated successfully!');

