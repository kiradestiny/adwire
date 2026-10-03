'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { comparePost, extractLive, normalizeTitle, loadRepoPosts } = require('../blog-live-verify.cjs');
const { articleHtml, slugs27 } = require('./_fixtures.cjs');

function repoPost(i) {
  return {
    slug: 'post-' + i, title: '測試標題 ' + i, excerpt: '測試摘要 ' + i,
    content: articleHtml('post-' + i, i),
  };
}
function liveHtml(i, { title, body } = {}) {
  const t = title || ('測試標題 ' + i + ' | ADWire Agency');
  const b = body || articleHtml('post-' + i, i);
  return '<!doctype html><html><head><title>' + t + '</title>'
    + '<meta name="description" content="測試摘要 ' + i + '"></head>'
    + '<body><nav>目錄</nav>' + b + '<div class="cta">想了解報價？</div></body></html>';
}

test('normalizeTitle strips the ADWire brand suffix and separators', () => {
  assert.equal(normalizeTitle('小紅書推廣攻略 | ADWire Agency'), '小紅書推廣攻略');
  assert.equal(normalizeTitle('A – B | ADWire Agency Limited'), 'A – B');
  assert.equal(normalizeTitle('純標題'), '純標題');
});

test('comparePost passes when live matches title/description and covers content', () => {
  const r = comparePost(repoPost(1), liveHtml(1));
  assert.equal(r.ok, true, JSON.stringify(r.issues));
  assert.ok(r.coverage >= 0.9);
});

test('comparePost detects a stale DB snapshot (old title + old content)', () => {
  const r = comparePost(repoPost(2), liveHtml(2, { title: '舊標題 | ADWire Agency', body: '<p>完全不同的舊內容，來自後台 2026-09-20 的舊快照。</p>' }));
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === 'title'));
  assert.ok(r.issues.some((i) => i.field === 'content'));
  assert.ok(r.coverage < 0.9);
});

test('comparePost flags description mismatch only when meta is present', () => {
  const live = liveHtml(3).replace('content="測試摘要 3"', 'content="後台舊摘要"');
  const r = comparePost(repoPost(3), live);
  assert.ok(r.issues.some((i) => i.field === 'description'));
  const noMeta = liveHtml(3, {}).replace(/<meta[^>]*description[^>]*>/, '');
  assert.equal(comparePost(repoPost(3), noMeta).issues.some((i) => i.field === 'description'), false);
});

test('extractLive reads title/description in either attribute order', () => {
  const a = extractLive('<title>X | ADWire</title><meta property="og:description" content="D">');
  assert.equal(a.title, 'X');
  assert.equal(a.description, 'D');
  const b = extractLive('<meta content="D2" name="description">');
  assert.equal(b.description, 'D2');
});

test('loadRepoPosts parses the real 27-post blogData.ts without modifying it', () => {
  const file = path.join(__dirname, '..', '..', 'lib', 'blogData.ts');
  assert.ok(fs.existsSync(file), 'lib/blogData.ts must exist');
  const before = fs.readFileSync(file, 'utf8');
  const posts = loadRepoPosts(file);
  assert.equal(posts.length, 27);
  assert.equal(new Set(posts.map((p) => p.slug)).size, 27);
  assert.ok(posts.every((p) => typeof p.content === 'string' && p.content.length > 0));
  assert.equal(fs.readFileSync(file, 'utf8'), before, 'verifier is read-only');
});
