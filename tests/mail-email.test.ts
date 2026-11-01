/**
 * tests/mail-email.test.ts — lib/mail-email.ts（PREVIEW-ONLY 交易郵件渲染器）
 *
 * 執行方式（Node 原生 type stripping，repo 未安裝測試框架）：
 *   node --experimental-strip-types tests/mail-email.test.ts
 *
 * 目的：以「真程式碼」驗證新版 PRIVATE lead 交易郵件渲染器（lib/mail-email.ts）。
 * 本檔只呼叫真正的 buildMailEmail / parseAssessmentMessage，輸出真 HTML 再斷言，
 * 唔 mock 渲染器、唔 mock 供應商、零網絡、零寄信、零部署。
 *
 * 樣本 message 由真正的 lib/assessment.ts（classify / buildPrefill / leadScore /
 * summaryText）產生，或由該格式的純文字字面值提供，確保與 /start 問卷實際交接內容一致。
 *
 * ⚠️ PREVIEW-ONLY：本測試唔會 commit、唔會部署、唔會發送任何郵件。
 */

import assert from "node:assert/strict";

// ── 型別（extensionless，執行時抹除）────────────────────────────────────────────
interface MailFixture {
  name: string; phone: string; email: string; service: string; company: string;
  companySite: string; budget: string; timeline: string; systemInfo: string;
  message: string; ip: string; ua: string; country: string;
  source: string; leadGrade: string; leadNotes: string;
  // OPTIONAL：由 handler 提供嘅**已計算可信**安全 metadata（缺則誠實顯示「未提供」）。
  security?: {
    verification: "verified" | "unavailable" | "not_checked";
    risk: { level: "low" | "review" | "unknown"; score: number | null; reasons: string[] };
    network: { asn: number | null; organization: string; country: string };
  };
}

type BuildMailEmail = (f: MailFixture) => { subject: string; html: string };
type ParseAssessmentMessage = (message: string) => {
  fields: Array<{ label: string; value: string }>;
  note: string;
  unknownLines: string[];
} | null;

// 契約：whatsappTarget 回傳**完整 URL**（https://wa.me/<digits>）或 null，
// 有別於 mailtoTarget（後者只回傳地址）。
type WhatsappTarget = (phone: string) => string | null;

// ── 模組載入（RED：lib/mail-email.ts 未存在時，整份測試即失敗）──────────────────
const mailSpecifier: string = ["..", "lib", "mail-email.ts"].join("/");
const assessmentSpecifier: string = ["..", "lib", "assessment.ts"].join("/");

let buildMailEmail: BuildMailEmail;
let parseAssessmentMessage: ParseAssessmentMessage;
let whatsappTarget: WhatsappTarget;
let assessment: typeof import("../lib/assessment");

try {
  const mod = (await import(mailSpecifier)) as {
    buildMailEmail: BuildMailEmail;
    parseAssessmentMessage: ParseAssessmentMessage;
    whatsappTarget: WhatsappTarget;
  };
  buildMailEmail = mod.buildMailEmail;
  parseAssessmentMessage = mod.parseAssessmentMessage;
  whatsappTarget = mod.whatsappTarget;
  assessment = await import(assessmentSpecifier);
  if (
    typeof buildMailEmail !== "function" ||
    typeof parseAssessmentMessage !== "function" ||
    typeof whatsappTarget !== "function"
  ) {
    throw new Error("buildMailEmail / parseAssessmentMessage / whatsappTarget 未匯出");
  }
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.log("RED（預期：實作前應失敗）—— 無法載入 lib/mail-email.ts");
  console.log(`  \u274c module load \u2192 ${msg}`);
  process.exit(1);
}

// ── 迷你測試框架（同 repo 其他測試一致嘅手寫 runner）──────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

async function t(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    passed++;
    console.log(`  \u2705 ${name}`);
  } catch (e) {
    failed++;
    const msg = e instanceof Error ? e.message : String(e);
    failures.push(`${name} \u2192 ${msg}`);
    console.log(`  \u274c ${name}\n     ${msg}`);
  }
}

const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

function mk(over: Partial<MailFixture> = {}): MailFixture {
  return {
    name: "陳大文", phone: "+852 9123 4567", email: "client@example.com",
    service: "成效廣告投放", company: "Example Co", companySite: "https://example.com",
    budget: "HK$10,000 – 30,000", timeline: "一個月內", systemInfo: "現有 WordPress 網站",
    message: "你好，想了解廣告投放。\n第二行訊息。", ip: "203.0.113.7", ua: "Mozilla/5.0 (Test)",
    country: "HK", source: "contact", leadGrade: "", leadNotes: "", ...over,
  };
}

// ── 1. 主旨公式（必須與現有 buildEmail 完全一致）──────────────────────────────
await t("contact 主旨：新客戶查詢 - 姓名 - 服務 - 預算", () => {
  const { subject } = buildMailEmail(mk());
  assert.equal(subject, "【新客戶查詢】陳大文 - 成效廣告投放 - HK$10,000 – 30,000");
});

await t("assessment 主旨：需求評估・X 級，含預算", () => {
  const { subject } = buildMailEmail(mk({ source: "assessment", leadGrade: "A", budget: "HK$30,000 – 80,000" }));
  assert.equal(subject, "【需求評估・A 級】陳大文 - 成效廣告投放 - HK$30,000 – 80,000");
});

