#!/usr/bin/env node
/**
 * check-site-output.mjs — 出街前自動閘門（build 後執行）
 *
 * 為什麼需要這個：
 *   2026-09 這段期間反覆出現同類問題，每一次都要人手重新掃描與修正：
 *     • Title 品牌尾綴重複（`X | ADWire Agency | ADWire Agency`）—— 出現過兩次，
 *       第二次影響 20 個頁面（16 個案例頁 + privacy／terms／disclaimer／thank-you）
 *     • Title 過長被 Google 搜尋結果截斷
 *     • 未經核准的宣傳數字（100+／120+／150+／300%）在不同頁面各自為政，
 *       與已統一的「500+ 服務客戶」口徑矛盾
 *     • 已被負責人否定的保證式字句重新出現
 *
 *   每次靠人去記、去掃，就一定會再漏。所以把它變成建置的一部分：
 *   build 失敗 = 部署不會發生。這是「出街前閘門」，不是事後清理。
 *
 * 設計原則（校準過誤報）：
 *   1. 結構檢查（canonical／H1／Title 長度／noindex）只適用於 **sitemap 內**
 *      的頁面。`/404/`、`/_not-found/`、`/thank-you/` 本來就應該 noindex。
 *   2. 禁止字句會檢查是否出現在**否定語境**（例如我們自己寫的
 *      「避免相信『保證排名第一』的承諾」是正確內容，不應判為違規）。
 *   3. 未核准數字只列為 WARN（文章引用市場數據屬正常），並按數字歸類，
 *      避免洗版。
 *
 * 用法：
 *   node scripts/check-site-output.mjs
 *   node scripts/check-site-output.mjs --strict   # WARN 亦視為失敗
 *
 * 已接上 package.json 的 postbuild，故 `npm run build` 會自動執行。
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "out";
const STRICT = process.argv.includes("--strict");

/** Title 長度上限。超過就有在 Google 搜尋結果被截斷的風險。 */
const TITLE_MAX = 62;

/**
 * 絕對不可以出現在輸出中的字句（負責人已明確否定的保證式宣稱）。
 * 這些是「精確字串」，且在否定語境中會自動放行，避免誤報。
 */
const FORBIDDEN_PHRASES = [
  "保證排名",
  "保證第一頁",
  "確保優先引用",
  "被所有 AI 推薦",
  "被所有AI推薦",
  "銀行級",
  "香港首選",
  "市場唯一",
  "私有化部署零外洩",
  "24 小時內回覆",
  "無限頁面優化",
];

/**
 * 否定語境標記。若禁止字句附近出現這些詞，代表是在告誡讀者不要相信，
 * 屬於正確內容（我們自己的文章就是這樣寫），故放行。
 */
const NEGATION_MARKERS = ["不", "避免", "沒有人", "無", "拒絕", "勿", "非", "切勿", "不要", "不能"];

/** 已核准的對外數字（其他數字列為 WARN 供人覆核）。 */
const APPROVED_STATS = new Set(["500+", "328%", "98%", "4.9", "45+", "16", "100%", "24/7"]);

const errors = [];
const warnings = [];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name === "index.html") out.push(p);
  }
  return out;
}

const titleOf = (h) => (h.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, null])[1]?.trim() ?? null;

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

