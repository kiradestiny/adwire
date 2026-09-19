<?php
/**
 * ADWire Admin Panel — 成功案例編輯（新增 / 修改）
 */

require_once __DIR__ . '/includes/auth.php';
Auth::requireLogin();
$authUser = Auth::user();

require_once __DIR__ . '/includes/database.php';
require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/audit-log.php';

$pdo = Database::getInstance();

$id = (int) ($_GET['id'] ?? 0);
$isEdit = $id > 0;
$case = null;

// Lucide Icon 映射表
$iconOptions = [
  'Users' => '👥 Users（用戶）',
  'TrendingUp' => '📈 TrendingUp（上升趨勢）',
  'Clock' => '⏰ Clock（時鐘）',
  'ShoppingBag' => '🛍️ ShoppingBag（購物）',
  'Globe' => '🌐 Globe（全球）',
  'MessageCircle' => '💬 MessageCircle（訊息）',
  'Camera' => '📷 Camera（相機）',
  'Code' => '💻 Code（程式碼）',
  'Search' => '🔍 Search（搜尋）',
  'Brain' => '🧠 Brain（AI 大腦）',
  'Flame' => '🔥 Flame（火焰）',
  'BarChart3' => '📊 BarChart3（圖表）',
  'Flag' => '🚩 Flag（旗幟）',
];

if ($isEdit) {
    $stmt = $pdo->prepare('SELECT * FROM portfolio_cases WHERE id = ?');
    $stmt->execute([$id]);
    $case = $stmt->fetch();
    if (!$case) {
        setFlash('error', '案例不存在');
        header('Location: ' . ADMIN_URL . '/portfolio.php');
        exit;
    }
    // 載入關聯數據
    $metrics = $pdo->prepare('SELECT * FROM portfolio_metrics WHERE case_id = ? ORDER BY sort_order')->fetchAll();
    $metricsStmt = $pdo->prepare('SELECT * FROM portfolio_metrics WHERE case_id = ? ORDER BY sort_order');
    $metricsStmt->execute([$id]);
    $metrics = $metricsStmt->fetchAll();

    $stepsStmt = $pdo->prepare('SELECT * FROM portfolio_steps WHERE case_id = ? ORDER BY sort_order');
    $stepsStmt->execute([$id]);
    $steps = $stepsStmt->fetchAll();

    $testStmt = $pdo->prepare('SELECT * FROM portfolio_testimonials WHERE case_id = ? LIMIT 1');
    $testStmt->execute([$id]);
    $testimonial = $testStmt->fetch() ?: ['quote' => '', 'author' => '', 'role' => '', 'company' => ''];

    $tagsStmt = $pdo->prepare('SELECT tag FROM portfolio_tags WHERE case_id = ?');
    $tagsStmt->execute([$id]);
    $tags = implode(', ', array_map(fn($t) => $t['tag'], $tagsStmt->fetchAll()));

    $servicesStmt = $pdo->prepare('SELECT service FROM portfolio_services WHERE case_id = ?');
    $servicesStmt->execute([$id]);
    $services = implode(', ', array_map(fn($s) => $s['service'], $servicesStmt->fetchAll()));

    $faqsStmt = $pdo->prepare('SELECT * FROM portfolio_faqs WHERE case_id = ? ORDER BY sort_order');
    $faqsStmt->execute([$id]);
    $faqs = $faqsStmt->fetchAll();

    $baStmt = $pdo->prepare('SELECT * FROM portfolio_before_after WHERE case_id = ? ORDER BY sort_order');
    $baStmt->execute([$id]);
    $beforeAfter = $baStmt->fetchAll();
}

