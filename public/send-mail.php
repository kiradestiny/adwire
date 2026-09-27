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
    } catch (Throwable $e) {
        // ⚠️ 必須用 Throwable 而唔係 Exception：
        //    PHP 8 的 require_once 失敗會拋出 Error（不是 Exception），
        //    用 catch (Exception) 會接不到，導致整個表單回傳 500，
        //    客人查詢會直接流失而不會降級。此處是表單可用性的最後防線。
        error_log('[ADWire] DB rate limit failed, falling back to file: ' . get_class($e) . ': ' . $e->getMessage());
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


/*
 * ── 反垃圾：評分式隔離（2026-09-28）────────────────────────────────────
 *
 * 設計原則（重要）：
 *   1. 本層「標記隔離」而非「硬性拒收」。ADWire 的生意來自查詢，
 *      走失一個真客的代價遠大於收到一封垃圾，所以所有判斷都只會把
 *      提交標記為 spam（status='spam' + 主旨加 [疑似垃圾]），
 *      記錄仍然完整保存，永不刪除。
 *   2. 所有第三方查詢一律 fail-open：API 掛掉／超時 → 當作正常，
 *      不會因此擋掉任何真客。
 *   3. 只用「真客戶不會有」的訊號評分（ISP vs 數據中心 ASN、欄位互相
 *      重複的純數字），避免用「免費電郵」之類會誤殺香港中小企的訊號。
 */

/**
 * 記錄一次提交並回傳該時間窗口內的累計次數。
 * 與 checkRateLimit() 的分別：此函式不會拒絕請求，只回報次數，
 * 讓呼叫端可以根據「聚合行為」計分，而不是直接 429 掉真客。
 */
function bumpRateLimit(string $namespace, string $subject, int $window): int
{
    if ($subject === '') {
        return 1;
    }
    try {
        require_once __DIR__ . '/admin/includes/database.php';
        $pdo = Database::getInstance();
        $hash = hash('sha256', $subject);
        $now  = time();

        $pdo->prepare('DELETE FROM rate_limits WHERE window_start < ?')->execute([$now - $window]);
        $pdo->prepare(
            'INSERT INTO rate_limits (namespace, subject_hash, window_start, request_count)
             VALUES (?, ?, ?, 1)
             ON DUPLICATE KEY UPDATE request_count = request_count + 1'
        )->execute([$namespace, $hash, $now]);

        $stmt = $pdo->prepare(
            'SELECT SUM(request_count) FROM rate_limits
             WHERE namespace = ? AND subject_hash = ? AND window_start >= ?'
        );
        $stmt->execute([$namespace, $hash, $now - $window]);

        return (int) $stmt->fetchColumn();
    } catch (Throwable $e) {
        error_log('[ADWire] bumpRateLimit failed: ' . $e->getMessage());
        return 1;
    }
}

/**
 * 網路前綴（IPv4 取 /24、IPv6 取 /48）。
 * 用途：捉「同一網絡段不斷輪換 IP」的攻擊 —— 換 IP 但換不掉網絡段。
 */
function networkPrefix(string $ip): string
{
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $p = explode('.', $ip);
        return $p[0] . '.' . $p[1] . '.' . $p[2] . '.0/24';
    }
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        $p = explode(':', $ip);
        return implode(':', array_slice($p, 0, 3)) . '::/48';
    }
    return '';
}

/**
 * 判斷是否數據中心／VPN／代理組織。
 * 真客戶經 ISP 上網（香港：HKBN／PCCW／HGC／CMHK）；
 * 垃圾與 bot 幾乎都經 VPN／主機商（實測兩個 spam 都來自 AS212238 Datacamp）。
 * ⚠️ 此名單只作「評分」用，不是硬封鎖清單。
 */
