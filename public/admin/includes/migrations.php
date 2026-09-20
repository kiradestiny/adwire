<?php
/**
 * ADWire Admin Panel — 資料庫遷移系統
 *
 * 簡單的版本控制遷移機制：
 *   1. 每個遷移是一個獨立的 PHP 檔案，放在 migrations/ 目錄下
 *   2. 檔名格式：{版本號}_{描述}.php（如 001_add_audit_log.php）
 *   3. migrate.php 會自動掃描並執行尚未套用的遷移
 *   4. 已套用的遷移記錄在 schema_migrations 資料表
 *
 * 使用方式：
 *   在瀏覽器訪問 https://adwire.com.hk/admin/migrate.php
 */

require_once __DIR__ . '/database.php';

class Migrations
{
    /**
     * 取得遷移檔案目錄
     */
    public static function getMigrationsDir(): string
    {
        return __DIR__ . '/../migrations';
    }

    /**
     * 取得所有可用的遷移檔案（按版本號排序）
     *
     * @return array [{version: string, name: string, file: string}, ...]
     */
    public static function getAvailableMigrations(): array
    {
        $dir = self::getMigrationsDir();
        if (!is_dir($dir)) {
            return [];
        }

        $migrations = [];
        $files = glob($dir . '/[0-9]*_*.php');

        foreach ($files as $file) {
            $basename = basename($file, '.php');
            // 解析版本號和名稱（格式：001_description）
            if (preg_match('/^(\d+)_(.+)$/', $basename, $matches)) {
                $migrations[] = [
                    'version' => $matches[1],
                    'name'    => str_replace('_', ' ', $matches[2]),
                    'file'    => $file,
                ];
            }
        }

        // 按版本號排序
        usort($migrations, fn($a, $b) => strcmp($a['version'], $b['version']));

        return $migrations;
    }

    /**
     * 取得已套用的遷移版本
     *
     * @return array ['001', '002', ...]
     */
    public static function getAppliedMigrations(): array
    {
        try {
            $pdo = Database::getInstance();

            // 確保 schema_migrations 表存在
            $pdo->exec(
                "CREATE TABLE IF NOT EXISTS `schema_migrations` (
                  `version` VARCHAR(100) NOT NULL PRIMARY KEY COMMENT '遷移版本號',
                  `name` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '遷移描述',
                  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '套用時間'
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
            );

            $stmt = $pdo->query('SELECT version FROM schema_migrations ORDER BY version ASC');
            return $stmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            error_log('[ADWire Migrations] Failed to get applied: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * 執行單個遷移
     *
     * @param array $migration 遷移資訊 ['version', 'name', 'file']
     * @return array ['success' => bool, 'message' => string]
     */
    public static function runMigration(array $migration): array
    {
        $pdo = Database::getInstance();

        try {
            $pdo->beginTransaction();

            // 執行遷移檔案（遷移檔案中可使用 $pdo 變數）
            $result = require $migration['file'];

            // 如果遷移檔案返回 false，視為失敗
            if ($result === false) {
                $pdo->rollBack();
                return [
                    'success' => false,
                    'message' => "遷移 {$migration['version']} 執行失敗（遷移檔案返回 false）",
                ];
            }

            // 記錄已套用
            $stmt = $pdo->prepare(
                'INSERT INTO schema_migrations (version, name) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE name = VALUES(name)'
            );
            $stmt->execute([$migration['version'], $migration['name']]);

            $pdo->commit();

            return [
                'success' => true,
                'message' => "✅ 遷移 {$migration['version']}（{$migration['name']}）已套用",
            ];
        } catch (Throwable $e) {
            // 用 Throwable 而非 Exception：require 遷移檔案失敗時 PHP 8 會拋出 Error，
            // catch (Exception) 接不到，會令整個遷移流程中斷而無法回滾。
            $pdo->rollBack();
            return [
                'success' => false,
                'message' => "❌ 遷移 {$migration['version']} 失敗：" . $e->getMessage(),
            ];
        }
    }

    /**
     * 執行所有未套用的遷移
     *
     * @return array 執行結果列表
     */
    public static function runAllPending(): array
    {
        $available = self::getAvailableMigrations();
        $applied = self::getAppliedMigrations();
        $results = [];

        foreach ($available as $migration) {
            if (in_array($migration['version'], $applied, true)) {
                $results[] = [
                    'success' => true,
                    'message' => "⏭️ 遷移 {$migration['version']}（{$migration['name']}）已套用過，跳過",
                ];
                continue;
            }

            $results[] = self::runMigration($migration);
        }

        if (empty($results)) {
            $results[] = [
                'success' => true,
                'message' => '沒有找到任何遷移檔案。',
            ];
        }

        return $results;
    }
}
