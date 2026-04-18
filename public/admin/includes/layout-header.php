<?php
/**
 * ADWire Admin Panel — 佈局 Header（含導航欄 + 側邊欄）
 * 
 * 使用方式：
 *   $pageTitle = '頁面標題';
 *   $currentPage = 'enquiries';  // 用於側邊欄高亮
 *   require_once __DIR__ . '/auth.php';
 *   Auth::requireLogin();
 *   $authUser = Auth::user();
 *   include __DIR__ . '/layout-header.php';
 */
?>
<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= e($pageTitle ?? 'Admin') ?> | ADWire Admin</title>
  
  <!-- CSRF Token for AJAX requests -->
  <meta name="csrf-token" content="<?= e(generateCsrfToken()) ?>">
  
  <!-- Tabler CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@1.2.0/dist/css/tabler.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css">
  
  <style>
    :root {
      --adwire-primary: #0f4c81;
      --adwire-accent: #f5a623;
    }
    .navbar-brand { color: var(--adwire-primary) !important; font-weight: 700; }
    .btn-adwire { background-color: var(--adwire-primary); color: #fff; border-color: var(--adwire-primary); }
    .btn-adwire:hover { background-color: #0d3d6b; color: #fff; border-color: #0d3d6b; }
    .btn-adwire-accent { background-color: var(--adwire-accent); color: #fff; border-color: var(--adwire-accent); }
    .btn-adwire-accent:hover { background-color: #e09520; color: #fff; border-color: #e09520; }
    .stat-number { font-size: 2rem; font-weight: 700; color: var(--adwire-primary); }
    .badge-new { background-color: #e74c3c; }
    .badge-read { background-color: #3498db; }
    .badge-replied { background-color: #2ecc71; }
    .badge-closed { background-color: #95a5a6; }
    .sidebar-link.active { background-color: rgba(15,76,129,0.08); color: var(--adwire-primary); font-weight: 600; }
  </style>
</head>
<body class="layout-fluid">
  <div class="page">
    
    <!-- Top Navbar -->
    <header class="navbar navbar-expand-md d-print-none">
      <div class="container-xl">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
          <a href="<?= ADMIN_URL ?>/index.php">📊 ADWire Admin</a>
        </h1>
        <div class="navbar-nav flex-row order-md-last">
          <a href="<?= SITE_URL ?>" target="_blank" class="nav-link px-2" title="查看網站">
            <i class="ti ti-external-link"></i>
          </a>
          <div class="nav-item dropdown">
            <a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown">
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

    <div class="page-wrapper">
      <div class="page-body">
        <div class="container-xl">
          
          <!-- Page Header -->
          <?php if (!empty($pageTitle)): ?>
          <div class="page-header d-print-none mb-4">
            <div class="row align-items-center">
              <div class="col">
                <h2 class="page-title"><?= e($pageTitle) ?></h2>
              </div>
              <div class="col-auto ms-auto d-print-none">
                <button type="button" class="btn btn-adwire-accent" onclick="triggerRebuild()">
                  <i class="ti ti-rocket me-1"></i>發佈更新
                </button>
              </div>
            </div>
          </div>
          <?php endif; ?>

          <!-- Flash Message -->
          <?php $flash = getFlash(); ?>
          <?php if ($flash): ?>
          <div class="alert alert-<?= $flash['type'] === 'error' ? 'danger' : ($flash['type'] === 'success' ? 'success' : 'info') ?> alert-dismissible fade show" role="alert">
            <strong><?= $flash['type'] === 'success' ? '✅' : ($flash['type'] === 'error' ? '❌' : 'ℹ️') ?></strong>
            <?= e($flash['message']) ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          </div>
          <?php endif; ?>

          <!-- Sidebar Navigation -->
          <div class="row">
            <div class="col-md-3 col-lg-2 d-print-none mb-4">
              <div class="card">
                <div class="list-group list-group-flush">
                  <a href="<?= ADMIN_URL ?>/index.php" class="list-group-item list-group-item-action sidebar-link <?= ($currentPage ?? '') === 'dashboard' ? 'active' : '' ?>">
                    <i class="ti ti-dashboard me-2"></i>控制台
                  </a>
                  <a href="<?= ADMIN_URL ?>/enquiries.php" class="list-group-item list-group-item-action sidebar-link <?= ($currentPage ?? '') === 'enquiries' ? 'active' : '' ?>">
                    <i class="ti ti-mail me-2"></i>Enquiry 紀錄
                    <?php
                      $pdo = Database::getInstance();
                      $newCount = $pdo->query("SELECT COUNT(*) FROM enquiries WHERE status = 'new'")->fetchColumn();
                      if ($newCount > 0):
                    ?>
                    <span class="badge badge-new ms-auto"><?= $newCount ?></span>
                    <?php endif; ?>
                  </a>
                  <a href="<?= ADMIN_URL ?>/brands.php" class="list-group-item list-group-item-action sidebar-link <?= ($currentPage ?? '') === 'brands' ? 'active' : '' ?>">
                    <i class="ti ti-building me-2"></i>品牌列表
                  </a>
                  <a href="<?= ADMIN_URL ?>/blog.php" class="list-group-item list-group-item-action sidebar-link <?= ($currentPage ?? '') === 'blog' ? 'active' : '' ?>">
                    <i class="ti ti-article me-2"></i>Blog 文章
                  </a>
                  <a href="<?= ADMIN_URL ?>/portfolio.php" class="list-group-item list-group-item-action sidebar-link <?= ($currentPage ?? '') === 'portfolio' ? 'active' : '' ?>">
                    <i class="ti ti-briefcase me-2"></i>成功案例
                  </a>
                </div>
              </div>
            </div>
            
            <!-- Main Content Area -->
            <div class="col-md-9 col-lg-10">
