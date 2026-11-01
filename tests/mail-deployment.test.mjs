/**
 * tests/mail-deployment.test.mjs — 郵件部署安全護欄（源碼契約）
 *
 * 執行：node tests/mail-deployment.test.mjs
 * （repo 未安裝測試框架；與 tests/mobile-paint-source.test.mjs 同樣用手寫 runner。）
 *
 * 涵蓋兩個新 CLI：
 *   1. scripts/mail-safe-config.mjs  — 只建立「極小秘密補丁」（PATCH Pages 專案 env_vars）
 *      純函式護欄：只准白名單名稱、拒絕 null/空白/控制字元/遮罩值/整個回傳 config、
 *      絕不 GET->PATCH 來回、只送指定 env_vars、不記錄任何值。
 *   2. scripts/mail-readiness.mjs    — 部署後 readiness 檢查（GET /inbox?mailops=health）＋
 *      可選 --probe（POST /inbox?mailops=probe）；目標主機嚴格白名單（防 SSRF）；
 *      逾時／HTTP 失敗一律非零退出；只輸出安全摘要欄位；預設唔會真實寄信。
 *
 * 本測試零真實網絡（全部 mock fetch／in-memory）、零部署、零真實秘密。
 * 只用假值，並斷言 CLI 輸出永遠唔會包含假秘密值或 token。
 */

import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 受測模組（TDD：先寫測試，尚未存在 → RED）
const SAFE = "../scripts/mail-safe-config.mjs";
const READY = "../scripts/mail-readiness.mjs";

