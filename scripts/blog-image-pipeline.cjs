#!/usr/bin/env node
'use strict';
/**
 * blog-image-pipeline.cjs — fal.ai 生成圖 → WebP → <figure> 寫入流程
 *
 * 職責分工（重要）：
 *   - parent 負責呼叫 fal.ai 付費 API（openai/gpt-image-2.5 text-to-image）並把
 *     原始圖檔交到本模組。本模組唔會、亦唔應該自己呼叫任何付費 API 或讀取 secret。
 *   - 本模組只負責確定性的後處理：壓縮成 WebP、按 brief 組成 <figure>，插入文章。
 *
 * 為何要這樣分工：
 *   模型寫中文／精確數字不可靠，所以文字一律用後製 overlay（SVG／PNG composite），
 *   唔靠模型寫字。本模組提供 addOverlay / briefToSvgOverlay 兩個後製入口。
 *
 * 安全設計：
 *   - 每篇必須恰好 2 張圖（briefs 與 images 數量必須相等，否則拋錯，不靜默）。
 *   - 只插入，永不刪除或改動原有 hero／既有內容。
 *   - 同一圖片 src 已存在時略過（可安全重跑）。
 *   - 壓縮用 tmp 檔再 rename，避免半寫入。
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SERVICE_IMG_DIR = '/blog/figures';

/** Windows 上 libvips 寫完檔案可能仍短暫鎖住 handle，rename/unlink 會 EBUSY。加短重試。 */
function withRetry(fn, attempts = 8) {
  let last;
  for (let i = 0; i < attempts; i += 1) {
    try { return fn(); } catch (e) { last = e; if (!/EBUSY|EPERM|EACCES/.test(e.code || '')) throw e;
      const end = Date.now() + 60; while (Date.now() < end) { /* brief spin to release handle */ } }
  }
  throw last;
}
function safeUnlink(file) { try { withRetry(() => fs.rmSync(file, { force: true })); } catch { /* cleanup must not mask the real error */ } }

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pick(source, keys) {
  for (const k of keys) if (source && source[k] !== undefined && source[k] !== null && source[k] !== '') return source[k];
  return undefined;
}