// 處理 POST 儲存
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 伺服器端權限檢查（介面隱藏按鈕唔構成安全邊界）
    Auth::requireCapability('content.edit');
    requireCsrf();
    try {
        $pdo->beginTransaction();

        $data = [
            'slug' => trim($_POST['slug'] ?? ''),
            'title' => trim($_POST['title'] ?? ''),
            'category' => trim($_POST['category'] ?? ''),
            'display_category' => trim($_POST['display_category'] ?? ''),
            'industry' => trim($_POST['industry'] ?? ''),
            'duration' => trim($_POST['duration'] ?? ''),
            'short_description' => trim($_POST['short_description'] ?? ''),
            'full_description' => $_POST['full_description'] ?? '',
            'challenge' => $_POST['challenge'] ?? '',
            'solution' => $_POST['solution'] ?? '',
            'outcome' => $_POST['outcome'] ?? '',
            'stats' => trim($_POST['stats'] ?? ''),
            'stat_label' => trim($_POST['stat_label'] ?? ''),
            'icon_name' => trim($_POST['icon_name'] ?? 'Users'),
            'color' => trim($_POST['color'] ?? 'from-pink-500 to-rose-500'),
            'accent_color' => trim($_POST['accent_color'] ?? '#f43f5e'),
            'seo_title' => trim($_POST['seo_title'] ?? ''),
            'seo_description' => trim($_POST['seo_description'] ?? ''),
            'geo_summary' => trim($_POST['geo_summary'] ?? ''),
            'is_active' => isset($_POST['is_active']) ? 1 : 0,
            'sort_order' => (int) ($_POST['sort_order'] ?? 0),
        ];

        // 圖片上傳
        $data['image'] = $isEdit ? ($case['image'] ?? '') : '';
        $data['alt'] = trim($_POST['alt'] ?? $data['title'] . ' - ADWire Agency');
        $uploadResult = handleImageUpload('image_file', 'portfolio');
        if (!$uploadResult['success'] && !empty($_FILES['image_file']['name'])) {
            throw new ValidationException($uploadResult['error']);
        }
        if (!empty($uploadResult['path'])) {
            $data['image'] = $uploadResult['path'];
        }

        // 驗證
        if (empty($data['title']) || empty($data['slug'])) {
            throw new ValidationException('標題和 Slug 不能為空');
        }

        // Slug 唯一性
        $checkSlug = $pdo->prepare('SELECT id FROM portfolio_cases WHERE slug = ?' . ($isEdit ? ' AND id != ?' : ''));
        $checkParams = [$data['slug']];
        if ($isEdit) $checkParams[] = $id;
        $checkSlug->execute($checkParams);
        if ($checkSlug->fetchColumn()) {
            throw new ValidationException('此 Slug 已被使用');
        }

        if ($isEdit) {
            // 更新主表
            $stmt = $pdo->prepare(
                'UPDATE portfolio_cases SET slug=?, title=?, category=?, display_category=?, industry=?, duration=?,
                 short_description=?, full_description=?, challenge=?, solution=?, outcome=?,
                 stats=?, stat_label=?, icon_name=?, color=?, accent_color=?, image=?, alt=?,
                 seo_title=?, seo_description=?, geo_summary=?, is_active=?, sort_order=? WHERE id=?'
            );
            $stmt->execute([
                $data['slug'], $data['title'], $data['category'], $data['display_category'],
                $data['industry'], $data['duration'], $data['short_description'],
                $data['full_description'], $data['challenge'], $data['solution'], $data['outcome'],
                $data['stats'], $data['stat_label'], $data['icon_name'], $data['color'],
                $data['accent_color'], $data['image'], $data['alt'],
                $data['seo_title'], $data['seo_description'], $data['geo_summary'],
                $data['is_active'], $data['sort_order'], $id
            ]);
        } else {
            // 新增主表
            $stmt = $pdo->prepare(
                'INSERT INTO portfolio_cases (slug, title, category, display_category, industry, duration,
                 short_description, full_description, challenge, solution, outcome,
                 stats, stat_label, icon_name, color, accent_color, image, alt,
                 seo_title, seo_description, geo_summary, is_active, sort_order)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
            );
            $stmt->execute([
                $data['slug'], $data['title'], $data['category'], $data['display_category'],
                $data['industry'], $data['duration'], $data['short_description'],
                $data['full_description'], $data['challenge'], $data['solution'], $data['outcome'],
                $data['stats'], $data['stat_label'], $data['icon_name'], $data['color'],
                $data['accent_color'], $data['image'], $data['alt'],
                $data['seo_title'], $data['seo_description'], $data['geo_summary'],
                $data['is_active'], $data['sort_order']
            ]);
            $id = (int) $pdo->lastInsertId();
        }

        // 清除並重建關聯數據
        $pdo->prepare('DELETE FROM portfolio_metrics WHERE case_id = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM portfolio_steps WHERE case_id = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM portfolio_testimonials WHERE case_id = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM portfolio_tags WHERE case_id = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM portfolio_services WHERE case_id = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM portfolio_faqs WHERE case_id = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM portfolio_before_after WHERE case_id = ?')->execute([$id]);

        // 成效指標
        $metricLabels = $_POST['metric_label'] ?? [];
        $metricValues = $_POST['metric_value'] ?? [];
        $metricDescs = $_POST['metric_desc'] ?? [];
        $metricHighlights = $_POST['metric_highlight'] ?? [];
        $metricStmt = $pdo->prepare('INSERT INTO portfolio_metrics (case_id, label, value, description, is_highlight, sort_order) VALUES (?,?,?,?,?,?)');
        foreach ($metricLabels as $i => $label) {
            if (!empty($label)) {
                $metricStmt->execute([$id, $label, $metricValues[$i] ?? '', $metricDescs[$i] ?? '', isset($metricHighlights[$i]) ? 1 : 0, $i]);
            }
        }

        // 流程步驟
        $stepPhases = $_POST['step_phase'] ?? [];
        $stepTitles = $_POST['step_title'] ?? [];
        $stepDescs = $_POST['step_desc'] ?? [];
        $stepStmt = $pdo->prepare('INSERT INTO portfolio_steps (case_id, phase, title, description, sort_order) VALUES (?,?,?,?,?)');
        foreach ($stepPhases as $i => $phase) {
            if (!empty($stepTitles[$i])) {
                $stepStmt->execute([$id, $phase, $stepTitles[$i] ?? '', $stepDescs[$i] ?? '', $i]);
            }
        }

        // 客戶評價
        $testStmt = $pdo->prepare('INSERT INTO portfolio_testimonials (case_id, quote, author, role, company) VALUES (?,?,?,?,?)');
        $testStmt->execute([$id, $_POST['test_quote'] ?? '', $_POST['test_author'] ?? '', $_POST['test_role'] ?? '', $_POST['test_company'] ?? '']);

        // 標籤
        $tagsInput = trim($_POST['tags'] ?? '');
        if (!empty($tagsInput)) {
            $tagStmt = $pdo->prepare('INSERT INTO portfolio_tags (case_id, tag) VALUES (?, ?)');
            foreach (array_filter(array_map('trim', explode(',', $tagsInput))) as $tag) {
                $tagStmt->execute([$id, $tag]);
            }
        }

        // 服務項目
        $servicesInput = trim($_POST['services'] ?? '');
        if (!empty($servicesInput)) {
            $svcStmt = $pdo->prepare('INSERT INTO portfolio_services (case_id, service) VALUES (?, ?)');
            foreach (array_filter(array_map('trim', explode(',', $servicesInput))) as $svc) {
                $svcStmt->execute([$id, $svc]);
            }
        }

        // FAQ
        $faqQuestions = $_POST['faq_q'] ?? [];
        $faqAnswers = $_POST['faq_a'] ?? [];
        $faqStmt = $pdo->prepare('INSERT INTO portfolio_faqs (case_id, question, answer, sort_order) VALUES (?,?,?,?)');
        foreach ($faqQuestions as $i => $q) {
            if (!empty($q) && !empty($faqAnswers[$i])) {
                $faqStmt->execute([$id, $q, $faqAnswers[$i], $i]);
            }
        }

        // Before/After
        $baLabels = $_POST['ba_label'] ?? [];
        $baBefores = $_POST['ba_before'] ?? [];
        $baAfters = $_POST['ba_after'] ?? [];
        $baStmt = $pdo->prepare('INSERT INTO portfolio_before_after (case_id, label, before_value, after_value, sort_order) VALUES (?,?,?,?,?)');
        foreach ($baLabels as $i => $label) {
            if (!empty($label)) {
                $baStmt->execute([$id, $label, $baBefores[$i] ?? '', $baAfters[$i] ?? '', $i]);
            }
        }

        $pdo->commit();
        AuditLog::record($isEdit ? 'update' : 'create', 'portfolio_case', $id, $data['title']);
        setFlash('success', $isEdit ? '案例已更新' : '案例已新增');
        header('Location: ' . ADMIN_URL . '/portfolio-edit.php?id=' . $id);
        exit;

    } catch (ValidationException $e) {
        $pdo->rollBack();
        $errors[] = $e->getMessage();
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log('[ADWire Admin] portfolio-edit save failed: ' . $e->getMessage());
        $errors[] = '儲存失敗，請稍後再試。若問題持續，請聯絡技術支援。';
    }
}

