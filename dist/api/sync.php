<?php
/**
 * Rayan Group — Production Server Sync & Hostinger Database Setup
 * Execution Endpoint: https://rayan-group.com/api/sync.php?token=rayan_deploy_2026_secret_key
 */

header('Content-Type: application/json; charset=utf-8');

$expectedToken = 'rayan_deploy_2026_secret_key';
if (($_GET['token'] ?? '') !== $expectedToken) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// 1. Determine public_html directory
$current = __DIR__;
$publicHtmlDir = null;
$temp = $current;
while ($temp && $temp !== '/' && $temp !== '.') {
    if (basename($temp) === 'public_html') {
        $publicHtmlDir = $temp;
        break;
    }
    $parent = dirname($temp);
    if ($parent === $temp) break;
    $temp = $parent;
}

if (!$publicHtmlDir) {
    if (is_dir('/home/u575992126/domains/rayan-group.com/public_html')) {
        $publicHtmlDir = '/home/u575992126/domains/rayan-group.com/public_html';
    } else {
        $publicHtmlDir = realpath(__DIR__ . '/../..') ?: realpath(__DIR__ . '/..');
    }
}

// Target directory is ALWAYS the live website public_html
$rootDir = $publicHtmlDir;

// Determine source directory: git clone is at public_html/site
$siteDir = is_dir($publicHtmlDir . '/site') ? ($publicHtmlDir . '/site') : (realpath(__DIR__ . '/..'));
if (is_dir($siteDir . '/dist')) {
    $sourceDir = $siteDir . '/dist';
} elseif (is_dir($publicHtmlDir . '/dist')) {
    $sourceDir = $publicHtmlDir . '/dist';
} else {
    $sourceDir = $siteDir;
}

$response = [
    'success' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'site_dir' => $siteDir,
    'root_dir' => $rootDir,
    'source_dir' => $sourceDir,
    'database' => [],
    'sync_results' => []
];