/** 由 brief + 已生成圖 manifest 組成一個 <figure>。所有欄位必填，缺失即拋錯。 */
function buildFigure(brief, image) {
  const src = pick(image, ['path', 'src', 'url', 'file']) || pick(brief, ['path', 'src', 'url']);
  if (!src) throw new Error('Figure missing image src (path/src/url)');
  if (!/^\//.test(src) && !/^https?:\/\//.test(src)) throw new Error('Figure src must be root-relative or absolute URL: ' + src);
  if (!/\.webp(?:\?|$)/i.test(src) && !/^https?:\/\//.test(src)) throw new Error('Local figure src must be .webp: ' + src);

  const alt = pick(brief, ['alt', 'altText']) || pick(image, ['alt', 'altText']);
  const title = pick(brief, ['title', 'heading']) || pick(image, ['title']) || alt;
  const caption = pick(brief, ['caption', 'figcaption', 'description', 'desc']) || pick(image, ['caption']);
  const width = Number(pick(brief, ['width']) || pick(image, ['width']));
  const height = Number(pick(brief, ['height']) || pick(image, ['height']));

  if (!alt || !String(alt).trim()) throw new Error('Figure missing alt text: ' + src);
  if (!caption || !String(caption).trim()) throw new Error('Figure missing caption: ' + src);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error('Figure missing valid width/height: ' + src);
  if (caption.length > 300) throw new Error('Figure caption too long (' + caption.length + '): ' + src);

  return [
    '<figure class="blog-figure my-10">',
    '  <img src="' + esc(src) + '" alt="' + esc(alt) + '" title="' + esc(title) + '" width="' + width + '" height="' + height + '" loading="lazy" decoding="async" class="w-full h-auto rounded-2xl border border-gray-100" />',
    '  <figcaption class="mt-3 text-sm text-gray-500 text-center leading-relaxed">' + esc(caption) + '</figcaption>',
    '</figure>',
  ].join('\n');
}

/** 收集文中所有 h2/h3 的（結束位置, 純文字）。 */
function headingAnchors(html) {
  const out = [];
  const re = /<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({ end: m.index + m[0].length, text: m[3].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(), tag: m[1].toLowerCase() });
  }
  return out;
}

/**
 * 把恰好 2 張圖插入文章。定位規則：
 *   1. brief.section 若命中某個 h2/h3 文字（包含）→ 插在該標題之後；
 *   2. 否則預設插在第 2、第 4 個標題之後（0-based 1、3）；
 *   3. 標題不足時，退到文章 55% / 85% 位置（避免全部堆在最尾）。
 * 已有相同 src 的圖片會略過（可安全重跑）。不刪除或改動任何原有內容。
 */
function insertFigures(html, briefs, images) {
  if (!Array.isArray(briefs) || !Array.isArray(images)) throw new Error('insertFigures expects briefs[] and images[]');
  if (briefs.length !== 2 || images.length !== 2) throw new Error('Expected exactly 2 briefs and 2 generated images, got ' + briefs.length + '/' + images.length);
  if (typeof html !== 'string' || !html.trim()) throw new Error('insertFigures: empty article HTML');

  const anchors = headingAnchors(html);
  const existing = new Set([...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)].map((m) => m[1]));

  const insertions = [];
  const usedOffsets = new Set();
  briefs.forEach((brief, i) => {
    const image = images[i];
    if (image.slug !== undefined && brief.slug !== undefined && image.slug !== brief.slug) throw new Error('Image/brief slug mismatch at index ' + i);
    const htmlFigure = buildFigure(brief, image);
    const src = pick(image, ['path', 'src', 'url', 'file']) || pick(brief, ['path', 'src', 'url']);
    if (existing.has(src)) return; // idempotent

    let offset = null;
    const section = pick(brief, ['section', 'afterHeading', 'anchor', 'insertAfterHeading']);
    if (section) {
      const hit = anchors.find((a) => a.text.includes(String(section).trim()));
      if (hit) offset = hit.end;
    }
    if (offset === null) {
      const fallbackIndex = i === 0 ? 1 : 3;
      if (anchors.length > fallbackIndex) offset = anchors[fallbackIndex].end;
      else if (anchors.length > 0) offset = Math.max(anchors[anchors.length - 1].end, html.length - 1);
      else offset = Math.round(html.length * (i === 0 ? 0.55 : 0.85));
    }
    while (usedOffsets.has(offset)) offset = Math.min(offset + 1, html.length);
    usedOffsets.add(offset);
    insertions.push({ offset, text: '\n' + htmlFigure + '\n' });
  });

  let out = html;
  for (const ins of insertions.sort((a, b) => b.offset - a.offset)) {
    out = out.slice(0, ins.offset) + ins.text + out.slice(ins.offset);
  }
  if ((out.match(/<figure\b/gi) || []).length < (html.match(/<figure\b/gi) || []).length + insertions.length) {
    throw new Error('Figure insertion lost content');
  }
  if ((out.match(/<img\b/gi) || []).length !== (html.match(/<img\b/gi) || []).length + insertions.length) {
    throw new Error('Image insertion count mismatch');
  }
  return out;
}

