<?php
/**
 * ADWire Admin Panel — Enquiry 紀錄管理
 */

require_once __DIR__ . '/includes/auth.php';
Auth::requireLogin();
$authUser = Auth::user();

require_once __DIR__ . '/includes/database.php';
require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/audit-log.php';

$pdo = Database::getInstance();

// 處理狀態更新
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    requireCsrf();
    $action = $_POST['action'];
    $id = (int) ($_POST['id'] ?? 0);

    if ($action === 'update_status' && $id > 0) {
        $newStatus = $_POST['status'] ?? '';
        $adminNotes = trim($_POST['admin_notes'] ?? '');
        
        if (in_array($newStatus, ['new', 'read', 'replied', 'closed'], true)) {
            // 取得舊狀態以記錄變更
            $oldStmt = $pdo->prepare('SELECT status, name FROM enquiries WHERE id = ?');
            $oldStmt->execute([$id]);
            $old = $oldStmt->fetch();

            $stmt = $pdo->prepare('UPDATE enquiries SET status = ?, admin_notes = ? WHERE id = ?');
            $stmt->execute([$newStatus, $adminNotes, $id]);

            AuditLog::record('update', 'enquiry', $id, $old['name'] ?? "Enquiry #{$id}", [
                'status' => [$old['status'] ?? null, $newStatus],
            ]);
            setFlash('success', 'Enquiry 狀態已更新');
        }
        header('Location: ' . ADMIN_URL . '/enquiries.php');
        exit;
    }

    if ($action === 'delete' && $id > 0) {
        // 取得名稱以記錄
        $nameStmt = $pdo->prepare('SELECT name FROM enquiries WHERE id = ?');
        $nameStmt->execute([$id]);
        $enquiryName = $nameStmt->fetchColumn() ?? '';

        $stmt = $pdo->prepare('DELETE FROM enquiries WHERE id = ?');
        $stmt->execute([$id]);
        AuditLog::record('delete', 'enquiry', $id, $enquiryName);
        setFlash('success', 'Enquiry 已刪除');
        header('Location: ' . ADMIN_URL . '/enquiries.php');
        exit;
    }
}

// 篩選參數
$filterStatus = $_GET['status'] ?? '';
$filterSearch = trim($_GET['search'] ?? '');
$page = max(1, (int) ($_GET['page'] ?? 1));
$perPage = 20;
$offset = ($page - 1) * $perPage;

// 構建查詢
$where = [];
$params = [];

if ($filterStatus && in_array($filterStatus, ['new', 'read', 'replied', 'closed'], true)) {
    $where[] = 'status = ?';
    $params[] = $filterStatus;
}

if ($filterSearch) {
    $where[] = '(name LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ? OR message LIKE ?)';
    $searchTerm = '%' . $filterSearch . '%';
    $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm]);
}

$whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

// 總數
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM enquiries $whereClause");
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();
$totalPages = max(1, (int) ceil($total / $perPage));

// 數據
$dataStmt = $pdo->prepare(
    "SELECT * FROM enquiries $whereClause 
     ORDER BY created_at DESC 
     LIMIT $perPage OFFSET $offset"
);
$dataStmt->execute($params);
$enquiries = $dataStmt->fetchAll();

// 各狀態計數
$statusCounts = [
    'new'     => (int) $pdo->query("SELECT COUNT(*) FROM enquiries WHERE status = 'new'")->fetchColumn(),
    'read'    => (int) $pdo->query("SELECT COUNT(*) FROM enquiries WHERE status = 'read'")->fetchColumn(),
    'replied' => (int) $pdo->query("SELECT COUNT(*) FROM enquiries WHERE status = 'replied'")->fetchColumn(),
    'closed'  => (int) $pdo->query("SELECT COUNT(*) FROM enquiries WHERE status = 'closed'")->fetchColumn(),
];

$pageTitle = 'Enquiry 紀錄';
$currentPage = 'enquiries';
include __DIR__ . '/includes/layout-header.php';
?>

<!-- 篩選欄 -->
<div class="card mb-4">
  <div class="card-body">
    <form method="GET" action="" class="row g-2 align-items-end">
      <div class="col-auto">
        <label class="form-label">狀態</label>
        <select name="status" class="form-select form-select-sm" style="min-width:120px">
          <option value="">全部</option>
          <option value="new" <?= $filterStatus === 'new' ? 'selected' : '' ?>>新查詢 (<?= $statusCounts['new'] ?>)</option>
          <option value="read" <?= $filterStatus === 'read' ? 'selected' : '' ?>>已閱讀 (<?= $statusCounts['read'] ?>)</option>
          <option value="replied" <?= $filterStatus === 'replied' ? 'selected' : '' ?>>已回覆 (<?= $statusCounts['replied'] ?>)</option>
          <option value="closed" <?= $filterStatus === 'closed' ? 'selected' : '' ?>>已關閉 (<?= $statusCounts['closed'] ?>)</option>
        </select>
      </div>
      <div class="col">
        <label class="form-label">搜尋</label>
        <input type="text" name="search" class="form-control form-control-sm" 
               placeholder="姓名、電郵、電話、服務..." value="<?= e($filterSearch) ?>">
      </div>
      <div class="col-auto">
        <button type="submit" class="btn btn-sm btn-adwire">
          <i class="ti ti-search me-1"></i>搜尋
        </button>
        <a href="<?= ADMIN_URL ?>/enquiries.php" class="btn btn-sm btn-outline-secondary">重設</a>
      </div>
    </form>
  </div>
</div>

