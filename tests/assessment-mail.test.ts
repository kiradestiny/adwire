/**
 * tests/assessment-mail.test.ts — /start 問卷交接 → functions/send-mail.php.ts 端到端（供應商 mock）
 *
 * 執行方式（Node 原生 type stripping，repo 未安裝測試框架）：
 *   node --experimental-strip-types tests/assessment-mail.test.ts
 *
 * 目的：由真正的 lib/assessment.ts（classify / buildPrefill / leadScore）產生答案，
 * 再以 app/start/AssessmentLeadForm.tsx 完全相同的方式砌出 POST body，餵入真正的
 * send-mail.php.ts handler。只 mock 兩個外部副作用：
 *   1. Turnstile siteverify → 固定回 success（唔呼叫 Cloudflare）
 *   2. Resend /emails → 回 { id } 並擷取請求 body（唔真的寄信）
 * 其餘（驗證、清理、fingerprint、去重、信封、HTML 轉義）都行真程式碼。
 *
 * ⚠️ 這係「整合測試 + mock 供應商」，可以證明 handler 對問卷 payload 的行為正確，
 *    但**唔可以**證明正式站真的收到 Email（冇真實網絡、冇真實 Resend、冇部署）。
 *
 * 為何動態 import：Node ESM 需要顯式 .ts 副檔名，而 repo 的 tsconfig 未啟用
 * allowImportingTsExtensions。故型別用 extensionless 的 `import type`（執行時抹除），
 * 執行時以計算出的字串動態 import 真正的 .ts 模組。（與 tests/assessment.test.ts 一致。）
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Answers, Goal, Role } from "../lib/assessment";

type AssessmentModule = typeof import("../lib/assessment");
type LeadScore = ReturnType<AssessmentModule["leadScore"]>;
type AssessmentResult = ReturnType<AssessmentModule["classify"]>;
type PrefillPayload = ReturnType<AssessmentModule["buildPrefill"]>;

const assessmentSpecifier: string = ["..", "lib", "assessment.ts"].join("/");
const handlerSpecifier: string = ["..", "functions", "send-mail.php.ts"].join("/");
const formSecuritySpecifier: string = ["..", "lib", "form-security.ts"].join("/");

type PagesFunctionModule = {
  onRequest: (context: { request: Request; env: Record<string, unknown> }) => Promise<Response>;
};

let moduleCounter = 0;
const load = (): Promise<PagesFunctionModule> =>
  import(`${handlerSpecifier}?case=am${moduleCounter++}`) as Promise<PagesFunctionModule>;

// ── 白名單（Single Source of Truth）────────────────────────────────────────────
const SERVICES: readonly string[] = (
  JSON.parse(readFileSync(new URL("../public/config/services.json", import.meta.url), "utf8")) as {
    services: string[];
  }
).services;

// ── 迷你測試框架 ──────────────────────────────────────────────────────────────
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
    failures.push(`${name} → ${msg}`);
    console.log(`  \u274c ${name}\n     ${msg}`);
  }
}

// ── 供應商 mock ───────────────────────────────────────────────────────────────
const TURNSTILE_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RESEND_URL = "https://api.resend.com/emails";

const jsonResp = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

interface ResendCapture {
  url: string;
  payload: Record<string, unknown>;
}

/** 只 mock Turnstile（成功）與 Resend（擷取 payload）；任何其他 URL 視為錯誤。 */
function mockProviderNetwork(): { fn: (url: unknown, init: unknown) => Promise<Response>; resend: ResendCapture[] } {
  const resend: ResendCapture[] = [];
  const fn = async (url: unknown, init: unknown): Promise<Response> => {
    const u = String(url);
    if (u.includes(TURNSTILE_URL)) return jsonResp({ success: true, hostname: "adwire.com.hk", "error-codes": [] });
    if (u === RESEND_URL) {
      const raw = (init as { body?: unknown } | undefined)?.body;
      resend.push({ url: u, payload: JSON.parse(String(raw)) as Record<string, unknown> });
      return jsonResp({ id: "email_mock_assessment" });
    }
    throw new Error(`unexpected fetch: ${u}`);
  };
  return { fn, resend };
}

