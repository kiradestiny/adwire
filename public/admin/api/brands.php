<?php
/**
 * API: 品牌列表
 * GET /admin/api/brands.php?key=XXX
 * 
 * 返回所有活躍品牌，按 tier + sort_order 排序
 */

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/database.php';
require_once __DIR__ . '/../includes/helpers.php';

header('Content-Type: application/json; charset=utf-8');
// ⚠️ 移除 Access-Control-Allow-Origin: * — 此 API 僅供 Build Time 使用，不需 CORS
header('Cache-Control: public, max-age=300'); // 5 分鐘快取

verifyApiKey();

try {
    $pdo = Database::getInstance();
    $stmt = $pdo->query(
        "SELECT name, tier, sort_order 
         FROM brands 
         WHERE is_active = 1 
         ORDER BY tier ASC, sort_order ASC, id ASC"
    );
    $brands = $stmt->fetchAll();

    // 按層級分組（與 LogoWall.tsx 原有邏輯一致）
    $result = [];
    foreach ($brands as $brand) {
        $result[] = $brand['name'];
    }

    jsonResponse([
        'success' => true,
        'data'    => $result,
        'updated_at' => date('c'),
    ]);
} catch (Exception $e) {
    error_log('[ADWire API] brands.php error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Internal Server Error'], 500);
}
