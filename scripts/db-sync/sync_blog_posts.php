<?php
/**
 * ADWire Blog DB Sync — 把 repo (lib/blogData.ts) 的文章內容同步到後台 DB
 *
 * 背景（2026-09-23）：
 *   lib/data-resolver.ts 的合併規則是「同一 slug → 後台 API 版本覆蓋 repo 版本」。
 *   後台 blog_posts 表內有一批 2026-09-20 的舊快照（含已停用的舊標題、
 *   舊短版內容、口語／大陸用語），令 6–10 篇文章的網站版本永遠停留在舊版，
 *   無論 repo 怎樣改都不會生效。
 *
 * 本腳本用途：把 repo 現行版本（title / excerpt / content）寫回 DB，
 *   令線上版本與 repo 一致。只 UPDATE 已存在的 slug，永不 INSERT、永不 DELETE。
 *
 * 安全設計：
 *   1. 只可經 CLI 執行（php_sapi_name() === 'cli'），HTTP 存取直接中止。
 *   2. 預設 dry-run；要 --apply 才寫入。
 *   3. 寫入前把所有受影響的舊資料完整備份到 ~/db_backups/blog_sync_<ts>.json。
 *   4. 逐個 slug 處理並即時回讀核對，任何一筆失敗即停止並報告。
 *
 * 用法（在伺服器上）：
 *   php sync_blog_posts.php                        # dry-run：只報告差異
 *   php sync_blog_posts.php --apply                # 正式寫入（會先備份）
 */

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit("CLI only\n");
}

$APPLY = in_array('--apply', $argv, true);
$HERE  = __DIR__;

// ── 1. 讀取後台 DB config ────────────────────────────────────────────────
$cfgCandidates = [
    $HERE . '/../admin/includes/config.php',
    $HERE . '/admin/includes/config.php',
    dirname($HERE) . '/admin/includes/config.php',
];
$cfg = null;
foreach ($cfgCandidates as $c) {
    if (is_file($c)) { $cfg = $c; break; }
}
if (!$cfg) {
    exit("❌ 找不到 admin/includes/config.php（試過：\n  " . implode("\n  ", $cfgCandidates) . "\n）\n");
}
require_once $cfg;

$c = get_defined_constants(true)['user'] ?? [];
$pick = function (array $names) use ($c) {
    foreach ($names as $n) if (isset($c[$n])) return $c[$n];
    return null;
};
$host = $pick(['DB_HOST', 'DB_SERVER', 'DBHOST', 'MYSQL_HOST', 'DB_HOSTNAME']);
$name = $pick(['DB_NAME', 'DB_DATABASE', 'DBNAME', 'MYSQL_DATABASE']);
$user = $pick(['DB_USER', 'DB_USERNAME', 'DBUSER', 'MYSQL_USER']);
$pass = $pick(['DB_PASS', 'DB_PASSWORD', 'DBPASS', 'MYSQL_PASSWORD']);

if (!$host || !$name || !$user) {
    echo "❌ 無法由 config 判斷 DB 憑證。偵測到的常量名稱：\n";
    foreach (array_keys($c) as $k) echo "   - $k\n";
    exit(1);
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    echo "✅ DB 連線成功（host=$host, db=$name）\n";
} catch (Throwable $e) {
    exit("❌ DB 連線失敗：" . $e->getMessage() . "\n");
}

// ── 2. 讀 payload ───────────────────────────────────────────────────────
$payloadFile = $HERE . '/payload.json';
if (!is_file($payloadFile)) exit("❌ 找不到 payload.json\n");
$payload = json_decode(file_get_contents($payloadFile), true);
if (!is_array($payload)) exit("❌ payload.json 格式錯誤\n");
echo "📦 payload： " . count($payload) . " 篇文章\n";

// ── 3. 檢查表結構 ───────────────────────────────────────────────────────
$cols = [];
foreach ($pdo->query("SHOW COLUMNS FROM blog_posts")->fetchAll() as $r) {
    $cols[$r['Field']] = $r['Type'];
}
echo "🧱 blog_posts 欄位：" . implode(', ', array_keys($cols)) . "\n";

$pickCol = function (array $cands) use ($cols) {
    foreach ($cands as $x) if (isset($cols[$x])) return $x;
    return null;
};
$cTitle   = $pickCol(['title']);
$cExcerpt = $pickCol(['excerpt']);
$cContent = $pickCol(['content']);
$cUpdated = $pickCol(['updated_at', 'updatedAt', 'updated_on']);

if (!$cTitle || !$cContent) exit("❌ blog_posts 缺少 title 或 content 欄位\n");

