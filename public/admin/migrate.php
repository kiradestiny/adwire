<?php
/**
 * ADWire Admin Panel — 數據遷移腳本
 * 
 * 功能：
 *   1. 初始數據匯入（品牌、Blog、Portfolio、管理員帳號）
 *   2. Schema 遷移（版本控制，自動執行未套用的遷移）
 * 
 * 使用方式：在瀏覽器訪問 https://adwire.com.hk/admin/migrate.php
 */

require_once __DIR__ . '/includes/auth.php';
Auth::requireLogin();
$authUser = Auth::user();

require_once __DIR__ . '/includes/database.php';
require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/migrations.php';

$pdo = Database::getInstance();
$results = [];
$hasErrors = false;
$migrationResults = [];

// ── 處理 Schema 遷移 ──────────────────────────────────────────────────
if (isset($_POST['run_schema_migrations'])) {
    requireCsrf();
    $migrationResults = Migrations::runAllPending();
}

// ── 處理初始數據匯入 ──────────────────────────────────────────────────
$brands = [
    // Tier 1: 國際巨頭
    ['name' => '7-Eleven', 'tier' => 1, 'sort_order' => 1],
    ['name' => 'Rakuten', 'tier' => 1, 'sort_order' => 2],
    ['name' => 'The Ritz-Carlton', 'tier' => 1, 'sort_order' => 3],
    ['name' => 'Kirin Ichiban', 'tier' => 1, 'sort_order' => 4],
    ['name' => 'Mister Donut', 'tier' => 1, 'sort_order' => 5],
    ['name' => 'Matsuya', 'tier' => 1, 'sort_order' => 6],
    ['name' => 'Miki House', 'tier' => 1, 'sort_order' => 7],
    // Tier 2: 知名大企
    ['name' => 'Kerry Hotel', 'tier' => 2, 'sort_order' => 1],
    ['name' => 'Hotel ICON', 'tier' => 2, 'sort_order' => 2],
    ['name' => '義務工作發展局（AVS）', 'tier' => 2, 'sort_order' => 3],
    ['name' => 'HKWS', 'tier' => 2, 'sort_order' => 4],
    ['name' => 'Organicmom', 'tier' => 2, 'sort_order' => 5],
    // Tier 3: 成熟本地企業
    ['name' => '隨傳隨借', 'tier' => 3, 'sort_order' => 1],
    ['name' => 'Nuva', 'tier' => 3, 'sort_order' => 2],
    ['name' => 'SurrFACE', 'tier' => 3, 'sort_order' => 3],
    ['name' => 'WISDOM', 'tier' => 3, 'sort_order' => 4],
    ['name' => 'Global32', 'tier' => 3, 'sort_order' => 5],
    ['name' => 'Envirosafe', 'tier' => 3, 'sort_order' => 6],
    // Tier 4: 中小企
    ['name' => 'Skinpro', 'tier' => 4, 'sort_order' => 1],
    ['name' => 'Peko Beauty', 'tier' => 4, 'sort_order' => 2],
    ['name' => 'MEDSKIN PLUS+', 'tier' => 4, 'sort_order' => 3],
    ['name' => 'YOROKOBI Beauty', 'tier' => 4, 'sort_order' => 4],
    ['name' => 'Meta Beauty Lab', 'tier' => 4, 'sort_order' => 5],
    ['name' => 'All About Beaut', 'tier' => 4, 'sort_order' => 6],
    ['name' => 'Wonder Lens', 'tier' => 4, 'sort_order' => 7],
    ['name' => 'Barebooby', 'tier' => 4, 'sort_order' => 8],
    ['name' => '永記渠務工程', 'tier' => 4, 'sort_order' => 9],
    ['name' => 'N Creative', 'tier' => 4, 'sort_order' => 10],
    ['name' => 'effect.', 'tier' => 4, 'sort_order' => 11],
    ['name' => 'Eco Pro', 'tier' => 4, 'sort_order' => 12],
    ['name' => 'H$ Credit', 'tier' => 4, 'sort_order' => 13],
    ['name' => 'Quantum Matrix', 'tier' => 4, 'sort_order' => 14],
    ['name' => 'KM. Fiber', 'tier' => 4, 'sort_order' => 15],
    ['name' => '千葉願', 'tier' => 4, 'sort_order' => 16],
    ['name' => 'Sometimes lab', 'tier' => 4, 'sort_order' => 17],
];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['confirm_migrate'])) {
    requireCsrf();
    try {
        $pdo->beginTransaction();

        // 1. 品牌列表
        $brandCount = 0;
        $stmt = $pdo->prepare('INSERT IGNORE INTO brands (name, tier, sort_order, is_active) VALUES (?, ?, ?, 1)');
        foreach ($brands as $brand) {
            $stmt->execute([$brand['name'], $brand['tier'], $brand['sort_order']]);
            if ($stmt->rowCount() > 0) $brandCount++;
        }
        $results[] = "✅ 品牌列表：已匯入 {$brandCount} 個品牌";

        // 2. Blog 文章（佔位記錄）
        $blogCount = 0;
        $blogStmt = $pdo->prepare(
            'INSERT IGNORE INTO blog_posts (slug, title, excerpt, content, date, category, read_time, image_color, image, is_active, sort_order) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)'
        );
        $blogStmt->execute([
            'ai-solution-hong-kong-enterprise-guide-2026',
            '2026 香港企業 AI 化完全指南（遷移佔位）',
            '請在後台編輯此文章，填入完整內容。',
            '<p>請在後台編輯此文章，填入完整內容。</p>',
            '2026-02-25',
            'AI Technology',
            '9 min read',
            'from-indigo-500 to-purple-600',
            '/blog/ai-solution-hong-kong-enterprise-guide-2026.webp',
            10
        ]);
        if ($blogStmt->rowCount() > 0) $blogCount++;
        $results[] = "⚠️ Blog 文章：已建立 1 條佔位記錄。其餘文章因 HTML 內容過長，請在後台手動新增。";

        // 3. Portfolio 案例
        $results[] = "⚠️ 成功案例：因數據結構複雜（含關聯表），請在後台手動新增。";

        // 4. 建立預設管理員帳號
        $adminExists = $pdo->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();
        if ($adminExists == 0) {
            $adminHash = password_hash('admin123', PASSWORD_BCRYPT, ['cost' => 12]);
            $pdo->prepare('INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)')
                ->execute(['admin', $adminHash, '管理員']);
            $results[] = "✅ 已建立預設管理員帳號：admin / admin123（請立即修改密碼！）";
        } else {
            $results[] = "ℹ️ 管理員帳號已存在，跳過建立";
        }

        $pdo->commit();
        $results[] = "🎉 初始數據遷移完成！";
    } catch (Exception $e) {
        $pdo->rollBack();
        $results[] = "❌ 遷移失敗：" . $e->getMessage();
        $hasErrors = true;
    }
}