<!-- Enquiry 列表 -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">共 <?= $total ?> 條記錄</h3>
  </div>
  <div class="table-responsive">
    <table class="table table-vcenter card-table">
      <thead>
        <tr>
          <th>狀態</th>
          <th>姓名</th>
          <th>聯絡方式</th>
          <th>服務</th>
          <th>訊息摘要</th>
          <th>時間</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($enquiries)): ?>
        <tr>
          <td colspan="7" class="text-center text-muted py-4">暫無記錄</td>
        </tr>
        <?php else: ?>
        <?php foreach ($enquiries as $eq): ?>
        <tr>
          <td>
            <span class="badge badge-<?= $eq['status'] ?>"><?= $eq['status'] ?></span>
          </td>
          <td>
            <strong><?= e($eq['name']) ?></strong>
          </td>
          <td>
            <div><?= e($eq['email']) ?></div>
            <?php if ($eq['phone']): ?>
            <div class="text-muted small"><?= e($eq['phone']) ?></div>
            <?php endif; ?>
          </td>
          <td><?= e($eq['service']) ?></td>
          <td class="text-muted"><?= e(truncate($eq['message'] ?? '', 50)) ?></td>
          <td class="small text-muted"><?= formatDate($eq['created_at'], 'Y-m-d H:i') ?></td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" 
                    data-bs-target="#enquiryModal" 
                    data-id="<?= $eq['id'] ?>"
                    data-name="<?= e($eq['name']) ?>"
                    data-email="<?= e($eq['email']) ?>"
                    data-phone="<?= e($eq['phone']) ?>"
                    data-service="<?= e($eq['service']) ?>"
                    data-message="<?= e($eq['message'] ?? '') ?>"
                    data-status="<?= $eq['status'] ?>"
                    data-notes="<?= e($eq['admin_notes'] ?? '') ?>"
                    data-ip="<?= e($eq['ip_address']) ?>"
                    data-time="<?= formatDate($eq['created_at'], 'Y-m-d H:i:s') ?>">
              <i class="ti ti-eye"></i>
            </button>
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
        $queryParams = array_filter(['status' => $filterStatus, 'search' => $filterSearch]);
        $queryString = !empty($queryParams) ? '&' . http_build_query($queryParams) : '';
      ?>
      <?php if ($page > 1): ?>
      <a href="?page=<?= $page - 1 ?><?= $queryString ?>" class="btn btn-sm btn-outline-secondary">
        <i class="ti ti-chevron-left"></i> 上一頁
      </a>
      <?php endif; ?>
      <?php if ($page < $totalPages): ?>
      <a href="?page=<?= $page + 1 ?><?= $queryString ?>" class="btn btn-sm btn-outline-secondary">
        下一頁 <i class="ti ti-chevron-right"></i>
      </a>
      <?php endif; ?>
    </div>
  </div>
  <?php endif; ?>
</div>

<!-- Enquiry 詳情 Modal -->
<div class="modal modal-blur fade" id="enquiryModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <form method="POST" action="">
        <input type="hidden" name="action" value="update_status">
        <input type="hidden" name="id" id="modal-id">
        
        <div class="modal-header">
          <h5 class="modal-title">Enquiry 詳情</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">姓名</label>
              <div class="form-control-plaintext" id="modal-name"></div>
            </div>
            <div class="col-md-6">
              <label class="form-label">服務</label>
              <div class="form-control-plaintext" id="modal-service"></div>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">電郵</label>
              <div class="form-control-plaintext"><a id="modal-email-link"></a></div>
            </div>
            <div class="col-md-6">
              <label class="form-label">電話</label>
              <div class="form-control-plaintext" id="modal-phone"></div>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">訊息</label>
            <div class="form-control-plaintext" id="modal-message" style="white-space:pre-wrap"></div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">IP 地址</label>
              <div class="form-control-plaintext" id="modal-ip"></div>
            </div>
            <div class="col-md-6">
              <label class="form-label">提交時間</label>
              <div class="form-control-plaintext" id="modal-time"></div>
            </div>
          </div>
          <hr>
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">狀態</label>
              <select name="status" class="form-select">
                <option value="new">新查詢</option>
                <option value="read">已閱讀</option>
                <option value="replied">已回覆</option>
                <option value="closed">已關閉</option>
              </select>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">後台備註</label>
            <textarea name="admin_notes" class="form-control" rows="3" placeholder="內部備註，客戶不會看到..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">關閉</button>
          <button type="submit" class="btn btn-adwire">儲存狀態</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
document.getElementById('enquiryModal').addEventListener('show.bs.modal', function (event) {
  const btn = event.relatedTarget;
  document.getElementById('modal-id').value = btn.dataset.id;
  document.getElementById('modal-name').textContent = btn.dataset.name;
  document.getElementById('modal-service').textContent = btn.dataset.service;
  document.getElementById('modal-email-link').textContent = btn.dataset.email;
  document.getElementById('modal-email-link').href = 'mailto:' + btn.dataset.email;
  document.getElementById('modal-phone').textContent = btn.dataset.phone || '-';
  document.getElementById('modal-message').textContent = btn.dataset.message || '(無訊息)';
  document.getElementById('modal-ip').textContent = btn.dataset.ip;
  document.getElementById('modal-time').textContent = btn.dataset.time;
  
  // 設定狀態下拉
  const statusSelect = this.querySelector('select[name="status"]');
  statusSelect.value = btn.dataset.status;
  
  // 設定備註
  const notesField = this.querySelector('textarea[name="admin_notes"]');
  notesField.value = btn.dataset.notes || '';
});
</script>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>
