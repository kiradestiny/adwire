<?php
/**
 * ADWire Admin Panel — 成功案例列表
 */

require_once __DIR__ . '/includes/auth.php';
Auth::requireLogin();
$authUser = Auth::user();

require_once __DIR__ . '/includes/database.php';
require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/audit-log.php';

$pdo = Database::getInstance();

// 處理 POST 請求
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireCsrf();
    $action = $_POST['action'] ?? '';
    $id = (int) ($_POST['id'] ?? 0);

    // 切換發佈狀態
    if ($action === 'toggle_active' && $id > 0) {
        $titleStmt = $pdo->prepare('SELECT title, is_active FROM portfolio_cases WHERE id = ?');
        $titleStmt->execute([$id]);
        $row = $titleStmt->fetch();

        $stmt = $pdo->prepare('UPDATE portfolio_cases SET is_active = NOT is_active WHERE id = ?');
        $stmt->execute([$id]);

        $newStatus = $row ? ((int)$row['is_active'] ? '隱藏' : '發佈') : '未知';
        AuditLog::record('toggle', 'portfolio_case', $id, $row['title'] ?? '', ['is_active' => [$row['is_active'] ?? null, $newStatus]]);
        setFlash('success', '案例狀態已更新');
        header('Location: ' . ADMIN_URL . '/portfolio.php');
        exit;
    }

    // 刪除案例
    if ($action === 'delete' && $id > 0) {
        $titleStmt = $pdo->prepare('SELECT title FROM portfolio_cases WHERE id = ?');
        $titleStmt->execute([$id]);
        $title = $titleStmt->fetchColumn() ?? '';

        $stmt = $pdo->prepare('DELETE FROM portfolio_cases WHERE id = ?');
        $stmt->execute([$id]);
        AuditLog::record('delete', 'portfolio_case', $id, $title);
        setFlash('success', '案例已刪除');
        header('Location: ' . ADMIN_URL . '/portfolio.php');
        exit;
    }
}

// 篩選
$filterCategory = $_GET['category'] ?? '';
$page = max(1, (int) ($_GET['page'] ?? 1));
$perPage = 15;
$offset = ($page - 1) * $perPage;

$where = [];
$params = [];

if ($filterCategory) {
    $where[] = 'category = ?';
    $params[] = $filterCategory;
}

$whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM portfolio_cases $whereClause");
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();
$totalPages = max(1, (int) ceil($total / $perPage));

$dataStmt = $pdo->prepare(
    "SELECT * FROM portfolio_cases $whereClause 
     ORDER BY sort_order ASC, id ASC 
     LIMIT $perPage OFFSET $offset"
);
$dataStmt->execute($params);
$cases = $dataStmt->fetchAll();

// 取得所有分類
$categories = $pdo->query(
    "SELECT DISTINCT category FROM portfolio_cases ORDER BY category"
)->fetchAll(PDO::FETCH_COLUMN);

$pageTitle = '成功案例管理';
$currentPage = 'portfolio';
include __DIR__ . '/includes/layout-header.php';
?>

<!-- 工具列 -->
<div class="card mb-4">
  <div class="card-body">
    <div class="row align-items-center">
      <div class="col">
        <a href="<?= ADMIN_URL ?>/portfolio-edit.php" class="btn btn-adwire">
          <i class="ti ti-plus me-1"></i>新增案例
        </a>
      </div>
      <div class="col-auto">
        <form method="GET" action="" class="d-flex gap-2">
          <select name="category" class="form-select form-select-sm" style="min-width:140px">
            <option value="">全部分類</option>
            <?php foreach ($categories as $cat): ?>
            <option value="<?= e($cat) ?>" <?= $filterCategory === $cat ? 'selected' : '' ?>><?= e($cat) ?></option>
            <?php endforeach; ?>
          </select>
          <button type="submit" class="btn btn-sm btn-outline-primary">
            <i class="ti ti-search"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</div>

