const fs = require('fs');

let php = fs.readFileSync('public/api/finance.php', 'utf8');

// 1. Replace all hardcoded 100360644700003 with 104571196000003
php = php.replace(/100360644700003/g, '104571196000003');

// 2. Guard lines around 871 so it doesn't overwrite future edits
const target871 = `$pdo->exec("UPDATE finance_invoices SET 
                customer_id = 'cust-toprock',
                customer_name = 'M/S TOP ROCK INTERIORS LLC.',
                customer_trn = '104571196000003',
                data_json = JSON_SET(
                    data_json, 
                    '$.customer_id', 'cust-toprock', 
                    '$.customer_name', 'M/S TOP ROCK INTERIORS LLC.',
                    '$.customer_trn', '104571196000003',
                    '$.tax_number', '104571196000003',
                    '$.contact_person', 'Mr. Shahil',
                    '$.email', 'procurementofficer@toprockinteriors.com',
                    '$.customer_address', 'TRI Office No.1, Al Qusais Ind Area 1, Dubai, UAE',
                    '$.project_id', 'prj-toprock-police-01',
                    '$.project_name', 'The New Dubai Police Academy @ Al Rowaiyah, Dubai'
                )
            WHERE invoice_no = 'REC-RG-INV-44050' OR id = 'inv-rec-rg-inv-44050'");`;

const guarded871 = `try {
                $chkMig44050 = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'sync_inv_44050_v80'")->fetchColumn();
                if (!$chkMig44050) {
                    $pdo->exec("UPDATE finance_invoices SET 
                        customer_id = 'cust-toprock',
                        customer_name = 'M/S TOP ROCK INTERIORS LLC.',
                        customer_trn = '104571196000003',
                        data_json = JSON_SET(
                            data_json, 
                            '$.customer_id', 'cust-toprock', 
                            '$.customer_name', 'M/S TOP ROCK INTERIORS LLC.',
                            '$.customer_trn', '104571196000003',
                            '$.tax_number', '104571196000003',
                            '$.contact_person', 'Mr. Shahil',
                            '$.email', 'procurementofficer@toprockinteriors.com',
                            '$.customer_address', 'TRI Office No.1, Al Qusais Ind Area 1, Dubai, UAE',
                            '$.project_id', 'prj-toprock-police-01',
                            '$.project_name', 'The New Dubai Police Academy @ Al Rowaiyah, Dubai'
                        )
                    WHERE invoice_no = 'REC-RG-INV-44050' OR id = 'inv-rec-rg-inv-44050'");
                    $pdo->exec("REPLACE INTO finance_settings (setting_key, setting_val, updated_at) VALUES ('sync_inv_44050_v80', 'completed', NOW())");
                }
            } catch (Exception $e) {}`;

if (php.includes(target871)) {
  php = php.replace(target871, guarded871);
  console.log('Guarded 871 replaced successfully');
} else {
  console.log('Target 871 not found');
}

// 3. Update syncFromRelationalTables
const oldSyncLogic = `        foreach ($syncMapping as $m) {
            try {
                $rows = $pdo->query("SELECT data_json FROM {$m['table']} ORDER BY {$m['order']}")->fetchAll(PDO::FETCH_ASSOC);
                if ($rows && count($rows) > 0) {
                    $k = $m['key'];
                    if (!isset($data[$k]) || !is_array($data[$k])) $data[$k] = [];
                    $indexMap = [];
                    foreach ($data[$k] as $idx => $item) {
                        foreach ($m['id_fields'] as $f) {
                            if (!empty($item[$f])) {
                                $indexMap[strtolower(trim($item[$f]))] = $idx;
                            }
                        }
                    }
                    foreach ($rows as $r) {
                        $obj = json_decode($r['data_json'], true);
                        if (!$obj) continue;
                        if ($k === 'vendor_payments' && !empty($delSet)) {
                            $objId = strtolower(trim($obj['id'] ?? ''));
                            if (isset($delSet[$objId])) {
                                continue;
                            }
                        }
                        $foundIdx = -1;
                        foreach ($m['id_fields'] as $f) {
                            if (!empty($obj[$f])) {
                                $keyVal = strtolower(trim($obj[$f]));
                                if (isset($indexMap[$keyVal])) {
                                    $foundIdx = $indexMap[$keyVal];
                                    break;
                                }
                            }
                        }
                        if ($foundIdx >= 0) {
                            // Primary state in finance_state is authoritative; only backfill missing fields without overwriting user edits
                            foreach ($obj as $kField => $vField) {
                                if (!isset($data[$k][$foundIdx][$kField]) || $data[$k][$foundIdx][$kField] === null || $data[$k][$foundIdx][$kField] === '') {
                                    $data[$k][$foundIdx][$kField] = $vField;
                                }
                            }
                        } else {
                            $newIdx = count($data[$k]);
                            $data[$k][] = $obj;
                            foreach ($m['id_fields'] as $f) {
                                if (!empty($obj[$f])) {
                                    $indexMap[strtolower(trim($obj[$f]))] = $newIdx;
                                }
                            }
                        }
                    }
                }
            } catch (Exception $e) {}
        }`;

