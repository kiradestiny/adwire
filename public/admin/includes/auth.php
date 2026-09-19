<?php
/**
 * ADWire Admin Panel — 認證系統
 *
 * 功能：登入、登出、Session 管理、密碼驗證、暴力破解防護
 */

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/permissions.php';

class Auth
{
    // ── 暴力破解防護常數 ──────────────────────────────────────────────────
    /** 時間窗口（秒）：15 分鐘 */
    const LOGIN_RATE_WINDOW = 900;
    /** 單一 IP 在時間窗口內最大失敗次數 */
    const LOGIN_RATE_MAX_ATTEMPTS = 5;
    /** 帳號鎖定閾值：同一用戶名連續失敗次數 */
    const LOGIN_ACCOUNT_LOCK_THRESHOLD = 5;
    /** 帳號鎖定時間（秒）：30 分鐘 */
    const LOGIN_ACCOUNT_LOCK_DURATION = 1800;

    /**
     * 啟動 Session
     */
    public static function startSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.cookie_httponly', '1');
            ini_set('session.cookie_secure', '1');
            ini_set('session.cookie_samesite', 'Strict');
            ini_set('session.gc_maxlifetime', (string) SESSION_LIFETIME);
            session_name(SESSION_NAME);
            session_start();
        }
    }

    /**
     * 檢查 IP 是否被暫時封鎖（基於 login_attempts 資料表）
     *
     * @return array ['blocked' => bool, 'retry_after' => int（秒）, 'attempts' => int]
     */
    public static function checkIpRateLimit(): array
    {
        $pdo = Database::getInstance();
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $windowStart = time() - self::LOGIN_RATE_WINDOW;

        // 清理過期記錄
        $pdo->prepare('DELETE FROM login_attempts WHERE attempted_at < ?')
            ->execute([date('Y-m-d H:i:s', $windowStart)]);

        // 計算此 IP 在窗口內的失敗次數
        $stmt = $pdo->prepare(
            'SELECT COUNT(*) FROM login_attempts WHERE ip_address = ? AND attempted_at >= ?'
        );
        $stmt->execute([$ip, date('Y-m-d H:i:s', $windowStart)]);
        $attempts = (int) $stmt->fetchColumn();

        if ($attempts >= self::LOGIN_RATE_MAX_ATTEMPTS) {
            // 計算最早一次失敗距離現在多久，推算剩餘等待時間
            $stmt = $pdo->prepare(
                'SELECT MIN(attempted_at) FROM login_attempts WHERE ip_address = ? AND attempted_at >= ?'
            );
            $stmt->execute([$ip, date('Y-m-d H:i:s', $windowStart)]);
            $earliest = strtotime($stmt->fetchColumn());
            $retryAfter = max(0, ($earliest + self::LOGIN_RATE_WINDOW) - time());

            return ['blocked' => true, 'retry_after' => $retryAfter, 'attempts' => $attempts];
        }

        return ['blocked' => false, 'retry_after' => 0, 'attempts' => $attempts];
    }

    /**
     * 記錄一次登入失敗
     */
    public static function recordFailedAttempt(string $username): void
    {
        $pdo = Database::getInstance();
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

        $stmt = $pdo->prepare(
            'INSERT INTO login_attempts (username, ip_address, user_agent) VALUES (?, ?, ?)'
        );
        $stmt->execute([$username, $ip, $ua]);
    }

    /**
     * 清除登入成功後的失敗記錄（僅清除同 IP 的）
     */
    public static function clearFailedAttempts(): void
    {
        $pdo = Database::getInstance();
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $pdo->prepare('DELETE FROM login_attempts WHERE ip_address = ?')
            ->execute([$ip]);
    }

    /**
     * 嘗試登入（含暴力破解防護）
     *
     * @return bool 是否登入成功
     */
    public static function login(string $username, string $password): bool
    {
        self::startSession();

        // 檢查 IP 速率限制
        $rateCheck = self::checkIpRateLimit();
        if ($rateCheck['blocked']) {
            return false;
        }

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare('SELECT id, username, password_hash, display_name, role, is_active
                               FROM admin_users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            // 記錄失敗嘗試
            self::recordFailedAttempt($username);
            return false;
        }

        // 已停用帳號唔可以登入。同樣記錄失敗嘗試，令「帳號存在與否」無法被探測。
        if (isset($user['is_active']) && (int) $user['is_active'] !== 1) {
            self::recordFailedAttempt($username);
            return false;
        }

        // 登入成功：清除此 IP 的失敗記錄
        self::clearFailedAttempts();

        // 更新最後登入時間
        $stmt = $pdo->prepare('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?');
        $stmt->execute([$user['id']]);

        // 設定 Session
        $_SESSION['admin_user_id']   = $user['id'];
        $_SESSION['admin_username']  = $user['username'];
        $_SESSION['admin_display']   = $user['display_name'];
        $_SESSION['admin_role']      = ($user['role'] ?? '') !== '' ? $user['role'] : 'editor';
        $_SESSION['admin_logged_at'] = time();
        $_SESSION['admin_ip']        = $_SERVER['REMOTE_ADDR'] ?? '';
        $_SESSION['admin_ua']        = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

        // 重新生成 Session ID 防止 Session Fixation
        session_regenerate_id(true);

        return true;
    }

    /**
     * 登出
     */
    public static function logout(): void
    {
        self::startSession();
        $_SESSION = [];
        
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        
        session_destroy();
    }

    /**
     * 檢查是否已登入（含超時檢查）
     */
    public static function check(): bool
    {
        self::startSession();

        if (empty($_SESSION['admin_user_id'])) {
            return false;
        }

        // Session 超時檢查
        if (isset($_SESSION['admin_logged_at']) && (time() - $_SESSION['admin_logged_at']) > SESSION_LIFETIME) {
            self::logout();
            return false;
        }

        // IP 變更檢查（可選，防止 Session 劫持）
        $currentIp = $_SERVER['REMOTE_ADDR'] ?? '';
        if (!empty($_SESSION['admin_ip']) && $_SESSION['admin_ip'] !== $currentIp) {
            self::logout();
            return false;
        }

        return true;
    }

    /**
     * 要求登入（未登入則跳轉到登入頁）
     */
    public static function requireLogin(): void
    {
        if (!self::check()) {
            header('Location: ' . ADMIN_URL . '/login.php');
            exit;
        }
    }

    /**
     * 取得當前登入用戶資訊
     */
    public static function user(): ?array
    {
        if (!self::check()) {
            return null;
        }

        return [
            'id'          => $_SESSION['admin_user_id'],
            'username'    => $_SESSION['admin_username'],
            'display_name'=> $_SESSION['admin_display'],
            'role'        => $_SESSION['admin_role'] ?? 'editor',
        ];
    }

    /** 當前登入用戶嘅角色 */
    public static function role(): string
    {
        return $_SESSION['admin_role'] ?? 'editor';
    }

    /** 當前登入用戶是否擁有指定能力 */
    public static function can(string $cap): bool
    {
        return adw_role_has(self::role(), $cap);
    }

    /**
     * 伺服器端強制能力檢查，冇權限即時 403。
     *
     * ⚠️ 所有寫入操作（POST handler）都必須呼叫此方法。
     *    介面上隱藏按鈕只係 UX，唔構成安全邊界。
     */
    public static function requireCapability(string $cap): void
    {
        self::requireLogin();
        if (self::can($cap)) {
            return;
        }
        http_response_code(403);
        error_log('[ADWire Admin] capability denied: ' . $cap . ' role=' . self::role()
                  . ' user=' . ($_SESSION['admin_username'] ?? '?'));
        $capLabel  = htmlspecialchars(ADW_CAP_LABELS[$cap] ?? $cap, ENT_QUOTES, 'UTF-8');
        $roleLabel = htmlspecialchars(adw_role_label(self::role()), ENT_QUOTES, 'UTF-8');
        header('Content-Type: text/html; charset=utf-8');
        die('<!DOCTYPE html><html lang="zh-HK"><head><meta charset="utf-8">'
          . '<meta name="viewport" content="width=device-width, initial-scale=1">'
          . '<title>權限不足</title></head>'
          . '<body style="font-family:system-ui,\'PingFang HK\',\'Microsoft JhengHei\',sans-serif;'
          . 'background:#f4f7fb;color:#16233a;display:flex;min-height:100vh;align-items:center;'
          . 'justify-content:center;margin:0"><div style="background:#fff;border:1px solid #e3e9f2;'
          . 'border-radius:20px;padding:2rem;max-width:26rem;box-shadow:0 18px 48px rgba(16,35,61,.1)">'
          . '<h1 style="font-size:1.15rem;margin:0 0 .6rem">權限不足</h1>'
          . '<p style="color:#6b7c93;margin:0 0 1.25rem;line-height:1.6">你嘅帳號角色係「' . $roleLabel
          . '」，唔可以執行「' . $capLabel . '」。如需此權限請聯絡超級管理員。</p>'
          . '<a href="' . ADMIN_URL . '/index.php" style="display:inline-block;background:#0f4c81;'
          . 'color:#fff;text-decoration:none;padding:.6rem 1.1rem;border-radius:10px;font-weight:600">返回儀表板</a>'
          . '</div></body></html>');
    }

    /** 只限超級管理員（帳號管理） */
    public static function requireSuperAdmin(): void
    {
        self::requireCapability('users.manage');
    }

    /**
     * 建立密碼 Hash
     */
    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
    }

    /**
     * 建立初始管理員帳號
     * 
     * @return bool 是否成功建立
     */
    public static function createAdmin(string $username, string $password, string $displayName, string $role = 'editor'): bool
    {
        $r = self::addUser($username, $password, $displayName, $role);
        return (bool) ($r['ok'] ?? false);
    }

    // ── 帳號管理 ──────────────────────────────────────────────────────────

    /** 新增帳號。回傳 ['ok'=>bool, 'error'=>string, 'id'=>int] */
    public static function addUser(string $username, string $password, string $displayName, string $role, string $createdBy = ''): array
    {
        $username = trim($username);
        if (!preg_match('/^[a-zA-Z0-9._-]{3,50}$/', $username)) {
            return ['ok' => false, 'error' => '用戶名只可以有英文字母、數字、. _ -，長度 3-50'];
        }
        if (strlen($password) < 8) {
            return ['ok' => false, 'error' => '密碼最少 8 個字元'];
        }
        if (!adw_valid_role($role)) {
            return ['ok' => false, 'error' => '角色無效'];
        }
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM admin_users WHERE username = ?');
        $stmt->execute([$username]);
        if ((int) $stmt->fetchColumn() > 0) {
            return ['ok' => false, 'error' => '用戶名「' . $username . '」已存在'];
        }
        $stmt = $pdo->prepare(
            'INSERT INTO admin_users (username, password_hash, display_name, role, is_active, created_by)
             VALUES (?, ?, ?, ?, 1, ?)'
        );
        $stmt->execute([$username, self::hashPassword($password), trim($displayName) !== '' ? trim($displayName) : $username, $role, $createdBy]);
        return ['ok' => true, 'error' => '', 'id' => (int) $pdo->lastInsertId()];
    }

    /** 列出所有帳號（超級管理員排先） */
    public static function listUsers(): array
    {
        return Database::getInstance()->query(
            "SELECT id, username, display_name, role, is_active, last_login_at, created_at, created_by
             FROM admin_users ORDER BY FIELD(role, 'super_admin','editor','viewer'), username ASC"
        )->fetchAll();
    }

    /** 取得單一帳號 */
    public static function getUser(int $id): ?array
    {
        $stmt = Database::getInstance()->prepare('SELECT * FROM admin_users WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /** 目前啟用中嘅超級管理員數量（用於防止鎖死自己） */
    public static function activeSuperAdminCount(): int
    {
        return (int) Database::getInstance()
            ->query("SELECT COUNT(*) FROM admin_users WHERE role = 'super_admin' AND is_active = 1")
            ->fetchColumn();
    }

    /** 更新帳號（顯示名／角色／啟用狀態） */
    public static function updateUser(int $id, string $displayName, string $role, int $isActive): array
    {
        if (!adw_valid_role($role)) {
            return ['ok' => false, 'error' => '角色無效'];
        }
        $target = self::getUser($id);
        if (!$target) {
            return ['ok' => false, 'error' => '帳號不存在'];
        }
        $isLastSuper = ($target['role'] === 'super_admin' && (int) $target['is_active'] === 1
                        && self::activeSuperAdminCount() <= 1);
        if ($isLastSuper && ($role !== 'super_admin' || $isActive !== 1)) {
            return ['ok' => false, 'error' => '唔可以降級或者停用最後一個超級管理員'];
        }
        Database::getInstance()->prepare(
            'UPDATE admin_users SET display_name = ?, role = ?, is_active = ? WHERE id = ?'
        )->execute([trim($displayName) !== '' ? trim($displayName) : $target['username'], $role, $isActive, $id]);
        return ['ok' => true, 'error' => ''];
    }

    /** 重設某帳號嘅密碼 */
    public static function setPassword(int $id, string $password): array
    {
        if (strlen($password) < 8) {
            return ['ok' => false, 'error' => '密碼最少 8 個字元'];
        }
        if (!self::getUser($id)) {
            return ['ok' => false, 'error' => '帳號不存在'];
        }
        Database::getInstance()->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')
            ->execute([self::hashPassword($password), $id]);
        return ['ok' => true, 'error' => ''];
    }

    /** 用戶自行修改密碼（需要目前密碼） */
    public static function changeOwnPassword(int $id, string $currentPassword, string $newPassword): array
    {
        $u = self::getUser($id);
        if (!$u) {
            return ['ok' => false, 'error' => '帳號不存在'];
        }
        if (!password_verify($currentPassword, $u['password_hash'])) {
            return ['ok' => false, 'error' => '目前密碼不正確'];
        }
        if ($newPassword === $currentPassword) {
            return ['ok' => false, 'error' => '新密碼唔可以同舊密碼相同'];
        }
        return self::setPassword($id, $newPassword);
    }

    /** 刪除帳號（唔可以刪自己、唔可以刪最後一個超級管理員） */
    public static function deleteUser(int $id, int $currentUserId): array
    {
        if ($id === $currentUserId) {
            return ['ok' => false, 'error' => '唔可以刪除自己嘅帳號'];
        }
        $target = self::getUser($id);
        if (!$target) {
            return ['ok' => false, 'error' => '帳號不存在'];
        }
        if ($target['role'] === 'super_admin' && self::activeSuperAdminCount() <= 1) {
            return ['ok' => false, 'error' => '唔可以刪除最後一個超級管理員'];
        }
        Database::getInstance()->prepare('DELETE FROM admin_users WHERE id = ?')->execute([$id]);
        return ['ok' => true, 'error' => ''];
    }
}
