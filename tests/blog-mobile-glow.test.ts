/**
 * tests/blog-mobile-glow.test.ts — lib/blog-html.ts 的原始文章 HTML glow 標記器單元測試
 *
 * 執行：node --experimental-strip-types tests/blog-mobile-glow.test.ts
 *      （已掛入 package.json 的 npm test）
 *
 * 目的：驗證「伺服器渲染邊界」的純函式 markMobileGlowDecorations(html)。
 *   為何需要：全站 .tsx 的 64 個裝飾性 glow 已由第一個執行者標記 data-mobile-glow，
 *   但兩篇文章（/google-meta-ads-guide/、/hong-kong-brand-china-market-guide/）的正文
 *   glow 來自 raw HTML（post.content），繞過 JSX，故需在 buildTocAndInjectIds 這段
 *   渲染邊界補標記（不改 blogData.ts／DB）。
 *
 * 為何用動態 import：Node ESM 需要顯式 .ts 副檔名，但 tsconfig 未啟用
 *   allowImportingTsExtensions；型別用 extensionless 的 import type（執行時抹除），
 *   執行時再以計算出的字串動態 import。只依賴純模組 lib/blog-html.ts，
 *   不引入任何 extensionless 執行期依賴（故不 import blog-enhance.ts／blogData.ts）。
 *
 * 為何用手寫 runner：repo 現時沒有測試框架依賴，純函式用 assert 式計數器已足夠。
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { markMobileGlowDecorations as MarkFn } from "../lib/blog-html";

type BlogHtmlModule = { markMobileGlowDecorations: typeof MarkFn };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const moduleSpecifier = pathToFileURL(path.join(ROOT, "lib", "blog-html.ts")).href;
const mod = (await import(moduleSpecifier)) as BlogHtmlModule;
const mark = mod.markMobileGlowDecorations;

// ── 迷你測試框架 ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail = ""): void {
  if (cond) {
    passed += 1;
    console.log(`  \u2705 ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`  \u274c ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

/** 兩字串「逐字元」相等（保留所有空白／屬性次序），失敗時顯示首個差異位置。 */
function eq(name: string, actual: string, expected: string): void {
  if (actual === expected) {
    passed += 1;
    console.log(`  \u2705 ${name}`);
    return;
  }
  let at = 0;
  const n = Math.min(actual.length, expected.length);
  while (at < n && actual[at] === expected[at]) at += 1;
  check(
    name,
    false,
    `first diff @${at}\n    actual  : ${JSON.stringify(actual.slice(Math.max(0, at - 30), at + 30))}\n    expected: ${JSON.stringify(expected.slice(Math.max(0, at - 30), at + 30))}`,
  );
}

const MARK = ' data-mobile-glow="true" aria-hidden="true"';
const countMarks = (s: string): number => (s.match(/data-mobile-glow="true"/g) || []).length;

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n1) 空的裝飾性 glow：補上 data-mobile-glow/aria-hidden（插入於 <div 之後）");

// 實際文章形狀：外層卡片 → 絕對定位遮罩容器 → 兩個空 glow。
const realCard =
  '<div class="bg-gradient-to-br from-[#0f4c81] to-[#1a5f9a] rounded-2xl p-8 text-white text-center my-10 relative overflow-hidden">\r\n' +
  '  <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">\r\n' +
  '    <div class="absolute top-5 left-5 w-32 h-32 bg-white rounded-full blur-2xl"></div>\r\n' +
  '    <div class="absolute bottom-5 right-5 w-48 h-48 bg-[#f5a623] rounded-full blur-2xl"></div>\r\n' +
  "  </div>\r\n" +
  "</div>";
const realCardExpected =
  '<div class="bg-gradient-to-br from-[#0f4c81] to-[#1a5f9a] rounded-2xl p-8 text-white text-center my-10 relative overflow-hidden">\r\n' +
  '  <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">\r\n' +
  `    <div${MARK} class="absolute top-5 left-5 w-32 h-32 bg-white rounded-full blur-2xl"></div>\r\n` +
  `    <div${MARK} class="absolute bottom-5 right-5 w-48 h-48 bg-[#f5a623] rounded-full blur-2xl"></div>\r\n` +
  "  </div>\r\n" +
  "</div>";
eq("actual article card: only the 2 empty glows are marked, wrapper/outer untouched", mark(realCard), realCardExpected);
check("actual article card: exactly 2 marks", countMarks(mark(realCard)) === 2);

