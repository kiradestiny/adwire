/**
 * tests/mail-watchdog.test.ts — ADWire 郵件保護獨立監察 Worker
 *
 * 執行方式（Node 原生 type stripping，repo 未安裝測試框架）：
 *   node --experimental-strip-types tests/mail-watchdog.test.ts
 *
 * 目標：驗證 ops/mail-watchdog/src/index.ts 嘅 scheduled／HTTP 行為契約：
 *   - 健康 → 零告警；缺設定／不健康／認證失敗／網絡失敗／重試錯誤／待覆核 → 告警
 *   - 告警只經 AgentMail（獨立管道），**永不**經 Resend
 *   - 同一 fingerprint 首次即時、之後每鐘最多一次；復原只一次
 *   - 逾時視為網絡失敗；供應商失敗唔會退回其他管道
 *   - GET / 只回公開版本＋狀態；POST /run 需 Bearer；testAlert 用固定收件人
 *   - 秘密／PII 唔會出現在回應、KV 或告警內文
 *
 * 本測試零真實網絡、零真實寄信、零部署（全部 mock fetch ＋ in-memory KV ＋ 注入時鐘）。
 */

import assert from "node:assert/strict";

type WorkerModule = {
  default: {
    fetch: (request: Request, env: Record<string, unknown>) => Promise<Response>;
    scheduled: (event: unknown, env: Record<string, unknown>) => Promise<void>;
  };
  runWatch: (env: Record<string, unknown>, now?: number) => Promise<Record<string, unknown>>;
  sendAgentMail: (env: Record<string, unknown>, subject: string, text: string) => Promise<Record<string, unknown>>;
  isAllowedSiteUrl: (raw: string) => boolean;
  resolveSiteUrl: (env: Record<string, unknown>) => string;
  WATCHDOG_VERSION: string;
  PROTECTION_VERSION: string;
  REQUIRED_HEALTH_CHECKS: readonly string[];
};

let counter = 0;
const loadWorker = (): Promise<WorkerModule> =>
  import(`../ops/mail-watchdog/src/index.ts?case=mw${counter++}`) as Promise<WorkerModule>;

// ── 迷你測試框架（與 repo 其他測試一致嘅手寫 runner）─────────────────────────
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

// ── 測試替身 ──────────────────────────────────────────────────────────────────
interface MockKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number; metadata?: unknown }): Promise<void>;
  _map: Map<string, string>;
  _puts: Array<{ key: string; value: string; metadata?: unknown }>;
}

function mockKV(): MockKV {
  const map = new Map<string, string>();
  const puts: Array<{ key: string; value: string; metadata?: unknown }> = [];
  return {
    _map: map,
    _puts: puts,
    async get(key: string) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    async put(key: string, value: string, options?: { metadata?: unknown }) {
      puts.push({ key, value, metadata: options?.metadata });
      map.set(key, value);
    },
  };
}

interface FetchCall {
  url: string;
  method: string;
  body?: string;
  signal?: AbortSignal;
  redirect?: string;
}
type RouteResult = Response | Promise<Response> | undefined;
type Router = (url: string, call: FetchCall) => RouteResult;

function mockFetch(router: Router) {
  const calls: FetchCall[] = [];
  const fn = async (url: unknown, init: unknown): Promise<Response> => {
    const i = (init || {}) as { method?: string; body?: unknown; signal?: AbortSignal; redirect?: string };
    const call: FetchCall = {
      url: String(url),
      method: i.method || "GET",
      body: typeof i.body === "string" ? i.body : undefined,
      signal: i.signal,
      redirect: typeof i.redirect === "string" ? i.redirect : undefined,
    };
    calls.push(call);
    const r = router(call.url, call);
    if (r === undefined) throw new Error(`unexpected fetch: ${call.url}`);
    return await r;
  };
  return { fn, calls };
}

const jsonResp = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const HEALTHY_CHECKS = {
  resendKey: true,
  turnstileSecret: true,
  inboxPassword: true,
  outboxStorage: true,
  opsToken: true,
};

function healthBody(over: Record<string, unknown> = {}) {
  return {
    ok: true,
    version: "mail-protection-v1",
    checks: { ...HEALTHY_CHECKS },
    outbox: { pending: 0, manualReview: 0 },
    ...over,
  };
}

