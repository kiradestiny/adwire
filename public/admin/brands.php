<?php
/**
 * ADWire Admin Panel — 品牌列表管理
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

    // 新增品牌
    if ($action === 'add') {
        $name = trim($_POST['name'] ?? '');
        $tier = (int) ($_POST['tier'] ?? 3);
        $sortOrder = (int) ($_POST['sort_order'] ?? 0);
        $isActive = isset($_POST['is_active']) ? 1 : 0;

        if (empty($name)) {
            setFlash('error', '品牌名稱不能為空');
        } else {
            $stmt = $pdo->prepare('INSERT INTO brands (name, tier, sort_order, is_active) VALUES (?, ?, ?, ?)');
            $stmt->execute([$name, max(1, min(4, $tier)), $sortOrder, $isActive]);
            $newId = (int) $pdo->lastInsertId();
            AuditLog::record('create', 'brand', $newId, $name);
            setFlash('success', "品牌「{$name}」已新增");
        }
        header('Location: ' . ADMIN_URL . '/brands.php');
        exit;
    }

    // 更新品牌
    if ($action === 'update') {
        $id = (int) ($_POST['id'] ?? 0);
        $name = trim($_POST['name'] ?? '');
        $tier = (int) ($_POST['tier'] ?? 3);
        $sortOrder = (int) ($_POST['sort_order'] ?? 0);
        $isActive = isset($_POST['is_active']) ? 1 : 0;

        if ($id > 0 && !empty($name)) {
            // 取得舊值以記錄變更
            $oldStmt = $pdo->prepare('SELECT name, tier, sort_order, is_active FROM brands WHERE id = ?');
            $oldStmt->execute([$id]);
            $old = $oldStmt->fetch();

            $stmt = $pdo->prepare('UPDATE brands SET name = ?, tier = ?, sort_order = ?, is_active = ? WHERE id = ?');
            $stmt->execute([$name, max(1, min(4, $tier)), $sortOrder, $isActive, $id]);

            // 記錄變更摘要
            $changes = [];
            if ($old) {
                if ($old['name'] !== $name) $changes['name'] = [$old['name'], $name];
                if ((int)$old['tier'] !== max(1, min(4, $tier))) $changes['tier'] = [$old['tier'], $tier];
                if ((int)$old['sort_order'] !== $sortOrder) $changes['sort_order'] = [$old['sort_order'], $sortOrder];
                if ((int)$old['is_active'] !== $isActive) $changes['is_active'] = [$old['is_active'], $isActive];
            }
            AuditLog::record('update', 'brand', $id, $name, $changes);
            setFlash('success', "品牌「{$name}」已更新");
        }
        header('Location: ' . ADMIN_URL . '/brands.php');
        exit;
    }

    // 刪除品牌
    if ($action === 'delete') {
        $id = (int) ($_POST['id'] ?? 0);
        if ($id > 0) {
            // 取得名稱以記錄
            $nameStmt = $pdo->prepare('SELECT name FROM brands WHERE id = ?');
            $nameStmt->execute([$id]);
            $brandName = $nameStmt->fetchColumn() ?? '';

            $stmt = $pdo->prepare('DELETE FROM brands WHERE id = ?');
            $stmt->execute([$id]);
            AuditLog::record('delete', 'brand', $id, $brandName);
            setFlash('success', '品牌已刪除');
        }
        header('Location: ' . ADMIN_URL . '/brands.php');
        exit;
    }

    // 批量排序更新
    if ($action === 'reorder') {
        $orders = json_decode($_POST['orders'] ?? '[]', true);
        if (is_array($orders)) {
            $stmt = $pdo->prepare('UPDATE brands SET sort_order = ? WHERE id = ?');
            foreach ($orders as $item) {
                $stmt->execute([(int) $item['sort_order'], (int) $item['id']]);
            }
            AuditLog::record('reorder', 'brand', null, '批量排序更新');
            jsonResponse(['success' => true]);
        }
        jsonResponse(['success' => false], 400);
    }

    // 批次操作（啟用／停用／刪除）
    if ($action === 'bulk') {
        $ids  = array_values(array_filter(array_map('intval', (array) ($_POST['ids'] ?? []))));
        $mode = (string) ($_POST['mode'] ?? '');
        if (empty($ids)) {
            setFlash('error', '請先勾選要處理嘅品牌');
        } elseif ($mode === 'enable' || $mode === 'disable') {
            $in = implode(',', array_fill(0, count($ids), '?'));
            $pdo->prepare("UPDATE brands SET is_active = ? WHERE id IN ($in)")
                ->execute(array_merge([$mode === 'enable' ? 1 : 0], $ids));
            AuditLog::record('update', 'brand', null, '批次' . ($mode === 'enable' ? '啟用' : '停用'),
                ['count' => count($ids), 'ids' => $ids]);
            setFlash('success', '已' . ($mode === 'enable' ? '啟用' : '停用') . ' ' . count($ids) . ' 個品牌');
        } elseif ($mode === 'delete') {
            $in = implode(',', array_fill(0, count($ids), '?'));
            $pdo->prepare("DELETE FROM brands WHERE id IN ($in)")->execute($ids);
            AuditLog::record('delete', 'brand', null, '批次刪除', ['count' => count($ids), 'ids' => $ids]);
            setFlash('success', '已刪除 ' . count($ids) . ' 個品牌');
        } else {
            setFlash('error', '唔支援嘅批次操作');
        }
        header('Location: ' . ADMIN_URL . '/brands.php');
        exit;
    }
}

// ── 篩選（GET）────────────────────────────────────────────────────────────
$search       = trim((string) ($_GET['search'] ?? ''));
$filterTier   = trim((string) ($_GET['tier'] ?? ''));
$filterActive = trim((string) ($_GET['active'] ?? ''));
$hasFilter    = ($search !== '' || $filterTier !== '' || $filterActive !== '');

$where  = [];
$params = [];
if ($search !== '') {
    $where[]  = 'name LIKE ?';
    $params[] = '%' . $search . '%';
}
if (in_array($filterTier, ['1', '2', '3', '4'], true)) {
    $where[]  = 'tier = ?';
    $params[] = (int) $filterTier;
}
if ($filterActive === '0' || $filterActive === '1') {
    $where[]  = 'is_active = ?';
    $params[] = (int) $filterActive;
}

// 取得品牌（套用篩選）
$sql  = 'SELECT * FROM brands'
      . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
      . ' ORDER BY tier ASC, sort_order ASC, id ASC';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$brands = $stmt->fetchAll();

$totalBrands = (int) $pdo->query('SELECT COUNT(*) FROM brands')->fetchColumn();

// 按層級分組
$tierLabels = [
    1 => 'Tier 1：國際巨頭 / 家喻戶曉',
    2 => 'Tier 2：知名大企 / 地標品牌',
    3 => 'Tier 3：成熟本地企業 / 行業名牌',
    4 => 'Tier 4：中小企 / 專業服務',
];

$pageTitle = '品牌列表管理';
$currentPage = 'brands';
$bodyClass = 'content-page';
include __DIR__ . '/includes/layout-header.php';
?>

<div class="card mb-4">
  <div class="card-header">
    <h3 class="card-title">新增品牌</h3>
  </div>
  <div class="card-body">
    <form method="POST" action="" class="row g-3 align-items-end">
      <input type="hidden" name="action" value="add">
      <?= csrfField() ?>
      <div class="col-md-4">
        <label class="form-label">品牌名稱 *</label>
        <input type="text" name="name" class="form-control" placeholder="例如：7-Eleven" required maxlength="100">
      </div>
      <div class="col-md-3">
        <label class="form-label">層級</label>
        <select name="tier" class="form-select">
          <option value="1">Tier 1 — 國際巨頭</option>
          <option value="2">Tier 2 — 知名大企</option>
          <option value="3" selected>Tier 3 — 本地企業</option>
          <option value="4">Tier 4 — 中小企</option>
        </select>
      </div>
      <div class="col-md-2">
        <label class="form-label">排序</label>
        <input type="number" name="sort_order" class="form-control" value="0" min="0">
      </div>
      <div class="col-md-1">
        <label class="form-label">顯示</label>
        <div class="form-check form-switch mt-1">
          <input class="form-check-input" type="checkbox" name="is_active" value="1" checked>
        </div>
      </div>
      <div class="col-md-2">
        <button type="submit" class="btn btn-adwire w-100">
          <i class="ti ti-plus me-1"></i>新增
        </button>
      </div>
    </form>
  </div>
</div>

<!-- 篩選 -->
<div class="card mb-3">
  <form method="GET" action="" class="card-body">
    <div class="row g-2 align-items-end">
      <div class="col-md-4">
        <label class="form-label">搜尋品牌名稱</label>
        <input type="text" name="search" class="form-control form-control-sm"
               value="<?= e($search) ?>" placeholder="例如：Cafe、Beauty、7-Eleven">
      </div>
      <div class="col-md-2">
        <label class="form-label">層級</label>
        <select name="tier" class="form-select form-select-sm">
          <option value="">全部</option>
          <?php foreach ($tierLabels as $t => $lbl): ?>
          <option value="<?= $t ?>" <?= $filterTier === (string) $t ? 'selected' : '' ?>>Tier <?= $t ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="col-md-2">
        <label class="form-label">顯示狀態</label>
        <select name="active" class="form-select form-select-sm">
          <option value="">全部</option>
          <option value="1" <?= $filterActive === '1' ? 'selected' : '' ?>>顯示中</option>
          <option value="0" <?= $filterActive === '0' ? 'selected' : '' ?>>已隱藏</option>
        </select>
      </div>
      <div class="col-md-2">
        <button type="submit" class="btn btn-sm btn-adwire w-100"><i class="ti ti-search me-1"></i>搜尋</button>
      </div>
      <div class="col-md-2">
        <a href="<?= ADMIN_URL ?>/brands.php" class="btn btn-sm btn-outline-secondary w-100">清除篩選</a>
      </div>
    </div>
    <div class="mt-2 small text-secondary">
      共 <strong><?= $totalBrands ?></strong> 個品牌<?= $hasFilter ? '，符合條件 <strong>' . count($brands) . '</strong> 個' : '' ?>
      · <span id="sort-status" class="badge bg-secondary-lt">
        <?= $hasFilter ? '篩選中唔可以拖拉排序' : '拖拉最左邊 ⠿ 可調整次序' ?>
      </span>
    </div>
  </form>
</div>

<!-- 批次操作：獨立表單，行內 checkbox 用 HTML5 form= 屬性連過來（避免嵌套 form）-->
<div class="card mb-3">
  <div class="card-body py-3">
    <form id="bulk-form" method="POST" action="" class="d-flex flex-wrap gap-2 align-items-center">
      <input type="hidden" name="action" value="bulk">
      <?= csrfField() ?>
      <span class="small text-secondary me-2"><i class="ti ti-checklist me-1"></i>批次操作（先勾選品牌）</span>
      <button type="submit" name="mode" value="enable" class="btn btn-sm btn-outline-success">
        <i class="ti ti-eye me-1"></i>啟用
      </button>
      <button type="submit" name="mode" value="disable" class="btn btn-sm btn-outline-warning">
        <i class="ti ti-eye-off me-1"></i>停用
      </button>
      <button type="submit" name="mode" value="delete" class="btn btn-sm btn-outline-danger"
              onclick="return confirm('確定刪除已勾選嘅品牌？此動作無法復原。');">
        <i class="ti ti-trash me-1"></i>刪除
      </button>
    </form>
  </div>
</div>

<!-- 品牌列表 -->
<?php foreach ([1, 2, 3, 4] as $tier): ?>
<?php $tierBrands = array_filter($brands, fn($b) => (int)$b['tier'] === $tier); ?>
<?php if (!empty($tierBrands)): ?>
<div class="card mb-3">
  <div class="card-header">
    <h3 class="card-title"><?= $tierLabels[$tier] ?>（<?= count($tierBrands) ?> 個）</h3>
  </div>
  <div class="table-responsive">
    <table class="table table-vcenter card-table">
      <thead>
        <tr>
          <th style="width:150px">排序 / 選取</th>
          <th>品牌名稱</th>
          <th style="width:80px">顯示</th>
          <th style="width:120px">操作</th>
        </tr>
      </thead>
      <tbody data-tier="<?= $tier ?>">
        <?php foreach ($tierBrands as $brand): ?>
        <tr data-id="<?= $brand['id'] ?>">
          <td>
            <span class="drag-handle" title="<?= $hasFilter ? '篩選中唔可以拖拉排序' : '拖拉調整次序' ?>">⠿</span>
            <input type="checkbox" name="ids[]" value="<?= $brand['id'] ?>" form="bulk-form"
                   class="form-check-input bulk-check" title="選取此品牌">
            <form method="POST" action="" class="d-inline" style="width:60px">
              <input type="hidden" name="action" value="update">
              <?= csrfField() ?>
              <input type="hidden" name="id" value="<?= $brand['id'] ?>">
              <input type="hidden" name="name" value="<?= e($brand['name']) ?>">
              <input type="hidden" name="tier" value="<?= $brand['tier'] ?>">
              <input type="hidden" name="is_active" value="<?= $brand['is_active'] ?>">
              <input type="number" name="sort_order" class="form-control form-control-sm" 
                     value="<?= $brand['sort_order'] ?>" min="0" style="width:60px"
                     onchange="this.form.submit()">
            </form>
          </td>
          <td>
            <form method="POST" action="" class="d-flex gap-2 align-items-center">
              <input type="hidden" name="action" value="update">
              <?= csrfField() ?>
              <input type="hidden" name="id" value="<?= $brand['id'] ?>">
              <input type="hidden" name="tier" value="<?= $brand['tier'] ?>">
              <input type="hidden" name="sort_order" value="<?= $brand['sort_order'] ?>">
              <input type="hidden" name="is_active" value="<?= $brand['is_active'] ?>">
              <input type="text" name="name" class="form-control form-control-sm" 
                     value="<?= e($brand['name']) ?>" maxlength="100" style="max-width:300px">
              <button type="submit" class="btn btn-sm btn-outline-primary" title="儲存">
                <i class="ti ti-device-floppy"></i>
              </button>
            </form>
          </td>
          <td>
            <form method="POST" action="" class="d-inline">
              <input type="hidden" name="action" value="update">
              <?= csrfField() ?>
              <input type="hidden" name="id" value="<?= $brand['id'] ?>">
              <input type="hidden" name="name" value="<?= e($brand['name']) ?>">
              <input type="hidden" name="tier" value="<?= $brand['tier'] ?>">
              <input type="hidden" name="sort_order" value="<?= $brand['sort_order'] ?>">
              <?php if ($brand['is_active']): ?>
              <input type="hidden" name="is_active" value="1">
              <span class="badge bg-success">顯示</span>
              <?php else: ?>
              <span class="badge bg-secondary">隱藏</span>
              <?php endif; ?>
            </form>
          </td>
          <td>
            <div class="btn-group btn-group-sm">
              <!-- 切換顯示/隱藏 -->
              <form method="POST" action="" class="d-inline">
                <input type="hidden" name="action" value="update">
                <?= csrfField() ?>
                <input type="hidden" name="id" value="<?= $brand['id'] ?>">
                <input type="hidden" name="name" value="<?= e($brand['name']) ?>">
                <input type="hidden" name="tier" value="<?= $brand['tier'] ?>">
                <input type="hidden" name="sort_order" value="<?= $brand['sort_order'] ?>">
                <?php if ($brand['is_active']): ?>
                <input type="hidden" name="is_active" value="0">
                <button type="submit" class="btn btn-outline-warning" title="隱藏">
                  <i class="ti ti-eye-off"></i>
                </button>
                <?php else: ?>
                <input type="hidden" name="is_active" value="1">
                <button type="submit" class="btn btn-outline-success" title="顯示">
                  <i class="ti ti-eye"></i>
                </button>
                <?php endif; ?>
              </form>
              <!-- 刪除 -->
              <form method="POST" action="" class="d-inline" 
                    onsubmit="return confirm('確定要刪除品牌「<?= e($brand['name']) ?>」嗎？')">
                <input type="hidden" name="action" value="delete">
                <?= csrfField() ?>
                <input type="hidden" name="id" value="<?= $brand['id'] ?>">
                <button type="submit" class="btn btn-outline-danger" title="刪除">
                  <i class="ti ti-trash"></i>
                </button>
              </form>
            </div>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php endif; ?>
<?php endforeach; ?>

<?php if (empty($brands)): ?>
<div class="card">
  <div class="card-body text-center py-5">
    <?php if ($hasFilter): ?>
      <i class="ti ti-search-off" style="font-size:2rem;color:#9aa9bd"></i>
      <p class="text-secondary mt-3 mb-2">冇符合條件嘅品牌。</p>
      <a href="<?= ADMIN_URL ?>/brands.php" class="btn btn-sm btn-outline-secondary">清除篩選</a>
    <?php else: ?>
      <i class="ti ti-building" style="font-size:2rem;color:#9aa9bd"></i>
      <p class="text-secondary mt-3 mb-0">尚未新增任何品牌。請使用上方表單新增。</p>
    <?php endif; ?>
  </div>
</div>
<?php endif; ?>

<?php if (!$hasFilter && !empty($brands)): ?>
<script>
/* 拖拉排序：同一個 tier（tbody）之內調整次序，放手即自動儲存。
   送出用 fetch + FormData（layout-footer.php 會自動加 X-CSRF-Token）。 */