// 填充表單值
if (isset($errors) || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $f = $data ?? [];
    $f['alt'] = $_POST['alt'] ?? ($data['alt'] ?? '');
    $f['tags'] = $_POST['tags'] ?? '';
    $f['services'] = $_POST['services'] ?? '';
    $f['test_quote'] = $_POST['test_quote'] ?? '';
    $f['test_author'] = $_POST['test_author'] ?? '';
    $f['test_role'] = $_POST['test_role'] ?? '';
    $f['test_company'] = $_POST['test_company'] ?? '';
} elseif ($isEdit) {
    $f = $case;
    $f['tags'] = $tags;
    $f['services'] = $services;
    $f['test_quote'] = $testimonial['quote'];
    $f['test_author'] = $testimonial['author'];
    $f['test_role'] = $testimonial['role'];
    $f['test_company'] = $testimonial['company'];
} else {
    $f = [
        'slug' => '', 'title' => '', 'category' => '', 'display_category' => '',
        'industry' => '', 'duration' => '', 'short_description' => '',
        'full_description' => '', 'challenge' => '', 'solution' => '', 'outcome' => '',
        'stats' => '', 'stat_label' => '', 'icon_name' => 'Users',
        'color' => 'from-pink-500 to-rose-500', 'accent_color' => '#f43f5e',
        'image' => '', 'alt' => '', 'seo_title' => '', 'seo_description' => '',
        'geo_summary' => '', 'is_active' => 1, 'sort_order' => 0,
        'tags' => '', 'services' => '',
        'test_quote' => '', 'test_author' => '', 'test_role' => '', 'test_company' => '',
    ];
    $metrics = [];
    $steps = [];
    $faqs = [];
    $beforeAfter = [];
}

