<?php
/**
 * ADWire Admin Panel — 佈局模板
 * 
 * 使用方式：
 *   $pageTitle = '頁面標題';
 *   include __DIR__ . '/includes/layout-header.php';
 *   // 頁面內容
 *   include __DIR__ . '/includes/layout-footer.php';
 */
?>
<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= e($pageTitle ?? 'Admin') ?> | ADWire Admin</title>
  
  <!-- Tabler CSS (免費開源 Admin 模板) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@1.2.0/dist/css/tabler.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css">
  
  <style>
    /* 自訂品牌色 */
    :root {
      --adwire-primary: #0f4c81;
      --adwire-accent: #f5a623;
    }
    .navbar-brand { color: var(--adwire-primary) !important; font-weight: 700; }
    .btn-adwire { background-color: var(--adwire-primary); color: #fff; border-color: var(--adwire-primary); }
    .btn-adwire:hover { background-color: #0d3d6b; color: #fff; border-color: #0d3d6b; }
    .btn-adwire-accent { background-color: var(--adwire-accent); color: #fff; border-color: var(--adwire-accent); }
    .btn-adwire-accent:hover { background-color: #e09520; color: #fff; border-color: #e09520; }
    .sidebar .navbar-brand { padding: 1rem; }
    .stat-number { font-size: 2rem; font-weight: 700; color: var(--adwire-primary); }
    .badge-new { background-color: #e74c3c; }
    .badge-read { background-color: #3498db; }
    .badge-replied { background-color: #2ecc71; }
    .badge-closed { background-color: #95a5a6; }
  </style>
</head>
<body class="layout-fluid">
  <div class="page">
    <!-- Navbar -->
    <header class="navbar navbar-expand-md d-print-none">
      <div class="container-xl">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
          <a href="<?= ADMIN_URL ?>/index.php">
            📊 ADWire Admin
          </a>
        </h1>
        <div class="navbar-nav flex-row order-md-last">
          <div class="nav-item dropdown">
            <a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown" aria-label="用戶選單">
              <span class="avatar avatar-sm bg-primary-lt"><?= mb_substr($authUser['display_name'] ?? 'A', 0, 1) ?></span>
              <div class="d-none d-xl-block ps-2">
                <div><?= e($authUser['display_name'] ?? 'Admin') ?></div>
                <div class="mt-1 small text-muted">管理員</div>
              </div>
            </a>
            <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
              <a class="dropdown-item" href="<?= ADMIN_URL ?>/logout.php">
                <i class="ti ti-logout me-2"></i>登出
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Sidebar + Content -->
    <div class="page-wrapper">
      <div class="page-body">
        <div class="container-xl">
          
          <!-- Flash Message -->
          <?php $flash = getFlash(); ?>
          <?php if ($flash): ?>
          <div class="alert alert-<?= $flash['type'] === 'error' ? 'danger' : ($flash['type'] === 'success' ? 'success' : 'info') ?> alert-dismissible fade show" role="alert">
            <strong><?= $flash['type'] === 'success' ? '✅' : ($flash['type'] === 'error' ? '❌' : 'ℹ️') ?></strong>
            <?= e($flash['message']) ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
          <?php endif; ?>
