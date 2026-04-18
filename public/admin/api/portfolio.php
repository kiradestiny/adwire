<?php
/**
 * API: 成功案例列表
 * GET /admin/api/portfolio.php?key=XXX
 * GET /admin/api/portfolio.php?key=XXX&slug=case-slug  (單個案例)
 * 
 * 返回 Portfolio 案例數據，供 Next.js Build Time 使用
 */

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/database.php';
require_once __DIR__ . '/../includes/helpers.php';

header('Content-Type: application/json; charset=utf-8');
// ⚠️ 移除 Access-Control-Allow-Origin: * — 此 API 僅供 Build Time 使用，不需 CORS
header('Cache-Control: public, max-age=300');

verifyApiKey();

try {
    $pdo = Database::getInstance();
    $slug = $_GET['slug'] ?? null;

    if ($slug) {
        // 單個案例
        $stmt = $pdo->prepare(
            "SELECT * FROM portfolio_cases WHERE slug = ? AND is_active = 1 LIMIT 1"
        );
        $stmt->execute([$slug]);
        $case = $stmt->fetch();

        if (!$case) {
            jsonResponse(['success' => false, 'error' => 'Case not found'], 404);
        }

        jsonResponse([
            'success' => true,
            'data'    => formatPortfolioCase($pdo, $case),
        ]);
    } else {
        // 所有案例
        $stmt = $pdo->query(
            "SELECT * FROM portfolio_cases 
             WHERE is_active = 1 
             ORDER BY sort_order ASC, id ASC"
        );
        $cases = $stmt->fetchAll();

        $result = array_map(fn($case) => formatPortfolioCase($pdo, $case), $cases);

        jsonResponse([
            'success'    => true,
            'data'       => $result,
            'updated_at' => date('c'),
        ]);
    }
} catch (Exception $e) {
    error_log('[ADWire API] portfolio.php error: ' . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Internal Server Error'], 500);
}

/**
 * 格式化 Portfolio 案例數據（與 portfolioData.ts 結構一致）
 */
function formatPortfolioCase(PDO $pdo, array $row): array
{
    $caseId = (int) $row['id'];

    // 成效指標
    $metrics = $pdo->prepare(
        "SELECT label, value, description, is_highlight FROM portfolio_metrics 
         WHERE case_id = ? ORDER BY sort_order ASC"
    );
    $metrics->execute([$caseId]);
    $resultMetrics = array_map(fn($m) => [
        'label'       => $m['label'],
        'value'       => $m['value'],
        'description' => $m['description'],
        'highlight'   => (bool) $m['is_highlight'],
    ], $metrics->fetchAll());

    // 流程步驟
    $steps = $pdo->prepare(
        "SELECT phase, title, description FROM portfolio_steps 
         WHERE case_id = ? ORDER BY sort_order ASC"
    );
    $steps->execute([$caseId]);
    $processSteps = $steps->fetchAll();

    // 客戶評價
    $testimonial = $pdo->prepare(
        "SELECT quote, author, role, company FROM portfolio_testimonials 
         WHERE case_id = ? LIMIT 1"
    );
    $testimonial->execute([$caseId]);
    $testRow = $testimonial->fetch();
    $testimonialData = $testRow ? [
        'quote'   => $testRow['quote'],
        'author'  => $testRow['author'],
        'role'    => $testRow['role'],
        'company' => $testRow['company'],
    ] : ['quote' => '', 'author' => '', 'role' => '', 'company' => ''];

    // 標籤
    $tags = $pdo->prepare("SELECT tag FROM portfolio_tags WHERE case_id = ?");
    $tags->execute([$caseId]);
    $tagsList = array_map(fn($t) => $t['tag'], $tags->fetchAll());

    // 服務項目
    $services = $pdo->prepare("SELECT service FROM portfolio_services WHERE case_id = ?");
    $services->execute([$caseId]);
    $servicesList = array_map(fn($s) => $s['service'], $services->fetchAll());

    // FAQ
    $faqs = $pdo->prepare(
        "SELECT question, answer FROM portfolio_faqs 
         WHERE case_id = ? ORDER BY sort_order ASC"
    );
    $faqs->execute([$caseId]);
    $faqsList = array_map(fn($f) => ['q' => $f['question'], 'a' => $f['answer']], $faqs->fetchAll());

    // Before/After
    $ba = $pdo->prepare(
        "SELECT label, before_value, after_value FROM portfolio_before_after 
         WHERE case_id = ? ORDER BY sort_order ASC"
    );
    $ba->execute([$caseId]);
    $baList = array_map(fn($b) => [
        'label'  => $b['label'],
        'before' => $b['before_value'],
        'after'  => $b['after_value'],
    ], $ba->fetchAll());

    return [
        'id'               => $caseId,
        'slug'             => $row['slug'],
        'title'            => $row['title'],
        'category'         => $row['category'],
        'displayCategory'  => $row['display_category'],
        'industry'         => $row['industry'],
        'duration'         => $row['duration'],
        'services'         => $servicesList,
        'shortDescription' => $row['short_description'] ?? '',
        'fullDescription'  => $row['full_description'] ?? '',
        'challenge'        => $row['challenge'] ?? '',
        'solution'         => $row['solution'] ?? '',
        'outcome'          => $row['outcome'] ?? '',
        'stats'            => $row['stats'],
        'statLabel'        => $row['stat_label'],
        'resultMetrics'    => $resultMetrics,
        'processSteps'     => $processSteps,
        'testimonial'      => $testimonialData,
        'iconName'         => $row['icon_name'],
        'color'            => $row['color'],
        'accentColor'      => $row['accent_color'],
        'tags'             => $tagsList,
        'image'            => $row['image'],
        'alt'              => $row['alt'],
        'seoTitle'         => $row['seo_title'],
        'seoDescription'   => $row['seo_description'],
        'geoSummary'       => $row['geo_summary'] ?? '',
        'faqs'             => $faqsList,
        'beforeAfter'      => $baList,
        'updatedAt'        => $row['updated_at'],
    ];
}
