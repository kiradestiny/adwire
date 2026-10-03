#!/usr/bin/env node
'use strict';
/**
 * blog-live-verify.cjs — 正式站讀回核對工具
 *
 * 用途：確認線上 27 條 URL 的 title / description / 正文，是否等於 repo 現行版本。
 * 針對的實際問題：lib/data-resolver.ts 的合併規則是「同 slug → 後台 DB 版本覆蓋
 * repo 版本」。若後台 blog_posts 仍是舊快照，即使 repo 已更新，線上永遠顯示舊版。
 * 本工具把「邊幾篇被 DB 覆蓋」變成可重現的報告。
 *
 * 用法：
 *   node scripts/blog-live-verify.cjs                                  # 讀 https://adwire.com.hk
 *   node scripts/blog-live-verify.cjs --base https://adwire.com.hk
 *   node scripts/blog-live-verify.cjs --dir ./live-snapshots          # 用已儲存的 <slug>.html
 *   node scripts/blog-live-verify.cjs --json report.json [--min-coverage 0.9]
 *   node scripts/blog-live-verify.cjs --selftest
 *
 * 比對規則（容忍 Next.js build 時的注入：TOC、中段 CTA、heading id、作者框）：
 *   - title：live <title> 去除品牌尾綴後須等於 repo.title。
 *   - description：live meta description / og:description 須等於 repo.excerpt。
 *   - content：repo 正文中的「顯著文字片段」至少 min-coverage（預設 0.9）出現在 live 頁面文字中。
 * 純閱讀工具：只做 GET 與檔案讀取，永不寫入網站、永不 deploy。
 */
const fs = require('node:fs');
const path = require('node:path');
const { readPosts } = require('./blog-integration.cjs');

function decodeEntities(t) {
  return String(t)
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(Number(d)))
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}
function toText(html) {
  return decodeEntities(String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ').trim();
}
function normalizeTitle(title) {
  return decodeEntities(String(title))
    .replace(/\s*[|｜\-–—]\s*ADWire[^|｜\-–—]*$/i, '')
    .replace(/\s*[|｜]\s*.*$/, '')
    .replace(/\s+/g, ' ').trim();
}
function significantFragments(html, minLen = 24) {
  const text = toText(html);
  return [...new Set(
    text.split(/(?<=[。！？!?；;])|\s{2,}/).map((s) => s.trim()).filter((s) => s.length >= minLen)
  )];
}
function extractLive(html) {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || '';
  const desc = /<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]*content=["']([^"']*)["']/i.exec(html)?.[1]
    || /<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["'](?:description|og:description)["']/i.exec(html)?.[1] || '';
  return { title: normalizeTitle(title), description: decodeEntities(desc).replace(/\s+/g, ' ').trim(), text: toText(html) };
}
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** Compare one repo post against a live HTML snapshot. Pure function. */
function comparePost(post, liveHtml, opts = {}) {
  const minCoverage = opts.minCoverage !== undefined ? opts.minCoverage : 0.9;
  const live = extractLive(liveHtml);
  const issues = [];
  if (!live.title) issues.push({ field: 'title', problem: 'no <title> found' });
  else if (live.title !== post.title) issues.push({ field: 'title', problem: 'mismatch', repo: post.title, live: live.title });
  if (live.description && live.description !== post.excerpt) {
    issues.push({ field: 'description', problem: 'mismatch', repo: post.excerpt, live: live.description });
  }
  const fragments = significantFragments(post.content);
  const hit = fragments.filter((f) => live.text.includes(f)).length;
  const coverage = fragments.length ? hit / fragments.length : 1;
  if (coverage < minCoverage) issues.push({ field: 'content', problem: 'stale/low coverage', repo: Math.round(coverage * 1000) / 1000, live: null });
  return { slug: post.slug, ok: issues.length === 0, coverage: Math.round(coverage * 1000) / 1000, issues };
}

function loadRepoPosts(sourceFile) {
  const posts = readPosts(fs.readFileSync(sourceFile, 'utf8')).posts;
  if (posts.length !== 27 || new Set(posts.map((p) => p.slug)).size !== 27) throw new Error('Expected exactly 27 unique repo posts');
  return posts;
}

async function fetchLive(base, slug, timeoutMs = 20000) {
  const url = base.replace(/\/$/, '') + '/blog/' + slug + '/';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'ADWire-live-verify/1.0' } });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
    return { url, html: await res.text() };
  } finally { clearTimeout(timer); }
}

async function run() {
  const argv = process.argv.slice(2);
  const flag = (name, fallback) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback; };
  const sourceFile = flag('--source', path.join(__dirname, '..', 'lib', 'blogData.ts'));
  const minCoverage = Number(flag('--min-coverage', '0.9'));
  const posts = loadRepoPosts(sourceFile);
  const dir = flag('--dir', null);
  const base = flag('--base', 'https://adwire.com.hk');
  const jsonOut = flag('--json', null);

  const results = [];
  for (const post of posts) {
    try {
      const html = dir
        ? fs.readFileSync(path.join(dir, post.slug + '.html'), 'utf8')
        : (await fetchLive(base, post.slug)).html;
      results.push(comparePost(post, html, { minCoverage }));
    } catch (e) {
      results.push({ slug: post.slug, ok: false, coverage: 0, issues: [{ field: '*', problem: 'fetch/read error: ' + e.message }] });
    }
  }
  const bad = results.filter((r) => !r.ok);
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ base, dir, minCoverage, total: results.length, mismatches: bad.length, results }, null, 2));
  console.log('── live 核對 ─────────────────────────────');
  console.log('  核對：', results.length, '篇　一致：', results.length - bad.length, '　不一致：', bad.length);
  for (const r of bad) console.log('  ✖', r.slug, r.issues.map((i) => i.field + ' ' + i.problem).join('; '));
  if (jsonOut) console.log('  報告：', jsonOut);
  process.exitCode = bad.length ? 1 : 0;
}

module.exports = { comparePost, extractLive, normalizeTitle, significantFragments, loadRepoPosts };

if (require.main === module) {
  if (process.argv.includes('--selftest')) {
    const { spawnSync } = require('node:child_process');
    const r = spawnSync(process.execPath, ['--test', path.join(__dirname, 'tests', 'blog-live-verify.test.cjs')], { stdio: 'inherit' });
    process.exitCode = r.status || 0;
  } else {
    run().catch((e) => { console.error(e.message); process.exitCode = 1; });
  }
}
