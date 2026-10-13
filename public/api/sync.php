<?php
/**
 * Rayan Group — Production Server Sync & Hostinger Database Setup
 * Execution Endpoint: https://rayan-group.com/site/api/sync.php?token=rayan_deploy_2026_secret_key
 */

header('Content-Type: application/json; charset=utf-8');

$expectedToken = 'rayan_deploy_2026_secret_key';
if (($_GET['token'] ?? '') !== $expectedToken) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$siteDir = realpath(__DIR__ . '/..');
$rootDir = realpath($siteDir . '/..');

$response = [
    'success' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'site_dir' => $siteDir,
    'root_dir' => $rootDir,
    'database' => [],
    'sync_results' => []
];

// 1. Verify and initialize Hostinger MySQL Database
require_once __DIR__ . '/db.php';
try {
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
        $response['database'] = [
            'status' => 'error',
            'message' => 'PDO connection returned null'
        ];
    }
} catch (Exception $e) {
    $response['database'] = [
        'status' => 'exception',
        'message' => $e->getMessage()
    ];
}

// 2. Perform file synchronization from site/dist or site/ into website root (public_html)
if (!$rootDir || !is_writable($rootDir)) {
    $response['sync_results']['writable'] = false;
    $response['sync_results']['error'] = "Root directory ($rootDir) is not writable";
} else {
    $response['sync_results']['writable'] = true;
    
    // Check if dist/ exists, otherwise use site root
    $sourceDir = is_dir($siteDir . '/dist') ? ($siteDir . '/dist') : $siteDir;
    $response['sync_results']['source_dir'] = $sourceDir;

    // Helper function to copy recursively
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

    // Determine all items to copy dynamically from $sourceDir
    $items = scandir($sourceDir);
    $copiedSummary = [];
    $ignored = ['.', '..', '.git', '.github', '.vercel', 'node_modules'];

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

    // If source was site/dist, also ensure api/ endpoints are refreshed at root
    if ($sourceDir !== $siteDir && is_dir($siteDir . '/api')) {
        copyFolder($siteDir . '/api', $rootDir . '/api');
        $copiedSummary['api_sync'] = 'Root API updated from site/api';
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
