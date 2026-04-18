<?php
/**
 * API: Blog 文章列表
 * GET /admin/api/blog.php?key=XXX
 * GET /admin/api/blog.php?key=XXX&slug=article-slug  (單篇文章)
 * 
 * 返回 Blog 文章數據，供 Next.js Build Time 使用
 */

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/database.php';
require_once __DIR__ . '/../includes/helpers.php';

header('Content-Type: application/json; charset=utf-8');
// ⚠️ 移除 Access-Control-Allow-Origin: * — 此 API 僅供 Build Time 使用，不需 CORS
// 如需跨域存取，應限制為正式網域（見 send-mail.php 的 CORS 實作）
header('Cache-Control: public, max-age=300');

verifyApiKey();

try {
    $pdo = Database::getInstance();
    $slug = $_GET['slug'] ?? null;

    if ($slug) {
        // 單篇文章
        $stmt = $pdo->prepare(
            "SELECT bp.*, GROUP_CONCAT(bt.tag SEPARATOR '|||') AS tags_concat
             FROM blog_posts bp
             LEFT JOIN blog_tags bt ON bt.post_id = bp.id
             WHERE bp.slug = ? AND bp.is_active = 1
             GROUP BY bp.id
             LIMIT 1"
        );
        $stmt->execute([$slug]);
        $post = $stmt->fetch();

        if (!$post) {
            jsonResponse(['success' => false, 'error' => 'Post not found'], 404);
        }

        $post['tags'] = !empty($post['tags_concat']) ? explode('|||', $post['tags_concat']) : [];
        unset($post['tags_concat']);

        jsonResponse([
            'success' => true,
            'data'    => formatBlogPost($post),
        ]);
    } else {
        // 所有文章
        $stmt = $pdo->query(
            "SELECT bp.*, GROUP_CONCAT(bt.tag SEPARATOR '|||') AS tags_concat
             FROM blog_posts bp
             LEFT JOIN blog_tags bt ON bt.post_id = bp.id
             WHERE bp.is_active = 1
             GROUP BY bp.id
             ORDER BY bp.date DESC, bp.sort_order ASC"
        );
        $posts = $stmt->fetchAll();

        $result = array_map(function ($post) {
            $post['tags'] = !empty($post['tags_concat']) ? explode('|||', $post['tags_concat']) : [];
            unset($post['tags_concat']);
            return formatBlogPost($post);
        }, $posts);

        jsonResponse([
            'success'    => true,
            'data'       => $result,
            'updated_at' => date('c'),
        ]);
    }
} catch (Exception $e) {
    error_log('[ADWire API] blog.php error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Internal Server Error'], 500);
}

/**
 * 格式化 Blog 文章數據（與 blogData.ts 結構一致）
 */
function formatBlogPost(array $row): array
{
    return [
        'id'         => (int) $row['id'],
        'slug'       => $row['slug'],
        'title'      => $row['title'],
        'excerpt'    => $row['excerpt'] ?? '',
        'date'       => $row['date'],
        'category'   => $row['category'],
        'readTime'   => $row['read_time'],
        'imageColor' => $row['image_color'],
        'image'      => $row['image'] ?: null,
        'content'    => $row['content'],
        'tags'       => $row['tags'] ?? [],
        'updatedAt'  => $row['updated_at'],
    ];
}