// ── 4. 逐篇比對 ─────────────────────────────────────────────────────────
$sel = $pdo->prepare("SELECT * FROM blog_posts WHERE slug = ? LIMIT 1");
$rows = []; $missing = []; $diffs = [];

foreach ($payload as $p) {
    $sel->execute([$p['slug']]);
    $row = $sel->fetch();
    if (!$row) { $missing[] = $p['slug']; continue; }

    $d = [];
    if (($row[$cTitle] ?? '') !== $p['title']) {
        $d[] = 'title: 「' . mb_substr((string)$row[$cTitle], 0, 28) . '…」 → 「' . mb_substr($p['title'], 0, 28) . '…」';
    }
    if ($cExcerpt && ($row[$cExcerpt] ?? '') !== $p['excerpt']) $d[] = 'excerpt 不同（' . mb_strlen((string)$row[$cExcerpt]) . ' → ' . mb_strlen($p['excerpt']) . ' 字）';
    if (($row[$cContent] ?? '') !== $p['content']) $d[] = 'content 不同（' . mb_strlen((string)$row[$cContent]) . ' → ' . mb_strlen($p['content']) . ' 字）';

    if ($d) $diffs[$p['slug']] = ['row' => $row, 'new' => $p, 'd' => $d];
}

echo "\n── 比對結果 ────────────────────────────────\n";
echo "  後台有、且有差異： " . count($diffs) . " 篇\n";
echo "  後台有、已一致：   " . (count($payload) - count($diffs) - count($missing)) . " 篇\n";
echo "  後台沒有此 slug：  " . count($missing) . " 篇\n";

if ($diffs) {
    echo "\n【有差異的文章】\n";
    foreach ($diffs as $slug => $info) {
        echo "  • $slug\n";
        foreach ($info['d'] as $line) echo "      - $line\n";
    }
}
if ($missing) {
    echo "\n【後台沒有（不動）】\n";
    foreach ($missing as $m) echo "  • $m\n";
}

if (!$APPLY) {
    echo "\n🔎 DRY-RUN 完成，未寫入任何資料。加 --apply 才正式同步。\n";
    exit(0);
}

if (!$diffs) { echo "\n✅ 無需更新。\n"; exit(0); }

// ── 5. 備份 ─────────────────────────────────────────────────────────────
$backupDir = getenv('HOME') . '/db_backups';
if (!is_dir($backupDir)) @mkdir($backupDir, 0755, true);
$ts  = date('Ymd-His');
$bf  = $backupDir . "/blog_posts_sync_{$ts}.json";
file_put_contents($bf, json_encode(array_map(fn($x) => $x['row'], $diffs), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
echo "\n💾 已備份 " . count($diffs) . " 篇原始資料 → $bf\n";

// ── 6. 更新 ─────────────────────────────────────────────────────────────
$set = ["`$cTitle` = :title", "`$cContent` = :content"];
if ($cExcerpt) $set[] = "`$cExcerpt` = :excerpt";
if ($cUpdated) $set[] = "`$cUpdated` = :updated";
$sql  = "UPDATE blog_posts SET " . implode(', ', $set) . " WHERE slug = :slug";
$upd  = $pdo->prepare($sql);
$chk  = $pdo->prepare("SELECT title, content FROM blog_posts WHERE slug = ? LIMIT 1");

$ok = 0; $fail = [];
foreach ($diffs as $slug => $info) {
    $params = ['title' => $info['new']['title'], 'content' => $info['new']['content'], 'slug' => $slug];
    if ($cExcerpt) $params['excerpt'] = $info['new']['excerpt'];
    if ($cUpdated) $params['updated'] = date('Y-m-d H:i:s');
    try {
        $upd->execute($params);
        $chk->execute([$slug]);
        $after = $chk->fetch();
        if (($after['title'] ?? null) === $info['new']['title'] && ($after['content'] ?? null) === $info['new']['content']) {
            $ok++;
            echo "  ✅ $slug 已更新並回讀核對一致\n";
        } else {
            $fail[] = "$slug（回讀不一致）";
        }
    } catch (Throwable $e) {
        $fail[] = "$slug（" . $e->getMessage() . "）";
    }
}

echo "\n── 結果 ────────────────────────────────\n";
echo "  成功： $ok / " . count($diffs) . "\n";
if ($fail) { echo "  ❌ 失敗：\n"; foreach ($fail as $f) echo "     - $f\n"; exit(1); }
echo "  備份檔： $bf\n";
echo "✅ 同步完成。\n";
