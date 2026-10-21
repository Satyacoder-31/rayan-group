<?php
/**
 * Rayan Group — Enterprise Accounts & Billing Management API
 * Direct Hostinger MySQL Database Persistence + JSON File Fallback
 * Database: u575992126_rayan_app
 * Last Updated: 2026-10-20 15:10 UTC+5:30
 * Endpoint: /api/finance.php
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Connect to Hostinger MySQL Database
require_once __DIR__ . '/db.php';
$pdo = function_exists('getDbConnection') ? getDbConnection() : null;

// Auto-create essential finance tables in MySQL if not present
if ($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS finance_state (
                id INT PRIMARY KEY,
                state_json LONGTEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_invoices (
                id VARCHAR(64) PRIMARY KEY,
                invoice_no VARCHAR(64) NOT NULL UNIQUE,
                company_id VARCHAR(64) DEFAULT 'rayan-corp-uae',
                customer_id VARCHAR(64),
                customer_name VARCHAR(255),
                customer_trn VARCHAR(64),
                customer_gstin VARCHAR(64),
                invoice_date DATE,
                due_date DATE,
                grand_total DECIMAL(15,2) DEFAULT 0,
                amount_paid DECIMAL(15,2) DEFAULT 0,
                balance_due DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                status VARCHAR(32) DEFAULT 'unpaid',
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_inv_no (invoice_no),
                INDEX idx_cust (customer_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_customers (
                id VARCHAR(64) PRIMARY KEY,
                code VARCHAR(64),
                name VARCHAR(255) NOT NULL,
                contact_person VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(64),
                trn VARCHAR(64),
                gstin VARCHAR(64),
                credit_limit DECIMAL(15,2) DEFAULT 10000000,
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_cust_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS finance_receipts (
                id VARCHAR(64) PRIMARY KEY,
                receipt_no VARCHAR(64) NOT NULL UNIQUE,
                customer_id VARCHAR(64),
                customer_name VARCHAR(255),
                receipt_date DATE,
                amount_received DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(16) DEFAULT 'AED',
                payment_mode VARCHAR(64),
                reference_no VARCHAR(128),
                data_json LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_rcp_no (receipt_no)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {
        error_log("Finance tables initialization error: " . $e->getMessage());
    }
}

// 2. Locate fallback JSON file
$candidates = [
    __DIR__ . '/../data/finance-data.json',
    __DIR__ . '/../../data/finance-data.json',
    __DIR__ . '/data/finance-data.json'
];
if (isset($_SERVER['DOCUMENT_ROOT'])) {
    $candidates[] = $_SERVER['DOCUMENT_ROOT'] . '/data/finance-data.json';
}

function getMasterSeed($candidates) {
    foreach ($candidates as $c) {
        if (file_exists($c)) {
            $raw = @file_get_contents($c);
            if ($raw) {
                $data = json_decode($raw, true);
                if (!empty($data['companies']) && is_array($data['companies']) && count($data['companies']) > 0) {
                    return $data;
                }
            }
        }
    }
    return null;
}

$dataFile = null;
foreach ($candidates as $c) {
    if (file_exists($c)) {
        $dataFile = $c;
        break;
    }
}
if (!$dataFile) {
    $dataFile = __DIR__ . '/../data/finance-data.json';
    $dir = dirname($dataFile);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// 3. MySQL & File Loading Logic
function loadFinanceDb($pdo, $dataFile, $candidates) {
    // A. Check Hostinger MySQL Database first
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT state_json FROM finance_state WHERE id = 1 LIMIT 1");
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row && !empty($row['state_json'])) {
                $data = json_decode($row['state_json'], true);
                if ($data && is_array($data) && !empty($data['companies'])) {
                    // Check if relational tables have any additional records
                    syncFromRelationalTables($pdo, $data);
                    return $data;
                }
            }
        } catch (Exception $e) {
            error_log("Finance MySQL load error: " . $e->getMessage());
        }
    }

    // B. Check local file
    if ($dataFile && file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        if ($raw) {
            $data = json_decode($raw, true);
            if ($data && is_array($data) && !empty($data['companies'])) {
                // If MySQL was empty, seed it now with this data!
                if ($pdo) {
                    saveFinanceDb($pdo, null, $data, $candidates);
                }
                return $data;
            }
        }
    }

    // C. Master seed
    $seed = getMasterSeed($candidates);
    if ($seed && $pdo) {
        saveFinanceDb($pdo, $dataFile, $seed, $candidates);
    }
    return $seed;
}

function syncFromRelationalTables($pdo, &$data) {
    if (!$pdo) return;
    try {
        // Ensure all invoices from table exist in state
        $invRows = $pdo->query("SELECT data_json FROM finance_invoices ORDER BY invoice_date DESC")->fetchAll(PDO::FETCH_ASSOC);
        if ($invRows && count($invRows) > 0) {
            if (!isset($data['invoices']) || !is_array($data['invoices'])) $data['invoices'] = [];
            $existingKeys = [];
            foreach ($data['invoices'] as $idx => $inv) {
                $k = $inv['id'] ?? $inv['invoice_no'] ?? null;
                if ($k) $existingKeys[$k] = $idx;
            }
            foreach ($invRows as $r) {
                $invObj = json_decode($r['data_json'], true);
                if (!$invObj) continue;
                $k = $invObj['id'] ?? $invObj['invoice_no'] ?? null;
                if ($k && !isset($existingKeys[$k])) {
                    array_unshift($data['invoices'], $invObj);
                }
            }
        }

        // Ensure all customers from table exist in state
        $custRows = $pdo->query("SELECT data_json FROM finance_customers ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);
        if ($custRows && count($custRows) > 0) {
            if (!isset($data['customers']) || !is_array($data['customers'])) $data['customers'] = [];
            $existingCust = [];
            foreach ($data['customers'] as $idx => $c) {
                $k = $c['id'] ?? $c['code'] ?? strtolower($c['name'] ?? '');
                if ($k) $existingCust[$k] = true;
            }
            foreach ($custRows as $r) {
                $cObj = json_decode($r['data_json'], true);
                if (!$cObj) continue;
                $k = $cObj['id'] ?? $cObj['code'] ?? strtolower($cObj['name'] ?? '');
                if ($k && !isset($existingCust[$k])) {
                    array_unshift($data['customers'], $cObj);
                }
            }
        }

        // Ensure all receipts from table exist in state
        $rcpRows = $pdo->query("SELECT data_json FROM finance_receipts ORDER BY receipt_date DESC")->fetchAll(PDO::FETCH_ASSOC);
        if ($rcpRows && count($rcpRows) > 0) {
            if (!isset($data['customer_receipts']) || !is_array($data['customer_receipts'])) $data['customer_receipts'] = [];
            $existingRcp = [];
            foreach ($data['customer_receipts'] as $idx => $r) {
                $k = $r['id'] ?? $r['receipt_no'] ?? null;
                if ($k) $existingRcp[$k] = true;
            }
            foreach ($rcpRows as $r) {
                $rObj = json_decode($r['data_json'], true);
                if (!$rObj) continue;
                $k = $rObj['id'] ?? $rObj['receipt_no'] ?? null;
                if ($k && !isset($existingRcp[$k])) {
                    array_unshift($data['customer_receipts'], $rObj);
                }
            }
        }
    } catch (Exception $e) {
        error_log("syncFromRelationalTables error: " . $e->getMessage());
    }
}

function saveFinanceDb($pdo, $dataFile, &$data, $candidates = []) {
    // Preserve master collections
    if (empty($data['companies']) || count($data['companies']) === 0) {
        $seed = getMasterSeed($candidates);
        if ($seed) {
            foreach ($seed as $k => $val) {
                if (empty($data[$k]) && !empty($val)) {
                    $data[$k] = $val;
                }
            }
        }
    }

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    // 1. Save to Hostinger MySQL Database
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("REPLACE INTO finance_state (id, state_json, updated_at) VALUES (1, :json, NOW())");
            $stmt->execute([':json' => $json]);

            // Sync relational tables
            syncToRelationalTables($pdo, $data);
        } catch (Exception $e) {
            error_log("Finance MySQL save error: " . $e->getMessage());
        }
    }

    // 2. Secondary fallback: write to disk
    if ($dataFile) {
        $dir = dirname($dataFile);
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        @file_put_contents($dataFile, $json);
    }

    return true;
}

function syncToRelationalTables($pdo, &$data) {
    if (!$pdo) return;
    try {
        if (!empty($data['invoices']) && is_array($data['invoices'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_invoices (id, invoice_no, company_id, customer_id, customer_name, customer_trn, customer_gstin, invoice_date, due_date, grand_total, amount_paid, balance_due, currency, status, data_json, updated_at) VALUES (:id, :invoice_no, :company_id, :customer_id, :customer_name, :customer_trn, :customer_gstin, :invoice_date, :due_date, :grand_total, :amount_paid, :balance_due, :currency, :status, :data_json, NOW())");
            foreach (array_slice($data['invoices'], 0, 50) as $inv) {
                if (empty($inv['invoice_no'])) continue;
                $stmt->execute([
                    ':id' => $inv['id'] ?? ('inv-' . $inv['invoice_no']),
                    ':invoice_no' => $inv['invoice_no'],
                    ':company_id' => $inv['company_id'] ?? 'rayan-corp-uae',
                    ':customer_id' => $inv['customer_id'] ?? '',
                    ':customer_name' => $inv['customer_name'] ?? '',
                    ':customer_trn' => $inv['customer_trn'] ?? '',
                    ':customer_gstin' => $inv['customer_gstin'] ?? '',
                    ':invoice_date' => $inv['invoice_date'] ?? date('Y-m-d'),
                    ':due_date' => !empty($inv['due_date']) ? $inv['due_date'] : null,
                    ':grand_total' => floatval($inv['grand_total'] ?? 0),
                    ':amount_paid' => floatval($inv['amount_paid'] ?? 0),
                    ':balance_due' => floatval($inv['balance_due'] ?? 0),
                    ':currency' => $inv['currency'] ?? 'AED',
                    ':status' => $inv['status'] ?? 'unpaid',
                    ':data_json' => json_encode($inv, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        if (!empty($data['customers']) && is_array($data['customers'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_customers (id, code, name, contact_person, email, phone, trn, gstin, credit_limit, data_json, updated_at) VALUES (:id, :code, :name, :contact_person, :email, :phone, :trn, :gstin, :credit_limit, :data_json, NOW())");
            foreach ($data['customers'] as $c) {
                if (empty($c['name'])) continue;
                $stmt->execute([
                    ':id' => $c['id'] ?? ('cust-' . rand(1000, 9999)),
                    ':code' => $c['code'] ?? '',
                    ':name' => $c['name'],
                    ':contact_person' => $c['contact_person'] ?? '',
                    ':email' => $c['email'] ?? '',
                    ':phone' => $c['phone'] ?? '',
                    ':trn' => $c['trn'] ?? '',
                    ':gstin' => $c['gstin'] ?? '',
                    ':credit_limit' => floatval($c['credit_limit'] ?? 10000000),
                    ':data_json' => json_encode($c, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        if (!empty($data['customer_receipts']) && is_array($data['customer_receipts'])) {
            $stmt = $pdo->prepare("REPLACE INTO finance_receipts (id, receipt_no, customer_id, customer_name, receipt_date, amount_received, currency, payment_mode, reference_no, data_json, updated_at) VALUES (:id, :receipt_no, :customer_id, :customer_name, :receipt_date, :amount_received, :currency, :payment_mode, :reference_no, :data_json, NOW())");
            foreach ($data['customer_receipts'] as $r) {
                if (empty($r['receipt_no'])) continue;
                $stmt->execute([
                    ':id' => $r['id'] ?? ('rec-' . $r['receipt_no']),
                    ':receipt_no' => $r['receipt_no'],
                    ':customer_id' => $r['customer_id'] ?? '',
                    ':customer_name' => $r['customer_name'] ?? '',
                    ':receipt_date' => $r['receipt_date'] ?? date('Y-m-d'),
                    ':amount_received' => floatval($r['amount_received'] ?? 0),
                    ':currency' => $r['currency'] ?? 'AED',
                    ':payment_mode' => $r['payment_mode'] ?? 'Cheque',
                    ':reference_no' => $r['reference_no'] ?? '',
                    ':data_json' => json_encode($r, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ]);
            }
        }
    } catch (Exception $e) {
        error_log("syncToRelationalTables error: " . $e->getMessage());
    }
}

// 4. Initialize Database
$db = loadFinanceDb($pdo, $dataFile, $candidates);
if (!$db || empty($db['companies'])) {
    $db = getMasterSeed($candidates) ?: ['companies' => [], 'invoices' => [], 'customers' => [], 'customer_receipts' => []];
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: $_POST;
$action = $_GET['action'] ?? $body['action'] ?? 'get_state';

// 5. GET Handler
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'get_state') {
        echo json_encode([
            'success' => true,
            'storage' => $pdo ? 'hostinger_mysql' : 'json_file',
            'data' => $db
        ]);
        exit;
    }

    if ($action === 'get_users') {
        $sanitizedUsers = array_map(function($u) {
            unset($u['password']);
            return $u;
        }, $db['users'] ?? []);
        echo json_encode(['success' => true, 'users' => $sanitizedUsers]);
        exit;
    }

    echo json_encode(['success' => true, 'data' => $db]);
    exit;
}

// 6. POST Handler
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Helper for audit logging
    $addAuditLog = function($actionType, $entity, $entityId, $details) use (&$db, $body) {
        if (!isset($db['audit_logs']) || !is_array($db['audit_logs'])) {
            $db['audit_logs'] = [];
        }
        $logEntry = [
            'id' => 'aud-' . dechex(intval(microtime(true) * 1000)),
            'timestamp' => date('c'),
            'actor_name' => $body['user_name'] ?? 'Authorized Personnel',
            'actor_role' => $body['user_role'] ?? 'finance',
            'actor_email' => $body['user_email'] ?? 'system@rayangroup.com',
            'action' => $actionType,
            'entity' => $entity,
            'entity_id' => $entityId,
            'details' => $details,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
        ];
        array_unshift($db['audit_logs'], $logEntry);
    };

    switch ($action) {
        case 'create_invoice':
        case 'update_invoice':
            $inv = $body['invoice'] ?? [];
            if (!empty($inv)) {
                if (!isset($db['invoices']) || !is_array($db['invoices'])) {
                    $db['invoices'] = [];
                }
                // Check if invoice already exists
                $foundIdx = -1;
                foreach ($db['invoices'] as $idx => $exI) {
                    if (($exI['id'] ?? '') === ($inv['id'] ?? '') || ($exI['invoice_no'] ?? '') === ($inv['invoice_no'] ?? '')) {
                        $foundIdx = $idx;
                        break;
                    }
                }
                if ($foundIdx >= 0) {
                    $db['invoices'][$foundIdx] = array_merge($db['invoices'][$foundIdx], $inv);
                    $addAuditLog('update', 'invoice', $inv['invoice_no'] ?? '', 'Updated tax invoice for ' . ($inv['customer_name'] ?? ''));
                } else {
                    array_unshift($db['invoices'], $inv);
                    $addAuditLog('create', 'invoice', $inv['invoice_no'] ?? '', 'Created tax invoice for ' . ($inv['customer_name'] ?? ''));
                }
            }
            break;

        case 'create_project':
        case 'update_project':
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
                    $addAuditLog('update', 'project', $prj['code'] ?? '', 'Updated project ' . ($prj['name'] ?? ''));
                } else {
                    array_unshift($db['projects'], $prj);
                    $addAuditLog('create', 'project', $prj['code'] ?? '', 'Created project ' . ($prj['name'] ?? ''));
                }
            }
            break;



        case 'update_bill':
            $bill = $body['bill'] ?? [];
            if (!empty($bill) && isset($db['purchase_bills'])) {
                $targetId = $bill['id'] ?? $bill['bill_no'] ?? '';
                foreach ($db['purchase_bills'] as &$existingB) {
                    if (($existingB['id'] ?? '') === $targetId || ($existingB['bill_no'] ?? '') === $targetId) {
                        $existingB = array_merge($existingB, $bill);
                        break;
                    }
                }
                unset($existingB);
                $addAuditLog('update', 'bill', $bill['bill_no'] ?? '', 'Updated purchase bill ' . ($bill['bill_no'] ?? ''));
            }
            break;

        case 'update_expense':
            $exp = $body['expense'] ?? [];
            if (!empty($exp) && isset($db['expenses'])) {
                $targetId = $exp['id'] ?? $exp['expense_no'] ?? '';
                foreach ($db['expenses'] as &$existingE) {
                    if (($existingE['id'] ?? '') === $targetId || ($existingE['expense_no'] ?? '') === $targetId) {
                        $existingE = array_merge($existingE, $exp);
                        break;
                    }
                }
                unset($existingE);
                $addAuditLog('update', 'expense', $exp['expense_no'] ?? '', 'Updated expense claim ' . ($exp['expense_no'] ?? ''));
            }
            break;

        case 'delete_expense':
            $expId = $body['expense_id'] ?? $body['id'] ?? '';
            if (!empty($expId) && isset($db['expenses'])) {
                $db['expenses'] = array_values(array_filter($db['expenses'], function($item) use ($expId) {
                    return ($item['id'] ?? '') !== $expId && ($item['expense_no'] ?? '') !== $expId;
                }));
                $addAuditLog('delete', 'expense', $expId, 'Deleted expense ' . $expId);
            }
            break;

        case 'update_receipt':
            $rcp = $body['receipt'] ?? [];
            if (!empty($rcp) && isset($db['customer_receipts'])) {
                $targetId = $rcp['id'] ?? $rcp['receipt_no'] ?? '';
                foreach ($db['customer_receipts'] as &$existingR) {
                    if (($existingR['id'] ?? '') === $targetId || ($existingR['receipt_no'] ?? '') === $targetId) {
                        $existingR = array_merge($existingR, $rcp);
                        break;
                    }
                }
                unset($existingR);
                $addAuditLog('update', 'receipt', $rcp['receipt_no'] ?? '', 'Updated customer receipt ' . ($rcp['receipt_no'] ?? ''));
            }
            break;

        case 'update_payment':
            $pay = $body['payment'] ?? [];
            if (!empty($pay) && isset($db['vendor_payments'])) {
                $targetId = $pay['id'] ?? $pay['voucher_no'] ?? '';
                foreach ($db['vendor_payments'] as &$existingP) {
                    if (($existingP['id'] ?? '') === $targetId || ($existingP['voucher_no'] ?? '') === $targetId) {
                        $existingP = array_merge($existingP, $pay);
                        break;
                    }
                }
                unset($existingP);
                $addAuditLog('update', 'payment', $pay['voucher_no'] ?? '', 'Updated vendor payment voucher ' . ($pay['voucher_no'] ?? ''));
            }
            break;

        case 'update_po':
            $po = $body['po'] ?? [];
            if (!empty($po) && isset($db['purchase_orders'])) {
                $targetId = $po['id'] ?? $po['po_no'] ?? '';
                foreach ($db['purchase_orders'] as &$existingPO) {
                    if (($existingPO['id'] ?? '') === $targetId || ($existingPO['po_no'] ?? '') === $targetId) {
                        $existingPO = array_merge($existingPO, $po);
                        break;
                    }
                }
                unset($existingPO);
                $addAuditLog('update', 'po', $po['po_no'] ?? '', 'Updated purchase order ' . ($po['po_no'] ?? ''));
            }
            break;

        case 'update_credit_note':
            $cn = $body['credit_note'] ?? [];
            if (!empty($cn) && isset($db['credit_notes'])) {
                $targetId = $cn['id'] ?? $cn['credit_note_no'] ?? '';
                foreach ($db['credit_notes'] as &$existingCN) {
                    if (($existingCN['id'] ?? '') === $targetId || ($existingCN['credit_note_no'] ?? '') === $targetId) {
                        $existingCN = array_merge($existingCN, $cn);
                        break;
                    }
                }
                unset($existingCN);
                $addAuditLog('update', 'credit_note', $cn['credit_note_no'] ?? '', 'Updated credit note ' . ($cn['credit_note_no'] ?? ''));
            }
            break;

        case 'update_debit_note':
            $dn = $body['debit_note'] ?? [];
            if (!empty($dn) && isset($db['debit_notes'])) {
                $targetId = $dn['id'] ?? $dn['debit_note_no'] ?? '';
                foreach ($db['debit_notes'] as &$existingDN) {
                    if (($existingDN['id'] ?? '') === $targetId || ($existingDN['debit_note_no'] ?? '') === $targetId) {
                        $existingDN = array_merge($existingDN, $dn);
                        break;
                    }
                }
                unset($existingDN);
                $addAuditLog('update', 'debit_note', $dn['debit_note_no'] ?? '', 'Updated debit note ' . ($dn['debit_note_no'] ?? ''));
            }
            break;

        case 'create_document':
            $doc = $body['document'] ?? [];
            if (!empty($doc)) {
                if (empty($doc['id'])) $doc['id'] = 'doc-' . round(microtime(true) * 1000);
                if (!isset($db['documents']) || !is_array($db['documents'])) $db['documents'] = [];
                array_unshift($db['documents'], $doc);
                $addAuditLog('create', 'document', $doc['name'] ?? '', 'Uploaded document ' . ($doc['name'] ?? ''));
            }
            break;

        case 'update_document':
            $doc = $body['document'] ?? [];
            if (!empty($doc) && isset($db['documents'])) {
                $targetId = $doc['id'] ?? '';
                foreach ($db['documents'] as &$existingD) {
                    if (($existingD['id'] ?? '') === $targetId) {
                        $existingD = array_merge($existingD, $doc);
                        break;
                    }
                }
                unset($existingD);
                $addAuditLog('update', 'document', $doc['name'] ?? '', 'Updated document ' . ($doc['name'] ?? ''));
            }
            break;

        case 'delete_document':
            $docId = $body['document_id'] ?? $body['id'] ?? '';
            if (!empty($docId) && isset($db['documents'])) {
                $db['documents'] = array_values(array_filter($db['documents'], function($item) use ($docId) {
                    return ($item['id'] ?? '') !== $docId;
                }));
                $addAuditLog('delete', 'document', $docId, 'Deleted document ' . $docId);
            }
            break;

        case 'create_bill':
            $bill = $body['bill'] ?? [];
            if (!empty($bill)) {
                if (empty($bill['id'])) {
                    $bill['id'] = 'bill-' . round(microtime(true) * 1000);
                }
                if (empty($bill['company_id'])) {
                    $bill['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($bill['currency'])) {
                    $bill['currency'] = ($bill['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                }
                if (empty($bill['bill_no'])) {
                    $prefix = ($bill['company_id'] === 'ashaz-eng-in') ? 'BILL-ASH' : 'BILL-RG-2026';
                    $bill['bill_no'] = $prefix . '-' . rand(100, 999);
                }
                if (empty($bill['approval_status'])) {
                    $bill['approval_status'] = 'approved';
                }
                if (empty($bill['status'])) {
                    $bill['status'] = 'unpaid';
                }
                if (!isset($bill['amount_paid'])) {
                    $bill['amount_paid'] = 0;
                }
                if (!isset($bill['balance_due'])) {
                    $bill['balance_due'] = floatval($bill['grand_total'] ?? 0);
                }
                if (!isset($db['purchase_bills']) || !is_array($db['purchase_bills'])) {
                    $db['purchase_bills'] = [];
                }
                array_unshift($db['purchase_bills'], $bill);
                $addAuditLog('create', 'bill', $bill['bill_no'] ?? '', 'Created purchase bill for ' . ($bill['vendor_name'] ?? ''));
            }
            break;

        case 'create_expense':
            $exp = $body['expense'] ?? [];
            if (!empty($exp)) {
                if (empty($exp['id'])) {
                    $exp['id'] = 'exp-' . round(microtime(true) * 1000);
                }
                if (empty($exp['company_id'])) {
                    $exp['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($exp['currency'])) {
                    $exp['currency'] = ($exp['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                }
                if (empty($exp['expense_no'])) {
                    $prefix = ($exp['company_id'] === 'ashaz-eng-in') ? 'EXP-ASH' : 'EXP-RG-2026';
                    $exp['expense_no'] = $prefix . '-' . rand(100, 999);
                }
                if (empty($exp['status'])) {
                    $exp['status'] = 'approved';
                }
                if (!isset($exp['total_amount'])) {
                    $exp['total_amount'] = floatval($exp['amount'] ?? 0) + floatval($exp['tax_amount'] ?? 0);
                }
                if (empty($exp['submitted_by'])) {
                    $exp['submitted_by'] = $body['user_name'] ?? 'Authorized Personnel';
                }
                if (!isset($db['expenses']) || !is_array($db['expenses'])) {
                    $db['expenses'] = [];
                }
                array_unshift($db['expenses'], $exp);
                $addAuditLog('create', 'expense', $exp['expense_no'] ?? '', 'Recorded operational expense of ' . ($exp['total_amount'] ?? 0));
            }
            break;

        case 'create_po':
            $po = $body['po'] ?? [];
            if (!empty($po)) {
                if (empty($po['id'])) {
                    $po['id'] = 'po-' . round(microtime(true) * 1000);
                }
                if (empty($po['company_id'])) {
                    $po['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($po['currency'])) {
                    $po['currency'] = ($po['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                }
                if (empty($po['po_no'])) {
                    $prefix = ($po['company_id'] === 'ashaz-eng-in') ? 'PO-ASH' : 'PO-REC';
                    $po['po_no'] = $prefix . '-' . rand(10000, 99999);
                }
                if (empty($po['status'])) {
                    $po['status'] = 'approved';
                }
                if (!isset($db['purchase_orders']) || !is_array($db['purchase_orders'])) {
                    $db['purchase_orders'] = [];
                }
                array_unshift($db['purchase_orders'], $po);
                $addAuditLog('create', 'po', $po['po_no'] ?? '', 'Issued purchase order ' . ($po['po_no'] ?? ''));
            }
            break;

        case 'create_credit_note':
            $cn = $body['credit_note'] ?? [];
            if (!empty($cn)) {
                if (empty($cn['id'])) $cn['id'] = 'cn-' . round(microtime(true) * 1000);
                if (empty($cn['company_id'])) $cn['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($cn['currency'])) $cn['currency'] = ($cn['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (empty($cn['credit_note_no'])) {
                    $prefix = ($cn['company_id'] === 'ashaz-eng-in') ? 'CN-ASH' : 'CN-RG-2026';
                    $cn['credit_note_no'] = $prefix . '-' . rand(100, 999);
                }
                if (empty($cn['status'])) $cn['status'] = 'applied';
                if (!isset($db['credit_notes']) || !is_array($db['credit_notes'])) $db['credit_notes'] = [];
                array_unshift($db['credit_notes'], $cn);
                if (!empty($cn['invoice_id']) && isset($db['invoices'])) {
                    $adjAmt = floatval($cn['taxable_amount'] ?? 0) + floatval($cn['tax_amount'] ?? 0);
                    foreach ($db['invoices'] as &$invRef) {
                        if (($invRef['id'] ?? '') === $cn['invoice_id'] || ($invRef['invoice_no'] ?? '') === ($cn['invoice_no'] ?? '')) {
                            $invRef['balance_due'] = max(0, floatval($invRef['balance_due'] ?? 0) - $adjAmt);
                        }
                    }
                    unset($invRef);
                }
                $addAuditLog('create', 'credit_note', $cn['credit_note_no'] ?? '', 'Issued credit note for ' . ($cn['customer_name'] ?? ''));
            }
            break;

        case 'create_debit_note':
            $dn = $body['debit_note'] ?? [];
            if (!empty($dn)) {
                if (empty($dn['id'])) $dn['id'] = 'dn-' . round(microtime(true) * 1000);
                if (empty($dn['company_id'])) $dn['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($dn['currency'])) $dn['currency'] = ($dn['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (empty($dn['debit_note_no'])) {
                    $prefix = ($dn['company_id'] === 'ashaz-eng-in') ? 'DN-ASH' : 'DN-RG-2026';
                    $dn['debit_note_no'] = $prefix . '-' . rand(100, 999);
                }
                if (empty($dn['status'])) $dn['status'] = 'applied';
                if (!isset($db['debit_notes']) || !is_array($db['debit_notes'])) $db['debit_notes'] = [];
                array_unshift($db['debit_notes'], $dn);
                if (!empty($dn['bill_id']) || !empty($dn['bill_no'])) {
                    $adjAmt = floatval($dn['total_debit_amount'] ?? 0);
                    if (isset($db['purchase_bills'])) {
                        foreach ($db['purchase_bills'] as &$bRef) {
                            if (($bRef['id'] ?? '') === ($dn['bill_id'] ?? '') || ($bRef['bill_no'] ?? '') === ($dn['bill_no'] ?? '')) {
                                $bRef['balance_due'] = max(0, floatval($bRef['balance_due'] ?? 0) - $adjAmt);
                            }
                        }
                        unset($bRef);
                    }
                }
                $addAuditLog('create', 'debit_note', $dn['debit_note_no'] ?? '', 'Issued debit note for ' . ($dn['vendor_name'] ?? ''));
            }
            break;

        case 'record_receipt':
            $rcp = $body['receipt'] ?? [];
            if (!empty($rcp)) {
                if (!isset($db['customer_receipts']) || !is_array($db['customer_receipts'])) {
                    $db['customer_receipts'] = [];
                }
                array_unshift($db['customer_receipts'], $rcp);

                // Auto-save bank in saved_banks and link to customer
                if (!empty($rcp['bank_name'])) {
                    if (!isset($db['saved_banks']) || !is_array($db['saved_banks'])) {
                        $db['saved_banks'] = [];
                    }
                    if (!in_array($rcp['bank_name'], $db['saved_banks'])) {
                        array_unshift($db['saved_banks'], $rcp['bank_name']);
                    }
                    if (!empty($rcp['customer_id']) && !empty($db['customers'])) {
                        foreach ($db['customers'] as &$cRef) {
                            if (($cRef['id'] ?? '') === $rcp['customer_id'] || ($cRef['name'] ?? '') === ($rcp['customer_name'] ?? '')) {
                                $cRef['preferred_bank'] = $rcp['bank_name'];
                                $cRef['bank_name'] = $rcp['bank_name'];
                            }
                        }
                        unset($cRef);
                    }
                }
                if (!empty($body['saved_banks']) && is_array($body['saved_banks'])) {
                    if (!isset($db['saved_banks']) || !is_array($db['saved_banks'])) {
                        $db['saved_banks'] = [];
                    }
                    $db['saved_banks'] = array_values(array_unique(array_merge($body['saved_banks'], $db['saved_banks'])));
                }

                // Update allocated invoices
                if (!empty($rcp['allocations']) && is_array($rcp['allocations']) && isset($db['invoices'])) {
                    foreach ($rcp['allocations'] as $alloc) {
                        foreach ($db['invoices'] as &$invRef) {
                            if (($invRef['id'] ?? '') === ($alloc['invoice_id'] ?? '') || ($invRef['invoice_no'] ?? '') === ($alloc['invoice_no'] ?? '')) {
                                $allocAmt = floatval($alloc['amount_allocated'] ?? 0);
                                $invRef['amount_paid'] = floatval($invRef['amount_paid'] ?? 0) + $allocAmt;
                                $invRef['balance_due'] = max(0, floatval($invRef['grand_total'] ?? 0) - $invRef['amount_paid']);
                                if ($invRef['balance_due'] <= 0.01) {
                                    $invRef['status'] = 'paid';
                                } else {
                                    $invRef['status'] = 'partially_paid';
                                }
                            }
                        }
                        unset($invRef);
                    }
                }
                $addAuditLog('create', 'receipt', $rcp['receipt_no'] ?? '', 'Recorded customer receipt of ' . ($rcp['amount_received'] ?? 0));
            }
            break;

        case 'record_payment':
            $pay = $body['payment'] ?? [];
            if (!empty($pay)) {
                if (empty($pay['id'])) {
                    $pay['id'] = 'pay-' . round(microtime(true) * 1000);
                }
                if (empty($pay['company_id'])) {
                    $pay['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($pay['currency'])) {
                    $pay['currency'] = ($pay['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                }
                if (empty($pay['voucher_no'])) {
                    $prefix = ($pay['company_id'] === 'ashaz-eng-in') ? 'PV-ASH' : 'PV-RG-2026';
                    $pay['voucher_no'] = $prefix . '-' . rand(100, 999);
                }
                if (!isset($db['vendor_payments']) || !is_array($db['vendor_payments'])) {
                    $db['vendor_payments'] = [];
                }
                array_unshift($db['vendor_payments'], $pay);

                if (!empty($pay['allocations']) && is_array($pay['allocations']) && isset($db['purchase_bills'])) {
                    foreach ($pay['allocations'] as $alloc) {
                        foreach ($db['purchase_bills'] as &$b) {
                            if (($b['id'] ?? '') === ($alloc['bill_id'] ?? '') || ($b['bill_no'] ?? '') === ($alloc['bill_no'] ?? '')) {
                                $allocAmt = floatval($alloc['amount_allocated'] ?? 0);
                                $b['amount_paid'] = floatval($b['amount_paid'] ?? 0) + $allocAmt;
                                $b['balance_due'] = max(0, floatval($b['grand_total'] ?? 0) - $b['amount_paid']);
                                if ($b['balance_due'] <= 0.01) {
                                    $b['status'] = 'paid';
                                } else {
                                    $b['status'] = 'partially_paid';
                                }
                            }
                        }
                        unset($b);
                    }
                }
                $addAuditLog('create', 'payment', $pay['voucher_no'] ?? '', 'Disbursed vendor payment of ' . ($pay['amount_paid'] ?? 0));
            }
            break;

        case 'create_customer':
            $cust = $body['customer'] ?? [];
            if (!empty($cust) && !empty($cust['name'])) {
                if (empty($cust['id'])) {
                    $cust['id'] = 'cust-' . round(microtime(true) * 1000);
                }
                if (empty($cust['code'])) {
                    $words = preg_split('/\s+/', preg_replace('/[^a-zA-Z0-9\s]/', '', $cust['name']));
                    $abbr = '';
                    foreach ($words as $w) {
                        if (!empty($w)) $abbr .= strtoupper($w[0]);
                    }
                    $cust['code'] = 'CUST-' . (substr($abbr, 0, 5) ?: rand(100, 999));
                }
                if (empty($cust['company_id'])) {
                    $cust['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($cust['status'])) {
                    $cust['status'] = 'active';
                }
                if (!isset($db['customers']) || !is_array($db['customers'])) {
                    $db['customers'] = [];
                }
                $found = false;
                foreach ($db['customers'] as &$exC) {
                    if (($exC['id'] ?? '') === $cust['id'] || strtolower($exC['name'] ?? '') === strtolower($cust['name'])) {
                        $exC = array_merge($exC, $cust);
                        $found = true;
                        break;
                    }
                }
                unset($exC);
                if (!$found) {
                    array_unshift($db['customers'], $cust);
                }
                $addAuditLog('create', 'customer', $cust['name'] ?? '', 'Added client ' . ($cust['name'] ?? ''));
            }
            break;

        case 'create_vendor':
            $vnd = $body['vendor'] ?? [];
            if (!empty($vnd) && !empty($vnd['name'])) {
                if (empty($vnd['id'])) {
                    $vnd['id'] = 'vend-' . round(microtime(true) * 1000);
                }
                if (empty($vnd['code'])) {
                    $vnd['code'] = 'VEND-' . rand(100, 999);
                }
                if (empty($vnd['company_id'])) {
                    $vnd['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                }
                if (empty($vnd['status'])) {
                    $vnd['status'] = 'active';
                }
                if (!isset($db['vendors']) || !is_array($db['vendors'])) {
                    $db['vendors'] = [];
                }
                $found = false;
                foreach ($db['vendors'] as &$exV) {
                    if (($exV['id'] ?? '') === $vnd['id'] || strtolower($exV['name'] ?? '') === strtolower($vnd['name'])) {
                        $exV = array_merge($exV, $vnd);
                        $found = true;
                        break;
                    }
                }
                unset($exV);
                if (!$found) {
                    array_unshift($db['vendors'], $vnd);
                }
                $addAuditLog('create', 'vendor', $vnd['name'] ?? '', 'Added supplier/subcontractor ' . ($vnd['name'] ?? ''));
            }
            break;

        case 'create_item':
            $itm = $body['item'] ?? [];
            if (!empty($itm) && !empty($itm['name'])) {
                if (empty($itm['id'])) {
                    $itm['id'] = 'itm-' . round(microtime(true) * 1000);
                }
                if (empty($itm['code'])) {
                    $itm['code'] = 'ITM-' . rand(100, 999);
                }
                if (empty($itm['status'])) {
                    $itm['status'] = 'active';
                }
                if (!isset($db['items']) || !is_array($db['items'])) {
                    $db['items'] = [];
                }
                $found = false;
                foreach ($db['items'] as &$exI) {
                    if (($exI['id'] ?? '') === $itm['id'] || strtolower($exI['name'] ?? '') === strtolower($itm['name'])) {
                        $exI = array_merge($exI, $itm);
                        $found = true;
                        break;
                    }
                }
                unset($exI);
                if (!$found) {
                    array_unshift($db['items'], $itm);
                }
                $addAuditLog('create', 'item', $itm['name'] ?? '', 'Added catalog item ' . ($itm['name'] ?? ''));
            }
            break;

        
        case 'create_bank_account':
            $bank = $body['bank_account'] ?? $body['bank'] ?? [];
            if (!empty($bank) && !empty($bank['bank_name'])) {
                if (empty($bank['id'])) $bank['id'] = 'bank-' . round(microtime(true) * 1000);
                if (empty($bank['company_id'])) $bank['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($bank['currency'])) $bank['currency'] = ($bank['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (!isset($db['bank_accounts']) || !is_array($db['bank_accounts'])) $db['bank_accounts'] = [];
                array_unshift($db['bank_accounts'], $bank);
                $addAuditLog('create', 'bank_account', $bank['bank_name'] ?? '', 'Added corporate bank account ' . ($bank['bank_name'] ?? ''));
            }
            break;

        case 'update_bank_account':
            $bank = $body['bank_account'] ?? $body['bank'] ?? [];
            $targetId = $body['id'] ?? $bank['id'] ?? '';
            if (!empty($targetId) && !empty($db['bank_accounts'])) {
                foreach ($db['bank_accounts'] as &$exB) {
                    if (($exB['id'] ?? '') === $targetId) {
                        $exB = array_merge($exB, $bank);
                        break;
                    }
                }
                unset($exB);
                $addAuditLog('update', 'bank_account', $targetId, 'Updated bank account ' . $targetId);
            }
            break;

        case 'delete_bank_account':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['bank_accounts'])) {
                $db['bank_accounts'] = array_values(array_filter($db['bank_accounts'], function($b) use ($targetId) {
                    return ($b['id'] ?? '') !== $targetId;
                }));
                $addAuditLog('delete', 'bank_account', $targetId, 'Removed bank account ' . $targetId);
            }
            break;

        case 'record_bank_transfer':
            $trn = $body['transfer'] ?? $body['bank_transfer'] ?? [];
            if (!empty($trn)) {
                if (empty($trn['id'])) $trn['id'] = 'wire-' . round(microtime(true) * 1000);
                if (empty($trn['company_id'])) $trn['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($trn['currency'])) $trn['currency'] = ($trn['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (empty($trn['reference_no'])) {
                    $prefix = ($trn['company_id'] === 'ashaz-eng-in') ? 'RTGS-ASH' : 'FAB-TRN';
                    $trn['reference_no'] = $prefix . '-' . rand(10000, 99999);
                }
                if (!isset($db['bank_transfers']) || !is_array($db['bank_transfers'])) $db['bank_transfers'] = [];
                array_unshift($db['bank_transfers'], $trn);

                $amt = floatval($trn['amount'] ?? 0);
                $srcId = $trn['source_account_id'] ?? '';
                $destId = $trn['destination_account_id'] ?? '';
                if ($amt > 0 && !empty($db['bank_accounts'])) {
                    foreach ($db['bank_accounts'] as &$b) {
                        if (($b['id'] ?? '') === $srcId) {
                            $b['balance'] = floatval($b['balance'] ?? 0) - $amt;
                        }
                        if (!empty($destId) && ($b['id'] ?? '') === $destId) {
                            $b['balance'] = floatval($b['balance'] ?? 0) + $amt;
                        }
                    }
                    unset($b);
                }
                $addAuditLog('create', 'bank_transfer', $trn['reference_no'] ?? '', 'Recorded bank wire ' . ($trn['reference_no'] ?? ''));
            }
            break;

        case 'delete_bank_transfer':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['bank_transfers'])) {
                $db['bank_transfers'] = array_values(array_filter($db['bank_transfers'], function($t) use ($targetId) {
                    return ($t['id'] ?? '') !== $targetId;
                }));
                $addAuditLog('delete', 'bank_transfer', $targetId, 'Deleted wire transfer ' . $targetId);
            }
            break;

        case 'create_cash_register':
            $reg = $body['register'] ?? $body['cash_register'] ?? [];
            if (!empty($reg) && !empty($reg['register_name'])) {
                if (empty($reg['id'])) $reg['id'] = 'cash-' . round(microtime(true) * 1000);
                if (empty($reg['company_id'])) $reg['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($reg['currency'])) $reg['currency'] = ($reg['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (!isset($db['cash_in_hand']) || !is_array($db['cash_in_hand'])) $db['cash_in_hand'] = [];
                array_unshift($db['cash_in_hand'], $reg);
                $addAuditLog('create', 'cash_register', $reg['register_name'] ?? '', 'Added cash register ' . ($reg['register_name'] ?? ''));
            }
            break;

        case 'update_cash_register':
            $reg = $body['register'] ?? $body['cash_register'] ?? [];
            $targetId = $body['id'] ?? $reg['id'] ?? '';
            if (!empty($targetId) && !empty($db['cash_in_hand'])) {
                foreach ($db['cash_in_hand'] as &$exR) {
                    if (($exR['id'] ?? '') === $targetId) {
                        $exR = array_merge($exR, $reg);
                        break;
                    }
                }
                unset($exR);
                $addAuditLog('update', 'cash_register', $targetId, 'Updated cash register ' . $targetId);
            }
            break;

        case 'delete_cash_register':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['cash_in_hand'])) {
                $db['cash_in_hand'] = array_values(array_filter($db['cash_in_hand'], function($r) use ($targetId) {
                    return ($r['id'] ?? '') !== $targetId;
                }));
                $addAuditLog('delete', 'cash_register', $targetId, 'Deleted cash register ' . $targetId);
            }
            break;

        case 'record_cash_voucher':
            $cv = $body['voucher'] ?? $body['cash_voucher'] ?? [];
            if (!empty($cv)) {
                if (empty($cv['id'])) $cv['id'] = 'cv-' . round(microtime(true) * 1000);
                if (empty($cv['company_id'])) $cv['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($cv['currency'])) $cv['currency'] = ($cv['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (empty($cv['voucher_no'])) {
                    $prefix = ($cv['company_id'] === 'ashaz-eng-in') ? 'PC-MUM' : 'PC-DXB';
                    $cv['voucher_no'] = $prefix . '-' . rand(100, 999);
                }
                if (!isset($db['cash_vouchers']) || !is_array($db['cash_vouchers'])) $db['cash_vouchers'] = [];
                array_unshift($db['cash_vouchers'], $cv);

                $amt = floatval($cv['amount'] ?? 0);
                $vaultId = $cv['register_id'] ?? '';
                $type = $cv['type'] ?? 'outflow';
                if ($amt > 0 && !empty($vaultId) && !empty($db['cash_in_hand'])) {
                    foreach ($db['cash_in_hand'] as &$vr) {
                        if (($vr['id'] ?? '') === $vaultId) {
                            if ($type === 'inflow') {
                                $vr['balance'] = floatval($vr['balance'] ?? 0) + $amt;
                            } else {
                                $vr['balance'] = floatval($vr['balance'] ?? 0) - $amt;
                            }
                            $vr['last_replenished'] = $cv['date'] ?? date('Y-m-d');
                            break;
                        }
                    }
                    unset($vr);
                }
                $addAuditLog('create', 'cash_voucher', $cv['voucher_no'] ?? '', 'Recorded petty cash voucher ' . ($cv['voucher_no'] ?? ''));
            }
            break;

        case 'delete_cash_voucher':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['cash_vouchers'])) {
                $db['cash_vouchers'] = array_values(array_filter($db['cash_vouchers'], function($v) use ($targetId) {
                    return ($v['id'] ?? '') !== $targetId;
                }));
                $addAuditLog('delete', 'cash_voucher', $targetId, 'Deleted cash voucher ' . $targetId);
            }
            break;

        case 'record_cheque':
            $chq = $body['cheque'] ?? [];
            if (!empty($chq)) {
                if (empty($chq['id'])) $chq['id'] = 'chq-' . round(microtime(true) * 1000);
                if (empty($chq['company_id'])) $chq['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($chq['currency'])) $chq['currency'] = ($chq['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (!isset($db['cheques']) || !is_array($db['cheques'])) $db['cheques'] = [];
                array_unshift($db['cheques'], $chq);
                $addAuditLog('create', 'cheque', $chq['cheque_no'] ?? '', 'Recorded cheque ' . ($chq['cheque_no'] ?? ''));
            }
            break;

        case 'update_cheque_status':
            $targetId = $body['id'] ?? '';
            $newStatus = $body['status'] ?? 'Cleared';
            $bankAccId = $body['bank_account_id'] ?? '';
            if (!empty($targetId) && !empty($db['cheques'])) {
                foreach ($db['cheques'] as &$cq) {
                    if (($cq['id'] ?? '') === $targetId) {
                        $oldStatus = $cq['status'] ?? '';
                        $cq['status'] = $newStatus;
                        if ($newStatus === 'Cleared' && $oldStatus !== 'Cleared') {
                            $amt = floatval($cq['amount'] ?? 0);
                            if ($amt > 0 && !empty($db['bank_accounts'])) {
                                foreach ($db['bank_accounts'] as &$b) {
                                    if (($b['id'] ?? '') === $bankAccId || (empty($bankAccId) && strtolower($b['bank_name'] ?? '') === strtolower($cq['bank_name'] ?? ''))) {
                                        if (($cq['type'] ?? '') === 'inward') {
                                            $b['balance'] = floatval($b['balance'] ?? 0) + $amt;
                                        } else {
                                            $b['balance'] = floatval($b['balance'] ?? 0) - $amt;
                                        }
                                        break;
                                    }
                                }
                                unset($b);
                            }
                        }
                        break;
                    }
                }
                unset($cq);
                $addAuditLog('update', 'cheque', $targetId, 'Updated cheque status to ' . $newStatus);
            }
            break;

        case 'delete_cheque':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['cheques'])) {
                $db['cheques'] = array_values(array_filter($db['cheques'], function($c) use ($targetId) {
                    return ($c['id'] ?? '') !== $targetId;
                }));
                $addAuditLog('delete', 'cheque', $targetId, 'Deleted cheque ' . $targetId);
            }
            break;

        case 'create_loan_account':
            $loan = $body['loan_account'] ?? $body['loan'] ?? [];
            if (!empty($loan) && !empty($loan['facility_name'])) {
                if (empty($loan['id'])) $loan['id'] = 'loan-' . round(microtime(true) * 1000);
                if (empty($loan['company_id'])) $loan['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($loan['currency'])) $loan['currency'] = ($loan['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                $sanc = floatval($loan['sanctioned_limit'] ?? 0);
                $out = floatval($loan['outstanding_balance'] ?? 0);
                $loan['available_limit'] = max(0, $sanc - $out);
                if (!isset($db['loan_accounts']) || !is_array($db['loan_accounts'])) $db['loan_accounts'] = [];
                array_unshift($db['loan_accounts'], $loan);
                $addAuditLog('create', 'loan_account', $loan['facility_name'] ?? '', 'Added corporate loan facility ' . ($loan['facility_name'] ?? ''));
            }
            break;

        case 'update_loan_account':
            $loan = $body['loan_account'] ?? $body['loan'] ?? [];
            $targetId = $body['id'] ?? $loan['id'] ?? '';
            if (!empty($targetId) && !empty($db['loan_accounts'])) {
                foreach ($db['loan_accounts'] as &$exL) {
                    if (($exL['id'] ?? '') === $targetId) {
                        $exL = array_merge($exL, $loan);
                        $sanc = floatval($exL['sanctioned_limit'] ?? 0);
                        $out = floatval($exL['outstanding_balance'] ?? 0);
                        $exL['available_limit'] = max(0, $sanc - $out);
                        break;
                    }
                }
                unset($exL);
                $addAuditLog('update', 'loan_account', $targetId, 'Updated loan facility ' . $targetId);
            }
            break;

        case 'delete_loan_account':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['loan_accounts'])) {
                $db['loan_accounts'] = array_values(array_filter($db['loan_accounts'], function($l) use ($targetId) {
                    return ($l['id'] ?? '') !== $targetId;
                }));
                $addAuditLog('delete', 'loan_account', $targetId, 'Deleted loan facility ' . $targetId);
            }
            break;

        case 'record_loan_transaction':
            $lt = $body['transaction'] ?? $body['loan_transaction'] ?? [];
            if (!empty($lt)) {
                if (empty($lt['id'])) $lt['id'] = 'lt-' . round(microtime(true) * 1000);
                if (empty($lt['company_id'])) $lt['company_id'] = $body['company_id'] ?? 'rayan-corp-uae';
                if (empty($lt['currency'])) $lt['currency'] = ($lt['company_id'] === 'ashaz-eng-in') ? 'INR' : 'AED';
                if (!isset($db['loan_transactions']) || !is_array($db['loan_transactions'])) $db['loan_transactions'] = [];
                array_unshift($db['loan_transactions'], $lt);

                $facId = $lt['facility_id'] ?? '';
                $amt = floatval($lt['amount'] ?? 0);
                $tType = $lt['type'] ?? 'repayment';
                if ($amt > 0 && !empty($facId) && !empty($db['loan_accounts'])) {
                    foreach ($db['loan_accounts'] as &$lf) {
                        if (($lf['id'] ?? '') === $facId) {
                            if ($tType === 'drawdown') {
                                $lf['outstanding_balance'] = floatval($lf['outstanding_balance'] ?? 0) + $amt;
                            } else if ($tType === 'repayment') {
                                $lf['outstanding_balance'] = max(0, floatval($lf['outstanding_balance'] ?? 0) - $amt);
                            }
                            $lf['available_limit'] = max(0, floatval($lf['sanctioned_limit'] ?? 0) - floatval($lf['outstanding_balance'] ?? 0));
                            break;
                        }
                    }
                    unset($lf);
                }
                $addAuditLog('create', 'loan_transaction', $lt['reference_no'] ?? '', 'Recorded loan transaction of ' . ($lt['amount'] ?? 0));
            }
            break;

        case 'delete_loan_transaction':
            $targetId = $body['id'] ?? '';
            if (!empty($targetId) && !empty($db['loan_transactions'])) {
                $db['loan_transactions'] = array_values(array_filter($db['loan_transactions'], function($t) use ($targetId) {
                    return ($t['id'] ?? '') !== $targetId;
                }));
                $addAuditLog('delete', 'loan_transaction', $targetId, 'Deleted loan transaction ' . $targetId);
            }
            break;
        case 'sync_full':
            if (!empty($body['full_db']) && is_array($body['full_db'])) {
                $db = $body['full_db'];
                if ($pdo) {
                    try {
                        $pdo->exec("DELETE FROM finance_invoices WHERE invoice_no LIKE 'INV-2026-%'");
                        $pdo->exec("DELETE FROM finance_receipts WHERE receipt_no LIKE 'REC-2026-%'");
                        $pdo->exec("DELETE FROM finance_customers WHERE code IN ('CUST-LT', 'CUST-EMAAR', 'CUST-NHAI', 'CUST-DPA', 'CUST-YOK')");
                    } catch (Exception $e) {
                        error_log("Mock cleanup error: " . $e->getMessage());
                    }
                }
                $addAuditLog('sync', 'database', 'all', 'Client synchronized full state');
            }
            break;
    }

    // Save directly to Hostinger MySQL Database and local JSON
    saveFinanceDb($pdo, $dataFile, $db, $candidates);

    echo json_encode([
        'success' => true,
        'storage' => $pdo ? 'hostinger_mysql' : 'json_file',
        'customer' => $cust ?? null,
        'project' => $prj ?? null,
        'receipt' => $rcp ?? null,
        'payment' => $pay ?? null,
        'vendor' => $vnd ?? null,
        'item' => $itm ?? null,
        'invoice' => $inv ?? null,
        'bill' => $bill ?? null,
        'expense' => $exp ?? null,
        'po' => $po ?? null,
        'credit_note' => $cn ?? null,
        'debit_note' => $dn ?? null,
        'data' => $db
    ]);
    exit;
}
