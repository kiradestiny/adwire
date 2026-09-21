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
 *   node scripts/check-site-output.mjs --strict     # WARN 亦視為失敗
 *   node scripts/check-site-output.mjs --selftest   # 只跑否定語境偵測的自我測試
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
  // 2026-09 全站掃描發現仍在線上、已核准移除的成效承諾
  "高達 500%",
  "3-6 個月 ROI",
  "被 AI 優先推薦",
  "確保真實 ROI",
  // 2026-09-21 全服務頁成效聲稱掃描：以下均為無法核實的成效承諾或誇張用語
  "3-6 個月回本",
  "投資回報期",
  "平均流程效率提升",
  "平均效率提升",
  "數據準確率",
  "荷里活級",
  "確保合規安全",
  "24小時回覆",
  // 2026-09-21 不可核實的自我排名／市場地位聲稱
  "香港首選",
  "香港領先",
  "領先市場",
  // 2026-09-21 服務頁審計（deliverables/22）：以下均為閘門原先漏檢的字句。
  // 加入後必須同時修正文案，否則 build 會失敗 —— 這正是閘門的用途。
  "優先推薦",       // 服務總覽：「確保品牌能被 ChatGPT…優先推薦」
  "霸佔",           // 服務總覽：「霸佔 Google 搜尋結果首頁」
  "秒回",           // 服務總覽：「AI Chatbot 立即秒回」
  "權威答案",       // SEO：「確保品牌會被 AI 引用為權威答案」
  "指數級",         // SEO：「SEO 是長遠投資，回報是指數級的」
  "所有 AI 引擎",   // SEO：「幫你在所有 AI 引擎建立…品牌存在」
  "地圖首位",       // SEO：「確保店舖會出現在地圖首位」
  "無限擴展",       // 系統：「無限擴展，隨業務增長升級」
  "十年不過時",     // 系統：「確保系統十年不過時」
  "無縫銜接",       // 系統：「確保業務無縫銜接」
  "絕對可以",       // 系統 FAQ：「絕對可以」
  "秒開",           // 網頁：「任何設備上都能秒開」
  "領先對手",       // 網頁：「確保你的網站在起跑線就領先對手」
  "最高 ROI",       // KOL：「根據預算制定最高 ROI 的組合方案」
  "投入過百萬",     // 製作：「投入過百萬購置…器材」
  "電影級",         // 製作：「電影級攝影器材」
  "成效最大化",     // 服務總覽：「確保成效最大化」
  "GPT-4",          // AI：過時模型名稱（Brief §6 PAGE-04 指定要審核）
  "Llama 3.1",      // AI：2024 年 7 月產品，已過時
  "出現在第一位",   // 廣告：「確保你的網站出現在第一位」
];

/**
 * 否定語境標記。若禁止字句附近出現這些詞，代表是在告誡讀者不要相信，
 * 屬於正確內容（我們自己的文章就是這樣寫），故放行。
 *
 * 設計原則（2026-09-21 修正）：
 *   1. 只收「多字」否定詞。曾經用裸「不」「無」做標記，結果 /about/ 的
 *      「24 小時內回覆」因為後面緊接「無隱藏收費」而被放行（假陰性），
 *      即真正的違規字句反而漏檢。裸字一律不收。
 *   2. 必須對稱檢查。Google 官方警告的句式是「如果有人向您保證能排名
 *      第一位，建議您另請高明」——否定詞在**後面**。只檢查字句前方
 *      會令正確引用被誤判為違規（Article 19 就是這個情況）。
 *   3. 引號內一律放行。字句被「」包住代表作者是在「討論」這個說法，
 *      而不是向讀者「主張」它。
 */
const NEGATION_MARKERS = [
  // 直接否定（多字詞，覆蓋「我們不會這樣做」類表述）
  "不保證", "不會保證", "無法保證", "不能保證", "不可保證",
  "不成立", "不可信", "不可能", "不會", "並非", "不是", "拒絕",
  "沒有", "沒有人", "沒法", "無需", "不用",
  // 告誡語：作者明顯站在讀者一方提醒
  "避免", "切勿", "不要", "提防", "當心", "警惕", "戒心",
  "停手", "另請高明", "質疑", "可信嗎", "騙", "誤導", "誇大", "虛假",
  // 引述官方：在講「別人怎麼說」，不是自己主張
  "原文", "引述", "官方文件", "官方指引", "點名", "這樣寫",
];

/** 判斷某位置的禁止字句是否被中文引號包住（代表是在討論該說法）。 */
function isQuoted(text, idx) {
  const before = text.slice(0, idx);
  const open = (before.match(/[「『]/g) || []).length;
  const close = (before.match(/[」』]/g) || []).length;
  return open > close;
}

/** 已核准的對外數字（其他數字列為 WARN 供人覆核）。 */
const APPROVED_STATS = new Set(["500+", "328%", "98%", "4.9", "45+", "16", "100%", "24/7"]);

const errors = [];
const warnings = [];

/**
 * 偵測一段純文字中的禁止字句，回傳真正違規（非正確討論）的清單。
 * 抽成獨立函數，是為了可以用 --selftest 對固定測試案例驗證，
 * 確保每次調整否定語境規則之後，仍然攔得到真正的違規字句。
 */