// 單一 glow + 任意值 blur 工具類（blur-[Npx]）+ 額外 filter 工具類
const arbitrary =
  '<div class="absolute top-[-10%] right-[5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full filter blur-[130px]"></div>';
eq(
  "blur-[Npx] + filter utility: marked",
  mark(arbitrary),
  '<div data-mobile-glow="true" aria-hidden="true" class="absolute top-[-10%] right-[5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full filter blur-[130px]"></div>',
);

// 大寫標籤
eq(
  "uppercase <DIV>: marked at the right offset",
  mark('<DIV class="absolute rounded-full blur-2xl"></DIV>'),
  '<DIV data-mobile-glow="true" aria-hidden="true" class="absolute rounded-full blur-2xl"></DIV>',
);

// 只含空白與註解 → 仍算「空」
eq(
  "whitespace + HTML comment only: still empty → marked",
  mark('<div class="absolute rounded-full blur-2xl">   <!-- decorative -->  </div>'),
  '<div data-mobile-glow="true" aria-hidden="true" class="absolute rounded-full blur-2xl">   <!-- decorative -->  </div>',
);

// 同一標籤內含引號包住的 '>'（不得破壞屬性）
eq(
  "quoted '>' inside a sibling attribute is preserved",
  mark('<div class="absolute rounded-full blur-2xl" title="a > b" data-note="x"></div>'),
  '<div data-mobile-glow="true" aria-hidden="true" class="absolute rounded-full blur-2xl" title="a > b" data-note="x"></div>',
);

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n2) 冪等與既有屬性：不重複、不覆寫");

eq(
  "already marked (data-mobile-glow=true): byte-identical",
  mark('<div data-mobile-glow="true" aria-hidden="true" class="absolute rounded-full blur-2xl"></div>'),
  '<div data-mobile-glow="true" aria-hidden="true" class="absolute rounded-full blur-2xl"></div>',
);
eq("idempotent: mark(mark(card)) === mark(card)", mark(mark(realCard)), realCardExpected);
eq("idempotent: mark(mark(arbitrary)) === mark(arbitrary)", mark(mark(arbitrary)), mark(arbitrary));

eq(
  "node already aria-hidden=true: adds only data-mobile-glow (no duplicate aria-hidden)",
  mark('<div class="absolute rounded-full blur-2xl" aria-hidden="true"></div>'),
  '<div data-mobile-glow="true" class="absolute rounded-full blur-2xl" aria-hidden="true"></div>',
);

eq(
  'explicit opt-out data-mobile-glow="false": untouched',
  mark('<div data-mobile-glow="false" class="absolute rounded-full blur-2xl"></div>'),
  '<div data-mobile-glow="false" class="absolute rounded-full blur-2xl"></div>',
);
eq(
  'explicit opt-out aria-hidden="false": untouched (not coerced)',
  mark('<div class="absolute rounded-full blur-2xl" aria-hidden="false"></div>'),
  '<div class="absolute rounded-full blur-2xl" aria-hidden="false"></div>',
);

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n3) 反向檢查：非空、媒體／logo、互動、非 glow 屬性一律不動");

const negatives: [string, string][] = [
  ["non-empty (child element)", '<div class="absolute rounded-full blur-2xl"><span>hi</span></div>'],
  ["non-empty (text)", '<div class="absolute rounded-full blur-2xl">x</div>'],
  ["non-empty (image child)", '<div class="absolute rounded-full blur-2xl"><img src="/blog/logo.png" alt="logo"></div>'],
  ["img tag itself", '<img class="absolute rounded-full blur-2xl" src="/blog/logo.png" alt="logo">'],
  ["svg tag itself", '<svg class="absolute rounded-full blur-2xl" viewBox="0 0 10 10"></svg>'],
  ["missing absolute", '<div class="rounded-full blur-2xl"></div>'],
  ["missing rounded-full", '<div class="absolute blur-2xl"></div>'],
  ["missing blur utility", '<div class="absolute rounded-full"></div>'],
  ["blur-none is not a glow", '<div class="absolute rounded-full blur-none"></div>'],
  ["backdrop-blur only (no plain blur)", '<div class="absolute rounded-full backdrop-blur-2xl"></div>'],
  ["backdrop-blur alongside plain blur-less", '<div class="absolute rounded-full backdrop-blur-md"></div>'],
  ["interactive role", '<div class="absolute rounded-full blur-2xl" role="button"></div>'],
  ["interactive tabindex", '<div class="absolute rounded-full blur-2xl" tabindex="0"></div>'],
  ["interactive onclick", '<div class="absolute rounded-full blur-2xl" onclick="go()"></div>'],
  ["hidden attribute", '<div hidden class="absolute rounded-full blur-2xl"></div>'],
  ["style display:none", '<div class="absolute rounded-full blur-2xl" style="display:none"></div>'],
  ["style visibility:hidden", '<div class="absolute rounded-full blur-2xl" style="visibility: hidden"></div>'],
  [
    "inside hidden ancestor",
    '<div style="visibility:hidden"><div class="absolute rounded-full blur-2xl"></div></div>',
  ],
  ["inside <script>", '<script>var s = \'<div class="absolute rounded-full blur-2xl"></div>\';</script>'],
  ["inside <style>", '<style>.x{content:"<div class=\'absolute rounded-full blur-2xl\'></div>"}</style>'],
  ["inside <template>", '<template><div class="absolute rounded-full blur-2xl"></div></template>'],
];
for (const [name, html] of negatives) {
  eq(`unchanged: ${name}`, mark(html), html);
}

