<?php
/**
 * ADWire Website — Contact Form Mailer
 *
 * Security hardening:
 *   - CORS 限制為正式網域
 *   - 檔案式速率限制 (3 次 / 60 秒 / IP)
 *   - 重複內容指紋攔截（10 分鐘內拒絕相同內容）
 *   - Honeypot + 最低填表時間檢查
 *   - Email VALIDATE + header injection 防護
 *   - JSON 解析錯誤處理
 *   - 輸入長度限制
 *   - Service 白名單驗證
 *   - OPTIONS preflight 支援
 *   - 不暴露 PHP 版本
 */

// ── Output Buffering ──────────────────────────────────────────────────
ob_start();

// ── Error Handling ────────────────────────────────────────────────────
// [FIX #10] 關閉前端顯示，但保留 server-side log 以便排查
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// ── Response Headers ──────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');

// [FIX #1] CORS：限制只允許正式網域，防止第三方盜用 mailer
$allowedOrigins = [
    'https://adwire.com.hk',
    'https://www.adwire.com.hk',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (!empty($origin)) {
    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Vary: Origin');
    } else {
        // 非允許的 Origin → 403 拒絕
        ob_clean();
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// [FIX #9] OPTIONS preflight 處理（瀏覽器發 CORS 預檢請求時）
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Max-Age: 86400');
    ob_clean();
    http_response_code(204);
    exit;
}


// ── Helper Functions ──────────────────────────────────────────────────

/**
 * 輸出 JSON 並終止執行
 */
function jsonResponse(bool $success, string $message, int $code = 200): void
{
    ob_clean();
    http_response_code($code);
    echo json_encode(
        ['success' => $success, 'message' => $message],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

/**
 * [FIX #4] Email/SMTP 標頭注入防護
 * 移除 CR / LF / NULL 字元，防止攻擊者插入任意 SMTP 標頭
 */
function sanitizeHeader(string $value): string
{
    return str_replace(["\r", "\n", "\0"], '', $value);
}

/**
 * 確保暫存目錄存在
 */
function ensureStorageDirectory(string $dir): void
{
    if (is_dir($dir)) {
        return;
    }

    if (!mkdir($dir, 0700, true) && !is_dir($dir)) {
        jsonResponse(false, '伺服器暫時無法處理請求，請稍後再試。', 500);
    }
}

/**
 * 以鎖檔方式安全讀寫 JSON 暫存資料
 */
function mutateJsonStore(string $path, callable $callback)
{
    ensureStorageDirectory(dirname($path));

    $handle = fopen($path, 'c+');
    if ($handle === false) {
        jsonResponse(false, '伺服器暫時無法處理請求，請稍後再試。', 500);
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            jsonResponse(false, '伺服器暫時無法處理請求，請稍後再試。', 500);
        }

        rewind($handle);
        $raw = stream_get_contents($handle);
        $data = json_decode(($raw !== false && $raw !== '') ? $raw : '[]', true);
        if (!is_array($data)) {
            $data = [];
        }

        $result = call_user_func_array($callback, [&$data]);

        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, json_encode($data, JSON_UNESCAPED_UNICODE));
        fflush($handle);
        flock($handle, LOCK_UN);

        return $result;
    } finally {
        fclose($handle);
    }
}

/**
 * 取得相對可信的客戶端 IP：優先 Cloudflare，否則使用 REMOTE_ADDR
 * 不信任通用 HTTP_X_FORWARDED_FOR，避免被客戶端偽造繞過限流。
 */
function getClientIp(): string
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
 * [FIX #2] 檔案式速率限制：每個 key 於指定時間窗口內最多允許固定次數請求
 */
function checkRateLimit(string $namespace, string $subject, int $window, int $maxReq): bool
{
    $path = sys_get_temp_dir() . '/adwire_rate/' . $namespace . '/' . hash('sha256', $subject) . '.json';
    $now = time();

    return mutateJsonStore($path, static function (array &$data) use ($now, $window, $maxReq): bool {
        $timestamps = array_values(array_filter(
            $data['timestamps'] ?? [],
            static fn($timestamp): bool => is_numeric($timestamp) && ($now - (int) $timestamp) < $window
        ));

        if (count($timestamps) >= $maxReq) {
            $data = ['timestamps' => $timestamps];
            return false;
        }

        $timestamps[] = $now;
        $data = ['timestamps' => $timestamps];

        return true;
    });
}

/**
 * 檢查短時間內是否重複提交完全相同的內容
 */
function hasRecentDuplicateFingerprint(string $fingerprint, int $window): bool
{
    $path = sys_get_temp_dir() . '/adwire_fingerprint/' . $fingerprint . '.json';
    $now = time();

    return mutateJsonStore($path, static function (array &$data) use ($now, $window): bool {
        $lastSubmittedAt = (int)($data['last_submitted_at'] ?? 0);
        $data = ['last_submitted_at' => $now];

        return $lastSubmittedAt > 0 && ($now - $lastSubmittedAt) < $window;
    });
}


// ── Request Method Guard ──────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method Not Allowed', 405);
}

// ── Rate Limit Check ──────────────────────────────────────────────────
// [FIX #2] 使用較可信的來源 IP，避免 X-Forwarded-For 被偽造
$clientIp = getClientIp();

if (!checkRateLimit('ip', $clientIp, 60, 3)) {
    header('Retry-After: 60');
    jsonResponse(false, '提交過於頻繁，請稍後 60 秒再試。', 429);
}

// ── Parse JSON Body ───────────────────────────────────────────────────
// [FIX #6] 限制 input 最多讀 8KB，防止超大 payload 攻擊
$raw = file_get_contents('php://input', false, null, 0, 8192);

if ($raw === false || $raw === '') {
    jsonResponse(false, '無效的請求資料。', 400);
}

// [FIX #5] 正確處理 JSON 解析失敗
$input = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    jsonResponse(false, '請求格式錯誤，請重新提交。', 400);
}