/** 把 fal.ai 原始圖壓成 WebP（tmp → rename，避免半寫入）。不使用任何網絡。 */
async function processFalImage(src, dest, opts = {}) {
  if (!fs.existsSync(src)) throw new Error('Fal image not found: ' + src);
  let sharp;
  try { sharp = require('sharp'); } catch (e) { throw new Error('sharp is required for WebP compression: ' + e.message); }
  const stat = fs.statSync(src);
  if (stat.size === 0) throw new Error('Fal image is empty: ' + src);

  const meta = await sharp(src).metadata();
  if (meta.format === 'svg') throw new Error('Refusing to rasterize SVG input as a fal image: ' + src);

  const maxWidth = opts.width || 1600;
  const quality = opts.quality || 82;
  fs.mkdirSync(path.dirname(path.resolve(dest)), { recursive: true });
  const tmp = dest + '.tmp-' + crypto.randomUUID() + '.webp';
  try {
    let pipe = sharp(src, { failOn: 'error' }).rotate();
    if (meta.width && meta.width > maxWidth) pipe = pipe.resize({ width: maxWidth, withoutEnlargement: true });
    await pipe.webp({ quality, effort: 4 }).toFile(tmp);
    withRetry(() => fs.renameSync(tmp, dest));
    const out = await sharp(dest).metadata();
    if (out.format !== 'webp') throw new Error('Compression did not produce WebP');
    if (!out.width || !out.height) throw new Error('Compressed image has no dimensions');
    return { path: dest, width: out.width, height: out.height, bytes: fs.statSync(dest).size, format: 'webp' };
  } finally {
    safeUnlink(tmp);
  }
}

/** 把一個 PNG/WebP overlay 疊到已壓好的 WebP 上（用於中文／精確數字後製，不靠模型寫字）。 */
async function addOverlay(baseWebp, overlayFile, dest, opts = {}) {
  if (!fs.existsSync(baseWebp)) throw new Error('Base image not found: ' + baseWebp);
  if (!fs.existsSync(overlayFile)) throw new Error('Overlay not found: ' + overlayFile);
  let sharp;
  try { sharp = require('sharp'); } catch (e) { throw new Error('sharp is required for overlays: ' + e.message); }
  const base = sharp(baseWebp);
  const bg = await base.metadata();
  const overlay = await sharp(overlayFile).resize({ width: opts.overlayWidth || Math.round((bg.width || 1200) * 0.86) }).png().toBuffer();
  const meta = await sharp(overlay).metadata();
  const gravity = opts.gravity || 'south';
  const top = typeof opts.top === 'number' ? opts.top : Math.round(((bg.height || 0) - (meta.height || 0)) * 0.72);
  const left = Math.round((((bg.width || 0) - (meta.width || 0)) / 2));
  const tmp = dest + '.tmp-' + crypto.randomUUID() + '.webp';
  try {
    await sharp(baseWebp)
      .composite([{ input: overlay, top: Math.max(0, top), left: Math.max(0, left), blend: 'over' }])
      .webp({ quality: opts.quality || 85 })
      .toFile(tmp);
    withRetry(() => fs.renameSync(tmp, dest));
    const out = await sharp(dest).metadata();
    return { path: dest, width: out.width, height: out.height, bytes: fs.statSync(dest).size };
  } finally {
    safeUnlink(tmp);
  }
}

/** 產生文字 overlay 的 SVG（parent 可用 sharp/其他工具 rasterize；本函數只回字串）。 */
function briefToSvgOverlay(text, opts = {}) {
  const width = opts.width || 1200;
  const height = opts.height || 220;
  const font = opts.font || '"Microsoft JhengHei","PingFang HK",sans-serif';
  const size = opts.size || 52;
  const lines = Array.isArray(text) ? text : [text];
  if (!lines.length || lines.some((l) => !String(l).trim())) throw new Error('briefToSvgOverlay: empty text line');
  const body = lines
    .map((line, i) =>
      '<text x="' + width / 2 + '" y="' + (height / 2 + (i - (lines.length - 1) / 2) * size * 1.25) + '" text-anchor="middle" dominant-baseline="middle" font-family="' + esc(font) + '" font-size="' + size + '" font-weight="700" fill="#ffffff">' + esc(line) + '</text>'
    )
    .join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '"><rect width="' + width + '" height="' + height + '" rx="18" fill="#0f4c81" fill-opacity="0.82"/>' + body + '</svg>';
}

module.exports = { buildFigure, insertFigures, processFalImage, addOverlay, briefToSvgOverlay, SERVICE_IMG_DIR };

if (require.main === module) {
  console.error('blog-image-pipeline.cjs is a library; run its tests: node --test scripts/tests/blog-image-pipeline.test.cjs');
  process.exitCode = 1;
}
