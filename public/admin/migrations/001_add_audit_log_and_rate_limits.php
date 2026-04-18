<?php
/**
 * 遷移 001：新增審計日誌、遷移版本控制、速率限制資料表
 *
 * 此遷移為 P3 優化項目的一部分：
 * - admin_audit_log：記錄管理員操作歷史
 * - schema_migrations：遷移版本控制
 * - rate_limits：資料庫式速率限制
 */

/** @var PDO $pdo — 由 Migrations::runMigration() 提供 */

// ── 審計日誌 ──
$pdo->exec("
    CREATE TABLE IF NOT EXISTS `admin_audit_log` (
      `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
      `admin_user` VARCHAR(50) NOT NULL COMMENT '操作者帳號',
      `action` VARCHAR(50) NOT NULL COMMENT '動作類型：create / update / delete / toggle / reorder / login / logout',
      `target_type` VARCHAR(50) NOT NULL COMMENT '目標類型：brand / blog_post / portfolio_case / enquiry / admin_user',
      `target_id` INT DEFAULT NULL COMMENT '目標 ID（若適用）',
      `target_label` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '目標識別名稱',
      `changes_summary` TEXT COMMENT '變更摘要（JSON 格式）',
      `ip_address` VARCHAR(45) NOT NULL DEFAULT '',
      `user_agent` VARCHAR(500) NOT NULL DEFAULT '',
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX `idx_audit_admin` (`admin_user`),
      INDEX `idx_audit_action` (`action`),
      INDEX `idx_audit_target` (`target_type`, `target_id`),
      INDEX `idx_audit_date` (`created_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// ── 遷移版本控制 ──
$pdo->exec("
    CREATE TABLE IF NOT EXISTS `schema_migrations` (
      `version` VARCHAR(100) NOT NULL PRIMARY KEY COMMENT '遷移版本號',
      `name` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '遷移描述',
      `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '套用時間'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// ── 速率限制 ──
$pdo->exec("
    CREATE TABLE IF NOT EXISTS `rate_limits` (
      `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
      `namespace` VARCHAR(50) NOT NULL COMMENT '限流命名空間',
      `subject_hash` VARCHAR(64) NOT NULL COMMENT 'SHA-256 雜湊後的限流對象',
      `window_start` INT UNSIGNED NOT NULL COMMENT '時間窗口起始（Unix timestamp）',
      `request_count` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '窗口內請求次數',
      UNIQUE KEY `uq_rate_subject_window` (`namespace`, `subject_hash`, `window_start`),
      INDEX `idx_rate_cleanup` (`window_start`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

return true;
