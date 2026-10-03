'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildFigure, insertFigures, processFalImage, addOverlay, briefToSvgOverlay } = require('../blog-image-pipeline.cjs');
const { articleHtml, briefs } = require('./_fixtures.cjs');

function tmpDir() {
  return fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'blogimg-'));
}

test('buildFigure emits exact attribute order and escapes untrusted text', () => {
  const html = buildFigure(
    { alt: 'A "quote" & <tag>', title: 'T & T', caption: '說明 <b>不應</b> 執行', width: 1200, height: 675 },
    { path: '/blog/figures/x.webp' }
  );
  assert.match(html, /^<figure class="blog-figure my-10">/);
  assert.ok(html.includes('<img src="/blog/figures/x.webp" alt="A &quot;quote&quot; &amp; &lt;tag&gt;" title="T &amp; T" width="1200" height="675" loading="lazy" decoding="async"'));
  assert.ok(html.includes('說明 &lt;b&gt;不應&lt;/b&gt; 執行'));
  assert.ok(html.endsWith('</figure>'));
});

test('buildFigure rejects missing alt/caption/dimensions and non-webp local src', () => {
  assert.throws(() => buildFigure({ width: 10, height: 10, caption: 'c' }, { path: '/x.webp' }), /alt/i);
  assert.throws(() => buildFigure({ alt: 'a', width: 10, height: 10 }, { path: '/x.webp' }), /caption/i);
  assert.throws(() => buildFigure({ alt: 'a', caption: 'c', width: 10 }, { path: '/x.webp' }), /width|height/i);
  assert.throws(() => buildFigure({ alt: 'a', caption: 'c', width: 1, height: 1 }, { path: '/x.png' }), /webp/i);
});

test('insertFigures inserts exactly two figures, preserves hero and never deletes content', () => {
  const slug = 'post-0';
  const hero = '<img src="/hero-0.webp" alt="hero" width="1200" height="630">';
  const html = hero + articleHtml(slug, 0);
  const out = insertFigures(html, briefs(slug), [
    { slug, index: 1, path: '/blog/figures/' + slug + '-1.webp', width: 1600, height: 900 },
    { slug, index: 2, path: '/blog/figures/' + slug + '-2.webp', width: 1600, height: 900 },
  ]);
  assert.equal((out.match(/<figure\b/gi) || []).length, 2);
  assert.equal((out.match(/<img\b/gi) || []).length, (html.match(/<img\b/gi) || []).length + 2);
  assert.ok(out.includes(hero), 'hero image preserved');
  assert.ok(out.includes('/blog/figures/' + slug + '-1.webp'));
  assert.ok(out.includes('/blog/figures/' + slug + '-2.webp'));
  // figures must not land before the first heading (i.e., inside/before the lead is fine, but
  // the first section anchor must precede the first figure for section-targeted brief 1).
  const firstFig = out.indexOf('<figure');
  const firstH3 = out.indexOf('<h3');
  assert.ok(firstH3 >= 0 && firstH3 < firstFig, 'section-targeted figure inserted after a heading');

  // idempotent: re-running does not duplicate
  const again = insertFigures(out, briefs(slug), [
    { slug, index: 1, path: '/blog/figures/' + slug + '-1.webp', width: 1600, height: 900 },
    { slug, index: 2, path: '/blog/figures/' + slug + '-2.webp', width: 1600, height: 900 },
  ]);
  assert.equal(again, out);
});

test('insertFigures requires exactly two briefs and two images', () => {
  const slug = 'post-0';
  const html = articleHtml(slug, 0);
  assert.throws(() => insertFigures(html, briefs(slug).slice(0, 1), [{ slug, path: '/a.webp' }]), /exactly 2/i);
  assert.throws(() => insertFigures('', briefs(slug), [{ slug, path: '/a.webp' }, { slug, path: '/b.webp' }]), /empty/i);
});

test('processFalImage compresses a synthetic PNG to WebP with correct metadata', async () => {
  const dir = tmpDir();
  const png = path.join(dir, 'src.png');
  const webp = path.join(dir, 'out.webp');
  const sharp = require('sharp');
  await sharp({ create: { width: 40, height: 30, channels: 3, background: { r: 12, g: 80, b: 160 } } }).png().toFile(png);
  const before = fs.readFileSync(png);
  const res = await processFalImage(png, webp);
  assert.equal(res.format, 'webp');
  assert.equal(res.width, 40);
  assert.equal(res.height, 30);
  assert.ok(res.bytes > 0 && res.bytes < before.length);
  assert.equal(await sharp(webp).metadata().then((m) => m.format), 'webp');
  assert.deepEqual(fs.readFileSync(png), before, 'source image untouched');
});

test('processFalImage rejects empty and missing inputs without fabricating output', async () => {
  const dir = tmpDir();
  const empty = path.join(dir, 'empty.png');
  fs.writeFileSync(empty, '');
  await assert.rejects(() => processFalImage(empty, path.join(dir, 'o.webp')), /empty/i);
  await assert.rejects(() => processFalImage(path.join(dir, 'nope.png'), path.join(dir, 'o.webp')), /not found/i);
});

test('addOverlay composites an overlay onto a WebP and briefToSvgOverlay escapes text', async () => {
  const dir = tmpDir();
  const sharp = require('sharp');
  const base = path.join(dir, 'base.webp');
  await sharp({ create: { width: 200, height: 120, channels: 3, background: { r: 15, g: 76, b: 129 } } }).webp().toFile(base);
  const overlayPng = path.join(dir, 'ov.png');
  await sharp({ create: { width: 60, height: 20, channels: 4, background: { r: 245, g: 166, b: 35, alpha: 1 } } }).png().toFile(overlayPng);
  const dest = path.join(dir, 'composed.webp');
  const res = await addOverlay(base, overlayPng, dest, { overlayWidth: 60, top: 100 });
  assert.equal(res.width, 200);
  assert.ok(fs.existsSync(dest));
  const svg = briefToSvgOverlay(['你 < 我', '900+'], { width: 800, height: 200 });
  assert.ok(svg.includes('你 &lt; 我'));
  assert.throws(() => briefToSvgOverlay(['   ']), /empty/i);
});
