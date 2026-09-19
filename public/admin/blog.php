<?php
/**
 * ADWire Admin Panel — Blog 文章列表
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
    // 伺服器端權限檢查（介面隱藏按鈕唔構成安全邊界）
    Auth::requireCapability('content.edit');
    requireCsrf();
    $action = $_POST['action'] ?? '';
    $id = (int) ($_POST['id'] ?? 0);

    // 切換發佈狀態
    if ($action === 'toggle_active' && $id > 0) {
        // 取得文章標題以記錄
        $titleStmt = $pdo->prepare('SELECT title, is_active FROM blog_posts WHERE id = ?');
        $titleStmt->execute([$id]);
        $row = $titleStmt->fetch();

        $stmt = $pdo->prepare('UPDATE blog_posts SET is_active = NOT is_active WHERE id = ?');
        $stmt->execute([$id]);

        $newStatus = $row ? ((int)$row['is_active'] ? '隱藏' : '發佈') : '未知';
        AuditLog::record('toggle', 'blog_post', $id, $row['title'] ?? '', ['is_active' => [$row['is_active'] ?? null, $newStatus]]);
        setFlash('success', '文章狀態已更新');
        header('Location: ' . ADMIN_URL . '/blog.php');
        exit;
    }

    // 刪除文章
    if ($action === 'delete' && $id > 0) {
        // 取得文章標題以記錄
        $titleStmt = $pdo->prepare('SELECT title FROM blog_posts WHERE id = ?');
        $titleStmt->execute([$id]);
        $title = $titleStmt->fetchColumn() ?? '';

        $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = ?');
        $stmt->execute([$id]);
        AuditLog::record('delete', 'blog_post', $id, $title);
        setFlash('success', '文章已刪除');
        header('Location: ' . ADMIN_URL . '/blog.php');
        exit;
    }

    // 批次操作
    if ($action === 'bulk') {
        $ids  = array_values(array_filter(array_map('intval', (array) ($_POST['ids'] ?? []))));
        $mode = $_POST['mode'] ?? '';
        if (!$ids || !in_array($mode, ['enable', 'disable', 'delete'], true)) {
            setFlash('danger', '請先勾選文章，再揀操作');
            header('Location: ' . ADMIN_URL . '/blog.php');
            exit;
        }
        $ph = implode(',', array_fill(0, count($ids), '?'));
        if ($mode === 'delete') {
            $pdo->prepare("DELETE FROM blog_posts WHERE id IN ($ph)")->execute($ids);
            AuditLog::record('bulk_delete', 'blog_post', 0, implode(',', $ids));
            $msg = '已刪除 ' . count($ids) . ' 篇文章';
        } else {
            $v = $mode === 'enable' ? 1 : 0;
            $pdo->prepare("UPDATE blog_posts SET is_active = ? WHERE id IN ($ph)")
                ->execute(array_merge([$v], $ids));
            AuditLog::record('bulk_' . $mode, 'blog_post', 0, implode(',', $ids));
            $msg = ($mode === 'enable' ? '已發佈 ' : '已轉為草稿 ') . count($ids) . ' 篇文章';
        }
        setFlash('success', $msg);
        header('Location: ' . ADMIN_URL . '/blog.php');
        exit;
    }
}

// 篩選
$filterCategory = $_GET['category'] ?? '';
$filterSearch = trim($_GET['search'] ?? '');
$filterActive = (string) ($_GET['active'] ?? '');
$page = max(1, (int) ($_GET['page'] ?? 1));
$perPage = 15;
$offset = ($page - 1) * $perPage;

$where = [];
$params = [];

if ($filterCategory) {
    $where[] = 'category = ?';
    $params[] = $filterCategory;
}
if ($filterSearch) {
    $where[] = '(title LIKE ? OR excerpt LIKE ?)';
    $searchTerm = '%' . $filterSearch . '%';
    $params[] = $searchTerm;
    $params[] = $searchTerm;
}

if ($filterActive !== '') {
    $where[] = 'is_active = ?';
    $params[] = (int) $filterActive;
}

$hasFilter = ($filterCategory !== '' || $filterSearch !== '' || $filterActive !== '');

$whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM blog_posts $whereClause");
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();
$totalPages = max(1, (int) ceil($total / $perPage));

$dataStmt = $pdo->prepare(
    "SELECT bp.*, 
     (SELECT GROUP_CONCAT(bt.tag SEPARATOR ', ') FROM blog_tags bt WHERE bt.post_id = bp.id) AS tags_list
     FROM blog_posts bp 
     $whereClause 
     ORDER BY bp.date DESC, bp.sort_order ASC 
     LIMIT $perPage OFFSET $offset"
);
$dataStmt->execute($params);
$posts = $dataStmt->fetchAll();

// 取得所有分類
$categories = $pdo->query(
    "SELECT DISTINCT category FROM blog_posts ORDER BY category"
)->fetchAll(PDO::FETCH_COLUMN);

$pageTitle = 'Blog 文章管理';
$currentPage = 'blog';
$bodyClass = 'content-page';
include __DIR__ . '/includes/layout-header.php';
?>

<!-- 工具列 -->
<div class="card mb-4">
  <div class="card-body">
    <div class="row align-items-center">
      <div class="col">
        <a href="<?= ADMIN_URL ?>/blog-edit.php" class="btn btn-adwire">
          <i class="ti ti-plus me-1"></i>新增文章
        </a>
      </div>
      <div class="col-auto">
        <form method="GET" action="" class="row g-2 align-items-end">
          <div class="col-auto">
            <select name="category" class="form-select form-select-sm" style="min-width:140px">
              <option value="">全部分類</option>
              <?php foreach ($categories as $cat): ?>
              <option value="<?= e($cat) ?>" <?= $filterCategory === $cat ? 'selected' : '' ?>><?= e($cat) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="col">
            <input type="text" name="search" class="form-control form-control-sm" 
                   placeholder="搜尋標題..." value="<?= e($filterSearch) ?>">
          </div>
          <div class="col-auto">
            <select name="active" class="form-select form-select-sm" style="min-width:110px">
              <option value="">全部狀態</option>
              <option value="1" <?= $filterActive === '1' ? 'selected' : '' ?>>已發佈</option>
              <option value="0" <?= $filterActive === '0' ? 'selected' : '' ?>>草稿</option>
            </select>
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-sm btn-outline-primary">
              <i class="ti ti-search"></i>
            </button>
          </div>
          <?php if ($hasFilter): ?>
          <div class="col-auto">
            <a href="<?= ADMIN_URL ?>/blog.php" class="btn btn-sm btn-outline-secondary">清除</a>
          </div>
          <?php endif; ?>
        </form>
      </div>
    </div>
  </div>
</div>

<!-- 批次操作：獨立表單，行內 checkbox 用 HTML5 form= 屬性連過來 -->
<div class="card mb-3">
  <div class="card-body py-3">
    <form id="bulk-form" method="POST" action="" class="d-flex flex-wrap gap-2 align-items-center">
      <input type="hidden" name="action" value="bulk">
      <?= csrfField() ?>
      <span class="small text-secondary me-2"><i class="ti ti-checklist me-1"></i>批次操作（先勾選文章）</span>
      <button type="submit" name="mode" value="enable" class="btn btn-sm btn-outline-success">
        <i class="ti ti-eye me-1"></i>發佈
      </button>
      <button type="submit" name="mode" value="disable" class="btn btn-sm btn-outline-warning">
        <i class="ti ti-eye-off me-1"></i>轉草稿
      </button>
      <button type="submit" name="mode" value="delete" class="btn btn-sm btn-outline-danger"
              onclick="return confirm('確定刪除已勾選嘅文章？此動作無法復原。');">
        <i class="ti ti-trash me-1"></i>刪除
      </button>
    </form>
  </div>
</div>

<!-- 文章列表 -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">共 <?= $total ?> 篇文章</h3>
  </div>
  <div class="table-responsive">
    <table class="table table-vcenter card-table">
      <thead>
        <tr>
          <th style="width:80px">狀態</th>
          <th>標題</th>
          <th style="width:120px">分類</th>
          <th style="width:100px">日期</th>
          <th style="width:80px">標籤</th>
          <th style="width:100px">操作</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($posts)): ?>
        <tr>
          <td colspan="6" class="text-center py-4">
            <?php if ($hasFilter): ?>
              <i class="ti ti-search-off" style="font-size:1.8rem;color:#9aa9bd"></i>
              <div class="text-secondary mt-2">冇符合條件嘅文章。</div>
              <a href="<?= ADMIN_URL ?>/blog.php" class="btn btn-sm btn-outline-secondary mt-2">清除篩選</a>
            <?php else: ?>
              <i class="ti ti-article" style="font-size:1.8rem;color:#9aa9bd"></i>
              <div class="text-secondary mt-2">尚未新增任何文章。</div>
            <?php endif; ?>
          </td>
        </tr>
        <?php else: ?>
        <?php foreach ($posts as $post): ?>
        <tr>
          <td>
            <input type="checkbox" name="ids[]" value="<?= $post['id'] ?>" form="bulk-form"
                   class="form-check-input bulk-check" title="選取此文章">
            <?php if ($post['is_active']): ?>
            <span class="badge bg-success">已發佈</span>
            <?php else: ?>
            <span class="badge bg-secondary">草稿</span>
            <?php endif; ?>
          </td>
          <td>
            <a href="<?= ADMIN_URL ?>/blog-edit.php?id=<?= $post['id'] ?>" class="text-reset fw-bold">
              <?= e(truncate($post['title'], 60)) ?>
            </a>
            <?php if ($post['image']): ?>
            <i class="ti ti-photo text-muted ms-1" title="有圖片"></i>
            <?php endif; ?>
          </td>
          <td>
            <span class="badge bg-info-lt"><?= e($post['category']) ?></span>
          </td>
          <td class="small text-muted"><?= $post['date'] ?></td>
          <td class="small text-muted"><?= e(truncate($post['tags_list'] ?? '', 30)) ?></td>
          <td>
            <div class="btn-group btn-group-sm">
              <a href="<?= ADMIN_URL ?>/blog-edit.php?id=<?= $post['id'] ?>" class="btn btn-outline-primary" title="編輯">
                <i class="ti ti-edit"></i>
              </a>
              <form method="POST" action="" class="d-inline">
                <input type="hidden" name="action" value="toggle_active">
                <?= csrfField() ?>
                <input type="hidden" name="id" value="<?= $post['id'] ?>">
                <button type="submit" class="btn btn-outline-<?= $post['is_active'] ? 'warning' : 'success' ?>" 
                        title="<?= $post['is_active'] ? '轉為草稿' : '發佈' ?>">
                  <i class="ti ti-<?= $post['is_active'] ? 'eye-off' : 'eye' ?>"></i>
                </button>
              </form>
              <form method="POST" action="" class="d-inline" 
                    onsubmit="return confirm('確定要刪除呢篇文章嗎？此操作不可撤銷。')">
                <input type="hidden" name="action" value="delete">
                <?= csrfField() ?>
                <input type="hidden" name="id" value="<?= $post['id'] ?>">
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
      <?php
        $queryParams = array_filter(['category' => $filterCategory, 'search' => $filterSearch]);
        $queryString = !empty($queryParams) ? '&' . http_build_query($queryParams) : '';
      ?>
      <?php if ($page > 1): ?>
      <a href="?page=<?= $page - 1 ?><?= $queryString ?>" class="btn btn-sm btn-outline-secondary">
        <i class="ti ti-chevron-left"></i>
      </a>
      <?php endif; ?>
      <?php if ($page < $totalPages): ?>
      <a href="?page=<?= $page + 1 ?><?= $queryString ?>" class="btn btn-sm btn-outline-secondary">
        <i class="ti ti-chevron-right"></i>
      </a>
      <?php endif; ?>
    </div>
  </div>
  <?php endif; ?>
</div>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>
