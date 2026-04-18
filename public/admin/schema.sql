-- ======================================================================
-- ADWire Admin Panel — MySQL Schema
-- 在 SiteGround MySQL 資料庫中執行此檔案以建立所有必要的表
-- ======================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── 管理員帳號 ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,       -- bcrypt hash
  `display_name` VARCHAR(100) NOT NULL,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 品牌列表（LogoWall）────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `brands` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `tier` TINYINT NOT NULL DEFAULT 3 COMMENT '1=國際巨頭, 2=知名大企, 3=本地企業, 4=中小企',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_brands_tier` (`tier`),
  INDEX `idx_brands_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Blog 文章 ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(200) UNIQUE NOT NULL,
  `title` VARCHAR(300) NOT NULL,
  `excerpt` TEXT,
  `content` MEDIUMTEXT NOT NULL COMMENT '完整 HTML 內容（Rich Text Editor 產出）',
  `date` DATE NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT '',
  `read_time` VARCHAR(20) NOT NULL DEFAULT '',
  `image_color` VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'Tailwind gradient fallback',
  `image` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '圖片路徑',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_blog_slug` (`slug`),
  INDEX `idx_blog_date` (`date`),
  INDEX `idx_blog_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blog_tags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `post_id` INT NOT NULL,
  `tag` VARCHAR(50) NOT NULL,
  FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE,
  INDEX `idx_blog_tags_post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 成功案例（Portfolio）───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `portfolio_cases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) UNIQUE NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT '',
  `display_category` VARCHAR(50) NOT NULL DEFAULT '',
  `industry` VARCHAR(100) NOT NULL DEFAULT '',
  `duration` VARCHAR(50) NOT NULL DEFAULT '',
  `short_description` TEXT,
  `full_description` TEXT,
  `challenge` TEXT,
  `solution` TEXT,
  `outcome` TEXT,
  `stats` VARCHAR(50) NOT NULL DEFAULT '',
  `stat_label` VARCHAR(100) NOT NULL DEFAULT '',
  `icon_name` VARCHAR(50) NOT NULL DEFAULT 'Users' COMMENT 'Lucide icon 名稱字串',
  `color` VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'Tailwind gradient class',
  `accent_color` VARCHAR(7) NOT NULL DEFAULT '#0f4c81' COMMENT 'hex color',
  `image` VARCHAR(255) NOT NULL DEFAULT '',
  `alt` VARCHAR(255) NOT NULL DEFAULT '',
  `geo_summary` TEXT COMMENT 'GEO 一句話總結，供 AI 直接引用',
  `seo_title` VARCHAR(200) NOT NULL DEFAULT '',
  `seo_description` TEXT,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_portfolio_slug` (`slug`),
  INDEX `idx_portfolio_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 成效指標
CREATE TABLE IF NOT EXISTS `portfolio_metrics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `case_id` INT NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `value` VARCHAR(50) NOT NULL,
  `description` VARCHAR(200) NOT NULL DEFAULT '',
  `is_highlight` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`case_id`) REFERENCES `portfolio_cases`(`id`) ON DELETE CASCADE,
  INDEX `idx_metrics_case` (`case_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 流程步驟
CREATE TABLE IF NOT EXISTS `portfolio_steps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `case_id` INT NOT NULL,
  `phase` VARCHAR(50) NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `sort_order` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`case_id`) REFERENCES `portfolio_cases`(`id`) ON DELETE CASCADE,
  INDEX `idx_steps_case` (`case_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 客戶評價
