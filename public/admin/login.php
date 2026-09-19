<?php
/**
 * ADWire Admin Panel — 登入頁面
 */

// 注意：helpers.php 提供 csrfField() / requireCsrf() / setFlash() 等函式，
//       登入頁要用 csrfField()，所以必須載入（原本漏咗 → Call to undefined function）。
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/audit-log.php';

// 已登入則跳轉到 Dashboard
if (Auth::check()) {
    header('Location: ' . ADMIN_URL . '/index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // CSRF 驗證
    $csrfToken = $_POST['csrf_token'] ?? '';
    if (empty($csrfToken) || !verifyCsrfToken($csrfToken)) {
        $error = '安全驗證失敗，請重新提交。';
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        // 檢查 IP 是否被暫時封鎖
        $rateCheck = Auth::checkIpRateLimit();
        if ($rateCheck['blocked']) {
            $minutes = max(1, (int) ceil($rateCheck['retry_after'] / 60));
            $error = "登入嘗試過於頻繁，請 {$minutes} 分鐘後再試。";
        } elseif (empty($username) || empty($password)) {
            $error = '請輸入用戶名和密碼';
        } elseif (Auth::login($username, $password)) {
        AuditLog::record('login', 'admin_user', null, $username);
        header('Location: ' . ADMIN_URL . '/index.php');
        exit;
        } else {
            $remaining = Auth::LOGIN_RATE_MAX_ATTEMPTS - $rateCheck['attempts'] - 1;
            if ($remaining > 0) {
                $error = "用戶名或密碼不正確（剩餘嘗試次數：{$remaining}）";
            } else {
                $error = '登入嘗試過於頻繁，請稍後再試。';
            }
        }
        // 驗證後重新生成 Token（防止重放攻擊）
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
}
?>
<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登入 | ADWire Admin</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@1.2.0/dist/css/tabler.min.css">
  <style>
    :root { --adwire-primary: #0f4c81; --adwire-accent: #f5a623; }
    .btn-adwire { background-color: var(--adwire-primary); color: #fff; border-color: var(--adwire-primary); }
    .btn-adwire:hover { background-color: #0d3d6b; color: #fff; border-color: #0d3d6b; }
  </style>
</head>
<body class="d-flex flex-column">
  <div class="page page-center">
    <div class="container container-tight py-4">
      <div class="text-center mb-4">
        <h1 style="color: var(--adwire-primary); font-weight: 700;">📊 ADWire Admin</h1>
        <p class="text-muted">網站內容管理後台</p>
      </div>

      <?php if ($error): ?>
      <div class="alert alert-danger">
        <strong>❌</strong> <?= htmlspecialchars($error) ?>
      </div>
      <?php endif; ?>

      <div class="card card-md">
        <div class="card-body">
          <h2 class="h2 text-center mb-4">登入你的帳號</h2>
          <form method="POST" action="">
            <?= csrfField() ?>
            <div class="mb-3">
              <label class="form-label">用戶名</label>
              <input type="text" name="username" class="form-control" placeholder="輸入用戶名" 
                     value="<?= htmlspecialchars($username ?? '') ?>" required autofocus>
            </div>
            <div class="mb-3">
              <label class="form-label">密碼</label>
              <input type="password" name="password" class="form-control" placeholder="輸入密碼" required>
            </div>
            <div class="form-footer">
              <button type="submit" class="btn btn-adwire w-100">登入</button>
            </div>
          </form>
        </div>
      </div>

      <div class="text-center text-muted mt-3">
        <a href="<?= SITE_URL ?>" target="_blank">← 返回網站</a>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/@tabler/core@1.2.0/dist/js/tabler.min.js"></script>
</body>
</html>
