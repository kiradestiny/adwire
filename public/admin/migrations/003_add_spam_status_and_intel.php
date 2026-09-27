<?php
/**
 * 遷移 003：enquiries 加入 spam 狀態及反垃圾中繼資料
 *
 * 背景（2026-09-27）：官網查詢表單開始收到外國 spam 提交（實測為
 * AS212238 Datacamp Limited 的 VPN 出口）。send-mail.php 改為「評分式
 * 隔離」：達門檻的提交標記為 spam，記錄仍然完整保存（永不刪除），
 * 通知信主旨加 [疑似垃圾] 以便自動歸類。
 *
 * 本遷移只做加法（MODIFY ENUM 擴充 + ADD COLUMN），不會刪除或改寫任何
 * 既有資料；已在部署前於正式站人手核對過 enquiries 表結構。
 */

/** @var PDO $pdo — 由 Migrations::runMigration() 提供 */

// ── 1. status ENUM 擴充加入 'spam' ──
$pdo->exec("
    ALTER TABLE `enquiries`
    MODIFY COLUMN `status` ENUM('new','read','replied','closed','spam')
    NOT NULL DEFAULT 'new'
");

// ── 2. 反垃圾中繼資料欄位（逐個檢查是否存在，可重複執行）──
$newColumns = [
    'spam_score'   => "ALTER TABLE `enquiries` ADD COLUMN `spam_score` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '反垃圾評分（>=55 判為 spam）' AFTER `admin_notes`",
    'spam_reasons' => "ALTER TABLE `enquiries` ADD COLUMN `spam_reasons` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '評分原因（；分隔）' AFTER `spam_score`",
    'country_code' => "ALTER TABLE `enquiries` ADD COLUMN `country_code` VARCHAR(2) NOT NULL DEFAULT '' COMMENT '來源國家代碼' AFTER `spam_reasons`",
    'asn'          => "ALTER TABLE `enquiries` ADD COLUMN `asn` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '來源 ASN' AFTER `country_code`",
    'asn_type'     => "ALTER TABLE `enquiries` ADD COLUMN `asn_type` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '一般 ISP / 數據中心／VPN' AFTER `asn`",
];

foreach ($newColumns as $column => $ddl) {
    $exists = $pdo->query("SHOW COLUMNS FROM `enquiries` LIKE " . $pdo->quote($column))->fetch();
    if (!$exists) {
        $pdo->exec($ddl);
    }
}

// ── 3. 讓「spam」狀態可以快速篩選 ──
$indexExists = $pdo->query("SHOW INDEX FROM `enquiries` WHERE Key_name = 'idx_enquiries_status'")->fetch();
if (!$indexExists) {
    $pdo->exec("ALTER TABLE `enquiries` ADD INDEX `idx_enquiries_status` (`status`)");
}

return true;
