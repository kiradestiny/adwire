<?php
/**
 * ADWire Admin Panel — 審計日誌（Audit Log）
 *
 * 記錄管理員的所有寫入操作，便於問題追溯與合規審查。
 * 使用方式：在所有寫入操作完成後呼叫 AuditLog::record()
 *
 * 範例：
 *   AuditLog::record('create', 'brand', $newId, '7-Eleven');
 *   AuditLog::record('update', 'blog_post', $id, $title, ['name' => ['舊值', '新值']]);
 */

require_once __DIR__ . '/database.php';

class AuditLog
{
    /**
     * 記錄一筆審計日誌
     *
     * @param string      $action        動作類型：create / update / delete / toggle / reorder / login / logout
     * @param string      $targetType    目標類型：brand / blog_post / portfolio_case / enquiry / admin_user
     * @param int|null    $targetId      目標 ID（若適用）
     * @param string      $targetLabel   目標識別名稱（如品牌名、文章標題）
     * @param array|null  $changes       變更摘要 ['field' => ['old', 'new'], ...]
     */
    public static function record(
        string $action,
        string $targetType,
        ?int $targetId = null,
        string $targetLabel = '',
        ?array $changes = null
    ): void {
        try {
            $pdo = Database::getInstance();

            // 取得當前操作者（從 Session）
            $adminUser = $_SESSION['admin_username'] ?? 'system';

            // 取得客戶端 IP
            $ip = self::getClientIp();

            // 序列化變更摘要
            $changesJson = $changes !== null ? json_encode($changes, JSON_UNESCAPED_UNICODE) : null;

            $stmt = $pdo->prepare(
                'INSERT INTO admin_audit_log
                    (admin_user, action, target_type, target_id, target_label, changes_summary, ip_address, user_agent)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                mb_substr($adminUser, 0, 50),
                mb_substr($action, 0, 50),
                mb_substr($targetType, 0, 50),
                $targetId,
                mb_substr($targetLabel, 0, 255),
                $changesJson,
                mb_substr($ip, 0, 45),
                mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
            ]);
        } catch (Exception $e) {
            // 審計日誌寫入失敗不應中斷業務流程，只記錄錯誤
            error_log('[ADWire AuditLog] Failed to record: ' . $e->getMessage());
        }
    }

    /**
     * 取得相對可信的客戶端 IP
     */
    private static function getClientIp(): string
    {
        $candidates = [
            $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
            $_SERVER['REMOTE_ADDR'] ?? '',
        ];

        foreach ($candidates as $candidate) {
            $candidate = trim($candidate);
            if ($candidate !== '' && filter_var($candidate, FILTER_VALIDATE_IP)) {
                return $candidate;
            }
        }

        return '0.0.0.0';
    }

    /**
     * 查詢審計日誌
     *
     * @param array $filters 篩選條件 ['admin_user', 'action', 'target_type', 'date_from', 'date_to']
     * @param int   $page    頁碼
     * @param int   $perPage 每頁筆數
     * @return array ['logs' => [...], 'total' => int, 'totalPages' => int]
     */
    public static function query(array $filters = [], int $page = 1, int $perPage = 50): array
    {
        $pdo = Database::getInstance();
        $where = [];
        $params = [];

        if (!empty($filters['admin_user'])) {
            $where[] = 'admin_user = ?';
            $params[] = $filters['admin_user'];
        }
        if (!empty($filters['action'])) {
            $where[] = 'action = ?';
            $params[] = $filters['action'];
        }
        if (!empty($filters['target_type'])) {
            $where[] = 'target_type = ?';
            $params[] = $filters['target_type'];
        }
        if (!empty($filters['date_from'])) {
            $where[] = 'created_at >= ?';
            $params[] = $filters['date_from'] . ' 00:00:00';
        }
        if (!empty($filters['date_to'])) {
            $where[] = 'created_at <= ?';
            $params[] = $filters['date_to'] . ' 23:59:59';
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM admin_audit_log $whereClause");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();
        $totalPages = max(1, (int) ceil($total / $perPage));
        $offset = ($page - 1) * $perPage;

        $dataStmt = $pdo->prepare(
            "SELECT * FROM admin_audit_log $whereClause
             ORDER BY created_at DESC, id DESC
             LIMIT $perPage OFFSET $offset"
        );
        $dataStmt->execute($params);
        $logs = $dataStmt->fetchAll();

        return [
            'logs'       => $logs,
            'total'      => $total,
            'totalPages' => $totalPages,
        ];
    }

    /**
     * 清理超過指定天數的審計日誌
     *
     * @param int $retentionDays 保留天數（預設 180 天）
     * @return int 刪除的筆數
     */
    public static function cleanup(int $retentionDays = 180): int
    {
        try {
            $pdo = Database::getInstance();
            $cutoff = date('Y-m-d H:i:s', time() - ($retentionDays * 86400));
            $stmt = $pdo->prepare('DELETE FROM admin_audit_log WHERE created_at < ?');
            $stmt->execute([$cutoff]);
            return $stmt->rowCount();
        } catch (Exception $e) {
            error_log('[ADWire AuditLog] Cleanup failed: ' . $e->getMessage());
            return 0;
        }
    }
}