function isDatacenterOrg(string $org, int $asn): bool
{
    $orgLower = mb_strtolower($org, 'UTF-8');
    $keywords = [
        // VPN / 代理服務
        'nordvpn', 'expressvpn', 'mullvad', 'surfshark', 'purevpn', 'proton',
        'ipvanish', 'hide.me', 'tunnelbear', 'zscaler', 'windscribe', 'cyberghost',
        'private internet', 'kaspersky', 'avast', 'hotspot shield', 'ivacy',
        // 主機商 / 雲 / 數據中心（含 Datacamp 系 VPN 基建）
        'datacamp', 'digitalocean', 'digital ocean', 'ovh', 'hetzner', 'vultr',
        'linode', 'akamai', 'contabo', 'm247', 'leaseweb', 'colocrossing',
        'clouvider', 'choopa', 'quadranet', 'psychz', 'sharktech', 'hostsailor',
        'hostwinds', 'ionos', 'rackspace', 'hivelocity', 'equinix', 'fastly',
        'amazon', 'aws', 'google cloud', 'google llc', 'microsoft azure', 'microsoft corporation', 'oracle cloud',
        'alibaba cloud', 'aliyun', 'tencent cloud', 'huawei cloud', 'cloudflare',
        'hostinger', 'bluehost', 'dreamhost', 'namecheap', 'godaddy',
        'serverhub', 'frantech', 'pinehosting', 'buyvm', 'jbj', 'asanetwork',
        'gcore', 'melbicom', 'aeza', 'stark industries', 'netcup', 'ip range',
    ];
    foreach ($keywords as $kw) {
        if (strpos($orgLower, $kw) !== false) {
            return true;
        }
    }
    // 已實測確認的垃圾來源 ASN（Datacamp Limited — 4,341 個 prefix 的 VPN 池）
    return $asn > 0 && in_array($asn, [212238, 9009, 209103, 49447, 210644, 204957, 210906], true);
}

/**
 * IP 信譽查詢（HTTPS、免費、無需 API key），結果快取 24 小時。
 *
 * 為什麼用 ipwho.is：免費層提供 HTTPS（ip-api 免費層只有 HTTP，純文字
 * 傳輸可被中間人竄改）；同時回傳 ASN 號與組織名，足以判斷 ISP vs 數據中心。
 *
 * ⚠️ fail-open：任何失敗（超時、SSL、非 200、JSON 壞）都回傳 ok=false，
 *    呼叫端不得因此扣分或拒收。
 */
function lookupIpIntel(string $ip): array
{
    $blank = [
        'ok' => false, 'country' => '', 'country_code' => '',
        'asn' => 0, 'org' => '', 'isp' => '', 'datacenter' => false,
    ];

    if ($ip === '' || $ip === '0.0.0.0' || !filter_var($ip, FILTER_VALIDATE_IP)) {
        return $blank;
    }
    // 私有位址（區網／本機測試）不做外部查詢
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        return $blank;
    }

    $cachePath = sys_get_temp_dir() . '/adwire_ipintel/' . hash('sha256', $ip) . '.json';
    if (is_readable($cachePath)) {
        $cached = json_decode((string) @file_get_contents($cachePath), true);
        if (is_array($cached) && (int) ($cached['ts'] ?? 0) > (time() - 86400)) {
            unset($cached['ts']);
            return $cached + $blank;
        }
    }

    $ctx = stream_context_create([
        'http' => ['timeout' => 3, 'ignore_errors' => true],
        'ssl'  => ['verify_peer' => true, 'verify_peer_name' => true],
    ]);
    $raw = @file_get_contents('https://ipwho.is/' . rawurlencode($ip), false, $ctx);
    if ($raw === false || $raw === '') {
        return $blank;
    }

    $j = json_decode($raw, true);
    if (!is_array($j) || empty($j['success'])) {
        return $blank;
    }

    $conn = is_array($j['connection'] ?? null) ? $j['connection'] : [];
    $org  = (string) ($conn['org'] ?? '');
    $isp  = (string) ($conn['isp'] ?? '');
    $asn  = (int) ($conn['asn'] ?? 0);

    $result = [
        'ok'           => true,
        'country'      => (string) ($j['country'] ?? ''),
        'country_code' => (string) ($j['country_code'] ?? ''),
        'asn'          => $asn,
        'org'          => $org,
        'isp'          => $isp,
        'datacenter'   => isDatacenterOrg($org !== '' ? $org : $isp, $asn),
    ];

    if (!is_dir(dirname($cachePath))) {
        @mkdir(dirname($cachePath), 0700, true);
    }
    @file_put_contents($cachePath, json_encode($result + ['ts' => time()], JSON_UNESCAPED_UNICODE));

    return $result;
}

