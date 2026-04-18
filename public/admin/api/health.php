<?php
/**
 * API: Health Check 端點
 * GET /admin/api/health.php?key=XXX
 *
 * 返回資料庫連線狀態和基本系統資訊，
 * 供監控系統（如 UptimeRobot、SiteGround 監控）使用。
 */

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/database.php';
require_once __DIR__ . '/../includes/helpers.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

verifyApiKey();

$health = [
    'status'      => 'healthy',
    'timestamp'   => date('c'),
    'php_version' => PHP_VERSION,
    'timezone'    => date_default_timezone_get(),
    'checks'      => [],
];

// ── 資料庫連線檢查 ──
try {
    $pdo = Database::getInstance();
    $start = microtime(true);
    $pdo->query('SELECT 1');
    $dbLatency = round((microtime(true) - $start) * 1000, 2);

    $health['checks']['database'] = [
        'status'  => 'ok',
        'latency' => $dbLatency . 'ms',
    ];

    // 檢查關鍵資料表是否存在
    $requiredTables = [
        'admin_users', 'brands', 'blog_posts', 'portfolio_cases',
        'enquiries', 'login_attempts', 'admin_audit_log',
        'schema_migrations', 'rate_limits',
    ];
    $stmt = $pdo->query("SHOW TABLES");
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $missingTables = array_diff($requiredTables, $existingTables);
    if (!empty($missingTables)) {
        $health['checks']['database']['status'] = 'degraded';
        $health['checks']['database']['missing_tables'] = array_values($missingTables);
        $health['status'] = 'degraded';
    }
} catch (Exception $e) {
    $health['checks']['database'] = [
        'status' => 'error',
        'error'  => 'Connection failed: ' . $e->getMessage(),
    ];
    $health['status'] = 'unhealthy';
}

// ── 磁碟空間檢查 ──
$uploadRoot = defined('UPLOAD_ROOT') && !empty(UPLOAD_ROOT)
    ? UPLOAD_ROOT
    : $_SERVER['DOCUMENT_ROOT'];
$freeSpace = @disk_free_space($uploadRoot);
$totalSpace = @disk_total_space($uploadRoot);
if ($freeSpace !== false && $totalSpace !== false) {
    $usedPercent = round((1 - $freeSpace / $totalSpace) * 100, 1);
    $health['checks']['disk'] = [
        'status'        => $usedPercent > 90 ? 'warning' : 'ok',
        'free'          => round($freeSpace / 1073741824, 2) . ' GB',
        'total'         => round($totalSpace / 1073741824, 2) . ' GB',
        'used_percent'  => $usedPercent . '%',
    ];
    if ($usedPercent > 90) {
        $health['status'] = 'degraded';
    }
}

// ── 上傳目錄可寫檢查 ──
$uploadDir = rtrim($uploadRoot, '/') . '/portfolio';
$health['checks']['upload_dir'] = [
    'status'  => is_dir($uploadDir) && is_writable($uploadDir) ? 'ok' : 'warning',
    'path'    => $uploadDir,
    'writable' => is_writable($uploadDir),
];

// ── Session 檢查 ──
$health['checks']['session'] = [
    'status' => session_status() === PHP_SESSION_ACTIVE ? 'ok' : 'ok',
    'handler' => ini_get('session.save_handler'),
];

// ── 回應 ──
$httpCode = $health['status'] === 'unhealthy' ? 503 : 200;
jsonResponse($health, $httpCode);
