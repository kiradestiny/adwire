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

// [FIX #12] Origin 必須存在且必須在白名單內。
// 原本寫成 `if (!empty($origin))` —— 即係「唔送 Origin 就完全跳過檢查」，
// 任何直接 POST（curl／bot／腳本）都可以長驅直入處理流程，令 honeypot
// 同填表時間檢查形同虛設。實測收到的 spam 正是繞過前端直接 POST 的。
// 瀏覽器對所有 POST 請求都必定送出 Origin（Fetch 規範），所以收緊後
// 不影響任何正常表單提交；被擋的都會寫入 error_log 以便監察。
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Vary: Origin');
} else {
    error_log('[ADWire] origin rejected: ' . ($origin === '' ? '(missing)' : $origin)
        . ' ip=' . ($_SERVER['REMOTE_ADDR'] ?? '?'));
    ob_clean();
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden'], JSON_UNESCAPED_UNICODE);
    exit;
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

/**
 * 公司網站欄位是否「似一個有效網域」。
 *   真人填公司網站一定會係 domain 格式（example.com、example.com.hk），
 *   或者含中文嘅描述（「暫未有網站」、「Instagram 專頁」）。
 *   純拉丁文字又唔似 domain（例如 Hdhdbsh）係好強嘅亂填訊號。
 *   回 true = 合格（或屬真空值／中文描述）；false = 似亂填。
 */
function looksLikeDomainOrBlank(string $value): bool
{
    $v = trim($value);
    if ($v === '') {
        return true;
    }
    $benign = ['n/a', 'na', 'nil', 'none', '-', '--', '無', '沒有', '暫無', '未有',
               '未填', '沒有網站', '暫未有', '無網站'];
    if (in_array(mb_strtolower($v, 'UTF-8'), $benign, true)) {
        return true;
    }
    if (preg_match('/[\p{Han}]/u', $v) === 1) {
        return true;
    }
    $v = preg_replace('#^https?://#i', '', $v);
    $v = preg_replace('#^www\.#i', '', $v);
    $v = preg_replace('~[/?#].*$~', '', $v);   // 分隔符用 ~ —— 字元類別內有 # ，用 # 做分隔符會被當成收尾
    $v = preg_replace('#:\d+$#', '', $v);
    return preg_match('/^[a-z0-9]([a-z0-9\-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]*[a-z0-9])?)+$/i', $v) === 1
        && preg_match('/\.[a-z]{2,24}$/i', $v) === 1;
}

/**
 * 電郵域名的頂級域係唔係「打錯字」（同常見 TLD 只差一個字母）。
 *   例：.con（應為 .com）、.cmo、.nte、.ogr
 *   2 字母 TLD 一律當國家域名放行（數目太多，唔判斷）。
 */
function emailTldLooksMisspelled(string $domain): bool
{
    $domain = mb_strtolower(trim($domain), 'UTF-8');
    if ($domain === '' || strpos($domain, '.') === false) {
        return false;
    }
    $tld = substr(strrchr($domain, '.'), 1);
    if (strlen($tld) < 3 || strlen($tld) > 6 || !ctype_alpha($tld)) {
        return false;
    }
    $common = ['com', 'net', 'org', 'edu', 'gov', 'info', 'biz', 'int', 'mil', 'name', 'pro'];
    if (in_array($tld, $common, true)) {
        return false;
    }
    foreach ($common as $c) {
        if (levenshtein($tld, $c) === 1) {
            return true;
        }
        // 字母相同但次序調換（cmo/net、nte/net…）—— Levenshtein 會算 2 步，要另外捉
        if (strlen($tld) === strlen($c)) {
            $a = str_split($tld);
            $b = str_split($c);
            sort($a);
            sort($b);
            if ($a === $b) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 單一詞是否亂打鍵盤。保守設計 —— 經 68 個真實樣本（港式人名、品牌、公司名、
 * 中英混合訊息、HKTVmall／PCCW 等縮寫）驗證零誤判。
 */
function looksLikeGibberishToken(string $token): bool
{
    if (strlen($token) < 5 || !ctype_alpha($token)) {
        return false;
    }
    // 3 個以上大寫字母 → 當縮寫品牌（HKTVmall、PCCW、HKBN…）豁免
    if (preg_match_all('/[A-Z]/', $token) >= 3) {
        return false;
    }
    $t = strtolower($token);

    // 鍵盤橫排（qwer / asdf / zxcv…）
    static $rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'qwertzuiop', '1234567890'];
    foreach ($rows as $row) {
        $rl = strlen($row);
        for ($i = 0; $i + 4 <= $rl; $i++) {
            if (strpos($t, substr($row, $i, 4)) !== false) {
                return true;
            }
        }
    }

    static $bigrams = null;
    if ($bigrams === null) {
        $bigrams = array_flip([
            'th','he','in','er','an','re','on','at','en','nd','ti','es','or','te','of','ed',
            'is','it','al','ar','st','to','nt','ng','se','ha','as','ou','io','le','ve','co',
            'me','de','hi','ri','ro','ic','ne','ea','ra','ce','li','ch','ll','be','ma','si',
            'om','ur','ho','op','sh','ca','el','ta','la','di','lo','ck','un','ai','oo','ay',
            'ey','oa','ee','ow','ir','us','ac','ss','so','rs','il','ly','wi','fl','du','um',
            'ut','ry','fi','ni',
        ]);
    }

    $len   = strlen($t);
    $vr    = preg_match_all('/[aeiouy]/', $t) / $len;
    $pairs = [];
    for ($i = 0; $i + 2 <= $len; $i++) {
        $pairs[] = substr($t, $i, 2);
    }
    $hit = count($pairs) > 0
        ? count(array_intersect_key($bigrams, array_flip($pairs))) / count($pairs)
        : 1.0;

    preg_match_all('/[^aeiouy]+/', $t, $mm);
    $run = 0;
    foreach ($mm[0] as $seg) {
        $run = max($run, strlen($seg));
    }

    if ($vr == 0) { return true; }                   // 完全冇母音
    if ($hit < 0.15 && $vr < 0.40) { return true; }  // 冇常見字母組合 + 母音偏少
    if ($run >= 5 && $vr < 0.30) { return true; }    // 過長輔音串
    return false;
}

/**
 * 整個欄位是否亂打鍵盤（只睇純拉丁、無中文、長度 >= 4 的欄位）。
 * 要求「所有詞都屬亂碼」才算 —— 寧可漏，不可誤殺真客。
 */
function looksLikeGibberish(string $value): bool
{
    $v = trim($value);
    if ($v === '' || mb_strlen($v, 'UTF-8') < 4) {
        return false;
    }
    if (preg_match('/[\p{Han}]/u', $v) === 1) {
        return false;
    }
    $tokens = preg_split('/[^A-Za-z]+/', $v, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    if ($tokens === []) {
        return false;
    }
    foreach ($tokens as $t) {
        if (!looksLikeGibberishToken($t)) {
            return false;
        }
    }
    return true;
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
// 內部請求（由伺服器本身發出，例如部署後的 smoke test）：
//   只認 REMOTE_ADDR 為 loopback —— 此值由伺服器設定，無法由外部偽造。
//   用途：內部測試沒有瀏覽器、無法取得 Turnstile token，否則會被誤判為 spam。
//   這只是「免去缺 token 的罰分」，其餘 spam 檢查一律照跑。
$isInternalRequest = in_array($clientIp, ['127.0.0.1', '::1'], true);

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
// Cloudflare Turnstile token（前端 widget 產生；公開值，但要限長度防濫用）
$turnstileToken = substr(trim((string)($input['turnstileToken'] ?? '')), 0, 4096);

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

// ── 硬性拒收：高信心 spam（2026-09-28）─────────────────────────────────
// 負責人指出：公司／品牌名稱與公司網站「不可能」是純數字。
// 實測三筆 spam（#7 #8 #10）全部在三個欄位填同一串純數字；而全部真客
// （含 ADWire 內部測試）的公司在欄位都是正常文字 —— 誤判風險為零。
//
// 規則刻意收窄，避免誤擋真客：
//   必須同時「含有數字」且「完全沒有字母」才拒收。
//   → "-"、"無"、"N/A"、"未填" 等真空值不會觸發。
//
// 被拒的提交仍然寫入資料庫（status='spam'）作審計，但【不寄通知信】，
// 令收件匣零干擾，同時保留完整記錄可追溯（永不刪除）。
$hasLetter = static fn(string $v): bool => preg_match('/\p{L}/u', $v) === 1;
$isNumericGibberish = static fn(string $v): bool =>
    $v !== '' && preg_match('/\d/', $v) === 1 && !preg_match('/\p{L}/u', $v);

$hardRejectField  = '';
$hardRejectReason = '';
if (!$hasLetter($name)) {
    $hardRejectField  = 'name';
    $hardRejectReason = '姓名不可只填數字或符號';
} elseif ($isNumericGibberish($company)) {
    $hardRejectField  = 'company';
    $hardRejectReason = '公司／品牌名稱不可只填數字，請填寫正式名稱或留空';
} elseif ($isNumericGibberish($companySite)) {
    $hardRejectField  = 'companySite';
    $hardRejectReason = '公司網站不可只填數字，請填寫正確網址或留空';
}

if ($hardRejectReason !== '') {
    if (defined('ADWIRE_STAGING') && ADWIRE_STAGING) {
        error_log('[ADWire][STAGING] hard-reject (DB write skipped): ' . $hardRejectReason);
    } else {
        try {
            require_once __DIR__ . '/admin/includes/database.php';
            $pdoH = Database::getInstance();
            $pdoH->prepare(
                'INSERT INTO enquiries (name, phone, email, service, message, ip_address, user_agent, status,
                                        spam_score, spam_reasons, country_code, asn, asn_type)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([
                mb_substr($name, 0, 100),
                mb_substr($phone, 0, 20),
                mb_substr($email, 0, 200),
                mb_substr($service, 0, 100),
                $message,
                mb_substr($clientIp, 0, 45),
                mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 500),
                'spam', 100,
                mb_substr('硬性拒收：' . $hardRejectReason, 0, 255),
                '', '', '',
            ]);
        } catch (Throwable $e) {
            error_log('[ADWire] hard-reject DB save failed: ' . $e->getMessage());
        }
    }
    error_log('[ADWire] hard-reject spam: ' . $hardRejectReason
        . ' field=' . $hardRejectField . ' ip=' . $clientIp
        . ' name=' . $name . ' email=' . $email);
    jsonResponse(false, '提交資料有誤：' . $hardRejectReason . '。', 400);
}

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

// ── Lead Magnet：學校項目報價清單（2026-10-09）──────────────────────────
// 前端表單（/services/education/）送出：
//   { name, phone, email, orgType, consent:true, formType:'education-quote-checklist', source }
// 目的：① 用 $service 標記來源，令後台可篩選、亦避免被「服務類別非白名單」加 15 分
//       ② 同一份 enquiry 記錄同時作為 lead 追蹤依據
$formType = preg_replace('/[^a-z0-9\-]/', '', strtolower((string) ($input['formType'] ?? '')));
$orgType  = trim(htmlspecialchars(strip_tags((string) ($input['orgType'] ?? '')), ENT_QUOTES, 'UTF-8'));
$isLeadMagnet = ($formType === 'education-quote-checklist');
if ($isLeadMagnet && ($service === '' || $service === '未指定')) {
    $service = '學校項目報價清單';
}
if ($isLeadMagnet && $orgType !== '') {
    // 機構類型併入 message，方便後台一眼看到
    $message = trim('[機構類型] ' . mb_substr($orgType, 0, 40) . "\n" . $message);
}

// ── Cloudflare Turnstile 驗證（2026-09-28）────────────────────────────
// 目的：令機械人拿不到有效 token。
//   帶 token 但驗證失敗 → 硬性拒收（明確機械人／重複使用 token）
//   完全冇 token        → 交給評分隔離（+60 分，不寄通知信）
//   無法判斷            → fail-open 放行
// 安全設計：secret 未設定、Cloudflare 連不到、超時，全部 fail-open ——
// 即係 Cloudflare 掛掉最壞都只係回到未加 Turnstile 之前的狀態，真客零損失。
$turnstileStatus = 'skip';   // skip | missing | ok | fail | unknown
$tsSecret = loadTurnstileSecret();
if ($tsSecret !== null) {
    if ($turnstileToken === '') {
        $turnstileStatus = 'missing';
    } else {
        $tsVerdict = verifyTurnstile($turnstileToken, $tsSecret, $clientIp);
        $turnstileStatus = $tsVerdict === true ? 'ok' : ($tsVerdict === false ? 'fail' : 'unknown');
    }
}

if ($turnstileStatus === 'fail') {
    error_log('[ADWire] turnstile hard-reject: invalid token ip=' . $clientIp . ' email=' . $email);
    if (!(defined('ADWIRE_STAGING') && ADWIRE_STAGING)) {
        try {
            require_once __DIR__ . '/admin/includes/database.php';
            $pdoT = Database::getInstance();
            $pdoT->prepare(
                'INSERT INTO enquiries (name, phone, email, service, message, ip_address, user_agent, status,
                                        spam_score, spam_reasons, country_code, asn, asn_type)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([
                mb_substr($name, 0, 100),
                mb_substr($phone, 0, 20),
                mb_substr($email, 0, 200),
                mb_substr($service, 0, 100),
                $message,
                mb_substr($clientIp, 0, 45),
                mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 500),
                'spam', 100,
                '硬性拒收：Cloudflare Turnstile 驗證失敗',
                '', '', '',
            ]);
        } catch (Throwable $e) {
            error_log('[ADWire] turnstile reject DB save failed: ' . $e->getMessage());
        }
    }
    jsonResponse(false, '提交驗證失敗，請重新載入頁面後再試。', 400);
}

// ── Spam Scoring（2026-09-28）──────────────────────────────────────────
// 設計原則：只累積「真客戶不會出現」的訊號，並在達到門檻時「隔離」而
// 非拒收 —— 記錄照樣完整保存（status='spam'），通知信照樣寄出但主旨
// 加上 [疑似垃圾]，配合 Gmail filter 自動歸類，真客零損失。
$spamScore   = 0;
$spamReasons = [];
// 內容類訊號數量（網站格式／電郵 TLD／亂碼）—— 供下方「機械人鐵證」判斷
$contentSignals = 0;

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

// ── 內容語意訊號（2026-10-02）─────────────────────────────────────────
// 背景：實測收到一筆 spam，用【香港住宅 IP + 有效 Turnstile token + 白名單下拉
//       選項 + 格式正常電話】完美繞過所有結構性檢查，但內容係明顯亂打鍵盤
//       （公司 Iddnsn、網站 Hdhdbsh、系統 Ejznznxn、訊息 Ixidjsnxnc、
//        電郵 cn.coffsec.con），結果得 0 分。以下補上「內容有冇意義」的判斷。

// (11) 公司網站唔似有效網域（中文描述與真空值一律放行）
if ($companySite !== '' && !looksLikeDomainOrBlank($companySite)) {
    addSpamScore($spamScore, $spamReasons, 25, '公司網站唔似有效網域格式');
    $contentSignals++;
}

// (12) 電郵域名頂級域疑似打錯（.con / .cmo …）
if ($emailDomain !== '' && emailTldLooksMisspelled($emailDomain)) {
    addSpamScore($spamScore, $spamReasons, 25, '電郵域名頂級域疑似打錯（' . $emailDomain . '）');
    $contentSignals++;
}

// (13) 欄位內容係亂打鍵盤（多個欄位同時中，上限 30 分）
$gibberishFields = [];
foreach ([
    '公司／品牌'     => $company,
    '公司網站'       => $companySite,
    '現有系統／技術' => $systemInfo,
    '客戶訊息'       => $message,
] as $gibLabel => $gibVal) {
    if ($gibVal !== '' && looksLikeGibberish($gibVal)) {
        $gibberishFields[] = $gibLabel;
    }
}
if ($gibberishFields !== []) {
    addSpamScore($spamScore, $spamReasons,
        min(30, 15 * count($gibberishFields)),
        '疑似亂打鍵盤：' . implode('、', $gibberishFields));
    $contentSignals++;
}

// 門檻：>= 55 分 → 隔離（標記 spam，仍然保存記錄、仍然寄通知）
// 冇附帶 Turnstile token：前端表單一定會帶，缺咗屬強烈機械人訊號。
// 用評分而非硬性拒收 —— 避免「真客被 ad-blocker 擋住 Turnstile script」時白白走客。
if ($turnstileStatus === 'missing' && !$isInternalRequest) {
    addSpamScore($spamScore, $spamReasons, 60, '未通過 Cloudflare Turnstile 驗證（提交未附帶 token）');
} elseif ($turnstileStatus === 'missing' && $isInternalRequest) {
    error_log('[ADWire] turnstile missing but internal request (loopback) → 免罰分');
}

$isSpam = $spamScore >= 55;

// ── 分流：機械人鐵證 vs 真人可能（2026-09-28 修訂）──────────────────────
// 背景：原本設計係「評分達標 = 靜默隔離」。但部分訊號真人完全會觸發：
//   冇 Turnstile token ← ad-blocker／無痕模式／擋 script／舊瀏覽器
//   數據中心／VPN      ← 公司 VPN、流動網絡、共享網絡
//   同一 IP／域名用量   ← 同一間公司幾個人先後查詢
// 靜默隔離呢類提交，等於白白走客。原則：**垃圾可以出聲提吓，真客一個都唔可以走。**
//   有「機械人鐵證」→ 靜默隔離（完全唔寄信），避免收件匣被真正垃圾騷擾。
//   只有「真人可能」訊號 → 照樣寄通知信，主旨加 [待確認]，由負責人自行判斷。
$botEvidenceNeedles = [
    '完全相同的純數字',   // 電話／公司／公司網站填同一串數字 —— 真人唔會咁做
    '只填數字',           // 公司名稱／公司網站只填數字
    'User-Agent',         // UA 缺失或明顯非瀏覽器
    '一次性／棄用電郵域名', // 刻意使用即棄信箱
    '同網絡段',           // 同一 /24 一小時大量提交 = 換 IP 攻擊
    '同一 ASN',           // 同一 ASN 一小時大量提交 = 自動化腳本
];
$botEvidence = false;
foreach ($spamReasons as $reasonText) {
    foreach ($botEvidenceNeedles as $needle) {
        if (str_contains($reasonText, $needle)) {
            $botEvidence = true;
            break 2;
        }
    }
}

// 內容類訊號 >= 2 亦屬機械人鐵證：
//   單一項可能係真客手民之誤（例如手寫 "Instagram" 當公司網站），
//   但「網站格式錯 + 電郵 TLD 打錯 + 亂打鍵盤」同時出現，唔可能係正常填寫。
if ($contentSignals >= 2) {
    $botEvidence = true;
}

// 達標但冇機械人鐵證 = 可能係真人被誤判 → 需要負責人自己判斷
$needsHumanReview = $isSpam && !$botEvidence;

// 只有「機械人鐵證」才完全不寄通知信；其餘情況一律寄出。
$suppressSpamEmail = $isSpam && $botEvidence;
if ($suppressSpamEmail) {
    error_log('[ADWire] spam quarantined (bot evidence, no email): score=' . $spamScore
        . ' ip=' . $clientIp . ' reasons=' . implode('；', $spamReasons));
} elseif ($needsHumanReview) {
    error_log('[ADWire] score>=55 but NO bot evidence -> notifying with [待確認]: score=' . $spamScore
        . ' ip=' . $clientIp . ' reasons=' . implode('；', $spamReasons));
}

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
        // 有機械人鐵證才入 spam；真人可能嘅照樣入正常線索收件匣，
        // 唔好被埋喺垃圾堆令負責人睇唔到。
        ($isSpam && $botEvidence) ? 'spam' : 'new',
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
// 只有「真人可能」嘅才會寄出，所以標記為 [待確認]（[疑似垃圾] 已改為靜默隔離，唔會寄）
$spamTag = $needsHumanReview ? '[待確認] ' : '';
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
// [FIX #16] 每格一列（標籤在上、數值在下）—— 手機唔會再被擠成一團。
// 舊寫法兩個問題：(a) 雙引號內 \" 產生字面反斜線令 class 屬性壞掉、CSS 全失效；
//                 (b) 兩欄式 auto layout 會被長數值（長 email／網址）逼窄標籤欄，
//                     中文標籤逐字豎排。
// 用單引號模板 + sprintf，完全避開 PHP 轉義，且直向排列唔依賴 media query。
$rowTpl = '<tr><td class="cell"><div class="lb">%s</div><div class="vl">%s</div></td></tr>';
foreach ($extraPairs as $label => $val) {
    if ($val === '' || $val === '未指定') { continue; }
    $extraRows .= sprintf($rowTpl, $label, nl2br($val));
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
if ($needsHumanReview) {
    $riskColor = '#e67e22';
    $riskText  = '⚠️ 需要你確認（真人有可能）：' . $spamScore . ' 分 —— '
        . htmlspecialchars(implode('；', $spamReasons), ENT_QUOTES, 'UTF-8')
        . '｜未發現機械人鐵證，所以照樣通知你。若確認係垃圾可直接略過。';
} elseif ($isSpam) {
    $riskColor = '#c0392b';
    $riskText  = '疑似垃圾（' . $spamScore . ' 分）：' . htmlspecialchars(implode('；', $spamReasons), ENT_QUOTES, 'UTF-8');
} else {
    $riskColor = '#27ae60';
    $riskText  = '正常（' . $spamScore . ' 分）';
}

$extraRows .= sprintf($rowTpl, '來源資訊', nl2br($srcText));
$extraRows .= sprintf($rowTpl, '風險評估', '<span style="color:' . $riskColor . ';font-weight:bold;">' . $riskText . '</span>');
if ($recentFromIp > 0) {
    $extraRows .= sprintf($rowTpl, '重複提交', '同一 IP 24 小時內第 ' . $ipDailyCount . ' 次');
}

$emailContent = <<<HTML
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Inquiry</title>
    <style>
        /* 手機優先：直向排列、大字體、唔會擠壓 */
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, 'PingFang TC', 'Microsoft JhengHei', sans-serif; background-color: #f4f4f4; color: #1a1f36; -webkit-text-size-adjust: 100%; }
        .wrap { padding: 14px 10px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; }
        .header { background-color: #0f4c81; padding: 24px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px; }
        .content { padding: 22px 20px 26px; }
        .intro { margin: 0 0 20px; color: #5a6377; font-size: 15.5px; line-height: 1.6; }
        .section-title { color: #0f4c81; font-size: 17px; font-weight: bold; border-bottom: 2px solid #f5a623; padding-bottom: 10px; margin-bottom: 6px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td.cell { padding: 13px 0; border-bottom: 1px solid #eceff4; }
        .lb { font-size: 13px; color: #8a93a5; font-weight: bold; letter-spacing: .4px; margin: 0 0 5px; }
        .vl { font-size: 17px; line-height: 1.55; color: #1a1f36; word-break: break-word; overflow-wrap: anywhere; }
        .vl a { color: #0f4c81; text-decoration: none; overflow-wrap: anywhere; }
        .msg-label { font-size: 13px; color: #8a93a5; font-weight: bold; letter-spacing: .4px; margin: 26px 0 8px; }
        .message-box { background-color: #f8f9fb; padding: 16px 18px; border-radius: 8px; border-left: 4px solid #f5a623; font-size: 16.5px; line-height: 1.7; color: #1a1f36; word-break: break-word; overflow-wrap: anywhere; }
        .btn-wrap { margin-top: 26px; }
        .btn-whatsapp { display: block; background-color: #25D366; color: #ffffff !important; padding: 15px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; text-align: center; }
        .footer { background-color: #eef1f5; padding: 18px 20px; text-align: center; font-size: 12px; line-height: 1.7; color: #8a93a5; }
        .footer p { margin: 4px 0; }
        .highlight { color: #f5a623; }
        /* 只有夠闊嘅畫面才加大留白；排列本身唔依賴呢段 */
        @media only screen and (min-width: 601px) {
            .wrap { padding: 24px 16px; }
            .content { padding: 34px 40px 38px; }
            .btn-wrap { text-align: center; }
            .btn-whatsapp { display: inline-block; min-width: 220px; }
        }
    </style>
</head>
<body>
  <div class="wrap">
    <div class="container">
        <div class="header">
            <h1>ADWire <span class="highlight">Agency</span></h1>
        </div>
        <div class="content">
            <div class="section-title">收到新的網站查詢</div>
            <p class="intro">你好，網站收到了一則新的潛在客戶查詢，詳細資料如下：</p>

            <table class="info-table" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td class="cell">
                        <div class="lb">客戶姓名</div>
                        <div class="vl">{$name}</div>
                    </td>
                </tr>
                <tr>
                    <td class="cell">
                        <div class="lb">聯絡電話</div>
                        <div class="vl"><a href="tel:{$phone}">{$phone}</a></div>
                    </td>
                </tr>
                <tr>
                    <td class="cell">
                        <div class="lb">電子郵件</div>
                        <div class="vl"><a href="mailto:{$email}">{$email}</a></div>
                    </td>
                </tr>
                <tr>
                    <td class="cell">
                        <div class="lb">服務類別</div>
                        <div class="vl" style="color: #0f4c81; font-weight: bold;">{$service}</div>
                    </td>
                </tr>
                {$extraRows}
            </table>

            <div class="msg-label">客戶訊息</div>
            <div class="message-box">{$messageHtml}</div>

            <div class="btn-wrap">
                <a href="https://wa.me/{$waPhone}" target="_blank" class="btn-whatsapp">WhatsApp 回覆客戶</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; {$year} ADWire Agency. All rights reserved.</p>
            <p>此郵件由 ADWire 官方網站自動發送，請勿直接回覆此系統郵件。</p>
        </div>
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
/**
 * 讀取 Cloudflare Turnstile Secret Key。
 * 存於 webroot 以外（與 adwire-mail-secret.php 同一慣例），格式：
 *   <?php return ['secret' => '0x4AAAAA...'];
 * 讀不到就回 null —— 呼叫方一律 fail-open，不會因此擋走真客。
 */
function loadTurnstileSecret(): ?string
{
    $candidates = [
        __DIR__ . '/../adwire-turnstile-secret.php',
        dirname(__DIR__, 3) . '/.adwire-turnstile-secret.php',
        (getenv('HOME') ?: '') . '/.adwire-turnstile-secret.php',
    ];
    foreach ($candidates as $path) {
        if ($path === '' || !is_readable($path)) {
            continue;
        }
        $cfg = @include $path;
        if (is_array($cfg) && !empty($cfg['secret']) && is_string($cfg['secret'])) {
            return trim($cfg['secret']);
        }
    }
    return null;
}

/**
 * 向 Cloudflare Siteverify 驗證 Turnstile token。
 *   回傳 true  = 通過
 *   回傳 false = 明確失敗（token 無效／過期／重複使用）→ 呼叫方可硬性拒收
 *   回傳 null  = 無法判斷（網絡問題／超時／回應異常）→ 呼叫方必須 fail-open
 */
function verifyTurnstile(string $token, string $secret, string $ip): ?bool
{
    if ($token === '' || $secret === '') {
        return null;
    }
    $ctx = stream_context_create([
        'http' => [
            'method'        => 'POST',
            'header'        => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content'       => http_build_query([
                'secret'   => $secret,
                'response' => $token,
                'remoteip' => $ip,
            ]),
            'timeout'       => 4,
            'ignore_errors' => true,
        ],
        'ssl' => ['verify_peer' => true, 'verify_peer_name' => true],
    ]);
    $raw = @file_get_contents('https://challenges.cloudflare.com/turnstile/v0/siteverify', false, $ctx);
    if ($raw === false || $raw === '') {
        error_log('[ADWire] turnstile siteverify unreachable -> fail-open');
        return null;
    }
    $res = json_decode($raw, true);
    if (!is_array($res) || !array_key_exists('success', $res)) {
        error_log('[ADWire] turnstile siteverify unexpected response -> fail-open: ' . substr($raw, 0, 200));
        return null;
    }
    if ($res['success'] === true) {
        return true;
    }
    error_log('[ADWire] turnstile verification FAILED: '
        . implode(',', (array) ($res['error-codes'] ?? [])));
    return false;
}

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
function smtpSend(array $cfg, string $to, string $subject, string $html, string $from, string $replyName, string $replyEmail, array $attachments = []): string
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
        $data .= "Reply-To: {$replyName} <{$replyEmail}>\r\n";
        $data .= "X-Mailer: ADWire-Contact-Form\r\n";

        // multipart/mixed：HTML 內文 + base64 附件（2026-10-09 新增，Lead Magnet 用）
        if (!empty($attachments)) {
            $b = '=_adw_' . bin2hex(random_bytes(12));
            $body  = "--{$b}\r\n";
            $body .= "Content-Type: text/html; charset=UTF-8\r\n";
            $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $body .= $html . "\r\n";
            foreach ($attachments as $att) {
                // 附件檔名只保留安全字元，避免破壞 MIME 標頭
                $fname = preg_replace('/[^A-Za-z0-9._-]/', '_', (string) ($att['name'] ?? 'attachment'));
                $blob = (string) ($att['data'] ?? '');
                $body .= "--{$b}\r\n";
                $body .= 'Content-Type: ' . (string) ($att['mime'] ?? 'application/octet-stream')
                       . "; name=\"{$fname}\"\r\n";
                $body .= "Content-Transfer-Encoding: base64\r\n";
                $body .= "Content-Disposition: attachment; filename=\"{$fname}\"\r\n\r\n";
                $body .= chunk_split(base64_encode($blob), 76, "\r\n");
            }
            $body .= "--{$b}--\r\n";
            $data .= "Content-Type: multipart/mixed; boundary=\"{$b}\"\r\n\r\n";
        } else {
            $body  = "Content-Type: text/html; charset=UTF-8\r\n";
            $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $body .= $html . "\r\n";
        }
        $data .= preg_replace('/^\./m', '..', $body) . "\r\n.\r\n"; // dot-stuffing

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

/**
 * Lead Magnet 自動回覆：附上「學校項目報價清單」PDF。
 * 只在 $isLeadMagnet 且使用者已勾選同意時呼叫；附件讀自 public/downloads/。
 */
function sendLeadMagnetAutoReply(array $cfg, string $toEmail, string $toName): string
{
    $pdfPath = __DIR__ . '/downloads/school-project-quotation-checklist.pdf';
    $attachments = [];
    if (is_readable($pdfPath)) {
        $attachments[] = [
            'name' => 'ADWire-school-project-quotation-checklist.pdf',
            'mime' => 'application/pdf',
            'data' => (string) file_get_contents($pdfPath),
        ];
    } else {
        error_log('[ADWire] lead magnet PDF missing: ' . $pdfPath);
    }

    $safeTo = htmlspecialchars($toName !== '' ? $toName : '你好', ENT_QUOTES, 'UTF-8');
    $html = '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#374151;max-width:600px">'
        . '<p>你好 ' . $safeTo . '：</p>'
        . '<p>多謝你索取 ADWire 的《學校項目報價清單》。檔案已隨此郵件附上，內容包括：</p>'
        . '<ul style="padding-left:20px;margin:12px 0">'
        . '<li>索取報價前，學校應先準備的五件事</li>'
        . '<li>一份完整報價單應該包含的項目</li>'
        . '<li>面試供應商必問的五條問題</li>'
        . '<li>資助計劃文件清單（以校本計劃為例）</li>'
        . '<li>驗收時的檢查清單</li>'
        . '</ul>'
        . '<p>如果你希望我們就個別項目提供意見或報價，直接回覆這封郵件，或 WhatsApp 我們便可。</p>'
        . '<p style="margin-top:20px">ADWire Agency Limited<br>'
        . 'WhatsApp：<a href="https://wa.me/85295861027" style="color:#0f4c81">+852 9586 1027</a><br>'
        . '電郵：<a href="mailto:info@adwire.com.hk" style="color:#0f4c81">info@adwire.com.hk</a><br>'
        . '網站：<a href="https://adwire.com.hk" style="color:#0f4c81">adwire.com.hk</a></p>'
        . '<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">'
        . '<p style="font-size:12px;color:#6b7280;line-height:1.7">你收到的這封郵件，是因為你在 adwire.com.hk 的學校服務頁面填寫了索取清單的表格並同意我們聯絡你。'
        . '你的姓名、聯絡電話及電郵地址只會用於提供本清單及就學校項目與你聯絡，不會轉交第三方作推銷用途。'
        . '你可隨時回覆此郵件要求查閱、更正或刪除你的個人資料，詳見我們的<a href="https://adwire.com.hk/privacy/" style="color:#0f4c81">私隱政策</a>。</p>'
        . '</div>';

    $from = (string) ($cfg['from'] ?? '') !== '' ? (string) $cfg['from'] : (string) $cfg['user'];
    return smtpSend($cfg, $toEmail, 'ADWire — 學校項目報價清單（附件）', $html, $from, 'ADWire Agency', $from, $attachments);
}

// ── Send ──────────────────────────────────────────────────────────────
// 疑似垃圾：已寫入資料庫，但不寄通知信（見上方 $suppressSpamEmail）
if ($isSpam && $suppressSpamEmail) {
    error_log('[ADWire] spam quarantined, no notification email: score=' . $spamScore
        . ' ip=' . $clientIp . ' reasons=' . implode('；', $spamReasons));
    jsonResponse(true, '查詢已發送，我們會盡快聯絡你！');
}
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
    // ── Lead Magnet：向提交者發出自動回覆（附 PDF）────────────────────
    if ($isLeadMagnet && !$isSpam && $mailSecret !== null) {
        $autoReply = sendLeadMagnetAutoReply($mailSecret, $safeEmail, $safeName);
        if (strpos($autoReply, 'OK ') === 0) {
            error_log('[ADWire] lead magnet auto-reply sent: ' . $autoReply);
        } else {
            error_log('[ADWire] lead magnet auto-reply FAILED: ' . $autoReply);
        }
    } elseif ($isLeadMagnet && $isSpam) {
        // 防止被當成濫發工具：spam 判定時不向提交者寄信（但 enquiry 已入庫，交由人手跟進）
        error_log('[ADWire] lead magnet auto-reply skipped (spam-flagged): score=' . $spamScore);
    }
    $okMessage = !$isLeadMagnet
        ? '查詢已發送，我們會盡快聯絡你！'
        : ($isSpam
            ? '我們已收到你的資料，會盡快以人手跟進。'
            : '清單已發送到你的電郵，我們會盡快聯絡你！');
    jsonResponse(true, $okMessage);
} else {
    jsonResponse(false, '發送失敗，請稍後再試或直接聯絡我們。', 500);
}