function detectForbidden(text) {
  const found = [];
  for (const phrase of FORBIDDEN_PHRASES) {
    let from = 0;
    for (;;) {
      const i = text.indexOf(phrase, from);
      if (i < 0) break;
      // 判斷是否屬於「正確討論」而非「自我主張」：
      //   a) 被中文引號包住 → 作者在討論這個說法
      //   b) 前後 60 字內出現否定／告誡／引述標記
      // 曾只檢查前 12 字，令 Google 官方句式「…保證能排名第一位，建議您
      // 另請高明」被誤判為違規，故改為對稱窗口。
      const window = text.slice(Math.max(0, i - 60), i + phrase.length + 60);
      const negated =
        isQuoted(text, i) || NEGATION_MARKERS.some((m) => window.includes(m));
      if (!negated) found.push({ phrase, window: window.trim() });
      from = i + phrase.length;
    }
  }
  return found;
}

/**
 * --selftest：對固定案例驗證偵測邏輯。
 * MUST_FLAG 是真正要向讀者主張保證的字句；MUST_PASS 是正確的告誡／引述用法。
 * 任何一項不符預期即 exit 1（CI 或本機都可執行）。
 */
function selftest() {
  const MUST_FLAG = [
    "我們提供 SEO 服務，保證排名第一，讓你生意倍增。",
    "選擇 ADWire，保證排名首頁，效果看得見。",
    "我們的方案確保優先引用，AI 一定會推薦你。",
    "本公司是香港首選的數碼營銷公司。",
  ];
  const MUST_PASS = [
    "沒有人可以保證能在 Google 上排名第一。",
    "這也解釋了為何「保證排名」在技術上不可能成立。",
    "SEO 公司保證排名第一，可信嗎？",
    "Google 原文這樣寫：「如果有人向您保證能讓網站在搜尋結果中的排名攀升到第一位，建議您另請高明。」",
    "如對方聲稱確保優先引用，應提高警惕。",
    "避免相信香港首選這類自我排名說法。",
    // 真實案例：後台 blog id=14 content 的句子（否定語境，必須放行）
    "③避免相信「保證排名第一」的承諾（Google 明確表示無代理能保證排名）",
    // 正確討論「優先推薦」：文章在告誡讀者不要相信
    "任何聲稱確保被 AI 優先推薦的說法，都應該提防。",
    "避免相信「保證排名第一位」這類承諾。",
  ];
  let bad = 0;
  console.log("閘門自我測試");
  console.log("─".repeat(64));
  for (const t of MUST_FLAG) {
    const hit = detectForbidden(t);
    const ok = hit.length > 0;
    if (!ok) bad++;
    console.log(`${ok ? "✅" : "❌"} 應攔截：${t}`);
    if (!ok) console.log("      漏檢！這是假陰性，真違規會流出街。");
  }
  for (const t of MUST_PASS) {
    const hit = detectForbidden(t);
    const ok = hit.length === 0;
    if (!ok) bad++;
    console.log(`${ok ? "✅" : "❌"} 應放行：${t}`);
    if (!ok) console.log(`      誤判為違規：${hit.map((h) => h.phrase).join("、")}`);
  }
  if (bad) {
    console.log(`\n❌ 自我測試失敗 ${bad} 項。否定語境規則有問題，不可當作閘門使用。`);
    process.exit(1);
  }
  console.log(`\n✅ 自我測試通過（${MUST_FLAG.length} 攔截 / ${MUST_PASS.length} 放行）。`);
  process.exit(0);
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name === "index.html") out.push(p);
  }
  return out;
}

/**
 * 純文字檔（llms.txt / llms-full.txt）亦要掃禁止字句。
 *
 * 為何需要（2026-09-21 發現）：閘門原本只掃 index.html，因此
 * public/llms-full.txt 內一段舊文章摘要「讓你的品牌被 AI 優先推薦」
 * 一直未被攔到 —— 而該句在網站正文早已移除。這類檔案同樣會被
 * AI 系統及搜尋引擎讀取，屬對外內容，不應有例外。
 */
function textFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...textFiles(p));
    else if (name.endsWith(".txt")) out.push(p);
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
  for (const { phrase, window } of detectForbidden(text)) {
    errors.push(`${page} 出現禁止字句「${phrase}」：…${window}…`);
  }

  // ── 4. 未核准數字 → WARN，按數字歸類避免洗版 ──────────────────
  const stats = new Set(text.match(/\b\d[\d,]*\+|\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b/g) || []);
  for (const s of stats) if (!APPROVED_STATS.has(s)) warnings.push({ page, stat: s });
}

function main() {
  if (process.argv.includes("--selftest")) selftest();

  if (!existsSync(OUT)) {
    console.error(`❌ 找不到 ${OUT}/ —— 請先執行 next build`);
    process.exit(1);
  }

  const inSitemap = sitemapPages();
  const files = walk(OUT);
  for (const f of files) checkPage(f, inSitemap);

  // 純文字檔只做禁止字句檢查（無 Title／canonical／H1 等結構）
  const txts = textFiles(OUT);
  for (const f of txts) {
    const rel = "/" + relative(OUT, f).replace(/\\/g, "/");
    for (const { phrase, window } of detectForbidden(readFileSync(f, "utf8"))) {
      errors.push(`${rel} 出現禁止字句「${phrase}」：…${window}…`);
    }
  }

  console.log(`\n出街前閘門（檢查 ${files.length} 頁 + ${txts.length} 個純文字檔，sitemap ${inSitemap ? inSitemap.size : "?"} 頁）`);
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