$pageTitle = $isEdit ? '編輯案例：' . truncate($case['title'] ?? '', 30) : '新增成功案例';
$currentPage = 'portfolio';
$bodyClass = 'content-page';
include __DIR__ . '/includes/layout-header.php';
?>

<?php if (!empty($errors)): ?>
<div class="alert alert-danger">
  <strong>❌ 請修正以下問題：</strong>
  <ul class="mb-0 mt-2"><?php foreach ($errors as $err): ?><li><?= e($err) ?></li><?php endforeach; ?></ul>
</div>
<?php endif; ?>

<form method="POST" action="" enctype="multipart/form-data">
  <?= csrfField() ?>

<!-- 基本資訊 -->
<div class="card mb-4">
  <div class="card-header"><h3 class="card-title">📋 基本資訊</h3></div>
  <div class="card-body">
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">案例標題 *</label>
        <input type="text" name="title" class="form-control" value="<?= e($f['title']) ?>" required maxlength="200">
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">URL Slug * <span class="text-muted small">（建立後建議不修改）</span></label>
        <input type="text" name="slug" class="form-control" value="<?= e($f['slug']) ?>" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*">
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">排序</label>
        <input type="number" name="sort_order" class="form-control" value="<?= e($f['sort_order'] ?? 0) ?>" min="0">
      </div>
    </div>
    <div class="row">
      <div class="col-md-3 mb-3">
        <label class="form-label">分類（內部）</label>
        <input type="text" name="category" class="form-control" value="<?= e($f['category']) ?>" placeholder="例如：KOL & Video">
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">顯示分類</label>
        <input type="text" name="display_category" class="form-control" value="<?= e($f['display_category']) ?>" placeholder="例如：KOL x 短視頻">
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">行業</label>
        <input type="text" name="industry" class="form-control" value="<?= e($f['industry']) ?>" placeholder="例如：餐飲 F&B">
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">項目時長</label>
        <input type="text" name="duration" class="form-control" value="<?= e($f['duration']) ?>" placeholder="例如：4 週">
      </div>
    </div>
    <div class="row">
      <div class="col-md-3 mb-3">
        <label class="form-label">Icon</label>
        <select name="icon_name" class="form-select">
          <?php foreach ($iconOptions as $key => $label): ?>
          <option value="<?= $key ?>" <?= ($f['icon_name'] ?? 'Users') === $key ? 'selected' : '' ?>><?= $label ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">漸變色 Class</label>
        <input type="text" name="color" class="form-control" value="<?= e($f['color']) ?>" placeholder="from-pink-500 to-rose-500">
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">強調色 (Hex)</label>
        <input type="color" name="accent_color" class="form-control form-control-color" value="<?= e($f['accent_color'] ?? '#f43f5e') ?>">
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">主要數據</label>
        <div class="row g-1">
          <div class="col-5"><input type="text" name="stats" class="form-control" value="<?= e($f['stats']) ?>" placeholder="+200%"></div>
          <div class="col-7"><input type="text" name="stat_label" class="form-control" value="<?= e($f['stat_label']) ?>" placeholder="自然搜尋流量"></div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">標籤（逗號分隔）</label>
        <input type="text" name="tags" class="form-control" value="<?= e($f['tags'] ?? '') ?>" placeholder="Reels, TikTok, F&B">
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">服務項目（逗號分隔）</label>
        <input type="text" name="services" class="form-control" value="<?= e($f['services'] ?? '') ?>" placeholder="Reels 製作, Micro-Influencer 合作, 社交媒體策略">
      </div>
    </div>
    <div class="mb-3">
      <label class="form-check">
        <input class="form-check-input" type="checkbox" name="is_active" value="1" <?= ($f['is_active'] ?? 1) ? 'checked' : '' ?>>
        <span class="form-check-label">發佈</span>
      </label>
    </div>
  </div>