await t("主旨：預算為「未指定」時唔附加", () => {
  const { subject } = buildMailEmail(mk({ budget: "未指定" }));
  assert.equal(subject, "【新客戶查詢】陳大文 - 成效廣告投放");
});

await t("主旨：assessment 但缺 grade 唔顯示級別", () => {
  const { subject } = buildMailEmail(mk({ source: "assessment", leadGrade: "" }));
  assert.equal(subject, "【需求評估】陳大文 - 成效廣告投放 - HK$10,000 – 30,000");
});

// ── 2. 真 buildPrefill 樣本（經 classify / leadScore）─────────────────────────
{
  const answers: import("../lib/assessment").Answers = {
    goal: "growth", problem: "ads-low-enquiries", base: "ads-multi",
    budget: { mode: "monthly-total-ads", band: "mid", amountHKD: null },
    timing: "within-month",
  };
  const result = assessment.classify(answers);
  const prefill = assessment.buildPrefill(result, answers);
  const lead = assessment.leadScore(answers);
  const summary = assessment.summaryText(result, answers);

  await t("真 buildPrefill：可投入同一句重複只顯示一次（去重）", () => {
    const message = prefill.message; // summaryText + 重複嘅「可投入：…」句子
    // 摘要內已有一行「可投入：X」，buildPrefill 再 append 同一句 —— 必須去重成一次。
    const line = summary.split("\n").find((l) => l.startsWith("可投入："));
    assert.ok(line, "summaryText 應有「可投入：」行");
    const parsed = parseAssessmentMessage(message);
    assert.ok(parsed, "應解析為 assessment 格式");
    const budgetFields = parsed!.fields.filter((f) => f.label === "可投入");
    assert.equal(budgetFields.length, 1, "重複且相同嘅「可投入」應只保留一次");
    const html = buildMailEmail(mk({
      source: "assessment", leadGrade: lead.grade,
      leadNotes: `${lead.score} 分｜${lead.notes.join("、")}`,
      message, budget: prefill.budget, timeline: prefill.timeline, service: prefill.service,
    })).html;
    // 只比對「可投入」的值本身（設計上標籤與值分開渲染，非一字串）。
    const budgetValue = line!.replace(/^可投入[：:]/, "");
    assert.equal(count(html, escapeForCount(budgetValue)), 1, "HTML 內該預算句應只出現一次");
  });

  await t("真 buildPrefill：標籤欄位獨立、唔會變成一整段文字", () => {
    const html = buildMailEmail(mk({
      source: "assessment", leadGrade: lead.grade, message: prefill.message,
      budget: prefill.budget, timeline: prefill.timeline, service: prefill.service,
    })).html;
    for (const label of ["想處理", "主要情況", "現有基礎", "可投入", "預計開始", "建議方向", "評估結果"]) {
      assert.ok(html.includes(label), `應包含標籤 ${label}`);
    }
    // 標籤與值分開渲染（vertical、獨立格），唔係一整段文字。
    assert.ok(count(html, 'class="mlabel"') >= 7, "每個標籤應為獨立元素");
    assert.ok(count(html, 'class="mvalue"') >= 7, "每個值應為獨立元素");
  });
}

// ── 3. summaryText 純文字字面樣本 + 客人補充多行 ─────────────────────────────
const SUMMARY_LITERAL = [
  "【ADWire 需求評估摘要】",
  "想處理：增加查詢及生意",
  "主要情況：有產品／服務，但查詢太少",
  "現有基礎：已有基本網站",
  "可投入：每月總投入（代操服務費＋廣告費）：中高預算（待確認範圍）",
  "預計開始：一個月內",
  "角色：公司負責人／老闆",
  "建議方向：成效廣告投放",
  "評估結果：適合安排銷售跟進（非正式報價）",
].join("\n");

await t("parse：可解析標題 + 全部標籤，角色可選", () => {
  const parsed = parseAssessmentMessage(SUMMARY_LITERAL);
  assert.ok(parsed, "應解析成功");
  const labels = parsed!.fields.map((f) => f.label);
  for (const l of ["想處理", "主要情況", "現有基礎", "可投入", "預計開始", "角色", "建議方向", "評估結果"]) {
    assert.ok(labels.includes(l), `缺標籤 ${l}`);
  }
  assert.equal(parsed!.note, "");
});

await t("parse：無「角色」行亦可（選填）", () => {
  const noRole = SUMMARY_LITERAL.split("\n").filter((l) => !l.startsWith("角色：")).join("\n");
  const parsed = parseAssessmentMessage(noRole);
  assert.ok(parsed);
  assert.ok(!parsed!.fields.some((f) => f.label === "角色"));
});