/**
 * 已知的一次性／棄用電郵域名（spam 常用）。
 * 注意：gmail／yahoo／outlook 等「免費但正常」的域名刻意不在名單內 ——
 * 香港大量中小企真的用 gmail 查詢，封咗等於走客。
 */
function isDisposableEmailDomain(string $domain): bool
{
    $domain = mb_strtolower(trim($domain), 'UTF-8');
    if ($domain === '') {
        return false;
    }
    $list = [
        'ifastnet1.com', 'usaaxa.com', 'mailinator.com', 'guerrillamail.com',
        'guerrillamail.net', 'sharklasers.com', 'grr.la', 'spam4.me',
        '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org',
        'throwawaymail.com', 'yopmail.com', 'yopmail.net', 'trashmail.com',
        'maildrop.cc', 'getnada.com', 'dispostable.com', 'mailnesia.com',
        'mytemp.email', 'moakt.com', 'emailondeck.com', 'fakeinbox.com',
        'mailcatch.com', 'spambog.com', 'discard.email', 'mail-temporaire.fr',
        'byom.de', 'kurzepost.de', 'wegwerfmail.de', 'trbvm.com',
    ];
    if (in_array($domain, $list, true)) {
        return true;
    }
    // 一次性域名常見關鍵字
    foreach (['tempmail', 'temp-mail', 'throwaway', '10minutemail', 'disposable', 'trashmail', 'mailinator'] as $kw) {
        if (strpos($domain, $kw) !== false) {
            return true;
        }
    }
    return false;
}

/** 加分並記錄原因（供電郵／資料庫顯示） */
function addSpamScore(int &$score, array &$reasons, int $points, string $reason): void
{
    if ($points <= 0) {
        return;
    }
    $score   += $points;
    $reasons[] = $reason . '(+' . $points . ')';
}

/**
 * 是否明顯非瀏覽器的 User-Agent（bot 常常漏送或填假值）
 */
