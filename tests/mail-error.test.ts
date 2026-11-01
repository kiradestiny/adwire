/**
 * tests/mail-error.test.ts — 表單送出失敗「安全顯示」純函式
 *
 * 執行方式（Node 原生 type stripping，repo 未安裝測試框架）：
 *   node --experimental-strip-types tests/mail-error.test.ts
 *
 * 覆蓋目標（對應後端 functions/send-mail.php.ts 的失敗回應）：
 *   1) 合法參考編號：allowlist code + 合法 UUID requestId → 附上可見「參考編號」
 *   2) 缺參考編號：冇 requestId／requestId 唔係 UUID → 不附參考編號
 *   3) 惡意 code／ref 被拒：非 allowlist code、<script>、超長字串一律唔顯示
 *   4) message 保留：客人見到嘅後端原因原封不動
 *   5) 超大／非字串 message 被拒 → 用 fallback
 *   6) 永不顯示 provider 原始細節（整段 output 只可以係 message ＋ 白名單 code）
 */

import assert from "node:assert/strict";

type MailErrorModule = typeof import("../lib/mail-error");

const specifier: string = ["..", "lib", "mail-error.ts"].join("/");

// ── 迷你測試框架 ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

async function t(name: string, fn: () => void): Promise<void> {
  try {
    fn();
    passed++;
    console.log(`  \u2705 ${name}`);
  } catch (e) {
    failed++;
    const msg = e instanceof Error ? e.message : String(e);
    failures.push(`${name} → ${msg}`);
    console.log(`  \u274c ${name}\n     ${msg}`);
  }
}

const VALID_UUID_LOWER = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const VALID_UUID_UPPER = "3F2504E0-4F89-41D3-9A0C-0305E82C3301";

const FAIL_MESSAGE = "系統暫時未能發送，請直接 WhatsApp 或電郵 info@adwire.com.hk。";