function withFetch(fn: unknown): () => void {
  const real = globalThis.fetch;
  (globalThis as { fetch: unknown }).fetch = fn;
  return () => {
    (globalThis as { fetch: unknown }).fetch = real;
  };
}

interface MockKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  _map: Map<string, string>;
}

function mockKV(): MockKV {
  const map = new Map<string, string>();
  return {
    _map: map,
    async get(key: string) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    async put(key: string, value: string) {
      map.set(key, value);
    },
  };
}

function mkRequest(body: Record<string, unknown>): Request {
  return new Request("https://adwire.com.hk/send-mail.php", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "origin": "https://adwire.com.hk",
      "cf-connecting-ip": "203.0.113.7",
      "cf-ipcountry": "HK",
      "user-agent": "assessment-mail-test",
    },
    body: JSON.stringify(body),
  });
}

function baseEnv(kv: MockKV): Record<string, unknown> {
  return {
    RESEND_API_KEY: "re_test_key_ASSESS_001",
    MAIL_TO: "info@adwire.com.hk",
    MAIL_FROM: "ADWire Website <website@adwire.com.hk>",
    TURNSTILE_SECRET: "ts_test_secret_ASSESS_002",
    ENQUIRIES: kv,
  };
}

// ── 前端 payload 產生器（與 AssessmentLeadForm.tsx 一行一行對齊）───────────────
function assessmentPayload(opts: {
  prefill: PrefillPayload;
  lead: LeadScore;
  name: string;
  phone: string;
  email: string;
  company?: string;
  note?: string;
  turnstileToken?: string;
}): Record<string, unknown> {
  const { prefill, lead } = opts;
  const note = (opts.note ?? "").trim();
  return {
    name: opts.name,
    phone: opts.phone,
    email: opts.email,
    company: opts.company ?? "",
    service: prefill.service,
    budget: prefill.budget,
    timeline: prefill.timeline,
    message: note ? `${prefill.message}\n\n客人補充：${note}` : prefill.message,
    website: "",
    formStartedAt: Date.now() - 10_000,
    source: "assessment",
    leadGrade: lead.grade,
    leadNotes: `${lead.score} 分${lead.notes.length ? `｜${lead.notes.join("、")}` : ""}`,
    turnstileToken: opts.turnstileToken ?? "turnstile-ok-token",
  };
}

/** 普通聯絡表單（ContactSection.tsx）payload：無 source / leadGrade / leadNotes。 */
function ordinaryPayload(opts: {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  company?: string;
  companySite?: string;
  budget?: string;
  timeline?: string;
}): Record<string, unknown> {
  return {
    name: opts.name,
    phone: opts.phone,
    email: opts.email,
    service: opts.service,
    message: opts.message,
    company: opts.company ?? "",
    companySite: opts.companySite ?? "",
    budget: opts.budget ?? "尚未確定",
    timeline: opts.timeline ?? "尚未確定",
    systemInfo: "",
    website: "",
    // 聯絡表單（ContactSection）送 ISO 時間字串（與真實前端一致）。
    formStartedAt: new Date(Date.now() - 10_000).toISOString(),
    turnstileToken: "turnstile-ok-token",
  };
}

// ── handler 內部語意鏡像（用嚟計出「應該」出現喺郵件 HTML 嘅內容）─────────────
/** 與 send-mail.php.ts 的 clean() 一致：控制字元（含 \n）→ 空格、trim、slice。 */
const cleanLike = (v: string, max: number) =>
  v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

