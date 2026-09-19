<?php
/**
 * 遷移 002：帳號角色與啟用狀態
 *
 * 新增：
 *   admin_users.role       — super_admin / editor / viewer
 *   admin_users.is_active  — 1 正常 / 0 停用（停用後無法登入）
 *   admin_users.created_by — 邊個建立此帳號（審計用）
 *
 * 已存在嘅帳號一律升級為 super_admin（唔會鎖死現有管理員）。
 */

/** @var PDO $pdo — 由 Migrations::runMigration() 提供 */

/** 檢查欄位是否已存在（令遷移可重複執行） */
$hasColumn = function (string $table, string $column) use ($pdo): bool {
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?'
    );
    $stmt->execute([$table, $column]);
    return (int) $stmt->fetchColumn() > 0;
};

if (!$hasColumn('admin_users', 'role')) {
    $pdo->exec("ALTER TABLE `admin_users`
        ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'editor'
        COMMENT 'super_admin / editor / viewer' AFTER `display_name`");
}

if (!$hasColumn('admin_users', 'is_active')) {
    $pdo->exec("ALTER TABLE `admin_users`
        ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1
        COMMENT '1=可登入, 0=已停用' AFTER `role`");
}

if (!$hasColumn('admin_users', 'created_by')) {
    $pdo->exec("ALTER TABLE `admin_users`
        ADD COLUMN `created_by` VARCHAR(50) NOT NULL DEFAULT ''
        COMMENT '建立此帳號的管理員' AFTER `is_active`");
}

// 現有帳號（包括遷移前建立嘅）一律提升為超級管理員，
// 避免升級之後冇人可以管理帳號。
$pdo->exec("UPDATE `admin_users` SET `role` = 'super_admin'
            WHERE `role` = '' OR `role` = 'editor' AND `username` = 'adwire'");

// 確保至少有一個啟用中嘅 super_admin
$pdo->exec("UPDATE `admin_users` SET `is_active` = 1, `role` = 'super_admin'
            WHERE `username` = 'adwire'");

return true;