await t("parse：客人補充由第一個 客人補充： 起全數保留（含多段）", () => {
  const message = `${SUMMARY_LITERAL}\n\n可投入：每月總投入（代操服務費＋廣告費）：中高預算（待確認範圍）\n\n客人補充：第一段補充\n\n第二段（另一段）\n第三行`;
  const parsed = parseAssessmentMessage(message);
  assert.ok(parsed);
  assert.ok(parsed!.note.startsWith("第一段補充"));
  assert.ok(parsed!.note.includes("第二段（另一段）"));
  assert.ok(parsed!.note.includes("第三行"));
  // 補充之後嘅行唔可以被當成欄位（主要情況 etc. 只應出現一次，唔會被 note 行污染）
  assert.equal(parsed!.fields.filter((f) => f.label === "主要情況").length, 1);
});

await t("HTML：客人補充多行保留（<br> 分隔且內容齊全）", () => {
  const message = `${SUMMARY_LITERAL}\n\n客人補充：第一段補充\n\n第二段（另一段）\n第三行`;
  const html = buildMailEmail(mk({ source: "assessment", leadGrade: "A", message })).html;
  assert.ok(html.includes("第一段補充"));
  assert.ok(html.includes("第二段（另一段）"));
  assert.ok(html.includes("第三行"));
});

// ── 4. 重複：完全相同去重，唔同值必須保留 ─────────────────────────────────────
await t("parse：可投入完全相同 → 去重一次；不同值 → 兩者都保留", () => {
  const dup = `【ADWire 需求評估摘要】\n想處理：X\n可投入：A\n可投入：A\n`;
  const p1 = parseAssessmentMessage(dup)!;
  assert.equal(p1.fields.filter((f) => f.label === "可投入").length, 1);

  const distinct = `【ADWire 需求評估摘要】\n想處理：X\n可投入：A\n可投入：B\n`;
  const p2 = parseAssessmentMessage(distinct)!;
  const vals = p2.fields.filter((f) => f.label === "可投入").map((f) => f.value);
  assert.deepEqual(vals, ["A", "B"], "唔同值嘅可投入必須保留兩者");
});

await t("parse：未知行（expected label 以外）必須保留，唔可以遺失", () => {
  const odd = `【ADWire 需求評估摘要】\n想處理：X\n附註：這是額外一行\n可投入：A\n`;
  const p = parseAssessmentMessage(odd)!;
  assert.ok(p, "仍應判定為 assessment（有標題+已知標籤）");
  assert.ok(p.unknownLines.some((l) => l.includes("附註")), "未知行「附註」需保留");
  const html = buildMailEmail(mk({ source: "assessment", message: odd })).html;
  assert.ok(html.includes("附註"), "未知行需出現在 HTML");
});

// ── 5. HTML 注入 / XSS ────────────────────────────────────────────────────────
await t("安全：所有使用者資料 HTML 轉義，唔會原樣輸出 <script>", () => {
  const html = buildMailEmail(mk({
    name: `<script>alert(1)</script>`,
    company: `"><img src=x onerror=alert(1)>`,
    message: `行1\n<img src=x onerror=alert(2)>`,
  })).html;
  assert.ok(!html.includes("<script>alert"), "唔可以有原始 <script>");
  assert.ok(!html.includes("<img src=x onerror"), "唔可以有原始注入 img");
  assert.ok(html.includes("&lt;script&gt;"), "應轉義成 &lt;script&gt;");
});

await t("安全：email 只在合法時才成為 mailto；非法 email 唔連結", () => {
  const ok = buildMailEmail(mk({ email: "client@example.com" })).html;
  assert.ok(ok.includes('href="mailto:client@example.com"'), "合法 email 應 mailto");
  const bad = buildMailEmail(mk({ email: "not an email" })).html;
  assert.ok(!bad.includes("mailto:"), "非法 email 唔應產生 mailto");
  assert.ok(bad.includes("not an email"), "非法 email 應以純文字保留");
});

await t("安全：phone 只在合法數字時才成為 tel；否則純文字", () => {
  const ok = buildMailEmail(mk({ phone: "+852 9123 4567" })).html;
  assert.ok(ok.includes('href="tel:+85291234567"'), "合法電話應 tel（去掉空白）");
  const bad = buildMailEmail(mk({ phone: "call me<script>" })).html;
  assert.ok(!bad.includes("tel:"), "非法電話唔應產生 tel");
});

await t("安全：website 只允許 http(s)；javascript: 唔會成為連結", () => {
  const ok = buildMailEmail(mk({ companySite: "https://example.com" })).html;
  assert.ok(ok.includes('href="https://example.com"'), "http(s) 應成連結");
  const js = buildMailEmail(mk({ companySite: "javascript:alert(1)" })).html;
  assert.ok(!js.includes('href="javascript:'), "javascript: 唔可以成 href");
  assert.ok(js.includes("javascript:alert(1)"), "應以純文字保留（已轉義）");
});

// ── 6. 一般 contact 訊息：字面多行保留 ────────────────────────────────────────
await t("contact：一般訊息字面保留多行（唔會被誤解析為 assessment）", () => {
  const message = "第一行\n第二行\n\n第四行";
  const { html } = buildMailEmail(mk({ source: "contact", message }));
  assert.ok(html.includes("第一行"));
  assert.ok(html.includes("第二行"));
  assert.ok(html.includes("第四行"));
  assert.ok(html.includes("<br"), "換行應轉成 <br>");
});

