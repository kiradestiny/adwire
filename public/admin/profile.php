<?php
/**
 * ADWire Admin Panel — 我的帳號
 *
 * 所有已登入用戶都可以：更改自己嘅顯示名、更改自己嘅密碼（需輸入目前密碼）。
 * 更改角色／啟用狀態／刪除帳號只可以經 users.php（超級管理員）。
 */

require_once __DIR__ . '/includes/auth.php';
Auth::requireLogin();
$authUser = Auth::user();

require_once __DIR__ . '/includes/database.php';
require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/audit-log.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireCsrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'display_name') {
        $newName = trim((string) ($_POST['display_name'] ?? ''));
        if (mb_strlen($newName) > 100) {
            setFlash('error', '顯示名唔可以超過 100 字');
        } elseif ($newName === '') {
            setFlash('error', '顯示名唔可以空白');
        } else {
            $me = Auth::getUser((int) $authUser['id']);
            $res = Auth::updateUser((int) $authUser['id'], $newName, $me['role'], (int) $me['is_active']);
            if ($res['ok']) {
                $_SESSION['admin_display'] = $newName;   // 即時反映於介面
                AuditLog::record('update', 'admin_user', (int) $authUser['id'], $authUser['username'],
                    ['display_name' => $newName]);
                setFlash('success', '顯示名已更新為「' . e($newName) . '」');
            } else {
                setFlash('error', $res['error']);
            }
        }
    } elseif ($action === 'password') {
        $cur  = (string) ($_POST['current_password'] ?? '');
        $new  = (string) ($_POST['new_password'] ?? '');
        $new2 = (string) ($_POST['new_password2'] ?? '');
        if ($new !== $new2) {
            setFlash('error', '兩次輸入嘅新密碼唔一致');
        } else {
            $res = Auth::changeOwnPassword((int) $authUser['id'], $cur, $new);
            if ($res['ok']) {
                AuditLog::record('update', 'admin_user', (int) $authUser['id'], $authUser['username'],
                    ['password' => 'changed_by_self']);
                setFlash('success', '密碼已成功更改');
            } else {
                setFlash('error', $res['error']);
            }
        }
    }

    header('Location: ' . ADMIN_URL . '/profile.php');
    exit;
}

$me          = Auth::getUser((int) $authUser['id']);
$pageTitle   = '我的帳號';
$currentPage = 'profile';
include __DIR__ . '/includes/layout-header.php';
?>

<div class="row g-4">
  <!-- 帳號資料 -->
  <div class="col-lg-4">
    <div class="card h-100">
      <div class="card-header"><i class="ti ti-id-badge me-2"></i>帳號資料</div>
      <div class="card-body">
        <div class="mb-3">
          <div class="text-secondary small">用戶名</div>
          <div class="font-weight-medium"><?= e($authUser['username']) ?></div>
        </div>
        <div class="mb-3">
          <div class="text-secondary small">角色</div>
          <div>
            <span class="badge bg-<?= adw_role_badge(Auth::role()) ?>-lt"><?= e(adw_role_label(Auth::role())) ?></span>
          </div>
        </div>
        <div class="mb-3">
          <div class="text-secondary small">你嘅權限</div>
          <ul class="small text-secondary mb-0 ps-3">
            <?php foreach (adw_role_caps(Auth::role()) as $cap): ?>
              <li><?= e(ADW_CAP_LABELS[$cap] ?? $cap) ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
        <div class="mb-0">
          <div class="text-secondary small">最後登入</div>
          <div><?= $me['last_login_at'] ? e(substr($me['last_login_at'], 0, 16)) : '—' ?></div>
        </div>
      </div>
      <?php if (!Auth::can('users.manage')): ?>
      <div class="card-footer text-secondary small">
        <i class="ti ti-info-circle me-1"></i>需要更換角色？請聯絡超級管理員。
      </div>
      <?php endif; ?>
    </div>
  </div>

  <!-- 顯示名 -->
  <div class="col-lg-4">
    <div class="card h-100">
      <div class="card-header"><i class="ti ti-user me-2"></i>顯示名</div>
      <div class="card-body">
        <form method="POST" action="">
          <input type="hidden" name="action" value="display_name">
          <?= csrfField() ?>
          <div class="mb-3">
            <label class="form-label">顯示名</label>
            <input type="text" name="display_name" class="form-control" maxlength="100"
                   value="<?= e($authUser['display_name']) ?>" required>
            <div class="form-hint">會顯示喺右上角同審計日誌</div>
          </div>
          <button type="submit" class="btn btn-adwire w-100">
            <i class="ti ti-device-floppy me-1"></i>儲存顯示名
          </button>
        </form>
      </div>
    </div>
  </div>

  <!-- 更改密碼 -->
  <div class="col-lg-4">
    <div class="card h-100">
      <div class="card-header"><i class="ti ti-key me-2"></i>更改密碼</div>
      <div class="card-body">
        <form method="POST" action="">
          <input type="hidden" name="action" value="password">
          <?= csrfField() ?>
          <div class="mb-3">
            <label class="form-label">目前密碼 <span class="text-danger">*</span></label>
            <input type="password" name="current_password" class="form-control"
                   autocomplete="current-password" required>
          </div>
          <div class="mb-3">
            <label class="form-label">新密碼 <span class="text-danger">*</span></label>
            <input type="password" name="new_password" class="form-control" minlength="8"
                   autocomplete="new-password" required>
            <div class="form-hint">最少 8 個字元</div>
          </div>
          <div class="mb-3">
            <label class="form-label">確認新密碼 <span class="text-danger">*</span></label>
            <input type="password" name="new_password2" class="form-control" minlength="8"
                   autocomplete="new-password" required>
          </div>
          <button type="submit" class="btn btn-adwire w-100">
            <i class="ti ti-lock me-1"></i>更改密碼
          </button>
        </form>
      </div>
    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>