</div>

<!-- 描述內容 -->
<div class="card mb-4">
  <div class="card-header"><h3 class="card-title">📝 描述內容</h3></div>
  <div class="card-body">
    <div class="mb-3">
      <label class="form-label">簡短描述（列表頁用）</label>
      <textarea name="short_description" class="form-control" rows="2"><?= e($f['short_description'] ?? '') ?></textarea>
    </div>
    <div class="mb-3">
      <label class="form-label">完整描述</label>
      <textarea name="full_description" class="form-control" rows="4"><?= e($f['full_description'] ?? '') ?></textarea>
    </div>
    <div class="row">
      <div class="col-md-4 mb-3">
        <label class="form-label">客戶挑戰</label>
        <textarea name="challenge" class="form-control" rows="3"><?= e($f['challenge'] ?? '') ?></textarea>
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label">策略方案</label>
        <textarea name="solution" class="form-control" rows="3"><?= e($f['solution'] ?? '') ?></textarea>
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label">成效摘要</label>
        <textarea name="outcome" class="form-control" rows="3"><?= e($f['outcome'] ?? '') ?></textarea>
      </div>
    </div>
  </div>
</div>

<!-- 成效指標 -->
<div class="card mb-4">
  <div class="card-header"><h3 class="card-title">📊 成效指標</h3></div>
  <div class="card-body">
    <div id="metrics-container">
      <?php 
      $existingMetrics = $isEdit ? $metrics : [];
      if (empty($existingMetrics)) $existingMetrics = [['label'=>'','value'=>'','description'=>'','is_highlight'=>0]];
      foreach ($existingMetrics as $i => $m): ?>
      <div class="row g-2 mb-2 metric-row">
        <div class="col-md-3">
          <input type="text" name="metric_label[]" class="form-control form-control-sm" value="<?= e($m['label'] ?? '') ?>" placeholder="指標名稱">
        </div>
        <div class="col-md-2">
          <input type="text" name="metric_value[]" class="form-control form-control-sm" value="<?= e($m['value'] ?? '') ?>" placeholder="數值">
        </div>
        <div class="col-md-4">
          <input type="text" name="metric_desc[]" class="form-control form-control-sm" value="<?= e($m['description'] ?? '') ?>" placeholder="描述">
        </div>
        <div class="col-md-2">
          <label class="form-check form-check-sm">
            <input type="checkbox" name="metric_highlight[<?= $i ?>]" value="1" <?= !empty($m['is_highlight']) ? 'checked' : '' ?> class="form-check-input">
            <span class="form-check-label small">重點標記</span>
          </label>
        </div>
        <div class="col-md-1">
          <button type="button" class="btn btn-sm btn-outline-danger remove-metric" title="移除">
            <i class="ti ti-x"></i>
          </button>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <button type="button" class="btn btn-sm btn-outline-primary" id="add-metric">
      <i class="ti ti-plus me-1"></i>新增指標
    </button>
  </div>