(function () {
  var tbodies = Array.prototype.slice.call(document.querySelectorAll('tbody[data-tier]'));
  if (!tbodies.length) return;
  var status = document.getElementById('sort-status');
  var dragRow = null, saving = false;

  tbodies.forEach(function (tb) {
    Array.prototype.forEach.call(tb.querySelectorAll('tr[data-id]'), function (tr) {
      tr.setAttribute('draggable', 'true');
      tr.addEventListener('dragstart', function (e) {
        dragRow = tr; tr.classList.add('adw-dragging');
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', tr.dataset.id); } catch (_) {}
      });
      tr.addEventListener('dragend', function () {
        tr.classList.remove('adw-dragging'); dragRow = null;
      });
      tr.addEventListener('dragover', function (e) {
        if (!dragRow || dragRow.parentNode !== tb || dragRow === tr) return;
        e.preventDefault();
        var rows = Array.prototype.slice.call(tb.querySelectorAll('tr[data-id]'));
        var box = tr.getBoundingClientRect();
        var after = null;
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          if (r === dragRow) continue;
          var rb = r.getBoundingClientRect();
          if (e.clientY < rb.top + rb.height / 2) { after = r; break; }
        }
        if (after) tb.insertBefore(dragRow, after); else tb.appendChild(dragRow);
      });
    });
    tb.addEventListener('drop', function (e) { e.preventDefault(); });
  });

  document.addEventListener('dragend', function () { save(); });

  function save() {
    if (saving) return;
    var jobs = tbodies.map(function (tb) {
      var rows = Array.prototype.slice.call(tb.querySelectorAll('tr[data-id]'));
      if (!rows.length) return null;
      return { tier: tb.dataset.tier, orders: rows.map(function (r, i) {
        return { id: Number(r.dataset.id), sort_order: i };
      }) };
    }).filter(Boolean);
    if (!jobs.length) return;
    saving = true;
    if (status) { status.textContent = '儲存中…'; status.className = 'badge bg-info-lt'; }
    Promise.all(jobs.map(function (j) {
      var fd = new FormData();
      fd.append('action', 'reorder');
      fd.append('orders', JSON.stringify(j.orders));
      return fetch(location.pathname, { method: 'POST', body: fd })
        .then(function (r) { return r.json(); })
        .catch(function () { return { success: false }; });
    })).then(function (res) {
      var ok = res.every(function (r) { return r && r.success; });
      if (status) {
        status.textContent = ok ? '✅ 排序已儲存' : '⚠️ 儲存失敗，請重新載入再試';
        status.className = 'badge ' + (ok ? 'bg-success' : 'bg-danger');
      }
      saving = false;
      if (ok) setTimeout(function () { location.reload(); }, 600);
    });
  }
})();
</script>
<?php endif; ?>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>
