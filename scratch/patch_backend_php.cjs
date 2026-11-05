const fs = require('fs');

const phpPath = 'public/api/finance.php';
let php = fs.readFileSync(phpPath, 'utf8');

console.log('Original PHP length:', php.length);

// 1. Remove aggressive Yateem deletion in purgeDummyFinanceRecords
const oldPurgePrj = "$pdo->exec(\"DELETE FROM finance_projects WHERE id IN ('prj-dpa-01', 'prj-1793293174613', 'prj-1793293174359', 'prj-1793293174181', 'prj-1793293174006', 'prj-1793293173653', 'prj-1793293172695', 'prj-1793293172111', 'prj-1793293172304', 'prj-1793293136777') OR (name LIKE '%Yateem Optician%' AND id != 'prj-yok-02')\");";
const newPurgePrj = "$pdo->exec(\"DELETE FROM finance_projects WHERE id IN ('prj-dpa-01', 'prj-1793293174613', 'prj-1793293174359', 'prj-1793293174181', 'prj-1793293174006', 'prj-1793293173653', 'prj-1793293172695', 'prj-1793293172111', 'prj-1793293172304', 'prj-1793293136777')\");";

if (php.includes(oldPurgePrj)) {
    php = php.replace(oldPurgePrj, newPurgePrj);
    console.log('Fixed purgeDummyFinanceRecords project purge');
} else {
    console.warn('Could not find oldPurgePrj');
}

// 2. Remove accidental deletion in syncToRelationalTables
const oldCleanPrj = `            if (!empty($validPrjIds)) {
                $inClause = implode(',', array_fill(0, count($validPrjIds), '?'));
                $stmtClean = $pdo->prepare("DELETE FROM finance_projects WHERE id NOT IN ($inClause)");
                $stmtClean->execute($validPrjIds);
            }`;
const newCleanPrj = `            // Do not delete projects automatically on sync to avoid accidental deletion of existing projects`;

if (php.includes(oldCleanPrj)) {
    php = php.replace(oldCleanPrj, newCleanPrj);
    console.log('Fixed syncToRelationalTables accidental project deletion');
} else {
    console.warn('Could not find oldCleanPrj');
}

// 3. Fix case 'update_project': match strictly by ID first, never overwrite different projects!
const oldUpdatePrjCase = `case 'update_project':
            $prj = $body['project'] ?? [];
            if (!empty($prj)) {
                if (empty($prj['id'])) {
                    $prj['id'] = 'prj-' . round(microtime(true) * 1000);
                }
                if (empty($prj['company_id'])) {
                    $prj['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($prj['currency'])) {
                    $prj['currency'] = ($prj['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                }
                if (empty($prj['status'])) {
                    $prj['status'] = 'In Progress';
                }
                if (!isset($db['projects']) || !is_array($db['projects'])) {
                    $db['projects'] = [];
                }
                $foundPrj = -1;
                foreach ($db['projects'] as $idx => $exP) {
                    if (($exP['id'] ?? '') === ($prj['id'] ?? '') || ($exP['code'] ?? '') === ($prj['code'] ?? '')) {
                        $foundPrj = $idx;
                        break;
                    }
                }
                if ($foundPrj >= 0) {
                    $db['projects'][$foundPrj] = array_merge($db['projects'][$foundPrj], $prj);
                    $targetPrj = $db['projects'][$foundPrj];
                    $addAuditLog('update', 'project', $prj['code'] ?? '', 'Updated project ' . ($prj['name'] ?? ''));
                } else {
                    array_unshift($db['projects'], $prj);
                    $targetPrj = $prj;
                    $addAuditLog('create', 'project', $prj['code'] ?? '', 'Created project ' . ($prj['name'] ?? ''));
                }
                $response['project'] = $targetPrj;

                if ($pdo) {
                    try {
                        $stmtPrj = $pdo->prepare("REPLACE INTO finance_projects (id, code, company_id, name, client, contract_value, approved_budget, currency, status, data_json, updated_at) VALUES (:id, :code, :company_id, :name, :client, :contract_value, :approved_budget, :currency, :status, :data_json, NOW())");
                        $stmtPrj->execute([
                            ':id' => $targetPrj['id'],
                            ':code' => $targetPrj['code'] ?? '',
                            ':company_id' => $targetPrj['company_id'] ?? 'rayan-corp-uae',
                            ':name' => $targetPrj['name'],
                            ':client' => $targetPrj['client'] ?? $targetPrj['client_name'] ?? '',
                            ':contract_value' => floatval($targetPrj['contract_value'] ?? 0),
                            ':approved_budget' => floatval($targetPrj['approved_budget'] ?? 0),
                            ':currency' => $targetPrj['currency'] ?? 'AED',
                            ':status' => $targetPrj['status'] ?? 'Active',
                            ':data_json' => json_encode($targetPrj, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                        ]);
                    } catch (Exception $e) {}
                }
            }
            break;`;

