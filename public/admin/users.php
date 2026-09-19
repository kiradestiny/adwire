<?php
/**
 * ADWire Admin Panel — 帳號管理
 *
 * 只限超級管理員（super_admin）。功能：
 *   - 新增帳號（用戶名、顯示名、角色、密碼）
 *   - 修改顯示名 / 角色 / 啟用狀態
 *   - 重設密碼
 *   - 刪除帳號
 *
 * 防呆：唔可以停用／降級／刪除最後一個啟用中嘅超級管理員，亦唔可以刪自己。
 * 所有操作都寫入 admin_audit_log。
 */

require_once __DIR__ . '/includes/auth.php';
Auth::requireLogin();
if (!Auth::can('users.manage')) {
    header('Location: ' . ADMIN_URL . '/index.php');
    exit;
}
$authUser = Auth::user();

require_once __DIR__ . '/includes/database.php';
require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/audit-log.php';

$pdo = Database::getInstance();

// ── POST 處理 ────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    Auth::requireCapability('users.manage');
    requireCsrf();

    $action = $_POST['action'] ?? '';
    $id     = (int) ($_POST['id'] ?? 0);

    if ($action === 'add') {
        $res = Auth::addUser(
            (string) ($_POST['username'] ?? ''),
            (string) ($_POST['password'] ?? ''),
            (string) ($_POST['display_name'] ?? ''),
            (string) ($_POST['role'] ?? 'editor'),
            $authUser['username']
        );
        if ($res['ok']) {
            AuditLog::record('create', 'admin_user', $res['id'], (string) ($_POST['username'] ?? ''),
                ['role' => $_POST['role'] ?? '']);
            setFlash('success', '帳號「' . e($_POST['username'] ?? '') . '」已建立（角色：'
                . adw_role_label((string) ($_POST['role'] ?? '')) . '）');
        } else {
            setFlash('error', $res['error']);
        }
    } elseif ($action === 'update' && $id > 0) {
        $before = Auth::getUser($id);
        $res = Auth::updateUser($id, (string) ($_POST['display_name'] ?? ''),
            (string) ($_POST['role'] ?? 'editor'), isset($_POST['is_active']) ? 1 : 0);
        if ($res['ok']) {
            AuditLog::record('update', 'admin_user', $id, $before['username'] ?? '', [
                'display_name' => $_POST['display_name'] ?? '',
                'role'         => $_POST['role'] ?? '',
                'is_active'    => isset($_POST['is_active']) ? 1 : 0,
            ]);
            setFlash('success', '帳號「' . e($before['username'] ?? '') . '」已更新');
        } else {
            setFlash('error', $res['error']);
        }
    } elseif ($action === 'reset_password' && $id > 0) {
        $before = Auth::getUser($id);
        $newPw = (string) ($_POST['new_password'] ?? '');
        $res = Auth::setPassword($id, $newPw);
        if ($res['ok']) {
            AuditLog::record('update', 'admin_user', $id, $before['username'] ?? '', ['password' => 'reset']);
            setFlash('success', '帳號「' . e($before['username'] ?? '') . '」密碼已重設');
        } else {
            setFlash('error', $res['error']);
        }
    } elseif ($action === 'delete' && $id > 0) {
        $before = Auth::getUser($id);
        $res = Auth::deleteUser($id, (int) $authUser['id']);
        if ($res['ok']) {
            AuditLog::record('delete', 'admin_user', $id, $before['username'] ?? '');
            setFlash('success', '帳號「' . e($before['username'] ?? '') . '」已刪除');
        } else {
            setFlash('error', $res['error']);
        }
    }

    header('Location: ' . ADMIN_URL . '/users.php');
    exit;
}

$users = Auth::listUsers();
$pageTitle   = '帳號管理';
$currentPage = 'users';
include __DIR__ . '/includes/layout-header.php';
?>

<!-- 角色說明 -->
<div class="card mb-4">
  <div class="card-body">
    <div class="row g-3">
      <?php foreach (ADW_ROLES as $key => $meta): ?>
      <div class="col-md-4">
        <div class="d-flex align-items-start gap-2">
          <span class="badge bg-<?= $meta['badge'] ?>-lt"><?= e($meta['label']) ?></span>
          <div class="small text-secondary"><?= e($meta['desc']) ?></div>
        </div>
        <div class="small text-muted mt-2">
          權限：<?= e(implode('、', array_map(
              fn($c) => ADW_CAP_LABELS[$c] ?? $c, adw_role_caps($key)))) ?>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</div>

