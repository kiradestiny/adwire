<?php
/**
 * API: 觸發網站重建
 * POST /admin/api/rebuild.php
 * 
 * 由 Admin Panel 的「發佈更新」按鈕調用
 * 需要已登入的 Session
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/helpers.php';

header('Content-Type: application/json; charset=utf-8');

// 必須已登入
if (!Auth::check()) {
    jsonResponse(['success' => false, 'message' => '未登入'], 401);
}

// 必須擁有「發佈」權限（viewer 角色唔可以觸發重新建置）
if (!Auth::can('publish')) {
    jsonResponse(['success' => false, 'message' => '權限不足：你嘅角色唔可以發佈更新'], 403);
}

// 只接受 POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method Not Allowed'], 405);
}

// CSRF 驗證（AJAX 請求透過 X-CSRF-Token Header 傳遞）
$csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? '';
if (empty($csrfToken) || !verifyCsrfToken($csrfToken)) {
    jsonResponse(['success' => false, 'message' => '安全驗證失敗'], 403);
}

$result = triggerRebuild();
jsonResponse($result, $result['success'] ? 200 : 500);