eq(
  "script text cannot pretend markup (only the real sibling div is marked)",
  mark('<script>var s = \'<div class="absolute rounded-full blur-2xl"></div>\';</script><div class="absolute rounded-full blur-2xl"></div>'),
  `<script>var s = '<div class="absolute rounded-full blur-2xl"></div>';</script><div${MARK} class="absolute rounded-full blur-2xl"></div>`,
);

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n4) 內容零改動：文字／連結／圖片／標題逐字保留");

const article =
  "<h3>香港廣告投放心法</h3>\r\n" +
  '<p>參考 <a href="/services/ads/" class="text-[#0f4c81] hover:underline">成效廣告投放服務</a>，並看下表。</p>\r\n' +
  '<figure class="blog-figure my-10"><img src="/blog/figures/guide-1.webp" alt="示意圖" width="1024" height="768" loading="lazy"></figure>\r\n' +
  '<table><tr><td>1</td></tr></table>\r\n' +
  '<div class="absolute top-5 left-5 w-32 h-32 bg-white rounded-full blur-2xl"></div>\r\n' +
  "<h4>小結</h4>\r\n" +
  "<p>完。</p>";
const articleMarked = mark(article);
check("content: exactly 1 glow marked", countMarks(articleMarked) === 1);
check("content: heading preserved", articleMarked.includes("<h3>香港廣告投放心法</h3>") && articleMarked.includes("<h4>小結</h4>"));
check(
  "content: link preserved",
  articleMarked.includes('<a href="/services/ads/" class="text-[#0f4c81] hover:underline">成效廣告投放服務</a>'),
);
check(
  "content: image preserved",
  articleMarked.includes('<img src="/blog/figures/guide-1.webp" alt="示意圖" width="1024" height="768" loading="lazy">'),
);
check("content: everything except the inserted attrs is identical", articleMarked.split(MARK).join("") === article);

// 沒有任何 glow 時：整段逐字不變（純 no-op）
const noGlow = '<p>沒有裝飾性 glow 的段落</p>\r\n<div class="rounded-xl p-6">內容</div>';
eq("no glow present → byte-identical no-op", mark(noGlow), noGlow);
eq("empty string → empty string", mark(""), "");

// ═══════════════════════════════════════════════════════════════════════════
console.log("\n5) 接線契約：渲染邊界 buildTocAndInjectIds 有套用此 helper");

const enhanceSrc = readFileSync(path.join(ROOT, "lib", "blog-enhance.ts"), "utf8");
check(
  "blog-enhance imports markMobileGlowDecorations from ./blog-html",
  /import\s*\{[^}]*\bmarkMobileGlowDecorations\b[^}]*\}\s*from\s*["']\.\/blog-html["']/.test(enhanceSrc),
);
const tocFn = /export function buildTocAndInjectIds\([\s\S]*?\n\}/.exec(enhanceSrc);
check(
  "buildTocAndInjectIds calls markMobileGlowDecorations(html) on its input",
  !!tocFn && /markMobileGlowDecorations\(html\)/.test(tocFn[0]),
);

// ═══════════════════════════════════════════════════════════════════════════
console.log(`\n${passed}/${passed + failed} checks passed`);
if (failed) {
  console.log(`\n${failed} check(s) failed:\n  - ${failures.join("\n  - ")}`);
  process.exitCode = 1;
} else {
  console.log("blog-mobile-glow contract satisfied (pure parser-offset annotation; no DOM/DB touched).");
}