// 取得遷移狀態
$availableMigrations = Migrations::getAvailableMigrations();
$appliedMigrations = Migrations::getAppliedMigrations();
$pendingCount = count(array_filter($availableMigrations, fn($m) => !in_array($m['version'], $appliedMigrations)));

$pageTitle = '數據遷移';
$currentPage = 'dashboard';
include __DIR__ . '/includes/layout-header.php';
?>

<!-- Schema 遷移 -->
<div class="card mb-4">
  <div class="card-header">
    <h3 class="card-title">🔄 Schema 遷移（版本控制）</h3>
  </div>
  <div class="card-body">
    <p>自動偵測並執行尚未套用的資料庫 Schema 遷移。每個遷移只會執行一次。</p>

    <?php if (!empty($migrationResults)): ?>
    <div class="alert alert-info mb-3">
      <h5>遷移結果：</h5>
      <ul class="mb-0">
        <?php foreach ($migrationResults as $result): ?>
        <li><?= e($result['message']) ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
    <?php endif; ?>

    <?php if (empty($availableMigrations)): ?>
    <div class="alert alert-secondary">
      ℹ️ 沒有找到任何遷移檔案。遷移檔案應放在 <code>admin/migrations/</code> 目錄下。
    </div>
    <?php else: ?>
    <h5>遷移狀態：</h5>
    <table class="table table-vcenter card-table">
      <thead>
        <tr>
          <th>版本</th>
          <th>描述</th>
          <th>狀態</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($availableMigrations as $migration): ?>
        <tr>
          <td><code><?= e($migration['version']) ?></code></td>
          <td><?= e($migration['name']) ?></td>
          <td>
            <?php if (in_array($migration['version'], $appliedMigrations)): ?>
            <span class="badge bg-success">已套用</span>
            <?php else: ?>
            <span class="badge bg-warning text-dark">待執行</span>
            <?php endif; ?>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>

    <?php if ($pendingCount > 0): ?>
    <form method="POST" action="" onsubmit="return confirm('確定要執行 <?= $pendingCount ?> 個待套用的遷移嗎？')">
      <?= csrfField() ?>
      <button type="submit" name="run_schema_migrations" value="1" class="btn btn-adwire">
        <i class="ti ti-refresh me-1"></i>執行 <?= $pendingCount ?> 個待套用的遷移
      </button>
    </form>
    <?php else: ?>
    <div class="alert alert-success mb-0">
      ✅ 所有遷移均已套用，資料庫 Schema 為最新版本。
    </div>
    <?php endif; ?>
    <?php endif; ?>
  </div>
</div>

<!-- 初始數據遷移 -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">📦 初始數據匯入</h3>
  </div>
  <div class="card-body">
    <div class="alert alert-warning">
      <strong>⚠️ 重要提示：</strong>
      <ul class="mb-0">
        <li>此腳本只需執行<strong>一次</strong>。</li>
        <li>執行前請確保已執行 <code>schema.sql</code> 或上述 Schema 遷移。</li>
        <li>Blog 文章和 Portfolio 案例因內容較長，建議在後台手動新增。</li>
      </ul>
    </div>

    <h4>將會遷移的數據：</h4>
    <ul>
      <li>品牌列表：<?= count($brands) ?> 個品牌</li>
      <li>Blog 文章：1 條佔位記錄（其餘請在後台新增）</li>
      <li>Portfolio 案例：請在後台手動新增</li>
      <li>預設管理員帳號：admin / admin123</li>
    </ul>

    <?php if (!empty($results)): ?>
    <div class="alert alert-<?= $hasErrors ? 'danger' : 'success' ?>">
      <h5>遷移結果：</h5>
      <ul class="mb-0">
        <?php foreach ($results as $result): ?>
        <li><?= e($result) ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
    <?php endif; ?>

    <?php if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['confirm_migrate'])): ?>
    <form method="POST" action="" onsubmit="return confirm('確定要執行初始數據遷移嗎？此操作只需執行一次。')">
      <?= csrfField() ?>
      <button type="submit" name="confirm_migrate" value="1" class="btn btn-adwire btn-lg">
        <i class="ti ti-database-import me-1"></i>執行初始數據遷移
      </button>
    </form>
    <?php endif; ?>
  </div>
</div>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>