// ── 7. fallback：奇形怪狀但標題不符 → 原文可讀，唔誤解析 ──────────────────────
await t("fallback：source=assessment 但訊息非評估格式 → 原文照出，唔誤解析", () => {
  const weird = "隨便一段\n完全唔似問卷格式\n想處理：其實呢行係內容一部分";
  const parsed = parseAssessmentMessage(weird);
  assert.equal(parsed, null, "冇標題就唔應該當 assessment 解析");
  const { html } = buildMailEmail(mk({ source: "assessment", message: weird }));
  assert.ok(html.includes("隨便一段"));
  assert.ok(html.includes("完全唔似問卷格式"));
});

await t("fallback：完全不存在嘅欄位唔會被憑空創造", () => {
  const parsed = parseAssessmentMessage(SUMMARY_LITERAL)!;
  const labels = parsed.fields.map((f) => f.label);
  assert.deepEqual(
    [...new Set(labels)].sort(),
    ["主要情況", "可投入", "想處理", "建議方向", "預計開始", "現有基礎", "評估結果", "角色"].sort(),
  );
});

// ── 8. 換行正規化：CRLF 正常化但唔會截斷或移除 LF ────────────────────────────
await t("CRLF：\\r\\n 正常化為 \\n，唔會截斷或移除 LF 內容", () => {
  const crlf = SUMMARY_LITERAL.replace(/\n/g, "\r\n");
  const parsed = parseAssessmentMessage(crlf);
  assert.ok(parsed, "CRLF 內容應可解析");
  assert.ok(parsed!.fields.some((f) => f.label === "想處理" && f.value === "增加查詢及生意"));
  // 長度不因正規化而縮短內容（note 多行）
  const withNote = `${crlf}\r\n\r\n客人補充：A\r\nB\r\nC`;
  const p2 = parseAssessmentMessage(withNote)!;
  assert.ok(p2.note.includes("A") && p2.note.includes("B") && p2.note.includes("C"));
});

await t("長內容：長連結與 CJK 大量文字唔會被截斷", () => {
  const longUrl = "https://example.com/" + "a".repeat(300);
  const cjk = "香港".repeat(200);
  const html = buildMailEmail(mk({ companySite: longUrl, message: cjk })).html;
  assert.ok(html.includes("a".repeat(300)), "長連結內容需完整");
  assert.ok(html.includes("香港".repeat(200)), "CJK 內容需完整");
});

