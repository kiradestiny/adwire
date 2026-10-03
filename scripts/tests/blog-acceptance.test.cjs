'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { acceptPosts } = require('../blog-acceptance.cjs');
const { articleHtml, slugs27 } = require('./_fixtures.cjs');

function makePosts() {
  const slugs = slugs27();
  return slugs.map((slug, i) => ({
    id: i, slug, title: '標題 ' + i, excerpt: '摘要 ' + i, date: '2026-09-21', category: 'SEO',
    readTime: '8 min read', imageColor: 'blue', image: '/hero-' + i + '.webp', tags: ['SEO'],
    updatedAt: '2026-10-03', content: articleHtml(slug, i),
  }));
}
const baseline = () => makePosts().map(({ content, ...rest }) => ({ ...rest, content: 'x' }));

test('valid 27 posts pass every gate with no errors', () => {
  const report = acceptPosts(makePosts(), { originals: baseline() });
  assert.deepEqual(report.errors, []);
  assert.equal(report.stats.length, 27);
});

test('detects wrong count and duplicate slugs (不重不漏)', () => {
  const posts = makePosts();
  assert.match(acceptPosts(posts.slice(0, 26), { originals: baseline() }).errors.join(' '), /exactly 27/i);
  const dup = JSON.parse(JSON.stringify(posts));
  dup[1].slug = dup[0].slug;
  assert.match(acceptPosts(dup, { originals: baseline() }).errors.join(' '), /duplicate|unexpected|missing/i);
});

test('detects slug set drift vs baseline', () => {
  const posts = makePosts();
  posts[0].slug = 'brand-new-slug';
  const errs = acceptPosts(posts, { originals: baseline() }).errors.join(' ');
  assert.match(errs, /missing slugs vs baseline/);
  assert.match(errs, /unexpected slugs not in baseline/);
});

test('detects forbidden structures: H1, H2, literal **, too few FAQ, too few H3, short text', () => {
  const base = makePosts();
  const clone = () => JSON.parse(JSON.stringify(base));
  const slug0 = base[0].slug;

  const withH1 = clone(); withH1[0].content += '<h1>BAD</h1>';
  assert.match(acceptPosts(withH1, { originals: baseline() }).errors.join(' '), new RegExp(slug0 + ':.*<h1>'));

  const withH2 = clone(); withH2[0].content += '<h2>BAD</h2>';
  assert.match(acceptPosts(withH2, { originals: baseline() }).errors.join(' '), /must not contain <h2>/);

  const withStars = clone(); withStars[0].content += '<p>**粗體**</p>';
  assert.match(acceptPosts(withStars, { originals: baseline() }).errors.join(' '), /literal \*\*/);

  const fewFaq = clone(); fewFaq[0].content = fewFaq[0].content.replace(/<div itemscope itemtype="https:\/\/schema\.org\/Question">[\s\S]*?<\/div><\/div><\/div>/, '');
  assert.match(acceptPosts(fewFaq, { originals: baseline() }).errors.join(' '), /FAQ microdata/);

  const fewH3 = clone(); fewH3[0].content = '<h3>one</h3><p>短</p>';
  assert.match(acceptPosts(fewH3, { originals: baseline() }).errors.join(' '), /<h3>/);

  const short = clone(); short[0].content = '<h3>a</h3><h3>b</h3><h3>c</h3>'.repeat(1);
  assert.match(acceptPosts(short, { originals: baseline() }).errors.join(' '), /plain-text length/);
});

test('detects internal links to unknown blog slug and unknown service page', () => {
  const base = makePosts();
  const bad = JSON.parse(JSON.stringify(base));
  bad[2].content += '<a href="/blog/does-not-exist/">x</a><a href="/services/not-a-service/">y</a>';
  const errs = acceptPosts(bad, { originals: baseline() }).errors.join(' ');
  assert.match(errs, /unknown slug: does-not-exist/);
  assert.match(errs, /unknown page: not-a-service/);
});

test('requireNoH2 can be relaxed for legacy articles when explicitly requested', () => {
  const base = makePosts();
  const h2 = JSON.parse(JSON.stringify(base));
  h2[0].content += '<h2>legacy</h2>';
  assert.deepEqual(acceptPosts(h2, { originals: baseline(), requireNoH2: false }).errors, []);
});

test('DEFAULT_SERVICES mirrors the real app/services directories (regression: production was missing)', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const { DEFAULT_SERVICES } = require('../blog-acceptance.cjs');
  const dir = path.join(__dirname, '..', '..', 'app', 'services');
  const real = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  assert.deepEqual(DEFAULT_SERVICES, real);
  assert.ok(DEFAULT_SERVICES.includes('production'), 'production service page link must be accepted');
});