const newSyncLogic = `        foreach ($syncMapping as $m) {
            try {
                $rows = $pdo->query("SELECT * FROM {$m['table']} ORDER BY {$m['order']}")->fetchAll(PDO::FETCH_ASSOC);
                if ($rows && count($rows) > 0) {
                    $k = $m['key'];
                    if (!isset($data[$k]) || !is_array($data[$k])) $data[$k] = [];
                    $indexMap = [];
                    foreach ($data[$k] as $idx => $item) {
                        foreach ($m['id_fields'] as $f) {
                            if (!empty($item[$f])) {
                                $indexMap[strtolower(trim($item[$f]))] = $idx;
                            }
                        }
                    }
                    foreach ($rows as $r) {
                        $obj = !empty($r['data_json']) ? json_decode($r['data_json'], true) : [];
                        if (!is_array($obj)) $obj = [];
                        // Authoritative relational database columns in MySQL take precedence over stale serialized JSON
                        foreach ($r as $colName => $colVal) {
                            if ($colName === 'data_json') continue;
                            if ($colVal !== null && $colVal !== '') {
                                $obj[$colName] = $colVal;
                            }
                        }
                        if ($k === 'invoices' && !empty($obj['customer_trn'])) {
                            $obj['trn'] = $obj['customer_trn'];
                            $obj['tax_number'] = $obj['customer_trn'];
                        }
                        if (empty($obj)) continue;
                        if ($k === 'vendor_payments' && !empty($delSet)) {
                            $objId = strtolower(trim($obj['id'] ?? ''));
                            if (isset($delSet[$objId])) {
                                continue;
                            }
                        }
                        $foundIdx = -1;
                        foreach ($m['id_fields'] as $f) {
                            if (!empty($obj[$f])) {
                                $keyVal = strtolower(trim($obj[$f]));
                                if (isset($indexMap[$keyVal])) {
                                    $foundIdx = $indexMap[$keyVal];
                                    break;
                                }
                            }
                        }
                        if ($foundIdx >= 0) {
                            // Relational table columns (updated via phpMyAdmin / SQL / UI) are authoritative
                            foreach ($obj as $kField => $vField) {
                                if ($vField !== null && $vField !== '') {
                                    $data[$k][$foundIdx][$kField] = $vField;
                                }
                            }
                        } else {
                            $newIdx = count($data[$k]);
                            $data[$k][] = $obj;
                            foreach ($m['id_fields'] as $f) {
                                if (!empty($obj[$f])) {
                                    $indexMap[strtolower(trim($obj[$f]))] = $newIdx;
                                }
                            }
                        }
                    }
                }
            } catch (Exception $e) {}
        }`;

if (php.includes(oldSyncLogic)) {
  php = php.replace(oldSyncLogic, newSyncLogic);
  console.log('newSyncLogic replaced successfully');
} else {
  console.log('oldSyncLogic not found');
}

// 4. Add reconcileV80CustomerTrnAndRelationalSync function and call it in loadFinanceDb
const migFunc = `function reconcileV80CustomerTrnAndRelationalSync(&$data, $pdo) {
    if (!$pdo) return;
    try {
        $chkMig80 = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'toprock_trn_sync_v80'")->fetchColumn();
        if ($chkMig80 !== 'completed') {
            // 1. Update customers table
            $pdo->exec("UPDATE finance_customers SET trn = '104571196000003', data_json = JSON_SET(data_json, '$.trn', '104571196000003') WHERE id = 'cust-toprock' OR name LIKE '%TOP ROCK%'");
            // 2. Update invoices table
            $pdo->exec("UPDATE finance_invoices SET customer_trn = '104571196000003', data_json = JSON_SET(data_json, '$.customer_trn', '104571196000003', '$.trn', '104571196000003', '$.tax_number', '104571196000003') WHERE customer_id = 'cust-toprock' OR customer_name LIKE '%TOP ROCK%'");
            $pdo->exec("REPLACE INTO finance_settings (setting_key, setting_val, updated_at) VALUES ('toprock_trn_sync_v80', 'completed', NOW())");
        }
    } catch (Exception $e) {}

    // Ensure memory state has updated TRN for Top Rock
    if (!empty($data['customers']) && is_array($data['customers'])) {
        foreach ($data['customers'] as &$c) {
            if (($c['id'] ?? '') === 'cust-toprock' || stripos($c['name'] ?? '', 'TOP ROCK') !== false) {
                if (empty($c['trn']) || $c['trn'] === '100360644700003') {
                    $c['trn'] = '104571196000003';
                }
            }
        }
        unset($c);
    }
    if (!empty($data['invoices']) && is_array($data['invoices'])) {
        foreach ($data['invoices'] as &$inv) {
            if (($inv['customer_id'] ?? '') === 'cust-toprock' || stripos($inv['customer_name'] ?? '', 'TOP ROCK') !== false) {
                if (empty($inv['customer_trn']) || $inv['customer_trn'] === '100360644700003') {
                    $inv['customer_trn'] = '104571196000003';
                    $inv['trn'] = '104571196000003';
                    $inv['tax_number'] = '104571196000003';
                }
            }
        }
        unset($inv);
    }
}
`;

const loadDbHook = `reconcileV79ChequeDeposits($data, $pdo);`;
const newLoadDbHook = `reconcileV79ChequeDeposits($data, $pdo);
                    reconcileV80CustomerTrnAndRelationalSync($data, $pdo);`;

if (php.includes(loadDbHook)) {
  php = migFunc + '\n' + php.replace(loadDbHook, newLoadDbHook);
  console.log('reconcileV80CustomerTrnAndRelationalSync added and hooked successfully');
} else {
  console.log('loadDbHook not found');
}

fs.writeFileSync('public/api/finance.php', php, 'utf8');
fs.writeFileSync('dist/api/finance.php', php, 'utf8');
console.log('Saved to public/api/finance.php and dist/api/finance.php');
