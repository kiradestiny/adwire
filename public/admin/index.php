<?php
/**
 * ADWire Admin Panel — Dashboard 控制台
 */

require_once __DIR__ . '/includes/auth.php';
Auth::requireLogin();
$authUser = Auth::user();

require_once __DIR__ . '/includes/database.php';
require_once __DIR__ . '/includes/helpers.php';

$pdo = Database::getInstance();

// 統計數據
$stats = [
    'enquiries_new'   => (int) $pdo->query("SELECT COUNT(*) FROM enquiries WHERE status = 'new'")->fetchColumn(),
    'enquiries_total' => (int) $pdo->query("SELECT COUNT(*) FROM enquiries")->fetchColumn(),
    'brands_active'   => (int) $pdo->query("SELECT COUNT(*) FROM brands WHERE is_active = 1")->fetchColumn(),
    'blog_active'     => (int) $pdo->query("SELECT COUNT(*) FROM blog_posts WHERE is_active = 1")->fetchColumn(),
    'portfolio_active'=> (int) $pdo->query("SELECT COUNT(*) FROM portfolio_cases WHERE is_active = 1")->fetchColumn(),
];

// 最近 Enquiry
$recentEnquiries = $pdo->query(
    "SELECT id, name, email, service, status, created_at 
     FROM enquiries ORDER BY created_at DESC LIMIT 5"
)->fetchAll();

// 最近 Blog 文章
$recentPosts = $pdo->query(
    "SELECT id, title, slug, date, category, is_active 
     FROM blog_posts ORDER BY updated_at DESC LIMIT 5"
)->fetchAll();

$pageTitle = '控制台';
$currentPage = 'dashboard';
include __DIR__ . '/includes/layout-header.php';
?>

<!-- 統計卡片 -->
<div class="row row-deck row-cards mb-4">
  <div class="col-sm-6 col-lg-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <div class="subheader">新 Enquiry</div>
        </div>
        <div class="stat-number"><?= $stats['enquiries_new'] ?></div>
        <div class="text-muted">共 <?= $stats['enquiries_total'] ?> 條記錄</div>
      </div>
    </div>
  </div>
  <div class="col-sm-6 col-lg-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <div class="subheader">品牌數量</div>
        </div>
        <div class="stat-number"><?= $stats['brands_active'] ?></div>
        <div class="text-muted">活躍品牌</div>
      </div>
    </div>
  </div>
  <div class="col-sm-6 col-lg-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <div class="subheader">Blog 文章</div>
        </div>
        <div class="stat-number"><?= $stats['blog_active'] ?></div>
        <div class="text-muted">已發佈文章</div>
      </div>
    </div>
  </div>
  <div class="col-sm-6 col-lg-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <div class="subheader">成功案例</div>
        </div>
        <div class="stat-number"><?= $stats['portfolio_active'] ?></div>
        <div class="text-muted">已發佈案例</div>
      </div>
    </div>
  </div>
</div>

<!-- 最近 Enquiry -->
<div class="row row-cards">
  <div class="col-lg-6">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">最近 Enquiry</h3>
        <div class="card-actions">
          <a href="<?= ADMIN_URL ?>/enquiries.php" class="btn btn-sm btn-outline-primary">查看全部</a>
        </div>
      </div>
      <div class="list-group list-group-flush">
        <?php if (empty($recentEnquiries)): ?>
        <div class="list-group-item text-muted text-center py-4">暫無 Enquiry 記錄</div>
        <?php else: ?>
        <?php foreach ($recentEnquiries as $eq): ?>
        <div class="list-group-item">
          <div class="row align-items-center">
            <div class="col-auto">
              <span class="badge badge-<?= $eq['status'] ?>"><?= $eq['status'] ?></span>
            </div>
            <div class="col text-truncate">
              <strong><?= e($eq['name']) ?></strong>
              <span class="text-muted ms-2"><?= e($eq['service']) ?></span>
            </div>
            <div class="col-auto text-muted small">
              <?= formatDate($eq['created_at'], 'm/d H:i') ?>
            </div>
          </div>
        </div>
        <?php endforeach; ?>
        <?php endif; ?>
      </div>
    </div>
  </div>

  <!-- 最近 Blog 文章 -->
  <div class="col-lg-6">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">最近 Blog 文章</h3>
        <div class="card-actions">
          <a href="<?= ADMIN_URL ?>/blog.php" class="btn btn-sm btn-outline-primary">管理文章</a>
        </div>
      </div>
      <div class="list-group list-group-flush">
        <?php if (empty($recentPosts)): ?>
        <div class="list-group-item text-muted text-center py-4">暫無 Blog 文章</div>
        <?php else: ?>
        <?php foreach ($recentPosts as $post): ?>
        <div class="list-group-item">
          <div class="row align-items-center">
            <div class="col-auto">
              <?php if ($post['is_active']): ?>
              <span class="badge bg-success">已發佈</span>
              <?php else: ?>
              <span class="badge bg-secondary">草稿</span>
              <?php endif; ?>
            </div>
            <div class="col text-truncate">
              <a href="<?= ADMIN_URL ?>/blog-edit.php?id=<?= $post['id'] ?>"><?= e(truncate($post['title'], 40)) ?></a>
            </div>
            <div class="col-auto text-muted small">
              <?= $post['date'] ?>
            </div>
          </div>
        </div>
        <?php endforeach; ?>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>