const newUpdatePrjCase = `case 'update_project':
            $prj = $body['project'] ?? [];
            if (!empty($prj)) {
                if (empty($prj['id'])) {
                    $prj['id'] = 'prj-' . round(microtime(true) * 1000);
                }
                // Ensure project company is consistently rayan-corp-uae for UAE engineering projects
                if (empty($prj['company_id']) || $prj['company_id'] === 'rayan-group') {
                    $prj['company_id'] = 'rayan-corp-uae';
                }
                if (empty($prj['currency'])) {
                    $prj['currency'] = ($prj['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                }
                if (empty($prj['status'])) {
                    $prj['status'] = 'Active';
                }
                if (!isset($db['projects']) || !is_array($db['projects'])) {
                    $db['projects'] = [];
                }
                $targetId = trim($prj['id'] ?? '');
                $targetCode = trim($prj['code'] ?? '');
                $foundPrj = -1;

                // Match STRICTLY by ID first!
                if ($targetId !== '') {
                    foreach ($db['projects'] as $idx => $exP) {
                        if (($exP['id'] ?? '') === $targetId) {
                            $foundPrj = $idx;
                            break;
                        }
                    }
                }
                // Only if ID did not match, fallback to match on code
                if ($foundPrj < 0 && $targetCode !== '') {
                    foreach ($db['projects'] as $idx => $exP) {
                        if (strcasecmp(trim($exP['code'] ?? ''), $targetCode) === 0) {
                            $foundPrj = $idx;
                            break;
                        }
                    }
                }

                if ($foundPrj >= 0) {
                    $db['projects'][$foundPrj] = array_merge($db['projects'][$foundPrj], $prj);
                    $targetPrj = $db['projects'][$foundPrj];
                    $addAuditLog('update', 'project', $targetPrj['code'] ?? '', 'Updated project ' . ($targetPrj['name'] ?? ''));
                } else {
                    array_unshift($db['projects'], $prj);
                    $targetPrj = $prj;
                    $addAuditLog('create', 'project', $targetPrj['code'] ?? '', 'Created project ' . ($targetPrj['name'] ?? ''));
                }
                $response['project'] = $targetPrj;

                if ($pdo) {
                    try {
                        $stmtPrj = $pdo->prepare("REPLACE INTO finance_projects (id, code, company_id, name, client, contract_value, approved_budget, currency, status, data_json, updated_at) VALUES (:id, :code, :company_id, :name, :client, :contract_value, :approved_budget, :currency, :status, :data_json, NOW())");
                        $stmtPrj->execute([
                            ':id' => $targetPrj['id'],
                            ':code' => $targetPrj['code'] ?? '',
                            ':company_id' => $targetPrj['company_id'] ?? 'rayan-corp-uae',
                            ':name' => $targetPrj['name'],
                            ':client' => $targetPrj['client'] ?? $targetPrj['client_name'] ?? '',
                            ':contract_value' => floatval($targetPrj['contract_value'] ?? 0),
                            ':approved_budget' => floatval($targetPrj['approved_budget'] ?? 0),
                            ':currency' => $targetPrj['currency'] ?? 'AED',
                            ':status' => $targetPrj['status'] ?? 'Active',
                            ':data_json' => json_encode($targetPrj, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                        ]);
                    } catch (Exception $e) {}
                }
                saveFinanceDb($pdo, $dataFile, $db, $candidates);
            }
            break;`;

if (php.includes(oldUpdatePrjCase)) {
    php = php.replace(oldUpdatePrjCase, newUpdatePrjCase);
    console.log('Fixed case update_project matching and saving');
} else {
    console.warn('Could not find oldUpdatePrjCase');
}