function looksLikeBotUserAgent(string $ua): bool
{
    $ua = trim($ua);
    if ($ua === '' || mb_strlen($ua, 'UTF-8') < 20) {
        return true;
    }
    foreach (['curl', 'python', 'wget', 'httpclient', 'headlesschrome', 'phantomjs',
              'scrapy', 'go-http-client', 'java/', 'libwww', 'okhttp', 'axios'] as $bad) {
        if (stripos($ua, $bad) !== false) {
            return true;
        }
    }
    return false;
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

// ── Spam Scoring（2026-09-28）──────────────────────────────────────────
// 設計原則：只累積「真客戶不會出現」的訊號，並在達到門檻時「隔離」而
// 非拒收 —— 記錄照樣完整保存（status='spam'），通知信照樣寄出但主旨
// 加上 [疑似垃圾]，配合 Gmail filter 自動歸類，真客零損失。
$spamScore   = 0;
$spamReasons = [];

// (1) 同一 IP 長窗口累積 —— 捉繞過「3 次/60 秒」的慢速攻擊
$ipDailyCount = bumpRateLimit('ip_daily', $clientIp, 86400);
if ($ipDailyCount > 4) {
    addSpamScore($spamScore, $spamReasons, 25, "同一 IP 24 小時內第 {$ipDailyCount} 次提交");
}

// (2) 同一網絡段（/24）輪換 IP —— 換 IP 但換不掉網絡段
$netPrefix      = networkPrefix($clientIp);
$netHourlyCount = bumpRateLimit('net_hourly', $netPrefix, 3600);
if ($netHourlyCount > 8) {
    addSpamScore($spamScore, $spamReasons, 30, "同網絡段 {$netPrefix} 1 小時內第 {$netHourlyCount} 次提交");
}

// (3) 同一電郵域名的短時間用量
$emailDomain = (strpos($email, '@') !== false)
    ? mb_strtolower(substr(strrchr($email, '@'), 1), 'UTF-8')
    : '';
if ($emailDomain !== '') {
    $domainDailyCount = bumpRateLimit('domain_daily', $emailDomain, 86400);
    if ($domainDailyCount > 4) {
        addSpamScore($spamScore, $spamReasons, 30, "同一電郵域名 {$emailDomain} 24 小時內第 {$domainDailyCount} 次提交");
    }
}

// (4) IP 信譽：ISP vs 數據中心／VPN（fail-open，查不到就當正常）
$ipIntel = lookupIpIntel($clientIp);
$asnType = 'ASN 未知';
$asnOrg  = '';
if (!empty($ipIntel['ok'])) {
    $asnOrg  = $ipIntel['org'] !== '' ? $ipIntel['org'] : $ipIntel['isp'];
    $asnType = !empty($ipIntel['datacenter']) ? '數據中心／VPN' : '一般 ISP';
    if (!empty($ipIntel['datacenter'])) {
        addSpamScore($spamScore, $spamReasons, 35,
            '來源為數據中心／VPN（AS' . $ipIntel['asn'] . ' ' . $asnOrg . '）');
    }
}

// (5) 同一 ASN 短期內大量提交 —— 實測兩個 spam 同屬 AS212238 Datacamp
if (!empty($ipIntel['ok']) && (int) $ipIntel['asn'] > 0) {
    $asnHourlyCount = bumpRateLimit('asn_hourly', 'AS' . $ipIntel['asn'], 3600);
    if ($asnHourlyCount > 15) {
        addSpamScore($spamScore, $spamReasons, 35, "同一 ASN (AS{$ipIntel['asn']}) 1 小時內第 {$asnHourlyCount} 次提交");
    }
}

// (6) 內容指紋：電話／公司／公司網站填同一串純數字（實測兩個 spam 都中）
$isDigitsOnly = static function (string $v): bool {
    return $v !== '' && preg_match('/^\d+$/', $v) === 1;
};
if ($phone !== '' && $company !== '' && $companySite !== ''
    && $phone === $company && $phone === $companySite && $isDigitsOnly($phone)) {
    addSpamScore($spamScore, $spamReasons, 40, '電話／公司／公司網站填寫完全相同的純數字');
} else {
    if ($isDigitsOnly($company)) {
        addSpamScore($spamScore, $spamReasons, 20, '公司名稱只填數字');
    }
    if ($isDigitsOnly($companySite)) {
        addSpamScore($spamScore, $spamReasons, 20, '公司網站只填數字');
    }
}

// (7) 訊息與所有選填欄位全部空白（真客通常至少描述一句）
if ($message === '' && $company === '' && $companySite === '' && $systemInfo === '') {
    addSpamScore($spamScore, $spamReasons, 10, '訊息與所有選填欄位全部空白');
}

// (8) 一次性／棄用電郵域名
if (isDisposableEmailDomain($emailDomain)) {
    addSpamScore($spamScore, $spamReasons, 40, '一次性／棄用電郵域名 ' . $emailDomain);
}

// (9) User-Agent 缺失或明顯非瀏覽器
$userAgent = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
if (looksLikeBotUserAgent($userAgent)) {
    addSpamScore($spamScore, $spamReasons, 25, 'User-Agent 缺失或明顯非瀏覽器');
}

// (10) 服務類別非白名單值（正常客人只會由下拉選單送出白名單選項）
if ($service === '未指定') {
    addSpamScore($spamScore, $spamReasons, 15, '服務類別非白名單值');
}

// 門檻：>= 55 分 → 隔離（標記 spam，仍然保存記錄、仍然寄通知）
$isSpam = $spamScore >= 55;

// 同一 IP 近期提交次數（顯示用）
$recentFromIp = max(0, $ipDailyCount - 1);

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
//
// ⚠️ Staging 保護：Staging 環境的 config.php 會 define('ADWIRE_STAGING', true)，
//    此時跳過資料庫寫入，避免測試提交污染正式的 enquiries 記錄（CRM）。
//    正式環境不會有此常數，行為完全不變。
if (defined('ADWIRE_STAGING') && ADWIRE_STAGING) {
    error_log('[ADWire][STAGING] DB write skipped for test enquiry.');
} else {
try {
    require_once __DIR__ . '/admin/includes/database.php';
    $pdo = Database::getInstance();
    $stmt = $pdo->prepare(
        'INSERT INTO enquiries (name, phone, email, service, message, ip_address, user_agent, status,
                                spam_score, spam_reasons, country_code, asn, asn_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
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
        mb_substr($userAgent, 0, 500),
        $isSpam ? 'spam' : 'new',
        $spamScore,
        mb_substr(implode('；', $spamReasons), 0, 255),
        mb_substr((string) ($ipIntel['country_code'] ?? ''), 0, 2),
        $ipIntel['asn'] > 0 ? ('AS' . $ipIntel['asn']) : '',
        mb_substr($asnType, 0, 20),
    ]);
} catch (Throwable $dbEx) {
    // 數據庫寫入失敗只記錄日誌，不中斷流程（同樣需接得住 Error）
    error_log('[ADWire] Enquiry DB save failed: ' . get_class($dbEx) . ': ' . $dbEx->getMessage());
}
}