// ────────────────────────── 微型 runner ──────────────────────────
let passed = 0;
let failed = 0;
const failures = [];
async function t(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  \u2705 ${name}`);
  } catch (e) {
    failed++;
    const msg = e instanceof Error ? e.stack || e.message : String(e);
    failures.push(`${name} → ${msg.split("\n")[0]}`);
    console.log(`  \u274c ${name}\n     ${msg.split("\n").slice(0, 4).join("\n     ")}`);
  }
}

// ────────────────────────── 測試替身 ──────────────────────────
const FAKE_TOKEN = "otk_TEST_abcdef0123456789";
const FAKE_RESEND = "re_TEST_99887766554433221100";

/** 假的 Response-like。 */
function mockResponse(status, body, { text = false } = {}) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return typeof body === "string" ? JSON.parse(body) : body;
    },
    async text() {
      return raw;
    },
  };
}

/** 記錄每次 fetch，回傳預設回應。 */
function recorder(handler) {
  const calls = [];
  const fetchImpl = async (url, opts = {}) => {
    const method = (opts.method || "GET").toUpperCase();
    calls.push({ url: String(url), method, headers: opts.headers || {}, body: opts.body ?? null, signal: opts.signal ?? null });
    if (handler) {
      const r = await handler({ url: String(url), method, headers: opts.headers || {}, body: opts.body ?? null, opts });
      if (r !== undefined) return r;
    }
    return mockResponse(200, {});
  };
  return { fetchImpl, calls };
}

const tmp = mkdtempSync(path.join(os.tmpdir(), "mail-deploy-"));
function tmpFile(name, content) {
  const p = path.join(tmp, name);
  writeFileSync(p, content);
  return p;
}
function captureLogs() {
  const out = [];
  const err = [];
  return { out, err, log: (s) => out.push(String(s)), error: (s) => err.push(String(s)), joined: () => out.join("\n"), errJoined: () => err.join("\n") };
}

// ════════════════════════════ 1. 純護欄 ════════════════════════════
console.log("\n[1] mail-safe-config — 名稱／值護欄（純函式）");

await t("白名單：四個秘密名稱歸類為 secret_text，兩個非秘密名稱歸類為 plain_text", async () => {
  const m = await import(SAFE);
  for (const n of ["RESEND_API_KEY", "TURNSTILE_SECRET", "INBOX_PASSWORD", "MAIL_OPS_TOKEN"]) {
    assert.equal(m.classifyBinding(n), "secret_text", `${n} 應為 secret_text`);
  }
  for (const n of ["MAIL_TO", "MAIL_FROM"]) {
    assert.equal(m.classifyBinding(n), "plain_text", `${n} 應為 plain_text`);
  }
  assert.ok(m.ALLOWED_SECRET_BINDINGS.includes("MAIL_OPS_TOKEN"));
});

await t("非白名單名稱被拒（ADMIN_API_KEY / NEXT_PUBLIC_API_URL / 任意名稱）", async () => {
  const m = await import(SAFE);
  for (const n of ["ADMIN_API_KEY", "NEXT_PUBLIC_API_URL", "RESEND_API", "FOO", "__proto__"]) {
    assert.equal(m.classifyBinding(n), null, `${n} 不應被允許`);
    const v = m.validateBindingValue(n, "x-real-value-1234");
    assert.equal(v.ok, false, `${n} 應被拒`);
    assert.equal(v.code, "NOT_ALLOWED");
  }
});

await t("拒絕 null / undefined / 非字串值", async () => {
  const m = await import(SAFE);
  for (const bad of [null, undefined, 123, true, {}, [], Symbol("x")]) {
    const v = m.validateBindingValue("RESEND_API_KEY", bad);
    assert.equal(v.ok, false, `值 ${String(bad)} 應被拒`);
  }
  assert.equal(m.validateBindingValue("RESEND_API_KEY", null).code, "MASKED_OR_OBJECT");
});

await t("拒絕空字串、純空白、前後有空白", async () => {
  const m = await import(SAFE);
  assert.equal(m.validateBindingValue("RESEND_API_KEY", "").code, "EMPTY_VALUE");
  assert.equal(m.validateBindingValue("RESEND_API_KEY", "   ").code, "EMPTY_VALUE");
  assert.equal(m.validateBindingValue("RESEND_API_KEY", "\t\n").code, "EMPTY_VALUE");
  assert.equal(m.validateBindingValue("RESEND_API_KEY", " re_abc123").code, "WHITESPACE_VALUE");
  assert.equal(m.validateBindingValue("RESEND_API_KEY", "re_abc123 ").code, "WHITESPACE_VALUE");
});

await t("拒絕控制字元", async () => {
  const m = await import(SAFE);
  for (const bad of ["re_ab\u0000c", "re_ab\nc", "re_ab\tc", "re_ab\u007fc"]) {
    assert.equal(m.validateBindingValue("RESEND_API_KEY", bad).code, "CONTROL_CHARS", JSON.stringify(bad));
  }
});

await t("拒絕遮罩值（******** / *** / REDACTED / [REDACTED] / ••••）", async () => {
  const m = await import(SAFE);
  for (const bad of ["********", "***", "REDACTED", "[REDACTED]", "••••", "<masked>", "(secret)"]) {
    assert.equal(m.isMaskedValue(bad), true, `${bad} 應被視為遮罩`);
    assert.equal(m.validateBindingValue("RESEND_API_KEY", bad).code, "MASKED_VALUE", bad);
  }
  assert.equal(m.isMaskedValue(FAKE_RESEND), false);
  assert.equal(m.isMaskedValue("re_a*b*c"), false, "中間有星號但非全遮罩不應誤判");
});

await t("拒絕遮罩 Secret 物件與整個回傳 config（物件／陣列值）", async () => {
  const m = await import(SAFE);
  // Cloudflare GET 回傳的遮罩 secret 物件
  assert.equal(m.validateBindingValue("RESEND_API_KEY", { type: "secret_text", value: "" }).code, "MASKED_OR_OBJECT");
  assert.equal(m.validateBindingValue("RESEND_API_KEY", { value: "***" }).code, "MASKED_OR_OBJECT");
  const wholeConfig = {
    success: true,
    result: { deployment_configs: { production: { env_vars: { RESEND_API_KEY: { type: "secret_text", value: "" } } } } },
  };
  const plan = m.buildPlan({ target: "production", secretMap: wholeConfig });
  assert.equal(plan.ok, false);
  assert.ok(plan.errors.some((e) => e.code === "CONFIG_OBJECT" || e.code === "NOT_ALLOWED" || e.code === "MASKED_OR_OBJECT"));
});

await t("合法值通過，回傳值（去除前後空白後）", async () => {
  const m = await import(SAFE);
  const v = m.validateBindingValue("RESEND_API_KEY", FAKE_RESEND);
  assert.equal(v.ok, true);
  const plain = m.validateBindingValue("MAIL_TO", "info@adwire.com.hk");
  assert.equal(plain.ok, true);
});

console.log("\n[2] mail-safe-config — 極小補丁組裝（只送指定 env_vars）");

await t("補丁只含指定名稱、只含指定 target、正確 type", async () => {
  const m = await import(SAFE);
  const plan = m.buildPlan({
    target: "production",
    secretMap: { RESEND_API_KEY: FAKE_RESEND, MAIL_OPS_TOKEN: FAKE_TOKEN, MAIL_TO: "info@adwire.com.hk" },
  });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  const env = plan.patch.deployment_configs.production.env_vars;
  assert.deepEqual(Object.keys(env).sort(), ["MAIL_OPS_TOKEN", "MAIL_TO", "RESEND_API_KEY"].sort());
  assert.equal(env.RESEND_API_KEY.type, "secret_text");
  assert.equal(env.RESEND_API_KEY.value, FAKE_RESEND);
  assert.equal(env.MAIL_TO.type, "plain_text");
  assert.equal(env.MAIL_OPS_TOKEN.value, FAKE_TOKEN);
});

await t("production target 補丁不含 preview；反之亦然", async () => {
  const m = await import(SAFE);
  const p = m.buildPlan({ target: "production", secretMap: { INBOX_PASSWORD: "Abc12345xyz" } });
  assert.deepEqual(Object.keys(p.patch.deployment_configs), ["production"]);
  const q = m.buildPlan({ target: "preview", secretMap: { INBOX_PASSWORD: "Abc12345xyz" } });
  assert.deepEqual(Object.keys(q.patch.deployment_configs), ["preview"]);
});

await t("補丁絕不含未請求／未白名單的秘密（ADMIN_API_KEY 等）", async () => {
  const m = await import(SAFE);
  const plan = m.buildPlan({ target: "production", secretMap: { MAIL_OPS_TOKEN: FAKE_TOKEN } });
  const s = JSON.stringify(plan.patch);
  assert.ok(!s.includes("ADMIN_API_KEY"));
  assert.ok(!s.includes("TURNSTILE"));
  assert.ok(!s.includes("RESEND"));
  assert.deepEqual(Object.keys(plan.patch.deployment_configs.production.env_vars), ["MAIL_OPS_TOKEN"]);
});

await t("非法值 → plan.ok=false，errors 只帶名稱/碼，絕不含值", async () => {
  const m = await import(SAFE);
  const plan = m.buildPlan({ target: "production", secretMap: { RESEND_API_KEY: "", MAIL_OPS_TOKEN: FAKE_TOKEN } });
  assert.equal(plan.ok, false);
  const blob = JSON.stringify(plan.errors);
  assert.ok(!blob.includes(FAKE_TOKEN), "errors 不得含秘密值");
  assert.ok(plan.errors.some((e) => e.name === "RESEND_API_KEY" && e.code === "EMPTY_VALUE"));
});

await t("buildPatchBody 只容許 production/preview；其他 target 被拒", async () => {
  const m = await import(SAFE);
  assert.equal(m.buildPlan({ target: "staging", secretMap: { MAIL_OPS_TOKEN: FAKE_TOKEN } }).ok, false);
  assert.equal(m.buildPlan({ target: "", secretMap: { MAIL_OPS_TOKEN: FAKE_TOKEN } }).ok, false);
});

await t("safeSummary 只有名稱／target／數量，零值", async () => {
  const m = await import(SAFE);
  const plan = m.buildPlan({ target: "production", secretMap: { RESEND_API_KEY: FAKE_RESEND, MAIL_TO: "info@adwire.com.hk" } });
  const sum = m.safeSummary(plan, { mode: "dry-run" });
  const blob = JSON.stringify(sum);
  assert.ok(!blob.includes(FAKE_RESEND), "摘要不得含秘密值");
  assert.deepEqual(sum.bindings.sort(), ["MAIL_TO", "RESEND_API_KEY"].sort());
  assert.equal(sum.target, "production");
  assert.equal(sum.count, 2);
  assert.equal(sum.mode, "dry-run");
});

console.log("\n[3] mail-safe-config — apply 只 PATCH 一次，無 GET 來回");

await t("applyPatch 發且僅發一個 PATCH，URL/標頭正確，且無任何 GET", async () => {
  const m = await import(SAFE);
  const { fetchImpl, calls } = recorder(() => mockResponse(200, { success: true, result: { id: "adwire-site" } }));
  const patch = m.buildPatchBody("production", { MAIL_OPS_TOKEN: { type: "secret_text", value: FAKE_TOKEN } });
  const res = await m.applyPatch({ accountId: "acct123", projectName: "adwire-site", apiToken: FAKE_TOKEN, patch, fetchImpl });
  assert.equal(res.ok, true, JSON.stringify(res));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, "PATCH");
  assert.ok(calls[0].url.includes("/accounts/acct123/pages/projects/adwire-site"), calls[0].url);
  assert.ok(String(calls[0].headers.Authorization || "").startsWith("Bearer "));
  assert.equal(calls.filter((c) => c.method === "GET").length, 0, "不得有 GET 來回");
  // 回傳物件本身不得含 token
  assert.ok(!JSON.stringify(res).includes(FAKE_TOKEN));
});

await t("applyPatch 非 2xx → ok=false，只回狀態碼，訊息不含 body/token", async () => {
  const m = await import(SAFE);
  const leaky = { success: false, errors: [{ message: `bad token ${FAKE_TOKEN}` }] };
  const { fetchImpl } = recorder(() => mockResponse(403, leaky));
  const patch = m.buildPatchBody("production", { MAIL_OPS_TOKEN: { type: "secret_text", value: FAKE_TOKEN } });
  const res = await m.applyPatch({ accountId: "a", projectName: "p", apiToken: FAKE_TOKEN, patch, fetchImpl });
  assert.equal(res.ok, false);
  assert.equal(res.status, 403);
  assert.ok(!JSON.stringify(res).includes(FAKE_TOKEN));
});

console.log("\n[4] mail-safe-config — CLI（dry-run 預設 / --apply 明確 / 零秘密輸出）");

await t("CLI 預設 dry-run：只印名稱，零 fetch，exit 0", async () => {
  const m = await import(SAFE);
  const file = tmpFile("secrets.json", JSON.stringify({ RESEND_API_KEY: FAKE_RESEND, MAIL_OPS_TOKEN: FAKE_TOKEN }));
  const { fetchImpl, calls } = recorder();
  const cap = captureLogs();
  const code = await m.main(["--secret-file", file, "--target", "production"], { fetchImpl, log: cap.log, error: cap.error, env: {} });
  assert.equal(code, 0);
  assert.equal(calls.length, 0, "dry-run 不得呼叫網絡");
  assert.ok(cap.joined().includes("RESEND_API_KEY"));
  assert.ok(!cap.joined().includes(FAKE_RESEND), "dry-run 不得印秘密值");
  assert.ok(!cap.errJoined().includes(FAKE_TOKEN));
});

await t("CLI --apply 缺 CF env → 非零退出、零 fetch", async () => {
  const m = await import(SAFE);
  const file = tmpFile("secrets2.json", JSON.stringify({ MAIL_OPS_TOKEN: FAKE_TOKEN }));
  const { fetchImpl, calls } = recorder();
  const cap = captureLogs();
  const code = await m.main(["--secret-file", file, "--target", "production", "--apply"], { fetchImpl, log: cap.log, error: cap.error, env: {} });
  assert.notEqual(code, 0);
  assert.equal(calls.length, 0);
});

await t("CLI 缺 --target 或非法 target → 非零退出", async () => {
  const m = await import(SAFE);
  const file = tmpFile("secrets3.json", JSON.stringify({ MAIL_OPS_TOKEN: FAKE_TOKEN }));
  const { fetchImpl } = recorder();
  const cap = captureLogs();
  assert.notEqual(await m.main(["--secret-file", file], { fetchImpl, log: cap.log, error: cap.error, env: {} }), 0);
  assert.notEqual(await m.main(["--secret-file", file, "--target", "staging"], { fetchImpl, log: cap.log, error: cap.error, env: {} }), 0);
});

await t("CLI 缺 --secret-file / 檔案不存在 / JSON 壞 → 非零退出", async () => {
  const m = await import(SAFE);
  const { fetchImpl } = recorder();
  const cap = captureLogs();
  assert.notEqual(await m.main(["--target", "production"], { fetchImpl, log: cap.log, error: cap.error, env: {} }), 0);
  assert.notEqual(await m.main(["--secret-file", path.join(tmp, "nope.json"), "--target", "production"], { fetchImpl, log: cap.log, error: cap.error, env: {} }), 0);
  const bad = tmpFile("bad.json", "{ not json ");
  assert.notEqual(await m.main(["--secret-file", bad, "--target", "production"], { fetchImpl, log: cap.log, error: cap.error, env: {} }), 0);
});

await t("CLI 檔案含遮罩／空值 → 非零退出、零 fetch", async () => {
  const m = await import(SAFE);
  const file = tmpFile("masked.json", JSON.stringify({ RESEND_API_KEY: "********", MAIL_OPS_TOKEN: FAKE_TOKEN }));
  const { fetchImpl, calls } = recorder();
  const cap = captureLogs();
  const code = await m.main(["--secret-file", file, "--target", "production", "--apply"], {
    fetchImpl, log: cap.log, error: cap.error, env: { CLOUDFLARE_API_TOKEN: "x", CLOUDFLARE_ACCOUNT_ID: "y", CLOUDFLARE_PROJECT_NAME: "adwire-site" },
  });
  assert.notEqual(code, 0);
  assert.equal(calls.length, 0, "非法值不得觸發任何網絡請求");
});

await t("CLI --apply 成功：一次 PATCH、exit 0、輸出/錯誤零秘密值", async () => {
  const m = await import(SAFE);
  const file = tmpFile("apply.json", JSON.stringify({ MAIL_OPS_TOKEN: FAKE_TOKEN, RESEND_API_KEY: FAKE_RESEND }));
  const { fetchImpl, calls } = recorder(({ url, method }) => {
    if (method === "PATCH" && url.includes("/pages/projects/adwire-site")) return mockResponse(200, { success: true });
    return mockResponse(404, { success: false });
  });
  const cap = captureLogs();
  const code = await m.main(["--secret-file", file, "--target", "production", "--apply"], {
    fetchImpl, log: cap.log, error: cap.error,
    env: { CLOUDFLARE_API_TOKEN: FAKE_TOKEN, CLOUDFLARE_ACCOUNT_ID: "acct", CLOUDFLARE_PROJECT_NAME: "adwire-site" },
  });
  assert.equal(code, 0, cap.errJoined());
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, "PATCH");
  assert.equal(calls.filter((c) => c.method === "GET").length, 0);
  assert.ok(!cap.joined().includes(FAKE_RESEND));
  assert.ok(!cap.joined().includes(FAKE_TOKEN));
  assert.ok(!cap.errJoined().includes(FAKE_TOKEN));
});

// ════════════════════════════ 5. readiness ════════════════════════════
console.log("\n[5] mail-readiness — 目標白名單（防 SSRF）");

await t("接受 https://adwire.com.hk 與 Pages 專案主機", async () => {
  const m = await import(READY);
  for (const good of ["https://adwire.com.hk", "https://adwire-site.pages.dev", "https://abc123.adwire-site.pages.dev"]) {
    const r = m.resolveTargetBase(good);
    assert.equal(r.ok, true, `${good} 應被接受：${r.code}`);
    assert.ok(r.base.startsWith("https://"));
  }
  assert.equal(m.resolveTargetBase("https://adwire.com.hk/").base, "https://adwire.com.hk");
});

await t("拒絕非白名單主機／非 https／帶憑證／localhost（SSRF）", async () => {
  const m = await import(READY);
  for (const bad of [
    "http://adwire.com.hk", "https://evil.com", "https://adwire.com.hk.evil.com",
    "https://127.0.0.1", "https://localhost", "https://user:pass@adwire.com.hk",
    "file:///etc/passwd", "ftp://adwire.com.hk", "https://adwire.com.hk:8080",
    "not-a-url", "", "https://pages.dev", "https://evil.pages.dev.attacker.com",
  ]) {
    const r = m.resolveTargetBase(bad);
    assert.equal(r.ok, false, `${bad} 應被拒`);
    assert.equal(r.code, "TARGET_NOT_ALLOWED", `${bad} code`);
  }
});

await t("health/probe URL 由安全 base 組成", async () => {
  const m = await import(READY);
  const base = m.resolveTargetBase("https://adwire.com.hk").base;
  assert.equal(m.buildHealthUrl(base), "https://adwire.com.hk/inbox?mailops=health");
  assert.equal(m.buildProbeUrl(base), "https://adwire.com.hk/inbox?mailops=probe");
});

console.log("\n[6] mail-readiness — 回應驗證（嚴格、只安全欄位）");

const GOOD_HEALTH = {
  ok: true,
  version: "mail-protection-v1",
  checks: { resendKey: true, turnstileSecret: true, inboxPassword: true, outboxStorage: true, opsToken: true },
  outbox: { pending: 0, manualReview: 0 },
};

await t("validateHealth：正確 body → ok，摘要含 version/checks/outbox", async () => {
  const m = await import(READY);
  const r = m.validateHealth(200, GOOD_HEALTH);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.summary.version, "mail-protection-v1");
  assert.equal(r.summary.checks.resendKey, true);
  assert.deepEqual(r.summary.outbox, { pending: 0, manualReview: 0 });
});

await t("validateHealth：非 200 / ok 非 true / version 不符 / 任一 check 非 true → 失敗", async () => {
  const m = await import(READY);
  assert.equal(m.validateHealth(500, GOOD_HEALTH).ok, false);
  assert.equal(m.validateHealth(401, GOOD_HEALTH).ok, false);
  assert.equal(m.validateHealth(200, { ...GOOD_HEALTH, ok: false }).ok, false);
  assert.equal(m.validateHealth(200, { ...GOOD_HEALTH, version: "v0" }).ok, false);
  for (const k of Object.keys(GOOD_HEALTH.checks)) {
    const bad = { ...GOOD_HEALTH, checks: { ...GOOD_HEALTH.checks, [k]: false } };
    assert.equal(m.validateHealth(200, bad).ok, false, `${k} false 應失敗`);
  }
  assert.equal(m.validateHealth(200, { ...GOOD_HEALTH, checks: {} }).ok, false);
  assert.equal(m.validateHealth(200, "not json object").ok, false);
});

await t("validateHealth：摘要不含 token／任何秘密", async () => {
  const m = await import(READY);
  const r = m.validateHealth(200, GOOD_HEALTH);
  const blob = JSON.stringify(r);
  assert.ok(!/token/i.test(blob.replace(/opsToken/g, "")), "摘要不得含 token 值欄位");
});

await t("validateProbe：200/201 且 ok=true → ok；只回 providerStatus/providerEmailId", async () => {
  const m = await import(READY);
  const r = m.validateProbe(200, { ok: true, providerStatus: 200, providerEmailId: "em_123" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.summary.providerStatus, 200);
  assert.equal(r.summary.providerEmailId, "em_123");
  assert.equal(m.validateProbe(201, { ok: true, providerStatus: 200 }).ok, true);
});

await t("validateProbe：非 2xx 或 ok 非 true → 失敗；摘要絕不出現 inboxDelivered", async () => {
  const m = await import(READY);
  for (const [st, b] of [[500, { ok: true }], [200, { ok: false }], [400, { ok: false, errorCode: "invalid" }], [200, "junk"]]) {
    const r = m.validateProbe(st, b);
    assert.equal(r.ok, false, `status=${st}`);
    assert.ok(!JSON.stringify(r.summary || {}).includes("inboxDelivered"), "不得聲稱 inboxDelivered");
  }
  const ok = m.validateProbe(200, { ok: true, providerStatus: 200 });
  assert.ok(!JSON.stringify(ok.summary).includes("inboxDelivered"));
});

console.log("\n[7] mail-readiness — token 讀取與 runReadiness 執行（mock fetch）");

await t("readOpsToken：env 優先、--ops-token-file 次之、都缺 → 報錯", async () => {
  const m = await import(READY);
  assert.equal(m.readOpsToken({ env: { MAIL_OPS_TOKEN: FAKE_TOKEN } }).token, FAKE_TOKEN);
  const f = tmpFile("ops.token", FAKE_TOKEN + "\n");
  assert.equal(m.readOpsToken({ env: {}, opsTokenFile: f }).token, FAKE_TOKEN);
  assert.equal(m.readOpsToken({ env: {}, opsTokenFile: path.join(tmp, "none.token") }).ok, false);
  assert.equal(m.readOpsToken({ env: {} }).ok, false);
});

await t("runReadiness health 正常 → ok，GET 帶 Bearer，url 正確", async () => {
  const m = await import(READY);
  const { fetchImpl, calls } = recorder(({ url }) => {
    if (url.includes("mailops=health")) return mockResponse(200, GOOD_HEALTH);
    return mockResponse(404, {});
  });
  const r = await m.runReadiness({ target: "https://adwire.com.hk", token: FAKE_TOKEN, probe: false, fetchImpl, timeoutMs: 2000 });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, "GET");
  assert.ok(String(calls[0].headers.Authorization).startsWith("Bearer "));
});

await t("runReadiness readiness 為 false → 非零語意（ok=false）", async () => {
  const m = await import(READY);
  const { fetchImpl } = recorder(() => mockResponse(200, { ...GOOD_HEALTH, checks: { ...GOOD_HEALTH.checks, outboxStorage: false } }));
  const r = await m.runReadiness({ target: "https://adwire.com.hk", token: FAKE_TOKEN, probe: false, fetchImpl, timeoutMs: 2000 });
  assert.equal(r.ok, false);
});

await t("runReadiness 網絡異常 → ok=false（不擲出）", async () => {
  const m = await import(READY);
  const fetchImpl = async () => { throw new Error("ECONNREFUSED"); };
  const r = await m.runReadiness({ target: "https://adwire.com.hk", token: FAKE_TOKEN, probe: false, fetchImpl, timeoutMs: 2000 });
  assert.equal(r.ok, false);
  assert.notEqual(r.code, undefined);
});

await t("runReadiness 逾時 → ok=false", async () => {
  const m = await import(READY);
  const fetchImpl = (url, opts = {}) =>
    new Promise((_, rej) => {
      const s = opts.signal;
      const onAbort = () => rej(Object.assign(new Error("aborted"), { name: "AbortError" }));
      if (s) { if (s.aborted) onAbort(); else s.addEventListener("abort", onAbort); }
    });
  const r = await m.runReadiness({ target: "https://adwire.com.hk", token: FAKE_TOKEN, probe: false, fetchImpl, timeoutMs: 40 });
  assert.equal(r.ok, false);
  assert.equal(r.code, "TIMEOUT");
});

await t("runReadiness --probe：先 GET health 再 POST probe；兩者皆過 → ok", async () => {
  const m = await import(READY);
  const { fetchImpl, calls } = recorder(({ url, method }) => {
    if (url.includes("mailops=health")) return mockResponse(200, GOOD_HEALTH);
    if (url.includes("mailops=probe") && method === "POST") return mockResponse(200, { ok: true, providerStatus: 200, providerEmailId: "em_1" });
    return mockResponse(404, {});
  });
  const r = await m.runReadiness({ target: "https://adwire.com.hk", token: FAKE_TOKEN, probe: true, fetchImpl, timeoutMs: 2000 });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(calls.length, 2);
  assert.equal(calls[0].method, "GET");
  assert.equal(calls[1].method, "POST");
  assert.ok(!JSON.stringify(r.summary).includes("inboxDelivered"));
});

await t("runReadiness probe 失敗 → ok=false，且預設（無 --probe）唔會真實寄信", async () => {
  const m = await import(READY);
  const { fetchImpl, calls } = recorder(({ url, method }) => {
    if (url.includes("mailops=health")) return mockResponse(200, GOOD_HEALTH);
    if (url.includes("mailops=probe")) return mockResponse(500, { ok: false, errorCode: "provider_error" });
    return mockResponse(404, {});
  });
  const r = await m.runReadiness({ target: "https://adwire.com.hk", token: FAKE_TOKEN, probe: true, fetchImpl, timeoutMs: 2000 });
  assert.equal(r.ok, false);
  assert.equal(calls.filter((c) => c.url.includes("mailops=probe")).length, 1);
});

console.log("\n[8] mail-readiness — CLI");

await t("CLI health 正常：exit 0，只安全 JSON，零 token/秘密", async () => {
  const m = await import(READY);
  const { fetchImpl, calls } = recorder(({ url }) => (url.includes("mailops=health") ? mockResponse(200, GOOD_HEALTH) : mockResponse(404, {})));
  const cap = captureLogs();
  const code = await m.main(["--target", "https://adwire.com.hk"], { fetchImpl, log: cap.log, error: cap.error, env: { MAIL_OPS_TOKEN: FAKE_TOKEN } });
  assert.equal(code, 0, cap.errJoined());
  assert.ok(!cap.joined().includes(FAKE_TOKEN));
  assert.ok(!cap.joined().includes("inboxDelivered"));
  assert.equal(calls.length, 1);
});

await t("CLI 缺 token → 非零退出、零 fetch", async () => {
  const m = await import(READY);
  const { fetchImpl, calls } = recorder();
  const cap = captureLogs();
  const code = await m.main(["--target", "https://adwire.com.hk"], { fetchImpl, log: cap.log, error: cap.error, env: {} });
  assert.notEqual(code, 0);
  assert.equal(calls.length, 0);
});

await t("CLI 目標非白名單 → 非零退出、零 fetch（防 SSRF）", async () => {
  const m = await import(READY);
  const { fetchImpl, calls } = recorder();
  const cap = captureLogs();
  const code = await m.main(["--target", "https://evil.com"], { fetchImpl, log: cap.log, error: cap.error, env: { MAIL_OPS_TOKEN: FAKE_TOKEN } });
  assert.notEqual(code, 0);
  assert.equal(calls.length, 0);
});

await t("CLI body 壞 JSON → 非零退出，唔印 body", async () => {
  const m = await import(READY);
  const { fetchImpl } = recorder(() => mockResponse(200, "SECRET-LEAK { not json"));
  const cap = captureLogs();
  const code = await m.main(["--target", "https://adwire.com.hk"], { fetchImpl, log: cap.log, error: cap.error, env: { MAIL_OPS_TOKEN: FAKE_TOKEN } });
  assert.notEqual(code, 0);
  assert.ok(!cap.joined().includes("SECRET-LEAK"));
  assert.ok(!cap.errJoined().includes("SECRET-LEAK"));
});

await t("CLI 網絡失敗 → 非零退出", async () => {
  const m = await import(READY);
  const fetchImpl = async () => { throw new Error("boom"); };
  const cap = captureLogs();
  const code = await m.main(["--target", "https://adwire.com.hk"], { fetchImpl, log: cap.log, error: cap.error, env: { MAIL_OPS_TOKEN: FAKE_TOKEN } });
  assert.notEqual(code, 0);
});

await t("CLI --probe 成功：exit 0，摘要無 inboxDelivered", async () => {
  const m = await import(READY);
  const { fetchImpl } = recorder(({ url, method }) => {
    if (url.includes("mailops=health")) return mockResponse(200, GOOD_HEALTH);
    if (url.includes("mailops=probe")) return mockResponse(200, { ok: true, providerStatus: 200, providerEmailId: "em_9" });
    return mockResponse(404, {});
  });
  const cap = captureLogs();
  const code = await m.main(["--target", "https://adwire.com.hk", "--probe"], { fetchImpl, log: cap.log, error: cap.error, env: { MAIL_OPS_TOKEN: FAKE_TOKEN } });
  assert.equal(code, 0, cap.errJoined());
  assert.ok(!cap.joined().includes("inboxDelivered"));
});

// ════════════════════════════ 9. 真實 CLI 子程序 ════════════════════════════
console.log("\n[9] 真實 CLI 子程序（spawn smoke；驗證 entry guard 與退出碼）");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function spawnCli(script, args, extraEnv = {}) {
  const r = spawnSync(process.execPath, [path.join(ROOT, script), ...args], {
    encoding: "utf8",
    env: { ...process.env, ...extraEnv },
  });
  return { status: r.status, stdout: r.stdout || "", stderr: r.stderr || "" };
}

await t("spawn safe-config dry-run：exit0、輸出含名稱、不含秘密值", async () => {
  const f = tmpFile("spawn.json", JSON.stringify({ RESEND_API_KEY: FAKE_RESEND, MAIL_OPS_TOKEN: FAKE_TOKEN }));
  const r = spawnCli("scripts/mail-safe-config.mjs", ["--secret-file", f, "--target", "production"]);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes("RESEND_API_KEY"));
  assert.ok(!r.stdout.includes(FAKE_RESEND));
  assert.ok(!(r.stdout + r.stderr).includes(FAKE_TOKEN));
});

await t("spawn safe-config --apply 無 CF env：非零退出", async () => {
  const f = tmpFile("spawn2.json", JSON.stringify({ MAIL_OPS_TOKEN: FAKE_TOKEN }));
  const r = spawnCli(
    "scripts/mail-safe-config.mjs",
    ["--secret-file", f, "--target", "production", "--apply"],
    { CLOUDFLARE_API_TOKEN: "", CLOUDFLARE_ACCOUNT_ID: "", CLOUDFLARE_PROJECT_NAME: "" },
  );
  assert.notEqual(r.status, 0);
});

await t("spawn readiness 無 token：exit 2", async () => {
  const r = spawnCli("scripts/mail-readiness.mjs", ["--target", "https://adwire.com.hk"], { MAIL_OPS_TOKEN: "" });
  assert.equal(r.status, 2, r.stderr);
});

await t("spawn readiness 非白名單 target：非零退出、零網絡", async () => {
  const r = spawnCli("scripts/mail-readiness.mjs", ["--target", "https://evil.com"], { MAIL_OPS_TOKEN: FAKE_TOKEN });
  assert.notEqual(r.status, 0);
  assert.ok(!r.stdout.includes("mailops=probe"));
});

await t("readiness rejects unrelated Pages projects before any request", async () => {
  const m = await import(READY);
  for (const target of ["https://attacker.pages.dev", "https://foo.attacker.pages.dev", "https://x.y.adwire-site.pages.dev", "https://adwire.com.hk/path", "https://adwire.com.hk/?token=x"]) {
    let calls = 0;
    const result = await m.runReadiness({ target, token: FAKE_TOKEN, fetchImpl: async () => { calls++; return mockResponse(200, GOOD_HEALTH); } });
    assert.equal(result.ok, false, target);
    assert.equal(calls, 0, target);
  }
});

await t("probe requires actual numeric provider acceptance, not only HTTP200 and ok", async () => {
  const m = await import(READY);
  for (const providerStatus of [undefined, null, "accepted", 400, 401, 500]) {
    assert.equal(m.validateProbe(200, { ok: true, providerStatus }).ok, false, String(providerStatus));
  }
  for (const providerStatus of [200, 201]) assert.equal(m.validateProbe(200, { ok: true, providerStatus }).ok, true);
});

await t("readiness explicitly rejects redirects on authenticated requests", async () => {
  const m = await import(READY);
  const result = await m.runReadiness({ target: "https://adwire.com.hk", token: FAKE_TOKEN, probe: true, fetchImpl: async (url, options) => {
    assert.equal(options.redirect, "error");
    return mockResponse(200, String(url).includes("mailops=health") ? GOOD_HEALTH : { ok: true, providerStatus: 200 });
  } });
  assert.equal(result.ok, true);
});

// ────────────────────────── 收尾 ──────────────────────────
try { rmSync(tmp, { recursive: true, force: true }); } catch {}

console.log(`\n——— mail-deployment: ${passed} passed, ${failed} failed ———`);
if (failed) {
  for (const f of failures) console.log(`  FAIL ${f}`);
  process.exit(1);
}
