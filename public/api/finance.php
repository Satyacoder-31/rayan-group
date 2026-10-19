<?php
/**
 * Rayan Group — Enterprise Accounts & Billing Management API
 * Endpoint: /api/finance.php (or /api/finance via rewrite)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Locate finance-data.json
$candidates = [
    __DIR__ . '/../data/finance-data.json',
    __DIR__ . '/../../data/finance-data.json',
    __DIR__ . '/data/finance-data.json',
    dirname(__DIR__, 2) . '/data/finance-data.json',
    dirname(__DIR__, 2) . '/site/data/finance-data.json',
    dirname(__DIR__, 2) . '/site/public/data/finance-data.json',
    dirname(__DIR__, 2) . '/site/dist/data/finance-data.json'
];

if (isset($_SERVER['DOCUMENT_ROOT'])) {
    $candidates[] = $_SERVER['DOCUMENT_ROOT'] . '/data/finance-data.json';
    $candidates[] = $_SERVER['DOCUMENT_ROOT'] . '/site/data/finance-data.json';
    $candidates[] = $_SERVER['DOCUMENT_ROOT'] . '/site/public/data/finance-data.json';
    $candidates[] = $_SERVER['DOCUMENT_ROOT'] . '/site/dist/data/finance-data.json';
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

function loadFinanceDb($dataFile) {
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        if ($raw) {
            $data = json_decode($raw, true);
            if ($data && is_array($data)) {
                return $data;
            }
        }
    }
    return null;
}

function saveFinanceDb($dataFile, $data, $candidates = []) {
    // Prevent corrupting or wiping master collections
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
    $dir = dirname($dataFile);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    return @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) !== false;
}

$db = loadFinanceDb($dataFile);
$masterSeed = getMasterSeed($candidates);

// Auto-repair: if $db is null or corrupted (missing companies/customers), repair using masterSeed
if (!$db || empty($db['companies']) || count($db['companies']) === 0) {
    if ($masterSeed) {
        $collectionsToPreserve = ['invoices', 'customer_receipts', 'customers', 'vendors', 'items', 'purchase_bills', 'vendor_payments', 'expenses', 'purchase_orders', 'audit_logs'];
        foreach ($collectionsToPreserve as $col) {
            if (!empty($db[$col]) && is_array($db[$col])) {
                if (!isset($masterSeed[$col]) || !is_array($masterSeed[$col])) {
                    $masterSeed[$col] = [];
                }
                foreach ($db[$col] as $existingItem) {
                    $k = $existingItem['id'] ?? $existingItem['receipt_no'] ?? $existingItem['invoice_no'] ?? $existingItem['bill_no'] ?? $existingItem['voucher_no'] ?? $existingItem['code'] ?? $existingItem['name'] ?? null;
                    if (!$k) continue;
                    $found = false;
                    foreach ($masterSeed[$col] as &$sItem) {
                        $sk = $sItem['id'] ?? $sItem['receipt_no'] ?? $sItem['invoice_no'] ?? $sItem['bill_no'] ?? $sItem['voucher_no'] ?? $sItem['code'] ?? $sItem['name'] ?? null;
                        if ($sk === $k) {
                            $sItem = $existingItem;
                            $found = true;
                            break;
                        }
                    }
                    unset($sItem);
                    if (!$found) {
                        array_unshift($masterSeed[$col], $existingItem);
                    }
                }
            }
        }
        $db = $masterSeed;
        if ($dataFile) {
            saveFinanceDb($dataFile, $db, $candidates);
        }
    }
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: $_POST;
$action = $_GET['action'] ?? $body['action'] ?? 'get_state';

// GET Handler
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'get_state') {
        echo json_encode([
            'success' => true,
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

// POST Handler
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$db || empty($db['companies'])) {
        $db = $masterSeed ?: ['users' => [], 'invoices' => [], 'bills' => [], 'receipts' => [], 'payments' => [], 'customers' => [], 'vendors' => [], 'items' => [], 'audit_logs' => []];
    }

    // Helper for audit logging
    $addAuditLog = function($actionType, $entity, $entityId, $details) use (&$db, $body) {
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
            $inv = $body['invoice'] ?? [];
            if (!empty($inv)) {
                array_unshift($db['invoices'], $inv);
                $addAuditLog('create', 'invoice', $inv['invoice_no'] ?? '', 'Created tax invoice for ' . ($inv['customer_name'] ?? ''));
            }
            break;

        case 'create_bill':
            $bill = $body['bill'] ?? [];
            if (!empty($bill)) {
                if (!isset($db['purchase_bills'])) $db['purchase_bills'] = [];
                array_unshift($db['purchase_bills'], $bill);
                $addAuditLog('create', 'bill', $bill['bill_no'] ?? '', 'Created purchase bill for ' . ($bill['vendor_name'] ?? ''));
            }
            break;

        case 'record_receipt':
            $rcp = $body['receipt'] ?? [];
            if (!empty($rcp)) {
                if (!isset($db['customer_receipts'])) $db['customer_receipts'] = [];
                array_unshift($db['customer_receipts'], $rcp);

                // Update allocated invoices
                if (!empty($rcp['allocations']) && is_array($rcp['allocations'])) {
                    foreach ($rcp['allocations'] as $alloc) {
                        foreach ($db['invoices'] as &$inv) {
                            if ($inv['id'] === ($alloc['invoice_id'] ?? '') || $inv['invoice_no'] === ($alloc['invoice_no'] ?? '')) {
                                $allocAmt = floatval($alloc['amount_allocated'] ?? 0);
                                $inv['amount_paid'] = floatval($inv['amount_paid'] ?? 0) + $allocAmt;
                                $inv['balance_due'] = max(0, floatval($inv['grand_total'] ?? 0) - $inv['amount_paid']);
                                if ($inv['balance_due'] <= 0.01) {
                                    $inv['status'] = 'paid';
                                } else {
                                    $inv['status'] = 'partially_paid';
                                }
                            }
                        }
                        unset($inv);
                    }
                } elseif (!empty($rcp['invoice_id'])) {
                    foreach ($db['invoices'] as &$inv) {
                        if ($inv['id'] === $rcp['invoice_id']) {
                            $allocAmt = floatval($rcp['amount_received'] ?? $rcp['amount'] ?? 0);
                            $inv['amount_paid'] = floatval($inv['amount_paid'] ?? 0) + $allocAmt;
                            $inv['balance_due'] = max(0, floatval($inv['grand_total'] ?? 0) - $inv['amount_paid']);
                            if ($inv['balance_due'] <= 0.01) {
                                $inv['status'] = 'paid';
                            } else {
                                $inv['status'] = 'partially_paid';
                            }
                        }
                    }
                    unset($inv);
                }
                $addAuditLog('create', 'receipt', $rcp['receipt_no'] ?? '', 'Recorded customer receipt of ' . ($rcp['amount_received'] ?? $rcp['amount'] ?? 0));
            }
            break;

        case 'record_payment':
            $pay = $body['payment'] ?? [];
            if (!empty($pay)) {
                if (!isset($db['vendor_payments'])) $db['vendor_payments'] = [];
                array_unshift($db['vendor_payments'], $pay);

                // Update allocated purchase bills
                if (!empty($pay['allocations']) && is_array($pay['allocations']) && isset($db['purchase_bills'])) {
                    foreach ($pay['allocations'] as $alloc) {
                        foreach ($db['purchase_bills'] as &$b) {
                            if ($b['id'] === ($alloc['bill_id'] ?? '') || $b['bill_no'] === ($alloc['bill_no'] ?? '')) {
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
                } elseif (!empty($pay['bill_id']) && isset($db['purchase_bills'])) {
                    foreach ($db['purchase_bills'] as &$b) {
                        if ($b['id'] === $pay['bill_id']) {
                            $allocAmt = floatval($pay['amount_paid'] ?? $pay['amount'] ?? 0);
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
                $addAuditLog('create', 'payment', $pay['voucher_no'] ?? $pay['payment_no'] ?? '', 'Disbursed vendor payment of ' . ($pay['amount_paid'] ?? $pay['amount'] ?? 0));
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

        case 'sync_full':
            if (!empty($body['full_db']) && is_array($body['full_db'])) {
                $db = $body['full_db'];
                $addAuditLog('sync', 'database', 'all', 'Client synchronized full state');
            }
            break;
    }

    saveFinanceDb($dataFile, $db, $candidates);

    echo json_encode([
        'success' => true,
        'customer' => $cust ?? null,
        'receipt' => $rcp ?? null,
        'payment' => $pay ?? null,
        'vendor' => $vnd ?? null,
        'item' => $itm ?? null,
        'invoice' => $inv ?? null,
        'data' => $db
    ]);
    exit;
}
