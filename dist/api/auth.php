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
    // 1. Check config.php via direct read (bypasses PHP OPcache bytecode caching for instant updates)
    if (file_exists($configFile)) {
        $content = @file_get_contents($configFile);
        if ($content && preg_match("/['\"]admin_password['\"]\s*=>\s*['\"]([^'\"]+)['\"]/", $content, $matches)) {
            return (string)$matches[1];
        }
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

    // 1. Verify Passcode or Corporate Email Login
    if ($action === 'verify' || $action === 'login' || $action === 'finance_login') {
        // A. Corporate User Email + Password Login (Financial Portal /billing/)
        if (!empty($body['email'])) {
            $email = strtolower(trim($body['email']));
            $password = trim($body['password'] ?? '');

            if (!$password) {
                http_response_code(400);
                echo json_encode(['success' => false, 'authorized' => false, 'error' => 'Password required']);
                exit;
            }

            // Default authorized personnel list
            $defaultUsers = [
                [
                    "id" => "usr-001",
                    "email" => "superadmin@rayangroup.com",
                    "password" => "Rayan@Admin2026",
                    "name" => "Arshad Alam Shaikh",
                    "role" => "super_admin",
                    "role_label" => "Super Administrator",
                    "designation" => "Group Chairman & Managing Director",
                    "department" => "Executive Board & Group Governance",
                    "phone" => "+971 50 248 9911",
                    "status" => "active"
                ],
                [
                    "id" => "usr-002",
                    "email" => "finance.admin@rayangroup.com",
                    "password" => "Finance@Rayan2026",
                    "name" => "Zameer Ahmed Khan",
                    "role" => "finance_admin",
                    "role_label" => "Finance Administrator",
                    "designation" => "Chief Financial Officer (CFO)",
                    "department" => "Group Accounts & Treasury",
                    "phone" => "+91 98201 44521",
                    "status" => "active"
                ],
                [
                    "id" => "usr-003",
                    "email" => "accountant@rayangroup.com",
                    "password" => "Accounts@Rayan2026",
                    "name" => "Pooja Sharma",
                    "role" => "accountant",
                    "role_label" => "Accountant",
                    "designation" => "Senior Financial Accountant",
                    "department" => "Accounts Payable & Receivable",
                    "phone" => "+91 98334 11290",
                    "status" => "active"
                ],
                [
                    "id" => "usr-004",
                    "email" => "pm.tariq@rayangroup.com",
                    "password" => "Project@Rayan2026",
                    "name" => "Tariq Mansoor",
                    "role" => "project_manager",
                    "role_label" => "Project Manager",
                    "designation" => "Senior Project Director",
                    "department" => "Civil Infrastructure & EPC",
                    "phone" => "+971 52 918 3320",
                    "status" => "active"
                ],
                [
                    "id" => "usr-005",
                    "email" => "employee.rahul@rayangroup.com",
                    "password" => "Staff@Rayan2026",
                    "name" => "Rahul Deshmukh",
                    "role" => "employee",
                    "role_label" => "Employee",
                    "designation" => "Site MEP & Civil Engineer",
                    "department" => "Project Field Operations",
                    "phone" => "+91 97665 88210",
                    "status" => "active"
                ],
                [
                    "id" => "usr-006",
                    "email" => "management@rayangroup.com",
                    "password" => "Exec@Rayan2026",
                    "name" => "Farhan Al Nuaimi",
                    "role" => "management_readonly",
                    "role_label" => "Management (Read-Only)",
                    "designation" => "Independent Board Advisor",
                    "department" => "Corporate Governance & Audit",
                    "phone" => "+971 50 882 1944",
                    "status" => "active"
                ]
            ];

            // Attempt to load from JSON data file if exists
            $users = $defaultUsers;
            $dataPaths = [
                __DIR__ . '/../../data/finance-data.json',
                __DIR__ . '/../data/finance-data.json',
                __DIR__ . '/data/finance-data.json'
            ];
            foreach ($dataPaths as $p) {
                if (file_exists($p)) {
                    $raw = @file_get_contents($p);
                    if ($raw) {
                        $parsed = json_decode($raw, true);
                        if (!empty($parsed['users'])) {
                            $users = $parsed['users'];
                            break;
                        }
                    }
                }
            }

            $matched = null;
            foreach ($users as $u) {
                if (strtolower($u['email']) === $email) {
                    $matched = $u;
                    break;
                }
            }

            if ($matched && hash_equals($matched['password'], $password)) {
                if (($matched['status'] ?? 'active') === 'suspended') {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'error' => 'This account is suspended. Please contact administrator.']);
                    exit;
                }
                unset($matched['password']);
                $token = 'sess_' . bin2hex(random_bytes(16));
                echo json_encode([
                    'success' => true,
                    'authorized' => true,
                    'token' => $token,
                    'user' => $matched,
                    'message' => 'Authentication successful'
                ]);
                exit;
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'authorized' => false, 'error' => 'Invalid corporate email or password.']);
                exit;
            }
        }

        // B. Admin Command Center Single-PIN Verification (/admin/)
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