/** 讀 sitemap，得出「預期要被索引」的頁面集合 */
function sitemapPages() {
  const f = join(OUT, "sitemap.xml");
  if (!existsSync(f)) return null;
  const xml = readFileSync(f, "utf8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return new Set(
    urls.map((u) => u.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/")
  );
}

function checkPage(file, inSitemap) {
  const html = readFileSync(file, "utf8");
  const page = "/" + relative(OUT, file).replace(/index\.html$/, "").replace(/\\/g, "/");
  const title = titleOf(html);

  // ── 1. Title 結構（所有頁面都應有合理 Title）────────────────────
  if (!title) {
    errors.push(`${page} 缺少 <title>`);
  } else {
    if ((title.match(/\| ADWire Agency/g) || []).length > 1) {
      errors.push(`${page} Title 品牌尾綴重複：${title}`);
    }
    if ([...title].length > TITLE_MAX) {
      errors.push(`${page} Title 過長（${[...title].length} > ${TITLE_MAX} 字）：${title}`);
    }
  }

  // ── 2. 結構檢查：只針對「預期要被索引」的頁面 ─────────────────
  //    /404/、/_not-found/、/thank-you/ 本來就應該 noindex 且無 canonical。
  if (inSitemap === null || inSitemap.has(page)) {
    if (!/<link[^>]+rel="canonical"/i.test(html)) errors.push(`${page} 缺少 canonical`);
    const h1n = (html.match(/<h1\b/gi) || []).length;
    if (h1n !== 1) errors.push(`${page} 有 ${h1n} 個 <h1>（應為 1）`);

    const robots = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i);
    if (robots && /noindex/i.test(robots[1])) {
      errors.push(`${page} 在 sitemap 內但帶 noindex（會令頁面無法被收錄）`);
    }
  }

  // ── 3. 禁止字句：否定語境自動放行 ──────────────────────────────
  const text = visibleText(html);
  for (const phrase of FORBIDDEN_PHRASES) {
    let from = 0;
    for (;;) {
      const i = text.indexOf(phrase, from);
      if (i < 0) break;
      // 否定語境只看「字句前面 12 字」。
      // 曾經取 ±45 字窗口，結果 /about/ 的「24 小時內回覆」因為後面緊接
      // 「無隱藏收費」而被誤判為否定語境（假陰性），所以收窄範圍。
      const before = text.slice(Math.max(0, i - 12), i);
      const window = text.slice(Math.max(0, i - 45), i + phrase.length + 45);
      const negated = NEGATION_MARKERS.some((m) => before.includes(m));
      if (!negated) {
        errors.push(`${page} 出現禁止字句「${phrase}」：…${window.trim()}…`);
      }
      from = i + phrase.length;
    }
  }

  // ── 4. 未核准數字 → WARN，按數字歸類避免洗版 ──────────────────
  const stats = new Set(text.match(/\b\d[\d,]*\+|\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b/g) || []);
  for (const s of stats) if (!APPROVED_STATS.has(s)) warnings.push({ page, stat: s });
}

function main() {
  if (!existsSync(OUT)) {
    console.error(`❌ 找不到 ${OUT}/ —— 請先執行 next build`);
    process.exit(1);
  }

  const inSitemap = sitemapPages();
  const files = walk(OUT);
  for (const f of files) checkPage(f, inSitemap);

  console.log(`\n出街前閘門（檢查 ${files.length} 頁，sitemap ${inSitemap ? inSitemap.size : "?"} 頁）`);
  console.log("─".repeat(64));

  if (warnings.length) {
    const byStat = new Map();
    for (const { page, stat } of warnings) {
      if (!byStat.has(stat)) byStat.set(stat, []);
      byStat.get(stat).push(page);
    }
    console.log(`\n⚠️  ${byStat.size} 個未在核准清單的數字（不阻擋部署，供覆核）：`);
    console.log("     數字        出現頁數   例子");
    for (const [stat, pages] of [...byStat].sort((a, b) => b[1].length - a[1].length).slice(0, 18)) {
      console.log(`     ${stat.padEnd(11)} ${String(pages.length).padStart(5)}     ${pages[0]}`);
    }
    if (byStat.size > 18) console.log(`     …另有 ${byStat.size - 18} 個`);
  }

  if (errors.length) {
    console.log(`\n❌ ${errors.length} 項必須修正（會阻擋部署）：`);
    for (const e of errors) console.log(`   ${e}`);
    console.log("\n修正後再 build。此閘門存在的目的，是避免這些問題再次靜默流出街。");
    process.exit(1);
  }

  if (STRICT && warnings.length) {
    console.log("\n❌ --strict：WARN 亦視為失敗。");
    process.exit(1);
  }

  console.log("\n✅ 閘門通過：Title 結構、canonical、H1、noindex 及禁止字句全部正常。");
}

main();