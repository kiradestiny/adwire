<?php
/**
 * API: 圖片上傳
 * POST /admin/api/upload.php?type=blog
 * 
 * 供 TinyMCE 編輯器上傳圖片使用
 * 需要已登入的 Session
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/helpers.php';

header('Content-Type: application/json; charset=utf-8');

// 必須已登入
if (!Auth::check()) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

// 只接受 POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method Not Allowed'], 405);
}

// 確定子目錄
$subDir = $_GET['type'] ?? 'misc';
$allowedDirs = ['blog', 'portfolio', 'misc'];
if (!in_array($subDir, $allowedDirs, true)) {
    $subDir = 'misc';
}

$result = handleImageUpload('file', $subDir);

if ($result['success'] && !empty($result['path'])) {
    // TinyMCE 期望的回傳格式
    jsonResponse(['location' => $result['path']]);
} else {
    jsonResponse(['error' => $result['error'] ?? '上傳失敗'], 400);
}