<!-- 案例列表 -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">共 <?= $total ?> 個案例</h3>
  </div>
  <div class="table-responsive">
    <table class="table table-vcenter card-table">
      <thead>
        <tr>
          <th style="width:60px">排序</th>
          <th style="width:80px">狀態</th>
          <th>案例標題</th>
          <th style="width:120px">分類</th>
          <th style="width:100px">行業</th>
          <th style="width:80px">主要數據</th>
          <th style="width:100px">操作</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($cases)): ?>
        <tr>
          <td colspan="7" class="text-center text-muted py-4">暫無案例</td>
        </tr>
        <?php else: ?>
        <?php foreach ($cases as $case): ?>
        <tr>
          <td class="text-muted"><?= $case['sort_order'] ?></td>
          <td>
            <?php if ($case['is_active']): ?>
            <span class="badge bg-success">已發佈</span>
            <?php else: ?>
            <span class="badge bg-secondary">草稿</span>
            <?php endif; ?>
          </td>
          <td>
            <a href="<?= ADMIN_URL ?>/portfolio-edit.php?id=<?= $case['id'] ?>" class="text-reset fw-bold">
              <?= e($case['title']) ?>
            </a>
            <div class="text-muted small"><?= e(truncate($case['short_description'] ?? '', 60)) ?></div>
          </td>
          <td>
            <span class="badge bg-info-lt"><?= e($case['display_category']) ?></span>
          </td>
          <td class="small"><?= e($case['industry']) ?></td>
          <td>
            <strong style="color: var(--adwire-primary)"><?= e($case['stats']) ?></strong>
            <div class="text-muted small"><?= e($case['stat_label']) ?></div>
          </td>
          <td>
            <div class="btn-group btn-group-sm">
              <a href="<?= ADMIN_URL ?>/portfolio-edit.php?id=<?= $case['id'] ?>" class="btn btn-outline-primary" title="編輯">
                <i class="ti ti-edit"></i>
              </a>
              <form method="POST" action="" class="d-inline">
                <input type="hidden" name="action" value="toggle_active">
                <?= csrfField() ?>
                <input type="hidden" name="id" value="<?= $case['id'] ?>">
                <button type="submit" class="btn btn-outline-<?= $case['is_active'] ? 'warning' : 'success' ?>" 
                        title="<?= $case['is_active'] ? '轉為草稿' : '發佈' ?>">
                  <i class="ti ti-<?= $case['is_active'] ? 'eye-off' : 'eye' ?>"></i>
                </button>
              </form>
              <form method="POST" action="" class="d-inline" 
                    onsubmit="return confirm('確定要刪除呢個案例嗎？所有相關資料都會被刪除。')">
                <input type="hidden" name="action" value="delete">
                <?= csrfField() ?>
                <input type="hidden" name="id" value="<?= $case['id'] ?>">
                <button type="submit" class="btn btn-outline-danger" title="刪除">
                  <i class="ti ti-trash"></i>
                </button>
              </form>
            </div>
          </td>
        </tr>
        <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
  
  <?php if ($totalPages > 1): ?>
  <div class="card-footer d-flex align-items-center">
    <p class="m-0 text-muted">第 <?= $page ?> / <?= $totalPages ?> 頁</p>
    <div class="ms-auto">
      <?php $qs = $filterCategory ? '&category=' . urlencode($filterCategory) : ''; ?>
      <?php if ($page > 1): ?>
      <a href="?page=<?= $page - 1 ?><?= $qs ?>" class="btn btn-sm btn-outline-secondary">
        <i class="ti ti-chevron-left"></i>
      </a>
      <?php endif; ?>
      <?php if ($page < $totalPages): ?>
      <a href="?page=<?= $page + 1 ?><?= $qs ?>" class="btn btn-sm btn-outline-secondary">
        <i class="ti ti-chevron-right"></i>
      </a>
      <?php endif; ?>
    </div>
  </div>
  <?php endif; ?>
</div>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>