async function main(): Promise<void> {
  const M = (await import(specifier)) as MailErrorModule;

  console.log("mail-error — 表單失敗訊息安全顯示純函式\n");

  // ── 1. 合法參考編號 ───────────────────────────────────────────────────────
  console.log("\n1) 合法參考編號：allowlist code + 合法 UUID → 附上可見參考編號");
  await t("provider_error + 合法 UUID → message 保留且附上參考編號／uuid／code", () => {
    const out = M.formatSubmitFailure(
      { success: false, message: FAIL_MESSAGE, code: "provider_error", requestId: VALID_UUID_LOWER },
      "FALLBACK",
    );
    assert.ok(out.startsWith(FAIL_MESSAGE), `message 必須原封不動置前：${out}`);
    assert.ok(out.includes(M.SUPPORT_REF_LABEL), `應含參考編號標籤：${out}`);
    assert.ok(out.includes(VALID_UUID_LOWER), `應含 requestId：${out}`);
    assert.ok(out.includes("provider_error"), `應含 allowlist code：${out}`);
    assert.ok(!out.includes("FALLBACK"), "有真實 message 時不可用 fallback");
  });

  await t("三個 allowlist code（missing_config／provider_error／network_error）皆可附參考編號", () => {
    for (const code of ["missing_config", "provider_error", "network_error"] as const) {
      const out = M.formatSubmitFailure(
        { success: false, message: FAIL_MESSAGE, code, requestId: VALID_UUID_LOWER },
        "FALLBACK",
      );
      assert.ok(out.startsWith(FAIL_MESSAGE), `${code}: message 保留`);
      assert.ok(out.includes(code), `${code}: code 應出現`);
      assert.ok(out.includes(VALID_UUID_LOWER), `${code}: uuid 應出現`);
    }
  });

  await t("大寫 UUID 亦視為合法", () => {
    const out = M.formatSubmitFailure(
      { message: FAIL_MESSAGE, code: "network_error", requestId: VALID_UUID_UPPER },
      "FALLBACK",
    );
    assert.ok(out.includes(VALID_UUID_UPPER), `${out}`);
    assert.ok(out.includes(M.SUPPORT_REF_LABEL), `${out}`);
  });

  // ── 2. 缺參考編號 ─────────────────────────────────────────────────────────
  console.log("\n2) 缺參考編號：唔附參考編號，但 message 保留");
  await t("冇 requestId（allowlist code）→ 只顯示 message，冇參考編號", () => {
    const out = M.formatSubmitFailure(
      { success: false, message: FAIL_MESSAGE, code: "provider_error" },
      "FALLBACK",
    );
    assert.equal(out, FAIL_MESSAGE, `應等於原 message：${out}`);
    assert.ok(!out.includes(M.SUPPORT_REF_LABEL), "唔應有參考編號");
  });

  await t("requestId 唔係 UUID → 唔附參考編號", () => {
    for (const bad of ["", "not-a-uuid", "12345", "3f2504e0-4f89-41d3-9a0c", `${VALID_UUID_LOWER}extra`]) {
      const out = M.formatSubmitFailure(
        { message: FAIL_MESSAGE, code: "provider_error", requestId: bad },
        "FALLBACK",
      );
      assert.equal(out, FAIL_MESSAGE, `requestId=${JSON.stringify(bad)} 應不加參考編號：${out}`);
    }
  });

  // ── 3. 惡意 code／ref 被拒 ────────────────────────────────────────────────
  console.log("\n3) 惡意／非白名單 code 及 ref 被拒");
  await t("非 allowlist code → 唔附參考編號且 code 唔外洩", () => {
    for (const bad of ["<script>alert(1)</script>", "UNKNOWN", "provider_error ", "PROVIDER_ERROR", "resend_500"]) {
      const out = M.formatSubmitFailure(
        { message: FAIL_MESSAGE, code: bad, requestId: VALID_UUID_LOWER },
        "FALLBACK",
      );
      assert.equal(out, FAIL_MESSAGE, `code=${JSON.stringify(bad)} 應被拒：${out}`);
      assert.ok(!out.includes(String(bad)), "被拒 code 不可出現在 output");
      assert.ok(!out.includes(M.SUPPORT_REF_LABEL), "唔應有參考編號");
    }
  });

  await t("惡意 requestId（<script>／超長）→ 唔附參考編號且唔外洩", () => {
    const bads = [
      "<script>alert(1)</script>",
      "../../etc/passwd",
      "a".repeat(5000),
      `${VALID_UUID_LOWER}\n<script>`,
    ];
    for (const bad of bads) {
      const out = M.formatSubmitFailure(
        { message: FAIL_MESSAGE, code: "network_error", requestId: bad },
        "FALLBACK",
      );
      assert.equal(out, FAIL_MESSAGE, `requestId 惡意值應被拒：${out}`);
      assert.ok(!out.includes("<script>"), "唔可含 <script>");
      assert.ok(!out.includes("../etc/passwd"), "唔可含路徑");
      assert.ok(out.length < 500, `output 不應因超長 ref 而膨脹：len=${out.length}`);
    }
  });

  // ── 4. message 保留 ───────────────────────────────────────────────────────
  console.log("\n4) message 保留（客人見到嘅原因不變）");
  await t("自訂 message 原封不動（含中文及標點）", () => {
    const msg = "提交太頻繁，請稍後再試。";
    const out = M.formatSubmitFailure({ success: false, message: msg }, msg /*fallback 故意相同*/);
    assert.equal(out, msg, `應完全等於原 message：${out}`);
  });

  await t("message 前後空白被 trim、控制字元被清，但內容保留", () => {
    const out = M.formatSubmitFailure({ message: "  系統繁忙\u0000，請再試。  " }, "FALLBACK");
    assert.ok(out.includes("系統繁忙"), `${out}`);
    assert.ok(out.includes("請再試"), `${out}`);
    assert.ok(!out.includes("\u0000"), "控制字元應被移除");
    assert.ok(out === out.trim(), "首尾應已 trim");
  });

  // ── 5. 超大／非字串 message 被拒 → fallback ───────────────────────────────
  console.log("\n5) 超大／非字串 message 被拒 → fallback");
  await t("超長 message → 用 fallback（唔會 render 巨型字串）", () => {
    const out = M.formatSubmitFailure({ message: "壞".repeat(5000), code: "provider_error", requestId: VALID_UUID_LOWER }, "FALLBACK");
    assert.ok(out.startsWith("FALLBACK"), `超長 message 應被拒、改用 fallback：${out}`);
    assert.ok(!out.includes("壞"), "巨型 message 內容不可出現");
    assert.ok(out.length < 500, `output 不應膨脹：len=${out.length}`);
  });

  await t("message 非字串（number／null／object／undefined）→ fallback", () => {
    for (const bad of [42, null, {}, [], undefined]) {
      const out = M.formatSubmitFailure({ message: bad }, "FALLBACK");
      assert.equal(out, "FALLBACK", `message=${JSON.stringify(bad)} 應 fallback：${out}`);
    }
  });

  await t("result 為 null／undefined → fallback", () => {
    assert.equal(M.formatSubmitFailure(null, "FALLBACK"), "FALLBACK");
    assert.equal(M.formatSubmitFailure(undefined, "FALLBACK"), "FALLBACK");
  });

  // ── 6. 永不顯示 provider 原始細節 ─────────────────────────────────────────
  console.log("\n6) 永不顯示 provider 原始細節");
  await t("額外欄位（provider 錯誤、API key）唔會出現在 output", () => {
    const secret = "re_live_SECRET_KEY_1234567890";
    const out = M.formatSubmitFailure(
      {
        success: false,
        message: FAIL_MESSAGE,
        code: "provider_error",
        requestId: VALID_UUID_LOWER,
        providerDetail: `resend 502: unauthorized key=${secret}`,
        stack: "Error at send-mail.php.ts:380",
      },
      "FALLBACK",
    );
    assert.ok(out.startsWith(FAIL_MESSAGE), "message 保留");
    assert.ok(out.includes(VALID_UUID_LOWER), "合法參考編號仍在");
    assert.ok(!out.includes(secret), "不可外洩 API key");
    assert.ok(!out.includes("providerDetail"), "不可顯示 provider 欄位名");
    assert.ok(!out.includes("send-mail.php.ts"), "不可顯示 stack");
    assert.ok(!out.includes("unauthorized"), "不可顯示 provider 原始錯誤");
  });

  // ── 匯出契約 ──────────────────────────────────────────────────────────────
  console.log("\n7) 匯出契約");
  await t("isAllowlistedFailureCode / isValidRequestId 行為正確", () => {
    assert.equal(M.isAllowlistedFailureCode("provider_error"), true);
    assert.equal(M.isAllowlistedFailureCode("missing_config"), true);
    assert.equal(M.isAllowlistedFailureCode("network_error"), true);
    assert.equal(M.isAllowlistedFailureCode("other"), false);
    assert.equal(M.isAllowlistedFailureCode(undefined), false);
    assert.equal(M.isValidRequestId(VALID_UUID_LOWER), true);
    assert.equal(M.isValidRequestId("nope"), false);
    assert.equal(M.isValidRequestId(null), false);
  });

  console.log("\n" + "─".repeat(64));
  console.log(`通過 ${passed} 項，失敗 ${failed} 項。`);
  if (failed > 0) {
    console.log("失敗項目：\n - " + failures.join("\n - "));
    process.exit(1);
  }
  console.log("\u2705 全部通過。");
}

void main();
