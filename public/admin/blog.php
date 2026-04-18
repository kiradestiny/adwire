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
}

// 篩選
$filterCategory = $_GET['category'] ?? '';
$filterSearch = trim($_GET['search'] ?? '');
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
            <button type="submit" class="btn btn-sm btn-outline-primary">
              <i class="ti ti-search"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
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
          <td colspan="6" class="text-center text-muted py-4">暫無文章</td>
        </tr>
        <?php else: ?>
        <?php foreach ($posts as $post): ?>
        <tr>
          <td>
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
                <input type="hidden" name="id" value="<?= $post['id'] ?>">
                <button type="submit" class="btn btn-outline-<?= $post['is_active'] ? 'warning' : 'success' ?>" 
                        title="<?= $post['is_active'] ? '轉為草稿' : '發佈' ?>">
                  <i class="ti ti-<?= $post['is_active'] ? 'eye-off' : 'eye' ?>"></i>
                </button>
              </form>
              <form method="POST" action="" class="d-inline" 
                    onsubmit="return confirm('確定要刪除呢篇文章嗎？此操作不可撤銷。')">
                <input type="hidden" name="action" value="delete">
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
