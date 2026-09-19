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
    // 伺服器端權限檢查（介面隱藏按鈕唔構成安全邊界）
    Auth::requireCapability('content.edit');
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

    // 拖拉排序（頁面內）
    if ($action === 'reorder') {
        $orders = json_decode($_POST['orders'] ?? '[]', true);
        if (!is_array($orders)) {
            jsonResponse(['success' => false, 'message' => '格式錯誤'], 400);
        }
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare('UPDATE portfolio_cases SET sort_order = ? WHERE id = ?');
            foreach ($orders as $o) {
                $oid = (int) ($o['id'] ?? 0);
                if ($oid > 0) {
                    $stmt->execute([(int) ($o['sort_order'] ?? 0), $oid]);
                }
            }
            $pdo->commit();
        } catch (Throwable $ex) {
            $pdo->rollBack();
            jsonResponse(['success' => false, 'message' => '儲存失敗'], 500);
        }
        jsonResponse(['success' => true]);
    }

    // 批次操作
    if ($action === 'bulk') {
        $ids  = array_values(array_filter(array_map('intval', (array) ($_POST['ids'] ?? []))));
        $mode = $_POST['mode'] ?? '';
        if (!$ids || !in_array($mode, ['enable', 'disable', 'delete'], true)) {
            setFlash('danger', '請先勾選案例，再揀操作');
            header('Location: ' . ADMIN_URL . '/portfolio.php');
            exit;
        }
        $ph = implode(',', array_fill(0, count($ids), '?'));
        if ($mode === 'delete') {
            $pdo->prepare("DELETE FROM portfolio_cases WHERE id IN ($ph)")->execute($ids);
            AuditLog::record('bulk_delete', 'portfolio_case', 0, implode(',', $ids));
            $msg = '已刪除 ' . count($ids) . ' 個案例';
        } else {
            $v = $mode === 'enable' ? 1 : 0;
            $pdo->prepare("UPDATE portfolio_cases SET is_active = ? WHERE id IN ($ph)")
                ->execute(array_merge([$v], $ids));
            AuditLog::record('bulk_' . $mode, 'portfolio_case', 0, implode(',', $ids));
            $msg = ($mode === 'enable' ? '已發佈 ' : '已轉為草稿 ') . count($ids) . ' 個案例';
        }
        setFlash('success', $msg);
        header('Location: ' . ADMIN_URL . '/portfolio.php');
        exit;
    }
}

// 篩選
$filterCategory = $_GET['category'] ?? '';
$filterSearch   = trim((string) ($_GET['search'] ?? ''));
$filterActive   = (string) ($_GET['active'] ?? '');
$page = max(1, (int) ($_GET['page'] ?? 1));
$perPage = 15;
$offset = ($page - 1) * $perPage;

$where = [];
$params = [];

if ($filterCategory) {
    $where[] = 'category = ?';
    $params[] = $filterCategory;
}

if ($filterSearch !== '') {
    $where[] = '(title LIKE ? OR short_description LIKE ? OR industry LIKE ?)';
    $like = '%' . $filterSearch . '%';
    array_push($params, $like, $like, $like);
}

if ($filterActive !== '') {
    $where[] = 'is_active = ?';
    $params[] = (int) $filterActive;
}

$hasFilter = ($filterCategory !== '' || $filterSearch !== '' || $filterActive !== '');

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
$bodyClass = 'content-page';
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
          <input type="text" name="search" class="form-control form-control-sm"
                 style="min-width:170px" placeholder="搜尋標題／行業…"
                 value="<?= e($filterSearch) ?>">
          <select name="category" class="form-select form-select-sm" style="min-width:140px">
            <option value="">全部分類</option>
            <?php foreach ($categories as $cat): ?>
            <option value="<?= e($cat) ?>" <?= $filterCategory === $cat ? 'selected' : '' ?>><?= e($cat) ?></option>
            <?php endforeach; ?>
          </select>
          <select name="active" class="form-select form-select-sm" style="min-width:110px">
            <option value="">全部狀態</option>
            <option value="1" <?= $filterActive === '1' ? 'selected' : '' ?>>已發佈</option>
            <option value="0" <?= $filterActive === '0' ? 'selected' : '' ?>>草稿</option>
          </select>
          <button type="submit" class="btn btn-sm btn-outline-primary">
            <i class="ti ti-search"></i>
          </button>
          <?php if ($hasFilter): ?>
          <a href="<?= ADMIN_URL ?>/portfolio.php" class="btn btn-sm btn-outline-secondary">清除</a>
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
      <span class="small text-secondary me-2"><i class="ti ti-checklist me-1"></i>批次操作（先勾選案例）</span>
      <button type="submit" name="mode" value="enable" class="btn btn-sm btn-outline-success">
        <i class="ti ti-eye me-1"></i>發佈
      </button>
      <button type="submit" name="mode" value="disable" class="btn btn-sm btn-outline-warning">
        <i class="ti ti-eye-off me-1"></i>轉草稿
      </button>
      <button type="submit" name="mode" value="delete" class="btn btn-sm btn-outline-danger"
              onclick="return confirm('確定刪除已勾選嘅案例？此動作無法復原。');">
        <i class="ti ti-trash me-1"></i>刪除
      </button>
    </form>
  </div>