// ── 9. grade 中性：缺失／非法唔用任意 CSS ────────────────────────────────────
await t("grade：缺失或非法時用中性樣式（唔會套用 A/B/C 專屬色）", () => {
  const none = buildMailEmail(mk({ source: "assessment", leadGrade: "" })).html;
  const bogus = buildMailEmail(mk({ source: "assessment", leadGrade: "Z" })).html;
  assert.ok(!/#2e7d32/i.test(none), "缺 grade 唔應用 A 專屬綠色");
  assert.ok(!/#2e7d32/i.test(bogus), "非法 grade 唔應用 A 專屬綠色");
});

// ── 10. 尺寸 / email-safe 契約 ───────────────────────────────────────────────
await t("email-safe：~680px 上限、無 script/grid/flex/外部字體", () => {
  const html = buildMailEmail(mk({ source: "assessment", leadGrade: "B", message: SUMMARY_LITERAL })).html;
  assert.ok(/max-width\s*:\s*6[5-9]0px/.test(html), "應有 ~680px 上限");
  assert.ok(!/<script/i.test(html), "唔可以有 script");
  assert.ok(!/display\s*:\s*(grid|flex)/i.test(html), "唔可以用 grid/flex");
  assert.ok(!/@import|fonts\.googleapis/i.test(html), "唔可以依賴外部字體");
  assert.ok(html.includes("line-height:1.75"), "內文行高 1.75");
});

// ── 11. 新版版面：一般資料列 = 標籤在上、值在下嘅「單一儲存格」──────────────────
// 收件人舊 email 參考強烈偏好：扁平垂直排列、muted 標籤置於 16px 值之上、每列一個 <td>。
await t("版面：聯絡資料每列為單一 <td>，標籤在值之上（唔再用兩欄表）", () => {
  const html = buildMailEmail(mk()).html;
  // 舊版兩欄式固定闊度標籤格（width:132px）必須完全消失。
  assert.ok(!html.includes("width:132px"), "唔應再有兩欄式固定闊度標籤格");

  const tds = html.match(/<td[^>]*>[\s\S]*?<\/td>/g) || [];
  const focus: Array<[string, string]> = [
    ["電話", "9123 4567"],
    ["電郵", "client@example.com"],
    ["公司／品牌", "Example Co"],
    ["公司網站", "https://example.com"],
  ];
  for (const [label, value] of focus) {
    const cell = tds.find((c) => c.includes(label) && c.includes(value));
    assert.ok(cell, `${label} 同其值應喺同一個 <td> 內（單欄結構）`);
    assert.ok(cell!.indexOf(label) < cell!.indexOf(value), `${label} 標籤應喺值之上`);
    assert.equal(count(cell!, label), 1, `${label} 喺該格只應出現一次`);
  }
});

await t("版面：客戶姓名併入一般資料列，姓名只出現一次（唔與 hero 重複）", () => {
  const html = buildMailEmail(mk()).html;
  assert.ok(html.includes("姓名"), "一般資料列應有「姓名」標籤");
  assert.equal(count(html, "陳大文"), 1, "姓名唔應重複出現");
  assert.ok(html.indexOf("姓名") < html.indexOf("陳大文"), "姓名標籤應喺姓名值之上");
});

await t("版面：評估摘要移除多餘外框卡，標籤改柔和色（唔用低對比金色）", () => {
  const html = buildMailEmail(mk({ source: "assessment", leadGrade: "A", message: SUMMARY_LITERAL })).html;
  assert.ok(!html.includes("border-radius:8px"), "評估區塊唔應再有包裹式白色外框卡");
  assert.ok(!/mlabel[^>]*#f5a623/.test(html), "評估標籤唔應用低對比金色");
});

// ── 12. OPTIONAL 安全／來源 metadata（誠實渲染，唔可以捏造）─────────────────────
// 契約：唔提供 security → 只講「未提供驗證結果」＋「未評估」；絕不出現「正常0分」等捏造結論。
const FABRICATED = ["正常0分", "正常 0 分", "0分（正常）", "已證真人", "已確認為真人"];

await t("security：未提供 → 「未提供驗證結果」＋「未評估」，絕無捏造結論", () => {
  const { html } = buildMailEmail(mk());
  assert.ok(html.includes("未提供驗證結果"), "缺 security 應顯示「未提供驗證結果」");
  assert.ok(html.includes("未評估"), "缺 security 應顯示「未評估」");
  for (const bad of FABRICATED) assert.ok(!html.includes(bad), `唔可以出現捏造字眼：${bad}`);
  assert.ok(!html.includes("未見已知內容風險"), "缺資料唔可以聲稱低風險");
  assert.ok(!html.includes("Turnstile 已通過"), "缺資料唔可以聲稱已驗證");
});

await t("security：verification=verified → 「Turnstile 已通過」", () => {
  const { html } = buildMailEmail(mk({ security: {
    verification: "verified",
    risk: { level: "low", score: 4, reasons: [] },
    network: { asn: 13335, organization: "Cloudflare, Inc.", country: "HK" },
  } }));
  assert.ok(html.includes("Turnstile 已通過"));
  assert.ok(!html.includes("未提供驗證結果"));
});

await t("security：verification=unavailable → 「驗證服務未完成」", () => {
  const { html } = buildMailEmail(mk({ security: {
    verification: "unavailable",
    risk: { level: "unknown", score: null, reasons: [] },
    network: { asn: null, organization: "", country: "" },
  } }));
  assert.ok(html.includes("驗證服務未完成"));
  assert.ok(!html.includes("Turnstile 已通過"));
});

await t("security：verification=not_checked → 「尚未驗證（預覽）」", () => {
  const { html } = buildMailEmail(mk({ security: {
    verification: "not_checked",
    risk: { level: "unknown", score: null, reasons: [] },
    network: { asn: null, organization: "", country: "" },
  } }));
  assert.ok(html.includes("尚未驗證（預覽）"));
});

await t("security：low + 有效分數 → 「未見已知內容風險（N分）」且唔聲稱已證真人", () => {
  const html = buildMailEmail(mk({ security: {
    verification: "not_checked",
    risk: { level: "low", score: 0, reasons: [] },
    network: { asn: 64500, organization: "Example ISP Ltd", country: "HK" },
  } })).html;
  // 0 係有效分數（≥0），應照實顯示，並與捏造嘅「正常0分」清楚區別。
  assert.ok(html.includes("未見已知內容風險（0分）"));
  for (const bad of FABRICATED) assert.ok(!html.includes(bad), `唔可以出現捏造字眼：${bad}`);
  assert.ok(!html.includes("已驗證為真人"));
});

await t("security：review → 「需要人工確認（N分）」＋ reasons 垂直列出；主旨及 header 有 [待確認]", () => {
  const { subject, html } = buildMailEmail(mk({ security: {
    verification: "verified",
    risk: { level: "review", score: 30, reasons: ["內容含可疑連結", "用詞疑似廣告"] },
    network: { asn: 13335, organization: "Cloudflare, Inc.", country: "HK" },
  } }));
  assert.ok(subject.startsWith("[待確認] "), `review 主旨應有 [待確認] 前綴，實際：${subject}`);
  assert.ok(html.includes("[待確認]"), "header／標題亦應有 [待確認] 前綴");
  assert.ok(html.includes("需要人工確認（30分）"));
  // reasons 垂直（各自獨立元素），唔會 join 成一段。
  assert.ok(html.includes("• 內容含可疑連結</div>"), "第一條 reason 應自成一列");
  assert.ok(html.includes("• 用詞疑似廣告</div>"), "第二條 reason 應自成一列");
});

await t("security：review 但無有效分數 → 唔捏造 0，顯示「需要人工確認（分數未提供）」", () => {
  const html = buildMailEmail(mk({ security: {
    verification: "verified",
    risk: { level: "review", score: null, reasons: ["需人手覆核"] },
    network: { asn: null, organization: "", country: "" },
  } })).html;
  assert.ok(html.includes("需要人工確認"));
  assert.ok(!html.includes("（0分）"), "無分數時唔可以捏造 0 分");
});

await t("security：unknown／畸形 → 「未評估」，唔會捏造 0 分", () => {
  const unknown = buildMailEmail(mk({ security: {
    verification: "not_checked",
    risk: { level: "unknown", score: null, reasons: [] },
    network: { asn: null, organization: "", country: "" },
  } })).html;
  assert.ok(unknown.includes("未評估"));
  assert.ok(!unknown.includes("（0分）"));

  const malformed = buildMailEmail(mk({ security: {
    verification: "verified",
    risk: { level: "bogus" as unknown as "unknown", score: null, reasons: [] },
    network: { asn: null, organization: "", country: "" },
  } })).html;
  assert.ok(malformed.includes("未評估"), "非法 level 應視為未評估");

  // level=low 但分數非法（null）→ 唔可以當低風險，亦唔可以捏造 0。
  const lowBad = buildMailEmail(mk({ security: {
    verification: "verified",
    risk: { level: "low", score: null, reasons: [] },
    network: { asn: null, organization: "", country: "" },
  } })).html;
  assert.ok(lowBad.includes("未評估"));
  assert.ok(!lowBad.includes("未見已知內容風險"));
  assert.ok(!lowBad.includes("（0分）"));
});

await t("security：reasons／network 使用者資料 HTML 轉義（注入唔會原樣輸出）", () => {
  const html = buildMailEmail(mk({ security: {
    verification: "verified",
    risk: { level: "review", score: 5, reasons: ["<script>alert(1)</script>"] },
    network: { asn: 64500, organization: '"><img src=x onerror=alert(1)>', country: "HK<script>" },
  } })).html;
  assert.ok(!html.includes("<script>alert"), "reason 唔可以原樣輸出 script");
  assert.ok(!html.includes("<img src=x onerror"), "network org 唔可以原樣輸出注入 img");
  assert.ok(html.includes("&lt;script&gt;"), "reason 應 HTML 轉義");
  assert.ok(html.includes("&lt;img src=x onerror"), "organization 應 HTML 轉義");
});

await t("security：來源資訊 = ASN／ASN機構／國家或地區；缺值一律「未提供」（唔用 ISP）", () => {
  const withNet = buildMailEmail(mk({ security: {
    verification: "verified",
    risk: { level: "low", score: 12, reasons: [] },
    network: { asn: 13335, organization: "Cloudflare, Inc.", country: "HK" },
  } })).html;
  assert.ok(withNet.includes("ASN機構"), "應使用「ASN機構」標籤");
  assert.ok(!withNet.includes("ISP"), "唔可以使用 ISP 字眼／推斷");
  assert.ok(withNet.includes("13335"), "應顯示可信 ASN");
  assert.ok(withNet.includes("Cloudflare, Inc."), "應顯示可信組織名");
  assert.ok(withNet.includes("HK"), "應顯示可信國家／地區");

  const noNet = buildMailEmail(mk({ security: {
    verification: "not_checked",
    risk: { level: "unknown", score: null, reasons: [] },
    network: { asn: null, organization: "", country: "" },
  } })).html;
  assert.ok(noNet.includes("ASN：未提供"), "ASN 缺值應顯示「未提供」");
  assert.ok(noNet.includes("ASN機構：未提供"), "ASN機構 缺值應顯示「未提供」");
  assert.ok(noNet.includes("國家或地區：未提供"), "國家或地區 缺值應顯示「未提供」");
});

await t("security：安全狀態與銷售 A/B/C 級互相獨立", () => {
  const sec = {
    verification: "not_checked" as const,
    risk: { level: "low" as const, score: 7, reasons: [] },
    network: { asn: null as number | null, organization: "", country: "" },
  };
  const a = buildMailEmail(mk({ source: "assessment", leadGrade: "A", message: SUMMARY_LITERAL, security: sec }));
  const c = buildMailEmail(mk({ source: "assessment", leadGrade: "C", message: SUMMARY_LITERAL, security: sec }));
  assert.ok(a.html.includes("有內容風險訊號（7分）"));
  assert.ok(c.html.includes("有內容風險訊號（7分）"), "C 級唔應改變安全標籤");
  assert.ok(!a.html.includes("[待確認]") && !c.html.includes("[待確認]"), "low 風險唔應觸發 [待確認]");
});

await t("security：無 security 時主旨完全不變（[待確認] 僅限 review）", () => {
  const { subject } = buildMailEmail(mk({ source: "assessment", leadGrade: "C", message: SUMMARY_LITERAL }));
  assert.equal(subject, "【需求評估・C 級】陳大文 - 成效廣告投放 - HK$10,000 – 30,000");
  assert.ok(!subject.includes("[待確認]"), "C 級（無 security）唔應加 [待確認]");
});

// ── 13. WhatsApp CTA 助手：官方 wa.me 連結（純數字國際號，無 query）─────────────
// 契約：whatsappTarget(phone) 回傳**完整 URL**（例：https://wa.me/85291234567）或 null；
// 有別於 mailtoTarget（只回傳地址）。只接受數字、可選前置 +、以及視覺分隔符。
const WA = "https://wa.me/";

await t("whatsapp：HK 本地恰好 8 位 → 前綴 852", () => {
  assert.equal(whatsappTarget("53353313"), `${WA}85253353313`);
});

await t("whatsapp：HK 本地可帶視覺分隔符 → 仍補 852", () => {
  for (const raw of ["5335 3313", "5335-3313", "(5335) 3313", "5335.3313"]) {
    assert.equal(whatsappTarget(raw), `${WA}85253353313`, `輸入 ${raw}`);
  }
});

await t("whatsapp：+852 國際格式 → 保留（唔再加 852）", () => {
  assert.equal(whatsappTarget("+852 9123 4567"), `${WA}85291234567`);
  assert.equal(whatsappTarget("+85291234567"), `${WA}85291234567`);
});

await t("whatsapp：裸 852 11 位 → 保留", () => {
  assert.equal(whatsappTarget("85291234567"), `${WA}85291234567`);
  assert.equal(whatsappTarget("(852) 9123-4567"), `${WA}85291234567`);
});

await t("whatsapp：明確 + 國際（+44）及 00 前綴 → 正規化", () => {
  assert.equal(whatsappTarget("+44 20 7946 0958"), `${WA}442079460958`);
  assert.equal(whatsappTarget("0044 20 7946 0958"), `${WA}442079460958`);
  assert.equal(whatsappTarget("004479460958"), `${WA}4479460958`);
});

await t("whatsapp：明確 + 8 位（非 HK）→ 唔可以擅自補 852", () => {
  assert.equal(whatsappTarget("+12345678"), `${WA}12345678`);
});

await t("whatsapp：裸國際 9-15 位（legacy 相容）→ 保留", () => {
  assert.equal(whatsappTarget("123456789"), `${WA}123456789`);
  assert.equal(whatsappTarget("123456789012345"), `${WA}123456789012345`);
});

await t("whatsapp：外層空格可去，但控制字元／CRLF 一律拒絕", () => {
  assert.equal(whatsappTarget("  +85291234567  "), `${WA}85291234567`);
  assert.equal(whatsappTarget("+85291234567\r\n"), null);
  assert.equal(whatsappTarget("+852\t91234567"), null);
  assert.equal(whatsappTarget("+85291234567\u0007"), null);
});

await t("whatsapp：文字／分機／HTML／URL／query 一律拒絕", () => {
  assert.equal(whatsappTarget("call me<script>"), null);
  assert.equal(whatsappTarget("+85291234567 ext 12"), null);
  assert.equal(whatsappTarget("https://wa.me/85291234567"), null);
  assert.equal(whatsappTarget("+85291234567?text=hi"), null);
  assert.equal(whatsappTarget("9123 4567<script>alert(1)</script>"), null);
});

await t("whatsapp：多個 +／空值／純符號 → null", () => {
  assert.equal(whatsappTarget("++85291234567"), null);
  assert.equal(whatsappTarget("+8529+1234567"), null);
  assert.equal(whatsappTarget("+"), null);
  assert.equal(whatsappTarget(""), null);
  assert.equal(whatsappTarget("   "), null);
});

await t("whatsapp：位數不足／過長／前導 0 → null", () => {
  assert.equal(whatsappTarget("9123456"), null); // 裸 7 位：含糊
  assert.equal(whatsappTarget("091234567"), null); // 單一前導 0
  assert.equal(whatsappTarget("+123456"), null); // < 7 位
  assert.equal(whatsappTarget("+1234567890123456"), null); // 16 位 > 15
  assert.equal(whatsappTarget("1234567890123456"), null); // 裸 16 位
  assert.equal(whatsappTarget("+0123456789"), null); // + 後前導 0
  assert.equal(whatsappTarget("00123456"), null); // 00 後不足 7 位
});

// ── 14. WhatsApp 按鈕：合法電話先出現，位置／顏色／email-safe 契約 ──────────────
const CTA_TEXT = "WhatsApp 回覆客戶";

await t("CTA：contact 合法電話 → 恰好一個按鈕，href 正確且無 query", () => {
  const { html } = buildMailEmail(mk({ phone: "+852 9123 4567" }));
  assert.equal(count(html, CTA_TEXT), 1, "應恰好一個 WhatsApp 按鈕");
  assert.ok(html.includes(`href="${WA}85291234567"`), "href 應為 wa.me 國際數字（無 +）");
  assert.ok(!html.includes(`${WA}85291234567?`), "唔可以有 query string");
  assert.ok(html.includes("#25D366"), "按鈕應為 WhatsApp 綠 #25D366");
  assert.ok(html.includes("color:#ffffff !important"), "文字應白色且 !important");
  assert.ok(/font-weight:\s*700/.test(html), "文字應粗體");
  assert.ok(html.includes("font-size:16px"), "文字 16px");
  assert.ok(/max-width\s*:\s*260px/.test(html), "按鈕上限 ~260px");
  const i = html.indexOf(CTA_TEXT);
  const block = html.slice(Math.max(0, i - 800), i + CTA_TEXT.length);
  assert.ok(block.includes('align="center"'), "按鈕應置中");
});

await t("CTA：email-safe（table + inline，無 script/svg/flex）", () => {
  const { html } = buildMailEmail(mk({ phone: "+852 9123 4567" }));
  assert.ok(!/<script/i.test(html));
  assert.ok(!/<svg/i.test(html), "唔可以用 svg");
  assert.ok(!/display\s*:\s*(grid|flex)/i.test(html));
  const i = html.indexOf(CTA_TEXT);
  const seg = html.slice(Math.max(0, i - 900), i);
  assert.ok(/<table[^>]*role="presentation"/.test(seg), "按鈕應以 table 排版");
  assert.ok(/<a[^>]*href=/.test(seg), "按鈕應為 <a> 連結");
});

await t("CTA：位置喺客戶訊息之後、安全資訊之前", () => {
  const { html } = buildMailEmail(mk({ phone: "+852 9123 4567" }));
  const iMsg = html.indexOf("客戶訊息");
  const iCta = html.indexOf(CTA_TEXT);
  const iSec = html.indexOf("安全與來源資訊");
  assert.ok(iMsg >= 0 && iCta >= 0 && iSec >= 0, "三個區塊都應存在");
  assert.ok(iMsg < iCta, "按鈕應喺客戶訊息之後");
  assert.ok(iCta < iSec, "按鈕應喺安全資訊之前");
});

await t("CTA：assessment 有客人補充 → 按鈕喺補充之後", () => {
  const message = `${SUMMARY_LITERAL}\n\n客人補充：想盡快開始`;
  const { html } = buildMailEmail(mk({ source: "assessment", leadGrade: "A", phone: "53353313", message }));
  assert.equal(count(html, CTA_TEXT), 1);
  assert.ok(html.includes(`href="${WA}85253353313"`), "本地 8 位應補 852");
  assert.ok(html.indexOf("客人補充") < html.indexOf(CTA_TEXT), "按鈕應喺客人補充之後");
  assert.ok(html.indexOf(CTA_TEXT) < html.indexOf("安全與來源資訊"));
});

await t("CTA：assessment 無客人補充（note 空）→ 仍出現按鈕", () => {
  const { html } = buildMailEmail(
    mk({ source: "assessment", leadGrade: "A", phone: "53353313", message: SUMMARY_LITERAL }),
  );
  assert.equal(count(html, CTA_TEXT), 1, "無註解仍要有按鈕");
  assert.ok(html.includes(`href="${WA}85253353313"`));
});

await t("CTA：非法／無電話 → 完全唔出 wa.me（唔會用固定代理號頂替）", () => {
  for (const bad of ["call me<script>", "", "好多字", "+85291234567\r\n"]) {
    const { html } = buildMailEmail(mk({ phone: bad }));
    assert.equal(count(html, CTA_TEXT), 0, `非法電話「${bad}」唔應有按鈕`);
    assert.ok(!html.includes("wa.me"), `非法電話「${bad}」唔應有 wa.me`);
  }
});

await t("CTA：非法電話仍保留原始（已轉義）電話文字", () => {
  const { html } = buildMailEmail(mk({ phone: "call me<script>alert(1)</script>" }));
  assert.equal(count(html, CTA_TEXT), 0);
  assert.ok(html.includes("&lt;script&gt;"), "原始電話文字應以轉義純文字保留");
});

await t("CTA：新增按鈕唔影響既有 tel／email 連結", () => {
  const { html } = buildMailEmail(mk({ phone: "+852 9123 4567", email: "client@example.com" }));
  assert.ok(html.includes('href="mailto:client@example.com"'), "email 連結應保留");
  assert.ok(html.includes('href="tel:+85291234567"'), "tel 連結應保留");
  assert.equal(count(html, CTA_TEXT), 1);
});

await t("CTA：風險 review → [待確認] 前綴不變，按鈕照出", () => {
  const { subject, html } = buildMailEmail(
    mk({
      phone: "+852 9123 4567",
      security: {
        verification: "verified",
        risk: { level: "review", score: 30, reasons: ["內容含可疑連結"] },
        network: { asn: 13335, organization: "Cloudflare, Inc.", country: "HK" },
      },
    }),
  );
  assert.ok(subject.startsWith("[待確認] "), "review 主旨前綴應不變");
  assert.ok(html.includes("[待確認]"));
  assert.equal(count(html, CTA_TEXT), 1);
});

// ── 結果 ─────────────────────────────────────────────────────────────────────
await t("security：低於審核門檻但已有訊號仍顯示原因，不假稱零風險", () => {
  const { subject, html } = buildMailEmail(mk({ security: {
    verification: "verified",
    risk: { level: "low", score: 20, reasons: ["公司名稱只填數字"] },
    network: { asn: null, organization: "", country: "" },
  } }));
  assert.ok(html.includes("有內容風險訊號（20分）"));
  assert.ok(html.includes("公司名稱只填數字"));
  assert.ok(!html.includes("未見已知內容風險（20分）"));
  assert.ok(!subject.startsWith("[待確認]"), "不足門檻只提示，唔提升為待確認主旨");
});

console.log(`\nmail-email.test — ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("失敗項目：");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log(`artifact source: lib/mail-email.ts + tests/mail-email.test.ts (真 HTML 輸出，preview-only)`);

// 小工具：斷言「該句在 HTML 內出現次數」時，需用同 escape 規則比對
function escapeForCount(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
