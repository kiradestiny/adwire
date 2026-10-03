#!/usr/bin/env node
'use strict';
/**
 * blog-acceptance.cjs — 27 篇升級稿驗收閘門（不重不漏）
 *
 * 用途：在寫回 lib/blogData.ts 之前，對「候選 27 篇」做程式核對。任何一項不合格即
 * 令 report.errors 非空，blog-integration.cjs 會拒絕產出，唔會寫壞資料。
 *
 * 檢查項（對應任務要求）：
 *   1. 不重不漏：恰好 27 篇、slug 唯一、且與原始備份 slug 集合完全一致。
 *   2. 標題層級：每篇 ≤1 個 H1（正文不應有 H1）＋ 要求「有 h3、無 h2」（可關）。
 *   3. FAQ microdata：schema.org/Question 數量 >= minFaqs（預設 5）。
 *   4. 內鏈：/blog/<slug>/ 必須命中 27 篇之一；/services/<x>/ 必須是已知服務頁。
 *   5. 無 literal ** （Markdown 粗體殘留）。
 *   6. 字數門檻：正文純文字長度 >= minChars（預設 1500）。
 *
 * 本檔只做閱讀與報告，永不寫檔、永不連網。
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * 服務頁清單由 app/services/ 實際目錄推導，避免 hardcode 漂移
 * （曾漏 'production'，令正確的內鏈被誤報為 unknown page）。
 */
const DEFAULT_SERVICES = (() => {
  try {
    const dir = path.join(__dirname, '..', 'app', 'services');
    const found = fs.readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((n) => !n.startsWith('_') && !n.startsWith('.'));
    if (found.length >= 10) return found.sort();
  } catch { /* fall through to static list */ }
  return ['seo', 'web', 'system', 'automation', 'ai', 'ads', 'social',
    'video', 'production', 'china-market', 'kol', 'hong-kong-market'];
})();

function stripToText(html) {
  let t = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  t = t.replace(/<[^>]*>/g, ' ');
  t = t
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_m, d) => {
      const n = Number(d);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ' ';
    })
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => {
      const n = parseInt(h, 16);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ' ';
    });
  return t.replace(/\s+/g, ' ').trim();
}

function count(html, re) {
  return (html.match(re) || []).length;
}

function acceptPosts(posts, options = {}) {
  const opts = {
    minChars: options.minChars !== undefined ? options.minChars : 1500,
    minFaqs: options.minFaqs !== undefined ? options.minFaqs : 5,
    minH3: options.minH3 !== undefined ? options.minH3 : 3,
    requireNoH2: options.requireNoH2 !== undefined ? options.requireNoH2 : true,
    services: options.services || DEFAULT_SERVICES,
  };
  const errors = [];
  const warnings = [];
  const originals = options.originals;

  if (!Array.isArray(posts)) return { errors: ['posts is not an array'], warnings, stats: [] };

  const slugs = posts.map((p) => p && p.slug);
  const unique = new Set(slugs);
  if (posts.length !== 27) errors.push('expected exactly 27 posts, got ' + posts.length);
  if (unique.size !== posts.length) errors.push('duplicate slugs present (' + slugs.length + ' posts, ' + unique.size + ' unique)');
  if (originals) {
    const base = new Set(originals.map((p) => p.slug));
    if (base.size !== 27) errors.push('baseline does not contain exactly 27 unique slugs');
    const missing = [...base].filter((s) => !unique.has(s));
    const extra = [...unique].filter((s) => !base.has(s));
    if (missing.length) errors.push('missing slugs vs baseline: ' + missing.join(', '));
    if (extra.length) errors.push('unexpected slugs not in baseline: ' + extra.join(', '));
  }

  const stats = [];
  const blogSlugs = unique;
  for (const post of posts) {
    const p = post || {};
    const slug = p.slug;
    const label = slug || '(missing slug)';
    const content = typeof p.content === 'string' ? p.content : '';
    const postErrors = [];

    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) postErrors.push('invalid slug');
    for (const field of ['title', 'excerpt', 'date', 'category', 'readTime', 'imageColor']) {
      if (!p[field] || typeof p[field] !== 'string' || !p[field].trim()) postErrors.push('missing ' + field);
    }
    if (!Array.isArray(p.tags) || p.tags.length === 0) postErrors.push('missing tags');
    if (!content.trim()) {
      postErrors.push('empty content');
    } else {
      const h1 = count(content, /<h1\b/gi);
      const h2 = count(content, /<h2\b/gi);
      const h3 = count(content, /<h3\b/gi);
      const faqs = count(content, /https?:\/\/schema\.org\/Question/gi);
      const literalStars = count(content, /\*\*/g);
      const text = stripToText(content);
      const chars = text.length;

      if (h1 > 0) postErrors.push('content must not contain <h1> (found ' + h1 + ')');
      if (opts.requireNoH2 && h2 > 0) postErrors.push('content must not contain <h2> (found ' + h2 + ')');
      if (h3 < opts.minH3) postErrors.push('expected >= ' + opts.minH3 + ' <h3>, found ' + h3);
      if (faqs < opts.minFaqs) postErrors.push('FAQ microdata (schema.org/Question) expected >= ' + opts.minFaqs + ', found ' + faqs);
      if (literalStars > 0) postErrors.push('literal ** found (' + literalStars + ')');
      if (chars < opts.minChars) postErrors.push('plain-text length ' + chars + ' < threshold ' + opts.minChars);

      for (const m of content.matchAll(/href="\/blog\/([a-z0-9-]+)\/"/gi)) {
        if (!blogSlugs.has(m[1])) postErrors.push('internal /blog link to unknown slug: ' + m[1]);
      }
      for (const m of content.matchAll(/href="\/services\/([a-z0-9-]+)\/?"/gi)) {
        if (!opts.services.includes(m[1])) postErrors.push('internal /services link to unknown page: ' + m[1]);
      }
      if (chars < opts.minChars * 1.05) warnings.push(label + ': text near threshold (' + chars + ')');

      stats.push({ slug, chars, h2, h3, faqs, figures: count(content, /<figure\b/gi), images: count(content, /<img\b/gi) });
    }

    if (postErrors.length) errors.push(label + ': ' + postErrors.join('; '));
  }

  return { errors, warnings, stats };
}

module.exports = { acceptPosts, stripToText, DEFAULT_SERVICES };

if (require.main === module) {
  console.error('blog-acceptance.cjs is a library; run its tests: node --test scripts/tests/blog-acceptance.test.cjs');
  process.exitCode = 1;
}