// ── Build Email Content ───────────────────────────────────────────────
$to = defined('MAIL_TO') && !empty(MAIL_TO) ? MAIL_TO : 'info@adwire.com.hk';

// [FIX #4] 標頭注入防護：對所有用於 SMTP 標頭的值移除 CR/LF/NULL
$subjectBudget = ($budget !== '' && $budget !== '未指定') ? " - {$budget}" : '';
$stagingTag = (defined('ADWIRE_STAGING') && ADWIRE_STAGING) ? '[STAGING 測試] ' : '';
$spamTag = $isSpam ? '[疑似垃圾] ' : '';
$safeSubject = sanitizeHeader("{$stagingTag}{$spamTag}【新客戶查詢】{$name} - {$service}{$subjectBudget}");
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

// ── 來源與風險資訊（2026-09-28）────────────────────────────────────────
// 目的：唔使入後台，睇通知信就一眼判斷得出真客定 bot。
$srcBits = [$clientIp];
if (!empty($ipIntel['ok'])) {
    $ccText = trim($ipIntel['country']
        . ($ipIntel['country_code'] !== '' ? ' (' . $ipIntel['country_code'] . ')' : ''));
    if ($ccText !== '') { $srcBits[] = $ccText; }
    if ((int) $ipIntel['asn'] > 0) { $srcBits[] = 'AS' . $ipIntel['asn']; }
    if ($asnOrg !== '') { $srcBits[] = $asnOrg; }
    $srcBits[] = $asnType;
} else {
    $srcBits[] = '（IP 信譽查詢不可用，已放行）';
}
$srcText   = htmlspecialchars(implode(' · ', array_filter($srcBits, static fn($v): bool => $v !== '')), ENT_QUOTES, 'UTF-8');
$riskColor = $isSpam ? '#c0392b' : '#27ae60';
$riskText  = $isSpam
    ? '疑似垃圾（' . $spamScore . ' 分）：' . htmlspecialchars(implode('；', $spamReasons), ENT_QUOTES, 'UTF-8')
    : '正常（' . $spamScore . ' 分）';