if (isset($_GET['inspect'])) {
    $target = $_GET['inspect'];
    $out = [];
    if ($target === 'waldorf') {
        $rootWaldorf = $rootDir . '/projects/waldorf-astoria-renovation-rak/index.html';
        $siteWaldorf = $siteDir . '/projects/waldorf-astoria-renovation-rak/index.html';
        $distWaldorf = $sourceDir . '/projects/waldorf-astoria-renovation-rak/index.html';
        $out['root_exists'] = file_exists($rootWaldorf);
        $out['root_mtime'] = file_exists($rootWaldorf) ? date('Y-m-d H:i:s', filemtime($rootWaldorf)) : null;
        $out['root_size'] = file_exists($rootWaldorf) ? filesize($rootWaldorf) : 0;
        $out['site_exists'] = file_exists($siteWaldorf);
        $out['site_mtime'] = file_exists($siteWaldorf) ? date('Y-m-d H:i:s', filemtime($siteWaldorf)) : null;
        $out['dist_exists'] = file_exists($distWaldorf);
        $out['dist_mtime'] = file_exists($distWaldorf) ? date('Y-m-d H:i:s', filemtime($distWaldorf)) : null;

        // Check root index.html featured projects
        $rootIndex = $rootDir . '/index.html';
        if (file_exists($rootIndex)) {
            $content = file_get_contents($rootIndex);
            $out['root_index_contains_police'] = strpos($content, 'Dubai Police Academy Tactical Facility') !== false;
            $out['root_index_contains_waldorf'] = strpos($content, 'Waldorf Astoria Hotel Luxury Renovation') !== false;
            $posPolice = strpos($content, 'Dubai Police Academy');
            $posWaldorf = strpos($content, 'Waldorf Astoria');
            $out['order'] = ($posPolice !== false && $posWaldorf !== false) ? ($posPolice < $posWaldorf ? 'Police before Waldorf' : 'Waldorf before Police') : 'not found';
        }
    }
    $response['inspection'] = $out;
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// 2. Verify and initialize Hostinger MySQL Database
if (file_exists(__DIR__ . '/db.php')) {
    require_once __DIR__ . '/db.php';
    try {
        if (function_exists('getDbConnection')) {
            $pdo = getDbConnection();
            if ($pdo) {
                $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
                $response['database'] = [
                    'status' => 'connected',
                    'name' => 'u575992126_rayan_app',
                    'host' => 'localhost',
                    'tables' => $tables
                ];
            } else {
                $response['database'] = ['status' => 'error', 'message' => 'PDO connection returned null'];
            }
        }
    } catch (Exception $e) {
        $response['database'] = ['status' => 'exception', 'message' => $e->getMessage()];
    }

    if (isset($_GET['erase_all']) && !empty($pdo)) {
        $tablesToEmpty = [
            'finance_invoices',
            'finance_customer_receipts',
            'finance_receipts',
            'finance_purchase_bills',
            'finance_vendor_payments',
            'finance_credit_notes',
            'finance_debit_notes',
            'finance_expenses',
            'finance_purchase_orders',
            'finance_cheques',
            'finance_cash_vouchers',
            'finance_bank_transfers',
            'finance_loan_transactions',
            'finance_audit_logs',
            'finance_notifications',
            'finance_documents',
            'finance_state'
        ];
        $emptied = [];
        foreach ($tablesToEmpty as $tbl) {
            try {
                $pdo->exec("TRUNCATE TABLE `$tbl`");
                $emptied[] = $tbl;
            } catch (Exception $e) {
                try {
                    $pdo->exec("DELETE FROM `$tbl`");
                    $emptied[] = $tbl;
                } catch (Exception $e2) {}
            }
        }
        $response['erased_tables'] = $emptied;
    }
}

// 3. Helper function to copy recursively
function copyFolder($src, $dst) {
    if (!is_dir($dst)) {
        @mkdir($dst, 0755, true);
    }
    $dir = opendir($src);
    $copiedCount = 0;
    if ($dir) {
        while (false !== ($file = readdir($dir))) {
            if ($file !== '.' && $file !== '..') {
                $srcFile = $src . '/' . $file;
                $dstFile = $dst . '/' . $file;
                if (is_dir($srcFile)) {
                    $copiedCount += copyFolder($srcFile, $dstFile);
                } else {
                    if (@copy($srcFile, $dstFile)) {
                        $copiedCount++;
                    }
                }
            }
        }
        closedir($dir);
    }
    return $copiedCount;
}

// 4. Perform file synchronization
if (!$rootDir || !is_writable($rootDir)) {
    $response['sync_results']['writable'] = false;
    $response['sync_results']['error'] = "Root directory ($rootDir) is not writable";
} else {
    $response['sync_results']['writable'] = true;

    // Determine all items to copy dynamically from $sourceDir
    $items = scandir($sourceDir);
    $copiedSummary = [];
    $ignored = ['.', '..', '.git', '.github', '.vercel', 'node_modules', 'site', 'data'];

    foreach ($items as $item) {
        if (in_array($item, $ignored)) continue;

        $srcPath = $sourceDir . '/' . $item;
        $dstPath = $rootDir . '/' . $item;

        if (is_dir($srcPath)) {
            $count = copyFolder($srcPath, $dstPath);
            $copiedSummary[$item] = "Directory copied ($count files)";
        } else {
            $ok = @copy($srcPath, $dstPath);
            $copiedSummary[$item] = $ok ? 'File copied (' . filesize($srcPath) . ' bytes)' : 'Copy failed';
        }
    }

    // Ensure api/ endpoints are refreshed at root
    if (is_dir($siteDir . '/public/api')) {
        copyFolder($siteDir . '/public/api', $rootDir . '/api');
        $copiedSummary['api_sync'] = 'Root API updated from site/public/api';
    } elseif (is_dir($sourceDir . '/api')) {
        copyFolder($sourceDir . '/api', $rootDir . '/api');
        $copiedSummary['api_sync'] = 'Root API updated from dist/api';
    }

    // Ensure data/ directory (finance-data.json) is safely merged & preserved at root
    if (file_exists($rootDir . '/data/finance-data.json')) {
        $srcFile = file_exists($sourceDir . '/data/finance-data.json') ? ($sourceDir . '/data/finance-data.json') : ($siteDir . '/data/finance-data.json');
        if (isset($_GET['erase_all']) && file_exists($srcFile)) {
            @file_put_contents($rootDir . '/data/finance-data.json', file_get_contents($srcFile));
            $copiedSummary['data_sync'] = 'Erased and replaced root data/finance-data.json with clean seed';
        } else {
            $liveRaw = @file_get_contents($rootDir . '/data/finance-data.json');
            $liveData = $liveRaw ? json_decode($liveRaw, true) : null;
            if (file_exists($srcFile)) {
                $srcRaw = @file_get_contents($srcFile);
                $srcData = $srcRaw ? json_decode($srcRaw, true) : null;
                if ($liveData && $srcData && is_array($liveData) && is_array($srcData)) {
                    // Merge all collections: live user entries must take priority!
                    foreach ($srcData as $col => $srcItems) {
                        if ($col === 'companies' && is_array($srcItems)) {
                            $liveData['companies'] = $srcItems;
                            continue;
                        }
                        if (is_array($srcItems) && isset($liveData[$col]) && is_array($liveData[$col])) {
                            $liveKeys = [];
                            foreach ($liveData[$col] as $item) {
                                $k = $item['id'] ?? $item['receipt_no'] ?? $item['invoice_no'] ?? $item['bill_no'] ?? $item['voucher_no'] ?? $item['code'] ?? $item['name'] ?? null;
                                if ($k) $liveKeys[$k] = true;
                            }
                            foreach ($srcItems as $sItem) {
                                $k = $sItem['id'] ?? $sItem['receipt_no'] ?? $sItem['invoice_no'] ?? $sItem['bill_no'] ?? $sItem['voucher_no'] ?? $sItem['code'] ?? $sItem['name'] ?? null;
                                if ($k && !isset($liveKeys[$k])) {
                                    $liveData[$col][] = $sItem;
                                }
                            }
                        } elseif (!isset($liveData[$col])) {
                            $liveData[$col] = $srcItems;
                        }
                    }
                    @file_put_contents($rootDir . '/data/finance-data.json', json_encode($liveData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
                    $copiedSummary['data_sync'] = 'Preserved and merged live user finance-data.json';
                }
            }
        }
    } else {
        if (is_dir($sourceDir . '/data')) {
            copyFolder($sourceDir . '/data', $rootDir . '/data');
            $copiedSummary['data_sync'] = 'Root data updated from dist/data';
        } elseif (is_dir($siteDir . '/data')) {
            copyFolder($siteDir . '/data', $rootDir . '/data');
            $copiedSummary['data_sync'] = 'Root data updated from site/data';
        } elseif (is_dir($siteDir . '/public/data')) {
            copyFolder($siteDir . '/public/data', $rootDir . '/data');
            $copiedSummary['data_sync'] = 'Root data updated from site/public/data';
        }
    }

    // Ensure .htaccess with rewrite rules is up to date
    if (file_exists($siteDir . '/public/.htaccess')) {
        @copy($siteDir . '/public/.htaccess', $rootDir . '/.htaccess');
    } elseif (file_exists($sourceDir . '/.htaccess')) {
        @copy($sourceDir . '/.htaccess', $rootDir . '/.htaccess');
    }

    // Check for css & js bundles in root assets
    $cssFiles = glob($rootDir . '/assets/*.css');
    $jsFiles = glob($rootDir . '/assets/*.js');
    $response['sync_results']['css_bundles'] = array_map('basename', $cssFiles ?: []);
    $response['sync_results']['js_bundles'] = array_map('basename', $jsFiles ?: []);

    // Safely rename or backup old WordPress index.php so index.html is primary
    if (file_exists($rootDir . '/index.php') && !file_exists($rootDir . '/index.php.wp_backup')) {
        $wpContent = @file_get_contents($rootDir . '/index.php');
        if (strpos($wpContent, 'wp-blog-header.php') !== false) {
            @rename($rootDir . '/index.php', $rootDir . '/index.php.wp_backup');
            $copiedSummary['wordpress_index_backup'] = 'Backed up to index.php.wp_backup';
        }
    }

    $response['sync_results']['items'] = $copiedSummary;
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
