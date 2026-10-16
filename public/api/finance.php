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
    __DIR__ . '/../../data/finance-data.json',
    __DIR__ . '/../data/finance-data.json',
    __DIR__ . '/data/finance-data.json',
    dirname(__DIR__, 2) . '/data/finance-data.json'
];

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

function saveFinanceDb($dataFile, $data) {
    $dir = dirname($dataFile);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    return @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) !== false;
}

$db = loadFinanceDb($dataFile);

// If file not readable yet, try reading from other candidate paths
if (!$db) {
    foreach ($candidates as $c) {
        $temp = loadFinanceDb($c);
        if ($temp) {
            $db = $temp;
            $dataFile = $c;
            break;
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
    if (!$db) {
        $db = ['users' => [], 'invoices' => [], 'bills' => [], 'receipts' => [], 'payments' => [], 'customers' => [], 'vendors' => [], 'items' => [], 'audit_logs' => []];
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
                $db['invoices'][] = $inv;
                $addAuditLog('create', 'invoice', $inv['invoice_no'] ?? '', 'Created tax invoice for ' . ($inv['customer_name'] ?? ''));
            }
            break;

        case 'create_bill':
            $bill = $body['bill'] ?? [];
            if (!empty($bill)) {
                $db['bills'][] = $bill;
                $addAuditLog('create', 'bill', $bill['bill_no'] ?? '', 'Created purchase bill for ' . ($bill['vendor_name'] ?? ''));
            }
            break;

        case 'record_receipt':
            $rcp = $body['receipt'] ?? [];
            if (!empty($rcp)) {
                $db['receipts'][] = $rcp;
                // update invoice
                foreach ($db['invoices'] as &$inv) {
                    if ($inv['id'] === ($rcp['invoice_id'] ?? '')) {
                        $inv['amount_paid'] = ($inv['amount_paid'] ?? 0) + ($rcp['amount'] ?? 0);
                        $inv['balance_due'] = max(0, ($inv['grand_total'] ?? 0) - $inv['amount_paid']);
                        if ($inv['balance_due'] <= 0) {
                            $inv['status'] = 'paid';
                        }
                    }
                }
                unset($inv);
                $addAuditLog('create', 'receipt', $rcp['receipt_no'] ?? '', 'Recorded customer receipt of ' . ($rcp['amount'] ?? 0));
            }
            break;

        case 'record_payment':
            $pay = $body['payment'] ?? [];
            if (!empty($pay)) {
                $db['payments'][] = $pay;
                // update bill
                foreach ($db['bills'] as &$b) {
                    if ($b['id'] === ($pay['bill_id'] ?? '')) {
                        $b['amount_paid'] = ($b['amount_paid'] ?? 0) + ($pay['amount'] ?? 0);
                        $b['balance_due'] = max(0, ($b['grand_total'] ?? 0) - $b['amount_paid']);
                        if ($b['balance_due'] <= 0) {
                            $b['status'] = 'paid';
                        }
                    }
                }
                unset($b);
                $addAuditLog('create', 'payment', $pay['payment_no'] ?? '', 'Disbursed vendor payment of ' . ($pay['amount'] ?? 0));
            }
            break;

        case 'create_customer':
            $cust = $body['customer'] ?? [];
            if (!empty($cust)) {
                $db['customers'][] = $cust;
                $addAuditLog('create', 'customer', $cust['name'] ?? '', 'Added client ' . ($cust['name'] ?? ''));
            }
            break;

        case 'create_vendor':
            $vnd = $body['vendor'] ?? [];
            if (!empty($vnd)) {
                $db['vendors'][] = $vnd;
                $addAuditLog('create', 'vendor', $vnd['name'] ?? '', 'Added supplier/subcontractor ' . ($vnd['name'] ?? ''));
            }
            break;

        case 'create_item':
            $itm = $body['item'] ?? [];
            if (!empty($itm)) {
                $db['items'][] = $itm;
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

    saveFinanceDb($dataFile, $db);

    echo json_encode([
        'success' => true,
        'data' => $db
    ]);
    exit;
}
