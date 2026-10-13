<?php
/**
 * Rayan Group — Admin Authentication & Passcode Management API
 * Endpoint: /api/auth.php (or /api/auth via rewrite)
 */

require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$configFile = __DIR__ . '/config.php';

function getActiveAdminPassword($configFile, $pdo) {
    // 1. Check config.php (highest priority for Hostinger File Manager edits)
    if (file_exists($configFile)) {
        try {
            $conf = include $configFile;
            if (is_array($conf) && !empty($conf['admin_password'])) {
                return (string)$conf['admin_password'];
            }
        } catch (Exception $e) {}
    }

    // 2. Check MySQL admin_settings table
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT setting_val FROM admin_settings WHERE setting_key = 'admin_password' LIMIT 1");
            $stmt->execute();
            $val = $stmt->fetchColumn();
            if ($val) {
                return (string)$val;
            }
        } catch (Exception $e) {}
    }

    // 3. Check environment variable
    $envPass = getenv('ADMIN_PASSWORD');
    if ($envPass) {
        return (string)$envPass;
    }

    // 4. Fallback default
    return 'rayan2026';
}

$pdo = getDbConnection();

// Ensure admin_settings table exists
if ($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS admin_settings (
                setting_key VARCHAR(64) PRIMARY KEY,
                setting_val TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {}
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: $_POST;
$action = $_GET['action'] ?? $body['action'] ?? 'status';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'status') {
        echo json_encode([
            'success' => true,
            'configured' => file_exists($configFile),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $activePassword = getActiveAdminPassword($configFile, $pdo);

    // 1. Verify Passcode
    if ($action === 'verify' || $action === 'login') {
        $entered = trim($body['password'] ?? $body['pin'] ?? '');
        if (!$entered) {
            http_response_code(400);
            echo json_encode(['success' => false, 'authorized' => false, 'error' => 'Password required']);
            exit;
        }

        if (hash_equals($activePassword, $entered)) {
            echo json_encode(['success' => true, 'authorized' => true, 'message' => 'Authentication successful']);
            exit;
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'authorized' => false, 'error' => 'Invalid corporate access key']);
            exit;
        }
    }

    // 2. Change Passcode
    if ($action === 'change_password') {
        $current = trim($body['current_password'] ?? '');
        $newPass = trim($body['new_password'] ?? '');

        if (!$current || !$newPass) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Both current and new passwords are required']);
            exit;
        }

        if (!hash_equals($activePassword, $current)) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Current password is incorrect']);
            exit;
        }

        if (strlen($newPass) < 4) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'New password must be at least 4 characters']);
            exit;
        }

        // Save to config.php
        $escapedNew = addslashes($newPass);
        $configContent = "<?php\n"
            . "/**\n"
            . " * Rayan Group — Hostinger Administrative Security Configuration\n"
            . " * \n"
            . " * YOU CAN CHANGE YOUR ADMIN PASSWORD HERE DIRECTLY IN HOSTINGER FILE MANAGER!\n"
            . " * File Path: /public_html/api/config.php\n"
            . " */\n\n"
            . "return [\n"
            . "    'admin_password' => '{$escapedNew}',\n"
            . "    'deploy_token' => 'rayan_deploy_2026_secret_key'\n"
            . "];\n";

        @file_put_contents($configFile, $configContent);

        // Save to MySQL admin_settings
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("INSERT INTO admin_settings (setting_key, setting_val) VALUES ('admin_password', ?) ON DUPLICATE KEY UPDATE setting_val = VALUES(setting_val)");
                $stmt->execute([$newPass]);
            } catch (Exception $e) {}
        }

        echo json_encode(['success' => true, 'message' => 'Admin password updated successfully']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Unknown action']);