</div>

<!-- 流程步驟 -->
<div class="card mb-4">
  <div class="card-header"><h3 class="card-title">🔄 流程步驟</h3></div>
  <div class="card-body">
    <div id="steps-container">
      <?php 
      $existingSteps = $isEdit ? $steps : [];
      if (empty($existingSteps)) $existingSteps = [['phase'=>'','title'=>'','description'=>'']];
      foreach ($existingSteps as $i => $s): ?>
      <div class="row g-2 mb-2 step-row">
        <div class="col-md-2">
          <input type="text" name="step_phase[]" class="form-control form-control-sm" value="<?= e($s['phase'] ?? '') ?>" placeholder="第 1 週">
        </div>
        <div class="col-md-3">
          <input type="text" name="step_title[]" class="form-control form-control-sm" value="<?= e($s['title'] ?? '') ?>" placeholder="步驟標題">
        </div>
        <div class="col-md-6">
          <input type="text" name="step_desc[]" class="form-control form-control-sm" value="<?= e($s['description'] ?? '') ?>" placeholder="步驟描述">
        </div>
        <div class="col-md-1">
          <button type="button" class="btn btn-sm btn-outline-danger remove-step" title="移除"><i class="ti ti-x"></i></button>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <button type="button" class="btn btn-sm btn-outline-primary" id="add-step">
      <i class="ti ti-plus me-1"></i>新增步驟
    </button>
  </div>
</div>

<!-- 客戶評價 -->
<div class="card mb-4">
  <div class="card-header"><h3 class="card-title">💬 客戶評價</h3></div>
  <div class="card-body">
    <div class="mb-3">
      <label class="form-label">評語</label>
      <textarea name="test_quote" class="form-control" rows="3"><?= e($f['test_quote'] ?? '') ?></textarea>
    </div>
    <div class="row">
      <div class="col-md-4 mb-3">
        <label class="form-label">姓名</label>
        <input type="text" name="test_author" class="form-control" value="<?= e($f['test_author'] ?? '') ?>">
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label">職位</label>
        <input type="text" name="test_role" class="form-control" value="<?= e($f['test_role'] ?? '') ?>">
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label">公司</label>
        <input type="text" name="test_company" class="form-control" value="<?= e($f['test_company'] ?? '') ?>">
      </div>
    </div>
  </div>
</div>

<!-- FAQ（GEO 擴展） -->
<div class="card mb-4">
  <div class="card-header"><h3 class="card-title">❓ FAQ（GEO 優化）</h3></div>
  <div class="card-body">
    <div class="mb-3">
      <label class="form-label">GEO 一句話總結（供 AI 直接引用）</label>
      <textarea name="geo_summary" class="form-control" rows="2"><?= e($f['geo_summary'] ?? '') ?></textarea>
      <div class="form-hint">建議 80-150 字，包含具體數據和關鍵字</div>
    </div>
    <div id="faqs-container">
      <?php 
      $existingFaqs = $isEdit ? $faqs : [];
      if (empty($existingFaqs)) $existingFaqs = [['question'=>'','answer'=>'']];
      foreach ($existingFaqs as $i => $faq): ?>
      <div class="card mb-2 faq-row">
        <div class="card-body p-2">
          <div class="row g-2">
            <div class="col-12">
              <input type="text" name="faq_q[]" class="form-control form-control-sm" value="<?= e($faq['question'] ?? '') ?>" placeholder="問題（包含長尾關鍵字）">
            </div>
            <div class="col-11">
              <textarea name="faq_a[]" class="form-control form-control-sm" rows="2" placeholder="答案（精確、可獨立閱讀、包含數據）"><?= e($faq['answer'] ?? '') ?></textarea>
            </div>
            <div class="col-1 d-flex align-items-center">
              <button type="button" class="btn btn-sm btn-outline-danger remove-faq"><i class="ti ti-x"></i></button>
            </div>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <button type="button" class="btn btn-sm btn-outline-primary" id="add-faq">
      <i class="ti ti-plus me-1"></i>新增 FAQ
    </button>
  </div>
