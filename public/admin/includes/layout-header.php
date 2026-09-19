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

// 本檔用 e() 同 getFlash()（helpers.php）。自行載入，唔依賴 caller 嘅 include 次序。
require_once __DIR__ . '/helpers.php';
?>
<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= e($pageTitle ?? 'Admin') ?> | ADWire Admin</title>
  
  <!-- CSRF Token for AJAX requests -->
  <meta name="csrf-token" content="<?= e(generateCsrfToken()) ?>">
  
  <!-- 樣式全部由本機載入：網站 .htaccess 嘅 CSP 只准 style-src 'self'
       同 fonts.googleapis.com，用 cdn.jsdelivr.net 會被瀏覽器封鎖 → 後台會冇樣式。 -->
  <link rel="stylesheet" href="/admin/assets/css/tabler.min.css">
  <link rel="stylesheet" href="/admin/assets/css/tabler-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap">
  <link rel="stylesheet" href="/admin/assets/css/adwire-admin.css">
</head>
<body class="layout-fluid role-<?= e(Auth::role()) ?> <?= e($bodyClass ?? '') ?>">
  <div class="page">
    
    <!-- Top Navbar -->
    <header class="navbar navbar-expand-md d-print-none">
      <div class="container-xl">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
          <a href="<?= ADMIN_URL ?>/index.php">ADWire Admin</a>
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
                <div class="mt-1 small text-muted"><?= e(adw_role_label(Auth::role())) ?></div>
              </div>
            </a>
            <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
              <a class="dropdown-item" href="<?= ADMIN_URL ?>/profile.php">
                <i class="ti ti-user-circle me-2"></i>我的帳號
              </a>
              <?php if (Auth::can('users.manage')): ?>
              <a class="dropdown-item" href="<?= ADMIN_URL ?>/users.php">
                <i class="ti ti-users me-2"></i>帳號管理
              </a>
              <?php endif; ?>
              <div class="dropdown-divider"></div>
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
                <?php if (Auth::can('publish')): ?>
                <button type="button" class="btn btn-adwire-accent" onclick="triggerRebuild()">
                  <i class="ti ti-rocket me-1"></i>發佈更新
                </button>
                <?php endif; ?>
              </div>
            </div>
          </div>
          <?php endif; ?>

          <!-- Flash Message -->
          <?php $flash = getFlash(); ?>
          <?php if ($flash): ?>
          <div class="alert alert-<?= $flash['type'] === 'error' ? 'danger' : ($flash['type'] === 'success' ? 'success' : 'info') ?> alert-dismissible fade show" role="alert">
            <i class="ti <?= $flash['type'] === 'success' ? 'ti-circle-check' : ($flash['type'] === 'error' ? 'ti-alert-triangle' : 'ti-info-circle') ?> me-1"></i>
            <?= e($flash['message']) ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          </div>
          <?php endif; ?>

          <?php if (!Auth::can('content.edit')): ?>
          <div class="alert alert-warning d-flex align-items-start" role="alert">
            <i class="ti ti-eye me-2 mt-1"></i>
            <div>
              你嘅帳號角色係「<?= e(adw_role_label(Auth::role())) ?>」：<strong>可以查看所有內容，但唔可以修改</strong>。
              如需編輯權限，請聯絡超級管理員。
            </div>
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

                <div class="mt-3 pt-3 border-top">
                  <div class="px-3 pb-2 small text-secondary text-uppercase" style="letter-spacing:.06em;font-size:.7rem">系統</div>
                  <a href="<?= ADMIN_URL ?>/profile.php" class="list-group-item list-group-item-action sidebar-link <?= ($currentPage ?? '') === 'profile' ? 'active' : '' ?>">
                    <i class="ti ti-user-circle me-2"></i>我的帳號
                  </a>
                  <?php if (Auth::can('users.manage')): ?>
                  <a href="<?= ADMIN_URL ?>/users.php" class="list-group-item list-group-item-action sidebar-link <?= ($currentPage ?? '') === 'users' ? 'active' : '' ?>">
                    <i class="ti ti-users me-2"></i>帳號管理
                  </a>
                  <?php endif; ?>
                  <?php /* migrate.php 唔列入側邊欄：佢係舊嘅種子資料匯入腳本，
                           重複執行會產生重複品牌（brands 表無 unique key）。仍保留
                           migrate.run 權限閘門，只供超級管理員手動存取。 */ ?>
                </div>
              </div>
            </div>
            
            <!-- Main Content Area -->
            <div class="col-md-9 col-lg-10">