// ── Input Sanitization ────────────────────────────────────────────────
$name    = trim(htmlspecialchars(strip_tags((string)($input['name']    ?? '')), ENT_QUOTES, 'UTF-8'));
$phone   = trim(preg_replace('/\D+/', '', (string)($input['phone'] ?? '')));
$email   = trim((string)($input['email']   ?? ''));
$service = trim(htmlspecialchars(strip_tags((string)($input['service'] ?? '')), ENT_QUOTES, 'UTF-8'));
$message = trim(htmlspecialchars(strip_tags((string)($input['message'] ?? '')), ENT_QUOTES, 'UTF-8'));
$website = trim((string)($input['website'] ?? ''));
$formStartedAt = trim((string)($input['formStartedAt'] ?? ''));

// [FIX #6] 長度限制
if (mb_strlen($name, 'UTF-8') > 100) {
    jsonResponse(false, '姓名長度超出限制（最多 100 字）。', 400);
}
if (mb_strlen($phone, 'UTF-8') > 15) {
    jsonResponse(false, '電話格式不正確。', 400);
}
if (mb_strlen($message, 'UTF-8') > 2000) {
    jsonResponse(false, '訊息長度超出限制（最多 2000 字）。', 400);
}

// ── Spam Guard ────────────────────────────────────────────────────────
if ($website !== '') {
    jsonResponse(false, '提交驗證失敗，請稍後再試。', 400);
}

$formStartedTimestamp = strtotime($formStartedAt);
$now = time();
if ($formStartedTimestamp === false || $formStartedTimestamp > ($now + 300) || ($now - $formStartedTimestamp) < 4) {
    jsonResponse(false, '提交過快，請稍候幾秒後再試。', 400);
}

// ── Required Fields Validation ────────────────────────────────────────
if (empty($name) || empty($phone) || empty($email)) {
    jsonResponse(false, '請填寫所有必填欄位。', 400);
}

if (!preg_match('/^\d{8,15}$/', $phone)) {
    jsonResponse(false, '聯絡電話必須為 8 至 15 位數字，不能包含空格或符號。', 400);
}

// [FIX #3] 正確的 Email 驗證：先 validate 再 sanitize
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, '電子郵件格式不正確，請重新填寫。', 400);
}
$email = (string) filter_var($email, FILTER_SANITIZE_EMAIL);

// [FIX #8] Service 白名單驗證（必須與前端 ContactSection.tsx SERVICE_OPTIONS 完全同步）
$allowedServices = [
    'AI 企業轉型方案',
    'KOL 網紅營銷',
    '短視頻製作',
    '成效廣告投放',
    '社交媒體管理',
    'SEO/GEO 搜尋引擎優化',
    '商業攝影與錄影',
    '營銷自動化系統',
    '網頁設計及優化',
    '系統/APP開發',
    '其他合作',
];
if (!empty($service) && !in_array($service, $allowedServices, true)) {
    $service = '未指定'; // 非白名單值統一重置，不拒絕（保留 UX 容錯）
}