</div>

<!-- Before/After 對比 -->
<div class="card mb-4">
  <div class="card-header"><h3 class="card-title">📈 Before/After 對比</h3></div>
  <div class="card-body">
    <div id="ba-container">
      <?php 
      $existingBA = $isEdit ? $beforeAfter : [];
      if (empty($existingBA)) $existingBA = [['label'=>'','before_value'=>'','after_value'=>'']];
      foreach ($existingBA as $i => $ba): ?>
      <div class="row g-2 mb-2 ba-row">
        <div class="col-md-3">
          <input type="text" name="ba_label[]" class="form-control form-control-sm" value="<?= e($ba['label'] ?? '') ?>" placeholder="指標名稱">
        </div>
        <div class="col-md-4">
          <input type="text" name="ba_before[]" class="form-control form-control-sm" value="<?= e($ba['before_value'] ?? '') ?>" placeholder="之前">
        </div>
        <div class="col-md-4">
          <input type="text" name="ba_after[]" class="form-control form-control-sm" value="<?= e($ba['after_value'] ?? '') ?>" placeholder="之後">
        </div>
        <div class="col-md-1">
          <button type="button" class="btn btn-sm btn-outline-danger remove-ba" title="移除"><i class="ti ti-x"></i></button>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <button type="button" class="btn btn-sm btn-outline-primary" id="add-ba">
      <i class="ti ti-plus me-1"></i>新增對比項
    </button>
  </div>
</div>

<!-- 圖片 & SEO -->
<div class="row">
  <div class="col-md-6">
    <div class="card mb-4">
      <div class="card-header"><h3 class="card-title">🖼️ 圖片</h3></div>
      <div class="card-body">
        <?php if (!empty($f['image'])): ?>
        <div class="mb-3">
          <img src="<?= e($f['image']) ?>" alt="current" class="img-fluid rounded mb-2" style="max-height:150px">
          <div class="text-muted small">目前圖片</div>
        </div>
        <?php endif; ?>
        <div class="mb-3">
          <label class="form-label">上傳圖片</label>
          <input type="file" name="image_file" class="form-control" accept="image/jpeg,image/png,image/webp">
          <div class="form-hint">建議尺寸：1200×630px</div>
        </div>
        <div class="mb-3">
          <label class="form-label">Alt 文字</label>
          <input type="text" name="alt" class="form-control" value="<?= e($f['alt'] ?? '') ?>">
        </div>
      </div>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card mb-4">
      <div class="card-header"><h3 class="card-title">🔍 SEO 設定</h3></div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">SEO 標題</label>
          <input type="text" name="seo_title" class="form-control" value="<?= e($f['seo_title'] ?? '') ?>" maxlength="200">
        </div>
        <div class="mb-3">
          <label class="form-label">SEO 描述</label>
          <textarea name="seo_description" class="form-control" rows="3"><?= e($f['seo_description'] ?? '') ?></textarea>
        </div>
        <div class="text-muted small">
          <p><strong>Canonical URL：</strong>/portfolio/<?= e($f['slug']) ?></p>
          <p><strong>Schema Type：</strong>Article</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- 儲存按鈕 -->
<div class="card">
  <div class="card-body text-center">
    <button type="submit" class="btn btn-adwire btn-lg">
      <i class="ti ti-device-floppy me-1"></i><?= $isEdit ? '更新案例' : '建立案例' ?>
    </button>
    <a href="<?= ADMIN_URL ?>/portfolio.php" class="btn btn-outline-secondary btn-lg ms-2">取消</a>
  </div>
</div>

</form>