// 4. In loadFinanceDb: Add v2026_clean_v54 project restoration migration
const migrationHook = "// v2026_clean_v52: Ensure Max Al Wahda project financials are synchronized with exact audited ledger figures";
const v54Migration = `// v2026_clean_v54: Complete restoration and hydration of all 13 canonical project accounts with distinct IDs and REC codes
            $canonicalProjectsList = [
                [
                    'id' => 'prj-mvzme7ho',
                    'code' => 'PRJ-REC-IB-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Project # Foah Mall Alain',
                    'client' => 'M/S IRON BEAM GENERAL CONTRACTING LLC',
                    'client_name' => 'M/S IRON BEAM GENERAL CONTRACTING LLC',
                    'client_id' => 'cust-ironbeam',
                    'contract_value' => 11812.50,
                    'approved_budget' => 11812.50,
                    'currency' => 'AED',
                    'status' => 'Closed',
                    'start_date' => '2026-06-23',
                    'target_completion' => '2027-06-28',
                    'site_location' => 'Alain, UAE',
                    'description' => 'Civil and fit-out works at Foah Mall Alain.',
                    'manual_financials' => false
                ],
                [
                    'id' => 'prj-toby-kiosk',
                    'code' => 'PRJ-REC-TOBY-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => "Toby's Kiosk - Yas Mall",
                    'client' => 'M/S SADECO DÉCOR LLC',
                    'client_name' => 'M/S SADECO DÉCOR LLC',
                    'client_id' => 'cust-sadeco',
                    'contract_value' => 2625.00,
                    'approved_budget' => 2000.00,
                    'currency' => 'AED',
                    'status' => 'Active',
                    'start_date' => '2026-10-27',
                    'target_completion' => '2026-10-31',
                    'site_location' => 'Yas Mall, Abu Dhabi, UAE',
                    'description' => 'Supply and apply of cement screeding 100mm high.',
                    'manual_financials' => false
                ],
                [
                    'id' => 'prj-bateel-yas',
                    'code' => 'PRJ-REC-TRI-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Project # Cafe Bateel @ Yas Mall, Abu Dhabi',
                    'client' => 'M/S TOP ROCK INTERIORS LLC.',
                    'client_name' => 'M/S TOP ROCK INTERIORS LLC.',
                    'client_id' => 'cust-toprock',
                    'contract_value' => 3529.31,
                    'approved_budget' => 3529.31,
                    'currency' => 'AED',
                    'status' => 'Closed',
                    'start_date' => '2026-04-17',
                    'target_completion' => '2026-04-23',
                    'site_location' => 'Yas Mall, Abu Dhabi, UAE',
                    'description' => 'Turnkey luxury cafe fit-out, joinery, and decorative ceiling works.',
                    'manual_financials' => false
                ],
                [
                    'id' => 'prj-chipotle-mbz',
                    'code' => 'PRJ-REC-CHIP-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Project # Chipotle @ My Town Centre MBZ, Abu Dhabi',
                    'client' => 'M/S MAP OUT DECOR TECHNICAL SERVICES LLC',
                    'client_name' => 'M/S MAP OUT DECOR TECHNICAL SERVICES LLC',
                    'client_id' => 'cust-mapout',
                    'contract_value' => 145000.00,
                    'approved_budget' => 115000.00,
                    'currency' => 'AED',
                    'status' => 'Closed',
                    'start_date' => '2025-10-01',
                    'target_completion' => '2026-03-31',
                    'site_location' => 'MBZ City, Abu Dhabi, UAE',
                    'description' => 'Fit-out and MEP contracting for Chipotle restaurant outlet.',
                    'manual_financials' => false
                ],
                [
                    'id' => 'prj-toprock-police-01',
                    'code' => 'PRJ-REC-DPA-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Project # The New Dubai Police Academy @ Al Rowaiyah, Dubai',
                    'client' => 'M/S TOP ROCK INTERIORS LLC.',
                    'client_name' => 'M/S TOP ROCK INTERIORS LLC.',
                    'client_id' => 'cust-toprock',
                    'contract_value' => 341835.68,
                    'approved_budget' => 500000.00,
                    'currency' => 'AED',
                    'status' => 'Active',
                    'start_date' => '2026-05-18',
                    'target_completion' => '2026-12-31',
                    'site_location' => 'Al Rowaiyah, Dubai, UAE',
                    'description' => 'Partition wall lining, acoustic rockwool insulation, and ceiling systems for Dubai Police Academy Building.',
                    'manual_financials' => false
                ],
                [
                    'id' => 'prj-mvr3cdaw',
                    'code' => 'PRJ-REC-AON-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Project # AON Insurance Office Al Bateen Tower, Abu Dhabi',
                    'client' => 'M/S AYAT TECHNICAL SERVICES EST.',
                    'client_name' => 'M/S AYAT TECHNICAL SERVICES EST.',
                    'client_id' => 'cust-ayat',
                    'contract_value' => 75393.30,
                    'approved_budget' => 65000.00,
                    'currency' => 'AED',
                    'status' => 'Closed',
                    'start_date' => '2026-02-08',
                    'target_completion' => '2026-05-30',
                    'site_location' => 'Al Bateen Tower, Abu Dhabi, UAE',
                    'description' => 'Gypsum Partition & Wall Cladding Works @ AON Insurance Office.',
                    'manual_financials' => false
                ],
                [
                    'id' => 'prj-mvr35qo2',
                    'code' => 'PRJ-REC-MAX-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Project # Max - Al Wahda Mall, Civil Works , Abu Dhabi',
                    'client' => 'M/S HLN TECHNICAL SERVICES LLC',
                    'client_name' => 'M/S HLN TECHNICAL SERVICES LLC',
                    'client_id' => 'cust-hln',
                    'contract_value' => 388098.69,
                    'approved_budget' => 388098.69,
                    'currency' => 'AED',
                    'status' => 'Closed',
                    'start_date' => '2025-08-09',
                    'target_completion' => '2026-10-04',
                    'site_location' => 'Al Wahda Mall, Abu Dhabi, UAE',
                    'description' => 'Civil Works-Max-Al Wahda-Abu Dhabi.',
                    'manual_financials' => true,
                    'manual_invoiced' => 406736.51,
                    'manual_collected' => 312798.68,
                    'manual_bills' => 316571.79,
                    'manual_expenses' => 0.00,
                    'manual_cost' => 316571.79,
                    'manual_profit' => 90164.72,
                    'manual_margin' => '22.2'
                ],
                [
                    'id' => 'prj-edc-dalma',
                    'code' => 'PRJ-REC-EDC-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Project # Emirates Driving Company - Dalma Mall & Madinati Mall',
                    'client' => 'M/S IRON BEAM GENERAL CONTRACTING LLC',
                    'client_name' => 'M/S IRON BEAM GENERAL CONTRACTING LLC',
                    'client_id' => 'cust-ironbeam',
                    'contract_value' => 210000.00,
                    'approved_budget' => 180000.00,
                    'currency' => 'AED',
                    'status' => 'Active',
                    'start_date' => '2026-01-15',
                    'target_completion' => '2026-08-30',
                    'site_location' => 'Dalma Mall & Madinati Mall, Abu Dhabi, UAE',
                    'description' => 'Fit-out and civil works for Emirates Driving Company testing & training centers.',
                    'manual_financials' => false
                ],
                [
                    'id' => 'prj-specon-rak',
                    'code' => 'PRJ-REC-SPECON-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Project # Specon Design Interior & Events - Ras Al Khaimah',
                    'client' => 'M/S SPECON DESIGN INTERIOR & EVENTS LLC',
                    'client_name' => 'M/S SPECON DESIGN INTERIOR & EVENTS LLC',
                    'client_id' => 'cust-specon',
                    'contract_value' => 95000.00,
                    'approved_budget' => 80000.00,
                    'currency' => 'AED',
                    'status' => 'Active',
                    'start_date' => '2026-03-01',
                    'target_completion' => '2026-09-30',
                    'site_location' => 'Ras Al Khaimah, UAE',
                    'description' => 'Interior design, gypsum partitions, and exhibition joinery contracting.',
                    'manual_financials' => false
                ],
                [
                    'id' => 'prj-pggc-ad',
                    'code' => 'PRJ-REC-PGGC-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Project # Abu Dhabi Professional Gulf Maintenance',
                    'client' => 'M/S PROFESSIONAL GULF GENERAL CONTRACTING L.L.C',
                    'client_name' => 'M/S PROFESSIONAL GULF GENERAL CONTRACTING L.L.C',
                    'client_id' => 'cust-profgulf',
                    'contract_value' => 65000.00,
                    'approved_budget' => 50000.00,
                    'currency' => 'AED',
                    'status' => 'Active',
                    'start_date' => '2026-02-10',
                    'target_completion' => '2026-07-31',
                    'site_location' => 'Abu Dhabi, UAE',
                    'description' => 'General maintenance, civil finishing, and fit-out contracting.',
                    'manual_financials' => false
                ],
                [
                    'id' => 'prj-wald-rak',
                    'code' => 'PRJ-REC-WALD-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Project # Waldorf Astoria Renovation - Ras Al Khaimah',
                    'client' => 'M/S SPECON DESIGN INTERIOR & EVENTS LLC',
                    'client_name' => 'M/S SPECON DESIGN INTERIOR & EVENTS LLC',
                    'client_id' => 'cust-specon',
                    'contract_value' => 120000.00,
                    'approved_budget' => 100000.00,
                    'currency' => 'AED',
                    'status' => 'Active',
                    'start_date' => '2026-04-01',
                    'target_completion' => '2026-11-30',
                    'site_location' => 'Waldorf Astoria, Ras Al Khaimah, UAE',
                    'description' => 'Luxury hotel guestroom and suite renovation, gypsum and joinery package.',
                    'manual_financials' => false
                ],
                [
                    'id' => 'prj-bd-03',
                    'code' => 'PRJ-REC-BD-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Commercial & Residential Tower Fit-Out - Sector E-25',
                    'client' => 'M/S BUILDARA GENERAL CONTRACTING - L.L.C',
                    'client_name' => 'M/S BUILDARA GENERAL CONTRACTING - L.L.C',
                    'client_id' => 'cust-buildara',
                    'contract_value' => 3200000.00,
                    'approved_budget' => 2800000.00,
                    'currency' => 'AED',
                    'status' => 'Active',
                    'start_date' => '2026-01-01',
                    'target_completion' => '2026-12-31',
                    'site_location' => 'Sector E-25, Abu Dhabi, UAE',
                    'description' => 'Multi-floor commercial tower interior fit-out, acoustic drywalls, and finishes.',
                    'manual_financials' => false
                ],
                [
                    'id' => 'prj-yok-02',
                    'code' => 'PRJ-REC-YOK-2026',
                    'company_id' => 'rayan-corp-uae',
                    'name' => 'Project # Yateem Optician, Khalidiyah Mall, Abu Dhabi',
                    'client' => 'M/S BUILDARA GENERAL CONTRACTING LLC',
                    'client_name' => 'M/S BUILDARA GENERAL CONTRACTING LLC',
                    'client_id' => 'cust-buildara',
                    'contract_value' => 11970.00,
                    'approved_budget' => 11970.00,
                    'currency' => 'AED',
                    'status' => 'Active',
                    'start_date' => '2026-09-01',
                    'target_completion' => '2026-10-31',
                    'site_location' => 'Khalidiyah Mall, Abu Dhabi, UAE',
                    'description' => 'Optical retail showroom fit-out and joinery contracting.',
                    'manual_financials' => false
                ]
            ];

            if (!isset($data['projects']) || !is_array($data['projects'])) {
                $data['projects'] = [];
            }
            $existingPrjMap = [];
            foreach ($data['projects'] as $pIdx => $pVal) {
                if (!empty($pVal['id'])) $existingPrjMap[$pVal['id']] = $pIdx;
            }
            foreach ($canonicalProjectsList as $cPrj) {
                $cId = $cPrj['id'];
                if (isset($existingPrjMap[$cId])) {
                    $currIdx = $existingPrjMap[$cId];
                    // Update fields without losing user overrides
                    $data['projects'][$currIdx] = array_merge($cPrj, $data['projects'][$currIdx]);
                } else {
                    $data['projects'][] = $cPrj;
                    $existingPrjMap[$cId] = count($data['projects']) - 1;
                }
                if ($pdo) {
                    try {
                        $stmtCanPrj = $pdo->prepare("REPLACE INTO finance_projects (id, code, company_id, name, client, contract_value, approved_budget, currency, status, data_json, updated_at) VALUES (:id, :code, :company_id, :name, :client, :contract_value, :approved_budget, :currency, :status, :data_json, NOW())");
                        $stmtCanPrj->execute([
                            ':id' => $cPrj['id'],
                            ':code' => $cPrj['code'],
                            ':company_id' => 'rayan-corp-uae',
                            ':name' => $cPrj['name'],
                            ':client' => $cPrj['client'],
                            ':contract_value' => $cPrj['contract_value'],
                            ':approved_budget' => $cPrj['approved_budget'],
                            ':currency' => $cPrj['currency'],
                            ':status' => $cPrj['status'],
                            ':data_json' => json_encode($cPrj, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                        ]);
                    } catch (Exception $e) {}
                }
            }

            // Remove old duplicated prj-mvr2yfnl to avoid collision with prj-toby-kiosk
            if ($pdo) {
                try {
                    $pdo->exec("DELETE FROM finance_projects WHERE id = 'prj-mvr2yfnl'");
                } catch (Exception $e) {}
            }
            $data['projects'] = array_values(array_filter($data['projects'], function($p) {
                return ($p['id'] ?? '') !== 'prj-mvr2yfnl';
            }));

            ` + migrationHook;

if (php.includes(migrationHook)) {
    php = php.replace(migrationHook, v54Migration);
    console.log('Added v54 canonical project restoration migration');
} else {
    console.warn('Could not find migrationHook');
}

fs.writeFileSync(phpPath, php, 'utf8');
console.log('Updated public/api/finance.php length:', php.length);