/** 與 send-mail.php.ts 的 escapeHtml() 一致。 */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// ── 獨立結構化解析（鏡像 lib/mail-email.ts 契約，計出「應該」出現喺 HTML 嘅欄位）──
// 刻意唔 import renderer 嘅 parser：呢度獨立重建 label/value + 客人補充，
// 以便證明 handler→renderer 管線「逐項保留」而非「自我驗證」。
const ASSESS_TITLE = "【ADWire 需求評估摘要】";
const ASSESS_LABELS = ["想處理", "主要情況", "現有基礎", "可投入", "預計開始", "角色", "建議方向", "評估結果"];
const normalizeNl = (s: string) => String(s ?? "").replace(/\r\n?/g, "\n");
/** 鏡像 renderer 嘅 escBr：escape 後將 LF 轉 <br>（保留多行）。 */
const escBr = (s: string) => esc(normalizeNl(s)).replace(/\n/g, "<br>");
const countOccurrences = (hay: string, needle: string) => (needle ? hay.split(needle).length - 1 : 0);

function parseLike(message: string): { fields: Array<{ label: string; value: string }>; note: string } | null {
  const lines = normalizeNl(message).split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i >= lines.length || lines[i].trim() !== ASSESS_TITLE) return null;
  const labelRe = new RegExp(`^(${ASSESS_LABELS.join("|")})[：:]`);
  const fields: Array<{ label: string; value: string }> = [];
  const seen = new Set<string>();
  let note: string | null = null;
  let matched = false;
  for (i++; i < lines.length; i++) {
    const raw = lines[i];
    if (note !== null) {
      note += "\n" + raw;
      continue;
    }
    const t = raw.trim();
    if (t === "") continue;
    if (/^客人補充[：:]/.test(t)) {
      note = t.replace(/^客人補充[：:]/, "");
      continue;
    }
    const m = labelRe.exec(t);
    if (m) {
      matched = true;
      const label = m[1];
      const value = t.slice(m[0].length).trim();
      const key = `${label}\u0000${value}`;
      if (!seen.has(key)) {
        seen.add(key);
        fields.push({ label, value });
      }
      continue;
    }
  }
  if (!matched && note === null) return null;
  return { fields, note: note ?? "" };
}

// ── 15 條業務分支 ─────────────────────────────────────────────────────────────
interface Branch {
  goal: Goal;
  problem: string;
  base: string;
}

function businessBranches(A: AssessmentModule): Branch[] {
  const out: Branch[] = [];
  for (const goal of ["growth", "ops", "project"] as Goal[]) {
    for (const opt of A.optionsForGoal(goal)) {
      const qs = A.getQuestions({ goal, problem: opt.id });
      const base = qs.find((q) => q.id === "base")?.options[0]?.id;
      if (!base) throw new Error(`無 base 選項：${goal}/${opt.id}`);
      out.push({ goal, problem: opt.id, base });
    }
  }
  return out;
}

function answersFor(A: AssessmentModule, b: Branch, role: Role): Answers {
  let a: Answers = {};
  a = A.applyAnswer(a, "goal", b.goal);
  a = A.applyAnswer(a, "problem", b.problem);
  a = A.applyAnswer(a, "base", b.base);
  a = A.applyAnswer(a, "budget", "at-floor");
  a = A.applyAnswer(a, "timing", "within-month");
  a = A.applyAnswer(a, "role", role);
  return a;
}

