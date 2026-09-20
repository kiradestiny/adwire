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
 *   - [NEW] Enquiry 記錄寫入 MySQL 數據庫
 */

// ── Output Buffering ──────────────────────────────────────────────────
ob_start();

// ── 載入配置（提供 CORS_ORIGINS、MAIL_TO、MAIL_FROM 等常數）──────────────
require_once __DIR__ . '/admin/includes/config.php';

// ── Error Handling ────────────────────────────────────────────────────
// [FIX #10] 關閉前端顯示，但保留 server-side log 以便排查
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// ── Response Headers ──────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');

// [FIX #1] CORS：限制只允許正式網域，防止第三方盜用 mailer
$allowedOrigins = defined('CORS_ORIGINS') && !empty(CORS_ORIGINS)
    ? array_map('trim', explode(',', CORS_ORIGINS))
    : ['https://adwire.com.hk', 'https://www.adwire.com.hk'];
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
 * [FIX #2] 資料庫式速率限制：每個 key 於指定時間窗口內最多允許固定次數請求
 *
 * 優先使用 MySQL 資料庫（在多實例環境下更可靠），
 * 若資料庫不可用則自動降級為檔案式速率限制。
 */
function checkRateLimit(string $namespace, string $subject, int $window, int $maxReq): bool
{
    // 嘗試使用資料庫式速率限制
    try {
        require_once __DIR__ . '/admin/includes/database.php';
        $pdo = Database::getInstance();
        $subjectHash = hash('sha256', $subject);
        $now = time();
        $windowStart = $now - $window;

        // 清理過期記錄（每次檢查時順便清理，避免資料表膨脹）
        $pdo->prepare('DELETE FROM rate_limits WHERE window_start < ?')
            ->execute([$windowStart]);

        // 計算當前窗口內的請求次數
        $stmt = $pdo->prepare(
            'SELECT SUM(request_count) AS total FROM rate_limits
             WHERE namespace = ? AND subject_hash = ? AND window_start >= ?'
        );
        $stmt->execute([$namespace, $subjectHash, $windowStart]);
        $total = (int) $stmt->fetchColumn();

        if ($total >= $maxReq) {
            return false;
        }

        // 記錄本次請求
        $pdo->prepare(
            'INSERT INTO rate_limits (namespace, subject_hash, window_start, request_count)
             VALUES (?, ?, ?, 1)
             ON DUPLICATE KEY UPDATE request_count = request_count + 1'
        )->execute([$namespace, $subjectHash, $now]);

        return true;
    } catch (Exception $e) {
        // 資料庫不可用時降級為檔案式速率限制
        error_log('[ADWire] DB rate limit failed, falling back to file: ' . $e->getMessage());
        return checkFileRateLimit($namespace, $subject, $window, $maxReq);
    }
}

/**
 * 檔案式速率限制（降級備用）
 */
function checkFileRateLimit(string $namespace, string $subject, int $window, int $maxReq): bool
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

// ── 項目預審欄位（全部選填，用於加快分流及回覆）────────────────────────
// 注意：honeypot 欄位名稱為 website；客戶填寫的公司網站位於 companySite
$company    = trim(htmlspecialchars(strip_tags((string)($input['company'] ?? '')), ENT_QUOTES, 'UTF-8'));
$companySite = trim(htmlspecialchars(strip_tags((string)($input['companySite'] ?? '')), ENT_QUOTES, 'UTF-8'));
$budget     = trim(htmlspecialchars(strip_tags((string)($input['budget'] ?? '')), ENT_QUOTES, 'UTF-8'));
$timeline   = trim(htmlspecialchars(strip_tags((string)($input['timeline'] ?? '')), ENT_QUOTES, 'UTF-8'));
$systemInfo = trim(htmlspecialchars(strip_tags((string)($input['systemInfo'] ?? '')), ENT_QUOTES, 'UTF-8'));

$allowedBudgets = ['尚未確定', 'HK$10,000 以下', 'HK$10,000 – 30,000', 'HK$30,000 – 80,000', 'HK$80,000 – 200,000', 'HK$200,000 以上'];
$allowedTimelines = ['尚未確定', '一個月內', '一至三個月內', '三個月以上', '先了解，未決定時間'];

if ($budget !== '' && !in_array($budget, $allowedBudgets, true)) {
    $budget = '未指定';
}
if ($timeline !== '' && !in_array($timeline, $allowedTimelines, true)) {
    $timeline = '未指定';
}

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
if (mb_strlen($company, 'UTF-8') > 120) {
    jsonResponse(false, '公司名稱長度超出限制（最多 120 字）。', 400);
}
if (mb_strlen($companySite, 'UTF-8') > 200 || mb_strlen($systemInfo, 'UTF-8') > 200) {
    jsonResponse(false, '欄位長度超出限制。', 400);
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

// [FIX #8] Service 白名單驗證 — 從 public/config/services.json 讀取（Single Source of Truth）
// 前端 ContactSection.tsx 也從同一份 JSON 讀取，無需手動同步
$servicesJsonPath = __DIR__ . '/config/services.json';
$servicesJson = file_exists($servicesJsonPath)
    ? json_decode(file_get_contents($servicesJsonPath), true)
    : null;
$allowedServices = is_array($servicesJson['services'] ?? null)
    ? $servicesJson['services']
    : ['其他合作']; // Fallback：JSON 不存在時至少保留一個選項
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

// ── [NEW] Save Enquiry to MySQL ───────────────────────────────────────
// 將 Enquiry 記錄寫入數據庫，供 Admin Panel 查看
// 即使數據庫寫入失敗，也不影響電郵發送
try {
    require_once __DIR__ . '/admin/includes/database.php';
    $pdo = Database::getInstance();
    $stmt = $pdo->prepare(
        'INSERT INTO enquiries (name, phone, email, service, message, ip_address, user_agent, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    // 將項目預審欄位以結構化方式附加在訊息內（不需修改 enquiries 資料表結構）
    $extrasLines = [];
    if ($company !== '')    { $extrasLines[] = '公司／品牌：' . $company; }
    if ($companySite !== ''){ $extrasLines[] = '公司網站：' . $companySite; }
    if ($budget !== '')     { $extrasLines[] = '預算區間：' . $budget; }
    if ($timeline !== '')   { $extrasLines[] = '預計開始：' . $timeline; }
    if ($systemInfo !== '') { $extrasLines[] = '現有系統／技術：' . $systemInfo; }
    $messageForDb = $message;
    if (!empty($extrasLines)) {
        $messageForDb = ($message !== '' ? $message . "\n\n" : '')
            . "── 項目資料 ──\n" . implode("\n", $extrasLines);
    }

    $stmt->execute([
        mb_substr($name, 0, 100),
        mb_substr($phone, 0, 20),
        mb_substr($email, 0, 200),
        mb_substr($service, 0, 100),
        $messageForDb,
        mb_substr($clientIp, 0, 45),
        mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
        'new',
    ]);
} catch (Exception $dbEx) {
    // 數據庫寫入失敗只記錄日誌，不中斷流程
    error_log('[ADWire] Enquiry DB save failed: ' . $dbEx->getMessage());
}

// ── Build Email Content ───────────────────────────────────────────────
$to = defined('MAIL_TO') && !empty(MAIL_TO) ? MAIL_TO : 'info@adwire.com.hk';

// [FIX #4] 標頭注入防護：對所有用於 SMTP 標頭的值移除 CR/LF/NULL
$subjectBudget = ($budget !== '' && $budget !== '未指定') ? " - {$budget}" : '';
$safeSubject = sanitizeHeader("【新客戶查詢】{$name} - {$service}{$subjectBudget}");
$safeEmail   = sanitizeHeader($email);
$safeName    = sanitizeHeader($name);

$year = date('Y');
$messageHtml = nl2br($message);

// 項目預審欄位 → 電郵表格列（只顯示有填寫的欄位）
$extraRows = '';
$extraPairs = [
    '公司／品牌'      => $company,
    '公司網站'        => $companySite,
    '預算區間'        => $budget,
    '預計開始時間'    => $timeline,
    '現有系統／技術'  => $systemInfo,
];
foreach ($extraPairs as $label => $val) {
    if ($val === '' || $val === '未指定') { continue; }
    $safeVal = nl2br($val);
    $extraRows .= "<tr><td class=\"label\">{$label}</td><td class=\"value\">{$safeVal}</td></tr>";
}

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
                    <td class="label">服務類別</td>
                    <td class="value" style="color: #0f4c81; font-weight: bold;">{$service}</td>
                </tr>
                {$extraRows}
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
$mailFrom = defined('MAIL_FROM') && !empty(MAIL_FROM) ? MAIL_FROM : 'no-reply@adwire.com.hk';
$headers .= "From: ADWire Website <{$mailFrom}>\r\n";
$headers .= "Reply-To: {$safeName} <{$safeEmail}>\r\n";
$headers .= "X-Mailer: ADWire-Contact-Form\r\n";

// ── Send ──────────────────────────────────────────────────────────────
if (mail($to, $safeSubject, $emailContent, $headers)) {
    jsonResponse(true, '查詢已發送，我們會盡快聯絡你！');
} else {
    jsonResponse(false, '發送失敗，請稍後再試或直接聯絡我們。', 500);
}