function retryBody(over: Record<string, unknown> = {}) {
  return { ok: true, processed: 3, accepted: 3, pending: 0, manualReview: 0, errors: [], ...over };
}

const AGENTMAIL = "api.agentmail.to";
const RESEND = "resend.com";
const SITE = "https://adwire.com.hk";
const API_KEY = "am_us_test_key_secret_123";
const OPS_TOKEN = "ops_token_secret_456";
const MSG_ID = "msg_2f7c9a1b";

function baseEnv(over: Record<string, unknown> = {}) {
  return {
    WATCH_STATE: mockKV(),
    AGENTMAIL_API_KEY: API_KEY,
    MAIL_OPS_TOKEN: OPS_TOKEN,
    SITE_URL: SITE,
    ...over,
  };
}

/** 標準 router：健康、重試、AgentMail 各自可設定。 */
function makeRouter(over: {
  health?: () => RouteResult;
  retry?: () => RouteResult;
  agentmail?: () => RouteResult;
} = {}) {
  return (url: string): RouteResult => {
    if (url.includes("mailops=health")) {
      return over.health ? over.health() : jsonResp(healthBody());
    }
    if (url.includes("mailops=retry")) {
      return over.retry ? over.retry() : jsonResp(retryBody());
    }
    if (url.includes(AGENTMAIL)) {
      return over.agentmail ? over.agentmail() : jsonResp({ message_id: MSG_ID, thread_id: "thr_1" }, 200);
    }
    if (url.includes(RESEND)) {
      // 呢個一定唔應該被呼叫 —— 監察 Worker 唔可以經 Resend 寄告警。
      return jsonResp({ error: "resend should never be called by watchdog" }, 500);
    }
    return undefined;
  };
}

function withFetch(router: Router): { calls: FetchCall[]; restore: () => void } {
  const original = globalThis.fetch;
  const m = mockFetch(router);
  (globalThis as unknown as { fetch: unknown }).fetch = m.fn;
  return { calls: m.calls, restore: () => ((globalThis as unknown as { fetch: unknown }).fetch = original) };
}

const alertCalls = (calls: FetchCall[]) => calls.filter((c) => c.url.includes(AGENTMAIL));
const resendCalls = (calls: FetchCall[]) => calls.filter((c) => c.url.includes(RESEND));

function alertBody(call: FetchCall): { to?: string[]; subject?: string; text?: string } {
  try {
    return JSON.parse(call.body || "{}");
  } catch {
    return {};
  }
}

// ── 測試 ─────────────────────────────────────────────────────────────────────