CREATE TABLE IF NOT EXISTS `portfolio_testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `case_id` INT NOT NULL UNIQUE,
  `quote` TEXT,
  `author` VARCHAR(100) NOT NULL DEFAULT '',
  `role` VARCHAR(100) NOT NULL DEFAULT '',
  `company` VARCHAR(200) NOT NULL DEFAULT '',
  FOREIGN KEY (`case_id`) REFERENCES `portfolio_cases`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 標籤
CREATE TABLE IF NOT EXISTS `portfolio_tags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `case_id` INT NOT NULL,
  `tag` VARCHAR(50) NOT NULL,
  FOREIGN KEY (`case_id`) REFERENCES `portfolio_cases`(`id`) ON DELETE CASCADE,
  INDEX `idx_ptags_case` (`case_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 服務項目
CREATE TABLE IF NOT EXISTS `portfolio_services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `case_id` INT NOT NULL,
  `service` VARCHAR(100) NOT NULL,
  FOREIGN KEY (`case_id`) REFERENCES `portfolio_cases`(`id`) ON DELETE CASCADE,
  INDEX `idx_pservices_case` (`case_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FAQ（GEO 擴展）
CREATE TABLE IF NOT EXISTS `portfolio_faqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `case_id` INT NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`case_id`) REFERENCES `portfolio_cases`(`id`) ON DELETE CASCADE,
  INDEX `idx_pfaqs_case` (`case_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Before/After 對比
CREATE TABLE IF NOT EXISTS `portfolio_before_after` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `case_id` INT NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `before_value` VARCHAR(100) NOT NULL,
  `after_value` VARCHAR(100) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`case_id`) REFERENCES `portfolio_cases`(`id`) ON DELETE CASCADE,
  INDEX `idx_pba_case` (`case_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Enquiry 紀錄 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL DEFAULT '',
  `email` VARCHAR(200) NOT NULL,
  `service` VARCHAR(100) NOT NULL DEFAULT '',
  `message` TEXT,
  `ip_address` VARCHAR(45) NOT NULL DEFAULT '',
  `user_agent` VARCHAR(500) NOT NULL DEFAULT '',
  `status` ENUM('new','read','replied','closed') NOT NULL DEFAULT 'new',
  `admin_notes` TEXT COMMENT '後台備註',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_enquiries_status` (`status`),
  INDEX `idx_enquiries_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 登入失敗紀錄（暴力破解防護）────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL DEFAULT '',
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` VARCHAR(255) NOT NULL DEFAULT '',
  `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_login_attempts_ip` (`ip_address`, `attempted_at`),
  INDEX `idx_login_attempts_cleanup` (`attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 審計日誌（Audit Log）─────────────────────────────────────────────────
-- 記錄管理員的所有寫入操作，便於問題追溯與合規審查
CREATE TABLE IF NOT EXISTS `admin_audit_log` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `admin_user` VARCHAR(50) NOT NULL COMMENT '操作者帳號',
  `action` VARCHAR(50) NOT NULL COMMENT '動作類型：create / update / delete / toggle / reorder / login / logout',
  `target_type` VARCHAR(50) NOT NULL COMMENT '目標類型：brand / blog_post / portfolio_case / enquiry / admin_user',
  `target_id` INT DEFAULT NULL COMMENT '目標 ID（若適用）',
  `target_label` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '目標識別名稱（如品牌名、文章標題）',
  `changes_summary` TEXT COMMENT '變更摘要（JSON 格式，記錄 key 變更）',
  `ip_address` VARCHAR(45) NOT NULL DEFAULT '',
  `user_agent` VARCHAR(500) NOT NULL DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_admin` (`admin_user`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_target` (`target_type`, `target_id`),
  INDEX `idx_audit_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Schema 遷移版本控制 ──────────────────────────────────────────────────
-- 記錄已套用的遷移版本，migrate.php 據此判斷哪些遷移尚未執行
CREATE TABLE IF NOT EXISTS `schema_migrations` (
  `version` VARCHAR(100) NOT NULL PRIMARY KEY COMMENT '遷移版本號（如 001, 002）',
  `name` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '遷移描述',
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '套用時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 速率限制（Rate Limiting）─────────────────────────────────────────────
-- 取代檔案系統式速率限制，在多實例環境下更可靠
CREATE TABLE IF NOT EXISTS `rate_limits` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `namespace` VARCHAR(50) NOT NULL COMMENT '限流命名空間（如 ip, fingerprint）',
  `subject_hash` VARCHAR(64) NOT NULL COMMENT 'SHA-256 雜湊後的限流對象',
  `window_start` INT UNSIGNED NOT NULL COMMENT '時間窗口起始（Unix timestamp）',
  `request_count` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '窗口內請求次數',
  UNIQUE KEY `uq_rate_subject_window` (`namespace`, `subject_hash`, `window_start`),
  INDEX `idx_rate_cleanup` (`window_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