$fingerprintSource = mb_strtolower(implode('|', [$name, $phone, $email, $service, $message]), 'UTF-8');
$submissionFingerprint = hash('sha256', $fingerprintSource);

if (hasRecentDuplicateFingerprint($submissionFingerprint, 600)) {
    header('Retry-After: 600');
    jsonResponse(false, '相同內容已於短時間內提交，請勿重複送出。', 429);
}

// ── WhatsApp Phone Processing ─────────────────────────────────────────
$waPhone = preg_replace('/[^0-9]/', '', $phone);
if (strlen($waPhone) === 8) {
    $waPhone = '852' . $waPhone;
}

// ── Build Email Content ───────────────────────────────────────────────
$to = 'info@adwire.com.hk';

// [FIX #4] 標頭注入防護：對所有用於 SMTP 標頭的值移除 CR/LF/NULL
$safeSubject = sanitizeHeader("【新客戶查詢】{$name} - {$service}");
$safeEmail   = sanitizeHeader($email);
$safeName    = sanitizeHeader($name);

$year = date('Y');
$messageHtml = nl2br($message);

$emailContent = <<<HTML
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Inquiry</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; color: #333333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .header { background-color: #0f4c81; padding: 30px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 40px; }
        .section-title { color: #0f4c81; font-size: 18px; font-weight: bold; border-bottom: 2px solid #f5a623; padding-bottom: 10px; margin-bottom: 20px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 12px 0; border-bottom: 1px solid #eeeeee; vertical-align: top; }
        .info-table td.label { width: 140px; color: #666666; font-weight: bold; }
        .info-table td.value { color: #333333; font-size: 16px; }
        .message-box { background-color: #f9f9f9; padding: 20px; border-radius: 4px; border-left: 4px solid #f5a623; margin-top: 10px; }
        .footer { background-color: #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #888888; }
        .highlight { color: #f5a623; }
        a { color: #0f4c81; text-decoration: none; }
        .btn-whatsapp { background-color: #25D366; color: white !important; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ADWire <span class="highlight">Agency</span></h1>
        </div>
        <div class="content">
            <div class="section-title">收到新的網站查詢</div>
            <p style="margin-bottom: 25px; color: #666;">你好，網站收到了一則新的潛在客戶查詢，詳細資料如下：</p>

            <table class="info-table">
                <tr>
                    <td class="label">客戶姓名</td>
                    <td class="value">{$name}</td>
                </tr>
                <tr>
                    <td class="label">聯絡電話</td>
                    <td class="value"><a href="tel:{$phone}">{$phone}</a></td>
                </tr>
                <tr>
                    <td class="label">電子郵件</td>
                    <td class="value"><a href="mailto:{$email}">{$email}</a></td>
                </tr>
                <tr>
                    <td class="label">感興趣服務</td>
                    <td class="value" style="color: #0f4c81; font-weight: bold;">{$service}</td>
                </tr>
            </table>

            <div style="margin-top: 30px;">
                <div style="color: #666; font-weight: bold; margin-bottom: 10px;">客戶訊息：</div>
                <div class="message-box">{$messageHtml}</div>
            </div>

            <div style="margin-top: 30px; text-align: center;">
                <a href="https://wa.me/{$waPhone}" target="_blank" class="btn-whatsapp">
                    WhatsApp 回覆客戶
                </a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; {$year} ADWire Agency. All rights reserved.</p>
            <p>此郵件由 ADWire 官方網站自動發送，請勿直接回覆此系統郵件。</p>
        </div>
    </div>
</body>
</html>
HTML;

// ── SMTP Headers ──────────────────────────────────────────────────────
// [FIX #7] 不暴露 PHP 版本（X-Mailer 改為自定義標識）
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: ADWire Website <no-reply@adwire.com.hk>\r\n";
$headers .= "Reply-To: {$safeName} <{$safeEmail}>\r\n";
$headers .= "X-Mailer: ADWire-Contact-Form\r\n";

// ── Send ──────────────────────────────────────────────────────────────
if (mail($to, $safeSubject, $emailContent, $headers)) {
    jsonResponse(true, '查詢已發送，我們會盡快聯絡你！');
} else {
    jsonResponse(false, '發送失敗，請稍後再試或直接聯絡我們。', 500);
}
