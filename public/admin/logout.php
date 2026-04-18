<?php
/**
 * ADWire Admin Panel — 登出處理
 */

require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/audit-log.php';

// 在 Session 銷毀前記錄審計日誌
$logoutUser = $_SESSION['admin_username'] ?? null;
if ($logoutUser) {
    AuditLog::record('logout', 'admin_user', null, $logoutUser);
}

Auth::logout();
header('Location: ' . ADMIN_URL . '/login.php');
exit;