</div>

<!-- 案例列表 -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">共 <?= $total ?> 個案例<?= $hasFilter ? '（已篩選）' : '' ?>
      <span id="sort-status" class="badge bg-secondary-lt ms-2 small">
        <?= $hasFilter ? '篩選中唔可以拖拉排序' : '拖拉 ⠿ 可調整次序' ?>
      </span>
    </h3>
  </div>
  <div class="table-responsive">
    <table class="table table-vcenter card-table">
      <thead>
        <tr>
          <th style="width:150px">排序 / 選取</th>
          <th style="width:80px">狀態</th>
          <th>案例標題</th>
          <th style="width:120px">分類</th>
          <th style="width:100px">行業</th>
          <th style="width:80px">主要數據</th>
          <th style="width:100px">操作</th>
        </tr>
      </thead>
      <tbody data-reorder="1" data-offset="<?= $offset ?>">
        <?php if (empty($cases)): ?>
        <tr>
          <td colspan="7" class="text-center py-4">
            <?php if ($hasFilter): ?>
              <i class="ti ti-search-off" style="font-size:1.8rem;color:#9aa9bd"></i>
              <div class="text-secondary mt-2">冇符合條件嘅案例。</div>
              <a href="<?= ADMIN_URL ?>/portfolio.php" class="btn btn-sm btn-outline-secondary mt-2">清除篩選</a>
            <?php else: ?>
              <i class="ti ti-briefcase" style="font-size:1.8rem;color:#9aa9bd"></i>
              <div class="text-secondary mt-2">尚未新增任何成功案例。</div>
            <?php endif; ?>
          </td>
        </tr>
        <?php else: ?>
        <?php foreach ($cases as $case): ?>
        <tr data-id="<?= $case['id'] ?>">
          <td class="text-muted">
            <span class="drag-handle" title="<?= $hasFilter ? '篩選中唔可以拖拉排序' : '拖拉調整次序' ?>">⠿</span>
            <input type="checkbox" name="ids[]" value="<?= $case['id'] ?>" form="bulk-form"
                   class="form-check-input bulk-check" title="選取此案例">
            <?= $case['sort_order'] ?>
          </td>
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

<?php if (!$hasFilter && !empty($cases)): ?>
<script>
/* 拖拉排序：頁面內調整次序，放手即儲存（sort_order = 頁面 offset + 位置）。
   送出用 fetch + FormData，layout-footer.php 會自動加 X-CSRF-Token。 */
(function () {
  var tb = document.querySelector('tbody[data-reorder]');
  if (!tb) return;
  var status = document.getElementById('sort-status');
  var offset = parseInt(tb.dataset.offset || '0', 10);
  var dragRow = null, saving = false;

  Array.prototype.forEach.call(tb.querySelectorAll('tr[data-id]'), function (tr) {
    tr.setAttribute('draggable', 'true');
    tr.addEventListener('dragstart', function (e) {
      dragRow = tr; tr.classList.add('adw-dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', tr.dataset.id); } catch (_) {}
    });
    tr.addEventListener('dragend', function () {
      tr.classList.remove('adw-dragging'); dragRow = null;
      setTimeout(save, 30);
    });
    tr.addEventListener('dragover', function (e) {
      if (!dragRow || dragRow === tr) return;
      e.preventDefault();
      var rows = Array.prototype.slice.call(tb.querySelectorAll('tr[data-id]'));
      var after = null;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i] === dragRow) continue;
        var rb = rows[i].getBoundingClientRect();
        if (e.clientY < rb.top + rb.height / 2) { after = rows[i]; break; }
      }
      if (after) tb.insertBefore(dragRow, after); else tb.appendChild(dragRow);
    });
  });
  tb.addEventListener('drop', function (e) { e.preventDefault(); });

  function save() {
    if (saving) return;
    var rows = Array.prototype.slice.call(tb.querySelectorAll('tr[data-id]'));
    if (!rows.length) return;
    saving = true;
    if (status) { status.textContent = '儲存中…'; status.className = 'badge bg-info-lt ms-2 small'; }
    var fd = new FormData();
    fd.append('action', 'reorder');
    fd.append('orders', JSON.stringify(rows.map(function (r, i) {
      return { id: Number(r.dataset.id), sort_order: offset + i };
    })));
    fetch(location.pathname, { method: 'POST', body: fd })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        var ok = res && res.success;
        if (status) {
          status.textContent = ok ? '✅ 排序已儲存' : '⚠️ 儲存失敗，請重新載入再試';
          status.className = 'badge ms-2 small ' + (ok ? 'bg-success' : 'bg-danger');
        }
        saving = false;
        if (ok) setTimeout(function () { location.reload(); }, 600);
      })
      .catch(function () {
        if (status) { status.textContent = '⚠️ 儲存失敗'; status.className = 'badge bg-danger ms-2 small'; }
        saving = false;
      });
  }
})();
</script>
<?php endif; ?>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>
