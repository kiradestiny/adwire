<?php
/**
 * ADWire Admin Panel — Blog 文章編輯（新增 / 修改）
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
$post = null;

if ($isEdit) {
    $stmt = $pdo->prepare('SELECT * FROM blog_posts WHERE id = ?');
    $stmt->execute([$id]);
    $post = $stmt->fetch();
    if (!$post) {
        setFlash('error', '文章不存在');
        header('Location: ' . ADMIN_URL . '/blog.php');
        exit;
    }
    // 取得標籤
    $tagStmt = $pdo->prepare('SELECT tag FROM blog_tags WHERE post_id = ?');
    $tagStmt->execute([$id]);
    $existingTags = implode(', ', array_map(fn($t) => $t['tag'], $tagStmt->fetchAll()));
} else {
    $existingTags = '';
}

// 處理 POST 儲存
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 伺服器端權限檢查（介面隱藏按鈕唔構成安全邊界）
    Auth::requireCapability('content.edit');
    requireCsrf();
    $slug = trim($_POST['slug'] ?? '');
    $title = trim($_POST['title'] ?? '');
    $excerpt = trim($_POST['excerpt'] ?? '');
    $content = $_POST['content'] ?? '';  // TinyMCE HTML，不 trim
    $date = trim($_POST['date'] ?? date('Y-m-d'));
    $category = trim($_POST['category'] ?? '');
    $readTime = trim($_POST['read_time'] ?? '');
    $imageColor = trim($_POST['image_color'] ?? '');
    $isActive = isset($_POST['is_active']) ? 1 : 0;
    $tagsStr = trim($_POST['tags'] ?? '');

    // 驗證
    $errors = [];
    if (empty($title)) $errors[] = '標題不能為空';
    if (empty($slug)) $errors[] = 'Slug 不能為空';
    if (empty($content)) $errors[] = '內容不能為空';

    // Slug 格式驗證
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
        $errors[] = 'Slug 只能包含小寫字母、數字和連字符（例如：my-article-title）';
    }

    // Slug 唯一性檢查
    $checkSlug = $pdo->prepare('SELECT id FROM blog_posts WHERE slug = ?' . ($isEdit ? ' AND id != ?' : ''));
    $checkParams = [$slug];
    if ($isEdit) $checkParams[] = $id;
    $checkSlug->execute($checkParams);
    if ($checkSlug->fetchColumn()) {
        $errors[] = '此 Slug 已被使用，請使用其他 Slug';
    }

    // 圖片上傳
    $imagePath = $isEdit ? ($post['image'] ?? '') : '';
    $uploadResult = handleImageUpload('image_file', 'blog');
    if (!$uploadResult['success']) {
        $errors[] = $uploadResult['error'];
    } elseif (!empty($uploadResult['path'])) {
        $imagePath = $uploadResult['path'];
    }

    if (empty($errors)) {
        try {
            $pdo->beginTransaction();

            if ($isEdit) {
                // 更新
                $stmt = $pdo->prepare(
                    'UPDATE blog_posts SET slug = ?, title = ?, excerpt = ?, content = ?, 
                     date = ?, category = ?, read_time = ?, image_color = ?, image = ?, is_active = ? 
                     WHERE id = ?'
                );
                $stmt->execute([$slug, $title, $excerpt, $content, $date, $category, $readTime, $imageColor, $imagePath, $isActive, $id]);
            } else {
                // 新增
                $stmt = $pdo->prepare(
                    'INSERT INTO blog_posts (slug, title, excerpt, content, date, category, read_time, image_color, image, is_active) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                );
                $stmt->execute([$slug, $title, $excerpt, $content, $date, $category, $readTime, $imageColor, $imagePath, $isActive]);
                $id = (int) $pdo->lastInsertId();
            }

            // 更新標籤（先刪除再插入）
            $pdo->prepare('DELETE FROM blog_tags WHERE post_id = ?')->execute([$id]);
            if (!empty($tagsStr)) {
                $tags = array_filter(array_map('trim', explode(',', $tagsStr)));
                $tagStmt = $pdo->prepare('INSERT INTO blog_tags (post_id, tag) VALUES (?, ?)');
                foreach ($tags as $tag) {
                    if (!empty($tag)) {
                        $tagStmt->execute([$id, $tag]);
                    }
                }
            }

            $pdo->commit();
            AuditLog::record($isEdit ? 'update' : 'create', 'blog_post', $id, $title);
            setFlash('success', $isEdit ? '文章已更新' : '文章已新增');
            header('Location: ' . ADMIN_URL . '/blog-edit.php?id=' . $id);
            exit;

        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('[ADWire Admin] blog-edit save failed: ' . $e->getMessage());
            $errors[] = '儲存失敗，請稍後再試。若問題持續，請聯絡技術支援。';
        }
    }
}

// 填充表單值
$formData = [
    'slug'       => $_POST['slug'] ?? ($post['slug'] ?? ''),
    'title'      => $_POST['title'] ?? ($post['title'] ?? ''),
    'excerpt'    => $_POST['excerpt'] ?? ($post['excerpt'] ?? ''),
    'content'    => $_POST['content'] ?? ($post['content'] ?? ''),
    'date'       => $_POST['date'] ?? ($post['date'] ?? date('Y-m-d')),
    'category'   => $_POST['category'] ?? ($post['category'] ?? ''),
    'readTime'   => $_POST['read_time'] ?? ($post['read_time'] ?? ''),
    'imageColor' => $_POST['image_color'] ?? ($post['image_color'] ?? 'from-indigo-500 to-purple-600'),
    'image'      => $post['image'] ?? '',
    'isActive'   => isset($_POST['is_active']) ? 1 : ($isEdit ? ($post['is_active'] ?? 1) : 1),
    'tags'       => $_POST['tags'] ?? $existingTags,
];

$pageTitle = $isEdit ? '編輯文章：' . truncate($post['title'], 30) : '新增文章';
$currentPage = 'blog';
$bodyClass = 'content-page';
include __DIR__ . '/includes/layout-header.php';
?>

<?php if (!empty($errors)): ?>
<div class="alert alert-danger">
  <strong>❌ 請修正以下問題：</strong>
  <ul class="mb-0 mt-2">
    <?php foreach ($errors as $err): ?>
    <li><?= e($err) ?></li>
    <?php endforeach; ?>
  </ul>
</div>
<?php endif; ?>

<form method="POST" action="" enctype="multipart/form-data">
  <?= csrfField() ?>
  <div class="row">
    <!-- 主要內容 -->
    <div class="col-lg-9">
      <div class="card mb-4">
        <div class="card-body">
          <!-- 標題 -->
          <div class="mb-3">
            <label class="form-label">文章標題 *</label>
            <input type="text" name="title" class="form-control form-control-lg" 
                   value="<?= e($formData['title']) ?>" placeholder="輸入文章標題" required maxlength="300">
          </div>

          <!-- Slug -->
          <div class="mb-3">
            <label class="form-label">
              URL Slug * 
              <span class="text-muted small">（只能包含小寫字母、數字和連字符，建立後建議不要修改）</span>
            </label>
            <div class="input-group">
              <span class="input-group-text text-muted">/blog/</span>
              <input type="text" name="slug" class="form-control" 
                     value="<?= e($formData['slug']) ?>" placeholder="my-article-title" required
                     pattern="[a-z0-9]+(?:-[a-z0-9]+)*" 
                     <?= $isEdit ? '' : '' ?>>
            </div>
          </div>

          <!-- 摘要 -->
          <div class="mb-3">
            <label class="form-label">文章摘要</label>
            <textarea name="excerpt" class="form-control" rows="3" 
                      placeholder="簡短描述文章內容，用於列表頁顯示及 SEO description"><?= e($formData['excerpt']) ?></textarea>
          </div>

          <!-- 內容（TinyMCE） -->
          <div class="mb-3">
            <label class="form-label">文章內容 *</label>
            <textarea name="content" id="tinymce-editor" class="form-control" rows="20"
                      style="min-height:500px"><?= htmlspecialchars($formData['content']) ?></textarea>
            <div class="form-hint">支援 HTML 原始碼。可使用 Tailwind CSS class 設計排版。</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 側邊欄設定 -->
    <div class="col-lg-3">
      <!-- 發佈設定 -->
      <div class="card mb-4">
        <div class="card-header">
          <h3 class="card-title">發佈設定</h3>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">發佈日期</label>
            <input type="date" name="date" class="form-control" value="<?= e($formData['date']) ?>">
          </div>
          <div class="mb-3">
            <label class="form-check">
              <input class="form-check-input" type="checkbox" name="is_active" value="1" 
                     <?= $formData['isActive'] ? 'checked' : '' ?>>
              <span class="form-check-label">發佈（取消則為草稿）</span>
            </label>
          </div>
          <button type="submit" class="btn btn-adwire w-100 mb-2">
            <i class="ti ti-device-floppy me-1"></i><?= $isEdit ? '更新文章' : '建立文章' ?>
          </button>
          <a href="<?= ADMIN_URL ?>/blog.php" class="btn btn-outline-secondary w-100">取消</a>
        </div>
      </div>

      <!-- 分類與標籤 -->
      <div class="card mb-4">
        <div class="card-header">
          <h3 class="card-title">分類與標籤</h3>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">分類</label>
            <input type="text" name="category" class="form-control" 
                   value="<?= e($formData['category']) ?>" placeholder="例如：AI Technology" list="category-list">
            <datalist id="category-list">
              <?php 
              $cats = $pdo->query("SELECT DISTINCT category FROM blog_posts ORDER BY category")->fetchAll(PDO::FETCH_COLUMN);
              foreach ($cats as $c): ?>
              <option value="<?= e($c) ?>">
              <?php endforeach; ?>
            </datalist>
          </div>
          <div class="mb-3">
            <label class="form-label">標籤</label>
            <input type="text" name="tags" class="form-control" 
                   value="<?= e($formData['tags']) ?>" placeholder="用逗號分隔，例如：AI, SEO, 香港">
            <div class="form-hint">多個標籤用英文逗號分隔</div>
          </div>
          <div class="mb-3">
            <label class="form-label">閱讀時間</label>
            <input type="text" name="read_time" class="form-control" 
                   value="<?= e($formData['readTime']) ?>" placeholder="例如：5 min read">
          </div>
        </div>
      </div>

      <!-- 圖片設定 -->
      <div class="card mb-4">
        <div class="card-header">
          <h3 class="card-title">圖片</h3>
        </div>
        <div class="card-body">
          <?php if ($formData['image']): ?>
          <div class="mb-3">
            <img src="<?= e($formData['image']) ?>" alt="current" class="img-fluid rounded mb-2" style="max-height:120px">
            <div class="text-muted small">目前圖片</div>
          </div>
          <?php endif; ?>
          <div class="mb-3">
            <label class="form-label">上傳圖片</label>
            <input type="file" name="image_file" class="form-control" accept="image/jpeg,image/png,image/webp">
            <div class="form-hint">建議尺寸：1200×630px，格式：WebP/JPG/PNG</div>
          </div>
          <div class="mb-3">
            <label class="form-label">漸變色 Fallback</label>
            <input type="text" name="image_color" class="form-control" 
                   value="<?= e($formData['imageColor']) ?>" placeholder="from-indigo-500 to-purple-600">
            <div class="form-hint">無圖片時顯示的 Tailwind 漸變色</div>
          </div>
        </div>
      </div>

      <!-- SEO 資訊 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">SEO 資訊</h3>
        </div>
        <div class="card-body">
          <div class="text-muted small">
            <p><strong>Canonical URL：</strong><br>/blog/<?= e($formData['slug']) ?></p>
            <p><strong>OG Title：</strong><br><?= e(truncate($formData['title'], 60)) ?></p>
            <p><strong>OG Description：</strong><br><?= e(truncate($formData['excerpt'], 160)) ?></p>
            <p class="mb-0"><strong>Schema Type：</strong>BlogPosting</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</form>

<!-- TinyMCE（本機版本：CDN 會被網站 CSP 封鎖）-->
<script src="/admin/assets/tinymce/tinymce.min.js"></script>
<script>
tinymce.init({
  selector: '#tinymce-editor',
  base_url: '/admin/assets/tinymce',
  height: 600,
  language: 'zh_HK',
  branding: false,
  promotion: false,
  
  // 插件
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 
    'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'wordcount', 'help'
  ],
  
  // 工具列
  toolbar: [
    'undo redo | blocks | bold italic underline | forecolor backcolor | alignleft aligncenter alignright | bullist numlist outdent indent | link image table | code fullscreen | help'
  ],
  
  // 允許完整 HTML（包括 Tailwind class）
  valid_elements: '*[*]',
  extended_valid_elements: '*[*]',
  valid_children: '+body[style],+body[link]',
  
  // 保留所有屬性（包括 class）
  custom_elements: '*',
  
  // 不自動清理 class
  // 允許 script 和 style
  // 這對於包含 Tailwind CSS class 的 HTML 內容很重要
  
  // 圖片上傳
  automatic_uploads: true,
  images_upload_url: '<?= ADMIN_URL ?>/api/upload.php?type=blog',
  
  // 內容樣式
  content_style: `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.7; padding: 1rem; }
    h2 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
    h3 { font-size: 1.25rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
    p { margin-bottom: 1rem; }
    .bg-blue-50, .bg-gray-50, .bg-green-50 { padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem; }
    th { background: #0f4c81; color: white; }
  `,
  
  // 自動生成 Slug
  setup: function(editor) {
    // 當標題改變時，自動建議 Slug（僅新增模式）
    <?php if (!$isEdit): ?>
    const titleInput = document.querySelector('input[name="title"]');
    const slugInput = document.querySelector('input[name="slug"]');
    let slugManuallyEdited = false;
    
    slugInput.addEventListener('input', () => { slugManuallyEdited = true; });
    
    titleInput.addEventListener('input', () => {
      if (!slugManuallyEdited && slugInput.value === '') {
        const slug = titleInput.value
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        slugInput.value = slug;
      }
    });
    <?php endif; ?>
  }
});
</script>

<script src="/admin/assets/js/content-check.js"></script>
<script>
  // 內容檢查：禁止字句 / 大陸用語 / 簡體字 —— 與 build 閘門同一份清單
  document.addEventListener("DOMContentLoaded", function () {
    ADWireContentCheck.attach({ fields: ['title','excerpt','content','tags','category','read_time','slug'] });
  });
</script>

<?php include __DIR__ . '/includes/layout-footer.php'; ?>