<!-- 新增帳號 -->
<div class="card mb-4">
  <div class="card-header"><i class="ti ti-user-plus me-2"></i>新增帳號</div>
  <div class="card-body">
    <form method="POST" action="">
      <input type="hidden" name="action" value="add">
      <?= csrfField() ?>
      <div class="row g-3 align-items-end">
        <div class="col-md-3">
          <label class="form-label">用戶名 <span class="text-danger">*</span></label>
          <input type="text" name="username" class="form-control" required
                 pattern="[a-zA-Z0-9._-]{3,50}" placeholder="例：coleague01">
          <div class="form-hint">英文字母、數字、. _ - （3-50 字）</div>
        </div>
        <div class="col-md-3">
          <label class="form-label">顯示名</label>
          <input type="text" name="display_name" class="form-control" maxlength="100" placeholder="例：陳大文">
        </div>
        <div class="col-md-2">
          <label class="form-label">角色 <span class="text-danger">*</span></label>
          <select name="role" class="form-select">
            <?php foreach (ADW_ROLES as $key => $meta): ?>
              <option value="<?= e($key) ?>" <?= $key === 'editor' ? 'selected' : '' ?>><?= e($meta['label']) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">密碼 <span class="text-danger">*</span></label>
          <input type="text" name="password" class="form-control" required minlength="8"
                 placeholder="最少 8 字元" autocomplete="new-password">
          <div class="form-hint">最少 8 字元</div>
        </div>
        <div class="col-md-2">
          <button type="submit" class="btn btn-adwire w-100">
            <i class="ti ti-plus me-1"></i>建立
          </button>
        </div>
      </div>
    </form>
  </div>
</div>

<!-- 帳號列表 -->
<div class="card">
  <div class="card-header d-flex align-items-center">
    <span><i class="ti ti-users me-2"></i>所有帳號</span>
    <span class="badge bg-secondary-lt ms-auto"><?= count($users) ?></span>
  </div>
  <div class="table-responsive">
    <table class="table table-vcenter card-table">
      <thead>
        <tr>
          <th>用戶名</th>
          <th>顯示名</th>
          <th>角色</th>
          <th>狀態</th>
          <th>最後登入</th>
          <th>重設密碼</th>
          <th class="text-end">操作</th>
        </tr>
      </thead>
      <tbody>
      <?php foreach ($users as $u): $isSelf = ((int) $u['id'] === (int) $authUser['id']); ?>
        <tr>
          <td>
            <div class="font-weight-medium"><?= e($u['username']) ?></div>
            <?php if ($isSelf): ?><span class="badge bg-blue-lt">你</span><?php endif; ?>
            <?php if (!empty($u['created_by'])): ?>
              <div class="small text-secondary">由 <?= e($u['created_by']) ?> 建立</div>
            <?php endif; ?>
          </td>
          <td colspan="5" class="p-0">
            <!-- 一行一個表單：action 由被按嘅按鈕提供，避免隱藏欄位與按鈕值衝突 -->
            <form method="POST" action="" class="m-0">
              <?= csrfField() ?>
              <input type="hidden" name="id" value="<?= (int) $u['id'] ?>">
              <div class="row g-2 align-items-center py-2 px-3">
                <div class="col-md-3">
                  <input type="text" name="display_name" class="form-control form-control-sm"
                         maxlength="100" value="<?= e($u['display_name']) ?>" aria-label="顯示名">
                </div>
                <div class="col-md-2">
                  <select name="role" class="form-select form-select-sm" aria-label="角色"
                          <?= $isSelf ? 'title="你可以更改自己嘅角色，但系統會阻止你移除最後一個超級管理員"' : '' ?>>
                    <?php foreach (ADW_ROLES as $key => $meta): ?>
                      <option value="<?= e($key) ?>" <?= $u['role'] === $key ? 'selected' : '' ?>>
                        <?= e($meta['label']) ?>
                      </option>
                    <?php endforeach; ?>
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-check form-switch m-0">
                    <input class="form-check-input" type="checkbox" name="is_active"
                           value="1" <?= (int) $u['is_active'] === 1 ? 'checked' : '' ?>>
                    <span class="form-check-label"><?= (int) $u['is_active'] === 1 ? '啟用' : '停用' ?></span>
                  </label>
                </div>
                <div class="col-md-2 small text-secondary">
                  <?= $u['last_login_at'] ? e(substr($u['last_login_at'], 0, 16)) : '從未登入' ?>
                </div>
                <div class="col-md-3">
                  <div class="input-group input-group-sm">
                    <input type="text" name="new_password" class="form-control"
                           placeholder="新密碼（≥8）" autocomplete="new-password">
                    <button type="submit" name="action" value="reset_password"
                            class="btn btn-outline-secondary" title="用上面呢個欄位嘅值重設密碼">
                      <i class="ti ti-key"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="d-flex gap-2 pb-2 px-3">
                <button type="submit" name="action" value="update" class="btn btn-sm btn-adwire">
                  <i class="ti ti-device-floppy me-1"></i>儲存變更
                </button>
                <button type="submit" name="action" value="delete" class="btn btn-sm btn-outline-danger ms-auto"
                        onclick="return confirm('確定刪除帳號「<?= e($u['username']) ?>」？呢個動作無法復原。');">
                  <i class="ti ti-trash me-1"></i>刪除
                </button>
              </div>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <div class="card-footer text-secondary small">
    <i class="ti ti-info-circle me-1"></i>
    為防止鎖死系統：唔可以停用、降級或刪除最後一個啟用中嘅超級管理員，亦唔可以刪除自己嘅帳號。
  </div>
</div>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>
