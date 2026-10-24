#!/usr/bin/env node
/**
 * gen-rsc-redirects.mjs — 修正 Next.js static export 的 RSC prefetch 404
 *
 * 問題（2026-10-24 實測，21 條 404）：
 *   next build（output: "export"）把 RSC payload 寫成「斜線」結構：
 *       /services/consulting/__next.services/consulting.txt
 *   client 卻用「點」prefetch：
 *       /services/consulting/__next.services.consulting.txt
 *   動態路由更差：build 寫的是佔位名 $d$slug.txt，而 client 請求真實 slug。
 *   → prefetch 全部 404，Link 預取失效，每次撳 nav 退化成全頁載入。
 *
 * 解法：在 Cloudflare Pages 的 _redirects 產生 200 rewrite（內部映射，
 * 不是 301 外部跳轉），純字串對應，不改 build 輸出、不需 Functions。
 */

import { readdirSync, statSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, relative, sep, basename } from "node:path";

const OUT = process.argv[2] || "out";
const DEST = join(OUT, "_redirects");
const MAX_RULES = 2000;
const MARK_START = "# >>> RSC-PREFETCH-REWRITES (auto-generated, do not edit) >>>";
const MARK_END = "# <<< RSC-PREFETCH-REWRITES <<<";

if (!existsSync(OUT)) {
  console.error(`[rsc] 找不到目錄：${OUT}`);
  process.exit(1);
}

const toPosix = (p) => p.split(sep).join("/");

function listDir(dir) {
  try { return readdirSync(dir); } catch { return []; }
}

function isDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

function walkFiles(dir, acc = []) {
  for (const name of listDir(dir)) {
    const p = join(dir, name);
    if (isDir(p)) walkFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}

function findNextDirs(dir, acc = []) {
  for (const name of listDir(dir)) {
    const p = join(dir, name);
    if (!isDir(p)) continue;
    if (name.startsWith("__next.")) acc.push(p);
    else findNextDirs(p, acc);
  }
  return acc;
}

const rules = new Map();
const add = (from, to) => {
  if (from === to || rules.has(from)) return;
  if (rules.size >= MAX_RULES) return;
  rules.set(from, to);
};

// A. 由實際存在的檔案反推「點」路徑
for (const dirAbs of findNextDirs(OUT)) {
  const dirRel = toPosix(relative(OUT, dirAbs));
  const parts = dirRel.split("/");
  const idx = parts.findIndex((p) => p.startsWith("__next."));
  if (idx === -1) continue;

  const prefix = parts.slice(0, idx).join("/");
  const segDir = parts[idx];
  const between = parts.slice(idx + 1).join("/");

  for (const fileAbs of walkFiles(dirAbs)) {
    const fileRel = toPosix(relative(dirAbs, fileAbs));
    const realPath = "/" + [prefix, segDir, between, fileRel].filter(Boolean).join("/");
    if (!existsSync(join(OUT, realPath))) continue;
    const dottedPath = "/" + [prefix, `${segDir}.${fileRel.split("/").join(".")}`].filter(Boolean).join("/");
    add(dottedPath, realPath);
  }
}

// B. 動態路由：真實 slug → $d$param
for (const dirAbs of findNextDirs(OUT)) {
  const routeDir = join(dirAbs, "..");
  const routeRel = toPosix(relative(OUT, routeDir));
  if (!existsSync(join(routeDir, "index.html"))) continue;

  const segDir = basename(dirAbs);
  const lastSeg = basename(routeRel);
  const routeUrl = "/" + routeRel;
  const entries = listDir(dirAbs);

  const pageFile = [`${lastSeg}.txt`, ...entries.filter((e) => /^\$d\$.*\.txt$/.test(e))]
    .find((f) => existsSync(join(dirAbs, f)));
  if (pageFile) add(`${routeUrl}/${segDir}.${lastSeg}.txt`, `${routeUrl}/${segDir}/${pageFile}`);

  const pageDir = [lastSeg, ...entries.filter((e) => /^\$d\$/.test(e) && isDir(join(dirAbs, e)))]
    .find((d) => existsSync(join(dirAbs, d, "__PAGE__.txt")));
  if (pageDir) {
    add(`${routeUrl}/${segDir}.${lastSeg}.__PAGE__.txt`, `${routeUrl}/${segDir}/${pageDir}/__PAGE__.txt`);
  }
}

// 寫檔（保留標記區塊外的手寫規則）
let existing = "";
if (existsSync(DEST)) {
  existing = readFileSync(DEST, "utf8");
  const s = existing.indexOf(MARK_START);
  const e = existing.indexOf(MARK_END);
  if (s !== -1 && e !== -1) existing = (existing.slice(0, s) + existing.slice(e + MARK_END.length)).trim();
}

const block = [
  MARK_START,
  `# 由 npm postbuild 自動生成；共 ${rules.size} 條`,
  "# 目的：Next client 用「點」prefetch RSC payload → 映射去實際「斜線」檔案（200 rewrite）",
  ...[...rules.entries()].sort().map(([from, to]) => `${from}  ${to}  200`),
  MARK_END,
].join("\n");

writeFileSync(DEST, [existing.trim(), block].filter(Boolean).join("\n\n") + "\n", "utf8");
console.log(`[rsc] 已寫入 ${rules.size} 條 rewrite → ${DEST}`);
if (rules.size === 0) console.warn("[rsc] ⚠️ 冇搵到任何 __next.* 目錄");