<script>
// 動態新增/移除指標
document.getElementById('add-metric')?.addEventListener('click', () => {
  const container = document.getElementById('metrics-container');
  const idx = container.children.length;
  const row = document.createElement('div');
  row.className = 'row g-2 mb-2 metric-row';
  row.innerHTML = `
    <div class="col-md-3"><input type="text" name="metric_label[]" class="form-control form-control-sm" placeholder="指標名稱"></div>
    <div class="col-md-2"><input type="text" name="metric_value[]" class="form-control form-control-sm" placeholder="數值"></div>
    <div class="col-md-4"><input type="text" name="metric_desc[]" class="form-control form-control-sm" placeholder="描述"></div>
    <div class="col-md-2"><label class="form-check form-check-sm"><input type="checkbox" name="metric_highlight[${idx}]" value="1" class="form-check-input"><span class="form-check-label small">重點標記</span></label></div>
    <div class="col-md-1"><button type="button" class="btn btn-sm btn-outline-danger remove-metric" title="移除"><i class="ti ti-x"></i></button></div>
  `;
  container.appendChild(row);
});
document.addEventListener('click', e => { if (e.target.closest('.remove-metric')) e.target.closest('.metric-row')?.remove(); });

// 動態新增/移除步驟
document.getElementById('add-step')?.addEventListener('click', () => {
  const container = document.getElementById('steps-container');
  const row = document.createElement('div');
  row.className = 'row g-2 mb-2 step-row';
  row.innerHTML = `
    <div class="col-md-2"><input type="text" name="step_phase[]" class="form-control form-control-sm" placeholder="第 N 週"></div>
    <div class="col-md-3"><input type="text" name="step_title[]" class="form-control form-control-sm" placeholder="步驟標題"></div>
    <div class="col-md-6"><input type="text" name="step_desc[]" class="form-control form-control-sm" placeholder="步驟描述"></div>
    <div class="col-md-1"><button type="button" class="btn btn-sm btn-outline-danger remove-step" title="移除"><i class="ti ti-x"></i></button></div>
  `;
  container.appendChild(row);
});
document.addEventListener('click', e => { if (e.target.closest('.remove-step')) e.target.closest('.step-row')?.remove(); });

// 動態新增/移除 FAQ
document.getElementById('add-faq')?.addEventListener('click', () => {
  const container = document.getElementById('faqs-container');
  const card = document.createElement('div');
  card.className = 'card mb-2 faq-row';
  card.innerHTML = `
    <div class="card-body p-2">
      <div class="row g-2">
        <div class="col-12"><input type="text" name="faq_q[]" class="form-control form-control-sm" placeholder="問題（包含長尾關鍵字）"></div>
        <div class="col-11"><textarea name="faq_a[]" class="form-control form-control-sm" rows="2" placeholder="答案（精確、可獨立閱讀、包含數據）"></textarea></div>
        <div class="col-1 d-flex align-items-center"><button type="button" class="btn btn-sm btn-outline-danger remove-faq"><i class="ti ti-x"></i></button></div>
      </div>
    </div>
  `;
  container.appendChild(card);
});
document.addEventListener('click', e => { if (e.target.closest('.remove-faq')) e.target.closest('.faq-row')?.remove(); });

// 動態新增/移除 Before/After
document.getElementById('add-ba')?.addEventListener('click', () => {
  const container = document.getElementById('ba-container');
  const row = document.createElement('div');
  row.className = 'row g-2 mb-2 ba-row';
  row.innerHTML = `
    <div class="col-md-3"><input type="text" name="ba_label[]" class="form-control form-control-sm" placeholder="指標名稱"></div>
    <div class="col-md-4"><input type="text" name="ba_before[]" class="form-control form-control-sm" placeholder="之前"></div>
    <div class="col-md-4"><input type="text" name="ba_after[]" class="form-control form-control-sm" placeholder="之後"></div>
    <div class="col-md-1"><button type="button" class="btn btn-sm btn-outline-danger remove-ba" title="移除"><i class="ti ti-x"></i></button></div>
  `;
  container.appendChild(row);
});
document.addEventListener('click', e => { if (e.target.closest('.remove-ba')) e.target.closest('.ba-row')?.remove(); });
</script>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>