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
        $out['site_exists'] = file_exists($siteWaldorf);
        $out['site_mtime'] = file_exists($siteWaldorf) ? date('Y-m-d H:i:s', filemtime($siteWaldorf)) : null;
        $out['dist_exists'] = file_exists($distWaldorf);
        $out['dist_mtime'] = file_exists($distWaldorf) ? date('Y-m-d H:i:s', filemtime($distWaldorf)) : null;

        // Check git status in siteDir if possible
        if (is_dir($siteDir . '/.git')) {
            $gitStatus = @shell_exec("cd " . escapeshellarg($siteDir) . " && git status -s 2>&1");
            $out['git_status'] = $gitStatus;
            $gitLog = @shell_exec("cd " . escapeshellarg($siteDir) . " && git log -n 1 --oneline 2>&1");
            $out['git_latest_commit'] = $gitLog;
        }
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
    $ignored = ['.', '..', '.git', '.github', '.vercel', 'node_modules', 'site'];

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
