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
}

// 取得所有品牌
$brands = $pdo->query(
    "SELECT * FROM brands ORDER BY tier ASC, sort_order ASC, id ASC"
)->fetchAll();

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
          <th style="width:40px">排序</th>
          <th>品牌名稱</th>
          <th style="width:80px">顯示</th>
          <th style="width:120px">操作</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($tierBrands as $brand): ?>
        <tr>
          <td>
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
  <div class="card-body text-center text-muted py-5">
    暫無品牌記錄。請使用上方表單新增品牌。
  </div>
</div>
<?php endif; ?>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>