async function main(): Promise<void> {
  const A = (await import(assessmentSpecifier)) as AssessmentModule;
  const formSec = (await import(formSecuritySpecifier)) as {
    normalizeMultiline: (v: unknown, max: number) => string;
  };
  const normalizeMultiline = formSec.normalizeMultiline;

  console.log("assessment-mail — 問卷交接 → send-mail.php 端到端（供應商 mock）\n");

  const branches = businessBranches(A);
  console.log(`0) 分支枚舉：應為 15 條業務分支`);
  await t("optionsForGoal 展開後恰好 15 條（4 growth + 4 ops + 7 project）", () => {
    assert.equal(branches.length, 15, `實際 ${branches.length}`);
    const byGoal = (g: Goal) => branches.filter((b) => b.goal === g).length;
    assert.equal(byGoal("growth"), 4);
    assert.equal(byGoal("ops"), 4);
    assert.equal(byGoal("project"), 7);
  });

  // ── 1. 每條分支：真 buildPrefill/classify/leadScore → handler → Resend 一次 ──
  console.log("\n1) 15 條業務分支：真問卷 payload → Resend 被呼叫一次、信封與評級標題正確");
  for (const b of branches) {
    await t(`[${b.goal}/${b.problem}] 送出 → 200 / Resend×1 / 標題帶評級`, async () => {
      const a = answersFor(A, b, "manager");
      const result: AssessmentResult = A.classify(a);
      const lead = A.leadScore(a);
      const prefill = A.buildPrefill(result, a);

      assert.ok(
        SERVICES.includes(prefill.service),
        `prefill.service 必須在 services.json 白名單：${prefill.service}`,
      );

      const mod = await load();
      const kv = mockKV();
      const { fn, resend } = mockProviderNetwork();
      const restore = withFetch(fn);
      try {
        const body = assessmentPayload({
          prefill,
          lead,
          name: "陳大文",
          phone: "91234567",
          email: "lead@example.com",
          company: "測試公司",
          note: "請盡快聯絡我",
        });
        const res = await mod.onRequest({ request: mkRequest(body), env: baseEnv(kv) });
        assert.equal(res.status, 200);
        assert.equal(((await res.json()) as { success: boolean }).success, true);
        assert.equal(resend.length, 1, "Resend /emails 應被呼叫恰好一次");

        const p = resend[0].payload;
        assert.equal(p.from, "ADWire Website <website@adwire.com.hk>");
        assert.deepEqual(p.to, ["info@adwire.com.hk"]);
        assert.equal(p.reply_to, "lead@example.com");
        assert.ok(String(p.subject).startsWith("【需求評估・"), `subject 應帶評級標籤：${p.subject}`);
        assert.ok(String(p.subject).includes(`${lead.grade} 級`), `subject 應含 ${lead.grade} 級`);

        // 結構化渲染：標題、每個摘要 label/value、每行客人補充都必須獨立保留（轉義後）
        const html = String(p.html);
        const normalized = normalizeMultiline(body.message, 2000);
        assert.ok(html.includes("需求評估內容"), "郵件應含「需求評估內容」區塊標題");
        const parsed = parseLike(normalized);
        assert.ok(parsed, "問卷摘要必須可被結構化解析（標題格式正確）");
        for (const f of parsed!.fields) {
          assert.ok(html.includes(esc(f.label)), `摘要欄位標籤必須保留：${f.label}`);
          assert.ok(html.includes(escBr(f.value)), `摘要欄位值必須保留：${f.label}=${f.value}`);
        }
        // 完全相同嘅重複摘要行（例如 prefill 附加嘅「可投入」）只可渲染一次；
        // 若同一標籤有唔同值則兩者皆保留（唔可以遺失）。
        const budgetFields = parsed!.fields.filter((f) => f.label === "可投入");
        assert.equal(budgetFields.length, 1, "完全相同的可投入摘要只應保留一次");
        for (const f of budgetFields) {
          assert.equal(
            countOccurrences(html, escBr(f.value)),
            1,
            `完全相同的可投入數值只可渲染一次：${f.value}`,
          );
        }
        // 每行「客人補充」都必須分別被轉義並保留
        const noteLines = parsed!.note.split("\n").filter((l) => l.trim() !== "");
        assert.ok(noteLines.length >= 1, "應保留「客人補充」內容");
        for (const line of noteLines) {
          assert.ok(html.includes(esc(line)), `客人補充每一行都必須保留：${line}`);
        }
        assert.ok(String(p.html).includes(lead.notes.join("、")) || lead.notes.length === 0, "郵件應含評級備註");

        // lead 副本只寫一筆，且 enq.message 必須等於 normalizeMultiline(message, 2000)
        const enqKeys = [...kv._map.keys()].filter((k) => k.startsWith("enq:"));
        assert.equal(enqKeys.length, 1, "應寫入一筆 enq: lead 副本");
        const enq = JSON.parse(kv._map.get(enqKeys[0]) as string) as { message?: string };
        assert.equal(enq.message, normalized, "enq.message 必須等於 normalizeMultiline(message, 2000)");
      } finally {
        restore();
      }
    });
  }

  // ── 2. 問卷 vs 普通表單：只有問卷帶評級標題 ────────────────────────────────
  console.log("\n2) 普通表單（ContactSection）vs 問卷（/start）：信封相同、標題分流正確");
  await t("普通表單無 source → 標題【新客戶查詢】，且不含評級欄位", async () => {
    const mod = await load();
    const kv = mockKV();
    const { fn, resend } = mockProviderNetwork();
    const restore = withFetch(fn);
    try {
      const body = ordinaryPayload({
        name: "李小姐",
        phone: "98765432",
        email: "client@example.com",
        service: "網頁設計及優化",
        message: "想問網頁設計報價",
        company: "李記",
        companySite: "https://li.example",
        budget: "HK$30,000 – 80,000",
        timeline: "一至三個月內",
      });
      const res = await mod.onRequest({ request: mkRequest(body), env: baseEnv(kv) });
      assert.equal(res.status, 200);
      assert.equal(resend.length, 1);
      const p = resend[0].payload;
      assert.ok(String(p.subject).startsWith("【新客戶查詢】"), `subject：${p.subject}`);
      assert.ok(!String(p.html).includes("潛在客戶評級"), "普通表單不應有評級列");
      assert.ok(!String(p.html).includes("ADWire 需求評估摘要"), "普通表單不應有問卷摘要");
      assert.ok(String(p.html).includes("李記"), "公司名應出現在郵件");
    } finally {
      restore();
    }
  });

  // ── 3. 模擬用戶情境：researcher + ads 分支 + 非 ASCII + 備註含 HTML ──────────
  console.log("\n3) 模擬用戶情境：researcher 身處 ads 分支、非 ASCII 姓名、備註含 HTML 標籤");
  await t("非 ASCII 與 <script> 在郵件 HTML 被轉義；評級備註保留", async () => {
    const adsBranch = branches.find((b) => b.problem === "ads-low-enquiries");
    assert.ok(adsBranch, "應有 ads-low-enquiries 分支");
    const a = answersFor(A, adsBranch as Branch, "researcher");
    const lead = A.leadScore(a);
    const prefill = A.buildPrefill(A.classify(a), a);
    assert.ok(lead.notes.includes("需要向上匯報"), `researcher 應有「需要向上匯報」備註：${lead.notes.join("、")}`);

    const mod = await load();
    const kv = mockKV();
    const { fn, resend } = mockProviderNetwork();
    const restore = withFetch(fn);
    try {
      const body = assessmentPayload({
        prefill,
        lead,
        name: "黃小明 <script>alert(1)</script>",
        phone: "61234567",
        email: "wong@example.com",
        company: "香港品牌<測試>",
        note: "我想投放廣告 & 追蹤轉換，預算約 2 萬",
      });
      const res = await mod.onRequest({ request: mkRequest(body), env: baseEnv(kv) });
      assert.equal(res.status, 200);
      assert.equal(resend.length, 1);
      const p = resend[0].payload;
      const html = String(p.html);
      assert.ok(!html.includes("<script>"), "郵件 HTML 不可含原始 <script>");
      assert.ok(html.includes("&lt;script&gt;"), "姓名／公司內的 < > 必須被 escapeHtml 轉義");
      assert.ok(html.includes("&amp;"), "備註內的 & 必須被 escapeHtml 轉義");
      assert.ok(html.includes("需要向上匯報"), "評級備註應保留在郵件（grade B/C 情境）");
      assert.ok(String(p.subject).includes(`${lead.grade} 級`));
    } finally {
      restore();
    }
  });

  // ── 4. 超長補充：handler 夾在既有 2000 字上限，摘要前段保留 ──────────────────
  console.log("\n4) 超長「客人補充」：handler clean() 夾在 2000 字，摘要前段保留");
  await t("message > 2000 → enq.message 等於 normalizeMultiline 夾後原文，郵件逐項保留摘要", async () => {
    const branch = branches.find((b) => b.goal === "project" && b.problem === "proj-web");
    assert.ok(branch, "應有 proj-web 分支");
    const a = answersFor(A, branch as Branch, "owner");
    const lead = A.leadScore(a);
    const prefill = A.buildPrefill(A.classify(a), a);

    const longNote = "補".repeat(2500);
    const body = assessmentPayload({ prefill, lead, name: "長文測試", phone: "91112222", email: "long@example.com", note: longNote });
    const fullMessage = String(body.message);
    assert.ok(fullMessage.length > 2000, "情境需要 message 超過 2000 字");
    const normalized = normalizeMultiline(fullMessage, 2000);
    assert.equal(normalized.length, 2000, "normalizeMultiline 應夾到 2000 字");

    const mod = await load();
    const kv = mockKV();
    const { fn, resend } = mockProviderNetwork();
    const restore = withFetch(fn);
    try {
      const res = await mod.onRequest({ request: mkRequest(body), env: baseEnv(kv) });
      assert.equal(res.status, 200);
      assert.equal(resend.length, 1);
      const html = String(resend[0].payload.html);
      const parsed = parseLike(normalized);
      assert.ok(parsed, "夾後內容仍須可結構化解析");
      assert.ok(html.includes("需求評估內容"), "摘要區塊標題應保留");
      for (const f of parsed!.fields) {
        assert.ok(html.includes(esc(f.label)), `摘要欄位標籤應保留：${f.label}`);
        assert.ok(html.includes(escBr(f.value)), `摘要欄位值應保留：${f.label}=${f.value}`);
      }
      for (const line of parsed!.note.split("\n").filter((l) => l.trim() !== "")) {
        assert.ok(html.includes(esc(line)), `客人補充（夾後）每行應保留：${line}`);
      }
      assert.ok(!html.includes(longNote), "被截去的超長尾部不應出現");

      const enqKey = [...kv._map.keys()].find((k) => k.startsWith("enq:"));
      assert.ok(enqKey, "應寫入 enq: lead 副本");
      const enq = JSON.parse(kv._map.get(enqKey as string) as string) as { message?: string };
      assert.equal(enq.message, normalized, "enq.message 必須等於 normalizeMultiline 夾後原文");
    } finally {
      restore();
    }
  });

  // ── 5. 問卷 payload 保持既有防護（Honeypot / 驗證）──────────────────────────
  console.log("\n5) 問卷 payload 亦受既有防護：honeypot 及欄位驗證不變");
  await t("問卷 payload 填了 honeypot website → 回 success 但不寄信", async () => {
    const a = answersFor(A, branches[0], "manager");
    const lead = A.leadScore(a);
    const prefill = A.buildPrefill(A.classify(a), a);
    const mod = await load();
    const kv = mockKV();
    const { fn, resend } = mockProviderNetwork();
    const restore = withFetch(fn);
    try {
      const body = { ...assessmentPayload({ prefill, lead, name: "機械人", phone: "90000000", email: "bot@example.com" }), website: "http://spam" };
      const res = await mod.onRequest({ request: mkRequest(body), env: baseEnv(kv) });
      assert.equal(res.status, 200);
      assert.equal(((await res.json()) as { success: boolean }).success, true);
      assert.equal(resend.length, 0, "honeypot 不應呼叫 Resend");
    } finally {
      restore();
    }
  });

  // ── 總結 ──────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(64));
  console.log(`通過 ${passed} 項，失敗 ${failed} 項。`);
  if (failed > 0) {
    console.log("失敗項目：\n - " + failures.join("\n - "));
    process.exit(1);
  }
  console.log("\u2705 全部通過。");
}

void main();
