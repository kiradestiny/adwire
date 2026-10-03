'use strict';
/** Shared, synthetic fixtures for blog pipeline tests. No production data is fabricated here. */
const LONG = '這段文字用於充實正文長度，確保通過字數門檻的測試案例。'.repeat(20); // ~440 CJK chars

function faqBlock(i) {
  return '<div itemscope itemtype="https://schema.org/Question"><h4 itemprop="name">問題 ' + i + '？</h4>'
    + '<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><div itemprop="text">'
    + '<p>答案 ' + i + ' 的內容，說明實際做法與限制。</p></div></div></div>';
}

/** A single article HTML that satisfies the acceptance gate (>=3 h3, no h2, >=5 FAQ, 1500+ chars). */
function articleHtml(slug, i = 0) {
  const parts = [];
  parts.push('<p class="lead">' + LONG + '</p>');
  for (let h = 1; h <= 4; h += 1) {
    parts.push('<h3>第 ' + h + ' 個小節標題</h3>');
    parts.push('<p>' + LONG + ' 小節 ' + h + ' 的補充說明。</p>');
  }
  parts.push('<h3>常見問題</h3>');
  for (let q = 1; q <= 5; q += 1) parts.push(faqBlock(q));
  const other = i === 0 ? 1 : 0;
  parts.push('<p>延伸閱讀：<a href="/blog/post-' + other + '/">相關文章</a>，'
    + '或了解 <a href="/services/seo/">SEO 服務</a>。</p>');
  return '\n' + parts.join('\n') + '\n';
}

/** 27 literal blogPosts objects serialized as valid TS, plus an untouched template-literal export. */
function sourceTs(slugs) {
  const posts = slugs.map((slug, i) => ({
    id: i, slug, title: '舊標題 ' + i, excerpt: '舊摘要 ' + i, date: '2026-09-21',
    category: 'SEO', readTime: '5 min read', imageColor: 'blue', image: '/hero-' + i + '.webp',
    tags: ['SEO'], content: '<h3>舊內容</h3>',
  }));
  return '// preserve comment\nexport const blogPosts = [' + posts.map((p) => JSON.stringify(p)).join(',') + '];\n'
    + 'export const untouched = `do not touch ${not_a_var}`;\n';
}

function slugs27(prefix = 'post-') {
  return Array.from({ length: 27 }, (_, i) => prefix + i);
}

function briefs(slug) {
  return [1, 2].map((n) => ({
    index: n, section: n === 1 ? '第 1 個小節標題' : '第 3 個小節標題',
    alt: '圖 ' + n + '：' + slug + ' 的流程示意', title: slug + ' 圖 ' + n,
    caption: '圖 ' + n + '：' + slug + ' 的說明文字。', width: 1200, height: 675,
    prompt: 'editorial infographic, no text',
  }));
}

function manifest27() {
  const out = [];
  for (const slug of slugs27()) {
    for (let n = 1; n <= 2; n += 1) {
      out.push({ slug, index: n, path: '/blog/figures/' + slug + '-' + n + '.webp', width: 1600, height: 900 });
    }
  }
  return out;
}

module.exports = { LONG, articleHtml, sourceTs, slugs27, briefs, manifest27 };
