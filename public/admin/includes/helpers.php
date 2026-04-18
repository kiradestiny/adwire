<?php
/**
 * ADWire Admin Panel — 通用 Helper 函數
 */

// ── 自訂例外類別 ──────────────────────────────────────────────────────────

/**
 * 驗證例外：用於表單驗證失敗，訊息可安全顯示給用戶
 * 與系統級 Exception 區分，避免資料庫細節洩漏
 */
class ValidationException extends Exception {}

/**
 * 安全輸出 HTML（防止 XSS）
 */
function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/**
 * JSON 響應
 */
function jsonResponse(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * 生成 CSRF Token（每次 Session 只生成一次）
 */
function generateCsrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * 驗證 CSRF Token（使用時間常數比較，防止 timing attack）
 */
function verifyCsrfToken(string $token): bool
{
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * 輸出 CSRF 隱藏欄位（用於 <form> 內）
 */
function csrfField(): string
{
    return '<input type="hidden" name="csrf_token" value="' . e(generateCsrfToken()) . '">';
}

/**
 * 驗證 POST 請求的 CSRF Token，失敗則終止請求
 * 必須在 Session 已啟動後呼叫
 */
function requireCsrf(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return; // 非 POST 請求不檢查
    }

    $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

    if (empty($token) || !verifyCsrfToken($token)) {
        http_response_code(403);
        error_log('[ADWire Admin] CSRF validation failed from IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
        die('安全驗證失敗，請重新提交表單。');
    }

    // 驗證通過後重新生成 Token（防止重放攻擊）
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

/**
 * 生成安全 Slug（小寫、連字符、只保留字母數字）
 */
function generateSlug(string $text): string
{
    // 將中文保留（URL encoded），英文轉小寫
    $slug = strtolower($text);
    $slug = preg_replace('/[^a-z0-9\x{4e00}-\x9fff\x{3400}-\x4dbf}-]+/u', '-', $slug);
    $slug = trim($slug, '-');
    $slug = preg_replace('/-+/', '-', $slug);
    return $slug;
}

/**
 * 格式化日期顯示
 */
function formatDate(?string $date, string $format = 'Y-m-d H:i'): string
{
    if (empty($date) || $date === '0000-00-00 00:00:00') {
        return '-';
    }
    try {
        $dt = new DateTime($date);
        return $dt->format($format);
    } catch (Exception $e) {
        return $date;
    }
}

/**
 * 截斷文字
 */
function truncate(string $text, int $length = 100, string $suffix = '...'): string
{
    if (mb_strlen($text) <= $length) {
        return $text;
    }
    return mb_substr($text, 0, $length) . $suffix;
}

/**
 * 觸發 GitHub Actions 重建
 */
function triggerRebuild(): array
{
    if (empty(GITHUB_TOKEN) || empty(GITHUB_REPO) || GITHUB_REPO === 'your_username/your_repo') {
        return ['success' => false, 'message' => 'GitHub Webhook 未配置'];
    }

    $payload = json_encode([
        'event_type' => 'rebuild',
        'client_payload' => [
            'triggered_at' => date('c'),
            'source' => 'admin_panel'
        ]
    ]);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => "https://api.github.com/repos/" . GITHUB_REPO . "/dispatches",
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            'Accept: application/vnd.github.v3+json',
            'Authorization: token ' . GITHUB_TOKEN,
            'Content-Type: application/json',
            'User-Agent: ADWire-Admin/1.0'
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
    ]);

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($httpCode === 204) {
        return ['success' => true, 'message' => '重建已觸發，預計 2-3 分鐘後網站更新'];
    }

    return [
        'success' => false,
        'message' => '觸發失敗 (HTTP ' . $httpCode . '): ' . $error,
    ];
}

/**
 * 設定 Flash Message
 */
function setFlash(string $type, string $message): void
{
    $_SESSION['flash_type'] = $type;
    $_SESSION['flash_message'] = $message;
}

/**
 * 取得並清除 Flash Message
 */
function getFlash(): ?array
{
    if (isset($_SESSION['flash_message'])) {
        $flash = [
            'type'    => $_SESSION['flash_type'] ?? 'info',
            'message' => $_SESSION['flash_message'],
        ];
        unset($_SESSION['flash_type'], $_SESSION['flash_message']);
        return $flash;
    }
    return null;
}

/**
 * 檢查 API Key（用於 Build Time 數據拉取）
 *
 * ⚠️ 安全：僅從 HTTP Header 讀取 API Key，不從 URL Query String 讀取
 * 原因：URL 中的 Key 會被記錄在伺服器 Access Log、瀏覽器歷史和 HTTP Referrer 中
 */
function verifyApiKey(): void
{
    $key = $_SERVER['HTTP_X_API_KEY'] ?? '';
    if (empty(ADMIN_API_KEY) || !hash_equals(ADMIN_API_KEY, $key)) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
}

/**
 * 圖片上傳處理
 * 
 * @param string $fieldName 表單欄位名
 * @param string $subDir 子目錄（如 'blog', 'portfolio'）
 * @param int $maxSize 最大檔案大小（bytes），預設 5MB
 * @return array ['success' => bool, 'path' => string, 'error' => string]
 */
function handleImageUpload(string $fieldName, string $subDir = '', int $maxSize = 5242880): array
{
    if (!isset($_FILES[$fieldName]) || $_FILES[$fieldName]['error'] === UPLOAD_ERR_NO_FILE) {
        return ['success' => true, 'path' => ''];
    }

    $file = $_FILES[$fieldName];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => '上傳失敗（錯誤代碼：' . $file['error'] . '）'];
    }

    if ($file['size'] > $maxSize) {
        return ['success' => false, 'error' => '檔案大小超過限制（最大 ' . ($maxSize / 1048576) . 'MB）'];
    }

    // 驗證 MIME Type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes, true)) {
        return ['success' => false, 'error' => '不支援的圖片格式（只接受 JPG、PNG、WebP、GIF）'];
    }

    // 生成安全檔名
    $ext = match ($mimeType) {
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
        default      => 'bin',
    };

    $filename = uniqid('img_', true) . '.' . $ext;
    $relativeDir = '/' . trim($subDir, '/');
    $rootDir = defined('UPLOAD_ROOT') && !empty(UPLOAD_ROOT) ? UPLOAD_ROOT : rtrim($_SERVER['DOCUMENT_ROOT'], '/');
    $absoluteDir = rtrim($rootDir, '/') . $relativeDir;

    if (!is_dir($absoluteDir)) {
        mkdir($absoluteDir, 0755, true);
    }

    $destination = $absoluteDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        return ['success' => false, 'error' => '檔案儲存失敗'];
    }

    return [
        'success' => true,
        'path'    => $relativeDir . '/' . $filename,
    ];
}
