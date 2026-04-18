<?php
/**
 * ADWire Admin Panel — 認證系統
 *
 * 功能：登入、登出、Session 管理、密碼驗證、暴力破解防護
 */

require_once __DIR__ . '/database.php';

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
        $stmt = $pdo->prepare('SELECT id, username, password_hash, display_name FROM admin_users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            // 記錄失敗嘗試
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
        ];
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
    public static function createAdmin(string $username, string $password, string $displayName): bool
    {
        $pdo = Database::getInstance();

        // 檢查是否已存在
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM admin_users WHERE username = ?');
        $stmt->execute([$username]);
        if ($stmt->fetchColumn() > 0) {
            return false;
        }

        $hash = self::hashPassword($password);
        $stmt = $pdo->prepare('INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)');
        return $stmt->execute([$username, $hash, $displayName]);
    }
}