async function main() {
  const mod = await loadWorker();

  console.log("mail-watchdog — 核心契約");

  await t("健康系統：零告警、零重試副作用", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(makeRouter());
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.equal(out.ok, true);
      assert.deepEqual(out.incidents, []);
      assert.deepEqual(out.alertsSent, []);
      assert.equal(alertCalls(calls).length, 0, "健康時唔應該有任何 AgentMail 告警");
      assert.equal(resendCalls(calls).length, 0, "永不經 Resend");
      const retryHit = calls.find((c) => c.url.includes("mailops=retry"));
      assert.ok(retryHit, "健康時應呼叫有界重試端點");
      assert.equal(retryHit!.method, "POST");
    } finally {
      restore();
    }
  });

  await t("缺設定（健康檢查失敗）：經 AgentMail 告警，唔經 Resend", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(
      makeRouter({ health: () => jsonResp(healthBody({ ok: true, checks: { ...HEALTHY_CHECKS, resendKey: false } })) }),
    );
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.deepEqual(out.incidents, ["missing_config"]);
      assert.deepEqual(out.alertsSent, ["missing_config"]);
      const a = alertCalls(calls);
      assert.equal(a.length, 1, "應發一次 AgentMail 告警");
      const body = alertBody(a[0]);
      assert.deepEqual(body.to, ["info@adwire.com.hk"], "收件人必須固定為 info@adwire.com.hk");
      assert.match(body.subject || "", /獨立告警/);
      assert.equal(resendCalls(calls).length, 0, "唔可以經 Resend 寄");
    } finally {
      restore();
    }
  });

  await t("去重：同一 incident 一小時內只告警一次，超過一小時再告警", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(makeRouter({ health: () => jsonResp({ ok: false }, 500) }));
    try {
      const t0 = Date.UTC(2026, 9, 26, 1, 0, 0);
      const r1 = await mod.runWatch(env, t0);
      const r2 = await mod.runWatch(env, t0 + 60_000); // +1 分鐘：抑制
      const r3 = await mod.runWatch(env, t0 + 61 * 60_000); // +61 分鐘：重新告警
      assert.deepEqual(r1.alertsSent, ["unhealthy"]);
      assert.deepEqual(r2.alertsSent, []);
      assert.deepEqual(r2.alertsSuppressed, ["unhealthy"]);
      assert.deepEqual(r3.alertsSent, ["unhealthy"]);
      assert.equal(alertCalls(calls).length, 2, "總共只應寄 2 封（首次＋一小時後）");
    } finally {
      restore();
    }
  });

  await t("復原：incident 消失後只告警一次", async () => {
    const env = baseEnv();
    let healthy = false;
    const { calls, restore } = withFetch(
      makeRouter({ health: () => (healthy ? jsonResp(healthBody()) : jsonResp({ ok: false }, 500)) }),
    );
    try {
      const t0 = Date.UTC(2026, 9, 26, 1, 0, 0);
      const r1 = await mod.runWatch(env, t0);
      assert.deepEqual(r1.alertsSent, ["unhealthy"]);
      healthy = true;
      const r2 = await mod.runWatch(env, t0 + 5 * 60_000);
      assert.deepEqual(r2.recovered, ["unhealthy"]);
      const r3 = await mod.runWatch(env, t0 + 10 * 60_000);
      assert.deepEqual(r3.recovered, [], "復原只可以告警一次");
      assert.deepEqual(r3.alertsSent, []);
      assert.equal(alertCalls(calls).length, 2, "一封 incident ＋ 一封 recovery");
      const recoverySubjects = alertCalls(calls).map((c) => alertBody(c).subject || "");
      assert.ok(recoverySubjects.some((s) => /已恢復/.test(s)), "應有一封復原告警");
    } finally {
      restore();
    }
  });

  await t("認證失敗：health 回 401 → authfail 告警", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(makeRouter({ health: () => jsonResp({ error: "unauthorized" }, 401) }));
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.deepEqual(out.incidents, ["authfail"]);
      assert.deepEqual(out.alertsSent, ["authfail"]);
      assert.equal(alertCalls(calls).length, 1);
      assert.equal(resendCalls(calls).length, 0);
    } finally {
      restore();
    }
  });

  await t("網絡失敗：health fetch 逾時 → networkfail 告警", async () => {
    const env = baseEnv({ FETCH_TIMEOUT_MS: "20" });
    const { calls, restore } = withFetch((url, call) => {
      if (url.includes("mailops=health")) {
        // 永不回應；只喺 signal abort 時拒絕，模擬逾時。
        return new Promise<Response>((_resolve, reject) => {
          const sig = call.signal;
          if (sig) {
            sig.addEventListener("abort", () =>
              reject(Object.assign(new Error("aborted"), { name: "AbortError" })),
            );
          }
        });
      }
      return jsonResp({ ok: true });
    });
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.deepEqual(out.incidents, ["networkfail"]);
      assert.deepEqual(out.alertsSent, ["networkfail"]);
      assert.equal(alertCalls(calls).length, 1);
    } finally {
      restore();
    }
  });

  await t("重試錯誤＋待覆核：產生 retry_errors 與 manual_review 告警", async () => {
    const env = baseEnv();
    const rid = "11111111-1111-1111-1111-111111111111";
    const { calls, restore } = withFetch(
      makeRouter({
        retry: () =>
          jsonResp(
            retryBody({
              processed: 4,
              accepted: 2,
              pending: 1,
              manualReview: 1,
              errors: [{ requestId: rid, code: "provider_error", providerStatus: 502 }],
            }),
          ),
      }),
    );
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.deepEqual(out.incidents, ["retry_errors", "manual_review"]);
      assert.deepEqual(out.alertsSent, ["retry_errors", "manual_review"]);
      const texts = alertCalls(calls).map((c) => alertBody(c).text || "").join("\n");
      assert.match(texts, new RegExp(rid), "告警應帶安全 requestId");
      assert.match(texts, /provider_error/);
      assert.match(texts, /manualReview=1/);
    } finally {
      restore();
    }
  });

  await t("AgentMail 失敗：唔會 throw、唔會退回 Resend", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(
      makeRouter({
        health: () => jsonResp({ ok: false }, 500),
        agentmail: () => jsonResp({ error: "boom" }, 500),
      }),
    );
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.deepEqual(out.alertsFailed, ["unhealthy"]);
      assert.deepEqual(out.alertsSent, []);
      assert.equal(resendCalls(calls).length, 0, "供應商失敗唔可以觸發其他管道");
    } finally {
      restore();
    }
  });

  await t("scheduled handler：健康時零告警且唔 throw", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(makeRouter());
    try {
      await mod.default.scheduled({ cron: "*/5 * * * *" }, env);
      assert.equal(alertCalls(calls).length, 0);
    } finally {
      restore();
    }
  });

  console.log("\nmail-watchdog — HTTP 外觀");

  await t("GET /：只回公開版本＋狀態，零副作用", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(makeRouter());
    try {
      const res = await mod.default.fetch(new Request(`${SITE}/`), env);
      assert.equal(res.status, 200);
      const body = (await res.json()) as Record<string, unknown>;
      assert.equal(body.ok, true);
      assert.equal(body.version, mod.WATCHDOG_VERSION);
      assert.equal(body.protectionVersion, mod.PROTECTION_VERSION);
      assert.equal(body.status, "ready");
      assert.ok(!("checks" in body) && !("health" in body), "公開端點唔可以洩漏健康細節");
      assert.equal(calls.length, 0, "GET / 唔應該產生任何副作用／外呼");
    } finally {
      restore();
    }
  });

  await t("GET /run：405 且零副作用（唔安全嘅 GET 唔可以有副作用）", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(makeRouter());
    try {
      const res = await mod.default.fetch(new Request(`${SITE}/run`), env);
      assert.equal(res.status, 405);
      assert.equal(calls.length, 0, "GET /run 唔可以執行任何探測／寄信");
    } finally {
      restore();
    }
  });

  await t("POST /run：未帶／錯誤／未設定權杖一律 fail-closed 401", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(makeRouter());
    try {
      const noHeader = await mod.default.fetch(new Request(`${SITE}/run`, { method: "POST" }), env);
      const wrong = await mod.default.fetch(
        new Request(`${SITE}/run`, { method: "POST", headers: { Authorization: "Bearer nope" } }),
        env,
      );
      const unset = await mod.default.fetch(
        new Request(`${SITE}/run`, { method: "POST", headers: { Authorization: `Bearer ${OPS_TOKEN}` } }),
        baseEnv({ MAIL_OPS_TOKEN: undefined }),
      );
      assert.equal(noHeader.status, 401);
      assert.equal(wrong.status, 401);
      assert.equal(unset.status, 401, "未設定權杖必須 fail-closed");
      assert.equal(calls.length, 0);
    } finally {
      restore();
    }
  });

  await t("POST /run（已認證）：執行一次監察並回傳摘要", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(makeRouter());
    try {
      const res = await mod.default.fetch(
        new Request(`${SITE}/run`, { method: "POST", headers: { Authorization: `Bearer ${OPS_TOKEN}` } }),
        env,
      );
      assert.equal(res.status, 200);
      const body = (await res.json()) as Record<string, unknown>;
      assert.equal(body.ok, true);
      assert.deepEqual(body.incidents, []);
      assert.ok(calls.some((c) => c.url.includes("mailops=retry")), "已認證 run 應呼叫重試端點");
    } finally {
      restore();
    }
  });

  await t("POST /run?testAlert=1：固定收件人、明確測試字句、唔捏造 incident／唔寫 KV", async () => {
    const env = baseEnv();
    const kv = env.WATCH_STATE as MockKV;
    const { calls, restore } = withFetch(makeRouter());
    try {
      const res = await mod.default.fetch(
        new Request(`${SITE}/run?testAlert=1`, { method: "POST", headers: { Authorization: `Bearer ${OPS_TOKEN}` } }),
        env,
      );
      assert.equal(res.status, 200);
      const body = (await res.json()) as Record<string, unknown>;
      assert.deepEqual(body, { ok: true, alertSent: true, messageId: MSG_ID });
      const a = alertCalls(calls);
      assert.equal(a.length, 1);
      assert.equal(a[0].url, `https://api.agentmail.to/v0/inboxes/adwire-hermes3099%40agentmail.to/messages/send`);
      const sent = alertBody(a[0]);
      assert.deepEqual(sent.to, ["info@adwire.com.hk"]);
      assert.match(sent.subject || "", /【系統測試】獨立告警驗收/);
      assert.equal(resendCalls(calls).length, 0);
      assert.equal(kv._puts.length, 0, "測試告警唔應該改動監察狀態");
    } finally {
      restore();
    }
  });

  await t("POST /run?testAlert=1：供應商拒絕 → 502，唔可以報假成功", async () => {
    const env = baseEnv();
    const { restore } = withFetch(makeRouter({ agentmail: () => jsonResp({ code: "message_rejected" }, 403) }));
    try {
      const res = await mod.default.fetch(
        new Request(`${SITE}/run?testAlert=1`, { method: "POST", headers: { Authorization: `Bearer ${OPS_TOKEN}` } }),
        env,
      );
      assert.equal(res.status, 502);
      const body = (await res.json()) as Record<string, unknown>;
      assert.equal(body.ok, false);
      assert.equal(body.alertSent, false);
    } finally {
      restore();
    }
  });

  await t("未知路徑 → 404", async () => {
    const env = baseEnv();
    const { restore } = withFetch(makeRouter());
    try {
      const res = await mod.default.fetch(new Request(`${SITE}/nope`), env);
      assert.equal(res.status, 404);
    } finally {
      restore();
    }
  });

  console.log("\nmail-watchdog — 安全性");

  await t("回應內唔含秘密：GET /／POST /run／POST testAlert", async () => {
    const env = baseEnv();
    const { restore } = withFetch(
      makeRouter({ health: () => jsonResp(healthBody({ checks: { ...HEALTHY_CHECKS, resendKey: false } })) }),
    );
    try {
      const getRes = await mod.default.fetch(new Request(`${SITE}/`), env);
      const runRes = await mod.default.fetch(
        new Request(`${SITE}/run`, { method: "POST", headers: { Authorization: `Bearer ${OPS_TOKEN}` } }),
        env,
      );
      const testRes = await mod.default.fetch(
        new Request(`${SITE}/run?testAlert=1`, { method: "POST", headers: { Authorization: `Bearer ${OPS_TOKEN}` } }),
        env,
      );
      for (const res of [getRes, runRes, testRes]) {
        const text = await res.text();
        assert.ok(!text.includes(API_KEY), "回應唔可以含 AgentMail key");
        assert.ok(!text.includes(OPS_TOKEN), "回應唔可以含 ops token");
      }
    } finally {
      restore();
    }
  });

  await t("KV 只寫運維 metadata，唔含秘密／PII，且永不刪除", async () => {
    const env = baseEnv();
    const kv = env.WATCH_STATE as MockKV;
    const { restore } = withFetch(makeRouter({ health: () => jsonResp({ ok: false }, 500) }));
    try {
      await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.ok(kv._puts.length >= 1, "應記錄一次狀態");
      for (const p of kv._puts) {
        assert.ok(p.key.startsWith("alert:"), "只可以寫 alert: 前綴嘅運維鍵");
        assert.ok(!p.value.includes(API_KEY) && !p.value.includes(OPS_TOKEN), "KV 唔可以含秘密");
        const parsed = JSON.parse(p.value) as Record<string, unknown>;
        assert.deepEqual(Object.keys(parsed).sort(), ["active", "count", "lastAt"]);
        assert.equal(typeof parsed.active, "boolean");
      }
    } finally {
      restore();
    }
  });

  await t("告警內文唔含秘密／PII，且收件人固定", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(
      makeRouter({ health: () => jsonResp(healthBody({ checks: { ...HEALTHY_CHECKS, turnstileSecret: false } })) }),
    );
    try {
      await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      for (const c of alertCalls(calls)) {
        const body = alertBody(c);
        assert.deepEqual(body.to, ["info@adwire.com.hk"]);
        const blob = `${body.subject}\n${body.text}`;
        assert.ok(!blob.includes(API_KEY), "告警唔可以含 AgentMail key");
        assert.ok(!blob.includes(OPS_TOKEN), "告警唔可以含 ops token");
      }
    } finally {
      restore();
    }
  });

  await t("sendAgentMail：AgentMail 端點與認證標頭正確（依官方 REST 契約）", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(makeRouter());
    try {
      const r = await mod.sendAgentMail(env, "測試主旨", "測試內文");
      assert.equal(r.ok, true);
      const c = calls[0];
      assert.equal(c.url, "https://api.agentmail.to/v0/inboxes/adwire-hermes3099%40agentmail.to/messages/send");
      assert.equal(c.method, "POST");
      const body = alertBody(c);
      assert.deepEqual(body.to, ["info@adwire.com.hk"]);
      assert.equal(body.subject, "測試主旨");
      assert.equal(body.text, "測試內文");
    } finally {
      restore();
    }
  });

  await t("無 AGENTMAIL_API_KEY：sendAgentMail 安全失敗（唔經其他供應商）", async () => {
    const env = baseEnv({ AGENTMAIL_API_KEY: undefined });
    const { calls, restore } = withFetch(makeRouter());
    try {
      const r = await mod.sendAgentMail(env, "s", "t");
      assert.equal(r.ok, false);
      assert.equal(r.error, "missing_agentmail_key");
      assert.equal(calls.length, 0, "冇 key 就唔應該有任何外呼");
    } finally {
      restore();
    }
  });

  // ── TDD 回歸：健康合約（版本 ＋ 五個必要檢查）──────────────────────────────
  console.log("\nmail-watchdog — 健康合約（版本 ＋ 五個必要檢查）");

  await t("必要檢查清單：五項且同後端合約一致", () => {
    assert.deepEqual(
      [...mod.REQUIRED_HEALTH_CHECKS].sort(),
      ["inboxPassword", "opsToken", "outboxStorage", "resendKey", "turnstileSecret"],
    );
  });

  await t("HTTP 503 帶 checks 缺 → missing_config（唔可以當 generic unhealthy）", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(
      makeRouter({
        health: () => jsonResp(healthBody({ ok: false, checks: { ...HEALTHY_CHECKS, resendKey: false } }), 503),
      }),
    );
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.equal(out.healthStatus, 503);
      assert.deepEqual(out.incidents, ["missing_config"], "503 缺設定必須歸類 missing_config");
      assert.deepEqual(out.alertsSent, ["missing_config"]);
      assert.equal(alertCalls(calls).length, 1);
    } finally {
      restore();
    }
  });

  await t("HTTP 503 但 checks 全真、版本正確、ok:false → unhealthy（唔可以當 healthy）", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(makeRouter({ health: () => jsonResp(healthBody({ ok: false }), 503) }));
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.deepEqual(out.incidents, ["unhealthy"]);
      assert.equal(calls.filter((c) => c.url.includes("mailops=retry")).length, 0, "非健康就唔應該呼叫重試");
    } finally {
      restore();
    }
  });

  await t("版本唔係 mail-protection-v1 → missing_config", async () => {
    const env = baseEnv();
    const { restore } = withFetch(makeRouter({ health: () => jsonResp(healthBody({ version: "mail-protection-v2" })) }));
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.deepEqual(out.incidents, ["missing_config"], "版本唔符必須歸類 missing_config");
    } finally {
      restore();
    }
  });

  await t("缺少版本欄位 → 唔可以當健康（version_not_confirmed）", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(
      makeRouter({ health: () => jsonResp({ ok: true, checks: { ...HEALTHY_CHECKS } }) }),
    );
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.deepEqual(out.incidents, ["unhealthy"]);
      assert.equal(calls.filter((c) => c.url.includes("mailops=retry")).length, 0);
    } finally {
      restore();
    }
  });

  await t("{ok:true} 但缺 checks → 唔可以當健康（唔會呼叫重試端點）", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(
      makeRouter({ health: () => jsonResp({ ok: true, version: "mail-protection-v1" }) }),
    );
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.deepEqual(out.incidents, ["unhealthy"], "{ok:true} 但缺 checks 唔可以當健康");
      assert.equal(calls.filter((c) => c.url.includes("mailops=retry")).length, 0);
    } finally {
      restore();
    }
  });

  await t("五個必要檢查缺一（opsToken=false）→ missing_config", async () => {
    const env = baseEnv();
    const { restore } = withFetch(
      makeRouter({ health: () => jsonResp(healthBody({ checks: { ...HEALTHY_CHECKS, opsToken: false } })) }),
    );
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.deepEqual(out.incidents, ["missing_config"]);
    } finally {
      restore();
    }
  });

  // ── TDD 回歸：SITE_URL 白名單（憑證目標限制）──────────────────────────────
  console.log("\nmail-watchdog — SITE_URL 白名單");

  await t("isAllowedSiteUrl：接受 canonical／pages 預設域名／單一部署別名", () => {
    for (const ok of [
      "https://adwire.com.hk",
      "https://adwire.com.hk/",
      "https://adwire.com.hk:443",
      "https://adwire-site.pages.dev",
      "https://abc123.adwire-site.pages.dev",
      "https://my-deploy-42.adwire-site.pages.dev",
    ]) {
      assert.equal(mod.isAllowedSiteUrl(ok), true, `應接受 ${ok}`);
    }
  });

  await t("isAllowedSiteUrl：拒絕其他主機／憑證／非443埠／path／query／hash／http", () => {
    for (const bad of [
      "http://adwire.com.hk",
      "https://evil.com",
      "https://adwire.com.hk.evil.com",
      "https://evil.com/?x=adwire.com.hk",
      "https://user:pass@adwire.com.hk",
      "https://adwire.com.hk:8443",
      "https://adwire-site.pages.dev:8080",
      "https://adwire.com.hk/inbox",
      "https://adwire.com.hk/?mailops=health",
      "https://adwire.com.hk/#frag",
      "https://a.b.adwire-site.pages.dev",
      "https://adwire-site.pages.dev.evil.com",
      "not-a-url",
      "",
    ]) {
      assert.equal(mod.isAllowedSiteUrl(bad), false, `應拒絕 ${bad}`);
    }
  });

  await t("無效 SITE_URL：fail-closed，唔會送 Bearer 去無效主機，回退 canonical", async () => {
    const env = baseEnv({ SITE_URL: "https://evil.example.com" });
    const { calls, restore } = withFetch(makeRouter());
    try {
      const out = await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.deepEqual(out.incidents, [], "回退 canonical 後系統健康，零告警");
      assert.equal(
        calls.filter((c) => c.url.includes("evil.example.com")).length,
        0,
        "憑證／請求絕對唔可以送去無效主機",
      );
      assert.ok(
        calls.some((c) => c.url.startsWith("https://adwire.com.hk/inbox?mailops=health")),
        "應回退到 canonical 正式站",
      );
    } finally {
      restore();
    }
  });

  await t("SITE_URL 為 pages 預設域名：請求送去該白名單主機", async () => {
    const env = baseEnv({ SITE_URL: "https://adwire-site.pages.dev" });
    const { calls, restore } = withFetch(makeRouter());
    try {
      await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      assert.ok(
        calls.some((c) => c.url.startsWith("https://adwire-site.pages.dev/inbox?mailops=health")),
        "應使用白名單主機",
      );
    } finally {
      restore();
    }
  });

  await t("所有外呼都設 redirect:\"error\"（避免憑證經重定向洩漏／假 200）", async () => {
    const env = baseEnv();
    const { calls, restore } = withFetch(makeRouter());
    try {
      await mod.runWatch(env, Date.UTC(2026, 9, 26, 1, 0, 0));
      await mod.sendAgentMail(env, "s", "t");
      assert.ok(calls.length >= 3, "應有 health／retry／agentmail 三個外呼");
      for (const c of calls) assert.equal(c.redirect, "error", `${c.url} 缺少 redirect:"error"`);
    } finally {
      restore();
    }
  });

  await t("AgentMail 收件人／inbox 固定：env 覆寫無效，唔會送去其他收件人", async () => {
    const env = baseEnv({ AGENTMAIL_INBOX_ID: "attacker@evil.com", ALERT_TO: "evil@evil.com" });
    const { calls, restore } = withFetch(makeRouter());
    try {
      const r = await mod.sendAgentMail(env, "s", "t");
      assert.equal(r.ok, true);
      assert.equal(
        calls[0].url,
        "https://api.agentmail.to/v0/inboxes/adwire-hermes3099%40agentmail.to/messages/send",
        "inbox 必須固定",
      );
      assert.deepEqual(alertBody(calls[0]).to, ["info@adwire.com.hk"], "收件人必須固定，唔受 env 影響");
    } finally {
      restore();
    }
  });

  // ── 總結 ───────────────────────────────────────────────────────────────────
  console.log(`\nmail-watchdog: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error("測試執行失敗：", e);
  process.exitCode = 1;
});