$extraRows .= '<tr><td class="label">來源資訊</td><td class="value">' . nl2br($srcText) . '</td></tr>';
$extraRows .= '<tr><td class="label">風險評估</td><td class="value" style="color:' . $riskColor . ';font-weight:bold;">' . $riskText . '</td></tr>';
if ($recentFromIp > 0) {
    $extraRows .= '<tr><td class="label">重複提交</td><td class="value">同一 IP 24 小時內第 ' . $ipDailyCount . ' 次</td></tr>';
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

// ── SMTP Headers（本機 mail() 降級方案用）─────────────────────────────
// [FIX #7] 不暴露 PHP 版本（X-Mailer 改為自定義標識）
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$mailFrom = defined('MAIL_FROM') && !empty(MAIL_FROM) ? MAIL_FROM : 'no-reply@adwire.com.hk';
$headers .= "From: ADWire Website <{$mailFrom}>\r\n";
$headers .= "Reply-To: {$safeName} <{$safeEmail}>\r\n";
$headers .= "X-Mailer: ADWire-Contact-Form\r\n";

// ── 郵件通道（FIX #11）────────────────────────────────────────────────
// 背景：adwire.com.hk 的 SPF 只授權 Google、DMARC 為 p=quarantine，
//       由本機（SiteGround）直接以 @adwire.com.hk 名義寄出的郵件會被 Gmail
//       判為 DMARC:Quarantine，掉入垃圾郵件（後台有記錄、郵箱收唔到）。
// 做法：優先經 smtp.gmail.com 認證發送（SPF＋DKIM＋DMARC 全部通過，穩定入
//       收件箱）；憑證未設定或 SMTP 失敗時，才降級用本機 mail()，確保通知
//       不會完全中斷。
//
// 憑證檔必須放在 webroot 以外（網站讀取不到）：
//   ~/www/adwire.com.hk/adwire-mail-secret.php
//   模式 A（Google SMTP relay，IP 白名單、無密碼）：
//     <?php return ['host' => 'smtp-relay.gmail.com', 'port' => 587,
//                    'user' => 'info@adwire.com.hk', 'from' => 'info@adwire.com.hk'];
//   模式 B（Gmail 帳戶 + App Password）：
//     <?php return ['user' => 'info@adwire.com.hk', 'pass' => '<App Password>'];
function loadMailSecret(): ?array
{
    $candidates = [
        __DIR__ . '/../adwire-mail-secret.php',
        dirname(__DIR__, 3) . '/.adwire-mail-secret.php',
        (getenv('HOME') ?: '') . '/.adwire-mail-secret.php',
    ];
    foreach ($candidates as $path) {
        if ($path === '' || !is_readable($path)) {
            continue;
        }
        $cfg = @include $path;
        if (!is_array($cfg) || empty($cfg['user'])) {
            continue;
        }
        $pass = (string) ($cfg['pass'] ?? '');
        if (strpos($pass, 'REPLACE_WITH') !== false) {
            continue; // 憑證檔未填好
        }
        // 無密碼但指定了 relay host（例如 Google SMTP relay 用 IP 白名單認證）→ 可用
        if ($pass === '' && empty($cfg['host'])) {
            continue;
        }
        return $cfg;
    }
    return null;
}

/** 讀取 SMTP 回應；非預期回應碼即拋出（訊息唔含憑證） */
function smtpTalk($fp, ?string $command, array $okCodes): string
{
    if ($command !== null) {
        fwrite($fp, $command . "\r\n");
    }
    $out = '';
    while (($line = fgets($fp, 4096)) !== false) {
        $out .= trim($line) . ' ';
        if (preg_match('/^(\d{3}) /', $line, $m)) {
            if (!in_array((int) $m[1], $okCodes, true)) {
                throw new RuntimeException(trim($out));
            }
            return trim($out);
        }
    }
    throw new RuntimeException('連線中斷或無回應：' . trim($out));
}

/** 經 Google Workspace SMTP（STARTTLS + AUTH LOGIN）發送；成功回 "OK ..."，失敗回錯誤字串 */
function smtpSend(array $cfg, string $to, string $subject, string $html, string $from, string $replyName, string $replyEmail): string
{
    $host = (string) ($cfg['host'] ?? 'smtp.gmail.com');
    $port = (int) ($cfg['port'] ?? 587);

    $fp = @stream_socket_client("tcp://{$host}:{$port}", $errno, $errstr, 20);
    if (!$fp) {
        return "連線失敗 {$host}:{$port} — {$errstr}";
    }
    stream_set_timeout($fp, 20);

    try {
        $ehlo = 'EHLO ' . (gethostname() ?: 'localhost');
        smtpTalk($fp, null, [220]);
        smtpTalk($fp, $ehlo, [250]);
        smtpTalk($fp, 'STARTTLS', [220]);
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('STARTTLS 加密握手失敗');
        }
        smtpTalk($fp, $ehlo, [250]);
        if ((string) ($cfg['pass'] ?? '') !== '') {
            smtpTalk($fp, 'AUTH LOGIN', [334]);
            smtpTalk($fp, base64_encode((string) $cfg['user']), [334]);
            smtpTalk($fp, base64_encode((string) $cfg['pass']), [235]);
        }
        smtpTalk($fp, "MAIL FROM:<{$from}>", [250]);
        smtpTalk($fp, "RCPT TO:<{$to}>", [250, 251]);
        smtpTalk($fp, 'DATA', [354]);

        $domain = preg_replace('/^.*@/', '', $from) ?: 'adwire.com.hk';
        $mid = '<' . bin2hex(random_bytes(12)) . '@' . $domain . '>';
        $data  = 'Date: ' . date('r') . "\r\n";
        $data .= "Message-ID: {$mid}\r\n";
        $data .= "From: ADWire Website <{$from}>\r\n";
        $data .= "To: <{$to}>\r\n";
        $data .= 'Subject: ' . mb_encode_mimeheader($subject, 'UTF-8', 'B') . "\r\n";
        $data .= "MIME-Version: 1.0\r\n";
        $data .= "Content-Type: text/html; charset=UTF-8\r\n";
        $data .= "Content-Transfer-Encoding: 8bit\r\n";
        $data .= "Reply-To: {$replyName} <{$replyEmail}>\r\n";
        $data .= "X-Mailer: ADWire-Contact-Form\r\n\r\n";
        $data .= preg_replace('/^\./m', '..', $html) . "\r\n.\r\n"; // dot-stuffing

        fwrite($fp, $data);
        $resp = smtpTalk($fp, null, [250]);
        @fwrite($fp, "QUIT\r\n");
        fclose($fp);
        return 'OK ' . $resp;
    } catch (Throwable $e) {
        @fclose($fp);
        return $e->getMessage();
    }
}

// ── Send ──────────────────────────────────────────────────────────────
$delivered = false;

$mailSecret = loadMailSecret();
if ($mailSecret !== null) {
    $smtpFrom = !empty($mailSecret['from']) ? (string) $mailSecret['from'] : (string) $mailSecret['user'];
    $smtpResult = smtpSend($mailSecret, $to, $safeSubject, $emailContent, $smtpFrom, $safeName, $safeEmail);
    if (strpos($smtpResult, 'OK ') === 0) {
        $delivered = true;
        error_log('[ADWire] enquiry sent via SMTP: ' . $smtpResult);
    } else {
        error_log('[ADWire] SMTP failed, falling back to local mail(): ' . $smtpResult);
    }
} else {
    error_log('[ADWire] mail secret missing; using local mail() (deliverability not guaranteed).');
}

if (!$delivered) {
    $delivered = mail($to, $safeSubject, $emailContent, $headers);
}

if ($delivered) {
    jsonResponse(true, '查詢已發送，我們會盡快聯絡你！');
} else {
    jsonResponse(false, '發送失敗，請稍後再試或直接聯絡我們。', 500);
}
